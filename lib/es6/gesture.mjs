const noop           = () => {};
const html           = document.documentElement;
const touchEnabled   = "ontouchstart" in html;
const pointerEnabled = "ongotpointercapture" in html && "function" === typeof PointerEvent;

// Event types
const START   = touchEnabled ? "touchstart"  : pointerEnabled ? "pointerdown"   : "mousedown";
const MOVE    = touchEnabled ? "touchmove"   : pointerEnabled ? "pointermove"   : "mousemove";
const END     = touchEnabled ? "touchend"    : pointerEnabled ? "pointerup"     : "mouseup";
const CANCEL  = touchEnabled ? "touchcancel" : pointerEnabled ? "pointercancel" : null;

// Use non-blocking event handlers
const passiveEnabled = (isSupported => {
	try{
		const descriptor = {get passive(){ isSupported = true; }};
		window.addEventListener("Z", null, descriptor);
		window.removeEventListener("Z", null, descriptor);
	} catch(e){}
	return isSupported;
})(false);


export default class Gesture {

	constructor(el, options = {}){
		const blocking  = !!options.blocking;
		const _onStart  = options.onStart || null;
		const _onMove   = options.onMove  || null;
		const _onEnd    = options.onEnd   || null;
		const listenOpt = passiveEnabled && !blocking
			? {passive: true}
			: false;
		
		// Event handlers
		const onStart = event => {

			// Don't do anything if the user right-clicked
			if(event.button > 0) return;
			
			const callbackResult = _onStart
				? _onStart.call(null, this.getCoords(event), event, this)
				: null;
			
			// Allow onStart callbacks to abort Gesture by returning false
			if(false === callbackResult)
				return;

			this.tracking = true;
		};

		const onMove = event => {
			
			// Allow onMove callbacks to abort Gesture by returning false
			if(_onMove && false === _onMove.call(null, this.getCoords(event), event, this)){
				this.tracking = false;
				return;
			}
			if(blocking) event.preventDefault();
		};

		const onEnd = event => {
			this.tracking = false;
			if(_onEnd) _onEnd.call(null, this.getCoords(event), event, this);
		};
		
		
		// Properties
		let tracking  = false;
		let destroyed = false;
		
		Object.defineProperties(this, {
			destroyed: { get: () => destroyed },
			destroy: {
				value: () => {
					this.tracking = false;
					destroyed = true;
					el.removeEventListener(START, onStart, listenOpt);
				},
			},
			tracking: {
				get: () => tracking,
				set: to => {
					if(destroyed) return;
					if((to = !!to) !== tracking){
						tracking = to;
						
						if(to){
							html.addEventListener(MOVE,                onMove, listenOpt);
							html.addEventListener(END,                 onEnd,  listenOpt);
							CANCEL && html.addEventListener(CANCEL,    onEnd,  listenOpt);
							window.addEventListener("blur",            onEnd,  listenOpt);
							window.addEventListener("contextmenu",     onEnd,  listenOpt);
						}
						
						else{
							html.removeEventListener(MOVE,             onMove, listenOpt);
							html.removeEventListener(END,              onEnd,  listenOpt);
							CANCEL && html.removeEventListener(CANCEL, onEnd,  listenOpt);
							window.removeEventListener("blur",         onEnd,  listenOpt);
							window.removeEventListener("contextmenu",  onEnd,  listenOpt);
						}
					}
				}
			}
		});

		el.addEventListener(START, onStart, listenOpt);
	}
	
	
	/**
	 * Resolve the coordinates of an event instance.
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
}
