autowhatch = 1; 

var _position = [0,0,0];
var _mass_hi = 1;
var _prev_position = [0,0,0];
var _rate_lo = 1000;
var _rate_hi = 1000;
var _rate_mem_lo = 1000;
var _rate_mem_hi = 1000;
var _speed_lo = 0.01;
var _speed_hi = 0.01;
var _type = 0;
var _mass_lo = 1;
var _enable = 1;
var _life_lo = 100;
var _life_hi = 100;
var _material = 0;
var _mode = 0;
var _initial_velocity = [0,0,0];

var matrix_emitter = new JitterMatrix(3, "float32", 1,1);

function jit_matrix(inname){

	var mIn = new JitterMatrix(inname);
	if(mIn.dim.length == null) { 
		post("monodimensional", "\n");
		matrix_emitter.dim = [mIn.dim, 1]; 
		for(var x = 0; x < mIn.dim; x++){
			matrix_emitter.setcell(x, 0, "val", mIn.getcell(x).slice(0, 3));
		}
	}
	else { 
		post("bidimensional", "\n");
		matrix_emitter.dim = [mIn.dim[0]*mIn.dim[1], 1]; 
		var count = 0;
		for(var x = 0; x < mIn.dim[0]; x++){
			for(var y = 0; y < mIn.dim[1]; y++){
				matrix_emitter.setcell(count++, 0, "val", mIn.getcell(x,y).slice(0, 3));
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
				_speed_lo, 
				_speed_hi,
				_mass_lo, 
				_mass_hi, 
				_prev_position, 
				matrix_emitter.name, 
				_enable,
				_life_lo,
				_life_hi,
				_material,
				_initial_velocity
				);
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

	if(arguments.length == 1){
		_speed_lo = arguments[0];
		_speed_hi = _speed_lo;
		return;
	}
	_speed_lo = arguments[0];
	_speed_hi = arguments[1];
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

function material(){

	if( (typeof arguments[0]) == "number"){
		_material = arguments[0];
		post(_material, "\n");
		return;
	} 
	else{
		var id = 0;
		for(var i = 0; i < arguments[0].length; i++){
			id += arguments[0][i].charCodeAt()*prime[i%prime.length];
		}
		_material = id;	
		post(_material, "\n");
		return;
	}
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

function initial_velocity(){
	_initial_velocity = [arguments[0], arguments[1], arguments[2]];
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

