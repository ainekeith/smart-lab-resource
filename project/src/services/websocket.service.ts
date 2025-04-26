import { jwtDecode } from 'jwt-decode';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const decodedToken: any = jwtDecode(token);
      const wsUrl = `ws://192.168.1.131:8000/ws/notifications/${decodedToken.user_id}/?token=${token}`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const eventType = data.type;
        
        // Notify all listeners for this event type
        if (this.listeners.has(eventType)) {
          this.listeners.get(eventType)?.forEach(listener => listener(data));
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.initializeSocket(), this.reconnectTimeout);
    }
  }

  public subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);
  }

  public unsubscribe(eventType: string, callback: (data: any) => void) {
    this.listeners.get(eventType)?.delete(callback);
  }

  public send(eventType: string, data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: eventType, ...data }));
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;