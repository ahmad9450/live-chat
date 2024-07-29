const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const users = {};

io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for user joining
    socket.on('join', ({ username, room }) => {
        users[socket.id] = { username, room };
        socket.join(room);
        console.log(`${username} joined ${room}`);
    });

    // Listen for chat message
    socket.on('chat message', (msg) => {
        const user = users[socket.id];
        if (user) {
            io.to(user.room).emit('chat message', { user: user.username, msg });
        }
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            console.log(`${user.username} left ${user.room}`);
            delete users[socket.id];
        }
    });
});

server.listen(5000, () => {
    console.log('listening on *:5000');
});