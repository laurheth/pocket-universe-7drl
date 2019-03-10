var ItemManager = {
    open:false,
    selected:null,
    selectedIndex:-1,
    letters:["a","b","c","d","e","f","g","h","i","j","k"],
    codes:[65,66,67,68,69,70,71,72,73,74,75],
    inventoryScreen: function() {
        if (this.open) {
            this.open=false;
            window.removeEventListener("keydown", this);
            Game._drawVisible();
            return; //already open, closed it!
        }
        this.selected=null;
        this.open=true;
        this._drawScreen();
        window.addEventListener("keydown", this);
    },
    _drawScreen: function() {
        Game.display.clear();
        this.drawCentredText(0,"----- ITEMS -----");
        if (Game.player.inventory.length <= 0) {
            this.drawCentredText(2,"You don't have anything yet!");
        }
        else {
            //let letters=['a','b','c','d','e','f','g','h','i','j'];
            
            for (let i=0;i<Game.player.inventory.length;i++) {
                var infostring=this.letters[i]+" - "+Game.player.inventory[i].infoString();
                if (Game.player.inventory[i] == Game.player.wand || Game.player.inventory[i] == Game.player.armor) {
                    infostring+=" *";
                }
                Game.display.drawText(2,2+i,infostring);
            }
        }
        if (this.selected != null) {
            this.drawCentredText(2*Game.offset[1]-4,"Press [u] to use/equip the "+this.selected.name+". Press [d] to drop it.");
            this.drawCentredText(2*Game.offset[1]-6,this.selected.longDescription);
            this.drawCentredText(2*Game.offset[1]-2,"Press [x] to cancel.");
        }
        else {
            this.drawCentredText(2*Game.offset[1]-2,"Press [x] to exit.");
        }
    },
    drawCentredText: function(row, toprint) {
        let len=toprint.length;
        Game.display.drawText(Math.max(Game.offset[0]-Math.floor(len/2),1),row,toprint,2*Game.offset[0]-2);
    },

    handleEvent : function(e) {
        let code = e.keyCode;
        //let ch=String.fromCharCode(code);
        //var success=false;
        //console.log(ch);
        //console.log(this.selected);
        if (this.selected == null) {
            switch (code) {
                default:
                    if (this.codes.indexOf(code) >= 0) {
                        let itemNum = this.codes.indexOf(code);
                        if (itemNum >= 0 && itemNum < Game.player.inventory.length) {
                            this.selected = Game.player.inventory[itemNum];
                            this.selectedIndex = itemNum;
                        }
                    }
                    break;
                case 88:
                    this.selected = null;
                    this.selectedIndex = -1;
                    this.inventoryScreen();
                    return;
            }
        }
        else {
            switch (code) {
                case 85:
                    if (this.selected.uses <= 1) {
                        Game.player.inventory.splice(this.selectedIndex, 1);
                    }
                    this.selected.use();
                    this.selected = null;
                    this.selectedIndex = -1;
                    this.inventoryScreen();
                    Game.player.endTurn();
                    return;
                case 68:
                    var success=false;
                    var breaker=0;
                    while (!success && breaker < 20) {
                        for (let i=-breaker;i<=breaker;i++) {
                            for (let j=-breaker;j<=breaker;j++) {
                                let testKey=(Game.player.x+i)+','+(Game.player.y+j)+','+Game.player.z;
                                if (testKey in Game.map && Game.map[testKey].contains == null) {
                                    Game.map[testKey].contains = this.selected;
                                    success=true;
                                    break;
                                }
                            }
                            if (success) {break;}
                        }
                        breaker++;
                    }
                    if (success) {
                        Game.player.inventory.splice(this.selectedIndex,1);
                        this.selectedIndex=-1;
                        Game.sendMessage('You dropped the '+this.selected.name);
                        this.selected=null;
                        this.inventoryScreen();
                        Game.player.endTurn();
                        return;
                    }
                    else {
                        Game.sendMessage("There's no where available to drop it!");
                    }
                    break;
                case 88:
                    this.selected=null;
                    this.selectedIndex=-1;
                    break;
                default:
                    this._drawScreen();
                break;
            }
        }
        this._drawScreen();
        //this.drawCentredText(2,ch);
    },
};

var ItemBuilder = {
    itemByName: function(name) {
        switch(name) {
            default:
            case 'Coffee':
                return new Item(name,'u','#fff',{Bleeding:2,Hypothermia:50,Burning:3,Overheating:-10},'Warm, refreshing drink.','A hot cup of coffee! Warms the body, soothes the soul.',1,'drink',2);
            case 'Americano':
                return new Item(name,'u','#fcf',{Bleeding:2,Hypothermia:100,Burning:3,Overheating:-15},'Hot, the way you like it.','A hot americano! You need the kick right about now.',1,'drink',2);
            case 'Icecream':
                return new Item(name,'\u2200','#faf',{Bleeding:3,Overheating:50, Hypothermia:-10},'A cold snack.','An ice cream cone! Wow, so refreshing!',1,'eat',1);
            case 'Sundae':
                return new Item(name,'\u2200','#f4f',{Bleeding:3,Overheating:100, Hypothermia:-15},'With chocolate!','An ice cream sundae! Incredible.',1,'eat',1);
            case 'Healing Potion':
                return new Item(name,'+','#0f0',{Bleeding:20,Poison:50},'Heals the body.','A glowing green concoction to make you healthy.',1,'drink',1);
            case 'Parka':
                return new Item(name,'[','#ddf',{Bleeding:0,Hypothermia:2},'Protects from the cold.','A big toasty parka. Not much use in a fight though.',100,'wear','Armor',10);
            case 'Leather Armor':
                return new Item(name,'[','#f90',{Bleeding:1,Hypothermia:10},'Light armor.','Basic armor made from hardenned leather.',100,'wear','Armor',10);
            case 'Chainmail Armor':
                return new Item(name,'[','#ddd',{Bleeding:2},'Medium armor.','Armor made from interlocking chain links.',100,'wear','Armor',20);
            case 'Plate Armor':
                return new Item(name,'[','#0dd',{Bleeding:4},'Heavy armor.','Very protective armor. Wow!',100,'wear','Armor',40);
            case 'Dragonleather Armor':
                return new Item(name,'[','#0f0',{Bleeding:4,Burning:3,Overheating:6},'Dragon armor.','Armor made from a dragon. Definitely unethical, but it is incredibly protective.',100,'wear','Armor',50);
            case 'Snowman Armor':
                return new Item(name,'[','#fff',{Bleeding:2,Burning:1,Overheating:2},'Protects from fire.',"Armor designed by someone who didn't want their snowpeople to melt.",100,'wear','Armor',40);
            case 'Wand of Reach':
                return new Item(name,'/','#ff0',{Reach:Math.max(4,Math.floor(ROT.RNG.getUniform()*Game.level))},'Extends your portal reach.','Holding this lets you acquire portals from a greater distance.',Math.floor(ROT.RNG.getUniform()*Game.level)+10,'wield','Wand',4);
            case 'Wand of Retreat':
                return new Item(name,'/','#f00',{'Retreat':1},'For easy escape.','Zap it to immediately travel through your held portal.',Math.floor(ROT.RNG.getUniform()*(4+Game.level/6))+3,'wield','Wand',4);
            case 'Wand of Banishing':
                return new Item(name,'/','#f0f',{'Banish':1},'Banish foes.','Zap it to banish the targetting entity through your held portal.',Math.floor(ROT.RNG.getUniform()*(3+Game.level/6))+2,'wield','Wand',4);
            case 'Wand of Nerual':
                return new Item(name,'/','#0ff',{Reach:20,Banish:1},'Escape with this and win.','The mightiest wand in all the land. Escape with it for glory!',20000,'wield','Wand',20000);
        
        }
    }
};

var UseMessages = {
    Bleeding: ["You feel refreshed!","Ouch!"],
    Hypothermia: ["That warmed you up!","You feel colder!"],
    Burning: ["You put out the fire with the ","You burst in flames from the "],
    Overheating: ["That cooled you down!","You feel hotter!"],
}

function Item(name, char, color, effects,shortDescription,longDescription,uses=1,verb='use',itemType='consumable',hp=1) {
    this.name=name;
    this.uses=uses;
    this.char=char;
    this.color=color;
    this.effects=effects;
    this.verb=verb;
    this.itemType=itemType;
    this.shortDescription=shortDescription;
    this.longDescription=longDescription;
    this.hitPoints=hp;
    this.lightPasses=function() {return true;};
    this.passThrough=function() {return true;};
    this.getChar=function() {return this.char;};
    this.getColor=function() {return this.color;};
    this.infoString=function() {
        return this.name + " - "+this.shortDescription;
    };
    this.damage=function(dmg,fire=false) {
        this.hitPoints -= dmg;
        if (this.hitPoints < 0) {
            if (!fire) {
                Game.sendMessage("Your "+this.name+" was destroyed!");
            }
            else {
                Game.sendMessage("Your "+this.name+" was destroyed by the fire!");
            }
            for (let i = 0; i < Game.player.inventory.length; i++) {
                if (Game.player.inventory[i] == this) {
                    Game.player.inventory.splice(i, 1);
                }
            }
            if (Game.player.wand == this) {
                Game.player.wand = null;
            }
            else if (Game.player.armor == this) {
                Game.player.armor = null;
            }
        }
    }
    this.use = function() {
        if (this.uses<0) {
            return;
        }
        if (this.itemType == 'Armor' || this.itemType == 'Wand') {
            if (this.itemType=='Armor') {
                if (Game.player.armor != this) {
                    Game.player.armor = this;
                    Game.sendMessage("You put on the "+this.name+".");
                }
                else {
                    Game.sendMessage("You take off the "+this.name+".");
                    Game.player.armor=null;
                }
            }
            else {
                if (Game.player.wand != this) {
                    Game.player.wand = this;
                    Game.sendMessage("You wield the "+this.name+".");
                }
                else {
                    Game.sendMessage("You unwield the "+this.name+".");
                    Game.player.wand=null;
                }
            }
        }
        else {
            Game.sendMessage("You " + this.verb + " the " + this.name + ".");
            let fx = Object.keys(this.effects);
            for (let i = 0; i < fx.length; i++) {
                // Apply effects to player
                if (fx[i] in Game.player.status) {
                    var effectIndex = (this.effects[fx[i]] >= 0) ? 0 : 1;
                    Game.player.status[fx[i]] += this.effects[fx[i]];
                    if (this.effects[fx[i]] != 0) {
                        if (fx[i] == 'Burning') {
                            delete Game.player.status.Burning;
                            Game.sendMessage(UseMessages.Burning[effectIndex] + this.name + "!");
                        }
                        else {
                            Game.sendMessage(UseMessages[fx[i]][effectIndex]);
                        }
                    }
                }
                // Special effects
                if (fx[i] == 'Burning') {
                    for (let ii = -1; ii < 2; ii++) {
                        for (let jj = -1; jj < 2; jj++) {
                            let testKey = (Game.player.x + ii) + ',' + (Game.player.y + jj) + ',' + (Game.player.z);
                            if (testKey in Game.map && Game.map[testKey].entity != null && 'melt' in Game.map[testKey].entity) {
                                Game.map[testKey].entity.melt();
                            }
                        }
                    }
                }
            }
            this.uses--;
        }
    };
    if ('Banish' in this.effects || 'Retreat' in this.effects) {
        this.zap = function (targKey=null) {
            var success = false;
            if (this.uses > 0) {
                if ('Banish' in this.effects) {
                    if (Game.player.heldPortal != null) {
                        if (targKey == null) {
                            targetting.startTarget(this);
                            return success;
                        } else {
                            if (targKey in Game.map && Game.map[targKey].entity != null && Game.map[targKey].entity != Game.player) {
                                let newKey = Game.player.heldPortal.sendThrough();
                                if (newKey != null) {
                                    var moveEntity=Game.map[targKey].entity;
                                    console.log(moveEntity);
                                    Game.map[targKey].entity=null;
                                    Game.map[newKey].entity=moveEntity;
                                    let parts = targKey.split(',');
                                    if (parseInt(parts[2]) == Game.player.z) {
                                        Animator.dazzle(parseInt(parts[0]), parseInt(parts[1]), '*', ['#00f', '#0ff']);
                                    }
                                    Game.sendMessage("You banish "+moveEntity.getName()+" to "+Game.player.heldPortal.name(-1)+"!");

                                    let parts2=newKey.split(',');
                                    moveEntity.x=parseInt(parts2[0]);
                                    moveEntity.y=parseInt(parts2[1]);
                                    moveEntity.z=parseInt(parts2[2]);
                                    success=true;
                                    Game.player.endTurn();
                                }
                                else {
                                    Game.sendMessage("The banishment fizzled.");
                                }
                            }
                            else {
                                Game.sendMessage("Not a valid target.");
                            }
                        }
                    }
                    else {
                        Game.sendMessage("Must be holding a portal to banish entities to!");
                    }
                }
                else if ('Retreat' in this.effects && Game.player.heldPortal != null) {
                    let thePortal = Game.player.heldPortal;
                    let newKey = Game.player.heldPortal.sendThrough();
                    if (newKey != null) {
                        let parts = newKey.split(',');
                        Game.player.dropPortal(false,false);
                        Game.map[Game.player.getKey()].entity=null;
                        Game.player.x = parseInt(parts[0]);
                        Game.player.y = parseInt(parts[1]);
                        Game.player.z = parseInt(parts[2]);
                        console.log(newKey);
                        Game.map[newKey].entity = Game.player;
                        Animator.dazzle(Game.player.x,Game.player.y,'*',['#00f','#0ff']);
                        //Animator.shoot(thePortal.localPos(Game.player.z)[0],thePortal.localPos(Game.player.z)[1],Game.player.x,Game.player.y,'*','#00f')
                        Animator.dazzle(thePortal.localPos(Game.player.z)[0],thePortal.localPos(Game.player.z)[1],'*',['#00f','#0ff']);
                        success=true;
                        Game.sendMessage("The "+this.name+" evacuates you into "+Game.roomNames[Game.player.z]+"!");
                    }
                }
                if (success) {
                    this.uses--;
                }
            }
            else {
                for (let i = 0; i < Game.player.inventory.length; i++) {
                    if (Game.player.inventory[i] == this) {
                        Game.player.inventory.splice(i, 1);
                    }
                }
                Game.player.wand = null;
                Game.sendMessage("The "+this.name+" burns into ashes.");
                success=true;
            }
            return success;
        };
    }
}