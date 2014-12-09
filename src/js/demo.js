function cssPrefix(n){
	var s	=	document.documentElement.style;
	if(n.toLowerCase() in s) return "";
	for(var p = "Webkit Moz Ms O Khtml", p = (p.toLowerCase() + p).split(" "), i = 0; i < 10; ++i)
		if(p[i]+n in s) return p[i];
	return false;
}



/** Mediate those wretched vendor prefixes. */
(function(o){
	if(o.END) return;

	var names	=	"transitionend webkitTransitionEnd oTransitionEnd otransitionend".split(" ");
	for(var i = 0; i < 4; ++i)
		if("on"+names[i].toLowerCase() in window)
			return (o.END = names[i]);
	return (o.END = names[0]);
}(TransitionEvent || {}));



/** Okay, this is just getting ridiculous now, John... */
var Smudge	=	function(x, y){

	var node			=	document.createElement("div");
	node.className		=	"smudge";
	node.style.left		=	x+"px";
	node.style.top		=	y+"px";

	var fadedOut	=	function(e){
		node.removeEventListener(TransitionEvent.END, fadedOut);
		node.parentNode.removeChild(node);
		clearTimeout(timeout);
	},

	timeout	=	setTimeout(fadedOut, 3000);


	node.addEventListener(TransitionEvent.END, fadedOut);
	document.body.appendChild(node);

	setTimeout(function(){
		node.classList.add("dissolving");
	}, 30);
};





/** Shortcuts */
var each		=	Array.prototype.forEach;


var container	=	document.getElementById("container");


/** Define some getter/setter properties on our slides container. */
(function(elem){

	var	activeClass		=	"active",
		transform		=	cssPrefix("Transform") || "transform",

		/** DOM references */
		slideList		=	elem.firstElementChild,
		slides			=	slideList.children,
		currentSlide	=	null,

		/** Private variables */
		pull			=	0,
		slide			=	null,
		dragging		=	false;


	/** Set the initial slide index based on the position of first child node with a class of "active". */
	for(var c, l = slides.length, i = 0; i < l; ++i)
		if((c = slides[i]).classList.contains(activeClass)){
			slide			=	i;
			currentSlide	=	c;
			break;
		}


	/** Couldn't find an initial slide to set as active, so we'll just pick the first. */
	if(slide === null)
		currentSlide	=	slides[0],
		slide			=	0;


	/** Get/set the index of the currently active slide. */
	Object.defineProperty(elem, "slide", {
		get:	function(){ return slide; },
		set:	function(i){
			var numSlides	=	slides.length - 1;

			/** Sanitise our input: make sure it falls between 0 and slides.length */
			if(i > numSlides) 	i = dragging ?	numSlides : 0;
			else if(i < 0)		i = dragging ?	0 : numSlides;

			pull	=	0;
			slideList.style.transform	=	null;
			each.call(slides, function(o){ o.classList.remove(activeClass); });

			slide			=	i;
			currentSlide	=	slides[i];
			currentSlide.classList.add(activeClass);
		}
	});



	/** Get/set the offset being applied to the position of the currently-selected slide. */
	Object.defineProperty(elem, "pull", {
		get: function(){ return pull; },
		set: function(i){
			pull	=	i;
			slideList.style[transform] = "translateX("+i+"px)";
		}
	});


	/** Basic helper property for toggling the container node's dragClass */
	Object.defineProperty(elem, "dragging", {
		get:	function(){ 	return dragging; },
		set:	function(i){	dragging = container.classList.toggle("dragging", !!i); }
	});
}(container));


(container || document.documentElement).addEventListener(Gesture.START, function(event){
	var startX, startY, x, y, pull,

		thresh		=	125;


	new Drag(event, {
		start:	function(event, position){
			x		=	startX	=	position[0],
			y		=	startY	=	position[1],
			pull	=	container.pull;
			container.dragging	=	true;
		},


		move:	function(event, position){
			x	=	position[0],
			y	=	position[1];
			container.pull	=	pull+(x - startX);
		},


		end:	function(event, position){
			if(position)
				x	=	position[0],
				y	=	position[1];

			setTimeout(function(){
				var delta	=	startX - x;
				if(delta < -thresh){
					console.log("Previous slide.");
					--container.slide;
				}
				
				else if(delta > thresh){
					console.log("Next slide.");
					++container.slide;
				}

				else
					container.slide = container.slide;
				container.dragging	=	false;
			}, 40);
		}
	});
});