import React, { useState, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, getNodesBounds, getViewportForBounds } from 'reactflow';
import FloraCanvas from './components/FloraCanvas';
import AddFloraModal from './components/AddFloraModal';
import Button from './components/Button';
import { Plus, Download } from 'lucide-react';
import { expandNode } from './services/aiService';
import { getLayoutedElements } from './utils/layoutUtils';
import { toPng } from 'html-to-image';
import './index.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [diagramType, setDiagramType] = useState('Diagrama de Flujo'); // Lifted State for Export naming

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const handleDeepDive = async (nodeId, nodeData) => {
    try {
      // Set loading state on the specific node
      setNodes(nds => nds.map(n => {
        if (n.id === nodeId) {
          n.data = { ...n.data, isExpanding: true };
        }
        return n;
      }));
      setIsExpanding(true);

      const expansionData = await expandNode({ id: nodeId, data: nodeData });

      if (expansionData.newNodes && expansionData.newEdges) {
        // Map new nodes to include the deep dive function
        const mappedNewNodes = expansionData.newNodes.map(n => ({
          ...n,
          data: { ...n.data, onDeepDive: handleDeepDive, isExpanding: false }
        }));

        setNodes(currentNodes => {
          const currentEdges = edges;
          const updatedNodes = [...currentNodes, ...mappedNewNodes];
          const updatedEdges = [...currentEdges, ...expansionData.newEdges];

          // Re-run layouting for the entire graph so it makes space for the new branches
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(updatedNodes, updatedEdges);
          setEdges(layoutedEdges);

          // Remove the loading state from parent
          return layoutedNodes.map(n => {
            if (n.id === nodeId) {
              n.data = { ...n.data, isExpanding: false };
            }
            return n;
          });
        });
      }
    } catch (error) {
      console.error("Deep dive failed:", error);
      alert(error.message);
      // Revert loading state
      setNodes(nds => nds.map(n => {
        if (n.id === nodeId) {
          n.data = { ...n.data, isExpanding: false };
        }
        return n;
      }));
    } finally {
      setIsExpanding(false);
    }
  };

  // Add entirely new flowchart to the canvas (merging with existing)
  const handleAddFlowchart = (newNodes, newEdges) => {
    const combinedNodes = [...nodes, ...newNodes];
    const combinedEdges = [...edges, ...newEdges];

    // Determine direction based on `diagramType`
    let direction = 'TB';
    if (diagramType === 'Diagrama de Secuencia') direction = 'LR';
    else if (diagramType === 'Mapa Mental') direction = 'TB'; // Can adjust ranker later if needed

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(combinedNodes, combinedEdges, direction);

    // Map the deep dive function
    const finalizedNodes = layoutedNodes.map(n => ({
      ...n,
      data: { ...n.data, onDeepDive: handleDeepDive }
    }));

    setNodes(finalizedNodes);
    setEdges(layoutedEdges);
  };

  // Export Canvas to HD Full-Size PNG Image
  const handleExport = useCallback(() => {
    const rfElement = document.querySelector('.react-flow__viewport');
    if (!rfElement) return;

    // Calculate real size of entire graph
    const nodesBounds = getNodesBounds(nodes);
    // Add a good amount of padding so it looks breathable
    const padding = 150;
    const transform = getViewportForBounds(nodesBounds, nodesBounds.width + padding * 2, nodesBounds.height + padding * 2, 0.1, 2);

    toPng(rfElement, {
      backgroundColor: '#030a05',
      width: nodesBounds.width + padding * 2,
      height: nodesBounds.height + padding * 2,
      style: {
        width: nodesBounds.width + padding * 2,
        height: nodesBounds.height + padding * 2,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
      pixelRatio: 2 // High Res
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `floraflow-${diagramType || 'diagram'}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating image:', error);
        alert("Failed to export image. Make sure the graph is not excessively large.");
      });
  }, [nodes, diagramType]);

  return (
    <div className="app-container">
      <FloraCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />

      <div className="add-flora-container" style={{ display: 'flex', gap: '16px' }}>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add a Flora
        </Button>

        {nodes.length > 0 && (
          <Button onClick={handleExport} style={{ backgroundColor: 'rgba(3, 10, 5, 0.9)', color: '#42f57e' }}>
            <Download size={20} /> Export PNG
          </Button>
        )}
      </div>

      <AddFloraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFlowchart={handleAddFlowchart}
        diagramType={diagramType}
        setDiagramType={setDiagramType}
      />
    </div>
  );
}

export default App;
