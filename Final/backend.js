function getBackground(){
    var backText = THREE.ImageUtils.loadTexture('getsomething.png')
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
    
    //RenderIt!
    var render = function() {
        requestAnimationFrame(render);
        renderer.autoClear = false;
        renderer.clear();
        renderer.render(backScene, backCam);
    };
    render();
}

function getLight(){
    
}

function getFloor(floor){
    var geometry = new THREE.PlaneGeometry(15,20);
    var floorFinal = new THREE.Mesh(geometry, getMaterial(floor));
    floorFinal.receiveShadow = true;

    return floorFinal;
}

function init(){
    //Define scene + size
    var scene = new THREE.Scene();
    var sceneWidth = window.innerWidth;
    var sceneHeight = window.innerHeight;

    //Define camera + where to lookAt
    var camera = new THREE.PerspectiveCamera(90, sceneWidth/sceneHeight, 0.01, 100);
    camera.position.set(0, -10, 15);
    camera.lookAt(scene.position);

    //Create renderer
    var renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.shadowMap.enabled = true;
    renderer.setSize(sceneWidth, sceneHeight);
    document.body.appendChild(renderer.domElement);

    //call for Background functiones
    getBackground();

    //la lux
    var light = getLight();

    //get floor
    var floor = getFloor("floor")
}

