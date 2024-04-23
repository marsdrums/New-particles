autowhatch = 1; inlets = 1; outlets = 0;

//Arrays________________________________________________________________________________________________
var emitters = [];
var forces = [];
var obstacles = [];

//Textures and particle shader__________________________________________________________________________
var emiMat = new JitterMatrix(4, "float32", 1,1);
var forMat = new JitterMatrix(4, "float32", 1,1);
var obsMat = new JitterMatrix(4, "float32", 1,1);

var emiTex = new JitterObject("jit.gl.texture", "part-ctx");
var forTex = new JitterObject("jit.gl.texture", "part-ctx");
var obsTex = new JitterObject("jit.gl.texture", "part-ctx");

emiTex.adapt = 0;	emiTex.type = "float32";	emiTex.rectangle = 1;	emiTex.filter = "nearest";
forTex.adapt = 0;	forTex.type = "float32";	forTex.rectangle = 1;	forTex.filter = "nearest";
obsTex.adapt = 0;	obsTex.type = "float32";	obsTex.rectangle = 1;	obsTex.filter = "nearest";

var partShader = new JitterObject("jit.gl.slab", "part-ctx");
partShader.inputs = 6;
partShader.outputs = 3;
partShader.file = "particle.system.jxs";
partShader.adapt = 0;
partShader.type = "float32";
partShader.dim = [2000, 2000];

var inPosAgeTex = new JitterObject("jit.gl.texture", "part-ctx");
inPosAgeTex.adapt = 0;
inPosAgeTex.type = "float32";
inPosAgeTex.dim = [2000, 2000];
inPosAgeTex.rectangle = 1;
inPosAgeTex.defaultimage = "black";
inPosAgeTex.filter = "nearest";

var inVelMassTex = new JitterObject("jit.gl.texture", "part-ctx");
inVelMassTex.adapt = 0;
inVelMassTex.type = "float32";
inVelMassTex.dim = [2000, 2000];
inVelMassTex.rectangle = 1;
inVelMassTex.defaultimage = "black";
inVelMassTex.filter = "nearest";

var inAliveMatTex = new JitterObject("jit.gl.texture", "part-ctx");
inAliveMatTex.adapt = 0;
inAliveMatTex.type = "float32";
inAliveMatTex.dim = [2000, 2000];
inAliveMatTex.rectangle = 1;
inAliveMatTex.defaultimage = "black";
inAliveMatTex.filter = "nearest";

partShader.activeinput = 5;	partShader.jit_gl_texture(obsTex.name);
partShader.activeinput = 4;	partShader.jit_gl_texture(forTex.name);
partShader.activeinput = 3;	partShader.jit_gl_texture(emiTex.name);
partShader.activeinput = 2;	partShader.jit_gl_texture(inAliveMatTex.name);
partShader.activeinput = 1;	partShader.jit_gl_texture(inVelMassTex.name);
partShader.activeinput = 0;	partShader.jit_gl_texture(inPosAgeTex.name);

//Counter__________________________________________________________________________________________
var counter = 0;

//utilities_______________________________________________________________________________________
var defaultPosAgeTex = new JitterMatrix(4, "float32", 1,1);
	defaultPosAgeTex.setall(0);
var defaultVelMassTex = new JitterMatrix(4, "float32", 1,1);
	defaultVelMassTex.setall(1,0,0,0);
var defaultAliveMatTex = new JitterMatrix(4, "float32", 1,1);
	defaultAliveMatTex.setall(0);

//rendering tools___________________________________________________________________________________
var particle_rendering = new JitterObject("jit.gl.shader", "part-ctx");
particle_rendering.name = "particle.rendering";
particle_rendering.file = "particle.rendering.jxs";

var mesh = new JitterObject("jit.gl.mesh", "part-ctx");
mesh.draw_mode = "points";
mesh.shader = "particle.rendering";
mesh.texture = ["inPosAgeTex", "inVelMassTex", "inAliveMatTex"];

var uvMat = new JitterMatrix(3, "float32", 2000, 2000);
for(var x = 0; x < 2000; x++){
	for(var y = 0; y < 2000; y++){
		uvMat.setcell(x, y, "val", x, y, 0);
	}
}

mesh.jit_matrix(uvMat.name);

//Functions________________________________________________________________________________________
function reset(){

	inPosAgeTex.jit_matrix(defaultPosAgeTex.name);
	inVelMassTex.jit_matrix(defaultVelMassTex.name);
	inAliveMatTex.jit_matrix(defaultAliveMatTex.name);
}

function findoutlet(patcher){

	var inlets = new Array();
	var obj = patcher.firstobject;
	
	while (obj) {
		if (obj.maxclass == "outlet") {
			return obj;
		}
		obj = obj.nextobject;
	}
}

function read_and_parse(){

	emitters = [];
	forces = [];
	obstacles = [];

	//start from the js object
	var input = this.box.patchcords.inputs;

	//check all the patchcords connected to the js inlet
	for(var i = 0; i < input.length; i++){

		//if the connected object is an [inlet]
		if(input[i].srcobject.maxclass != "inlet") continue;

		//list the objects connected to that [inlet] in the mother patch
		var objs = input[i].srcobject.patcher.box.patchcords.inputs;

		//for each connected abstraction
		for(var k = 0; k < objs.length; k++){

			if(objs[k].srcobject.maxclass != "patcher") continue;

			var thisSubpatcher = objs[k].srcobject.subpatcher();

			//get the value of the object connected to the outlet
			var thisOutlet = findoutlet(thisSubpatcher);
			var agent = thisOutlet.patchcords.inputs[0].srcobject.getattr('boxatoms');
			agent.shift();

			switch (agent[0]) {
			  case "force":
			    forces.push({	type: agent[1], 
			    				position: [agent[2], agent[3], agent[4]], 
			    				amount: agent[5]
			    			});
			    break;

			  case "obstacle":
			    obstacles.push({	type: agent[1], 
			    					position: [agent[2], agent[3], agent[4]], 
			    					amount: agent[5]
			    				});
			    break;

			  case "emitter": 
			    emitters.push({	type: agent[1], 
			    				rate: agent[2],
			    				position: [agent[3], agent[4], agent[5]], 
			    				speed: agent[6],
			    				mass: agent[7]
			    			});
			    break;
			}
		}
	}
}


function transfer_data_to_texture(){

	if(emitters.length > 0){
		emiMat.dim = [emitters.length, 2];
		emiTex.dim = emiMat.dim;
		var emit_from, emit_to;
		for(var i = 0; i < emitters.length; i++){
			emit_from = counter;
			emit_to = (counter + emitters[i].rate) % 4000000;;
			emiMat.setcell(i, 0, "val", emitters[i].mass, emitters[i].position);
			emiMat.setcell(i, 1, "val", emit_to, emitters[i].type, emitters[i].speed, emit_from);
			counter = emit_to;
		}	
		emiTex.jit_matrix(emiMat.name);	
	}

	if(forces.length > 0){
		forMat.dim = [forces.length, 2];
		forTex.dim = forMat.dim;
		for(var i = 0; i < forces.length; i++){
			forMat.setcell(i, 0, "val", forces[i].rate, forces[i].position);
			forMat.setcell(i, 1, "val", 1, forces[i].type, forces[i].speed, 0);
		}	
		forTex.jit_matrix(forMat.name);	
	}

	if(obstacles.length > 0){
		obsMat.dim = [obstacles.length, 2];
		obsTex.dim = obsMat.dim;
		for(var i = 0; i < obstacles.length; i++){
			obsMat.setcell(i, 0, "val", obstacles[i].rate, obstacles[i].position);
			obsMat.setcell(i, 1, "val", 1, obstacles[i].type, obstacles[i].speed, 0);
		}	
		obsTex.jit_matrix(obsMat.name);
	}
}

function process_particles(){

	partShader.param("numEmitters", emitters.length);
	partShader.param("numForces", forces.length);
	partShader.param("numObstacles", obstacles.length);
	partShader.draw();
}

function draw_particles(){

	mesh.draw();
}

function feedback_textures(){

	inAliveMatTex.jit_gl_texture(partShader.out_name[2]);
	inVelMassTex.jit_gl_texture(partShader.out_name[1]);
	inPosAgeTex.jit_gl_texture(partShader.out_name[0]); 
	//outlet(0, "jit_gl_texture", inPosAgeTex.name);
}

function bang(){

	read_and_parse();
	transfer_data_to_texture();
	process_particles();
	draw_particles();
	feedback_textures();

}