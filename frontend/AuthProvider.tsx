import React, { createContext } from 'react';

interface AuthContextType {
  authenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children, authenticated }) {
  return (
    <AuthContext.Provider value={{ authenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
