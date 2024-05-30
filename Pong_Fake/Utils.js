import * as THREE from 'three';

//---------COSTANTS--------
export const MAXSCORE = 3;
export const MOVSPEED = 1;
export const STARTINGSPEED = 1;
export const ACCELERATION  = 2;
export const POWERUPDURATION = 2;
export const BOXSIZE = 250;

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
