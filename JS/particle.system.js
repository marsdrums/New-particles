autowhatch = 1; inlets = 1; outlets = 1;

//______ GRAB CONTEXT ______________________________________________________________________

var drawto = "";
declareattribute("drawto", null, "dosetdrawto", 0);

var implicitdrawto = "";
var swaplisten = null; // The listener for the jit.world
var explicitdrawto = false;
var proxy = null;
var swapListener = null;

if(max.version >= 820) {
    proxy = new JitterObject("jit.proxy");
}

var implicit_tracker = new JitterObject("jit_gl_implicit"); // dummy oggetto gl
var implicit_lstnr = new JitterListener(implicit_tracker.name, implicit_callback);

function implicit_callback(event) { 
	// se non stai mettendo ctx a mano e se implicitdrawto != dal nome di implicit
	if(!explicitdrawto && implicitdrawto != implicit_tracker.drawto[0]) {
		// important! drawto is an array so get first element
		implicitdrawto = implicit_tracker.drawto[0];
        //FF_Utils.Print("IMPLICIT CLL", implicitdrawto);
		dosetdrawto(implicitdrawto);
	}
}
implicit_callback.local = 1;

function setDrawto(val) {
	explicitdrawto = true;
	dosetdrawto(val);
};

function dosetdrawto(newdrawto) {
	if(newdrawto == drawto || !newdrawto) {
		// bounce
        //FF_Utils.Print("bouncer");
		return;
	}
	if(proxy !== undefined) {
		proxy.name = newdrawto;
        // viene chiamato quando abbiamo classe
        if(proxy.class !== undefined && proxy.class != "") {
			// drawto may be root render or sub-node
			// if root the class will return jit_gl_context_view
			if(proxy.class != "jit_gl_context_view") { // jit_gl_context_view = node dentro world
				// class is a sub-node, get the drawto on that
				proxydrawto = proxy.send("getdrawto"); // prendi drawto di world che sarebbe nome del node
				// recurse until we get root
				// important! drawto is an array so get first element
                //FF_Utils.Print("proxy class", proxy.class);
                //FF_Utils.Print("DIVERSo da contxt_view", implicitdrawto);

				return dosetdrawto(proxydrawto[0]);
			}
		}
		else {
            // viene chiamato se non abbiamo classe
			proxydrawto = proxy.send("getdrawto");
			if(proxydrawto !== null && proxydrawto !== undefined) {
                //FF_Utils.Print("SE E NODE??", proxydrawto[0]);

				return dosetdrawto(proxydrawto[0]);  // name of the internal node
			}
		}
	}
    //FF_Utils.Print("ASSEGNA drawto", newdrawto);
    drawto = newdrawto;
    // chiama cose che vanno inizializzate quando c'è il drawto
    // assegna listener per ctx
    swapListener = new JitterListener(drawto, swapCallback);
}
dosetdrawto.local = 1;

function destroyFindCTX() {
	implicit_lstnr.subjectname = ""
	implicit_tracker.freepeer();
}
destroyFindCTX.local = 1;

function notifydeleted() {
    destroyFindCTX();
    mesh.freepeer();
    shaderPart.freepeer();
    meshPart.freepeer();
    nodePart.freepeer();
    //uvMat.freepeer();
    //nodeDensity.freepeer();
    //meshDensity.freepeer();
}

// ___ GRAB JIT.WORLD BANG____________________________________________
var swapCallback = function(event) {
    switch (event.eventname) {
        case ("swap" || "draw"):
        	bang();
            // FF_Utils.Print("BANG")
            break;
        //case "mouse": case "mouseidle": 
        //    FF_Utils.Print("MOUSE", event.args)
        //    break;
        case "willfree":
            //FF_Utils.Print("DESTROY")
            break;
        default: 
            break;
    }
}

//Arrays________________________________________________________________________________________________
var emitters = [];
var forces = [];
var obstacles = [];

//Textures _________________________________________________________________________________________
var emiMat = new JitterMatrix(4, "float32", 1,2);
var forMat = new JitterMatrix(4, "float32", 1,2);
var obsMat = new JitterMatrix(4, "float32", 1,2);

var emiTex = new JitterObject("jit.gl.texture", drawto);
var forTex = new JitterObject("jit.gl.texture", drawto);
var obsTex = new JitterObject("jit.gl.texture", drawto);

emiTex.adapt = 0;	emiTex.type = "float32";	emiTex.rectangle = 1;	emiTex.filter = "nearest";
forTex.adapt = 0;	forTex.type = "float32";	forTex.rectangle = 1;	forTex.filter = "nearest";
obsTex.adapt = 0;	obsTex.type = "float32";	obsTex.rectangle = 1;	obsTex.filter = "nearest";

var inPosAgeTex = new JitterObject("jit.gl.texture", drawto);
inPosAgeTex.adapt = 0;
inPosAgeTex.type = "float32";
inPosAgeTex.dim = [2000, 2000];
inPosAgeTex.rectangle = 1;
inPosAgeTex.defaultimage = "black";
inPosAgeTex.filter = "nearest";

var inVelMassTex = new JitterObject("jit.gl.texture", drawto);
inVelMassTex.adapt = 0;
inVelMassTex.type = "float32";
inVelMassTex.dim = [2000, 2000];
inVelMassTex.rectangle = 1;
inVelMassTex.defaultimage = "black";
inVelMassTex.filter = "nearest";

var inAliveMatTex = new JitterObject("jit.gl.texture", drawto);
inAliveMatTex.adapt = 0;
inAliveMatTex.type = "float32";
inAliveMatTex.dim = [2000, 2000];
inAliveMatTex.rectangle = 1;
inAliveMatTex.defaultimage = "black";
inAliveMatTex.filter = "nearest";

var inBounceTex = new JitterObject("jit.gl.texture", drawto);
inBounceTex.adapt = 0;
inBounceTex.type = "float32";
inBounceTex.dim = [2000, 2000];
inBounceTex.rectangle = 1;
inBounceTex.defaultimage = "black";
inBounceTex.filter = "nearest";

var uvMat = new JitterMatrix(3, "float32", 2000, 2000);
uvMat.exprfill(0, "cell[0]");
uvMat.exprfill(1, "cell[1]");
uvMat.op("+", 0.5, 0.5, 0.);

//Particle mesh ______________________________________________________________________________________

var nodePart = new JitterObject("jit.gl.node", drawto);
nodePart.adapt = 0;
nodePart.dim = [2000, 2000];
nodePart.capture = 4;
nodePart.type = "float32";
nodePart.erase_color = [0,0,0,0];

var shaderPart = new JitterObject("jit.gl.shader");
shaderPart.file = "particle.system.jxs";

var meshPart = new JitterObject("jit.gl.mesh", nodePart.name);
meshPart.shader = shaderPart.name;
meshPart.texture = [	inPosAgeTex.name,
						inVelMassTex.name,
						inAliveMatTex.name,
						emiTex.name,
						forTex.name,
						obsTex.name,
						inBounceTex.name
					];

var vertexBuf = new JitterObject("jit.gl.buffer.wrapper");
vertexBuf.type = "vertex_attr0";
vertexBuf.texbuf = 1;
meshPart.input_type = 7;
meshPart.jit_gl_buffer(vertexBuf.name);

var meshPosMat = new JitterMatrix(3, "float32", 2, 2);
meshPosMat.exprfill(0, "snorm[0]");
meshPosMat.exprfill(1, "snorm[1]");
var meshUvMat = new JitterMatrix(2, "float32", 2, 2);
meshUvMat.setcell(0,0, "val", 0.5, 0.5);
meshUvMat.setcell(1,0, "val", 1999.5, 0.5);
meshUvMat.setcell(0,1, "val", 0.5, 1999.5);
meshUvMat.setcell(1,1, "val", 1999.5, 1999.5);

meshPart.input_type = 0;	meshPart.jit_matrix(meshPosMat.name);
meshPart.input_type = 1;	meshPart.jit_matrix(meshUvMat.name);

//Density grid ____________________________________________________________________________________

var nodeDensity = new JitterObject("jit.gl.node", drawto);
nodeDensity.adapt = 0;
nodeDensity.capture = 1;
nodeDensity.type = "float16";
nodeDensity.dim = [2048, 2048];
nodeDensity.erase_color = [0,0,0,0];

var shaderDensity = new JitterObject("jit.gl.shader");
shaderDensity.file = "fill_density_grid.jxs";

var meshDensity = new JitterObject("jit.gl.mesh", nodeDensity.name);
meshDensity.draw_mode = "points";
meshDensity.blend_enable = 1;
meshDensity.depth_enable = 0;
meshDensity.blend = "add";
meshDensity.shader = shaderDensity.name;
meshDensity.texture = inPosAgeTex.name;
meshDensity.jit_matrix(uvMat.name);

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
	inBounceTex.jit_matrix(defaultPosAgeTex.name);

//rendering tools___________________________________________________________________________________
var renderNode = new JitterObject("jit.gl.node", drawto);
renderNode.capture = 1;
renderNode.type = "float32";

var particle_rendering = new JitterObject("jit.gl.shader");
particle_rendering.file = "particle.rendering.jxs";

var mesh = new JitterObject("jit.gl.mesh", renderNode.name);
mesh.draw_mode = "points";
mesh.shader = particle_rendering.name;
mesh.texture = [inPosAgeTex.name, inVelMassTex.name, inAliveMatTex.name, nodeDensity.out_name];
mesh.blend_enable = 0;
mesh.depth_enable = 1;
//mesh.blend = "add";

mesh.jit_matrix(uvMat.name);

//Uniforms___________________________________________________________________________________________

var _point_size = 0.004;

//Functions________________________________________________________________________________________
function point_size(x){ 

	_point_size = x; 
}

function reset(){

	inPosAgeTex.jit_matrix(defaultPosAgeTex.name);
	inVelMassTex.jit_matrix(defaultVelMassTex.name);
	inAliveMatTex.jit_matrix(defaultAliveMatTex.name);
	inBounceTex.jit_matrix(defaultPosAgeTex.name);
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
			    				enable: agent[20],
			    				materials_amt: agent[21],
			    				materials: [agent[22], agent[23], agent[24], agent[25], agent[26], agent[27]]
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
			    					radius: agent[15],
			    					materials_amt: agent[16],
			    					materials: [agent[17], agent[18], agent[19], agent[20], agent[21], agent[21]]
			    				});
			    break;

			  	case "emitter": 
			    emitters.push({	type: agent[1], 
			    				rate: agent[2],
			    				position: [agent[3], agent[4], agent[5]], 
			    				speed_lo: agent[6],
			    				speed_hi: agent[7],
			    				mass_lo: agent[8],
			    				mass_hi: agent[9],
			    				prevposition: [agent[10], agent[11], agent[12]],
			    				velocity: [agent[3]-agent[10], agent[4]-agent[11], agent[5]-agent[12]],
			    				matrix: agent[13],
			    				enable: agent[14],
			    				life_lo: agent[15],
			    				life_hi: agent[16],
			    				material: agent[17],
			    				initial_velocity: [agent[18], agent[19], agent[20]],
			    				mass_increment: agent[21]
			    			});
			    break;
			}
		}
	}
}

var inputMat = new JitterMatrix(3, "float32", 1, 1);
var vertexMat = new JitterMatrix(3, "float32", 1, 1);
var tempMat = new JitterMatrix(3, "float32", 1, 1);
tempMat.usedstdim = 1;
var totalConcatDim = 0;

function concat_vertex_matrices(){
     
		if(totalConcatDim == 0){

			vertexMat.dim = inputMat.dim;
			vertexMat.frommatrix(inputMat.name);
			totalConcatDim += vertexMat.dim[0];

		} else {

			tempMat.dim = [totalConcatDim + inputMat.dim[0], 1];

			tempMat.dstdimstart = [0, 0];
			tempMat.dstdimend = [totalConcatDim - 1, 0];
			tempMat.frommatrix(vertexMat.name);

			tempMat.dstdimstart = [totalConcatDim, 0];
			tempMat.dstdimend = [tempMat.dim[0] - 1, 0];
			tempMat.frommatrix(inputMat.name);

			vertexMat.dim = tempMat.dim;
			vertexMat.frommatrix(tempMat.name);

			totalConcatDim = tempMat.dim[0];
		}
}

function transfer_data_to_texture(){

	if(emitters.length > 0){

		emiMat.dim = [emitters.length, 7];
		emiTex.dim = emiMat.dim;
		var emit_to;
		totalConcatDim = 0;
		var vertexStartID = 0;
		var vertexLengthID;
		for(var i = 0; i < emitters.length; i++){

			emit_to = (counter + emitters[i].rate) % 4000000;

			if(emitters[i].type == 1) {
				inputMat = JitterMatrix(emitters[i].matrix);
				vertexLengthID = inputMat.dim[0];
				concat_vertex_matrices();
			}
			emiMat.setcell(i, 0, "val", emitters[i].mass_lo, emitters[i].position);
			emiMat.setcell(i, 1, "val", emit_to, emitters[i].type, emitters[i].speed_lo, counter);
			emiMat.setcell(i, 2, "val", emitters[i].enable, emitters[i].prevposition);
			emiMat.setcell(i, 3, "val", emitters[i].mass_hi, emitters[i].velocity);
			emiMat.setcell(i, 4, "val", emitters[i].speed_hi, emitters[i].life_lo, emitters[i].life_hi, emitters[i].material);
			emiMat.setcell(i, 5, "val", emitters[i].mass_increment, emitters[i].initial_velocity);
			emiMat.setcell(i, 6, "val", 0, vertexStartID, vertexLengthID ,0);
			counter = emit_to;
			vertexStartID += vertexLengthID + 1;
		}	
		emiTex.jit_matrix(emiMat.name);	
		if(totalConcatDim > 0) vertexBuf.jit_matrix(vertexMat.name);
	}

	if(forces.length > 0){
		forMat.dim = [forces.length, 7];
		forTex.dim = forMat.dim;
		for(var i = 0; i < forces.length; i++){
			forMat.setcell(i, 0, "val", forces[i].radius_softness, forces[i].type, forces[i].amount, forces[i].radius);
			forMat.setcell(i, 1, "val", forces[i].enable, forces[i].position);
			forMat.setcell(i, 2, "val", forces[i].field_octaves, forces[i].direction);
			forMat.setcell(i, 3, "val", forces[i].field_type, forces[i].field_offset);
			forMat.setcell(i, 4, "val", forces[i].noise_function, forces[i].field_scale);
			forMat.setcell(i, 5, "val", forces[i].materials_amt, forces[i].materials.slice(0, 3));
			forMat.setcell(i, 6, "val", 0,forces[i].materials.slice(3, 3));
		}	
		forTex.jit_matrix(forMat.name);	
	}

	if(obstacles.length > 0){
		obsMat.dim = [obstacles.length, 6];
		obsTex.dim = obsMat.dim;
		for(var i = 0; i < obstacles.length; i++){
			obsMat.setcell(i, 0, "val", obstacles[i].shape, obstacles[i].position);
			obsMat.setcell(i, 1, "val", obstacles[i].enable, obstacles[i].direction);
			obsMat.setcell(i, 2, "val", obstacles[i].action, obstacles[i].scale);
			obsMat.setcell(i, 3, "val", 0, obstacles[i].roughness, obstacles[i].softness, obstacles[i].radius);
			obsMat.setcell(i, 4, "val", obstacles[i].materials_amt, obstacles[i].materials.slice(0, 3));
			obsMat.setcell(i, 5, "val", 0, obstacles[i].materials.slice(3, 3));
		}	
		obsTex.jit_matrix(obsMat.name);
	}
}

function process_particles(){

	shaderPart.param("numEmitters", emitters.length);
	shaderPart.param("numForces", forces.length);
	shaderPart.param("numObstacles", obstacles.length);
	//shaderPart.draw();
}

function feedback_textures(){

	inBounceTex.jit_gl_texture(nodePart.out_names[3]);
	inAliveMatTex.jit_gl_texture(nodePart.out_names[2]);
	inVelMassTex.jit_gl_texture(nodePart.out_names[1]);
	inPosAgeTex.jit_gl_texture(nodePart.out_names[0]); 
}

function fill_density_grid(){

	//meshDensity.draw();
	//nodeDensity.draw();
	//outlet(0, "jit_gl_texture", nodeDensity.out_name);
}

function draw_particles(){

	particle_rendering.param("point_size", _point_size);
	outlet(0, "jit_gl_texture", renderNode.out_name);
	//mesh.draw();
}


function bang(){

	read_and_parse();
	transfer_data_to_texture();
	process_particles();
	feedback_textures();
	//fill_density_grid();
	draw_particles();

}