import routes from './routes';
import css from './SideBar.module.css';

export default function SideBar() {
  return (
    <menu className={css.base}>
      {routes
        .filter((route) => route.path !== '*')
        .map((route) => (
          <a href={route.path}>{route.label}</a>
        ))}
    </menu>
  );
}
