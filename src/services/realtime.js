import { io } from 'socket.io-client';
import { backendConfig } from './backend';

let sharedSocket = null;

export function getRealtimeClient() {
  if (!backendConfig.realtimeUrl) return null;
  if (!sharedSocket) {
    sharedSocket = io(backendConfig.realtimeUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return sharedSocket;
}

export function subscribeToProject(projectId, handlers = {}, userName = 'Operador') {
  const socket = getRealtimeClient();
  if (!socket || !projectId) return () => {};

  socket.emit('project:join', { projectId, userName });

  const bindings = [
    ['editor:snapshot', handlers.onSnapshot],
    ['editor:presence', handlers.onPresence],
    ['editor:selection', handlers.onSelection],
    ['simulation:state', handlers.onSimulation],
  ].filter(([, handler]) => typeof handler === 'function');

  bindings.forEach(([event, handler]) => socket.on(event, handler));

  return () => {
    bindings.forEach(([event, handler]) => socket.off(event, handler));
    socket.emit('project:leave', { projectId });
  };
}

export function publishEditorSnapshot(payload) {
  const socket = getRealtimeClient();
  if (!socket) return;
  socket.emit('editor:snapshot', payload);
}

export function publishEditorPresence(payload) {
  const socket = getRealtimeClient();
  if (!socket) return;
  socket.emit('editor:presence', payload);
}

export function publishEditorSelection(payload) {
  const socket = getRealtimeClient();
  if (!socket) return;
  socket.emit('editor:selection', payload);
}

export function publishSimulationState(payload) {
  const socket = getRealtimeClient();
  if (!socket) return;
  socket.emit('simulation:state', payload);
}
