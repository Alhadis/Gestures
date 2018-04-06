import Gesture from "./gesture.mjs";
import {clamp, translate} from "./support.mjs";
const html = document.documentElement;


export default class Drawer {
	
	constructor(el, options = {}){
		const {
			openClass     = "open",
			closeClass    = "",
			draggingClass = "dragging",
			location      = "left",
			bufferSize    = 60,
			flickSpeed    = 150,
			openThreshold = 0.5,
			gestureTarget = html,
			onOpen,
			onClose,
		} = options;
		
		const vertical = "top" === location || "bottom" === location;
		let opened     = el.classList.contains(openClass);
		let position   = opened ? 1 : 0;
		let bounds     = null;
		let width      = 0;
		let height     = 0;
		
		
		Object.defineProperties(this, {
			/**
			 * Reference to the drawer's container element.
			 * @property {HTMLElement}
			 * @readonly
			 */
			el: {
				value: el,
				writable: false,
			},
			
			/**
			 * How far the drawer's been dragged from its active edge.
			 * @property {Number} - Ratio between 0.0 and 1.0
			 */
			position: {
				get: () => position,
				set: to => {
					to = Math.min(1, Math.max(0, +to || 0));
					if(to !== position){
						position = to;
						to = to ? (to * 100) + "%" : 0;
						translate(el, vertical ? 0 : to, vertical ? to : 0);
					}
				}
			},
			
			/**
			 * Whether the drawer is currently open.
			 * @property {Boolean}
			 */
			opened: {
				get: () => opened,
				set: to => {
					if((to = !!to) !== opened){
						opened = to;
						if(opened){
							openClass  && el.classList.add(openClass);
							closeClass && el.classList.remove(openClass);
							onOpen     && onOpen.call(this);
						}
						else{
							openClass  && el.classList.remove(openClass);
							closeClass && el.classList.add(openClass);
							onClose    && onClose.call(this);
						}
					}
				}
			},
		});
		
		
		// Configure drawer's "dragability"
		const drag = new Gesture(gestureTarget, {
			blocking: true,
			
			onStart: point => {
				bounds = el.getBoundingClientRect();
				width  = bounds.right  - bounds.left;
				height = bounds.bottom - bounds.top;
				
				// Cancel gesture if it's too far from the container's edge
				if(!isCloseEnough(point))
					return false;
				
				draggingClass && el.classList.add(draggingClass);
			},
			
			onMove: () => {
				this.position = +!!opened + resolveDelta();
			},
			
			onEnd: () => {
				const flick = flickSpeed > 0 && drag.duration < flickSpeed ? 3 : 1;
				if(Math.abs(resolveDelta()) * flick >= openThreshold)
					this.opened = !opened;
				
				this.position = opened ? 1 : 0;
				draggingClass && el.classList.remove(draggingClass);
			},
		});
		
		
		/**
		 * Resolve the effective drag distance for the relevant axis.
		 *
		 * @return {Number}
		 * @internal
		 */
		function resolveDelta(){
			switch(location){
				default: return opened
					? clamp(drag.deltaX / width, -1, 0)
					: clamp(drag.deltaX / width,  0, 1);
				
				case "right": return opened
					? clamp(drag.deltaX / width,  0, 1)
					: clamp(drag.deltaX / width, -1, 0);
				
				case "bottom": return opened
					? clamp(drag.deltaY / height,  0, 1)
					: clamp(drag.deltaY / height, -1, 0);
				
				case "top": return opened
					? clamp(drag.deltaY / height, -1, 0)
					: clamp(drag.deltaY / height,  0, 1);
			}
		}
		
		/**
		 * Determine if a point falls close enough to begin dragging.
		 *
		 * @param {Object} point
		 * @return {Boolean}
		 * @internal
		 */
		function isCloseEnough({x, y}){
			switch(location){
				default:       return x <= bounds.right  + bufferSize;
				case "top":    return y <= bounds.bottom + bufferSize;
				case "bottom": return y >= bounds.bottom - bufferSize;
				case "right":  return x >= bounds.left   - bufferSize;
			}
		}
	}
}
