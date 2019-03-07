var Game = {
    display: null,
    map: {},
    player: null,
    scheduler: null,
    engine: null,
    fov: null,
    portalFov: null,
    portalFovZ: 0,
    portalFovPortal: null,
    delta: [0,0],
    offset: [39, 13],
    walls: null,
    freeCells: null,
    minWater: 10,
    deepThreshold: 40,
    playerName: null,
    statusList: null,
    dungeonInfo: null,
    messages: null,
    holdPortal: null,
    currentTurn: 0,
    lastMessage: [""],
    roomNames:[],
    roomTags:{},
    portalList:[],
    level: 1,

    init: function () {
        let screen = document.getElementById('screen');
        this.display = new ROT.Display({fontSize:19,fontFamily:'Overpass Mono, monospace'});
        var setsize=this.display.computeSize(screen.clientWidth,screen.clientHeight);
        //console.log(screen.clientWidth+','+screen.clientHeight);
        this.display.setOptions({width: setsize[0],height: setsize[1]});
        this.offset[0] = parseInt(setsize[0]/2);
        this.offset[1] = parseInt(setsize[1]/2);
        //console.log(fontsize);
        screen.appendChild(this.display.getContainer());
        this.playerName = document.getElementById('playerName');
        this.statusList = document.getElementById('statusList');
        this.dungeonInfo = document.getElementById('dungeonInfo');
        this.messages = document.getElementById('messages');
        this.holdPortal = document.getElementById('holdPortal');
        //this.holdPortal.innerHTML = 'Holding portal to: dungeon of despair';
        this._generateMap();

        var lightPasses = function (x, y, def=false) {
            //return true;
            var key = x + ',' + y + ',' + Game.player.z;
            if (key in Game.map) {
                return ((Game.map[key].lightPasses()));
            }
            return def;
        }

        var lightPassesPortal = function (x, y) {
            //return true;
            if (!lightPasses(x+Game.delta[0],y+Game.delta[1],true)) {
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
        //this._drawVisible();
        //this.player.draw();

        this.scheduler = new ROT.Scheduler.Simple();
        this.scheduler.add(this.player, true);
        //this.scheduler.add(this._addEntity('Plant'),true);
        //this.scheduler.add(this._addEntity('Snail'),true);
        //this.scheduler.add(this._addEntity('Volcano'),true);
        //this.scheduler.add(this._addEntity('Fountain'),true);
        this.scheduler.add(TileManager,true);
        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
    },

    burnColor: function() {
        let colorOpts=['#f00','#fa0','#ff0'];
        return ROT.RNG.getItem(colorOpts);
    },

    _generateMap: function () {
        this.freeCells = [];
        this.walls = [];
        // create some rooms. Third index is "dimension"
        //var roomSize=[6,6];
        
        var newPortal=null;
        var pC;
        var k=0;
        while (this.freeCells.length < 800+(50*this.level) || k<(5+this.level)) { // dimension
            let roomSize=[Math.floor((12+Math.sqrt(this.level))*ROT.RNG.getUniform())+6,Math.floor((12+Math.sqrt(this.level))*ROT.RNG.getUniform())+6];
            if (k>0 && this.walls.length>0) {
                let index = Math.floor(ROT.RNG.getUniform() * this.walls.length);
                let key = this.walls.splice(index, 1)[0];
                let parts = key.split(',');
                let px = parseInt(parts[0]);
                let py = parseInt(parts[1]);
                let pz = parseInt(parts[2]);
                pC=[parseInt(roomSize[0]/2) , parseInt(roomSize[1]/2),k , px, py, pz];
            }

            //console.log(this.freeCells.length);
            RoomGen.generateRoom(k,roomSize);
            //console.log(this.freeCells.length);

            if (k>0 && this.walls.length>0) {
                //console.log(pC);
                newPortal = new Connection(pC[0],pC[1],pC[2],pC[3],pC[4],pC[5]);
                //this.map[newPortal.getKey(1)].contains=newPortal;
                //this.map[newPortal.getKey(0)].contains=newPortal;
                if (!(newPortal.correctEntrance(1))) {
                    newPortal.correctEntrance(1,true);
                }
                if (!(newPortal.correctEntrance(0))) {
                    newPortal.correctEntrance(0,true);
                    newPortal.correctEntrance(1);
                }
            }
            k++;
        }
        var numConnections=Math.max(3,parseInt(k/3));
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
                if (!(newPortal.correctEntrance(1))) {
                    newPortal.correctEntrance(1,true);
                }
                if (!(newPortal.correctEntrance(0))) {
                    newPortal.correctEntrance(0,true);
                    newPortal.correctEntrance(1);
                }
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
        this.portalFovPortal=null;
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
                        if (key == Game.player.getKey() || Game.map[Game.player.getKey()].contains == null || !(Game.map[Game.player.getKey()].contains instanceof Connection)) {
                            Game._drawPortal(Game.map[key].contains);
                        }
                    }
                }
                if (Game.map[key].getChar() != ' ') {
                    Game.display.draw(x - Game.player.x + Game.offset[0], y - Game.player.y + Game.offset[1], Game.map[key].getChar(), Game.map[key].getColor());
                }
                //Game.directionalDisplay(Game.display, x - Game.player.x, y - Game.player.y, Game.map[key].getChar(), Game.map[key].getColor(),Game.direction);
            }
        });
    },

    _drawPortal: function (portal, second = false) {
        //portalFovZ
        //console.log("Draw portal called");
        this.delta = portal.getDelta();
        this.portalFovPortal = portal;
        var portalDir;
        if (portal.p2[2] == portal.p1[2]) {
            if (second) {
                this.portalFovZ = portal.p1[2];
            }
            else {
                this.portalFovZ = portal.p2[2];
                for (let i = 0; i < this.delta.length; i++) {
                    this.delta[i] = -this.delta[i];
                }
            }
        }
        else {
            if (portal.p2[2] == this.player.z) {
                this.portalFovZ = portal.p1[2];
            }
            else {
                this.portalFovZ = portal.p2[2];
                for (let i = 0; i < this.delta.length; i++) {
                    this.delta[i] = -this.delta[i];
                }
            }
        }
        this.portalFov.compute(this.player.x - this.delta[0], this.player.y - this.delta[1], 50, function (x, y, r, visibility) {
            let key = x + ',' + y + ',' + Game.portalFovZ;
            if (key in Game.map) {
                Game.display.draw(x - Game.player.x + Game.offset[0] + Game.delta[0], y - Game.player.y + Game.offset[1] + Game.delta[1], Game.map[key].getChar(), Game.map[key].getColor());
            }
        });

        if (portal.p2[2] == portal.p1[2] && !second) {
            this._drawPortal(portal, true);
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

    sendMessage: function(message,local=false, key='0,0,0',style="",important=false) {
        if (!important && this.lastMessage.indexOf(message)>=0) {
            return;
        }
        if (local) {
            if (!(key in this.map) || Math.abs(this.map[key].lastSeen - this.currentTurn)>2) {
                return;
            }
        }
        let newMessage = document.createElement("P");
        newMessage.className=style;
        newMessage.appendChild(document.createTextNode('> '+message));
        this.messages.appendChild(newMessage);
        this.lastMessage.push(message);
    },

    statusMessage: function(message,status) {
        this.sendMessage(message,false,"",status,true);
    },

};

function Player (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hurtByLiquidType=-1;
    this.alive=true;
    this.burns=true;
    this.status={};//'Burning':10,'Drowning':10,'Freezing':10};
    this.heldPortal=null;
    //this.draw();
};

Player.prototype.seriousThreshold = {
    'Drowning': [5,'Swimming'],
    'Hypothermia': [20,'Cold'],
    'Overheating': [20,'Hot'],
};

Player.prototype.wound = function(dmg) {
    if (dmg == 0) {return;}
    if ('Bleeding' in this.status) {
        this.status.Bleeding -= dmg;
    }
    else {
        this.status.Bleeding = 10-dmg;
    }
    if (this.status.Bleeding<5) {
        Game.statusMessage("You are bleeding heavily!",'Bleeding');
    }
};

Player.prototype.printStatus = function() {
    // clear old statuses
    while (Game.statusList.firstChild) {
        Game.statusList.removeChild(Game.statusList.firstChild);
    }
    // Print new ones
    var stats = Object.keys(this.status);
    for (let i=0;i<stats.length;i++) {
        this.status[stats[i]]--;
        // Succumb to status effect
        if (this.status[stats[i]]<0) {
            this.status={};
            this.status.Dead='10';
            this.alive=false;
            Game.statusMessage("You die...",'Dead');
            this.printStatus();
            return;
        }
    }
    for (let i=0;i<stats.length;i++) {
        var newStatus = document.createElement("LI");
        var message=stats[i];
        if (stats[i] in this.seriousThreshold) {
            if (this.status[stats[i]] > this.seriousThreshold[stats[i]][0]) {
                message=this.seriousThreshold[stats[i]][1];
            }
        }
        
        newStatus.appendChild(document.createTextNode(message));
        
        newStatus.className=stats[i];
        Game.statusList.appendChild(newStatus);
    }
    // held portal
    if (this.heldPortal != null) {
        var portalMsg="Holding portal to: " + this.heldPortal.name(-1);
        Game.holdPortal.innerHTML = portalMsg;
    }
    else {
        Game.holdPortal.innerHTML="";
    }
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
    if (!this.alive) {
        return '#f00';
    }
    else if ('Burning' in this.status) {
        return Game.burnColor();
    }
    return '#fff';
};

Player.prototype.getKey = function() {
    return this.x+','+this.y+','+this.z;
};

Player.prototype.dropPortal = function() {
    if (this.heldPortal == null) {
        Game.sendMessage("No portal to drop. Pick one up first.");
        return false;
    }
    this.heldPortal.drop(this.x,this.y,this.z);
    this.heldPortal.open=true;
    this.heldPortal=null;
    Game.sendMessage("You drop the portal. It attaches itself to the wall and opens!");
    return true;
};

Player.prototype.getPortal = function() {
    var standPortal = Game.map[this.getKey()].contains; // don't grab a portal you're standing on
    if (standPortal != null) {
        Game.sendMessage("Can't get a portal while standing in it.");
        return false;
    }
    var success=false;
    var portalToGet=null;
    for (let i=-1;i<2;i++) {
        for (let j=-1;j<2;j++) {
            let testKey = (this.x+i)+','+(this.y+j)+','+this.z;
            if (testKey in Game.map && Game.map[testKey].contains != null && Game.map[testKey].contains instanceof Connection && Game.map[testKey].contains != standPortal) {
                //Game.map[testKey].contains.open = openClose;
                if (Game.map[testKey].entity != null) {
                    continue;
                }
                portalToGet=Game.map[testKey].contains;
                portalToGet.grabFrom(testKey);
                Game.map[testKey].contains=null;
                success=true;
                break;
            }
        }
        if (success) {
            break;
        }
    }
    if (!success) {
        Game.sendMessage("No valid portal within reach.");
        return success;
    }

    if (this.heldPortal != null) {
        this.dropPortal();
    }
    
    this.heldPortal=portalToGet;
    
    Game.sendMessage("Picked up the portal to "+this.heldPortal.name()+".");
    return success;
};

Player.prototype.openPortal = function(openClose) {
    console.log(openClose);
    var success=false;
    for (let i=-1;i<2;i++) {
        for (let j=-1;j<2;j++) {
            // force orthogonal directions
            if (i!=0 && j!=0) {continue;}
            if (i==0 && j==0) {continue;}
            let testKey=(this.x+i)+','+(this.y+j)+','+this.z;
            if (testKey in Game.map && Game.map[testKey].contains != null && Game.map[testKey].contains instanceof Connection && Game.map[testKey].contains.open != openClose) {
                Game.map[testKey].contains.open = openClose;
                success=true;
            }
        }
    }
    if (success) {
        if (openClose) {
            Game.sendMessage("You open the portal.");
        }
        else {
            Game.sendMessage("You close the portal.");
        }
    }
    return success;
};

Player.prototype.act = function () {
    Game.engine.lock();
    Game.playerName.innerHTML="Lauren";
    Game.dungeonInfo.innerHTML="Dungeon Level "+Game.level+"<br>";//+Game.roomNames[this.z];
    if (this.z>=0 && this.z < Game.roomNames.length) {
        Game.dungeonInfo.innerHTML+=Game.roomNames[this.z];
    }

    // Lava logic
    if (this.getKey() in Game.map && Game.map[this.getKey()].liquidType==1 && Game.map[this.getKey()].water > Game.minWater) {
        //Game.sendMessage("The lava sets you aflame!",false,"",'Burning');
        if (Game.map[this.getKey()].lake) {
            Game.statusMessage("You fall into the deep lava.",'Burning');
            Game.statusMessage("",'Burning');
            this.status.Burning=-1;
        }
        else {
            if ('Burning' in this.status) {
                Game.statusMessage("The lava burns!!",'Burning');
                this.status.Burning-=3;
            }
            else {
                Game.statusMessage("The lava has set you aflame!",'Burning');
                this.status.Burning=10;
            }
        }
    }

    // Cold logic
    if (this.z in Game.roomTags && Game.roomTags[this.z].indexOf('cold')>=0 && !('Burning' in this.status)) {
        if ('Overheating' in this.status) {
            this.status.Overheating += 6;
        }
        if (!('Hypothermia' in this.status)) {
            Game.statusMessage("It is very cold here.",'Hypothermia');
            this.status.Hypothermia = 100;
        }
        else {
            if (this.status.Hypothermia==70) {
                Game.statusMessage("You are starting to shiver.",'Hypothermia');
            }
            else if (this.status.Hypothermia==20) {
                Game.statusMessage("You're finding it hard to think clearly. Find warmth!",'Hypothermia');
            }
            else if (this.status.Hypothermia==5) {
                Game.statusMessage("You are about to lose consciousness and freeze to death!",'Hypothermia');
            }
            else if (this.status.Hypothermia<5) {
                Game.statusMessage("You are freezing to death!!",'Hypothermia');
            }
            else if (Game.map[this.getKey()].water>Game.minWater && Game.map[this.getKey()].liquidType==0) {
                this.status.Hypothermia -= 5;
                Game.statusMessage("This water is freezing!!",'Hypothermia');
            }
        }
    }
    else {
        if ('Hypothermia' in this.status) {
            if (this.status.Hypothermia < 70) {
                this.status.Hypothermia += 6;
            }
            else {
                Game.sendMessage("You feel warm again.");
                delete this.status.Hypothermia;
            }
        }
    }

    // Heat logic
    if (this.z in Game.roomTags && Game.roomTags[this.z].indexOf('hot')>=0) {
        if ('Hypothermia' in this.status) {
            this.status.Hypothermia += 6;
        }
        if (!('Overheating' in this.status)) {
            Game.statusMessage("It is very hot here.",'Overheating');
            this.status.Overheating = 100;
        }
        else {
            if (this.status.Overheating==70) {
                Game.statusMessage("You are sweating heavily.",'Overheating');
            }
            else if (this.status.Overheating==20) {
                Game.statusMessage("You feel nauseous and light headed from the heat!",'Overheating');
            }
            else if (this.status.Overheating==5) {
                Game.statusMessage("You are about to pass out and die of heat stroke!",'Overheating');
            }
            else if (this.status.Overheating<5) {
                Game.statusMessage("You are are dying of heat stroke!!",'Overheating');
            }
        }
    }
    else {
        if ('Overheating' in this.status) {
            if (this.status.Overheating < 70) {
                this.status.Overheating += 6;
            }
            else {
                Game.sendMessage("You feel cool again.");
                delete this.status.Overheating;
            }
        }
    }

    // Water logic
    if (this.getKey() in Game.map && Game.map[this.getKey()].liquidType==0 && Game.map[this.getKey()].water > Game.minWater) {
        if ('Burning' in this.status) {
            delete this.status.Burning;
            Game.sendMessage("The water put out the flames.");
        }
        if ((Game.map[this.getKey()].water > Game.deepThreshold || Game.map[this.getKey()].lake) && Game.map[this.getKey()].liquidType==0) {
            if ('Drowning' in this.status) {
                if (this.status.Drowning-1<=this.seriousThreshold.Drowning[0]) {
                    Game.statusMessage("You are drowning!",'Drowning');
                }
            }
            else {
                Game.statusMessage("The water is above your head.",'Drowning');
                this.status.Drowning=15;
            }
        }
        else {
            if ('Drowning' in this.status) {
                if (this.status.Drowning>=this.seriousThreshold.Drowning[0]) {
                    Game.sendMessage("You can breath again.");
                }
                else {
                    Game.sendMessage("You gasp for breath!");
                }
                delete this.status.Drowning;
            }
        }
    }
    else {
        if ('Drowning' in this.status) {
            if (this.status.Drowning>=this.seriousThreshold.Drowning[0]) {
                Game.sendMessage("You can breath again.");
            }
            else {
                Game.sendMessage("You gasp for breath!");
            }
            delete this.status.Drowning;
        }
    }

    // BLOOD logic
    if ('Bleeding' in this.status) {
        console.log(this.status.Bleeding);
        if (this.status.Bleeding > 10) {
            delete this.status.Bleeding;
        }
        else {
            if (this.status.Bleeding > 5) {
                this.status.Bleeding++;
                if (Math.floor(ROT.RNG.getUniform() * this.status.Bleeding) > 5) {
                    this.status.Bleeding++;
                }
            }
            else {
                if (ROT.RNG.getUniform() < (0.1 * this.status.Bleeding)) {
                    this.status.Bleeding++;
                }
                if (ROT.RNG.getUniform() < (0.1 * this.status.Bleeding)) {
                    this.status.Bleeding++;
                }
            }
            Game.map[this.getKey()].color = '#f00';
        }
    }

    this.printStatus();
    Game._drawVisible();
    //Game.sendMessage("Something happened!");
    Game.lastMessage=[""];
    Game.currentTurn++;
    window.addEventListener("keydown", this);
};

Player.prototype.handleEvent = function (e) {
    if (!this.alive) {
        return;
    }
    var keyMap = {};
    keyMap[38] = 0;
    keyMap[104] = 0;
    keyMap[33] = 1;
    keyMap[105] = 1;
    keyMap[39] = 2;
    keyMap[102] = 2;
    keyMap[34] = 3;
    keyMap[99] = 3;
    keyMap[40] = 4;
    keyMap[98] = 4;
    keyMap[35] = 5;
    keyMap[97] = 5;
    keyMap[37] = 6;
    keyMap[100] = 6;
    keyMap[36] = 7;
    keyMap[103] = 7;

    let code = e.keyCode;
    /*if (!(code in keyMap)) {
        return;
    }*/

    if (!(code in keyMap)) {
        var success = false;
        switch (code) {
            // wait
            case 190:
            case 101:
            case 12:
                success=true;
            break;

            // close portal
            case 67:
                success=this.openPortal(false);
            break;
            // open portal
            case 79:
                success=this.openPortal(true);
            break;

            // Get portal
            case 71:
                success=this.getPortal();
            break;
            // Drop portal
            case 68:
                success=this.dropPortal();
            break;
        }
        if (success) {
            window.removeEventListener("keydown", this);
            Game.engine.unlock();
        }
        return;
    }

    // movement
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
                if (Game.map[newKey].contains != null && 'actOn' in Game.map[newKey].contains) {
                    Game.map[newKey].contains.actOn(diff);
                    Game._drawVisible();
                    window.removeEventListener("keydown", this);
                    Game.engine.unlock();
                    return;
                }
                else if (Game.map[newKey].entity != null) {
                    if ('actOn' in Game.map[newKey].entity && 'actOn' in Game.map[newKey].entity) {
                        Game.map[newKey].entity.actOn(diff);
                        Game._drawVisible();
                        window.removeEventListener("keydown", this);
                        Game.engine.unlock();
                        return;
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
                Game.map[this.x + ',' + this.y + ',' + this.z].entity=this;
                continue;
            }
            return;
        }
    }
    /*if (Game.map[newKey].contains != null && Game.map[newKey].contains instanceof Connection) {
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
    }*/
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
    this.correctEntrance = function(which,acceptAny=false) {
        var desiredDirection;
        //console.log("Correcting?");
        var pother;
        if (!which) {
            pother=this.p2;
            if (this.getKey(0) in Game.map) {
                desiredDirection=Game.map[this.getKey(0)].getDirection();
            }
            else {
                desiredDirection=-1;
            }
            /*if (this.getKey(1) in Game.map && Game.map[this.getKey(1)].contains == this) {
                Game.map[this.getKey(1)].contains=null;
            }*/
        }
        else {
            pother=this.p1;
            if (this.getKey(1) in Game.map) {
                desiredDirection=Game.map[this.getKey(1)].getDirection();
            }
            else {
                desiredDirection=-1;
            }
            /*if (this.getKey(0) in Game.map && Game.map[this.getKey(0)].contains == this) {
                Game.map[this.getKey(0)].contains=null;
            }*/
        }
        if (acceptAny) {
            desiredDirection=-1;
        }
        if (desiredDirection==-1) {
            acceptAny=true;
        }
        desiredDirection+=2;
        desiredDirection%=4;
        //console.log(desiredDirection);
        let breaker=0;
        var success=false;
        var newKey;
        while (breaker<200 && !success) {
            for (let i=-breaker;i<breaker;i++) {
                for (let j=-breaker;j<breaker;j++) {
                    if (Math.abs(i)+Math.abs(j) != breaker) { // expanding diamond pattern
                        continue;
                    }
                    newKey=(pother[0]+i)+','+(pother[1]+j)+','+pother[2];
                    if (newKey in Game.map && (Game.noOtherPortals(pother[0]+i,pother[1]+j,pother[2])) &&(Game.map[newKey].getDirection() == desiredDirection || (acceptAny && Game.map[newKey].getDirection() >= 0))) {

                        if ((pother[0]+','+pother[1]+','+pother[2]) in Game.map && Game.map[(pother[0]+','+pother[1]+','+pother[2])].contains == this) {
                            Game.map[(pother[0]+','+pother[1]+','+pother[2])].contains=null;
                        }

                        pother[0]+=i;
                        pother[1]+=j;
                        success=true;
                        break;
                    }
                }
                if (success) {
                    break;
                }
            }
            breaker++;
        }
        if (!success) {return false;}
        console.log(newKey +' '+pother);
        if (!which) {
            this.p2=pother;
            if (!(this.getKey(1) in Game.map)) {
                this.correctEntrance(1);
            }
            Game.map[this.getKey(1)].contains=this;
        }
        else {
            this.p1=pother;
            if (!(this.getKey(0) in Game.map)) {
                this.correctEntrance(0);
            }
            Game.map[this.getKey(0)].contains=this;
        }
        return true;
    };

    this.drop = function(x,y,z) {
        var which;
        if (this.p1[2]<0) {
            which=0;
            this.p1=[x,y,z];
        }
        else {
            which=1;
            this.p2=[x,y,z];
        }
        if (!this.correctEntrance(!which,true)) {
            this.correctEntrance(which,true);
            this.correctEntrance(!which);
        }
        else {
            this.correctEntrance(which);
        }
    };

    this.grabFrom = function(grabKey) {
        if (grabKey==this.getKey(0)) {
            this.p1[2]=-1;
        }
        else if (grabKey==this.getKey(1)) {
            this.p2[2]=-1;
        }
    };

    this.name = function(which=-1) {
        var checkZ;
        if (which<0) {
            if (this.p1[2]<0) {
                checkZ=1;
            }
            else {
                checkZ = 0;
            }
        }
        else {
            if (!which) {
                checkZ = this.p1[2];
            }
            else {
                checkZ = this.p2[2];
            }
        }
        if (checkZ >=0 && checkZ < Game.roomNames.length) {
            return Game.roomNames[checkZ];
        }
        return 'An unknown location';
    };

    this.getDelta = function() {
        return [this.p2[0] - this.p1[0], this.p2[1] - this.p1[1]];
    };

    this.hasEntity =function() {
        if (this.getKey(0) in Game.map && Game.map[this.getKey(0)].entity) {
            return Game.map[this.getKey(0)].entity;
        }
        else if (this.getKey(1) in Game.map && Game.map[this.getKey(1)].entity) {
            return Game.map[this.getKey(1)].entity;
        }
        else {
            return null;
        }
    };

    this.getChar=function() {
        if (this.hasEntity() != null) {
            return this.hasEntity().getChar();
        }

        if (this.p1[2]<0 || this.p2[2] <0) {
            return 'x';
        }

    	if (this.open) {
            return '*';
	    }
	    else {
	        return "+";
	    }
    };

    this.getColor=function() {
        if (this.hasEntity() != null) {
            return this.hasEntity().getColor();
        }
        if (this.p1[2]<0 || this.p2[2] <0) {
            return '#0dd';
        }
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
        return this.open && (Game.portalFovPortal==null || Game.portalFovPortal == this);
    };

    this.passThrough=function() {
        var toReturn=this.open;
        for (let q=0;q<2;q++) {
            toReturn &= (this.getKey(q) in Game.map && Game.map[this.getKey(q)].entity == null);
            /*if (Game.map[this.getKey(q)].entity != null && 'passThrough' in Game.map[this.getKey(q)].entity) {
                toReturn &= Game.map[this.getKey(q)].entity.passThrough();
            }*/
        }
        toReturn &= this.p1[2]>=0;
        toReturn &= this.p2[2]>=0;
        return toReturn;
    };

    this.actOn=function(direction) {
        if (this.getChar()=='x') {
            Game.sendMessage("This portal is sealed from the other side.");
        }
        if (this.open) {
            for (let q=0;q<2;q++) {
                if (this.getKey(q) in Game.map && Game.map[this.getKey(q)].entity != null && 'actOn' in Game.map[this.getKey(q)].entity) {
                    Game.map[this.getKey(q)].entity.actOn(direction);
                }
            }
        }
        else {
            this.open=true;
            Game.sendMessage("You open the portal.",false);
        }
    };
};

// To update water
var TileManager = {
    //flowRate:5,
    act : function() {
        var tiles = Object.keys(Game.map);
        var flowRate=5;
        for (let i=0;i<tiles.length;i++) {
            if (Game.map[tiles[i]].lake) {
                continue;
            }
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
                                        //Game.map[tiles[i]].solidify=true;
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
            if (Game.map[tiles[i]].connection != null && Game.map[tiles[i]].connection instanceof Connection) {
                for (let q=0;q<2;q++) {
                    Game.map[Game.map[tiles][i].connection.getKey(q)].water = Game.map[tiles[i]].water;
                    Game.map[Game.map[tiles][i].connection.getKey(q)].nextWater = Game.map[tiles[i]].nextWater;
                }
            }
            if (Game.map[tiles[i]].solidify) {
                //console.log('solidifying?');
                Game.map[tiles[i]].solidify=false;
                Game.map[tiles[i]].color='#666';
                Game.map[tiles[i]].water=0;
                Game.map[tiles[i]].nextWater=0;
                Game.map[tiles[i]].lake=false;
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

function Tile(char,color,passable,seethrough,contains,direction,water=0,liquidType=0,lake=false) {
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
    this.lastSeen=-10;
    this.lake=lake;
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
            if ('hurtByLiquidType' in this.entity) {
                return true;
            }
            else {
                return false;
            }
        }
        return this.passThrough();
    }
    this.getChar=function() {
        this.lastSeen=Game.currentTurn;
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
                if (this.water < 4*Game.minWater && !this.lake) {
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
                    if (!this.lake) {
                        return '#00f';
                    }
                    else {
                        return '#00c';
                    }
                }
                else if (this.liquidType==1) {
                    if (!this.lake) {
                        return '#fa0';
                    }
                    else {
                        return '#c70'
                    }
                }
            }
        }
        else {
            return this.contains.getColor();
        }
    }
};
