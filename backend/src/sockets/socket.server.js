import {Server} from 'socket.io'
import { socketAuthMiddleware } from '../middlewares/auth.middleware.js';
import {registerNegotiationSocket} from '../controller/negotiation.controller.js'

let io;

export  function initSocketServer(httpServer) {
    io = new Server(httpServer,{
        cors:{
            origin:"*",
            credentials:true,
            methods:['GET','POST']
        }
    })

    io.use(socketAuthMiddleware)
    
    io.on('connection',(socket)=>{
    registerNegotiationSocket(socket, io)
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:");
    });
})

return io;
}


export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised yet");
  return io;
}