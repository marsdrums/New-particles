autowhatch = 1; inlets = 1; outlets = 0;

//Arrays________________________________________________________________________________________________
var emitters = [];
var forces = [];
var obstacles = [];

//Textures and particle shader__________________________________________________________________________
var emiMat = new JitterMatrix(4, "float32", 1,2);
var forMat = new JitterMatrix(4, "float32", 1,2);
var obsMat = new JitterMatrix(4, "float32", 1,2);

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
var defaultPosAgeTex = new JitterMatrix(4, "float32", 2000,2000);
	defaultPosAgeTex.setall(0);
var defaultVelMassTex = new JitterMatrix(4, "float32", 2000,2000);
	defaultVelMassTex.setall(1,0,0,0);
var defaultAliveMatTex = new JitterMatrix(4, "float32", 2000,2000);
	defaultAliveMatTex.setall(0);
	inPosAgeTex.jit_matrix(defaultPosAgeTex.name);
	inVelMassTex.jit_matrix(defaultVelMassTex.name);
	inAliveMatTex.jit_matrix(defaultAliveMatTex.name);

//rendering tools___________________________________________________________________________________
var particle_rendering = new JitterObject("jit.gl.shader", "part-ctx");
particle_rendering.file = "particle.rendering.jxs";

var mesh = new JitterObject("jit.gl.mesh", "part-ctx");
mesh.draw_mode = "points";
mesh.shader = particle_rendering.name;
mesh.texture = ["inPosAgeTex", "inVelMassTex", "inAliveMatTex"];
mesh.blend_enable = 1;
mesh.depth_enable = 0;

var uvMat = new JitterMatrix(3, "float32", 2000, 2000);
uvMat.exprfill(0, "cell[0]");
uvMat.exprfill(1, "cell[1]");
uvMat.op("+", 0.5, 0.5, 0.);

mesh.jit_matrix(uvMat.name);

//Functions________________________________________________________________________________________
function reset(){

	inPosAgeTex.jit_matrix(defaultPosAgeTex.name);
	inVelMassTex.jit_matrix(defaultVelMassTex.name);
	inAliveMatTex.jit_matrix(defaultAliveMatTex.name);
}

function findoutlet(patcher){

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

			//get the value of the object connected to the outlet of that abstraction
			var thisOutlet = findoutlet(thisSubpatcher);
			var agent = thisOutlet.patchcords.inputs[0].srcobject.getattr('boxatoms');
			//agent.shift();

			switch (agent[0]) {
			  	case "force":
			    forces.push({	type: agent[1], 
			    				amount: agent[2],
			    				radius: agent[3],
			    				radius_softness: agent[4],
			    				position: [agent[5], agent[6], agent[7]],
			    				direction: [agent[8], agent[9], agent[10]],
			    				field_type: agent[11],
			    				noise_function: agent[12],
			    				field_offset: [agent[13], agent[14], agent[15]],
			    				field_scale: [agent[16], agent[17], agent[18]],
			    				field_octaves: agent[19],
			    				enable: agent[20]
			    			});
			    break;

			  	case "obstacle":
			    obstacles.push({	shape: agent[1], 
			    					position: [agent[2], agent[3], agent[4]], 
			    					direction: [agent[5], agent[6], agent[7]],
			    					scale: [agent[8], agent[9], agent[10]],
			    					action: agent[11],
			    					roughness: agent[12],
			    					softness: agent[13],
			    					enable: agent[14],
			    					radius: agent[15]
			    				});
			    break;

			  	case "emitter": 
			    emitters.push({	type: agent[1], 
			    				rate: agent[2],
			    				position: [agent[3], agent[4], agent[5]], 
			    				speed: agent[6],
			    				mass_lo: agent[7],
			    				mass_hi: agent[8],
			    				prevposition: [agent[9], agent[10], agent[11]],
			    				velocity: [agent[3]-agent[9], agent[4]-agent[10], agent[5]-agent[11]],
			    				matrix: agent[12],
			    				enable: agent[13],
			    				life_lo: agent[14],
			    				life_hi: agent[15]
			    			});
			    break;
			}
		}
	}
}


function transfer_data_to_texture(){

	if(emitters.length > 0){
		emiMat.dim = [emitters.length, 5];
		emiTex.dim = emiMat.dim;
		var emit_to;
		for(var i = 0; i < emitters.length; i++){
			emit_to = (counter + emitters[i].rate) % 4000000;
			emiMat.setcell(i, 0, "val", emitters[i].mass_lo, emitters[i].position);
			emiMat.setcell(i, 1, "val", emit_to, emitters[i].type, emitters[i].speed, counter);
			emiMat.setcell(i, 2, "val", emitters[i].enable, emitters[i].prevposition);
			emiMat.setcell(i, 3, "val", emitters[i].mass_hi, emitters[i].velocity);
			emiMat.setcell(i, 4, "val", 0, emitters[i].life_lo, emitters[i].life_hi, 0);
			counter = emit_to;
		}	
		emiTex.jit_matrix(emiMat.name);	
	}

	if(forces.length > 0){
		forMat.dim = [forces.length, 5];
		forTex.dim = forMat.dim;
		for(var i = 0; i < forces.length; i++){
			forMat.setcell(i, 0, "val", forces[i].radius_softness, forces[i].type, forces[i].amount, forces[i].radius);
			forMat.setcell(i, 1, "val", forces[i].enable, forces[i].position);
			forMat.setcell(i, 2, "val", forces[i].field_octaves, forces[i].direction);
			forMat.setcell(i, 3, "val", forces[i].field_type, forces[i].field_offset);
			forMat.setcell(i, 4, "val", forces[i].noise_function, forces[i].field_scale);
		}	
		forTex.jit_matrix(forMat.name);	
	}

	if(obstacles.length > 0){
		obsMat.dim = [obstacles.length, 4];
		obsTex.dim = obsMat.dim;
		for(var i = 0; i < obstacles.length; i++){
			obsMat.setcell(i, 0, "val", obstacles[i].shape, obstacles[i].position);
			obsMat.setcell(i, 1, "val", obstacles[i].enable, obstacles[i].direction);
			obsMat.setcell(i, 2, "val", obstacles[i].action, obstacles[i].scale);
			obsMat.setcell(i, 3, "val", 0, obstacles[i].roughness, obstacles[i].softness, obstacles[i].radius);
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

function feedback_textures(){

	inAliveMatTex.jit_gl_texture(partShader.out_name[2]);
	inVelMassTex.jit_gl_texture(partShader.out_name[1]);
	inPosAgeTex.jit_gl_texture(partShader.out_name[0]); 
}

function draw_particles(){

	mesh.draw();
}


function bang(){

	read_and_parse();
	transfer_data_to_texture();
	process_particles();
	feedback_textures();
	draw_particles();

}