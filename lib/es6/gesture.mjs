const html         = document.documentElement;
const touchEnabled = "ontouchstart" in html;

// Event types
const START   = touchEnabled ? "touchstart"  : "mousedown";
const MOVE    = touchEnabled ? "touchmove"   : "mousemove";
const END     = touchEnabled ? "touchend"    : "mouseup";
const CANCEL  = touchEnabled ? "touchcancel" : null;


export default class Gesture {

	constructor(el, options = {}){
		const {onStart, onMove, onEnd} = options;
		let tracking = false;

		this.startCallback = onStart;
		this.moveCallback  = onMove;
		this.endCallback   = onEnd;

		Object.defineProperties(this, {
			
			/**
			 * Whether the gesture's currently being made.
			 * @property {Boolean}
			 */
			tracking: {
				get: () => tracking,
				set: to => {
					if((to = !!to) !== tracking){
						tracking = to;
						
						if(to){
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

		el.addEventListener(START, event => {
		
			// Don't do anything if the user right-clicked
			if(event.button > 0) return;
	
			// Allow onStart callbacks to abort gesture by returning false
			if(onStart && false === onStart.call(null, getCoords(event), event, this))
				return;

			this.tracking = true;
		});
	}
	
	
	/**
	 * Return the coordinates of an event instance.
	 *
	 * @param {Event} event
	 * @return {Array}
	 */
	getCoords(event){
		let {touches} = event;

		// Touch-enabled device
		if(touches){
			let {length} = touches;

			// Use .changedTouches if .touches is empty,
			// such as with `touchend` events.
			if(!length){
				touches = event.changedTouches;
				length = touches.length;
			}

			const result = [];
			for(let i = 0; i < length; ++i){
				const t = touches[i];
				result.push(t.pageX, t.pageY);
			}
			return result;
		}

		// MouseEvent or something similar
		else return [event.pageX, event.pageY];
	}


	onMove(event){

		// Allow onMove callbacks to abort the gesture by returning false
		if(this.moveCallback && false === this.moveCallback.call(null, getCoords(event), event, this)){
			this.tracking = false;
			return;
		}
		event.preventDefault();
	}


	onEnd(event){
		this.tracking = false;
		this.endCallback && this.endCallback.call(null, getCoords(event), event, this);
	}
}
