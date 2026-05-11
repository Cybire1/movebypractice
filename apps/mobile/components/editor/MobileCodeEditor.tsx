import { useRef, useCallback } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface Props {
  value: string;
  onChange: (code: string) => void;
  language?: 'move' | 'typescript';
}

const EDITOR_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0A1628; overflow: hidden; }
    #editor { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"></script>
  <script>
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    require(['vs/editor/editor.main'], function() {
      // Define Move language
      monaco.languages.register({ id: 'move' });
      monaco.languages.setMonarchTokensProvider('move', {
        keywords: ['module', 'struct', 'public', 'fun', 'let', 'mut', 'return', 'if', 'else', 'while', 'loop', 'break', 'continue', 'use', 'has', 'copy', 'drop', 'store', 'key', 'entry', 'transfer', 'abort', 'assert', 'true', 'false', 'const', 'friend', 'native', 'spec', 'acquires', 'move_to', 'move_from', 'borrow_global', 'borrow_global_mut', 'exists'],
        typeKeywords: ['u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'bool', 'address', 'vector', 'signer', 'String'],
        operators: ['+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|'],
        tokenizer: {
          root: [
            [/\\/\\/.*$/, 'comment'],
            [/\\/\\*/, 'comment', '@comment'],
            [/[a-zA-Z_]\\w*/, { cases: { '@keywords': 'keyword', '@typeKeywords': 'type', '@default': 'identifier' } }],
            [/0x[0-9a-fA-F]+/, 'number.hex'],
            [/\\d+/, 'number'],
            [/"[^"]*"/, 'string'],
            [/b"[^"]*"/, 'string'],
          ],
          comment: [
            [/[^\\/*]+/, 'comment'],
            [/\\*\\//, 'comment', '@pop'],
            [/[\\/*]/, 'comment'],
          ],
        },
      });

      monaco.editor.defineTheme('glide-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '4DA2FF' },
          { token: 'type', foreground: '6FBCFF' },
          { token: 'comment', foreground: '546E7A' },
          { token: 'string', foreground: 'C3E88D' },
          { token: 'number', foreground: 'F78C6C' },
        ],
        colors: {
          'editor.background': '#0A1628',
          'editor.foreground': '#E8F4FF',
          'editor.lineHighlightBackground': '#1A2B4A',
          'editorLineNumber.foreground': '#546E7A',
        },
      });

      const editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'move',
        theme: 'glide-dark',
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 4,
        renderWhitespace: 'none',
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: { vertical: 'auto', horizontal: 'auto' },
      });

      // Bridge: RN -> WebView
      window.addEventListener('message', function(event) {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'setValue') {
            editor.setValue(msg.value);
          } else if (msg.type === 'setLanguage') {
            monaco.editor.setModelLanguage(editor.getModel(), msg.language);
          }
        } catch(e) {}
      });

      // Bridge: WebView -> RN
      editor.onDidChangeModelContent(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onChange',
          value: editor.getValue(),
        }));
      });

      // Signal ready
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
    });
  </script>
</body>
</html>
`;

export function MobileCodeEditor({ value, onChange, language = 'move' }: Props) {
  const webViewRef = useRef<WebView>(null);
  const hasSetInitial = useRef(false);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'onChange') {
          onChange(msg.value);
        } else if (msg.type === 'ready' && !hasSetInitial.current) {
          hasSetInitial.current = true;
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'setValue', value })
          );
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'setLanguage', language })
          );
        }
      } catch {}
    },
    [onChange, value, language]
  );

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ html: EDITOR_HTML }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        style={{ flex: 1, backgroundColor: '#0A1628' }}
        scrollEnabled={false}
      />
    </View>
  );
}
