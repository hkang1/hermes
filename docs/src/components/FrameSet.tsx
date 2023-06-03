import {
  cloneElement,
  Fragment,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Point } from '@/types';
import { getMousePointPercent } from '@/utils/dom';

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
  height,
  resizable = true,
}: PropsWithChildren<Props>) {
  if (!isChildrenValid(children)) throw new Error('Frame\'s children must be an array of ReactElement!');

  const refFrameSet = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';
  const frames = children.length;
  const [ dividers, setDividers ] = useState(new Array(frames - 1).fill(null).map((_, i) => (i + 1) / frames));
  const classes = [ css.base, css[direction] ];

  /**
   * Translates percentile dividers into percentile spacers.
   * dividers = [ 0.33, 0.66 ]
   * spacers = [ 0.33, 0.33, 0.33 ]
   */
  const spacers = useMemo(() => {
    if (dividers.length === 0) return [ 1 ];

    const spacers = [];
    for (let i = 0; i < dividers.length; i++) {
      spacers.push(dividers[i] - (i === 0 ? 0 : dividers[i - 1]));
    }
    spacers.push(1.0 - dividers[dividers.length - 1]);

    return spacers;
  }, [ dividers ]);

  const style = useMemo(() => {
    const frameHeight = height ?? (isHorizontal ? 300 : 900);
    return { height: frameHeight, maxHeight: frameHeight };
  }, [ height, isHorizontal ]);

  const generateDividerDragHandler = (index: number) => (point: Point) => {
    setDividers((dividers) => dividers.map((divider, i) => {
      return i === index ? (isHorizontal ? point.x : point.y) : divider;
    }));
  };

  return (
    <div className={classes.join(' ')} ref={refFrameSet} style={style}>
      {children.map((child, index, list) => {
        if (child.type !== Frame) throw new Error('FrameSet children must be of type Frame!');

        const count = list.length;
        const dividerSize = resizable ? 5 : 1;
        const dividerStyle = { flexBasis: dividerSize };
        const factor = spacers[index];
        const maxSize = `calc((100% - ${count - 1} * ${dividerSize}px) * ${factor})`;
        const frameStyle = isHorizontal ? { maxWidth: maxSize } : { maxHeight: maxSize };

        return (
          <Fragment key={index}>
            {cloneElement(child, { count: list.length, style: frameStyle })}
            {index < list.length - 1 && (
              <Divider
                frameSet={refFrameSet}
                style={dividerStyle}
                onDrag={generateDividerDragHandler(index)}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

interface FrameProps {
  style?: React.CSSProperties;
  title?: string;
}

export function Frame({ children, style, title }: PropsWithChildren<FrameProps>) {
  return (
    <div className={css.frame} style={style}>
      {title && (<div className={css.title}>{title}</div>)}
      {children}
    </div>
  );
}

interface DividerProps {
  frameSet: React.RefObject<HTMLElement>;
  onDrag?: (point: Point) => void;
  onDragComplete?: (point: Point) => void;
  style?: React.CSSProperties;
}

function Divider({ frameSet, style, onDrag, onDragComplete }: DividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect>();
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    window.addEventListener('mousemove', handleMouseMove);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!frameSet.current) return;

    onDrag?.(getMousePointPercent(e, frameSet.current));
  }, [ frameSet ]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!frameSet.current) return;

    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);

    onDragComplete?.(getMousePointPercent(e, frameSet.current));
  }, [ frameSet ]);

  useEffect(() => {
    rect.current = ref.current?.getBoundingClientRect();
    ref.current?.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      ref.current?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className={css.divider}
      ref={ref}
      style={style}
    />
  );
}
