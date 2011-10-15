/*
 * The Slim Milo Affair, v0.5
 *
 * Copyright 2011, Slim Milo LLC
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Includes Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *
 */

(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

(function() {


  var Line = Class.extend({
    init: function(x1, y1, x2, y2) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    },

    getX1: function() {
      return this.x1;
    },

    getY1: function() {
      return this.y1;
    },

    getX2: function() {
      return this.x2;
    },

    getY2: function() {
      return this.y2;
    },

    intersects: function(line) {
      if (this.getX2() - this.getX1() == 0)  {
        // this is a vertical line

        if (line.getX2() - line.getX1() == 0) {
          return false;
        }

        if (line.getX1() <= this.getX1() && line.getX2() >= this.getX1() &&
            line.getY1() <= this.getY2() && line.getY1() >= this.getY1())
          return true;

        return false;
      }
      else {
        // this is a horizontal line

        if (line.getY2() - line.getY1() == 0) {
          return false;
        }

        if (line.getY1() <= this.getY1() && line.getY2() >= this.getY1() &&
            line.getX1() <= this.getX2() && line.getX1() >= this.getX1())
          return true;

        return false;
      }
    }
  });

  var Slot = Class.extend({
    init: function(affair, x1, y1, x2, y2) {
      this.affair = affair;
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.width = x2 - x1;
      this.height = y2 - y1;
      this.ignore = true;

      this.opacity = this.affair.getFadeOpacity();
      this.backgroundColor = "black";
      this.duration = this.affair.getFadeDuration();
      this.slideDirection = false;
    },

    setPosition: function(position) {
      this.position = position;

      return this;
    },

    setDuration: function(duration) {
      this.duration = duration;

      return this;
    },

    setOpacity: function(opacity) {
      this.opacity = opacity;

      if (opacity == 0)
        this.ignore = true;

      return this;
    },

    setImage: function(url) {
      this.imageUrl = url;
      this.ignore = false;

      return this;
    },

    setSlideDirection: function(direction) {
      this.slideDirection = direction;
      this.ignore = false;
    },

    fade: function(callback) {
      if (this.ignore && ! this.affair.setupModeEnabled()) {
        callback();
        return;
      }

      this.element = jQuery("<div></div>");
      this.element.addClass("sma-slot");
      this.element.css("position", "absolute");
      this.element.css("width", this.width + "px");
      this.element.css("height", this.height + "px");
      this.element.css("left", this.x1 + "px");
      this.element.css("top", this.y1 + "px");
      this.element.css("background-color", this.backgroundColor);
      this.element.css("overflow", "hidden");
      this.element.hide();

      this.affair.getElement().append(this.element);

      if (this.affair.setupModeEnabled()) {
        var text = jQuery("<h3>" +
                       this.position + " - " + 
                       this.width + "x" + this.height + 
                     "</h3>");
        text.css("color", "white");
        text.css("margin", "auto");
        this.element.append(text);
      }
      
      this.element.fadeTo(this.duration, this.opacity, callback);
    },

    preload: function(callback) {
      if (this.ignore) {
        callback();
        return;
      }

      this.imageTag = jQuery("<img></img>");
      this.imageTag.attr("src", this.imageUrl);
      if (jQuery.browser.msie) {
        this.imageTag.ready(callback);
      }
      else
        this.imageTag.load(callback);
    },

    slideImage: function(callback) {
      if (this.affair.setupModeEnabled() || this.ignore) {
        callback();
        return;
      }

      var imageElement = jQuery("<div></div>");
      imageElement.width(this.width);
      imageElement.height(this.height);
      imageElement.css("position", "absolute");

      var imageContainer = jQuery("<div></div>");
      imageContainer.width(this.width);
      imageContainer.height(this.height);
      imageContainer.css("position", "relative");

      imageElement.append(imageContainer);

      var imageOverlay = jQuery("<div></div>");
      imageOverlay.width(this.width);
      imageOverlay.height(this.height);
      imageOverlay.css("position", "absolute");
      imageOverlay.css("left", "0");
      imageOverlay.css("top", "0");
      imageOverlay.css("background-color", "black");
      imageOverlay.css("opacity", this.affair.getSubImageOpacity());

      this.imageTag.width(this.width);
      this.imageTag.height(this.height);
      this.imageTag.css("position", "absolute");
      this.imageTag.css("left", "0");
      this.imageTag.css("top", "0");

      imageContainer.append(this.imageTag);
      imageContainer.append(imageOverlay);

      switch (this.slideDirection) {
        case "LtoR": 
          imageElement.css("right", this.width + "px");
          imageElement.css("top", 0);
          this.element.append(imageElement);

          this.element.animate({ opacity: 1 },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear" });
          imageElement.animate({ right: "0px" },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear",
                                 complete: callback });
          break;

        case "RtoL": 
          imageElement.css("left", this.width + "px");
          imageElement.css("top", 0);
          this.element.append(imageElement);

          this.element.animate({ opacity: 1 },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear" });
          imageElement.animate({ left: "0px" },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear",
                                 complete: callback });
          break;

        case "TtoB": 
          imageElement.css("left", 0);
          imageElement.css("bottom", this.height + "px");
          this.element.append(imageElement);

          this.element.animate({ opacity: 1 },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear" });
          imageElement.animate({ bottom: "0px" },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear",
                                 complete: callback });
          break;

        case "BtoT": 
          imageElement.css("left", 0);
          imageElement.css("top", this.height + "px");
          this.element.append(imageElement);

          this.element.animate({ opacity: 1 },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear" });
          imageElement.animate({ top: "0px" },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear",
                                 complete: callback });
          break;
      }
    },

    toString: function() {
      return "(" + this.x1 + ", " + this.y1 + 
        ") -> (" + this.x2 + ", " + this.y2 + ") " +
        "[" + this.width + ", " + this.height + "]";
    }
  });

  var Bar = Class.extend({
    init: function(affair) {
      this.affair = affair;
      this.linesComputed = false;
      this.duration = affair.getBarDuration();
      this.width = affair.getBarWidth();
    },

    setWidth: function(width) {
      this.width = width;

      return this;
    },

    setDuration: function(duration) {
      this.duration = duration;

      return this;
    },

    getLeftLine: function() {
      if (! this.linesComputed)
        this.computeLines();

      return this.leftLine;
    },

    getRightLine: function() {
      if (! this.linesComputed)
        this.computeLines();

      return this.rightLine;
    },

    getTopLine: function() {
      if (! this.linesComputed)
        this.computeLines();

      return this.topLine;
    },

    getBottomLine: function() {
      if (! this.linesComputed)
        this.computeLines();

      return this.bottomLine;
    }
  });

  var HorizontalBar = Bar.extend({
    setY: function(yVal) {
      this.yVal = yVal;

      return this;
    }
  });

  var HorizontalBarLtoR = HorizontalBar.extend({
    init: function(affair) {
      this._super(affair);
      this.length = affair.getWidth();
    },

    setLength: function(length) {
      this.length = length;

      return this;
    },

    computeLines: function() {
      this.leftLine   = new Line(0, this.yVal, 0, this.yVal + this.width);
      this.rightLine  = new Line(this.length, this.yVal, 
                                 this.length, this.yVal + this.width);
      this.topLine    = new Line(0, this.yVal, this.length, this.yVal);
      this.bottomLine = new Line(0, this.yVal + this.width, 
                                 this.length, this.yVal + this.width);
      this.linesComputed = true;
    },

    run: function(callback) {
      var barElement = jQuery("<div></div>");
      barElement.addClass(this.affair.getHorizontalBarClass());
      barElement.css("position", "absolute");
      barElement.css("top", this.yVal + "px");
      barElement.css("left", "0");
      barElement.css("height", this.width + "px");

      this.affair.getElement().append(barElement);

      barElement.animate({ width: this.length + "px" }, 
                         { queue: false, 
                           duration: this.duration, 
                           easing: "linear",
                           complete: callback });
    }
  });

  var HorizontalBarRtoL = HorizontalBar.extend({
    init: function(affair) {
      this._super(affair);
      this.length = affair.getWidth();
    },

    setLength: function(length) {
      this.length = length;

      return this;
    },

    computeLines: function() {
      this.leftLine   = new Line(this.affair.getWidth() - this.length, 
                                 this.yVal, 
                                 this.affair.getWidth() - this.length, 
                                 this.yVal + this.width);

      this.rightLine  = new Line(this.affair.getWidth(), this.yVal, 
                                 this.affair.getWidth(), this.yVal + this.width);

      this.topLine    = new Line(this.affair.getWidth() - this.length, this.yVal, 
                                 this.affair.getWidth(), this.yVal);

      this.bottomLine = new Line(this.affair.getWidth() - this.length, 
                                 this.yVal + this.width, 
                                 this.affair.getWidth(), 
                                 this.yVal + this.width);

      this.linesComputed = true;
    },

    run: function(callback) {
      var barElement = jQuery("<div></div>");
      barElement.addClass(this.affair.getHorizontalBarClass());
      barElement.css("position", "absolute");
      barElement.css("top", this.yVal + "px");
      barElement.css("right", "0");
      barElement.css("height", this.width + "px");

      this.affair.getElement().append(barElement);

      barElement.animate({ width: this.length + "px" },
                         { queue: false, 
                           duration: this.duration, 
                           easing: "linear",
                           complete: callback });
    }
  });

  var HorizontalBarPinch = HorizontalBar.extend({
    init: function(affair) {
      this._super(affair);
      this.length = affair.getWidth();
    },

    computeLines: function() {
      this.leftLine   = new Line(0, this.yVal, 0, this.yVal + this.width);
      this.rightLine  = new Line(this.affair.getWidth(), this.yVal, 
                                 this.affair.getWidth(), this.yVal + this.width);
      this.topLine    = new Line(0, this.yVal, this.affair.getWidth(), this.yVal);
      this.bottomLine = new Line(0, this.yVal + this.width, 
                                 this.affair.getWidth(), this.yVal + this.width);

      this.linesComputed = true;
    },

    run: function(callback) {
      var leftBarElement = jQuery("<div></div>");
      leftBarElement.addClass(this.affair.getHorizontalBarClass());
      leftBarElement.css("position", "absolute");
      leftBarElement.css("top", this.yVal + "px");
      leftBarElement.css("right", "0");
      leftBarElement.css("height", this.width + "px");

      this.affair.getElement().append(leftBarElement);

      var rightBarElement = jQuery("<div></div>");
      rightBarElement.addClass(this.affair.getHorizontalBarClass());
      rightBarElement.css("position", "absolute");
      rightBarElement.css("top", this.yVal + "px");
      rightBarElement.css("left", "0");
      rightBarElement.css("height", this.width + "px");

      this.affair.getElement().append(rightBarElement);

      var count = 0;
      var tally = function() {
        count++;

        if (count == 2) {
          callback();
        }
      };

      leftBarElement.animate({ width: this.length + "px" },
                             { queue: false, 
                               duration: this.duration, 
                               easing: "linear",
                               complete: tally });

      rightBarElement.animate({ width: this.length + "px" }, 
                              { queue: false, 
                                duration: this.duration, 
                                easing: "linear",
                                complete: tally});
    }

  });

  var VerticalBar = Bar.extend({
    setX: function(xVal) {
      this.xVal = xVal;

      return this;
    }
  });

  var VerticalBarTtoB = VerticalBar.extend({
    init: function(affair) {
      this._super(affair);
      this.length = affair.getHeight();
    },

    setLength: function(length) {
      this.length = length;

      return this;
    },

    computeLines: function() {
      this.leftLine   = new Line(this.xVal, 0, this.xVal, this.length);
      this.rightLine  = new Line(this.xVal + this.width, 0, 
                                 this.xVal + this.width, this.length);
      this.topLine    = new Line(this.xVal, 0, this.xVal + this.width, 0);
      this.bottomLine = new Line(this.xVal, this.length, 
                                 this.xVal + this.width, this.length);
      this.linesComputed = true;
    },

    run: function(callback) {
      var barElement = jQuery("<div></div>");
      barElement.addClass(this.affair.getVerticalBarClass());
      barElement.css("display", "block");
      barElement.css("position", "absolute");
      barElement.css("left", this.xVal + "px");
      barElement.css("top", "0");
      barElement.css("width", this.width + "px");

      this.affair.getElement().append(barElement);

      barElement.animate({ height: this.length + "px" },
                         { queue: false, 
                           duration: this.duration, 
                           easing: "linear",
                           complete: callback });
    }
  });

  var VerticalBarBtoT = VerticalBar.extend({
    init: function(affair) {
      this._super(affair);
      this.length = affair.getHeight();
    },

    setLength: function(length) {
      this.length = length;

      return this;
    },

    computeLines: function() {
      this.leftLine   = new Line(this.xVal, this.affair.getHeight() - this.length,
                                 this.xVal, this.affair.getHeight());
      this.rightLine  = new Line(this.xVal + this.width, 
                                 this.affair.getHeight() - this.length,
                                 this.xVal + this.width, 
                                 this.affair.getHeight());
      this.topLine    = new Line(this.xVal, 
                                 this.affair.getHeight() - this.length,
                                 this.xVal + this.width, 
                                 this.affair.getHeight() - this.length);
      this.bottomLine = new Line(this.xVal, this.affair.getHeight(),
                                 this.xVal + this.width, this.affair.getHeight());
      this.linesComputed = true;
    },

    run: function(callback) {
      var barElement = jQuery("<div></div>");
      barElement.addClass(this.affair.getVerticalBarClass());
      barElement.css("position", "absolute");
      barElement.css("left", this.xVal + "px");
      barElement.css("bottom", "0px");
      barElement.css("width", this.width + "px");

      this.affair.getElement().append(barElement);

      barElement.animate({ height: this.length + "px" },
                         { queue: false, 
                           duration: this.duration, 
                           easing: "linear",
                           complete: callback });
    }
  });

  var VerticalBarPinch = VerticalBar.extend({
    init: function(affair) {
      this._super(affair);
      this.length = affair.getHeight();
    },

    computeLines: function() {
      this.leftLine   = new Line(this.xVal, 0, 
                                 this.xVal, this.affair.getHeight());
      this.rightLine  = new Line(this.xVal + this.width, 0,
                                 this.xVal + this.width, this.affair.getHeight());
      this.topLine    = new Line(this.xVal, 0, this.xVal + this.width, 0);
      this.bottomLine = new Line(this.xVal, this.affair.getHeight(),
                                 this.xVal + this.width, this.affair.getHeight());
      this.linesComputed = true;
    },

    run: function(callback) {
      var topBarElement = jQuery("<div></div>");
      topBarElement.addClass(this.affair.getVerticalBarClass());
      topBarElement.css("display", "block");
      topBarElement.css("position", "absolute");
      topBarElement.css("left", this.xVal + "px");
      topBarElement.css("top", "0");
      topBarElement.css("width", this.width + "px");

      this.affair.getElement().append(topBarElement);

      var bottomBarElement = jQuery("<div></div>");
      bottomBarElement.addClass(this.affair.getVerticalBarClass());
      bottomBarElement.css("position", "absolute");
      bottomBarElement.css("left", this.xVal + "px");
      bottomBarElement.css("bottom", "0px");
      bottomBarElement.css("width", this.width + "px");

      this.affair.getElement().append(bottomBarElement);

      var count = 0;
      var tally = function() {
        count++;

        if (count == 2) {
          callback();
        }
      };

      topBarElement.animate({ height: this.length + "px" },
                            { queue: false, 
                              duration: this.duration, 
                              easing: "linear",
                              complete: tally });
      bottomBarElement.animate({ height: this.length + "px" },
                               { queue: false, 
                                 duration: this.duration, 
                                 easing: "linear",
                                 complete: tally });
    }
  });

  var SlimMiloAffairStage = Class.extend({
    init: function(affair) {
      this.affair = affair;

      this.horizontalBars = [];
      this.verticalBars = [];
    },

    setMainImage: function(url) {
      this.mainImageUrl = url;

      return this;
    },

    createHorizontalBarLtoR: function(width, duration, yVal, length) {
      var bar = new HorizontalBarLtoR(this.affair);
      this.horizontalBars.push(bar);

      return bar;
    },

    createHorizontalBarRtoL: function(width, duration, yVal, length) {
      var bar = new HorizontalBarRtoL(this.affair);
      this.horizontalBars.push(bar);

      return bar;
    },

    createHorizontalBarPinch: function(width, duration, yVal) {
      var bar = new HorizontalBarPinch(this.affair);
      this.horizontalBars.push(bar);

      return bar;
    },

    createVerticalBarTtoB: function(width, duration, xVal, length) {
      var bar = new VerticalBarTtoB(this.affair);
      this.verticalBars.push(bar);

      return bar;
    },

    createVerticalBarBtoT: function(width, duration, xVal, length) {
      var bar = new VerticalBarBtoT(this.affair);
      this.verticalBars.push(bar);

      return bar;
    },

    createVerticalBarPinch: function(width, duration, xVal) {
      var bar = new VerticalBarPinch(this.affair);
      this.verticalBars.push(bar);

      return bar;
    },

    getSlots: function() {
      var _ = this;

      if (this.slots)
        return this.slots;

      var rightLines  = [new Line(this.affair.getWidth(), 
                                   0, 
                                   this.affair.getWidth(), 
                                   this.affair.getHeight())];
      var leftLines   = [new Line(0, 0, 0, this.affair.getHeight())];
      var bottomLines = [new Line(0, this.affair.getHeight(),
                                  this.affair.getWidth(), 
                                  this.affair.getHeight())];
      var topLines    = [new Line(0, 0, this.affair.getWidth(), 0)]; 

      for (var i = 0; i < this.verticalBars.length; i++) {
        var bar = this.verticalBars[i];

        leftLines.push(bar.getRightLine());
        rightLines.push(bar.getLeftLine());
        topLines.push(bar.getBottomLine());
        bottomLines.push(bar.getTopLine());
      }

      for (var i = 0; i < this.horizontalBars.length; i++) {
        var bar = this.horizontalBars[i];

        leftLines.push(bar.getRightLine());
        rightLines.push(bar.getLeftLine());
        topLines.push(bar.getBottomLine());
        bottomLines.push(bar.getTopLine());
      }

      leftLines.sort(function(a,b) { return a.getX1() - b.getX1(); });
      rightLines.sort(function(a,b) { return a.getX1() - b.getX1(); });
      topLines.sort(function(a,b) { return a.getY1() - b.getY1(); });
      bottomLines.sort(function(a,b) { return a.getY1() - b.getY1(); });

      var Corner = Class.extend({
        init: function() {
          this.bestMatch = false;
          this.bestArea = Infinity;
        },

        tryMatchTwo: function(topLeft, bottomRight) {
          var left = topLeft.getLeft();
          var right = bottomRight.getRight();
          var top = topLeft.getTop();
          var bottom = bottomRight.getBottom();

          // make sure the bottomRight is actually to the lower right
          // of this corner and that the lines intersect
          if (left.getX1() < right.getX1() && top.getY1() < bottom.getY1() &&
              left.intersects(bottom) && right.intersects(top)) {
            // it's a match
            var area = (right.getX1() - left.getX1()) *
                       (bottom.getY1() - top.getY1());

            if (! this.bestMatch || area < this.bestArea) {
              this.setBestMatch(topLeft, bottomRight);
              this.bestArea = area;
            }
          }
        },

        hasMatch: function() {
          return this.bestMatch != false;
        },

        createSlot: function(topLeft, bottomRight) {
          var left = topLeft.getLeft();
          var right = bottomRight.getRight();
          var top = topLeft.getTop();
          var bottom = bottomRight.getBottom();

          return new Slot(_.affair, 
                          left.getX1(), top.getY1(),
                          right.getX1(), bottom.getY1());
        },

        uniqueMatch: function() {
          return (this.bestMatch && this.bestMatch.bestMatch === this);
        }
      });

      var TopLeft = Corner.extend({
        init: function(top, left) {
          this._super();
          this.top = top;
          this.left = left;
        },

        getLeft: function() { return this.left; },
        getTop: function() { return this.top; },

        setBestMatch: function(topLeft, bottomRight) { 
          this.bestMatch = bottomRight; 
        },

        tryMatch: function(bottomRight) {
          return this.tryMatchTwo(this, bottomRight);
        },

        toSlot: function() {
          return this.createSlot(this, this.bestMatch);                
        }
      });

      var BottomRight = Corner.extend({
        init: function(bottom, right) {
          this._super();
          this.right = right;
          this.bottom = bottom;
        },

        getRight: function() { return this.right; },
        getBottom: function() { return this.bottom; },

        setBestMatch: function(topLeft, bottomRight) { 
          this.bestMatch = topLeft; 
        },

        tryMatch: function(topLeft) {
          return this.tryMatchTwo(topLeft, this);
        },

        toSlot: function() {
          return this.createSlot(this.bestMatch, this);                
        }
      });

      var topLefts = [];

      for (var i = 0; i < leftLines.length; i++) {
        for (var j = 0; j < topLines.length; j++) { 
          var l = leftLines[i];
          var t = topLines[j];

          // make sure these lines intersect AND have the possibility of having
          // an area greater than 0 when defining rectangles with an upper left
          // corner
          if (l.intersects(t) && t.getX2() != l.getX2()) {
            topLefts.push(new TopLeft(t, l));
          }
        }
      }

      var bottomRights = [];

      for (var i = 0; i < rightLines.length; i++) {
        for (var j = 0; j < bottomLines.length; j++) { 
          var r = rightLines[i];
          var b = bottomLines[j];
          
          // make sure these lines intersect AND have the possibility of having
          // an area greater than 0 when defining rectangles with an lower right
          // corner
          if (r.intersects(b) && b.getX1() != r.getX1()) {
            bottomRights.push(new BottomRight(b, r));
          }
        }
      }

      // try matching both ways, finding the minimum slot for each corner

      for (var i = 0; i < topLefts.length; i++) {
        for (var j = 0; j < bottomRights.length; j++) {
          topLefts[i].tryMatch(bottomRights[j]);
        }
      }

      for (var i = 0; i < topLefts.length; i++) {
        for (var j = 0; j < bottomRights.length; j++) {
          bottomRights[j].tryMatch(topLefts[i]);
        }
      }

      this.slots = [];

      for (var i = 0; i < topLefts.length; i++) {
        var corner = topLefts[i];

        if (corner.hasMatch())
          this.slots.push(corner.toSlot().setPosition(this.slots.length));
      }

      for (var i = 0; i < bottomRights.length; i++) {
        var corner = bottomRights[i];

        if (corner.hasMatch() && ! corner.uniqueMatch()) {
          this.slots.push(corner.toSlot().setPosition(this.slots.length));
        }
      }

      return this.slots;
    },

    run: function(callback) {
      var _ = this;

      var slots = this.getSlots();

      var readyCount = 0;
      var readyLimit = 1 + slots.length;

      function ready() {
        readyCount++;

        if (readyCount >= readyLimit) {
          _.affair.getElement().fadeIn("slow", function() {
            _.slideInBars(callback);
          });
        }
      }

      var image = jQuery("<img></img>");
      image.attr("src", this.mainImageUrl);
      if (jQuery.browser.msie)
        image.ready(ready);
      else
        image.load(ready);

      this.affair.getElement().hide();
      this.affair.getElement().empty();
      this.affair.getElement().append(image);

      for (var i = 0; i < slots.length; i++)
        slots[i].preload(ready);
    },

    slideInBars: function(callback) {
      var _ = this;
      var finishCount = 0;
      var barCount = this.horizontalBars.length + this.verticalBars.length;

      var tally = function() {
        finishCount++;

        if (finishCount >= barCount)
          _.fadeSlots(callback);
      };

      for (var i = 0; i < this.horizontalBars.length; i++) {
        this.horizontalBars[i].run(tally);
      }

      for (var i = 0; i < this.verticalBars.length; i++) {
        this.verticalBars[i].run(tally);
      }
    },

    fadeSlots: function(callback) {
      var _ = this;
      var slots = this.getSlots();

      var finishCount = 0;

      var tally = function() {
        finishCount++;

        if (finishCount >= slots.length)
          _.slideImages(callback);
      };

      for (var i = 0; i < slots.length; i++) {
        slots[i].fade(tally);
      }
    },

    slideImages: function(callback) {
      var _ = this;
      var slots = this.getSlots();

      var finishCount = 0;

      var tally = function() {
        finishCount++;

        if (finishCount >= slots.length)
          _.fadeOut(callback);
      };

      for (var i = 0; i < slots.length; i++) {
        slots[i].slideImage(tally);
      }
    },

    fadeOut: function(callback) {
      this.affair.getElement().delay(this.affair.getStagePause())
                              .fadeOut(this.affair.getFadeDuration(), callback);
    }
  });

  SlimMiloAffair = Class.extend({
    init: function(element) {
      this.element = element;
      this.height = element.height();
      this.width = element.width();

      this.stages = [];

      this.horizontalBarClass = "sma-horizontal-bar";
      this.verticalBarClass = "sma-vertical-bar";
      this.barDuration = 1000;
      this.barWidth = "20";
      this.fadeDuration = 1000;
      this.fadeOpacity = 0.50;
      this.setupMode = false;
      this.stagePause = 4000;
      this.subImageOpacity = 0.25;

      element.css("position", "relative");
    },

    getWidth: function() { return this.width; },
    getHeight: function() { return this.height; },
    getElement: function() { return this.element; },
    getHorizontalBarClass: function() { return this.horizontalBarClass; },
    getVerticalBarClass: function() { return this.verticalBarClass; },
    getBarWidth: function() { return this.barWidth; },
    getBarDuration: function() { return this.barDuration; },
    getFadeDuration: function() { return this.fadeDuration; },
    getFadeOpacity: function() { return this.fadeOpacity; },
    setupModeEnabled: function() { return this.setupMode; },
    getStagePause: function() { return this.stagePause; },
    getSubImageOpacity: function() { return this.subImageOpacity; },

    setSubImageOpacity: function(opacity) { 
      this.subImageOpacity = opacity;
      return this;
    },

    setStagePause: function(pause) {
      this.stagePause = pause;
      return this;
    },

    setBarWidth: function(width) { 
      this.barWidth = width;
      return this;
    },

    setBarDuration: function(duration) {
      this.barDuration = duration;
      return this;
    },

    setHorizontalBarClass: function(cl) { 
      this.horizontalBarClass = cl; 
      return this;
    },

    setVerticalBarClass: function(cl) { 
      this.verticalBarClass = cl; 
      return this;
    },

    setFadeDuration: function(duration) {
      this.fadeDuration = duration;
      return this;
    },

    setFadeOpacity: function(opacity) {
      this.fadeOpacity = opacity;
      return this;
    },

    createStage: function() {
      var stage = new SlimMiloAffairStage(this);
      this.stages.push(stage);

      return stage;
    },

    enableSetupMode: function() {
      this.setupMode = true;

      return this;
    },

    run: function() {
      var _ = this;
      var i = 0;

      var nextStage = function() {
        if (i >= _.stages.length)
          i = 0;

        _.stages[i++].run(nextStage);
      };

      nextStage();
    }
  });
})();
