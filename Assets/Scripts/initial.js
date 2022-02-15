
    var world = [
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    function drawWorld() {
        document.getElementById('world').innerHTML = "";
        for(var y=0; y<world.length; y++){
            //console.log(world[y]);
            for(var x=0; x<world[y].length; x++){
                //console.log(world[y][x]);
                if(world[y][x] === 0){
                    document.getElementById('world').innerHTML += "<div class = 'empty'></div>"
                } else if(world[y][x] === 1 || world[y][x] === 11){ //11 means that we are freezing it so the block does not fall further
                    document.getElementById('world').innerHTML += "<div class ='squareShape'></div>"
                }
            }
            document.getElementById('world').innerHTML += "<br>"
        } 
    }

    function moveShapesDown(){
        var canMove = true;
        for(var y=0; y<world.length; y++){ 
            for(var x=0; x<world[y].length; x++){
                if(world[y][x] > 0 && world[y][x] < 10){
                    if(y === world.length-1 || world[y+1][x] > 10){ //checking to see if block is at the end of screen
                        canMove = false;
                    }
                }
            }
        }
        if(canMove){
            for(var y=world.length-1; y>=0; y--){  
                for(var x=0; x<world[y].length; x++){
                    if (world[y][x]>0 && world[y][x] <10){
                        world[y+1][x] = world[y][x];
                        world[y][x] = 0;
                    }
                }
            }
        }
    }
    function gameLoop(){
        setTimeout(gameLoop, 1000);
    }
    drawWorld();
    moveShapesDown();
    drawWorld();
fdgsdfgg
$ git stash
