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
                let x=frac*(ex-sx)+sx;
                let y=frac*(ey-sy)+sy;
                Game.display.draw(x,y,char,color);
                return (t>=duration);
            },
        };
        this.anims.push(shootAnim);
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
        Animator.running=true;
        if (Animator.anims.length>0) {
            let done = Animator.anims[0].anim(Animator.anims[0].t);
            Animator.anims[0].t++;
            if (done) {
                if (Animator.anims.length>1) {
                    Animator.anims.shift();
                }
                else {
                    Animator.anims=[];
                }
            }
        }
        if (Animator.anims.length>0) {
            setTimeout(Animator.runAnimation,50);
        }
        else {
            Animator.running=false;
            Game._drawVisible();
        }
    },
};