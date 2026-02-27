import React from 'react';
import { getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';

export default function RootEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: '#3f2b1d', // Root base color
                    strokeWidth: 8,
                    strokeLinecap: 'round',
                    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))'
                }}
            />
            {/* Decorative vine twisting around */}
            <path
                d={edgePath}
                style={{
                    ...style,
                    stroke: '#4ade80', // Vine color
                    strokeWidth: 3,
                    strokeLinecap: 'round',
                    strokeDasharray: '5 15', // Creates a dashed effect that looks like wrapping
                    fill: 'none',
                }}
            />

            {/* Small leaf label in the middle */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: 'transparent',
                        pointerEvents: 'all',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    className="nodrag nopan"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#22c55e" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', transform: 'rotate(45deg)' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="none" />
                        <path d="M12 22C12 22 22 17.0001 22 12C22 6.48003 17.52 2 12 2C12 2 2 6.99986 2 12C2 17.5199 6.48 22 12 22Z" fill="#22c55e" />
                        <path d="M12 22L12 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
