Backbone.View.prototype.relayEvent = function(other, eventName, callback) {
  return this.listenTo(other, eventName, function() {
    var newArgs;
    if (callback) {
      callback(arguments);
    }
    newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift(eventName);
    return this.trigger.apply(this, newArgs);
  });
};

window.Game = {
  Models: {},
  Collections: {},
  Routers: {},
  Views: {},
  Templates: {
    compiled: {},
    get: function(name) {
      var html;
      if (!Game.Templates.compiled[name]) {
        html = $("#" + name + "_template").html();
        return Game.Templates.compiled[name] = Handlebars.compile(html);
      }
    }
  }
};

$(function() {
  return window.sudoku = new Game.Models.Sudoku();
});

$(window).resize(function() {
  var board_height, cell_height, control_height, height, width;
  height = window.innerHeight - 5;
  width = window.innerWidth;
  cell_height = height / 9;
  board_height = window.innerHeight - 5;
  if (height > width) {
    board_height = window.innerWidth;
    cell_height = width / 9 - 1;
    control_height = height - $(".board").height();
    $(".controls").css("float", "left");
    $(".controls").css("height", control_height);
    $(".controls").css("margin-left", width / 4);
  }
  $(".sudo").css("height", board_height);
  $(".sudo").css("width", width);
  $("body").css("height", height + 5);
  $(".board").css("width", board_height);
  $(".board").css("height", board_height);
  $(".cell").css("height", cell_height);
  $(".cell").css("width", cell_height);
  return $(".html").css("height", board_height);
});

window.setTimeout(function() {
  return $(window).resize();
}, 100);

Game.Models.Sudoku = Backbone.View.extend({
  className: "sudoku",
  initialize: function() {
    this.$el.appendTo(".sudo");
    this.board = new Game.Views.Board();
    this.$el.append("<div class='controls'><div class='controlWrap'></div></div><div class='clear'></div>");
    this.controls = [];
    this.drawControls();
    return _.defer(this.render);
  },
  render: function() {
    sudoku.board.createCells();
    return sudoku.controls[0].$el.click();
  },
  drawControls: function() {
    var control, x, _i, _results;
    _results = [];
    for (x = _i = 1; _i <= 9; x = ++_i) {
      control = new Game.Views.Control({
        number: x,
        size: this.board.size
      });
      this.$('.controlWrap').append(control.render());
      _results.push(this.controls.push(control));
    }
    return _results;
  }
});

Game.Views.Board = Backbone.View.extend({
  className: "board",
  initialize: function() {
    var longer;
    _.bindAll(this, 'render');
    this.$el.appendTo(".sudoku");
    this.$el.addClass("no_select");
    this.num = 9;
    longer = true ? $(window).height : $(window).width;
    this.size = longer / this.num - 0.1;
    this.houseIndexes = this.getHouseIndexes();
    this.cells = [];
    this.data = new Array(81);
    this.render();
    this.shuffle();
    this.hideValues(20);
    return this.printToConsole();
  },
  createCells: function() {
    var cell, x, y, _i, _j, _ref, _ref1;
    for (x = _i = 0, _ref = this.num; 0 <= _ref ? _i < _ref : _i > _ref; x = 0 <= _ref ? ++_i : --_i) {
      for (y = _j = 0, _ref1 = this.num; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
        cell = new Game.Views.Cell({
          x: x,
          y: y,
          index: this.cells.length,
          box: this.boxFromIndex(this.cells.length)
        });
        this.cells.push(cell);
        this.$el.append(cell.render());
      }
    }
    return this.initCells();
  },
  render: function() {
    return this.$el.append("<div class='activeDigit'></div>");
  },
  initCells: function() {
    var cell, _i, _len, _ref, _results;
    this.updateValues();
    _ref = this.cells;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cell = _ref[_i];
      _results.push(cell.findNeighbours());
    }
    return _results;
  },
  updateValues: function() {
    var cell, index, _i, _len, _ref, _results;
    _ref = this.cells;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cell = _ref[_i];
      index = (9 * cell.row + cell.col) - 9;
      _results.push(cell.setValue(this.data[index - 1]));
    }
    return _results;
  },
  shuffle: function() {
    var c, c1, c2, col, i, j, r1, r2, row, s, s1, s2, tmp, _i, _j, _k, _l, _m, _n, _o, _p, _ref, _ref1;
    for (i = _i = 0, _ref = this.num; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0, _ref1 = this.num; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        this.data[i * this.num + j] = (i * 3 + Math.floor(i / 3) + j) % this.num + 1;
      }
    }
    for (c = _k = 0; _k <= 42; c = ++_k) {
      s1 = Math.floor(Math.random() * 3);
      s2 = Math.floor(Math.random() * 3);
      for (row = _l = 0; _l < 9; row = ++_l) {
        tmp = this.data[row * 9 + (s1 * 3 + c % 3)];
        this.data[row * 9 + (s1 * 3 + c % 3)] = this.data[row * 9 + (s2 * 3 + c % 3)];
        this.data[row * 9 + (s2 * 3 + c % 3)] = tmp;
      }
    }
    for (s = _m = 0; _m <= 42; s = ++_m) {
      c1 = Math.floor(Math.random() * 3);
      c2 = Math.floor(Math.random() * 3);
      for (row = _n = 0; _n < 9; row = ++_n) {
        tmp = this.data[row * 9 + (s % 3 * 3 + c1)];
        this.data[row * 9 + (s % 3 * 3 + c1)] = this.data[row * 9 + (s % 3 * 3 + c2)];
        this.data[row * 9 + (s % 3 * 3 + c2)] = tmp;
      }
    }
    for (s = _o = 0; _o <= 42; s = ++_o) {
      r1 = Math.floor(Math.random() * 3);
      r2 = Math.floor(Math.random() * 3);
      for (col = _p = 0; _p < 9; col = ++_p) {
        tmp = this.data[(s % 3 * 3 + r1) * 9 + col];
        this.data[(s % 3 * 3 + r1) * 9 + col] = this.data[(s % 3 * 3 + r2) * 9 + col];
        this.data[(s % 3 * 3 + r2) * 9 + col] = tmp;
      }
    }
    return this.solved = _.clone(this.data);
  },
  hideValues: function(numToHide) {
    var i, num, switched, _i, _results;
    _results = [];
    for (num = _i = 0; 0 <= numToHide ? _i < numToHide : _i > numToHide; num = 0 <= numToHide ? ++_i : --_i) {
      switched = false;
      _results.push((function() {
        var _results1;
        _results1 = [];
        while (!switched) {
          i = Math.ceil(Math.random() * 81);
          if (this.data[i] !== 0) {
            switched = true;
            _results1.push(this.data[i] = 0);
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }).call(this));
    }
    return _results;
  },
  getLine: function(index, row_or_col) {
    var cells, nextCell, x, _i;
    cells = [];
    if (row_or_col === 'r') {
      cells = this.cells.slice((index - 1) * 9, +((index - 1) * 9 + 8) + 1 || 9e9);
    } else if (row_or_col === 'c') {
      for (x = _i = 1; _i <= 9; x = ++_i) {
        nextCell = this.getCell(x, index)[0];
        if (nextCell != null) {
          cells.push(nextCell);
        }
      }
    }
    return cells;
  },
  boxFromIndex: function(index) {
    var i, _i;
    for (i = _i = 0; _i <= 8; i = ++_i) {
      if ($.inArray(index, this.houseIndexes[i]) !== -1) {
        return i;
      }
    }
  },
  getCellsWithValue: function(value) {
    var cell, cells, _i, _len, _ref;
    cells = [];
    _ref = this.cells;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cell = _ref[_i];
      if (cell.getValue() === value.toString()) {
        cells.push(cell);
      }
    }
    return cells;
  },
  getCell: function(col, row) {
    var index;
    index = (9 * col + row) - 9;
    return [this.cells[index - 1]];
  },
  getCells: function(indexes) {
    var cells, i, _i, _len;
    cells = [];
    for (_i = 0, _len = indexes.length; _i < _len; _i++) {
      i = indexes[_i];
      cells.push(this.cells[i]);
    }
    return cells;
  },
  getCellHouses: function(index) {
    var cell, col, row;
    cell = this.cells[index];
    row = this.getLine(cell.row, 'r');
    return col = this.getLine(cell.col, 'c');
  },
  getHouseIndexes: function() {
    var houses, i, indexes, j, row, _i, _j, _len;
    indexes = [0, 1, 2, 9, 10, 11, 18, 19, 20];
    houses = [];
    for (j = _i = 0; _i <= 8; j = ++_i) {
      row = Math.ceil((j + 1) / 3) - 1;
      houses[j] = [];
      for (_j = 0, _len = indexes.length; _j < _len; _j++) {
        i = indexes[_j];
        houses[j].push(i + 3 * j + (row * 2) * 9);
      }
    }
    return houses;
  },
  getHouse: function(index) {
    return this.getCells(this.houseIndexes[index]);
  },
  updateCell: function(index) {
    return this.cells[index].setValue(this.data[index].toString());
  },
  printToConsole: function() {
    return console.log(this.data);
  },
  setActiveDigit: function(value) {
    var cell, cells, _i, _j, _len, _len1, _ref, _results;
    _ref = this.cells;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cell = _ref[_i];
      cell.resetColor();
    }
    this.$('.activeDigit').text(value);
    cells = this.getCellsWithValue(value);
    _results = [];
    for (_j = 0, _len1 = cells.length; _j < _len1; _j++) {
      cell = cells[_j];
      _results.push(cell.setColor("red"));
    }
    return _results;
  },
  activeDigit: function() {
    return this.$('.activeDigit').text();
  },
  isSolved: function() {
    return this.data === this.solved;
  },
  showSolution: function() {
    this.data = this.solved;
    return this.updateValues();
  }
});

Game.Views.Cell = Backbone.View.extend({
  tagName: 'li',
  className: 'cell',
  template: Game.Templates.get('cell'),
  events: {
    'click': 'listener'
  },
  initialize: function(opts) {
    this.index = opts.index;
    this.row = opts.x + 1;
    this.col = opts.y + 1;
    return this.box = opts.box + 1;
  },
  render: function() {
    var note_div, x, _i;
    this.$el.attr('data-row', this.row);
    this.$el.attr('data-col', this.col);
    this.$el.attr('data-box', this.box);
    if (this.col % 9 === 1) {
      this.$el.addClass("left_edge_border");
    }
    if (this.col % 9 === 0) {
      this.$el.addClass("right_edge_border");
    }
    if (this.row === 1) {
      this.$el.addClass("top_edge_border");
    }
    if (this.row === 9) {
      this.$el.addClass("bottom_edge_border");
    }
    if (this.col % 3 === 1 && this.col % 9 > 1) {
      this.$el.addClass("left_edge_middle");
    }
    if (this.row % 3 === 1 && this.row % 9 > 1) {
      this.$el.addClass("top_edge_middle");
    }
    if (this.col % 3 === 0 && this.col % 9 > 1) {
      this.$el.addClass("right_edge_middle");
    }
    if (this.row % 3 === 0 && this.row % 9 > 1) {
      this.$el.addClass("bottom_edge_middle");
    }
    note_div = $('#note_template').html();
    for (x = _i = 0; _i <= 8; x = ++_i) {
      this.$el.append(note_div);
    }
    this.setValue('0');
    return this.$el;
  },
  findNeighbours: function() {
    var cells;
    this.row_cells = sudoku.board.getLine(this.row, "r");
    this.col_cells = sudoku.board.getLine(this.col, "c");
    this.box_cells = sudoku.board.getHouse(this.box - 1);
    cells = this.row_cells.concat(this.col_cells);
    return this.house_cells = cells.concat(this.box_cells);
  },
  listener: function() {
    var cell, _i, _len, _ref, _results;
    if (this.$el.hasClass("fillable")) {
      this.setValue(sudoku.board.activeDigit());
      sudoku.board.data[this.index] = Number(sudoku.board.activeDigit());
      _ref = this.house_cells;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (cell) {
          _results.push(cell.setColor("yellow", 1000));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  },
  setValue: function(value) {
    if (value === 0) {
      value = ".";
      this.$el.addClass("fillable");
    }
    return this.$el.text(value);
  },
  getValue: function() {
    return this.$el.text();
  },
  setColor: function(color, resetTime) {
    var cell;
    this.resetColor();
    this.$el.addClass(color);
    if (resetTime != null) {
      cell = this;
      return setTimeout(function() {
        return cell.resetColor();
      }, resetTime);
    }
  },
  resetColor: function() {
    return this.$el.removeClass("yellow red");
  }
});

Game.Views.Control = Backbone.View.extend({
  className: "control",
  template: Game.Templates.get("control"),
  events: {
    "click": "listener"
  },
  initialize: function(opts) {
    this.number = opts.number;
    this.row = Math.ceil(this.number / 3) - 1;
    return this.col = this.number % 3 === 0 ? 2 : this.number % 3 - 1;
  },
  render: function() {
    return this.$el.text(this.number);
  },
  reset: function(element, index, list) {
    var target;
    target = this.$el != null ? this.$el : element.$el;
    return target.removeClass('active');
  },
  getValue: function() {
    return this.$el.text();
  },
  listener: function() {
    sudoku.board.setActiveDigit(this.number);
    _.each(sudoku.controls, this.reset);
    return this.$el.addClass('active');
  }
});
