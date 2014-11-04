var MainCfg = {
    framerate:60
};
var FigureCfg = {
    state:'down',
    vy:0,
    picks:0,//月饼拾取数
    FRAME_RATE:20,
    SCALE_X:1,//X轴缩放
    SCALE_Y:1,//Y轴缩放
    GRAVITY:9.8,//重力加速度
    JUMP_SPEED:5,//垂直速度
    PROPORTION:100/1,//游戏与实际的距离比例
    SPEED: 1//跳跃速度
};
var PickCfg = {
    SCALE_Y:0,
    SPEED:-2
};
var StoneCfg = {
    SPEED:-2,
    COUNT:0,
    SPACE_X:200,
    SPACE_Y: 250,
    STONE_WIDTH:0,
    STONE_HEIGHT:0
};

var coins = 0, gameOverFlag = false;
var EVENT_TYPE, stage, loader, bg, star, planet, figure, w, h, allPicks=[], usedStones=[], unusedStones=[];
var $countPick = $("picks");
var $gameView = $("game");
var $loading = $('loading');
var $mask2 = $('mask2');

//事件类型
EVENT_TYPE = !!('ontouchend' in document) ? 'touchstart' : 'click';

function $(id){
	return document.getElementById(id);
}

function randomNum(min, max){
	return min + Math.round(Math.random() * (max-min));
}

var paramStr ="?appId=flow&clientType=2&deviceType=4&version=v1.0";
var t = Date.now()+''+(10000+parseInt(89999*(Math.random())));
function getOrientation(){
    return window.orientation == -90 || window.orientation == 90 ? '-' : '|';
}
function init (rootPath) {
    $countPick.style.display = "block";
    $countPick.innerHTML = 0;
	$gameView.setAttribute('width', $("gameWrap").offsetWidth);
	$gameView.setAttribute('height', $("gameWrap").offsetHeight);
    window.addEventListener('touchmove', function(e){
        e.stopPropagation();
        e.preventDefault();
    }, false);

    window.addEventListener("orientationchange", function(){
        $gameView.setAttribute('width', $("gameWrap").offsetWidth);
        $gameView.setAttribute('height', $("gameWrap").offsetHeight);
        w = stage.canvas.width;
        h = stage.canvas.height;
        StoneCfg.INIT_X = w+100;
        if(getOrientation() === '|'){
            $mask2.style.display = 'none';
            resetGame();
        } else {
            bg.graphics.clear().beginLinearGradientFill(["#1b6181","#051827"], [0, 1], 0, h, 0, w).drawRect(0, 0, w, h);
            stage.update();
            $mask2.style.display = 'block';
            gameOver();

        }
    }, false);

    //ios全屏
    window.scrollTo(0, 1);
    
    //帧率设置
    if( window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ){
        //支持requestAnimationFrame的浏览器
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
    } else {
        //不支持requestAnimationFrame的浏览器
        createjs.Ticker.setFPS(MainCfg.framerate);
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
        //MainCfg.SPACE_Y = 250;
        FigureCfg.GRAVITY = 20;
        FigureCfg.PROPORTION = 200;
    }
    
	stage = new createjs.Stage($gameView);
	w = stage.canvas.width;
	h = stage.canvas.height;
	
	var manifest = [
		{src:"img/plane.png" , id:"figure"},
	    {src:"img/planet.png", id:"planet"},
	    {src:"img/star.png", id:"star"},
	    {src:"img/cake.png" , id:"pick"},
	    {src:"img/stone.png" , id:"stone"}   
	 ];
	
	 loader = new createjs.LoadQueue(false);
	 loader.addEventListener("complete" , initGame);
	 loader.addEventListener("progress" , loadingGame);
	 loader.loadManifest(manifest);

    //一些变量
    StoneCfg.INIT_X = w+100;
}

function loadingGame(e){
    $loading.innerHTML = parseInt((e.loaded || 0) * 100) + '%';
}

function finishLoad(){
    $loading.parentNode.removeChild($loading);
}

function initGame(){
	//去掉loading
	finishLoad();
	
	resetGame();
	//显示开始按钮
	var body = document.body;
	$('panel').innerHTML = '<div class="info">操控小白上下移动来避开障碍获得月饼，获得的月饼越多奖励越丰厚哦！</div><div class="btn-bar"><span id="start" class="btn">开始</span></div>';
	body.className = 'show-mask';
	$('start').addEventListener(EVENT_TYPE, function(){
		body.className = '';
		setTimeout(startGame, 500);
	}, false);
}

function startGame(){	
	//初始化
	createjs.Ticker.addEventListener("tick", tick);
	
	window.addEventListener("keydown", function(event) {
		event = event || window.event;
		if (event.keyCode === 32 && figure.state!=="die") {
			figure.up();
		}
	}, false);

	window.addEventListener(EVENT_TYPE , function(event){
        event = event || window.event;
        event.preventDefault();
        event.stopPropagation();
		if(figure.state!=="die"){
			figure.up();
		}
	}, false);

	
}

function resetGame(){
    //变量重置
    coins = 0;
    StoneCfg.SPEED = -2;
    PickCfg.SPEED = -2;
    $countPick.innerHTML = 0;
    allPicks=[];
    //allStones=[];
    usedStones=[];
    unusedStones=[];
	//清理场景
    stage.removeAllEventListeners();
	stage.removeAllChildren();
    gameOverFlag = false;

        //背景元素
	bg = new createjs.Shape();
	bg.graphics.beginLinearGradientFill(["#1b6181","#051827"], [0, 1], 0, h, 0, w).drawRect(0, 0, w, h);
	//背景里面的点缀
	star = new createjs.Bitmap(loader.getResult("star"));
	
	planet = new createjs.Bitmap(loader.getResult("planet"));
	
	stage.addChild(bg, star, planet);
	
	//生成可捡物品
	genPicks();
	//生成障碍物
    genStonePairs();
	
	//添加主角 主角的x,y位置
	figure = new Figure(Math.max(w / 2 - 60, 60), h / 2, loader.getResult("figure"));
	
	stage.update();
    if(getOrientation() === '-'){
        $mask2.style.display = 'block';
        return false;
    }
}

// 障碍物相关
var stone, distance =0;

// pick相关
var pick, hitTimer = 0;

//更新舞台处理
function tick(event){

    if(gameOverFlag){
        stage.removeAllEventListeners();
        return false;
    }
	var deltaS = event.delta/1000;
	
	//星星移动
    star.x = (star.x - deltaS*30);
	if (star.x + star.image.width*star.scaleX <= 0) { star.x = w; }
	planet.x = (planet.x - deltaS*45);
	if (planet.x + planet.image.width*planet.scaleX <= 0) { planet.x = w; }
	
	figure.update();

    //移动单位
    distance += StoneCfg.SPEED;
    if(distance <= 0){
        distance = StoneCfg.SPACE_X;
        addStonePair();
    }

    for(var j =0; j< usedStones.length; j++){
        var stonePair = usedStones[j];
        stonePair[0].x = stonePair[1].x += StoneCfg.SPEED;
        if(stonePair[0].x + stonePair[0].width >= figure.x){
            if(figure.hitTest(stonePair[0]) || figure.hitTest(stonePair[1])){
                gameOverFlag = true;
                figure.die();
                gameOver();
                break;
            }
        }
        //超出屏幕的
        if(stonePair[0].x  + stonePair[0].width < 0){
            unusedStones[unusedStones.length]  = usedStones.splice(j, 1)[0];
        }
        handlerSPP(stonePair, allPicks);
    }

	
	//检测碰撞picks
	
	for(var i =0, len = allPicks.length; i<len; i++){
		pick = allPicks[i];
		if(pick.isVisible() && pick.x+pick.width >= figure.x){
			if(figure.hitTest(pick)){
				if(hitTimer === 0){
					figure.sprite.alpha = 0.8;
					hitTimer = setTimeout(function(){
						figure.sprite.alpha = 1.0;
						clearTimeout(hitTimer);
						hitTimer = 0;
					}, 300);
				}else{
					figure.sprite.alpha = 1;
					clearTimeout(hitTimer);
					hitTimer = 0;
				}
				
				//设置为隐藏
				pick.visible = false;
                coins++;
                $countPick.innerHTML = coins;

                switch(coins){
                    case 20:
                        PickCfg.SPEED = PickCfg.SPEED-1;
                        StoneCfg.SPEED = StoneCfg.SPEED-1;
                        break;
                    case 40:
                        StoneCfg.SPACE_Y -= 50;
                        FigureCfg.GRAVITY = 15;
                        FigureCfg.PROPORTION = 150;
                        genStonePairs();
                        break;
                    case 60:
                        PickCfg.SPEED = PickCfg.SPEED-2;
                        StoneCfg.SPEED = StoneCfg.SPEED-2;
                        StoneCfg.SPACE_Y -= 50;
                        genStonePairs();
                        break;
                    case 200:
                        StoneCfg.SPACE_Y -= 50;
                        genStonePairs();
                }
				break;
			}
		}
	}
	
	
	//更新舞台
	stage.update(event);
}

// 生成可以捡的月饼
function genPicks(){
	var pickImg = loader.getResult("pick"),
		pickInitX = w+100;   //金币初始位置
	//首先生成一个计算金币大小  
	var p = new Pick(w+100, pickImg);
	allPicks.push(p);
	var pickNum = Math.floor(w / p.width);
	
	for(var i= 1; i<pickNum; i++){
		allPicks.push(new Pick(pickInitX+p.width*i+Math.random()*5, pickImg));
	}
}

// 生成石头
/*function genStone(){
	var stoneImg = loader.getResult("stone"),
		stonePairNum = Math.ceil(w / 250),   //石头对的个数
		stonePreNum = Math.ceil((h-MainCfg.SPACE_Y) / stoneImg.height);

	//初始化石头初始位置
	Stone.INITIAL_X = w+100;

	for(var i=0;i<stonePairNum;i++){
		var topNum = Math.floor(Math.random()*(stonePreNum-1))+1;
		allStones.push(handlerSP(new Stone('top', topNum, stoneImg), allPicks));
		allStones.push(handlerSP(new Stone('bottom', stonePreNum-topNum, stoneImg), allPicks));
	}
}*/

//生成所有石头对
function genStonePairs() {
    var stoneImg = loader.getResult("stone"),
        stonePrePNum = Math.ceil((h-StoneCfg.SPACE_Y) / stoneImg.height);  //一个石头对立面小石头的总个数

    for(var i=1 ; i<stonePrePNum; i++){
        unusedStones[i-1] = [];
        unusedStones[i-1].push(new Stone('top',StoneCfg.INIT_X, i, stoneImg), new Stone('bottom', StoneCfg.INIT_X, stonePrePNum-i, stoneImg));
    }
    //打乱数组
    unusedStones.sort(function(){ return 0.5 - Math.random() });
    unusedStones.sort(function(){ return 0.5 - Math.random() });
}

//添加一个石头对
function addStonePair(){
    var tmpStonePair = unusedStones.shift();
    tmpStonePair[0].x = tmpStonePair[1].x = StoneCfg.INIT_X;
    handlerSPP(tmpStonePair, allPicks);
    usedStones[usedStones.length]  = tmpStonePair;

}

// 石头对与月饼碰撞
function handlerSPP (stonePair, picks) {
    var pick;
    for(var j =0, lens = picks.length; j<lens; j++){
        pick = picks[j];
        if(pick.isVisible() && (stonePair[0].hitTest(pick) || stonePair[1].hitTest(pick))){
            pick.visible = false;
        }
    }
}


// 结束游戏
function gameOver(){
	//显示开始按钮
	var body = document.body;
    var coin = $('picks').innerHTML;
    coin = isNaN(coin) ? 0:Number(coin);
    var isWinner = false;
    var tips = '';
    if(coin>=20){
        tips = '恭喜贺喜，获得1次抽取流量币的机会！';
        isWinner = true;
    }
    if(isWinner){
        tips = '<div class="info"><span style="font-size:18px;">'+tips+'</span><br><span class="desc">(1流量币可以兑换1M流量)</span></div><div class="btn-bar"><span id="share" class="btn btn-share">分享战绩</span><span id="entryLottery" class="btn">抽取流量币</span></div>';
    }else{
        tips = '<div class="info">一共吃了'+coin+'块月饼！谁敢跟我挑战？<br><span class="desc">(获取的月饼数越多，获取流量币的几率越大)</span></div><div class="btn-bar"><span id="share" class="btn btn-share">分享战绩</span><span id="restart" class="btn">再玩一次</span></div>';
    }
	$('panel').innerHTML = tips;
	body.className = 'show-mask';

    wxData.desc = '我已经吃了'+coin+'块月饼，谁敢来挑战？';


    if(isWinner) {
        $('entryLottery').addEventListener(EVENT_TYPE, function () {
            location.href = rootPath + '/portal/entryLottery.do' + paramStr + '&score=' + escape(Base64.encode($('picks').innerHTML)) + '&t=' + escape(Base64.encode(t));
        });
    } else{
        $('restart').addEventListener(EVENT_TYPE, function(){
            body.className = '';
            setTimeout(restartGame, 500);
        }, false);
    }
    $('share').addEventListener(EVENT_TYPE, function(){
        share();
    }, false);
}

function share(){
    var ua = navigator.userAgent.toLowerCase();
    //微信：micromessenger；易信：yixin；小米:xiaomi
    if(ua.match(/micromessenger/i)=="micromessenger") {
        $('j-openbybrowser').style.display='block';

        setTimeout(function(){
            $('j-openbybrowser').style.display='none';
        }, 500);
    }else{

    }
}

// restartGame
function restartGame(){
	resetGame();
	startGame();
}