from flask import Flask, jsonify, request , send_file
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Set up JWT
app.config["JWT_SECRET_KEY"] = "46EFD63528DFB4DC92247A4F3D4B1"  # Replace with a secure secret key
jwt = JWTManager(app)

client = MongoClient("mongodb+srv://admin:Crma%40123@tgr.wakk1.mongodb.net/")
db = client["machine_data_db"]
collection = db["machine_data"]

# Directory to store uploaded files
UPLOAD_FOLDER = r'uploads'
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=False)

# Mock user credentials for demonstration (replace with a real user database)
users = {
    "admin": "admin",
    "chin" : "1234"
}

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get("username")
    password = request.json.get("password")

    # Check if username and password are correct
    if username in users and users[username] == password:
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/upload_wav', methods=['POST'])
@jwt_required()  # Protect this route with JWT
def upload_wav():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    # Check if the file is a wav file
    if file.filename == '' or not file.filename.endswith('.wav'):
        return jsonify({"error": "Invalid file format. Only .wav files are allowed."}), 400

    # Save the file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    return jsonify({"message": "File uploaded successfully", "filename": file.filename}), 200

@app.route('/download_wav/<filename>', methods=['GET'])
@jwt_required()  # Protect this route with JWT
def download_wav(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Check if the file exists
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    # Send the file to the client
    return send_file(file_path, as_attachment=True)

@app.route('/data', methods=['POST'])
@jwt_required()
def create_data():
    data = request.json
    result = collection.insert_one(data)
    return jsonify({"message": "Data created", "id": str(result.inserted_id)}), 201

# Read all records (protected)
@app.route('/data', methods=['GET'])
@jwt_required()
def get_all_data():
    data_list = list(collection.find())
    for data in data_list:
        data["_id"] = str(data["_id"])  # Convert ObjectId to string for JSON serialization
    return jsonify(data_list)

# Read a single record by ID (protected)
@app.route('/data/<id>', methods=['GET'])
@jwt_required()
def get_data(id):
    data = collection.find_one({"_id": ObjectId(id)})
    if data:
        data["_id"] = str(data["_id"])
        return jsonify(data)
    return jsonify({"error": "Data not found"}), 404

# Update a record by ID (protected)
@app.route('/data/<id>', methods=['PUT'])
@jwt_required()
def update_data(id):
    update_data = request.json
    result = collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    if result.matched_count > 0:
        return jsonify({"message": "Data updated"})
    return jsonify({"error": "Data not found"}), 404

# Delete a record by ID (protected)
@app.route('/data/<id>', methods=['DELETE'])
@jwt_required()
def delete_data(id):
    result = collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count > 0:
        return jsonify({"message": "Data deleted"})
    return jsonify({"error": "Data not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)

