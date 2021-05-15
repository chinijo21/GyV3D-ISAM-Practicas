function dificulty(){
    var level;
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
    var tick = document.querySelector('input[name="floor"]:checked').value;

    if(current){
        scene.remove(current);
    }

    textFloor = document.querySelector('input[name="floor"]:checked').value;
    var floor = getFloor('floor');
    scene.add(floor);

    

}