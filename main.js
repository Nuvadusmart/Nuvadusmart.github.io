const canvas = document.getElementById('canvas1');

ctx = canvas.getContext('2d')
const DEBUG = document.getElementById('debug');
canvas.width = document.documentElement.clientWidth-200
canvas.height = document.documentElement.clientHeight -200

const info = document.getElementById('infoscreen');
const yes = document.getElementById('yesbtn');

info.toggleClass('open');
yes.addEventListener('click',function(){
    info.toggleClass('open')
})


let spacePressed = false;
let enterPressed = false;
let angle = 0;
let hue = 0;
let frame = 0;
let framesElapsed = 0;

let score = 0;
let gamespeed = 4;



function animate(){
    let lastupdate = new Date();
    
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width,canvas.height);
    //ctx.fillRect(10,temp,50,50);
    bird.update();
    handleCollisions();
    
    
    
    handleParticles();
    handleObstacles();
    showScore();
    if(handleCollisions()) return; //jump out of animloop;
    setInterval(requestAnimationFrame(animate) , 1000/60)
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

animate();



window.addEventListener('keydown',function(e){
    console.log(e.code);
    if(e.code ==='Space') spacePressed = true;
    if(e.code ==='Enter') this.location.reload(true)
    

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
