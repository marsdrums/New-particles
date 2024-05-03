autowhatch = 1; 

var posMat = new JitterMatrix(3, "float32", 2, 2);
posMat.exprfill(0, "snorm[0]");
posMat.exprfill(1, "snorm[1]");

var shader = new JitterObject("jit.gl.shader");
shader.file = "texbuf.jxs";

var buf1 = new JitterObject("jit.gl.buffer.wrapper");
buf1.type = "vertex_attr0";
buf1.texbuf = 1;

var mesh = new JitterObject("jit.gl.mesh", "ctx");
mesh.shader = shader.name;
mesh.gl_color = [1,0,0,1];
mesh.position = [0,0,-3];
mesh.jit_matrix(posMat.name);
mesh.input_type = 7;
mesh.jit_gl_buffer(buf1.name);

function jit_matrix(inname){
	buf1.jit_matrix(inname);
}


