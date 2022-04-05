const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor( 0xB7C3F3, 1 );

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

// Global variables
const start_position = 4;
const end_position = -start_position;

const text = document.querySelector('.text');
const startBtn = document.querySelector('.start-btn');

const TIME_LIMIT = 15;
let gameStat = "loading";
let isLookingBackward = true;

//musics
const bgMusic = new Audio('./music/music_bg.mp3');

const createCube = (size, positionX, rotationY = 0, color = 0xfbc851) => {
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotationY;
    scene.add( cube );
    return cube
}

camera.position.z = 5;


// Instantiate a loader for a model
const loader = new THREE.GLTFLoader();

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Doll {
    constructor() {
        loader.load("../models/scene.gltf", (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(.4, .4, .4);
            gltf.scene.position.set(0, -1, 0);
            this.doll = gltf.scene;
        })
    }

    //Methods of doll
    lookBackward() {
        gsap.to(this.doll.rotation, { y: -3.15, duration: .45 })
        setTimeout(() => {
            isLookingBackward = true
        }, 150)
    }

    lookForward() {
        gsap.to(this.doll.rotation, { y: 0, duration: .45 })
        setTimeout(() => {
            isLookingBackward = false
        }, 450)
    }

    async start() {
        this.lookBackward()
        await delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await delay((Math.random() * 750) + 750)
        this.start()
    }
}

const createTrack = () => {
    createCube({w: start_position * 2 + .4, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1;
    createCube({w: .2, h: 1.5, d: 1}, start_position, -.45);
    createCube({w: .2, h: 1.5, d: 1}, end_position, .45);
    
}

createTrack();


class Player {
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1
        sphere.position.x = start_position
        scene.add( sphere );
        this.player = sphere
        this.playerInfo = {
            positionX: start_position,
            velocity: 0,
        }
    }

    run() {
        this.playerInfo.velocity = .03
    }

    stop() {
        gsap.to(this.playerInfo, { velocity: 0, duration: .1 })
    }

    check() {
         if (this.playerInfo.velocity > 0 && !isLookingBackward) {       
             text.innerText = "You Lose"
             gameStat = "over"
             startBtn.disabled = false;
         }
         if (this.playerInfo.positionX < end_position + .4) {
             text.innerText = "You Win"
             gameStat = "over"
             startBtn.disabled = false;
         }
    }

    update() {
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }
}

const player = new Player();

let doll = new Doll();

const begining = async () => {
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "Go!!!"
    startBtn.disabled = true
    startGame()
}

const startGame = () => {
    gameStat = "started"
    const progressBar = createCube({w: 5, h: .1, d: 1}, 0, 0, 0xebaa12)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, { x: 0, duration: TIME_LIMIT, ease: "none" })
    doll.start()
    setTimeout(() => {
         if (gameStat !== "over") {
             text.innerText = "You ran out of time";
             gameStat = "over"
             startBtn.disabled = false;
         }
    }, TIME_LIMIT * 1000);
}


const animate = () => {
    if (gameStat === "over" ) return 
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    player.update()
}

animate();

window.addEventListener('keydown', (e) => {
    if (gameStat !== "started") return 
    if (e.key === "ArrowUp") {
        player.run()
    }
})

window.addEventListener('keyup', (e) => {
    if (e.key === "ArrowUp") {
        player.stop()
    }
})

startBtn.addEventListener('click', () => {
    if (gameStat === "over" || gameStat === "loading") {
        begining()
    }
})

window.addEventListener('resize', onWindowResize, false)

function onWindowResize ()  {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
}

