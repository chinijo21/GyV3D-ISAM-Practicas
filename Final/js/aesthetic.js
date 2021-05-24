function dificulty(){
    var velocity;
    var max;
    var tick = document.querySelector('input[name="diff"]:checked').value;

    switch(tick){
        case 'easy':
            velocity = 0.30;
            max = 7;
            break;
        
        case 'medium':
            velocity = 0.50;
            max = 5;
            break;
        
        case 'hard':
            velocity = 0.70;
            max = 3;
            break;
    }
    return {velocity, max};
}

function changeScore(who, scene){
    scoreBoard = (`AI: ${aiPoints} - USER: ${userPoints} \n     VIDAS ${total} `);
    var fonts = new THREE.FontLoader();
    pasos -= 1
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
      });
      var texture = new THREE.TextureLoader().load("/textures/background/critikal.jpg")
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

function getSens(){
  var sens = document.getElementById("sen").value;
  return sens;
}

function getLifes(){
  var lifes = document.getElementById("lifes").value
  return lifes;
}