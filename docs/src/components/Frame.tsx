import { isValidElement, PropsWithChildren, ReactElement, ReactNode } from 'react';

import css from './Frame.module.css';

type Direction = 'horizontal' | 'vertical';

interface Props {
  direction?: Direction;
}

function isChildrenValid(children: ReactNode): children is ReactElement[] {
  if (!Array.isArray(children)) {
    return false;
  }
  return children.reduce((acc, child) => {
    return acc && isValidElement(child);
  }, true);
}

export default function Frame({ children, direction = 'horizontal' }: PropsWithChildren<Props>) {
  if (!isChildrenValid(children)) throw new Error('Frame\'s children must be an array of ReactElement');

  const classes = [ css.base, css[direction] ];

  return (
    <div className={classes.join(' ')}>
      {children.map((child, index, list) => (
        <>
          <div className={css.frame}>{child}</div>
          {index < list.length - 1 ? (<div className={css.divider} />) : null}
        </>
      ))}
    </div>
  );
}
