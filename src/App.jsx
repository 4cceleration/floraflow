import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const [diagramType, setDiagramType] = useState('Diagrama de Flujo');

  // Keep a ref to edges so async handlers always read the latest value
  const edgesRef = useRef(edges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleDeepDive = useCallback(async (nodeId, nodeData) => {
    try {
      // Mark node as loading
      setNodes(nds => nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: true } } : n
      ));
      setIsExpanding(true);

      const expansionData = await expandNode({ id: nodeId, data: nodeData });

      if (expansionData.newNodes && expansionData.newEdges) {
        const mappedNewNodes = expansionData.newNodes.map(n => ({
          ...n,
          data: { ...n.data, onDeepDive: handleDeepDive, isExpanding: false }
        }));

        // Read the current edges snapshot from the ref (avoids stale closure)
        const currentEdges = edgesRef.current;

        setNodes(currentNodes => {
          const updatedNodes = [...currentNodes, ...mappedNewNodes];
          const updatedEdges = [...currentEdges, ...expansionData.newEdges];

          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(updatedNodes, updatedEdges);
          setEdges(layoutedEdges);

          return layoutedNodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: false } } : n
          );
        });
      }
    } catch (error) {
      console.error('Deep dive failed:', error);
      alert(error.message);
      setNodes(nds => nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: false } } : n
      ));
    } finally {
      setIsExpanding(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddFlowchart = useCallback((newNodes, newEdges) => {
    const currentEdges = edgesRef.current;
    const combinedNodes = [...nodes, ...newNodes];
    const combinedEdges = [...currentEdges, ...newEdges];

    const direction = diagramType === 'Diagrama de Secuencia' ? 'LR' : 'TB';
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(combinedNodes, combinedEdges, direction);

    const finalizedNodes = layoutedNodes.map(n => ({
      ...n,
      data: { ...n.data, onDeepDive: handleDeepDive }
    }));

    setNodes(finalizedNodes);
    setEdges(layoutedEdges);
  }, [nodes, diagramType, handleDeepDive]);

  const handleExport = useCallback(() => {
    const rfElement = document.querySelector('.react-flow__viewport');
    if (!rfElement) return;

    const nodesBounds = getNodesBounds(nodes);
    const padding = 150;
    const transform = getViewportForBounds(
      nodesBounds,
      nodesBounds.width + padding * 2,
      nodesBounds.height + padding * 2,
      0.1,
      2
    );

    toPng(rfElement, {
      backgroundColor: '#030a05',
      width: nodesBounds.width + padding * 2,
      height: nodesBounds.height + padding * 2,
      style: {
        width: nodesBounds.width + padding * 2,
        height: nodesBounds.height + padding * 2,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
      pixelRatio: 2
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `floraflow-${diagramType || 'diagram'}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating image:', error);
        alert('Failed to export image. Make sure the graph is not excessively large.');
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
          <Button onClick={handleExport}>
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
