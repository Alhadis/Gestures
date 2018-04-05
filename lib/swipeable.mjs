import Gesture from "./gesture.mjs";
import Support from "./support.mjs";

const {cssTransform, css3DSupported} = Support;

// Property pieces used for assigning transform values
const xformBefore = css3DSupported ? "translate3D(" : "translateX(";
const xformAfter  = css3DSupported ? ",0,0)"        : ")";


/**
 * Swipeable content.
 * @class
 */
export default class Swipeable {

	constructor(el, options = {}){
		const {children}  = el;
		let offset        = 0;
		let active;

		let {
			activeClass   = "active",
			draggingClass = "dragging",
			minDistance   = 125,
			fastSwipe     = 200,
			scrollAngle   = 5,
			swipeTarget   = el,
			stretchBefore,
			stretchAfter,
			clearBefore,
			clearAfter,
			onChange,
		} = options;

		scrollAngle = (+scrollAngle || 5) * 2;
		
		// Configure the container's "dragability"
		const drag = new Gesture(swipeTarget, {

			onStart: coords => {
				el.classList.add(draggingClass);
			},
			
			onMove: coords => {
				
				// If the swipe looks too vertical, the user's probably trying to scroll. Bail.
				if(Math.abs(drag.angle - 90) < scrollAngle){
					this.offset = 0;
					el.classList.remove(draggingClass);
					return false;
				}
				
				this.offset = drag.deltaX;
			},
			
			onEnd: coords => {
				let distance = drag.deltaX;
				this.offset  = 0;
				
				// Multiply effective distance if the swipe was really fast
				if(fastSwipe > 0 && drag.duration < fastSwipe)
					distance *= 3;
				
				if(distance > minDistance)       --this.active;
				else if(distance < -minDistance) ++this.active;
				
				el.classList.remove(draggingClass);
			}
		});
		

		Object.defineProperties(this, {
			el: {value: el},
			
			active: {
				get: () => active,
				set: to => {
					
					// Clamp input between 0 and the number of contained elements */
					const {length} = children;
					const min = clearBefore ? -1 : 0;
					const max = length - (clearAfter ? 0 : 1);
					
					if((to = +to) < min) to = min;
					else if(to >= max)   to = max;
					
					// Make sure the value's different to our existing one
					if(to !== active){
						for(let i = 0; i < length; ++i)
							children[i].classList[to === i ? "add" : "remove"](activeClass);
						onChange && onChange.call(this, to, active, this);
						active = to;
					}
				}
			},
			
			/**
			 * The distance the container's been pulled from its starting point
			 * @property {Number}
			 */
			offset: {
				get: () => offset,
				set: to => {
					if((to = +to) !== offset){
						
						// Bail if we shouldn't swipe outside the content's boundaries
						if((!stretchBefore && to > 0 && active <= (clearBefore ? -1 : 0))
						|| (!stretchAfter  && to < 0 && active >= children.length - (clearAfter ? 0 : 1)))
							return;
						
						offset = to;
						el.style[cssTransform] = xformBefore + to + "px" + xformAfter;
					}
				}
			}
		});
		
		
		// Determine the initial slide index
		(() => {
			const {length} = children;
			for(let i = 0; i < length; ++i)
				if(children[i].classList.contains(activeClass))
					return this.active = i;
			this.active = clearBefore ? -1 : (clearAfter ? length : 0);
		})();
	}
}
