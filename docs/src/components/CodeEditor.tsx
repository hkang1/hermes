import { langs } from '@uiw/codemirror-extensions-langs';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';
import { CSSProperties } from 'react';

import { ValueOf } from '@/types';

export const Language = {
  JavaScript: langs.javascript(),
  JSON: langs.json(),
  TypeScript: langs.javascript({ typescript: true }),
} as const;

type Language = ValueOf<typeof Language>;

interface Props {
  code: string;
  language?: Language;
}

const STYLE: CSSProperties = { fontSize: 12 };

export default function CodeEditor({
  code,
  language = Language.JSON,
}: Props) {
  return (
    <CodeMirror
      extensions={[ language ]}
      style={STYLE}
      theme={vscodeDark}
      value={code}
    />
  );
}
