let canvas;
let ctx;
let gArrayHeight = 20; //20 squares going down
let gArrayWidth = 10; //10 blocks going across the game board
let initX = 4; //Tetromino's spawn in the 4th x Array spot
let initY = 0; // And 0'th array spot
let levelTimer = 1000; //the unadjusted time that is used as a reference for ActiveTimer. When the level increases, this should decrease.
let ActiveTimer = levelTimer; //the timer that is used to move the tetromino down. This frequetly changes.
let coordinateArray = [...Array(gArrayHeight)].map(e => Array(gArrayWidth).fill(0)); //this creates a multi dimensional array
let freezeflag = true;

let totalClearedLines = 0;
//Current Held tetromino and the corresponding tetromino color
let curHold;
let curHoldColor;
let heldTetrominoVal;
let frozenColorString; //variable that holds a color dependent on what value of a stoppedArray square is passed to numberToColor() function
let currScore = 0;
let currLevel;

var popSound = new Audio('/Assets/Audio/pop.mp3');
var levelup = new Audio('/Assets/Audio/LevelUp.mp3');
var boopSound = new Audio('/Assets/Audio/Boop.mp3');

//Coordinate solution for previewed tetrominos
let prevCoordArray = [...Array(10)].map(e => Array(4).fill(0));

//Creates an array to hold the next Tetrominos
let nextTetrominos = [];

//this is our first tetromino, it would be the coordinates on a grid, 1 position over 0 down
//The curTetromino is currently set as a T shape, indicating that there is a value of "1" where a square would be drawn
let curTetromino = [[1,0], [0,1], [1,1], [2,1]]; 
let curTetrominoVal; // stores the numerical value corresponding to the current tetromino (based on the tetrominos array)

//Stores all the tetromino shape combination
let tetrominos = [];

//added null at index 0 so that a frozen square being added to the stopped array never takes a value 0, accomplished by 
//adding +1 in createTetromino(),the function looks like this --> curTetrominoColor = tetrominoColors [randomTetromino+1];  
let tetrominoColors = ['purple', 'cyan', 'blue', 'yellow', 'orange', 'green' , 'red'];
let curTetrominoColor;

//This is a variable to stop holding being called more than once
let recentHold;

let gameOver = false;
let gameOverComplete = false;
let pause = false;

//stoppedArray is where all the no longer moving pieces of the game will be stored
let stoppedArray = [...Array(gArrayHeight)].map(e => Array(gArrayWidth).fill(0));

let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
}
let direction;

let moveConstant = 1;

class Coordinates{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

document.addEventListener('DOMContentLoaded', InitiateCanvas); //when the DOM Content is Loaded it calls our function set up canvas

function CoordArray(){ //creating a coordinate Array
    let i = 0, j = 0;
//starts off 9 pixels from the top of the screen and it continues this loop until it reaches the end
//which is 446 pixels long, add 23 pixels because that is the size of one block
    for(let y = 9; y <= 446; y+=23){
         for(let x = 11; x<= 218; x+=23){
             coordinateArray[i][j] = new Coordinates(x,y);
             i++;
         }
         j++;
         i=0;
    }
}
//Creates the coordinate array for the preview next tetromino's panel
function fillPrevCoordArray(){
    let i = 0, j = 0;
    for(let y = 239; y <= 446; y+=23){
        for(let x = 245; x<= 314; x+=23){
            
            prevCoordArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i=0;
    }
    
}

function InitiateCanvas(){
 
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 936; //total width of 936 pixels
    canvas.height = 956; //total height of 956 pixels
    ctx.scale(2,2); //2x Scale

    //drawing a rectangle inside canvas
    ctx.fillStyle = 'grey';
    ctx.fillRect(0,0, canvas.width, canvas.height);

   //drawing stroke around rectangle
   ctx.strokeStyle = 'black';
   ctx.strokeRect(8, 8, 234, 462);
   drawDashedPattern(ctx);
    //Draws the Gameboard
    ctx.strokeStyle = 'black';
    ctx.strokeRect(8, 8, 234, 462);
    drawDashedPattern(ctx);
    drawPreviewPanel();

    document.addEventListener('keydown', HandleKeyPress);

    ctx.setLineDash([]);
    //drawing the LEVEL rectangle and lettering
    ctx.strokeRect(315, 70, 151, 50 );
    ctx.fillStyle = 'white';
    ctx.font = '21px Times New Roman';
    ctx.fillText("LEVEL:", 315, 88);

    //Drawing score rectangle and lettering
    ctx.strokeRect(315, 12, 151, 50 );
    ctx.fillStyle = 'white';
    ctx.font = '21px Times New Roman';
    ctx.fillText("SCORE:", 315, 28);

    //Drawing box for the hold
    ctx.strokeRect(248, 25, 62, 62);
    ctx.fillStyle = 'white';
    ctx.font = '18px Times New Roman';
    ctx.fillText("Hold", 260, 20);
    

    //Function calls
    fillPrevCoordArray();
    CreateTetrominos();
    CreateTetromino();
    CoordArray();
    DrawTetromino();
    currLevel=1;
    LevelKeeper(0);
    
}
//Creates the Panel which previews next tetromino's that will spawn
function drawPreviewPanel(){
    ctx.fillStyle = 'white';
    ctx.fillText('Next Tetrominos', 255, 235);
    ctx.setLineDash([]);
    ctx.strokeRect(244, 238, 92, 232);
    for(let i = 284; i<=446; i+=46){
        ctx.beginPath();
        ctx.setLineDash([1,1]);
        ctx.moveTo(244, i);
        ctx.lineTo(336, i);
        ctx.stroke();
    }
    
}

//Responsible for drawing dashed lines, the coordinates are cherry picked to not draw on the overlapping coordinates of where squares will be to prevent drawing bugs
function drawDashedPattern(ctx){

    for(let i = 31; i<=446; i+=23){
        ctx.beginPath();
        ctx.setLineDash([1,1]);
        ctx.moveTo(9, i);
        ctx.lineTo(242, i);
        ctx.stroke();
    }
    for(let i=33;i<219;i+=23 ){
        ctx.beginPath();
        ctx.setLineDash([1,1]);
        ctx.moveTo(i, 9);
        ctx.lineTo(i, 446+24);
        ctx.stroke();
    }
}
/*This function utilizes our coordinate array that allows to check the location of where we want to draw our Tetromino rectangles
For example the [0],[0] spot would be x=11 pixels and y=9 pixels respectively
More examples: would be [1],[1] x=34 and y=32 respectively and [8],[16] x=172 and y=400 respectively 
Cycling through current Tetromino identifies the current shape by cycling throug ha 2d array [r][c]
[[1,0],  the below for loop cycles through x values as such x = 1 + 4 then 0 + 4 then 1 + 4 then 2 + 4
[0,1],   and loops through y values as 0 + 0 then 1 + 0 then 1 + 0 then 1+0 then 1 + 0
[1,1], 
[2,1]]
*/
function DrawTetromino(){
    
    DrawGhost();

    //console.log("Current Tetromino length is = " + curTetromino[0][0]);
    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        console.log(coordinateArray[x][y]);
        
        // only continue drawing the tetromino if it is within the boundaries of the game board to prevent attempting to draw out of bounds
        if (x >= 0 && x < gArrayWidth && y >= 0 && y < gArrayHeight) {
            //Converts the x and y values into coorX and coorY from our coordinateArray to represent them in pixels rather than array spots
            let coorX = coordinateArray[x][y].x;
            let coorY = coordinateArray[x][y].y;
        
            //Canvas context editor
            //console.log(curTetrominoColor);
            ctx.fillStyle = curTetrominoColor;
            ctx.fillRect(coorX,coorY, 21, 21);
        }
        

    }
}


function DrawGhost() {
    
    DeleteGhost();

    let ghostDistance = FindGhost();

    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY + ghostDistance;

        // only continue drawing the tetromino if it is within the boundaries of the game board to prevent attempting to draw out of bounds
        if (x >= 0 && x < gArrayWidth && y >= 0 && y < gArrayHeight) {
            //Converts the x and y values into coorX and coorY from our coordinateArray to represent them in pixels rather than array spots
            let coorX = coordinateArray[x][y].x;
            let coorY = coordinateArray[x][y].y;
            
            ctx.fillStyle = curTetrominoColor;
            ctx.globalAlpha = 0.4; // the ghost tetromino should be mostly transparent
            ctx.fillRect(coorX,coorY, 21, 21);
            ctx.globalAlpha = 1; // set the transparency back to 1 so that the actual tetrominos are solid
        }

    }
    

}

function DeleteGhost() {

    let ghostDistance = FindGhost();

    for(let i = 0; i<curTetromino.length; i++){
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY + ghostDistance;
        
        // only continue drawing the tetromino if it is within the boundaries of the game board to prevent attempting to draw out of bounds
        if (x >= 0 && x < gArrayWidth && y >= 0 && y < gArrayHeight) {
            let coorX = coordinateArray[x][y].x;
            let coorY = coordinateArray[x][y].y;
            ctx.fillStyle = 'grey';
            ctx.fillRect(coorX, coorY, 21, 21);
        }
    }

}

function FindGhost() {
    // iterate to the bottom or the topmost tetromino, basically CheckVertical but with less stuff
    let foundCollision = false;
    let ghostDistance = 0;

    while (!foundCollision) {

        for(let i = 0; i < curTetromino.length; i++) {
            let checkX = curTetromino[i][0] + initX;
            let checkY = curTetromino[i][1] + initY + 1 + ghostDistance;

            if ( (checkY) >= gArrayHeight || (stoppedArray[checkX][checkY] != 0 && stoppedArray[checkX][checkY] != undefined) ) {
                //console.log("ghost location " + ghostDistance + " down");
                foundCollision = true;
                break;
            }
        }

        if (!foundCollision) {ghostDistance++};
    }

    //return 0;

    return ghostDistance;
}


/**
 * Attempts to move the current tetromino down one unit
 * 
 * @postconditions The current tetromino is frozen if there was vertical collision. If there is no collision, the block is moved down one unit
 * 
 * @example there are blocks directly below the current tetromino. The block is now frozen and a new one spawns.
 * @example there are blocks 2 units below the current tetromino. The tetromino moves down one unit.
 */
function MoveTetrominoDown(){
    // If there is vertical collision, freeze the tetromino. Otherwise, move down
    if (CheckVertical()) {
        FreezeTimer();
    } else {
        direction = DIRECTION.DOWN;
      
        DeleteTetromino();
        initY++;
        DrawTetromino();
    }
}

/**
 * Attempt to move the current tetromino horizontally by a given amount in a given direction
 * 
 * @param {*} xMove the value of units in the X direction the block tries to move. A positive number is to the right, negative is to the left
 * 
 * @postconditions The block is moved if there is no collision. Nothing happens otherwise
 * 
 * @example there are blocks one unit to the right of the current tetromino being moved +1 unit. Nothing happens
 * @example there is at least one block two units to the left of the current tetromino being moved -2 units. The block is moved 1 unit to the left.
 * @example the current tetromino is one unit away from a wall being moved 2 units towards it. The tetromino is now touching the wall.
 */
function MoveTetrominoHorizontal(xMove) {
    
    // Update the direction variable based on xMove. This is included in this function instead of the key handler function to account for the block being moved (or prevented being moved) from outside sources such as power-ups
    if (xMove < 0) {
        direction = DIRECTION.LEFT;
    } else if (xMove > 0) {
        direction = DIRECTION.RIGHT;
    }

    
    // because this function accepts both negative and positive values, the direction we want to increment the for loop will change. This makes sure one for loop can be used for both directions.
    // increment has a magnitude of 1 and sign the same as xMove
    let increment = xMove/Math.abs(xMove)
    //console.log(increment);
    for (let i = 0; i != xMove; i += increment) {
        // If there is no obstruction/invalid spot in the given direction, update the tetromino by 1 unit in that direction.
        console.log(increment);
        if (!CheckHorizontal(increment)) {
            DeleteTetromino();
            initX += increment;
            DrawTetromino();
        }
    }
    
}

function HandleKeyPress(key){
    let ESCAPE_KEY = 27;
    let ENTER_KEY = 13;
    let LEFT_ARROW = 37;
    let RIGHT_ARROW = 39
    let DOWN_ARROW = 40;
    let UP_ARROW = 38;
    let SPACE_KEY = 32;
    let SHIFT_KEY = 16;

    if (!gameOver && !pause) { // only handle the key presses needed for game functions while the game is running
        //KeyCode 37 is for left arrow key
        if(key.keyCode === LEFT_ARROW){
            // Attempt to move the tetromino 1 unit to the left
            MoveTetrominoHorizontal(-moveConstant)
        }
        //KeyCode 39 is for right arrow key
        else if(key.keyCode === RIGHT_ARROW){
            // Attempt to move the tetromino 1 unit to the right
            MoveTetrominoHorizontal(moveConstant);
        }
        //KeyCode 40 is for down arrow key
        else if(key.keyCode == DOWN_ARROW){
            //Attempt to move the tetromino down
            if(freezeflag == false){//if the currentTetromino is dragging, pressing the down key will freeze it instantly instead of moving down
                FreezeTetromino()
            }else{
                MoveTetrominoDown();
            }
        }
        
        //KeyCode 38 is for up arrowkey
        else if(key.keyCode == UP_ARROW){
            console.log(freezeflag);
            if(freezeflag == true){
                RotateTetromino();
                DrawTetromino();
            }
        }
        else if(key.keyCode == SPACE_KEY){
            popSound.play();
            popSound.playbackRate = 2.5;
            hardDrop();
        }
        else if(key.keyCode == SHIFT_KEY){
            HoldTetromino();
            console.log("Shift pressed");
        }

        // Pause
        // keycode 27 is for the escape key
        else if (key.which == ESCAPE_KEY) {
            Pause();
        } else if (key.which == 69) { // <- REMOVE THIS LATER ON. It is for debugging only
            //SelectColor();
        }
    } else {
        if (key.which == ESCAPE_KEY || key.which == ENTER_KEY) { // the escape and enter keys should function the same way when game over or pause screen is showing
            if (pause) { // if the game is paused and the escape or enter key is pressed, then unpause the game
                Unpause();
            }
            if (gameOverComplete) { // if the game is over and the escape or enter key is pressed, start a new game
                Restart();
            }
        }
    }
}

//This deletes the current location of curTetromino position to prepare for it to be move, to understand, refer to comments for DrawTetromino method
function DeleteTetromino(){
    DeleteGhost();
    
    for(let i = 0; i<curTetromino.length; i++){
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        
        // only attempt to delete pieces that are inside the game board to avoid out of bounds errors
        if (x >= 0 && x < gArrayWidth && y >= 0 && y < gArrayHeight) {
            let coorX = coordinateArray[x][y].x;
            let coorY = coordinateArray[x][y].y;
            ctx.fillStyle = 'grey';
            ctx.fillRect(coorX, coorY, 21, 21);
        }
    }
}
function CreateTetrominos(){
    //Push method essentially means adding into an array
    // Pushes T shape array into our Tetrominos array
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    // Pushes I shape array into our Tetrominos array
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    // Pushes J shape array into our Tetrominos array
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
    // Pushes Square shape array into our Tetrominos array
    tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);
    // Pushes L shape array into our Tetrominos array
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
    // Pushes S shape array into our Tetrominos array
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
    // Pushes Z shape array into our Tetrominos array
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
}

function CreateTetromino(){
    
    //Placeholder variable stands for the "current tetromino" being worked on. Since within this function, there will 5 to work with. We can't used the global variable "curTetromino"
    //This value holds from 0-6
    let placeholder;
    //This if statement only runs once to initialize the preview next tetromino
    if(nextTetrominos.length == 0){
        for(let i = 0; i<5; i++){
            let randomTetromino = Math.floor(Math.random() * tetrominos.length);
            nextTetrominos.push(randomTetromino);
            // console.log(nextTetrominos);
        }
    }
    //This portion retrieves, the first spot in the array from next Tetromino's and makes it the current Tetromino, afterwards, places shifts the array and adds a new random Tetromino
    placeholder = nextTetrominos.shift();
    curTetromino = tetrominos[placeholder];
    curTetrominoColor = tetrominoColors[placeholder];
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    curTetromino = tetrominos[placeholder];
    curTetrominoVal = placeholder;
    //+1 to avoid null in 0 index of tetrominoColors when creating tetromino and selecting color 
    curTetrominoColor = tetrominoColors[placeholder];
    //identifies a unique color for each shape
    // nextTetrominos.push(placeholder);
    nextTetrominos.push(randomTetromino);

    // attempt to push the newly spawned tetromino if needed
    PushTetrominoUp();
    
    //Below function is called here to make sure each time a new Tetromino is created, preview panel is also updated
    previewNext();   
    
}

function previewNext(){
    //This loops allows us to clear the previous display of previewed tetromino's and prepares us to update it with new tetromino's
    for(let row = 0; row<10; row++){
        for(let col = 0; col<4; col++){
            let x = prevCoordArray[col][row].x;
            let y = prevCoordArray[col][row].y;
            ctx.fillStyle = 'grey';
            ctx.fillRect(x, y, 21 ,21)
        }
    }
    //Placeholder identifies which tetromino we should be working with by retrieving the value from the nextTetromino's
    //prevY is to identify where to place the placeholder tetromino
    //coorX and coorY is to get the coordinates for those said tetromino's
    let nextTetromino;
    let nextTetrominoColor;
    let placeholder;
    let prevY = 0;
    let coorX = 0;
    let coorY = 0;
    //This has to go on a nested loop, because we're trying to use the same logic of draw tetromino for each tetromino within the nextTetromino array
    //The first loop loops through each tetromino
    for(let i = 0; i<5; i++){
        let x = 0, y = 0;
        placeholder = nextTetrominos[i];
        nextTetromino = tetrominos[placeholder];
        nextTetrominoColor = tetrominoColors[placeholder];

        //This portion of the code follows the same logic as Draw Tetromino
        //It first retrieves the row and coloumns that have a 1 for the placeholder tetromino
        //the Y value is incremented by +2 array coordinate array spots to identify where it will be placed within the "preview next" panel
        for(let j = 0; j < nextTetromino.length; j++){
            x = nextTetromino[j][0];
            y = nextTetromino[j][1] + prevY;
            
            coorX = prevCoordArray[x][y].x;
            coorY = prevCoordArray[x][y].y;
            

            ctx.fillStyle = nextTetrominoColor;
            ctx.fillRect(coorX, coorY, 21, 21);
        }

       prevY+=2;
    }
}

// Shows the pause screen and plays the pause animation
function Pause() {
    pauseMessages = ['never gonna give you up...','sometimes u just need to give up.','try harder this time.','ur doing ok...','maybe if u stop pausing u\'ll do better.','try not to give up.','maybe you can do it this time.','take a break now. suffer later :)', 'cry.','go do ur homework.','stop procrastinating.','i\'ll wait','ur doing great sweetie','ur doing fine.','&#128580;','&#129485;&#8205;&#9794;&#65039;','&#128579;','&#129300;','&#128134;'];
    
    message = pauseMessages[Math.floor(Math.random() * pauseMessages.length)];
    document.getElementById("pause_message").innerHTML = message;
    console.log("pause message: " + message);

    console.log("game paused");
    document.getElementById("pause_overlay").style.display = "block";
    pause = true;

    clearInterval(pulseID);
    PulseAnimation(document.getElementById("pause_message"))
}

function Unpause() {
    console.log("game unpaused");
    document.getElementById("pause_overlay").style.display = "none";
    pause = false;
    clearInterval(pulseID);
    update();
}


/**
 * The conditions for losing are that a newly spawned block is overlapping an already frozen block and there isn't room for it to be pushed vertically.
 * 
 * this function should be called when the conditions for losing are met after attempting to push the tetromino up
 */
 function GameOver() {
    
    if (pause) { // it is possible to pause the game at the same time as the game ends, in this case the game should immediately unpause and the game over animation should continue
        Unpause();
    }
    
    gameOver = true;
    gameOverComplete = false; // implies the game over animation is still ongoing
    console.log("GAME OVER");

    // game over animation
    let y = 0;
    let finalDelay = 6; // this variable makes the final overlay take a bit of extra time to show up after the animation
    let gameOverAnimation = setInterval(GameOverAnimation, 50);
    function GameOverAnimation() {
        if (y >= gArrayHeight) {
            if (finalDelay > 0) {
                finalDelay--;
            } else {
                clearInterval(gameOverAnimation);
                // display the overlay over the game
                document.getElementById("game_over-lay").style.display = "block";

                // Determine the message that will show on the game over screen
                let winMessageArray = ['wow ur not incompetent!', 'could be better', 'meh', 'not the worst i\'ve seen', 'i\'ve seen better.', 'u did okay today.', 'about average.'];
                let loseMessageArray = ['hah loser.', 'F.', 'noob.', 'u suck.', 'git gud.', 'nerd.', 'idiot.', 'just play better.', 'my cat could do better.', 'cry.', 'lol bad.', 'eat s**t.', 'ur iq is -50', 'ur a gold mine of stupidity.', 'u have a few screws loose.']; // eat salt
                let message = '';
                // if score > SOME_VALUE => win
                let win = false; // THIS IS FOR TESTING PURPOSES ONLY
                if (win) {
                    message = winMessageArray[Math.floor(Math.random() * winMessageArray.length)];
                } else {
                    message = loseMessageArray[Math.floor(Math.random() * loseMessageArray.length)];
                }
                
                document.getElementById("game_over_message").innerHTML = message;
                document.getElementById("exit").innerHTML = 'Rage Quit';
                document.getElementById("try_again").innerHTML = 'Pointlessly Try Again';

                gameOverComplete = true;
                
                clearInterval(pulseID);
                PulseAnimation(document.getElementById("game_over_message")); 
            }
        } else {
            for (let x = 0; x <= gArrayWidth; x++) {
                if (stoppedArray[x][y] > 0) {
                    let coorX = coordinateArray[x][y].x;
                    let coorY = coordinateArray[x][y].y;

                    ctx.fillStyle = 'black';
                    ctx.fillRect(coorX,coorY, 21, 21);
                }
            }
            y++;
        }
    }
}

let pulseID; // this variable allows the animation/interval to be cleared whenever the game is unpaused to ensure the animation doesn't continue or overlap with another animation
function PulseAnimation(messageID) {
    let maxSize = 600;
    let x = 0;
    let rotMax = 2.5;
    let size = maxSize;
    let rotation = 0;
    
    // choose a random starting direction for both the rotation and the size, separate from one another. positive direction => growing/clockwise, negative => shrinking/counterclockwise
    let rotDirection = 1 - (2*Math.floor(Math.random()*2)); // 1 - (0 or 2) produces 1 or -1
    let sizDirection = 1 - (2*Math.floor(Math.random()*2));

    // set the messageID attributes to their starting positions
    messageID.setAttribute('style',"font-size: " + size/5 + "px;\ntransform: rotate(" + rotation + "deg);");

    pulseID = setInterval(Animate, 50);

    function Animate() {
        
        size = sizDirection * (maxSize/30) * Math.sin(x/10)+maxSize;
        rotation = rotDirection * (rotMax) * Math.sin(x/25);
        x++;
        
        messageID.setAttribute('style',"font-size: " + size/5 + "px;\ntransform: rotate(" + rotation + "deg);");
        
    }
}
    

function Restart() {
    console.log("restarting");
    setTimeout(function(){
        window.location.reload();
    });
}

function Exit() {
    location.href='/index.html'; // THIS NEEDS TO BE FIXED
}

// iterates through the entire stoppedArray and redraws all the colors from the updated tetrominoColors
function UpdateColors() {
    
    // update curTetrominoColor to the color corresponding to the number value of the curTetromino 
    for (let i = 0; i < tetrominos.length; i++) {
        if (curTetromino == tetrominos[i]) {
            curTetrominoColor = tetrominoColors[i];
        }
    }
    
    curTetrominoColor = tetrominoColors[curTetrominoVal];
    curHoldColor = tetrominoColors[heldTetrominoVal];
    
    for (let x = 0; x <= gArrayWidth; x++) {
        for (let y = 0; y <= gArrayHeight; y++) {
            if (stoppedArray[x][y] > 0) {
                let coorX = coordinateArray[x][y].x;
                let coorY = coordinateArray[x][y].y;

                ctx.fillStyle = NumberToColor(stoppedArray[x][y]);
                ctx.fillRect(coorX,coorY, 21, 21);
            }
        }
    }
    previewNext();
    DrawHeldTetromino(heldTetrominoVal);
    DeleteTetromino();
    DrawTetromino();
}

function SelectColor() {
    tetrominoColors = ['blue', 'cornflowerblue', 'cyan', 'darkcyan', 'teal', 'aqua', 'navy'];
    
    UpdateColors();
}

/**
 * Attempts to pushes the current tetromino up into the ceiling. If there is no free space to be pushed, the game should end.
 * 
 * @postconditions the current tetromino is pushed into the ceiling if there are blocks in the way so only one layer is showing at the top of the screen. The game ends if this is not possible
 */
 function PushTetrominoUp() {

    // find the lowest y value of the current tetromino. This ensures that only the lowest value is checked for an occupied space and the tetromino isn't pushed up twice
    let lowestY = 0;
    for (let i = 0; i < curTetromino.length; i++) {
        let y = curTetromino[i][1] + initY;
        if (y > lowestY) {
            lowestY = y;
        }
    }
    // lowestY now holds the value of the lowest y value (highest integer value) of the current tetromino



    let canMove = false;
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;

        

        // if the currently iterating 
        if (y == lowestY) { // only check the lowest squares of the tetromino


            // if lowestY is 0, this means that the current tetromino is a flat block. If there are any blocks at the top of the screen in the way of any components, there is overlap, so end the game. 
            if (lowestY == 0) {
                if (stoppedArray[x][y] >= 1) {
                    GameOver();
                    return;
                }
            } else if (stoppedArray[x][y-1] >= 1) { // if the newly spawned tetromino is not flat and collides with a block at the top of the screen when pushed up, the game should end
                console.log("OVERLAP IN SPAWNING TETROMINO");
                GameOver();
                return;
            }

            // if any of the blocks at the bottom of the tetromino overlap with a frozen block, it should attempt to be pushed upward 
            if (stoppedArray[x][y] >= 1) {
                canMove = true;
            }
        }
    }


    // if there was any overlap at the bottom of the tetromino, push it upward. This will never run if the conditions for ending the game have been met
    if (canMove) {
        initY--;
        console.log("Pushing tetromino upwards. New y : " + initY);
    }
}


/**
 * Freeze the current tetromino on the game board and spawn a new one at the top of the board
 * 
 * @postconditions all blocks of the tetromino stop having the ability to move and a new tetromino is spawned
 */
let flag1 = 0;
function FreezeTetromino() {
     
    // append the current tetromino to the stoppedArray
    if(freezeflag==false){
        if(CheckVertical()){
            for (let i = 0; i < curTetromino.length; i++) {
                stoppedArray[ (curTetromino[i][0]+initX) ][ (curTetromino[i][1]+initY) ] = squareColorNumber = tetrominoColors.indexOf(curTetrominoColor)+1;
            }


            // reset initX and initY to the top of the board
            initX = 4;
            initY = 0;
            //set direction to idle so it doesn't move
            direction = DIRECTION.IDLE;

            CheckForCompletedRows();
            
            // choose the next tetromino to attempt to draw on the board
            CreateTetromino();
            // only attempt to draw the tetromino on the board if the game is still going on (!gameOver)
            if (!gameOver && !pause) {
                DrawTetromino();
            }

            //when a piece is frozen, it will indicate that a new piece has been placed,
            //meaning that the user hasn't held it yet.
            recentHold = false;
        }
    freezeflag = true;
    }
}

//function that looks at what value a square in the stopped array has and returns a string with the corresponding color of that square, so that when a completed row is removed, that row can be filled with the color of the square above it  
function NumberToColor(squareColorNumber) {
    if (squareColorNumber >= 1 && squareColorNumber <= 7) {
        return tetrominoColors[squareColorNumber-1];
    } else {
        return 'grey';
    }
}

// checks every row to see if there are any completed/fully filled rows
function CheckForCompletedRows() {
    let completedRows = 0; // count the total number of rows that are completed
    let animationType = Math.floor(4*Math.random()); // this is only used for the ClearRow function, but should be a constant for each time it is called so it is set before the for loop

    for (let y = 0; y < gArrayHeight; y++) {
        let x = 0;
        while(x < gArrayWidth && stoppedArray[x][y] != 0 && stoppedArray[x][y] != undefined) {x++;} // iterate through the entire row, incrementing x and stopping of there are any blank squares 
        // if there were no blank squares, x will be equal to the total width
        if (x == gArrayWidth) {
            completedRows++;
            ClearRow(y, animationType); // clear the row at y with the animation type specified above
        }
    }

    // once all rows that need to be cleared have been cleared, update the score value and on screen
    totalClearedLines += completedRows;
    ScoreGiver(completedRows);
    ScoreKeeper(currScore);
    LevelKeeper();
}

function ScoreGiver(rowsCleared) {
    // The increase in score depends on the number of rows cleared out
    // BASE: one row cleared = 10 points, two rows cleared = 25, three rows cleared = 75, 4 rows cleared = 300
    // LEVEL 10+: one = 20, two = 50, three = 150, four = 600 
    // LEVEL 20+: one = 30, two = 75, three = 225, four = 900
    switch(rowsCleared) {
        case 1:
            currScore += 10 * (Math.floor(currLevel/10)+1); // every 10 levels, the score for each line is multiplied by an increasing factor
            break;
        case 2: 
            currScore += 25 * (Math.floor(currLevel/10)+1);
            break;
        case 3:
            currScore += 75 * (Math.floor(currLevel/10)+1);
            break;
        case 4:
            currScore += 300 * (Math.floor(currLevel/10)+1);
            break;
    }
}


let animations = 0; // the number of animations currently playing
let clearedAnimations = 0; // the number of animations that have been cleared out so far
/**
 * Clears out the row at the specified y position, playing a random animation
 * 
 * @param y - the y position of the row to be cleared out
 * @param animationType - the 'type' of animation for this clear effect - can be any value from 0 (left to right), 1 (right to left), 2 (center out), 3 (outsides in)
 */
function ClearRow(y, animationType) {
    boopSound.play();
    boopSound.playbackRate = 2;
    animations++;
    pause = true;
    let i = 0;
    // there are 4 separate clearAnimation variables because there may be multiple lines being cleared out at once, and these are handles as separate animations, so to avoid overlap there are 4
    let clearAnimation1;
    let clearAnimation2;
    let clearAnimation3;
    let clearAnimation4;
    // determine which animation to play based on the current value of animations. As it increments, the next clearAnimation variable will be used
    switch(animations) {
        case 1:
            clearAnimation1 = setInterval(AnimateClear, 40);
            break;
        case 2:
            clearAnimation2 = setInterval(AnimateClear, 40);
            break;
        case 3:
            clearAnimation3 = setInterval(AnimateClear, 40);
            break;
        case 4:
            clearAnimation4 = setInterval(AnimateClear, 40);
            break;
    }

    // Plays an animation to visualize the tetrominos being cleared out from a full line
    function AnimateClear() {
        // once i = gArrayWidth, all squares have been cleared out because each iteration clears out 1 block
        if (i < gArrayWidth) {
            let x;

            // set the next x position to be cleared based on the animation type and current iteration value
            switch(animationType) {
                case 0: // left to right
                    x = i;
                    break;
                case 1: // right to left
                    x = gArrayWidth-1-i;
                    break;
                case 2: // inside out
                    x = Math.floor(gArrayWidth/2)+Math.floor(i/2); // start from the center offset one unit to the right
                    if (stoppedArray[x][y] == 0) { // if the center to the right block is already cleared out, remove the centermost to the left block
                        x = Math.floor(gArrayWidth/2)-1-Math.floor(i/2); // remove the centermost from the left block.
                    }
                    break;
                case 3: // outside in
                    x = Math.floor(i/2); // start from the left (i/2 because it should clear one to the right every other time)
                    if (stoppedArray[x][y] == 0) { // if the left side block is already removed, remove the right side block
                        x = Math.floor(gArrayWidth)-1-Math.floor(i/2); // remove the next block furthest to the right
                    }
                    break;
            }

            stoppedArray[x][y] = 0;
            let coorX = coordinateArray[x][y].x;
            let coorY = coordinateArray[x][y].y;
            ctx.fillStyle = 'grey';
            ctx.fillRect(coorX, coorY, 21, 21);
            i++;
        } else { // occurs when all blocks have been cleared out in this animation
            pause = false;

            // switch case to clear out the current animation ONLY
            // the clearedAnimations variable holds the number of animations that have been cleared so far, the 0th clearedAnimation will always be clearAnimation1, the 1st always being clearedAnimation2, and so on because of the order the need to be cleared.
            switch(clearedAnimations) {
                case 0:
                    clearInterval(clearAnimation1);
                    break;
                case 1:
                    clearInterval(clearAnimation2);
                    break;
                case 2:
                    clearInterval(clearAnimation3);
                    break;
                case 3:
                    clearInterval(clearAnimation4);
                    break;
            }

            // DropRowsAbove has to be called before DrawTetromino at the end of the animation. Otherwise the ghost piece is drawn before the pieces move down causing it to stay above the actually frozen blocks
            DropRowsAbove(y); // this should be run for every row being cleared
            clearedAnimations++;

            // if the number of animations cleared is equal to the total number of animations needed, all animations have played out, so reset values and resume gameplay
            if (animations == clearedAnimations) {
                clearedAnimations = 0;
                animations = 0;
                DrawTetromino(); // draw the current tetromino because calling the update function will only update it once it has moved down
                update(); // 'unpauses' the game
            }
        }
    }
}

/**
 * Drops all blocks above the specified row by one position vertically
 * 
 * @param y - the y position that specifies the row that all blocks above it should move down from
 * 
 * @example - there are blocks above y=6 and DropRowsAbove(6) is called. all blocks at row 5 (above) shouold be moved to row 6, all blocks at row 4 should be moved to 5, and so on. 
 */
function DropRowsAbove(y) {
    console.log("dropping rows above y=" + y);
    y--;  // start at the row above the one being cleared, since the one being cleared doesn't need to be moved down
    // repeat for every y value from y to 0 inclusive starting at y and moving up (0 is the top of the board)
    for (y; y >= 0; y--) {
        for (let x = 0; x < gArrayWidth; x++) {
            var tetrominoVal = stoppedArray[x][y];
            //targets squares that are not empty
            if(tetrominoVal != 0) {
                
                // set the value of the square below the current iterating y position down 1 and draw it as the color of the square at x,y
                ctx.fillStyle = NumberToColor(tetrominoVal);
                stoppedArray[x][y+1] = tetrominoVal;
                let coorX = coordinateArray[x][y+1].x;
                let coorY = coordinateArray[x][y+1].y;
                ctx.fillRect(coorX, coorY, 21, 21);
    
                // since the old block has been moved down from this position, set it to 0 and fill it in as grey
                stoppedArray[x][y] = 0;
                coorX = coordinateArray[x][y].x;
                coorY = coordinateArray[x][y].y;
                ctx.fillStyle = 'grey';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}



function ScoreKeeper(currScore){
    ctx.fillStyle = 'grey';
    ctx.fillRect(390,13, 60, 28);  
    ctx.fillStyle = 'white';
    ctx.font = '21px Times New Roman';
    ctx.fillText(currScore, 400, 28);         
}


//This function makes the game faster depending on how many lines have been cleared
function Level(totalClearedLines){
    if(totalClearedLines >=0 && totalClearedLines<10){
        levelTimer= 1000;
    }else if(totalClearedLines>= 10 && totalClearedLines<=29){
        levelTimer= 750;
    }else if(totalClearedLines>29 && totalClearedLines<=59){
        levelTimer = 500;
    }else if(totalClearedLines>59 && totalClearedLines <= 99){
        levelTimer = 350;
    }else if(totalClearedLines >99 && totalClearedLines <= 149){
        levelTimer = 250;
    }else if(totalClearedLines >149 && totalClearedLines <= 209){
        levelTimer = 215;
    }else if(totalClearedLines >209 && totalClearedLines <= 279){
        levelTimer = 200;
    }else if(totalClearedLines >279 && totalClearedLines <= 359){
        levelTimer = 190;
    }else if(totalClearedLines >359 && totalClearedLines <= 449){
        levelTimer = 185;
    }else if(totalClearedLines >449 && totalClearedLines <= 549){
        levelTimer=180;
    }else if(totalClearedLines >549 && totalClearedLines <= 659){
        levelTimer=175;
    }else if(totalClearedLines >659 && totalClearedLines <= 779){
        levelTimer=170;
    }else if(totalClearedLines >779 && totalClearedLines <= 909){
        levelTimer=165;
    }else if(totalClearedLines >909 && totalClearedLines <= 1049){
        levelTimer=160;
    }else if(totalClearedLines >1049 && totalClearedLines <= 1199){
        levelTimer=155;
    }
    else{
        levelTimer=1000;
    }
        LevelKeeper();
}


/**
 * Check if the spaces directly below any component of the current tetromino are invalid/occupied spaces
 * 
 * @returns boolean that represents whether there is an obstruction preventing the downward motion of the tetromino by one unit. True means there are obstructions, false means there are no invalid spaces below the current tetromino
 * 
 * @example at least one component of the current tetromino is located at the bottom most space of the game board. This function returns true
 * @example there is a frozen block on the game board directly below at least one of the components of the current tetromino. This function returns true 
 * @example there are no frozen blocks or the below the game board one space below any of the components of the current tetromino. This function returns false
 * 
 */
function CheckVertical() {

    // iterate through each component of the current tetromino to check for collision below. Since the current tetromino has not been pushed to gameBoardArray, any components of the tetromino directly below will not count for collision 
    // example: iterating on the top left component of a square tetromino [0,0] will not consider the component directly below [0,1] in terms of collision since only the gameBoardArray is being compared
    for(let i = 0; i < curTetromino.length; i++) {
        
        // these are the coordinates of the component of the tetromino that should be checked for collision. The relative coordinates of the shape are added to the position of the origin with an extra 1 being added to Y because we are checking for collision below
        let checkX = curTetromino[i][0] + initX;
        let checkY = curTetromino[i][1] + initY + 1;

        // if the current tetromino is at the bottom of the game board, OR the the game board contains a frozen block (value of anything but 0 or undefined) at the location we are checking, the location being checked is invalid/obstructed so true should be returned
        if ( (checkY) >= gArrayHeight || (stoppedArray[checkX][checkY] != 0 && stoppedArray[checkX][checkY] != undefined) ) {
            //console.log("vertical collision")
            return true;
        }
    }
    // if no collision was found below any of the components of the current tetromino, there are no vertical obstructions
    return false;
}


/**
 * Check if the space to the side of any component of the tetromino in a given direction is an invalid/occupied space
 * 
 * @param {*} xMove the value of X coordinates the block is being checked to move. A value of -1 represents a left shift while a value of 1 represents a right shift by one unit
 * 
 * @returns boolean that represents whether there is an obstruction preventing the motion of the tetromino in the given direction
 * 
 * @example at least one component of the current tetronmino is located against the left most wall. This function returns true when called with an argument of -1
 * @example there is a frozen block on the game board directly to the right of at least one of the components of the current tetromino. This function returns true with an argument of 1
 */
function CheckHorizontal(xMove) {
    for(let i = 0; i < curTetromino.length; i++) {
        
        // these are the coordinates of the component of the tetromino that should be checked for collision. The relative coordinates of the shape are added to the position of the origin with xMove being added to X because we are checking for horizontal collision either to the right or left
        let checkX = curTetromino[i][0] + initX + xMove;
        let checkY = curTetromino[i][1] + initY;


        // This is technically redundant because only a 1 or -1 should be passed to this function, but just in cases it needs to be used in a  different way, values of magnitude greater than 1 will not have collision conflicts.
        for (let i = 0; i != xMove; i += xMove/Math.abs(xMove)) {
            // if the location being checked for collision is beyond the right or left borders of the game board, OR the the game board contains a frozen block (value of anything but 0 or undefined) at this location, the location being checked is invalid/obstructed so true should be returned
            if( (checkX < 0) || (checkX >= gArrayWidth) || (stoppedArray[checkX][checkY] != 0 && stoppedArray[checkX][checkY] != undefined) ) {
                console.log("horizontal collision")
                return true;
            }
        }
        
        
    }
    // if no collision was found to any of the components of the current tetromino, there are no horizontal obstructions
    return false;

}

//Preconditions: The player hits a key indictacting they wish to rotate the currentTetromino
//postconditions: The x and y values of the current Tetromino are exchanged to simulate a rotation

function RotateTetromino(){
    let newRotation = new Array();//the function will use this to replace curTetromino
    let tetrominoCopy = curTetromino; //a copy of the currentTetromino. we're using a copy to prevent errors
    let curTetrominoBU;//this will carry the origin Tetramino. We will call this if there is an error

    for(let i = 0; i < tetrominoCopy.length; i++)
    {
       //construction of the backupTetrmino
        curTetrominoBU = [...curTetromino];

       //In order to exchange the x and y values, we will need a x value to use as a reference point. In other words, the 'center' of the tetromino
        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (GetLastSquareX() - y);
        let newY = x;
        newRotation.push([newX, newY]);//the newRotation is now the currentTetromino
    }
    DeleteTetromino();//delete the current Tetromino

    // and Try to draw the new Tetromino rotation
    try{
        curTetromino = newRotation;
        DrawRotatedTetromino(curTetrominoBU);

    }  
    //sometimes drawing the Tetromino may now work, such as an out of bounds. In which case the rotation does not work
    catch (e){ 
        if(e instanceof TypeError) {
            curTetromino = curTetrominoBU;
            DeleteTetromino();
            DrawTetromino();
        }
    }
}

//this function returns the relative x value we are focusing the rotation on.
function GetLastSquareX()
{
    let lastX = 0;
     for(let i = 0; i < curTetromino.length; i++)
    {
        let square = curTetromino[i];
        if (square[0] > lastX)
            lastX = square[0];
    }
    return lastX;
}
function DrawRotatedTetromino(Flippedarray){
    //console.log("Current Tetromino length is = " + curTetromino[0][0]);
   
    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
       //check through the array to see if a collision would happen. If it would happen, the backup array would be used instead.
       //aka nothing happens if a collision would happen
        if(stoppedArray[x][y] > 0||x>9||x<0){
            curTetromino = Flippedarray;
        }

    }
    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        //places a 1 in this spot to identify that there is a rectangle in this exact spot
       
        //Converts the x and y values into coorX and coorY from our coordinateArray to represent them in pixels rather than array spots
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        
        //Canvas context editor
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX,coorY, 21, 21);

    }
}
//moves the tetromino down every second
let lastTime = 0;
let dropCounter=0;
function update(time = 0) {
  
  
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    
    if (dropCounter > ActiveTimer) {
        MoveTetrominoDown();
        ActiveTimer = 1 * levelTimer;
        dropCounter = 0;
       //every time dropcounter counts up to ActiveTimer, whatever is in the if statement happens
    }
    lastTime = time;
    
    
    if (!gameOver && !pause) {
        requestAnimationFrame(update);//this function should go on forever
    }

}
function FreezeTimer(){
    console.log(freezeflag);
    if(freezeflag){
        freezeflag = false;
        setTimeout(FreezeTetromino, 750);
    }
}
update();



//function for holding the tetromino
function HoldTetromino(){
    //Temporary tetromino and corresponding color
    let tempTetromino;
    let tempColor;
    let tempTetrominoVal;
    
    //if there isn't anything being held, hold the current tetromino and color, and generate 
    //a new one
    while(!recentHold){
        DeleteTetromino();
        DeleteTetromino();
        initX = 4;
        initY = 0;
        if(curHold == null){
            curHold = curTetromino;
            curHoldColor = curTetrominoColor;
            heldTetrominoVal = curTetrominoVal; // the value of the held tetromino needs to be saved because a new value will be generated with CreateTetromino()
            CreateTetromino();
        }
        //if there is a held tetromino, swap the current tetromino with the held one, making sure
        //they keep their respective color
        else{
            tempTetromino = curHold;
            curHold = curTetromino;
            curTetromino = tempTetromino;
            tempColor = curHoldColor;
            curHoldColor = curTetrominoColor;
            curTetrominoColor = tempColor;
            
            tempTetrominoVal = curTetrominoVal;
            heldTetrominoVal = curTetrominoVal;
            curTetrominoVal = tempTetrominoVal;
        }
        recentHold = true;
    }
    DrawTetromino();
    DrawHeldTetromino(heldTetrominoVal);
    DrawTetromino();
    
}

//This function draws tetrominos based on whats being held at the moment
function DrawHeldTetromino(heldTetrominoVal) {
   //for pieces with 3 cubes length wise, 259 is left, 272 is middle, 285 is right
    //for pieces with 2 cubes in height, 41 is up, 54 is down
   
    deleteHeldTetromino();
    ctx.fillStyle = tetrominoColors[heldTetrominoVal]; // set the color to the color associated with heldTetrominoVal

    if (heldTetrominoVal == 0) {
        console.log("T");
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 41, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    } else if (heldTetrominoVal == 1) {
        console.log("I");
        ctx.fillRect(253, 47, 12,12);
        ctx.fillRect(266, 47, 12,12);
        ctx.fillRect(279, 47, 12,12);
        ctx.fillRect(292, 47, 12,12);
    } else if (heldTetrominoVal == 2) {
        console.log("J");
        ctx.fillRect(259, 41, 12,12);
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    } else if (heldTetrominoVal == 3) {
        console.log("Square");
        ctx.fillRect(266, 41, 12,12);
        ctx.fillRect(279, 41, 12,12);
        ctx.fillRect(279, 54, 12,12);
        ctx.fillRect(266, 54, 12,12);
    } else if (heldTetrominoVal == 4) {
        console.log("L");
        ctx.fillRect(285, 41, 12,12);
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    } else if (heldTetrominoVal == 5) {
        console.log("S");
        ctx.fillRect(285, 41, 12,12);
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(272, 41, 12,12);
    } else if (heldTetrominoVal == 6) {
        console.log("Z");
        ctx.fillRect(259, 41, 12,12);
        ctx.fillRect(272, 41, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    }
}

//function that keeps track of the current level of the game on the screen
function LevelKeeper(){
    
    if (Math.floor(totalClearedLines/(5*currLevel*(currLevel+1))) >= 1) {
        currLevel++;
        levelup.play();
        levelup.playbackRate = 2;
    }

    console.log("Current Level = " + currLevel)
    console.log("Total Lines Cleared = " + totalClearedLines);
    ctx.fillStyle = 'grey';
    ctx.fillRect(390,73, 40, 28);  
    ctx.fillStyle = 'white';
    ctx.font = '21px Times New Roman';
    ctx.fillText(currLevel, 400, 89);         
}
//This function creates a brand new grey square where the hold box is on the main screen, so that
//it clears that area for the newest held tetromino
function deleteHeldTetromino(){
    ctx.fillStyle = 'grey';
    ctx.fillRect(250, 26, 56, 56);
}

function hardDrop(){
    //Loop through moveTetrominoDown() function, until vertical collision is detected
    while(!CheckVertical()){
        MoveTetrominoDown();
    }
    freezeflag = false;
    FreezeTetromino();
}

