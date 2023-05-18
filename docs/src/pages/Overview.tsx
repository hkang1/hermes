import Hermes, { DimensionType } from 'hermes-parallel-coordinates';
import { useEffect, useRef } from 'react';

import { c } from '@/components/Code';
import Figure from '@/components/Figure';

const PETS_DIMENSIONS = [
  {
    categories: [ 'Amari', 'Helix', 'Kals', 'Timber', 'Qubbie' ],
    key: 'name',
    label: 'Name',
    type: DimensionType.Categorical,
  },
  {
    categories: [ 'cat', 'dog', 'hamster', 'rabbit' ],
    key: 'type',
    label: 'Type',
    type: DimensionType.Categorical,
  },
  { key: 'age', label: 'Age (yr)', type: DimensionType.Linear },
  { key: 'height', label: 'Height (cm)', type: DimensionType.Linear },
  { key: 'weight', label: 'Height (kg)', type: DimensionType.Linear },
];

const PETS_DATA = {
  age: [ 1, 14, 12, 4, 3 ],
  height: [ 48, 85, 39, 12, 26 ],
  name: [ 'Amari', 'Helix', 'Kals', 'Timber', 'Qubbie' ],
  type: [ 'dog', 'dog', 'cat', 'hamster', 'rabbit' ],
  weight: [ 23, 38, 8, 1, 2 ],
};

const PETS_CONFIG = {
  style: {
    data: {
      series: [
        { strokeStyle: 'rgb(200, 0, 0)' },
        { strokeStyle: 'rgb(200, 150, 0)' },
        { strokeStyle: 'rgb(0, 200, 0)' },
        { strokeStyle: 'rgb(0, 100, 150)' },
        { strokeStyle: 'rgb(0, 0, 200)' },
      ],
    },
  },
};

export default function GettingStarted() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    new Hermes(chartRef.current, PETS_DIMENSIONS, PETS_CONFIG, PETS_DATA);
  }, []);

  return (
    <>
      <h1>Hermes Parallel Coordinates</h1>

      <p>
        {c`hermes-parallel-coordinates`} is an ultra light weight parallel
        coordinates charting library. Parallel coordinates chart are useful for
        multiple series of data that span across several dimensions.
      </p>

      <p>
        For example, if we had multiple peoples' data to chart and they each
        have multiple characteristics that we want to show, a parallel
        coordinates chart would be able to visualize a snapshot of all of this.
        Some of the characteristics might be {c`age`}, {c`height`}, {c`weight`},
        etc.
      </p>

      <p>Here</p>

      <Figure caption="Pets Chart" whiteBackground>
        <div id="pets" ref={chartRef} style={{ height: 320, width: '100%' }} />
      </Figure>

      <h1>Screenshots</h1>

      <p>Showcase of commonly used variations of hermes.</p>

      <Figure
        caption="Default chart rendering"
        imageSrc="https://raw.githubusercontent.com/hkang1/hermes/main/screenshots/standard.png"
      />

      <Figure
        caption="Bezier curve rendering"
        imageSrc="https://raw.githubusercontent.com/hkang1/hermes/main/screenshots/path-type-bezier-curve.png"
      />

      <Figure
        caption="Chart with filtering"
        imageSrc="https://raw.githubusercontent.com/hkang1/hermes/main/screenshots/filtered.png"
      />

      <Figure
        caption="Vertical orientation"
        imageSrc="https://raw.githubusercontent.com/hkang1/hermes/main/screenshots/layout-vertical.png"
        whiteBackground
      />
    </>
  );
}
