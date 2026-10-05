const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);


    // JOIN ROOM
    socket.on("join-room", (roomId) => {

        socket.join(roomId);

        const room = io.sockets.adapter.rooms.get(roomId);

        const userCount = room ? room.size : 0;

        console.log(
            `User ${socket.id} joined room ${roomId}`
        );


        // Agar room me pehle se ek user hai
        if (userCount === 2) {

            socket.to(roomId).emit("user-joined");

        }

    });


    // OFFER
    socket.on("offer", ({ roomId, offer }) => {

        socket.to(roomId).emit("offer", offer);

    });


    // ANSWER
    socket.on("answer", ({ roomId, answer }) => {

        socket.to(roomId).emit("answer", answer);

    });


    // ICE CANDIDATE
    socket.on("ice-candidate", ({ roomId, candidate }) => {

        socket.to(roomId).emit(
            "ice-candidate",
            candidate
        );

    });


    // END CALL
    socket.on("end-call", (roomId) => {

        socket.to(roomId).emit("end-call");

    });


    // DISCONNECT
    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});


server.listen(3001, () => {

    console.log(
        "Server running at http://localhost:3001"
    );

});