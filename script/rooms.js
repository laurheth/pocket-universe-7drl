var RoomGen = {
    colors:['#f00','#ff0','#0f0','#0ff','#00f','#f0f'],
    
    generateRoom:function(k,roomSize) {
        //this.rectRoom(k,roomSize);
        newWalls=this.tRoom(k,roomSize);
        this.wallDirections(newWalls);
    },

    rectRoom:function(k,roomSize) {
        var newDir=-1;
        var wallCount;
        for (let i = 0; i <= roomSize[0]; i++) { //x
            for (let j = 0; j <= roomSize[1]; j++) {//y
                let newKey = i + ',' + j + ',' + k;
                
                if (!i || !j || i==roomSize[0] || j==roomSize[1]) {
                    newDir=-1;
                    wallCount=0;
                    if (!i) {wallCount++; newDir=0;}
                    if (!j) {wallCount++; newDir=1;}
                    if (i==roomSize[0]) {wallCount++; newDir=2;}
                    if (j==roomSize[1]) {wallCount++; newDir=3;}
                    if (wallCount>1) {newDir=-1;}
                    else {
                        Game.walls.push(newKey);
                    }
                    var newChar='#';
                    Game.map[newKey] = new Tile(newChar,this.colors[k % this.colors.length],false,false,null,newDir);//'#';
                }
                else {
                    Game.map[newKey] = new Tile('.',this.colors[k % this.colors.length],true,true,null,-1);
                    Game.freeCells.push(newKey);
                }
            }
        }
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

    wallDirections:function(newWalls) {
        //console.log(newWalls);
        for (let q=0;q<newWalls.length;q++) {
            let newKey=newWalls[q];
            let parts = newKey.split(',');
            let px = parseInt(parts[0]);
            let py = parseInt(parts[1]);
            let pz = parseInt(parts[2]);
            var newDir=-1;
            var wallCount=0;
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    let testKey=(px+i)+','+(py+j)+','+pz;
                    if (i==-1 && j==0 && testKey in Game.map && Game.map[testKey].passThrough()) {
                        newDir=0;
                        wallCount++;
                    }
                    if (i==-1 && j==0 && !(testKey in Game.map)) {
                        newDir=2;
                        wallCount++;
                    }
                    if (j==-1 && i==0 && testKey in Game.map && Game.map[testKey].passThrough()) {
                        newDir=1;
                        wallCount++;
                    }
                    if (j==-1 && i==0 && !(testKey in Game.map)) {
                        newDir=3;
                        wallCount++;
                    }

                    if (i==1 && j==0 && testKey in Game.map && Game.map[testKey].passThrough()) {
                        newDir=2;
                        wallCount++;
                    }
                    if (i==1 && j==0 && !(testKey in Game.map)) {
                        newDir=0;
                        wallCount++;
                    }
                    if (j==1 && i==0 && testKey in Game.map && Game.map[testKey].passThrough()) {
                        newDir=3;
                        wallCount++;
                    }
                    if (j==1 && i==0 && !(testKey in Game.map)) {
                        newDir=1;
                        wallCount++;
                    }
                }
            }
            if (wallCount>2) {
                newDir=-1;
            }
            else {
                Game.walls.push(newKey);
                Game.map[newKey].direction=newDir;
            }
        }
    },
};