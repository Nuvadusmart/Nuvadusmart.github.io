const canvas = document.getElementById('canvas1');

ctx = canvas.getContext('2d')
const DEBUG = document.getElementById('debug');
canvas.width = document.documentElement.clientWidth-200
canvas.height = document.documentElement.clientHeight -200

const info = document.getElementById('infoscreen');
const yesbtn = document.getElementById('yesbtn');
let highscore = document.getElementById('highscore');
highscore.innerHTML = localStorage.getItem('myscore'); //set score to whatever is set in localstorage, should be the highest
/*
info.toggleClass('open');
yes.addEventListener('click',function(){
    info.toggleClass('open')
})*/

var bird;
let spacePressed = false;
let enterPressed = false;
let angle = 0;
let hue = 0;
let frame = 0;
let framesElapsed = 0;

let score = 0;
let gamespeed = 4;
let previous = 0;
let lastFrameTimestamp = performance.now();
let accumulatedTime = 0;
const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;
let myaudio = new Audio('song.mp3')
myaudio.loop = true;
myaudio.oncanplaythrough = function() {
    myaudio.play();
  }

localStorage.setItem('myscore',0)

function animate(){
    let timestamp = performance.now();
    accumulatedTime += timestamp - lastFrameTimestamp;
    lastFrameTimestamp = timestamp;
    if (accumulatedTime >= FRAME_DURATION) {
    
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width,canvas.height);
    //ctx.fillRect(10,temp,50,50);
    bird.update();
    handleCollisions();
    

        if(previous < score && score % 10 === 0){
             gamespeed += 1;
             console.log(previous);
             previous = score;
        }
    
    handleParticles();
    handleObstacles(gamespeed);
    showScore();
    if(handleCollisions()) return; //jump out of animloop;
    accumulatedTime -= FRAME_DURATION;
    
}
    requestAnimationFrame(animate)

   
    
    angle += 0.12; //wobblespeed;
    hue +=1;
    frame++;
    let debugoutput = 'frame:'+frame+'<br>'+
                      'currentframeX:'+bird.framesCurrentX+'<br>'+
                      'currentframeY:'+bird.framesCurrentY+'<br>'+
                      'gamespeed:'+gamespeed+'<br>'+
                      'birdsize: x:'+bird.width +' y: '+bird.height
    DEBUG.innerHTML = debugoutput;
    
    
}

//create eventlistener on button to start game
yesbtn.addEventListener('click',function(){
info.classList.remove('open');
clearObstacles();
bird = new Bird('bird5x4.png',5,3,0.75);

    animate();
});




window.addEventListener('keydown',function(e){
    console.log(e.code);
    if(e.code ==='Space') spacePressed = true;
    if(e.code ==='Enter') this.location.reload(true)
    

})

window.addEventListener('touchstart',function(e){
    console.log(e)
   if(e.touches.length >1)
   {this.location.reload(true)}
   else{
    spacePressed = true;
   }
})

window.addEventListener('touchend',function(e){
    console.log(e)
   if(e.touches.length >1)
   {this.location.reload(true)}
   else{
    spacePressed = false;
   }
})

window.addEventListener('keyup',function(e){
    //console.log(e.code);
    if(e.code ==='Space') spacePressed = false;
    if(e.code ==='Enter') enterPressed = false;



})

const bang = new Image();
bang.src = 'https://www.freepnglogos.com/uploads/explosion-png/huge-fireball-explosion-png-transparent-7.png'
//'https://w7.pngwing.com/pngs/777/977/png-transparent-explode-game-orange-explosion-thumbnail.png'

function handleCollisions(){
    for(let i = 0; i < obstaclesArray.length; i++){
        if (bird.x < obstaclesArray[i].x + obstaclesArray[i].width &&
            bird.x + bird.width > obstaclesArray[i].x &&
            ((bird.y < 0 + obstaclesArray[i].top && bird.y +bird.height > 0) ||
            (bird.y > canvas.height - obstaclesArray[i].bottom
                 && bird.y + bird.height < canvas.height))
            ){
                // collision detected
                ctx.drawImage(bang,bird.x-(bird.offsetx),(bird.y-bird.offsety),50,50);
                ctx.font = "25px Georgia";
                ctx.fillStyle = 'white';
                ctx.fillText('Game Over, your score is ' + score, 160, canvas.height/2 - 12.5)
                let previous = localStorage.getItem('myscore')
                if(previous < score) {
                    localStorage.setItem('myscore',score)
                    
                    highscore.innerHTML = score;
                }else{highscore.innerHTML = previous}
                info.classList.add('open');
                return true;

            }
    }
}

function showScore(){
    
    ctx.font = "90px Georgia";
    ctx.fillStyle = 'white';
    ctx.strokeText(score, canvas.width - 200,100)
    ctx.fillText(score, canvas.width - 200,100)

}
