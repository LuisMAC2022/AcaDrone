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
  const sections = Array.from(document.querySelectorAll('main > section'));
  const prevButton = document.getElementById('prevSection');
  const nextButton = document.getElementById('nextSection');
  const expandButton = document.getElementById('expandSections');
  if (!sections.length || !prevButton || !nextButton) {
    return;
  }

  sections.forEach((section) => {
    if (section.hasAttribute('hidden')) {
      section.removeAttribute('hidden');
    }
    if (!section.hasAttribute('tabindex')) {
      section.setAttribute('tabindex', '-1');
    }
  });

  const navLinks = Array.from(document.querySelectorAll('header nav a'));
  let activeIndex = 0;
  let activeId = sections[0].id;

  const focusSection = (section) => {
    section.focus({ preventScroll: true });
  };

  const scrollToSection = (index) => {
    if (index < 0 || index >= sections.length) {
      return;
    }
    const section = sections[index];
    focusSection(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateUI(section.id);
  };

  const updateHash = (id) => {
    if (window.location.hash.slice(1) === id) {
      return;
    }
    if (typeof history.replaceState === 'function') {
      history.replaceState(null, '', `#${id}`);
    } else {
      window.location.hash = `#${id}`;
    }
  };

  const updateNavLinks = () => {
    navLinks.forEach((link) => {
      const targetId = link.getAttribute('href').slice(1);
      if (targetId === activeId) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const updateButtons = () => {
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === sections.length - 1;
  };

  const updateUI = (id, { syncHash = true } = {}) => {
    const index = sections.findIndex((section) => section.id === id);
    if (index === -1) {
      return;
    }
    activeIndex = index;
    activeId = id;
    updateNavLinks();
    updateButtons();
    if (syncHash) {
      updateHash(id);
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => sections.indexOf(a.target) - sections.indexOf(b.target),
          );
        if (visible.length) {
          const newId = visible[0].target.id;
          if (newId !== activeId) {
            updateUI(newId);
          }
        }
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.2,
      },
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    const handleScroll = () => {
      const reference = window.scrollY + window.innerHeight * 0.35;
      let closestSection = sections[0];
      let smallestDistance = Math.abs(closestSection.offsetTop - reference);

      sections.forEach((section) => {
        const distance = Math.abs(section.offsetTop - reference);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestSection = section;
        }
      });

      if (closestSection && closestSection.id !== activeId) {
        updateUI(closestSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  prevButton.addEventListener('click', () => {
    scrollToSection(Math.max(0, activeIndex - 1));
  });

  nextButton.addEventListener('click', () => {
    scrollToSection(Math.min(sections.length - 1, activeIndex + 1));
  });

  if (expandButton) {
    expandButton.addEventListener('click', () => {
      sections.forEach((section) => section.removeAttribute('hidden'));
      expandButton.setAttribute('aria-pressed', 'true');
      expandButton.disabled = true;
      expandButton.textContent = 'Vista continua activada';
      if (sections[activeIndex]) {
        sections[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  window.addEventListener('hashchange', () => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) {
      return;
    }
    const targetSection = sections.find((section) => section.id === targetId);
    if (targetSection) {
      focusSection(targetSection);
    }
    updateUI(targetId, { syncHash: false });
  });

  if (window.location.hash) {
    const initialId = window.location.hash.slice(1);
    if (sections.some((section) => section.id === initialId)) {
      updateUI(initialId);
    } else {
      updateUI(activeId);
    }
  } else {
    updateUI(activeId);
  }
}
