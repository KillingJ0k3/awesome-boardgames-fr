const DATA_FILES = [
  { file: 'comparators.yaml', label: 'Comparateurs' },
  { file: 'editors.yaml', label: 'Editeurs' },
  { file: 'general.yaml', label: 'General' },
  { file: 'vpc.yaml', label: 'VPC' }
];

const searchInput = document.getElementById('searchInput');
const selectAllButton = document.getElementById('selectAllButton');
const deselectAllButton = document.getElementById('deselectAllButton');
const openAllButton = document.getElementById('openAllButton');
const clearTagsButton = document.getElementById('clearTagsButton');
const clearCategoriesButton = document.getElementById('clearCategoriesButton');
const clearCountriesButton = document.getElementById('clearCountriesButton');
const tagFilter = document.getElementById('tagFilter');
const categoryFilter = document.getElementById('categoryFilter');
const countryFilter = document.getElementById('countryFilter');
const statusEl = document.getElementById('status');
const sitesList = document.getElementById('sitesList');

let websites = [];
let allTags = [];
let allCategories = [];
let allCountries = [];

function parseSimpleYaml(text) {
  const entries = [];
  const lines = text.split(/\r?\n/);
  let current = null;
  let collectingTags = false;

  const pushCurrent = () => {
    if (current) {
      entries.push(current);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '  ');
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      pushCurrent();
      current = {};
      collectingTags = false;

      const remainder = trimmed.replace(/^-\s*/, '').trim();
      if (remainder && remainder.includes(':')) {
        const parts = remainder.split(/:\s*/, 2);
        if (parts[0] && parts[1] !== undefined) {
          current[parts[0]] = parseScalar(parts[1]);
        }
      } else if (remainder) {
        current.name = remainder;
      }
      continue;
    }

    if (!current) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      const cleaned = value.trim();

      if (key === 'tags') {
        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
          current.tags = cleaned
            .slice(1, -1)
            .split(',')
            .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        } else if (cleaned) {
          current.tags = [parseScalar(cleaned)];
        } else {
          current.tags = [];
        }
        collectingTags = true;
        continue;
      }

      current[key] = parseScalar(cleaned);
      collectingTags = false;
      continue;
    }

    if (collectingTags && trimmed.startsWith('-')) {
      const tagValue = trimmed.replace(/^-\s*/, '').trim();
      if (tagValue) {
        current.tags.push(parseScalar(tagValue));
      }
    }
  }

  pushCurrent();
  return entries;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function buildSearchUrl(site, query) {
  const baseUrl = (site.url || '#').trim();
  const trimmedQuery = query.trim();

  if (!trimmedQuery || !(site.search || '').trim()) {
    return normalizeUrl(baseUrl);
  }

  const searchPath = (site.search || '').trim();
  const encodedQuery = encodeURIComponent(trimmedQuery);
  const combined = `${baseUrl}${searchPath}${encodedQuery}`;
  return normalizeUrl(combined);
}

function normalizeUrl(url) {
  return url.replace(/(^|[^:])\/{2,}/g, '$1/');
}

function normalizeFilterValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getSelectedTags() {
  return Array.from(tagFilter.selectedOptions).map((option) => option.value);
}

function getSelectedCategories() {
  return Array.from(categoryFilter.selectedOptions).map((option) => option.value);
}

function getSelectedCountries() {
  return Array.from(countryFilter.selectedOptions).map((option) => option.value);
}

function getCountryLabel(value) {
  const normalized = normalizeFilterValue(value);
  const mapping = {
    fr: 'France',
    france: 'France',
    be: 'Belgique',
    belgium: 'Belgique',
    de: 'Allemagne',
    germany: 'Allemagne',
    gb: 'Angleterre',
    uk: 'Angleterre',
    england: 'Angleterre',
    'united-kingdom': 'Angleterre',
    us: 'USA',
    usa: 'USA',
    'united-states': 'USA',
    world: 'International',
    international: 'International'
  };

  return mapping[normalized] || value;
}

function renderSelectOptions(select, values) {
  select.innerHTML = values
    .map((value) => `<option value="${value.value}">${value.label}</option>`)
    .join('');
}

function renderWebsites(query) {
  const activeTags = getSelectedTags();
  const activeCategories = getSelectedCategories();
  const activeCountries = getSelectedCountries();
  const filteredSites = websites.filter((site) => {
    const matchesCategory = !activeCategories.length || activeCategories.some((category) => normalizeFilterValue(category) === normalizeFilterValue(site.category));
    const matchesTags = !activeTags.length || activeTags.some((tag) => (site.tags || []).includes(tag));
    const matchesCountry = !activeCountries.length || activeCountries.some((country) => normalizeFilterValue(country) === normalizeFilterValue(site.country));
    return matchesCategory && matchesTags && matchesCountry;
  });

  statusEl.textContent = `${filteredSites.length} / ${websites.length} sites visibles. La recherche sera ajoutée au sein de chaque URL (permettant d'utiliser un CTRL+CLICK). Autorisez au niveau du navigateur la fonction 'pop-up & redirects' dans les préférences pour que le bouton 'Ouvrir tout' fonctionne (sur tous les éléments sélectionnés).`;

  const fragment = document.createDocumentFragment();

  filteredSites.forEach((site, index) => {
    const label = document.createElement('label');
    label.className = 'site-card';
    label.htmlFor = `site-${index}`;

    const checkbox = document.createElement('input');
    checkbox.id = `site-${index}`;
    checkbox.type = 'checkbox';
    checkbox.disabled = !Boolean((site.search || '').trim());

    const link = document.createElement('a');
    const href = buildSearchUrl(site, query);
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = site.name;

    label.appendChild(checkbox);
    label.appendChild(link);
    fragment.appendChild(label);
  });

  sitesList.replaceChildren(fragment);
}

async function loadWebsites() {
  try {
    statusEl.textContent = 'Loading websites…';
    const loaded = [];

    for (const categoryConfig of DATA_FILES) {
      const url = new URL(`../data/${categoryConfig.file}`, window.location.href);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Unable to load ${categoryConfig.file}`);
      }
      const text = await response.text();
      const parsed = parseSimpleYaml(text);
      const withCategory = parsed
        .filter((entry) => entry.name && entry.url)
        .map((entry) => ({ ...entry, category: categoryConfig.file, categoryLabel: categoryConfig.label }));
      loaded.push(...withCategory);
    }

    websites = loaded.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    allTags = [...new Set(websites.flatMap((site) => Array.isArray(site.tags) ? site.tags : []))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    allCategories = Array.from(
      websites.reduce((categories, site) => {
        if (site.category) {
          categories.set(site.category, site.categoryLabel || site.category);
        }
        return categories;
      }, new Map())
    ).map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })) || [];
    allCountries = Array.from(
      websites.reduce((countries, site) => {
        if (site.country) {
          countries.set(normalizeFilterValue(site.country), getCountryLabel(site.country));
        }
        return countries;
      }, new Map())
    ).map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
    renderSelectOptions(tagFilter, allTags.map((tag) => ({ value: tag, label: tag })));
    renderSelectOptions(categoryFilter, allCategories);
    renderSelectOptions(countryFilter, allCountries);
    renderWebsites(searchInput.value);
    // statusEl.textContent = `${filteredSites.length} / ${websites.length} sites visibles. La recherche sera ajoutée au sein de chaque URL. Autorisez au niveau du navigateur la fonction 'pop-up & redirects' dans les préférences pour que le bouton 'Ouvrir tout' fonctionne.`;
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Unable to load the data files. Please open the page through a local web server.';
    sitesList.innerHTML = '<div class="empty-state">The YAML files could not be loaded.</div>';
  }
}

searchInput.addEventListener('input', (event) => {
  renderWebsites(event.target.value);
});

tagFilter.addEventListener('change', () => {
  renderWebsites(searchInput.value);
});

categoryFilter.addEventListener('change', () => {
  renderWebsites(searchInput.value);
});

countryFilter.addEventListener('change', () => {
  renderWebsites(searchInput.value);
});

clearTagsButton.addEventListener('click', () => {
  Array.from(tagFilter.options).forEach((option) => {
    option.selected = false;
  });
  renderWebsites(searchInput.value);
});

clearCategoriesButton.addEventListener('click', () => {
  Array.from(categoryFilter.options).forEach((option) => {
    option.selected = false;
  });
  renderWebsites(searchInput.value);
});

clearCountriesButton.addEventListener('click', () => {
  Array.from(countryFilter.options).forEach((option) => {
    option.selected = false;
  });
  renderWebsites(searchInput.value);
});

function setAllSelection(checked) {
  const checkboxes = Array.from(sitesList.querySelectorAll('input[type="checkbox"]'));
  checkboxes.forEach((checkbox) => {
    if (!checkbox.disabled) {
      checkbox.checked = checked;
    }
  });
}

selectAllButton.addEventListener('click', () => {
  setAllSelection(true);
});

deselectAllButton.addEventListener('click', () => {
  setAllSelection(false);
});

openAllButton.addEventListener('click', () => {
  const selected = Array.from(sitesList.querySelectorAll('input[type="checkbox"]:checked'));
  selected.forEach((checkbox, index) => {
    const label = checkbox.closest('.site-card');
    const link = label?.querySelector('a');
    if (link) {
      const target = link.getAttribute('href');
      if (target) {
        window.open(target, label, 'noopener,noreferrer');
      }
    }
  });
});

loadWebsites();
