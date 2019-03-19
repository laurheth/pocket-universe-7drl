var RoomGen = {
    //colors:['#f00','#ff0','#0f0','#0ff','#00f','#f0f'],
    roomOpts:['rectRoom','roundRoom','tRoom','caveRoom','hallRoom'],
    biomeOpts:function(biome) {
        var opts={};
        opts.tags=['temperate'];
        
        opts.items={
            'Coffee':this.chanceCurve(1,1),
            'Icecream':this.chanceCurve(1,1),
            'Americano':this.chanceCurve(10,18,0.95),
            'Sundae':this.chanceCurve(10,18,0.95),
            'Healing Potion':0.5*this.chanceCurve(1,6,0.99),
            'Bucket of Water':0.3*this.chanceCurve(6,10,0.85),
            'Parka':0.5*this.chanceCurve(2,5),
            'Leather Armor':0.5*this.chanceCurve(1,8),
            'Chainmail Armor':0.5*this.chanceCurve(4,15),
            'Plate Armor':0.5*this.chanceCurve(12,22),
            'Dragonleather Armor':0.5*this.chanceCurve(18,26),
            'Snowknight Armor':0.2*this.chanceCurve(12,15,0.95),
            'Wand of Reach':0.1*this.chanceCurve(2,26),
            'Wand of Retreat':0.1*this.chanceCurve(3,26),
            'Wand of Banishing':0.1*this.chanceCurve(4,26),
        };
        switch (biome) {
            default:
            case 'Dungeon':
                opts.wallColor='#ddd';
                opts.floorColor='#999';
                opts.tileNames=['Stone Brick Wall','Flagstone Floor'];
                opts.roomOpts=['rectRoom','tRoom','hallRoom','roundRoom'];
                opts.features={
                    lake:0.1,
                    river: 0,
                    entitycluster: 0,
                    forcluster:[],
                    liquid: 0,
                };
                opts.monsters={
                    Goblin:this.chanceCurve(1,1),
                    Dragon:0.5*this.chanceCurve(12,16,0.95),
                    Gargoyle:this.chanceCurve(3,10),
                    BronzeGolem:this.chanceCurve(6,18),
                    Snail:this.chanceCurve(1,3),
                    Wizard:this.chanceCurve(14,18),
                };
                opts.aquatic = {
                    Carp:this.chanceCurve(1,10),
                    Jellyfish:this.chanceCurve(10,16,0.95),
                    Liopleurodon:0.5*this.chanceCurve(20,26),
                };
                opts.doodads={
                    Statue:2,
                    Candelabra:2,
                };
                opts.names1=["Despair","Creeky","Harsh","Torturous","Villainous","Nasty","Bad"];
                opts.names2=["Dungeon","Oubliette","Cloister","Hall","Ruins"];
                //opts.floorChars=['.'];
                break;
            case 'WizardLand':
                opts.wallColor='#d0f';
                opts.floorColor='#96a';
                opts.tileNames=['Azurite Wall','Flagstone Floor'];
                opts.roomOpts=['rectRoom','tRoom','hallRoom','roundRoom'];
                opts.features={
                    lake:0.1,
                    river: 0,
                    entitycluster: 0,
                    forcluster:[],
                    liquid: 1,
                };
                opts.monsters={
                    Goblin:this.chanceCurve(1,1),
                    Dragon:this.chanceCurve(12,18),
                    Gargoyle:this.chanceCurve(3,10),
                    BronzeGolem:this.chanceCurve(6,18),
                    Moosetaur:this.chanceCurve(12,18,0.95),
                    FrostDemon:this.chanceCurve(4,12),
                    //FlameDemon:this.chanceCurve(4,12),
                    Salamander:this.chanceCurve(1,8),
                    Wizard:this.chanceCurve(16,26),
                    'Dimensional Shambler':0.5*this.chanceCurve(14,26),
                };
                opts.doodads={
                    Statue:2,
                    Candelabra:2,
                };
                opts.items={
                    'Healing Potion':this.chanceCurve(1,1,0.98),
                    'Wand of Reach':this.chanceCurve(2,12,0.95),
                    'Wand of Retreat':this.chanceCurve(6,20),
                    'Wand of Banishing':this.chanceCurve(10,26),
                };
                opts.names1=["Mystic","Cursed","Bewitched","Glowing","Runed","Immortal"];
                opts.names2=["Cloister","Tower","Laboratory","Manse","Hall","Study","Academy"];
                //opts.floorChars=['.'];
                break;
            case 'WizardLand_super':
                opts.wallColor='#f0f';
                opts.floorColor='#060';
                opts.tileNames=['Azurite Wall','Emerald Floor'];
                opts.roomOpts=['rectRoom','tRoom','hallRoom','roundRoom'];
                opts.features={
                    lake:0,
                    river: 0,
                    entitycluster: 0,
                    forcluster:[],
                    liquid: 1,
                };
                opts.monsters={
                    Archmage: 100,
                };
                opts.doodads={
                    Statue:2,
                    Candelabra:2,
                    Wizard:2,
                };
                opts.items={
                    'Healing Potion':this.chanceCurve(1,1,0.98),
                    'Wand of Reach':this.chanceCurve(2,12,0.95),
                    'Wand of Retreat':this.chanceCurve(6,20),
                    'Wand of Banishing':this.chanceCurve(10,26),
                };
                opts.onlyOneMonster=true;
                opts.names1=["Mystic","Cursed","Bewitched","Glowing","Runed","Immortal"];
                opts.names2=["Cloister","Tower","Laboratory","Manse","Hall","Study","Academy","Sanctum"];
                //opts.floorChars=['.'];
                break;
            case 'TwinkleZone':
                opts.wallColor='#c63';
                opts.floorColor='#b52';
                opts.tileNames=['Rock Wall','Uneven Rock Floor'];
                opts.roomOpts=['caveRoom'];
                opts.features={
                    lake:0.2,
                    river: 0,
                    entitycluster: 1.0,
                    forcluster:['Goblin','Penguin','Snail'],
                    liquid: 1,
                };
                opts.monsters={
                    Twinkles:100,
                };
                opts.doodads={
                    Statue:2,
                    Candelabra:2,
                };
                opts.onlyOneMonster=true;
                opts.items={
                    'Healing Potion':this.chanceCurve(1,1,0.98),
                    'Wand of Reach':this.chanceCurve(2,12,0.95),
                    'Wand of Retreat':this.chanceCurve(6,20),
                    'Wand of Banishing':this.chanceCurve(10,26),
                };
                opts.names1=["Mystic","Cursed","Bewitched","Glowing","Runed","Immortal"];
                opts.names2=["Cloister","Tower","Laboratory","Manse","Hall","Study","Academy","Sanctum"];
                //opts.floorChars=['.'];
            break;
            case 'Cold':
                opts.tileNames=['Ice Wall','Ice Floor'];
                opts.wallColor='#ccf';
                opts.floorColor='#bbf';
                opts.roomOpts=this.roomOpts;
                opts.tags=['cold'];
                opts.features={
                    lake:0.5,
                    river: 0.3,
                    entitycluster: 0.6,
                    forcluster:['Ice'],
                    liquid: 0,
                };
                opts.monsters={
                    FrostDemon:this.chanceCurve(4,12,0.95),
                    Penguin:2*this.chanceCurve(1,1),
                    Moose:this.chanceCurve(6,10),
                    Moosetaur:this.chanceCurve(14,18),
                    PolarBear:this.chanceCurve(12,18),
                };
                opts.names1=["Freezing","Cold","Shivering","Numb","Frozen","Icy","Arctic","Snowy"];
                opts.names2=["Expanse","Cavern","Land","Deathtrap"];
                //opts.floorChars=['.'];
                break;
            case 'MooseCave':
                opts.tileNames=['Ice Wall','Ice Floor'];
                opts.wallColor='#cff';
                opts.floorColor='#bdf';
                opts.roomOpts=['roundRoom'];
                opts.tags=['cold'];
                opts.features={
                    lake:0.3,
                    river: 0.2,
                    entitycluster: 1,
                    forcluster:['Moose'],
                    liquid: 0,
                };
                opts.monsters={
                    Bullbutter:100,
                };
                opts.doodads={
                    Ice:2,
                };
                opts.onlyOneMonster=true;
                opts.names1=["Freezing","Cold","Shivering","Numb","Frozen","Icy","Arctic","Snowy"];
                opts.names2=["Bellows"];
                //opts.floorChars=['.'];
            break;
            case 'Cave':
                opts.wallColor='#c63';
                opts.floorColor='#b52';
                opts.tileNames=['Rock Wall','Uneven Rock Floor'];
                opts.roomOpts=['caveRoom','roundRoom'];
                opts.features={
                    lake:0.5,
                    river: 0.3,
                    entitycluster: 0.5,
                    forcluster:['Boulder'],
                    liquid: 0,
                };
                opts.monsters={
                    Goblin:this.chanceCurve(1,1),
                    Dragon:0.5*this.chanceCurve(12,20),
                    Snail:this.chanceCurve(1,3),
                };
                opts.aquatic = {
                    Carp:this.chanceCurve(1,10),
                    Jellyfish:this.chanceCurve(10,16,0.95),
                    Liopleurodon:0.5*this.chanceCurve(20,26),
                };
                opts.names1=["Dark","Stoney","Deep","Echoey","Slumber","Rocky"];
                opts.names2=["Cavern","Gulch","Grotto"];
                //opts.floorChars=['.',];
                break;
            case 'DuckCave':
                opts.wallColor='#c63';
                opts.floorColor='#b52';
                opts.tileNames=['Rock Wall','Uneven Rock Floor'];
                opts.roomOpts=['roundRoom'];
                opts.features={
                    lake:0.4,
                    river: 0.3,
                    entitycluster: 1.0,
                    forcluster:['Duck Sized Horse'],
                    liquid: 0,
                };
                opts.monsters={
                    'Horse Sized Duck':100,
                };
                opts.onlyOneMonster=true;
                opts.names1=["Neigh","Quack"];
                opts.names2=["Cavern","Gulch","Grotto"];
                //opts.floorChars=['.',];
                break;
            case 'Hot':
                opts.wallColor='#f31';
                opts.floorColor='#e20';
                opts.tileNames=['Hot Stone Wall','Hot Stone Floor'];
                opts.roomOpts=this.roomOpts;
                opts.tags=['hot'];
                opts.features={
                    lake:0.3,
                    river: 0.1,
                    entitycluster: 0.5,
                    forcluster:['Boulder'],
                    liquid: 1,
                };
                opts.monsters={
                    Salamander:this.chanceCurve(1,8),
                    Dragon:0.5*this.chanceCurve(12,16),
                    LavaSnail:this.chanceCurve(10,18),
                    FlameDemon:this.chanceCurve(7,12),
                    Volcano:this.chanceCurve(16,26)/20.0,
                };
                opts.names1=["Burning","Hot","Molten","Hellish","Searing","Toasty"];
                opts.names2=["Cavern","Place","Pit","Furnace","Oven","Broiler"];
                //opts.floorChars=['.'];
                break;
            case 'DemonDen':
                opts.wallColor='#f31';
                opts.floorColor='#655';
                opts.tileNames=['Hot Stone Wall','Ashen Floor'];
                opts.roomOpts=this.roomOpts;
                opts.tags=['hot'];
                opts.features={
                    lake:0.3,
                    river: 0.1,
                    entitycluster: 0.6,
                    forcluster:['Boulder'],
                    liquid: 1,
                };
                opts.monsters={
                    Azazel:100,
                };
                opts.doodads={
                    Boulder:2,
                    Salamander:1,
                }
                opts.onlyOneMonster=true;
                opts.names1=["Burning","Hot","Molten","Hellish","Searing","Toasty"];
                opts.names2=["Throne Room"];
                //opts.floorChars=['.'];
                break;
            case 'Jungle':
                opts.wallColor='#0f0';
                opts.floorColor='#0e0';
                opts.tileNames=['Vine-covered Wall','Grass Floor'];
                opts.roomOpts=['caveRoom','roundRoom'];
                opts.features={
                    lake:0.1,
                    river: 0.2,
                    entitycluster: 0.6,
                    forcluster:['Creeping Vine'],
                    liquid: 0,
                };
                opts.monsters={
                    Snake:10,
                    Snail:10,
                };
                opts.aquatic = {
                    Carp:this.chanceCurve(1,10),
                    Jellyfish:this.chanceCurve(10,16,0.95),
                };
                opts.doodads={
                    "Creeping Vine":10,
                };
                opts.names1=["Green","Rich","Vibrant","Wooden","Leafy","Humid"];
                opts.names2=["Forest","Jungle","Wood"];
                break;
            case 'Swamp':
                opts.tileNames=['Vine-covered Wall','Moss Floor'];
                opts.wallColor='#0c3';
                opts.floorColor='#0b2';
                opts.roomOpts=['caveRoom','roundRoom'];
                opts.features={
                    lake:0.8,
                    river: 0.1,
                    entitycluster: 0.6,
                    forcluster:['Reed'],
                    liquid: 0,
                };
                opts.monsters={
                    Snake:this.chanceCurve(1,1),
                    Snail:this.chanceCurve(1,3),
                    Fountain:this.chanceCurve(1,3)/10.0,
                };
                opts.aquatic = {
                    Carp:this.chanceCurve(1,10),
                    Jellyfish:this.chanceCurve(10,16,0.95),
                };
                opts.doodads={
                    Reed:10,
                    "Creeping Vine":1,
                };
                opts.names1=["Wet","Balmy","Damp","Bug filled","Smelly","Living"];
                opts.names2=["Swamp","Fen","Marsh","Wetland"];
                break;
                //opts.floorChars=['.',','];
        }
        return opts;
    },

    generateRoom:function(k,roomSize) {
        //console.log()
        //this.rectRoom(k,roomSize);
        //var biomeList=['Dungeon','Cold','Cave','Hot','Jungle','Swamp'];
        var bigroom=false;
        if (k==0 || (k==1 && Game.level>10) || (k==2 && Game.level>20) || (Game.level>25)) {
            if (ROT.RNG.getUniform()>Math.min(0.9,(k+1)*(13/(Game.level)) ) || (Game.level>25 && k==0)) {
                roomSize[0] *= 2;
                roomSize[1] *= 2;
                bigroom=true;
            }
        }
        var biomeList = {
            Dungeon: 10,
            Cold: Math.min(10,4+Game.level),
            Cave: 10,
            Hot: Math.min(10,4+Game.level),
            Jungle: 10,
            Swamp: 10,
            WizardLand: Math.min(10,Game.level/2),
        }

        if (Game.level>25) {
            if (k==0) {
                Game.statusMessage("You've made it to the Inner Sanctum! The wand of Nerual is here; you can feel it!",'Help');
            }
            biomeList.WizardLand *= 3;
            biomeList.Swamp /= 2;
            biomeList.Jungle /= 2;
        }
        else if (Game.level == 15) {
            biomeList.Dungeon *= 3;
        }
        else if (Game.level == 10) {
            biomeList.Hot *= 3;
            biomeList.Cold /= 3;
        }
        else if (Game.level == 20) {
            biomeList.Cold *= 3;
            biomeList.Hot /= 3;
        }
        var biomeChoice=ROT.RNG.getWeightedValue(biomeList);
        var monsterProb=0.004+0.00005*Game.level;
        if (bigroom) {
            monsterProb*=0.8;
        }
        if (k==4 && Game.level==5) {
            Game.sendMessage("You hear a distant quacking sound...");
            biomeChoice='DuckCave';
            monsterProb=1;
        }
        else if (k==4 && Game.level==20) {
            Game.sendMessage("There are moose tracks everywhere here!");
            biomeChoice='MooseCave';
            monsterProb=1;
        }
        else if (k==4 && Game.level==15) {
            Game.sendMessage("The walls here have a thin layer of glitter...");
            biomeChoice='TwinkleZone';
            monsterProb=1;
        }
        else if (k==4 && Game.level==10) {
            Game.sendMessage("This whole area is billowing with smoke.");
            biomeChoice='DemonDen';
            monsterProb=1;
        }
        else if (k==4 && Game.level==26) {
            //Game.sendMessage("There are moose tracks everywhere here!");
            biomeChoice='WizardLand_super';
            monsterProb=1;
        }
        var opts=this.biomeOpts(biomeChoice);
        //console.log(opts.monsters);
        //console.log(opts.monsters);
        var roomBounds=[0,0,0,0];
        //console.log(opts);
        //var roomOpts = ['rectRoom','roundRoom','tRoom','caveRoom','hallRoom'];
        let thisRoom = ROT.RNG.getItem(opts.roomOpts);
        //console.log(roomBounds);
        newWalls=this[thisRoom](k,roomSize,opts,roomBounds,bigroom);
        if ('tileNames' in opts) {
            this.nameTiles(k,roomBounds,opts.tileNames);
        }
        //console.log(roomBounds);
        //console.log(thisRoom+' '+roomSize+' '+k);
        this.wallDirections(newWalls);
        Game.roomNames.push("The "+ROT.RNG.getItem(opts.names1)+" "+ROT.RNG.getItem(opts.names2));
        if (bigroom) {
            console.log("Big room made: "+Game.roomNames[Game.roomNames.length-1]);
        }
        Game.roomTags[k]=opts.tags;

        // Features
        if ('features' in opts) {

            if ('lake' in opts.features && opts.features.lake > ROT.RNG.getUniform()) {
                this.addLake(k, roomBounds, opts.features.liquid);
            }
            else if ('river' in opts.features && opts.features.river > ROT.RNG.getUniform()) {
                this.addRiver(k, roomBounds, opts.features.liquid);
            }

            if (bigroom) {
                if ('lake' in opts.features && 2*opts.features.lake > ROT.RNG.getUniform()) {
                    this.addLake(k, roomBounds, opts.features.liquid);
                }
                else if ('river' in opts.features && 2*opts.features.river > ROT.RNG.getUniform()) {
                    this.addRiver(k, roomBounds, opts.features.liquid);
                }
                //while ('entitycluster' in opts.features && 2*opts.features.entitycluster > ROT.RNG.getUniform() && opts.features.forcluster.length>0) {
                    //this.addEntityCluster(k,roomBounds,ROT.RNG.getItem(opts.features.forcluster));
                //}
                opts.features.entitycluster *= 3;
            }

            while ('entitycluster' in opts.features && opts.features.entitycluster > ROT.RNG.getUniform() && opts.features.forcluster.length>0) {
                opts.features.entitycluster-=0.2;
                this.addEntityCluster(k,roomBounds,ROT.RNG.getItem(opts.features.forcluster));
            }
        }

        // Place entities and stuff!
        var roomCells=[];
        roomCells = this.placeEntities(k,opts.monsters,roomBounds,monsterProb,opts.onlyOneMonster);
        if ('aquatic' in opts) {
            roomCells = this.placeEntities(k,opts.aquatic,roomBounds,2*monsterProb,false,true);
        }
        if ('doodads' in opts) {
            roomCells = this.placeEntities(k,opts.doodads,roomBounds,(bigroom) ? 0.03 : 0.05);
        }
        //console.log(opts.items);
        if (ROT.RNG.getUniform()<Math.min(0.5,(0.1 * k))) {
            var breaker=0;
            while (!this.placeItem(roomCells,opts.items) && breaker<20) {
                breaker++;
            }
        }
    },

    nameTiles: function(k,roomBounds,nameList) {
        for (let i=roomBounds[0]-2;i<roomBounds[2]+2;i++) {
            for (let j=roomBounds[1]-2;j<roomBounds[3]+2;j++) {
                let key = i+','+j+','+k;
                if (key in Game.map) {
                    if (Game.map[key].char == '#') {
                        Game.map[key].name=nameList[0];
                    }
                    else if (Game.map[key].char == '.') {
                        Game.map[key].name=nameList[1];
                    }
                }
            }
        }
    },

    chanceCurve:function(level,peak,tail=0.9) {
        var toReturn=0.0;
        var normalize=parseFloat(1+peak-level)/10.0;
        if (Game.level+5 < level) {
            toReturn=0;
        }
        else if (Game.level < level) {
            toReturn = (parseFloat(Game.level)/level)/normalize;
        }
        else {
            var toReturn;
            toReturn = Math.min(parseFloat(1+Game.level-level)/normalize,10);
            if (Game.level>peak) {
                for (let i=peak;i<Game.level;i++) {
                    toReturn *= tail;
                }
                //toReturn /= Math.abs(1+Game.level-peak);
            }
            //return toReturn;
        }
        return Math.round(10*toReturn);
    },

    placeEntities:function(k,list,roomBounds,chance,onlyOne=false,aquatic=false) {
        var roomCells=[];
        var numplaced=0;
        for (let i=roomBounds[0];i<roomBounds[2];i++) {
            for (let j=roomBounds[1];j<roomBounds[3];j++) {
                let testKey = i+','+j+','+k;
                if (testKey in Game.map && Game.map[testKey].passThrough() && ((!aquatic && Game.map[testKey].water<Game.minWater) || (aquatic && Game.map[testKey].lake) )) {
                    if (chance>ROT.RNG.getUniform() && (numplaced<1 || !onlyOne)) {
                        let entityName = ROT.RNG.getWeightedValue(list);
                        Game.addEntity(entityName,i,j,k);
                        numplaced++;
                    }
                    else {
                        roomCells.push(testKey);
                    }
                }
            }
        }
        return roomCells;
    },

    placeItem: function(roomCells,list) {
        let index = Math.floor(ROT.RNG.getUniform()*roomCells.length);
        if (roomCells[index] in Game.map && Game.map[roomCells[index]].contains==null) {
            Game.map[roomCells[index]].contains = ItemBuilder.itemByName(ROT.RNG.getWeightedValue(list));
            if (Game.map[roomCells[index]].contains.name.includes("Wand") || Game.map[roomCells[index]].contains.name.includes("Armor")) {
                if (Game.map[roomCells[index]].entity == null && ROT.RNG.getUniform() > 0.5 ) {
                    let parts=roomCells[index].split(',');
                    let px=parseInt(parts[0]);
                    let py=parseInt(parts[1]);
                    let pz=parseInt(parts[2]);
                    Game.addEntity('NormalChest',px,py,pz);
                }
            }
            return true;
        }
        return false;
    },

    rectRoom:function(k,roomSize,opts,roomBounds,bigroom=false) {
        roomBounds[0]=0; roomBounds[1]=0; roomBounds[2]=roomSize[0]; roomBounds[3]=roomSize[1];
        var newWalls=[];
        for (let i = 0; i <= roomSize[0]; i++) { //x
            for (let j = 0; j <= roomSize[1]; j++) {//y
                let newKey = i + ',' + j + ',' + k;
                
                if (!i || !j || i==roomSize[0] || j==roomSize[1]) {
                    Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);//'#';
                    newWalls.push(newKey);
                }
                else {
                    Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
                    Game.freeCells.push(newKey);
                }
            }
        }
        return newWalls;
    },

    tRoom:function(k,roomSize,opts,roomBounds,bigroom=false) {
        roomBounds[0]=0; roomBounds[1]=0; roomBounds[2]=roomSize[0]; roomBounds[3]=roomSize[1];
        var newWalls=[];
        var midpoints;
        var newKey;
        var width=Math.max(1,parseInt(Math.min(roomSize[0],roomSize[1])/5));
        midpoints=[parseInt(roomSize[1]/2),parseInt(roomSize[0]/2)];
        for (let q=0;q<2;q++) {
            for (let i=0;i<=roomSize[q];i++) {
                for (let j=-width;j<=width;j++) {
                    
                    if (q==0) {
                        newKey = i + ',' + (j+midpoints[q]) + ',' + k;
                    }
                    else {
                        newKey = (j+midpoints[q]) + ',' + i + ',' + k;
                    }
                    if ((!i || Math.abs(j)==width || i==roomSize[q])) {
                        if (!(newKey in Game.map)) {
                            Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);
                            newWalls.push(newKey);
                        }
                    }
                    else {
                        Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
                        Game.freeCells.push(newKey);
                    }
                }
            }
        }
        return newWalls;
    },

    caveRoom: function(k,roomSize,opts,roomBounds,bigroom=false) {
        var targFree=Game.freeCells.length + (roomSize[0]-2) * (roomSize[1]-2);
        let maxSteps = 3*roomSize[0] * roomSize[1]
        var x=0;
        var y=0;
        var breaker=0;
        var thickness = Math.floor(ROT.RNG.getUniform()*3)+3;
        var newWalls=[];
        while (Game.freeCells.length < targFree && breaker<maxSteps) {
            //console.log("freecells: "+(targFree - Game.freeCells.length));
            breaker++;
            this.carveHall(x,y,k,thickness,opts,newWalls);
            if (x-1 < roomBounds[0]) {roomBounds[0]=x-1;}
            if (y-1 < roomBounds[1]) {roomBounds[1]=y-1;}
            if (x+thickness/2+1 > roomBounds[2]) {roomBounds[2]=x+thickness/2+1;}
            if (y+thickness/2+1 > roomBounds[3]) {roomBounds[3]=y+thickness/2+1;}
            if (ROT.RNG.getUniform()>0.5) {
                if (ROT.RNG.getUniform()>0.5) {
                    x++;
                }
                else {
                    x--;
                }
            }
            else {
                if (ROT.RNG.getUniform()>0.5) {
                    y++;
                }
                else {
                    y--;
                }
            }
        }
        return newWalls;
    },

    hallRoom: function(k,roomSize,opts,roomBounds,bigroom=false) {
        //roomBounds=[0,0,roomSize[0],roomSize[1]];
        var targFree=Game.freeCells.length + (roomSize[0]-2) * (roomSize[1]-2);
        let maxSteps = 2*roomSize[0] * roomSize[1]
        var x=0;
        var y=0;
        var breaker=0;
        var thickness = Math.floor(ROT.RNG.getUniform()*(2 + Math.log2(Game.level)))+3;
        if (bigroom) {
            //console.log("Big hall!");
            thickness += 2;
        }
        var newWalls=[];
        var dx=0;
        var dy=0;
        var direction=this.randOrtho();
        var twistyness = 0.2 * (ROT.RNG.getUniform());
        var minmaxStraight=[Math.floor(2.5*thickness),Math.max(4*thickness,10)];
        var numStraight=0;
        while (Game.freeCells.length < targFree && breaker<maxSteps) {
            breaker++;
            this.carveHall(x,y,k,thickness,opts,newWalls);
            if (x-1 < roomBounds[0]) {roomBounds[0]=x-1;}
            if (y-1 < roomBounds[1]) {roomBounds[1]=y-1;}
            if (x+thickness/2+1 > roomBounds[2]) {roomBounds[2]=x+thickness/2+1;}
            if (y+thickness/2+1 > roomBounds[3]) {roomBounds[3]=y+thickness/2+1;}
            x+=direction[0];
            y+=direction[1];
            if (numStraight > minmaxStraight[0] && (ROT.RNG.getUniform()<twistyness || numStraight>minmaxStraight[1])) {
                numStraight=0;
                direction=this.randOrtho();
            }
            else {
                numStraight++;
            }
        }
        return newWalls;
    },

    randOrtho: function() {
        if (ROT.RNG.getUniform()>0.5) {
            if (ROT.RNG.getUniform()>0.5) {
                return [1,0];
            }
            else {
                return [-1,0];
            }
        }
        else {
            if (ROT.RNG.getUniform()>0.5) {
                return [0,1];
            }
            else {
                return [0,-1];
            }
        }
    },

    carveHall: function(x,y,z,thickness,opts,newWalls) {
        //roomBounds=[0,0,roomSize[0],roomSize[1]];
        for (let i=0;i<thickness;i++) {
            for (let j=0;j<thickness;j++) {
                let newKey=(x+i)+','+(y+j)+','+z;
                if (!i || !j || (i+1)==thickness || (j+1)==thickness) {
                    if (!(newKey in Game.map)) {
                        Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);
                        newWalls.push(newKey);
                    }
                }
                else {
                    if (!(newKey in Game.map) || Game.map[newKey].char=='#') {
                        Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
                        Game.freeCells.push(newKey);
                    }
                }
            }
        }
        return newWalls;
    },

    roundRoom:function(k,roomSize,opts,roomBounds,bigroom=false) {
        roomBounds[0]=0; roomBounds[1]=0; roomBounds[2]=roomSize[0]; roomBounds[3]=roomSize[1];
        var newWalls=[];
        var radius=[parseInt(roomSize[0]/2),parseInt(roomSize[1]/2)];
        for (let i=-radius[0]-1;i<=radius[0]+1;i++) {
            for (let j=-radius[1]-1;j<=radius[1]+1;j++) {
                let newKey = (i+radius[0]) + ',' + (j+radius[1]) + ',' + k;
                if ((Math.pow((i/parseFloat(radius[0])),2.0) + Math.pow((j/parseFloat(radius[1])),2.0)) > 1 ) {
                    Game.map[newKey] = new Tile('#',opts.wallColor,false,false,null,-1);
                    newWalls.push(newKey);
                }
                else {
                    Game.map[newKey] = new Tile('.',opts.floorColor,true,true,null,-1);
                    Game.freeCells.push(newKey);
                }
            }
        }
        return newWalls;
    },

    addEntityCluster : function(k, roomBounds,entityName,steps=-1) {
        let sx=Math.floor(ROT.RNG.getUniform()*(roomBounds[2]-roomBounds[0])) + roomBounds[0];
        let sy=Math.floor(ROT.RNG.getUniform()*(roomBounds[3]-roomBounds[1])) + roomBounds[1];
        var x = sx;
        var y = sy;
        if (steps<0) {
            steps = Math.floor(ROT.RNG.getUniform()*20)+20;
        }
        while (steps>0) {
            let dir=this.randOrtho();
            x+=dir[0];
            y+=dir[1];
            Game.addEntity(entityName,x,y,k);
            steps--;
            if (x<roomBounds[0] || x>roomBounds[2] || y < roomBounds[1] || y>roomBounds[3]) {
                x=sx;
                y=sy;
            }
        }
    },

    addRiver : function(k,roomBounds,liquidType,width=-1) {
        if (width<0) {width=Math.floor(ROT.RNG.getUniform()*3)+1;}
        var direction;
        var x;
        var y;
        var steps;
        if (ROT.RNG.getUniform()>0.5) {
            direction=[1,0];
            x = roomBounds[0];
            y = (roomBounds[1]+roomBounds[3])/2;
            steps=roomBounds[2]-roomBounds[0];
        }
        else {
            direction=[0,1];
            y = roomBounds[1];
            x = (roomBounds[0]+roomBounds[2])/2;
            steps=roomBounds[3]-roomBounds[1];
        }
        x = Math.floor(x);
        y = Math.floor(y);
        for (let i=-1;i<=steps+5;i++) {
            if (ROT.RNG.getUniform()>0.5) {
                if (ROT.RNG.getUniform()>0.5) {
                    width++;
                }
                else {
                    width--;
                }
                if (width<1) {width=1;}
            }
            if (ROT.RNG.getUniform()>0.5) {
                if (ROT.RNG.getUniform()>0.5) {
                    x+=direction[1];
                    y+=direction[0];
                }
                else {
                    x-=direction[1];
                    y-=direction[0];
                }
            }
            for (let j=-width;j<width;j++) {
                this.makeLiquidTile(x+i*direction[0]+j*direction[1],y+i*direction[1]+j*direction[0],k,liquidType);
            }
        }
    },

    addLake : function(k, roomBounds,liquidType,steps=-1) {
        let sx=Math.floor(ROT.RNG.getUniform()*(roomBounds[2]-roomBounds[0])) + roomBounds[0];
        let sy=Math.floor(ROT.RNG.getUniform()*(roomBounds[3]-roomBounds[1])) + roomBounds[1];
        var x = sx;
        var y = sy;
        if (steps<0) {
            steps = Math.floor(ROT.RNG.getUniform()*40)+40;
        }
        while (steps>0) {
            let dir=this.randOrtho();
            x+=dir[0];
            y+=dir[1];
            this.makeLiquidTile(x,y,k,liquidType);
            steps--;
            if (x<roomBounds[0] || x>roomBounds[2] || y < roomBounds[1] || y>roomBounds[3]) {
                x=sx;
                y=sy;
            }
        }
    },

    // Water features
    makeLiquidTile : function(x,y,z,liquidType) {
        let testKey = x+','+y+','+z;
        if (testKey in Game.map && Game.map[testKey].passThrough()) {
            Game.map[testKey].water=Game.minWater*2;
            Game.map[testKey].nextWater=Game.minWater*2;
            Game.map[testKey].liquidType=liquidType;
            Game.map[testKey].nextLiquidType=liquidType;
            Game.map[testKey].lake=true;
            if (Game.freeCells.indexOf(testKey)>=0) {
                Game.freeCells.splice(Game.freeCells.indexOf(testKey),1); // remove option of spawning here
            }
        }
    },

    wallDirections:function(newWalls) {
        // clean up extraneous walls
        for (let q=0;q<newWalls.length;q++) {
            let parts = newWalls[q].split(',');
            let px = parseInt(parts[0]);
            let py = parseInt(parts[1]);
            let pz = parseInt(parts[2]);
            var neighbours=0;
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    let testkey = (px+i)+','+(py+j)+','+pz;
                    if (!(testkey in Game.map) || !Game.map[testkey].passThrough()) {
                        neighbours++;
                    }
                }
            }
            if (neighbours == 9) {
                delete Game.map[newWalls[q]];
            }
        }
        //console.log(newWalls);
        var orientations = [
            [
                [2,0,2],
                [-1,0,1],
                [2,0,2]
            ],
            [
                [2,-1,2],
                [0,0,0],
                [2,1,2]
            ],
            [
                [2,0,2],
                [1,0,-1],
                [2,0,2]
            ],
            [
                [2,1,2],
                [0,0,0],
                [2,-1,2]
            ],
        ];
        for (let q=0;q<newWalls.length;q++) {
            let newKey=newWalls[q];
            if (!newKey in Game.map) {
                continue;
            }
            let parts = newKey.split(',');
            let px = parseInt(parts[0]);
            let py = parseInt(parts[1]);
            let pz = parseInt(parts[2]);
            var newDir=-1;
            var wallCount=0;
            var options=[true,true,true,true];
            for (let i=-1;i<2;i++) {
                for (let j=-1;j<2;j++) {
                    let testKey=(px+i)+','+(py+j)+','+pz;
                    var thisTile;
                    if (!(testKey in Game.map)) {
                        thisTile=-1;
                    }
                    else if (Game.map[testKey].passThrough()) {
                        thisTile=1;
                    }
                    else {
                        thisTile=0;
                    }
                    for (let qq=0;qq<4;qq++) {
                        if (orientations[qq][j+1][i+1]==2) {
                            continue;
                        }
                        options[qq] &= (thisTile == orientations[qq][j+1][i+1]);
                    }
                }
            }
            for (let qq=0;qq<4;qq++) {
                if (options[qq]) {
                    newDir=qq;
                }
            }
            if (newDir>=0) {
                Game.walls.push(newKey);
                Game.map[newKey].setDirection(newDir);
                //console.log(newDir + ','+Game.map[newKey].getDirection());
            }
        }
    },
};