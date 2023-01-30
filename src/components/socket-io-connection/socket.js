import io from "socket.io-client";

export const socket = io.connect("https://playnwin.fun/api", {
  cors: "*",
  // transports: ["websocket"],
});

// console.log('check 1', socket.connected);
// console.log(process.env.REACT_APP_BASEURL)

socket.on("connect_error", (error) => {
  console.log(error);
});
