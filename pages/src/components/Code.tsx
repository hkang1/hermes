import { PropsWithChildren } from 'react';
import './Code.css';

interface Props {
  block?: boolean;
}

function Code({ block, children }: PropsWithChildren<Props>) {
  const classes = ['base'];
  if (block) classes.push('block');
  return <span className={classes.join(' ')}>{children}</span>;
}

export default Code;
