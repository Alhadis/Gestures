var each	=	Array.prototype.forEach;

var html	=	document.documentElement;
var slides	=	document.querySelectorAll("#container > div");


var _slide	=	0;
Object.defineProperty(window, "slide", {
	get:	function(){ return _slide; },
	set:	function(input){
		if(input > slides.length-1) input = 0;
		else if(input < 0)			input = slides.length - 1;
		each.call(slides, function(o){ o.classList.remove("active"); });
		slides[input].classList.add("active");
		_slide	=	input;
	}
});
/** Okay, this is just getting ridiculous now, John... */
var Smudge	=	function(x, y){
	var node	=	document.createElement("div");
	node.className	=	"smudge";
	node.style.left	=	x+"px";
	node.style.top	=	y+"px";

	var fadedOut	=	function(e){
		node.removeEventListener("transitionend", fadedOut);
		node.parentNode.removeChild(node);
	};

	node.addEventListener("transitionend", fadedOut);
	document.body.appendChild(node);
	setTimeout(function(){ node.classList.add("dissolving"); }, 1);
};




var Drag	=	function(args){
	var event	=	args.event || {};
	var move	=	args.move	?	args.move.bind(this)	: null;
	var up		=	args.up		?	args.up.bind(this)		: null;
	var points	=	[];


	var coords;
	this.x		=	args.x || (coords ? coords : (coords = this.coords(event)))[0];
	this.y		=	args.y || (coords ? coords : (coords = this.coords(event)))[1];


	if(move)	window.addEventListener(Drag.MOVE_EVENT, move);

	/** Private mouseUp handler called to remove the mouseMove listener (and trigger any optional onMouseUp handler passed to our arguments) */
	var _release	=	function(e){
		window.removeEventListener(Drag.UP_EVENT, _release);

		if(move)	window.removeEventListener(Drag.MOVE_EVENT, move);
		if(up) 		up.call(this, e);
	};
	window.addEventListener(Drag.UP_EVENT, _release);

	/** Run the "down" callback if one was specified (ultimately the same as an initialiser callback). */
	if(args.down)
		args.down.call(this, event);
}

/** Helper function for pulling the X/Y coordinates from a mouse or touch event. */
Drag.coords = Drag.prototype.coords =	function(event){
	
	/** Not passed a valid argument? Bail. */
	if(!event)
		return [window.innerWidth / 2, window.innerHeight / 2];

	/** Check for a TouchList in this event object. */
	if(event.touches && event.touches[0])
		return [event.touches[0].pageX, event.touches[0].pageY];
	
	/** Otherwise, must just be a regular ol' mouse event? */
	else return [event.pageX, event.pageY];
};
Drag.DOWN_EVENT		=	"ontouchstart"	in window 	?	"touchstart"	: "mousedown";
Drag.MOVE_EVENT		=	"ontouchmove"	in window	?	"touchmove"		: "mousemove";
Drag.UP_EVENT		=	"ontouchend"	in window	?	"touchend"		: "mouseup";
Drag.CANCEL_EVENT	=	"ontouchcancel"	in window	?	"touchcancel"	: null;







html.addEventListener(Drag.DOWN_EVENT, function(e){
	var	currentSlide	=	slides[_slide],
		prevSlide		=	slides[_slide - 1],
		nextSlide		=	slides[_slide + 1];


	new Drag({
		event:	e,

		down:	function(e){
			var pos	=	this.coords(e);
			new Smudge(pos[0], pos[1]);

			currentSlide.classList.add("dragging");
			if(prevSlide)	prevSlide.classList.add("dragging");
			if(nextSlide)	nextSlide.classList.add("dragging");
		},


		move:	function(e){
			var pos	=	this.coords(e),
				x	=	pos[0],
				y	=	pos[1];

			new Smudge(x, y);
			var delta	=	x - this.x;

			currentSlide.style.transform	=	"translateX("+delta+"px)";
			currentSlide.x					=	delta;
			if(prevSlide)	prevSlide.style.transform	=	"translateX(calc(-100% + "+(delta)+"px))";
			if(nextSlide)	nextSlide.style.transform	=	"translateX(calc(100% + "+(delta)+"px))";
			e.preventDefault();
			return false;
		},


		up:	function(e){

		},
	});
});