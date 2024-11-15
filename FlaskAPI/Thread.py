from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import threading
import time
import datetime

app = Flask(__name__)
CORS(app)
API_KEY = "piadmin"
state = "stopped"  # Initial state
DB_PATH = "/TGR2024/tgr2024.db"  # Path to the SQLite database file

def check_api_key(request):
    """Check if the API key in the request header matches."""
    return request.headers.get("X-API-KEY") == API_KEY

def initialize_database():
    """Initialize the database and create the console_logs table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS console_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            event_type TEXT,
            ip_address TEXT
        )
    ''')
    conn.commit()
    conn.close()

def log_event(event_type, ip_address):
    """Log an event to the console_logs table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.datetime.now().isoformat()
    cursor.execute('''
        INSERT INTO console_logs (timestamp, event_type, ip_address) 
        VALUES (?, ?, ?)
    ''', (timestamp, event_type, ip_address))
    conn.commit()
    conn.close()

@app.route("/start", methods=["POST"])
def start():
    global state
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    state = "started"
    log_event("start", request.remote_addr)  # Log the 'start' event with IP
    return jsonify({"message": "Process started", "state": state}), 200

@app.route("/stop", methods=["POST"])
def stop():
    global state
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    state = "stopped"
    log_event("stop", request.remote_addr)  # Log the 'stop' event with IP
    return jsonify({"message": "Process stopped", "state": state}), 200

@app.route("/status", methods=["GET"])
def status():
    global state
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({"state": state}), 200

def background_worker():
    """Background worker that prints 'working' every 5 seconds if state is 'started'."""
    global state
    while True:
        if state == "started":
            print("working")
        time.sleep(5)  # Wait for 5 seconds before checking again

# Initialize the database
initialize_database()

# Start the background worker thread
worker_thread = threading.Thread(target=background_worker, daemon=True)
worker_thread.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
