const path = require('path')
const http  = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generteLocationMessage } = require('./utils/messages')
const {addUser,removeUser,getUser, getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000 //set up express server

 
//serve up public directory 
// Define paths for Express config
const publicDirectoryPath = path.join(__dirname,'../public')
// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

//socket connection
    io.on('connection', (socket) => {
        console.log('New websocket connection')
    
        socket.on('join', ({ username, room }, callback) => {
            //tracking user that join in the room
           const{error,user} = addUser({id:socket.id,username,room})
           //if error occur like username has already being taken or the user can join
           if(error) {
            return callback(error)
           }
           //socket.join allow user to join the room
           socket.join(user.room)

    

            socket.emit('message', generateMessage('Admin','Welcome!')) //use to send an event
            socket.broadcast.to(room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
           io.to(user.room).emit('roomData', {
               room:user.room,
               users:getUsersInRoom(user.room)
           })
            callback()
       
        })


        //WE install npm bad-words to correct words like fucks  not send to others 
        //this is called event acknowledgement using filter and callback function
        socket.on('sendMessage', (message, callback) =>{
            const user = getUser(socket.id) 
                
            
            const filter = new Filter ()

            if (filter.isProfane(message)) {
                return callback('Profanity is not allowed')
            }

                io.to(user.room).emit('message', generateMessage(user.username, message))
            callback()
        })
        
        
        //sharing of location with from client to server then from server to everyone
             socket.on('sendLocation',(coords, callback) => {
                const user =getUser(socket.id)
                io.to(user.room).emit('locationMessage', generteLocationMessage(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`) )
                callback()
            })

        //this section notify users when a user left
            //tracks user leaving the room
        socket.on('disconnect', () => {
            const user = removeUser(socket.id)

            if(user) {
                io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
                io.to(user.room).emit('roomData', {
                    room: user.room,
                    users:getUsersInRoom(user.room)
                })
            }
         
        })

        
    })


//listening to port 3000
server.listen(port, () =>{
    console.log(`server is up on port ${port}!`)
})