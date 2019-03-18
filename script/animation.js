var Animator={
    running: false,
    anims:[],
    shoot: function(sx,sy,ex,ey,char,color) {
        sx=sx-Game.player.x+Game.offset[0];
        sy=sy-Game.player.y+Game.offset[1];
        ex=ex-Game.player.x+Game.offset[0];
        ey=ey-Game.player.y+Game.offset[1];
        var duration=5;
        var shootAnim = {
            t:0,
            anim: function(t) {
                let frac=1.0*t/duration;
                let x=Math.round(frac*(ex-sx)+sx);
                let y=Math.round(frac*(ey-sy)+sy);
                Game.display.draw(x,y,char,color);
                return (t>=duration);
            },
        };
        this.anims.push(shootAnim);
    },

    dazzle: function(sx,sy,char,color) {
        sx=sx-Game.player.x+Game.offset[0];
        sy=sy-Game.player.y+Game.offset[1];
        var duration=10;
        var dazzleAnim = {
            t:0,
            anim: function(t) {
                let frac=1.0*t/duration;
                var radius=2*Math.sin(frac*Math.PI);
                var angle=Math.PI*frac;
                for (let i=0;i<2;i++) {
                    for (let j=0;j<8;j++) {
                        let thisR = (1-0.5*i)*radius;
                        let thisAngle = angle + 0.125*i*Math.PI + 0.25*j*Math.PI;
                        let x = sx + thisR * Math.sin(thisAngle);
                        let y = sy + thisR * Math.cos(thisAngle);
                        Game.display.draw(x,y,char,color[i]);
                    }
                }
                return (t>=duration);
            },
        };
        this.anims.push(dazzleAnim);
    },

    startAnimation() {
        if (this.anims.length>0) {
            this.runAnimation();
        }
        else {
            this.running=false;
        }
    },
    runAnimation() {
        Game._drawVisible();
        Animator.running=true;
        if (Animator.anims.length>0) {
            //let i=0;
            for (let i=Animator.anims.length-1;i>=0;i--) {
                let done = Animator.anims[i].anim(Animator.anims[i].t);
                Animator.anims[i].t++;
                if (done) {
                    if (Animator.anims.length>=1) {
                        Animator.anims.shift();
                    }
                    else {
                        Animator.anims=[];
                    }
                }
            }
            
        }
        if (Animator.anims.length>0) {
            setTimeout(Animator.runAnimation,50);
        }
        else {
            Animator.running=false;
            Game._drawLastSeen();
            Game._drawVisible();
        }
    },
};