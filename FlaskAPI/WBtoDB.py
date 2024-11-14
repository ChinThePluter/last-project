from websocket import create_connection, WebSocketConnectionClosedException
from pymongo import MongoClient
import json
import time

# Configuration
WEBSOCKET_URL = "ws://technest.ddns.net:8001/ws"
API_KEY = "e57972d26910e9d9e4caf68fd941c775"

# MongoDB setup
client = MongoClient("mongodb+srv://admin:Crma%40123@tgr.wakk1.mongodb.net/")  # Replace with your MongoDB URI if using Atlas or a remote server
db = client["machine_data_db"]
collection = db["machine_data"]

def insert_data_to_mongo(data):
    """Inserts data into MongoDB collection."""
    try:
        # Add a timestamp and insert data into MongoDB
        data["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
        collection.insert_one(data)
        print("Data inserted into MongoDB:", data)
    except Exception as e:
        print("Error inserting data into MongoDB:", e)

def retrieve_data():
    """Connect to the WebSocket, send API key, and store incoming data in MongoDB."""
    try:
        # Establish WebSocket connection
        print("Attempting to connect to WebSocket...")
        ws = create_connection(WEBSOCKET_URL)
        print("Connected to WebSocket")

        # Send API key as the first message
        print("Sending API key...")
        ws.send(API_KEY)
        print("API key sent, awaiting data...")

        # Loop to receive data continuously
        while True:
            try:
                # Receive data from the WebSocket
                data = ws.recv()
                if data:
                    # Parse JSON data
                    parsed_data = json.loads(data)
                    print("Data received:", parsed_data)
                    
                    # Insert data into MongoDB
                    insert_data_to_mongo(parsed_data)
            except WebSocketConnectionClosedException:
                print("Connection closed by the server.")
                break
            except json.JSONDecodeError:
                print("Received non-JSON data:", data)

    except Exception as e:
        print(f"Error in WebSocket connection: {e}")
    finally:
        ws.close()
        print("WebSocket connection closed")

# Run the data retrieval function
retrieve_data()
