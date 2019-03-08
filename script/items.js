var ItemManager = {
    open:false,
    selected:null,
    letters:['a','b','c','d','e','f','g','h','i','j'],
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
                Game.display.drawText(2,2+i,i+" - "+Game.player.inventory[i].infoString());
            }
        }
        if (this.selected != null) {
            this.drawCentredText(2*Game.offset[2]-3,"Press [spacebar] to "+this.selected.verb+" "+this.selected.name);
            this.drawCentredText(2*Game.offset[2]-2,this.selected.description);
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
        switch (ch) {
            default:
            if (this.letters.indexOf(ch)>=0) {
                let itemNum=this.letters.indexOf(ch);
                if (itemNum>=0 && itemNum < Game.player.inventory.length) {
                    this.selected=Game.player.inventoy[this.selected];
                }
            }
            break;
            case ' ':
                if (this.selected != null) {
                    Game.player.useItem(this.selected);
                    this.selected=null;
                    this.inventoryScreen();
                    return;
                }
            break;
            case 'i':
                this.selected=null;
                this.inventoryScreen();
                return;
        }
        //this.drawCentredText(2,ch);
    },
}