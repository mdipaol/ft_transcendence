import *as UTILS from './Utils.js';
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { Match } from './Match.js';
import { World } from './World.js';


export class Bot extends Player{ 
    constructor(paddle){
        super(paddle);

        this.destinationY = 0
    }
}

export class MatchBot extends Match {
    constructor(world) { 
        super(world);
        // this.player2 = new Bot(world.paddle);
        // this.bot = new Bot(world.paddle);
        // this.bot1 = new Bot(world.paddle);
        this.bot2 = this.player2;
        this.activeBot1 = false;
        this.activeBot2 = false;
        let timer_start = 0;
        const time_end = false;
        let animationFrame = null;

        this.time_update = new Date();
    }

    timer(){
        this.time_end = false;
        setInterval(updateTimer(), 1000);
    }

    updateTimer(){
        this.timer_start++;
        if(this.timer_start >= 1){
            this.time_end = true;
        }
        else{
            this.time_end = false;
        }
    }
    
    // Esempio di utilizzo
    // const vettoreA = [1, 2];
    // const vettoreB = [3, 4];
    
    // const angolo = angleBetweenVectors(vettoreA, vettoreB);
    // console.log("Angolo in radianti:", angolo);
    

    pointPrediction(){
        //l  = 108 
        //h  = 27

        let directionX = this.ball.direction.x;
        let directionY = this.ball.direction.y;
        let startPosition = [this.ball.mesh.position.x + 54, this.ball.mesh.position.y + 27];//ci greppiamo la posizione della palla
        
        if (directionY == 0)
            return (startPosition[1] - 27);
        
        let alpha = UTILS.angleBetweenVectors([Math.abs(directionX), Math.abs(directionY)], [1, 0]);
        
        let firstDeltaX = 0;
        let midDeltaX = 0;
        let iterator = startPosition[0];
        
        if (directionY > 0)
            firstDeltaX = (54 - startPosition[1]) * Math.tan( (Math.PI / 2 ) - alpha )
        else
            firstDeltaX = (startPosition[1]) * Math.tan( (Math.PI / 2 ) - alpha )

        midDeltaX = 54 * Math.sin( (Math.PI / 2 ) - alpha )

        iterator = startPosition[0] + firstDeltaX;
        let collisions = false;
        let numberOfCollisions = 0;
        while(iterator < 108){
            iterator += midDeltaX;
            collisions = true;
            numberOfCollisions++;
        }

        if (collisions){
            console.log("collisions detected");
            iterator -= midDeltaX;
            numberOfCollisions--;
            let finalDirectionSign = 1;
            if (numberOfCollisions % 2)
                finalDirectionSign = directionY * (-1);
            let destinationY = (108 - iterator) * Math.tan(alpha);
            if (finalDirectionSign > 0)
                return (startPosition[1] + destinationY) - 27;
            else
                return (startPosition[1] - destinationY) - 27;
        }
        else {
            console.log("no collisions");
            iterator -= firstDeltaX;
            numberOfCollisions = 0;
            let destinationY = (108 - iterator) * Math.tan(alpha);
            if (directionY > 0)
                return (startPosition[1] + destinationY) - 27;
            else
                return (startPosition[1] - destinationY) - 27;
        }
        
        console.log("FINE");
        return(0);
    }
    
    updateMovements() {
        if (this.player1.moves.up && this.player1.mesh.position.y < UTILS.MAX_SIZEY)
		{
            this.player1.mesh.position.y += this.player1.speed;
            //requestAnimationFrame(this.updateMovements().bind(this));
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
		}
		if (this.player1.moves.down && this.player1.mesh.position.y > UTILS.MIN_SIZEY)
		{
			this.player1.mesh.position.y -= this.player1.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
        }
        if (this.bot2.mesh.position.y < this.bot2.destinationY && this.bot2.mesh.position.y < UTILS.MAX_SIZEY){
            this.bot2.mesh.position.y += this.bot2.speed;
            if (Math.abs( this.bot2.mesh.position.y - this.bot2.destinationY ) < 0.5)
                this.bot2.mesh.position.y = this.bot2.destinationY;
        }
        else if (this.bot2.mesh.position.y > this.bot2.destinationY  && this.bot2.mesh.position.y > UTILS.MIN_SIZEY){
            this.bot2.mesh.position.y -= this.bot2.speed;
            if (Math.abs( this.bot2.mesh.position.y - this.bot2.destinationY ) < 0.5)
                this.bot2.mesh.position.y = this.bot2.destinationY;
        }
	}

    updateMovementsBot(){
        //formula per calcorare la direzione della pallina all'estremità del tavolo  
        // if(this.time_end == true){
        //     if(this.bot1 && this.activeBot1 == true){
        //         if(this.bot1.position.mesh.y > this.ball.position.mesh.y){
        //             this.bot1.position.mesh.y -= UTILS.MOVSPEED;
        //         }
        //         else if(this.bot1.position.mesh.y < this.ball.position.mesh.y){
        //             this.bot1.position.mesh.y += UTILS.MOVSPEED;
        //         }
        //     }
        //     if(this.bot2 && this.activeBot2 == true){
        //         if(this.bot2.position.mesh.y > this.ball.position.mesh.y){
                    
        //             this.bot2.position.mesh.y -= UTILS.MOVSPEED;
        //         }
        //         else if(this.bot2.position.mesh.y < this.ball.position.mesh.y){
                    
        //             this.bot2.position.mesh.y += UTILS.MOVSPEED;
        //         }
        //     }
        // }

        if (((new Date()) - this.time_update) < 1000)
            return ;

        this.time_update = new Date();

        if (this.ball.direction.x < 0){
            this.bot2.destinationY = 0;
            return
        }

        // this.bot2.destinationY = this.ball.mesh.position.y;

        this.bot2.destinationY = (this.pointPrediction());
        console.log("destination: " + this.bot2.destinationY);

        // const distance = Math.abs(this.bot2.mesh.position.y - this.ball.mesh.position.y)

        // if (this.bot2.mesh.position.y - this.ball.mesh.position.y < 0 && (distance > 0.1))
        // {
        //     this.bot2.moves.up = true
        //     this.bot2.moves.down = falses
        // }
        // else if (this.bot2.mesh.position.y - this.ball.mesh.position.y > 0 && (distance > 0.1))
        // {
        //     this.bot2.moves.up = false
        //     this.bot2.moves.down = true
        // }
        // else
        // {
        //     this.bot2.moves.up = false
        //     this.bot2.moves.down = false
        // }

/*         if(!UTILS.checkCollision(this.bot2.mesh, this.ball.mesh) && this.collision){
            if(this.bot2.mesh.position.y > 0){
                this.bot2.moves.down = true;
            }
            else if(this.bot2.mesh.position.y < 0){
                this.bot2.moves.up = true;
            }
            else{
                this.bot2.moves.down = false;
                this.bot2.moves.up = false;
            }
        } */
        /* if(!UTILS.checkCollision(this.bot1.mesh, this.ball.mesh) && this.collision){
            if(this.bot1.position.y > 0){
                this.bot1.position.y -= UTILS.MOVSPEED;
            }
            else if(this.bot1.position.y < 0){
                this.bot1.position.y += UTILS.MOVSPEED;
            }
        } */
/*         if(UTILS.checkCollision(this.bot1, this.ball) && !this.collision){
            this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.bot1.mesh.position.y)/10;
			const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];
			this.collision = true;
			this.updateExchanges();
			this.handlePowerUp(this.bot1);
			this.addPowerUp();
            this.timer_start = 0;
        }
        if(UTILS.checkCollision(this.bot2.mesh, this.ball.mesh) && !this.collision){
            this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.bot2.mesh.position.y)/10;
			const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];
			this.collision = true;
			this.updateExchanges();
			this.handlePowerUp(this.bot2);
			this.addPowerUp();
            this.timer_start = 0;
        } */
    }
}

