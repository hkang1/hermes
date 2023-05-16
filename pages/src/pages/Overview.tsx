import { c } from '@/components/Code';

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

      <h1>Screenshots</h1>
    </>
  );
}
