autowhatch = 1; inlets = 1; outlets = 1;

var shader = new JitterObject("jit.gl.shader");
shader.name = "testShader";
shader.file = "testShader.jxs";

var mesh = new JitterObject("jit.gl.mesh", "ctx");
mesh.draw_mode = "points";
mesh.point_mode = "circle_depth";
mesh.point_size = 10.;
mesh.shader = "testShader";

function bang(){

	var noise = new JitterMatrix(3, "float32", 10000);
	for(var i = 0; i < noise.dim; i++){
		noise.setcell(i, "val", Math.random(), Math.random(), Math.random() );
	}

	mesh.jit_matrix(noise.name);
	mesh.draw();
	outlet(0, "jit_matrix", noise.name);
}