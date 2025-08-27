from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import uuid
from datetime import datetime, timedelta
import hashlib
import os

app = Flask(__name__)
CORS(app)

# In-memory storage
users = {}
trips = {}
messages = {}
emergency_contacts = {}
tourist_ids = {}
user_sessions = {}

# Helper functions
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_tourist_id():
    return f"TID-{uuid.uuid4().hex[:8].upper()}"

def verify_session(token):
    return user_sessions.get(token)

# Authentication endpoints
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    phone = data.get('phone')
    
    if not all([email, password, name]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if email in users:
        return jsonify({'error': 'User already exists'}), 400
    
    user_id = str(uuid.uuid4())
    users[email] = {
        'id': user_id,
        'email': email,
        'password': hash_password(password),
        'name': name,
        'phone': phone,
        'profile_complete': False,
        'verified': False,
        'created_at': datetime.now().isoformat()
    }
    
    # Generate session token
    session_token = str(uuid.uuid4())
    user_sessions[session_token] = user_id
    
    return jsonify({
        'message': 'Registration successful',
        'token': session_token,
        'user': {
            'id': user_id,
            'email': email,
            'name': name,
            'profile_complete': False
        }
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = users.get(email)
    if not user or user['password'] != hash_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate session token
    session_token = str(uuid.uuid4())
    user_sessions[session_token] = user['id']
    
    return jsonify({
        'message': 'Login successful',
        'token': session_token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'profile_complete': user.get('profile_complete', False)
        }
    })

@app.route('/api/mock-otp', methods=['POST'])
def mock_otp():
    # Mock OTP verification - always returns success
    return jsonify({'message': 'OTP verified successfully', 'verified': True})

# Profile endpoints
@app.route('/api/profile', methods=['GET'])
def get_profile():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Find user by ID
    user_data = None
    for user in users.values():
        if user['id'] == user_id:
            user_data = user
            break
    
    if not user_data:
        return jsonify({'error': 'User not found'}), 404
    
    profile = user_data.copy()
    profile.pop('password', None)
    return jsonify(profile)

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    
    # Find and update user
    for email, user in users.items():
        if user['id'] == user_id:
            user.update({
                'bio': data.get('bio', ''),
                'location': data.get('location', ''),
                'interests': data.get('interests', []),
                'emergency_contact': data.get('emergency_contact', ''),
                'profile_complete': True,
                'updated_at': datetime.now().isoformat()
            })
            
            # Generate mock blockchain tourist ID
            if user_id not in tourist_ids:
                tourist_ids[user_id] = {
                    'id': generate_tourist_id(),
                    'blockchain_hash': f"0x{uuid.uuid4().hex}",
                    'verified': True,
                    'created_at': datetime.now().isoformat()
                }
            
            break
    
    return jsonify({'message': 'Profile updated successfully'})

# Trip endpoints
@app.route('/api/trips', methods=['GET'])
def get_trips():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Return all trips with creator info
    trips_list = []
    for trip_id, trip in trips.items():
        # Get creator info
        creator = None
        for user in users.values():
            if user['id'] == trip['creator_id']:
                creator = {'name': user['name'], 'email': user['email']}
                break
        
        trip_data = trip.copy()
        trip_data['id'] = trip_id
        trip_data['creator'] = creator
        trips_list.append(trip_data)
    
    return jsonify(trips_list)

@app.route('/api/trips', methods=['POST'])
def create_trip():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    trip_id = str(uuid.uuid4())
    
    trips[trip_id] = {
        'title': data.get('title'),
        'destination': data.get('destination'),
        'start_date': data.get('start_date'),
        'end_date': data.get('end_date'),
        'description': data.get('description'),
        'max_participants': data.get('max_participants', 4),
        'creator_id': user_id,
        'participants': [user_id],
        'status': 'open',
        'created_at': datetime.now().isoformat()
    }
    
    return jsonify({'message': 'Trip created successfully', 'trip_id': trip_id})

@app.route('/api/trips/<trip_id>/join', methods=['POST'])
def join_trip(trip_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    trip = trips.get(trip_id)
    if not trip:
        return jsonify({'error': 'Trip not found'}), 404
    
    if user_id in trip['participants']:
        return jsonify({'error': 'Already joined this trip'}), 400
    
    if len(trip['participants']) >= trip['max_participants']:
        return jsonify({'error': 'Trip is full'}), 400
    
    trip['participants'].append(user_id)
    return jsonify({'message': 'Successfully joined trip'})

# Messaging endpoints
@app.route('/api/messages/<trip_id>', methods=['GET'])
def get_messages(trip_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    trip = trips.get(trip_id)
    if not trip or user_id not in trip['participants']:
        return jsonify({'error': 'Not authorized for this trip'}), 403
    
    trip_messages = messages.get(trip_id, [])
    return jsonify(trip_messages)

@app.route('/api/messages/<trip_id>', methods=['POST'])
def send_message(trip_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    trip = trips.get(trip_id)
    if not trip or user_id not in trip['participants']:
        return jsonify({'error': 'Not authorized for this trip'}), 403
    
    data = request.json
    
    # Get sender info
    sender_name = None
    for user in users.values():
        if user['id'] == user_id:
            sender_name = user['name']
            break
    
    if trip_id not in messages:
        messages[trip_id] = []
    
    message = {
        'id': str(uuid.uuid4()),
        'sender_id': user_id,
        'sender_name': sender_name,
        'content': data.get('content'),
        'timestamp': datetime.now().isoformat()
    }
    
    messages[trip_id].append(message)
    return jsonify({'message': 'Message sent successfully'})

# SOS and Emergency endpoints
@app.route('/api/sos', methods=['POST'])
def trigger_sos():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    
    # Mock SOS alert
    sos_alert = {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'location': data.get('location', 'Unknown'),
        'message': data.get('message', 'Emergency assistance needed'),
        'timestamp': datetime.now().isoformat(),
        'status': 'active'
    }
    
    # In a real app, this would notify nearby users and authorities
    return jsonify({
        'message': 'SOS alert sent successfully',
        'alert_id': sos_alert['id'],
        'nearby_users_notified': 5,  # Mock data
        'authorities_notified': True
    })

# Tourist ID endpoints
@app.route('/api/tourist-id', methods=['GET'])
def get_tourist_id():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_session(token)
    
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    tourist_id = tourist_ids.get(user_id)
    if not tourist_id:
        return jsonify({'error': 'Tourist ID not generated'}), 404
    
    return jsonify(tourist_id)

# Authority Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    # Mock authority dashboard data
    stats = {
        'total_users': len(users),
        'active_trips': len([t for t in trips.values() if t['status'] == 'open']),
        'total_trips': len(trips),
        'emergency_alerts': 0,  # Mock data
        'verified_tourists': len(tourist_ids),
        'risk_areas': [
            {'location': 'Downtown Area', 'risk_level': 'Medium'},
            {'location': 'Tourist District', 'risk_level': 'Low'},
        ]
    }
    return jsonify(stats)

@app.route('/api/dashboard/heatmap', methods=['GET'])
def get_heatmap_data():
    # Mock heatmap data
    heatmap_data = [
        {'lat': 28.6139, 'lng': 77.2090, 'intensity': 0.8},  # Delhi
        {'lat': 19.0760, 'lng': 72.8777, 'intensity': 0.6},  # Mumbai
        {'lat': 12.9716, 'lng': 77.5946, 'intensity': 0.7},  # Bangalore
    ]
    return jsonify(heatmap_data)

# Static file serving
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
