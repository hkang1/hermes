import HermesEditor from '@/components/HermesEditor';

export default function Direction() {
  return (
    <>
      <h1>Direction</h1>

      <p>
        Hermes parallel coordinates chart can be drawn horizontally or vertically.
        The charts are drawn horizontally by default.
      </p>

      <h2>direction: "horizontal"</h2>

      Set the `config.direction` option to the string `horizontal` (or leave it `undefined`).

      <HermesEditor config={{ direction: 'horizontal' }} />

      <h2>direction: "vertical"</h2>

      <HermesEditor chartHeight={1000} config={{ direction: 'vertical' }} />
    </>
  );
}
