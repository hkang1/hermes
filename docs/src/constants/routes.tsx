import { RouteObject } from 'react-router-dom';

import Direction from '@/pages/config/Direction';
import GettingStarted from '@/pages/GettingStarted';
import Overview from '@/pages/Overview';

export type NavRouteObject = RouteObject & {
  label: string;
}

export type NavSection = {
  children: NavRouteObject[];
  label: string;
  type: 'section';
}

export type NavItem = NavSection | NavRouteObject;

export const ROUTES: Record<string, NavRouteObject> = {
  configDirection: {
    element: <Direction />,
    label: 'Direction',
    path: '/config-direction',
  },
  gettingStarted: {
    element: <GettingStarted />,
    label: 'Getting Started',
    path: '/getting-started',
  },
  overview: {
    element: <Overview />,
    label: 'Overview',
    path: '/overview',
  },
};

export const NAVIGATION: NavItem[] = [
  ROUTES.overview,
  ROUTES.gettingStarted,
  {
    children: [
      ROUTES.configDirection,
    ],
    label: 'Config',
    type: 'section',
  },
];
