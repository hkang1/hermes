import { useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import SideBar from './SideBar';
import themeStore from '@/stores/theme';
import { setThemeCssVars } from '@/utils/theme';
import { useObservable } from 'micro-observables';
import routes from './routes';

import './App.css';

function App() {
  const theme = useObservable(themeStore.theme);

  useEffect(() => {
    setThemeCssVars(theme);
    return themeStore.theme.subscribe((theme) => setThemeCssVars(theme));
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.PROD ? '/hermes' : undefined}>
      <Routes>
        <Route element={<Layout />}>
          {routes.map((route) => (
            <Route path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
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
