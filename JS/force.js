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
var _materials_amt = -1;
var _materials = [-1,-1,-1,-1,-1,-1];

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


var prime = [	1523,1531,1543,1549,1553,1559,1567,1571,1579,1583,1597,1601,1607,1609,1613,1619,1621,1627,1637,1657,
				1663,1667,1669,1693,1697,1699,1709,1721,1723,1733,1741,1747,1753,1759,1777,1783,1787,1789,1801,1811,
				1823,1831,1847,1861,1867,1871,1873,1877,1879,1889,1901,1907,1913,1931,1933,1949,1951,1973,1979,1987,
				1993,1997,1999,2003,2011,2017,2027,2029,2039,2053,2063,2069,2081,2083,2087,2089,2099,2111,2113,2129,
				2131,2137,2141,2143,2153,2161,2179,2203,2207,2213,2221,2237,2239,2243,2251,2267,2269,2273,2281,2287,
				2293,2297,2309,2311,2333,2339,2341,2347,2351,2357,2371,2377,2381,2383,2389,2393,2399,2411,2417,2423,
				2437,2441,2447,2459,2467,2473,2477,2503,2521,2531,2539,2543,2549,2551,2557,2579,2591,2593,2609,2617,
				2621,2633,2647,2657,2659,2663,2671,2677,2683,2687,2689,2693,2699,2707,2711,2713,2719,2729,2731,2741,
				2749,2753,2767,2777,2789,2791,2797,2801,2803,2819,2833,2837,2843,2851,2857,2861,2879,2887,2897,2903,
				2909,2917,2927,2939,2953,2957,2963,2969,2971,2999,3001,3011,3019,3023,3037,3041,3049,3061,3067,3079	];

function materials(){

	if(arguments[0] == -1 || arguments.length < 1 || arguments[0] == "all"){
		_materials_amt = -1;
		return;
	}

	_materials_amt = arguments.length;

	if(_materials_amt > 6){
		_materials_amt = 6;
		post("too many materials, the maximum is 6", "\n");
	}

	for(var i = 0; i < _materials_amt; i++){
		if( (typeof arguments[i]) == "number") _materials[i] = arguments[i];
		else{
			var id = 0;
			for(var k = 0; k < arguments[i].length; k++){
				id += arguments[i][k].charCodeAt()*prime[k%prime.length];
			}
			_materials[i] = id;	
		}
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
				_materials_amt,
				_materials
			);
}
