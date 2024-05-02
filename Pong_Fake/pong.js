import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//---------LOADERS----------
var paddle = null;
async function loadObject() {
    return new Promise((resolve, reject) => {
        var mtlLoader = new MTLLoader();
        mtlLoader.load('paddle/paddle.mtl', function (materials) {
            materials.preload();
			// materials.materials. = 0

            var objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('paddle/paddle.obj', function (object) {
				paddle = object;
				paddle.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.computeVertexNormals();
                    }
                });
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
		'pingpongtable.fbx',
		function(object){
			var table = object;
			table.children[0].visible = false;
			table.children[2].visible = false;
			table.children[5].visible = false;
			table.children[3].visible = false;
			table.scale.set(0.08,0.09,0.09);
			table.rotation.set(Math.PI / 2, 0, 0);
			table.position.set(0, 0, -23.5);
			//console.log(table);
			scene.add(table);
		}

)


var text;
const floader = new FontLoader();
const font = floader.load(
	// resource URL
	'Beauty.json',

	// onLoad callback
	function ( font ) {
		// do something with the font
		const geometry = new TextGeometry( 'PONG', {
			font: font,
			size: 30,
			height: 1,

		});
		//viola
		const emissive_color = 0xA020F0;
		const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
		text = new THREE.Mesh( geometry, material );
		//ruotare di 90 gradi
		text.rotation.set (Math.PI/2, Math.PI/2, 0);
		text.position.set(-125, -32, 40)
		const neonLight = new THREE.PointLight(emissive_color, 15, 100000000, 0.6);
		// const neonLight= new THREE.SpotLight(emissive_color, 15, 100000000, Math.PI/4, 0, 0.5)
		neonLight.position.set(-110, 0, 50);

		const neon2 = neonLight.clone()
		const text2 = text.clone()
		text2.scale.x = -text2.scale.x;
		text2.position.set(0,0,0);
		text2.position.set(124, 32, 40)
		neon2.position.set(110, 0, 50);

		scene.add(neonLight);
		scene.add(neon2);
		scene.add(text2);
		scene.add(text);

	},

	// onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( err );
	}
);


//---------CONSTANTS----------
const MOVSPEED = 0.7;
let BALLSPEED = 0.5;
const ACCELERATION = 1.1;
const BOXSIZE = 250;

//---------SCENE----------
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -10, 70);
camera.lookAt(0, 0, 0);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls( camera, renderer.domElement);
//controls.enablePan = false;

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
const wall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("mattone.png"), side: THREE.DoubleSide});
const rotatedWall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973,  map: (() =>
	{
	const texture = new THREE.TextureLoader().load("mattone.png");
	texture.center.set(0.5, 0.5); // Centra la texture
	texture.rotation = Math.PI/ 2; // Ruota la texture di 45 gradi in senso orario (in radianti)
	return texture;
})(), side: THREE.DoubleSide})

const wood = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("wood.png"), side: THREE.DoubleSide});
var cubeMaterials =
[
	rotatedWall,
	rotatedWall,
	wall,
	wall,
	wood,
	wood
]
//cubeMaterials[0].rotation = Math.PI/2;
var cube = new THREE.Mesh(box, cubeMaterials);

var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
const spotLight = new THREE.SpotLight( 0xE03918,15, 325, 500, 1, 0.3);
spotLight.position.set( 0, 0, 227 );
const axesHelper = new THREE.AxesHelper(100);
//scene.add(spotLight);
scene.add(axesHelper);

const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );


const posterGeometry = new THREE.PlaneGeometry( 53.85, 68.35 );
const posterMaterial = new THREE.MeshPhongMaterial( {map:  new THREE.TextureLoader().load("escape_room.jpg") , side: THREE.DoubleSide} );
const poster = new THREE.Mesh( posterGeometry, posterMaterial );
poster.rotation.set(Math.PI/2, 0, 0);
poster.position.set(0, 124.5, 45);
scene.add( poster );

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
cube.position.set(0, 0, 102)
player1.position.x = -54;
player2.position.x = 54;
player1.position.z = -10;
player2.position.z = -10;
player1.rotation.z = 1.5708;//radianti
player2.rotation.z = 1.5708;
ball.position.z = 10
player1.rotation.z = 1.5708 * 3;


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

let P1upKey = 87;
let P1downKey = 83;
let P2upKey = 38;
let P2downKey = 40;


function onKeyDown(event) {
	if (event.which == P1upKey) //w key
		p1Moves.up = true;
	if (event.which == P1downKey) //s key
		p1Moves.down = true;
	if (event.which == P2upKey) //up arrow
		p2Moves.up = true;
	if (event.which == P2downKey) //down arrow
		p2Moves.down = true;

	if (event.which == 50)//first person with '2' key
	{
		camera.position.set(75, 0, 40 );
		camera.lookAt(0, 0, 0);
		camera.rotateOnAxis(new THREE.Vector3( 0, 0, 1 ),1.57)
		controls.enabled = false
		P1upKey = 68;
		P1downKey = 65;
		P2upKey = 39;
		P2downKey = 37;
	}
	if (event.which == 49)//first person with '1' key
	{
		camera.position.set(-75, 0, 40 );
		camera.lookAt(0, 0, 0);
		camera.rotateOnAxis(new THREE.Vector3( 0, 0, -1 ),1.57);
		controls.enabled = false;
		P1upKey = 65;
		P1downKey = 68;
		P2upKey = 37;
		P2downKey = 39;
	}
	if (event.which == 32)
	{
		camera.position.set(0, -10, 70);
		camera.lookAt(0, 0, 0);
		controls.update();
		controls.enabled = true;
		P1upKey = 87;
		P1downKey = 83;
		P2upKey = 38;
		P2downKey = 40;
	}
}

function onKeyUp(event) {
	if (event.which == P1upKey)
		p1Moves.up = false;
	if (event.which == P1downKey)
		p1Moves.down = false;
	if (event.which == P2upKey)
		p2Moves.up = false;
	if (event.which == P2downKey)
		p2Moves.down = false;
}


function updateMovements()
{
	if (p1Moves.up && player1.position.y < 27)
	{
		player1.position.y += MOVSPEED;
		//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
	}
	if (p1Moves.down && player1.position.y > -27)
	{
		player1.position.y -= MOVSPEED;
		//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
	}
	if (p2Moves.up && player2.position.y < 27)
	{
		player2.position.y += MOVSPEED;
		//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
	}
	if (p2Moves.down && player2.position.y > -27)
	{
		player2.position.y -= MOVSPEED;
		//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
	}
}

//---------COLLISIONS----------


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
//scene.add(spotLight);
// scene.add(ambientLight);


//---------WEBSOCKET----------
/*
const socket = new WebSocket(
	'wss://'
	+ window.location.host
	+ '/ws'
	+ window.location.pathname
)

socket.addEventListener('message', function (event) {
	//console.log("ciao")
	var msg = JSON.parse(event.data);
	//console.log()
	if (msg.type == "game_message")
	{
		//player1.position.y = msg.message.player_one.y;
		//player2.position.y = msg.message.player_two.y;
	}
	else if (msg.type == "game_start")
	{
		console.log("game started")
		started = true;
	}
	else if (msg.type == "game_end")
	{
		console.log("game ended")
		started = false;
	}
});

*/

//---------UPDATE AND RENDER----------
var update = function()
{
	updateMovements()
	ball.position.x += BALLSPEED * directionX;
	ball.position.y += BALLSPEED * directionY;
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
		player1.position.y = 0;
		player2.position.y = 0;
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
	renderer.render(scene, camera);
};

var gameLoop = function()
{
	requestAnimationFrame(gameLoop);
	update();
	render();
};
gameLoop();

