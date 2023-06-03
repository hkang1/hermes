import { c } from '@/components/Code';
import HermesEditor from '@/components/HermesEditor';

const PETS_DIMENSIONS = `[
  {
    "categories": [ "Amari", "Helix", "Kals", "Timber", "Qubbie" ],
    "key": "name",
    "label": "Name",
    "type": "categorical"
  },
  {
    "categories": [ "cat", "dog", "hamster", "rabbit" ],
    "key": "type",
    "label": "Type",
    "type": "categorical"
  },
  { "key": "age", "label": "Age (yr)", "type": "linear" },
  { "key": "height", "label": "Height (cm)", "type": "linear" },
  { "key": "weight", "label": "Weight (kg)", "type": "linear" }
]`;

const PETS_DATA = `{
  "age": [ 1, 14, 12, 4, 3 ],
  "height": [ 48, 85, 39, 12, 26 ],
  "name": [ "Amari", "Helix", "Kals", "Timber", "Qubbie" ],
  "type": [ "dog", "dog", "cat", "hamster", "rabbit" ],
  "weight": [ 23, 38, 8, 1, 2 ]
}`;

const PETS_CONFIG = `{
  "style": {
    "axes": {
      "label": { "font": "bold 14px sans-serif" }
    },
    "data": {
      "series": [
        { "strokeStyle": "rgb(200, 0, 0)" },
        { "strokeStyle": "rgb(200, 150, 0)" },
        { "strokeStyle": "rgb(0, 200, 0)" },
        { "strokeStyle": "rgb(0, 100, 150)" },
        { "strokeStyle": "rgb(0, 0, 200)" }
      ]
    },
    "dimension": {
      "label": { "font": "bold 14px sans-serif" }
    }
  }
}`;

export default function GettingStarted() {

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

      <p>
        Here is a working demo of such a parallel coordinates chart.
      </p>

      <HermesEditor
        config={PETS_CONFIG}
        data={PETS_DATA}
        dimensions={PETS_DIMENSIONS}
      />

      {/* <h1>Screenshots</h1>

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
      /> */}
    </>
  );
}
