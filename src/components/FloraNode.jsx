import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronUp } from 'lucide-react';

// diagramType → CSS class
const DIAGRAM_CLASS = {
    'Diagrama de Flujo': 'dt-flujo',
    'Mapa Conceptual': 'dt-conceptual',
    'Mapa Mental': 'dt-mental',
    'Árbol de Decisiones': 'dt-decisiones',
    'Diagrama de Secuencia': 'dt-secuencia',
};

// Determine the geometric shape to render based on diagram + node type
function getShapeClass(diagramType, nodeType, isRoot) {
    if (diagramType === 'Diagrama de Flujo') {
        if (nodeType === 'terminal') return 'shape-terminal';  // oval
        if (nodeType === 'decision') return 'shape-diamond';   // diamond
        return 'shape-rect';                                    // process rectangle
    }
    if (diagramType === 'Árbol de Decisiones') {
        if (nodeType === 'decision') return 'shape-circle';    // chance node = circle
        if (nodeType === 'example') return 'shape-outcome';   // outcome = salmon pill
        return 'shape-rect';                                    // decision square
    }
    if (diagramType === 'Mapa Mental') {
        if (isRoot) return 'shape-root';                       // large central pill
        return 'shape-pill';                                    // all branches = pill
    }
    if (diagramType === 'Mapa Conceptual') {
        if (isRoot) return 'shape-concept-root';               // prominent header
        return 'shape-concept';                                 // standard concept rect
    }
    // Secuencia + default
    return 'shape-rect';
}

export default function FloraNode({ data, type }) {
    const [expanded, setExpanded] = useState(false);

    const dtClass = DIAGRAM_CLASS[data.diagramType] ?? 'dt-flujo';
    const isRoot = !!data.isRoot;
    const shapeClass = getShapeClass(data.diagramType, type, isRoot);

    // For diamond/circle shapes: hide expand toggle (they show title only)
    const isCompactShape = shapeClass === 'shape-diamond' || shapeClass === 'shape-circle';

    return (
        <div className={`flora-node ${dtClass} ${shapeClass} ${isRoot ? 'is-root' : ''} ${expanded ? 'expanded' : ''}`}>
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

            <div className="flora-node-header">
                {data.diagramType === 'Diagrama de Secuencia' && (
                    <span className="seq-badge">▶</span>
                )}
                <span className="node-title">{data.title || 'Node'}</span>
                {data.content && !isCompactShape && (
                    <button
                        className="flora-node-toggle"
                        onClick={() => setExpanded(!expanded)}
                        title={expanded ? 'Condensar' : 'Expandir'}
                    >
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                )}
            </div>

            {expanded && data.content && !isCompactShape && (
                <div className="flora-node-content">
                    {data.content}
                    {data.onDeepDive && (
                        <button
                            onClick={() => data.onDeepDive(data.id, data)}
                            className="deep-dive-btn mt-3 w-full py-1.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold rounded-md transition-all"
                            disabled={data.isExpanding}
                        >
                            {data.isExpanding ? 'Expandiendo...' : '✨ Profundizar'}
                        </button>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </div>
    );
}
