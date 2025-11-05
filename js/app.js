const state = {
  defaults: null,
  metrics: null,
};

function readInputs(form) {
  const data = {};
  let valid = true;
  form.querySelectorAll('input[type="number"]').forEach((input) => {
    const value = parseFloat(input.value);
    if (Number.isNaN(value) || value < parseFloat(input.min || '0')) {
      valid = false;
    }
    data[input.name] = value;
  });
  return { data, valid };
}

function compute(params, costoUnitario) {
  const {
    N_p = 0,
    D = 0,
    g_d: gd = 0,
    phi = 0,
    r = 0,
    eta = 0,
    f_chasis: fChasis = 1,
  } = params;

  const PET_gen = N_p * gd * D;
  const PET_rec = PET_gen * phi * r;
  const F = PET_rec * eta;
  const Q = Math.floor(fChasis > 0 ? F / fChasis : 0);
  const costo_unitario = costoUnitario;
  const costo_total = Q * costo_unitario;

  return {
    PET_gen,
    PET_rec,
    F,
    Q,
    costo_unitario,
    costo_total,
  };
}

function renderTable(tableBody, metrics) {
  const formatter = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 2,
  });
  const rows = [
    ['PET generado (kg)', metrics.PET_gen],
    ['PET recuperado (kg)', metrics.PET_rec],
    ['Material final (kg)', metrics.F],
    ['Chasis posibles (unidades)', metrics.Q],
    ['Costo unitario (USD)', metrics.costo_unitario],
    ['Costo total (USD)', metrics.costo_total],
  ];

  tableBody.innerHTML = '';
  rows.forEach(([label, value]) => {
    const tr = document.createElement('tr');
    const metricCell = document.createElement('th');
    metricCell.scope = 'row';
    metricCell.textContent = label;
    const valueCell = document.createElement('td');
    valueCell.textContent = Number.isFinite(value)
      ? formatter.format(value)
      : '—';
    tr.append(metricCell, valueCell);
    tableBody.appendChild(tr);
  });
}

function renderChart(canvas, metrics) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const values = [metrics.PET_gen, metrics.PET_rec, metrics.F];
  const labels = ['PET_gen', 'PET_rec', 'F'];
  const maxValue = Math.max(...values, 1);
  const barWidth = width / (values.length * 2);

  ctx.font = '14px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  values.forEach((value, index) => {
    const x = barWidth + index * barWidth * 2;
    const barHeight = (value / maxValue) * (height * 0.7);
    const y = height - barHeight - 24;

    ctx.fillStyle = '#0c6cf2';
    ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    ctx.fillStyle = '#1f2933';
    ctx.fillText(labels[index], x, height - 4);
    ctx.fillText(value.toFixed(0), x, y - 6);
  });

  ctx.strokeStyle = '#d6d9dc';
  ctx.beginPath();
  ctx.moveTo(0, height - 24);
  ctx.lineTo(width, height - 24);
  ctx.stroke();
}

function updateSnapshots(metrics) {
  const formatter = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 0,
  });
  document.getElementById('kpiPetGen').textContent = formatter.format(metrics.PET_gen || 0);
  document.getElementById('kpiPetRec').textContent = formatter.format(metrics.PET_rec || 0);
  document.getElementById('kpiQ').textContent = formatter.format(metrics.Q || 0);
}

function recalculate(form, tableBody, canvas) {
  if (!state.defaults) {
    return;
  }
  const { data, valid } = readInputs(form);
  if (!valid) {
    return;
  }
  const metrics = compute(data, state.defaults.costo_unitario);
  state.metrics = metrics;
  renderTable(tableBody, metrics);
  renderChart(canvas, metrics);
  updateSnapshots(metrics);
}

function populateForm(form, defaults) {
  form.querySelectorAll('input[type="number"]').forEach((input) => {
    const value = defaults[input.name];
    if (typeof value !== 'undefined') {
      input.placeholder = value;
      input.value = value;
    }
  });
}

function bind() {
  const form = document.getElementById('inputForm');
  const tableBody = document.querySelector('#results tbody');
  const canvas = document.getElementById('massChart');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  form.addEventListener('input', () => recalculate(form, tableBody, canvas));
  window.addEventListener('resize', () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (state.metrics) {
      renderChart(canvas, state.metrics);
    }
  });

  setupSectionNavigation();

  fetch('data/defaults.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('No se pudieron cargar los valores por defecto');
      }
      return response.json();
    })
    .then((defaults) => {
      state.defaults = defaults;
      populateForm(form, defaults);
      recalculate(form, tableBody, canvas);
    })
    .catch((error) => {
      console.error(error);
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind);
} else {
  bind();
}

function setupSectionNavigation() {
  const main = document.querySelector('main');
  const sections = Array.from(document.querySelectorAll('main > section'));
  const prevButton = document.getElementById('prevSection');
  const nextButton = document.getElementById('nextSection');
  const toggleButton = document.getElementById('toggleContinuous');
  if (!main || !sections.length) {
    return;
  }

  sections.forEach((section) => {
    if (!section.hasAttribute('tabindex')) {
      section.setAttribute('tabindex', '-1');
    }
  });

  const navLinks = Array.from(document.querySelectorAll('header nav a'));
  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  const getScrollBehavior = () => (prefersReducedMotion.matches ? 'auto' : 'smooth');

  const hashTarget = window.location.hash.slice(1);
  let currentIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === hashTarget)
  );
  let isFragmented = false;

  const updateHash = (id) => {
    if (!id) {
      return;
    }
    if (typeof history !== 'undefined' && typeof history.replaceState === 'function') {
      history.replaceState(null, '', `#${id}`);
    } else {
      window.location.hash = id;
    }
  };

  const updateNavLinks = () => {
    navLinks.forEach((link) => {
      const targetId = link.getAttribute('href').slice(1);
      const isActive = sections[currentIndex].id === targetId;
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const applySectionState = () => {
    sections.forEach((section, index) => {
      const isActive = index === currentIndex;
      section.classList.toggle('is-active', isActive);
      if (isFragmented) {
        if (isActive) {
          section.removeAttribute('hidden');
        } else {
          section.setAttribute('hidden', '');
        }
      } else {
        section.removeAttribute('hidden');
      }
    });
    if (prevButton) {
      prevButton.disabled = currentIndex === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentIndex === sections.length - 1;
    }
    updateNavLinks();
    main.classList.toggle('is-fragmented', isFragmented);
    if (toggleButton) {
      toggleButton.setAttribute('aria-pressed', String(isFragmented));
      toggleButton.textContent = isFragmented ? 'Vista continua' : 'Vista seccionada';
    }
  };

  const focusSection = (section, behavior = getScrollBehavior()) => {
    section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior, block: 'start' });
  };

  const goToIndex = (index, options = {}) => {
    if (index < 0 || index >= sections.length) {
      return;
    }
    currentIndex = index;
    applySectionState();
    if (options.shouldFocus !== false) {
      focusSection(sections[currentIndex]);
    }
    if (options.updateHash !== false) {
      updateHash(sections[currentIndex].id);
    }
  };

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      goToIndex(currentIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      goToIndex(currentIndex + 1);
    });
  }

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      isFragmented = !isFragmented;
      applySectionState();
      focusSection(sections[currentIndex], 'auto');
    });
  }

  const onIntersection = (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visibleEntry) {
      return;
    }
    const visibleIndex = sections.indexOf(visibleEntry.target);
    if (visibleIndex === -1 || visibleIndex === currentIndex) {
      return;
    }
    currentIndex = visibleIndex;
    applySectionState();
    updateHash(sections[currentIndex].id);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(onIntersection, {
      rootMargin: '-35% 0px -45% 0px',
      threshold: [0.1, 0.25, 0.5],
    });
    sections.forEach((section) => observer.observe(section));
  } else {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const newIndex = sections.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = rect.bottom + window.scrollY;
        return scrollPosition >= top && scrollPosition < bottom;
      });
      if (newIndex !== -1 && newIndex !== currentIndex) {
        currentIndex = newIndex;
        applySectionState();
        updateHash(sections[currentIndex].id);
      }
    });
  }

  window.addEventListener('hashchange', () => {
    const targetId = window.location.hash.slice(1);
    const targetIndex = sections.findIndex((section) => section.id === targetId);
    if (targetIndex !== -1) {
      goToIndex(targetIndex, { updateHash: false, shouldFocus: false });
      sections[targetIndex].focus({ preventScroll: true });
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').slice(1);
      const targetIndex = sections.findIndex((section) => section.id === targetId);
      if (targetIndex !== -1) {
        goToIndex(targetIndex, { updateHash: false, shouldFocus: false });
        sections[targetIndex].focus({ preventScroll: true });
      }
    });
  });

  applySectionState();
  if (hashTarget && sections[currentIndex]) {
    focusSection(sections[currentIndex], 'auto');
  }
}
