(function(){
	"use strict";
	
	var html         = document.documentElement;
	var touchEnabled = "ontouchstart" in html;
	
	/** Event types */
	var START     = touchEnabled ? "touchstart"  : "mousedown";
	var MOVE      = touchEnabled ? "touchmove"   : "mousemove";
	var END       = touchEnabled ? "touchend"    : "mouseup";
	var CANCEL    = touchEnabled ? "touchcancel" : null;
	
	
	function Gesture(el, options){
		options           = options || {};
		var THIS          = this;
		var _tracking     = false;
		
		var startCallback = options.onStart;
		var moveCallback  = options.onMove;
		var endCallback   = options.onEnd;
		
		
		Object.defineProperties(THIS, {
			getCoords: { value: getCoords },
			distance:  { value: distance  },
			
			/** Whether the gesture's currently being made */
			tracking: {
				get: function(){ return _tracking },
				set: function(i){
					if((i = !!i) !== _tracking){
						_tracking = i;
						
						if(i){
							html.addEventListener(MOVE, onMove);
							html.addEventListener(END,  onEnd);
							
							CANCEL && html.addEventListener(CANCEL, onEnd);
							window.addEventListener("blur", onEnd);
						}
						
						else{
							html.removeEventListener(MOVE, onMove);
							html.removeEventListener(END,  onEnd);
							
							CANCEL && html.removeEventListener(CANCEL, onEnd);
							window.removeEventListener("blur", onEnd);
						}
					}
				}
			}
		});
		
		
		/** Measure the distance between two points */
		function distance(a, b){
			return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
		}
		
		
		/**
		 * Return an array of [x,y] coordinates for an event instance.
		 *
		 * For desktop devices, the array will generally hold one element only.
		 * Touch-enabled devices may return more depending on how many fingers
		 * triggered the event.
		 *
		 * @param {Event} event
		 * @return {Array}
		 */
		function getCoords(event){
			
			/** Touch-enabled device */
			if(touches = event.touches){
				var touches, result  = [];
				for(var t, i = 0, l = touches.length; i < l; ++i){
					t = touches[i];
					result.push([t.pageX, t.pageY]);
				}
				return result;
			}
			
			/** MouseEvent or something similar */
			else return [[event.pageX, event.pageY]];
		}
		
		
		function onMove(event){
			event.preventDefault();
			
			moveCallback && moveCallback.call(null, event, THIS);
		};
		
		function onEnd(event){
			THIS.tracking = false;
			event.preventDefault();
			
			endCallback && endCallback.call(null, event, THIS);
		};
		
		
		el.addEventListener(START, function(event){
			
			if(startCallback && false === startCallback.call(null, event, THIS))
				return;
			
			THIS.tracking = true;
			event.preventDefault();
		});
	}
	
	
	/** Export */
	window.Gesture = Gesture;
}());
