export const parameterKeys = [
  "N_p",
  "D",
  "g_d",
  "phi",
  "r",
  "eta",
  "f_chasis",
  "costo_unitario"
];

const numberFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2
});

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

export function sanitizeValue(name, rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return { value: null, message: "Ingresa un valor numérico." };
  }

  const numeric = Number(rawValue);
  if (Number.isNaN(numeric)) {
    return { value: null, message: "El valor no es un número válido." };
  }

  if (numeric < 0) {
    return { value: null, message: "Solo se admiten valores mayores o iguales a cero." };
  }

  if (["phi", "r", "eta"].includes(name) && (numeric < 0 || numeric > 1)) {
    return { value: null, message: "El valor debe estar entre 0 y 1." };
  }

  if (name === "f_chasis" && numeric === 0) {
    return { value: null, message: "El denominador no puede ser cero." };
  }

  return { value: numeric, message: "" };
}

export function calculateMetrics(params) {
  const {
    N_p,
    D,
    g_d,
    phi,
    r,
    eta,
    f_chasis,
    costo_unitario
  } = params;

  const PET_gen = N_p * g_d * D;
  const PET_rec = PET_gen * phi * r;
  const F = PET_rec * eta;
  const Q = Math.floor(F / f_chasis);
  const costo_mensual = Q * costo_unitario;

  const metrics = {
    PET_gen,
    PET_rec,
    F,
    Q,
    costo_unitario,
    costo_mensual
  };

  const formatted = {
    PET_gen: `${numberFormatter.format(PET_gen)} kg/mes`,
    PET_rec: `${numberFormatter.format(PET_rec)} kg/mes`,
    F: `${numberFormatter.format(F)} kg/mes`,
    Q: `${numberFormatter.format(Q)} unidades`,
    costo_unitario: currencyFormatter.format(costo_unitario),
    costo_mensual: currencyFormatter.format(costo_mensual)
  };

  const chart = {
    PET_gen,
    PET_rec,
    F
  };

  const summary = `Con los valores actuales se generan ${formatted.PET_gen}, se recuperan ${formatted.PET_rec} y se convierten en ${formatted.F}, lo que permite fabricar ${formatted.Q}. La inversión mensual estimada es de ${formatted.costo_mensual}.`;

  return { metrics, formatted, chart, summary };
}

