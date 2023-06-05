import { RouteObject } from 'react-router-dom';

import Direction from '@/pages/config/Direction';
import OnDimensionMove from '@/pages/config/hooks/OnDimensionMove';
import GettingStarted from '@/pages/GettingStarted';
import Overview from '@/pages/Overview';

export type NavRouteObject = RouteObject & {
  label: string;
}

export type NavSection = {
  children: (NavRouteObject | NavSection)[];
  label: string;
  type: 'section';
}

export type NavItem = NavSection | NavRouteObject;

export const ROUTES: Record<string, NavRouteObject> = {
  configDirection: {
    element: <Direction />,
    label: 'direction',
    path: '/config/direction',
  },
  gettingStarted: {
    element: <GettingStarted />,
    label: 'Getting Started',
    path: '/getting-started',
  },
  onDimensionMove: {
    element: <OnDimensionMove />,
    label: 'onDimensionMove',
    path: '/config/hooks/onDimensionMove',
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
      {
        children: [
          ROUTES.onDimensionMove,
        ],
        label: 'hooks',
        type: 'section',
      },
    ],
    label: 'config',
    type: 'section',
  },
];
