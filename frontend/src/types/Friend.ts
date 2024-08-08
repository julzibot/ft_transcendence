import { User } from "./User";


export interface Friend {
  id: number;
  username: string;
  image: string;
  is_online: boolean;
  friendship_status: 'FRIENDS' | 'REQUEST' | 'NONE';
}

export interface Friendship {
  friendship_status: 'FRIENDS' | 'REQUEST' | 'NONE';
  requestor: number;
  user: User
}