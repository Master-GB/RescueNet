import { useState, useEffect, useCallback } from 'react';
import socket from '../utils/socket';
import { emergencyChatService } from '../services/emergencyContactService';

export const useEmergencyChat = (serviceType) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);

  // Two separate error states — REST history fetch vs socket connection
  const [historyError, setHistoryError] = useState(null);
  const [socketError, setSocketError] = useState(null);

  // Load message history when serviceType changes
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!serviceType) return;
      try {
        setLoading(true);
        setHistoryError(null);
        const data = await emergencyChatService.getMessagesByService(serviceType);
        if (isMounted) {
          setMessages(data.data || data.messages || data || []);
        }
      } catch (err) {
        console.warn('Could not load chat history (endpoint may not exist yet):', err.message);
        if (isMounted) {
          // Silently fail — just start with an empty chat.
          // The backend emergency chat routes may not be set up yet.
          setMessages([]);
          setHistoryError(null); // Don't surface this as a blocking error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [serviceType]);

  // Handle Socket Connection & Listeners
  useEffect(() => {
    if (!serviceType) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleIncomingMessage = (newMessage) => {
      if (newMessage.serviceType === serviceType || !newMessage.serviceType) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleOpponentTyping = (data) => {
      if (data.serviceType === serviceType) {
        setIsOpponentTyping(true);
        setTimeout(() => setIsOpponentTyping(false), 3000);
      }
    };

    const handleConnect = () => {
      console.log('✅ Socket connected');
      setOnlineStatus(true);
      setSocketError(null);
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setOnlineStatus(false);
    };

    const handleConnectError = (err) => {
      console.error('🔴 Socket connection error:', err.message);
      setOnlineStatus(false);
      setSocketError('Could not connect to emergency services. Please check backend URL and CORS configuration.');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('service:send_message', handleIncomingMessage);
    socket.on('service:typing', handleOpponentTyping);

    // Set initial status if already connected
    if (socket.connected) {
      setOnlineStatus(true);
      setSocketError(null);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('service:send_message', handleIncomingMessage);
      socket.off('service:typing', handleOpponentTyping);
      socket.disconnect();
    };
  }, [serviceType]);

  // Expose Actions
  const sendMessage = useCallback((text) => {
    if (!text.trim() || !serviceType) return;

    const messagePayload = {
      serviceType,
      text,
      timestamp: new Date().toISOString(),
      sender: 'citizen'
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, messagePayload]);

    // Emit to backend
    socket.emit('citizen:send_message', messagePayload);
  }, [serviceType]);

  const sendTyping = useCallback(() => {
    if (!serviceType) return;
    socket.emit('citizen:typing', { serviceType });
  }, [serviceType]);

  return {
    messages,
    loading,
    // Only expose the socket connection error — REST failures are handled silently
    error: socketError,
    historyError,
    isOpponentTyping,
    onlineStatus,
    sendMessage,
    sendTyping
  };
};

export default useEmergencyChat;
