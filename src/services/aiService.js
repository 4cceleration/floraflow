import Groq from 'groq-sdk';

// --- Shared Groq singleton ---
const groqClient = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// ─── Per-diagram system prompts ────────────────────────────────────────────

const PROMPTS = {
    'Diagrama de Flujo': (detailLevel, nodeCountHint, descriptionHint, tone, theme) => `
Eres un experto en diagramas de flujo de procesos (Flowcharts).
Genera un "${detailLevel}" diagrama de flujo con ${nodeCountHint} nodos.

TOPOLOGÍA OBLIGATORIA (Diagrama de Flujo clásico):
- PRIMER nodo: type "terminal", title "Inicio" (nodo oval de entrada)
- ÚLTIMO nodo: type "terminal", title "Fin" (nodo oval de salida)
- Nodos de proceso intermedios: type "flora" (rectángulos)
- Nodos de decisión (preguntas Sí/No, condiciones): type "decision" (rombos)
- Nodos de riesgo o advertencia: type "risk"
- El flujo SIEMPRE termina convergiendo de vuelta hacia "Fin"
- Los edges desde nodos "decision" deben tener label "Sí" o "No"

TONO: "${tone}". TEMÁTICA: "${theme}".
Cada nodo debe tener ${descriptionHint} en su campo "content".

RESPONDE ÚNICAMENTE con JSON válido:
{
  "nodes": [
    { "id": "1", "type": "terminal", "data": { "title": "Inicio", "content": "" } },
    { "id": "2", "type": "flora",    "data": { "title": "Proceso X", "content": "..." } },
    { "id": "3", "type": "decision", "data": { "title": "¿Condición?", "content": "..." } },
    { "id": "n", "type": "terminal", "data": { "title": "Fin", "content": "" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": false },
    { "id": "e3-4", "source": "3", "target": "4", "label": "Sí", "animated": true },
    { "id": "e3-5", "source": "3", "target": "5", "label": "No", "animated": false }
  ]
}
REGLAS: Sin markdown. Sin posiciones. IDs de texto. Solo JSON.`,

    'Mapa Mental': (detailLevel, nodeCountHint, descriptionHint, tone, theme) => `
Eres un experto en Mapas Mentales.
Genera un mapa mental con ${nodeCountHint} nodos totales.

TOPOLOGÍA OBLIGATORIA (Mapa Mental):
- EXACTAMENTE UN nodo raíz central: type "flora", id "1", isRoot: true — este es el tema principal
- De la raíz deben salir DIRECTAMENTE de 4 a 7 ramas principales (hijos directos): type "flora"
- Cada rama principal puede tener 1 o 2 sub-ramas (nietos): type "example"
- Cada rama y sub-rama conecta directamente al nivel anterior
- La estructura es RADIAL: raíz en el centro, ramas en todas direcciones
- NO encadenes más de 3 niveles de profundidad (raíz → rama → sub-rama)

TONO: "${tone}". TEMÁTICA: "${theme}".
Cada nodo debe tener ${descriptionHint} en su campo "content".

RESPONDE ÚNICAMENTE con JSON válido:
{
  "nodes": [
    { "id": "1", "type": "flora",   "data": { "title": "Tema Central", "content": "..." } },
    { "id": "2", "type": "flora",   "data": { "title": "Rama 1", "content": "..." } },
    { "id": "3", "type": "flora",   "data": { "title": "Rama 2", "content": "..." } },
    { "id": "4", "type": "example", "data": { "title": "Sub-rama 1.1", "content": "..." } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": false },
    { "id": "e1-3", "source": "1", "target": "3", "animated": false },
    { "id": "e2-4", "source": "2", "target": "4", "animated": false }
  ]
}
REGLAS: Sin markdown. Sin posiciones. Solo JSON.`,

    'Mapa Conceptual': (detailLevel, nodeCountHint, descriptionHint, tone, theme) => `
Eres un experto en Mapas Conceptuales jerárquicos.
Genera un mapa conceptual con ${nodeCountHint} nodos.

TOPOLOGÍA OBLIGATORIA (Mapa Conceptual):
- EXACTAMENTE UN nodo raíz en la cima: type "flora", id "1" — el concepto más general/abstracto
- Diseño en árbol jerárquico: raíz → conceptos principales → subconceptos → detalles
- TODOS los nodos son type "flora" (los conceptos son iguales entre sí, solo difieren en nivel)
- Los edges DEBEN tener un "label" corto que indique la relación (ej: "es parte de", "incluye", "se divide en", "sirve para")
- Máximo 4 niveles de profundidad
- Un concepto puede tener múltiples hijos pero pocos padres (árbol, no red)

TONO: "${tone}". TEMÁTICA: "${theme}".
Cada nodo debe tener ${descriptionHint} en su campo "content".

RESPONDE ÚNICAMENTE con JSON válido:
{
  "nodes": [
    { "id": "1", "type": "flora", "data": { "title": "Concepto Principal", "content": "..." } },
    { "id": "2", "type": "flora", "data": { "title": "Subconcepto A", "content": "..." } },
    { "id": "3", "type": "flora", "data": { "title": "Subconcepto B", "content": "..." } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "label": "incluye", "animated": false },
    { "id": "e1-3", "source": "1", "target": "3", "label": "se divide en", "animated": false }
  ]
}
REGLAS: Sin markdown. Sin posiciones. Solo JSON. TODOS los edges con label de relación.`,

    'Árbol de Decisiones': (detailLevel, nodeCountHint, descriptionHint, tone, theme) => `
Eres un experto en Árboles de Decisión.
Genera un árbol de decisión con ${nodeCountHint} nodos.

TOPOLOGÍA OBLIGATORIA (Árbol de Decisiones):
- EXACTAMENTE UN nodo raíz a la izquierda: type "flora" — el punto de decisión inicial
- Nodos de decisión intermedios (puntos de bifurcación, opciones): type "decision"
- Nodos de resultado/hoja (al final de cada rama): type "example"
- La estructura es un ÁRBOL que se expande de izquierda a derecha (LR)
- Cada nodo intermediario ("decision") tiene exactamente 2 o 3 edges de salida
- Los edges DEBEN tener un "label" corto indicando la opción (ej: "Opción A", "Alta prob.", "Éxito", "Falla")
- Los nodos "example" son hojas (no tienen edges de salida)

TONO: "${tone}". TEMÁTICA: "${theme}".
Cada nodo debe tener ${descriptionHint} en su campo "content".

RESPONDE ÚNICAMENTE con JSON válido:
{
  "nodes": [
    { "id": "1", "type": "flora",   "data": { "title": "Decisión Raíz", "content": "..." } },
    { "id": "2", "type": "decision","data": { "title": "Opción A", "content": "..." } },
    { "id": "3", "type": "decision","data": { "title": "Opción B", "content": "..." } },
    { "id": "4", "type": "example", "data": { "title": "Resultado 1", "content": "..." } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "label": "Opción A", "animated": false },
    { "id": "e1-3", "source": "1", "target": "3", "label": "Opción B", "animated": false },
    { "id": "e2-4", "source": "2", "target": "4", "label": "Alta prob.", "animated": false }
  ]
}
REGLAS: Sin markdown. Sin posiciones. Solo JSON. Todos los edges del árbol con label.`,

    'Diagrama de Secuencia': (detailLevel, nodeCountHint, descriptionHint, tone, theme) => `
Eres un experto en Diagramas de Secuencia.
Genera un diagrama de secuencia con ${nodeCountHint} nodos.

TOPOLOGÍA OBLIGATORIA (Diagrama de Secuencia):
- Representa una LÍNEA DE TIEMPO de eventos o intercambios en orden cronológico estricto
- Todos los nodos son type "flora" (pasos cronológicos)
- EXCEPCIÓN: usa type "decision" para puntos de espera o condición temporal
- El flujo es estrictamente LINEAL o casi lineal (pocos o ningún branch)
- Los nodos representan eventos/mensajes/acciones en el tiempo
- La dirección es de arriba hacia abajo (TB) como una línea de tiempo

TONO: "${tone}". TEMÁTICA: "${theme}".
Cada nodo debe tener ${descriptionHint} en su campo "content".

RESPONDE ÚNICAMENTE con JSON válido:
{
  "nodes": [
    { "id": "1", "type": "flora", "data": { "title": "Evento 1", "content": "..." } },
    { "id": "2", "type": "flora", "data": { "title": "Evento 2", "content": "..." } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": true }
  ]
}
REGLAS: Sin markdown. Sin posiciones. Solo JSON.`,
};

// Default generic prompt for unknown types
const DEFAULT_PROMPT = (diagramType, detailLevel, nodeCountHint, descriptionHint, tone, theme) => `
Eres un experto en diagramas de conocimiento visual.
Genera un "${diagramType}" con ${nodeCountHint} nodos.
TONO: "${tone}". TEMÁTICA: "${theme}".
Cada nodo debe tener ${descriptionHint} en su campo "content".
Usa types: "flora", "decision", "risk", "example".
RESPONDE ÚNICAMENTE con JSON válido: { "nodes": [...], "edges": [...] }
REGLAS: Sin markdown. Sin posiciones. Solo JSON.`;

// ─── generateFlowchart ──────────────────────────────────────────────────────

export async function generateFlowchart(prompt, detailLevel, tone = 'Informativo', theme = 'Naturaleza', diagramType = 'Diagrama de Flujo') {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new Error('API Key de Groq no configurada. Por favor, añade VITE_GROQ_API_KEY en el archivo .env.');
    }

    let nodeCountHint, descriptionHint;
    if (detailLevel === 'Condensado') {
        nodeCountHint = '4 a 6 nodos';
        descriptionHint = 'un resumen conciso de 1 a 2 oraciones';
    } else if (detailLevel === 'Estándar') {
        nodeCountHint = '7 a 12 nodos';
        descriptionHint = 'una explicación clara de 2 a 3 oraciones';
    } else {
        nodeCountHint = '13 a 20 nodos';
        descriptionHint = 'un análisis detallado paso a paso';
    }

    const promptFn = PROMPTS[diagramType];
    const systemPrompt = promptFn
        ? promptFn(detailLevel, nodeCountHint, descriptionHint, tone, theme)
        : DEFAULT_PROMPT(diagramType, detailLevel, nodeCountHint, descriptionHint, tone, theme);

    const userMessage = `Tema para el diagrama: "${prompt}"\n\nGenera el ${diagramType} completo sobre este tema aplicando todo el conocimiento que tengas sobre él.`;

    const chatCompletion = await groqClient.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.15,
        max_completion_tokens: 4096,
        response_format: { type: 'json_object' }
    });

    const contentStr = chatCompletion.choices[0]?.message?.content || '';

    try {
        return JSON.parse(contentStr);
    } catch (e) {
        throw new Error('La IA no devolvió un formato JSON válido.');
    }
}

// ─── expandNode ────────────────────────────────────────────────────────────

export async function expandNode(parentNode, tone = 'Informativo', theme = 'Naturaleza') {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new Error('Missing VITE_GROQ_API_KEY in environment variables.');
    }

    const systemPrompt = `Eres un experto en expandir nodos de diagramas interactivos.
Toma el nodo padre dado y genera de 3 a 5 nodos hijos que profundicen en su concepto.
Hereda el mismo tipo de diagrama y estilo del padre.

DEBES usar los siguientes "type":
- "flora" (sub-conceptos o pasos)
- "decision" (opciones o bifurcaciones)
- "risk" (riesgos asociados)
- "example" (ejemplos reales)
- "terminal" (solo si el padre es un Diagrama de Flujo y el hijo es un punto final)

Los IDs de los nuevos nodos deben seguir el formato: "\${parentId}-child-1", "\${parentId}-child-2", etc.
Incluye "newEdges" conectando cada hijo al padre.

TONO: "${tone}". TEMÁTICA: "${theme}".

RESPONDE ÚNICAMENTE con JSON:
{
  "newNodes": [
    { "id": "parentId-child-1", "type": "flora", "data": { "title": "...", "content": "..." } }
  ],
  "newEdges": [
    { "id": "eParent-child-1", "source": "parentId", "target": "parentId-child-1", "animated": true }
  ]
}`;

    const userMessage = `Expande el siguiente nodo:
ID: "${parentNode.id}"
Título: "${parentNode.data.title}"
Contenido: "${parentNode.data.content}"
Tipo de diagrama: "${parentNode.data.diagramType ?? 'Diagrama de Flujo'}"`;

    const chatCompletion = await groqClient.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_completion_tokens: 4000,
        response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '';

    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (error) {
        console.error('Error parsing expansion JSON:', error);
        throw new Error('Failed to expand node.');
    }
}
