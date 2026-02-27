import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { generateFlowchart } from '../services/aiService';

const COMPLEXITY_LEVELS = ['Condensado', 'Estándar', 'Extenso'];
const TONES = ['Informativo', 'Místico', 'Sarcástico'];
const THEMES = ['Naturaleza', 'Tecnológico', 'Cósmico'];
const DIAGRAM_TYPES = [
    'Diagrama de Flujo',
    'Mapa Conceptual',
    'Mapa Mental',
    'Árbol de Decisiones',
    'Diagrama de Secuencia',
    'Dashboard de Datos',
];

const OptionGroup = ({ label, options, value, onChange, wrap }) => (
    <div className="customization-group">
        <label>{label}</label>
        <div className="modal-detail-options" style={wrap ? { flexWrap: 'wrap' } : {}}>
            {options.map(opt => (
                <button key={opt} type="button"
                    className={value === opt ? 'active' : ''}
                    onClick={() => onChange(opt)}
                    style={wrap ? { fontSize: '13px', padding: '8px 14px', borderRadius: '20px' } : {}}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

export default function AddFloraModal({ isOpen, onClose, onAddFlowchart, diagramType, setDiagramType }) {
    const [prompt, setPrompt] = useState('');
    const [detailLevel, setDetailLevel] = useState('Estándar');
    const [tone, setTone] = useState('Informativo');
    const [theme, setTheme] = useState('Naturaleza');
    const [withCharts, setWithCharts] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Dashboard de Datos always has charts
    const isDashboard = diagramType === 'Dashboard de Datos';
    const effectiveWithCharts = isDashboard || withCharts;

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const data = await generateFlowchart(prompt, detailLevel, tone, theme, diagramType, effectiveWithCharts);
            if (data?.nodes && data?.edges) {
                const uid = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                const newNodes = data.nodes.map((n, idx) => ({
                    ...n,
                    id: `${uid}-${n.id}`,
                    data: { ...n.data, diagramType, isRoot: idx === 0 }
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
                alert('Error: formato de respuesta inválido.');
            }
        } catch (err) {
            console.error(err);
            alert('Error generando diagrama: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div className="modal-content"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={e => e.stopPropagation()}
                >
                    <h2 className="modal-header">✨ Crea un Nuevo Flora</h2>

                    <textarea className="modal-textarea"
                        placeholder="Describe el diagrama que quieres generar. Ej. 'Ventas trimestrales de mi empresa por región'."
                        value={prompt} onChange={e => setPrompt(e.target.value)}
                    />

                    <div className="modal-customization-grid">
                        <OptionGroup label="Complejidad" options={COMPLEXITY_LEVELS} value={detailLevel} onChange={setDetailLevel} />
                        <OptionGroup label="Tono de Voz" options={TONES} value={tone} onChange={setTone} />
                        <OptionGroup label="Vibra / Temática" options={THEMES} value={theme} onChange={setTheme} />
                        <OptionGroup label="Tipo de Diagrama" options={DIAGRAM_TYPES} value={diagramType} onChange={v => { setDiagramType(v); }} wrap />

                        {/* Charts toggle — hidden when Dashboard (always ON) */}
                        {!isDashboard && (
                            <div className="customization-group">
                                <label>Modo de Nodos</label>
                                <div className="charts-toggle-row">
                                    <button
                                        type="button"
                                        className={`charts-toggle-btn ${!withCharts ? 'active' : ''}`}
                                        onClick={() => setWithCharts(false)}
                                    >
                                        📝 Solo texto
                                    </button>
                                    <button
                                        type="button"
                                        className={`charts-toggle-btn ${withCharts ? 'active' : ''}`}
                                        onClick={() => setWithCharts(true)}
                                    >
                                        📊 Texto + Gráfica
                                    </button>
                                </div>
                                {withCharts && (
                                    <p className="charts-toggle-hint">
                                        La IA añadirá datos numéricos visualizados en cada nodo
                                    </p>
                                )}
                            </div>
                        )}
                        {isDashboard && (
                            <div className="customization-group">
                                <div className="dashboard-badge">
                                    📊 Dashboard de Datos — cada nodo incluye una gráfica automáticamente
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <Button onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={isGenerating || !prompt.trim()}>
                            {isGenerating ? 'Generando...' : 'Generar Diagrama'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
