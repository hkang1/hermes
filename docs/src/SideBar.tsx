import { useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '@/components/Icon';
import { NAVIGATION, NavItem, NavRouteObject, NavSection } from '@/constants/routes';
import { isNavRouteObject, isNavSection } from '@/utils/routes';

import css from './SideBar.module.css';

export default function SideBar() {
  return (
    <menu className={css.base}>
      {NAVIGATION.map((item) => Item(item, 0))}
    </menu>
  );
}

function Item(item: NavItem) {
  if (isNavSection(item)) return Section(item);
  if (isNavRouteObject(item)) return Route(item);
  return null;
}

function Section(section: NavSection) {
  const [ isOpen, setIsOpen ] = useState(true);
  const classes = [ css.section ];

  if (!isOpen) classes.push(css.closed);

  const handleToggle = () => setIsOpen((prev) => !prev);

  return (
    <section className={classes.join(' ')} key={section.label}>
      <div className={css.title} onClick={handleToggle}>
        <span>{section.label}</span>
        <Icon name={isOpen ? 'arrow-down' : 'arrow-left'} />
      </div>
      <div className={css.body}>
        {section.children.map((child) => Item(child))}
      </div>
    </section>
  );
}

function Route(item: NavRouteObject) {
  return item.path ? (<Link key={item.path} to={item.path}>{item.label}</Link>) : null;
}
