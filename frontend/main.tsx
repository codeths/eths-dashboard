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
import CssBaseline from '@mui/joy/CssBaseline';
import GlobalStyles from '@mui/joy/GlobalStyles';

import '@fontsource/inter';
import Login from './pages/login';
import Layout from './pages/layout';
import { AuthProvider, AuthContext } from './AuthProvider';

import { AppLoaderData } from './types/loaders';

function App() {
  const { authenticated, user } = useLoaderData() as AppLoaderData;

  return (
    <AuthProvider authenticated={authenticated} user={user}>
      <CssVarsProvider defaultMode="system">
        <CssBaseline />
        <GlobalStyles
          styles={{
            '& .lucide': {
              color: 'var(--Icon-color)',
              margin: 'var(--Icon-margin)',
              fontSize: 'var(--Icon-fontSize, 20px)',
              width: '1em',
              height: '1em',
            },
          }}
        />
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
  return <></>;
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
        element: (
          <>
            <ProtectedRoute />
            <Layout />
          </>
        ),
        children: [
          {
            index: true,
            element: <Typography level="h1">Dashboard</Typography>,
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
