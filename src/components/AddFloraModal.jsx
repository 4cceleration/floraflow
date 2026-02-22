import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { generateFlowchart } from '../services/aiService';

// --- Option constants (single source of truth) ---
const COMPLEXITY_LEVELS = ['Condensado', 'Estándar', 'Extenso'];
const TONES = ['Informativo', 'Místico', 'Sarcástico'];
const THEMES = ['Naturaleza', 'Tecnológico', 'Cósmico'];
const DIAGRAM_TYPES = [
    'Diagrama de Flujo',
    'Mapa Conceptual',
    'Mapa Mental',
    'Árbol de Decisiones',
    'Diagrama de Secuencia'
];

export default function AddFloraModal({ isOpen, onClose, onAddFlowchart, diagramType, setDiagramType }) {
    const [prompt, setPrompt] = useState('');
    const [detailLevel, setDetailLevel] = useState('Estándar');
    const [tone, setTone] = useState('Informativo');
    const [theme, setTheme] = useState('Naturaleza');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const data = await generateFlowchart(prompt, detailLevel, tone, theme, diagramType);
            if (data && data.nodes && data.edges) {
                const uid = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

                // Stamp diagramType into every node's data so FloraNode can render it distinctly
                const newNodes = data.nodes.map((n, idx) => ({
                    ...n,
                    id: `${uid}-${n.id}`,
                    data: {
                        ...n.data,
                        diagramType,
                        isRoot: idx === 0  // first node is treated as root (for Mapa Mental)
                    }
                }));

                const newEdges = data.edges.map(e => ({
                    ...e,
                    id: `${uid}-${e.id}`,
                    source: `${uid}-${e.source}`,
                    target: `${uid}-${e.target}`
                }));

                onAddFlowchart(newNodes, newEdges);
                onClose();
                setPrompt('');
            } else {
                alert('Error: Invalid response format from AI.');
            }
        } catch (error) {
            console.error(error);
            alert('Error generating flowchart: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const OptionGroup = ({ label, options, value, onChange }) => (
        <div className="customization-group">
            <label>{label}</label>
            <div className="modal-detail-options">
                {options.map(opt => (
                    <button
                        key={opt}
                        type="button"
                        className={value === opt ? 'active' : ''}
                        onClick={() => onChange(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="modal-header">✨ Crea un Nuevo Flora</h2>

                    <textarea
                        className="modal-textarea"
                        placeholder="Escribe el flujo que quieres generar. Ej. 'Pasos para crear una empresa'."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />

                    <div className="modal-customization-grid">
                        <OptionGroup
                            label="Complejidad"
                            options={COMPLEXITY_LEVELS}
                            value={detailLevel}
                            onChange={setDetailLevel}
                        />
                        <OptionGroup
                            label="Tono de Voz"
                            options={TONES}
                            value={tone}
                            onChange={setTone}
                        />
                        <OptionGroup
                            label="Vibra / Temática"
                            options={THEMES}
                            value={theme}
                            onChange={setTheme}
                        />

                        {/* Diagram type with wrap layout */}
                        <div className="customization-group">
                            <label>Tipo de Diagrama</label>
                            <div className="modal-detail-options" style={{ flexWrap: 'wrap' }}>
                                {DIAGRAM_TYPES.map(dt => (
                                    <button
                                        key={dt}
                                        type="button"
                                        className={diagramType === dt ? 'active' : ''}
                                        onClick={() => setDiagramType(dt)}
                                        style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '20px' }}
                                    >
                                        {dt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <Button onClick={onClose} className="bg-gray-200">Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={isGenerating || !prompt.trim()}>
                            {isGenerating ? 'Generando Magia...' : 'Generar Diagrama'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
