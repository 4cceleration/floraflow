import React from 'react';
import { useNodes, useViewport } from 'reactflow';
import { AntSVG, BeetleSVG, FrogSVG, CentipedeSVG, ButterflySVG, BeeSVG, LadybugSVG, FireflySVG } from './InsectSVGs';
import { useInsects } from '../hooks/useInsects';

const WANDER_JITTER = 0.1;

const SVG_MAP = {
    ant: AntSVG,
    beetle: BeetleSVG,
    frog: FrogSVG,
    centipede: CentipedeSVG,
    butterfly: ButterflySVG,
    bee: BeeSVG,
    ladybug: LadybugSVG,
    firefly: FireflySVG,
};

export default function LiveEcosystem() {
    const canvasRef = React.useRef(null);
    const nodesRef = React.useRef([]);
    const { insectsRef, mounted } = useInsects();

    const nodes = useNodes();
    const { x: viewportX, y: viewportY, zoom } = useViewport();

    // Keep nodesRef in sync for use inside the animation loop
    React.useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Animation loop
    React.useEffect(() => {
        if (!mounted || !canvasRef.current) return;

        let animationFrameId;

        const loop = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            insectsRef.current.forEach(insect => {
                const domNode = document.getElementById(`insect-${insect.id}`);
                if (!domNode) return;

                insect.timer += 1;
                const currentNodes = nodesRef.current;

                // Node attraction — pick a focus node
                let focusTime = 150;
                if (insect.type === 'bee' || insect.type === 'butterfly') focusTime = 80;
                if (currentNodes.length > 0 && insect.timer % focusTime === 0) {
                    insect.focusNode = Math.random() > 0.3
                        ? currentNodes[Math.floor(Math.random() * currentNodes.length)]
                        : null;
                }

                // Custom movement based on type
                let typeJitter = WANDER_JITTER;
                let turnSpeed = 0.05;
                let focusMoveMult = 1.5;
                let wanderMoveMult = 0.5;

                if (insect.type === 'butterfly') {
                    typeJitter = 0.8;
                    turnSpeed = 0.1;
                    wanderMoveMult = 1.2;
                } else if (insect.type === 'bee') {
                    typeJitter = 0.2;
                    turnSpeed = 0.15;
                    focusMoveMult = 2.5;
                    wanderMoveMult = 1.0;
                } else if (insect.type === 'frog') {
                    if (insect.timer % 60 < 10) {
                        wanderMoveMult = 4.0;
                        focusMoveMult = 4.0;
                    } else {
                        wanderMoveMult = 0;
                        focusMoveMult = 0;
                    }
                } else if (insect.type === 'firefly') {
                    typeJitter = 0.4;
                    turnSpeed = 0.02;
                    wanderMoveMult = 0.3;
                } else if (insect.type === 'ladybug') {
                    typeJitter = 0.05;
                    wanderMoveMult = 0.2;
                }

                if (insect.focusNode && currentNodes.find(n => n.id === insect.focusNode.id)) {
                    // Flora node is 320px wide ×100px tall
                    const nx = insect.focusNode.position.x + 160;
                    const ny = insect.focusNode.position.y + 50;
                    const dx = nx - insect.x;
                    const dy = ny - insect.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 40) {
                        // Reached node — idle wander
                        insect.angle += (Math.random() - 0.5) * 0.5;
                        insect.x += Math.cos(insect.angle) * 0.2;
                        insect.y += Math.sin(insect.angle) * 0.2;
                    } else {
                        insect.targetAngle = Math.atan2(dy, dx);
                        const diff = Math.atan2(Math.sin(insect.targetAngle - insect.angle), Math.cos(insect.targetAngle - insect.angle));
                        insect.angle += diff * turnSpeed * 2;
                        insect.x += Math.cos(insect.angle) * (focusMoveMult * insect.speedMult);
                        insect.y += Math.sin(insect.angle) * (focusMoveMult * insect.speedMult);
                    }
                } else {
                    // Wander mode
                    if (insect.timer % ~~(30 + Math.random() * 50) === 0) {
                        insect.targetAngle += (Math.random() - 0.5) * Math.PI;
                    }

                    // Soft boundary reflection
                    const margin = -500;
                    if (insect.x < margin) insect.targetAngle = 0;
                    if (insect.x > width + margin) insect.targetAngle = Math.PI;
                    if (insect.y < margin) insect.targetAngle = Math.PI / 2;
                    if (insect.y > height + margin) insect.targetAngle = -Math.PI / 2;

                    const diff = Math.atan2(Math.sin(insect.targetAngle - insect.angle), Math.cos(insect.targetAngle - insect.angle));
                    insect.angle += diff * turnSpeed;
                    insect.angle += (Math.random() - 0.5) * typeJitter;
                    insect.x += Math.cos(insect.angle) * (wanderMoveMult * insect.speedMult);
                    insect.y += Math.sin(insect.angle) * (wanderMoveMult * insect.speedMult);
                }

                // Apply transform directly — SVG faces up, so add π/2 to align with math angle
                const visualAngle = insect.angle + Math.PI / 2;
                domNode.style.transform = `translate(${insect.x}px, ${insect.y}px) rotate(${visualAngle}rad)`;
                domNode.style.display = 'block';
            });

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [mounted, insectsRef]);

    if (!mounted) return null;

    return (
        <div ref={canvasRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <div style={{ transform: `translate(${viewportX}px, ${viewportY}px) scale(${zoom})`, transformOrigin: '0 0', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                {insectsRef.current.map(insect => {
                    const initVisualAngle = insect.angle + Math.PI / 2;
                    const SVGComponent = SVG_MAP[insect.type] ?? AntSVG;

                    return (
                        <div
                            key={insect.id}
                            id={`insect-${insect.id}`}
                            className="absolute top-0 left-0"
                            style={{
                                width: `${insect.sizeWidth}px`,
                                height: `${insect.sizeHeight}px`,
                                marginLeft: `${-insect.sizeWidth / 2}px`,
                                marginTop: `${-insect.sizeHeight / 2}px`,
                                transform: `translate(${insect.x}px, ${insect.y}px) rotate(${initVisualAngle}rad)`
                            }}
                        >
                            <SVGComponent colorClass={insect.color} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
