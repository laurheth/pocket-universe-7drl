var RoomGen = {
    //colors:['#f00','#ff0','#0f0','#0ff','#00f','#f0f'],
    roomOpts:['rectRoom','roundRoom','tRoom','caveRoom','hallRoom'],
    biomeOpts:function(biome) {
        var opts={};
        opts.tags=['temperate'];
        switch (biome) {
            default:
            case 'Dungeon':
                opts.wallColor='#ddd';
                opts.floorColor='#999';
                opts.roomOpts=['rectRoom','tRoom','hallRoom','roundRoom'];
                opts.features={
                    lake:0.1,
                    river: 0,
                    entitycluster: 0,
                    forcluster:[],
                    liquid: 0,
                };
                opts.monsters={
                    Goblin:10,
                    Dragon:1,
                    Gargoyle:2,
                    BronzeGolem:3,
                    Snail:6,
                };
                opts.doodads={
                    Statue:2,
                    Candelabra:2,
                };
                //opts.floorChars=['.'];
                break;
            case 'Cold':
                opts.wallColor='#ccf';
                opts.floorColor='#bbf';
                opts.roomOpts=this.roomOpts;
                opts.tags=['cold'];
                opts.features={
                    lake:0.5,
                    river: 0.3,
                    entitycluster: 0.4,
                    forcluster:['Ice'],
                    liquid: 0,
                };
                opts.monsters={
                    FrostDemon:2,
                    Penguin:10,
                    Moose:2,
                    PolarBear:1,
                };
                //opts.floorChars=['.'];
                break;
            case 'Cave':
                opts.wallColor='#c63';
                opts.floorColor='#b52';
                opts.roomOpts=['caveRoom','roundRoom'];
                opts.features={
                    lake:0.5,
                    river: 0.3,
                    entitycluster: 0,
                    forcluster:[],
                    liquid: 0,
                };
                opts.monsters={
                    Goblin:10,
                    Dragon:1,
                    Snail:6,
                };
                //opts.floorChars=['.',];
                break;
            case 'Hot':
                opts.wallColor='#f31';
                opts.floorColor='#e20';
                opts.roomOpts=this.roomOpts;
                opts.tags=['hot'];
                opts.features={
                    lake:0.3,
                    river: 0.1,
                    entitycluster: 0,
                    forcluster:[],
                    liquid: 1,
                };
                opts.monsters={
                    Dragon:1,
                    FlameDemon:3,
                    Volcano:1,
                };
                //opts.floorChars=['.'];
                break;
            case 'Jungle':
                opts.wallColor='#0f0';
                opts.floorColor='#0e0';
                opts.roomOpts=['caveRoom','roundRoom'];
                opts.features={
                    lake:0.1,
                    river: 0.2,
                    entitycluster: 0.5,
                    forcluster:['Creeping Vine'],
                    liquid: 0,
                };
                opts.monsters={
                    Snake:10,
                    Snail:10,
                };
                opts.doodads={
                    "Creeping Vine":10,
                };
                break;
            case 'Swamp':
                opts.wallColor='#0c3';
                opts.floorColor='#0b2';
                opts.roomOpts=['caveRoom','roundRoom'];
                opts.features={
                    lake:0.8,
                    river: 0.1,
                    entitycluster: 0.5,
                    forcluster:['Reed'],
                    liquid: 0,
                };
                opts.monsters={
                    Snake:10,
                    Snail:10,
                    Fountain:1,
                };
                opts.doodads={
                    Reed:10,
                    "Creeping Vine":1,
                };
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
        var roomBounds=[0,0,0,0];
        //console.log(opts);
        //var roomOpts = ['rectRoom','roundRoom','tRoom','caveRoom','hallRoom'];
        let thisRoom = ROT.RNG.getItem(opts.roomOpts);
        console.log(roomBounds);
        newWalls=this[thisRoom](k,roomSize,opts,roomBounds);
        console.log(roomBounds);
        console.log(thisRoom+' '+roomSize+' '+k);
        this.wallDirections(newWalls);
        Game.roomNames.push("Room #"+k);
        Game.roomTags[k]=opts.tags;

        // Features
        if ('features' in opts) {

            if ('lake' in opts.features && opts.features.lake > ROT.RNG.getUniform()) {
                this.addLake(k, roomBounds, opts.features.liquid);

            }
            else if ('river' in opts.features && opts.features.river > ROT.RNG.getUniform()) {
                this.addRiver(k, roomBounds, opts.features.liquid);
            }

            while ('entitycluster' in opts.features && opts.features.entitycluster > ROT.RNG.getUniform() && opts.features.forcluster.length>0) {
                this.addEntityCluster(k,roomBounds,ROT.RNG.getItem(opts.features.forcluster));
            }
        }

        // Place entities and stuff!
        this.placeEntities(k,opts.monsters,roomBounds,0.004);
        if ('doodads' in opts) {
            this.placeEntities(k,opts.doodads,roomBounds,0.05);
        }
    },

    placeEntities:function(k,list,roomBounds,chance) {
        for (let i=roomBounds[0];i<roomBounds[2];i++) {
            for (let j=roomBounds[1];j<roomBounds[3];j++) {
                let testKey = i+','+j+','+k;
                if (testKey in Game.map && Game.map[testKey].passThrough() && Game.map[testKey].water<Game.minWater) {
                    if (chance>ROT.RNG.getUniform()) {
                        let entityName = ROT.RNG.getWeightedValue(list);
                        Game.addEntity(entityName,i,j,k);
                    }
                }
            }
        }
    },

    rectRoom:function(k,roomSize,opts,roomBounds) {
        roomBounds[0]=0; roomBounds[1]=0; roomBounds[2]=roomSize[0]; roomBounds[3]=roomSize[1];
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

    tRoom:function(k,roomSize,opts,roomBounds) {
        roomBounds[0]=0; roomBounds[1]=0; roomBounds[2]=roomSize[0]; roomBounds[3]=roomSize[1];
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

    caveRoom: function(k,roomSize,opts,roomBounds) {
        var targFree=Game.freeCells.length + roomSize[0] * roomSize[1];
        var x=0;
        var y=0;
        var breaker=0;
        var thickness = Math.floor(ROT.RNG.getUniform()*3)+3;
        var newWalls=[];
        while (Game.freeCells.length < targFree && breaker<100) {
            breaker++;
            this.carveHall(x,y,k,thickness,opts,newWalls);
            if (x-1 < roomBounds[0]) {roomBounds[0]=x-1;}
            if (y-1 < roomBounds[1]) {roomBounds[1]=y-1;}
            if (x+thickness/2+1 > roomBounds[2]) {roomBounds[2]=x+thickness/2+1;}
            if (y+thickness/2+1 > roomBounds[3]) {roomBounds[3]=y+thickness/2+1;}
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

    hallRoom: function(k,roomSize,opts,roomBounds) {
        //roomBounds=[0,0,roomSize[0],roomSize[1]];
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
            if (x-1 < roomBounds[0]) {roomBounds[0]=x-1;}
            if (y-1 < roomBounds[1]) {roomBounds[1]=y-1;}
            if (x+thickness/2+1 > roomBounds[2]) {roomBounds[2]=x+thickness/2+1;}
            if (y+thickness/2+1 > roomBounds[3]) {roomBounds[3]=y+thickness/2+1;}
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
        //roomBounds=[0,0,roomSize[0],roomSize[1]];
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

    roundRoom:function(k,roomSize,opts,roomBounds) {
        roomBounds[0]=0; roomBounds[1]=0; roomBounds[2]=roomSize[0]; roomBounds[3]=roomSize[1];
        var newWalls=[];
        var radius=[parseInt(roomSize[0]/2),parseInt(roomSize[1]/2)];
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

    addEntityCluster : function(k, roomBounds,entityName,steps=-1) {
        let sx=Math.floor(ROT.RNG.getUniform()*(roomBounds[2]-roomBounds[0])) + roomBounds[0];
        let sy=Math.floor(ROT.RNG.getUniform()*(roomBounds[3]-roomBounds[1])) + roomBounds[1];
        var x = sx;
        var y = sy;
        if (steps<0) {
            steps = Math.floor(ROT.RNG.getUniform()*20)+20;
        }
        while (steps>0) {
            let dir=this.randOrtho();
            x+=dir[0];
            y+=dir[1];
            Game.addEntity(entityName,x,y,k);
            steps--;
            if (x<roomBounds[0] || x>roomBounds[2] || y < roomBounds[1] || y>roomBounds[3]) {
                x=sx;
                y=sy;
            }
        }
    },

    addRiver : function(k,roomBounds,liquidType,width=-1) {
        if (width<0) {width=Math.floor(ROT.RNG.getUniform()*3)+1;}
        var direction;
        var x;
        var y;
        var steps;
        if (ROT.RNG.getUniform()>0.5) {
            direction=[1,0];
            x = roomBounds[0];
            y = (roomBounds[1]+roomBounds[3])/2;
            steps=roomBounds[2]-roomBounds[0];
        }
        else {
            direction=[0,1];
            y = roomBounds[1];
            x = (roomBounds[0]+roomBounds[2])/2;
            steps=roomBounds[3]-roomBounds[1];
        }
        x = Math.floor(x);
        y = Math.floor(y);
        for (let i=-1;i<=steps+5;i++) {
            if (ROT.RNG.getUniform()>0.5) {
                if (ROT.RNG.getUniform()>0.5) {
                    width++;
                }
                else {
                    width--;
                }
                if (width<1) {width=1;}
            }
            if (ROT.RNG.getUniform()>0.5) {
                if (ROT.RNG.getUniform()>0.5) {
                    x+=direction[1];
                    y+=direction[0];
                }
                else {
                    x-=direction[1];
                    y-=direction[0];
                }
            }
            for (let j=-width;j<width;j++) {
                this.makeLiquidTile(x+i*direction[0]+j*direction[1],y+i*direction[1]+j*direction[0],k,liquidType);
            }
        }
    },

    addLake : function(k, roomBounds,liquidType,steps=-1) {
        let sx=Math.floor(ROT.RNG.getUniform()*(roomBounds[2]-roomBounds[0])) + roomBounds[0];
        let sy=Math.floor(ROT.RNG.getUniform()*(roomBounds[3]-roomBounds[1])) + roomBounds[1];
        var x = sx;
        var y = sy;
        if (steps<0) {
            steps = Math.floor(ROT.RNG.getUniform()*40)+40;
        }
        while (steps>0) {
            let dir=this.randOrtho();
            x+=dir[0];
            y+=dir[1];
            this.makeLiquidTile(x,y,k,liquidType);
            steps--;
            if (x<roomBounds[0] || x>roomBounds[2] || y < roomBounds[1] || y>roomBounds[3]) {
                x=sx;
                y=sy;
            }
        }
    },

    // Water features
    makeLiquidTile : function(x,y,z,liquidType) {
        let testKey = x+','+y+','+z;
        if (testKey in Game.map && Game.map[testKey].passThrough()) {
            Game.map[testKey].water=Game.minWater*2;
            Game.map[testKey].nextWater=Game.minWater*2;
            Game.map[testKey].liquidType=liquidType;
            Game.map[testKey].nextLiquidType=liquidType;
            Game.map[testKey].lake=true;
            if (Game.freeCells.indexOf(testKey)>=0) {
                Game.freeCells.splice(Game.freeCells.indexOf(testKey),1); // remove option of spawning here
            }
        }
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
                [2,0,2],
                [-1,0,1],
                [2,0,2]
            ],
            [
                [2,-1,2],
                [0,0,0],
                [2,1,2]
            ],
            [
                [2,0,2],
                [1,0,-1],
                [2,0,2]
            ],
            [
                [2,1,2],
                [0,0,0],
                [2,-1,2]
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
                        thisTile=-1;
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