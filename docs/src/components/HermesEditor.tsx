import Hermes, { NestedObject, RecursivePartial } from 'hermes-parallel-coordinates';
import { useObservable } from 'micro-observables';
import { useEffect, useMemo, useRef } from 'react';

import { DEFAULT_DATA_STRING, DEFAULT_DIMENSIONS_STRING } from '@/constants/defaults';
import themeStore from '@/stores/theme';
import { isString } from '@/utils/data';

import CodeEditor from './CodeEditor';
import FrameSet, { Frame } from './FrameSet';
import css from './HermesEditor.module.css';

interface Props {
  chartHeight?: number | string;
  config?: string | RecursivePartial<Hermes.Config>;
  data?: string | Hermes.Data;
  dimensions?: string | Hermes.Dimension[];
}

function forceObject<T extends NestedObject | Array<unknown>>(input: string | T): T {
  return isString(input) ? Hermes.str2obj<T>(input) : input;
}

function forceString<T extends NestedObject | Array<unknown>>(input: string | T): string {
  return isString(input) ? input : Hermes.obj2str<T>(input);
}

export default function HermesEditor({
  chartHeight = 320,
  config = {},
  data = DEFAULT_DATA_STRING,
  dimensions = DEFAULT_DIMENSIONS_STRING,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hermesRef = useRef<Hermes>();
  const theme = useObservable(themeStore.theme);

  const resolvedConfig = useMemo(() => {
    const baseConfig: RecursivePartial<Hermes.Config> = {
      style: {
        axes: {
          label: {
            fillStyle: theme.surfaceOn,
            strokeStyle: theme.surface,
          },
          labelActive: {
            fillStyle: theme.surfaceOn,
            strokeStyle: theme.surface,
          },
          labelHover: {
            fillStyle: theme.surfaceOn,
            strokeStyle: theme.surface,
          },
        },
        dimension: {
          label: {
            fillStyle: theme.surfaceOn,
            strokeStyle: theme.surface,
          },
        },
      },
    };
    return Hermes.deepMerge(baseConfig, forceObject(config));
  }, [ theme ]);

  useEffect(() => {
    if (!containerRef.current) return;

    hermesRef.current = new Hermes(
      containerRef.current,
      forceObject(dimensions),
      resolvedConfig,
      forceObject(data),
    );

    return () => hermesRef.current?.destroy();
  }, [ resolvedConfig ]);

  return (
    <div className={css.base}>
      <FrameSet>
        <Frame title="Dimensions">
          <CodeEditor code={forceString(dimensions)} />
        </Frame>
        <Frame title="Data">
          <CodeEditor code={forceString(data)} />
        </Frame>
        <Frame title="Config">
          <CodeEditor code={forceString(config)} />
        </Frame>
      </FrameSet>
      <div className={css.chart} ref={containerRef} style={{ height: chartHeight }} />
    </div>
  );
}
