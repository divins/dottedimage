import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

import vertexShader from "../shaders/scatter/vertex.glsl";
import fragmentShader from "../shaders/scatter/fragment.glsl";

class ScatterModel {
    constructor (obj) {
        this.isActive = false;
        this.inTransition = false;
        this.name = obj.name;
        this.file = obj.file;
        this.scene = obj.scene;
        this.placeOnLoad = obj.placeOnLoad;
        this.color1 = obj.color1;
        this.color2 = obj.color2;
        this.background = obj.background;

        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('/assets/draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        this.init();
    }

    init() {
        this.loader.load(this.file, (response) => {
            /*------------------------------
            Original Mesh
            ------------------------------*/
            this.mesh = response.scene.children[0];

            /*------------------------------
            Material Mesh
            ------------------------------*/
            this.material = new THREE.MeshBasicMaterial({
                color: 'red',
                wireframe: true
            })
            this.mesh.material = this.material;

            /**
             * Particles Geometry
             */
            const sampler = new MeshSurfaceSampler(this.mesh).build();
            const numParticles = 20000;
            this.particlesGeometry = new THREE.BufferGeometry();
            const particlesPosition = new Float32Array(numParticles * 3);
            const particlesRandomness = new Float32Array(numParticles * 3);

            for (let i = 0; i < numParticles; i++) {
                const newPosition = new THREE.Vector3();
                sampler.sample(newPosition);
                particlesPosition.set([
                    newPosition.x,
                    newPosition.y,
                    newPosition.z
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
                    uScale: { value: 0.0 }
                },
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })

            /**
             * Geometry mesh
             */
            this.geometry = this.mesh.geometry;
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
        });
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

export default ScatterModel;