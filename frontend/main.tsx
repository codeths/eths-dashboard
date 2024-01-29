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

import { AppLoaderData } from './types/loaders';

function App() {
  const { authenticated, user } = useLoaderData() as AppLoaderData;

  return (
    <AuthProvider authenticated={authenticated} user={user}>
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
    loader: async ({ request }): Promise<AppLoaderData> => {
      const req = await fetch('/api/v1/web/me', { signal: request.signal });

      if (req.status === 200) {
        const { user } = await req.json();
        return { authenticated: true, user };
      } else {
        return { authenticated: false, user: null };
      }
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
