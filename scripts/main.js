import { loadConfiguration } from "./services/configuration.js";
import { calculateMetrics, parameterKeys, sanitizeValue } from "./modules/calculation.js";

const form = document.getElementById("param-form");
const summaryEl = document.getElementById("calculation-summary");
const kpiBody = document.getElementById("kpi-body");
const chartText = document.getElementById("chart-text");
const chartBars = document.querySelectorAll(".chart__bar");
const guidedContainer = document.querySelector(".guided-mode");
const guidedControls = guidedContainer.querySelector(".guided-controls");
const toggleModeBtn = document.getElementById("toggle-mode");
const prevBtn = document.getElementById("prev-section");
const nextBtn = document.getElementById("next-section");
const guidedStatus = document.getElementById("guided-status");
const sections = Array.from(document.querySelectorAll("main > section.panel"));

const fieldMap = new Map();
parameterKeys.forEach((key) => {
  const input = form.querySelector(`[name="${key}"]`);
  const field = input.closest(".field");
  const errorEl = document.getElementById(`error-${key}`);
  fieldMap.set(key, { input, field, errorEl });
});

let guidedIndex = 0;

init();

async function init() {
  const config = await loadConfiguration();
  setFormValues(config);
  updateOutputs();
  bindEvents();
}

function bindEvents() {
  form.addEventListener("input", () => {
    updateOutputs();
  });

  toggleModeBtn.addEventListener("click", () => {
    const guided = guidedContainer.dataset.guided === "true";
    setGuidedMode(!guided);
  });

  prevBtn.addEventListener("click", () => {
    moveGuided(-1);
  });

  nextBtn.addEventListener("click", () => {
    moveGuided(1);
  });
}

function setFormValues(config) {
  parameterKeys.forEach((key) => {
    const { input } = fieldMap.get(key);
    input.value = config[key];
  });
}

function readParameters() {
  const params = {};
  let hasErrors = false;

  parameterKeys.forEach((key) => {
    const { input, field, errorEl } = fieldMap.get(key);
    const { value, message } = sanitizeValue(key, input.value);
    if (message) {
      hasErrors = true;
      field.dataset.invalid = "true";
      errorEl.textContent = message;
    } else {
      field.removeAttribute("data-invalid");
      errorEl.textContent = "";
      params[key] = value;
    }
  });

  return { params, hasErrors };
}

function updateOutputs() {
  const { params, hasErrors } = readParameters();
  if (hasErrors) {
    summaryEl.textContent = "Corrige los campos marcados para actualizar los cálculos.";
    chartText.textContent = "No se puede actualizar la cadena de masa hasta corregir los errores.";
    updateTablePlaceholders();
    updateChartHeights({ PET_gen: 0, PET_rec: 0, F: 0 });
    return;
  }

  const { formatted, chart, summary } = calculateMetrics(params);
  renderTable(formatted);
  summaryEl.textContent = summary;
  updateChartHeights(chart);
  chartText.textContent = buildChartNarrative(chart);
}

function renderTable(formatted) {
  const cells = kpiBody.querySelectorAll("[data-metric]");
  cells.forEach((cell) => {
    const key = cell.dataset.metric;
    if (formatted[key] !== undefined) {
      cell.textContent = formatted[key];
    }
  });
}

function updateTablePlaceholders() {
  const cells = kpiBody.querySelectorAll("[data-metric]");
  cells.forEach((cell) => {
    const metric = cell.dataset.metric;
    cell.textContent = metric === "Q" ? "0 unidades" : metric.startsWith("costo") ? "0 USD" : "0 kg/mes";
  });
}

function updateChartHeights(chart) {
  const values = Object.values(chart);
  const max = Math.max(...values, 1);
  chartBars.forEach((bar) => {
    const key = bar.dataset.bar;
    const raw = chart[key] ?? 0;
    const height = Math.max((raw / max) * 12, 1.5);
    bar.style.setProperty("--bar-height", `${height}rem`);
    bar.querySelector(".chart__value").textContent = raw.toLocaleString("es-MX", {
      maximumFractionDigits: 1
    });
  });
}

function buildChartNarrative(chart) {
  const { PET_gen, PET_rec, F } = chart;
  if (PET_gen === 0) {
    return "La cadena de masa mostrará relaciones porcentuales cuando se ingresen parámetros válidos.";
  }
  const recRate = ((PET_rec / PET_gen) * 100).toFixed(1);
  const finalRate = ((F / PET_gen) * 100).toFixed(1);
  return `El PET recuperado representa ${recRate}% de lo generado y el material final conserva ${finalRate}% del total inicial.`;
}

function setGuidedMode(active) {
  guidedContainer.dataset.guided = String(active);
  toggleModeBtn.setAttribute("aria-pressed", String(active));
  toggleModeBtn.textContent = active ? "Desactivar modo guiado" : "Activar modo guiado";
  guidedControls.hidden = !active;

  if (active) {
    guidedIndex = 0;
    updateGuidedVisibility();
  } else {
    sections.forEach((section) => {
      section.hidden = false;
    });
    guidedStatus.textContent = "";
  }
}

function moveGuided(step) {
  if (guidedContainer.dataset.guided !== "true") {
    return;
  }
  guidedIndex = Math.min(Math.max(guidedIndex + step, 0), sections.length - 1);
  updateGuidedVisibility(true);
}

function updateGuidedVisibility(scroll = false) {
  sections.forEach((section, index) => {
    section.hidden = index !== guidedIndex;
  });
  const section = sections[guidedIndex];
  guidedStatus.textContent = `Sección ${guidedIndex + 1} de ${sections.length}: ${section.querySelector("h2").textContent}.`;
  if (scroll) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}



