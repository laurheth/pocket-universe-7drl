var Game = {
    display: null,
    map: {},
    player: null,
    scheduler: null,
    engine: null,
    fov: null,
    portalFov: null,
    portalFovZ: 0,
    delta: [0,0],
    offset: [39, 13],
    walls: null,
    freeCells: null,
    minWater: 10,

    init: function () {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());
        this._generateMap();

        var lightPasses = function (x, y) {
            //return true;
            var key = x + ',' + y + ',' + Game.player.z;
            if (key in Game.map) {
                return ((Game.map[key].lightPasses()));
            }
            return true;
        }

        var lightPassesPortal = function (x, y) {
            //return true;
            if (!lightPasses(x+Game.delta[0],y+Game.delta[1])) {
                return false;
            }
            var key = x + ',' + y + ',' + Game.portalFovZ;
            if (key in Game.map) {
                return (Game.map[key].lightPasses());
            }
            return true;
        }

        this.fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
        this.portalFov = new ROT.FOV.PreciseShadowcasting(lightPassesPortal);
        this._drawVisible();
        //this.player.draw();

        this.scheduler = new ROT.Scheduler.Simple();
        this.scheduler.add(this.player, true);
        this.scheduler.add(this._addEntity('Plant'),true);
        this.scheduler.add(this._addEntity('Volcano'),true);
        this.scheduler.add(TileManager,true);
        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
    },

    _generateMap: function () {
        this.freeCells = [];
        this.walls = [];
        // create some rooms. Third index is "dimension"
        //var roomSize=[6,6];
        
        var newPortal=null;
        var pC;
        for (let k = 0; k < 6; k++) { // dimension
            let roomSize=[10+k,10+k];
            if (k>0 && this.walls.length>0) {
                let index = Math.floor(ROT.RNG.getUniform() * this.walls.length);
                let key = this.walls.splice(index, 1)[0];
                let parts = key.split(',');
                let px = parseInt(parts[0]);
                let py = parseInt(parts[1]);
                let pz = parseInt(parts[2]);
                pC=[parseInt(roomSize[0]/2) , parseInt(roomSize[1]/2),k , px, py, pz];
            }

            RoomGen.generateRoom(k,roomSize);

            if (k>0 && this.walls.length>0) {
                newPortal = new Connection(pC[0],pC[1],pC[2],pC[3],pC[4],pC[5]);
                this.map[newPortal.getKey(1)].contains=newPortal;
                this.map[newPortal.getKey(0)].contains=newPortal;
                newPortal.correctEntrance(1);
                newPortal.correctEntrance(0);
            }
        }

        if (this.walls.length > 0) {
            for (let k = 0; k < 3; k++) {
                for (let i = 0; i < 2; i++) {
                    let index = Math.floor(ROT.RNG.getUniform() * this.walls.length);
                    let key = this.walls.splice(index, 1)[0];
                    let parts = key.split(',');
                    let px = parseInt(parts[0]);
                    let py = parseInt(parts[1]);
                    let pz = parseInt(parts[2]);
                    pC[3 * i] = px;
                    pC[3 * i + 1] = py;
                    pC[3 * i + 2] = pz;
                    //pC=[parseInt(roomSize[0]/2) , parseInt(roomSize[1]/2),k , px, py, pz];
                }

                newPortal = new Connection(pC[0], pC[1], pC[2], pC[3], pC[4], pC[5]);
                this.map[newPortal.getKey(1)].contains = newPortal;
                this.map[newPortal.getKey(0)].contains = newPortal;
                newPortal.correctEntrance(1);
                newPortal.correctEntrance(0);
            }
        }

        /*var pC=[0,2,0,7,4,1];
        var portal = new Connection(pC[0],pC[1],pC[2],pC[3],pC[4],pC[5]);

        this.map[portal.getKey(0)].contains=portal;
        this.map[portal.getKey(1)].contains=portal;

        pC = [0,4,0,3,0,1];
        var portal2 = new Connection(pC[0],pC[1],pC[2],pC[3],pC[4],pC[5]);

        this.map[portal2.getKey(0)].contains=portal2;
        this.map[portal2.getKey(1)].contains=portal2;

        portal2.correctEntrance(1);*/

        
        let index = Math.floor(ROT.RNG.getUniform() * this.freeCells.length);
        let key = this.freeCells.splice(index, 1)[0];
        let parts = key.split(',');
        let px = parseInt(parts[0]);
        let py = parseInt(parts[1]);
        let pz = parseInt(parts[2]);
        this.player = new Player(px, py, pz);
        this.map[key].entity = this.player;
        

        //this._addEntity();  
    },

    _addEntity: function(name) {
        let index = Math.floor(ROT.RNG.getUniform() * this.freeCells.length);
        let key = this.freeCells.splice(index, 1)[0];
        let parts = key.split(',');
        let px = parseInt(parts[0]);
        let py = parseInt(parts[1]);
        let pz = parseInt(parts[2]);
        return EntityMaker.makeByName(name,px,py,pz);//new Entity(px,py,pz,'g','#0f0','Goblin',true);
    },

    _drawVisible: function() {
        this.__drawVisible(false); // first pass includes portals
        this.__drawVisible(true); // second only the main room, overwriting weirdness
    },

    __drawVisible: function (secondPass) {
        if (!secondPass) {
            Game.display.clear();
        }
        this.fov.compute(this.player.x, this.player.y, 50, function (x, y, r, visibility) {
            let key = x + ',' + y + ',' + Game.player.z;
            if (key in Game.map) {
                if (secondPass==false) {
                    if (Game.map[key].contains != null && Game.map[key].contains instanceof Connection) {
                        Game._drawPortal(Game.map[key].contains);
                    }
                }
                if (Game.map[key].getChar() != ' ') {
                    Game.display.draw(x - Game.player.x + Game.offset[0], y - Game.player.y + Game.offset[1], Game.map[key].getChar(), Game.map[key].getColor());
                }
                //Game.directionalDisplay(Game.display, x - Game.player.x, y - Game.player.y, Game.map[key].getChar(), Game.map[key].getColor(),Game.direction);
            }
        });
    },

    _drawPortal: function(portal,second=false) {
        //portalFovZ
        //console.log("Draw portal called");
        this.delta=portal.getDelta();
        var portalDir;
	if (portal.p2[2] == portal.p1[2]) {
	    if (second) {
		this.portalFovZ = portal.p1[2];
	    }
	    else {
		this.portalFovZ = portal.p2[2];
		for (let i=0;i<this.delta.length;i++) {
                    this.delta[i]=-this.delta[i];
		}
	    }
	}
	else {
            if (portal.p2[2] == this.player.z) {
		this.portalFovZ = portal.p1[2];
            }
            else {
		this.portalFovZ = portal.p2[2];
		for (let i=0;i<this.delta.length;i++) {
                    this.delta[i]=-this.delta[i];
		}
            }
	}
        this.portalFov.compute(this.player.x-this.delta[0],this.player.y-this.delta[1],50, function (x,y,r,visibility) {
            let key = x + ',' + y + ',' + Game.portalFovZ;
            if (key in Game.map) {
                Game.display.draw(x - Game.player.x + Game.offset[0] + Game.delta[0], y - Game.player.y + Game.offset[1]  + Game.delta[1], Game.map[key].getChar(), Game.map[key].getColor());
            }
        });

	if (portal.p2[2] == portal.p1[2] && !second) {
	    this._drawPortal(portal,true);
	}
    },

    noOtherPortals: function(x,y,z) {
        for (let i=-2;i<3;i++) {
            for (let j=-2;j<3;j++) {
                let key=(x+i)+','+(y+j)+','+z;
                if (key in Game.map && Game.map[key].contains!=null) {
                    return false;
                }
            }
        }
        return true;
    },

};

function Player (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    //this.draw();
};

/*Player.prototype.draw = function () {
    Game.display.draw(Game.offset[0], Game.offset[1], "@", "#fff");
};*/

Player.prototype.lightPasses = function() {
    return true;
};

Player.prototype.passThrough = function() {
    return true;
};

Player.prototype.getChar = function() {
    return '@';
};

Player.prototype.getColor = function() {
    return '#fff';
};

Player.prototype.act = function () {
    Game._drawVisible();
    Game.engine.lock();
    window.addEventListener("keydown", this);
};

Player.prototype.handleEvent = function (e) {
    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    let code = e.keyCode;
    if (!(code in keyMap)) {
        return;
    }
    let diff = ROT.DIRS[8][keyMap[code]];

    var newX;
    var newY;
    var newZ;
    var newKey;
    for (let i = 0; i < 2; i++) {
        newX = this.x + diff[0];
        newY = this.y + diff[1];
        newZ = this.z;

    // check if valid
        newKey = newX + ',' + newY + ',' + newZ;
    
        //if (!(newKey in Game.map) || !(Game.map[newKey].passThrough())) {
        if (!(newKey in Game.map) || !(Game.map[newKey].passThrough())) {
            if (newKey in Game.map) {
                if (Game.map[newKey].contains != null) {
                    Game.map[newKey].contains.actOn();
                    Game._drawVisible();
                }
                else if (Game.map[newKey].entity != null) {
                    if ('actOn' in Game.map[newKey].entity) {
                        Game.map[newKey].entity.actOn();
                        Game._drawVisible();
                    }
                }
            }
            if (i == 0 && Game.map[this.x + ',' + this.y + ',' + this.z].contains instanceof Connection) {
                var whichSide;
                if (this.x + ',' + this.y + ',' + this.z == Game.map[this.x + ',' + this.y + ',' + this.z].contains.getKey(0)) {
                    whichSide = 1;
                }
                else {
                    whichSide = 0;
                }
                Game.map[this.x + ',' + this.y + ',' + this.z].entity=null;
                let parts = Game.map[this.x + ',' + this.y + ',' + this.z].contains.getKey(whichSide).split(',');
                this.x = parseInt(parts[0]);
                this.y = parseInt(parts[1]);
                this.z = parseInt(parts[2]);
                continue;
            }
            return;
        }
    }
    if (Game.map[newKey].contains != null && Game.map[newKey].contains instanceof Connection) {
        var whichSide;
        if (newKey == Game.map[newKey].contains.getKey(0)) {
            whichSide=1;
        }
        else {
            whichSide=0;
        }
        let parts=Game.map[newKey].contains.getKey(whichSide).split(',');
        newX=parseInt(parts[0]);
        newY=parseInt(parts[1]);
        newZ=parseInt(parts[2]);
        //console.log("newZ?");
    }
    //Game.display.draw(this.x, this.y, Game.map[this.x + ',' + this.y]);

    Game.map[this.x+','+this.y+','+this.z].entity=null;

    this.x = newX;
    this.y = newY;
    this.z = newZ;

    Game.map[this.x+','+this.y+','+this.z].entity=this;
    //Game._drawVisible();
    //this.draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
};

function Connection(x1,y1,z1,x2,y2,z2, dir1, dir2) {
    this.p1=[x1,y1,z1];
    this.p2=[x2,y2,z2];
    this.open=false;
    // corrects entrance to mesh with entrace 1
    this.correctEntrance = function(which) {
        var desiredDirection;
        //console.log("Correcting?");
        var pother;
        if (!which) {
            pother=this.p2;
            desiredDirection=Game.map[this.getKey(0)].getDirection();
            Game.map[this.getKey(1)].contains=null;
        }
        else {
            pother=this.p1;
            desiredDirection=Game.map[this.getKey(1)].getDirection();
            Game.map[this.getKey(0)].contains=null;
        }
        var acceptAny=false;
        if (desiredDirection==-1) {
            acceptAny=true;
        }
        desiredDirection+=2;
        desiredDirection%=4;
        //console.log(desiredDirection);
        let breaker=0;
        var newKey;
        while (breaker<30) {
            for (let i=-breaker;i<breaker;i++) {
                for (let j=-breaker;j<breaker;j++) {
                    newKey=(pother[0]+i)+','+(pother[1]+j)+','+pother[2];
                    if (newKey in Game.map && (Game.noOtherPortals(pother[0]+i,pother[1]+j,pother[2])) &&(Game.map[newKey].getDirection() == desiredDirection || (acceptAny && Game.map[newKey].getDirection() >= 0))) {
                        pother[0]+=i;
                        pother[1]+=j;
                        break;
                    }
                }
            }
            breaker++;
        }
        if (!which) {
            this.p2=pother;
            Game.map[this.getKey(1)].contains=this;
        }
        else {
            this.p1=pother;
            Game.map[this.getKey(0)].contains=this;
        }
    };

    this.getDelta = function() {
        return [this.p2[0] - this.p1[0], this.p2[1] - this.p1[1]];
    };

    this.getChar=function() {
	if (this.open) {
            return '*';
	}
	else {
	    return "+";
	}
    };

    this.getColor=function() {
	if (this.open) {
            return '#00f';
	}
	else {
	    return '#0ff';
	}
    };

    this.getKey=function(which) {
        if (!which) {
            return this.p1[0]+','+this.p1[1]+','+this.p1[2];
        }
        else {
            return this.p2[0]+','+this.p2[1]+','+this.p2[2];
        }
    };

    this.lightPasses=function() {
        return this.open && (this.p1[2]==Game.portalFovZ || this.p2[2]==Game.portalFovZ);
    };

    this.passThrough=function() {
        return this.open;
    };

    this.actOn=function() {
	    this.open=true;
    };
};

// To update water
var TileManager = {
    //flowRate:5,
    act : function() {
        var tiles = Object.keys(Game.map);
        var flowRate=5;
        for (let i=0;i<tiles.length;i++) {
            if (Game.map[tiles[i]].water>2*Game.minWater) {
                //flowRate = Math.min((Game.map[tiles[i]].water - Game.minWater)/4,Game.minWater);
                let parts=tiles[i].split(',');
                //console.log(parts);
                let x=parseInt(parts[0]);
                let y=parseInt(parts[1]);
                let z=parseInt(parts[2]);
                //var neighbourWater=0;
                for (let j = -1; j < 2; j++) {
                    for (let jj = -1; jj < 2; jj++) {
                        if (j==0 && jj==0) {
                            continue;
                        }
                        /*if (j == jj) {
                            continue;
                        }
                        if (j != 0 && jj != 0) {
                            continue;
                        }*/
                        var testTile = (j + x) + ',' + (jj + y) + ',' + z;
                        //console.log('?'+j+','+jj+' '+testTile+','+y);
                        if (testTile in Game.map && Game.map[testTile].liquidThrough()) {
                            if (Game.map[testTile].contains instanceof Connection) {
                                var whichSide;
                                if (testTile == Game.map[testTile].contains.getKey(0)) {
                                    whichSide = 1;
                                }
                                else {
                                    whichSide = 0;
                                }
                                testTile = Game.map[testTile].contains.getKey(whichSide);
                            }
                            //if ()
                            if (Game.map[testTile].water < Game.map[tiles[i]].water) {
                                flowRate = (Game.map[tiles[i]].water - Game.map[testTile].water)/8;
                                //console.log("add some water");
                                if (Game.map[testTile].liquidType != Game.map[tiles[i]].liquidType) {
                                    if (Game.map[testTile].water > Game.minWater) {
                                        Game.map[tiles[i]].solidify=true;
                                        Game.map[testTile].solidify=true;
                                        //Game.map[testTile].color='#666';
                                        //Game.map[tiles[i]].color='#666';
                                        continue;
                                    }
                                    else {
                                        Game.map[testTile].nextLiquidType = Game.map[tiles[i]].liquidType;
                                    }
                                }
                                else {
                                    Game.map[testTile].nextWater+=flowRate;
                                    Game.map[tiles[i]].nextWater-=flowRate;
                                    if (Game.map[testTile].entity != null && 'hurtByLiquid' in Game.map[testTile].entity) {
                                        Game.map[testTile].entity.hurtByLiquid(Game.map[tiles[i]].liquidType);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (let i=0;i<tiles.length;i++) {
            Game.map[tiles[i]].water=Game.map[tiles[i]].nextWater;
            Game.map[tiles[i]].liquidType=Game.map[tiles[i]].nextLiquidType;
            if (Game.map[tiles[i]].solidify) {
                console.log('solidifying?');
                Game.map[tiles[i]].solidify=false;
                Game.map[tiles[i]].color='#666';
                Game.map[tiles[i]].water=0;
                Game.map[tiles[i]].nextWater=0;
                /*if (Game.map[tiles[i]].entity==null && Game.map[tiles[i]].contains==null) {
                    let key = tiles[i];
                    let parts = key.split(',');
                    let px = parseInt(parts[0]);
                    let py = parseInt(parts[1]);
                    let pz = parseInt(parts[2]);
                    Game.scheduler.add(EntityMaker.makeByName('Obsidian',px,py,pz));
                }*/
            }
        }
    }
};

function Tile(char,color,passable,seethrough,contains,direction,water=0,liquidType=0) {
    this.char=char;
    this.color=color;
    this.passable=passable;
    this.seethrough=seethrough;
    this.contains=contains;
    this.entity=null;
    this.direction=direction;
    this.water=water;
    this.nextWater=water;
    this.liquidType=liquidType; // 0 = water, 1 = lava?
    this.nextLiquidType=liquidType;
    this.solidify=false;
    this.setDirection=function(newDir) {
        //console.log("Setting to")
        this.direction=newDir;
    }
    this.getDirection=function() {
        return this.direction;
    }
    this.lightPasses=function() {
        if (this.entity!=null) {
            if ('lightPasses' in this.entity) {
                return this.entity.lightPasses;
            }
        }
        if (this.contains==null) {
            return this.seethrough;
        }
        else {
            return this.contains.lightPasses();
        }
    }
    this.passThrough=function() {
        if (this.entity != null) {
            return false;
        }
        if (this.contains==null) {
            return this.passable;
        }
        else {
            return this.contains.passThrough();
        }
    }
    this.liquidThrough=function() {
        if (this.entity != null ) {
            if ('hurtByLiquid' in this.entity) {
                return true;
            }
            else {
                return false;
            }
        }
        return this.passThrough();
    }
    this.getChar=function() {
        if (this.entity != null) {
            return this.entity.getChar();
        }
        if (this.contains == null) {
            //if (this.direction >= 0) {
            //    return String(this.direction);
            //}
            if (this.water < Game.minWater) {
                return this.char;
            }
            else {
                if (this.water < 4*Game.minWater) {
                    return '~';//String(Math.min(parseInt(this.water/Game.minWater),9));
                }
                else {
                    return '\u2248';
                }
            }
        }
        else {
            return this.contains.getChar();
        }
    }
    this.getColor=function() {
        if (this.entity != null) {
            return this.entity.getColor();
        }
        if (this.contains == null) {
            if (this.water < Game.minWater) {
                return this.color;
            }
            else {
                if (this.liquidType==0) {
                    return '#00f';
                }
                else if (this.liquidType==1) {
                    return '#fa0';
                }
            }
        }
        else {
            return this.contains.getColor();
        }
    }
};
