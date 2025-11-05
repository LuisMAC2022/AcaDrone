# Análisis de usabilidad de AcaDrone

## Metodología
Se revisaron la estructura HTML (`index.html`), los estilos (`assets/css/style.css`) y la lógica interactiva (`js/app.js`) para identificar barreras de usabilidad, accesibilidad y mantenimiento. El análisis considera heurísticas de Nielsen, lineamientos WCAG 2.2 y prácticas de diseño centrado en el usuario.

## Hallazgos principales

### 1. Navegación fragmentada y dependiente de JavaScript
- El script `setupSectionNavigation` oculta todas las secciones excepto la activa agregando `hidden`, lo que elimina el desplazamiento natural y rompe la expectativa de "informe" continuo. 【F:js/app.js†L134-L173】
- Los enlaces del encabezado interceptan el comportamiento por defecto (`event.preventDefault()`), de modo que se pierde la funcionalidad de anclaje si falla el script. 【F:js/app.js†L175-L186】
- En dispositivos pequeños se requiere pulsar repetidamente “Siguiente sección” para ver el contenido completo, incrementando la carga cognitiva.

**Cómo afrontarlo**
- Reemplazar la ocultación global por un enfoque progresivo: mantener todas las secciones visibles y usar los botones para desplazamiento suave, o introducir un índice lateral pegajoso.
- Permitir que los enlaces de navegación funcionen incluso sin JavaScript (eliminar `preventDefault` cuando no sea necesario) y asegurar que la URL refleje la sección activa mediante `hash`.
- Añadir un modo “Expandir todo” o una vista continua por defecto para lectura tipo informe.

### 2. Feedback insuficiente en la captura de datos
- El formulario depende de valores precargados desde `defaults.json`; si la petición falla solo se registra en consola y la interfaz queda sin retroalimentación, lo que bloquea al usuario. 【F:js/app.js†L96-L120】
- No hay mensajes de validación personalizados para entradas fuera de rango; el usuario solo ve el borde rojo del navegador. 【F:assets/css/style.css†L74-L87】

**Cómo afrontarlo**
- Mostrar estados de carga y errores visibles (“No pudimos cargar los parámetros iniciales, inténtalo de nuevo”).
- Añadir validaciones en vivo con mensajes contextuales (p. ej., “La eficiencia debe estar entre 0 y 1”).
- Ofrecer presets o un botón "Restablecer valores base" para recuperar rápidamente configuraciones válidas.

### 3. Contexto limitado para parámetros técnicos
- Las etiquetas `label` solo muestran la notación matemática (N_p, φ, η), sin explicación de unidades ni impacto en los resultados. 【F:index.html†L45-L78】
- En móviles, los campos se apilan verticalmente sin ayudas visuales, lo que puede confundir a usuarios no técnicos.

**Cómo afrontarlo**
- Complementar cada campo con descripciones breves y unidades (tooltips, íconos de ayuda o texto secundario).
- Incluir validaciones dependientes entre campos (p. ej., alertar si `g_d` es cero pero `N_p` es alto) y un resumen textual que interprete los números (“Con estos parámetros podrías producir X chasis”).

### 4. Visualización principal poco accesible
- El `canvas` del gráfico carece de equivalentes textuales para tecnologías asistivas; solo muestra barras sin descripciones adicionales. 【F:js/app.js†L54-L93】
- La escala se calcula con el máximo del conjunto actual, provocando barras sin contraste cuando los valores son similares.

**Cómo afrontarlo**
- Proporcionar una tabla complementaria (ya existe) enlazada semánticamente con descripciones aria, o generar un SVG accesible con etiquetas `aria-labelledby`.
- Añadir anotaciones o una línea de base para interpretar variaciones pequeñas, y permitir al usuario alternar entre representaciones (tabla, gráfico, descarga CSV).

### 5. Accesibilidad y rendimiento
- Los botones de navegación de sección no indican el destino esperado (solo "Sección anterior" / "Siguiente sección"), dificultando a lectores de pantalla anticipar el contenido. 【F:index.html†L120-L133】
- Las imágenes decorativas de la galería usan `alt` descriptivos aunque aportan poca información; esto puede generar ruido auditivo en lectores de pantalla. 【F:index.html†L31-L41】
- Se carga todo el informe y los SVG sin deferencia condicional, lo que puede ser pesado en redes móviles.

**Cómo afrontarlo**
- Añadir descripciones dinámicas a los botones (por ejemplo, "Ir a Resumen ejecutivo").
- Evaluar qué imágenes son realmente informativas y aplicar `alt=""` si son puramente decorativas.
- Implementar división por secciones o carga diferida para assets pesados, manteniendo el contenido crítico accesible.

## Priorización sugerida
1. **Restaurar navegación progresiva y accesible** (alto impacto, baja complejidad).
2. **Mejorar feedback y mensajes de error** (alto impacto, complejidad media).
3. **Documentar parámetros y unidades** (impacto medio, complejidad baja).
4. **Actualizar la visualización con alternativas accesibles** (impacto medio-alto, complejidad media).
5. **Refinar detalles de accesibilidad** (impacto acumulativo, complejidad baja).

## Próximos pasos recomendados
- Realizar pruebas moderadas con usuarios (perfil: responsables de logística y estudiantes) para validar la comprensión de los parámetros.
- Incluir analítica de interacción (p. ej., qué campos generan más errores) respetando privacidad.
- Iterar con un prototipo de alta fidelidad que incorpore las recomendaciones anteriores antes de avanzar a desarrollo.
