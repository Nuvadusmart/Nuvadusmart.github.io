const obstaclesArray = [];

class Obstacle {
    constructor(){
        this.top = (Math.random()* canvas.height/2.5  )+20;
        this.bottom = (Math.random()* canvas.height/2.3 )+20;
        this.x = canvas.width;
        this.width = Math.random()*50+20;
        this.color = 'hsl('+ hue + ', 100%, 50% )';
        this.counted = false;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,0,this.width,this.top);
        ctx.fillRect(this.x,canvas.height - this.bottom,this.width, this.bottom);

    }
    update(){
        this.x -= gamespeed; //direction of travel inverse.. scrolling backgroundish
        if(!this.counted && this.x < bird.x){
            score++;
            this.counted = true;
        }
        this.draw();
    }

}

function handleObstacles(speed){
    
    if (frame % (30-speed) ===0){
        obstaclesArray.unshift(new Obstacle);
    }
    for (let i = 0; i < obstaclesArray.length;i++){
        obstaclesArray[i].update();
        if (obstaclesArray[i].x < 0) obstaclesArray.pop(obstaclesArray[i]);
    }
    //if (obstaclesArray.length > 20){
   // if  
    //obstaclesArray.pop(obstaclesArray[0]); //remove from end of array. far left.

    //}
}

function clearObstacles(){
    for(let i=0;1< obstaclesArray.length;i++){
        obstaclesArray.pop(obstaclesArray[i]);
    }
}