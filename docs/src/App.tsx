import { useObservable } from 'micro-observables';
import { useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import GettingStarted from '@/pages/GettingStarted';
import Overview from '@/pages/Overview';
import themeStore from '@/stores/theme';
import { setThemeCssVars } from '@/utils/theme';

import './App.css';
import SideBar from './SideBar';

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

const ROUTER = createBrowserRouter([
  {
    children: ROUTES,
    element: <Layout />,
    errorElement: <div>Error!</div>,
    loader: () => {
      return <div>Loading</div>;
    },
    path: '/',
  },
]);

function App() {
  const theme = useObservable(themeStore.theme);

  useEffect(() => {
    setThemeCssVars(theme);
    return themeStore.theme.subscribe((theme) => setThemeCssVars(theme));
  }, []);

  return <RouterProvider router={ROUTER} />;
}

function Layout() {
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
