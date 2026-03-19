const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

let items = []
let nextId = 1
let userCount = 0

// POST /items
app.post('/items', (req, res) => {
  const { name, user } = req.body
  const item = { id: nextId++, name, bought: false, addedBy: user }
  items.push(item)
  io.emit('itemsUpdated', items)
  io.emit('activity', `${user} added ${name}`)
  res.status(201).json(item)
})

// PATCH /items/:id
app.patch('/items/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { user } = req.body
  const item = items.find(i => i.id === id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  item.bought = !item.bought
  io.emit('itemsUpdated', items)
  io.emit('activity', `${user} ${item.bought ? 'checked' : 'unchecked'} ${item.name}`)
  res.json(item)
})

// DELETE /items/:id
app.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { user } = req.body
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const [removed] = items.splice(idx, 1)
  io.emit('itemsUpdated', items)
  io.emit('activity', `${user} removed ${removed.name}`)
  res.json(removed)
})

// Socket.IO
io.on('connection', (socket) => {
  userCount++
  io.emit('userCount', userCount)
  socket.emit('itemsUpdated', items)

  socket.on('setUser', (username) => {
    socket.data.username = username
    io.emit('activity', `${username} joined`)
  })

  socket.on('disconnect', () => {
    userCount--
    io.emit('userCount', userCount)
  })
})

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001')
})
