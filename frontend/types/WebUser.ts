type UserRole = 'None' | 'View' | 'Admin';
export interface WebUser {
  _id: string;
  googleID: string;
  email: string;
  name: string;
  photo?: string;
  roles: UserRole[];
}
