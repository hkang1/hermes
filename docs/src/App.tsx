import { useObservable } from 'micro-observables';
import { useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import themeStore from '@/stores/theme';
import { setThemeCssVars } from '@/utils/theme';

import './App.css';
import { NavRouteObject, ROUTES } from './constants/routes';
import SideBar from './SideBar';

const ROUTER = createBrowserRouter([
  {
    children: [
      {
        element: <Navigate replace to="/overview" />,
        path: '/',
      },
      ...Object.values<NavRouteObject>(ROUTES),
    ],
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
