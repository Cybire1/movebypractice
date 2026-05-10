'use client';

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';

export interface TerminalHandle {
  writeln: (text: string) => void;
  write: (text: string) => void;
  clear: () => void;
  focus: () => void;
}

interface TerminalProps {
  height?: string;
}

const Terminal = forwardRef<TerminalHandle, TerminalProps>(function Terminal(
  { height = '300px' },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<import('@xterm/xterm').Terminal | null>(null);
  const fitAddonRef = useRef<import('@xterm/addon-fit').FitAddon | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { Terminal: XTerm } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      // @ts-expect-error CSS import handled by Next.js bundler
      await import('@xterm/xterm/css/xterm.css');

      if (!mounted || !containerRef.current) return;

      const fitAddon = new FitAddon();
      const term = new XTerm({
        cursorBlink: false,
        disableStdin: true,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineHeight: 1.4,
        theme: {
          background: '#0a0e1a',
          foreground: '#e0e6f0',
          cursor: '#4da2ff',
          selectionBackground: '#4da2ff33',
          black: '#0a0e1a',
          red: '#ff6b6b',
          green: '#51cf66',
          yellow: '#ffd43b',
          blue: '#4da2ff',
          magenta: '#cc5de8',
          cyan: '#22b8cf',
          white: '#e0e6f0',
          brightBlack: '#495057',
          brightRed: '#ff8787',
          brightGreen: '#69db7c',
          brightYellow: '#ffe066',
          brightBlue: '#74c0fc',
          brightMagenta: '#da77f2',
          brightCyan: '#3bc9db',
          brightWhite: '#f8f9fa',
        },
        scrollback: 1000,
      });

      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();

      termRef.current = term;
      fitAddonRef.current = fitAddon;
      setReady(true);
    }

    init();

    const handleResize = () => {
      fitAddonRef.current?.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      termRef.current?.dispose();
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      writeln: (text: string) => {
        termRef.current?.writeln(text);
      },
      write: (text: string) => {
        termRef.current?.write(text);
      },
      clear: () => {
        termRef.current?.clear();
      },
      focus: () => {
        termRef.current?.focus();
      },
    }),
    [ready]
  );

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-700/50">
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-zinc-400 ml-2 font-mono">Output</span>
      </div>
      <div ref={containerRef} style={{ height, background: '#0a0e1a' }} />
    </div>
  );
});

export default Terminal;
