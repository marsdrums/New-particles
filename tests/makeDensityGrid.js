autowhatch = 1; 

var node = new JitterObject("jit.gl.node");
node.drawto = "ctx";
node.adapt = 0;
node.capture = 1;
node.type = "float32";
node.dim = [2048, 2048];
node.erase_color = [0,0,0,0];

var shader = new JitterObject("jit.gl.shader");
shader.file = "fillGrid.jxs";
shader.drawto = node.name;

var mesh = new JitterObject("jit.gl.mesh");
mesh.drawto = node.name;
mesh.shader = shader.name;
mesh.draw_mode = "points";
mesh.blend_enable = 1;
mesh.depth_enable = 0;
mesh.blend = "add";

var matUV = new JitterMatrix(3, "float32", 2000, 2000);
matUV.exprfill(0, "cell[0]");
matUV.exprfill(1, "cell[1]");
matUV.op("+", 0.5, 0.5, 0.);
mesh.jit_matrix(matUV.name);

function jit_gl_texture(inname){

	mesh.texture = inname;
	outlet(0, "jit_gl_texture", node.out_name);
}

function notifydeleted(){
	node.freepeer();
	mesh.freepeer();
}