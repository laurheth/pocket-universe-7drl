var RoomGen = {
    colors:['#f00','#ff0','#0f0','#0ff','#00f','#f0f'],

    generateRoom:function(k,roomSize) {
        //this.rectRoom(k,roomSize);
        var roomOpts = ['rectRoom','roundRoom','tRoom'];
        let thisRoom = ROT.RNG.getItem(roomOpts);
        newWalls=this[thisRoom](k,roomSize);
        this.wallDirections(newWalls);
    },

    rectRoom:function(k,roomSize) {
        var newWalls=[];
        for (let i = 0; i <= roomSize[0]; i++) { //x
            for (let j = 0; j <= roomSize[1]; j++) {//y
                let newKey = i + ',' + j + ',' + k;
                
                if (!i || !j || i==roomSize[0] || j==roomSize[1]) {
                    Game.map[newKey] = new Tile('#',this.colors[k % this.colors.length],false,false,null,-1);//'#';
                    newWalls.push(newKey);
                }
                else {
                    Game.map[newKey] = new Tile('.',this.colors[k % this.colors.length],true,true,null,-1);
                    Game.freeCells.push(newKey);
                }
            }
        }
        return newWalls;
    },

    tRoom:function(k,roomSize) {
        var newWalls=[];
        var midpoints;
        var newKey;
        var width=Math.max(1,parseInt(Math.min(roomSize[0],roomSize[1])/5));
        midpoints=[parseInt(roomSize[1]/2),parseInt(roomSize[0]/2)];
        for (let q=0;q<2;q++) {
            for (let i=0;i<=roomSize[q];i++) {
                for (let j=-width;j<=width;j++) {
                    
                    if (q==0) {
                        newKey = i + ',' + (j+midpoints[q]) + ',' + k;
                    }
                    else {
                        newKey = (j+midpoints[q]) + ',' + i + ',' + k;
                    }
                    if ((!i || Math.abs(j)==width || i==roomSize[q]) && (Math.abs(i-midpoints[q]) > (width-1))) {
                        Game.map[newKey] = new Tile('#',this.colors[k % this.colors.length],false,false,null,-1);
                        newWalls.push(newKey);
                    }
                    else {
                        Game.map[newKey] = new Tile('.',this.colors[k % this.colors.length],true,true,null,-1);
                        Game.freeCells.push(newKey);
                    }
                }
            }
        }
        return newWalls;
    },

    roundRoom:function(k,roomSize) {
        var newWalls=[];
        var radius=[parseInt(roomSize[1]/2),parseInt(roomSize[0]/2)];
        for (let i=-radius[0]-1;i<=radius[0]+1;i++) {
            for (let j=-radius[1]-1;j<=radius[1]+1;j++) {
                let newKey = (i+radius[0]) + ',' + (j+radius[1]) + ',' + k;
                if ((Math.pow((i/parseFloat(radius[0])),2.0) + Math.pow((j/parseFloat(radius[1])),2.0)) > 1 ) {
                    Game.map[newKey] = new Tile('#',this.colors[k % this.colors.length],false,false,null,-1);
                    newWalls.push(newKey);
                }
                else {
                    Game.map[newKey] = new Tile('.',this.colors[k % this.colors.length],true,true,null,-1);
                    Game.freeCells.push(newKey);
                }
            }
        }
        return newWalls;
    },

    wallDirections:function(newWalls) {
        // clean up extraneous walls
        for (let q=0;q<newWalls.length;q++) {
            let parts = newWalls[q].split(',');
            let px = parseInt(parts[0]);
            let py = parseInt(parts[1]);
            let pz = parseInt(parts[2]);
            var neighbours=0;
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    let testkey = (px+i)+','+(py+j)+','+pz;
                    if (!(testkey in Game.map) || !Game.map[testkey].passThrough()) {
                        neighbours++;
                    }
                }
            }
            if (neighbours == 9) {
                delete Game.map[newWalls[q]];
            }
        }
        //console.log(newWalls);
        var orientations = [
            [
                [0,0,2],
                [0,0,1],
                [0,0,2]
            ],
            [
                [0,0,0],
                [0,0,0],
                [2,1,2]
            ],
            [
                [2,0,0],
                [1,0,0],
                [2,0,0]
            ],
            [
                [2,1,2],
                [0,0,0],
                [0,0,0]
            ],
        ];
        for (let q=0;q<newWalls.length;q++) {
            let newKey=newWalls[q];
            if (!newKey in Game.map) {
                continue;
            }
            let parts = newKey.split(',');
            let px = parseInt(parts[0]);
            let py = parseInt(parts[1]);
            let pz = parseInt(parts[2]);
            var newDir=-1;
            var wallCount=0;
            var options=[true,true,true,true];
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    let testKey=(px+i)+','+(py+j)+','+pz;
                    var thisTile;
                    if (!(testKey in Game.map)) {
                        thisTile=0;
                    }
                    else if (Game.map[testKey].passThrough()) {
                        thisTile=1;
                    }
                    else {
                        thisTile=0;
                    }
                    for (let qq=0;qq<4;qq++) {
                        if (orientations[qq][j+1][i+1]==2) {
                            continue;
                        }
                        options[qq] &= (thisTile == orientations[qq][j+1][i+1]);
                    }
                }
            }
            for (let qq=0;qq<4;qq++) {
                if (options[qq]) {
                    newDir=qq;
                }
            }
            if (newDir>=0) {
                Game.walls.push(newKey);
                Game.map[newKey].setDirection(newDir);
                //console.log(newDir + ','+Game.map[newKey].getDirection());
            }
        }
    },
};