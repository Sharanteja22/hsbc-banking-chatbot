import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './pages/Chat';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'chat', element: <Chat /> }
      ]
    }
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;