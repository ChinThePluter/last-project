from flask import Flask, jsonify, request, send_file
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from flask_cors import CORS
import os
from datetime import timedelta, datetime
import time

app = Flask(__name__)
CORS(app)

# Set up JWT
app.config[
    'JWT_SECRET_KEY'
] = '46EFD63528DFB4DC92247A4F3D4B1'  # Replace with a secure secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

client = MongoClient('mongodb+srv://admin:Crma%40123@tgr.wakk1.mongodb.net/')
db = client['machine_data_db']
collection_1 = db['machine_data']
collection_2 = db['pi_result']

# Directory to store uploaded files
UPLOAD_FOLDER = r'uploads'
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mock user credentials for demonstration (replace with a real user database)
users = {'admin': 'admin', 'chin': '1234'}


@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    # Check if username and password are correct
    if username in users and users[username] == password:
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/upload_wav', methods=['POST'])
@jwt_required()
def upload_wav():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']

    # Check if the file is a wav file
    if file.filename == '' or not file.filename.endswith('.wav'):
        return (
            jsonify({'error': 'Invalid file format. Only .wav files are allowed.'}),
            400
        )
    # Find the highest file number in the directory
    base_filename = 'file'
    extension = '.wav'
    max_file_num = 0

    # Ensure the upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Iterate through existing files to find the highest file number
    for filename in os.listdir(UPLOAD_FOLDER):
        if filename.startswith(base_filename) and filename.endswith(extension):
            try:
                # Extract the number from the filename (e.g., "file10.wav" -> 10)
                file_num = int(filename[len(base_filename) : -len(extension)])
                max_file_num = max(max_file_num, file_num)
            except ValueError:
                # If filename is not in expected format, skip it
                continue
    # Set the new filename based on the highest file number found
    new_filename = f"{base_filename}{max_file_num + 1}{extension}"
    file_path = os.path.join(UPLOAD_FOLDER, new_filename)

    # Save the file with the unique name
    file.save(file_path)

    return (
        jsonify({'message': 'File uploaded successfully', 'filename': new_filename}),
        200
    )


@app.route('/download_wav/<filename>', methods=['GET'])
@jwt_required()  # Protect this route with JWT
def download_wav(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Check if the file exists
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    # Send the file to the client
    return send_file(file_path, as_attachment=True)


@app.route('/data', methods=['POST'])
@jwt_required()
def create_data():
    data = request.json
    result = collection_1.insert_one(data)
    return jsonify({'message': 'Data created', 'id': str(result.inserted_id)}), 201


# Read all records (protected)
@app.route('/data', methods=['GET'])
@jwt_required()
def get_all_data():
    data_list = list(collection_1.find())
    for data in data_list:
        data['_id'] = str(
            data['_id']
        )  # Convert ObjectId to string for JSON serialization
    return jsonify(data_list)


# Read a single record by ID (protected)
@app.route('/data/<id>', methods=['GET'])
@jwt_required()
def get_data(id):
    data = collection_1.find_one({'_id': ObjectId(id)})
    if data:
        data['_id'] = str(data['_id'])
        return jsonify(data)
    return jsonify({'error': 'Data not found'}), 404


# Update a record by ID (protected)
@app.route('/data/<id>', methods=['PUT'])
@jwt_required()
def update_data(id):
    update_data = request.json
    result = collection_1.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count > 0:
        return jsonify({'message': 'Data updated'})
    return jsonify({'error': 'Data not found'}), 404


# Delete a record by ID (protected)
@app.route('/data/<id>', methods=['DELETE'])
@jwt_required()
def delete_data(id):
    result = collection_1.delete_one({'_id': ObjectId(id)})
    if result.deleted_count > 0:
        return jsonify({'message': 'Data deleted'})
    return jsonify({'error': 'Data not found'}), 404


@app.route('/data/filter', methods=['GET'])
@jwt_required()
def filter_data():
    # Get 'start' and 'end' query parameters
    start = request.args.get('start')
    end = request.args.get('end')

    # Validate start and end parameters
    if not start or not end:
        return (
            jsonify(
                {'error': "Please provide both 'start' and 'end' date parameters."}
            ),
            400
        )
    # Convert start and end to datetime objects with milliseconds
    try:
        start_date = datetime.strptime(start, '%Y-%m-%d %H:%M:%S:%f')
        end_date = datetime.strptime(end, '%Y-%m-%d %H:%M:%S:%f')
    except ValueError:
        return (
            jsonify(
                {
                    'error': "Incorrect date format. Please use 'YYYY-MM-DD HH:MM:SS:fff'."
                }
            ),
            400
        )
    # Query the database for records within the date range
    data = list(
        collection_1.find(
            {
                # Filter documents by converting the `timestamp` string field to a datetime object
                '$expr': {
                    '$and': [
                        {
                            '$gte': [
                                {
                                    '$dateFromString': {
                                        'dateString': '$timestamp',
                                        'format': '%Y-%m-%d %H:%M:%S:%L'
                                    }
                                },
                                start_date
                            ]
                        },
                        {
                            '$lte': [
                                {
                                    '$dateFromString': {
                                        'dateString': '$timestamp',
                                        'format': '%Y-%m-%d %H:%M:%S:%L'
                                    }
                                },
                                end_date
                            ]
                        }
                    ]
                }
            }
        )
    )

    # Convert ObjectId to string for JSON serialization
    for entry in data:
        entry['_id'] = str(entry['_id'])
    return jsonify(data), 200


@app.route('/send_command', methods=['POST'])
@jwt_required()
def send_command():
    command = request.json.get('command')
    if not command:
        return jsonify({'error': 'No command provided'}), 400
    # Execute the command and capture the output
    try:
        result = os.popen(command).read()  # Run the command on the Raspberry Pi
        return jsonify({'message': 'Command executed', 'result': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
