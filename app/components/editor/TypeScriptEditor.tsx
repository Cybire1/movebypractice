'use client';

import { Editor, OnMount } from '@monaco-editor/react';
import { useState } from 'react';

interface TypeScriptEditorProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  onRun?: (code: string) => void;
  height?: string;
}

export default function TypeScriptEditor({
  defaultValue = '',
  onChange,
  onRun,
  height = '500px',
}: TypeScriptEditorProps) {
  const [code, setCode] = useState(defaultValue);
  const [isRunning, setIsRunning] = useState(false);

  const handleEditorDidMount: OnMount = (_editor, monacoInstance) => {
    // TypeScript is natively supported by Monaco - configure compiler options
    monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
      module: monacoInstance.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monacoInstance.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
      strict: true,
      esModuleInterop: true,
      jsx: monacoInstance.languages.typescript.JsxEmit.React,
      noEmit: true,
    });

    // Add type stubs for @mysten/messaging SDK
    monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare module '@mysten/messaging' {
        export interface MessagingClientConfig {
          suiClient: any;
          sealClient?: any;
          walrusClient?: any;
          signer?: any;
          network?: 'testnet' | 'mainnet';
        }
        export class MessagingClient {
          constructor(config: MessagingClientConfig);
          createChannel(name: string, options?: ChannelOptions): Promise<Channel>;
          getChannel(id: string): Promise<Channel>;
          listChannels(): Promise<Channel[]>;
          sendMessage(channelId: string, content: string, options?: SendOptions): Promise<Message>;
          getMessages(channelId: string, options?: GetMessagesOptions): Promise<Message[]>;
          addMembers(channelId: string, members: string[]): Promise<void>;
          removeMembers(channelId: string, members: string[]): Promise<void>;
          archiveChannel(channelId: string): Promise<void>;
          rotateKeys(channelId: string): Promise<void>;
        }
        export interface ChannelOptions {
          description?: string;
          members?: string[];
          encrypted?: boolean;
        }
        export interface Channel {
          id: string;
          name: string;
          members: string[];
          createdAt: number;
          archived: boolean;
        }
        export interface SendOptions {
          attachments?: Attachment[];
          encrypted?: boolean;
        }
        export interface GetMessagesOptions {
          limit?: number;
          cursor?: string;
          order?: 'asc' | 'desc';
        }
        export interface Message {
          id: string;
          channelId: string;
          sender: string;
          content: string;
          timestamp: number;
          attachments?: Attachment[];
        }
        export interface Attachment {
          blobId: string;
          filename: string;
          mimeType: string;
          size: number;
        }
      }

      declare module '@mysten/sui/client' {
        export class SuiClient {
          constructor(config: { url: string });
        }
        export function getFullnodeUrl(network: 'testnet' | 'mainnet' | 'devnet'): string;
      }

      declare module '@mysten/seal' {
        export class SealClient {
          constructor(config: { suiClient: any; serverObjectIds?: string[] });
        }
      }

      declare module '@mysten/walrus' {
        export class WalrusClient {
          constructor(config: { network: 'testnet' | 'mainnet' });
          upload(data: Uint8Array | Blob, options?: { contentType?: string }): Promise<{ blobId: string }>;
          download(blobId: string): Promise<Uint8Array>;
        }
      }
      `,
      'ts:@mysten/messaging.d.ts'
    );
  };

  const handleChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onChange?.(newCode);
  };

  const handleRun = async () => {
    if (!onRun) return;

    setIsRunning(true);
    try {
      await onRun(code);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 rounded-lg overflow-hidden relative">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          defaultValue={defaultValue}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            renderLineHighlight: 'none',
          }}
        />
      </div>

      {onRun && (
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="mt-4 w-full px-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Validating...
            </span>
          ) : (
            'Validate & Run'
          )}
        </button>
      )}
    </div>
  );
}
