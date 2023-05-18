import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';

import css from './Figure.module.css';

interface Props {
  caption?: React.ReactNode;
  height?: number | string;
  imageSrc?: string;
  whiteBackground?: boolean;
}

export default function Figure({
  caption,
  children,
  imageSrc,
  whiteBackground,
}: PropsWithChildren<Props>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [ contentStyle, setContentStyle ] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!imageSrc) return;

    const image = new Image();
    image.onload = function () {
      if (!('width' in this) || !('height' in this)) return;

      const width = this.width as number;
      const height = this.height as number;
      const rect = contentRef.current?.getBoundingClientRect();

      if (rect) {
        setContentStyle({
          backgroundImage: `url('${imageSrc}')`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          height: width > rect.width ? (rect.width * height) / width : height,
        });
      }
    };
    image.src = imageSrc;
  }, [ imageSrc ]);

  return (
    <div>
      <div
        className={css.content}
        ref={contentRef}
        style={{
          ...contentStyle,
          backgroundColor: whiteBackground ? 'white' : undefined,
        }}
      >
        {children}
      </div>
      {caption && <div className={css.caption}>{caption}</div>}
    </div>
  );
}
