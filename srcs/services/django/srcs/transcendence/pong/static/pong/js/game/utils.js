import * as THREE from 'three';

//---------COSTANTS--------
export const MAXSCORE = 5;
export const MOVSPEED = 85;
export const STARTINGSPEED = 100;
export const ACCELERATION  = 2;
export const POWERUPDURATION = 2;
export const BALLTIMER = 3000;
export const BOXSIZE = 250;
export const TABLE_WIDTH = 108;
export const TABLE_HEIGHT = 54;
export const PADDLE_SIZE_X = 2.5;
export const PADDLE_SIZE_Y = 15;
export const PADDLE_SIZE_Z = 50;
export const POSITION_Z_W1 = -7;
export const POSITION_Z_W = -10;
export const MAX_SIZEY = (TABLE_HEIGHT / 2);
export const MIN_SIZEY = - (TABLE_HEIGHT / 2);
export const SWITHCH_WORLD = false;//true = world || false = world1

export const ARROWUP = 38;
export const ARROWDOWN = 40;
export const ARROWLEFT = 37;
export const ARROWRIGHT = 39;
export const W = 87;
export const S = 83;
export const A = 65;
export const D = 68;
export const SPACE = 32;
export const ONE = 49;
export const TWO = 50;

// region HELPERSs

//---------HELPERS----------

export function roundPos(pos)
{
	if (pos > 1)
		return 1;
	if (pos < 0)
		return 0;
	return pos;
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

export function truncateString(str, num) {
    if (str.length > num) {
      return str.substring(0, num) + '.';
    } else {
      return str;
    }
  }

export function timeToString(time) {
    let diffInMin = time / 60000;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");

    return `${formattedMM}:${formattedSS}`;
}

export function childCleaner(object) {
  while (object.children.length > 0) {
      let child = object.children[0];
      if (child.geometry)
        child.geometry.dispose();
      if (child.texture)
        child.texture.dispose();
      if (child.material)
      {
        if (child.material.map)
          child.material.map.dispose();
        child.material.dispose();
      }
      object.remove(child);
      if (child.children && child.children.length > 0)
        childCleaner(child);
  }
}


