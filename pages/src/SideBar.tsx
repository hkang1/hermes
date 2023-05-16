import routes from './routes';

export default function SideBar() {
  return (
    <>
      {routes.map((route) => (
        <a href={route.path}>{route.label}</a>
      ))}
    </>
  );
}
