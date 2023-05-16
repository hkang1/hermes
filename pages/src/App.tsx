import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import GettingStarted from './pages/GettingStarted';

const router = createBrowserRouter([
  {
    path: '/',
    element: <GettingStarted />,
  },
]);

function App() {
  return (
    <>
      <aside>
        Links
        <a href="/">Getting Started</a>
        ABC
      </aside>
      <main>
        <RouterProvider router={router} />
      </main>
    </>
  );
}

export default App;
