import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import FloraNode from './FloraNode';
import LiveEcosystem from './LiveEcosystem';
import RootEdge from './RootEdge';

const nodeTypes = {
    flora: FloraNode,
    decision: FloraNode,
    risk: FloraNode,
    example: FloraNode,
    terminal: FloraNode,
};

const edgeTypes = {
    root: RootEdge,
};

// Detect mobile (touch device) for adapted ReactFlow behavior
const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

export default function FloraCanvas({ nodes, edges, onNodesChange, onEdgesChange }) {
    const mobile = isMobile();

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                minZoom={0.05}
                maxZoom={2}
                // Desktop: pan on scroll. Mobile: pinch-to-zoom only
                panOnScroll={!mobile}
                zoomOnPinch
                zoomOnScroll={!mobile}
                // On mobile, single finger pans — disable drag selection so it doesn't conflict
                selectionOnDrag={!mobile}
                panOnDrag={mobile ? [0, 1, 2] : [1, 2]}  // all buttons on mobile
                // Better touch UX
                touchPannable
                preventScrolling
                // Edge render
                defaultEdgeOptions={{ type: 'root' }}
            >
                <LiveEcosystem />
                <Background gap={24} size={1} />
                <Controls showInteractive={false} />
                {/* MiniMap — hidden on mobile to save screen space */}
                {!mobile && (
                    <MiniMap
                        nodeColor={(n) => {
                            const dt = n.data?.diagramType;
                            if (dt === 'Mapa Conceptual') return '#38bdf8';
                            if (dt === 'Mapa Mental') return '#a78bfa';
                            if (dt === 'Árbol de Decisiones') return '#f59e0b';
                            if (dt === 'Diagrama de Secuencia') return '#22d3ee';
                            return '#42f57e';
                        }}
                        maskColor="rgba(3,10,5,0.6)"
                        style={{
                            background: 'rgba(10,20,13,0.9)',
                            border: '1px solid rgba(66,245,126,0.2)',
                            borderRadius: '8px',
                        }}
                    />
                )}
            </ReactFlow>
        </div>
    );
}
