var game = new Phaser.Game(600, 600, Phaser.CANVAS, 'phaser', { preload: preload, create: create,update: update,render:render });
var tiles,timer,rTimer,gTimer,bTimer,gameStatus,x,y,scale,size,grid,space,select,origX,origY;

var selectedTile=null;
function preload() {
	game.load.spritesheet('tile', 'button2.png', 300, 300);
  game.load.spritesheet('select', 'select.png', 300, 300);
}
function create() {
  init();
	game.stage.backgroundColor = '#182d3b';
  tiles=game.add.group();
  tiles=game.add.group();
  select=game.add.sprite(1,1,'select');
  rBar=game.add.sprite(100,10,'tile');
  gBar=game.add.sprite(100,40,'tile');
  bBar=game.add.sprite(100,70,'tile');
  rBar.height=10;gBar.height=10;bBar.height=10;
  rBar.width=0;gBar.width=0;bBar.width=0;
  rBar.frame=5;gBar.frame=2;bBar.frame=8;
  setSize(select,scale);
  select.visible=false;
  level1();
}
function init(){
  timer=3660;
  rTimer=0; gTimer=0; bTimer=0;
  gameStatus=0;
  x = 80;
  y = 120;
  space=10;
  scale=100;
  grid=4
}
function level1() {
  for(var i=x;i<scale*grid+x;i+=scale+space){
    for(var j=y;j<scale*grid+y;j+=scale+space){
      var tile = game.add.sprite(i, j, 'tile');
      setSize(tile,scale)
      tile.inputEnabled=true;
      tiles.add(tile);
      tile.frame=parseInt(Math.random()*3)*3;
      tile.events.onInputDown.add(checkTouch, this);
      // tile.events.onInputUp.add(checkTouch, this)
    }
  }
}
function update(){
  tiles.forEachDead(function(o){
    if(gTimer>0){o.alpha+=0.1}
    else{o.alpha+=0.006}
    if(o.alpha>0.85){
      o.alive=true;
      o.alpha=1;
      o.frame=parseInt(Math.random()*3)*3;
    }
  });
  if(timer>1){
    if(bTimer>0){ timer-=0.5}
    else{ timer-- }
  }
  if(gameStatus==0&&tiles.countLiving()==-1){clearLevel();gameStatus=60}
  if(timer==1){
    timer=0;
    clearLevel();
    gameStatus=-60;
  }
  if(gameStatus<-1){
    gameStatus++;
    if(gameStatus>-2){
      level2();
    }
  }
  if(gameStatus>1){
    gameStatus--;
    if(gameStatus<4){
      level2();
    }
  }
  if(rTimer>0){ rTimer--; rBar.width=rTimer/2 }else{rTimer=0}
  if(gTimer>0){ gTimer--; gBar.width=gTimer/2 }else{gTimer=0}
  if(bTimer>0){ bTimer--; bBar.width=bTimer/2 }else{bTimer=0}
}
function render(){
  if(gameStatus<-1){game.debug.renderText("You Lost!", 275, 250,"rgb(255,255,2505)","40px Courier New");}
  if(gameStatus>3){game.debug.renderText("You Win!", 275, 250,"rgb(255,255,2505)","40px Courier New");}
  game.debug.renderText(parseInt(timer/60), 52, 42);
}
function checkTouch (tile){
  if(tile.alive){
    if(selectedTile==null){
      selectTile(tile);
    }
    else if(selectedTile==tile){
      deselect();
    }
    else if(tile.frame!==selectedTile.frame){
    }
    else{
      combineTiles(selectedTile,tile);
    }
  }
}
function selectTile(tile){
  select.x=tile.x;select.y=tile.y;
  select.visible=true;selectedTile=tile;
}
function deselect(){
  select.visible=false; selectedTile=null;
}
function combineTiles(tile1,tile2){
  deselect();
  origX=tile1.x;
  origY=tile1.y;
  var tweener =game.add.tween(tile1,origX,origY);
  tweener.to({ x: tile2.x,y: tile2.y }, 300, Phaser.Easing.Quadratic.Out, true, 0, 0);
  tile2.frame+=1;
  tweener.onComplete.add(newTile,this)
  if(tile1.frame==2){ gTimer=500 }
  if(tile1.frame==5){ rTimer=500 }
  if(tile1.frame==8){ bTimer=500 }
}
function newTile(tile){
  tile.frame=9;
  tile.alpha=0;tile.alive=false;
  tile.x=origX;tile.y=origY;
}
function clearLevel () {
  tiles.callAll('kill',this)
}
function setSize(object,size){
  object.width=size; object.height=size;
}
