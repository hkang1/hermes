import { Link } from 'react-router-dom';
import routes from './routes';
import css from './SideBar.module.css';

export default function SideBar() {
  return (
    <menu className={css.base}>
      {routes
        .filter((route) => route.path !== '*')
        .map((route) => (
          <Link key={route.path} to={route.path}>
            {route.label}
          </Link>
        ))}
    </menu>
  );
}
