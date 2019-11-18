const canvas = document.querySelector(".canvas");
const startButton = document.querySelector(".start-button");
const pauseButton = document.querySelector(".pause-button");
const closeButton = document.querySelector(".close-button");
const muteButton = document.querySelector(".mute-button");
const scoreOutput = document.querySelector(".score");
const levelOutput = document.querySelector(".level");
const endGameAlert = document.querySelector(".game-alert");
const scoreAlert = document.querySelector(".score-alert");
const nextPieceCanvas = document.querySelector(".next-piece");
const gameBoardContext = canvas.getContext("2d");
const nextPieceContext = nextPieceCanvas.getContext("2d");
const canvasWidth = 400;
const canvasHeight = 800;
const nextPieceCanvasWidth = 160;
const nextPieceCanvasHeight = 160;
const rows = 20;
const columns = 10;
const gameBoard = [];
const nextPieceBoard = [];
const empty = "black";
const squareSize = 40;
const tetrominos = [[L, "#E4FF4D"], [J, "#FF8F85"], [S, "#276FC2"], [Z,"#5CFF85"], [I, "#6F32C2"], [O, "#5CFFEE"], [T, "#CC62C3"]];
let gameStarted = false;
let isPaused = false;
let soundOn = true
let dropSpeed = 1000;
let startTime;
let score = 0;
let level = 1;
let requestId;
let tetromino;
let nextTetromino;
let rotateSound = new Sound("./sounds/rotate.mp3");
let lineClearedSound = new Sound("./sounds/line.mp3");
let lockPieceSound = new Sound("./sounds/lock.mp3");

canvas.height = canvasHeight;
canvas.width = canvasWidth;
nextPieceCanvas.height = nextPieceCanvasHeight;
nextPieceCanvas.width = nextPieceCanvasWidth;

createGrid(4, 4, nextPieceBoard);
drawGrid(nextPieceContext, nextPieceBoard);
createGrid(rows, columns, gameBoard);
drawGrid(gameBoardContext, gameBoard);                   



function loop(){
  if(!isPaused && gameStarted){
    clearCanvas(gameBoardContext, canvasWidth, canvasHeight);
    clearCanvas(nextPieceContext, nextPieceCanvasWidth, nextPieceCanvasHeight);
    drawGrid(gameBoardContext, gameBoard);
    drawGrid(nextPieceContext, nextPieceBoard);
    tetrominoCreator();
    tetromino.draw(gameBoardContext);
    nextTetromino.draw(nextPieceContext, 0, 0);
    tetromino.dropDown();
    removeRows();
    updateScore();
    updateLevel();
  }
  requestId = requestAnimationFrame(loop);
  endGame();
}

function createGrid(rows, columns, grid) {
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < columns; c++) {
      grid[r][c] = empty;
    }
  }
}

function drawGrid(context, grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      drawSquare(context, c, r, grid[r][c]);
    }
  }
}

function clearCanvas(context, width, height) 
{
  context.fillStyle = empty;
  context.fillRect(0,0, width, height)
}

function tetrominoCreator(){
  if(tetromino.locked){
    const randomPiece = random(tetrominos.length);
    tetromino = nextTetromino;
    nextTetromino = new Tetromino(tetrominos[randomPiece][0],tetrominos[randomPiece][1], dropSpeed, random(columns - tetrominos[randomPiece][0][0].length + 1));
  }
}

function removeRows(){
 for (let r = 0; r < rows; r++) {
   let clearRow = true;
   for (let c = 0; c < columns; c++) {
     if(gameBoard[r][c] === empty){
       clearRow = false;
     }
    }
   if(clearRow){
     gameBoard.splice(r,1);
     gameBoard.unshift(new Array(columns).fill(empty));
     score += 100;
     if(soundOn){
      lineClearedSound.play();
     }
   }
  }
}

function updateScore(){
  scoreOutput.innerText = `SCORE: ${score}`;
  levelOutput.innerText = `LEVEL: ${level}`;
}

function updateLevel(){
  if(Date.now() - startTime > 60000){
    level++;
    dropSpeed -= 25;
    startTime = Date.now();
  }
}

function startGame(){
  startButton.innerText = "NEW GAME"
  const randomPiece = random(tetrominos.length);
  const nextRandomPiece = random(tetrominos.length);
  dropSpeed = 1000;
  startTime;
  score = 0;
  level = 1;
  gameStarted = true;
  startTime = Date.now();
  tetromino = new Tetromino(tetrominos[randomPiece][0], tetrominos[randomPiece][1], dropSpeed, random(columns - tetrominos[randomPiece][0][0].length + 1));
  nextTetromino = new Tetromino(tetrominos[nextRandomPiece][0], tetrominos[nextRandomPiece][1], dropSpeed, random(columns - tetrominos[nextRandomPiece][0][0].length + 1));
  createGrid(rows, columns, gameBoard);
  loop();
}

function endGame(){
  if(tetromino.isOverflowed()) {
    cancelAnimationFrame(requestId);
    scoreAlert.innerText = `SCORE: ${score}`;
    endGameAlert.style.display = "block";
    gameStarted = false;
  }
}

function pauseGame(){
  isPaused = !isPaused;
  if(isPaused){
    pauseButton.innerText = "UNPAUSE"
  } else {
    pauseButton.innerText = "PAUSE"
  }

}

function muteGame() {
  soundOn = !soundOn
  if(soundOn){
    muteButton.innerText = "MUTE"
  } else {
    muteButton.innerText = "UNMUTE"
  }
}



function closeAlert(){
  endGameAlert.style.display = "none"
}

function Sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}
//helper functions
function random(max){
  return Math.floor(Math.random() * (max))
}

function drawSquare(context, x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
  context.strokeStyle = "#BDB5B5";
  context.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

document.addEventListener("keydown", (e)=>{
  if(e.key === "ArrowLeft"){
    tetromino.moveLeft();
  } else if(e.key === "ArrowRight"){
    tetromino.moveRight()
  } else if(e.key === "ArrowDown"){
    tetromino.moveDown();
  } else if(e.key === "ArrowUp"){
    tetromino.rotate(rotateSound);
  }
 });

 startButton.addEventListener("click", startGame);
 pauseButton.addEventListener("click", pauseGame);
 closeButton.addEventListener("click", closeAlert)
 muteButton.addEventListener("click", muteGame);

