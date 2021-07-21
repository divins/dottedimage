import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { PixelShader } from "three/examples/jsm/shaders/PixelShader.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";

export default class PostProcessingComposer {
  constructor(params) {
    // "Saving" params
    this.scene = params.scene;
    this.camera = params.camera;
    this.sizes = {};
    this.sizes.width = params.sizes.width;
    this.sizes.height = params.sizes.height;
    this.sizes.pixelRatio = params.renderer.getPixelRatio();

    // Render target
    let RenderTargetClass = null;

    if (params.renderer.getPixelRatio() === 1 && params.renderer.capabilities.isWebGL2) {
      RenderTargetClass = THREE.WebGLMultisampleRenderTarget;
    } else {
      RenderTargetClass = THREE.WebGLRenderTarget;
    }

    const renderTarget = new RenderTargetClass(800, 600, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      encoding: THREE.sRGBEncoding
    });
    // Composer
    this.effectComposer = new EffectComposer(params.renderer, renderTarget);
    this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.effectComposer.setSize(params.sizes.width, params.sizes.height);

    // Passes
    this.renderPass = new RenderPass(params.scene, params.camera);
    this.effectComposer.addPass(this.renderPass);
  }

  resize(width, height){
    this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.effectComposer.setSize(
      width,
      height
    );
  }
    
  addSMAAPass(renderer) {
    // Remember that passes have an order, we want to apply antialsing the last
    if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
      const smaaPass = new SMAAPass();
      this.effectComposer.addPass(smaaPass);
    }
  }

  addDotScreenPass(gui, isEnabled = false) {
    const dotScreenPass = new DotScreenPass();
    dotScreenPass.enabled = isEnabled;
    this.effectComposer.addPass(dotScreenPass);

    gui.add(dotScreenPass, "enabled")
      .name("Enable Dotted Screen");
  }

  addGlitchPass(gui, isEnabled = false) {
    const glitchPass = new GlitchPass();
    glitchPass.enabled = isEnabled;
    this.effectComposer.addPass(glitchPass);

    gui.add(glitchPass, "enabled")
      .name("Enable Glitch");
  }

  addRGBShiftPass(gui, isEnabled = false) {
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    //rgbShiftPass.uniforms.amount.value = 0.0025;
    rgbShiftPass.enabled = isEnabled;
    this.effectComposer.addPass(rgbShiftPass);

    const rgbShiftFolder = gui.addFolder("RGB Shift");
    rgbShiftFolder.add(rgbShiftPass, "enabled")
      .name("Enable RGB Shift");
    rgbShiftFolder.add( rgbShiftPass.uniforms.amount, "value")
      .min(0).max(1).step(0.0001)
      .name("Amount")
      .listen();
    rgbShiftFolder.add( rgbShiftPass.uniforms.amount, "value")
      .min(0).max(0.1).step(0.0001)
      .name("Grained amount")
      .listen();        
  }

    addUnrealBloomPass(gui, isEnabled = false) {
        const unrealBloomPass = new UnrealBloomPass();
        unrealBloomPass.enabled = isEnabled;
        this.effectComposer.addPass(unrealBloomPass);
        unrealBloomPass.strength = 0.3;
        unrealBloomPass.radius = 1;
        unrealBloomPass.threshold = 0.6;

        const unrealBloomFolder = gui.addFolder("Unreal Bloom");
        unrealBloomFolder.add(unrealBloomPass, "enabled")
            .name("Enable Unreal Bloom");
        unrealBloomFolder.add(unrealBloomPass, "strength")
          .min(0).max(2).step(0.001);
        unrealBloomFolder.add(unrealBloomPass, "radius")
          .min(0).max(2).step(0.001);
        unrealBloomFolder.add(unrealBloomPass, "threshold")
          .min(0).max(1).step(0.001);
    }

    addTintPass(gui, isEnabled = false) {
        const TintShader = {
            uniforms: {
              tDiffuse: { value: null },
              uTint: { value: null }
            },
            vertexShader: `
              varying vec2 vUv;
              void main()
              {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vUv = uv;
              }
            `,
            fragmentShader: `
              uniform sampler2D tDiffuse;
              uniform vec3 uTint;
              varying vec2 vUv;
              void main()
              {
                vec4 color = texture2D(tDiffuse, vUv);
                color.rgb += uTint;
                gl_FragColor = color;
              }
            `
        };
        const tintPass = new ShaderPass(TintShader);
        //tintPass.material.uniforms.uTint.value = new THREE.Color(0x00000)
        tintPass.material.uniforms.uTint.value = new THREE.Vector3();
        tintPass.enabled = isEnabled;
        this.effectComposer.addPass(tintPass);

        const tintFolder = gui.addFolder("Tint");
        tintFolder.add(tintPass, "enabled")
            .name("Enable Tint Change");
        tintFolder.add(tintPass.material.uniforms.uTint.value, "x")
        .min(-1).max(1).step(0.001)
        .name("red");
        tintFolder.add(tintPass.material.uniforms.uTint.value, "y")
        .min(-1).max(1).step(0.001)
        .name("green");
        tintFolder.add(tintPass.material.uniforms.uTint.value, "z")
        .min(-1).max(1).step(0.001)
        .name("blue");
    }

    addDisplacementPass(gui, isEnabled = false) {
        const DisplacementShader = {
            uniforms: {
              tDiffuse: { value: null },
              uTime: { value: 0.0 }
            },
            vertexShader: `
              varying vec2 vUv;
              void main()
              {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vUv = uv;
              }
            `,
            fragmentShader: `
              uniform sampler2D tDiffuse;
              uniform float uTime;
              varying vec2 vUv;
              void main()
              {
                vec2 newUv = vec2(
                  vUv.x,
                  vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1
                );
                vec4 color = texture2D(tDiffuse, newUv);
                gl_FragColor = color;
              }
            `
        };
        const displacementPass = new ShaderPass(DisplacementShader);
        displacementPass.enabled = isEnabled;
        this.effectComposer.addPass(displacementPass);

        gui.add(displacementPass, "enabled")
            .name("Enable Displacement");        
    }

    addFuturisticPass(gui, textureLoader, isEnabled = false) {
        const FuturisticShader = {
            uniforms: {
              tDiffuse: { value: null },
              uNormalMap: { value: null }
            },
            vertexShader: `
              varying vec2 vUv;
              void main()
              {
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  vUv = uv;
              }
            `,
            fragmentShader: `
              uniform sampler2D tDiffuse;
              uniform sampler2D uNormalMap;
              varying vec2 vUv;
              void main()
              {
                  /* vec4 normalMapColor = texture2D(uNormalMap, vUv);
                  gl_FragColor = normalMapColor; */
                  vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
                  vec2 newUv = vUv + normalColor.xy * 0.1;
                  vec4 color = texture2D(tDiffuse, newUv);
                  vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
                  float lightness = dot(normalColor, lightDirection);
                  //gl_FragColor = vec4(vec3(lightness), 1.0);
                  lightness = clamp(lightness, 0.0, 1.0);
                  color.rgb += lightness * 2.0;
                  gl_FragColor = color;
              }
            `
        };
        const futuristicPass = new ShaderPass(FuturisticShader);
        futuristicPass.enabled = isEnabled;
        futuristicPass.material.uniforms.uNormalMap.value = textureLoader.load(
            require("@/assets/textures/interfaceNormalMap.png")
        );
        this.effectComposer.addPass(futuristicPass);
        
        gui.add(futuristicPass, "enabled")
            .name("Enable Futuristic Frame");        
    }

    addPixelPass(gui, isEnabled = false) {
        const pixelPass = new ShaderPass(PixelShader);
        pixelPass.uniforms["resolution"].value = new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        );
        pixelPass.uniforms["resolution"].value.multiplyScalar(
          window.devicePixelRatio
        );
        pixelPass.uniforms.pixelSize.value = 4;
        pixelPass.enabled = isEnabled;
        this.effectComposer.addPass(pixelPass);
  
        const pixelFolder = gui.addFolder("Pixelator");
        pixelFolder.add(pixelPass, "enabled")
            .name("Enable Pixelator");
        pixelFolder.add(pixelPass.uniforms.pixelSize, "value")
          .min(1).max(32).step(1)
          .name("pixelSize");        
    }

    addCRTPass(gui, isEnabled = false) {
        const CRTShader = {
            uniforms: {
              tDiffuse: { value: null },
              uCurvature: { value: new THREE.Vector2(3.5, 3.0) },
              screenResolution: { value: new THREE.Vector2(320, 240) },
              scanLineOpacity: { value: new THREE.Vector2(0.5, 0.5) },
              vignetteOpacity: { value: 0.5 },
              brightness: { value: 2.1 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main()
                {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    vUv = uv;
                }
            `,
            fragmentShader: `
                #define PI 3.1415926535897932384626433832795
                uniform sampler2D tDiffuse;
                uniform vec2 uCurvature;
                uniform vec2 screenResolution;
                uniform vec2 scanLineOpacity;
                uniform float vignetteOpacity;
                uniform float brightness;
                varying vec2 vUv;
                vec2 curveRemapUV(vec2 uv)
                {
                    // as we near the edge of our screen apply greater distortion using a cubic function
                    vec2 newUV = uv.xy * 2.0 - 1.0;
                    vec2 offset = abs(newUV.yx) / vec2(uCurvature.x, uCurvature.y);
                    newUV += newUV * offset * offset;
                    newUV = newUV * 0.5 + 0.5;
                    return newUV;
                }
                vec4 scanLineIntensity(float uv, float resolution, float opacity)
                {
                    float intensity = sin(uv * resolution * PI * 2.0);
                    intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;
                    return vec4(vec3(pow(intensity, opacity)), 1.0);
                }
                vec4 vignetteIntensity(vec2 uv, vec2 resolution, float opacity)
                {
                    float intensity = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
                    return vec4(vec3(clamp(pow((resolution.x / 4.0) * intensity, opacity), 0.0, 1.0)), 1.0);
                }
                void main()
                {
                    vec2 remappedUV = curveRemapUV(vUv);
                    vec4 baseColor = texture2D(tDiffuse, remappedUV);
                    baseColor *= vignetteIntensity(remappedUV, screenResolution, vignetteOpacity);
                    baseColor *= scanLineIntensity(remappedUV.x, screenResolution.y, scanLineOpacity.x);
                    baseColor *= scanLineIntensity(remappedUV.y, screenResolution.x, scanLineOpacity.y);
                    
                    baseColor *= vec4(vec3(brightness), 1.0);
                    if (remappedUV.x < 0.0 || remappedUV.y < 0.0 || remappedUV.x > 1.0 || remappedUV.y > 1.0){
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                    } else {
                        gl_FragColor = baseColor;
                    }
                }
            `
        };
        const crtPass = new ShaderPass(CRTShader);
        crtPass.enabled = isEnabled;
        this.effectComposer.addPass(crtPass);

        const crtFolder = gui.addFolder("Old TV (CRT)");
        crtFolder.add(crtPass, "enabled")
            .name("Enable CRT Pass");
        crtFolder.add(crtPass.material.uniforms.uCurvature.value, "x")
        .min(-1).max(10).step(0.1)
        .name("CurvatureX");
        crtFolder.add(crtPass.material.uniforms.uCurvature.value, "y")
        .min(-1).max(10).step(0.1)
        .name("CurvatureY");
        crtFolder.add(crtPass.material.uniforms.scanLineOpacity.value, "x")
        .min(-1).max(10).step(0.1)
        .name("scanLineOpacityX");
        crtFolder.add(crtPass.material.uniforms.scanLineOpacity.value, "y")
        .min(-1).max(10).step(0.1)
        .name("scanLineOpacityY");
        crtFolder.add(crtPass.material.uniforms.vignetteOpacity, "value")
        .min(-1).max(1).step(0.01)
        .name("vignetteOpacity");
        crtFolder.add(crtPass.material.uniforms.brightness, "value")
        .min(-1).max(5).step(0.01)
        .name("brightness");        
    }

    addBokehPass(gui, isEnabled = false) {
      const bokehPass = new BokehPass(
        this.scene,
        this.camera,
        {
          focus: 2.0,
          aperture: 0.003,
          maxblur: 0.005,
          width: this.sizes.width * this.sizes.pixelRatio,
          height: this.sizes.height * this.sizes.pixelRatio
        }
      );
      bokehPass.enabled = isEnabled;
      this.effectComposer.addPass(bokehPass);

      gui.add(bokehPass, "enabled")
        .name("Enable Bokeh");
      gui.add(bokehPass.materialBokeh.uniforms.focus, "value")
        .min(0).max(10).step(0.1)
        .name("Focus");
      gui.add(bokehPass.materialBokeh.uniforms.aperture, "value")
        .min(0).max(0.1).step(0.0001)
        .name("Aperture");
      gui.add(bokehPass.materialBokeh.uniforms.maxblur, "value")
        .min(0).max(0.05).step(0.0001)
        .name("Max Blur");
    }
}
