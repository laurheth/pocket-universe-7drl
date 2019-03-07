var RoomGen = {
    //colors:['#f00','#ff0','#0f0','#0ff','#00f','#f0f'],

    biomeOpts:function(biome) {
        var opts={};
        switch (biome) {
            default:
            case 'Dungeon':
                opts.wallColor='#ddd';
                opts.floorColor='#999';
                //opts.floorChars=['.'];
                break;
            case 'Cold':
                opts.wallColor='#eef';
                opts.floorColor='#eef';
                //opts.floorChars=['.'];
                break;
            case 'Cave':
                opts.wallColor='#c63';
                opts.floorColor='#b52';
                //opts.floorChars=['.',];
                break;
            case 'Hot':
                opts.wallColor='#f31';
                opts.floorColor='#e20';
                //opts.floorChars=['.'];
                break;
            case 'Jungle':
                opts.wallColor='#0f0';
                opts.floorColor='#0e0';
                break;
            case 'Swamp':
                opts.wallColor='#0c3';
                opts.floorColor='#0b2';
                break;
                //opts.floorChars=['.',','];
        }
        return opts;
    },

    generateRoom:function(k,roomSize) {
        //console.log()
        //this.rectRoom(k,roomSize);
        var biomeList=['Dungeon','Cold','Cave','Hot','Jungle','Swamp'];
        var opts=this.biomeOpts(ROT.RNG.getItem(biomeList));
        //console.log(opts);
        var roomOpts = ['rectRoom','roundRoom','tRoom','caveRoom','hallRoom'];
        let thisRoom = ROT.RNG.getItem(roomOpts);
        newWalls=this[thisRoom](k,roomSize,opts);
        console.log(thisRoom+' '+roomSize+' '+k);
        this.wallDirections(newWalls);
        Game.roomNames.push("Room #"+k);
    },

    rectRoom:function(k,roomSize,opts) {
        var newWalls=[];
        for (let i = 0; i <= roomSize[0]; i++) { //x
            for (let j = 0; j <= roomSize[1]; j++) {//y
                let newKey = i + ',' + j + ',' + k;
                
                if (!i || !j || i==roomSize[0] || j==roomSize[1]) {
                    Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);//'#';
                    newWalls.push(newKey);
                }
                else {
                    Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
                    Game.freeCells.push(newKey);
                }
            }
        }
        return newWalls;
    },

    tRoom:function(k,roomSize,opts) {
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
                    if ((!i || Math.abs(j)==width || i==roomSize[q])) {
                        if (!(newKey in Game.map)) {
                            Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);
                            newWalls.push(newKey);
                        }
                    }
                    else {
                        Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
                        Game.freeCells.push(newKey);
                    }
                }
            }
        }
        return newWalls;
    },

    caveRoom: function(k,roomSize,opts) {
        var targFree=Game.freeCells.length + roomSize[0] * roomSize[1];
        var x=0;
        var y=0;
        var breaker=0;
        var thickness = Math.floor(ROT.RNG.getUniform()*3)+3;
        var newWalls=[];
        while (Game.freeCells.length < targFree && breaker<100) {
            breaker++;
            this.carveHall(x,y,k,thickness,opts,newWalls);
            if (ROT.RNG.getUniform()>0.5) {
                if (ROT.RNG.getUniform()>0.5) {
                    x++;
                }
                else {
                    x--;
                }
            }
            else {
                if (ROT.RNG.getUniform()>0.5) {
                    y++;
                }
                else {
                    y--;
                }
            }
        }
        return newWalls;
    },

    hallRoom: function(k,roomSize,opts) {
        var targFree=Game.freeCells.length + roomSize[0] * roomSize[1];
        var x=0;
        var y=0;
        var breaker=0;
        var thickness = Math.floor(ROT.RNG.getUniform()*2)+3;
        var newWalls=[];
        var dx=0;
        var dy=0;
        var direction=this.randOrtho();
        var twistyness = 0.2 * (ROT.RNG.getUniform());
        while (Game.freeCells.length < targFree && breaker<100) {
            breaker++;
            this.carveHall(x,y,k,thickness,opts,newWalls);
            x+=direction[0];
            y+=direction[1];
            if (ROT.RNG.getUniform()<twistyness) {
                direction=this.randOrtho();
            }
        }
        return newWalls;
    },

    randOrtho: function() {
        if (ROT.RNG.getUniform()>0.5) {
            if (ROT.RNG.getUniform()>0.5) {
                return [1,0];
            }
            else {
                return [-1,0];
            }
        }
        else {
            if (ROT.RNG.getUniform()>0.5) {
                return [0,1];
            }
            else {
                return [0,-1];
            }
        }
    },

    carveHall: function(x,y,z,thickness,opts,newWalls) {
        for (let i=0;i<thickness;i++) {
            for (let j=0;j<thickness;j++) {
                let newKey=(x+i)+','+(y+j)+','+z;
                if (!i || !j || (i+1)==thickness || (j+1)==thickness) {
                    if (!(newKey in Game.map)) {
                        Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);
                        newWalls.push(newKey);
                    }
                }
                else {
                    if (!(newKey in Game.map) || Game.map[newKey].char=='#') {
                        Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
                        Game.freeCells.push(newKey);
                    }
                }
            }
        }
        return newWalls;
    },

    roundRoom:function(k,roomSize,opts) {
        var newWalls=[];
        var radius=[parseInt(roomSize[1]/2),parseInt(roomSize[0]/2)];
        for (let i=-radius[0]-1;i<=radius[0]+1;i++) {
            for (let j=-radius[1]-1;j<=radius[1]+1;j++) {
                let newKey = (i+radius[0]) + ',' + (j+radius[1]) + ',' + k;
                if ((Math.pow((i/parseFloat(radius[0])),2.0) + Math.pow((j/parseFloat(radius[1])),2.0)) > 1 ) {
                    Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);
                    newWalls.push(newKey);
                }
                else {
                    Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
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