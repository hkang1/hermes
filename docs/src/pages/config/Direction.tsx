import HermesEditor from '@/components/HermesEditor';
import { DEFAULT_DATA_STRING, DEFAULT_DIMENSIONS_STRING } from '@/constants/defaults';

export default function Direction() {
  console.log(DEFAULT_DIMENSIONS_STRING);
  return (
    <>
      <h1>Direction</h1>

      <p>
        Here is a working demo of such a parallel coordinates chart.
      </p>

      <HermesEditor
        config={'{}'}
        data={DEFAULT_DATA_STRING}
        dimensions={DEFAULT_DIMENSIONS_STRING}
      />
    </>
  );
}
