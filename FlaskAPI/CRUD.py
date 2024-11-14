from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Configuration for JWT
app.config["JWT_SECRET_KEY"] = "46EFD63528DFB4DC92247A4F3D4B1"  # Replace with a secure secret key
jwt = JWTManager(app)

# MongoDB Configuration
client = MongoClient("mongodb+srv://admin:Crma%40123@tgr.wakk1.mongodb.net/")
db = client["machine_data_db"]
collection = db["machine_data"]

# Endpoint for user login (authentication)
@app.route('/login', methods=['POST'])
def login():
    username = request.json.get("username")
    password = request.json.get("password")
    
    # Simplified user check (in practice, query MongoDB or use a user service)
    if username == "chin" and password == "1234":  # Replace with secure authentication
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    
    return jsonify({"error": "Invalid credentials"}), 401

# Create a new record (protected)
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
