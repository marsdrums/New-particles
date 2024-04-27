autowhatch = 1;

function findoutlet(patcher){

	var obj = patcher.firstobject;
	while (obj) {
		if (obj.maxclass == "outlet") {
			return obj;
		}
		obj = obj.nextobject;
	}
}

function bang(){

	//start from the js object
	var input = this.box.patchcords.inputs;

	//check all the patchcords connected to the js inlet
	for(var i = 0; i < input.length; i++){

		//if the connected object is an [inlet]
		if(input[i].srcobject.maxclass != "js") continue;

		var obj = input[i].srcobject.patching_rect ;
		post(JSON.stringify(obj), "\n");
		//var dict = JSON.stringify(obj);
		//outlet(0, "dictionary", dict.name);
		//post(input[i].srcobject.file, "\n");
/*
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
		
		}
*/	
	}
}