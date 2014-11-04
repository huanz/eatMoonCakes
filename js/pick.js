(function(win){
	function Pick(x, img){
		createjs.Shape.call(this);
		this.graphics.beginBitmapFill(img).drawRect(0, 0, img.width, img.height);
		this.width = img.width;
		this.height = img.height;
		this.x = x;
		this.y = randomNum(40, h-60);
		stage.addChild(this);
		var _this = this;
		this.addEventListener("tick", function(){
			_this.tickHandler();
		});
	}	
	
	var p = Pick.prototype = new createjs.Shape();
	
	p.tickHandler = function(){
		this.x += PickCfg.SPEED;
		if(this.x < -50){
			this.x = w+50;
			this.y = randomNum(40, h-60);
			if(!this.isVisible()){
				this.visible = true;
			}
		}
		
	}
	
	p.remove = function(){
		if(this.parent){
			this.parent.removeChild(this);
		}
	}
	
	p.stop = function(){
		this.removeAllEventListeners("tick");
	}
	
	win.Pick = Pick;
})(window)
