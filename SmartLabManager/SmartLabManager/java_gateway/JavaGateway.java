package java_gateway;

import py4j.GatewayServer;
import java_src.TimeUtils;
import java_src.BookingManager;

/**
 * Java Gateway for Py4J to connect Python with Java
 */
public class JavaGateway {
    
    private TimeUtils timeUtils;
    private BookingManager bookingManager;
    
    public JavaGateway() {
        // Initialize components
        timeUtils = new TimeUtils();
        bookingManager = BookingManager.getInstance();
    }
    
    public TimeUtils getTimeUtils() {
        return timeUtils;
    }
    
    public BookingManager getBookingManager() {
        return bookingManager;
    }
    
    public static void main(String[] args) {
        JavaGateway app = new JavaGateway();
        // Start the server on the default port
        GatewayServer server = new GatewayServer(app);
        server.start();
        System.out.println("Java Gateway Server Started");
    }
}