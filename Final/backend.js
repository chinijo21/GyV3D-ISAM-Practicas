//-- Speed
var v_SpeedBall = 1;
var v_Max = 1.5;
var v_Min = 0.75;
//-- Initial position x of the cpu and user
var pos_CpuX = 0;
var pos_UserX = 0;
//--Ball
var movX = 0.15;
var movY = 0.25;
var a_AngleBall = 1;
var ballSize = 1;

var startGame = false;
var longPlayer = 3;
var borderMax = 7;
function getBackground(){
    var backText = new THREE.TextureLoader().load("background.jpg");
    var backMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2, 0),
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
            image = new THREE.TextureLoader().load("wood.png");
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
    light.shadow.camera.top = 10;
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
    var floorFinal = new THREE.Mesh(geometry, texturizer('floor'));
    floorFinal.receiveShadow = true;

    return floorFinal;
}

function getWall(which, x, y, z, posX, posY, posZ){
    var geometry = new THREE.BoxGeometry(x, y, z);
    var mesh;
    //TODO: get some textures
    switch(which){
        case "user":
            mesh = new THREE.Mesh(geometry, texturizer('wall'));
            break;

        case "ai":
            mesh = new THREE.Mesh(geometry, texturizer('wall'));
            break;

        default:
            mesh = new THREE.Mesh(geometry, texturizer('wall'));
            break;
    }
    
    mesh.receiveShadow = true;
    mesh.position.set(posX, posY, posZ);
    mesh.name = "wall";
  
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
        ball.position.x += movX * v_SpeedBall * a_AngleBall;
        ball.position.y += movY * v_SpeedBall;
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
            movY = -movY;
            
            break;
        case down:
            ball.position.x = 0;
            ball.position.y = 0;
            startGame = false;
            movY = -movY;
            user.position.x = 0;
            break;
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
    //collision(walls, ball);
    //ball movement
    inRange(ball, walls[0]);
    ballMov(ball);
    //collision detection
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

    //get floor
    var floor = getFloor("floor");

    //get walls
    var user = getWall("user", longPlayer, 1, 2, 0, -9.5, 0);
    var ai = getWall("ai", longPlayer, 1, 2, 0, 10, 0);
    var leftWall = getWall("left", 1, 20, 2, -borderMax, 0, 0);
    var rightWall = getWall("right", 1, 20, 2, borderMax, 0, 0);

    var walls = [user, ai, leftWall, rightWall]

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

