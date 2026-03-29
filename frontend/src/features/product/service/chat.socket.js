import {io} from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:4000", {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}