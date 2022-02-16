let canvas;
let ctx;
let gArrayHeight = 20; //20 squares going down
let gArrayWidth = 10; //10 blocks going across the game board
let initX = 4; //Tetromino's spawn in the 4th x Array spot
let initY = 0; // And 0'th array spot
let coordinateArray = [...Array(gArrayHeight)].map(e => Array(gArrayWidth).fill(0)); //this creates a multi dimensional array

//this is our first tetromino, it would be the coordinates on a grid, 1 position over 0 down
//The curTetromino is currently set as a T shape, indicating that there is a value of "1" where a square would be drawn
let curTetromino = [[1,0], [0,1], [1,1], [2,1]]; 

//Stores all the tetromino shape combination
let tetrominos = [];
let tetrominoColors = ['purple', 'cyan', 'blue', ' yellow', 'orange', 'green' , 'red'];
let curTetrominoColor;

//gameBoardArray stores all the positions of currently places squares
let gameBoardArray = [...Array(gArrayHeight)].map(e => Array(gArrayWidth).fill(0));

//stoppedArray is where all the no longer moving pieces of the game will be stored
let stoppedArray = [...Array(gArrayHeight)].map(e => Array(gArrayWidth).fill(0));

let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
}
let direction;

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
   ctx.fillStyle = 'white';
   ctx.fillRect(0,0, canvas.width, canvas.height);

   //drawing stroke around rectangle
   ctx.strokeStyle = 'black';
   ctx.strokeRect(8, 8, 234, 462);

    document.addEventListener('keydown', HandleKeyPress);

    //Function calls
    CreateTetrominos();
    CreateTetromino();
    CoordArray();
    DrawTetromino();

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
        //places a 1 in this spot to identify that there is a rectangle in this exact spot
        gameBoardArray[x][y] = 1;
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
function MoveTetrominoDown(){
    if(!HitTheBottom()){
        direction = DIRECTION.DOWN;
        DeleteTetromino();
        initY++;
        DrawTetromino();
    }
}
function HandleKeyPress(key){
    //KeyCode 37 is for left arrow key
    if(key.keyCode === 37){
        console.log("Left key is pressed");
        direction = DIRECTION.LEFT;
        DeleteTetromino();
        initX--;
        DrawTetromino();
    }//KeyCode 39 is for right arrow key
    else if(key.keyCode === 39){
        console.log("Right key is pressed");
        direction = DIRECTION.RIGHT;
        DeleteTetromino();
        initX++;
        
        DrawTetromino();
    }//KeyCode 40 is for down arrow key
    else if(key.keyCode == 40){
        //If the tetromino hasn't hit the floow yet, then move down.
        if(!HitTheBottom()){
            MoveTetrominoDown();
        }
    }
    //KeyCode 38 is for up arrowkey
    else if(key.keyCode == 38){
        console.log("Rotation function to be called here");
        RotateTetromino();
    }
}
//This deletes the current location of curTetromino position to prepare for it to be move, to understand, refer to comments for DrawTetromino method
function DeleteTetromino(){
    for(let i = 0; i<curTetromino.length; i++){
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        gameBoardArray[x][y] = 0;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = 'white';
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

//I (Majeed) am tasked with generating tetrominos after they stop and can't go down anymore.
//I plan on simply starting the initial function for the bottom collision, but since that it Claire's
//part, I am only putting what I think would work for tetromino generation.

function HitTheBottom(){
    //initially there would be no collisions
    let collision = false;
    //creating a copy of curTetromino
    //let tetrominoCopy = curTetromino;

    for(let i = 0; i < curTetromino.length; i++){

        let block = curTetromino[i];
        //the x pixel value is x value of the tetromino block + the initial x value
        let x = block[0] + initX;
        //the y pixel value is the y value of the tetromino block array + the initial y value
        let y = block[1] + initY;
        //if it moves down, increment y
        if(direction === DIRECTION.DOWN){
            y++
        }
        //if the type of the stoppedArray is string, indicate we have a collision and cement it
        if(typeof stoppedArray[x][y+1] === 'string'){
            DeleteTetromino();
            initY++;
            DrawTetromino();
            collision = true;
            break;
        }
        //if y >= 20, indicate we have collided with the border
        if(y >= 20){
            collision = true;
            break;
        }
    }
    //if we have collided add the curTetromino to the stoppedArray
    if(collision){
        for(let i = 0; i < curTetromino.length; i++){
            let square = curTetromino[i];
            let x = square[0] + initX;
            let y = square[1] + initY;
            stoppedArray[x][y] = curTetrominoColor;
            
        }

        CreateTetromino();
        //set direction to idle so it doesn't move
        direction = DIRECTION.IDLE;
        initX = 4;
        initY = 0;
        DrawTetromino();
        
    }
    //return collision
    return collision;
}


/**
 * Check if the space to the side of any component of the tetromino in a given direction is an invalid/occupied space
 * 
 * @param {*} xMove the value of X coordinates the block is being checked to move. A value of -1 represents a left shift while a value of 1 represents a right shift
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

        // if the location being checked for collision is beyond the right or left borders of the game board, OR the the game board contains a frozen block (value of anything but 0) at this location, the location being checked is invalid/obstructed so true should be returned
        if( (checkX < 0) || (checkX > gArrayWidth) || (gameBoardArray[checkX][checkY] != 0) ) {
            return true;
        }
    }
    // if no collision was found to any of the components of the current tetromino, there are no horizontal obstructions
    return false;

}

//Preconditions: The player hits a key indictacting they wish to rotate the currentTetromino
//postconditions: The x and y values of the current Tetromino are exchanged to simulate a rotation

function RotateTetromino()
{
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
        DrawTetromino();
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


//moves the tetromino down every second
window.setInterval(function(){
    MoveTetrominoDown();
},1000);
    // if no collision was found to any of the components of the current tetromino, there are no horizontal obstructions
    return false;
}
