import css from './Code.module.css';

interface Props {
  block?: boolean;
  children?: TemplateStringsArray;
}

export function c(code: TemplateStringsArray) {
  return <Code>{code}</Code>;
}

export function cblock(code: TemplateStringsArray) {
  return <Code block>{code}</Code>;
}

function Code({ block, children }: Props) {
  const classes = [ css.base ];

  const content = (children?.raw ?? []).map((line) =>
    line.replace(/^(\s*\n+)/, '').replace(/(\n+\s*)$/, ''));

  if (block) classes.push(css.block);

  return <code className={classes.join(' ')}>{content}</code>;
}

export default Code;
