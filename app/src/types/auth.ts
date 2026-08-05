declare module 'jsonwebtoken' {
  export interface JwtPayload {
    identity_provider: string;
  }
}

export interface IdpAttributes {
  idp: string;
  kind: string;
  username: string;
}
