import React, { createContext } from 'react';
import { AppLoaderData } from './types/loaders';

const AuthContext = createContext<AppLoaderData | null>(null);

function AuthProvider({
  children,
  authenticated,
  user,
}: AppLoaderData & { children: any }) {
  return (
    <AuthContext.Provider value={{ authenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
