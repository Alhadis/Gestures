(function(){
	"use strict";

	
	/**
	 * Swipeable content.
	 */
	function Swipeable(el, options){
		options           = options || {};
		var THIS          = this;
		var children      = el.children;
		var _offset       = 0;
		var _active;
		
		var activeClass   = options.activeClass   || "active";
		var draggingClass = options.draggingClass || "dragging";
		var minDistance   = options.minDistance   || 125;
		var fastSwipe     = options.fastSwipe     || 200;
		var scrollAngle   = (+options.scrollAngle || 5) * 2;
		var stretchBefore = options.stretchBefore;
		var stretchAfter  = options.stretchAfter;
		var clearBefore   = options.clearBefore;
		var clearAfter    = options.clearAfter;
		
		
		/** Configure the container's "dragability" */
		var startPoint, startTime;
		var gesture = new Gesture(options.swipeTarget || el, {
			
			onStart: function(coords, event){
				startPoint = coords;
				startTime  = event.timeStamp;
				el.classList.add(draggingClass);
			},
			
			onMove: function(coords){
				
				/** If the swipe looks too vertical, the user's probably trying to scroll. Bail. */
				if(Math.abs(Math.abs((Math.atan2(coords[1] - startPoint[1], startPoint[0] - coords[0])) * 180 / Math.PI) - 90) < scrollAngle){
					THIS.offset = 0;
					el.classList.remove(draggingClass);
					return false;
				}
				
				THIS.offset = coords[0] - startPoint[0];
			},
			
			onEnd: function(coords, event){
				var distance = coords[0] - startPoint[0];
				THIS.offset  = 0;
				
				/** Multiply effective distance if the swipe was really fast */
				if(fastSwipe > 0 && event.timeStamp - startTime < fastSwipe)
					distance *= 3;
				
				if(distance > minDistance)       --THIS.active;
				else if(distance < -minDistance) ++THIS.active;
				
				el.classList.remove(draggingClass);
			}
		});
		

		Object.defineProperties(THIS, {
			el: {value: el},
			
			active: {
				get: function(){ return _active },
				set: function(input){
					
					/** Clamp input between 0 and the number of contained elements */
					var kidCount = children.length;
					var min = clearBefore ? -1 : 0;
					var max = kidCount - (clearAfter ? 0 : 1);
					
					if((input = +input) < min) input = min;
					else if(input >= max)      input = max;
					
					/** Make sure the value's different to our existing one */
					if(input !== _active){
						for(var i = 0, l = kidCount; i < l; ++i)
							children[i].classList[input === i ? "add" : "remove"](activeClass);
						onChange && onChange.call(null, input, _active, THIS);
						_active = input;
					}
				}
			},
			
			/** The distance the container's been pulled from its starting point */
			offset: {
				get: function(){ return _offset },
				set: function(i){
					if((i = +i) !== _offset){
						
						/** Bail if we shouldn't swipe outside the content's boundaries */
						if((!stretchBefore && i > 0 && _active <= (clearBefore ? -1 : 0))
						|| (!stretchAfter  && i < 0 && _active >= children.length - (clearAfter ? 0 : 1)))
							return;
						
						_offset = i;
						el.style[CSS_TRANSFORM] = xformBefore + i + "px" + xformAfter;
					}
				}
			}
		});
		
		
		/** Determine the initial slide index */
		(function(){
			for(var i = 0, l = children.length; i < l; ++i)
				if(children[i].classList.contains(activeClass))
					return THIS.active = i;
			THIS.active = clearBefore ? -1 : (clearAfter ? l : 0);
		}());
		
		
		/** Property pieces used for assigning transform values */
		var xformBefore = CSS_3D_SUPPORTED ? "translate3D(" : "translateX(";
		var xformAfter  = CSS_3D_SUPPORTED ? ",0,0)"        : ")";
		
		/** Extract onChange callback, if supplied */
		var onChange    = options.onChange;
	}




	/**
	 * Name of the CSSOM property used by this browser for CSS transforms.
	 * For instance, this will be "msTransform" in IE9, and "transform" in
	 * modern browsers.
	 *
	 * @type {String}
	 */
	var CSS_TRANSFORM = (function(n){
		s = document.documentElement.style;
		if((prop = n.toLowerCase()) in s) return prop;
		for(var prop, s, p = "Webkit Moz Ms O Khtml", p = (p.toLowerCase() + p).split(" "), i = 0; i < 10; ++i)
			if((prop = p[i]+n) in s) return prop;
		return "";
	}("Transform"));


	/**
	 * Whether 3D transforms are supported by this browser.
	 *
	 * @type {Boolean}
	 */
	var CSS_3D_SUPPORTED = (function(propName){
		var e = document.createElement("div"), s = e.style,
		v = [["translateY(", ")"], ["translate3d(0,", ",0)"]]
		try{ s[propName] = v[1].join("1px"); } catch(e){}
		return v[+!!s[propName]] === v[1];
	}(CSS_TRANSFORM));
	
	
	/** Export */
	window.Swipeable = Swipeable;
}());
