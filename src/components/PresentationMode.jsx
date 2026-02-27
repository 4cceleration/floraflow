import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import MiniChart from './MiniChart';

// ── BFS ordering: root first, then breadth-first by edges ────
function getOrderedNodes(nodes, edges) {
    if (nodes.length === 0) return [];

    const hasIncoming = new Set(edges.map(e => e.target));
    const rootNode = nodes.find(n => !hasIncoming.has(n.id)) ?? nodes[0];

    const visited = new Set();
    const queue = [rootNode];
    const ordered = [];

    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current.id)) continue;
        visited.add(current.id);
        ordered.push(current);

        edges
            .filter(e => e.source === current.id)
            .forEach(e => {
                const child = nodes.find(n => n.id === e.target);
                if (child && !visited.has(child.id)) queue.push(child);
            });
    }

    // Append any disconnected nodes
    nodes.forEach(n => { if (!visited.has(n.id)) ordered.push(n); });

    return ordered;
}

// ── Diagram type badge styles ─────────────────────────────────
const DT_BADGE = {
    'Diagrama de Flujo': { bg: 'rgba(66,245,126,0.15)', color: '#42f57e', label: '◆ Flujo' },
    'Mapa Conceptual': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8', label: '◆ Conceptual' },
    'Mapa Mental': { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', label: '◆ Mental' },
    'Árbol de Decisiones': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '◆ Decisiones' },
    'Diagrama de Secuencia': { bg: 'rgba(34,211,238,0.15)', color: '#22d3ee', label: '◆ Secuencia' },
};

export default function PresentationMode({ nodes, edges, onClose }) {
    const ordered = getOrderedNodes(nodes, edges);
    const total = ordered.length;

    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const goNext = useCallback(() => {
        if (index < total - 1) { setDirection(1); setIndex(i => i + 1); }
    }, [index, total]);

    const goPrev = useCallback(() => {
        if (index > 0) { setDirection(-1); setIndex(i => i - 1); }
    }, [index]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext(); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [goNext, goPrev, onClose]);

    if (total === 0) return null;

    const current = ordered[index];
    const dt = current.data?.diagramType ?? 'Diagrama de Flujo';
    const badge = DT_BADGE[dt] ?? DT_BADGE['Diagrama de Flujo'];

    const slideVariants = {
        enter: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.96 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (d) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.96 }),
    };

    return (
        <div className="presentation-overlay">
            {/* Progress bar */}
            <div className="pres-progress-bar">
                <div
                    className="pres-progress-fill"
                    style={{ width: `${((index + 1) / total) * 100}%`, background: badge.color }}
                />
            </div>

            {/* Top bar */}
            <div className="pres-top-bar">
                <span className="pres-badge" style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                </span>
                <span className="pres-counter">{index + 1} / {total}</span>
                <button className="pres-close-btn" onClick={onClose} title="Salir (Esc)">
                    <X size={20} />
                </button>
            </div>

            {/* Slide content */}
            <div className="pres-stage">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current.id}
                        className="pres-slide"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        style={{ borderColor: badge.color + '55' }}
                    >
                        {/* Node type pill */}
                        <span
                            className="pres-node-type"
                            style={{ background: badge.bg, color: badge.color }}
                        >
                            {current.type?.toUpperCase() ?? 'NODO'}
                        </span>

                        <h2 className="pres-title" style={{ color: badge.color }}>
                            {current.data?.title ?? 'Sin título'}
                        </h2>

                        {current.data?.chartData && (
                            <MiniChart chartData={current.data.chartData} diagramType={dt} />
                        )}

                        {current.data?.content ? (
                            <p className="pres-content">{current.data.content}</p>
                        ) : (
                            <p className="pres-content pres-empty">— Sin descripción —</p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="pres-nav">
                <button
                    className="pres-nav-btn"
                    onClick={goPrev}
                    disabled={index === 0}
                    style={{ borderColor: index === 0 ? 'rgba(255,255,255,0.1)' : badge.color + '66' }}
                    title="Anterior (←)"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Dot indicators */}
                <div className="pres-dots">
                    {ordered.map((_, i) => (
                        <button
                            key={i}
                            className={`pres-dot ${i === index ? 'active' : ''}`}
                            style={{ background: i === index ? badge.color : 'rgba(255,255,255,0.2)' }}
                            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                        />
                    ))}
                </div>

                <button
                    className="pres-nav-btn"
                    onClick={goNext}
                    disabled={index === total - 1}
                    style={{ borderColor: index === total - 1 ? 'rgba(255,255,255,0.1)' : badge.color + '66' }}
                    title="Siguiente (→)"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Keyboard hint */}
            <p className="pres-hint">← → para navegar · Esc para salir</p>
        </div>
    );
}
