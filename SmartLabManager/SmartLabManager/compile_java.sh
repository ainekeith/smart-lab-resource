#!/bin/bash

# Create the classes directory if it doesn't exist
mkdir -p classes

# Compile Java files
javac -d classes java_src/*.java

echo "Java compilation completed"