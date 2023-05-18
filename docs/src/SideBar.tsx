import { Link } from 'react-router-dom';

import { ROUTES } from './App';
import css from './SideBar.module.css';

export default function SideBar() {
  return (
    <menu className={css.base}>
      {ROUTES.filter((route) => route.path !== '*').map((route) =>
        route.label && route.path ? (
          <Link key={route.path} to={route.path}>
            {route.label}
          </Link>
        ) : undefined)}
    </menu>
  );
}
