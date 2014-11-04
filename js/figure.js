(function(win) {

    function Figure(x, y, img){
        this.x = x;
        this.y = y;
        this.init(img);

    }
	
	var p = Figure.prototype;
	
	p.init = function(img){
		var figureSpriteSheet = new createjs.SpriteSheet({
            "framerate": FigureCfg.FRAME_RATE,
			"images":[img],
			"frames": {
				"regX": 0,
				"regY": 0,
				"height": 50,
				"width": 60,
				"count": 15
			},
			"animations": {
				"down": {
					"frames": [0, 1, 2, 3, 4, 7, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
					"speed": FigureCfg.SPEED
				},
				"up": {
					"frames": [9, 10, 11, 12, 13, 14],
					"speed": FigureCfg.SPEED,
					"next": "down"
				},
				"die": {
					"frames": [8, 7, 6, 5]
				}
			}
		});
		
		this.sprite = new createjs.Sprite(figureSpriteSheet , FigureCfg.state);
		this.sprite.x = this.x;
        this.sprite.y = this.y;
		stage.addChild(this.sprite);
	};
	
	p.update = function(){
		var sprite = this.sprite,
			time = createjs.Ticker.getInterval()/2000;
		switch(sprite.currentAnimation) {
			case "down":
				if(sprite.y < h){
				    sprite.y = sprite.y + time * FigureCfg.GRAVITY*25;
                    FigureCfg.vy = 0;
          	    }else{
                    figure.die();
                    gameOver();
          	    }
				break;
			case "up":
				if(sprite.y > -30){
					sprite.y += time * FigureCfg.vy * FigureCfg.PROPORTION*0.5;
                    FigureCfg.vy += time * FigureCfg.GRAVITY;
			    }else{
			    	sprite.y = sprite.y + time * FigureCfg.GRAVITY*2;
                    FigureCfg.vy = 0;
			    }
				break;
			case "die":
				sprite.paused = true;
				stage.removeAllEventListeners();
                gameOverFlag = true;
				break;
		}
	};
	
	p.up = function(){
        FigureCfg.vy = -FigureCfg.JUMP_SPEED;
        FigureCfg.state = "up";
		this.sprite.gotoAndPlay("up");
	};
	
	p.die = function(){
        FigureCfg.state = "die";
        this.sprite.gotoAndPlay("die");
	};
	
	p.size = function(){
		var bounds = this.sprite.getBounds();
		return {
			w: bounds.width*FigureCfg.SCALE_X,
			h: bounds.height*FigureCfg.SCALE_Y
		}
	};
	
	p.pos = function(){
		return {
			x: this.sprite.x,
			y: this.sprite.y
		}
	};
	
	p.hitTest = function(role){
		var x1 = role.x,
            y1 = role.y,
            w1 = role.width,
            h1 = role.height,
            x2 = this.pos().x+14,
            y2 = this.pos().y+4,
            w2 = this.size().w-12,
            h2 = this.size().h-6;
        return (x1+w1)>x2&&x1<(x2+w2)&&(y1+h1)>y2&&y1<(y2+h2);
	};
	
	win.Figure = Figure;
	
})(window);
