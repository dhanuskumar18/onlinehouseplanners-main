// components/Grayscale3DPage.js
"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import {
  Center,
  Environment,
  PerspectiveCamera,
  useGLTF,
  ContactShadows,
} from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { ScrambleTextPlugin } from "gsap/all";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

// Post-processing imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader';
import Footer from "./TitleTextAnimation";

// Extend Three.js with post-processing effects
extend({ EffectComposer, RenderPass, ShaderPass });

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrambleTextPlugin);

// Post-processing component for grayscale effect
function Effects() {
  const composer = useRef();
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    composer.current = new EffectComposer(gl);
    composer.current.addPass(new RenderPass(scene, camera));

    // Add grayscale effect
    const effectGray = new ShaderPass(LuminosityShader);
    composer.current.addPass(effectGray);
  }, [gl, scene, camera]);

  useFrame(() => {
    composer.current.render();
  }, 1);

  return null;
}

function HouseModel({ position = [-2, 0, 1], scale = 0.2 }) {
  const { scene } = useGLTF("/models/familyhouse1.glb");
  const houseRef = useRef();

  // Apply grayscale materials to all meshes and enable shadows
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        child.material = new THREE.MeshStandardMaterial({
          color: 0x808080,
          roughness: 0.7,
          metalness: 0.3,
          envMapIntensity: 1.0
        });
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      ref={houseRef}
      scale={scale}
      position={position}
      castShadow
    />
  );
}

export default function LandingPage() {
  const cameraRef = useRef();
  const containerRef = useRef();
  const textRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(null);

  const h1Ref = useRef(null);
  const keyFeaturesTextRef = useRef(null);
  const aboutTextRef = useRef(null);
  const logoTitleRef = useRef(null);
  const exploreTextRef = useRef(null);

  useLayoutEffect(() => {
    const h1 = h1Ref.current;
    const text = h1.textContent;
    h1.textContent = '';

    // Split the text into words and wrap each word in a span (for rolling effect)
    const words = text.split(' ').map((word, i, arr) => {
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.marginRight = '0.25em';
      wrapper.style.verticalAlign = 'bottom';
      wrapper.style.height = '1em';

      // The rolling word (starts below, rolls up)
      const rolling = document.createElement('span');
      rolling.style.display = 'inline-block';
      rolling.style.transform = 'translateY(120%)';
      rolling.textContent = word;
      wrapper.appendChild(rolling);
      h1.appendChild(wrapper);
      return rolling;
    });

    // GSAP rolling animation for each word (repeat forever)
    gsap.to(words, {
      y: '0%',
      duration: 0.1,
      stagger: 0.1,
      ease: 'back.out(1.7)',
      repeat: -1,
      yoyo: true,
      repeatDelay: 1
    });
  }, []);

  useGSAP(
    () => {
      const t2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".secondSection",
          start: "start 30%",
          end: "bottom 70%",
          scrub: true,
          pin: true,
        },
      });

      t2.fromTo(".secondSection", { opacity: 0 }, { opacity: 1 });
      t2.to(".secondSection", { opacity: 0 });

      const t1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".firstSection",
          start: "80% center",
          end: "bottom top",
          scrub: true,
          pin: true,
        },
      });

      t1.fromTo(".firstSection", { opacity: 1 }, { opacity: 0 });

      const headingAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: ".heading",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      headingAnimation.from(".heading", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
      });
    },
    { scope: containerRef.current }
  );

  const sectionRefs = useRef([]);

  useEffect(() => {
    sectionRefs.current.forEach((section) => {
      const wrapper = section.querySelector(".wrapper");
      const items = wrapper.querySelectorAll(".item");

      const direction = section.classList.contains("horizontal-section")
        ? "horizontal"
        : "vertical";

      initScroll(section, items, direction);
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.globalTimeline.clear();
    };
  }, []);

  const initScroll = (section, items, direction) => {
    items.forEach((item, index) => {
      if (index !== 0) {
        direction === "horizontal"
          ? gsap.set(item, { xPercent: 100 })
          : gsap.set(item, { yPercent: 100 });
      }
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: "top top",
        end: `+=${items.length * 100}%`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    items.forEach((item, index) => {
      if (direction === "vertical") {
        timeline.to(item, {
          yPercent: 0,
          scale: 0.9,
          borderRadius: "10px",
          duration: 1,
        });
      } else {
        timeline.to(item, {
          xPercent: 0,
          scale: 0.9,
          borderRadius: "10px",
          duration: 1,
        });
      }
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        if (cameraRef.current) {
          if (self.progress < 0.6) {
            const angle = self.progress * Math.PI * 6;
            const radius = 16;
            cameraRef.current.position.x = Math.sin(angle) * radius;
            cameraRef.current.position.z = Math.cos(angle) * radius;
            cameraRef.current.position.y = 3;
            cameraRef.current.rotation.set(0, 0, 0);
          } else if (self.progress < 0.8) {
            const topViewProgress = (self.progress - 0.4) / 0.2;
            cameraRef.current.position.y = 3 + (17 * topViewProgress);
            cameraRef.current.rotation.x = -(Math.PI / 2) * topViewProgress;
            cameraRef.current.rotation.y = Math.PI * 2 * topViewProgress;
            cameraRef.current.position.x = 0;
            cameraRef.current.position.z = 0;
          }
          else {
            const returnProgress = (self.progress - 0.8) / 0.2;
            cameraRef.current.position.y = 20 - (17 * returnProgress);
            cameraRef.current.rotation.x = -(Math.PI / 2) * (1 - returnProgress);
            cameraRef.current.rotation.y = Math.PI * 2 * (1 - returnProgress);
            const angle = returnProgress * Math.PI * 6;
            const radius = 16;
            cameraRef.current.position.x = Math.sin(angle) * radius;
            cameraRef.current.position.z = Math.cos(angle) * radius;
          }
          cameraRef.current.lookAt(0, 0, 0);
        }
      },
    });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addToRefs = (el) => {
    if (el && !textRefs.current.includes(el)) {
      textRefs.current.push(el);
    }
  };

  useEffect(() => {
    const contentBlocks = document.querySelectorAll('.content-block');

    contentBlocks.forEach((block, index) => {
      gsap.from(block, {
        scrollTrigger: {
          trigger: block,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        delay: index * 0.2,
        ease: "power3.out"
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // --- Add refs for grid text ---
  const gridSectionRef = useRef(null);
  const gridTextRefs = useRef([]);

  // Helper to add refs for grid <p> elements
  const addGridTextRef = (el) => {
    if (el && !gridTextRefs.current.includes(el)) {
      gridTextRefs.current.push(el);
    }
  };

  // GSAP split and animate for grid section
  useEffect(() => {
    if (!gridSectionRef.current) return;
    const paragraphs = gridTextRefs.current;
    paragraphs.forEach((p) => {
      // Split by word
      const words = p.textContent.split(' ').map((word, i, arr) => {
        const span = document.createElement('span');
        span.innerHTML = word + (i < arr.length - 1 ? '&nbsp;' : '');
        span.style.display = 'inline-block';
        span.style.opacity = 0;
        return span;
      });
      p.innerHTML = '';
      words.forEach((span) => p.appendChild(span));
      // Animate in with GSAP when section in view
      gsap.to(words, {
        scrollTrigger: {
          trigger: gridSectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reset',
        },
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
      });
    });
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (keyFeaturesTextRef.current) {
      gsap.from(keyFeaturesTextRef.current, {
        scrollTrigger: {
          trigger: keyFeaturesTextRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }
  }, []);

  useEffect(() => {
    if (aboutTextRef.current) {
      gsap.fromTo(
        aboutTextRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 100,
          duration: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: aboutTextRef.current,
            start: "top 100%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    if (logoTitleRef.current) {
      const el = logoTitleRef.current;
      // Create a shiny effect overlay
      let shine = document.createElement('span');
      shine.className = 'shine-effect';
      shine.style.position = 'absolute';
      shine.style.top = 0;
      shine.style.left = 0;
      shine.style.width = '100%';
      shine.style.height = '100%';
      shine.style.pointerEvents = 'none';
      shine.style.background = 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)';
      shine.style.transform = 'translateX(-100%) skewX(-20deg)';
      shine.style.mixBlendMode = 'screen';
      shine.style.transition = 'none';
      shine.style.zIndex = 2;
      shine.style.borderRadius = 'inherit';
      shine.style.filter = 'blur(0.5px)';
      shine.style.opacity = '0.7';
      el.style.position = 'relative';
      el.appendChild(shine);
      gsap.to(shine, {
        x: '120%',
        duration: 1.2,
        repeat: -1,
        ease: 'power2.inOut',
        delay: 0.5,
        repeatDelay: 1.5,
        onStart: () => {
          shine.style.opacity = '0.7';
        },
        onRepeat: () => {
          shine.style.opacity = '0.7';
        }
      });
    }
  }, []);

  useEffect(() => {
    if (exploreTextRef.current) {
      gsap.fromTo(
        exploreTextRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: exploreTextRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    if (loading) {
      // Animate the loader circle
      gsap.fromTo(
        "#loader-circle",
        { strokeDashoffset: 251.2, rotate: 0 },
        {
          strokeDashoffset: 0,
          rotate: 360,
          duration: 1.2,
          ease: "power2.inOut",
          repeat: -1,
          transformOrigin: "50% 50%",
        }
      );
      // Simulate loading (replace with real loading logic if needed)
      const timer = setTimeout(() => {
        // Fade out loader
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.6,
          onComplete: () => setLoading(false),
        });
      }, 2000); // 2 seconds, adjust as needed
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const servicesSectionRef = useRef(null);

  useEffect(() => {
    if (!servicesSectionRef.current || !cameraRef.current) return;
    // Animate camera to top view when 'Our Services' section is about to enter
    const st = ScrollTrigger.create({
      trigger: servicesSectionRef.current,
      start: 'top 80%', // adjust as needed
      onEnter: () => {
        gsap.to(cameraRef.current.position, {
          x: 0,
          y: 16, // only one y value for full model visibility
          z: 0.01,
          duration: 1.2,
          onUpdate: () => {
            cameraRef.current.lookAt(0, 0, 0);
          },
        });
      },
      // Optionally, return to previous view onLeaveBack
      onLeaveBack: () => {
        gsap.to(cameraRef.current.position, {
          x: 0,
          y: 3,
          z: 16,
          duration: 1.2,
          onUpdate: () => {
            cameraRef.current.lookAt(0, 0, 0);
            cameraRef.current.rotation.set(0, 0, 0);
          },
        });
        gsap.to(cameraRef.current.rotation, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.2,
        });
      },
    });
    return () => st && st.kill();
  }, [servicesSectionRef, cameraRef]);

  // 1. Add refs for vertical scroll section blocks and headings
  const verticalSectionRef = useRef(null);
  const verticalImgRefs = useRef([]);
  const verticalContentRefs = useRef([]);
  const verticalHeadingRefs = useRef([]);
  // Add ref for first paragraph in each content block
  const verticalParagraphRefs = useRef([]);

  const addVerticalImgRef = (el) => {
    if (el && !verticalImgRefs.current.includes(el)) {
      verticalImgRefs.current.push(el);
    }
  };
  const addVerticalContentRef = (el) => {
    if (el && !verticalContentRefs.current.includes(el)) {
      verticalContentRefs.current.push(el);
    }
  };
  const addVerticalHeadingRef = (el) => {
    if (el && !verticalHeadingRefs.current.includes(el)) {
      verticalHeadingRefs.current.push(el);
    }
  };
  const addVerticalParagraphRef = (el) => {
    if (el && !verticalParagraphRefs.current.includes(el)) {
      verticalParagraphRefs.current.push(el);
    }
  };

  // GSAP animation for vertical scroll section (images, content, headings)
  useEffect(() => {
    if (!verticalSectionRef.current) return;
    // Animate images
    verticalImgRefs.current.forEach((img, i) => {
      gsap.from(img, {
        scrollTrigger: {
          trigger: img,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 60,
        duration: 1,
        ease: 'power3.out',
        delay: i * 0.1,
      });
    });
    // Animate content blocks
    verticalContentRefs.current.forEach((block, i) => {
      gsap.from(block, {
        scrollTrigger: {
          trigger: block,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 60,
        duration: 1,
        ease: 'power3.out',
        delay: i * 0.15,
      });
    });
    // Animate headings
    verticalHeadingRefs.current.forEach((heading, i) => {
      gsap.fromTo(
        heading,
        { scale: 0.92, color: '#222', opacity: 0 },
        {
          scrollTrigger: {
            trigger: heading,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
          scale: 1,
          color: '#1a56db', // blue accent
          opacity: 1,
          duration: 1.1,
          ease: 'power4.out',
          delay: i * 0.1,
        }
      );
    });
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // GSAP text and image animation for vertical scroll section (headings split by word, first paragraph, images)
  useEffect(() => {
    // Animate headings: split by word, stagger in
    verticalHeadingRefs.current.forEach((heading) => {
      const words = heading.textContent.split(' ').map((word, i, arr) => {
        const span = document.createElement('span');
        span.textContent = word + (i < arr.length - 1 ? ' ' : '');
        span.style.display = 'inline-block';
        span.style.opacity = 0;
        span.style.transform = 'translateY(30px)';
        return span;
      });
      heading.innerHTML = '';
      words.forEach((span) => heading.appendChild(span));
      gsap.to(words, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      });
    });

    // Animate first paragraph in each block
    verticalParagraphRefs.current.forEach((p) => {
      gsap.fromTo(
        p,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: p,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Animate images
    verticalImgRefs.current.forEach((img) => {
      gsap.fromTo(
        img,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: img,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      {loading && (
        <div
          ref={loaderRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          style={{ transition: 'opacity 0.6s' }}
        >
          <div className="flex flex-col items-center">
            {/* Elegant GSAP animated loader */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#fff"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.15"
                />
                <circle
                  id="loader-circle"
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#fff"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 m-auto flex items-center justify-center">
                <span className="bg-white rounded-full w-14 h-14 flex items-center justify-center">
                  <img
                    src="https://files.staging.peachworlds.com/website/9f18050a-739b-4a26-8dca-34cd354043f3/logo.svg"
                    alt="Logo"
                    className="h-10 w-10 object-contain drop-shadow-lg"
                  />
                </span>
              </span>
            </div>
            <div className="mt-6 text-white text-lg font-medium tracking-wide">
              Loading...
            </div>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="relative w-full text-white overflow-hidden"
      >
        {/* Logo top left */}
        <a
          href="/"
          className="fixed top-4 left-4 z-50 flex items-center"
          style={{ zIndex: 100 }}
          aria-label="Home"
        >
          <img
            src="https://files.staging.peachworlds.com/website/9f18050a-739b-4a26-8dca-34cd354043f3/logo.svg"
            alt="Logo"
            className="h-12 w-auto drop-shadow-lg mr-3"
            style={{ maxHeight: '48px' }}
          />
          <span
            className="text-xl md:text-2xl font-bold text-white drop-shadow-lg shiny-title"
            style={{ letterSpacing: '0.02em', position: 'relative', overflow: 'hidden', display: 'inline-block' }}
            ref={logoTitleRef}
          >
            Online House Planners
          </span>
        </a>
        {/* Contact Us button top right */}
        <a
          href="#"
          onClick={e => { e.preventDefault(); setShowContactModal(true); }}
          className="fixed top-4 right-4 z-50 flex items-center bg-black px-6 py-3 rounded shadow-lg"
          style={{ zIndex: 100 }}
          aria-label="Contact Us"
        >
          <span className="text-white text-xl mr-4">Contact Us</span>
          <span className="bg-gray-200 rounded w-10 h-10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M7 7h10v10" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
        {/* Full screen 3D model container */}
        <div className="fixed inset-0 w-full h-full">
          <Canvas shadows>
            <color attach="background" args={["#bdbdbd"]} />
            <PerspectiveCamera
              ref={cameraRef}
              makeDefault
              position={[0, 3, 22]}
              fov={45}
              rotation={[0, 0, 0]}
            />
            <ambientLight intensity={1.2} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={4.5}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
              castShadow
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />
            <HouseModel position={[-2, 0, 1]} scale={0.2} />
            {/* Shadow catcher plane */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.5, 0]}
              receiveShadow
            >
              <planeGeometry args={[500, 500]} />
              <meshStandardMaterial
                color="#a2a2a2"
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>
            {/* Soft contact shadow under the model */}
            <ContactShadows
              position={[0, -0.49, 0]}
              opacity={0.6}
              width={10}
              height={10}
              blur={2.5}
              far={20}
            />
            <Environment preset="sunset" background={false} blur={0.2} />

            <Effects />
          </Canvas>
        </div>

        {/* Content overlay */}
        <div className="container w-full relative z-10 min-h-screen flex flex-col">
          <div className="w-full h-screen p-12 mt-26 md:p-12">
            <div className="firstSection max-w-2xl p-5">
              <h1 ref={h1Ref} className="text-4xl  md:text-6xl font-bold mb-8">
                Elegant Living Begins with Thoughtful Planning
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-300" ref={exploreTextRef}>
                Explore our innovative designs
              </p>
            </div>
          </div>
          <div className="secondSection w-full md:w-1/2 h-screen p-8 md:p-12 self-end">
            <div className="max-w-2xl p-3 -mt-20">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">About</h1>
              <p className="text-xl md:text-2xl mb-8 text-white" ref={aboutTextRef}>
                Online House Planners, we believe that every dream home begins with a smart, creative, and practical plan. As a leading online architectural design and planning platform, we specialize in providing customized house planning services that are accessible, affordable, and tailored to your unique lifestyle.
              </p>
            </div>
          </div>
        </div>


        {/* Scrolling content section */}
        <main className="main-wrapper">
          {/* Top Heading Section */}
          <div className="section">
            <div className="container-medium">
              <div className="padding-vertical">
                <div className="max-width-large text-center">
                  <h1 className="heading text-6xl md:text-6xl font-bold" ref={addToRefs}>Our Plans</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Scroll Section */}
          <div
            ref={verticalSectionRef}
            className="min-h-screen w-full bg-gray-300 py-20 px-6 sm:px-8 lg:px-12 vertical-scroll-section"
            style={{ position: 'relative', zIndex: 20 }}
          >
            {/* Section 1 - Image left, content right */}
            <div className="max-w-7xl mx-auto mb-16">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div
                  className="w-full md:w-1/2 h-96 bg-gray-300 rounded-xl overflow-hidden vertical-img-block"
                  ref={addVerticalImgRef}
                >
                  <img
                    src="https://img.freepik.com/premium-vector/aic2a86ec61a9a40978b710e2cd62ddbe8_600238-5890.jpg"
                    alt="Scandinavian interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 vertical-content-block" ref={addVerticalContentRef}>
                  <h2
                    className="text-3xl font-bold text-gray-900 mb-4 vertical-heading"
                    style={{
                      fontFamily: 'Poppins, Arial, sans-serif',
                      wordSpacing: '1em',
                      textShadow: '0 2px 8px rgba(26,86,219,0.08)'
                    }}
                    ref={addVerticalHeadingRef}
                  >
                    House Vastu Plans
                  </h2>
                  <p
                    className="text-gray-700 mb-6 leading-relaxed font-bold"
                    style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
                    ref={addVerticalParagraphRef}
                  >
                    Scandinavian-inspired interiors with floor-to-ceiling glass and natural textures.
                    Clean lines, functional furniture, and a connection to nature define this aesthetic.
                  </p>
                  <div className="border-t border-gray-400 my-6"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>Design Philosophy</h3>
                  <p className="text-gray-700 leading-relaxed font-bold" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
                    We believe in creating spaces that are both beautiful and functional, with an emphasis on natural light and organic materials.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 - Image right, content left */}
            <div className="max-w-7xl mx-auto mb-16">
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div
                  className="w-full md:w-1/2 h-96 bg-gray-300 rounded-xl overflow-hidden vertical-img-block"
                  ref={addVerticalImgRef}
                >
                  <img
                    src="https://img.freepik.com/premium-photo/3d-model-house-architectural-template-background-architectural-model-house_727625-197.jpg"
                    alt="Minimalist design"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 vertical-content-block" ref={addVerticalContentRef}>
                  <h2
                    className="text-3xl font-bold text-gray-900 mb-4 vertical-heading"
                    style={{ fontFamily: 'Poppins, Arial, sans-serif', letterSpacing: '0.02em', textShadow: '0 2px 8px rgba(26,86,219,0.08)' }}
                    ref={addVerticalHeadingRef}
                  >
                    Exterior Plan
                  </h2>
                  <p
                    className="text-gray-700 mb-6 leading-relaxed font-bold"
                    style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
                    ref={addVerticalParagraphRef}
                  >
                    Our designs embrace minimalism with purpose. Each element serves a function while
                    maintaining aesthetic harmony. Less clutter means more space for living.
                  </p>
                  <div className="border-t border-gray-400 my-6"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>Space Optimization</h3>
                  <p className="text-gray-700 leading-relaxed font-bold" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
                    Every square meter is carefully considered to maximize both utility and visual appeal, creating airy, uncluttered environments.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 - Image left, content right */}
            <div className="max-w-7xl mx-auto mb-16">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div
                  className="w-full md:w-1/2 h-96 bg-gray-300 rounded-xl overflow-hidden vertical-img-block"
                  ref={addVerticalImgRef}
                >
                  <img
                    src="https://img.freepik.com/free-photo/3d-modern-interior-sketch-style-design_1048-18878.jpg"
                    alt="Modern interior design"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 vertical-content-block" ref={addVerticalContentRef}>
                  <h2
                    className="text-3xl font-bold text-gray-900 mb-4 vertical-heading"
                    style={{ fontFamily: 'Poppins, Arial, sans-serif', letterSpacing: '0.02em', textShadow: '0 2px 8px rgba(26,86,219,0.08)' }}
                    ref={addVerticalHeadingRef}
                  >
                    Interior Plan
                  </h2>
                  <p
                    className="text-gray-700 mb-6 leading-relaxed font-bold"
                    style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
                    ref={addVerticalParagraphRef}
                  >
                    We prioritize sustainable, natural materials like wood, stone, and linen.
                    These elements bring warmth and texture while remaining environmentally conscious.
                  </p>
                  <div className="border-t border-gray-400 my-6"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>Sustainability</h3>
                  <p className="text-gray-700 leading-relaxed font-bold" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
                    All materials are sourced responsibly, with low environmental impact and high durability to ensure longevity.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 - Image right, content left */}
            <div className="max-w-9xl mx-auto">
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div
                  className="w-full md:w-1/2 h-96 bg-gray-300 rounded-xl overflow-hidden vertical-img-block"
                  ref={addVerticalImgRef}
                >
                  <img
                    src="https://img.freepik.com/premium-vector/floor-plan_600238-5612.jpg"
                    alt="Wardrobe floor plan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 vertical-content-block" ref={addVerticalContentRef}>
                  <h2
                    className="text-3xl font-bold text-gray-900 mb-4 vertical-heading"
                    style={{ fontFamily: 'Poppins, Arial, sans-serif', letterSpacing: '0.02em', textShadow: '0 2px 8px rgba(26,86,219,0.08)' }}
                    ref={addVerticalHeadingRef}
                  >
                    Wardrobe Plan
                  </h2>
                  <p
                    className="text-gray-700 mb-6 leading-relaxed font-bold"
                    style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
                    ref={addVerticalParagraphRef}
                  >
                    Custom-designed wardrobes that maximize storage while maintaining aesthetic appeal.
                    We use space-efficient solutions tailored to your specific needs.
                  </p>
                  <div className="border-t border-gray-400 my-6"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-8" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>Customization</h3>
                  <p className="text-gray-700 leading-relaxed font-bold" style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>
                    Each wardrobe is designed around your storage requirements and personal style, with attention to both form and function.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <section className="lastsection h-screen relative w-full py-20 mt-20" style={{ position: 'relative', zIndex: 50 }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-18">
              <div className="content-block">
                <h2 className="text-4xl font-bold mb-6 text-white">Why Choose Us?</h2>
                <p className="text-xl text-white" textWrap="wrap" style={{ width: '500px' }} ref={keyFeaturesTextRef}>
                  Get your initial plans and revisions delivered quickly, without compromising on quality.
                  We combine cutting-edge technology with years of industry expertise to deliver detailed 2D plans, 3D visualizations, structural drawings, interior concepts, and vastu-compliant designs—all online, without the need for physical visits.
                </p>
              </div>
              <div className="content-block">
                <h2 className="text-4xl font-bold mb-6 text-white">Transform Your Space</h2>
                <p className="text-xl text-white" ref={keyFeaturesTextRef} textWrap="wrap" style={{ width: '500px' }}>
                  Experience the perfect blend of innovation and comfort with our cutting-edge house planning solutions.
                  We bring your dream home to life with precision and style.
                </p>
              </div>



            </div>
          </div>

        </section>


        <section className="lastsection h-screen relative w-full py-20 mt-20" style={{ position: 'relative', zIndex: 50 }}>
          <div className="container mx-auto px-4">

          </div>
        </section>



        <div className="section">

          <div className="container-medium">
            <div className="padding-vertical">
              <div className="max-width-large text-center" ref={servicesSectionRef}>
                <h1 className="heading text-6xl md:text-8xl font-bold" ref={addToRefs}>Our Services</h1>
              </div>
            </div>
          </div>
        </div>
        {/* Horizontal Scroll Section */}
        <div
          ref={gridSectionRef}
          className="scroll-section horizontal-section section"
        >
          <div className="wrapper">
            <div className="min-s-screen bg-gray-300 font-sans">
              <div className="max-w-5xl mx-auto px-4 sm:px-2 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

                  <div className="flex flex-col items-start group">
                    <div className="w-full overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300">
                      <img
                        src="https://files.staging.peachworlds.com/website/dbf16c23-6134-4df6-a509-bd2a6b79ab37/chatgpt-image-3-apr-2025-16-33-58.webp"
                        alt="Bedroom"
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="mt-6 text-gray-800 text-lg leading-relaxed font-bold" ref={addGridTextRef}>
                      Wake up to nature in the Mini Villa's panoramic bedroom. Framed by floor-to-ceiling glass.
                    </p>
                  </div>

                  <div className="flex flex-col items-start group">
                    <div className="w-full overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300">
                      <img
                        src="https://files.staging.peachworlds.com/website/d80b404a-7e8e-40ee-a08c-cbab3f8a7ad3/chatgpt-image-3-apr-2025-16-23-38.webp"
                        alt="Bathroom"
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="mt-6 text-gray-800 text-lg leading-relaxed font-bold" ref={addGridTextRef}>
                      A spa-like retreat in miniature form—crafted with warm wood tones, and matte black fixtures.
                    </p>
                  </div>

                  <div className="flex flex-col items-start group">
                    <div className="w-full overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300">
                      <img
                        src="https://files.staging.peachworlds.com/website/504aad69-04e9-4c61-8e60-4bf340ec746f/chatgpt-image-3-apr-2025-16-23-32.webp"
                        alt="Kitchen"
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="mt-6 text-gray-800 text-lg leading-relaxed font-bold" ref={addGridTextRef}>
                      The kitchen combines sleek design with smart functionality—compact and fully equipped.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => setShowContactModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center text-black">Contact Us</h2>
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  setShowContactModal(false);
                  alert('Message sent!');
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  className="w-full border text-black border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full border text-black border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  className="w-full border text-black border-gray-300 rounded px-3 py-2"
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  required
                  className="w-full border text-black border-gray-300 rounded px-3 py-2"
                  rows={4}
                />
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}