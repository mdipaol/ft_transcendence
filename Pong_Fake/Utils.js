import * as THREE from 'three';

//---------COSTANTS--------
export const MAXSCORE = 500;
export const MOVSPEED = 0.8;
export const STARTINGSPEED = 1;//speed ball
export const ACCELERATION  = 2;
export const POWERUPDURATION = 2;
export const BOXSIZE = 250;
export const TABLE_HEIGHT = 54;
export const TABLE_WIDTH = 108;
export const MAX_SIZEY = 27
export const MIN_SIZEY = -27
export const SWITHCH_WORLD = true;//true = world || false = world1

// region HELPERSs

//---------HELPERS----------
export function change_wold(a){
    return(a);
}

export function roundPos(pos)
{
	if (pos > 1)
		return 1;
	if (pos < 0)
		return 0;
	return pos;
}


export function setSound(path, setLoop, setVolume){
    return new Promise((resolve, reject) => {
        const listener = new THREE.AudioListener();
        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        
        audioLoader.load(path, function(buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(setLoop);
            sound.setVolume(setVolume);
            sound.play();
            
            resolve(sound);
        }, undefined, function(error) {
            reject(error);
        });
    });
}

export function angleBetweenVectors(a, b) {
    // Calcola il prodotto scalare
    const dotProduct = a[0] * b[0] + a[1] * b[1];
    
    // Calcola le norme dei vettori
    const normA = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    const normB = Math.sqrt(b[0] * b[0] + b[1] * b[1]);
    
    // Calcola il coseno dell'angolo
    const cosTheta = dotProduct / (normA * normB);
    
    // Calcola l'angolo in radianti
    const angleInRadians = Math.acos(cosTheta);
    
    return angleInRadians;
}

export function rotateVector(x, y, angle) {
  const radians = angle * (Math.PI / 180);

  const cosTheta = Math.cos(radians);
  const sinTheta = Math.sin(radians);

  // Rotation matrix
  const newX = x * cosTheta - y * sinTheta;
  const newY = x * sinTheta + y * cosTheta;

  return { x: newX, y: newY };
}

export function normalizeVector(vector) {
    const [x, y] = vector;

    const magnitude = Math.sqrt((x * x) + (y * y));

    if (magnitude === 0) {
        throw new Error("Cannot normalize a zero vector");
    }

    const normalizedVector = [
        x / magnitude,
        y / magnitude,
    ];

    return normalizedVector;
}

export function wallCollision(ball)
{
	if (ball.mesh.position.y > 28  || ball.mesh.position.y < -28)
		return true
	else
		return false
}

export function checkCollision(object1, object2) {
    var box1 = new THREE.Box3().setFromObject(object1);
    var box2 = new THREE.Box3().setFromObject(object2);
    return box1.intersectsBox(box2);
}

export function checkPowerUpCollision(ball, powerUp){
	if (ball.position.x <= 3 && ball.position.x >= -3){
		if (Math.abs(ball.position.y - powerUp.position.y) <= 3){
			return true;
		}
	}
	return false;
}
