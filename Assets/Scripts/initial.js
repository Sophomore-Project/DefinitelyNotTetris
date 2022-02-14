let canvas;
let ctx;
let gArrayHeight = 20; //20 squares going down
let gArrayWidth = 10; //10 blocks going across the game board
let initX = 4; //Tetromino's spawn in the 4th x Array spot
let initY = 0; // And 0'th array spot
let coordinateArray = [...Array(gArrayHeight)].map(e => Array(gArrayWidth).fill(0)); //this creates a multi dimensional array
let curTetromino = [[1,0], [0,1], [1,1], [2,1]]; //this is our first tetromino, it would be the coordinates on a grid, 1 position over 0 down

class Coordinates{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

document.addEventListener('DOMContentLoaded', initiateCanvas); //when the DOM Content is Loaded it calls our function set up canvas

function coordArray(){ //creating a coordinate Array
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

function initiateCanvas(){
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

   coordArray();
   //could add DrawTetromino();

}