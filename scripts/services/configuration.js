import { parameterKeys } from "../modules/calculation.js";

const embeddedDefaults = {
  N_p: 1200,
  D: 0.85,
  g_d: 1.3,
  phi: 0.92,
  r: 0.68,
  eta: 0.83,
  f_chasis: 2.9,
  costo_unitario: 118.5
};

export async function loadConfiguration() {
  try {
    const response = await fetch("data/defaults.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Estado inesperado: ${response.status}`);
    }
    const data = await response.json();
    return normalizeConfiguration(data);
  } catch (error) {
    console.warn("No fue posible cargar defaults externos, se usará la configuración embebida.", error);
    return { ...embeddedDefaults };
  }
}

function normalizeConfiguration(rawConfig) {
  const config = { ...embeddedDefaults };
  if (!rawConfig || typeof rawConfig !== "object") {
    return config;
  }

  parameterKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(rawConfig, key)) {
      const parsed = Number(rawConfig[key]);
      if (!Number.isNaN(parsed)) {
        config[key] = parsed;
      }
    }
  });

  return config;
}

