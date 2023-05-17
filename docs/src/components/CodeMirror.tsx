import { useState } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { generateAlphaNumeric } from '@/utils/string';

export default function CodeMirror() {
  const [id] = useState(generateAlphaNumeric);
  return <div id={id} />;
}
