# AcaDrone Reboot

Plataforma de una sola página para estimar la cadena de recuperación de PET aplicado a chasis de drones educativos. El reinicio
2024 prioriza accesibilidad, narrativa rica y validaciones inmediatas para capturar datos confiables incluso en contextos sin
JavaScript.

## Secciones obligatorias

1. Carta de presentación  
2. Página de título  
3. Contenido (índice con anclas y modo guiado)  
4. Resumen ejecutivo  
5. Bosquejo de estudio  
6. Resultado detallado (simulador)  
7. Alternativa del sistema  
8. Recomendaciones  
9. Resumen  
10. Apéndice

## Entradas y ecuaciones clave

Parámetros (`N_p`, `D`, `g_d`, `φ`, `r`, `η`, `f_chasis`, `costo_unitario`).

```
PET_gen = N_p * g_d * D
PET_rec = PET_gen * φ * r
F = PET_rec * η
Q = floor(F / f_chasis)
Costo_mensual = Q * costo_unitario
```

KPIs renderizados: `PET_gen`, `PET_rec`, `F`, `Q`, `costo_unitario`, `costo_mensual`.

## Arquitectura actual

- **`index.html`**: contiene las diez secciones, valores pre-renderizados para modo sin JavaScript, tabla KPI accesible y gráfico
  semántico con descripción textual.
- **`styles/main.css`**: tema claro con contraste AA+, componentes reutilizables (`panel`, `highlight-grid`, `chart`).
- **`scripts/main.js`**: orquestador modular que activa validaciones, recalcula métricas y controla el modo guiado por secciones.
- **`scripts/modules/calculation.js`**: lógica de saneamiento numérico, formateo y cálculo de métricas.
- **`scripts/services/configuration.js`**: carga `data/defaults.json` con retroceso a valores embebidos para escenarios sin servidor.
- **`data/defaults.json`**: parámetros base descargables desde el apéndice.
- **`Reboot.md`**: diagnóstico estratégico y hoja de ruta para futuras iteraciones.

## Cambios recientes

- Se eliminó la versión anterior y se reconstruyó el sitio desde `Reboot.md`, introduciendo arquitectura modular con datos
  pre-renderizados y un modo guiado opcional.  
- Se rediseñó el simulador para validar campos en tiempo real, mostrar mensajes accesibles y mantener métricas disponibles sin
  depender de `fetch`.  
- Se movió `Reboot.md` a la raíz del repositorio para facilitar su consulta durante futuras iteraciones.

## Propuestas de desarrollo

- Publicar una API mock (`/api/escenarios`) que permita versionar conjuntos de parámetros y alimentar el simulador con escenarios
  históricos para comparaciones A/B.  
- Implementar auditorías automáticas de accesibilidad (axe-core/pa11y) en CI para garantizar que cada iteración mantenga los
  estándares AA.  
- Diseñar un panel de análisis con visualizaciones históricas (line charts y sankey) utilizando los datos exportados desde la
  plataforma.

## Estructura de carpetas

```
/
├─ README.md
├─ Reboot.md
├─ index.html
├─ data/
│  └─ defaults.json
├─ scripts/
│  ├─ main.js
│  ├─ modules/
│  │  └─ calculation.js
│  └─ services/
│     └─ configuration.js
└─ styles/
   └─ main.css
```

## Cómo ejecutar

Abrir `index.html` en un navegador moderno. El simulador funciona en modo desconectado gracias a los valores embebidos y mejora
los cálculos cuando `data/defaults.json` está disponible a través de un servidor estático.
