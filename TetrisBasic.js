let canvas;
let ctx;
let gArrayHeight = 20; //20 squares going down
let gArrayWidth = 12; //12 blocks going across the game board
let initX = 4; //starts the tetriminoes start 4 blocksaway
let initY = 0;
let coordinateArray = [...Array(gArrayHeight)].map(e => (gArrayWidth).fill(0)); //this creates a multi dimensional array
let curTetromino = [[1,0], [0,1], [1,1], [2,1]]; //this is our first tetromino, it would be the coordinates on a grid, 1 position over 0 down

class Coordinates{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

document.addEventListener('DOMContentLoaded', SetupCanvas); //when the DOM Content is Loaded it calls our function set up canvas

function coordArray(){ //creating a coordinate Array
    let i = 0, j = 0;
//starts off 9 pixels from the top of the screen and it continues this loop until it reaches the end
//which is 446 pixels long, add 23 pixels becasue that is the size of one block
    for(let y = 9; y <= 446; y+=23){
         for(let x = 11; x<= 264; x+=23){
             coordinateArray[i][j] = new Coordinates(x,y);
             i++;
         }
         j++;
         i=0;
    }
}
