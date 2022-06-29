import './style.css'
import * as THREE from 'three'

const canvas = document.querySelector('canvas.webgl')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene()

// Texture
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager) 

const textures = ['sea', 'mountain', 'sun', 'galaxy']

// Objects 
const geometry = new THREE.BoxGeometry(1, 1.5, 0.02)
const objects = new THREE.Group()
const singleObjects = []
const objectDistance = 4

for (let i = 0; i < 4; i++) {
    const material = new THREE.MeshBasicMaterial({
        map: textureLoader.load(`textures/${textures[i]}.jpeg`)
    }) 

    const plane = new THREE.Mesh(geometry, material)

    // plane.position.x = 0.5 * Math.random() * (Math.random() > 0.5 ? 1 : - 1)
    // plane.position.x = 0.25 * (Math.random() > 0.5 ? 1 : - 1)
    plane.position.y = - objectDistance * i
    plane.rotation.y = 0.5 * Math.random()

    singleObjects.push(plane)
    objects.add(plane)
}
scene.add(objects)

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
})

const cursor = {
    x: 0,
    y: 0
}

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', e => {
    cursor.x = e.clientX / sizes.width
    cursor.y = - (e.clientY / sizes.height)

    mouse.x = e.clientX / sizes.width * 2 - 1
    mouse.y = - (e.clientY / sizes.height) * 2 + 1
})

let scrollY = window.scrollY

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
})


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100) 
camera.position.z = 2
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true 
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

const clock = new THREE.Clock() 
let oldElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime
    
    const raycaster = new THREE.Raycaster()
    
    const rayOrigin = new THREE.Vector3(0, - 5, 0)
    const rayDirection = new THREE.Vector3(0, 20, 0) 
    rayDirection.normalize()
    
    raycaster.set(rayOrigin, rayDirection)
    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(singleObjects)
    // console.log(intersects)

    for (const intersect of intersects) {
        if (intersect.object.id === 6 || intersect.object.id === 8) {
            intersect.object.rotation.y += (- 0.5 - intersect.object.rotation.y) * deltaTime * 2
        } else {
            intersect.object.rotation.y += (0.5 - intersect.object.rotation.y) * deltaTime * 2
        }
    }

    for (const object of singleObjects) {
        if (!intersects.find(intersect => intersect.object === object)) {
            object.rotation.y -= object.rotation.y * deltaTime * 2
        } 
    }

    camera.position.y = - scrollY / sizes.height * objectDistance 
    
    objects.position.x += (cursor.x - objects.position.x) * deltaTime * 2
    objects.position.y += (cursor.y - objects.position.y) * deltaTime * 2
    objects.rotation.y = Math.sin(elapsedTime) * 0.2

    renderer.render(scene, camera) 

    window.requestAnimationFrame(tick) 
}

tick() 