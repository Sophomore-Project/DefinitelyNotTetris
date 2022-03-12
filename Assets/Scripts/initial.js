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
let currScore = 0; //starts the score at 0


//Current Held tetromino and the corresponding tetromino color
let curHold;
let curHoldColor;
let frozenColorString; //variable that holds a color dependent on what value of a stoppedArray square is passed to numberToColor() function


//Coordinate solution for previewed tetrominos
let prevCoordArray = [...Array(10)].map(e => Array(4).fill(0));

//Creates an array to hold the next Tetrominos
let nextTetrominos = [];

//this is our first tetromino, it would be the coordinates on a grid, 1 position over 0 down
//The curTetromino is currently set as a T shape, indicating that there is a value of "1" where a square would be drawn
let curTetromino = [[1,0], [0,1], [1,1], [2,1]]; 

//Stores all the tetromino shape combination
let tetrominos = [];

//added null at index 0 so that a frozen square being added to the stopped array never takes a value 0, accomplished by 
//adding +1 in createTetromino(),the function looks like this --> curTetrominoColor = tetrominoColors [randomTetromino+1];  
let tetrominoColors = [null, 'purple', 'cyan', 'blue', 'yellow', 'orange', 'green' , 'red'];
let curTetrominoColor;

//This is a variable to stop holding being called more than once
let recentHold;
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
    //drawing the score rectangle and lettering
    ctx.strokeRect(315, 70, 151, 50 );
    ctx.fillStyle = 'white';
    ctx.font = '21px Times New Roman';
    ctx.fillText("SCORE:", 315, 88);

    

    //Drawing level rectangle and lettering
    ctx.strokeRect(315, 12, 151, 50 );
    ctx.fillStyle = 'white';
    ctx.font = '21px Times New Roman';
    ctx.fillText("LEVEL:", 315, 28);

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
    //console.log("Current Tetromino length is = " + curTetromino[0][0]);
    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY;
        //Converts the x and y values into coorX and coorY from our coordinateArray to represent them in pixels rather than array spots
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        
        //Canvas context editor
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX,coorY, 21, 21);

    }

    DrawGhost();
}


function DrawGhost() {
    
    let ghostDistance = FindGhost();

    for (let i = 0; i < curTetromino.length ; i++){        
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY + ghostDistance;
        //Converts the x and y values into coorX and coorY from our coordinateArray to represent them in pixels rather than array spots
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        
        ctx.fillStyle = curTetrominoColor;
        ctx.globalAlpha = 0.4; // the ghost tetromino should be mostly transparent
        ctx.fillRect(coorX,coorY, 21, 21);
        ctx.globalAlpha = 1; // set the transparency back to 1 so that the actual tetrominos are solid

    }
    

}

function DeleteGhost() {

    let ghostDistance = FindGhost();

    for(let i = 0; i<curTetromino.length; i++){
        let x = curTetromino[i][0] + initX;
        let y = curTetromino[i][1] + initY + ghostDistance;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = 'grey';
        ctx.fillRect(coorX, coorY, 21, 21);
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
    //KeyCode 37 is for left arrow key
    if(key.keyCode === 37){
        // Attempt to move the tetromino 1 unit to the left
        MoveTetrominoHorizontal(-moveConstant)
    }
    //KeyCode 39 is for right arrow key
    else if(key.keyCode === 39){
        // Attempt to move the tetromino 1 unit to the right
        MoveTetrominoHorizontal(moveConstant);
    }
    //KeyCode 40 is for down arrow key
    else if(key.keyCode == 40){
        //Attempt to move the tetromino down
        if(freezeflag == false){//if the currentTetromino is dragging, pressing the down key will freeze it instantly instead of moving down
            FreezeTetromino()
        }else{
        MoveTetrominoDown();
        }
    }
    
    //KeyCode 38 is for up arrowkey
    else if(key.keyCode == 38){
        console.log(freezeflag);
        if(freezeflag == true){
        RotateTetromino();
        DrawTetromino();
        }
    }
    else if(key.keyCode == 32){
        hardDrop();
    }
    else if(key.keyCode == 16){
        holdTetromino();
        console.log("Shift pressed");
    }
    else if(key.keyCode == 32){
        console.log("spacebar");
    }
}
//This deletes the current location of curTetromino position to prepare for it to be move, to understand, refer to comments for DrawTetromino method
function DeleteTetromino(){
    DeleteGhost();
    
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
    //+1 to avoid null in 0 index of tetrominoColors when creating tetromino and selecting color 
    curTetrominoColor = tetrominoColors[placeholder+1];
    //identifies a unique color for each shape
    // nextTetrominos.push(placeholder);
    nextTetrominos.push(randomTetromino);
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
        nextTetrominoColor = tetrominoColors[placeholder+1];

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

        //console.log(nextTetromino);
       prevY+=2;
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
                stoppedArray[ (curTetromino[i][0]+initX) ][ (curTetromino[i][1]+initY) ] = squareColorNumber = tetrominoColors.indexOf(curTetrominoColor);
            }


        // reset initX and initY to the top of the board
        initX = 4;
        initY = 0;
        //set direction to idle so it doesn't move
        direction = DIRECTION.IDLE;

        // choose a new tetromino and draw it on the board
        CreateTetromino();
        DrawTetromino();

        //when a piece is frozen, it will indicate that a new piece has been placed,
        //meaning that the user hasn't held it yet.
        recentHold = false;
        }
    freezeflag = true;
    }
    CheckForCompletedRows();
}
//function that looks at what value a square in the stopped array has and returns a string with the corresponding color of that square, so that when a completed row is removed, that row can be filled with the color of the square above it  
function numberToColor(squareColorNumber){
    if (squareColorNumber == 1){
        frozenColorString = 'purple';
    }else if(squareColorNumber == 2){
        frozenColorString = 'cyan';
    }else if(squareColorNumber == 3){
        frozenColorString = 'blue';
    }else if(squareColorNumber == 4){
        frozenColorString = 'yellow';
    }else if(squareColorNumber == 5){
        frozenColorString = 'orange';
    }else if(squareColorNumber == 6){
        frozenColorString = 'green';
    }else if(squareColorNumber == 7){
        frozenColorString = 'red';
    }else {
        frozenColorString = 'grey';
    }
console.log(frozenColorString);
}
//function that checks if rows are completed 
function CheckForCompletedRows(){
    let rowsToDelete = 0;
    let startOfDeletion = 0;
    //starting at y=0, the top of the canvas, going until the bottom of the canvas is reached 
    for(let y = 0; y < gArrayHeight; y++){
        let completed = true;
        //starting at the left most column, going until the right edge of the canvas is reached
        for(let x = 0; x < gArrayWidth; x++){
            //assigns the number value (pertaining to color) of the current square in the stoppedArray that is being looked at to variable square
            let square = stoppedArray[x][y];
            //if a single square in a row is empty, i.e. it has a value of 0, the row cannot be complete, so break out of that row and move down to the next one 
            if(square === 0 || (typeof square === 'undefined')){
                completed = false;
                
                break;
            }
        }
        //gets here if every square in a row has a value other than 0, meaning it is not empty
        if (completed){
            //starting from top going down, startOfDeletion is the first completed row that has to be deleted
            if(startOfDeletion === 0) startOfDeletion = y;
            //increments rowsToDelete for each row that is completed 
            rowsToDelete++;
            currScore++;
            for(let i = 0; i < gArrayWidth; i++){
                //sets all stoppedArray values in this completed row back to zero
                stoppedArray[i][y] = 0;
                //makes the row disappear 
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;
                ctx.fillStyle = 'grey';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
//if there is at least 1 completed row, increments score and calls MoveAllRowsDown function 
//increments score (this will have to be adjusted- you shouldn't only get 10 points for clearing 5 lines, for example)
    if (rowsToDelete > 0){
    // score += 10;
    // ctx.fillStyle = 'grey';
    // ctx.fillRect(310, 109, 140, 19);
    // ctx.fillStyle = 'black';
    // ctx.fillText(score.toString(), 310, 127);
    scoreKeeper(currScore);
    MoveAllRowsDown(rowsToDelete, startOfDeletion);

    }
}
//function that moves the rows down, replacing the squares in the rows that where just completed and deleted, with the squares that are above those lines
function MoveAllRowsDown(rowsToDelete, startOfDeletion){
    //loops that get the stoppedArray values (pertaining to color) of the squares of the incomplete rows starting at the row just above the top most completed row,the leftmost square, and looping until the top of the canvas is reached
    for(var i = startOfDeletion-1; i >= 0; i--){
        for(var x = 0; x < gArrayWidth; x++){
            //y2 is the row that the incomplete row will be 'moved to' when the completed rows are removed
            var y2 = i + rowsToDelete;
            //assigns the stoppedArray value (pertaining to color) of the incomplete row's squares to variable square, so they can be recreated on the lines that were just completed and removed 
            var square = stoppedArray[x][i];
            //targets the squares of the newly completed and cleared rows so that they can be filled with the above incomplete square's colors
            var squareColorNumber = stoppedArray[x][y2];
            //targets squares that are not emptpy
            if(square != 0){
                //assigns the number value, relating to color, of the square that is to be copied to the square that is being pasted to 
                squareColorNumber = square;
                //passes the value of squareColorNumber to numberToColor function which returns the corresponding color to that value (the color of the square that is being 'moved down')
                numberToColor(squareColorNumber);
                //appends the numberical value of the above square to its new location in the stoppedArray
                stoppedArray[x][y2] = square;
                //fills the newly completed and emptied rows with the color of the above incomplete rows, simulting moving those rows down
                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;
                ctx.fillStyle = frozenColorString;
                ctx.fillRect(coorX, coorY, 21, 21);
                //erases the the original location of the rows that were just moved down, both visually, and in the stoppedArray
                square = 0;
                stoppedArray[x][i] = 0;
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                ctx.fillStyle = 'grey';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}


function scoreKeeper(currScore){
           
    ctx.fillStyle = 'white';
    ctx.font = '21px Times New Roman';
    ctx.fillText(currScore, 400, 28);    
           
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
        CheckForCompletedRows();
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
       
        gameBoardArray[x][y] = 1;
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
    
    
    requestAnimationFrame(update);//this function should go on forever

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
function holdTetromino(){
    //Temporary tetromino and corresponding color
    let tempTetromino;
    let tempColor;
    
    

    //if there isn't anything being held, hold the current tetromino and color, and generate 
    //a new one
    while(!recentHold){
        DeleteTetromino();
        DeleteTetromino();
        if(curHold == null){
            curHold = curTetromino;
            curHoldColor = curTetrominoColor;
            DeleteTetromino();
            initX = 4;
            initY = 0;
            CreateTetromino();
            
            DrawTetromino();
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
            DeleteTetromino();
            initX = 4;
            initY = 0;
            DrawTetromino();
        }
        recentHold = true;
    }
    DrawHeldTetromino(curHoldColor);
    
}

//This function draws tetrominos based on whats being held at the moment
function DrawHeldTetromino(heldColor){
    //for pieces with 3 cubes length wise, 259 is left, 272 is middle, 285 is right
    //for pieces with 2 cubes in height, 41 is up, 54 is down
    
    let tempFuncColor = heldColor;
    //If the held color is blue, it draws the J tetromino, which is also blue
    if(heldColor == "blue"){
        //clears the box before drawing the J tetromino
        deleteHeldTetromino();
        ctx.fillStyle = tempFuncColor;
        ctx.fillRect(259, 41, 12,12);
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    }
    //If the held color is orange, draws the L tetromino, which is the orange one
    else if(heldColor == "orange"){
        deleteHeldTetromino();
        ctx.fillStyle = tempFuncColor;
        ctx.fillRect(285, 41, 12,12);
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    }
    //If the held color is green, draws the S tetromino, which is the green one
    else if(heldColor == "green"){
        deleteHeldTetromino();
        ctx.fillStyle = tempFuncColor;
        ctx.fillRect(285, 41, 12,12);
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(272, 41, 12,12);
    }
    //if the held color is red, draws the Z tetromino, which is the red one
    else if(heldColor == "red"){
        deleteHeldTetromino();
        ctx.fillStyle = tempFuncColor;
        ctx.fillRect(259, 41, 12,12);
        ctx.fillRect(272, 41, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    }
    //IF the held color is cyan, it draws the I piece, which is the cyan one
    else if(heldColor == "cyan"){
        deleteHeldTetromino();
        ctx.fillStyle = tempFuncColor;
        ctx.fillRect(253, 47, 12,12);
        ctx.fillRect(266, 47, 12,12);
        ctx.fillRect(279, 47, 12,12);
        ctx.fillRect(292, 47, 12,12);
    }
    //if the held color is yellow, it draws the Square piece, which is the yellow one
    else if(heldColor == "yellow"){
        deleteHeldTetromino();
        ctx.fillStyle = tempFuncColor;
        ctx.fillRect(266, 41, 12,12);
        ctx.fillRect(279, 41, 12,12);
        ctx.fillRect(279, 54, 12,12);
        ctx.fillRect(266, 54, 12,12);
    }
    //If the held color is purple, it draws the T piece, which is the purple one
    else if(heldColor == "purple"){
        deleteHeldTetromino();
        ctx.fillStyle = tempFuncColor;
        ctx.fillRect(259, 54, 12,12);
        ctx.fillRect(272, 41, 12,12);
        ctx.fillRect(272, 54, 12,12);
        ctx.fillRect(285, 54, 12,12);
    }

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