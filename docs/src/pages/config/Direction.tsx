import { c, cblock } from '@/components/Code';
import HermesEditor from '@/components/HermesEditor';

export default function Direction() {
  return (
    <>
      <h1>Direction (config.direction)</h1>

      {cblock`
direction: 'horizontal' (default) | 'vertical'
`}

      <p>
        The direction the dimensions should be laid out. The direction can be set to
        {c`horizontal`} or {c`vertical`}. The {c`horizontal`} direction will draw the
        dimensions across the canvas with vertical axes. The {c`vertical`} direction
        will draw the dimensions top to bottom on the canvas with horizontal axes.
      </p>

      <h2>Examples</h2>

      <h3>direction: "horizontal"</h3>

      Set the {c`direction`} option to the string value {c`horizontal`} (or leave it
      {c`undefined`}).

      <HermesEditor config={{ direction: 'horizontal' }} />

      <h3>direction: "vertical"</h3>

      Set the {c`direction`} option to the string value {c`vertical`} to render chart
      vertically. When rendering vertically, make sure the chart container element is
      tall enough to render properly.

      <HermesEditor chartHeight={1000} config={{ direction: 'vertical' }} />
    </>
  );
}
