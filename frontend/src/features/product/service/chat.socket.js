import {io} from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io("https://ai-seller.onrender.com", {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}