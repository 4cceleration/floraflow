import React, { useEffect, useRef, useState } from 'react';
import { useNodes, useViewport } from 'reactflow';

// --- SVG Assets (Top-down view) ---

const AntSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>
        <g fill="currentColor">
            <ellipse cx="50" cy="50" rx="10" ry="25" />
            <circle cx="50" cy="20" r="8" />
            <ellipse cx="50" cy="80" rx="12" ry="18" />
            <path d="M 40 40 Q 20 20 20 40" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 40 50 Q 15 50 15 60" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 40 60 Q 20 80 20 70" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 60 40 Q 80 20 80 40" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 60 50 Q 85 50 85 60" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 60 60 Q 80 80 80 70" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 45 15 Q 30 0 25 10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 55 15 Q 70 0 75 10" stroke="currentColor" strokeWidth="2" fill="none" />
        </g>
    </svg>
);

const BeetleSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}>
        <g fill="currentColor">
            {/* Body Shell */}
            <ellipse cx="50" cy="60" rx="25" ry="35" />
            <path d="M 50 25 L 50 95" stroke="#030a05" strokeWidth="3" /> {/* Shell split */}
            {/* Head */}
            <ellipse cx="50" cy="20" rx="15" ry="10" />
            {/* Horns */}
            <path d="M 40 15 Q 30 0 45 5" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 60 15 Q 70 0 55 5" stroke="currentColor" strokeWidth="3" fill="none" />
            {/* Short Legs */}
            <path d="M 25 40 L 10 30" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 25 60 L 5 60" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 25 80 L 10 90" stroke="currentColor" strokeWidth="3" fill="none" />

            <path d="M 75 40 L 90 30" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 75 60 L 95 60" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M 75 80 L 90 90" stroke="currentColor" strokeWidth="3" fill="none" />
        </g>
    </svg>
);

const FrogSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}>
        <g fill="currentColor">
            {/* Main Body */}
            <ellipse cx="50" cy="55" rx="20" ry="30" />
            {/* Eyes */}
            <circle cx="35" cy="25" r="8" />
            <circle cx="65" cy="25" r="8" />
            {/* Front Legs */}
            <path d="M 35 35 Q 10 20 15 10" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 65 35 Q 90 20 85 10" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Back Legs */}
            <path d="M 30 70 Q 5 60 10 90" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 70 70 Q 95 60 90 90" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
    </svg>
);

const CentipedeSVG = ({ colorClass }) => (
    <svg viewBox="0 0 100 200" className={`w-full h-full ${colorClass}`} style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}>
        <g fill="currentColor">
            {/* Head */}
            <circle cx="50" cy="20" r="12" />
            <path d="M 43 12 Q 30 -5 20 5" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M 57 12 Q 70 -5 80 5" stroke="currentColor" strokeWidth="2" fill="none" />

            {/* Segmented Body & Legs */}
            {[...Array(10)].map((_, i) => {
                const cy = 40 + i * 15;
                return (
                    <g key={i}>
                        <ellipse cx="50" cy={cy} rx="10" ry="8" />
                        <path d={`M 40 ${cy} Q 15 ${cy - 10} 10 ${cy + 5}`} stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d={`M 60 ${cy} Q 85 ${cy - 10} 90 ${cy + 5}`} stroke="currentColor" strokeWidth="2" fill="none" />
                    </g>
                );
            })}
        </g>
    </svg>
);

const WANDER_JITTER = 0.1; // Random wanderness

export default function LiveEcosystem({ isHidden }) {
    const canvasRef = useRef(null);
    const insectsRef = useRef([]);
    const [mounted, setMounted] = useState(false);

    // ReactFlow Hooks
    const nodes = useNodes();
    const { x: viewportX, y: viewportY, zoom } = useViewport();
    const nodesRef = useRef(nodes);

    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Initialize insects
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Spread insects over a larger "world" area
        const width = window.innerWidth * 2;
        const height = window.innerHeight * 2;

        const newInsects = Array.from({ length: 35 }).map((_, i) => {
            const randType = Math.random();
            let type = 'ant';
            let sizeWidth = 15 + Math.random() * 10;
            let sizeHeight = sizeWidth;
            let speedMult = 1;
            let color = Math.random() > 0.5 ? 'text-lime-300' : 'text-green-300';

            if (randType > 0.85) {
                type = 'frog';
                sizeWidth = 40 + Math.random() * 20;
                sizeHeight = sizeWidth;
                speedMult = 0.6; // Frogs are slower
                color = 'text-emerald-400';
            } else if (randType > 0.65) {
                type = 'beetle';
                sizeWidth = 25 + Math.random() * 15;
                sizeHeight = sizeWidth;
                speedMult = 0.8;
                color = 'text-green-500';
            } else if (randType > 0.5) {
                type = 'centipede';
                sizeWidth = 20 + Math.random() * 10;
                sizeHeight = sizeWidth * 2; // Centipedes are long
                speedMult = 1.2; // Fast bugs
                color = 'text-lime-400';
            }

            return {
                id: i,
                type,
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                angle: Math.random() * Math.PI * 2,
                targetAngle: Math.random() * Math.PI * 2,
                sizeWidth,
                sizeHeight,
                speedMult,
                color,
                fleeTarget: null,
                timer: Math.random() * 100 // Internal biological clock
            };
        });

        insectsRef.current = newInsects;
        setMounted(true);
    }, []);

    // Animation Loop
    useEffect(() => {
        if (!mounted || !canvasRef.current) return;

        let animationFrameId;

        const loop = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const ctx = canvasRef.current;
            // Clear React container essentially by mapping state, but we are using DOM manipulation for performance.
            // Wait, we need React to render the insects, so let's mutate refs and forceUpdate, or use requestAnimationFrame to update styles directly to avoid React overhead.

            insectsRef.current.forEach(insect => {
                const domNode = document.getElementById(`insect-${insect.id}`);
                if (!domNode) return;

                insect.timer += 1;
                const currentNodes = nodesRef.current;

                // Magic Attraction Logic (Phase 11)
                if (currentNodes.length > 0 && insect.timer % 150 === 0) {
                    if (Math.random() > 0.3) { // 70% chance to pick a node
                        const randomNode = currentNodes[Math.floor(Math.random() * currentNodes.length)];
                        insect.focusNode = randomNode;
                    } else {
                        insect.focusNode = null;
                    }
                }

                if (insect.focusNode && currentNodes.find(n => n.id === insect.focusNode.id)) {
                    // Update target node real position (node center approx)
                    // The flora node is 320px wide and ~100px tall
                    const nx = insect.focusNode.position.x + 160;
                    const ny = insect.focusNode.position.y + 50;

                    const dx = nx - insect.x;
                    const dy = ny - insect.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 40) {
                        // Reached node, chill out
                        insect.angle += (Math.random() - 0.5) * 0.5;
                        insect.x += Math.cos(insect.angle) * 0.2;
                        insect.y += Math.sin(insect.angle) * 0.2;
                    } else {
                        insect.targetAngle = Math.atan2(dy, dx);

                        const angleDiff = insect.targetAngle - insect.angle;
                        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                        insect.angle += normalizedDiff * 0.1; // Steer towards node

                        // Move faster when attracted
                        insect.x += Math.cos(insect.angle) * (1.5 * insect.speedMult);
                        insect.y += Math.sin(insect.angle) * (1.5 * insect.speedMult);
                    }
                } else {
                    // WANDER MODE ALWAYS ON
                    // Change mind randomly
                    if (insect.timer % ~~(30 + Math.random() * 50) === 0) {
                        insect.targetAngle += (Math.random() - 0.5) * Math.PI; // up to 90 deg turn
                    }

                    // Soft boundary reflection (keep them on large world screen)
                    const margin = -500;
                    if (insect.x < margin) insect.targetAngle = 0; // go right
                    if (insect.x > width + margin) insect.targetAngle = Math.PI; // go left
                    if (insect.y < margin) insect.targetAngle = Math.PI / 2; // go down
                    if (insect.y > height + margin) insect.targetAngle = -Math.PI / 2; // go up

                    // Steer softly
                    const angleDiff = insect.targetAngle - insect.angle;
                    const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                    insect.angle += normalizedDiff * 0.05; // Base turn speed

                    // Add jitter
                    insect.angle += (Math.random() - 0.5) * WANDER_JITTER;

                    insect.x += Math.cos(insect.angle) * (0.5 * insect.speedMult); // Base wander speed 0.5
                    insect.y += Math.sin(insect.angle) * (0.5 * insect.speedMult);
                }

                // Apply transforms directly
                // Our SVG ant is facing UPwards (negative Y).
                // `insect.angle` is the true mathematical angle in the XY-plane (0 = Right, PI/2 = Down, PI = Left, -PI/2 = Up)
                // We want the SVG to rotate such that UP faces the math angle.
                // If math angle is -PI/2 (UP), rotation should be 0deg.
                // If math angle is 0 (RIGHT), rotation should be 90deg.
                const visualAngle = insect.angle + Math.PI / 2;

                domNode.style.transform = `translate(${insect.x}px, ${insect.y}px) rotate(${visualAngle}rad)`;
                domNode.style.display = 'block';
            });

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [mounted, isHidden]);

    if (!mounted) return null;

    return (
        <div ref={canvasRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <div style={{ transform: `translate(${viewportX}px, ${viewportY}px) scale(${zoom})`, transformOrigin: '0 0', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                {insectsRef.current.map(insect => {
                    // Pre-compute initial visual angle to match logic in loop
                    const initVisualAngle = insect.angle + Math.PI / 2;

                    let SVGComponent = AntSVG;
                    if (insect.type === 'frog') SVGComponent = FrogSVG;
                    if (insect.type === 'beetle') SVGComponent = BeetleSVG;
                    if (insect.type === 'centipede') SVGComponent = CentipedeSVG;

                    return (
                        <div
                            key={insect.id}
                            id={`insect-${insect.id}`}
                            className="absolute top-0 left-0" // Starting position 0,0 - managed by matrix calc
                            style={{
                                width: `${insect.sizeWidth}px`,
                                height: `${insect.sizeHeight}px`,
                                // Initial center so the translate transforms the center of the insect
                                marginLeft: `${-insect.sizeWidth / 2}px`,
                                marginTop: `${-insect.sizeHeight / 2}px`,
                                transform: `translate(${insect.x}px, ${insect.y}px) rotate(${initVisualAngle}rad)`
                            }}
                        >
                            <SVGComponent colorClass={insect.color} />
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
