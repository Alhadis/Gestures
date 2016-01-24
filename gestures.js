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
		
		
		function onMove(event){
			console.log("Moving");
			event.preventDefault();
			
			moveCallback && moveCallback.call(null, event, THIS);
		};
		
		function onEnd(event){
			console.log("End: " + event.type);
			
			THIS.tracking = false;
			event.preventDefault();
			
			endCallback && endCallback.call(null, event, THIS);
		};
		
		
		el.addEventListener(START, function(event){
			
			if(startCallback && false === startCallback.call(null, event, THIS)){
				console.log("Aborted");
				return;
			}
			
			console.log("Starting");
			THIS.tracking = true;
			event.preventDefault();
		});
	}
	
	
	/** Export */
	window.Gesture = Gesture;
}());
