'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ReceivedChatMessage,
  useChat,
  useLocalParticipant,
  useRoomInfo,
} from '@livekit/components-react';
import { ClassMetadata } from '@/app/lib/livekit/controller';

interface DBMessage {
  id: string;
  userId: string;
  content: string;
  messageType: string;
  parentId: string | null;
  isInstructorReply: boolean;
  createdAt: string;
  user?: { username: string; displayName: string | null };
}

interface ChatMessageProps {
  message: ReceivedChatMessage;
  classId: string;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: ReceivedChatMessage) => void;
  dbMessageId?: string;
}

function ChatMessage({ message, classId, onEdit, onDelete, onReply, dbMessageId }: ChatMessageProps) {
  const { localParticipant } = useLocalParticipant();
  const isOwnMessage = localParticipant.identity === message.from?.identity;
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleEdit = async () => {
    if (!editText.trim() || !dbMessageId) return;
    try {
      const res = await fetch(`/api/classes/${classId}/messages/${dbMessageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText.trim() }),
      });
      if (res.ok) {
        onEdit?.(dbMessageId, editText.trim());
      }
    } catch {
      // Ignore
    }
    setEditing(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!dbMessageId) return;
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/classes/${classId}/messages/${dbMessageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDelete?.(dbMessageId);
      }
    } catch {
      // Ignore
    }
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    setShowMenu(false);
  };

  return (
    <div className={`group flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sui-accent text-sm font-bold border border-sui-accent/20">
          {message.from?.identity[0]?.toUpperCase() || '?'}
        </div>
      </div>
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-gray-400 mb-1">
          {message.from?.identity || 'Unknown'}
        </span>

        {editing ? (
          <div className="flex gap-1 w-full">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="flex-1 bg-zinc-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sui-accent"
              autoFocus
            />
            <button onClick={handleEdit} className="text-xs text-sui-accent hover:underline">Save</button>
            <button onClick={() => setEditing(false)} className="text-xs text-zinc-400 hover:underline">Cancel</button>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <div
              onClick={() => setShowMenu(!showMenu)}
              className={`px-3 py-2 rounded-lg cursor-pointer ${
                isOwnMessage
                  ? 'bg-sui-accent text-zinc-900 font-medium rounded-br-none'
                  : 'bg-zinc-800 text-white rounded-bl-none'
              }`}
            >
              <p className="text-sm break-words">{message.message}</p>
            </div>

            {showMenu && (
              <div className={`absolute z-10 top-full mt-1 ${isOwnMessage ? 'right-0' : 'left-0'} bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl py-1 min-w-[120px]`}>
                <button onClick={handleCopy} className="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700">
                  Copy
                </button>
                {onReply && (
                  <button onClick={() => { onReply(message); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700">
                    Reply
                  </button>
                )}
                {isOwnMessage && dbMessageId && (
                  <>
                    <button onClick={() => { setEditing(true); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700">
                      Edit
                    </button>
                    <button onClick={handleDelete} className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700">
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ClassChatProps {
  classId: string;
}

export function ClassChat({ classId }: ClassChatProps) {
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<ReceivedChatMessage | null>(null);
  const [dbMessages, setDbMessages] = useState<DBMessage[]>([]);
  const { chatMessages, send } = useChat();
  const { metadata } = useRoomInfo();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chat_enabled } = (metadata ? JSON.parse(metadata) : {}) as ClassMetadata;

  // Load message history from DB
  useEffect(() => {
    if (!classId) return;
    fetch(`/api/classes/${classId}/messages`)
      .then(r => r.ok ? r.json() : { messages: [] })
      .then(data => setDbMessages(data.messages || []))
      .catch(() => {});
  }, [classId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, dbMessages.length]);

  // Deduplicate messages by timestamp
  const messages = useMemo(() => {
    const timestamps = chatMessages.map((msg) => msg.timestamp);
    const filtered = chatMessages.filter(
      (msg, i) => !timestamps.includes(msg.timestamp, i + 1)
    );
    return filtered;
  }, [chatMessages]);

  const handleEdit = useCallback((messageId: string, content: string) => {
    setDbMessages(prev => prev.map(m => m.id === messageId ? { ...m, content } : m));
  }, []);

  const handleDelete = useCallback((messageId: string) => {
    setDbMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const onSend = async () => {
    if (draft.trim().length && send) {
      const text = replyTo
        ? `> ${replyTo.from?.identity}: ${replyTo.message.slice(0, 50)}\n${draft}`
        : draft;
      setDraft('');
      setReplyTo(null);
      await send(text);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && dbMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to say something!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.timestamp}
                message={msg}
                classId={classId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReply={setReplyTo}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="px-4 py-2 border-t border-zinc-700 bg-zinc-800/50 flex items-center justify-between">
          <span className="text-xs text-zinc-400 truncate">
            Replying to {replyTo.from?.identity}: {replyTo.message.slice(0, 60)}
          </span>
          <button onClick={() => setReplyTo(null)} className="text-zinc-400 hover:text-white ml-2 text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        {chat_enabled ? (
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-800 text-white rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sui-accent/50 placeholder:text-zinc-500"
              rows={1}
              disabled={!chat_enabled}
            />
            <button
              onClick={onSend}
              disabled={!draft.trim().length}
              className="px-4 py-2 bg-sui-accent hover:bg-sui-accent-dim disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 rounded-lg font-bold transition-colors"
            >
              Send
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm">Chat is disabled</p>
        )}
      </div>
    </div>
  );
}
