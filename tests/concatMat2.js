autowhatch = 1;

function jit_matrix(inname){

	var concat = new JitterObject("jit.concat");
	var outMat = new JitterMatrix;
	concat([inname, outMat.name], outMat.name);
	outlet(0, "jit_matrix", outMat.name);
	concat.freepeer();
}
