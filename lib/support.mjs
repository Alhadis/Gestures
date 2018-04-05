/**
 * Name of the CSSOM property used by this browser for CSS transforms.
 * For instance, this will be "msTransform" in IE9, and "transform" in
 * modern browsers.
 *
 * @type {String}
 */
export const transformProperty = (() => {
	const {style} = document.documentElement;
	if("transform" in style)
		return "transform";

	let prefixes = "Webkit Moz Ms O Khtml";
	prefixes = prefixes.toLowerCase() + " " + prefixes;

	for(const prefix of prefixes.split(" ")){
		const propertyName = prefix + "Transform";
		if(propertyName in style)
			return propertyName;
	}
	return "";
})();


/**
 * Whether 3D transforms are supported by this browser.
 * @type {Boolean}
 */
export const supports3DTransforms = ((x, y) => {
	const {style} = document.createElement("div");
	const fn = [["translateY(", ")"], ["translate3d(0,", ",0)"]];
	try{
		style[transformProperty] = fn[1].join("1px");
	} catch(e){}
	return fn[+!!style[transformProperty]] === fn[1];
})();


/**
 * Utility function for setting an element's transform property.
 * 
 * @param {HTMLElement} el
 * @param {Number|String} [x=0]
 * @param {Number|String} [y=0]
 */
export function translate({style}, x = 0, y = 0){
	if(x && "number" === typeof x) x = x + "px";
	if(y && "number" === typeof y) y = y + "px";
	style[transformProperty] = supports3DTransforms
		? `translate3D(${x}, ${y}, 0)`
		: `translate(${x}, ${y})`;
}
