# app.py
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

# 게임 상태 변수
players = {}
board_size = 8
num_players = 5
spy_score = 0

def initialize_game():
    global players, spy_score
    spy_score = 0
    available_positions = [(x, y) for x in range(board_size) for y in range(board_size)]
    selected_positions = random.sample(available_positions, num_players)
    spy_id = random.randint(1, num_players)
    players = {f'player_{i+1}': {'x': pos[0], 'y': pos[1], 'is_spy': (i + 1 == spy_id), 'is_active': True} for i, pos in enumerate(selected_positions)}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('A client connected')
    initialize_game()
    emit('setup', {'players': players})

@socketio.on('move')
def handle_move(data):
    player_id = data['player_id']
    direction = data['direction']
    if players[player_id]['is_active']:
        move_player(player_id, direction)
        check_encounters(player_id)
        emit('update_positions', {'players': players})

def move_player(player_id, direction):
    x, y = players[player_id]['x'], players[player_id]['y']
    if direction == 'up' and y > 0:
        players[player_id]['y'] -= 1
    elif direction == 'down' and y < board_size - 1:
        players[player_id]['y'] += 1
    elif direction == 'left' and x > 0:
        players[player_id]['x'] -= 1
    elif direction == 'right' and x < board_size - 1:
        players[player_id]['x'] += 1

def check_encounters(player_id):
    global spy_score
    player = players[player_id]
    for pid, p in players.items():
        if pid != player_id and p['is_active'] and p['x'] == player['x'] and p['y'] == player['y']:
            if player['is_spy'] or p['is_spy']:
                spy_score += 1
                emit('update_score', {'spy_score': spy_score})
                if not p['is_spy']:
                    p['is_active'] = False
                    emit('game_over', {'player_id': pid})
                if not player['is_spy']:
                    player['is_active'] = False
                    emit('game_over', {'player_id': player_id})

if __name__ == '__main__':
    socketio.run(app, debug=True)
