const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.POR || 3000
const publicDirPath = path.join(__dirname, '../public')


const filter = new Filter()

const SERVER_NAME = 'Server'

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id: socket.id, ...options})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage(SERVER_NAME, `Welcome to '${user.room}' chat room!`))
        socket.broadcast.to(user.room).emit('message', generateMessage(SERVER_NAME, `${user.username} has joined the room!`))
        io.to(user.room).emit('userList', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username,filter.clean(message)))
        callback('Delivered!')
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(SERVER_NAME, `${user.username} has disconnected.`))
            io.to(user.room).emit('userList', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server is running on port: ' + port)
})