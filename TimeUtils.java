package java_src;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Java utility class for time-related operations in the S-Lab booking system
 */
public class TimeUtils {
    
    /**
     * Generate time slots for booking
     * @param startHour The start hour (24-hour format)
     * @param endHour The end hour (24-hour format)
     * @param intervalMinutes Interval between slots in minutes
     * @return List of time slots
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
     * Check if a time slot is available for booking
     * @param date The date as String (YYYY-MM-DD)
     * @param startTime The start time as String (HH:MM)
     * @param endTime The end time as String (HH:MM)
     * @param bookedTimeSlots List of booked time slots (format: YYYY-MM-DD HH:MM-HH:MM)
     * @return True if the slot is available, false otherwise
     */
    public static boolean isTimeSlotAvailable(String date, String startTime, String endTime, List<String> bookedTimeSlots) {
        String timeSlot = date + " " + startTime + "-" + endTime;
        
        // Check direct conflict
        if (bookedTimeSlots.contains(timeSlot)) {
            return false;
        }
        
        // Parse requested times
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime requestedStart = LocalDateTime.parse(date + " " + startTime, dateTimeFormatter);
        LocalDateTime requestedEnd = LocalDateTime.parse(date + " " + endTime, dateTimeFormatter);
        
        // Check for overlapping bookings
        for (String bookedSlot : bookedTimeSlots) {
            String[] parts = bookedSlot.split(" ");
            String bookedDate = parts[0];
            String[] bookedTimes = parts[1].split("-");
            String bookedStartTime = bookedTimes[0];
            String bookedEndTime = bookedTimes[1];
            
            LocalDateTime bookedStart = LocalDateTime.parse(bookedDate + " " + bookedStartTime, dateTimeFormatter);
            LocalDateTime bookedEnd = LocalDateTime.parse(bookedDate + " " + bookedEndTime, dateTimeFormatter);
            
            // Check for overlap
            if (!(requestedEnd.isBefore(bookedStart) || requestedStart.isAfter(bookedEnd))) {
                return false; // Overlap detected
            }
        }
        
        return true;
    }
    
    /**
     * Format a datetime string
     * @param date The date as String (YYYY-MM-DD)
     * @param time The time as String (HH:MM)
     * @return Formatted datetime string
     */
    public static String formatDateTime(String date, String time) {
        return date + " " + time;
    }
}