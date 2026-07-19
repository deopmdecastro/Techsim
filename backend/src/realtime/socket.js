import { Server } from 'socket.io';

export function createRealtimeServer(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  io.on('connection', socket => {
    socket.on('project:join', ({ projectId, userName }) => {
      if (!projectId) return;
      socket.join(`project:${projectId}`);
      socket.data.projectId = projectId;
      socket.data.userName = userName || 'Operador';
      socket.to(`project:${projectId}`).emit('editor:presence', {
        projectId,
        userName: socket.data.userName,
        socketId: socket.id,
        action: 'join',
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on('project:leave', ({ projectId }) => {
      if (!projectId) return;
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('editor:presence', {
        projectId,
        userName: socket.data.userName || 'Operador',
        socketId: socket.id,
        action: 'leave',
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on('editor:snapshot', payload => {
      if (!payload?.projectId) return;
      socket.to(`project:${payload.projectId}`).emit('editor:snapshot', {
        ...payload,
        socketId: socket.id,
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on('editor:presence', payload => {
      if (!payload?.projectId) return;
      socket.to(`project:${payload.projectId}`).emit('editor:presence', {
        ...payload,
        socketId: socket.id,
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on('editor:selection', payload => {
      if (!payload?.projectId) return;
      socket.to(`project:${payload.projectId}`).emit('editor:selection', {
        ...payload,
        socketId: socket.id,
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on('simulation:state', payload => {
      if (!payload?.projectId) return;
      socket.to(`project:${payload.projectId}`).emit('simulation:state', {
        ...payload,
        socketId: socket.id,
        receivedAt: new Date().toISOString(),
      });
    });

    socket.on('comment:created', payload => {
      if (!payload?.projectId) return;
      socket.to(`project:${payload.projectId}`).emit('comment:created', payload);
    });

    socket.on('disconnect', () => {
      if (!socket.data?.projectId) return;
      socket.to(`project:${socket.data.projectId}`).emit('editor:presence', {
        projectId: socket.data.projectId,
        userName: socket.data.userName || 'Operador',
        socketId: socket.id,
        action: 'leave',
        receivedAt: new Date().toISOString(),
      });
    });
  });

  return io;
}
