#!/bin/bash

# First compile the Java classes
./compile_java.sh

# Run the TimeManager with desired parameters
# Format: start_hour end_hour interval_minutes
java -cp classes java_src.TimeManager "$@"