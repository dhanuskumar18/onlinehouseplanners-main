// components/Grayscale3DPage.js
"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import {
  Center,
  Environment,
  OrbitControls,
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

function HouseModel({ position = [0, 0, 0], scale = 0.1, castShadow = false }) {
  const { scene } = useGLTF("/models/familyhouse1.glb");
  const houseRef = useRef();

  // Apply grayscale materials to all meshes and enable shadows
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
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
      castShadow={castShadow}
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
            const topViewProgress = (self.progress - 0.6) / 0.2;
            cameraRef.current.position.y = 3 + (17 * topViewProgress);
            cameraRef.current.rotation.x = -(Math.PI / 2) * topViewProgress;
            cameraRef.current.rotation.y = Math.PI * 2 * topViewProgress;
            cameraRef.current.position.x = 0;
            cameraRef.current.position.z = 0;
          } else {
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
              <path d="M7 17L17 7M7 7h10v10" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </a>
        {/* Full screen 3D model container */}
        <div className="fixed inset-0 w-full h-full">
          <Canvas shadows>
            <PerspectiveCamera
              ref={cameraRef}
              makeDefault
              position={[0, 0, 16]}
              fov={50}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <ambientLight intensity={1.2} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={4.5}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />
            <HouseModel position={[0, 0, -2]} scale={0.3} castShadow />
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
            <Environment preset="night" background blur={1} />
            <Environment preset="sunset" background blur={1} />
            <OrbitControls />
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

        <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row items-center justify-center">
          <div className="flex flex-col justify-center p-10 md:w-1/2 space-y-6">
          <h1 className="text-5xl font-bold text-black">Why Choose Us?</h1>
            <p className="text-xl text-white font-medium" ref={keyFeaturesTextRef}>            
            Get your initial plans and revisions delivered quickly, without compromising on quality.
            We combine cutting-edge technology with years of industry expertise to deliver detailed 2D plans, 3D visualizations, structural drawings, interior concepts, and vastu-compliant designs—all online, without the need for physical visits.            </p>
          </div>
          <div className="relative md:w-1/2 h-96 md:h-auto flex items-center justify-center">
            <img
              src="https://files.staging.peachworlds.com/website/905fcf55-150d-44ab-b5e8-96de39798da3/chatgpt-image-3-apr-2025-16-23-39.webp"
              alt="Interior Design"
              className="object-cover w-full h-full rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Scrolling content section */}
        <main className="main-wrapper">
          {/* Top Heading Section */}
          <div className="section">
            <div className="container-medium">
              <div className="padding-vertical">
                <div className="max-width-large text-center">
                  <h1 className="heading text-6xl md:text-6xl font-bold" ref={addToRefs}>Interior & Exteriors Plans</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Scroll Section */}
          <div
            ref={(el) => (sectionRefs.current[0] = el)}
            className="scroll-section vertical-section section"
          >
            <div className="wrapper">
              <div role="list" className="list">
                {[
                  {
                    number: 1,
                    title: "Where style meets space—interiors designed to reflect your life",
                    description: "Where style meets space—interiors designed to reflect your life",
                    image: "/images/interior.webp",
                  },
                  {
                    number: 2,
                    title: "Elevate your home's first impression with elegant, custom exterior designs",
                    description: "Elevate your home's first impression with elegant, custom exterior designs",
                    image: "/images/exterior.jpg",
                  }
                ].map(({ number, title, description, image }, index) => (
                  <div role="listitem" className="item" key={index}>
                    <div className="relative w-full h-full">
                      <div className="absolute top-0 left-0 w-full p-6 z-10">
                        <h3 className="text-3xl font-bold text-white text-center">
                          {title}
                        </h3>
                      </div>
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className="item_media"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>

        <section className="lastsection h-screen relative w-full py-20" style={{ position: 'relative', zIndex: 50 }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="content-block">
                <h2 className="text-4xl font-bold mb-6 text-white">Transform Your Space</h2>
                <p className="text-xl text-white">
                  Experience the perfect blend of innovation and comfort with our cutting-edge house planning solutions.
                  We bring your dream home to life with precision and style.
                </p>
              </div>
              <div className="content-block">
                <h2 className="text-4xl font-bold mb-6 text-white">Smart Design Solutions</h2>
                <p className="text-xl text-white">
                  Our expert team combines functionality with aesthetics to create spaces that inspire and delight.
                  Every detail is carefully considered to enhance your living experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="section">
            <div className="container-medium">
              <div className="padding-vertical">
                <div className="max-width-large text-center">
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
            <div className="min-s-screen bg-white font-sans">
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
                    <p className="mt-6 text-gray-800 text-lg leading-relaxed" ref={addGridTextRef}>
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
                    <p className="mt-6 text-gray-800 text-lg leading-relaxed" ref={addGridTextRef}>
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
                    <p className="mt-6 text-gray-800 text-lg leading-relaxed" ref={addGridTextRef}>
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