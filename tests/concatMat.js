autowhatch = 1;

var temp = new JitterMatrix(3, "float32", 1,1);
temp.usedstdim = 1;
var input = new JitterMatrix(3, "float32", 1,1);
var toBuf = new JitterMatrix(3, "float32", 1,1);

var totalDim = 0;

function jit_matrix(inname)
{      

		input = new JitterMatrix(inname);
		post("input dim", input.dim, "\n");

		if(totalDim == 0){

			toBuf.dim = input.dim;
			toBuf.frommatrix(input.name);
			outlet(0, "jit_matrix", toBuf.name);
			totalDim += toBuf.dim[0];
			post(totalDim, "a", "\n");

		} else {

			temp.dim = [totalDim + input.dim[0], 1];
			post("total dim", totalDim, "\n");

			temp.dstdimstart = [0, 0];
			temp.dstdimend = [totalDim - 1, 0];
			temp.frommatrix(toBuf.name);

			temp.dstdimstart = [totalDim, 0];
			temp.dstdimend = [temp.dim[0] - 1, 0];
			temp.frommatrix(input.name);

			toBuf.dim = temp.dim;
			toBuf.frommatrix(temp.name);
			outlet(0, "jit_matrix", toBuf.name);

			totalDim = temp.dim[0];
		}

	outlet(0, "jit_matrix", toBuf.name);
}

function notifydeleted(){

	post("ciao");
}
