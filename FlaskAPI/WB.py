from websocket import create_connection, WebSocketConnectionClosedException
import json
import time

# Configuration
WEBSOCKET_URL = "ws://technest.ddns.net:8001/ws"
API_KEY = "e57972d26910e9d9e4caf68fd941c775"

def retrieve_data():
    """Connect to the WebSocket, send API key as a message, and print incoming data."""
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
                    # Parse JSON data and print it
                    parsed_data = json.loads(data)
                    print("Data received:", parsed_data)
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
