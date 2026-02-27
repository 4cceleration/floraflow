import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronUp, X, Pencil, Check } from 'lucide-react';
import MiniChart from './MiniChart';

// diagramType → CSS class
const DIAGRAM_CLASS = {
    'Diagrama de Flujo': 'dt-flujo',
    'Mapa Conceptual': 'dt-conceptual',
    'Mapa Mental': 'dt-mental',
    'Árbol de Decisiones': 'dt-decisiones',
    'Diagrama de Secuencia': 'dt-secuencia',
    'Dashboard de Datos': 'dt-dashboard',
};

function getShapeClass(diagramType, nodeType, isRoot) {
    if (diagramType === 'Dashboard de Datos') return 'shape-dashboard';
    if (diagramType === 'Diagrama de Flujo') {
        if (nodeType === 'terminal') return 'shape-terminal';
        if (nodeType === 'decision') return 'shape-diamond';
        return 'shape-rect';
    }
    if (diagramType === 'Árbol de Decisiones') {
        if (nodeType === 'decision') return 'shape-circle';
        if (nodeType === 'example') return 'shape-outcome';
        return 'shape-rect';
    }
    if (diagramType === 'Mapa Mental') {
        if (isRoot) return 'shape-root';
        return 'shape-pill';
    }
    if (diagramType === 'Mapa Conceptual') {
        if (isRoot) return 'shape-concept-root';
        return 'shape-concept';
    }
    return 'shape-rect';
}

export default function FloraNode({ data, type, id }) {
    const [expanded, setExpanded] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(data.title || '');
    const [editContent, setEditContent] = useState(data.content || '');
    const titleInputRef = useRef(null);

    const dtClass = DIAGRAM_CLASS[data.diagramType] ?? 'dt-flujo';
    const isRoot = !!data.isRoot;
    const shapeClass = getShapeClass(data.diagramType, type, isRoot);
    const isCompact = shapeClass === 'shape-diamond' || shapeClass === 'shape-circle';
    const isDashboard = data.diagramType === 'Dashboard de Datos';

    // Dashboard nodes start expanded to show the chart
    useEffect(() => {
        if (isDashboard) setExpanded(true);
    }, [isDashboard]);

    useEffect(() => {
        if (editingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [editingTitle]);

    const handleStartEdit = (e) => {
        e.stopPropagation();
        setEditTitle(data.title || '');
        setEditContent(data.content || '');
        setEditingTitle(true);
        setExpanded(true);
    };

    const handleSaveEdit = (e) => {
        e?.stopPropagation();
        setEditingTitle(false);
        if (data.onUpdateNode) {
            data.onUpdateNode(id, {
                title: editTitle.trim() || data.title,
                content: editContent.trim()
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
        if (e.key === 'Escape') setEditingTitle(false);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (data.onDeleteNode) data.onDeleteNode(id);
    };

    return (
        <div className={`flora-node ${dtClass} ${shapeClass} ${isRoot ? 'is-root' : ''} ${expanded ? 'expanded' : ''} ${editingTitle ? 'is-editing' : ''}`}>
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

            {/* ── Header ── */}
            <div className="flora-node-header">
                {data.diagramType === 'Diagrama de Secuencia' && <span className="seq-badge">▶</span>}

                {editingTitle ? (
                    <input ref={titleInputRef} className="node-title-input"
                        value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={handleKeyDown} onBlur={handleSaveEdit}
                        onClick={e => e.stopPropagation()} placeholder="Título del nodo..."
                    />
                ) : (
                    <span className="node-title" onDoubleClick={handleStartEdit} title="Doble clic para editar">
                        {data.title || 'Node'}
                    </span>
                )}

                <div className="node-actions">
                    {editingTitle ? (
                        <button className="flora-node-action-btn save-btn" onClick={handleSaveEdit} title="Guardar"><Check size={14} /></button>
                    ) : (
                        <button className="flora-node-action-btn edit-btn" onClick={handleStartEdit} title="Editar"><Pencil size={13} /></button>
                    )}
                    {data.content && !isCompact && !editingTitle && (
                        <button className="flora-node-toggle" onClick={e => { e.stopPropagation(); setExpanded(!expanded); }} title={expanded ? 'Condensar' : 'Expandir'}>
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    )}
                    <button className="flora-node-action-btn delete-btn" onClick={handleDelete} title="Eliminar"><X size={14} /></button>
                </div>
            </div>

            {/* ── Chart (renders when node has chartData, always visible for Dashboard) ── */}
            {data.chartData && (isDashboard || expanded) && (
                <MiniChart chartData={data.chartData} diagramType={data.diagramType} />
            )}

            {/* ── Content ── */}
            {expanded && !isCompact && (
                <div className="flora-node-content">
                    {editingTitle ? (
                        <textarea className="node-content-textarea" value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            onClick={e => e.stopPropagation()} placeholder="Descripción del nodo..." rows={4}
                        />
                    ) : (
                        <>
                            {data.content}
                            {data.onDeepDive && !isDashboard && (
                                <button onClick={e => { e.stopPropagation(); data.onDeepDive(id, data); }}
                                    className="deep-dive-btn mt-3 w-full py-1.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold rounded-md transition-all"
                                    disabled={data.isExpanding}>
                                    {data.isExpanding ? 'Expandiendo...' : '✨ Profundizar'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </div>
    );
}
