import io from "socket.io-client";

export const socket = io.connect("http://localhost:5000", {
  cors: "*",
  // transports: ["websocket"],
});

export const playSocket = io.connect("https://playnwin.fun", {
  cors: "*",
  // transports: ["websocket"],
});

// console.log('check 1', socket);
socket.on("connect_error", (error) => {
  console.log(error);
});

playSocket.on("connect_error", (error) => {
  console.log(error);
});
