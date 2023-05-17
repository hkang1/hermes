import { useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import SideBar from './SideBar';
import themeStore from '@/stores/theme';
import { setThemeCssVars } from '@/utils/theme';
import { useObservable } from 'micro-observables';
import routes from './routes';

import './App.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      {routes.map((route) => (
        <Route index={route.index} path={route.path} element={route.element} />
      ))}
    </Route>
  ),
  import.meta.env.PROD ? { basename: '/hermes' } : undefined
);

function App() {
  const theme = useObservable(themeStore.theme);

  useEffect(() => {
    setThemeCssVars(theme);
    return themeStore.theme.subscribe((theme) => setThemeCssVars(theme));
  }, []);

  return <RouterProvider router={router} />;
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
