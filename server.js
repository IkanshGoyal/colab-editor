const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const idMap = {};

function receiveUsers(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: idMap[socketId],
        };
    });
}

io.on('connection', (socket) => {
    socket.on('join', ({roomId, username}) => {
        idMap[socket.id] = username;
        socket.join(roomId);

        const users = receiveUsers(roomId);
        users.forEach(({socketId}) => {
            io.to(socketId).emit('joined', {
                users, username, socketId: socket.id,
            });
        });
    });

    socket.on('code_change', ({roomId, code}) => {
        socket.in(roomId).emit('code_change', {code});
    });

    socket.on('sync', ({socketId, code}) => {
        io.to(socketId).emit('code_change', {code});
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit('disconnected', {
                socketId: socket.id,
                username: idMap[socket.id],
            });
        });
        delete idMap[socket.id];
        socket.leave();
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));