import Groq from 'groq-sdk';

// --- Shared Groq singleton ---
const groqClient = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// --- generateFlowchart ---
export async function generateFlowchart(prompt, detailLevel, tone = 'Informativo', theme = 'Naturaleza', diagramType = 'Diagrama de Flujo') {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new Error('API Key de Groq no configurada. Por favor, añade VITE_GROQ_API_KEY en el archivo .env.');
    }

    let nodeCountHint = '';
    let descriptionHint = '';

    if (detailLevel === 'Condensado') {
        nodeCountHint = '3 a 5 nodos';
        descriptionHint = 'un resumen muy conciso de 1 o 2 oraciones principales';
    } else if (detailLevel === 'Estándar') {
        nodeCountHint = '6 a 10 nodos';
        descriptionHint = 'una explicación clara y directa de 2 o 3 oraciones por cada punto';
    } else if (detailLevel === 'Extenso') {
        nodeCountHint = '12 a 20 nodos';
        descriptionHint = 'un análisis profundo y detallado paso a paso, con un texto explicativo largo en cada nodo';
    }

    const systemPrompt = `Eres un experto en estructuración de diagramas de conocimiento visual.
Tu objetivo es analizar un tema y generar un "${diagramType}" en formato JSON representable como un Grafo Dirigido.
El nivel de detalle requerido es "${detailLevel}", lo que significa que DEBES generar entre ${nodeCountHint} y cada nodo debe tener ${descriptionHint} en su campo "content".

El TONO DE VOZ que debes usar en todo el contenido (títulos y descripciones) es: "${tone}". (Ej. Si es sarcástico, sé sarcástico; si es místico, usa analogías mágicas).
La VIBRA/TEMÁTICA central de la narrativa debe ser: "${theme}". Adáptate a esta temática para dar ejemplos o comparaciones.

ESTRUCTURA ARQUITECTÓNICA REQUERIDA ("${diagramType}"):
- Si es "Diagrama de Flujo": Crea pasos secuenciales lógicos (Paso 1 -> Paso 2 -> Decisión -> A o B).
- Si es "Mapa Conceptual": Crea nodos unidos por relaciones lógicas jerárquicas (Concepto General -> Subconceptos).
- Si es "Árbol de Decisiones": Comienza con una pregunta raíz y plaga el diagrama de múltiples caminos paralelos basados en condiciones.
- Si es "Mapa Mental": Un nodo central "raíz" del cual explotan múltiples temas radiales.
- Si es "Diagrama de Secuencia": Orden cronológico estricto simulando etapas del tiempo o intercambios.

DEBES estructurar el diagrama respetando esa topología.
DEBES usar los siguientes "type" para clasificar visualmente los nodos:
- "flora" (pasos normales o conceptos)
- "decision" (paralelos, opciones, preguntas)
- "risk" (riesgos, advertencias por mal manejo)
- "example" (ejemplos reales, casos prácticos)

DEBES responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "nodes": [
    {
      "id": "1",
      "type": "flora",
      "data": { "title": "Concepto Central", "content": "Detalles..." }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": true }
  ]
}

REGLAS ESTRICTAS:
1. No incluyas markdown, saludos ni código en texto plano. Devuelve directamente UN SOLO JSON válido.
2. NO incluyas posiciones ("position": { "x": ..., "y": ... }) en los nodos. El motor de renderizado calculará esto automáticamente.
3. Los IDs de los nodos deben ser cadenas de texto ("1", "2").
4. Genera múltiples "edges" que se ramifiquen y se vuelvan a unir si es necesario formando un ecosistema complejo.`;

    const userMessage = `Tema solicitado para el diagrama: ${prompt}

Genera un ecosistema de información complejo (mecanismos, paralelos, ejemplos, riesgos) en el formato JSON requerido apoyándote en tu conocimiento sobre el tema.`;

    const chatCompletion = await groqClient.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_completion_tokens: 4000,
        response_format: { type: 'json_object' }
    });

    const contentStr = chatCompletion.choices[0]?.message?.content || '';

    try {
        return JSON.parse(contentStr);
    } catch (e) {
        throw new Error('La IA no devolvió un formato JSON válido.');
    }
}

// --- expandNode ---
export async function expandNode(parentNode, tone = 'Informativo', theme = 'Naturaleza') {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new Error('Missing VITE_GROQ_API_KEY in environment variables.');
    }

    const systemPrompt = `Eres un experto en expandir ramificaciones de diagramas interactivos.
Tu objetivo es tomar un concepto específico (un nodo padre) y "profundizar" en él, generando 3 o 4 nuevos nodos hijos detallados que extiendan y expliquen ese concepto.

El TONO DE VOZ que debes usar en todo el contenido es: "${tone}".
La VIBRA/TEMÁTICA central de la narrativa debe ser: "${theme}".

DEBES usar los siguientes "type" para clasificar visualmente los nuevos nodos hijos:
- "flora" (pasos normales o sub-conceptos)
- "decision" (paralelos, opciones, preguntas)
- "risk" (riesgos asociados a esto)
- "example" (ejemplos reales o casos)

DEBES responder ÚNICAMENTE con un objeto JSON válido que contenga la propiedad "newNodes".
INYECCIÓN CRÍTICA: Debes asegurarte de que los IDs de los nuevos nodos sean ÚNICOS usando el formato: "\${parentId}-child-1", "\${parentId}-child-2", etc.
También debes incluir la propiedad "newEdges" conectando TODOS estos nuevos hijos de vuelta al "parentId" dado.

Estructura EXACTA requerida:
{
  "newNodes": [
    {
      "id": "parentNodeId-child-1",
      "type": "flora",
      "data": { "title": "Sub-concepto 1", "content": "Detalles profundos..." }
    }
  ],
  "newEdges": [
    { "id": "eParent-child-1", "source": "parentNodeId", "target": "parentNodeId-child-1", "animated": true }
  ]
}

REGLAS ESTRICTAS:
1. No incluyas markdown, saludos ni código en texto plano. Devuelve directamente UN SOLO JSON válido.
2. NO incluyas posiciones ("position"). El motor de renderizado las calculará automáticamente.`;

    const userMessage = `Por favor, expande el siguiente nodo de mi diagrama.
ID del nodo padre: "${parentNode.id}"
Título del nodo padre: "${parentNode.data.title}"
Contenido del nodo padre: "${parentNode.data.content}"

Genera de 3 a 5 sub-nodos ricos en información relacionados estrictamente con este tema.`;

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
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error formatting JSON from AI expansion:', error, 'Raw output:', responseText);
        throw new Error('Failed to expand node.');
    }
}
