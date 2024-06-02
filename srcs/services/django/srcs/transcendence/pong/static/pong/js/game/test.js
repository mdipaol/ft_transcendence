import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

/*
tree js model
1) come si caricano
2) come allegire le mesh 
3) 
*/

// Scene
const scene = new THREE.Scene()


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


// Costants

const BOXSIZE = 500

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Add canvas element?
document.body.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 70);
camera.lookAt(0, 0, 0);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(ambientLight);

const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff0000, // Colore rosso per l'illuminazione
    emissiveIntensity: 1000 // Intensità dell'illuminazione
});
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Skybox
const skyVik = window.staticUrl + "images/skybox_vik/"
const box = new THREE.BoxGeometry(BOXSIZE, BOXSIZE, BOXSIZE);
const cubeMaterials = [
    new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load(skyVik + "brick.jpeg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load(skyVik + "brick.jpeg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load(skyVik + "brick.jpeg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load(skyVik + "brick.jpeg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load(skyVik + "floor.jpeg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map : new THREE.TextureLoader().load(skyVik + "floor.jpeg"), side: THREE.DoubleSide}), //up
]
const cube = new THREE.Mesh(box, cubeMaterials);

// Sphere
const sphere = new THREE.SphereGeometry(0.8, 16, 32);
const ballMaterial = new THREE.MeshPhongMaterial({color:0xf06400});
const ball = new THREE.Mesh(sphere, material);
scene.add(ball);

const ball2 = new THREE.Mesh(sphere, material);
ball2.position.set(10, 0, 0);
scene.add(ball2)

// Point light
const light = new THREE.PointLight( 0xff0000, 10, 100 );
light.position.set(0, 0, 10);
scene.add(light);
const pointLight = new THREE.PointLight(0x00ff00, 10); // Colore verde, intensità 0.5
pointLight.position.set(0, 0, 0); // Posizione della luce
scene.add(pointLight);

const controls = new OrbitControls( camera, renderer.domElement);

window.addEventListener('resize', function()
{
    var width = window.innerWidth;
	var height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
})

renderer.render(scene, camera);