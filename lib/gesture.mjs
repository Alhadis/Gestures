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
		
		// Properties
		let tracking   = false;
		let destroyed  = false;
		let motionPath = [];
		
		Object.defineProperties(this, {
			motionPath: { get: () => motionPath },
			startPoint: { get: () => motionPath[0] || null },
			endPoint:   { get: () => motionPath[motionPath.length - 1] || null },
			angle:      { get: () => Math.atan2(this.deltaY, this.startPoint.x - this.endPoint.x) * 180 / Math.PI },
			delta:      { get: () => Math.sqrt(Math.pow(this.deltaX, 2) + Math.pow(this.deltaY, 2)) },
			deltaX:     { get: () => this.startPoint ? this.endPoint.x - this.startPoint.x : 0 },
			deltaY:     { get: () => this.startPoint ? this.endPoint.y - this.startPoint.y : 0 },
			duration:   { get: () => this.startPoint ? this.endPoint.time - this.startPoint.time : 0 },
			destroyed:  { get: () => destroyed },
			destroy: {
				value: () => {
					this.tracking = false;
					destroyed = true;
					motionPath = null;
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


		const onStart = event => {

			// Don't do anything if the user right-clicked
			if(event.button > 0) return;
			
			const coords = this.track(event);
			motionPath = [coords];
			
			// Allow onStart callbacks to abort Gesture by returning false
			if(_onStart && false === _onStart(coords, event, this))
				return;

			this.tracking = true;
		};

		const onMove = event => {
			const coords = this.track(event);
			motionPath.push(coords);
			
			// Allow onMove callbacks to abort Gesture by returning false
			if(_onMove && false === _onMove(coords, event, this)){
				this.tracking = false;
				return;
			}
			if(blocking) event.preventDefault();
		};

		const onEnd = event => {
			const coords = this.track(event);
			motionPath.push(coords);
			this.tracking = false;
			if(_onEnd) _onEnd(coords, event, this);
		};
		
		el.addEventListener(START, onStart, listenOpt);
	}
	
	
	/**
	 * Record the coordinates and timing of an event instance.
	 *
	 * @param {PointerEvent|TouchEvent|MouseEvent} event
	 * @return {Object[]}
	 * @internal
	 */
	track(event){
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
				const point = this.resolvePoint(touches[i]);
				point.time  = event.timeStamp;
				result.push(point);
			}
			// FIXME: How/where to store additional Touch objects?
			return result[0];
		}

		// MouseEvent or something similar
		return this.resolvePoint(event);
	}
	
	
	/**
	 * Resolve physical coordinates for a single {@link PointerEvent} or {@link Touch}.
	 *
	 * Missing and unsupported properties are assigned default values.
	 * @param {PointerEvent|MouseEvent|Touch} e
	 * @return {Object}
	 * @internal
	 */
	resolvePoint(e){
		const result = {
			x:      e.pageX,
			y:      e.pageY,
			time:   e.timeStamp || 0,
			width:  1,
			height: 1,
			pressure: 0.5,
			tangentialPressure: 0,
			tiltX: 0,
			tiltY: 0,
			twist: 0,
		};
		switch(event.constructor){
			case Touch:
				result.width    = e.radiusX || 1;
				result.height   = e.radiusY || 1;
				result.twist    = e.rotationAngle || 0;
				break;
			case PointerEvent:
				result.width    = e.width    || 1;
				result.height   = e.height   || 1;
				result.pressure = e.pressure || 0.5;
				result.tangentialPressure = e.tangentialPressure || 0;
				result.tiltX    = e.tiltX    || 0;
				result.tiltY    = e.tiltY    || 0;
				result.twist    = e.twist    || 0;
				break;
		}
		return result;
	}
}
