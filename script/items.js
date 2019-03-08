var ItemManager = {
    open:false,
    selected:null,
    selectedIndex:-1,
    letters:["a","b","c","d","e","f","g","h","i","j"],
    inventoryScreen: function() {
        if (this.open) {
            this.open=false;
            window.removeEventListener("keypress", this);
            Game._drawVisible();
            return; //already open, closed it!
        }
        this.selected=null;
        this.open=true;
        this._drawScreen();
        window.addEventListener("keypress", this);
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
                Game.display.drawText(2,2+i,this.letters[i]+" - "+Game.player.inventory[i].infoString());
            }
        }
        if (this.selected != null) {
            this.drawCentredText(2*Game.offset[1]-4,"Press [u] to use the "+this.selected.name+". Press [d] to drop it.");
            this.drawCentredText(2*Game.offset[1]-6,this.selected.longDescription);
            this.drawCentredText(2*Game.offset[1]-2,"Press [I] / [shift + i] to cancel.");
        }
        else {
            this.drawCentredText(2*Game.offset[1]-2,"Press [I] / [shift + i] to close.");
        }
    },
    drawCentredText: function(row, toprint) {
        let len=toprint.length;
        Game.display.drawText(Math.max(Game.offset[0]-Math.floor(len/2),1),row,toprint,2*Game.offset[0]-2);
    },

    handleEvent : function(e) {
        let code = e.charCode;
        let ch=String.fromCharCode(code);
        //var success=false;
        console.log(ch);
        console.log(this.selected);
        if (this.selected == null) {
            switch (ch) {
                default:
                    if (this.letters.indexOf(ch) >= 0) {
                        let itemNum = this.letters.indexOf(ch);
                        if (itemNum >= 0 && itemNum < Game.player.inventory.length) {
                            this.selected = Game.player.inventory[itemNum];
                            this.selectedIndex = itemNum;
                        }
                    }
                    break;
                case 'I':
                    this.selected = null;
                    this.selectedIndex = -1;
                    this.inventoryScreen();
                    return;
            }
        }
        else {
            switch (ch) {
                case 'u':
                case 'U':
                    if (this.selected.uses <= 1) {
                        Game.player.inventory.splice(this.selectedIndex, 1);
                    }
                    this.selected.use();
                    this.selected = null;
                    this.selectedIndex = -1;
                    this.inventoryScreen();
                    Game.player.endTurn();
                    return;
                case 'd':
                case 'D':
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
                case 'I':
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
                return new Item(name,'u','#fff',{Bleeding:2,Hypothermia:50,Burning:3,Overheating:-10},'Warm, refreshing drink.','A hot cup of coffee! Warms the body, soothes the soul.',1,'drink');
            case 'Icecream':
                return new Item(name,'\u2200','#faf',{Bleeding:2,Overheating:50, Hypothermia:-10},'A cold snack.','An ice cream cone! Wow, so refreshing!',1,'eat');
            case 'Healing potion':
                return new Item(name,'+','#0f0',{Bleeding:20,Poison:50},'Heals the body.','A glowing green concoction to make you healthy.',1,'drink');
            case 'MegaParka':
                return new Item(name,'[','#ddf',{Bleeding:1,Hypothermia:1},'Protects from the cold.','The biggest parka in history. Wow!',100,'wear','Armor');
        }
    }
};

var UseMessages = {
    Bleeding: ["You feel refreshed!","Ouch!"],
    Hypothermia: ["That warmed you up!","You feel colder!"],
    Burning: ["You put out the fire with the ","You burst in flames from the "],
    Overheating: ["That cooled you down!","You feel hotter!"],
}

function Item(name, char, color, effects,shortDescription,longDescription,uses=1,verb='use',itemType='consumable') {
    this.name=name;
    this.uses=uses;
    this.char=char;
    this.color=color;
    this.effects=effects;
    this.verb=verb;
    this.itemType=itemType;
    this.shortDescription=shortDescription;
    this.longDescription=longDescription;
    this.lightPasses=function() {return true;};
    this.passThrough=function() {return true;};
    this.getChar=function() {return this.char;};
    this.getColor=function() {return this.color;};
    this.infoString=function() {
        return this.name + " - "+this.shortDescription;
    };
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
}