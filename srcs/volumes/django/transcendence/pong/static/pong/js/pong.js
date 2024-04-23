
//---------IMPORTS----------
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

//---------LOADERS----------
var paddle = null;
async function loadObject() {
    return new Promise((resolve, reject) => {
        var mtlLoader = new MTLLoader();
        mtlLoader.load(window.staticUrl + 'images/paddle/paddle.mtl', function (materials) {
            materials.preload();

            var objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(window.staticUrl + 'images/paddle/paddle.obj', function (object) {
				paddle = object;
                resolve(); // Risolve la promessa con l'oggetto caricato
            }, null, reject); // Reindirizza gli eventuali errori al reject della promessa
        });
    });
}
await loadObject().then(() => {
	console.log("oggetto caricato");
});

const loader = new FBXLoader();
loader.load(
		window.staticUrl + 'images/pingpongtable.fbx',
		function(object){
			var table = object;
			table.children[0].visible = false;
			table.children[2].visible = false;
			table.children[5].visible = false;
			table.scale.set(0.08,0.09,0.09);
			table.rotation.set(Math.PI / 2, 0, 0);
			table.position.set(0, 0, -23.5)
			scene.add(table);
		}
)

//---------CONSTANTS----------
const MOVSPEED = 0.7;
let BALLSPEED = 0.5;
const ACCELERATION = 1.1;
const BOXSIZE = 500;

//---------SCENE----------
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -10, 70);
camera.lookAt(0, 0, 0);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls( camera, renderer.domElement);

window.addEventListener('resize', function()
{
	var width = window.innerWidth;
	var height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
})

//---------OBJECTS----------
var sphere = new THREE.SphereGeometry(0.8, 16, 32);
var ballMaterial = new THREE.MeshPhongMaterial({color:0xf06400});
var ball = new THREE.Mesh(sphere, ballMaterial);


var box = new THREE.BoxGeometry(BOXSIZE, BOXSIZE, BOXSIZE);
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

var ambientLight = new THREE.AmbientLight(0xFFFFFF, 5);

var posCurve = new THREE.CatmullRomCurve3(
	[
		new THREE.Vector3( -45, 0, 10 ),
		new THREE.Vector3( 0, 0, 15 ),
		new THREE.Vector3( 25, 0, -0.1 ),
		new THREE.Vector3( 54, 0, 8 ),
		new THREE.Vector3(65, 0, 12)
	]
)

var negCurve = new THREE.CatmullRomCurve3(
	[
		new THREE.Vector3( 45, 0, 10 ),
		new THREE.Vector3( 0, 0, 15 ),
		new THREE.Vector3( -25, 0, -1 ),
		new THREE.Vector3( -54, 0, 8 ),
		new THREE.Vector3(-65, 0, 12)
	]
)

//---------OBJECTS INIT----------
var player1 = paddle.clone();
var player2 = paddle.clone();
var directionX = 1;
var directionY = 0;
var collision = false;
cube.position.set(0, -10, 20);
player1.position.x = -54;
player2.position.x = 54;
player1.position.z = -10;
player2.position.z = -10;
player1.rotation.z = 1.5708;//radianti
player2.rotation.z = 1.5708;
ball.position.z = 10


//---------MOVEMENTS----------

let p1Moves = {
	up: false,
	down:false
}
let p2Moves = {
	up: false,
	down:false
}

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);


function onKeyDown(event) {
	if (event.which == 87)
		p1Moves.up = true;
	if (event.which == 83)
		p1Moves.down = true;
	if (event.which == 38)
		p2Moves.up = true;
	if (event.which == 40)
		p2Moves.down = true;

	if (event.which == 49)//first person with '1' key
	{
			camera.position.set(75, 0, 40 );
			camera.lookAt(0, 0, 0);
			camera.rotateOnAxis(new THREE.Vector3( 0, 0, 1 ),1.57)

			var boxball = new THREE.Box3().setFromObject(ball);
			var boxpaddle = new THREE.Box3().setFromObject(player1);
			console.log(boxball);
			console.log(boxpaddle);
	}
}

function onKeyUp(event) {
	if (event.which == 87)
		p1Moves.up = false;
	if (event.which == 83)
		p1Moves.down = false;
	if (event.which == 38)
		p2Moves.up = false;
	if (event.which == 40)
		p2Moves.down = false;
}


function updateMovements()
{
	if (p1Moves.up && player1.position.y < 27)
	{
		SuperPlayer.position.y += MOVSPEED;
		socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
	}
	if (p1Moves.down && player1.position.y > -27)
	{
		SuperPlayer.position.y -= MOVSPEED;
		socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
	}
	/*
	if (SuperPlayer === player2){
			if (SuperPlayer.position.y < ball.position.y)
				p2Moves.up = true;
			else if (SuperPlayer.position.y > ball.position.y)
				p2Moves.down = true;
	}
*/
	if (p2Moves.up && player2.position.y < 27)
	{
		SuperPlayer.position.y += MOVSPEED;
		socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
	}
	if (p2Moves.down && player2.position.y > -27)
	{
		SuperPlayer.position.y -= MOVSPEED;
		socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
	}
	/*
	if (SuperPlayer === player2){
		p2Moves.down = false;
		p2Moves.up = false;
	}
	*/
}

//---------COLLISIONS-----------


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

function roundPos(pos)
{
	if (pos > 1)
		return 1;
	if (pos < 0)
		return 0;
	return pos;
}

//---------SCENE ADD----------
scene.add(cube);
scene.add(player1);
scene.add(player2);
scene.add(ball)
scene.add(ambientLight);


//---------WEBSOCKET----------
const socket = new WebSocket(
	'wss://'
	+ window.location.host
	+ '/ws/game/'
)
let started = false;
let SuperPlayer = null
socket.addEventListener('message', function (event) {
	var msg = JSON.parse(event.data);
	//console.log(msg)
	if (msg.type == "game_message")
	{
		player1.position.y = msg.message.player_one.y;
		player2.position.y = msg.message.player_two.y;
		ball.position.x = msg.message.ball.x;
		ball.position.y = msg.message.ball.y;
	}
	else if (msg.type == "game_start")
	{
		console.log("game started")
		console.log(msg.player)
		if (msg.player == "player_one") 
			SuperPlayer = player1;
		else if (msg.player == "player_two")
			SuperPlayer = player2;
		started = true;
	}
	else if (msg.type == "game_end")
	{
		console.log("game ended")
		if (msg.message.player_one.score > msg.message.player_two.score)
			console.log("Player One WINS")
		else
			console.log("Player Two WINS")
		started = false;
	}
});


//---------UPDATE AND RENDER----------
var update = function()
{
	updateMovements()
	/*ball.position.x += BALLSPEED * directionX;
	ball.position.y += BALLSPEED * directionY;*/
	if (checkCollision(player1, ball) && !collision)
	{
		if (BALLSPEED < 2)
			BALLSPEED *= ACCELERATION;
		directionX *= -1;
		directionY = (ball.position.y - player1.position.y)/10;
		collision = true;
	}
	if (checkCollision(player2, ball) && !collision)
	{
		if (BALLSPEED < 2)
			BALLSPEED *= ACCELERATION;
		directionX *= -1;
		directionY = (ball.position.y - player2.position.y)/10;
		collision = true;
	}
	if (wallCollision(ball))
		directionY *= -1;
	//Reset positions
	if (ball.position.x > player2.position.x +5  || ball.position.x < player1.position.x - 5)
	{
		ball.position.x = 0;
		ball.position.y = 0;
		ball.position.z = 0;
		//player1.position.y = 0;
		BALLSPEED = 0.5;
		directionX = 1;
		directionY = 0;
	}
	if (collision && ball.position.x > -10 && ball.position.x < 10)
		collision = false;
	if (directionX > 0 )
		ball.position.z = posCurve.getPointAt(roundPos((ball.position.x + 45)/100)).z;
	else
		ball.position.z = negCurve.getPointAt(roundPos((-ball.position.x + 45)/100)).z;
}

var render = function()
{
	if (started)
		renderer.render(scene, camera);
};

var gameLoop = function()
{
	requestAnimationFrame(gameLoop);
	update();
	render();
};
gameLoop();