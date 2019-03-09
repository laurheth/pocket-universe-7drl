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
    this.yellSound="shouts";
    this.seen=false;
    this.aquatic=false;
    this.amphibious=false;
    this.poisonous=false;
    this.spawnTurn=Game.currentTurn;
    this.relentless=false;
    Game.map[x+','+y+','+z].entity=this;
};

Entity.prototype.getChar = function() {
    if (!this.seen && this.violent) {
        Game.sendMessage("The "+this.name.toLowerCase()+" "+this.yellSound+"!");
        this.seen=true;
    }
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

spreadFire = function(key,localOnly=false) {
    let parts = key.split(',');
    px=parseInt(parts[0]);
    py=parseInt(parts[1]);
    pz=parseInt(parts[2]);
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (localOnly && (i!=0 || j!=0)) {
                continue;
            }
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
                                    if (!Game.player.checkFireProtection()) {
                                        Game.statusMessage("You have caught on fire!", 'Burning');
                                        Game.player.status.Burning = 10;
                                    }
                                }
                                if (Game.player.checkFireProtection()) {
                                    Game.sendMessage("Your "+Game.player.armor.name+" protects you from the fire!");
                                    Game.player.armor.damage(1,true);
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
        if ('escape' in this) {
            this.escape();
            this.hateCounter -= 2;
            return;
        }
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

    if (Game.map[this.getKey()].water >= Game.minWater) {
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
            Game.map[this.getKey()].name='Ash';
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
                spreadFire(Game.map[this.getKey()].contains.getKey(q));
            }
        }
        else {
            spreadFire(this.getKey());
        }
        if (!this.immuneToFire) {
            this.onFire++;
        }
    }
    if (this.soonToBeOnFire && this.onFire<0) {
        this.onFire=Math.floor(ROT.RNG.getUniform()*5);
    }
}

var StairMixin = function(obj) {
    obj.act = function() {

    };
    obj.actOn = function(direction) {
        Game.sendMessage("You walk down the stairs...");
        Game.nextLevel();
    };
}

var FakeChestMixin = function(obj) {
    obj.act = function() {

    };
    obj.actOn = function(direction) {
        Game.sendMessage("You open the Golden Chest...");
        Game.sendMessage("It was a decoy!");
        Game.map[this.getKey()].entity=null;
        Game.map[this.getKey()].contains = ItemBuilder.itemByName('Coffee');
        this.active=false;
    }
}

var VictoryChestMixin = function(obj) {
    obj.act = function() {

    };
    obj.actOn = function(direction) {
        Game.sendMessage("You open the Golden Chest...");
        Game.sendMessage("You have found the Wand of Nerual!",false,"",'Victory');
        Game.sendMessage("A stairway out of this hellish place has opened. Escape alive with the wand!",false,"",'Victory');
        Game.map[this.getKey()].entity=null;
        Game.map[this.getKey()].contains = ItemBuilder.itemByName('Wand of Nerual');
        this.active=false;
        Game.scheduler.add(Game.addImportant('WinStaircase'),true);
    }
}

var WinGameMixin = function(obj) {
    obj.won=false;
    obj.act = function() {
        if (this.won) {
            Game.engine.lock();
            Game.sendMessage("You escaped with the Wand of Nerual! You have won!!",false,"",'Victory');
            Game.sendMessage("Thank you for playing!",false,"","Victory");
        }
    };
    obj.actOn = function(direction) {
        if (Game.player.inventory.length>0) {
            for (let i=0;i<Game.player.inventory.length;i++) {
                if (Game.player.inventory[i].name == 'Wand of Nerual') {
                    this.won=true;
                    return true;
                }
            }
        }
        Game.sendMessage("You can't leave without the Wand of Nerual, or this will have all been for nothing!");
        return false;
        //Game.engine.lock();
    }
}

var OozeMixin = function(obj,oozeColor) {
    obj.oozeColor = oozeColor;
    obj.ooze = function() {
        if (this.getKey() in Game.map) {
            Game.map[this.getKey()].color=oozeColor;
            Game.map[this.getKey()].name="Slime";
        }
    }
}

var LiquidOozeMixin = function(obj,liquid) {
    obj.liquidOoze = liquid;
    obj.ooze = function () {
        if (this.getKey() in Game.map) {
            if (Game.map[this.getKey()].water < Game.minWater) {
                Game.map[this.getKey()].water += Game.minWater;
                Game.map[this.getKey()].liquidType=this.liquidOoze;
                Game.map[this.getKey()].nextWater += Game.minWater+1;
                Game.map[this.getKey()].nextLiquidType=this.liquidOoze;
            }
        }
    }
}

var ShamblerMixin = function(obj) {
    // Teleport to where the player is
    obj.nextJump=100;
    obj.relentless=true;
    obj.zap = function () {
        this.nextJump--;
        if (this.nextJump <= 0) {
            this.nextJump = Math.floor(81*ROT.RNG.getUniform())+40;
            if (this.z != Game.player.z && this.seen) {
                let newKey = Game.sendToZ(Game.player.z);
                if (newKey != null && newKey in Game.map && Game.map[newKey].entity == null) {
                    Game.map[newKey].entity = this;
                    Game.map[this.getKey()].entity = null;
                    let parts = newKey.split(',');
                    this.x = parseInt(parts[0]);
                    this.y = parseInt(parts[1]);
                    this.z = parseInt(parts[2]);
                    Game.sendMessage("The " + this.name.toLowerCase() + " teleports in!", true, newKey);
                    if (this.z == Game.player.z) {
                        Animator.dazzle(this.x, this.y, '*', ['#f0f', '#00f']);
                    }
                }
            }
        }
    }
}

var WizardMixin = function(obj) {
    RangeMixin(obj,1,1,10,'Bleeding',0.5);
    obj.isWizard=true;
    obj.minDist=4;
    obj.home=obj.z;
    obj.chooseSpell = function() {
        let spellChoice = Math.floor(4*ROT.RNG.getUniform());
        switch (spellChoice) {
            default:
            // Magic missile
            case 0:
                this.rangedetails= {
                    acc:0.9,
                    num:1,
                    rng:10,
                    eff:'Bleeding',
                    freq:0.5,
                    char:'*',
                    color:'#fff',
                    msg:'shoots a magic missile!',
                    dmg:2,
                    hitmsg:"You're hit!",
                }
            break;
            // Fire
            case 1:
                this.rangedetails= {
                    acc:0.2,
                    num:5,
                    rng:5,
                    eff:'Burning',
                    freq:0.5,
                    char:'*',
                    color:'#fa0',
                    msg:'unleases a cone of flame!',
                    dmg:1,
                    hitmsg:"You catch on fire!",
                }
            break;
            // Poison
            case 2:
                this.rangedetails= {
                    acc:0.9,
                    num:1,
                    rng:10,
                    eff:'Poison',
                    freq:0.5,
                    char:'*',
                    color:'#0f0',
                    msg:'fires a bolt of poison!',
                    dmg:2,
                    hitmsg:"You are poisoned!",
                }
            break;
            // Frost
            case 2:
                this.rangedetails= {
                    acc:0.9,
                    num:1,
                    rng:10,
                    eff:'Hypothermia',
                    freq:0.5,
                    char:'*',
                    color:'#0ff',
                    msg:'fires a ray of frost!',
                    dmg:20,
                    hitmsg:"You feel cold!",
                }
            break;
        }
    }
    obj.escape = function () {
        let newKey = Game.sendToZ(this.home);
        if (newKey != null && newKey in Game.map && Game.map[newKey].entity==null) {
            Game.map[newKey].entity=this;
            Game.map[this.getKey()].entity=null;
            let parts = newKey.split(',');
            if (this.z == Game.player.z) {
                Game.sendMessage("The "+this.name.toLowerCase()+" teleported away!",true,this.getKey());
                Animator.dazzle(this.x,this.y,'*',['#f0f','#00f']);
            }
            this.x=parseInt(parts[0]);
            this.y=parseInt(parts[1]);
            this.z=parseInt(parts[2]);
            Game.sendMessage("The "+this.name.toLowerCase()+" appears!",true,newKey);
            if (this.z == Game.player.z) {
                Animator.dazzle(this.x,this.y,'*',['#f0f','#00f']);
            }
        }
    }
}

//RangeMixin(newThing,0.2,5,5,'Burning');
var RangeMixin = function(obj,accuracy,number,range,effect,frequency,character='*',colour=Game.burnColor(),message="breathes fire",damage=1,hitmessage="Ouch!") {
    obj.rangedetails = {
        acc:accuracy,
        num:number,
        rng:range,
        eff:effect,
        freq:frequency,
        char:character,
        color:colour,
        msg:message,
        dmg:damage,
        hitmsg:hitmessage,
    }
    obj.zap = function() {
        var success=false;
        var playerDist = Math.max(Math.abs(this.x - Game.player.x),Math.abs(this.y - Game.player.y)) + 0.5*Math.min(Math.abs(this.x - Game.player.x),Math.abs(this.y - Game.player.y));
        if (this.z != Game.player.z) {
            return false;
        }
        if (Math.abs(Game.map[this.getKey()].lastSeen-Game.currentTurn)>1) {
            return false;
        } 
        if (playerDist < this.rangedetails.rng && ROT.RNG.getUniform()<this.rangedetails.freq) {
            Game.sendMessage("The "+this.name.toLowerCase()+" "+this.rangedetails.msg+"!");
            success=true;
            for (let i=0;i<this.rangedetails.num;i++) {
                var tx=Game.player.x;
                var ty=Game.player.y;
                if (ROT.RNG.getUniform()<this.rangedetails.acc) {
                    if (this.rangedetails.eff != 'Bleeding') {
                        if (this.rangedetails.eff == 'Burning' && Game.player.checkFireProtection()) {
                            Game.sendMessage("Your " +Game.player.armor.name +" protects you from the fire!");
                            Game.player.armor.damage(1, true);
                        }
                        else {
                            if (this.rangedetails.eff in Game.player.status) {
                                Game.player.status[this.rangedetails.eff] -= this.rangedetails.dmg;
                            }
                            else {
                                Game.statusMessage(this.rangedetails.hitmsg, this.rangedetails.eff);
                                Game.player.status[this.rangedetails.eff] = Game.startValue(this.rangedetails.eff) - this.rangedetails.dmg;
                            }
                        }
                    }
                    else {
                        Game.statusMessage(this.rangedetails.hitmsg, this.rangedetails.eff);
                        Game.player.wound(this.rangedetails.dmg);
                    }
                }
                else {
                    tx += Math.floor(5*ROT.RNG.getUniform())-2
                    ty += Math.floor(5*ROT.RNG.getUniform())-2
                    spreadFire(tx+','+ty+','+this.z,true);
                }
                Animator.shoot(this.x,this.y,tx,ty,this.rangedetails.char,this.rangedetails.color);
            }
        }
        return success;
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
        if (Game.currentTurn - this.spawnTurn < 4) {
            return;
        }
        var success = false;
        var breaker = 0;
        if (Game.player.z == this.z) {
            this.targetPos=[Game.player.x,Game.player.y];
            this.chaseTimer=10;
        }
        if (this.chaseTimer<=0 && !this.relentless) {
            this.targetPos=null;
        }
        else {
            this.chaseTimer--;
        }

        if (this.onFire < 0 || !this.immuneToFire) {
            if ('zap' in this) {
                if ('chooseSpell' in this) {
                    this.chooseSpell();
                }
                if (this.zap()) {
                    return;
                }
            }
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

var PushMixin = function(obj,failMessage=null) {
    obj.failMessage=failMessage;
    obj.actOn = function(direction) {
        if (this.step(direction[0], direction[1]) != null) {
            Game.sendMessage("You push the "+this.name.toLowerCase()+".");
        }
        else {
            if (this.failMessage==null) {
                Game.sendMessage("You try to push the "+this.name.toLowerCase()+". It falls apart!");
            }
            else {
                Game.sendMessage(this.failMessage);
            }
            Game.map[this.getKey()].entity=null;
            this.active=false;
            Game.map[this.getKey()].color=this.color;
            Game.map[this.getKey()].char=',';
            Game.map[this.getKey()].name="Wrecked "+this.name;
        }
    }
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
                if (Game.map[success].water>Game.deepThreshold || Game.map[success].lake) {
                    return;
                }
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
        if (this.meltInto >=0) {
            Game.map[this.getKey()].water=2*Game.minWater;
            Game.map[this.getKey()].nextWater = Game.map[this.getKey()].water;
            Game.map[this.getKey()].liquidType=this.meltInto;
            Game.map[this.getKey()].nextLiquidType=this.meltInto;
        }
        else {
            Game.map[this.getKey()].char='~';
            Game.map[this.getKey()].color=this.color;
            Game.map[this.getKey()].name='Molten '+this.name;
        }
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
        if (this.poisonous) {
            if ('Poison' in Game.player.status) {
                Game.player.status.Poison -= this.dmg;
                Game.statusMessage("You become more poisoned!",'Poison');
            }
            else {
                Game.player.status.Poison = Game.startValue('Poison');
                Game.statusMessage("You are poisoned!",'Poison');
            }
            Game.player.poisonTurn = Game.currentTurn;
        }
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
        if (Game.map[testKey].water >= Game.minWater) {
            if (Game.map[testKey].liquidType == this.hurtByLiquidType) {
                result = 0; // don't step into lava
            }
            else if ((Game.map[testKey].water > Game.deepThreshold || Game.map[testKey].lake) && !this.aquatic && !this.amphibious) {
                result=0;
            }
        }
        else if (Game.map[testKey].water < Game.minWater && this.aquatic) {
            result=0;
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
            case 'Dragon':
            newThing = new Entity(x,y,z,'D','#0f0','Dragon',true);
            ChaseMixin(newThing,'attacks',6,false,true);
            RangeMixin(newThing,0.2,5,6,'Burning',0.5,'*','#ff0',"breathes fire",1,"You are burning!");
            newThing.yellSound="roars";
            newThing.burns=false;
            newThing.amphibious=true;
            newThing.relentless=true;
            break;
            case 'FrostDemon':
            newThing = new Entity(x,y,z,'F','#0ff','Frost Demon',true);
            ChaseMixin(newThing,'attacks',2);
            HurtByLiquidMixin(newThing,1);
            MeltMixin(newThing,0);
            newThing.burns=false;
            RangeMixin(newThing,1,1,8,'Hypothermia',0.3,'*','#0ff',"casts a ray of frost",21,"You feel cold!");
            //WizardMixin(newThing);
            newThing.tempHate.push('hot');
            newThing.yellSound="shivers";
            break;
            case 'Gargoyle':
            newThing = new Entity(x,y,z,'G','#ccc','Gargoyle',true);
            ChaseMixin(newThing,'attacks',3,false,true);
            newThing.burns=false;
            newThing.yellSound="roars";
            newThing.amphibious=true;
            break;
            case 'BronzeGolem':
            newThing = new Entity(x,y,z,'G','#d80','Bronze Golem',true);
            ChaseMixin(newThing,'smashes',5,true,true);
            newThing.burns=false;
            HurtByLiquidMixin(newThing,1); // melted by lava
            MeltMixin(newThing,1);
            newThing.yellSound="creeks towards you";
            newThing.amphibious=true;
            newThing.relentless=true;
            break;
            case 'Snake':
            newThing = new Entity(x,y,z,'S','#0f0','Snake',true);
            ChaseMixin(newThing,'bites',2);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            newThing.yellSound="hisses";
            newThing.poisonous=true;
            break;
            case 'Salamander':
            newThing = new Entity(x,y,z,'S','#fa0','Salamander',true);
            ChaseMixin(newThing,'bites',2);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            newThing.yellSound="hisses";
            newThing.immuneToFire=true;
            newThing.amphibious=true;
            break;
            case 'Penguin':
            newThing = new Entity(x,y,z,'p','#fff','Penguin',true);
            ChaseMixin(newThing,'pecks',2);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('hot');
            newThing.yellSound="quacks";
            newThing.amphibious=true;
            break;
            case 'Wizard':
            newThing = new Entity(x,y,z,'@','#f0f','Wizard',true);
            ChaseMixin(newThing,'hits',2,false,true);
            HurtByLiquidMixin(newThing,1);
            WizardMixin(newThing);
            newThing.tempHate.push('hot','cold');
            newThing.yellSound="mutters arcane incantations";
            break;
            case 'Dimensional Shambler':
            newThing = new Entity(x,y,z,'S','#fff','Dimensional Shambler',true);
            ChaseMixin(newThing,'thrashes','6',false,true);
            HurtByLiquidMixin(newThing,1);
            ShamblerMixin(newThing);
            newThing.yellSound="lets out a deafening roar";
            break;
            case 'Moosetaur':
            newThing = new Entity(x,y,z,'M','#ff0','Moosetaur',true);
            ChaseMixin(newThing,'tramples',4,false,true);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('hot');
            newThing.yellSound="bellows";
            RangeMixin(newThing,0.9,1,12,'Bleeding',0.3,',','#ff0',"fires an arrow",3,"You are hit!");
            break;
            case 'Moose':
            newThing = new Entity(x,y,z,'M','#d80','Moose',true);
            ChaseMixin(newThing,'tramples',4,false,true);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('hot');
            newThing.yellSound="bellows";
            break;
            case 'PolarBear':
            newThing = new Entity(x,y,z,'B','#ddd','Polar Bear',true);
            ChaseMixin(newThing,'thrashes',5,false,true);
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('hot');
            newThing.yellSound="growls";
            newThing.amphibious=true;
            newThing.relentless=true;
            break;
            case 'FlameDemon':
            newThing = new Entity(x,y,z,'F','#fa0','Flame Demon',true);
            ChaseMixin(newThing,'attacks',1);
            HurtByLiquidMixin(newThing,0);
            newThing.immuneToFire=true;
            newThing.onFire=1;
            newThing.yellSound="roars with flame";
            //newThing.tempHate.push('cold');
            break;
            case 'Snail':
            newThing = new Entity(x,y,z,'\u00E4','#990','Giant Snail',true);
            ChaseMixin(newThing,'crushes',3,true,true);
            OozeMixin(newThing,'#fff');
            HurtByLiquidMixin(newThing,1);
            newThing.tempHate.push('cold');
            newThing.yellSound="wags their eyestalks";
            newThing.amphibious=true;
            break;
            case 'LavaSnail':
            newThing = new Entity(x,y,z,'\u00E4','#f00','Lava Snail',true);
            ChaseMixin(newThing,'crushes',5,true,true);
            LiquidOozeMixin(newThing,1);
            HurtByLiquidMixin(newThing,0);
            newThing.tempHate.push('cold');
            newThing.yellSound="wags their eyestalks";
            newThing.amphibious=true;
            newThing.burns=false;
            newThing.immuneToFire=true;
//            newThing.onFire=true;
            break;
            case 'Creeping Vine':
            newThing = new Entity(x,y,z,'f','#0f0','Creeping Vine',true);
            GrowMixin(newThing,0.1);
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
            HurtByLiquidMixin(newThing,1);
            MeltMixin(newThing,-1);
            //DestructMixin(newThing,"smash");
            newThing.burns=false;
            break;
            case 'Candelabra':
            newThing = new Entity(x,y,z,'\u03A8','#ff0','Candelabra',true);
            //DestructMixin(newThing,"knock over");
            PushMixin(newThing);
            HurtByLiquidMixin(newThing,1);
            MeltMixin(newThing,-1);
            newThing.burns=false;
            break;
            case 'Ice':
            newThing = new Entity(x,y,z,'#','#0ff','Ice',false);
            HurtByLiquidMixin(newThing,1); // melted by lava
            MeltMixin(newThing,0);
            newThing.burns=false;
            newThing.tempHate.push('hot','temperate');
            break;
            case 'Boulder':
            newThing = new Entity(x,y,z,'\u03C9','#0ff','Boulder',true);
            PushMixin(newThing,"You smash the boulder!");
            HurtByLiquidMixin(newThing,1); // melted by lava
            MeltMixin(newThing,1);
            newThing.color = (x+','+y+','+z in Game.map) ? (Game.map[x+','+y+','+z].color) : ('#ccc');
            newThing.burns=false;
            break;
            case 'Staircase':
            newThing = new Entity(x,y,z,'>','#fff','Staircase',true);
            newThing.burns=false;
            newThing.immuneToFire=true;
            StairMixin(newThing);
            break;
            case 'VictoryChest':
            newThing = new Entity(x,y,z,'\u03C0','#ff0','Golden Treasure Chest',true);
            newThing.burns=false;
            newThing.immuneToFire=true;
            //DestructMixin(newThing,"open");
            VictoryChestMixin(newThing);
            break;
            case 'DecoyChest':
            newThing = new Entity(x,y,z,'\u03C0','#ff0','Golden Treasure Chest',true);
            newThing.burns=false;
            newThing.immuneToFire=true;
            //DestructMixin(newThing,"open");
            FakeChestMixin(newThing);
            break;
            case 'NormalChest':
            newThing = new Entity(x,y,z,'\u03C0','#ccc','Treasure Chest',true);
            HurtByLiquidMixin(newThing,1); // melted by lava
            MeltMixin(newThing,-1);
            DestructMixin(newThing,"open");
            break;
            case 'WinStaircase':
            newThing = new Entity(x,y,z,'<','#ff0','Exit',true);
            newThing.burns=false;
            newThing.immuneToFire=true;
            WinGameMixin(newThing);
            break;
        }
        return newThing;
    },
};