//Init position of players
var pos_ai = 0;
var pos_CpuX = 0;

//Ball things
var ballSpeed = 1;
var maxSpeed = 1.5;
var minSpeed = 0.75;
var posX = 0.15;
var posY = 0.25;
var ballAngle = 1;
var ballSize = 1;

//Games starts when true
var startGame = false;

//Borders long
var longPlayer = 3;
var borderMax = 6.5;

//TODO: Collision

function getBackground(){
    var backText = new THREE.TextureLoader().load("critikal.jpg");
    var backMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3, 0),
        new THREE.MeshBasicMaterial({map: backText})
    );
    backMesh.material.depthTest = false;
    backMesh.material.depthWrite = false;

    var backScene = new THREE.Scene();
    var backCam = new THREE.Camera();
    backScene.add(backCam);
    backScene.add(backMesh);
    
    return{backScene, backCam};
}

function texturizer(what){
    var texture;
    var image;
    switch(what){
        case 'floor':
            image = new THREE.TextureLoader().load("texture.png");
            break;
        
        case 'wall':
            image = new THREE.TextureLoader().load("wood.png");
            break;

        case 'ball':
            image = new THREE.TextureLoader().load("texture.png");
            break;

        case 'user':
            break;
          
        case 'ai':
            break;
                
        default:
            console.log("This object has no texture")
            break;
    }
    texture = new THREE.MeshPhysicalMaterial({map: image});
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;
    texture.side = THREE.DoubleSide;

    return texture;
}

function getLight(){
    var light = new THREE.DirectionalLight();
    light.position.set(2.5, 4, 3);
    light.castShadow = true;

    light.shadow.camera.near = 0;
    light.shadow.camera.ai = 10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.left = -8;
    light.shadow.camera.right = 5;
    light.shadow.camera.far = 16;

    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;

    return light;
}

function getFloor(floor){
    var geometry = new THREE.PlaneGeometry(15,20);
    var floorFinal = new THREE.Mesh(geometry, texturizer(floor));
    floorFinal.receiveShadow = true;

    return floorFinal;
}

function getWall(which, x, y, z, posX, posY, posZ){
    var geometry = new THREE.BoxGeometry(x, y, z);
    //var mesh;
    //TODO: get some textures
    var mesh = new THREE.Mesh(geometry, texturizer('wall'));
    mesh.receiveShadow = true;
    mesh.position.set(posX, posY, posZ);
    mesh.name = which;
  
    return mesh;
}

function getBall(){
    var geometry = new THREE.SphereGeometry(ballSize, 20, 20);
    var mesh = new THREE.Mesh(geometry, texturizer('ball'));
    mesh.position.z = 1;
    mesh.castShadow = true;
    mesh.name = "ball"

    return mesh;
}

function ballMov(ball){
    if (startGame){
        ball.position.x += posX * ballSpeed * ballAngle;
        ball.position.y += posY * ballSpeed;
    }
}

function inRange(ball, user){
    var up = -10;
    var down = 10;
    switch(ball.position.y){
        case up:
            ball.position.x = 0;
            ball.position.y = 0;
            user.position.x = 0;
            startGame = false;
            posY = -posY;
            
            break;
        case down:
            ball.position.x = 0;
            ball.position.y = 0;
            startGame = false;
            posY = -posY;
            user.position.x = 0;
            break;
    }
}

function collision(ball, walls, cpu, user) {
  var originPosition = ball.position.clone();

  //!! https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Collision-Detection.html
  for (var vertexIndex = 0; vertexIndex < ball.geometry.vertices.length; vertexIndex++) {
    var localVertex = ball.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(ball.matrix);
    var directionVector = globalVertex.sub(ball.position);
    var ray = new THREE.Raycaster(originPosition, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(walls);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      switch(collisionResults[0].object.name){
        case "user":
          posY *= -1;
          pos_CpuX = cpu.position.x;
          speedBall(user, cpu,'user');
          angleBall(user, cpu, 'user', ball);

          break;
        
        case "ai":
          posY *= -1;
          pos_UserX = user.position.x;
          //-- Ball speed and angle
          speedBall(user, cpu,'ai');
          angleBall(user, cpu, 'ai', ball);

          break;

        case "left":
          posX *= -1;

          break;

        case "right":
          posX *= -1;
          
          break;
      }
      break;
    }
  }
}

function speedBall(user, cpu, wall){
  //-- Difference between previous and current position
  var diff;
  switch(wall){
    case 'ai':
      diff = Math.abs(pos_CpuX - cpu.position.x);
      break;
    
    case 'user':
      diff = Math.abs(pos_UserX - user.position.x);
      break;
  }
  
  if(diff < minSpeed){
    v_SpeedBall = minSpeed;
  }else if (diff > maxSpeed) {
    v_SpeedBall = maxSpeed;
  }else{
    v_SpeedBall = diff;
  }
}

function angleBall(user, cpu, wall, ball){
  //-- Difference between position of racket and ball
  var distance;
  switch(wall){
    case 'ai':
      distance = Math.abs(cpu.position.x - ball.position.x);
      break;
    
    case 'user':
      distance = Math.abs(user.position.x - ball.position.x);
      break;
  }
  
  if(distance < minSpeed){
     a_AngleBall = minSpeed;
  }else if (distance > maxSpeed) {
     a_AngleBall = maxSpeed;
  }else{
     a_AngleBall = distance;
  }
}


function aiMoves(ai, ball){
    ai.position.x = ball.position.x * 0.6;

    if(ai.position.x > 7){
        ai.position.x = 7;
    }else if(ai.position.x < -7){
        ai.position.x = -7;
    }
    
}

function animate(walls, ball, scene, cam, renderer){
    //TODO
    //Collisiom 0=user 1=ai
    collision(ball, walls, walls[1], walls[0])
    //ball movement
    inRange(ball, walls[0]);
    ballMov(ball);

    //cpu movement
    aiMoves(walls[1], ball);

    renderer.render(scene, cam);
    requestAnimationFrame(function(){
        animate(walls, ball, scene, cam, renderer);
    });
}

function init(){
    //Define scene + size
    var scene = new THREE.Scene();
    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;

    //Define camera + where to lookAt
    var cam = new THREE.PerspectiveCamera(90, sceneWidth/sceneHeight, 0.01, 100);
    cam.position.set(0, -10, 15);
    cam.lookAt(scene.position);

    //Create renderer
    var renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.shadowMap.enabled = true;
    renderer.setSize(sceneWidth, sceneHeight);
    document.body.appendChild(renderer.domElement);

    //call for Background functiones
    var background = getBackground();

    //RenderIt!
    var render = function() {
        requestAnimationFrame(render);
        renderer.autoClear = false;
        renderer.clear();
        renderer.render(background.backScene, background.backCam);
    };
    render();

    //la lux
    var light = getLight();

    //get walls
    var user = getWall("ai", longPlayer, 1, 2, 0, -9.5, 0);
    var ai = getWall("user", longPlayer, 1, 2, 0, 10, 0);
    var leftWall = getWall("left", 1, 20, 2, -borderMax, 0, 0);
    var rightWall = getWall("right", 1, 20, 2, borderMax, 0, 0);
    var walls = [user, ai, leftWall, rightWall]
    //get floor
    var floor = getFloor("floor");



    

    //get ball
    var ball = getBall();

    //Add all of them
    scene.add(light);
    scene.add(floor);
    scene.add(ball);
    //Add walls
    for (var i = 0; i < walls.length; i++){
      scene.add(walls[i]);
    }

 
    //Movement
    //-- Move user
  window.onkeydown = (e) => {
    e.preventDefault();
    switch (e.key) {
      case 'ArrowLeft':
        if(user.position.x > -5){
          user.position.x -= 0.35;
        }
        break;
      case 'ArrowRight':
        if(user.position.x < 5){
          user.position.x += 0.35;
        }
        break;
      case ' ':
        startGame = true;
        //-- Read new texture of floor
        
        break;
      default:
        break;
    }
  }

    animate(walls, ball, scene, cam, renderer);
}



  
  

  
