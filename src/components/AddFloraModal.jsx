import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { generateFlowchart } from '../services/aiService';

export default function AddFloraModal({ isOpen, onClose, onAddFlowchart, diagramType, setDiagramType }) {
    const [prompt, setPrompt] = useState('');
    const [detailLevel, setDetailLevel] = useState('Estándar');
    const [tone, setTone] = useState('Informativo');
    const [theme, setTheme] = useState('Naturaleza');
    const [isGenerating, setIsGenerating] = useState(false);

    const detailLevels = ['Condensado', 'Estándar', 'Extenso'];
    const tones = ['Informativo', 'Humorístico', 'Místico', 'Corporativo'];
    const themes = ['Naturaleza', 'Tecnología', 'Fantasía', 'Minimalista'];
    const diagramTypes = ['Diagrama de Flujo', 'Mapa Conceptual', 'Mapa Mental', 'Árbol de Decisiones', 'Diagrama de Secuencia'];

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const data = await generateFlowchart(prompt, detailLevel, tone, theme, diagramType);
            if (data && data.nodes && data.edges) {
                // Generate a unique ID prefix for this generation to prevent collisions
                const uid = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

                const newNodes = data.nodes.map(n => ({
                    ...n,
                    id: `${uid}-${n.id}`
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
                alert("Error: Invalid response format from AI.");
            }
        } catch (error) {
            console.error(error);
            alert("Error generating flowchart: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

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
                        <div className="customization-group">
                            <label>Complejidad</label>
                            <div className="modal-detail-options">
                                {['Condensado', 'Estándar', 'Extenso'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        className={detailLevel === level ? 'active' : ''}
                                        onClick={() => setDetailLevel(level)}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="customization-group">
                            <label>Tono de Voz</label>
                            <div className="modal-detail-options">
                                {['Informativo', 'Místico', 'Sarcástico'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={tone === t ? 'active' : ''}
                                        onClick={() => setTone(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="customization-group">
                            <label>Vibra / Temática</label>
                            <div className="modal-detail-options">
                                {['Naturaleza', 'Tecnológico', 'Cósmico'].map(th => (
                                    <button
                                        key={th}
                                        type="button"
                                        className={theme === th ? 'active' : ''}
                                        onClick={() => setTheme(th)}
                                    >
                                        {th}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="customization-group">
                            <label>Tipo de Diagrama</label>
                            <div className="modal-detail-options" style={{ flexWrap: 'wrap' }}>
                                {diagramTypes.map(dt => (
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
