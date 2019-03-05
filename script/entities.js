function Entity (x,y,z,char,color,name, lightPasses=true) {
    this.x=x;
    this.y=y;
    this.z=z;
    this.targetDir=null;
    this.char=char;
    this.color=color;
    this.name=name;
    this.lightPasses=lightPasses;
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
    var success=false;
    var breaker=0;
    if (Game.player.z == this.z) {
        this.targetDir=[Math.sign(-this.x+Game.player.x),Math.sign(-this.y+Game.player.y)];
        //this.targetPos=[Game.player.x,Game.player.y];
    }
    while (!success && breaker<10) {
        breaker++;
        if (this.targetDir==null) {
            success=this.step(Math.floor(ROT.RNG.getUniform() * 3) - 1 , Math.floor(ROT.RNG.getUniform() * 3) - 1);
        }
        else {
            success=this.step(this.targetDir[0],this.targetDir[1]);
            if (!success) {
                this.targetDir=null;
            }
        }
    }
};

Entity.prototype.step = function(dx,dy) {
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
        return false;
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
            Game.map[this.getKey()].entity=null;
            let parts=newKey.split(',');
            this.x=parseInt(parts[0]);
            this.y=parseInt(parts[1]);
            this.z=parseInt(parts[2]);
            Game.map[newKey].entity=this;
        }
        else {
            return false;
        }
    }
    else {
        Game.map[this.getKey()].entity=null;
        Game.map[newKey].entity=this;
        this.x+=dx;
        this.y+=dy;
    }
    return true;
};
