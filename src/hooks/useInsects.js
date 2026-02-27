import { useEffect, useRef, useState } from 'react';

/**
 * Initializes and returns the insect data array.
 * Encapsulates all insect spawning logic, keeping LiveEcosystem focused
 * on the animation loop and rendering.
 */
export function useInsects() {
    const insectsRef = useRef([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const width = window.innerWidth * 2;
        const height = window.innerHeight * 2;

        const newInsects = Array.from({ length: 45 }).map((_, i) => {
            const randType = Math.random();
            let type = 'ant';
            let sizeWidth = 15 + Math.random() * 10;
            let sizeHeight = sizeWidth;
            let speedMult = 1;
            let color = Math.random() > 0.5 ? 'text-lime-300' : 'text-green-300';

            if (randType > 0.90) {
                type = 'frog';
                sizeWidth = 40 + Math.random() * 20;
                sizeHeight = sizeWidth;
                speedMult = 0.6;
                color = 'text-emerald-400';
            } else if (randType > 0.80) {
                type = 'butterfly';
                sizeWidth = 30 + Math.random() * 15;
                sizeHeight = sizeWidth;
                speedMult = 1.3;
                const colors = ['text-pink-400', 'text-purple-400', 'text-blue-400', 'text-fuchsia-400'];
                color = colors[Math.floor(Math.random() * colors.length)];
            } else if (randType > 0.70) {
                type = 'bee';
                sizeWidth = 20 + Math.random() * 10;
                sizeHeight = sizeWidth;
                speedMult = 1.5;
                color = Math.random() > 0.5 ? 'text-yellow-500' : 'text-amber-500';
            } else if (randType > 0.55) {
                type = 'beetle';
                sizeWidth = 25 + Math.random() * 15;
                sizeHeight = sizeWidth;
                speedMult = 0.8;
                color = 'text-green-500';
            } else if (randType > 0.45) {
                type = 'centipede';
                sizeWidth = 20 + Math.random() * 10;
                sizeHeight = sizeWidth * 2;
                speedMult = 1.2;
                color = 'text-lime-400';
            } else if (randType > 0.30) {
                type = 'firefly';
                sizeWidth = 10 + Math.random() * 5;
                sizeHeight = sizeWidth;
                speedMult = 0.4;
                color = Math.random() > 0.5 ? 'text-yellow-200' : 'text-amber-200';
            } else if (randType > 0.15) {
                type = 'ladybug';
                sizeWidth = 15 + Math.random() * 10;
                sizeHeight = sizeWidth;
                speedMult = 0.5;
                color = Math.random() > 0.5 ? 'text-red-500' : 'text-rose-500';
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
                focusNode: null,
                timer: Math.random() * 100
            };
        });

        insectsRef.current = newInsects;
        setMounted(true);
    }, []);

    return { insectsRef, mounted };
}
