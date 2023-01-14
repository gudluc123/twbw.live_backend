import io from "socket.io-client";

export const socket = io.connect("http://139.59.65.179:4000");

// console.log('check 1', socket.connected);
// console.log(socket)

socket.on("connect_error", (error) => {
  console.log(error);
});
