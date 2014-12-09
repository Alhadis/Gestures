var Gesture		=	function(){

	/** Open up a fresh list of point arrays. */
	this.pointLists		=	[[]];

	/** Provide an easy pointer to the Gesture's first point list (the one most frequently used). */
	this.points			=	this.pointLists[0];
};


/** Determine if we're even running on a touch-enabled device. */
var touch				=	"ontouchstart" in document.documentElement;
Gesture.TOUCH_ENABLED	=	touch;

/** Resolve what event handlers we're gonna need. */
Gesture.START			=	touch ? "touchstart"	: "mousedown";
Gesture.MOVE			=	touch ? "touchmove"		: "mousemove";
Gesture.END				=	touch ? "touchend"		: "mouseup";
Gesture.CANCEL			=	touch ? "touchcancel"	: null;

/** Not sure about these two: are they even standards-compliant/needed? */
Gesture.ENTER			=	touch ? "touchenter"	: "mouseover";
Gesture.LEAVE			=	touch ? "touchleave"	: "mouseout";


/** Push an event's Cartesian coordinates onto the instance's points array. */
Gesture.prototype.push	=	function(event){

	/**
	 * Check for a touch list. We won't rely on the TOUCH_ENABLED constant,
	 * since this method might be called using a simulated TouchEvent.
	 */
	if(event.touches){
		var pos, lists =	this.pointLists;
		for(var l = event.touches.length, i = 0; i < l; ++i){
			var touch	=	event.touches[i];

			/** Store the first touch in the TouchEvent. */
			if(!pos) pos =	[touch.pageX, touch.pageY];

			if(!lists[i])	lists[i] = [[touch.pageX, touch.pageY]];
			else			lists[i].push([touch.pageX, touch.pageY]);
		}
	}

	/** Just an old-school MouseEvent. */
	else this.points.push(pos = [event.pageX, event.pageY]);

	return pos;
};


/**
 * Helper method for registering event callbacks.
 *
 * The method accepts an optional third argument that allows a user to specify an individual target for each event name.
 * If an array index is left empty, will default to document.documentElement for that particular listener.
 *
 * @param {String|Array} events - An event name (or list of) to register an event listener for.
 * @param {Function} func - The callback to attach.
 * @param {Array} targets - An optional list of DOM elements to add an event listener to. Defaults to document.documentElement
 */
Gesture.prototype.on	=	function(events, func, targets){
	var	events	=	Array.isArray(events) ? events : [events],
		targets	=	targets || [],

		l		=	events.length,
		i		=	0, target;

	for(; i < l; ++i){
		target	=	targets[i] || document.documentElement;
		if(target.attachEvent)	target.attachEvent("on"+events[i], func);	/* <= IE8 */
		else					target.addEventListener(events[i], func);	/* W3 */
	}

	return func;
};

/** Helper method for removing one or more event callbacks. Takes the same arguments as the "on" method. */
Gesture.prototype.off	=	function(events, func, targets){
	var	events	=	Array.isArray ? events : [events],
		targets	=	targets || [],
		
		l	=	events.length,
		i	=	0, target;

	for(; i < l; ++i){
		target	=	targets[i] || document.documentElement;
		if(target.detachEvent)	target.detachEvent("on"+events[i], func);		/* <= IE8 */
		else					target.removeEventListener(events[i], func);	/* W3 */
	}

	return func;
};




var Drag	=	function(ev, args){
	if(!ev) throw new ArgumentError("Cannot instantiate a Drag gesture without an event object.");


	var	start	=	args.start,
		move	=	args.move,
		end		=	args.end,
		cancel	=	args.cancel,


	doc		=	document.documentElement,
	$this	=	this,


	onMove	=	this.on(Gesture.MOVE, function(ev){
		var pos	=	$this.push(ev);
		if(move) move.call($this, ev, pos);
	}),


	onEnd	=	this.on([Gesture.END, Gesture.CANCEL, "blur"], function(ev){
		var pos	=	$this.push(ev);

		doc.removeEventListener(Gesture.MOVE,	onMove);
		$this.off([Gesture.END, Gesture.CANCEL, "blur"], onEnd, [,,window])

		if(end) end.call(this, ev, pos);
	}, [,,window]);


	var pos	=	this.push(ev);

	/** If given a start handler, trigger it now. */
	if(start)	start.call(this, ev, pos);
};


Drag.prototype				=	new Gesture();
Drag.prototype.constructor	=	Drag;