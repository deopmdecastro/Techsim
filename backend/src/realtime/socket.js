import { Server } from 'socket.io';

export function createRealtimeServer(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  io.on('connection', socket => {
    socket.on('project:join', ({ projectId }) => {
      if (!projectId) return;
      socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', ({ projectId }) => {
      if (!projectId) return;
      socket.leave(`project:${projectId}`);
    });

    socket.on('simulation:state', payload => {
      if (!payload?.projectId) return;
      socket.to(`project:${payload.projectId}`).emit('simulation:state', {
        ...payload,
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on('comment:created', payload => {
      if (!payload?.projectId) return;
      socket.to(`project:${payload.projectId}`).emit('comment:created', payload);
    });
  });

  return io;
}
