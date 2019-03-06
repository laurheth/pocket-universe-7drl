function Entity (x,y,z,char,color,name, lightPasses=true) {
    this.x=x;
    this.y=y;
    this.z=z;
    this.active=true;
    this.targetDir=null;
    this.char=char;
    this.color=color;
    this.name=name;
    this.lightPasses=lightPasses;
    this.isPlant=false;
    Game.map[x+','+y+','+z].entity=this;
};

Entity.prototype.getChar = function() {
    return this.char;
};

Entity.prototype.getColor = function() {
    return this.color;
};

Entity.prototype.getKey = function() {
    return this.x+','+this.y+','+this.z;
};

Entity.prototype.act = function() {
};

var ChaseMixin = function(obj) {
    obj.act = function () {
        if (!this.active) {
            return;
        }
        var success = false;
        var breaker = 0;
        if (Game.player.z == this.z) {
            this.targetDir = [Math.sign(-this.x + Game.player.x), Math.sign(-this.y + Game.player.y)];
            //this.targetPos=[Game.player.x,Game.player.y];
        }
        while (!success && breaker < 10) {
            breaker++;
            if (this.targetDir == null) {
                success = this.step(Math.floor(ROT.RNG.getUniform() * 3) - 1, Math.floor(ROT.RNG.getUniform() * 3) - 1);
            }
            else {
                success = this.step(this.targetDir[0], this.targetDir[1]);
                if (!success) {
                    this.targetDir = null;
                }
            }
        }
    }
};

var WaterMixin = function(obj,targWater,liquidType) {
    obj.liquidType=liquidType;
    obj.targWater=targWater;
    obj.act = function () {
        Game.map[this.getKey()].liquidType=this.liquidType;
        Game.map[this.getKey()].water+=this.targWater;
        Game.map[this.getKey()].nextWater+=this.targWater;
    };
};

var GrowMixin = function(obj,growChance) {
    obj.isPlant=true;
    obj.growChance = growChance;
    obj.act = function () {
        if (!this.active) {
            return;
        }
        var success;
        if (ROT.RNG.getUniform()<=growChance) {
            //let tryPos=[Math.floor(ROT.RNG.getUniform() * 3) - 1, Math.floor(ROT.RNG.getUniform() * 3) - 1];
            var tryPos;
            switch (Math.floor(ROT.RNG.getUniform() * 4)) {
                default:
                case 0:
                tryPos=[1,0];
                break;
                case 1:
                tryPos=[-1,0];
                break;
                case 2:
                tryPos=[0,1];
                break;
                case 3:
                tryPos=[0,-1];
                break;
            };
            success=this.step(tryPos[0],tryPos[1],true);
            if (success) {
                let parts=success.split(',');
                let x=parseInt(parts[0]);
                let y=parseInt(parts[1]);
                let z=parseInt(parts[2]);
                Game.scheduler.add(EntityMaker.makeByName(this.name,x,y,z),true);
            }
        }
    };
};

var DestructMixin = function(obj) {
    obj.actOn = function () {
        Game.map[this.getKey()].entity=null;
        this.active=false;
    };
};

var HurtByLiquidMixin = function(obj,liquidType) {
    obj.liquidType=liquidType;
    obj.checkForLiquid = function () {

    };
}

Entity.prototype.step = function(dx,dy,justCheck=false) {
    //console.log(dx+','+dy);
    var newKey;
    if (((this.x+dx)+','+(this.y+dy)+','+this.z) in Game.map && Game.map[((this.x+dx)+','+(this.y+dy)+','+this.z)].passThrough()) {
        newKey=((this.x+dx)+','+(this.y+dy)+','+this.z);
    }
    else if (((this.x+dx)+','+this.y+','+this.z) in Game.map && Game.map[((this.x+dx)+','+this.y+','+this.z)].passThrough()) {
        dy=0;
        newKey=((this.x+dx)+','+this.y+','+this.z);
    }
    else if ((this.x+','+(this.y+dy)+','+this.z) in Game.map && Game.map[(this.x+','+(this.y+dy)+','+this.z)].passThrough()) {
        dx=0;
        newKey=((this.x+dx)+','+(this.y+dy)+','+this.z);
    }
    else {
        return null;
    }

    if (Game.map[newKey].contains instanceof Connection) {
        var whichSide;
        if (newKey == Game.map[newKey].contains.getKey(0)) {
            whichSide=1;
        }
        else {
            whichSide=0;
        }
        newKey=Game.map[newKey].contains.getKey(whichSide);
        if (Game.map[newKey].passThrough()) {
            if (!justCheck) {
                Game.map[this.getKey()].entity=null;
            
                let parts=newKey.split(',');
                this.x=parseInt(parts[0]);
                this.y=parseInt(parts[1]);
                this.z=parseInt(parts[2]);
            
                Game.map[newKey].entity=this;
            }
        }
        else {
            return null;
        }
    }
    else {
        if (!justCheck) {
            Game.map[this.getKey()].entity=null;
            Game.map[newKey].entity=this;
        
            this.x+=dx;
            this.y+=dy;
        }
    }
    return newKey;
};

var EntityMaker = {
    makeByName: function(name,x,y,z) {
        var newThing;//=null;
        switch(name) {
            default:
            case 'Goblin':
            newThing = new Entity(x,y,z,'g','#0f0','Goblin',true);
            ChaseMixin(newThing);
            break;
            case 'Plant':
            newThing = new Entity(x,y,z,'P','#0f0','Plant',true);
            GrowMixin(newThing,0.2);
            DestructMixin(newThing);
            break;
            case 'Fountain':
            newThing = new Entity(x,y,z,'^','#0ff','Fountain',true);
            WaterMixin(newThing,100,0);
            break;
            case 'Volcano':
            newThing = new Entity(x,y,z,'^','#f00','Volcano',true);
            WaterMixin(newThing,60,1);
            break;
            case 'Obsidian':
            newThing = new Entity(x,y,z,'#','#ccc','Obsidian',false);
            DestructMixin(newThing);
            break;
        }
        return newThing;
    },
};