// function.js
var socket = io();
var gameBoard = document.getElementById('game-board');

function setupBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let cell = document.createElement('div');
            cell.id = `cell-${i}-${j}`;
            cell.className = 'cell';
            gameBoard.appendChild(cell);
        }
    }
}

socket.on('connect', function() {
    console.log('Connected to the server');
    setupBoard();
});

socket.on('update_positions', function(data) {
    const players = data.players;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('player', 'spy');
    });
    Object.keys(players).forEach(key => {
        const player = players[key];
        const cell = document.getElementById(`cell-${player.x}-${player.y}`);
        if (player.is_active) {
            cell.classList.add(player.is_spy ? 'spy' : 'player');
        }
    });
});

socket.on('update_score', function(data) {
    document.getElementById('score').textContent = `Score: ${data.spy_score}`;
});

socket.on('game_over', function(data) {
    alert(`Game over for ${data.player_id}`);
    location.reload(); // Reload the page to restart the game
});

document.addEventListener('keydown', function(event) {
    const move = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' }[event.keyCode];
    if (move) {
        socket.emit('move', { direction: move });
    }
});
