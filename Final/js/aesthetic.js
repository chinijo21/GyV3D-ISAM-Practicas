function dificulty(){
    var level;
    var probError;
    var min = 0;
    var tick = document.querySelector('input[name="diff"]:checked').value;

    switch(tick){
        case 'easy':
            level = 0.2;
            
            break;
        
        case 'medium':
            level = 0.65;
            
            break;
        
        case 'hard':
            level = 0.95;
            
            break;
    }
    return level;
}

function floorText(scene){
    var current = scene.getObjectByName('floor');
    //var tick = document.querySelector('input[name="floor"]:checked').value;

    if(current){
        scene.remove(current);
    }

    textFloor = document.querySelector('input[name="floor"]:checked').value;
    var floor = getFloor('floor');
    scene.add(floor);

    

}

function changeScore(who, scene){
    scoreBoard = (`AI: ${aiPoints} - USER: ${userPoints} \n     VIDAS ${total} `);
    var fonts = new THREE.FontLoader();
    fonts.load('/fonts/Distortion Dos Analogue_Regular.json', function ( font ){
      var selectedObject = scene.getObjectByName(who);
      if(selectedObject){
        scene.remove(selectedObject);
      }
      var geometry = new THREE.TextGeometry(scoreBoard, {
        font: font,
        size: 4,
        height: 0.5,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 0.1
      });background.jpg
      var texture = new THREE.TextureLoader().load("/textures/background/background.jpg")
      var material = new THREE.MeshBasicMaterial({
       map : texture
      });
      var text = new THREE.Mesh(geometry, material);
      text.name = who;
      text.position.set(-19,40,0);
      text.rotation.x = -5;
      scene.add(text);
    });
  }