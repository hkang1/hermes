import { langs } from '@uiw/codemirror-extensions-langs';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';

import { ValueOf } from '@/types';

import css from './CodeEditor.module.css';

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

export default function CodeEditor({
  code,
  language = Language.JSON,
}: Props) {
  const classes = [ css.base ];
  return (
    <CodeMirror
      className={classes.join(' ')}
      extensions={[ language ]}
      theme={vscodeDark}
      value={code}
    />
  );
}
