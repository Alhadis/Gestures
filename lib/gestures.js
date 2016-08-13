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
		
		THIS.onStart      = startCallback;
		THIS.onMove       = moveCallback;
		THIS.onEnd        = endCallback;
		
		
		Object.defineProperties(THIS, {
			
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
							window.addEventListener("contextmenu", onEnd);
						}
						
						else{
							html.removeEventListener(MOVE, onMove);
							html.removeEventListener(END,  onEnd);
							
							CANCEL && html.removeEventListener(CANCEL, onEnd);
							window.removeEventListener("blur", onEnd);
							window.removeEventListener("contextmenu", onEnd);
						}
					}
				}
			}
		});
		
		
		/**
		 * Return the coordinates of an event instance.
		 *
		 * @param {Event} event
		 * @return {Array}
		 */
		function getCoords(event){
			
			/** Touch-enabled device */
			if(touches = event.touches){
				var touches;
				var length = touches.length;
				
				/** Use .changedTouches if .touches is empty (e.g., "touchend" events) */
				if(!length){
					touches = event.changedTouches;
					length  = touches.length;
				}

				var result = [];
				for(var t, i = 0; i < length; ++i){
					t = touches[i];
					result.push(t.pageX, t.pageY);
				}
				return result;
			}
			
			/** MouseEvent or something similar */
			else return [event.pageX, event.pageY];
		}
		
		
		function onMove(event){
			
			/** Allow an onMove callback to abort the entire gesture by returning false */
			if(moveCallback && false === moveCallback.call(null, getCoords(event), event, THIS)){
				THIS.tracking = false;
				return;
			}
			event.preventDefault();
		};
		
		function onEnd(event){
			THIS.tracking = false;
			endCallback && endCallback.call(null, getCoords(event), event, THIS);
		};
		
		
		el.addEventListener(START, function(event){
			
			/** Don't do anything if the user right-clicked */
			if(event.button > 0) return;
			
			/** Allow an onStart callback to abort the gesture by returning false */
			if(startCallback && false === startCallback.call(null, getCoords(event), event, THIS))
				return;
			
			THIS.tracking = true;
		});
	}
	
	
	/** Export */
	window.Gesture = Gesture;
}());
