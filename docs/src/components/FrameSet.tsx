import {
  cloneElement,
  Fragment,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react';

import css from './FrameSet.module.css';

type Direction = 'horizontal' | 'vertical';

interface Props {
  direction?: Direction;
  height?: number;
  resizable?: boolean;
}

function isChildrenValid(children: ReactNode): children is ReactElement[] {
  if (!Array.isArray(children)) {
    return false;
  }
  return children.reduce((acc, child) => {
    return acc && isValidElement(child);
  }, true);
}

export default function FrameSet({
  children,
  direction = 'horizontal',
  height = 400,
  resizable = true,
}: PropsWithChildren<Props>) {
  if (!isChildrenValid(children)) throw new Error('Frame\'s children must be an array of ReactElement!');

  const classes = [ css.base, css[direction] ];

  return (
    <div className={classes.join(' ')} style={{ height, maxHeight: height }}>
      {children.map((child, index, list) => {
        if (child.type !== Frame) throw new Error('FrameSet children must be of type Frame!');

        const dividerWidth = resizable ? 5 : 1;
        const dividerStyle = { flexBasis: dividerWidth };

        return (
          <Fragment key={index}>
            {cloneElement(child, { count: list.length, dividerWidth })}
            {index < list.length - 1 && (<div className={css.divider} style={dividerStyle} />)}
          </Fragment>
        );
      })}
    </div>
  );
}

interface FrameProps {
  count: number;
  dividerWidth: number;
  title?: string;
}

export function Frame({ children, count, dividerWidth, title }: PropsWithChildren<FrameProps>) {
  const maxWidth = `calc((100% - ${count - 1} * ${dividerWidth}px) / ${count})`;
  return (
    <div className={css.frame} style={{ maxWidth }}>
      {title && (<div className={css.title}>{title}</div>)}
      {children}
    </div>
  );
}
