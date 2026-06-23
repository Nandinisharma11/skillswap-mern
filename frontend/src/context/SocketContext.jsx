import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    let newSocket;

    if (user) {
      // Connect to socket server
      newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        // Register this user's socket room
        newSocket.emit('join_room', user.id || user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
