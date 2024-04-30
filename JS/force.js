autowhatch = 1; inlets = 1; outlets = 1;

var _position = [0,0,0];
var _direction = [0,-1,0];
var _amount = 0.;
var _radius = -1;
var _radius_softness = 0;
var _type = 0;
var _field_type = 0;
var _noise_function = 0;
var _field_octaves = 5;
var _field_offset = [0,0,0];
var _field_scale = [3,3,3];
var _enable = 1;
var _target_material_amt = -1;
var _target_material = [-1,-1,-1,-1,-1,-1];

function normalize(x){ 
	var len = Math.sqrt( x[0]*x[0] + x[1]*x[1] + x[2]*x[2] ); 
	return [x[0]/len, x[1]/len, x[2]/len];
}
function enable(){
	_enable = arguments[0];
}
function position(){
	_position = [arguments[0], arguments[1], arguments[2]];
}
function direction(){
	_direction = normalize([arguments[0], arguments[1], arguments[2]]);
}
function amount(){
	_amount = arguments[0];
}
function radius(){
	if(arguments[0] < 0 || arguments[0] == "inf"){
		_radius = -1;
		return;
	}
	_radius = arguments[0];
}
function radius_softness(){
	_radius_softness = Math.max(0, Math.min(1, arguments[0]));
}

function type(){

	switch (arguments[0]) {
	  	case "point_attractor":
	  	case 0:
	  		_type = 0;
	    break;

	  	case "directional":
	  	case 1:
	  		_type = 1;
	    break;

	  	case "drag": 
	  	case 2:
	  		_type = 2;
	    break;

	  	case "field": 
	  	case 3:
	  		_type = 3;
	    break;
	}
}

function field_type(){

	switch (arguments[0]) {
	  	case "forcefield":
	  	case 0:
	  		_field_type = 0;
	    break;

	  	case "rotational":
	  	case 1:
	  		_field_type = 1;
	    break;

	  	case "accelerative": 
	  	case 2:
	  		_field_type = 2;
	    break;

	  	case "dragging": 
	  	case 3:
	  		_field_type = 3;
	    break;
	}
}

function noise_function(){

	switch (arguments[0]) {
	  	case "simplex":
	  	case 0:
	  		_noise_function = 0;
	    break;

	  	case "perlin":
	  	case 1:
	  		_noise_function = 1;
	    break;

	  	case "ridget_multifractal": 
	  	case 2:
	  		_noise_function = 2;
	    break;

	  	case "hybrid_multifractal": 
	  	case 3:
	  		_noise_function = 3;
	    break;

	  	case "procedural_multifractal": 
	  	case 4:
	  		_noise_function = 4;
	    break;

	  	case "heterogeneous_procedural": 
	  	case 5:
	  		_noise_function = 5;
	    break;

	  	case "fractional_brownian_motion": 
	  	case 6:
	  		_noise_function = 6;
	    break;

	  	case "voronoi_crackle": 
	  	case 7:
	  		_noise_function = 7;
	    break;
	}
}

function field_octaves(){
	_field_octaves = Math.max(0, arguments[0]);
}
function field_offset(){
	_field_offset = [arguments[0], arguments[1], arguments[2]];
}
function field_scale(){
	_field_scale = [arguments[0], arguments[1], arguments[2]];
}

function target_material(){
	if(arguments[0] == -1){
		_target_material_amt = -1;
		return;
	}
	_target_material_amt = arguments.length;
	for(var i = 0; i < _target_material_amt; i++){
		_target_material[i] = arguments[i];
	}
}

function bang(){

	outlet(	0,	"force", 
				_type, 
				_amount, 
				_radius,
				_radius_softness,
				_position, 
				_direction,
				_field_type,
				_noise_function,
				_field_offset,
				_field_scale,
				_field_octaves,
				_enable,
				_target_material_amt,
				_target_material
			);
}
