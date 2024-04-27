autowhatch = 1; 

var _position = [0,0,0];
var _rate = 1000;
var _speed = 0.01;
var _type = 0;
var _mass_lo = 1;
var _mass_hi = 1;
var _prev_position = [0,0,0];
var _enable = 1;
var _life_lo = 100;
var _life_hi = 100;

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

function output_list(){

	outlet(0,	"emitter", 
				_type, 
				_rate, 
				_position, 
				_speed, 
				_mass_lo, 
				_mass_hi, 
				_prev_position, 
				matrix_emitter.name, 
				_enable,
				_life_lo,
				_life_hi);
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

function mass_lo(){
	_mass_lo = arguments[0];
}

function mass_hi(){
	_mass_hi = arguments[0];
}

function life_lo(){
	_life_lo = 1 / arguments[0];
}

function life_hi(){
	_life_hi = 1 / arguments[0];
}

function rate(){
	_rate = arguments[0];
}

function position(){
	_position = [arguments[0], arguments[1], arguments[2]];
}

function bang(){
	output_list();
	_prev_position = _position;
}

