import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FloraNode({ data, type }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`flora-node type-${type} ${expanded ? 'expanded' : ''}`}>
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} />

            <div className="flora-node-header">
                <span>{data.title || 'Node'}</span>
                {data.content && (
                    <button
                        className="flora-node-toggle"
                        onClick={() => setExpanded(!expanded)}
                        title={expanded ? "Condensar" : "Expandir"}
                    >
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                )}
            </div>

            {expanded && data.content && (
                <div className="flora-node-content">
                    {data.content}

                    {data.onDeepDive && (
                        <button
                            onClick={() => data.onDeepDive(data.id, data)}
                            className="deep-dive-btn mt-3 w-full py-1.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold rounded-md transition-all"
                            disabled={data.isExpanding}
                        >
                            {data.isExpanding ? 'Expadiendo...' : '✨ Profundizar'}
                        </button>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        </div>
    );
}
