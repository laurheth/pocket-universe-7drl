function Entity (x,y,z,char,color,name, lightPasses=true) {
    this.x=x;
    this.y=y;
    this.z=z;
    this.onFire=-1;
    this.soonToBeOnFire=false;
    this.active=true;
    this.targetDir=null;
    this.targetPos=null;
    this.chaseTimer=0;
    this.char=char;
    this.color=color;
    this.name=name;
    this.lightPasses=lightPasses;
    this.isPlant=false;
    this.burns=true;
    this.immuneToFire=false;
    this.violent=false;
    this.dmg=0;
    this.stunned=false;
    this.slow=false;
    this.sturdy=false;
    this.tempHate=[];
    this.hateCounter=0;
    this.hurtByLiquidType=-1;
    Game.map[x+','+y+','+z].entity=this;
};

Entity.prototype.getChar = function() {
    return this.char;
};

Entity.prototype.getColor = function() {
    if (this.onFire>=0) {
        return Game.burnColor();
    }
    return this.color;
};

Entity.prototype.getKey = function() {
    return this.x+','+this.y+','+this.z;
};

Entity.prototype.act = function() {
    this.common();
};

Entity.prototype.spreadFire = function(key) {
    let parts = key.split(',');
    px=parseInt(parts[0]);
    py=parseInt(parts[1]);
    pz=parseInt(parts[2]);
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            var repeat=false;
            for (let q = 0; q < 2; q++) {
                var testKey = (px + i) + ',' + (py + j) + ',' + pz;
                if (testKey in Game.map) {
                    if (Game.map[testKey].contains != null && Game.map[testKey].contains instanceof Connection) {
                        repeat=true;
                        if (q==0) {
                            if (Game.map[testKey].contains.getKey(0) == testKey) {
                                testKey=Game.map[testKey].contains.getKey(1);
                            }
                            else {
                                testKey=Game.map[testKey].contains.getKey(0);
                            }
                        }
                    }
                    if (testKey in Game.map && Game.map[testKey].entity != null && (Game.map[testKey].entity.burns || 'melt' in Game.map[testKey].entity) && (Game.map[testKey].liquidType != 0 || Game.map[testKey].water<Game.minWater)) {
                        if ('melt' in Game.map[testKey].entity) {
                            Game.map[testKey].entity.melt();
                        }
                        else {
                            if (Game.map[testKey].entity != Game.player && Game.map[testKey].entity.onFire < 0) {
                                Game.map[testKey].entity.soonToBeOnFire = true;
                                Game.sendMessage("The fire is spreading!", true, testKey);
                            }
                            else if (Game.map[testKey].entity == Game.player) {
                                if (!('Burning' in Game.player.status)) {
                                    Game.statusMessage("You have caught on fire!", 'Burning');
                                    Game.player.status.Burning = 10;
                                }
                            }
                        }
                    }
                }
                if (!repeat) {
                    break;
                }
            }
        }
    }
};

Entity.prototype.common = function() {
    
    if (!this.active) {return;}
    if (this.z in Game.roomTags && this.tempHate.length>0) {
        for (let i=0;i<this.tempHate.length;i++) {
            if (Game.roomTags[this.z].indexOf(this.tempHate[i])>=0) {
                this.hateCounter+=2;
            }
        }
    }
    if (this.hateCounter>0) {this.hateCounter--;}

    if (this.hateCounter > 10) {
        if (ROT.RNG.getUniform()>0.8) {
            Game.map[this.getKey()].entity = null;
            this.active = false;
            var message = "The " + this.name.toLowerCase();
            if (this.isPlant) {
                Game.sendMessage(message + " withered away.", true, this.getKey());
            }
            else if ('melt' in this) {
                this.melt();
                return;
            }
            else {
                if (this.tempHate[0] == 'hot') {
                    message += " died from the heat!";
                }
                else if (this.tempHate[0] == 'cold') {
                    message += " froze to death!";
                }
                Game.sendMessage(message, true, this.getKey());

            }
            return;
        }
    }

    if (Game.map[this.getKey()].water > Game.minWater) {
        if ('hurtByLiquid' in this) {
            this.hurtByLiquid(Game.map[this.getKey()].liquidType);
        }
    }

    if (Game.map[this.getKey()].burns && Game.map[this.getKey()].liquidType==1 && Game.map[this.getKey()].water>Game.minWater) {
        this.soonToBeOnFire=true;
    }
    if (this.onFire >= 0) {
        //Game.sendMessage("burning");
        if (this.onFire > 10) {
            Game.map[this.getKey()].entity = null;
            this.active = false;
            Game.map[this.getKey()].color='#666';
            if (this.isPlant) {
                Game.sendMessage("The " + this.name.toLowerCase() + " burns away.", true, this.getKey());
            }
            else {
                Game.sendMessage("The " + this.name.toLowerCase() + " burns to death.", true, this.getKey());
            }
            return;
        }
        if (Game.map[this.getKey()].contains != null && Game.map[this.getKey()].contains instanceof Connection) {
            for (let q=0;q<2;q++) {
                this.spreadFire(Game.map[this.getKey()].contains.getKey(q));
            }
        }
        else {
            this.spreadFire(this.getKey());
        }
        if (!this.immuneToFire) {
            this.onFire++;
        }
    }
    if (this.soonToBeOnFire && this.onFire<0) {
        this.onFire=Math.floor(ROT.RNG.getUniform()*5);
    }
}

var OozeMixin = function(obj,oozeColor) {
    obj.oozeColor = oozeColor;
    obj.ooze = function() {
        if (this.getKey() in Game.map) {
            Game.map[this.getKey()].color=oozeColor;
        }
    }
}

var ChaseMixin = function(obj,verb="attacks",dmg=2,slow=false,sturdy=false) {
    obj.dmg=dmg;
    obj.slow=slow;
    obj.violent=true;
    obj.verb=verb;
    obj.sturdy=sturdy;
    obj.act = function () {
        this.common();
        if (!this.active) {
            return;
        }
        if (this.stunned) {
            this.stunned=false;
            return;
        }
        var success = false;
        var breaker = 0;
        if (Game.player.z == this.z) {
            this.targetPos=[Game.player.x,Game.player.y];
            this.chaseTimer=6;
        }
        if (this.chaseTimer<=0) {
            this.targetPos=null;
        }
        else {
            this.chaseTimer--;
        }
        
        if (this.targetPos != null) {
            if (this.targetPos[0] == this.x && this.targetPos[1] == this.y) {
                this.targetPos=null;
            }
            else {
                this.targetDir = [Math.sign(-this.x + this.targetPos[0]), Math.sign(-this.y + this.targetPos[1])];
            }
        }
        if (this.onFire>=0 && !this.immuneToFire) {
            this.targetDir=null;
        }
        while (!success && breaker < 5) {
            breaker++;
            if (this.targetDir == null) {
                success = this.step(Math.floor(ROT.RNG.getUniform() * 3) - 1, Math.floor(ROT.RNG.getUniform() * 3) - 1,false,true);
            }
            else {
                success = this.step(this.targetDir[0], this.targetDir[1],false,true);
                if (!success) {
                    this.targetDir = null;
                }
            }
        }
        if (this.slow) {
            this.stunned=true;
        }
    };
    obj.actOn = function(direction) {
        // shove!
        //var direction;
        /*if (this.z==Game.player.z) {
            direction = [Math.sign(this.x - Game.player.x), Math.sign(this.y - Game.player.y)];
        }
        else {
            if (Game.map[this.getKey()].contains != null && Game.map[this.getKey()].contains instanceof Connection) {

            }
        }*/
        if (!this.sturdy || ROT.RNG.getUniform() > 0.5) {
            Game.sendMessage("You push the " + this.name.toLowerCase() + " away!");
            this.stunned = true;
            this.step(direction[0], direction[1]);
            if (ROT.RNG.getUniform() > 0.5 && !this.sturdy) {
                this.step(direction[0], direction[1]);
            }
        }
        else {
            Game.sendMessage("You try to push the " + this.name.toLowerCase() + ", but they don't budge!");
        }
    };
};

var PushMixin = function(obj) {

};

var WaterMixin = function(obj,targWater,liquidType) {
    obj.liquidType=liquidType;
    obj.targWater=targWater;
    obj.act = function () {
        if (!this.active) {
            return;
        }
        Game.map[this.getKey()].liquidType=this.liquidType;
        Game.map[this.getKey()].water+=this.targWater;
        Game.map[this.getKey()].nextWater+=this.targWater;
    };
};

var GrowMixin = function(obj,growChance) {
    obj.isPlant=true;
    obj.growChance = growChance;
    obj.act = function () {
        this.common();
        if (!this.active || this.onFire>=0) {
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
                Game.sendMessage("The "+this.name+" grows!",true,this.getKey());
            }
        }
    };
};

var DestructMixin = function(obj,destroyMethod="destroy") {
    obj.destroyMethod=destroyMethod;
    obj.actOn = function (direction) {
        Game.map[this.getKey()].entity=null;
        this.active=false;
        Game.sendMessage("You "+this.destroyMethod+" the "+this.name.toLowerCase()+"!");
    };
};

var HurtByLiquidMixin = function(obj,liquidType) {
    obj.hurtByLiquidType=liquidType;
    obj.hurtByLiquid = function (liquid) {
        if (liquid == this.hurtByLiquidType) {
            if ('melt' in this) {
                this.melt();
                return;
            }
            if (this.hurtByLiquidType==1 && this.burns) {
                if (this.onFire<0) {
                    Game.sendMessage("The "+this.name.toLowerCase()+" is burning in lava!",true,this.getKey());
                    this.onFire=0;
                }
            }
            else {
                Game.sendMessage("The "+this.name.toLowerCase()+" was destroyed by the water!",true,this.getKey());
                Game.map[this.getKey()].entity=null;
                this.active=false;
            }
        }
    };
}

var MeltMixin = function (obj, liquidType) {
    obj.meltInto = liquidType;
    obj.melt = function () {
        Game.map[this.getKey()].water=2*Game.minWater;
        Game.map[this.getKey()].nextWater = Game.map[this.getKey()].water;
        Game.map[this.getKey()].entity=null;
        this.active=false;
        Game.sendMessage("The "+this.name.toLowerCase()+" melted.",true,this.getKey());
    }
}

Entity.prototype.step = function(dx,dy,justCheck=false,beSafe=false) {
    //console.log(dx+','+dy);
    var newKey=((this.x+dx)+','+(this.y+dy)+','+this.z);

    if ('ooze' in this) {
        this.ooze();
    }

    if (this.violent && newKey in Game.map && Game.map[newKey].entity != null && Game.map[newKey].entity == Game.player) {
        //Game.sendMessage("The "+this.name.toLowerCase()+" attacks you!");
        Game.statusMessage("The "+this.name.toLowerCase()+" "+this.verb+" you!",'Bleeding');
        Game.player.wound(this.dmg);
        return newKey;
    }

    if (Game.map[this.getKey()].contains != null && Game.map[this.getKey()].contains instanceof Connection) {
        if (!(newKey in Game.map) || !Game.map[newKey].passThrough()) {
            var parts;
            if (this.getKey() == Game.map[this.getKey()].contains.getKey(0)) {
                parts = Game.map[this.getKey()].contains.getKey(1).split(',');
            }
            else {
                parts = Game.map[this.getKey()].contains.getKey(0).split(',');
            }
            if (Game.map[this.getKey()].entity==this) {
                Game.map[this.getKey()].entity=null;
            }
            this.x=parseInt(parts[0]);
            this.y=parseInt(parts[1]);
            this.z=parseInt(parts[2]);
            Game.map[this.getKey()].entity=this;
        }
    }

    if (((this.x+dx)+','+(this.y+dy)+','+this.z) in Game.map && Game.map[((this.x+dx)+','+(this.y+dy)+','+this.z)].passThrough() && (!beSafe || this.checkSafe(((this.x+dx)+','+(this.y+dy)+','+this.z))) ) {
        newKey=((this.x+dx)+','+(this.y+dy)+','+this.z);
    }
    else if (((this.x+dx)+','+this.y+','+this.z) in Game.map && Game.map[((this.x+dx)+','+this.y+','+this.z)].passThrough() && (!beSafe || this.checkSafe(((this.x+dx)+','+(this.y+dy)+','+this.z)))) {
        dy=0;
        newKey=((this.x+dx)+','+this.y+','+this.z);
    }
    else if ((this.x+','+(this.y+dy)+','+this.z) in Game.map && Game.map[(this.x+','+(this.y+dy)+','+this.z)].passThrough() && (!beSafe || this.checkSafe(((this.x+dx)+','+(this.y+dy)+','+this.z)))) {
        dx=0;
        newKey=((this.x+dx)+','+(this.y+dy)+','+this.z);
    }
    else {
        return null;
    }

    /*if (Game.map[newKey].contains instanceof Connection) {
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
    else {*/
        if (!justCheck) {
            if (Game.map[this.getKey()].entity==this) {
                Game.map[this.getKey()].entity=null;
            }
            Game.map[newKey].entity=this;
        
            this.x+=dx;
            this.y+=dy;
        }
    //}
    return newKey;
};

Entity.prototype.checkSafe = function(testKey) {
    //let testKey=x+','+y+','+z;
    var result=1; // determine probability of taking the risk
    if (testKey in Game.map) {
        if (Game.map[testKey].water > Game.minWater && Game.map[testKey].liquidType == this.hurtByLiquidType) {
            result = 0; // don't step into lava
        }
        if (this.z in Game.roomTags && this.tempHate.length>0) {
            for (let i=0;i<this.tempHate.length;i++) {
                if (Game.roomTags[this.z].indexOf(this.tempHate[i])>=0) {
                    result *= 0.8;
                }
            }
        }
    }
    return result > ROT.RNG.getUniform();
};

var EntityMaker = {
    makeByName: function(name,x,y,z) {
        var newThing;//=null;
        switch(name) {
            default:
            case 'Goblin':
            newThing = new Entity(x,y,z,'g','#0f0','Goblin',true);
            ChaseMixin(newThing,'attacks',2);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            break;
            case 'Gargoyle':
            newThing = new Entity(x,y,z,'G','#ccc','Goblin',true);
            ChaseMixin(newThing,'attacks',3,false,true);
            newThing.burns=false;
            break;
            case 'BronzeGolem':
            newThing = new Entity(x,y,z,'G','#oaf','Bronze Golem',true);
            ChaseMixin(newThing,'smashes',5,true,true);
            newThing.burns=false;
            HurtByLiquidMixin(newThing,1); // melted by lava
            MeltMixin(newThing,1);
            break;
            case 'Snake':
            newThing = new Entity(x,y,z,'S','#0f0','Goblin',true);
            ChaseMixin(newThing,'bites',2);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            break;
            case 'Penguin':
            newThing = new Entity(x,y,z,'p','#fff','Penguin',true);
            ChaseMixin(newThing,'attacks',2);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('hot');
            break;
            case 'Moose':
            newThing = new Entity(x,y,z,'M','#0af','Moose',true);
            ChaseMixin(newThing,'tramples',3,false,true);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('hot');
            break;
            case 'PolarBear':
            newThing = new Entity(x,y,z,'B','#0af','Polar Bear',true);
            ChaseMixin(newThing,'thrashes',4,false,true);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('hot');
            break;
            case 'FlameDemon':
            newThing = new Entity(x,y,z,'F','#fa0','Flame Demon',true);
            ChaseMixin(newThing,'attacks',1);
            HurtByLiquidMixin(newThing,0);
            newThing.immuneToFire=true;
            newThing.onFire=1;
            //newThing.tempHate.push('cold');
            break;
            case 'Snail':
            newThing = new Entity(x,y,z,'a','#990','Giant snail',true);
            ChaseMixin(newThing,'crushes',3,true,true);
            OozeMixin(newThing,'#fff');
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            break;
            case 'CreepingVine':
            newThing = new Entity(x,y,z,'f','#0f0','Creeping Vine',true);
            GrowMixin(newThing,0.2);
            DestructMixin(newThing,"cut down");
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            newThing.tempHate.push('hot');
            break;
            case 'Reed':
            newThing = new Entity(x,y,z,'\u2320','#0d0','Reed',true);
            GrowMixin(newThing,0.01);
            DestructMixin(newThing,"cut down");
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            newThing.tempHate.push('hot');
            break;
            case 'Fountain':
            newThing = new Entity(x,y,z,'^','#0ff','Fountain',true);
            WaterMixin(newThing,100,0);
            HurtByLiquidMixin(newThing,1);
            newThing.burns=false;
            break;
            case 'Volcano':
            newThing = new Entity(x,y,z,'^','#f00','Volcano',true);
            WaterMixin(newThing,60,1);
            HurtByLiquidMixin(newThing,0);
            newThing.burns=false;
            break;
            case 'Statue':
            newThing = new Entity(x,y,z,'\u03A9','#ddd','Statue',true);
            PushMixin(newThing);
            //DestructMixin(newThing,"smash");
            newThing.burns=false;
            break;
            case 'Candelabra':
            newThing = new Entity(x,y,z,'\u03A8','#ff0','Candelabra',true);
            //DestructMixin(newThing,"knock over");
            PushMixin(newThing);
            HurtByLiquidMixin(newThing,1);
            newThing.burns=false;
            break;
            case 'Ice':
            newThing = new Entity(x,y,z,'#','#0ff','Ice',false);
            HurtByLiquidMixin(newThing,1); // melted by lava
            MeltMixin(newThing,0);
            newThing.burns=false;
            newThing.tempHate.push('hot','temperate');
            break;
        }
        return newThing;
    },
};