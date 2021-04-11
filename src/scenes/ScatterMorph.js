import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

import vertexShader from "../shaders/scatter/vertex.glsl";
import fragmentShader from "../shaders/scatter/fragment.glsl";

class ScatterMorph {
    constructor (obj) {
        this.isActive = false;
        this.inTransition = false;
        this.name = obj.name;
        this.aFile = obj.aFile;
        this.bFile = obj.bFile;
        this.cFile = obj.cFile;
        this.scene = obj.scene;
        this.placeOnLoad = obj.placeOnLoad;
        this.color1 = obj.color1;
        this.color2 = obj.color2;
        this.background = obj.background;
        this.gui = obj.gui;

        this.loadingManager = new THREE.LoadingManager(
            () => {
              //this.loadingElement.classList.add("ended");
              console.log('loaded');
              this.init();
            },
            (itemUrl, itemsLoaded, itemsTotal) => {
                //const progressRatio = itemsLoaded / itemsTotal;
                itemUrl, itemsLoaded, itemsTotal
            },
            () => {
                console.log("error");
            }
        );
        this.loader = new GLTFLoader(this.loadingManager);
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('/assets/draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        //this.init();
        this.loadModels();
    }

    loadModels() {
        this.loader.load(this.aFile, (response) => {
            this.aMesh = response.scene.children[0];
        });
        this.loader.load(this.bFile, (response) => {
            this.bMesh = response.scene.children[0];
        });
        this.loader.load(this.cFile, (response) => {
            console.log(response.scene)
            this.cMesh = response.scene.children[0];
        });
    }

    init() {
        /*------------------------------
        Material Mesh
        ------------------------------*/
        this.material = new THREE.MeshBasicMaterial({
            color: 'red',
            wireframe: true
        })
        this.aMesh.material = this.material;

        /**
         * Particles Geometry
         */
        const numParticles = 200000;

        const sampler = new MeshSurfaceSampler(this.aMesh).build();
        this.particlesGeometry = new THREE.BufferGeometry();
        const particlesPosition = new Float32Array(numParticles * 3);

        const sampler2 = new MeshSurfaceSampler(this.bMesh).build();
        const particlesPosition2 = new Float32Array(numParticles * 3);

        const sampler3 = new MeshSurfaceSampler(this.cMesh).build();
        const particlesPosition3 = new Float32Array(numParticles * 3);

        const particlesRandomness = new Float32Array(numParticles * 3);

        for (let i = 0; i < numParticles; i++) {
            const newPosition = new THREE.Vector3();
            sampler.sample(newPosition);
            particlesPosition.set([
                newPosition.x,
                newPosition.y,
                newPosition.z
            ], i * 3)

            const newPosition2 = new THREE.Vector3();
            sampler2.sample(newPosition2);
            particlesPosition2.set([
                newPosition2.x,
                newPosition2.y,
                newPosition2.z
            ], i * 3)

            const newPosition3 = new THREE.Vector3();
            sampler3.sample(newPosition3);
            particlesPosition3.set([
                newPosition3.x,
                newPosition3.y,
                newPosition3.z
            ], i * 3)

            particlesRandomness.set([
                Math.random() * 2.0 - 1.0, // -1 to 1
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0
            ], i * 3)
        }
        this.particlesGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(particlesPosition, 3)
        );
        this.particlesGeometry.setAttribute(
            'bPosition',
            new THREE.BufferAttribute(particlesPosition2, 3)
        );
        this.particlesGeometry.setAttribute(
            'cPosition',
            new THREE.BufferAttribute(particlesPosition3, 3)
        );
        this.particlesGeometry.setAttribute(
            'aRandomness',
            new THREE.BufferAttribute(particlesRandomness, 3)
        );
        /**
         * Particles material
         */
        /* this.particlesMaterial = new THREE.PointsMaterial({
            color: 'green',
            size: 0.02
        }); */
        this.particlesMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uColor1: { value: new THREE.Color(this.color1) },
                uColor2: { value: new THREE.Color(this.color2) },
                uTime: { value: 0.0 },
                uScale: { value: 0.0 },
                uMorph: { value: 0.0 }
            },
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })

        this.gui.add(this.particlesMaterial.uniforms.uMorph, "value")
            .min(0.0).max(20.0).step(0.01)
            .name("Morphing")

        /**
         * Geometry mesh
         */
        this.geometry = this.aMesh.geometry;
        /**
         * Particles
         */
        //this.particles = new THREE.Points(this.geometry, this.particlesMaterial);
        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);

        /**
         * Place on Load
         */
        if (this.placeOnLoad) {
            this.add();
        }
    }

    add() {
        //this.scene.add(this.mesh);
        if (!this.isActive && !this.inTransition) {
            this.scene.add(this.particles);
            this.isActive = true;
            this.inTransition = true;
            
            gsap.to(this.particlesMaterial.uniforms.uScale, {
                value: 1,
                delay: 0.5,
                duration: 0.8,
                ease: 'power3.out',
                onComplete: () => {
                    this.inTransition = false;
                }
            })

            gsap.fromTo(this.particles.rotation, {
                y: Math.PI
            }, {
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
            });

            gsap.to('body', {
                background: this.background,
                duration: 0.8
            })
        }
    }

    remove() {
        //this.scene.remove(this.mesh);
        if (this.isActive && !this.inTransition) {
            this.inTransition = true;
            
            gsap.to(this.particlesMaterial.uniforms.uScale, {
                value: 0,
                duration: 0.8,
                ease: 'power3.out',
                onComplete: () => {
                    this.scene.remove(this.particles);
                    this.isActive = false;
                    this.inTransition = false;
                }
            })

            gsap.to(this.particles.rotation, {
                y: Math.PI,
                duration: 0.8,
                ease: 'power3.out'
            })
        }
    }
}

export default ScatterMorph;