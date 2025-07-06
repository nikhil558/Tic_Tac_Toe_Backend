const socket = require("socket.io");

const generateRoomCode = (existingRooms) => {
  let code;
  do {
    code = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit
  } while (existingRooms.has(code));
  return code;
};

const connectSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? "http://localhost:5173"
          : "http://tic-tac-toe-web-gilt.vercel.app/",
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("createRoom", (hostUser, callback) => {
      const code = generateRoomCode(io.sockets.adapter.rooms);
      socket.join(code);

      socket.data.role = "host";
      socket.data.room = code;
      socket.data.user = hostUser;
      console.log("Host created room");

      callback({ roomCode: code });
    });

    socket.on("joinRoom", (code, guestUser, callback) => {
      const room = io.sockets.adapter.rooms.get(code);
      if (!room || room.size >= 2) {
        return callback({ success: false, error: "Room not available" });
      }

      socket.join(code);
      socket.data.role = "guest";
      socket.data.room = code;
      socket.data.user = guestUser;
      console.log("Guest joined the room");

      const socketsInRoom = [...room];
      const players = socketsInRoom.map((id) => {
        const s = io.sockets.sockets.get(id);
        return s?.data?.user;
      });

      // Notify host that guest has joined
      io.to(code).emit("playerJoined", guestUser);

      callback({ success: true, players });
    });

    socket.on("hostStartGame", (roomCode) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room) {
        console.error("Room not found:", roomCode);
        return;
      }
      const socketsInRoom = [...room];
      const players = socketsInRoom.map((id) => {
        const s = io.sockets.sockets.get(id);
        return s?.data?.user;
      });
      io.to(roomCode).emit("startGame", players, { roomCode });
    });

    socket.on("makeMove", (roomCode, { index, currentPlayer }) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room) {
        console.error("Room not found:", roomCode);
        return;
      }
      io.to(roomCode).emit("moveMade", { index, player: currentPlayer });
    });

    socket.on("leaveRoom", () => {
      const { room, user } = socket.data || {};
      if (!room) return;
      console.log(`${user?.firstName} clicked Leave in ${room}`);

      socket.to(room).emit("playerLeft", user); // notify the rest
      socket.leave(room); // take them out
      delete socket.data.room; // optional cleanup
    });

    socket.on("disconnect", () => {
      const { room, user } = socket.data || {};
      if (room) {
        console.log(`${user?.firstName} disconnected from ${room}`);
        socket.to(room).emit("playerLeft", user);
      }
    });

    socket.on("resetGame", (roomCode) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room) return;
      const { user } = socket.data || {};
      console.log("[srv] resetGame by", user?.firstName); // notify everyone else in the room (not the sender)
      socket.to(roomCode).emit("playerReset", user);
    });

    socket.on("rejectGame", (roomCode) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room) return;
      const { user } = socket.data || {};
      console.log("[srv] resetGame by", user?.firstName); // notify everyone else in the room (not the sender)
      socket.to(roomCode).emit("resetReject", user);
    });

    socket.on("acceptGame", (roomCode) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (!room) return;
      const { user } = socket.data || {};
      console.log("[srv] resetGame by", user?.firstName); // notify everyone else in the room (not the sender)
      socket.to(roomCode).emit("resetAccept", user);
    });
  });
};

module.exports = connectSocket;
