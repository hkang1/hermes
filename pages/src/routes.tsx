import GettingStarted from '@/pages/GettingStarted';
import Overview from '@/pages/Overview';

export default [
  {
    element: <Overview />,
    label: 'Overview',
    path: 'overview',
  },
  {
    element: <GettingStarted />,
    label: 'Getting Started',
    path: 'getting-started',
  },
  {
    element: <Overview />,
    label: 'Overview',
    path: '*',
  },
];
