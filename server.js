const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { Server } = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  })

  // Store on global so API routes can emit events
  global.io = io

  io.on("connection", (socket) => {
    socket.on("join-rider", (riderId) => {
      socket.join(`rider:${riderId}`)
      console.log(`Rider ${riderId} joined their room`)
    })

    // Customer joins a room to track a specific order's rider location
    socket.on("join-order-tracking", (orderId) => {
      socket.join(`order:${orderId}`)
      console.log(`Client joined order tracking room: ${orderId}`)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id)
    })
  })

  const port = process.env.PORT || 3000
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
