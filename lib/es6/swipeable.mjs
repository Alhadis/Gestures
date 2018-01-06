import Gesture from "./gesture.mjs";
import Support from "./support.mjs";

const {cssTransform, css3DSupported} = Support;


/**
 * Swipeable content.
 * @class
 */
export default class Swipeable {

	constructor(el, options = {}){
		const {children}  = el;
		let offset        = 0;
		let startPoint, startTime, active;

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
		} = options;

		scrollAngle = (+scrollAngle || 5) * 2;
		
		// Configure the container's "dragability"
		let gesture = new Gesture(swipeTarget, {

			onStart: (coords, event) => {
				startPoint = coords;
				startTime  = event.timeStamp;
				el.classList.add(draggingClass);
			},
			
			onMove: coords => {
				
				// If the swipe looks too vertical, the user's probably trying to scroll. Bail.
				if(Math.abs(Math.abs((Math.atan2(coords[1] - startPoint[1], startPoint[0] - coords[0])) * 180 / Math.PI) - 90) < scrollAngle){
					this.offset = 0;
					el.classList.remove(draggingClass);
					return false;
				}
				
				this.offset = coords[0] - startPoint[0];
			},
			
			onEnd: (coords, event) => {
				const distance = coords[0] - startPoint[0];
				this.offset    = 0;
				
				// Multiply effective distance if the swipe was really fast
				if(fastSwipe > 0 && event.timeStamp - startTime < fastSwipe)
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
					
					if((input = +input) < min) input = min;
					else if(input >= max)      input = max;
					
					// Make sure the value's different to our existing one
					if(input !== _active){
						for(let i = 0; i < length; ++i)
							children[i].classList[input === i ? "add" : "remove"](activeClass);
						onChange && onChange.call(null, input, _active, this);
						active = input;
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
						el.style[CSS_TRANSFORM] = xformBefore + to + "px" + xformAfter;
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
		
		
		// Property pieces used for assigning transform values
		const xformBefore = CSS_3D_SUPPORTED ? "translate3D(" : "translateX(";
		const xformAfter  = CSS_3D_SUPPORTED ? ",0,0)"        : ")";
		
		// Extract onChange callback, if supplied
		const onChange    = options.onChange;
	}
}
