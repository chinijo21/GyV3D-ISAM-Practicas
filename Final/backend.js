function getBackground(){
    var backText = THREE.ImageUtils.loadTexture('background.jpg')
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
    //var texture;
    switch(what){
        case 'floor':
            var texture = new THREE.TextureLoader().load("texture.png");
            break;
        
        case 'wall':
            var texture = new THREE.TextureLoader().load("wood.png");
            break;

        case 'ball':
            break;

        default:
            console.log("This object has no texture")
            break;
    }

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
    var mesh = new THREE.Mesh(geometry, texturizer('wall'));
    mesh.receiveShadow = true;
    mesh.position.set(posX, posY, posZ);
    mesh.name = "wall";
  
    return mesh;
}

function getBall(){
    var geometry = new THREE.SphereGeometry(1, 20, 20);
    var mesh = new THREE.Mesh(geometry, texturizer('ball'));
    mesh.position.z = 1;
    mesh.castShadow = true;
    mesh.name = "ball"

    return mesh;
}

function animate(walls, ball, scene, cam, renderer){
    //TODO
    //get user and ai pos 
    var user = walls[0];
    var ai = walls[1];
    

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
    var user = getWall("down", 3, 1, 2, 0, -9.5, 0);
    var ai = getWall("top", 3, 1, 2, 0, 10, 0);
    var leftWall = getWall("left", 1, 20, 2, -7, 0, 0);
    var rightWall = getWall("right", 1, 20, 2, 7, 0, 0);

    var walls = [user, ai, leftWall, rightWall]

    //get ball
    var ball = getBall();

    //Add all of them
    scene.add(light);
    scene.add(floor);
    scene.add(walls);
    scene.add(ball);

    animate(walls, ball, scene, cam, renderer);
}

