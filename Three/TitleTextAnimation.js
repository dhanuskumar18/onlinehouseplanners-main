'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const Footer = () => {
    const footerRef = useRef(null);
    const bgRef = useRef(null);
    const contentRef = useRef(null);
    const logoRef = useRef(null);
    const linksRef = useRef([]);
    const socialRef = useRef(null);
    const copyrightRef = useRef(null);

    const addToLinksRef = (el) => {
        if (el && !linksRef.current.includes(el)) {
            linksRef.current.push(el);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initial faded state
        gsap.set(bgRef.current, {
            backgroundColor: 'rgba(15, 23, 42, 0)', // Transparent
            backdropFilter: 'blur(0px)',
        });

        // Background fade-in animation on scroll
        const bgTL = gsap.timeline({
            scrollTrigger: {
                trigger: footerRef.current,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 1,
            }
        });

        bgTL
            .to(bgRef.current, {
                backgroundColor: 'rgba(15, 23, 42, 0.95)', // Dark grey with 95% opacity
                duration: 2,
                ease: 'power2.inOut'
            })
            .to(bgRef.current, {
                backdropFilter: 'blur(8px)',
                duration: 1.5
            }, 0);

        // Content reveal animation
        const contentTL = gsap.timeline({
            scrollTrigger: {
                trigger: footerRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });

        contentTL
            .from(contentRef.current, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })
            .from(logoRef.current, {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: 'back.out(1.7)'
            }, 0.2)
            .from(linksRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'circ.out'
            }, 0.3)
            .from(socialRef.current.children, {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'elastic.out(1, 0.5)'
            }, 0.4)
            .from(copyrightRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out'
            }, 0.6);

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <footer
            ref={footerRef}
            className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
            {/* Faded grey background element */}
            <div
                ref={bgRef}
                className="absolute inset-0 bg-gray-900/0 backdrop-blur-0 -z-10 transition-all duration-1000"
            />

            <div ref={contentRef} className="max-w-7xl mx-auto relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Logo section */}
                    <div className="md:col-span-1">
                        <div ref={logoRef} className="mb-8">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-white animate-shimmer bg-[length:200%_100%]">
                                Online House Planners
                            </h2>
                            <p className="text-gray-300 mt-3">Visualize your perfect living space</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700 text-white"
                            ref={el => addToLinksRef(el)}
                        >
                            Design Tools
                        </h3>
                        <ul className="space-y-3">
                            {['Floor Planner', '3D Designer', 'Room Layouts', 'Exterior Visualizer'].map((item, index) => (
                                <li key={index}>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:pl-2 block"
                                        ref={el => addToLinksRef(el)}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700 text-white"
                            ref={el => addToLinksRef(el)}
                        >
                            Resources
                        </h3>
                        <ul className="space-y-3">
                            {['Design Ideas', 'Material Catalog', 'Cost Calculator', 'Expert Consultation'].map((item, index) => (
                                <li key={index}>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:pl-2 block"
                                        ref={el => addToLinksRef(el)}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div>
                        <h3
                            className="text-lg font-semibold mb-5 pb-2 border-b border-gray-700 text-white"
                            ref={el => addToLinksRef(el)}
                        >
                            Connect With Us
                        </h3>
                        <div className="space-y-4">
                            <p className="text-gray-300" ref={el => addToLinksRef(el)}>
                                Need help with your project? Our design experts are ready to assist.
                            </p>

                            <div
                                ref={socialRef}
                                className="flex space-x-4 pt-2"
                            >
                                {['Facebook', 'Instagram', 'Pinterest', 'YouTube'].map((platform, index) => (
                                    <a
                                        key={index}
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                                        aria-label={platform}
                                    >
                                        {platform.slice(0, 1)}
                                    </a>
                                ))}
                            </div>

                            <div className="pt-4" ref={el => addToLinksRef(el)}>
                                <button className="w-full bg-black hover:to-gray-900 text-white py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                                    Book a Consultation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div
                    ref={copyrightRef}
                    className="border-t border-gray-700 mt-12 pt-8 text-center text-400 text-sm"
                >
                    <p>
                        &copy; {new Date().getFullYear()} Online House Planners. All visualizations and designs are property of their respective owners.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;