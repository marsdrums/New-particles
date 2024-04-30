autowhatch = 1; 

var _position = [0,0,0];
var _mass_hi = 1;
var _prev_position = [0,0,0];
var _rate_lo = 1000;
var _rate_hi = 1000;
var _rate_mem_lo = 1000;
var _rate_mem_hi = 1000;
var _speed = 0.01;
var _type = 0;
var _mass_lo = 1;
var _enable = 1;
var _life_lo = 100;
var _life_hi = 100;
var _material = 0;
var _mode = 0;

var matrix_emitter = new JitterMatrix(3, "float32", 1,1);

function jit_matrix(inname){

	var mIn = new JitterMatrix(inname);
	if(mIn.dim.length == 1) { 
		matrix_emitter.dim = mIn.dim; 
		for(var x = mIn.dim-1; x >= 0; x--){
			matrix_emitter.setcell(x, "val", mIn.getcell(x).slice(0, 3));
		}
	}
	else { 
		matrix_emitter.dim = mIn.dim[0]*mIn.dim[1]; 
		var count = 0;
		for(var x = 0; x < mIn.dim[0]; x++){
			for(var y = 0; y < mIn.dim[1]; y++){
				matrix_emitter.setcell(count++, "val", mIn.getcell(x,y).slice(0, 3));
			}
		}
	}

}

function randintmix(a, b){ 
	var rand = Math.random();
	return Math.floor(a*(1-rand) + b*rand);
}

function output_list(){

	outlet(0,	"emitter", 
				_type, 
				randintmix(_rate_lo, _rate_hi), 
				_position, 
				_speed, 
				_mass_lo, 
				_mass_hi, 
				_prev_position, 
				matrix_emitter.name, 
				_enable,
				_life_lo,
				_life_hi,
				_material);
}

function enable(){
	_enable = arguments[0];
}

function type(){

	switch (arguments[0]) {
	  	case "point":
	  	case 0:
	  		_type = 0;
	    break;

	  	case "matrix":
	  	case 1:
	  		_type = 1;
	    break;

	  	case "geometry": 
	  	case 2:
	  		_type = 2;
	    break;
	}
}

function speed(){
	_speed = arguments[0];
}

function mass(){
	if(arguments.length == 1){
		_mass_lo = Math.max(0.000001, arguments[0]);
		_mass_hi = _mass_lo;
		return;
	}
	_mass_lo = Math.max(0.000001, arguments[0]);
	_mass_hi = Math.max(0.000001, arguments[1]);
}

function life(){
	if(arguments.length == 1){
		_life_lo = 1 / Math.max(0, arguments[0]);
		_life_hi = _life_lo;
		return;
	}
	_life_lo = 1 / Math.max(0, arguments[0]);
	_life_hi = 1 / Math.max(0, arguments[1]);
}

function material(){
	_material = arguments[0];
}

function rate(){

	if(arguments.length == 1){
		_rate_lo = arguments[0];
		_rate_hi = _rate_lo;
		_rate_mem_lo = _rate_lo;
		_rate_mem_hi = _rate_hi;
		return;
	}

	_rate_lo = arguments[0];
	_rate_hi = arguments[1];
	_rate_mem_lo = _rate_lo;
	_rate_mem_hi = _rate_hi;
	return;
}

function position(){
	_position = [arguments[0], arguments[1], arguments[2]];
}

function mode(){

	switch (arguments[0]) {
	  	case "constant":
	  	case 0:
	  		_mode = 0;
	  		_rate_lo = _rate_mem_lo;
	  		_rate_hi = _rate_mem_hi;
	    break;

	  	case "trigger":
	  	case 1:
	  		_mode = 1;
	  		_rate_hi = 0;
	  		_rate_lo = 0;
	    break;
	}	
}

function compute(){
	output_list();
	_prev_position = _position;
	if(_mode == 1){
		_rate_lo = 0;
		_rate_hi = 0;
	}
}

function bang(){
	if(_mode == 0) return;
	_rate_lo = _rate_mem_lo;
	_rate_hi = _rate_mem_hi;
}

