# Reboot

## Resumen ejecutivo
El sitio actual de AcaDrone presenta una narrativa sólida que recorre la cadena de valor del PET reutilizado para drones, apoyado en una arquitectura de una sola página con navegación por anclas, formulario paramétrico y visualizaciones básicas. El flujo favorece la comprensión progresiva del proyecto, pero depende de valores por defecto para operar y carece de señales explícitas que orienten la captura de datos.

## Diagnóstico detallado del estado actual
- **Narrativa y contenido**: Las diez secciones exigidas están cubiertas con textos concisos que enfatizan la propuesta circular. Sin embargo, varias secciones son breves y podrían beneficiarse de datos cuantitativos, referencias o historias de usuarios para reforzar credibilidad.
- **Interactividad**: El formulario numérico alimenta la tabla de métricas y el gráfico de barras en tiempo real. No obstante, cuando un campo queda vacío o inválido el sistema simplemente detiene el cálculo sin informar al usuario de la causa.
- **Accesibilidad**: La navegación guiada alterna visibilidad de secciones y ajusta el `aria-current`, pero el gráfico en `<canvas>` no tiene alternativa textual y los botones no indican su efecto en lectores de pantalla. Las imágenes SVG carecen de descripciones extendidas.
- **Tecnología**: Se usa HTML, CSS y JavaScript puros. La carga de configuraciones vía `fetch('data/defaults.json')` funciona en entornos servidos, pero falla en cargas locales sin servidor. No existe empaquetado ni control de dependencias.
- **Mantenibilidad**: No hay separación de componentes ni pruebas automatizadas. La lógica de visualización y cálculo convive en un único archivo, lo que dificulta pruebas unitarias y extensibilidad.

## Mejoras prioritarias a implementar
1. **Mensajería de validación interactiva**: mostrar errores junto a cada campo y permitir valores tentativos sin bloquear completamente el cálculo.
2. **Accesibilidad en datos visuales**: añadir resúmenes textuales vinculados al canvas y describir imágenes mediante `figcaption` y atributos `aria-describedby`.
3. **Modo sin JavaScript o carga fallida**: proveer valores pre-renderizados en HTML que se actualicen cuando JS esté disponible, y ofrecer mensajes si `defaults.json` no se carga.
4. **Profundizar la narrativa**: expandir secciones críticas (Resumen ejecutivo, Recomendaciones) con cifras de impacto, KPIs de referencia y citas de socios estratégicos.
5. **Instrumentación analítica**: definir KPIs adicionales (eficiencia logística, costos evitados) y un plan para capturar datos de uso del formulario.

## Fundamentos para un reinicio desde cero
- **Arquitectura basada en componentes**: adoptar un framework ligero (p. ej., Svelte, Astro o web components) para encapsular secciones reutilizables, mejorar la gestión de estado y facilitar pruebas.
- **Design system accesible**: definir tipografías, escala de colores AA+, patrones de tarjetas y controles con documentación para mantener consistencia y accesibilidad.
- **Separación de datos y presentación**: modelar las entidades (captura, procesamiento, manufactura) en estructuras JSON o APIs, manteniendo el front-end como capa de visualización.
- **Pipeline de despliegue**: configurar bundlers y automatizaciones (Vite/GitHub Actions) que generen builds optimizadas, ejecuten linters y validen accesibilidad básica.
- **Estrategia de contenido**: establecer lineamientos editoriales con métricas obligatorias, tono de voz y fuentes verificables, asegurando actualizaciones periódicas respaldadas por datos reales.

## Próximos pasos sugeridos
1. Elaborar una hoja de ruta con entregables quincenales para validar la arquitectura nueva y migrar progresivamente las secciones.
2. Realizar pruebas con usuarios (estudiantes y operadores logísticos) para priorizar funcionalidades críticas en la nueva versión.
3. Documentar contratos de datos y definir mocks para poder desarrollar sin depender de la infraestructura final.

