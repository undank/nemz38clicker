// Variables setup
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var circles = [];
var score = 0;
var lives = 3;
var startTime = Date.now();
var lastCircleTimes = [Date.now(), Date.now(), Date.now(), Date.now(), Date.now(), Date.now()];
var circleIntervals = [1100, 1900, 6000, 9800, 14800, 18000];

//sounds
var audioCtx;
var isMuted = false;
var clickSounds = ['sounds/click1.mp3', 'sounds/click2.mp3', 'sounds/click3.mp3'];
var hurtSounds = ['sounds/hurt1.mp3', 'sounds/hurt2.mp3', 'sounds/hurt3.mp3'];
var gameOverSounds = ['sounds/gameOver1.mp3', 'sounds/gameOver2.mp3', 'sounds/gameOver3.mp3'];
var pitchShift = new Tone.PitchShift(2).toDestination();
var player = new Tone.Player({ url: 'sounds/click1.mp3', autostart: false, }).connect(pitchShift);

// Load images before game starts
var imageSources = ['images/1.png', 'images/2.png', 'images/3.png', 'images/4.png', 'images/5.png', 'images/6.png', 'images/7.png', 'images/8.png', 'images/9.png'];
var images = [];
var lifeImage = new Image(); 
lifeImage.src = 'images/life.png';
imageSources.forEach(function(src) { 
    var img = new Image(); 
    img.src = src; 
    images.push(img); 
});

// Event listeners
canvas.addEventListener('click', function(evt) { 
    checkForHit(getMousePos(canvas, evt)); 
}, false);
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('muteButton').addEventListener('click', toggleMute);

function startGame() { 
    ['startButton', 'title', 'sub', 'legion1', 'legion2'].forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('myCanvas').style.display = 'block';
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    Tone.start();
    circles = []; 
    score = 0; 
    lives = 3; 
    startTime = Date.now();
    lastCircleTimes = [Date.now(), Date.now(), Date.now(), Date.now(), Date.now(), Date.now()];
    circleIntervals = [1100, 1900, 6000, 9800, 14800, 18000];
    gameLoop();
}

function getMousePos(canvas, evt) { 
    var rect = canvas.getBoundingClientRect(); 
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }; 
}

function checkForHit(mousePos) { 
    circles.forEach(function(circle, index) {
        if (Math.hypot(circle.x - mousePos.x, circle.y - mousePos.y) < circle.radius) {
            score += 1;
            circles.splice(index, 1);
            pitchShift.pitch = score / 2; 
            player.load(clickSounds[Math.floor(Math.random() * clickSounds.length)]); 
            player.start();
        }
    });
}

function newCircle() { 
    circles.push({
        img: images[Math.floor(Math.random() * images.length)],
        x: 60 + Math.random() * (canvas.width - 120),
        y: 60 + Math.random() * (canvas.height - 120),
        radius: 1,
        time: Date.now()
    });
}

function draw() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < lives; i++) { ctx.drawImage(lifeImage, canvas.width / 2 - 30 * lives + i * 60, 10, 50, 50); }
    ctx.fillStyle = 'red'; 
    ctx.font = '36px serif'; 
    ctx.fillText('Score: ' + score, 10, 50);

    circles.forEach(function(circle, index) {
        var age = (Date.now() - circle.time) / 1000;
        if (age > 3) {
            circles.splice(index, 1); 
            lives -= 1;
            playSound(hurtSounds[Math.floor(Math.random() * hurtSounds.length)]);
        } else {
            circle.radius = (age < 0.5 ? age * 120 : 60 - (age - 0.5) * 24);
            ctx.drawImage(circle.img, circle.x - circle.radius, circle.y - circle.radius, circle.radius * 2, circle.radius * 2);
        }
    });
}

function gameLoop() { 
    pitchShift.pitch = score * 0.05;
    var currentTime = Date.now();
    for (var i = 0; i < 6; i++) { 
        if (currentTime - lastCircleTimes[i] >= circleIntervals[i]) {
            newCircle();
            lastCircleTimes[i] = currentTime;
            circleIntervals[i] -= (Math.random() * 15).toFixed(2); 
        }
    }
    draw();
    if (lives > 0) { 
        requestAnimationFrame(gameLoop); 
    } else { 
        drawMessage("GAME OVER"); 
        playSound(gameOverSounds[Math.floor(Math.random() * hurtSounds.length)]); 
        document.getElementById('startButton').style.display = 'block'; 
        document.getElementById('startButton').innerText = "Restart"; 
    }
}

function drawMessage(message) { 
    var originalFillStyle = ctx.fillStyle;
    var originalTextAlign = ctx.textAlign;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    ctx.font = "40px Arial"; 
    ctx.fillStyle = "yellow"; 
    ctx.textAlign = "center"; 
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = originalFillStyle;
    ctx.textAlign = originalTextAlign;
}

function playSound(src) { 
    if (!isMuted) { new Audio(src).play(); }
}

function toggleMute() {
    isMuted = !isMuted;
    Tone.Master.mute = isMuted;
    document.getElementById('muteButton').innerText = isMuted ? 'Unmute' : 'Mute';
}
