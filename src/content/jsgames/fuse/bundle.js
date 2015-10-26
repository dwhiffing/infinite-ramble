(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

window.game = new Phaser.Game(450, 700, Phaser.CANVASs, "game-container");

game.state.add("boot", require("./states/boot.js"));
game.state.add("load", require("./states/load.js"));
game.state.add("play", require("./states/play.js"));
game.state.start("boot");

},{"./states/boot.js":5,"./states/load.js":6,"./states/play.js":7}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Interface = (function () {
  function Interface() {
    _classCallCheck(this, Interface);

    game.stage.backgroundColor = "#182d3b";
    this.bars = [16711680, 65280, 255, 16777215].map(function (color, i) {
      var bar = game.add.graphics(25, 70 + 10 * (i + 1));
      bar.lineStyle(3, color, 1);
      bar.lineTo(game.width - 50, 0);
      bar.scale.x = 0;
      return bar;
    });

    game.scoreText = game.add.text(20, 20, "Score: 0", {
      font: "20pt Arial",
      fill: "#ffffff"
    });

    game.highScoreText = game.add.text(20, 60, "", {
      font: "14pt Arial",
      fill: "#ffffff"
    });

    game.blockedText = game.add.text(165, 130, "", {
      font: "14pt Arial",
      fill: "#ffffff"
    });

    game.fullscreenButton = game.add.button(400, 10, "full", function () {
      if (game.scale.isFullScreen) {
        game.scale.stopFullScreen();
      } else {
        game.scale.startFullScreen(false);
      }
    });

    game.fullscreenButton.width = 40;
    game.fullscreenButton.height = 40;

    game.tileSelector = game.add.sprite(1, 1, "select");
    game.tileSelector.width = 100;
    game.tileSelector.height = 100;
    game.tileSelector.visible = false;
  }

  _createClass(Interface, {
    reset: {
      value: function reset() {
        game.tileSelector.visible = false;
        this.mainTimer = game.roundDuration;
        game.selectedTile = null;
        this.timers = [0, 0, 0];
      }
    },
    update: {
      value: function update() {
        var _this = this;

        // decrement the this.mainTimer
        // (half the speed if blue is active)
        if (this.mainTimer > 0) {
          this.mainTimer -= this.timers[2] > 0 ? 0.5 : 1;
          this.bars[3].scale.x = this.mainTimer / game.roundDuration;
        }
        // decrement powerup timers and adjust bar scale
        this.timers = this.timers.map(function (timer, i) {
          if (timer > 0) {
            _this.bars[i].scale.x = timer / game.powerupDuration;
            return timer -= _this.timers[2] > 0 ? 0.5 : 1;
          } else {
            return 0;
          }
        });
      }
    }
  });

  return Interface;
})();

module.exports = Interface;

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Tile = (function (_Phaser$Sprite) {
  function Tile(x, y, scale, frame) {
    _classCallCheck(this, Tile);

    _get(Object.getPrototypeOf(Tile.prototype), "constructor", this).call(this, game, x, y, "tile");
    this._position = { x: x, y: y };
    this.width = scale;
    this.height = scale;
    this.frame = frame;
    this.inputEnabled = true;
  }

  _inherits(Tile, _Phaser$Sprite);

  _createClass(Tile, {
    update: {
      value: function update() {
        if (this.frame > 8 && this.alive) this.frame = 0;
        if (!this.alive) {
          if (game.ui.timers[1] > 0) {
            this.spawn();
          } else {
            this.alpha += 0.006;
          }
          if (this.alpha > 0.7) {
            this.spawn();
          }
        }
      }
    },
    spawn: {
      value: function spawn() {
        this.alive = true;
        this.alpha = 1;
        this.frame = parseInt(Math.random() * 3) * 3;
      }
    },
    destroy: {
      value: function destroy() {
        this.frame = 9;
        this.alpha = 0;
        this.alive = false;
        this.x = this._position.x;
        this.y = this._position.y;
      }
    }
  });

  return Tile;
})(Phaser.Sprite);

module.exports = Tile;

},{}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Tile = _interopRequire(require("./Tile.js"));

var TileGroup = (function (_Phaser$Group) {
  function TileGroup() {
    _classCallCheck(this, TileGroup);

    var space = 5;
    var grid = 4;
    var scale = game.width / 4 - 10;
    var x = 12;
    var y = game.height - (scale * 4 + space * 4) - 100;

    _get(Object.getPrototypeOf(TileGroup.prototype), "constructor", this).call(this, game);
    for (var i = x; i < scale * grid + x; i += scale + space) {
      for (var j = y; j < scale * grid + y; j += scale + space) {
        var frame = parseInt(Math.random() * 3) * 3;
        var tile = new Tile(i, j, scale, frame);
        tile.events.onInputDown.add(this.doSelect, this);
        this.add(tile);
      }
    }
  }

  _inherits(TileGroup, _Phaser$Group);

  _createClass(TileGroup, {
    doSelect: {
      value: function doSelect(tile) {
        if (tile.alive && !game.blockInput) {
          if (game.selectedTile == null) {
            game.tileSelector.x = tile.x;
            game.tileSelector.y = tile.y;
            game.selectedTile = tile;
            game.tileSelector.visible = true;
          } else if (game.selectedTile == tile) {
            this.deselect();
          } else if (tile.frame === game.selectedTile.frame) {
            this.combineTiles(game.selectedTile, tile);
          } else {
            game.blockInput = true;
            this.deselect();
            game.blockedText.text = "input blocked";
            game.time.events.add(1500, function () {
              game.blockInput = false;
              game.blockedText.text = "";
            });
          }
        }
      }
    },
    deselect: {
      value: function deselect() {
        game.tileSelector.visible = false;
        game.selectedTile = null;
      }
    },
    combineTiles: {
      value: function combineTiles(tile1, tile2) {
        game.tileSelector.visible = false;
        game.selectedTile = null;

        game.score += game.ui.timers[0] > 0 ? 200 : 100;
        game.scoreText.text = "Score: " + game.score;

        game.add.tween(tile1, tile1.x, tile1.y).to({
          x: tile2.x,
          y: tile2.y
        }, 300, Phaser.Easing.Quadratic.Out, true, 0, 0).onComplete.add(tile1.destroy.bind(tile1));

        tile2.frame += 1;
        if (tile1.frame == 2) {
          game.ui.timers[1] = game.powerupDuration;
        }
        if (tile1.frame == 5) {
          game.ui.timers[0] = game.powerupDuration;
        }
        if (tile1.frame == 8) {
          game.ui.timers[2] = game.powerupDuration;
        }
      }
    }
  });

  return TileGroup;
})(Phaser.Group);

module.exports = TileGroup;

},{"./Tile.js":3}],5:[function(require,module,exports){
"use strict";

module.exports = {
  create: function create() {
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.state.start("load", true, false);
  }
};

},{}],6:[function(require,module,exports){
"use strict";

module.exports = {
  preload: function preload() {
    game.load.spritesheet("tile", "images/button.png", 300, 300);
    game.load.spritesheet("select", "images/select.png", 300, 300);
    game.load.spritesheet("full", "images/fullscreen.png", 300, 300);
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
  },

  onLoadComplete: function onLoadComplete() {
    game.state.start("play", true, false);
  }
};

},{}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var TileGroup = _interopRequire(require("../entities/TileGroup.js"));

var Interface = _interopRequire(require("../entities/Interface.js"));

module.exports = {
  create: function create() {
    game.powerupDuration = 600;
    game.roundDuration = 3600;
    game.blockInput = false;
    game.highScore = 0;
    game.tiles = new TileGroup();
    game.ui = new Interface();
    this.startRound();
  },

  startRound: function startRound() {
    game.score = 0;
    game.ui.reset();
  },

  update: function update() {
    if (game.ui.mainTimer == 0) {
      if (game.score > game.highScore) {
        game.highScore = game.score;
        game.highScoreText.text = "Highscore: " + game.highScore;
      }
      game.score = 0;
      game.scoreText.text = "Score: " + game.score;

      game.ui.reset();
    }
    game.ui.update();
  }
};

},{"../entities/Interface.js":2,"../entities/TileGroup.js":4}]},{},[1]);
