import React, { useState, useCallback, useEffect, useRef } from 'react';
import { applyNodeChanges, applyEdgeChanges, getNodesBounds, getViewportForBounds } from 'reactflow';
import FloraCanvas from './components/FloraCanvas';
import AddFloraModal from './components/AddFloraModal';
import PresentationMode from './components/PresentationMode';
import Button from './components/Button';
import { Plus, Download, Trash2, Presentation, Undo2, Redo2 } from 'lucide-react';
import { expandNode } from './services/aiService';
import { getLayoutedElements } from './utils/layoutUtils';
import { toPng } from 'html-to-image';
import './index.css';

const MAX_HISTORY = 60;

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const [diagramType, setDiagramType] = useState('Diagrama de Flujo');

  // ── Edges ref for stale-closure safety ───────────────────
  const edgesRef = useRef(edges);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // ── Undo / Redo history stack ─────────────────────────────
  const historyRef = useRef([{ nodes: [], edges: [] }]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((n, e) => {
    const sliced = historyRef.current.slice(0, historyIndexRef.current + 1);
    sliced.push({ nodes: n, edges: e });
    if (sliced.length > MAX_HISTORY) sliced.shift();
    historyRef.current = sliced;
    historyIndexRef.current = sliced.length - 1;
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const { nodes: n, edges: e } = historyRef.current[historyIndexRef.current];
      setNodes(n);
      setEdges(e);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const { nodes: n, edges: e } = historyRef.current[historyIndexRef.current];
      setNodes(n);
      setEdges(e);
    }
  }, []);

  // ── Global keyboard shortcuts ─────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Don't intercept when user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault(); handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo]);

  // ── ReactFlow change handlers ─────────────────────────────
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []
  );

  // ── Delete node ───────────────────────────────────────────
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes(nds => {
      const next = nds.filter(n => n.id !== nodeId);
      setEdges(eds => {
        const nextE = eds.filter(e => e.source !== nodeId && e.target !== nodeId);
        pushHistory(next, nextE);
        return nextE;
      });
      return next;
    });
  }, [pushHistory]);

  // ── Update node data ──────────────────────────────────────
  const handleUpdateNode = useCallback((nodeId, newData) => {
    setNodes(nds => {
      const next = nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      );
      pushHistory(next, edgesRef.current);
      return next;
    });
  }, [pushHistory]);

  // ── Clear canvas ──────────────────────────────────────────
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0) return;
    if (!window.confirm('¿Borrar todo el canvas? Esta acción se puede deshacer con Ctrl+Z.')) return;
    pushHistory(nodes, edgesRef.current);
    setNodes([]);
    setEdges([]);
  }, [nodes, pushHistory]);

  // ── Deep Dive ─────────────────────────────────────────────
  const handleDeepDive = useCallback(async (nodeId, nodeData) => {
    try {
      setNodes(nds => nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: true } } : n
      ));
      setIsExpanding(true);

      const expansionData = await expandNode({ id: nodeId, data: nodeData });

      if (expansionData.newNodes && expansionData.newEdges) {
        const currentEdges = edgesRef.current;

        const mappedNewNodes = expansionData.newNodes.map(n => ({
          ...n,
          data: {
            ...n.data,
            onDeepDive: handleDeepDive,
            onDeleteNode: handleDeleteNode,
            onUpdateNode: handleUpdateNode,
            isExpanding: false,
            diagramType: nodeData.diagramType ?? 'Diagrama de Flujo'
          }
        }));

        setNodes(currentNodes => {
          const updatedNodes = [...currentNodes, ...mappedNewNodes];
          const updatedEdges = [...currentEdges, ...expansionData.newEdges];
          const { nodes: lN, edges: lE } = getLayoutedElements(updatedNodes, updatedEdges);
          setEdges(lE);
          pushHistory(lN, lE);
          return lN.map(n =>
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
  }, [handleDeleteNode, handleUpdateNode, pushHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add flowchart from modal ──────────────────────────────
  const handleAddFlowchart = useCallback((newNodes, newEdges) => {
    const currentEdges = edgesRef.current;
    const combinedNodes = [...nodes, ...newNodes];
    const combinedEdges = [...currentEdges, ...newEdges];

    const VERTICAL = ['Diagrama de Flujo', 'Diagrama de Secuencia', 'Mapa Conceptual'];
    const direction = VERTICAL.includes(diagramType) ? 'TB' : 'LR';
    const { nodes: lN, edges: lE } = getLayoutedElements(combinedNodes, combinedEdges, direction);

    const finalized = lN.map(n => ({
      ...n,
      data: {
        ...n.data,
        onDeepDive: handleDeepDive,
        onDeleteNode: handleDeleteNode,
        onUpdateNode: handleUpdateNode,
      }
    }));

    setNodes(finalized);
    setEdges(lE);
    pushHistory(finalized, lE);
  }, [nodes, diagramType, handleDeepDive, handleDeleteNode, handleUpdateNode, pushHistory]);

  // ── Export PNG ────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const rfElement = document.querySelector('.react-flow__viewport');
    if (!rfElement) return;

    const nodesBounds = getNodesBounds(nodes);
    const padding = 150;
    const transform = getViewportForBounds(
      nodesBounds,
      nodesBounds.width + padding * 2,
      nodesBounds.height + padding * 2,
      0.1, 2
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
      .catch(() => alert('Failed to export image.'));
  }, [nodes, diagramType]);

  const canUndo = () => historyIndexRef.current > 0;
  const canRedo = () => historyIndexRef.current < historyRef.current.length - 1;

  return (
    <div className="app-container">
      <FloraCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />

      <div className="add-flora-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Undo / Redo */}
        <div className="toolbar-group">
          <button
            className="toolbar-icon-btn"
            onClick={handleUndo}
            title="Deshacer (Ctrl+Z)"
            disabled={!nodes.length && historyIndexRef.current === 0}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="toolbar-icon-btn"
            onClick={handleRedo}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* Main action */}
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add a Flora
        </Button>

        {nodes.length > 0 && (
          <>
            {/* Presentation mode */}
            <Button onClick={() => setIsPresentationOpen(true)} className="btn-present">
              <Presentation size={18} /> Presentar
            </Button>

            {/* Export */}
            <Button onClick={handleExport}>
              <Download size={18} /> Export
            </Button>

            {/* Clear canvas */}
            <button
              className="toolbar-icon-btn toolbar-icon-btn--danger"
              onClick={handleClearCanvas}
              title="Limpiar canvas"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>

      <AddFloraModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddFlowchart={handleAddFlowchart}
        diagramType={diagramType}
        setDiagramType={setDiagramType}
      />

      {isPresentationOpen && (
        <PresentationMode
          nodes={nodes}
          edges={edges}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
