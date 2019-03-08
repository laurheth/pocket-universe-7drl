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
            this.drawCentredText(2*Game.offset[1]-6,"Press [spacebar] to use the "+this.selected.name);
            this.drawCentredText(2*Game.offset[1]-4,this.selected.longDescription);
        }
        this.drawCentredText(2*Game.offset[1]-2,"Press [I] / [shift + i] to close.");
    },
    drawCentredText: function(row, toprint) {
        let len=toprint.length;
        Game.display.drawText(Math.max(Game.offset[0]-Math.floor(len/2),1),row,toprint,2*Game.offset[0]-2);
    },

    handleEvent : function(e) {
        let code = e.charCode;
        let ch=String.fromCharCode(code);
        //var success=false;
        switch (ch) {
            default:
            //console.log(ch);
            //console.log(this.letters);
            //console.log(this.letters.indexOf(String(ch)));
            if (this.letters.indexOf(ch)>=0) {
                let itemNum=this.letters.indexOf(ch);
                if (itemNum>=0 && itemNum < Game.player.inventory.length) {
                    //console.log('got');
                    this.selected=Game.player.inventory[itemNum];
                    this.selectedIndex=itemNum;
                }
            }
            break;
            case ' ':
                if (this.selected != null) {
                    if (this.selected.uses <= 1) {
                        Game.player.inventory.splice(this.selectedIndex,1);
                    }
                    this.selected.use();
                    this.selected=null;
                    this.selectedIndex=-1;
                    this.inventoryScreen();
                    return;
                }
            break;
            case 'I':
                this.selected=null;
                this.selectedIndex=-1;
                this.inventoryScreen();
                return;
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
                return new Item(name,'u','#fff',{Bleeding:2,Hypothermia:50,Burning:3},'Warm, refreshing drink.','A hot cup of coffee! Warms the body, soothes the soul.');
            case 'Icecream':
                return new Item(name,'\u2200','#faf',{Bleeding:2,Overheating:50},'A cold snack.','An ice cream cone! Wow, so refreshing!');
        }
    }
};

var UseMessages = {
    Bleeding: ["You feel refreshed!"],
    Hypothermia: ["That warmed you up!"],
    Burning: ["You put out the fire with the "],
    Overheating: ["That cooled you down!"],
}

function Item(name, char, color, effects,shortDescription,longDescription,uses=1) {
    this.name=name;
    this.uses=uses;
    this.char=char;
    this.color=color;
    this.effects=effects;
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
        Game.sendMessage("You use the "+this.name+".");
        let fx = Object.keys(this.effects);
        for (let i=0;i<fx.length;i++) {
            if (fx[i] in Game.player.status) {
                Game.player.status[fx[i]] += this.effects[fx[i]];
                if (this.effects[fx[i]] > 0) {
                    if (fx[i]=='Burning') {
                        delete Game.player.status.Burning;
                        Game.sendMessage(UseMessages.Burning+this.name+"!");
                    }
                    else {
                        Game.sendMessage(UseMessages[fx[i]]);
                    }
                }
            }
        }
        this.uses--;
    };
}