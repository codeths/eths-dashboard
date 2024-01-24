import React, { useContext, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import Typography from '@mui/joy/Typography';
import { CssVarsProvider } from '@mui/joy/styles';

import '@fontsource/inter';
import Login from './pages/login';
import { AuthProvider, AuthContext } from './AuthProvider';

type AppLoaderData = {
  authenticated: boolean;
};

function App() {
  const { authenticated } = useLoaderData() as AppLoaderData;

  return (
    <AuthProvider authenticated={authenticated}>
      <CssVarsProvider defaultMode="system">
        <Outlet />
      </CssVarsProvider>
    </AuthProvider>
  );
}
function ProtectedRoute() {
  const goto = useNavigate();
  const ctx = useContext(AuthContext);

  useEffect(() => {
    if (!ctx?.authenticated) goto('/login');
  }, [ctx]);
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    loader: (): AppLoaderData => {
      return { authenticated: false };
    },
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Typography level="h1">Hello World!</Typography>,
          },
          {
            path: '*',
            element: <Typography level="h1">Page not found</Typography>,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
