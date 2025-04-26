import { useEffect } from 'react';
import wsService from '../services/websocket.service';

export const useWebSocket = (eventType: string, callback: (data: any) => void) => {
  useEffect(() => {
    wsService.subscribe(eventType, callback);
    return () => {
      wsService.unsubscribe(eventType, callback);
    };
  }, [eventType, callback]);

  return wsService;
};