autowhatch = 1; inlets = 1; outlets = 1;

var node = new JitterObject("jit.gl.node");
node.drawto = "ctx";
node.capture = 1;
node.dim = [1920, 1080];
node.adapt = 0;
node.type = "float32";

var mesh = new JitterObject("jit.gl.gridshape");
mesh.drawto = node.name;
mesh.shape = "sphere";
mesh.scale = [0.3, 0.3, 0.3];
mesh.gl_color = [1,0,0,1];

function bang(){

	//mesh.draw();
	//node.draw();

	outlet(0, "jit_gl_texture", node.out_name);
}

function notifydeleted(){
	mesh.freepeer();
	node.freepeer();
	post("ciao");
}