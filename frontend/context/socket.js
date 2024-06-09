import io from "socket.io-client"
import { createContext } from "react"

export const socket = io("http://localhost:6500");
export const SocketContext = createContext();