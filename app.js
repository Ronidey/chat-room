const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  // ON JOIN
  socket.on("join", (options, cb) => {
    const user = addUser({ id: socket.id, ...options });

    if (!user) {
      return cb("something went wrong!");
    }

    socket.join(user.room);

    socket.emit("alert", "Welcome");
    socket.broadcast
      .to(user.room)
      .emit("alert", `${user.username} has joined!`);

    io.to(user.room).emit("roomData", getUsersInRoom(user.room));
  });

  // ON TYPING
  socket.on("typing", (cb) => {
    const user = getUser(socket.id);

    if (!user) {
      return cb(true);
    }

    socket.broadcast
      .to(user.room)
      .emit("userTyping", `${user.username} is typing...`);
  });

  // ON NOT TYPING
  socket.on("notTyping", (cb) => {
    const user = getUser(socket.id);

    if (!user) {
      return cb(true);
    }

    socket.broadcast.to(user.room).emit("roomData", getUsersInRoom(user.room));
  });

  // ON SEND MESSAGE
  socket.on("sendMessage", (msg, cb) => {
    const user = getUser(socket.id);

    if (!user) {
      return cb(true);
    }

    io.to(user.room).emit("message", {
      username: user.username,
      message: msg
    });

    cb(); // msg delivered successfully!
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("alert", `${user.username} has left!`);
      io.to(user.room).emit("roomData", getUsersInRoom(user.room));
    }
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/chat-room", (req, res) => {
  const rooms = ["fun", "gk", "study"];

  if (rooms.includes(req.query.room) && req.query.username) {
    res.render("chat");
  } else {
    res.redirect("/");
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log("running on port", port));
