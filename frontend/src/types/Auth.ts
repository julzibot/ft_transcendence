export interface User {
  id: number;
  username: string;
  image: string;
}

export interface Token {
  iat: number;
  exp: number;
}

export interface Session {
  user: User;
  token: Token;
}