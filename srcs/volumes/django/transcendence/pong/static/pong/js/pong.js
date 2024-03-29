import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

//import { randFloat, randInt } from 'three/src/math/MathUtils';

const socket = new WebSocket("wss://" + window.location.host + "/ws/game/")
// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

console.log(window.staticUrl)

var MOVSPEED = 0.9;
var BALLSPEED = 0.4;
//const protobuf = require('./protobut_pb.js');
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -10, 70); // Esempio di posizione della telecamera
//camera.position.set(70, 0, 40 );
camera.lookAt(0, 0, 0); // Focalizzazione sul centro del campo da gioco

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new OrbitControls( camera, renderer.domElement);
//var bar = new THREE.CapsuleGeometry(0.4,6);
var bar = new THREE.CylinderGeometry( 5, 5, 1, 32 );
var barMaterial =
[
	new THREE.MeshBasicMaterial( {color: 0xff} ),
	new THREE.MeshBasicMaterial( {color: 0xff0800} ),
	new THREE.MeshBasicMaterial( {color: 0xff0800} )
]
var player1 = new THREE.Mesh(bar, barMaterial);
var player2 = new THREE.Mesh(bar, barMaterial);

var sphere = new THREE.SphereGeometry(0.8, 16, 32);
var ballMaterial = new THREE.MeshPhongMaterial({color:0xf06400});
//var ballMaterial = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('earth.jpg')});


var ball = new THREE.Mesh(sphere, ballMaterial);
var directionX = 1;
var directionY = 0;

var boxsize = 500;
var box = new THREE.BoxGeometry(boxsize, boxsize, boxsize);
var cubeMaterials =
[
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_front.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_back.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_up.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_down.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_right.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_left.png"), side: THREE.DoubleSide}),
]

var cube = new THREE.Mesh(box, cubeMaterials);

const loader = new FBXLoader();
loader.load(

		// 'pingpongtable.fbx',
		window.staticUrl + 'images/pingpongtable.fbx',
		function(object){
			var table = object;
/*  			object.traverse(function(child){
				if (child instanceof THREE.Mesh) {

					if (child.name === 'PingPongTable') {
						table.add(child);
					}
				}
			}); */
			table.scale.set(0.08,0.09,0.09);
			table.rotation.set(Math.PI / 2, 0, 0);
			table.position.set(0, 0, -23.5)
			console.log(object);
			scene.add(table);
		}

)


let bordersBox = new THREE.BoxGeometry(100, 70, 15);
let bello = new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("BELLISSIMO.png"), side: THREE.DoubleSide});
let bordersMaterial =
[
/* 	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_front.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_back.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_up.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_down.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("skybox/skybox_right.png"), side: THREE.BackSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("BELLISSIMO.png"), side: THREE.BackSide}), */
	bello,
	bello,
	bello,
	bello,
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("BELLISSIMO.png"), side: THREE.BackSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load("BELLISSIMO.png"), side: THREE.BackSide}),

];
let borders = new THREE.Mesh(bordersBox, bordersMaterial);



scene.add(cube);
scene.add(player1);
scene.add(player2);
scene.add(ball)
//scene.add(borders);
cube.position.set(0, -10, 20);
player1.position.x = -45;
player2.position.x = 45;
player1.position.z = 10;
player2.position.z = 10;

player1.rotation.z = 1.5708;//radianti
player2.rotation.z = 1.5708;
ball.position.z = 10


window.addEventListener('resize', function()
{
	var width = window.innerWidth;
	var height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
})
let keys = {};
document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event) {
	keys[event.which] = true;
	inputManager();
}

function onKeyUp(event) {
	keys[event.which] = false;
}
function inputManager()
{
	if (keys[87])
		player1.position.y += MOVSPEED;
	if (keys[83])
		player1.position.y -= MOVSPEED;
	if (keys[38])
		player2.position.y += MOVSPEED;
	if (keys[40])
		player2.position.y -= MOVSPEED;
	if (keys[49])
	{
		camera.position.set(70, 0, 40 );
		camera.lookAt(0, 0, 0); // Focalizzazione sul centro del campo da gioco
		camera.rotateOnAxis(new THREE.Vector3( 0, 0, 1 ),1.57)
	}
}
let wall = new THREE.Box3().setFromObject(borders);

var posCurve = new THREE.CatmullRomCurve3(
	[
		new THREE.Vector3( -45, 0, 10 ),
		new THREE.Vector3( 0, 0, 15 ),
		new THREE.Vector3( 25, 0, 0 ),
		new THREE.Vector3( 45, 0, 13 ),
		new THREE.Vector3(50, 0, 12)
	]
)

var negCurve = new THREE.CatmullRomCurve3(
	[
		new THREE.Vector3( 45, 0, 10 ),
		new THREE.Vector3( 0, 0, 15 ),
		new THREE.Vector3( -25, 0, 0 ),
		new THREE.Vector3( -45, 0, 13 ),
		new THREE.Vector3(-50, 0, 12)
	]
)

function wallCollision(ball)
{
	if (ball.position.y > 28  || ball.position.y < -28)
		return true
	else
		return false
}


function checkCollision(object1, object2) {
    var box1 = new THREE.Box3().setFromObject(object1);
    var box2 = new THREE.Box3().setFromObject(object2);
    return box1.intersectsBox(box2);
}
//cambio colore
var currentHue = 0;
var hueIncrement = 0.001;
var saturation = 1;
var lightness = 0.5;

var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
scene.add(ambientLight);

var collision = false;

var counter = 0;
var update = function()
{
	ball.position.x += BALLSPEED * directionX;
	ball.position.y += BALLSPEED * directionY;
	ball.rotation.x -= 0.02;
	ball.rotation.y -= 0.005;
	if (checkCollision(player1, ball) && !collision)
	{
		directionX *= -1.1;
		directionY *= 1.1;
		collision = true;
	}
	if (checkCollision(player2, ball) && !collision)
	{
		directionX *= -1.1;
		directionY *= 1.1;
		collision = true;
	}
	if (wallCollision(ball, wall))
	{
		directionY *= -1;
	}
	if (ball.position.x > player2.position.x +5  || ball.position.x < player1.position.x - 5)
	{
		ball.position.x = 0;
		ball.position.y = 0;
		ball.position.z = 0;
		directionX = 1;
		directionY = 0.50;

	}
	if (collision && ball.position.x > -10 && ball.position.x < 10)
		collision = false;
/* 	var color = new THREE.Color().setHSL(currentHue, saturation, lightness);
	currentHue += hueIncrement;
	if (currentHue > 1) {         COLORE CHE CAMBIA
		currentHue -= 1;
	}
		ball.material.color = color;
	*/
/* 	if (directionX > 0 && ball.position.x > 0)
		ball.position.z += 0.1
	if (directionX > 0 && ball.position.x > 0)
		ball.position.z -= 0.1
	if (directionX < 0 && ball.position.x < 0)
		ball.position.z -= 0.1
	if (directionX < 0 && ball.position.x > 0)
		ball.position.z += 0.1 */
	if (directionX > 0 )
	{
		ball.position.z = posCurve.getPointAt((ball.position.x + 45)/100).z;
	}
	else
		ball.position.z = negCurve.getPointAt((-ball.position.x + 45)/100).z;

	if(counter % 10 == 0)
	{
		socket.send(JSON.stringify({ 'BallX': ball.position.x, 'BallY': ball.position.y }));
		console.log("posizione X:",ball.position.x);
		socket.addEventListener('message', function (event) {
			var msg = JSON.parse(event.data);
			ball.position.x = msg['BallY'];
			console.log('Message from server:', event.data);
		});		
	if (counter > 10000000)
		counter = 0;
	}
counter++;
}

var render = function()
{
	renderer.render(scene, camera);
};

var gameLoop = function()
{
	requestAnimationFrame(gameLoop);
	update();
	render();
};
gameLoop();