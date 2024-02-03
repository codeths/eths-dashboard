import { WebUser } from './WebUser';

export interface AppLoaderData {
  authenticated: boolean;
  user: WebUser | null;
}

export interface LoaderParams {
  request: Request;
}
