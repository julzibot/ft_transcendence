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

io.on("connection", (client) => {
  console.log("A client connected to the server with id: " + client.id)

  client.emit("setUserId", client.id)

  socket.on("keyDown", (position) => {
    client.emit("updatePlayerPostion", {}) //Send Updated paddle position to room
  })


  socket.on('disconnect', (socket) => {
    console.log(socket.id + " disconnected")
  })
})


server.listen(PORT, () => {
  console.log("Socket server is now listening on port " + PORT)
})
