import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Stats from "three/examples/jsm/libs/stats.module.js";

import firefliesVertexShader from '../shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from '../shaders/fireflies/fragment.glsl'
import portalVertexShader from '../shaders/portal/vertex.glsl'
import portalFragmentShader from '../shaders/portal/fragment.glsl'
import lampVertexShader from '../shaders/lamps/vertex.glsl'
import lampFragmentShader from '../shaders/lamps/fragment.glsl'

export default class PortalScene {
    constructor(options){
        this.message = options.message;
        console.log(this.message);
        this.threeOptions = {};
        this.threeObjects = {
            geos: [],
            mats: [],
            meshes: []
        }
    }

    /**
     * Tools
     */
     aspectRatio() {
        return this.threeOptions.sizes.width / this.threeOptions.sizes.height;
     }

     resize() {
        // Update sizes
        this.threeOptions.sizes.width = window.innerWidth
        this.threeOptions.sizes.height = window.innerHeight

        // Update camera
        this.camera.aspect = this.aspectRatio();
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.threeOptions.sizes.width, this.threeOptions.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        console.log('resize')
        // TODO
        this.firefliesMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
     }


    /**
     * Initializers
     */
     initialize() {
        this.initializeScene();
        this.initializeLoaders();
        this.initializeCamera();
        this.initializeTooling();
        this.initializeRenderer();
    }

    initializeScene() {
        this.scene = new THREE.Scene();
        this.canvas = document.querySelector('canvas.webgl')

        this.threeOptions.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        window.addEventListener('resize',this.resize.bind(this));
    }

    initializeLoaders() {
        this.textureLoader = new THREE.TextureLoader()
        this.gltfLoader = new GLTFLoader()
    }

    initializeTooling() {
        this.gui = new dat.GUI({
            width: 400
        });
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true

        this.stats = new Stats();
        let container = document.createElement("div");
        container.setAttribute("id", "stats");
        document.body.appendChild(container);
        container.appendChild(this.stats.dom);
    }

    initializeCamera() {
        this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio(), 0.1, 100)
        this.camera.position.x = 4
        this.camera.position.y = 2
        this.camera.position.z = 4
        this.scene.add(this.camera)
    }

    initializeRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.setSize(this.threeOptions.sizes.width, this.threeOptions.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.threeOptions.clearColor = "#100318"; //'#1d1920'
        this.renderer.setClearColor(this.threeOptions.clearColor)
        this.gui.addColor(this.threeOptions, 'clearColor')
            .name('backgroundColor')
            .onChange(() => { this.renderer.setClearColor(this.threeOptions.clearColor) })
    }

    /**
     * It's a wrap!
     */
    cleanUp(){
        this.threeObjects.geos.forEach( (geo) => {
            geo.dispose();
        })
        this.threeObjects.mats.forEach( (mat) => {
            mat.dispose();
        })
        this.threeObjects.meshes.forEach( (mesh) => {
            this.scene.remove(mesh);
        })

        this.gui.destroy();
        var statsElement = document.getElementById("stats");
        statsElement.parentNode.removeChild(statsElement);
        cancelAnimationFrame(this.requestAnimationFrameId);        
    }

    /**
     * Update
     */
    tick() {
        const elapsedTime = this.clock.getElapsedTime()

        // Update uTime mats uniforms
        this.firefliesMat.uniforms.uTime.value = elapsedTime;
        this.portalLightMaterial.uniforms.uTime.value = elapsedTime;
        this.poleLightMaterial.uniforms.uTime.value = elapsedTime;
        
        // Update tools
        this.stats.update();
        this.controls.update()
    
        // Render
        this.renderer.render(this.scene, this.camera)
    
        // Call tick again on the next frame
        this.requestAnimationFrameId = window.requestAnimationFrame(this.tick.bind(this));
    }

    /**
     * Time to make things happen
     */

    startMagic() {
        console.log('Let de magic happen!')
        this.fireflies();
        this.loadScene();

        this.clock = new THREE.Clock()
        this.tick();
    }

    loadScene() {
        this.prepareSceneMaterials();
        this.loadModel();
    }

    prepareSceneMaterials() {
        const bakedTexture = this.textureLoader.load(require("@/assets/textures/portalBaked.jpg"))
        bakedTexture.flipY = false
        bakedTexture.encoding = THREE.sRGBEncoding

        // Baked material
        this.bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
        this.threeObjects.mats.push(this.bakedMaterial);

        // Pole light material
        this.threeOptions.poleLight = {};
        this.threeOptions.poleLight.lampInnerColor = '#ffebc3';
        this.gui.addColor(this.threeOptions.poleLight, 'lampInnerColor')
            .name("Lamp inner color")
            .onChange(() => {
                this.poleLightMaterial.uniforms.uInnerColor.value.set(this.threeOptions.poleLight.lampInnerColor)
            });

        this.threeOptions.poleLight.lampOuterColor = '#e3a001';
        this.gui.addColor(this.threeOptions.poleLight, 'lampOuterColor')
            .name("Lamp outer color")
            .onChange(() => {
                this.poleLightMaterial.uniforms.uOuterColor.value.set(this.threeOptions.poleLight.lampOuterColor)
            });

        this.poleLightMaterial = new THREE.ShaderMaterial({
            vertexShader: lampVertexShader,
            fragmentShader: lampFragmentShader,
            uniforms: {
                uTime: { value: 0.0 },
                uInnerColor: { value: new THREE.Color(this.threeOptions.poleLight.lampInnerColor) },
                uOuterColor: { value: new THREE.Color(this.threeOptions.poleLight.lampOuterColor) }
            }
        })
        this.threeObjects.mats.push(this.poleLightMaterial);

        // Portal light material
        this.threeOptions.portal = {};
        this.threeOptions.portal.innerColor = '#240448';
        this.gui.addColor(this.threeOptions.portal, 'innerColor')
            .name("Portal inner color")
            .onChange(() => {
                this.portalLightMaterial.uniforms.uInnerColor.value.set(this.threeOptions.portal.innerColor)
            });

        this.threeOptions.portal.outerColor = '#ba73e6';
        this.gui.addColor(this.threeOptions.portal, 'outerColor')
            .name("Portal outer color")
            .onChange(() => {
                this.portalLightMaterial.uniforms.uOuterColor.value.set(this.threeOptions.portal.outerColor)
            });

        this.portalLightMaterial = new THREE.ShaderMaterial({
            vertexShader: portalVertexShader,
            fragmentShader: portalFragmentShader,
            uniforms: {
                uTime: { value: 0.0 },
                uInnerColor: { value: new THREE.Color(this.threeOptions.portal.innerColor) },
                uOuterColor: { value: new THREE.Color(this.threeOptions.portal.outerColor) }
            }
        })
        this.threeObjects.mats.push(this.portalLightMaterial);
    }

    loadModel() {
        this.gltfLoader.load(
            "/assets/models/portal.glb",
            (gltf) =>
            {
                this.scene.add(gltf.scene)
        
                // Get each object
                this.bakedMesh = gltf.scene.children.find((child) => child.name === 'baked')
                this.portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight')
                this.poleLightAMesh = gltf.scene.children.find((child) => child.name === 'lampLight1')
                this.poleLightBMesh = gltf.scene.children.find((child) => child.name === 'lampLight2')
        
                this.threeObjects.meshes.push(this.bakedMesh);
                this.threeObjects.meshes.push(this.portalLightMesh);
                this.threeObjects.meshes.push(this.poleLightAMesh);
                this.threeObjects.meshes.push(this.poleLightBMesh);
                
                // Apply materials
                this.bakedMesh.material = this.bakedMaterial
                this.portalLightMesh.material = this.portalLightMaterial
                this.poleLightAMesh.material = this.poleLightMaterial
                this.poleLightBMesh.material = this.poleLightMaterial
            }
        )        
    }

    fireflies() {
        const firefliesGeo = new THREE.BufferGeometry()
        const firefliesCount = 30
        const firefliesPositions = new Float32Array(firefliesCount * 3)
        const firefliesScales = new Float32Array(firefliesCount * 1)
        
        for (let i = 0; i < firefliesCount; i++) {
            firefliesPositions[i * 3 + 0] = (Math.random() -0.5) * 4;
            firefliesPositions[i * 3 + 1] = Math.random() * 2;
            firefliesPositions[i * 3 + 2] = (Math.random() -0.5) * 4;
        
            firefliesScales[i] = Math.random() * 2;
        }
        firefliesGeo.setAttribute('position', new THREE.BufferAttribute(firefliesPositions, 3))
        firefliesGeo.setAttribute('aScale', new THREE.BufferAttribute(firefliesScales, 1))
        
        this.firefliesMat = new THREE.ShaderMaterial({
            vertexShader: firefliesVertexShader,
            fragmentShader: firefliesFragmentShader,
            transparent: true,
            //depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0.0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uSize: { value: 100.0 }
            }
        })
        
        this.gui.add(this.firefliesMat.uniforms.uSize, 'value')
            .min(0).max(500).step(5)
            .name('firefliesSize')
        
        const firefliesMesh = new THREE.Points(firefliesGeo, this.firefliesMat)
        this.scene.add(firefliesMesh)

        this.threeObjects.geos.push(firefliesGeo);
        this.threeObjects.mats.push(this.firefliesMat);
        this.threeObjects.meshes.push(firefliesMesh);
    }
}