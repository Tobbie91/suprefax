import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (userId: string): Socket => {
  if (socket) socket.disconnect();

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
  });

  socket.connect();
  socket.emit("join", userId);

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
