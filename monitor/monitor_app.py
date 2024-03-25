#!/bin/env python
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)
app.config['SECRET_KEY'] = 'secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# game_rooms is a dict storing {game_room} and corresponding {client_id}
# { 
#   'aqualab' : ['clientIDxxxxxinRoomAqualab', 'clientIDyyyyyyinRoomAqualab'],
#   ...
# }
game_rooms = {}


@app.route('/')
def index():
    return render_template('index.html')

def remove_client_by_client_id(client_id:str):
    """Given a client's session ID, remove it from all game rooms.

    :param client_id: The ID of the client to be removed from all game rooms
    :type client_id: str
    """
    for game_name, clients in game_rooms.items():
        if client_id in clients:
            clients.remove(client_id)
            leave_room(game_name, client_id)
            # print(f'Client ID: {client_id} removed from Room {game_name}')

def add_client_by_client_id(game_name:str, client_id:str):
    """Given the name of a game room and a client's session id, join client to the corresponding game room

    :param game_name: The name of the game to whose room the client should be added
    :type game_name: str
    :param client_id: The ID of the client session to be added into the room
    :type client_id: str
    """
    if game_name not in game_rooms:
        game_rooms[game_name] = []

    if client_id not in game_rooms[game_name]:
        game_rooms[game_name].append(client_id)
        join_room(game_name, client_id)
        # print(f'Client ID: {client_id} added to Room {game_name}')

@socketio.on('connect')
def handle_connect():
    """When a new client connects, add its ID to the default game room, "AQUALAB"
    """
    client_id = request.sid
    # print(f'Client connected with ID: {client_id}')
    add_client_by_client_id("AQUALAB", client_id)

@socketio.on('disconnect')
def handle_disconnect():
    """When current client "disconnects," remove its ID from game rooms
    """
    client_id = request.sid
    remove_client_by_client_id(client_id)
    # print(f'Client disconnected with ID: {client_id}')

@socketio.on('game_selector_changed')
def handle_game_selector_changed(selectedGame:str):
    """When current client changes game selecor, remove it from current game room and join to the newly-assigned room

    :param selectedGame: The newly-selected game to which the client should be moved.
    :type selectedGame: str
    """
    client_id = request.sid
    remove_client_by_client_id(client_id)
    add_client_by_client_id(selectedGame, client_id)

class LoggerReceiver(Resource):
    """flask-restful API receiver.
    
    Allows data coming in through name space '/log/event' to send data to corresponding room
    """
    def post(self):
        json_data = request.get_json() or {}
        # print(f"Received LoggerReceiver request, with data {json_data}")
        socketio.emit('logger_data', json_data, to=json_data.get('app_id'))
        return {'message': 'Received logger data successfully'}


api.add_resource(LoggerReceiver, '/log/event')

if __name__ == '__main__':
    # socketio.run(app, port=5022, debug=True, use_reloader=True, log_output=True, allow_unsafe_werkzeug=True) # For debugging work
    socketio.run(app, port=5022, debug=False, use_reloader=False, log_output=True, allow_unsafe_werkzeug=False) # For stable, production work
