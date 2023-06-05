import { c, cblock } from '@/components/Code';
import HermesEditor from '@/components/HermesEditor';

export default function Direction() {
  return (
    <>
      <h1>onDimensionMove (config.hooks.onDimensionMove)</h1>

      {cblock`
onDimensionMove: (dimension: [Dimension](), newIndex: number, oldIndex: number) => void
`}

      <p>
        Optional hook for when the order of dimensions changes via drag and drop.
        The callback is called during the drag and whenever dimensions required a
        swap, even before when the mouse is released. The data for the dimension
        that is dragged, the new index and the original index are returned.
      </p>

      <h2>Examples</h2>

      <p>
        When you drag and drop the dimension the info of the dimension are logged
        onto the console.
      </p>

      <HermesEditor config={{
        hooks: {
          onDimensionMove: (dimension, newIndex, oldIndex) => {
            /**
             * Logs info of the dimension that was moved via drag and drop
             * along with the \`newIndex\` it ended up at and the \`oldIndex\`
             * where it was moved from.
             */
            console.log(dimension, newIndex, oldIndex);
          },
        },
      }} />
    </>
  );
}
