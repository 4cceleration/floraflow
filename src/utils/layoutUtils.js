import dagre from 'dagre';

const nodeWidth = 320;
const nodeHeight = 150; // Approximated height

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isLR = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, ranksep: isLR ? 250 : 120, nodesep: isLR ? 100 : 70 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        // Move the node based on dagre's calculated position
        // We shift it by half width/height so the origin matches React Flow's top-left
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};
