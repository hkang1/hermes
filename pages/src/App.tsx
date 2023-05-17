import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';
import SideBar from './SideBar';
import themeStore from '@/stores/theme';
import { setThemeCssVars } from '@/utils/theme';
import { useObservable } from 'micro-observables';

import './App.css';

const router = createBrowserRouter(routes);

function App() {
  const theme = useObservable(themeStore.theme);

  useEffect(() => {
    setThemeCssVars(theme);
    return themeStore.theme.subscribe((theme) => setThemeCssVars(theme));
  }, []);

  return (
    <>
      <aside>
        <SideBar />
      </aside>
      <main>
        <RouterProvider router={router} />
      </main>
    </>
  );
}

export default App;
