'use client';

import { io, Socket } from 'socket.io-client';

/**
 * Socket.IO client singleton.
 * - autoConnect: false — connect manually after setting socket.auth = { token }
 * - reconnectionAttempts: 3 — after 3 failures, socket.active becomes false and we fall back to REST polling
 */
export const socket: Socket = io(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  {
    autoConnect: false,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
  },
);
