(function(win){

	function Stone(position, x, num, img) {
		//position:top/bottom num:石头的个数
		createjs.Shape.call(this);
		var height = img.height*num;
		var width = img.width;
		this.graphics.beginBitmapFill(img, 'repeat-y').drawRect(0, 0, width, height);
		this.x = x;
		if(position === 'top'){
			this.y = 0;
		}else{
			this.y = h-height;
		}
		this.width = width;
		this.height = height;
		stage.addChild(this);
	}

	var s = Stone.prototype = new createjs.Shape();

	s.hitTest = function(role){
		var x1 = role.x,
            y1 = role.y,
            w1 = role.width,
            h1 = role.height,
            x2 = this.x,
            y2 = this.y,
            w2 = this.width,
            h2 = this.height;
        return (x1+w1)>x2&&x1<(x2+w2)&&(y1+h1)>y2&&y1<(y2+h2);
	};

	win.Stone = Stone;
	
})(window)