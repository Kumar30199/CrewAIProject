#!/usr/bin/env python3
"""
Startup script to launch both Node.js and Python servers
"""
import subprocess
import sys
import time
import threading
import os

def start_python_server():
    """Start the Python Flask server"""
    try:
        print("Starting Python Flask server...")
        env = os.environ.copy()
        env['PORT'] = '8000'
        process = subprocess.Popen([
            sys.executable, 'server/resume_processor.py'
        ], env=env)
        process.wait()
    except Exception as e:
        print(f"Python server error: {e}")

def start_node_server():
    """Start the Node.js Express server"""
    try:
        print("Starting Node.js Express server...")
        process = subprocess.Popen(['npm', 'run', 'dev'])
        process.wait()
    except Exception as e:
        print(f"Node.js server error: {e}")

if __name__ == '__main__':
    # Start Python server in background
    python_thread = threading.Thread(target=start_python_server)
    python_thread.daemon = True
    python_thread.start()
    
    # Give Python server time to start
    time.sleep(2)
    
    # Start Node.js server in foreground
    start_node_server()