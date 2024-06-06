import { createServer } from 'node:http'
import { Server } from "socket.io"

const PORT = 5000

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

io.on("connection", async (socket) => {
  console.log("Handshake from host with socket id: " + socket.id)

  socket.on('myEvent', arg1 => {
    console.log("message from client: " + arg1)
    socket.emit("serverResponse", "Hi client")
  })
})

server.listen(PORT, () => {
  console.log("socket.io server is now listening on port " + PORT)
})
