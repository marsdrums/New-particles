autowhatch = 1; 

var _position = [0,0,0];
var _rate = 1000;
var _speed = 0.01;
var _type = 0;
var _mass = 1;

function output_list(){

	outlet(0, "emitter", _type, _rate, _position, _speed, _mass);
}

function type(){

	switch (arguments[0]) {
	  	case "point":
	  		_type = 0;
	    break;

	  	case "matrix":
	  		_type = 1;
	    break;

	  	case "geometry": 
	  		_type = 2;
	    break;
	}
	output_list();
}

function speed(){
	_speed = arguments[0];
	output_list();
}

function mass(){
	_mass = arguments[0];
	output_list();
}

function rate(){
	_rate = arguments[0];
	output_list();
}

function position(){
	_position = [arguments[0], arguments[1], arguments[2]];
	output_list();
}

