interface Props {
  name: string;
}

export default function Icon({ name }: Props) {
  return (<span className={`icon-${name}`} />);
}
