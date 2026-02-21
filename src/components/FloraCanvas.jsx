import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls
} from 'reactflow';
import 'reactflow/dist/style.css';
import FloraNode from './FloraNode';
import LiveEcosystem from './LiveEcosystem';

const nodeTypes = {
    flora: FloraNode,
    decision: FloraNode,
    risk: FloraNode,
    example: FloraNode
};

export default function FloraCanvas({ nodes, edges, onNodesChange, onEdgesChange }) {

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                panOnScroll
                selectionOnDrag
            >
                <LiveEcosystem />
                <Background gap={24} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}
