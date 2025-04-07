import os
import subprocess
import atexit
import uuid

class JavaBridge:
    """
    Bridge class to interact with Java components via subprocess
    A simpler approach than using Py4J for basic Java-Python interaction
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(JavaBridge, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the Java environment"""
        # Compile Java classes if needed
        self._compile_java_classes()
        
    def _compile_java_classes(self):
        """Compile Java classes"""
        compile_process = subprocess.run(['bash', './compile_java.sh'], 
                                        stdout=subprocess.PIPE, 
                                        stderr=subprocess.PIPE)
        
        if compile_process.returncode != 0:
            print(f"Warning: Failed to compile Java classes: {compile_process.stderr.decode()}")
    
    def generate_time_slots(self, start_hour=8, end_hour=18, interval=30):
        """
        Generate time slots for booking using the Java TimeManager class
        
        Args:
            start_hour (int): Start hour in 24-hour format
            end_hour (int): End hour in 24-hour format
            interval (int): Interval in minutes
            
        Returns:
            list: List of time slots
        """
        try:
            # Execute Java class with parameters
            result = subprocess.run(
                ['java', '-cp', 'classes', 'java_src.TimeManager', 
                 str(start_hour), str(end_hour), str(interval)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if result.returncode != 0:
                print(f"Warning: Java time slot generation failed: {result.stderr}")
                # Fallback to Python implementation if Java fails
                return self._generate_time_slots_python(start_hour, end_hour, interval)
            
            # Parse the output (one time slot per line)
            time_slots = [line.strip() for line in result.stdout.splitlines() if line.strip()]
            return time_slots
            
        except Exception as e:
            print(f"Error running Java code: {str(e)}")
            # Fallback to Python implementation
            return self._generate_time_slots_python(start_hour, end_hour, interval)
    
    def _generate_time_slots_python(self, start_hour=8, end_hour=18, interval=30):
        """
        Python fallback implementation for generating time slots
        
        Args:
            start_hour (int): Start hour in 24-hour format
            end_hour (int): End hour in 24-hour format
            interval (int): Interval in minutes
            
        Returns:
            list: List of time slots
        """
        from datetime import datetime, timedelta
        
        time_slots = []
        current_time = datetime.strptime(f"{start_hour}:00", "%H:%M")
        end_time = datetime.strptime(f"{end_hour}:00", "%H:%M")
        
        while current_time <= end_time:
            time_slots.append(current_time.strftime("%H:%M"))
            current_time += timedelta(minutes=interval)
            
        return time_slots
    
    def is_time_slot_available(self, equipment_id, date, start_time, end_time):
        """
        Check if a time slot is available using Java BookingManager
        
        Args:
            equipment_id (str): Equipment ID
            date (str): Date in format YYYY-MM-DD
            start_time (str): Start time in format HH:MM
            end_time (str): End time in format HH:MM
            
        Returns:
            bool: True if available, False otherwise
        """
        try:
            # Execute Java class with parameters
            result = subprocess.run(
                ['java', '-cp', 'classes', 'java_src.BookingManager', 'check',
                 str(equipment_id), date, start_time, end_time],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            if result.returncode != 0:
                print(f"Warning: Java booking check failed: {result.stderr}")
                # Fallback to Python implementation if Java fails
                return self._check_time_slot_python(equipment_id, date, start_time, end_time)
            
            # Parse the output (true/false)
            output = result.stdout.strip().lower()
            return output == "true"
            
        except Exception as e:
            print(f"Error running Java code: {str(e)}")
            # Fallback to Python implementation
            return self._check_time_slot_python(equipment_id, date, start_time, end_time)
    
    def _check_time_slot_python(self, equipment_id, date, start_time, end_time):
        """
        Python fallback implementation for checking time slot availability
        
        Args:
            equipment_id (str): Equipment ID
            date (str): Date in format YYYY-MM-DD
            start_time (str): Start time in format HH:MM
            end_time (str): End time in format HH:MM
            
        Returns:
            bool: True if available, False otherwise
        """
        from datetime import datetime
        
        try:
            # Parse the date and times
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            start_time_obj = datetime.strptime(start_time, "%H:%M").time()
            end_time_obj = datetime.strptime(end_time, "%H:%M").time()
            
            # Simple validation - check if end time is after start time
            start_dt = datetime.combine(date_obj, start_time_obj)
            end_dt = datetime.combine(date_obj, end_time_obj)
            
            return end_dt > start_dt
            
        except Exception as e:
            print(f"Error in Python time slot check: {str(e)}")
            return False
    
    def create_booking(self, user_email, equipment_id, date, start_time, end_time, purpose=""):
        """
        Simplified booking creation that returns a booking ID
        In a production system, this would interact with the database
        
        Args:
            user_email (str): User's email
            equipment_id (str): Equipment ID
            date (str): Date in format YYYY-MM-DD
            start_time (str): Start time in format HH:MM
            end_time (str): End time in format HH:MM
            purpose (str): Purpose of booking
            
        Returns:
            str: Booking ID
        """
        # First check if the time slot is available
        if not self.is_time_slot_available(equipment_id, date, start_time, end_time):
            return None
            
        # Generate a booking ID (In a real app, this would be stored in the database)
        booking_id = str(uuid.uuid4())
        
        return booking_id
    
# Initialize Java Bridge
java_bridge = None

def get_java_bridge():
    """Get the Java Bridge instance"""
    global java_bridge
    if java_bridge is None:
        java_bridge = JavaBridge()
    return java_bridge