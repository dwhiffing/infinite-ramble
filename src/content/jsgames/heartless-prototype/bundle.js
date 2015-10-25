(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

Joystick = function (game, parent) {
    /* Extend the plugin */
    Phaser.Plugin.call(this, game, parent);
    this.input = this.game.input;

    this.imageGroup = [];

    this.imageGroup.push(this.game.add.sprite(0, 0, 'compass'));
    this.imageGroup.push(this.game.add.sprite(0, 0, 'touch_segment'));
    this.imageGroup.push(this.game.add.sprite(0, 0, 'touch_segment'));
    this.imageGroup.push(this.game.add.sprite(0, 0, 'touch'));

    this.imageGroup.forEach(function (e) {
        e.anchor.set(0.5);
        e.visible=false;
        e.fixedToCamera=true;
    });
};

//Extends the Phaser.Plugin template, setting up values we need
Joystick.prototype = Object.create(Phaser.Plugin.prototype);
Joystick.prototype.constructor = Joystick;

Joystick.prototype.settings = {
    // max distance from itial touch
    maxDistanceInPixels: 200,
    singleDirection: false
};


Joystick.prototype.cursors = {
    up: false, down: false, left: false, right: false
};

Joystick.prototype.speed = {
    x:0, y:0
};

Joystick.prototype.inputEnable = function() {
    this.input.onDown.add(createCompass, this);
    this.input.onUp.add(removeCompass, this);
};

Joystick.prototype.inputDisable = function() {
    this.input.onDown.remove(createCompass, this);
    this.input.onUp.remove(removeCompass, this);
};

var initialPoint;
var createCompass = function(){
    this.imageGroup.forEach(function (e) {
        e.visible=true;
        e.bringToTop();

        e.cameraOffset.x=this.input.worldX;
        e.cameraOffset.y=this.input.worldY;

    }, this);

    this.preUpdate=setDirection.bind(this);

    initialPoint=this.input.activePointer.position.clone();

};
var removeCompass = function () {
    this.imageGroup.forEach(function(e){
        e.visible = false;
    });

    this.cursors.up = false;
    this.cursors.down = false;
    this.cursors.left = false;
    this.cursors.right = false;

    this.speed.x = 0;
    this.speed.y = 0;

    this.preUpdate=empty;
};

var empty = function(){
};

var setDirection = function() {
    var d=initialPoint.distance(this.input.activePointer.position);
    var maxDistanceInPixels = this.settings.maxDistanceInPixels;

    var deltaX=this.input.activePointer.position.x-initialPoint.x;
    var deltaY=this.input.activePointer.position.y-initialPoint.y;

    if(this.settings.singleDirection){
        if(Math.abs(deltaX) > Math.abs(deltaY)){
            deltaY = 0;
            this.input.activePointer.position.y=initialPoint.y;
        }else{
            deltaX = 0;
            this.input.activePointer.position.x=initialPoint.x;
        }
    }
    var angle = initialPoint.angle(this.input.activePointer.position);


    if(d>maxDistanceInPixels){
        deltaX = Math.cos(angle) * maxDistanceInPixels;
        deltaY = Math.sin(angle) * maxDistanceInPixels;
    }

    this.speed.x = parseInt((deltaX/maxDistanceInPixels) * 100 * -1, 10);
    this.speed.y = parseInt((deltaY/maxDistanceInPixels)*100 * -1, 10);


    this.cursors.up = (deltaY < 0);
    this.cursors.down = (deltaY > 0);
    this.cursors.left = (deltaX < 0);
    this.cursors.right = (deltaX > 0);

    this.imageGroup.forEach(function(e,i){
        e.cameraOffset.x = initialPoint.x+(deltaX)*i/3;
        e.cameraOffset.y = initialPoint.y+(deltaY)*i/3;
    }, this);

};
Joystick.prototype.preUpdate = empty;
// for browserify compatibility
if(typeof module === 'object' && module.exports) {
  module.exports = Joystick;
}
},{}],2:[function(require,module,exports){
'use strict';


/**
* @author       Jeremy Dowell <jeremy@codevinsky.com>
* @license      {@link http://www.wtfpl.net/txt/copying/|WTFPL}
*/

/**
* Creates a new `Juicy` object.
*
* @class Phaser.Plugin.Juicy
* @constructor
*
* @param {Phaser.Game} game Current game instance.
*/
Phaser.Plugin.Juicy = function (game) {

  Phaser.Plugin.call(this, game);

  /**
  * @property {Phaser.Rectangle} _boundsCache - A reference to the current world bounds.
  * @private
  */
  this._boundsCache = Phaser.Utils.extend(false, {}, this.game.world.bounds);

  /**
  * @property {number} _shakeWorldMax - The maximum world shake radius
  * @private
  */
  this._shakeWorldMax = 20;

  /**
  * @property {number} _shakeWorldTime - The maximum world shake time
  * @private
  */
  this._shakeWorldTime = 0;

  /**
  * @property {number} _trailCounter - A count of how many trails we're tracking
  * @private
  */
  this._trailCounter = 0;

  /**
  * @property {object} _overScales - An object containing overscaling configurations
  * @private
  */
  this._overScales = {};

  /**
  * @property {number} _overScalesCounter - A count of how many overScales we're tracking
  * @private
  */
  this._overScalesCounter = 0;
};


Phaser.Plugin.Juicy.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Juicy.prototype.constructor = Phaser.Plugin.Juicy;



/**
* Creates a new `Juicy.ScreenFlash` object.
*
* @class Phaser.Plugin.Juicy.ScreenFlash
* @constructor
*
* @param {Phaser.Game} game -  Current game instance.
* @param {string} color='white' - The color to flash the screen.
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.ScreenFlash = function(game, color) {
  color = color || 'white';
  var bmd = game.add.bitmapData(game.width, game.height);
  bmd.ctx.fillStyle = color;
  bmd.ctx.fillRect(0,0, game.width, game.height);

  Phaser.Sprite.call(this, game, 0,0, bmd);
  this.alpha = 0;
};

Phaser.Plugin.Juicy.ScreenFlash.prototype = Object.create(Phaser.Sprite.prototype);
Phaser.Plugin.Juicy.ScreenFlash.prototype.constructor = Phaser.Plugin.Juicy.ScreenFlash;


/*
* Flashes the screen
*
* @param {number} [maxAlpha=1] - The maximum alpha to flash the screen to
* @param {number} [duration=100] - The duration of the flash in milliseconds
* @method Phaser.Plugin.Juicy.ScreenFlash.prototype.flash
* @memberof Phaser.Plugin.Juicy.ScreenFlash
*/
Phaser.Plugin.Juicy.ScreenFlash.prototype.flash = function(maxAlpha, duration) {
  maxAlpha = maxAlpha || 1;
  duration = duration || 100;
  var flashTween = this.game.add.tween(this).to({alpha: maxAlpha}, 100, Phaser.Easing.Bounce.InOut, true,0, 0, true);
  flashTween.onComplete.add(function() {
    this.alpha = 0;
  }, this);
};

/**
* Creates a new `Juicy.Trail` object.
*
* @class Phaser.Plugin.Juicy.Trail
* @constructor
*
* @param {Phaser.Game} game -  Current game instance.
* @param {number} [trailLength=100] - The length of the trail
* @param {number} [color=0xFFFFFF] - The color of the trail
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.Trail = function(game, trailLength, color) {
  Phaser.Graphics.call(this, game, 0,0);

  /**
  * @property {Phaser.Sprite} target - The target sprite whose movement we want to create the trail from
  */
  this.target = null;
  /**
  * @property {number} trailLength - The number of segments to use to create the trail
  */
  this.trailLength = trailLength || 10;
  /**
  * @property {number} trailWidth - The width of the trail
  */
  this.trailWidth = 15.0;

  /**
  * @property {boolean} trailScale - Whether or not to taper the trail towards the end
  */
  this.trailScaling = false;

  /**
  * @property {Phaser.Sprite} trailColor - The color of the trail
  */
  this.trailColor = color || 0xFFFFFF;

  /**
  * @property {Array<Phaser.Point>} _segments - A historical collection of the previous position of the target
  * @private
  */
  this._segments = [];
  /**
  * @property {Array<number>} _verts - A collection of vertices created from _segments
  * @private
  */
  this._verts = [];
  /**
  * @property {Array<Phaser.Point>} _segments - A collection of indices created from _verts
  * @private
  */
  this._indices = [];

};

Phaser.Plugin.Juicy.Trail.prototype = Object.create(Phaser.Graphics.prototype);
Phaser.Plugin.Juicy.Trail.prototype.constructor = Phaser.Plugin.Juicy.Trail;

/**
* Updates the Trail if a target is set
*
* @method Phaser.Plugin.Juicy.Trail#update
* @memberof Phaser.Plugin.Juicy.Trail
*/


/*
* Draws a {Phaser.Polygon} or a {PIXI.Polygon} filled
*
* @method Phaser.Graphics.prototype.drawPolygon
*/

Phaser.Plugin.Juicy.Trail.prototype.drawPolygon = function (poly) {

    this.moveTo(poly.points[0].x, poly.points[0].y);

    for (var i = 1; i < poly.points.length; i += 1)
    {
        this.lineTo(poly.points[i].x, poly.points[i].y);
    }

    this.lineTo(poly.points[0].x, poly.points[0].y);

};

Phaser.Plugin.Juicy.Trail.prototype.update = function() {
  if(this.target) {
    this.x = this.target.x;
    this.y = this.target.y;
  }
};

/**
* Adds a segment to the segments list and culls the list if it is too long
*
* @param {number} [x] - The x position of the point
* @param {number} [y] - The y position of the point
*
* @method Phaser.Plugin.Juicy.Trail#addSegment
* @memberof Phaser.Plugin.Juicy.Trail
*/
Phaser.Plugin.Juicy.Trail.prototype.addSegment = function(x, y) {
  var segment;

  while(this._segments.length > this.trailLength) {
    segment = this._segments.shift();
  }
  if(!segment) {
    segment = new Phaser.Point();
  }

  segment.x = x;
  segment.y = y;

  this._segments.push(segment);
};


/**
* Creates and draws the triangle trail from segments
*
* @param {number} [offsetX] - The x position of the object
* @param {number} [offsetY] - The y position of the object
*
* @method Phaser.Plugin.Juicy.Trail#redrawSegment
* @memberof Phaser.Plugin.Juicy.Trail
*/
Phaser.Plugin.Juicy.Trail.prototype.redrawSegments = function(offsetX, offsetY) {
  this.clear();
  var s1, // current segment
      s2, // previous segment
      vertIndex = 0, // keeps track of which vertex index we're at
      offset, // temporary storage for amount to extend line outwards, bigger = wider
      ang, //temporary storage of the inter-segment angles
      sin = 0, // as above
      cos = 0; // again as above

  // first we make sure that the vertice list is the same length as we we want
  // each segment (except the first) will create to vertices with two values each
  if (this._verts.length !== (this._segments.length -1) * 4) {
    // if it's not correct, we clear the entire list
    this._verts = [];
  }

  // now we loop over all the segments, the list has the "youngest" segment at the end
  var prevAng = 0;

  for(var j = 0; j < this._segments.length; ++j) {
    // store the active segment for convenience
    s1 = this._segments[j];

    // if there's a previous segment, time to do some math
    if(s2) {
      // we calculate the angle between the two segments
      // the result will be in radians, so adding half of pi will "turn" the angle 90 degrees
      // that means we can use the sin and cos values to "expand" the line outwards
      ang = Math.atan2(s1.y - s2.y, s1.x - s2.x) + Math.PI / 2;
      sin = Math.sin(ang);
      cos = Math.cos(ang);

      // now it's time to creat ethe two vertices that will represent this pair of segments
      // using a loop here is probably a bit overkill since it's only two iterations
      for(var i = 0; i < 2; ++i) {
        // this makes the first segment stand out to the "left" of the line
        // annd the second to the right, changing that magic number at the end will alther the line width
        offset = ( -0.5 + i / 1) * this.trailWidth;

        // if trail scale effect is enabled, we scale down the offset as we move down the list
        if(this.trailScaling) {
          offset *= j / this._segments.length;
        }

        // finally we put to values in the vert list
        // using the segment coordinates as a base we add the "extended" point
        // offsetX and offsetY are used her to move the entire trail
        this._verts[vertIndex++] = s1.x + cos * offset - offsetX;
        this._verts[vertIndex++] = s1.y + sin * offset - offsetY;
      }
    }
    // finally store the current segment as the previous segment and go for another round
    s2 = s1.copyTo({});
  }
  // we need at least four vertices to draw something
  if(this._verts.length >= 8) {
    // now, we have a triangle "strip", but flash can't draw that without
    // instructions for which vertices to connect, so it's time to make those

    // here, we loop over all the vertices and pair them together in triangles
    // each group of four vertices forms two triangles
    for(var k = 0; k < this._verts.length; k++) {
      this._indices[k * 6 + 0] = k * 2 + 0;
      this._indices[k * 6 + 1] = k * 2 + 1;
      this._indices[k * 6 + 2] = k * 2 + 2;
      this._indices[k * 6 + 3] = k * 2 + 1;
      this._indices[k * 6 + 4] = k * 2 + 2;
      this._indices[k * 6 + 5] = k * 2 + 3;
    }
    this.beginFill(this.trailColor);
    this.drawTriangles(this._verts, this._indices);
    this.endFill();

  }
};






/**
* Add a Sprite reference to this Plugin.
* All this plugin does is move the Sprite across the screen slowly.
* @type {Phaser.Sprite}
*/

/**
* Begins the screen shake effect
*
* @param {number} [duration=20] - The duration of the screen shake
* @param {number} [strength=20] - The strength of the screen shake
*
* @method Phaser.Plugin.Juicy#redrawSegment
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.prototype.shake = function (duration, strength) {
  this._shakeWorldTime = duration || 20;
  this._shakeWorldMax = strength || 20;
  this.game.world.setBounds(this._boundsCache.x - this._shakeWorldMax, this._boundsCache.y - this._shakeWorldMax, this._boundsCache.width + this._shakeWorldMax, this._boundsCache.height + this._shakeWorldMax);
};


/**
* Creates a 'Juicy.ScreenFlash' object
*
* @param {string} color - The color of the screen flash
*
* @type {Phaser.Plugin.Juicy.ScreenFlash}
*/

Phaser.Plugin.Juicy.prototype.createScreenFlash = function(color) {
    return new Phaser.Plugin.Juicy.ScreenFlash(this.game, color);
};


/**
* Creates a 'Juicy.Trail' object
*
* @param {number} length - The length of the trail
* @param {number} color - The color of the trail
*
* @type {Phaser.Plugin.Juicy.Trail}
*/
Phaser.Plugin.Juicy.prototype.createTrail = function(length, color) {
  return new Phaser.Plugin.Juicy.Trail(this.game, length, color);
};


/**
* Creates the over scale effect on the given object
*
* @param {Phaser.Sprite} object - The object to over scale
* @param {number} [scale=1.5] - The scale amount to overscale by
* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
*
*/
Phaser.Plugin.Juicy.prototype.overScale = function(object, scale, initialScale) {
  scale = scale || 1.5;
  var id = this._overScalesCounter++;
  initialScale = initialScale || new Phaser.Point(1,1);
  var scaleObj = this._overScales[id];
  if(!scaleObj) {
    scaleObj = {
      object: object,
      cache: initialScale.copyTo({})
    };
  }
  scaleObj.scale = scale;

  this._overScales[id] = scaleObj;
};

/**
* Creates the jelly effect on the given object
*
* @param {Phaser.Sprite} object - The object to gelatinize
* @param {number} [strength=0.2] - The strength of the effect
* @param {number} [delay=0] - The delay of the snap-back tween. 50ms are automaticallly added to whatever the delay amount is.
* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
*
*/
Phaser.Plugin.Juicy.prototype.jelly = function(object, strength, delay, initialScale) {
  strength = strength || 0.2;
  delay = delay || 0;
  initialScale = initialScale ||  new Phaser.Point(1, 1);

  this.game.add.tween(object.scale).to({x: initialScale.x + (initialScale.x * strength)}, 50, Phaser.Easing.Quadratic.InOut, true, delay)
  .to({x: initialScale.x}, 600, Phaser.Easing.Elastic.Out, true);

  this.game.add.tween(object.scale).to({y: initialScale.y + (initialScale.y * strength)}, 50, Phaser.Easing.Quadratic.InOut, true, delay + 50)
  .to({y: initialScale.y}, 600, Phaser.Easing.Elastic.Out, true);
};

/**
* Creates the mouse stretch effect on the given object
*
* @param {Phaser.Sprite} object - The object to mouse stretch
* @param {number} [strength=0.5] - The strength of the effect
* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
*
*/
Phaser.Plugin.Juicy.prototype.mouseStretch = function(object, strength, initialScale) {
    strength = strength || 0.5;
    initialScale = initialScale || new Phaser.Point(1,1);
    object.scale.x = initialScale.x + (Math.abs(object.x - this.game.input.activePointer.x) / 100) * strength;
    object.scale.y = initialScale.y + (initialScale.y * strength) - (object.scale.x * strength);
};

/**
* Runs the core update function and causes screen shake and overscaling effects to occur if they are queued to do so.
*
* @method Phaser.Plugin.Juicy#update
* @memberof Phaser.Plugin.Juicy
*/
Phaser.Plugin.Juicy.prototype.update = function () {
  var scaleObj;
  // Screen Shake
  if(this._shakeWorldTime > 0) {
    var magnitude = (this._shakeWorldTime / this._shakeWorldMax) * this._shakeWorldMax;
    var x = this.game.rnd.integerInRange(-magnitude, magnitude);
    var y = this.game.rnd.integerInRange(-magnitude, magnitude);

    this.game.camera.x = x;
    this.game.camera.y = y;
    this._shakeWorldTime--;
    if(this._shakeWorldTime <= 0) {
      this.game.world.setBounds(this._boundsCache.x, this._boundsCache.x, this._boundsCache.width, this._boundsCache.height);
    }
  }

  // over scales
  for(var s in this._overScales) {
    if(this._overScales.hasOwnProperty(s)) {
      scaleObj = this._overScales[s];
      if(scaleObj.scale > 0.01) {
        scaleObj.object.scale.x = scaleObj.scale * scaleObj.cache.x;
        scaleObj.object.scale.y = scaleObj.scale * scaleObj.cache.y;
        scaleObj.scale -= this.game.time.elapsed * scaleObj.scale * 0.35;
      } else {
        scaleObj.object.scale.x = scaleObj.cache.x;
        scaleObj.object.scale.y = scaleObj.cache.y;
        delete this._overScales[s];
      }
    }
  }
};

// for browserify compatibility
if(typeof module === 'object' && module.exports) {
  module.exports = Phaser.Plugin.Juicy;
}



// Draw Triangles Polyfill for back compatibility
if(!Phaser.Graphics.prototype.drawTriangle) {
  Phaser.Graphics.prototype.drawTriangle = function(points, cull) {
      var triangle = new Phaser.Polygon(points);
      if (cull) {
          var cameraToFace = new Phaser.Point(this.game.camera.x - points[0].x, this.game.camera.y - points[0].y);
          var ab = new Phaser.Point(points[1].x - points[0].x, points[1].y - points[0].y);
          var cb = new Phaser.Point(points[1].x - points[2].x, points[1].y - points[2].y);
          var faceNormal = cb.cross(ab);
          if (cameraToFace.dot(faceNormal) > 0) {
              this.drawPolygon(triangle);
          }
      } else {
          this.drawPolygon(triangle);
      }
      return;
  };

  /*
  * Draws {Phaser.Polygon} triangles
  *
  * @param {Array<Phaser.Point>|Array<number>} vertices - An array of Phaser.Points or numbers that make up the vertices of the triangles
  * @param {Array<number>} {indices=null} - An array of numbers that describe what order to draw the vertices in
  * @param {boolean} [cull=false] - Should we check if the triangle is back-facing
  * @method Phaser.Graphics.prototype.drawTriangles
  */

  Phaser.Graphics.prototype.drawTriangles = function(vertices, indices, cull) {

      var point1 = new Phaser.Point(),
          point2 = new Phaser.Point(),
          point3 = new Phaser.Point(),
          points = [],
          i;

      if (!indices) {
          if(vertices[0] instanceof Phaser.Point) {
              for(i = 0; i < vertices.length / 3; i++) {
                  this.drawTriangle([vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]], cull);
              }
          } else {
              for (i = 0; i < vertices.length / 6; i++) {
                  point1.x = vertices[i * 6 + 0];
                  point1.y = vertices[i * 6 + 1];
                  point2.x = vertices[i * 6 + 2];
                  point2.y = vertices[i * 6 + 3];
                  point3.x = vertices[i * 6 + 4];
                  point3.y = vertices[i * 6 + 5];
                  this.drawTriangle([point1, point2, point3], cull);
              }

          }
      } else {
          if(vertices[0] instanceof Phaser.Point) {
              for(i = 0; i < indices.length /3; i++) {
                  points.push(vertices[indices[i * 3 ]]);
                  points.push(vertices[indices[i * 3 + 1]]);
                  points.push(vertices[indices[i * 3 + 2]]);
                  if(points.length === 3) {
                      this.drawTriangle(points, cull);
                      points = [];
                  }

              }
          } else {
              for (i = 0; i < indices.length; i++) {
                  point1.x = vertices[indices[i] * 2];
                  point1.y = vertices[indices[i] * 2 + 1];
                  points.push(point1.copyTo({}));
                  if (points.length === 3) {
                      this.drawTriangle(points, cull);
                      points = [];
                  }
              }
          }
      }
  };
}
},{}],3:[function(require,module,exports){
var arrowPNG, spray;

var Arrow = function(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, "arrow", frame);
  this.animations.add('whi', [0]);
  this.animations.add('red', [1]);
  this.animations.add('yel', [2]);
  this.animations.add('blu', [3]);
	spray = 40;
  game.physics.enable(this)
  this.body.allowGravity = false;

}

Arrow.prototype = Object.create(Phaser.Sprite.prototype)
Arrow.prototype.constructor = Arrow;

Arrow.prototype.shoot = function(opts) {
  var opts = opts || {},
      x = opts.x || 0,
      y = opts.y || 0,
      speed = opts.speed || 10,
      pierce = opts.pierce || 0,
      spread = opts.spread || 0,
      power = opts.power || 1,
      frame = opts.frame || 'whi';
	this.reset(x, y)

  this.power = opts.power;

	this.animations.play(frame);
	this.health = pierce;
	this.body.velocity.x = -speed + Math.floor(Math.random() * (spray - ( -spray) + 1) + ( -spray));
	this.body.velocity.y = Math.floor(Math.random() * (spread - ( -spread) + 1) + ( -spread));
	this.lastEnemy = null;
}

Arrow.prototype.update = function(_enemy) {
  if (this.x < -10) this.kill()
}
Arrow.prototype.hit = function(_enemy) {
	if (this.lastEnemy != _enemy && !_enemy.jumping) {
		this.lastEnemy = _enemy;
    _enemy.damage(this.power)
		this.damage(1);
	};
}

module.exports = Arrow
},{}],4:[function(require,module,exports){
// a bow manages an entities ability to shoot arrows
// and what stats those arrows have
var Bow = function(parent) {
	this.parent = parent
  this.event = game.time.events.loop(Phaser.Timer.SECOND, this.parent.shoot, this.parent);
	this.resetStats();
}

Bow.prototype = Object.create(Object)
Bow.prototype.constructor = Bow;

Bow.prototype.resetStats = function() {
	// the amount of milliseconds between shots
	this.event.delay = firerate = 1000;
	// the amount of damage the bullets do
	power = 10;
	// the speed that the bullets move
	speed = 200;
	// the amount that the bullets deviate up/down
	spread = 10;
	// the amount of bullets fired per shot
	shell = 1;
	// the amount of enemies a bullet can hit before dying
	pierce = 1;
}

Bow.prototype.updateStats = function(heartCounts) {
	var numRed = heartCounts[1];
	var numYellow = heartCounts[2];
	var numBlue = heartCounts[3];
	speed = (200 + 20 * numRed)- 4*numYellow;
	power = (2 + 1 * numRed)/(((numBlue+numYellow)/8)+1);
	pierce = 1 + Math.floor(0.5 * numRed);
	this.event.delay = firerate = 1000/((numYellow*0.5)+1);
	shell = 1 + numBlue;
	spread = Math.max(0, (10 + (3*numYellow + 6*numBlue) - (6*numRed)-speed/6));
	if (power < 1) power = 1;
}

Bow.prototype.shoot = function(x,y) {
	// pain = (game.player.numHearts / 10) * (power / 8);
	// if (pain > 0) {
	// 	game.player.damage(pain);
	// }

	// FlxG.play(shootWAV,0.5);
	for (var i = shell; i > 0; i--) {
		var bullet = game.arrowGroup.getFirstDead();
		if (bullet) {
			var opts = {
				x: x,
				y: y,
				speed: speed,
				spread: spread,
				pierce: pierce,
				power: power,
				frame:'whi'
			}
			bullet.shoot(opts);
		}
	}
}

module.exports = Bow
},{}],5:[function(require,module,exports){
var type, mAngle, dist;

var Heart = function(game, opts) {
  Phaser.Sprite.call(this, game, -20, -20, "heart");
	this.anchor.set(0.5, 0.5)
  dist = 35;
  this.alpha = 0.9;
  game.physics.enable(this);
  this.body.enable = false;
	this.kill();
}

Heart.prototype = Object.create(Phaser.Sprite.prototype)
Heart.prototype.constructor = Heart;

Heart.prototype.update = function() {
  if (this.alive) {
    if (!this.flying) {
      this.x = game.player.x+2 + dist * Math.cos(this.mAngle);
      this.y = game.player.y - game.player.height/2 + dist * Math.sin(this.mAngle);
      this.mAngle += 0.02;
      if (this.mAngle >= 6.316) this.mAngle = 0;
    }
  }
}

Heart.prototype.recycle = function(_type) {
	this.reset(300, 300);
  this.mAngle = 0;
	type = _type;
  this.body.enable = false;
	this.flying = false;
  this.tint = this.typeToColour(type)
  this.createTrail(type);
}

Heart.prototype.fly = function(_enemy) {
	var dx = (game.player.x) - (this.x);
	var dy = (game.player.y-30) - (this.y);
	var a = Math.atan2(dy, dx);
  this.body.enable = true;
  this.body.velocity.x = Math.cos(a) * 300;
  this.body.velocity.y = Math.sin(a) * 300;
  this.flying = true;
	this.lifespan = 150;
}

Heart.prototype.createTrail = function(type) {
  if (!game.enableHeartTrails) return
  if (!this.trail) {
    this.trail = game.juicy.createTrail(1, 0xffffaa);
    this.trail.trailScaling = true;
    this.trail.alpha = 0.35;
    this.trail.trailWidth = 5;
    game.trailGroup.add(this.trail);
  }
  this.trail.trailLength = 0;
  game.time.events.add(200, function(){
    this.trail.trailLength =15
  }, this)
  this.trail.target = this
  this.trail.trailColor = this.typeToColour(type)
  var self = this
  setInterval(function(){
      self.trail.addSegment(self.x, self.y);
      self.trail.redrawSegments(self.x, self.y);
    }, 10);
}

Heart.prototype.typeToColour = function(type) {
  if (type == 0) {
    return 0xffffff
  } else if (type == 1) {
    return 0xff0000
  } else if (type == 2) {
    return 0xffff00
  } else if (type == 3) {
    return 0x0000ff
  }
}

Heart.prototype.kill = function() {
  if (this.trail) {
    game.time.events.add(200, function(){
      this.trail.target = null;
    }, this)
  }
  this.body.enable = false;
  Phaser.Sprite.prototype.kill.call(this);
}
module.exports = Heart
},{}],6:[function(require,module,exports){
var typebunchSize, randT, types;

var White = require('./entity/White.js');
var Red = require('./entity/Red.js');
var Yellow = require('./entity/Yellow.js');
var Blue = require('./entity/Blue.js');

var Spawner = function() {
  game.enemyGroup = game.add.group();
  types = [White, Red, Yellow, Blue]

  for (var i = 0; i < 3; i++) {
		for (var j = 0; j < types.length; j++) {
			var enemy = new types[j];
			game.enemyGroup.add(enemy);
		}
	}

  game.time.events.loop(Phaser.Timer.SECOND*2, this.release, this);
}

Spawner.prototype.constructor = Spawner;


Spawner.prototype.release = function() {
	//intro
	type = 0; launchTimer = 1000; bunchSize = 3;

	for (var i = bunchSize; i > 0; i--){
		var enemy = game.enemyGroup.getFirstDead();
		if (enemy != null) {
			enemy.recycle(type);
		}
	}
}

module.exports = Spawner
},{"./entity/Blue.js":7,"./entity/Red.js":11,"./entity/White.js":12,"./entity/Yellow.js":13}],7:[function(require,module,exports){
var Enemy = require('./Enemy.js');

var Blue = function() {
  this.name = "Enemy";
  this.heartType = 3;
  Enemy.call(this, 200, 200, "helmet");
  this.numJumps = 2;
  this.maxHealth =50;
  this.minSpeed = 25;
  this.maxSpeed = 35;
}

Blue.prototype = Object.create(Enemy.prototype)
Blue.prototype.constructor = Blue;

module.exports = Blue

},{"./Enemy.js":8}],8:[function(require,module,exports){
var Entity = require('./Entity.js');

// Enemy is abstract
var Enemy = function(x,y,key) {
	this.name = "Enemy";
	Entity.call(this, 200, 200, key);

	this.animations.add("walk", [0, 1, 2, 1], 2, true);
	this.animations.add("hurt", [4, 3], 10, true);

	this.kill();
}

Enemy.prototype = Object.create(Entity.prototype)
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
  this.z = this.y;
	if(this.x > game.trueWidth+50) {
    this.kill()
  }
	Entity.prototype.update.call(this)
}

Enemy.prototype.recycle = function(_type) {
	this.spawn();
}

Enemy.prototype.spawn = function() {
  //initialize enemy
  var randX = game.rnd.integerInRange(-200, -20)
  var randY = game.rnd.integerInRange(130, 230)
  this.runSpeed = game.rnd.integerInRange(this.minSpeed, this.maxSpeed)

  this.reset(randX, randY);
  this.body.velocity.x = this.runSpeed;
	this.jumpDamage = this.maxHealth/this.numJumps;
  this.health = this.maxHealth
}

Enemy.prototype.kill = function() {
	Entity.prototype.kill.call(this)
}

Enemy.prototype.damage = function(damage, jumpedOn) {
  if (jumpedOn) {damage = this.jumpDamage;console.log(damage, this.jumpDamage, this.health)}
	game.time.events.add(500, function() {
    this.animations.play("walk");
    this.alpha = 1
    this.body.velocity.x = this.runSpeed;
  }, this)

  this.alpha = 0.7
	this.body.velocity.x /= 4;

	Entity.prototype.damage.call(this, damage)
}

Enemy.prototype.jump = function() {
	// velocity.y = Math.floor(Math.random() * (-450 - -300 + 1) + -300);
	// FlxG.play(jumpWAV);
  Entity.prototype.jump.call(this);
}

module.exports = Enemy

},{"./Entity.js":9}],9:[function(require,module,exports){
var jumpHeight, invTimer;

// #ntity is an abstract class that enemy and player inherit from
// its purpose is to reduce duplication between enemy/player
var Entity = function(x, y, key, group, shadowGroup) {
  Phaser.Sprite.call(this, game, x, y, key);

  // entity anchor is defined as the center of its 'feet'
  // ( halfway across its x, and at the bottom of its y ) // this makes jumping easier
  this.anchor.setTo(0.5, 1)
  game.physics.enable(this)
  this.body.allowGravity = false;

  this.runSpeed = 100;
  this.jumping = false;
  this.body.height = 70;
}

Entity.prototype = Object.create(Phaser.Sprite.prototype);
Entity.prototype.constructor = Entity;

Entity.prototype.update = function() {}

Entity.prototype.move = function(dir, speed) {
  this.body.velocity[dir] = speed;
}

Entity.prototype.jump = function() {
  this.jumping = true;
  this.body.allowGravity = true;
  this.body.velocity.y = -300;
  this.animations.play("jump");
}

Entity.prototype.land = function() {
  this.jumping = false;
  this.body.allowGravity = false;
  this.body.velocity.y = 0
  this.animations.play("walk");
}

Entity.prototype.shoot = function() {
  this.bow.shoot(this.x-this.width/1.5, this.y-18)
}

Entity.prototype.damage = function(damage) {
  this.animations.play("hurt");
  // FlxG.play(hurtWAV);
  Phaser.Sprite.prototype.damage.call(this, damage)
}

Entity.prototype.kill = function() {
  if (this.shadow) {
    this.shadow.kill();
  }
  Phaser.Sprite.prototype.kill.call(this)
}

Entity.prototype.reset = function(x, y) {
  this.animations.play("walk");
  Phaser.Sprite.prototype.reset.call(this, x, y);
}

module.exports = Entity
},{}],10:[function(require,module,exports){
var lastHeart, multi, bestMulti, numHearts, cursors, soul, space, buffer;
var Entity = require('./Entity.js');
var Bow = require('../Bow.js');
var Heart = require('../Heart.js');

// the Player is defined as a Phaser.Sprite
var Player = function(x, y) {
  Entity.call(this, x, y, "player");
  this.name = "Player";
  this.body.height = 30;

  // extra offset is required here to center soul onto entity
  // soul is added as a child of player because
  // we always want it to match the player position
  soul = game.add.sprite(2, -16, "soul")
  soul.animations.add('life', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,])
  soul.animations.play('life', 0)
  this.addChild(soul)

   // shadow anchor is defined as its absolute center
  // shadow is not added as a child of the Entity as we need to control it separately
  this.shadow = game.add.sprite(x, y, "shadow")
  this.shadow.anchor.setTo(0.5, 0.5)
  game.physics.enable(this.shadow)
  this.shadow.body.allowGravity = false;
  this.shadow.body.maxVelocity.set(this.runSpeed, this.runSpeed/2.2);
  this.shadow.body.drag.set(550);
  game.backGroup.add(this.shadow);

  // create a collection of animations based on the frames in our spritesheet,
  // play at 2 frames per second and loop
  this.animations.add('walk', [0, 1], 2, true)
  this.animations.add('jump', [2], 2, true)
  this.animations.add('hurt', [3], 2, true)
  this.animations.add('heal', [4], 2, true)
  this.animations.add('still', [0], 2, true)
  this.animations.play('walk')

  // create a Bow to track player weapon stats
  this.bow = new Bow(this);

  // initialize various vars the player will need for basic operation
  this.jumpHeight = 500;
  this.health = this.maxHealth = 100;
  lastHeart = 0;
  this.numHearts = 0;
  buffer = 50;
  multi = bestMulti = 1;

  this.heartCounts = [0,0,0,0];

  game.trailGroup = game.add.group();
  game.heartGroup = game.add.group();
  game.heartGroup.classType = Heart;
  game.heartGroup.createMultiple(15);

  cursors = game.input.keyboard.createCursorKeys();
  space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  this.invulnerableTime = 1500;

  this.flicker = game.time.create(false);
  this.flicker.loop(this.invulnerableTime/6, function(){
    this.alpha = (this.alpha === 0.5) ? 0.8 : 0.5;
  }, this)
  this.flicker.start();
  this.flicker.pause();
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.preUpdate = function() {
  if (this.jumping){
    // keep from jumping too far past shadow
    if(this.y < this.shadow.y-100) {
      this.y = this.shadow.y-100
    }
    // land if fallen past shadow and moving downwards
    if(this.y > this.shadow.y && this.body.velocity.y > 0) {
      this.land();
    }
  }
  Phaser.Sprite.prototype.preUpdate.call(this)
}


Player.prototype.update = function() {
  this.inputLogic();
  this.keepInBounds();

  // shadow is used to track 'z' position while jumping
  this.z = this.shadow.y;
  this.x = this.shadow.x || this.x;
  if (!this.jumping) this.y = this.shadow.y;

  Entity.prototype.update.call(this);
}


Player.prototype.inputLogic = function() {
  if (cursors.up.isDown) {
    this.move('y', -this.runSpeed)
  }
  else if (cursors.down.isDown) {
    this.move('y', this.runSpeed)
  }
  if (cursors.left.isDown) {
    this.move('x', -this.runSpeed)
  }
  else if (cursors.right.isDown) {
    this.move('x', this.runSpeed)
  }
  if(!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown){
    if(game.joystick.speed){
      this.move('x', -game.joystick.speed.x)
      this.move('y', -game.joystick.speed.y)
    }
  }
  if (space.isDown) {
    if (!this.jumping){
      this.jump();
      this.heal(this.numHearts*4);
    }
  }
}

Player.prototype.keepInBounds = function() {
  if (this.shadow.y < game.trueHeight/2) {
    this.shadow.y = game.trueHeight/2;
  }
  else if (this.shadow.y > game.trueHeight){
    this.shadow.y = game.trueHeight;
  }
  if (this.shadow.x < buffer) {
    this.shadow.x = buffer;
  }
  else if (this.shadow.x > game.trueWidth-buffer){
    this.shadow.x = game.trueWidth-buffer;
  }
}

Player.prototype.heal = function(healAmount) {
  if (healAmount <= 0) return;
  this.resetCombo();
  // FlxG.play(healWAV, 0.5);
  this.health += Math.ceil(healAmount);
  if (this.health > 100) {
    this.health = 100;
  }
  this.tint = 0x00ff00;
  game.time.events.add(500, function(){
    this.tint = 0xffffff;
  }, this)
}

Player.prototype.resetCombo = function() {
  lastHeart = 0;
  this.numHearts = 0;
  this.bow.resetStats();
  this.heartCounts = [0,0,0,0]
  game.heartGroup.callAllExists("fly", true);
}

Player.prototype.hit = function(_enemy) { //landed on enemy
  if (_enemy.y < this.shadow.y + 15 && _enemy.y > this.shadow.y - 15 && this.body.velocity.y > 0) {
    if (this.jumping && !_enemy.jumping) {
      this.jump(_enemy);
      _enemy.damage(_enemy.jumpDamage, true);
      this.changeBow(_enemy.heartType);
    }
  }
  if ((!this.jumping && !_enemy.jumping) || (this.jumping && _enemy.jumping)) {
    this.damage(_enemy.damage)
  }
}

Player.prototype.changeBow = function(type) {
  //FlxG.play(heartWAV, 0.3);
  this.numHearts++;
  var heart = game.heartGroup.getFirstDead();
  heart.recycle(type);
  var i = 0;
  game.heartGroup.forEachAlive(function(heart) {
    heart.mAngle = (i*(360/this.numHearts))/57; i++;
  }, this)

  this.heartCounts[type]++;
  this.bow.updateStats(this.heartCounts)
}

Player.prototype.damage = function(damage) {
  if (this.invulnerable) return
  game.juicy.shake(20,100);
  this.triggerInvulnerablity();
  Entity.prototype.damage.call(this, damage);
  soul.animations.frame = Math.ceil(this.health/(this.maxHealth/15));
}

Player.prototype.triggerInvulnerablity = function() {
  this.invulnerable = true;
  this.flicker.resume();
  game.time.events.add(this.invulnerableTime, this.endInvulnerablity, this).start
}

Player.prototype.endInvulnerablity = function() {
  this.invulnerable = false;
  this.flicker.pause();
  this.animations.play("walk");
  this.alpha = 1;
}

Player.prototype.move = function(dir, speed) {
  // the player moves via his shadow
  this.shadow.body.velocity[dir] = speed;
}

Player.prototype.shoot = function() {
  // the player can only shoot while walking
  if (!this.jumping){
    Entity.prototype.shoot.call(this);
  }
}

Player.prototype.jump = function(_enemy) {
  Entity.prototype.jump.call(this);
}

Player.prototype.reset = function(x, y, v) {
  this.shadow.reset(x, y);
  Entity.prototype.reset.call(this, x, y)
}

module.exports = Player
},{"../Bow.js":4,"../Heart.js":5,"./Entity.js":9}],11:[function(require,module,exports){
var Enemy = require('./Enemy.js');

var Red = function() {
  this.name = "Enemy";
  this.heartType = 1;
  Enemy.call(this, 200, 200, "soldier");
  this.numJumps = 1;
  this.maxHealth =20;
  this.minSpeed = 35;
  this.maxSpeed = 85;
}

Red.prototype = Object.create(Enemy.prototype)
Red.prototype.constructor = Red;

module.exports = Red

},{"./Enemy.js":8}],12:[function(require,module,exports){
var Enemy = require('./Enemy.js');

var White = function() {
  this.name = "Enemy";
  this.heartType = 0;
  Enemy.call(this, 200, 200, "skeleton");
  this.numJumps = 1;
  this.maxHealth =10;
  this.minSpeed = 45;
  this.maxSpeed = 95;
}

White.prototype = Object.create(Enemy.prototype)
White.prototype.constructor = White;

module.exports = White

},{"./Enemy.js":8}],13:[function(require,module,exports){
var Enemy = require('./Enemy.js');

var Yellow = function() {
  this.name = "Enemy";
  this.heartType = 2;
  Enemy.call(this, 200, 200, "bee");
  this.numJumps = 1;
  this.maxHealth =10;
  this.minSpeed = 115;
  this.maxSpeed = 125;
}

Yellow.prototype = Object.create(Enemy.prototype)
Yellow.prototype.constructor = Yellow;

module.exports = Yellow

},{"./Enemy.js":8}],14:[function(require,module,exports){
var ratio = window.innerHeight/window.innerWidth
window.game = new Phaser.Game(800, 450, Phaser.AUTO, 'game-container');

game.state.add('boot', require('./states/boot.js'));
game.state.add('load', require('./states/load.js'));
game.state.add('play', require('./states/play.js'));
game.state.start('boot');

},{"./states/boot.js":16,"./states/load.js":17,"./states/play.js":18}],15:[function(require,module,exports){

// Extends Phaser.Group.
// This type of group is used to display multiple subgroups to be z-sorted
// Eg. create a group for the enemies, the bullets, and the player individually
// then insert them all into a sort group and sort based on anything
var DisplayGroup = function() {
  Phaser.Group.call(this, game)
  this.drawCache = [];
}

DisplayGroup.prototype = Object.create(Phaser.Group.prototype)
DisplayGroup.prototype.constructor = DisplayGroup;

// this method overrides PIXI.DisplayObjectContainer._renderWebGL
// only commented lines were changed
DisplayGroup.prototype._renderWebGL = function(renderSession) {

  if (!this.visible || this.alpha <= 0) return;

  if (this._cacheAsBitmap) {
    this._renderCachedSprite(renderSession);
    return;
  }

  if (this._mask || this._filters) {
    if (this._filters) {
      renderSession.spriteBatch.flush();
      renderSession.filterManager.pushFilter(this._filterBlock);
    }
    if (this._mask) {
      renderSession.spriteBatch.stop();
      renderSession.maskManager.pushMask(this.mask, renderSession);
      renderSession.spriteBatch.start();
    }
    for(var i=0, j=this.drawCache.length; i<j; i++) {
      // this.children[i]._renderWebGL(renderSession);
      this.drawCache[i]._renderWebGL(renderSession);
    }
    renderSession.spriteBatch.stop();
    if (this._mask)renderSession.maskManager.popMask(this._mask, renderSession);
    if (this._filters)renderSession.filterManager.popFilter();
    renderSession.spriteBatch.start();
  }
  else {
    for(i=0,j=this.drawCache.length; i<j; i++) {
      // this.children[i]._renderWebGL(renderSession);
      this.drawCache[i]._renderWebGL(renderSession);
    }
  }
};

// this method overrides PIXI.DisplayObjectContainer._renderCanvas
// only commented lines were changed
DisplayGroup.prototype._renderCanvas = function(renderSession) {

  if (this.visible === false || this.alpha === 0) return;

  if (this._cacheAsBitmap) {
    this._renderCachedSprite(renderSession);
    return;
  }

  if (this._mask) {
    renderSession.maskManager.pushMask(this._mask, renderSession);
  }

  for(var i=0, j=this.drawCache.length; i<j; i++) {
    // this.children[i]._renderCanvas(renderSession);
    this.drawCache[i]._renderCanvas(renderSession);
  }

  if (this._mask) {
    renderSession.maskManager.popMask(renderSession);
  }
};

DisplayGroup.prototype.addChildAt = function (child, index) {
  PIXI.DisplayObjectContainer.prototype.addChildAt.call(this,child,index);
  this.drawCache.length = 0;
  this._recursiveCache(this.children);
}

// this method overrides Phaser.Group.sort, only commented lines were changed
DisplayGroup.prototype.sort = function (key, order) {

  if (this.children.length < 2) return;

  if (typeof key === 'undefined') { key = 'z'; }
  if (typeof order === 'undefined') { order = Phaser.Group.SORT_ASCENDING; }

  this._sortProperty = key;

  if (order === Phaser.Group.SORT_ASCENDING) {
    // this.children.sort(this.ascendingSortHandler.bind(this));
    this.drawCache.sort(this.ascendingSortHandler.bind(this));
  }
  else {
    // this.children.sort(this.descendingSortHandler.bind(this));
    this.drawCache.sort(this.descendingSortHandler.bind(this));
  }
  this.updateZ();
};

// added for this class
DisplayGroup.prototype._recursiveCache = function (arrayToSort) {
  // recursive function that will stick all nested children sprites in the drawCache so they're on the same level
  for (var i = 0; i < arrayToSort.length; i++) {
    if (arrayToSort[i] instanceof Phaser.Group) {
      this._recursiveCache(arrayToSort[i].children);
    }
    else {
      this.drawCache.push(arrayToSort[i]);
    }
  }
};

module.exports = DisplayGroup
},{}],16:[function(require,module,exports){
module.exports = {

  preload: function () {
    this.load.baseURL = '';
    // this.load.image('preloader', 'images/preloader.gif');
    game.time.advancedTiming = true;
  },

  create: function () {
    this.input.maxPointers = 2;

    // auto pause if window loses focus
    this.stage.disableVisibilityChange = true;

    // set up scale mode
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);
    this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
    this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);

    // double the world scale since assets are at 1/2 size
    game.world.scale.setTo(2,2)
    // disable antialiasing on scale to maintain pixel look
    game.stage.smoothed = false;

    game.state.start('load', true, false);
  },

  enterIncorrectOrientation: function () {
    game.orientated = false;
    document.getElementById('orientation').style.display = 'block';
  },

  leaveIncorrectOrientation: function () {
    game.orientated = true;
    document.getElementById('orientation').style.display = 'none';
  }
};
},{}],17:[function(require,module,exports){
module.exports = {
  constructor: function() {
    this.loadingSprite = null;
  },

  preload: function() {
    this.loadingSprite = this.add.sprite(320, 480, 'preloader');
    this.loadingSprite.anchor.setTo(0.5, 0.5);
    game.juicy = game.plugins.add(require('../Juicy.js'));
    game.joystick = game.plugins.add(require('../Joystick.js'));

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.loadingSprite);

    this.load.image('ground', 'images/ground.gif')
    this.load.image('sky', 'images/sky.gif')
    this.load.image('title', 'images/title.png')
    this.load.spritesheet('arrow', 'images/arrow.gif', 10, 5)
    this.load.spritesheet('skeleton', 'images/skeleton.gif', 32, 42)
    this.load.spritesheet('soldier', 'images/soldier.gif', 32, 42)
    this.load.spritesheet('helmet', 'images/helmet.gif', 32, 42 )
    this.load.spritesheet('bee', 'images/bee.gif', 32, 42)
    this.load.spritesheet('heart', 'images/heart.gif', 7,7)
    this.load.spritesheet('soul', 'images/pHeart.gif', 5,5)
    this.load.image('shadow', 'images/shadow.gif')
    this.load.spritesheet('player', 'images/player.gif', 32, 40)

    // this.load.sound('beat3', 'mp3/beat3.mp3')
    // this.load.sound('flatline', 'mp3/flatline.mp3')
    // this.load.sound('swarm', 'mp3/swarm.mp3')
    // this.load.sound('hurt3', 'mp3/hurt3.mp3')
    // this.load.sound('enemyJump', 'mp3/enemyJump.mp3')
    // this.load.sound('shoot', 'mp3/shoot.mp3')
    // this.load.sound('heart', 'mp3/heart.mp3')
    // this.load.sound('jump', 'mp3/jump.mp3')
    // this.load.sound('heal', 'mp3/heal.mp3')
    // this.load.sound('hurt', 'mp3/hurt.mp3')
    // this.load.sound('hit1', 'mp3/hit1.mp3')
    // this.load.sound('hit2', 'mp3/hit2.mp3')
    // this.load.sound('hit3', 'mp3/hit3.mp3')
    // this.load.sound('hit4', 'mp3/hit4.mp3')
    // this.load.sound('hit5', 'mp3/hit5.mp3')
    // this.load.sound('hit6', 'mp3/hit6.mp3')
    // this.load.sound('hit7', 'mp3/hit7.mp3')
    // this.load.sound('music', 'mp3/chippedLataren.mp3')
    // this.load.sound('instruct', 'mp3/instruction.mp3')
  },

  onLoadComplete: function() {
    game.state.start('play', true, false);
  }
}

},{"../Joystick.js":1,"../Juicy.js":2}],18:[function(require,module,exports){
var Player = require('../entities/entity/Player.js');
var Arrow = require('../entities/Arrow.js');
var Spawner = require('../entities/Spawner.js');
var Joystick = require('../Joystick.js');
var DisplayGroup = require('../lib/DisplayGroup.js');

var title, ground, sky;

module.exports = {
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 550;
    game.score = 0;
    game.musicPlaying = false;
    game.gameStarted = true;
    game.trueHeight = game.height/2;
    game.trueWidth = game.width/2;
    game.enableHeartTrails = true

    this.createBG();
    this.createEntities();
    // createGUI();
    this.game.joystick = this.game.plugins.add(Joystick);
    this.game.joystick.inputEnable();
  },

  createBG: function() {
    game.backGroup = game.add.group();
    sky = game.add.tileSprite(0,0, game.width, game.height, "sky");
    ground = game.add.tileSprite(0,0, game.width, game.height, "ground");
    ground.autoScroll(30,0);
    sky.autoScroll(5,0);
    game.backGroup.add(sky);
    game.backGroup.add(ground);
  },

  createEntities: function() {
    game.arrowGroup = game.add.group();
    game.arrowGroup.classType = Arrow;
    game.arrowGroup.createMultiple(100, 'arrow', 0)

    game.spawner = new Spawner();
    game.player = new Player(game.trueWidth-200, game.trueHeight/4);

    game.entityGroup = new DisplayGroup();
    game.entityGroup.add(game.enemyGroup);
    game.entityGroup.add(game.player);

    // add some hearts for debugging
    for (var i = 0; i< 3; i++){game.player.changeBow(1);game.player.changeBow(2); game.player.changeBow(3);}
  },

  updateScore: function(_x, _y, _score, _enemy) {
    var pnt = pointTxt(game.pointGroup.getFirstAvailable(pointTxt));
    pnt.recycle(_enemy.x + 20, _enemy.y);
    pnt.text = int((_score * multi))
      .toString();
    score += int((_score * multi));
    if (jumping) multi += 0.25;
    if (multi > bestMulti) bestMulti = multi;
  },

  createGUI: function() {
    game.gui.classType = Phaser.Text;
    game.gui = game.add.group();
    game.pointGroup = game.add.group();

    game.instruct = new Instructions();

    title = game.gui.create(10, 15, 'title')
    sub = game.gui.create(0, 35, 'sub1')
    bars = game.gui.create(0, 0, 'bars')
    scoreTxt = game.gui.create(150, 5, "");
    finalScoreTxt = game.gui.crate(100, 125, "");
  },

  update: function() {
    game.physics.arcade.overlap(game.player, game.enemyGroup, this.collidePlayer, null, this);
    game.physics.arcade.overlap(game.arrowGroup, game.enemyGroup, this.collideArrows, null, this);
    game.entityGroup.sort('z', Phaser.Group.SORT_ASCENDING);
  },

  collidePlayer: function(player, enemy) { //player and enemy collisions
    player.hit(enemy);
  },

  collideArrows: function(arrow, enemy) { //player and enemy collisions
    arrow.hit(enemy);
  },

  updateGUI: function() {
    scoreTxt.text = Reg.player.score.toString();
  },

  render: function() {
    // game.debug.body(game.player);
  }
}

},{"../Joystick.js":1,"../entities/Arrow.js":3,"../entities/Spawner.js":6,"../entities/entity/Player.js":10,"../lib/DisplayGroup.js":15}]},{},[14]);
