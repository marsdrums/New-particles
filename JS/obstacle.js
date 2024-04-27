autowhatch = 1; inlets = 1; outlets = 1;

var _shape = 0;
var _position = [0,0,0];
var _direction = [0,1,0];
var _scale = [1,1,1];
var _action = 0;
var _roughness = 0;
var _softness = 0;
var _enable = 1;
var _radius = 1;

function shape(){
	switch (arguments[0]) {
	  	case "plane":
	  	case 0:
	  		_shape = 0;
	    break;

	  	case "sphere":
	  	case 1:
	  		_shape = 1;
	    break;
	}
}
function position(){
	_position = [arguments[0], arguments[1], arguments[2]];
}
function direction(){
	_direction = [arguments[0], arguments[1], arguments[2]];
}
function scale(){
	_scale = [arguments[0], arguments[1], arguments[2]];
}
function action(){
	switch (arguments[0]) {
	  	case "kill":
	  	case 0:
	  		_action = 0;
	    break;

	  	case "stick":
	  	case 1:
	  		_action = 0.5;
	    break;

	  	case "bounce": 
	  	case 2:
	  		_action = 1;
	    break;
	}
}
function roughness(){
	_roughness = Math.max(0, Math.min(1, arguments[0]));
}
function softness(){
	_softness = Math.max(0, arguments[0]);
}
function enable(){
	_enable = arguments[0];
}
function radius(){
	_radius = arguments[0];
}
function bang(){
	outlet(0, "obstacle", _shape, _position, _direction, _scale, _action, _roughness, _softness, _enable, _radius);
}