import Hermes, { RecursivePartial } from 'hermes-parallel-coordinates';
import { useObservable } from 'micro-observables';
import { useEffect, useMemo, useRef } from 'react';

import themeStore from '@/stores/theme';

import CodeEditor from './CodeEditor';
import FrameSet, { Frame } from './FrameSet';
import css from './HermesEditor.module.css';

interface Props {
  config: string;
  data: string;
  dimensions: string;
}

const BASE_CONFIG: RecursivePartial<Hermes.Config> = {
  style: {
    axes: {
      label: {
        fillStyle: 'var(--theme-surface-on)',
        // strokeStyle: 'var(--theme-stage-strong)',
      },
    },
  },
};

export default function HermesEditor({ config, data, dimensions }: Props) {
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
    return Hermes.deepMerge(baseConfig, JSON.parse(config));
  }, [ theme ]);

  useEffect(() => {
    if (!containerRef.current) return;

    hermesRef.current = new Hermes(
      containerRef.current,
      JSON.parse(dimensions),
      resolvedConfig,
      JSON.parse(data),
    );

    return () => hermesRef.current?.destroy();
  }, [ resolvedConfig ]);

  return (
    <div className={css.base}>
      <FrameSet>
        <Frame title="Dimensions">
          <CodeEditor code={dimensions} />
        </Frame>
        <Frame title="Data">
          <CodeEditor code={data} />
        </Frame>
        <Frame title="Config">
          <CodeEditor code={config} />
        </Frame>
      </FrameSet>
      <div className={css.chart} ref={containerRef} style={{ height: 320, width: '100%' }} />
    </div>
  );
}
