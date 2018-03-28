let cssTransform   = null;
let css3DSupported = null;

const supportFlags = {

	/**
	 * Name of the CSSOM property used by this browser for CSS transforms.
	 * For instance, this will be "msTransform" in IE9, and "transform" in
	 * modern browsers.
	 *
	 * @type {String}
	 */
	get cssTransform(){
		if(null !== cssTransform)
			return cssTransform;
		
		const {style} = document.documentElement;
		if("transform" in style)
			return cssTransform = "transform";

		let prefixes = "Webkit Moz Ms O Khtml";
		prefixes = prefixes.toLowerCase() + prefixes;
		
		for(const prefix of prefixes.split(" ")){
			const propertyName = prefix + "Transform";
			if(propertyName in style){
				cssTransform = propertyName;
				return propertyName;
			}
		}
		return cssTransform = "";
	},


	/**
	 * Whether 3D transforms are supported by this browser.
	 *
	 * @type {Boolean}
	 */
	get css3DSupported(){
		if(null !== css3DSupported)
			return css3DSupported;

		const el = document.createElement("div");
		const fn = [
			["translateY(", ")"],
			["translate3d(0,", ",0)"]
		];
		const propName = supportFlags.cssTransform;
		const {style} = el;
		try{
			style[propName] = fn[1].join("1px");
		} catch(e){}
		css3DSupported = fn[+!!style[propName]] === fn[1];
		return css3DSupported;
	},
};

export default supportFlags;
