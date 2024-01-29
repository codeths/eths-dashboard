import { WebUser } from './WebUser';

export interface AppLoaderData {
  authenticated: boolean;
  user: WebUser | null;
}
