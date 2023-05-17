import { useEffect } from 'react';
import {
  createHashRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import GettingStarted from '@/pages/GettingStarted';
import Overview from '@/pages/Overview';
import themeStore from '@/stores/theme';
import { setThemeCssVars } from '@/utils/theme';
import { useObservable } from 'micro-observables';

import SideBar from './SideBar';

import './App.css';

export const ROUTES = [
  {
    element: <Navigate replace to="/overview" />,
    path: '/',
  },
  {
    element: <Overview />,
    label: 'Overview',
    path: '/overview',
  },
  {
    element: <GettingStarted />,
    label: 'Getting Started',
    path: '/getting-started',
  },
];

const ROUTER = createHashRouter(
  [
    {
      children: ROUTES,
      element: <Layout />,
      loader: () => {
        console.log('showing loader');
        return <div>Loading</div>;
      },
      errorElement: <div>Error!</div>,
      path: '/',
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

function App() {
  const theme = useObservable(themeStore.theme);

  console.log('vite base_url', import.meta.env.BASE_URL);
  console.log('vite prod', import.meta.env.PROD);
  console.log('ROUTER', ROUTER);

  useEffect(() => {
    setThemeCssVars(theme);
    return themeStore.theme.subscribe((theme) => setThemeCssVars(theme));
  }, []);

  return <RouterProvider router={ROUTER} />;
}

function Layout() {
  console.log('layout called!');
  return (
    <>
      <aside>
        <SideBar />
      </aside>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
