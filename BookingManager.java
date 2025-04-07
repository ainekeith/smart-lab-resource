package java_src;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Java class for managing equipment bookings
 * This class is designed to be called from Python
 */
public class BookingManager {
    
    // Date and time formatters
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    /**
     * Check if a time slot is available for equipment
     */
    public static boolean isTimeSlotAvailable(String equipmentId, String dateStr, 
                                             String startTimeStr, String endTimeStr) {
        
        // This is a simplified implementation
        // In a real application, this would check against a database of bookings
        
        // For demonstration purposes, we'll just check that the times are valid
        try {
            LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
            LocalTime startTime = LocalTime.parse(startTimeStr, TIME_FORMATTER);
            LocalTime endTime = LocalTime.parse(endTimeStr, TIME_FORMATTER);
            
            // Check that end time is after start time
            return endTime.isAfter(startTime);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Main method for running as a standalone application
     * Usage: java BookingManager check <equipment_id> <date> <start_time> <end_time>
     */
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Usage: java BookingManager <command> [args]");
            System.out.println("Commands:");
            System.out.println("  check <equipment_id> <date> <start_time> <end_time>");
            return;
        }
        
        String command = args[0];
        
        if (command.equals("check") && args.length >= 5) {
            String equipmentId = args[1];
            String date = args[2];
            String startTime = args[3];
            String endTime = args[4];
            
            boolean available = isTimeSlotAvailable(equipmentId, date, startTime, endTime);
            System.out.println(available);
        } else {
            System.out.println("Unknown command or invalid arguments");
        }
    }
}