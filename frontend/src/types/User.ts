export interface User {
  id: number;
  username: string;
  image: string;
  is_online: boolean;
  friendship_status: 'FRIENDS' | 'REQUEST' | 'NONE';
}