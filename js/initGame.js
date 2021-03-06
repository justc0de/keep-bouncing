function init() {
	
	var b2Vec2 = Box2D.Common.Math.b2Vec2,
		b2AABB = Box2D.Collision.b2AABB,
	 	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	 	b2Body = Box2D.Dynamics.b2Body,
	 	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	 	b2Fixture = Box2D.Dynamics.b2Fixture,
	 	b2World = Box2D.Dynamics.b2World,
	 	b2MassData = Box2D.Collision.Shapes.b2MassData,
	 	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	 	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	 	b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
	    b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef,
	    canvas = document.getElementById("canvas"),
	    context = canvas.getContext("2d");


	var world = new b2World(
			new b2Vec2(0, 0),	//gravity
			true);              //allow sleep
	 
	var fixDef = new b2FixtureDef;
	 
	fixDef.density = 0.0;		//  The density, usually in kg/m^2.
	fixDef.friction = 0.0;    	//  The friction coefficient, usually in the range [0,1].
	fixDef.restitution = 1.0; 	// The restitution (elasticity) usually in the range [0,1].

	var bodyDef = new b2BodyDef;
	 
	//create ground
	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(20, 2);
	bodyDef.position.Set(10, 400 / 30 + 1.8);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	bodyDef.position.Set(10, -1.8);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	 
	// these were the right and left walls
	fixDef.shape.SetAsBox(2, 14);
	bodyDef.position.Set(-1.8, 13);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	bodyDef.position.Set(21.7, 13);
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	//create ball
	bodyDef.type = b2Body.b2_dynamicBody;
	fixDef.shape = new b2CircleShape(1.0); // radius
	bodyDef.position.x = 0;
	bodyDef.position.y = 0;
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	//create player object 
        bodyDef.type = b2Body.b2_kinematicBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(0.5,3.5);
	bodyDef.position.Set(2,7);
	var bar = world.CreateBody(bodyDef);
	bar.CreateFixture(fixDef);


	// load image, 50px x 50px
	// TODO load image before drawing
	//var image = new Image();
	//image.src = "image.png";
	//var image2 = new Image();
	//image2.src = "image2.jpg";

	//setup debug draw
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
	debugDraw.SetDrawScale(30.0);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);
	 
	window.setInterval(update, 1000 / 60);
	 
	//mouse
	var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
	var canvasPosition = getElementPosition(document.getElementById("canvas"));
	 
	document.addEventListener("mousedown", function(e) {
		isMouseDown = true;
		handleMouseMove(e);
		document.addEventListener("mousemove", handleMouseMove, true);
	}, true);
	 
	document.addEventListener("mouseup", function() {
		document.removeEventListener("mousemove", handleMouseMove, true);
		isMouseDown = false;
	    mouseX = undefined;
	    mouseY = undefined;
	}, true);
	
	document.onkeydown = checkKey;
	function checkKey(e) {

	  e = e || window.event;

	  if (e.keyCode == '38') {
	    // up arrow
	    console.log("up pressed");
	  }
	  if (e.keyCode == '40') {
	    // down arrow
	    console.log("down pressed");
	  }
	  if (e.keyCode == '37') {
	    // left arrow
	    console.log("left pressed");
	  }
	  if (e.keyCode == '39') {
	    // right arrow
	    console.log("right pressed");
	  }
      }
      	
	 
	function handleMouseMove(e) {
		mouseX = (e.clientX - canvasPosition.x) / 30;
	    mouseY = (e.clientY - canvasPosition.y) / 30;
	}
	 
	function getBodyAtMouse() {
		mousePVec = new b2Vec2(mouseX, mouseY);
	    var aabb = new b2AABB();
	    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
	    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
	    
	    // Query the world for overlapping shapes.
	    selectedBody = null;
	    world.QueryAABB(getBodyCB, aabb);
	    return selectedBody;
	}
	
	function getBodyCB(fixture) {
		if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
			if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
				selectedBody = fixture.GetBody();
				return false;
			}
	    }
	    
		return true;
	}
	 
	//Main game loop
	function update() {
	 
		if(isMouseDown && (!mouseJoint)) {
			var body = getBodyAtMouse();
	       
			if(body) {
				var md = new b2MouseJointDef();
				md.bodyA = world.GetGroundBody();
				md.bodyB = body;
				md.target.Set(mouseX, mouseY);
				md.collideConnected = true;
				md.maxForce = 300.0 * body.GetMass();
				mouseJoint = world.CreateJoint(md);
				body.SetAwake(true);
			}
		}
	    
	    if(mouseJoint) {
	    	if(isMouseDown) {
	    		mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
	    	} else {
	    		world.DestroyJoint(mouseJoint);
	    		mouseJoint = null;
	    	}
	    }
	 
	    world.Step(1 / 60, 8, 3);
	    
	    //this draws the debug world Can be used with textures for testing
	    world.DrawDebugData();
	   
	    //context.clearRect(0, 0, 550, 480);
	    
	    //draw textures
	    for (b = world.GetBodyList() ; b; b = b.GetNext()) {
	    	
	    	//ball is a dynamic body
	    	if (b.GetType() == b2Body.b2_dynamicBody){
	    		var pos = b.GetPosition();

	    		context.save();
	    		context.translate(pos.x * 30, pos.y * 30);
	    		context.rotate((b.GetAngle())/15);
	    		//context.drawImage(image, -40, -40);
	    		context.restore();
	    	}
	    	
		//player object
	    	if (b.GetType() == b2Body.b2_kinematicBody){
                     	
	    	}
            
	    	//ground and walls are static bodies
	    	//this is not working yet      
	    	//	    if (b.GetType() == b2Body.b2_staticBody)
	    	//		  {
	    	//
	    	//		    var pos = b.GetPosition();
	    	//
	    	//		      context.save();
	    	//		      context.translate(pos.x * 20, pos.y * 20);
	    	//		      context.rotate((b.GetAngle())/15);
	    	//		      context.drawImage(image2, -25, -25);
	    	//		      context.restore();
	    	//		   }
	    } 
     
	    world.ClearForces();
	}
	
	//helpers
	//http://js-tut.aardon.de/js-tut/tutorial/position.html
	function getElementPosition(element) {
		
		var elem=element, tagname="", x=0, y=0;
	   
	    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
	    	
	    	y += elem.offsetTop;
	    	x += elem.offsetLeft;
	    	tagname = elem.tagName.toUpperCase();
	
	    	if(tagname == "BODY"){
	    		elem=0;
	    	}
	
	    	if(typeof(elem) == "object") {
	    		
	    		if(typeof(elem.offsetParent) == "object"){
	                 elem = elem.offsetParent;
	    		}
	        }
	    }
	    
	    return {x: x, y: y};
	}
}
