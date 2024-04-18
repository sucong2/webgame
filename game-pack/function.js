// 게임 보드와 플레이어의 상태를 관리하는 변수
var gameBoard = document.getElementById('game-board');
var playerPositions = {};

// 서버로부터 연결 설정
var socket = io.connect('https://potential-potato-75gqvg5x66r2rrx6-5500.app.github.dev/');

// 서버로부터 위치 업데이트 받기
socket.on('update_position', function(data) {
    updatePlayerPositions(data.player_id, data.x, data.y);
    displayPlayers();
});

// 게임 오버 처리
socket.on('game_over', function() {
    alert("Game Over");
    // 게임 오버 후 추가적인 처리를 할 수 있습니다.
});

// 점수 업데이트 처리
socket.on('update_score', function(data) {
    document.getElementById('score').innerText = "Spy Score: " + data.spy_score;
});

// 플레이어 이동 키 이벤트 처리
document.addEventListener('keydown', function(event) {
    var move = '';
    switch (event.key) {
        case 'ArrowUp': move = 'up'; break;
        case 'ArrowDown': move = 'down'; break;
        case 'ArrowLeft': move = 'left'; break;
        case 'ArrowRight': move = 'right'; break;
        default: return; // 다른 키는 무시
    }
    socket.emit('move', { direction: move });
});

// 플레이어 위치 업데이트
function updatePlayerPositions(playerId, x, y) {
    playerPositions[playerId] = { x: x, y: y };
}

// 게임 보드에 플레이어 표시
function displayPlayers() {
    var cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('player', 'spy'); // 모든 플레이어 및 스파이 표시 초기화
    });
    Object.keys(playerPositions).forEach(id => {
        var pos = playerPositions[id];
        var playerCell = document.getElementById('cell-' + pos.x + '-' + pos.y);
        playerCell.classList.add(id === 'spy' ? 'spy' : 'player'); // 스파이 또는 일반 플레이어로 표시
    });
}
