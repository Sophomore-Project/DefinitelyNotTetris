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