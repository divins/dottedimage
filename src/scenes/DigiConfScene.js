import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
//import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import Stats from "three/examples/jsm/libs/stats.module.js";

export default class DigiConfScene {
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
  initialize(options) {
    this.threeOptions.clearColor = options.backgroundColor;

    this.initializeScene();
    this.initializeLoaders();
    this.initializeCamera();
    this.initializeTooling();
    this.initializeRenderer();
  }

  initializeScene() {
    this.loadingElement = document.querySelector(".loading");
    this.loadingElement.classList.remove("ended");
    
    this.scene = new THREE.Scene();
    this.canvas = document.querySelector("canvas.webgl");

    this.threeOptions.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    window.addEventListener("resize", this.resize.bind(this));
  }

  initializeLoaders() {
    this.loadingManager = new THREE.LoadingManager(
      () => {
        this.loadingElement.classList.add("ended");
        this.threeOptions.ready = true;
      },
      (itemUrl, itemsLoaded, itemsTotal) => {
          //const progressRatio = itemsLoaded / itemsTotal;
          itemUrl, itemsLoaded, itemsTotal
      },
      (e) => {
          console.log(e);
      }
    );

    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/assets/draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

  }

  initializeTooling() {
    this.gui = new dat.GUI({
      width: 400
    });
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set( 0, 2, 0 );
    //this.controls.target = new THREE.Vector3(0,3,-1);
    //this.controls = new PointerLockControls( this.camera, this.canvas );

    this.stats = new Stats();
    let container = document.createElement("div");
    container.setAttribute("id", "stats");
    document.body.appendChild(container);
    container.appendChild(this.stats.dom);
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio(), 0.1, 100);
    this.camera.position.x = 0;
    this.camera.position.y = 2;
    this.camera.position.z = 0.01;
    this.scene.add(this.camera);
  }

  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(
      this.threeOptions.sizes.width,
      this.threeOptions.sizes.height
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.setClearColor(this.threeOptions.clearColor);
    this.gui
      .addColor(this.threeOptions, "clearColor")
      .name("backgroundColor")
      .onChange(() => {
        this.renderer.setClearColor(this.threeOptions.clearColor);
      });
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

    this.gui.destroy();
    var statsElement = document.getElementById("stats");
    statsElement.parentNode.removeChild(statsElement);
    cancelAnimationFrame(this.requestAnimationFrameId);
  }

  /**
   * Update
   */
  tick() {
    const elapsedTime = this.clock.getElapsedTime();

    if(this.threeOptions.ready){
        // Update uTime mats uniforms
        this.material.uniforms.uTime.value = elapsedTime;
//this.matLite.uniforms.uTime.value = elapsedTime;
this.boxMat.uniforms.uTime.value = elapsedTime;
this.cylinderMat.uniforms.uTime.value = elapsedTime;
        
    }

    // Update tools
    this.stats.update();
    this.controls.update();

    // Render
    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.rtScene, this.rtCamera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);

    //this.renderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    this.requestAnimationFrameId = window.requestAnimationFrame(
      this.tick.bind(this)
    );
  }

  /**
   * Time to make things happen
   */

  startMagic() {
    this.googleFont = new FontFace('train', 'https://fonts.googleapis.com/css2?family=Train+One&display=swap');
    console.log(this.googleFont);
    this.createRenderTarget();
    this.loadScene();

    this.clock = new THREE.Clock();
    this.tick();
  }

  loadScene() {
    //this.loadLinks();
    this.loadLinks2();
    this.loadLinks3();
    this.loadModel();
  }

  roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }

  makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};
        //var fontface = parameters.fontface || "Train One";
        var fontface = this.googleFont;
        var fontsize = parameters.fontsize || 64;
        var borderThickness = parameters.borderThickness || 0;
        //var borderColor = parameters.borderColor || { r:255, g:255, b:255, a:1.0 };
        var backgroundColor = parameters.backgroundColor || { r:255, g:255, b:255, a:0.0 };
        var textColor = parameters.textColor || { r:255, g:255, b:255, a:0.0 };

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        //var metrics = context.measureText( message );
        //var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        //context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        //context.lineWidth = borderThickness;
        //this.roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        return canvas;

        /* var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;   */
    }

  createTextCanvas(text, parameters = {}){
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Prepare the font to be able to measure
    let fontSize = parameters.fontSize || 56;
    ctx.font = `${fontSize}px monospace`;
    
    const textMetrics = ctx.measureText(text);
    
    let width = textMetrics.width;
    let height = fontSize;
    
    // Resize canvas to match text size 
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    
    // Re-apply font since canvas is resized.
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = parameters.align || "center" ;
    ctx.textBaseline = parameters.baseline || "middle";
    
    // Make the canvas transparent for simplicity
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.fillStyle = parameters.color || "red";
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas;
}

  loadLinks3(){
    const cubeGeo = new THREE.BoxBufferGeometry(1,1,1)
    const cubeMat = new THREE.MeshBasicMaterial()
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat)
    cubeMesh
    //this.scene.add(cubeMesh)

    //this.canvasTexture = new THREE.Texture(this.createTextCanvas("This is text", {fontSize: 128}));
    this.canvasTexture = new THREE.Texture(this.makeTextSprite("This is text", {fontsize: 32}));
    /* texture.generateMipmaps = false;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter; */
      this.canvasTexture.needsUpdate = true;
      this.canvasGeo = new THREE.PlaneBufferGeometry(3, 0.5);
      this.canvasMat = new THREE.MeshBasicMaterial({
        transparent: true,
        alphaTest: false,
        depthTest: false,
        depthWrite: false,
        map: this.canvasTexture
      });
      this.canvasMesh = new THREE.Mesh(this.canvasGeo, this.canvasMat)

      this.scene.add(this.canvasMesh);


      this.cylinderGeo = new THREE.CylinderGeometry(.5, .5, 0.2, 128, 5, true );

      this.cylinderMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        alphaTest: false,
        //depthTest: false,
        depthWrite: false,
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
                  
          void main(){
              vec4 modelPosition = modelMatrix * vec4(position, 1.0);
              
              vec4 viewPosition = viewMatrix * modelPosition;
              vec4 projectedPosition = projectionMatrix * viewPosition;
              gl_Position = projectedPosition;

              vUv = uv;
          }
        `,
        fragmentShader: `
          varying vec2 vUv;

          uniform sampler2D uTexture;

          uniform float uTime;

          void main() {
            float time = uTime * 0.15;

            vec2 newUV = vUv;

            // Avoid the text appearing mirrored
            newUV = vec2(1.0 - newUV.x, newUV.y);

            // Repeat the texture n times
            vec2 repeat = vec2(5., 1.); // columns, rows
            //newUV = fract(newUV * repeat);
            newUV = fract(newUV * repeat + vec2(-time, 0.));
            //newUV += vec2(-time, 0.);

            // Try to scale texture
            //float scale = 1.0/0.5; // reciprocal scale
            //newUV = newUV * mat2(scale, 0., 0., scale);
            //newUV.y -= .8;

            vec4 texture = texture2D(uTexture, newUV).rgba;
            //texture *= vec3(newUV.x, newUV.y, 1.);

            gl_FragColor = vec4(texture);
            //gl_FragColor = vec4(texture, 0.);
            //gl_FragColor = vec4(vec3(0.0), 1.0);
          }
        `,
        uniforms: {
          uTime: { value: 0 },
          uTexture: { value: this.canvasTexture }
        }
      });

      this.cylinderMesh = new THREE.Mesh(this.cylinderGeo, this.cylinderMat);
      this.cylinderMesh.position.y = 2.1;
      this.scene.add(this.cylinderMesh);
  }

  createRenderTarget() {
    // Render Target setup
    this.rt = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      { 
        alpha: true,
        antialias: true
      }
    );
  
    this.rtCamera = new THREE.PerspectiveCamera(45, this.aspectRatio(), 0.1, 100);
    this.rtCamera.position.z = 3.5;
  
    this.rtScene = new THREE.Scene();
    //this.rtScene.background = new THREE.Color("#00ff00");

    //this.renderer.clearTarget(this.rt, true, true, true);
  }

  loadLinks2() {
    const fontLoader = new THREE.FontLoader()
    fontLoader.load(
        '/assets/fonts/helvetiker_regular.typeface.json',
        (font) => { 
            const color = 0xffffff;
            this.textMat = new THREE.MeshBasicMaterial( {
                color: color,
                transparent: true,
                alphaTest: 0.001,
                depthTest: false,
                depthWrite: false
                //side: THREE.DoubleSide
            } );

            const matDark = new THREE.LineBasicMaterial( {
              color: color,
              side: THREE.DoubleSide
            } );

            const shapes = font.generateShapes( "Another_link", 0.25 );
            const geometry = new THREE.ShapeGeometry( shapes );
            geometry.computeBoundingBox();
            const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
            geometry.translate( xMid, 0, 0 );
            this.text2 = new THREE.Mesh( geometry, this.textMat );
            //this.text2.position.z = -0.5;
            //this.scene.add( this.text2 );

            const holeShapes = [];

					for ( let i = 0; i < shapes.length; i ++ ) {
						const shape = shapes[ i ];
						if ( shape.holes && shape.holes.length > 0 ) {
							for ( let j = 0; j < shape.holes.length; j ++ ) {
								const hole = shape.holes[ j ];
								holeShapes.push( hole );
							}
						}
					}
					shapes.push.apply( shapes, holeShapes );
					const lineText = new THREE.Object3D();
					for ( let i = 0; i < shapes.length; i ++ ) {
						const shape = shapes[ i ];
						const points = shape.getPoints();

						const geometry = new THREE.BufferGeometry().setFromPoints( points );
						geometry.translate( xMid, 0, 0 );
						const lineMesh = new THREE.Line( geometry, matDark );
            //lineText.position.z = -0.48;

						lineText.add( lineMesh );
					}
          this.rtScene.add(lineText);
					//this.scene.add( this.text2 );

          /**
           * BOX
           */
          this.boxGeo = new THREE.CylinderGeometry(.5, .5, 0.2, 128, 5, true );

          this.boxMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            //transparent: true,
            alphaTest: false,
            //depthTest: false,
            depthWrite: false,
            vertexShader: `
              uniform float uTime;
              varying vec2 vUv;
                      
              void main(){
                  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                  
                  vec4 viewPosition = viewMatrix * modelPosition;
                  vec4 projectedPosition = projectionMatrix * viewPosition;
                  gl_Position = projectedPosition;

                  vUv = uv;
              }
            `,
            fragmentShader: `
              varying vec2 vUv;

              uniform sampler2D uTexture;

              uniform float uTime;

              void main() {
                float time = uTime * 0.15;

                // Avoid the text appearing mirrored
                vec2 invertedUv = vec2(1.0 - vUv.x, vUv.y);

                // Repeat the texture n times
                vec2 repeat = vec2(10., 1.); // columns, rows
                //vec2 uv = fract(invertedUv * repeat);
                vec2 repeatedUv = fract(invertedUv * repeat + vec2(-time, 0.));

                // Try to scale texture
                //float scale = 1.0/1.; // reciprocal scale
                //vec2 uv = repeatedUv * mat2(scale, 0.0, 0.0, scale);
                //uv.y += 0.2;

                vec3 texture = texture2D(uTexture, repeatedUv).rgb;
                //texture *= vec3(uv.x, uv.y, 1.);

                gl_FragColor = vec4(texture, 1.);
                //gl_FragColor = vec4(texture, 0.);
                //gl_FragColor = vec4(vec3(0.0), 1.0);
              }
            `,
            uniforms: {
              uTime: { value: 0 },
              uTexture: { value: this.rt.texture }
            }
          });
          

          this.boxMesh = new THREE.Mesh(this.boxGeo, this.boxMat);
          this.boxMesh.position.y = 1.8;
          this.scene.add(this.boxMesh);

          this.boxMesh2 = new THREE.Mesh(this.boxGeo, this.boxMat);
          this.boxMesh2.position.y = 2.;
          this.scene.add(this.boxMesh2);
        }
    )    
  }

  loadLinks() {
    const fontLoader = new THREE.FontLoader()
    fontLoader.load(
        '/assets/fonts/helvetiker_regular.typeface.json',
        (font) => { 
            const color = 0x006699;
            this.matLite = new THREE.MeshBasicMaterial( {
                color: color,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            } );

            const matDark = new THREE.LineBasicMaterial( {
              color: color,
              side: THREE.DoubleSide
            } );

            this.matLite = new THREE.ShaderMaterial({
                wireframe: false,
                transparent: true,
                opacity: 0.6,
                uniforms: { 
                    uTime: { value: 0.0 }                 
                },
                side: THREE.DoubleSide,
                vertexShader: `
                    uniform float uTime;
                    
                    vec2 perp(vec2 val) {
                      return vec2(-val.y, val.x);
                    }
                    void main(){
                        float PI = 3.1415925;

                        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                        
                        float frequency1 = 3.5;
                        float amplitude1 = .2;
                        float frequency2 = 2.5;
                        float amplitude2 = .7;

                        // Oscillate vertices up/down
                        //modelPosition.y += (sin(modelPosition.x * frequency1 + uTime) * 0.5 + 0.5) * amplitude1;

                        // Oscillate vertices inside/outside
                        //modelPosition.z += (sin(modelPosition.x * frequency2 + uTime) * 0.5 + 0.5) * amplitude2;


                        //modelPosition.x += tan(uTime) * 5.;
                        //modelPosition.y = modelPosition.y + tan(modelPosition.x * 0.35 + uTime * 0.5) * .6;

                        vec2 lineStart = vec2(-2.5, 0.0);
                        vec2 lineEnd = vec2(2.5, 0.0);
                        float bendFactor = -0.2;
                        vec2 lineDir = lineEnd - lineStart;
                        float lineLength = length(lineDir);
                        float circleRad = lineLength / (bendFactor * 2.0 * PI);
                        float pivot = 0.0;
                        vec2 circleCenter = lineStart + (lineEnd - lineStart) * pivot + perp(lineDir) * circleRad; 
                      
                        float angle = PI + bendFactor * (1.0 - (modelPosition.x + pivot)) * 2.0 * PI;
                        vec2 posOnCircle = circleCenter + vec2(cos(angle), sin(angle)) * circleRad;
                        modelPosition.xz = posOnCircle.xy;
                        modelPosition.x = modelPosition.x + 3.0;
                        modelPosition.z = modelPosition.z + 20.0;
                        
                        vec4 viewPosition = viewMatrix * modelPosition;
                        vec4 projectedPosition = projectionMatrix * viewPosition;
                        gl_Position = projectedPosition;
                    }
                `,
                fragmentShader: `    
                    void main(){  
                        gl_FragColor = vec4(vec3(1.0), 1.0);
                    }
                `
              })
              const shapes = font.generateShapes( "Link_to_something Link_to_something Link_to_something Link_to_something", 0.1 );
            const geometry = new THREE.ShapeGeometry( shapes );
            geometry.computeBoundingBox();
            const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
            geometry.translate( xMid, 0, 0 );
            this.text = new THREE.Mesh( geometry, this.matLite );
            this.text.position.z = -0.01;
            this.scene.add( this.text );
            this.text.position.x = 0.0;
            this.text.position.z = 0.0;
            //this.text.rotation.y = 0.25;

            const holeShapes = [];

					for ( let i = 0; i < shapes.length; i ++ ) {

						const shape = shapes[ i ];

						if ( shape.holes && shape.holes.length > 0 ) {

							for ( let j = 0; j < shape.holes.length; j ++ ) {

								const hole = shape.holes[ j ];
								holeShapes.push( hole );

							}

						}

					}

					shapes.push.apply( shapes, holeShapes );

					const lineText = new THREE.Object3D();

					for ( let i = 0; i < shapes.length; i ++ ) {

						const shape = shapes[ i ];

						const points = shape.getPoints();
						const geometry = new THREE.BufferGeometry().setFromPoints( points );

						geometry.translate( xMid, 0, 0 );

						const lineMesh = new THREE.Line( geometry, matDark );
						lineText.add( lineMesh );

					}

					this.scene.add( lineText );

            /* const textGeometry = new THREE.TextBufferGeometry(
                'Marc Divins!',
                {
                    font,
                    size: 0.5,
                    height: 0.2,
                    curveSegments: 4, // lower for better performance (initially: 12)
                    bevelEnabled: true,
                    bevelThickness: 0.03, // Changes z
                    bevelSize: 0.02, // Changes x & y
                    bevelOffset: 0,
                    bevelSegments: 3 // lower for better performance (initially: 5)
                }
            )
            textGeometry.computeBoundingBox()
            console.log(textGeometry.boundingBox)
            /*textGeometry.translate(
                -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
                -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
                -(textGeometry.boundingBox.max.z - 0.03) * 0.5
            )*/
            /* textGeometry.center()
            console.log(textGeometry.boundingBox)
            
            const material = new THREE.MeshMatcapMaterial()

            const text = new THREE.Mesh(textGeometry, material)
            this.scene.add(text) */
        }
    )
  }

  loadModel() {
    this.gltfLoader.load("/assets/models/city.glb", gltf => {
        const city = gltf.scene.children[0];

        this.threeOptions.city = {};
        this.threeOptions.city.buildingsColor = 0x444444;
        this.threeOptions.city.waveColor = 0xffffff;

        this.material = new THREE.ShaderMaterial({
            wireframe: true,
            uniforms: {
              uTime: { value: 0 },
              uCityColor: { value: new THREE.Color(this.threeOptions.city.buildingsColor) },
              uWaveColor: { value: new THREE.Color(this.threeOptions.city.waveColor) },
              uWaveLive: { value: 3.5 },
              uWaveSpeedMultiplier: { value: 1.5 },
              uWaveSlimMultiplier: { value: 3.0 }
              
            },
            side: THREE.DoubleSide,
            vertexShader: `
                uniform float uTime;

                uniform vec3 uCityColor;
                uniform vec3 uWaveColor;
                uniform float uWaveLive;
                uniform float uWaveSpeedMultiplier;
                uniform float uWaveSlimMultiplier; // The higher the slimest

                varying vec3 vColor;

                void main(){
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    float distanceToCenter = length(modelPosition.xz);
                
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;

                    // Wave generation
                    float waveStartPosition = mod(uTime * uWaveSpeedMultiplier, uWaveLive);
                    float waveStrength = 1.0 - (waveStartPosition - distanceToCenter) * 10.0/uWaveSlimMultiplier;
                    waveStrength = clamp(waveStrength, 0.0, 1.0);
                    if(distanceToCenter > waveStartPosition){ waveStrength = 0.0; }

                    // Color assignment
                    vec3 cityColor = vec3(1.0, 1.0, 1.0);
                    vColor = mix(uCityColor, uWaveColor, waveStrength);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main(){  
                    gl_FragColor = vec4(vColor, 1.0);
                }
            `
          })
        city.material = this.material;
        
        this.scene.add(city);

        this.gui.add(this.material, "wireframe")
        this.gui.addColor(this.threeOptions.city, 'buildingsColor')
            .onChange(() => {
                this.material.uniforms.uCityColor.value.set(
                    this.threeOptions.city.buildingsColor
                );
            });
        this.gui.addColor(this.threeOptions.city, 'waveColor')
            .onChange(() => {
                this.material.uniforms.uWaveColor.value.set(
                    this.threeOptions.city.waveColor
                );
            });
        this.gui.add(this.material.uniforms.uWaveLive, "value")
            .min(0.5).max(10.0).step(0.1)
            .name("Wave Live Span")
        this.gui.add(this.material.uniforms.uWaveSpeedMultiplier, "value")
            .min(0.5).max(10.0).step(0.1)
            .name("Wave Speed")
        this.gui.add(this.material.uniforms.uWaveSlimMultiplier, "value")
            .min(1.0).max(25.0).step(1.0)
            .name("Wave Area")
    });
  }
}
