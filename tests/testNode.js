autowhatch = 1; inlets = 1; outlets = 4;

var shader = new JitterObject("jit.gl.shader", "ctx");
shader.file = "testNode.jxs";

//var buffer = new JitterObject("jit.gl.buffer", "ctx");
//buffer.type = "vertex_attr0";
//buffer.texbuf = 1;

var node = new JitterObject("jit.gl.node", "ctx");
node.capture = 2;
node.adapt = 0;
node.dim = [2000,2000];
node.type = "float32";

var node2 = new JitterObject("jit.gl.node", "ctx");
node2.capture = 2;
node2.adapt = 0;
node2.dim = [2000,2000];
node2.type = "float32";

var mesh = new JitterObject("jit.gl.mesh", node.name);
mesh.draw_mode = "triangle_strip";
mesh.shader = shader.name;

var uv = new JitterMatrix(4, "float32", 2, 2);
uv.setcell(0, 0, "val", 0.5, 		0.5, 		-1, -1);
uv.setcell(1, 0, "val", 1999.5, 	0.5, 		+1, -1);
uv.setcell(0, 1, "val", 0.5, 		1999.5, 	-1, +1);
uv.setcell(1, 1, "val", 1999.5, 	1999.5, 	+1, +1);

mesh.jit_matrix(uv.name);

var noise = new JitterMatrix(4, "float32", 2000);
for(var i = 1999; i >= 0; i--) noise.setcell(i, "val", Math.random());

//buffer.jit_matrix(noise.name);

function bang(){

	mesh.draw();
	node.draw();
	outlet(1, "jit_gl_texture", node.out_names[1]);
	outlet(0, "jit_gl_texture", node.out_names[0]);	

	mesh.draw_to = node2.name;
	//mesh.draw();
	node.draw();
	outlet(3, "jit_gl_texture", node.out_names[1]);
	outlet(2, "jit_gl_texture", node.out_names[0]);	
}