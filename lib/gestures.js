(function(){
	"use strict";
	
	var html         = document.documentElement;
	var touchEnabled = "ontouchstart" in html;
	
	// Event types
	var START     = touchEnabled ? "touchstart"  : "mousedown";
	var MOVE      = touchEnabled ? "touchmove"   : "mousemove";
	var END       = touchEnabled ? "touchend"    : "mouseup";
	var CANCEL    = touchEnabled ? "touchcancel" : null;
	
	// Prefer PointerEvents API
	var pointerEnabled = false;
	if("ongotpointercapture" in html && "function" === typeof PointerEvent){
		START  = "pointerdown";
		MOVE   = "pointermove";
		END    = "pointerup";
		CANCEL = "pointercancel";
		pointerEnabled = true;
	}
	
	// Use non-blocking event handlers
	var passiveEnabled = false;
	try{
		var descriptor = Object.defineProperty({}, "passive", {
			get: function(){ passiveEnabled = true; }
		});
		window.addEventListener("Z", null, descriptor);
		window.removeEventListener("Z", null, descriptor);
	} catch(e){}
	
	
	function Gesture(el, options){
		options           = options || {};
		var THIS          = this;
		var _tracking     = false;
		
		var blocking      = !!options.blocking;
		var _onStart      = options.onStart || null;
		var _onMove       = options.onMove  || null;
		var _onEnd        = options.onEnd   || null;
		var listenOptions = passiveEnabled && !blocking ? {passive: true} : false;
		
		
		Object.defineProperties(THIS, {
			
			/**
			 * Whether the gesture's currently being made.
			 * @property {Boolean}
			 */
			tracking: {
				get: function(){ return _tracking },
				set: function(i){
					if((i = !!i) !== _tracking){
						_tracking = i;
						
						if(i){
							html.addEventListener(MOVE,                onMove, listenOptions);
							html.addEventListener(END,                 onEnd,  listenOptions);
							CANCEL && html.addEventListener(CANCEL,    onEnd,  listenOptions);
							window.addEventListener("blur",            onEnd,  listenOptions);
							window.addEventListener("contextmenu",     onEnd,  listenOptions);
						}
						
						else{
							html.removeEventListener(MOVE,             onMove, listenOptions);
							html.removeEventListener(END,              onEnd,  listenOptions);
							CANCEL && html.removeEventListener(CANCEL, onEnd,  listenOptions);
							window.removeEventListener("blur",         onEnd,  listenOptions);
							window.removeEventListener("contextmenu",  onEnd,  listenOptions);
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
			
			// Touch-enabled device
			if(touches = event.touches){
				var touches;
				var length = touches.length;
				
				// Use .changedTouches if .touches is empty,
				// such as with `touchend` events.
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
			
			// MouseEvent or something similar
			else return [event.pageX, event.pageY];
		}
		
		
		function onMove(event){
			
			// Allow onMove callbacks to abort the gesture by returning false
			if(_onMove && false === _onMove.call(null, getCoords(event), event, THIS)){
				THIS.tracking = false;
				return;
			}
			if(blocking) event.preventDefault();
		};
		
		function onEnd(event){
			THIS.tracking = false;
			_onEnd && _onEnd.call(null, getCoords(event), event, THIS);
		};
		
		
		el.addEventListener(START, function(event){
			
			// Don't do anything if the user right-clicked
			if(event.button > 0) return;
			
			// Allow onStart callbacks to abort gesture by returning false
			if(_onStart && false === _onStart.call(null, getCoords(event), event, THIS))
				return;
			
			THIS.tracking = true;
		});
	}
	
	
	// Export
	window.Gesture = Gesture;
}());
