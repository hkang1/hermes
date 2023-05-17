import GettingStarted from '@/pages/GettingStarted';
import Overview from '@/pages/Overview';

export default [
  {
    element: <Overview />,
    label: 'Overview',
    path: '/',
    index: true,
  },
  {
    element: <GettingStarted />,
    label: 'Getting Started',
    path: 'getting-started',
  },
];
