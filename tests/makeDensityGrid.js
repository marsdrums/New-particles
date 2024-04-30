autowhatch = 1; inlets = 1; outlets = 2;

var texture = new JitterObject("jit.gl.texture");
texture.rectangle = 1;
texture.adapt = 0;
texture.dim = [2000, 2000];
texture.type = "float32";
texture.filter = "nearest";

var node = new JitterObject("jit.gl.node", "ctx");
node.adapt = 0;
node.name = "myNode";
node.capture = 1;
node.type = "float32";
node.dim = [2048, 2048];
node.erase_color = [0,0,0,0];
//node.automatic = 0;

var mesh = new JitterObject("jit.gl.mesh", node.name);
var shader = new JitterObject("jit.gl.shader");
shader.file = "fillGrid.jxs";
mesh.shader = shader.name;
mesh.draw_mode = "points";
mesh.blend_enable = 1;
mesh.depth_enable = 0;
mesh.blend = "add";
mesh.texture = "texture";

var matUV = new JitterMatrix(3, "float32", 2000, 2000);
matUV.exprfill(0, "cell[0]");
matUV.exprfill(1, "cell[1]");
matUV.op("+", 0.5, 0.5, 0.);
mesh.jit_matrix(matUV.name);

function jit_gl_texture(inname){

	texture.jit_gl_texture(inname);
	mesh.draw();
	node.draw();
	outlet(1, "jit_gl_texture", node.out_name);
	outlet(0, "jit_gl_texture", texture.name);

}