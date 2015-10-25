var Tile;

Tile = (function() {
  function Tile(_x, _y, grid) {
    var xPos, yPos;
    this.x = _x;
    this.y = _y;
    this.grid = grid;
    xPos = _.Room.left + _.tSize * this.x;
    yPos = _.Room.top + _.tSize * this.y;
    this.sprite = _.Room.spriteGroup.create(xPos, yPos, "tile");
    this.sprite.tile = this;
    this.type = -1;
    this.hasMatch = false;
    this.isMatched = false;
    this.selected = false;
    setSize(this.sprite, _.tSize * 0.7);
    this.sprite.angle = Math.random() * (3 - (-3));
    pulseTile(this.sprite);
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputOver.add(checkCollisions, this);
    this.type = _.rnd.integerInRange(1, _.numTypes);
    this.sprite.frame = this.type - 1;
    this.sprite.updateType = function() {
      return this.tile.updateType();
    };
    this.sprite.deselect = function() {
      return this.tile.deselect();
    };
    this.sprite.destroy = function() {
      return this.tile.destroy();
    };
    this.sprite.destroyIfLone = function() {
      return this.tile.destroyIfLone();
    };
    this.sprite.resetMatch = function() {
      return this.tile.resetMatch();
    };
  }

  Tile.prototype.select = function() {
    if (!this.selected) {
      if (this.type !== -1) {
        _.numMatched++;
        this.alpha = 0.5;
      }
      _.Path.data.push(this);
      _.lTile = this;
      return this.selected = true;
    }
  };

  Tile.prototype.deselect = function() {
    if (this.selected) {
      this.selected = false;
      if (this.type !== -1) {
        _.numMatched--;
        this.alpha = 1;
      }
      if (_.Path.matches.length > 0 && this.isMatched) {
        return last(_.Path.matches).pop();
      }
    }
  };

  Tile.prototype.destroy = function() {
    destroyTween(this.sprite);
    if (_.combo < 15) {
      _.combo++;
    }
    this.hasMatch = false;
    this.isMatched = false;
    return this.type = -1;
  };

  Tile.prototype.relativeCoordinates = function(direction, distance) {
    return {
      x: this.x + distance * direction.x,
      y: this.y + distance * direction.y
    };
  };

  Tile.prototype.destroyIfLone = function(tile) {
    if (!this.hasMatch) {
      return this.destroy();
    }
  };

  Tile.prototype.reset = function() {
    this.sprite.alpha = 0;
    return this.type = -1;
  };

  Tile.prototype.resetMatch = function() {
    this.hasMatch = false;
    return this.isMatched = false;
  };

  Tile.prototype.updateType = function() {
    if (this.sprite.alpha < 1) {
      return this.type = -1;
    }
  };

  Tile.prototype.clear = function() {
    return this.reset();
  };

  Tile.prototype.neighbour = function(direction) {
    return this.grid.neighbourOf(this, direction);
  };

  Tile.prototype.neighbours = function() {
    return this.grid.neighboursOf(this);
  };

  Tile.prototype.matchingNeighbours = function() {
    var direction, matches, neighbour, neighbours;
    matches = [];
    neighbours = this.neighbours();
    for (direction in neighbours) {
      neighbour = neighbours[direction];
      if (neighbour && neighbour.type === this.type) {
        matches.push(neighbour);
      }
    }
    return matches;
  };

  Tile.prototype.deepMatchingNeighbours = function() {
    var deepMatches, deepMatchingNeighbours;
    deepMatchingNeighbours = function(tile) {
      var i, matchingNeighbour, matchingNeighbours;
      matchingNeighbours = tile.matchingNeighbours();
      for (i in matchingNeighbours) {
        matchingNeighbour = matchingNeighbours[i];
        if (deepMatches.indexOf(matchingNeighbour) === -1) {
          deepMatches.push(matchingNeighbour);
          deepMatchingNeighbours(matchingNeighbour);
        }
      }
    };
    deepMatches = [];
    deepMatchingNeighbours(this);
    return deepMatches;
  };

  return Tile;

})();

var canvasSize, create, height, preload, render, update, width, _, _height, _width;

_height = 500;

_width = 800;

if (_height > _width) {
  if (width > 600) {
    width = 600;
  } else {
    width = _width;
  }
  height = width * 1.8;
  if (height > _height) {
    height = _height;
    width = height * .6;
  }
  canvasSize = width;
} else {
  if (height > 600) {
    height = 600;
  } else {
    height = _height;
  }
  width = height * 1.8;
  if (width > _width) {
    width = _width
    height = width * .6;
  }
  canvasSize = height;
}

preload = function() {
  _.load.spritesheet("tile", "assets/images/tiles.png", 300, 300);
  _.load.spritesheet("door", "assets/images/door.png", 200, 200);
  _.load.spritesheet("bg-tiles", "assets/images/bg-tiles.png", 200, 200);
  _.load.image("mapImage", "assets/images/minimap.png");
  _.load.image("top", "assets/images/top.png");
  _.load.image("side", "assets/images/side2.png");
  _.load.image("fs", "assets/images/fullscreen.png");
  return _.load.image("player", "assets/images/hero.png");
};

create = function() {
  _.score = 0;
  _.numMatched = 0;
  _.combo = 0;
  _.numTypes = 5;
  _.maxPopTime = 150;
  _.popTime = _.maxPopTime;
  _.Background = new Background;
  _.Interface = new Interface;
  _.Player = new Player;
  _.Path = new Path;
  _.Dungeon = new Dungeon;
  _.Room = new Room;
  _.Dungeon.create();
  return _.Room.create(6, 6);
};

update = function() {};

render = function() {
  return debugTiles();
};

_ = new Phaser.Game(width, height, Phaser.CANVAS, "super-candy-adventure-saga", {
  preload: preload,
  create: create,
  update: update,
  render: render
});

var Background;

Background = (function() {
  function Background() {
    this.group = _.add.group();
    this.grid = _.add.graphics(0, 0);
    _.stage.backgroundColor = '#22211f';
  }

  Background.prototype.create = function() {
    var bg, col, num, row, side, side2, tile, top, top2, xPos, yPos, _i, _j, _k, _l, _m, _ref, _ref1, _ref2, _ref3, _ref4, _results;
    this.grid.clear();
    this.grid.lineStyle(1, 0x000000);
    xPos = _.Room.left - _.tSize / 2;
    yPos = _.Room.top - _.tSize / 2;
    for (row = _i = 0, _ref = _.Room.width; 0 <= _ref ? _i <= _ref : _i >= _ref; row = 0 <= _ref ? ++_i : --_i) {
      this.grid.moveTo(xPos, yPos + row * _.tSize);
      this.grid.lineTo(xPos + _.Room.width * _.tSize, yPos + row * _.tSize);
    }
    for (col = _j = 0, _ref1 = _.Room.height; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; col = 0 <= _ref1 ? ++_j : --_j) {
      this.grid.moveTo(xPos + col * _.tSize, yPos);
      this.grid.lineTo(xPos + col * _.tSize, yPos + _.Room.height * _.tSize);
    }
    for (num = _k = -1, _ref2 = _.Room.height; -1 <= _ref2 ? _k <= _ref2 : _k >= _ref2; num = -1 <= _ref2 ? ++_k : --_k) {
      side = _.add.sprite(_.Room.left - _.tSize, _.Room.top + num * _.tSize, "side");
      side2 = _.add.sprite(_.Room.left + _.Room.height * _.tSize, _.Room.top + num * _.tSize, "side");
      setSize(side, _.tSize);
      setSize(side2, _.tSize);
      this.group.add(side);
      this.group.add(side2);
    }
    for (num = _l = -1, _ref3 = _.Room.width; -1 <= _ref3 ? _l <= _ref3 : _l >= _ref3; num = -1 <= _ref3 ? ++_l : --_l) {
      top = _.add.sprite(_.Room.left + num * _.tSize, _.Room.top - _.tSize, "top");
      top2 = _.add.sprite(_.Room.left + num * _.tSize, _.Room.top + _.tSize * _.Room.height, "top");
      setSize(top, _.tSize);
      setSize(top2, _.tSize);
      this.group.add(top);
      this.group.add(top2);
    }
    _results = [];
    for (row = _m = 0, _ref4 = _.Room.width - 1; 0 <= _ref4 ? _m <= _ref4 : _m >= _ref4; row = 0 <= _ref4 ? ++_m : --_m) {
      _results.push((function() {
        var _n, _ref5, _results1;
        _results1 = [];
        for (tile = _n = 0, _ref5 = _.Room.height - 1; 0 <= _ref5 ? _n <= _ref5 : _n >= _ref5; tile = 0 <= _ref5 ? ++_n : --_n) {
          bg = _.add.sprite(_.Room.left + row * _.tSize, _.Room.top + tile * _.tSize, "bg-tiles");
          bg.frame = _.rnd.integerInRange(0, 3);
          setSize(bg, _.tSize);
          _results1.push(this.group.add(bg));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  return Background;

})();

var Door;

Door = (function() {
  function Door(dir) {
    this.sprite = _.add.sprite(0, 0, "door");
    if (dir === 1) {
      this.sprite.anchor.setTo(.5, 1);
    }
    if (dir === 2) {
      this.sprite.anchor.setTo(.5, 0);
    }
    if (dir === 3) {
      this.sprite.anchor.setTo(1, .5);
    }
    if (dir === 4) {
      this.sprite.anchor.setTo(0, .5);
    }
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(this.checkDoor, this);
  }

  Door.prototype.checkDoor = function(door) {
    if (!!_.Room.grid.getMatches()) {
      return _.time.events.add(500, function() {
        _.Room.spriteGroup.callAll("destroy");
        fadeOut();
        return _.time.events.add(2000, newRoom, {
          6: 6,
          6: 6
        });
      });
    } else {

    }
  };

  return Door;

})();

var Dungeon;

Dungeon = (function() {
  function Dungeon(X, Y) {
    this.x = X;
    this.y = Y;
    this.sections = [];
    this.rooms = [];
    this.halls = [];
    this.floorSize = 50;
    _.Floor = new Section(0, 0, this.floorSize, this.floorSize);
    this.sections.push(_.Floor);
  }

  Dungeon.prototype.create = function() {
    var did_split, hall, l, quad, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
    this.mapGroup = _.add.group();
    this.sections.withRooms = [];
    did_split = true;
    while (did_split) {
      did_split = false;
      _ref = this.sections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        l = _ref[_i];
        if ((l.leftChild == null) && (l.rightChild == null)) {
          if (l.width > 10 || l.height > 10 || Math.random() > 0.25) {
            if (l.split()) {
              this.sections.push(l.leftChild);
              this.sections.push(l.rightChild);
              did_split = true;
            }
          }
        }
      }
    }
    _.Floor.createRooms();
    _ref1 = this.sections;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      quad = _ref1[_j];
      if (quad.room != null) {
        this.sections.withRooms.push(quad);
      }
    }
    this.sections.withRooms[0].room.player = true;
    _.currentRoom = this.sections.withRooms[0];
    _ref2 = _.currentRoom.halls;
    _results = [];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      hall = _ref2[_k];
      if (hall[0].x > _.currentRoom.room.x) {
        _.currentRoom.room.doors.right = true;
        break;
      }
      if (hall[0].y < _.currentRoom.room.y) {
        _.currentRoom.room.doors.top = true;
        break;
      }
      if (hall[0].x < _.currentRoom.room.x) {
        _.currentRoom.room.doors.left = true;
        break;
      }
      if (hall[0].y > _.currentRoom.room.y) {
        _.currentRoom.room.doors.bottom = true;
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Dungeon;

})();

var checkCollisions, checkForFalling, debugTiles, doNextAction, getRandom, goFull, increaseCombo, increaseScore, last, match, resetCombo, setPlayerCoords, setSize;

debugTiles = function() {
  var color, tS, tX, tY, tile, x, _i, _len, _ref, _results;
  if (_.Interface.overlay.alpha === 0.4 || _.Interface.overlay.alpha === 0 || true) {
    _ref = _.Room.grid;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      x = _ref[_i];
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = x.length; _j < _len1; _j++) {
          tile = x[_j];
          tX = (_.Room.left + tile.x * _.tSize) - _.tSize / 2.2;
          tY = (_.Room.top + tile.y * _.tSize) - _.tSize / 3;
          tS = (canvasSize / 20) / 2;
          color = "#fff";
          if (tile.type === -1) {
            color = "#ff0000";
          }
          if (tile.type === 0) {
            color = "#00ff00";
          }
          if (tile.hasMatch && !tile.isMatched) {
            color = "#ff00ff";
          }
          if (tile.isMatched) {
            color = "#0000ff";
          }
          _.debug.renderText(tile.x + "," + tile.y, tX, tY - tS, color, tS + "px Courier");
          _results1.push(_.debug.renderText(tile.type, tX, tY, color, tS + "px Courier"));
        }
        return _results1;
      })());
    }
    return _results;
  }
};

doNextAction = function() {
  if (_.Path.toPop && _.Path.toPop.length > 0) {
    _.Path.popTile();
    return _.time.events.add(_.popTime, doNextAction);
  } else {
    if (_.Path.matches.length > 0) {
      _.Room.checkMatches();
      resetPath();
    }
    if (_.Room.getMatches()) {
      return _.gridMoving = false;
    } else {
      return _.Interface.unlockDoors();
    }
  }
};

setPlayerCoords = function() {
  _.Player.tile.reset();
  _.Room.spriteGroup.callAll("updateType");
  if (_.lTile) {
    _.lTile.type = -1;
  }
  return _.Player.tile.type = 0;
};

checkCollisions = function(sprite) {
  var tile;
  if (_.Interface.overlay.alpha === 0.4) {
    tile = sprite.tile;
    if (!_.lTile || tile !== _.lTile) {
      if (!tile.selected) {
        _.Path.checkAdjacent(tile);
        return _.Room.checkMatches();
      } else {
        return _.Path.deselectBefore(tile);
      }
    }
  }
};

increaseCombo = function() {
  _.combo++;
  if ((_.comboTimer != null) && _.comboTimer.timer.length > 0) {
    _.time.events.remove(_.comboTimer);
  }
  return _.comboTimer = _.time.events.add(_.comboTime, resetCombo);
};

resetCombo = function() {
  return _.combo = 1;
};

checkForFalling = function() {
  return _.fallTiles = _.room.grid.applyGravity();
};

increaseScore = function() {
  var basePoints;
  basePoints = 10;
  return _.score += basePoints * _.combo;
};

setSize = function(o, s) {
  o.anchor.setTo(0.5, 0.5);
  o.width = s;
  return o.height = s;
};

match = function(_a, _b) {
  return _a.type === _b.type || _b.type === 0 || _b.type === -1;
};

last = function(arr) {
  return arr[arr.length - 1];
};

getRandom = function(low, high) {
  return ~~(Math.random() * (high - low)) + low;
};

goFull = function() {
  return _.stage.scale.startFullScreen();
};

var Interface;

Interface = (function() {
  function Interface() {
    var door, fullscreen, i, _i;
    this.doors = [];
    this.group = _.add.group();
    this.doors = [];
    this.leafGraphics = _.add.graphics(150, 20);
    this.hallGraphics = _.add.graphics(150, 20);
    this.roomGraphics = _.add.graphics(150, 20);
    this.group.add(this.leafGraphics);
    this.group.add(this.hallGraphics);
    this.group.add(this.roomGraphics);
    for (i = _i = 1; _i <= 4; i = ++_i) {
      door = new Door(i);
      this.group.add(door.sprite);
      this.doors.push(door);
    }
    fullscreen = this.group.create(20, 100, "fs");
    setSize(fullscreen, 50);
    fullscreen.inputEnabled = true;
    fullscreen.events.onInputDown.add(goFull, this);
    this.overlay = _.add.graphics(0, 0);
    this.overlay.beginFill(0x000000);
    this.overlay.alpha = 1;
    this.overlay.drawRect(0, 0, _.width, _.height);
    this.group.add(this.overlay);
    this.pointer = _.add.graphics(-10, 0);
    this.pointer.beginFill(0xff0000);
    this.pointer.drawRect(0, 0, 5, 5);
  }

  Interface.prototype.create = function() {
    this.leafGraphics.clear();
    this.roomGraphics.clear();
    this.hallGraphics.clear();
    this.leafGraphics.lineStyle(1, 0x000000);
    this.hallGraphics.beginFill(0xaaaaaa);
    return this.roomGraphics.beginFill(0xffffff);
  };

  Interface.prototype.unlockDoors = function() {
    var door, _i, _len, _ref, _results;
    _ref = _.Interface.doors;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      door = _ref[_i];
      _results.push(door.frame = 0);
    }
    return _results;
  };

  Interface.prototype.lockDoors = function() {
    var door, _i, _len, _ref, _results;
    _ref = _.Interface.doors;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      door = _ref[_i];
      _results.push(door.frame = 1);
    }
    return _results;
  };

  Interface.prototype.newDoors = function() {
    var door, doorCoords, _i, _len, _ref;
    doorCoords = [
      {
        x: _.Room.grid.midX,
        y: _.Room.grid.top - _.tSize / 2,
        dir: "top"
      }, {
        x: -_.Room.grid.left - 5,
        y: _.Room.grid.midY,
        dir: "left"
      }, {
        x: _.Room.grid.right + _.tSize / 2,
        y: _.Room.grid.midY,
        dir: "right"
      }, {
        x: _.Room.grid.midX,
        y: _.Room.grid.bottom - _.tSize / 2,
        dir: "bottom"
      }
    ];
    _ref = this.doors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      door = _ref[_i];
      door.sprite.x = 10;
      door.sprite.y = 10;
      door.sprite.width = _.tSize;
      door.sprite.height = _.tSize;
    }
    return this.lockDoors();
  };

  Interface.prototype.drawMinimap = function() {
    var hall, line, o, quad, room, scl, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _results, _results1;
    this.leafGraphics.clear();
    this.roomGraphics.clear();
    this.hallGraphics.clear();
    scl = _.tSize / 40;
    _ref = _.Dungeon.halls;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      hall = _ref[_i];
      for (_j = 0, _len1 = hall.length; _j < _len1; _j++) {
        line = hall[_j];
        this.hallGraphics.drawRect(line.x * scl, line.y * scl, line.w * scl, line.h * scl);
      }
    }
    _ref1 = _.Dungeon.rooms;
    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
      room = _ref1[_k];
      this.roomGraphics.beginFill(0xFFFFFF);
      if (room.player) {
        this.roomGraphics.beginFill(0x00ff00);
      }
      this.roomGraphics.drawRect(room.x * scl, room.y * scl, room.w * scl, room.h * scl);
    }
    _ref2 = _.Dungeon.sections;
    for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
      quad = _ref2[_l];
      this.leafGraphics.drawRect(quad.x * scl, quad.y * scl, quad.width * scl, quad.height * scl);
    }
    this.leafGraphics.width = _.Dungeon.sections[0].width * scl;
    this.leafGraphics.height = _.Dungeon.sections[0].height * scl;
    if (_.width > _.height) {
      _ref3 = [this.leafGraphics, this.roomGraphics, this.hallGraphics];
      _results = [];
      for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
        o = _ref3[_m];
        o.x = _.tSize * .1;
        _results.push(o.y = _.height - this.leafGraphics.height - _.tSize * .1);
      }
      return _results;
    } else {
      _ref4 = [this.leafGraphics, this.roomGraphics, this.hallGraphics];
      _results1 = [];
      for (_n = 0, _len5 = _ref4.length; _n < _len5; _n++) {
        o = _ref4[_n];
        o.x = _.width - this.leafGraphics.width - _.tSize * .1;
        _results1.push(o.y = _.tSize * .1);
      }
      return _results1;
    }
  };

  return Interface;

})();

var Path;

Path = (function() {
  function Path(X, Y) {
    this.x = X;
    this.y = Y;
    this.data = [_.Player];
    this.sprites = [];
    this.matches = [];
    this.toPop = [];
    _.input.onDown.add(this.startPath, this);
    _.input.onUp.add(this.walkPath, this);
  }

  Path.prototype.checkAdjacent = function(nTile) {
    var dir, nb, neighbours, _results, _results1;
    if (_.Interface.overlay.alpha > 0) {
      if (_.lTile != null) {
        neighbours = _.lTile.neighbours();
        _results = [];
        for (dir in neighbours) {
          if (nTile !== _.Player) {
            if (nTile === neighbours[dir]) {
              if (match(nTile, _.lTile) || (this.matches.length > 0 && _.lTile.isMatched)) {
                nTile.select();
                if (_.numMatched >= 3) {
                  _results.push(this.doMatch(nTile));
                } else {
                  _results.push(void 0);
                }
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(this.deselectBefore(_.Player.tile));
          }
        }
        return _results;
      } else {
        nb = _.Player.tile.neighbours();
        _results1 = [];
        for (dir in nb) {
          if (nb[dir] === nTile && this.data.length === 1) {
            _results1.push(nTile.select());
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }
    }
  };

  Path.prototype.deselectBefore = function(tile) {
    var l, o, p;
    p = this.data.length - 1;
    while (p >= 0) {
      if (tile === this.data[p] || tile === _.Player.tile) {
        o = this.data.length - 1;
        while (o > p) {
          this.data[o].deselect();
          this.data.splice(o, 1);
          l = this.data.length;
          if (l > 0) {
            _.lTile = this.data[l - 1];
          } else {
            _.lTile = null;
          }
          o--;
        }
      }
      p--;
    }
    return _.Room.checkMatches();
  };

  Path.prototype.doMatch = function(tile) {
    var match, matchType, _i, _len, _ref;
    if (this.matches[0] && tile.type === last(last(this.matches)).type) {
      last(this.matches).push(tile);
      return tile.isMatched = true;
    } else {
      match = [];
      matchType = _.lTile.type;
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tile = _ref[_i];
        if (tile.type === matchType && !tile.isMatched) {
          match.push(tile);
          tile.isMatched = true;
        }
      }
      if (match.length >= 3) {
        return this.matches.push(match);
      }
    }
  };

  Path.prototype.popTile = function() {
    var tile;
    _.gridMoving = true;
    if (_.popTime >= 100) {
      _.popTime -= 10;
    } else {
      _.popTime = 100;
    }
    tile = this.toPop.shift();
    if (tile === _.Player) {
      _.lTile = tile.sprite;
      tile = this.toPop.shift();
    }
    if ((tile != null) && tile.isMatched || tile.type === -1) {
      if (tile.type !== -1) {
        tile.destroy();
      }
      moveHero(tile.sprite.x, tile.sprite.y);
      _.Player.tile.type = -1;
      _.Player.tile = tile;
      _.lTile = tile.sprite;
      _.time.events.add(_.popTime, setPlayerCoords);
      return increaseScore();
    }
  };

  Path.prototype.checkPath = function() {
    return this.data.length > 3 || _.lTile.type === -1 && _.numMatched > 2 || _.numMatched === 0;
  };

  Path.prototype.resetArrow = function() {
    var arrow, _i, _len, _ref, _results;
    _ref = this.sprites;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arrow = _ref[_i];
      _results.push(arrow.destroy());
    }
    return _results;
  };

  Path.prototype.resetPath = function() {
    _.Room.spriteGroup.callAll("deselect");
    _.Interface.overlay.alpha = 0;
    this.resetArrow();
    this.data = [_.Player];
    _.numMatched = 0;
    return this.matches = [];
  };

  Path.prototype.startPath = function() {
    _.lTile = null;
    return _.Interface.overlay.alpha = 0.4;
  };

  Path.prototype.walkPath = function() {
    _.popTime = _.maxPopTime;
    if ((_.lTile != null) && this.checkPath() && this.data.length > 1) {
      _.time.events.add(_.popTime, setPlayerCoords);
      while (this.data.length > 0) {
        this.toPop.push(this.data.shift());
      }
    }
    resetCombo();
    this.resetPath();
    return _.time.events.add(_.popTime, doNextAction);
  };

  Path.prototype.drawArrow = function() {
    var tile, _results;
    this.resetArrow();
    _results = [];
    for (tile in this.data) {
      if (tile > 0) {
        _results.push(this.lineToTile(tile));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Path.prototype.lineToTile = function(index) {
    var arrow, tile, tile2;
    tile = _.Path.data[index];
    tile2 = _.Path.data[index - 1];
    arrow = _.add.graphics(0, 0);
    _.Interface.group.add(arrow);
    arrow.lineStyle(2, this.checkArrowColour(tile));
    arrow.moveTo(tile2.sprite.x, tile2.sprite.y);
    arrow.lineTo(tile.sprite.x, tile.sprite.y);
    return _.Path.sprites.push(arrow);
  };

  Path.prototype.checkArrowColour = function(tile) {
    if (!tile.isMatched) {
      return "0xFFFFFF";
    }
    switch (tile.type) {
      case -1:
        return "0xFFFFFF";
      case 1:
        return "0xFF0000";
      case 2:
        return "0x00FF00";
      case 3:
        return "0x0000FF";
      case 4:
        return "0xFFFF00";
      case 5:
        return "0xF0F000";
      default:
        return "0xFF00FF";
    }
  };

  return Path;

})();

var Player,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Player = (function(_super) {
  __extends(Player, _super);

  function Player() {
    this.sprite = _.add.sprite(-20, -20, "player");
    _.Interface.group.add(this.sprite);
  }

  Player.prototype.spawn = function() {
    var tX, tY;
    tX = _.rnd.integerInRange(0, _.Room.width);
    tY = _.rnd.integerInRange(0, _.Room.height);
    this.tile = _.Room.getTile({
      x: tX,
      y: tY
    });
    this.sprite.x = this.tile.sprite.x;
    this.sprite.y = this.tile.sprite.y;
    setSize(this.sprite, _.tSize / 2);
    _.Interface.overlay.alpha = 1;
    return setPlayerCoords();
  };

  return Player;

})(Tile);

var Room;

Room = (function() {
  function Room() {
    var options;
    options = options || {};
    this.gravity = options.gravity || false;
    this.height = options.height || 6;
    this.width = options.width || 6;
    this.spriteGroup = _.add.group();
    this.grid = [];
    this.directions = {
      up: {
        x: 0,
        y: -1
      },
      upRight: {
        x: 1,
        y: 1
      },
      right: {
        x: 1,
        y: 0
      },
      downRight: {
        x: 1,
        y: -1
      },
      down: {
        x: 0,
        y: 1
      },
      downLeft: {
        x: -1,
        y: 1
      },
      left: {
        x: -1,
        y: 0
      },
      upLeft: {
        x: -1,
        y: -1
      }
    };
  }

  Room.prototype.create = function(sizeX, sizeY) {
    if (sizeX == null) {
      sizeX = 6;
    }
    if (sizeY == null) {
      sizeY = 6;
    }
    this.setSize();
    this.createTiles();
    _.Background.create();
    _.Player.spawn();
    this.checkMatches();
    fadeIn();
    doNextAction();
    _.Interface.newDoors();
    return _.Interface.drawMinimap();
  };

  Room.prototype.setSize = function() {
    var sizeX, sizeY;
    sizeX = _.rnd.integerInRange(4, 7);
    sizeY = sizeX;
    this.width = sizeX;
    this.height = sizeY;
    _.tSize = (Math.floor(canvasSize / this.width)) * .85;
    this.top = _.tSize / 2 + (_.height - _.tSize * this.height) / 2;
    this.left = _.tSize / 2 + (_.width - _.tSize * this.width) / 2;
    if (_.width > _.height) {
      this.left += (_.width - _.tSize * (this.width + 1)) / 2;
    } else {
      this.top += (_.height - _.tSize * (this.height + 1)) / 2.4;
    }
    this.right = this.left + (_.tSize * this.width);
    this.bottom = this.top + (_.tSize * this.height);
    this.midX = this.left + (_.tSize * this.width / 2);
    return this.midY = this.top + (_.tSize * this.height / 2);
  };

  Room.prototype.createTiles = function() {
    var i, x, y, _i, _j, _ref, _ref1, _results;
    _.gridMoving = false;
    _.lTile = null;
    for (i = _i = 0, _ref = this.width; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this.grid[i] = [];
    }
    _results = [];
    for (x = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
      _results.push((function() {
        var _k, _ref2, _results1;
        _results1 = [];
        for (y = _k = 0, _ref2 = this.width; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; y = 0 <= _ref2 ? ++_k : --_k) {
          _results1.push(this.grid[x][y] = new Tile(x, y, this));
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Room.prototype.coordsInWorld = function(coords) {
    return coords.x >= 0 && coords.y >= 0 && coords.x < this.width && coords.y < this.height;
  };

  Room.prototype.getTile = function(coords) {
    if (this.coordsInWorld(coords)) {
      return this.grid[coords.x][coords.y];
    } else {
      return false;
    }
  };

  Room.prototype.neighbourOf = function(tile, direction) {
    var targetCoords;
    targetCoords = tile.relativeCoordinates(direction, 1);
    return this.getTile(targetCoords);
  };

  Room.prototype.neighboursOf = function(tile) {
    var directionName, result;
    result = {};
    for (directionName in this.directions) {
      result[directionName] = this.neighbourOf(tile, this.directions[directionName]);
    }
    return result;
  };

  Room.prototype.getMatches = function() {
    var checked, j, match, matches, tile, x, _i, _j, _len, _len1, _ref;
    checked = [];
    matches = [];
    _ref = this.grid;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      x = _ref[_i];
      for (_j = 0, _len1 = x.length; _j < _len1; _j++) {
        tile = x[_j];
        if (checked.indexOf(tile) === -1) {
          match = tile.deepMatchingNeighbours();
          for (j in match) {
            checked.push(match[j]);
          }
          if (match.length >= 3) {
            if (tile.type !== -1) {
              matches.push(match);
            }
          }
        }
      }
    }
    if (matches.length === 0) {
      return false;
    }
    return matches;
  };

  Room.prototype.checkMatches = function() {
    var match, tile, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
    this.spriteGroup.callAll("resetMatch");
    _ref = this.getMatches();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      match = _ref[_i];
      for (_j = 0, _len1 = match.length; _j < _len1; _j++) {
        tile = match[_j];
        tile.hasMatch = true;
      }
    }
    _ref1 = _.Path.matches;
    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
      match = _ref1[_k];
      if (match.length < 3) {
        match = [];
        _.Path.matches.pop();
      }
      for (_l = 0, _len3 = match.length; _l < _len3; _l++) {
        tile = match[_l];
        tile.isMatched = true;
      }
    }
    _.Path.drawArrow();
    return this.spriteGroup.callAll("destroyIfLone");
  };

  return Room;

})();

var Section;

Section = (function() {
  function Section(X, Y, _width, _height, parent) {
    if (parent == null) {
      parent = null;
    }
    this.x = X;
    this.y = Y;
    this.width = _width;
    this.height = _height;
    this.leftChild = null;
    this.rightChild = null;
    this.parent;
    this.room = null;
    this.min_size = 15;
    this.halls = [];
    this.parent = parent;
  }

  Section.prototype.split = function() {
    var max, s, splitH, _h, _w, _x, _y;
    if ((this.leftChild != null) || (this.rightChild != null)) {
      return false;
    }
    splitH = Math.random() > 0.5;
    if (this.width > this.height && this.height / this.width >= 0.05) {
      splitH = false;
    } else if (this.height > this.width && this.width / this.height >= 0.05) {
      splitH = true;
    }
    max = splitH ? this.height - this.min_size : this.width - this.min_size;
    if (max <= this.min_size) {
      return false;
    }
    s = _.rnd.integerInRange(this.min_size, max);
    _w = this.width;
    _h = this.height;
    _x = this.x;
    _y = this.y;
    if (splitH) {
      this.leftChild = new Section(_x, _y, _w, s, this);
      this.rightChild = new Section(_x, _y + s, _w, _h - s, this);
    } else {
      this.leftChild = new Section(_x, _y, s, _h, this);
      this.rightChild = new Section(_x + s, _y, _w - s, _h, this);
    }
    return true;
  };

  Section.prototype.createRooms = function() {
    var roomPosX, roomPosY, roomSizeX, roomSizeY;
    if ((this.leftChild != null) || (this.rightChild != null)) {
      if (this.leftChild != null) {
        this.leftChild.createRooms();
      }
      if (this.rightChild != null) {
        this.rightChild.createRooms();
      }
      if ((this.leftChild != null) && (this.rightChild != null)) {
        return this.createHall(this.leftChild.getRoom(), this.rightChild.getRoom());
      }
    } else {
      roomSizeX = _.rnd.integerInRange(5, 10);
      roomSizeY = _.rnd.integerInRange(5, 10);
      roomPosX = _.rnd.integerInRange(1, this.width - roomSizeX - 4);
      roomPosY = _.rnd.integerInRange(1, this.height - roomSizeY - 4);
      this.room = {
        x: this.x + roomPosX,
        y: this.y + roomPosY,
        w: roomSizeX,
        h: roomSizeY,
        player: false,
        doors: {
          top: false,
          bottom: false,
          right: false,
          left: false
        }
      };
      return _.Dungeon.rooms.push(this.room);
    }
  };

  Section.prototype.getRoom = function() {
    var lRoom, rRoom;
    if (this.room != null) {
      return this.room;
    } else {
      if (this.leftChild != null) {
        lRoom = this.leftChild.getRoom();
      }
      if (this.rightChild != null) {
        rRoom = this.rightChild.getRoom();
      }
      if ((lRoom == null) && (rRoom == null)) {
        return null;
      } else if (rRoom == null) {
        return lRoom;
      } else if (lRoom == null) {
        return rRoom;
      } else if (Math.random() > .5) {
        return lRoom;
      } else {
        return rRoom;
      }
    }
  };

  Section.prototype.createHall = function(l, r) {
    var H, T, W, h, lX, lY, rX, rY, w;
    lX = _.rnd.integerInRange(l.x + 1, l.w + l.x - 2);
    lY = _.rnd.integerInRange(l.y + 1, l.h + l.y - 2);
    rX = _.rnd.integerInRange(r.x + 1, r.w + r.x - 2);
    rY = _.rnd.integerInRange(r.y + 1, r.h + r.y - 2);
    w = rX - lX;
    W = Math.abs(w);
    h = rY - lY;
    H = Math.abs(h);
    T = 1;
    if (w < 0) {
      if (h < 0) {
        if (Math.random() * .5) {
          return this.pushHall({
            x: rX,
            y: lY,
            w: W,
            h: T
          }, {
            x: rX,
            y: rY,
            w: T,
            h: H
          });
        } else {
          return this.pushHall({
            x: rX,
            y: rY,
            w: W,
            h: T
          }, {
            x: lX,
            y: rY,
            w: T,
            h: H
          });
        }
      } else if (h > 0) {
        if (Math.random() * .5) {
          return this.pushHall({
            x: rX,
            y: lY,
            w: W,
            h: T
          }, {
            x: rX,
            y: lY,
            w: T,
            h: H
          });
        } else {
          return this.pushHall({
            x: rX,
            y: rY,
            w: W,
            h: T
          }, {
            x: lX,
            y: lY,
            w: T,
            h: H
          });
        }
      } else {
        return this.pushHall({
          x: rX,
          y: rY,
          w: W,
          h: T
        });
      }
    } else if (w > 0) {
      if (h < 0) {
        if (Math.random() * .5) {
          return this.pushHall({
            x: lX,
            y: rY,
            w: W,
            h: T
          }, {
            x: lX,
            y: rY,
            w: T,
            h: H
          });
        } else {
          return this.pushHall({
            x: lX,
            y: lY,
            w: W,
            h: T
          }, {
            x: rX,
            y: rY,
            w: T,
            h: H
          });
        }
      } else if (h > 0) {
        if (Math.random() * .5) {
          return this.pushHall({
            x: lX,
            y: lY,
            w: W,
            h: T
          }, {
            x: rX,
            y: lY,
            w: T,
            h: H
          });
        } else {
          return this.pushHall({
            x: lX,
            y: rY,
            w: W,
            h: T
          }, {
            x: lX,
            y: lY,
            w: T,
            h: H
          });
        }
      } else {
        return this.pushHall({
          x: lX,
          y: lY,
          w: W,
          h: T
        });
      }
    } else {
      if (h < 0) {
        this.pushHall({
          x: rX,
          y: rY,
          w: T,
          h: H
        });
      }
      if (h > 0) {
        return this.pushHall({
          x: lX,
          y: lY,
          w: T,
          h: H
        });
      }
    }
  };

  Section.prototype.pushHall = function(hall1, hall2) {
    var hall;
    if (hall2 == null) {
      hall2 = null;
    }
    if (hall1.w > 1 || hall1.h > 1) {
      hall = [hall1];
      if (hall2 != null) {
        hall.push(hall2);
      }
      _.Dungeon.halls.push(hall);
      this.leftChild.halls.push(hall);
      return this.rightChild.halls.push(hall);
    }
  };

  return Section;

})();

var destroyTween, fadeIn, fadeOut, moveHero, pulseTile;

destroyTween = function(obj) {
  var tween;
  tween = _.add.tween(obj);
  tween.to({
    width: 0,
    height: 0,
    alpha: 0,
    angle: 100
  }, _.popTime * 3, Phaser.Easing.Quadratic.In, true, _.popTime);
  return tween.start();
};

moveHero = function(newX, newY) {
  var tween;
  tween = _.add.tween(_.Player.sprite);
  tween.to({
    x: newX,
    y: newY
  }, _.popTime, Phaser.Easing.Quadratic.Linear, true, 0);
  return tween.start();
};

pulseTile = function(obj) {
  var tween;
  tween = _.add.tween(obj);
  tween.to({
    width: obj.width * .95,
    height: obj.height * .95,
    angle: obj.angle * -1
  }, 1000, Phaser.Easing.Linear.InOut, true, Math.random() * 200., 5000, true);
  tween.start();
  return tween.delay = 0;
};

fadeOut = function() {
  var tween;
  tween = _.add.tween(_.Interface.overlay);
  tween.to({
    alpha: 1
  }, 1000, Phaser.Easing.Linear.Out, true);
  return tween.start();
};

fadeIn = function() {
  var tween;
  tween = _.add.tween(_.Interface.overlay);
  tween.to({
    alpha: 0
  }, 1000, Phaser.Easing.Linear.Out, true);
  return tween.start();
};
