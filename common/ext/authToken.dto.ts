interface AuthTokenBase {
  v: number;
}

export interface AuthTokenV1 extends AuthTokenBase {
  v: 1;
  sub: string;
}
