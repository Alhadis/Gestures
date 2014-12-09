function cssPrefix(n){
	var s	=	document.documentElement.style;
	if(n.toLowerCase() in s) return "";
	for(var p = "Webkit Moz Ms O Khtml", p = (p.toLowerCase() + p).split(" "), i = 0; i < 10; ++i)
		if(p[i]+n in s) return p[i];
	return false;
}


/** Infuses the HTMLElement interface with getter/setter properties for individually manipulating 3D transforms. */
var add3DProperties	=	function(o){

	/** Private variables */
	var	x		=	0,
		y		=	0,
		z		=	0,
		rotX	=	0,
		rotY	=	0,
		rotZ	=	0;
	
	var cssName	=	cssPrefix("Transform"),
		cssName	=	cssName !== "" ? cssName+"Transform" : "transform";


	o.redraw	=	function(){
		this.style[cssName]	=	"translateX("+x+"px) translateY("+y+"px) translateZ("+z+"px) rotateX("+rotX+"deg) rotateY("+rotY+"deg) rotateZ("+rotZ+"deg)";
	};



	/** Position properties */
	Object.defineProperty(o, "x", {
		get:	function(){ return x; },
		set:	function(input){
			if(input == x) return;
			x	=	input;
			this.redraw();
		}
	});


	Object.defineProperty(o, "y", {
		get:	function(){ return y; },
		set:	function(input){
			if(input == y) return;
			y	=	input;
			this.redraw();
		}
	});


	Object.defineProperty(o, "z", {
		get:	function(){ return z; },
		set:	function(input){
			if(input == z) return;
			z	=	input;
			this.redraw();
		}
	});



	/** Rotation properties */
	Object.defineProperty(o, "rotateX", {
		get:	function(){ return rotX; },
		set:	function(i){
			if(rotX === i) return;
			rotX	=	i;
			this.redraw();
		}
	});

	Object.defineProperty(o, "rotateY", {
		get:	function(){ return rotY; },
		set:	function(i){
			if(rotY === i) return;
			rotY	=	i;
			this.redraw();
		}
	});

	Object.defineProperty(o, "rotateZ", {
		get:	function(){ return rotZ; },
		set:	function(i){
			if(rotZ === i) return;
			rotZ	=	i;
			this.redraw();
		}
	});
};


for(var l = document.all.length, i = 0; i < l; ++i){
	add3DProperties(document.all[i]);
}

var mutant	=	new MutationObserver(function(records){
	for(var l = records.length, i = 0; i < l; ++i){
		for(var n in records[i].addedNodes){
			var node	=	records[i].addedNodes[n];
			if(Node.ELEMENT_NODE === node.nodeType && !node.hasOwnProperty("rotateZ"))
				add3DProperties(node);
		}
	}
});
mutant.observe(document.documentElement, {
	childList:	true,
	subtree:	true
});