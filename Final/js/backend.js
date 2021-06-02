//Ball init things
var ballSpeed = 1;
var maxSpeed = 1.5;
var minSpeed = 0.69;
var posX = 0.15;
var posY = 0.25;
var ballAngle = 1;
var ballSize = 1;

//Level init
var movement;
var bText;
var rand;
var veloDiv = 1;

//Games starts when true
var startGame = false;

//Init players
var pos_ai = 0;
var pos_player = 0;

//Borders, player and ai lomg
var longPlayer = 3;
var borderMax = 6.5;

//counter
var userPoints = 0;
var aiPoints = 0;
var total = 0;
var pasos = 0;


function getBackground(){
    var backText = new THREE.TextureLoader().load("/textures/background/si.jpg");
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
    const loader = new THREE.TextureLoader();
    var texture;
    var image;

    switch(what){
        case 'floor':
            image = loader.load("/textures/floor/concrete.jpg");
            break;
        
        case 'wall':
            image = loader.load("/textures/walls/wood.png");
            break;

        case 'ball':
            image = loader.load("/textures/ball/footbal.jpg")
            break;

        case 'user':
            image = loader.load("/textures/walls/ai.jpg");
            break;
          
        case 'ai':
            image = loader.load("/textures/walls/user2.jpg");
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

    //Light settings
    light.position.set(5,-4,4);
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

    //Depending of which wall we get here we give it his texture
    if(which == 'user'){
      var mesh = new THREE.Mesh(geometry, texturizer('user'));
    }else if(which == 'ai'){
      var mesh = new THREE.Mesh(geometry, texturizer('ai'));
    }else{
      var mesh = new THREE.Mesh(geometry, texturizer('wall'));
    }
    
    mesh.receiveShadow = true;
    mesh.position.set(posX, posY, posZ);
    mesh.name = which;
  
    return mesh;
}

function getBall(){
    var geometry = new THREE.SphereGeometry(ballSize, 20, 20);
    var mesh = new THREE.Mesh(geometry,texturizer('ball'));
    mesh.position.z = 1;
    mesh.castShadow = true;
    mesh.name = "ball"

    return mesh;
}

function ballMov(ball){
    //Ball only moves when true
    if (startGame){
        ball.position.x += posX * ballSpeed * ballAngle;
        ball.position.y += posY * ballSpeed;
    }
}

function inRange(ball, user, scene){
    var up = -10;
    var down = 10;
    //We get to 0 lifes so put it to false
    if(total==0){
      startGame = false;
      changeScore('score', scene);
    }
    //would love this to be a switch 
    if(ball.position.y <= up){
      ball.position.x = 0;
      ball.position.y = 0;
      user.position.x = 0;
      startGame = false;
      posY = -posY;
      aiPoints += 1;
      total -= 1;
      changeScore('score', scene);
    }else if(ball.position.y >= down){
      console.log("SE PASO");
      ball.position.x = 0;
      ball.position.y = 0;
      startGame = false;
      posY = -posY;
      user.position.x = 0;
      userPoints += 1;
      total -= 1;
      changeScore('score', scene);
    }
}

function collision(ball, walls, ai, user) {
  var originPosition = ball.position.clone();
  var ceil = movement.max;
  var multiplier = movement.multiplier;
  
  for (var vertexIndex = 0; vertexIndex < ball.geometry.vertices.length; vertexIndex++) {
    var localVertex = ball.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(ball.matrix);
    var directionVector = globalVertex.sub(ball.position);
    var ray = new THREE.Raycaster(originPosition, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(walls);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      switch(collisionResults[0].object.name){
        case "ai":
          posY *= -1;
          pos_player = user.position.x;
          speedBall(user, ai,'user');
          angleBall('user', ball);

          break;
        
        case "user":
          posY *= -1;
          if(rand <= ceil){
            pos_ai = ai.position.x * (-1*multiplier);
            veloDiv = 2;
          }else{
            pos_ai = ai.position.x;
            veloDiv = 1;
          }

          speedBall(user, ai,'ai');
          angleBall('ai', ball);
          
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

//Funcionamiento avanzado
function speedBall(user, cpu, wall){
  var diff;
  switch(wall){
    case 'ai':
      diff = Math.abs(pos_ai - cpu.position.x);
      break;
    
    case 'user':
      diff = Math.abs(pos_player - user.position.x);
      break;
  }

  if(diff > maxSpeed){
    ballSpeed = maxSpeed;
  }else if(diff < minSpeed){
    ballSpeed = minSpeed;
  }else{
    ballSpeed = diff;
  }
}

function angleBall(wall, ball){
  var distance;
  //Calculamos la distancia
  switch(wall){
    case 'ai':
      distance = Math.abs(pos_ai - ball.position.x);
      break;
    
    case 'user':
      distance = Math.abs(pos_player - ball.position.x);
      break;
  }
  
  //Dependiendo de la distancia, la pelota coge una velocidad minima o una máxima
  if(distance < minSpeed){

     ballAngle = minSpeed;

  }else if (distance > maxSpeed) {

     ballAngle = maxSpeed;
  }else{

     ballAngle = distance;
  }
}

function aiMoves(ai, ball){
    //Depending of the level velocity and his div changes
    ai.position.x = ball.position.x * (movement.velocity/veloDiv);

    //Controls the position so it doesnt goes anywhere
    if(ai.position.x >= borderMax){

        ai.position.x = borderMax;

    }else if(ai.position.x <= -borderMax){

        ai.position.x = -borderMax;
    }
    
}

function animate(walls, ball, scene, cam, renderer){
    rand = Math.floor(Math.random()* 10);
    //Collisiom 0=user 1=ai
    collision(ball, walls, walls[1], walls[0])

    //Checks range and adds points
    inRange(ball, walls[0], scene);

    //ball movement
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
    movement = dificulty();
    var scene = new THREE.Scene();
    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;

    //Define camera + where to lookAt
    var cam = new THREE.PerspectiveCamera(90, sceneWidth/sceneHeight, 0.01, 100);
    cam.position.set(0, -12, 15);
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
    var leftWall = getWall("left", 1.5, 20, 1, -borderMax, 0, 0.5);
    var rightWall = getWall("right", 1.5 , 20, 1, borderMax, 0, 0.5);
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

    document.onkeydown = function(ev){
    switch (ev.keyCode) {
      case 37:
        if(user.position.x > -5){

          user.position.x -= 0.35 * getSens();
        }
        break;
      case 39:
        if(user.position.x < 5){
          user.position.x += 0.35 * getSens();
        }
        break;
      case 32:
        movement = dificulty();
        startGame = true;
        if (pasos == 0){
          total = getLifes();
          pasos = total;
        }
        changeScore('score', scene);
        if(total == 0){
          total = getLifes();
          aiPoints = 0;
          userPoints = 0;
          changeScore('score', scene);
          startGame = false;
        }
        break;
      default:
        break;
    }
  }
  
  animate(walls, ball, scene, cam, renderer);
  changeScore('score', scene);
}

  
  

  
