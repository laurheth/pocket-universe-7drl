var Game = {
    display: null,
    map: {},
    player: null,
    engine: null,
    fov: null,
    offset: [39, 13],

    init: function () {
        this.display = new ROT.Display();
        document.body.appendChild(this.display.getContainer());
        this._generateMap();

        var lightPasses = function (x, y) {
            //return true;
            var key = x + ',' + y + ',' + Game.player.z;
            if (key in Game.map) {
                return (Game.map[key].lightPasses());
            }
            return false;
        }

        this.fov = new ROT.FOV.PreciseShadowcasting(lightPasses);
        this._drawVisible();
        this.player.draw();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    _generateMap: function () {
        var freeCells = [];

        // create some rooms. Third index is "dimension"
        //var roomSize=[6,6];
        for (let k = 0; k < 2; k++) { // dimension
            let roomSize=[6+k,6+k];
            for (let i = 0; i <= roomSize[0]; i++) { //x
                for (let j = 0; j <= roomSize[1]; j++) {//y
                    let newKey = i + ',' + j + ',' + k;
                    if (!i || !j || i==roomSize[0] || j==roomSize[1]) {
                        this.map[newKey] = new Tile('#','#fff',false,false,null);//'#';
                    }
                    else {
                        this.map[newKey] = new Tile('.','#fff',true,true,null);
                        freeCells.push(newKey);
                    }
                }
            }
        }

        let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        let key = freeCells.splice(index, 1)[0];
        let parts = key.split(',');
        let px = parseInt(parts[0]);
        let py = parseInt(parts[1]);
        let pz = parseInt(parts[2]);
        this.player = new Player(px, py,pz);
    },

    _drawVisible: function () {
        Game.display.clear();
        this.fov.compute(this.player.x, this.player.y, 100, function (x, y, r, visibility) {
            let key = x + ',' + y + ',' + Game.player.z;
            if (key in Game.map) {
                Game.display.draw(x - Game.player.x + (Game.offset[0]), y - Game.player.y + (Game.offset[1]), Game.map[key].getChar(), Game.map[key].getColor());
            }
        });
    }

};

function Player (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.draw();
};

Player.prototype.draw = function () {
    Game.display.draw(Game.offset[0], Game.offset[1], "@", "#ff0");
};

Player.prototype.act = function () {
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
    let newX = this.x + diff[0];
    let newY = this.y + diff[1];
    let newZ = this.z;

    // check if valid
    let newKey = newX + ',' + newY + ',' + newZ;
    if (!(newKey in Game.map) || !(Game.map[newKey].passThrough())) {
        return;
    }
    //Game.display.draw(this.x, this.y, Game.map[this.x + ',' + this.y]);
    this.x = newX;
    this.y = newY;
    Game._drawVisible();
    this.draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
};

function Connection(x1,y1,z1,x2,y2,z2) {
    this.p1=[x1,y1,z1];
    this.p2=[x2,y2,z2];

    this.getDelta = function(axis) {
        return this.p2[axis] - this.p1[axis];
    };

    this.getChar=function() {
        return '*';
    };

    this.getColor=function() {
        return '#00f';
    };
};

function Tile(char,color,passable,seethrough,contains) {
    this.char=char;
    this.color=color;
    this.passable=passable;
    this.seethrough=seethrough;
    this.contains=contains;
    this.lightPasses=function() {
        return this.seethrough;
    }
    this.passThrough=function() {
        return this.passable;
    }
    this.getChar=function() {
        if (contains == null) {
            return this.char;
        }
        else {
            return contains.getChar();
        }
    }
    this.getColor=function() {
        if (contains == null) {
            return this.color;
        }
        else {
            return contains.getColor();
        }
    }
};
