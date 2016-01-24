(function(){
	"use strict";
	
	var html         = document.documentElement;
	var touchEnabled = "ontouchstart" in html;
	
	/** Event types */
	var START     = touchEnabled ? "touchstart"  : "mousedown";
	var MOVE      = touchEnabled ? "touchmove"   : "mousemove";
	var END       = touchEnabled ? "touchend"    : "mouseup";
	var CANCEL    = touchEnabled ? "touchcancel" : null;
	
	
	function Gesture(el){
		var THIS      = this;
		var _tracking = false;
		
		
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
		
		
		var onMove = function(e){
			console.log("Moving");
			e.preventDefault();
		};
		
		var onEnd  = function(e){
			console.log("End: " + e.type);
			THIS.tracking = false;
			e.preventDefault();
		};
		
		el.addEventListener(START, function(e){
			console.log("Starting");
			THIS.tracking = true;
			e.preventDefault();
		});
	}
	
	
	/** Export */
	window.Gesture = Gesture;
}());
