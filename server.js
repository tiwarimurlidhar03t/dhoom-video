const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);


    // =========================
    // JOIN ROOM
    // =========================

    socket.on("join-room", (roomId) => {

        const room = io.sockets.adapter.rooms.get(roomId);
        const userCount = room ? room.size : 0;


        // Maximum 2 users
        if (userCount >= 2) {

            socket.emit("room-full");

            console.log(`Room ${roomId} is full`);

            return;
        }


        socket.join(roomId);

        socket.data.roomId = roomId;


        console.log(
            `User ${socket.id} joined room ${roomId}`
        );


        const updatedRoom =
            io.sockets.adapter.rooms.get(roomId);

        const updatedCount =
            updatedRoom ? updatedRoom.size : 0;


        // Second user joined
        if (updatedCount === 2) {

            socket.to(roomId).emit(
                "user-joined"
            );

        }

    });


    // =========================
    // WEBRTC OFFER
    // =========================

    socket.on(
        "offer",
        ({ roomId, offer }) => {

            socket.to(roomId).emit(
                "offer",
                offer
            );

        }
    );


    // =========================
    // WEBRTC ANSWER
    // =========================

    socket.on(
        "answer",
        ({ roomId, answer }) => {

            socket.to(roomId).emit(
                "answer",
                answer
            );

        }
    );


    // =========================
    // ICE CANDIDATE
    // =========================

    socket.on(
        "ice-candidate",
        ({ roomId, candidate }) => {

            socket.to(roomId).emit(
                "ice-candidate",
                candidate
            );

        }
    );


    // =========================
    // CHAT MESSAGE
    // =========================

    socket.on(
        "chat-message",
        ({ roomId, message }) => {

            // Message sirf room ke doosre user ko bhejna
            socket.to(roomId).emit(
                "chat-message",
                {
                    message: message,
                    senderId: socket.id,
                    time: new Date().toLocaleTimeString(
                        "en-IN",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                }
            );

        }
    );


    // =========================
    // END CALL
    // =========================

    socket.on(
        "end-call",
        (roomId) => {

            socket.to(roomId).emit(
                "end-call"
            );

        }
    );


    // =========================
    // DISCONNECT
    // =========================

    socket.on(
        "disconnect",
        () => {

            const roomId =
                socket.data.roomId;


            if (roomId) {

                socket.to(roomId).emit(
                    "user-left"
                );

            }


            console.log(
                "User disconnected:",
                socket.id
            );

        }
    );

});


server.listen(3001, () => {

    console.log(
        "Server running at http://localhost:3001"
    );

});