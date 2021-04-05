import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import HtmlMergeSceneScroll from './HtmlMergeSceneScroll';

//import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';

import vertex from "../shaders/htmlMergeImages/vertex.glsl";
import fragment from "../shaders/htmlMergeImages/fragment.glsl";
import noise from '../shaders/htmlMergeImages/noise.glsl'


export default class HtmlMergeScene {
  constructor() {
    this.threeOptions = {};
    this.threeObjects = {
      geos: [],
      mats: [],
      meshes: []
    };
  }

  /**
   * Tools
   */
  aspectRatio() {
    return this.threeOptions.sizes.width / this.threeOptions.sizes.height;
  }

  resize() {
    // Update sizes
    this.threeOptions.sizes.width = window.innerWidth;
    this.threeOptions.sizes.height = window.innerHeight;

    // Update camera
    this.camera.aspect = this.aspectRatio();
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(
      this.threeOptions.sizes.width,
      this.threeOptions.sizes.height
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Initializers
   */
  initialize() {
    this.initializeScene();
    this.initializeCamera();
    this.initializeTooling();
    this.initializeRenderer();
    this.initializeListeners();
  }
  
  initializeListeners() {
    window.addEventListener("resize", this.resize.bind(this));
    this.mouseMovement();
  }

  initializeScene() {
    this.scene = new THREE.Scene();
    this.canvas = document.querySelector("canvas.webgl");
    //this.container = document.getElementById('container')

    this.threeOptions.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  initializeTooling() {
    this.stats = new Stats();
    let container = document.createElement("div");
    container.setAttribute("id", "stats");
    document.body.appendChild(container);
    container.appendChild(this.stats.dom);
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(70, this.aspectRatio(), 100, 2000);
    this.camera.position.z = 600;
    this.camera.fov = 2*Math.atan( (this.threeOptions.sizes.height/2)/600 )* (180/Math.PI);
  }

  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //this.container.appendChild( this.renderer.domElement );
  }

  /**
   * It's a wrap!
   */
  cleanUp() {
    this.threeObjects.geos.forEach(geo => {
      geo.dispose();
    });
    this.threeObjects.mats.forEach(mat => {
      mat.dispose();
    });
    this.threeObjects.meshes.forEach(mesh => {
      this.scene.remove(mesh);
    });

    var statsElement = document.getElementById("stats");
    statsElement.parentNode.removeChild(statsElement);
    cancelAnimationFrame(this.requestAnimationFrameId);
  }

  /**
   * Update
   */
  tick() {
    const elapsedTime = this.clock.getElapsedTime();

    this.scroll.render();
    this.previousScroll = this.currentScroll
    this.currentScroll = this.scroll.scrollToRender;
    this.setPosition();

    // Update uTime mats uniforms
    this.customPass.uniforms.scrollSpeed.value = this.scroll.speedTarget;
    this.customPass.uniforms.time.value = elapsedTime;

    this.threeObjects.mats.forEach(material => {
      material.uniforms.time.value = elapsedTime;
    })

    // Update tools
    this.stats.update();

    // Render
    this.composer.render()

    // Call tick again on the next frame
    this.requestAnimationFrameId = window.requestAnimationFrame(
      this.tick.bind(this)
    );
  }

  /**
   * Time to make things happen
   */
  startMagic() {
    /* geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( geometry, material );
    this.scene.add( cube )*/

    this.clock = new THREE.Clock();
    this.preload();
  }

  preload() {
    // Preload images
    const preloadImages = new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
    });

    let allDone = [preloadImages]

    this.currentScroll = 0;
    this.previousScroll = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    Promise.all(allDone).then(() => {
      this.scroll = new HtmlMergeSceneScroll();
      this.addImages();
      this.setPosition();

      this.mouseMovement()
      this.resize()
      this.composerPass()
      this.tick();
    })
  }

  composerPass(){
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    //custom shader pass
    this.myEffect = {
      uniforms: {
        "tDiffuse": { value: null },
        "scrollSpeed": { value: null },
        "time": { value: null },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix 
            * modelViewMatrix 
            * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        uniform float scrollSpeed;
        uniform float time;
        ${noise}
        void main(){
          vec2 newUV = vUv;
          float area = smoothstep(1.,0.8,vUv.y)*2. - 1.;
          float area1 = smoothstep(0.4,0.0,vUv.y);
          area1 = pow(area1,4.);
          float noise = 0.5*(cnoise(vec3(vUv*10.,time/5.)) + 1.);
          float n = smoothstep(0.5,0.51, noise + area/2.);
          newUV.x -= (vUv.x - 0.5)*0.1*area1*scrollSpeed;
          gl_FragColor = texture2D( tDiffuse, newUV);
        //   gl_FragColor = vec4(n,0.,0.,1.);
        gl_FragColor = mix(vec4(1.),texture2D( tDiffuse, newUV),n);
        // gl_FragColor = vec4(area,0.,0.,1.);
        }
      `
    }

    this.customPass = new ShaderPass(this.myEffect);
    this.customPass.renderToScreen = true;

    this.composer.addPass(this.customPass);
  }
    
  mouseMovement(){
    window.addEventListener( 'mousemove', (event)=>{
      this.mouse.x = ( event.clientX / this.threeOptions.sizes.width ) * 2 - 1;
      this.mouse.y = - ( event.clientY / this.threeOptions.sizes.height ) * 2 + 1;

      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera( this.mouse, this.camera );

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects( this.scene.children );

      if(intersects.length>0){
        let obj = intersects[0].object;
        obj.material.uniforms.hover.value = intersects[0].uv;
      }
    }, false );
  }

  addImages(){
    this.images = [...document.querySelectorAll('img')];

    this.material = new THREE.ShaderMaterial({
      uniforms:{
        time: {value:0},
        uImage: {value:0},
        hover: {value: new THREE.Vector2(0.5,0.5)},
        hoverState: {value: 0},
      },
      side: THREE.DoubleSide,
      fragmentShader: fragment,
      vertexShader: vertex,
    })

    this.imageStore = this.images.map(img => {
      let bounds = img.getBoundingClientRect()

      let geometry = new THREE.PlaneBufferGeometry(bounds.width,bounds.height,10,10);
      this.threeObjects.geos.push(geometry);

      let texture = new THREE.Texture(img);
      texture.needsUpdate = true;

      let material = this.material.clone();

      img.addEventListener('mouseenter',()=>{
        gsap.to(material.uniforms.hoverState,{
          duration:1,
          value:1,
          ease: "power3.out"
        })
      })
      img.addEventListener('mouseout',()=>{
        gsap.to(material.uniforms.hoverState,{
          duration:1,
          value:0,
          ease: "power3.out"
        })
      })

      this.threeObjects.mats.push(material)
      material.uniforms.uImage.value = texture;
      let mesh = new THREE.Mesh(geometry,material);
      this.threeObjects.meshes.push(mesh);
      this.scene.add(mesh)

      return {
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
      }
    })
  }

  setPosition(){
    this.imageStore.forEach(o => {
      o.mesh.position.y = this.currentScroll -o.top + this.threeOptions.sizes.height/2 - o.height/2;
      o.mesh.position.x = o.left - this.threeOptions.sizes.width/2 + o.width/2;
    })
  }
}
