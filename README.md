# AcaDrone
Objetivo: página web de una sola página que cumpla las 10 secciones de presentación de proyecto con UI mínima, una tabla de resultados y un gráfico de barras.

Secciones obligatorias

1. Carta de presentación


2. Página de título


3. Contenido (índice con anclas)


4. Resumen ejecutivo


5. Bosquejo de estudio


6. Resultado detallado


7. Alternativa del sistema


8. Recomendaciones


9. Resumen


10. Apéndice



Entradas mínimas

N_p, D, g_d, φ, r, η, f_chasis
Ecuaciones:

PET_gen = N_p * g_d * D

PET_rec = PET_gen * φ * r

F = PET_rec * η

Q = floor(F / f_chasis)


KPIs mínimos

PET_gen, PET_rec, F, Q, Costo_unitario (este último puede ser editable o fijo).

Entregables v0

Estructura HTML con 10 secciones.

Form con 7 inputs numéricos.

Tabla única “Métrica | Valor”.

Gráfico de barras “Cadena de masa” con PET_gen, PET_rec, F.

Sin dependencias externas. Solo HTML/CSS/JS puro.

## Cambios recientes

- Se añadió navegación secuencial que muestra una sola sección del informe a la vez, con botones de avance y retroceso para mejorar el enfoque del lector.

## Propuestas de desarrollo

- Incorporar un modo de presentación automática que avance por las secciones tras un intervalo configurable, ideal para exhibiciones sin intervención del usuario.


Estructura de carpetas

/
├─ index.html
├─ assets/
│  ├─ css/style.css
│  └─ img/ (logos opcionales)
├─ js/
│  └─ app.js
├─ data/
│  └─ defaults.json
├─ docs/
│  └─ spec_minima.md
└─ LICENSE
