import React from 'react';
import { Link } from 'react-router-dom';

import { NAVIGATION, NavItem, NavRouteObject, NavSection } from '@/constants/routes';

import css from './SideBar.module.css';
import { isNavRouteObject, isNavSection } from './utils/routes';

export default function SideBar() {
  return (
    <menu className={css.base}>
      {NAVIGATION.map((item) => Item(item))}
    </menu>
  );
}

function Item(item: NavItem) {
  if (isNavSection(item)) return Section(item);
  if (isNavRouteObject(item)) return Route(item);
  return null;
}

function Section(section: NavSection) {
  return (
    <section key={section.label}>
      <div>{section.label}</div>
      {section.children.map((child) => Item(child))}
    </section>
  );
}

function Route(item: NavRouteObject) {
  return item.path ? (
    <Link key={item.path} to={item.path}>
      {item.label}
    </Link>
  ) : null;
}
