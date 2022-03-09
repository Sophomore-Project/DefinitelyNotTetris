let canvas;
let ctx;
let gArrayHeight = 20; //20 squares going down
let gArrayWidth = 10; //10 blocks going across the game board
let initX = 4; //Tetromino's spawn in the 4th x Array spot
let initY = 0; // And 0'th array spot
let levelTimer = 1000; //the unadjusted time that is used as a reference for ActiveTimer. When the level increases, this should decrease.
let ActiveTimer = levelTimer; //the timer that is used to move the tetromino down. This frequetly changes.
let coordinateArray = [...Array(gArrayHeight)].map(e => Array(gArrayWidth).fill(0)); //this creates a multi dimensional array

//this is our first tetromino, it would be the coordinates on a grid, 1 position over 0 down
//The curTetromino is currently set as a T shape, indicating that there is a value of "1" where a square would be drawn
let curTetromino = [[1,0], [0,1], [1,1], [2,1]]; 

//Stores all the tetromino shape combination
let tetrominos = [];
let tetrominoColors = ['purple', 'cyan', 'blue', ' yellow', 'orange', 'green' , 'red'];
let curTetrominoColor;


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
             //console.log(i + ":" + j + " = " + coordinateArray[i][j].x + ":" + coordinateArray[i][j].y);
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

    document.addEventListener('keydown', HandleKeyPress);

    //Function calls
    CreateTetrominos();
    CreateTetromino();
    CoordArray();
    DrawTetromino();

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
    //console.log("Current Tetromino length is = " + curTetromino[0][0]);
    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        console.log(coordinateArray[x][y]);
        //Converts the x and y values into coorX and coorY from our coordinateArray to represent them in pixels rather than array spots
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        
        //Canvas context editor
        //console.log(curTetrominoColor);
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX,coorY, 21, 21);

    }
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
        FreezeTetromino();
    } else {
        direction = DIRECTION.DOWN;
        chances = 0;
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
    //KeyCode 37 is for left arrow key
    if(key.keyCode === 37){
        console.log("Left key is pressed");
        // Attempt to move the tetromino 1 unit to the left
        MoveTetrominoHorizontal(-moveConstant)
    }
    //KeyCode 39 is for right arrow key
    else if(key.keyCode === 39){
        console.log("Right key is pressed");
        // Attempt to move the tetromino 1 unit to the right
        MoveTetrominoHorizontal(moveConstant);
    }
    //KeyCode 40 is for down arrow key
    else if(key.keyCode == 40){
        //Attempt to move the tetromino down
        MoveTetrominoDown();
    }
    //KeyCode 38 is for up arrowkey
    else if(key.keyCode == 38){
        RotateTetromino();
    }
}
//This deletes the current location of curTetromino position to prepare for it to be move, to understand, refer to comments for DrawTetromino method
function DeleteTetromino(){
    for(let i = 0; i<curTetromino.length; i++){
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = 'grey';
        ctx.fillRect(coorX, coorY, 21, 21);
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
    //Retrieves a random tetromino from the tetrominos array which we initialized within CreateTetrominos method
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    curTetromino = tetrominos[randomTetromino];
    curTetrominoColor = tetrominoColors[randomTetromino];
    //identifies a unique color for each shape
}



/**
 * Freeze the current tetromino on the game board and spawn a new one at the top of the board
 * 
 * @postconditions all blocks of the tetromino stop having the ability to move and a new tetromino is spawned
 */
 function FreezeTetromino() {
    // append the current tetromino to the stoppedArray
    for (let i = 0; i < curTetromino.length; i++) {
        stoppedArray[ (curTetromino[i][0]+initX) ][ (curTetromino[i][1]+initY) ] = 1; // this value will need to change in the future based on color
    }
    
    
    // reset initX and initY to the top of the board
    initX = 4;
    initY = 0;
    //set direction to idle so it doesn't move
    direction = DIRECTION.IDLE;

    // choose a new tetromino and draw it on the board
    CreateTetromino();
    DrawTetromino();
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
            console.log("vertical collision")
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
        if(gameBoardArray[x][y] == 1){
            curTetromino = Flippedarray;
            console.log("collision detected!");
        }

    }
    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        //places a 1 in this spot to identify that there is a rectangle in this exact spot
        gameBoardArray[x][y] = 1;
     //   console.log(coordinateArray[x][y]);
        //Converts the x and y values into coorX and coorY from our coordinateArray to represent them in pixels rather than array spots
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        
        //Canvas context editor
        //console.log(curTetrominoColor);
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
     //  console.log("Drop"+dropCounter);
      // console.log("Active"+ ActiveTimer);
        MoveTetrominoDown();
        ActiveTimer = 1 * levelTimer;
        dropCounter = 0;
       //every time dropcounter counts up to ActiveTimer, whatever is in the if statement happens
        //LastChanceChecker();
               
       
    }
   
    lastTime = time;
    
    
    requestAnimationFrame(update);//this function should go on forever

}
update();
