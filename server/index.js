require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
})

app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

let items = []
let nextId = 1
let userCount = 0

// POST /items
app.post('/items', (req, res) => {
  const { name, user } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Item name is required' })
  if (!user?.trim()) return res.status(400).json({ error: 'User is required' })

  const trimmedName = name.trim()
  const duplicate = items.find(i => i.name.toLowerCase() === trimmedName.toLowerCase())
  if (duplicate) return res.status(409).json({ error: `"${trimmedName}" is already on the list` })

  const item = { id: nextId++, name: trimmedName, bought: false, addedBy: user }
  items.push(item)
  io.emit('itemsUpdated', items)
  io.emit('activity', `${user} added ${trimmedName}`)
  res.status(201).json(item)
})

// PATCH /items/:id
app.patch('/items/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { user } = req.body
  if (!user?.trim()) return res.status(400).json({ error: 'User is required' })
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
  if (!user?.trim()) return res.status(400).json({ error: 'User is required' })
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

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
