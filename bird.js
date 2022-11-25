class Bird{
    constructor(imgsrc, maxFramesX = 1,maxFramesY = 1,scale = 1){
        this.x = 250;
        this.y = 200;
        this.vy = 0;
        
        this.weight = 0.1  ;
        this.maxFramesX = maxFramesX;
        this.maxFramesY = maxFramesY;
        this.framesCurrentX = 0
        this.framesCurrentY = 0
        this.framesElapsed = 0
        this.framesHold = 5
        this.image = new Image();
        this.image.src = imgsrc
        this.scale = scale
        this.width = 30//(this.image.width/this.maxFramesX) * this.scale//20;
        this.height = 30//(this.image.height/this.maxFramesY) * this.scale//20;
        this.offsetx = 15
        this.offsety = 20

    }
    update(){
        bird.draw2();
        //bird.draw();
        this.framesElapsed++
        if(this.framesElapsed % this.framesHold === 0){
    
        
        if(this.framesCurrentX < this.maxFramesX-1)
            {this.framesCurrentX++ }
            else{ this.framesCurrentX = 0;
                    
            }
        if(this.framesCurrentY < this.maxFramesY && this.framesCurrentX == 0)
            {this.framesCurrentY++ }
            else {this.framesCurrentY = 0
            }
        }
        

        let curve = Math.sin(angle)*20;
        if (this.y > canvas.height - (this.height*2) + curve){
            this.y = canvas.height- (this.height*2) + curve;
            this.vy = 0;

        }else {

        this.vy += this.weight;
        this.y += this.vy;
        }
        if(this.y < 0 + this.height){
            this.y = 0 + this.height;
            this.vy =0;
        }
        if (spacePressed && this.y > this.height * 2 ) this.flap();
    
    }
    draw(){
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x,this.y,this.width,this.height);

    }
    draw2(){
        ctx.drawImage(
            this.image,                                                         //image
            this.framesCurrentX * (this.image.width /this.maxFramesX),          //sx
            this.framesCurrentY * (this.image.height / this.maxFramesY),        //sy
            //0,                                                                 //sy
            this.image.width / this.maxFramesX,                                  //swidth
            this.image.height / this.maxFramesY,                                 //sheight
            (this.x - this.offsetx),                                                             //dx - x.position
            (this.y - this.offsety),                                                             //dy - y.position
            (this.image.width / this.maxFramesX) * this.scale,                   //dwidth
            (this.image.height / this.maxFramesY) * this.scale                 //dheight
            )
            
    }
    flap(){
        this.vy -=.4;

    }
}
const bird = new Bird('bird5x4.png',5,3,0.75);
