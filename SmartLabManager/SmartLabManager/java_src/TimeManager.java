package java_src;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Java utility class for generating time slots for the S-Lab booking system
 * This class creates a standalone application that can be called from Python
 */
public class TimeManager {
    
    /**
     * Generate time slots with specified time interval
     */
    public static List<String> generateTimeSlots(int startHour, int endHour, int intervalMinutes) {
        List<String> timeSlots = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        
        LocalTime currentTime = LocalTime.of(startHour, 0);
        LocalTime endTime = LocalTime.of(endHour, 0);
        
        while (currentTime.isBefore(endTime) || currentTime.equals(endTime)) {
            timeSlots.add(currentTime.format(formatter));
            currentTime = currentTime.plusMinutes(intervalMinutes);
        }
        
        return timeSlots;
    }
    
    /**
     * Main method for running as standalone application
     */
    public static void main(String[] args) {
        // Default values
        int startHour = 8;
        int endHour = 18;
        int intervalMinutes = 30;
        
        // Parse command line arguments if provided
        if (args.length >= 3) {
            try {
                startHour = Integer.parseInt(args[0]);
                endHour = Integer.parseInt(args[1]);
                intervalMinutes = Integer.parseInt(args[2]);
            } catch (NumberFormatException e) {
                System.err.println("Invalid arguments. Using default values.");
            }
        }
        
        // Generate time slots
        List<String> timeSlots = generateTimeSlots(startHour, endHour, intervalMinutes);
        
        // Print time slots (one per line, for easy parsing in Python)
        for (String slot : timeSlots) {
            System.out.println(slot);
        }
    }
}