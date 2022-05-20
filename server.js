const express = require('express');
const path =  require('path')
const http= require('http')
const app = express();
const socketio = require('socket.io')
const server = http.createServer(app)
const io = socketio(server)
const formatMessage = require('./utils/message')
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/user')
// set static folder
app.use(express.static(path.join(__dirname,'public')))

// RUn when client connect
const BotName = 'Bot'

io.on('connection', (socket) => {
    socket.on('joinRoom',({username,room}) => {
        const user = userJoin(socket.id,username,room)
        socket.join(user.room);



    // welcome current user
        socket.emit('message',formatMessage(BotName,'Welcom to ChatCord'))

    // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(BotName,`${user.username} has joined the chat`))

    //Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })


    })




    // Run wehn client disconnects
    socket.on('disconnect',() => {
        const user = userLeave(socket.id)
        if(user) {
            io.to(user.room).emit('message',formatMessage(BotName,`${user.username} has left the chat`))
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

        
    })

    socket.on("chatMessage", msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message',formatMessage(user.username,msg))
    })
})


const PORT = 3000 || process.env.PORT;




server.listen(PORT, () => console.log(`Server running on port ${PORT}`))