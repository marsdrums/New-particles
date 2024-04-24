autowhatch = 1; inlets = 1; outlets = 1;

var mat = new JitterMatrix(2, "float32", 100, 100);
mat.exprfill(0, "norm[0]");
mat.exprfill(1, "norm[1]");
mat.op("+", 0, 1);
function bang(){

	outlet(0, "jit_matrix", mat.name);
}