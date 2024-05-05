autowhatch = 1;

var a = new JitterMatrix(1, "float32", 1);
var b = new JitterMatrix(1, "float32", 1);

function jit_matrix(inname){

	a = new JitterMatrix(inname);
	b.dim = a.dim;
	b.frommatrix(a.name);
	outlet(0, "jit_matrix", b.name);
}