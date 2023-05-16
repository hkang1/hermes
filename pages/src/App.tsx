import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './routes';
import './App.css';
import SideBar from './SideBar';

const router = createBrowserRouter(routes);

function App() {
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
