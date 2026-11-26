/* global document, window */

const MAP_SELECTOR = '.js-footprint-map';
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a class="map-credit-link" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const LEAFLET_PREFIX = '<a class="map-credit-link" href="https://leafletjs.com">Leaflet</a>';
const PIN_STYLE = { radius: 8, color: '#fff', weight: 2, fillColor: '#ff8200', fillOpacity: 1 };
const PIN_REGION_STYLE = { radius: 9, color: '#000', weight: 2, fillColor: '#ff8200' };
const PIN_ACTIVE_STYLE = { radius: 12, color: '#000', weight: 3, fillColor: '#ffc107' };
const FOCUS_ZOOM = 12;

function describeSelection(button) {
  const community = button.dataset.community;
  const region = button.dataset.region;
  const beneficiaries = button.dataset.beneficiaries;
  return {
    title: community,
    text: `${community} is one of the communities in the ${region} region. `
      + `${beneficiaries} beneficiaries are recorded across this whole region (March–July 2026). `
      + 'This is a regional total, not a count for this community.'
  };
}

function buildLeafletMap(canvas, buttons) {
  const leaflet = window.L;
  if (!leaflet || !canvas) {
    return null;
  }
  canvas.textContent = '';
  const map = leaflet.map(canvas, { scrollWheelZoom: false });
  map.attributionControl.setPrefix(LEAFLET_PREFIX);
  leaflet.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18 }).addTo(map);

  const pins = new Map();
  buttons.forEach((button) => {
    const position = [Number(button.dataset.lat), Number(button.dataset.lng)];
    const pin = leaflet.circleMarker(position, PIN_STYLE).addTo(map);
    pin.bindTooltip(button.dataset.community, { direction: 'top', offset: [0, -10] });
    pins.set(button.dataset.community, pin);
  });

  const bounds = leaflet.latLngBounds(Array.from(pins.values()).map((pin) => pin.getLatLng()));
  map.fitBounds(bounds, { padding: [40, 40] });
  return { map, pins, bounds };
}

function setActiveCommunity(root, view, community, shouldFly) {
  const buttons = root.querySelectorAll('.map-community-btn');
  const detailTitle = root.querySelector('.map-detail-title');
  const detailText = root.querySelector('.map-detail-text');
  let activeRegion = '';

  buttons.forEach((button) => {
    const isActive = button.dataset.community === community;
    button.setAttribute('aria-pressed', String(isActive));
    if (isActive) {
      activeRegion = button.dataset.region;
      const detail = describeSelection(button);
      detailTitle.textContent = detail.title;
      detailText.textContent = detail.text;
    }
  });

  if (!view) {
    return;
  }

  buttons.forEach((button) => {
    const pin = view.pins.get(button.dataset.community);
    pin.setStyle(PIN_STYLE);
    if (button.dataset.region === activeRegion) {
      pin.setStyle(PIN_REGION_STYLE);
    }
    pin.closeTooltip();
  });

  const activePin = view.pins.get(community);
  activePin.setStyle(PIN_ACTIVE_STYLE);
  activePin.bringToFront();
  activePin.openTooltip();
  if (shouldFly) {
    const zoom = Math.max(view.map.getZoom(), FOCUS_ZOOM);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      view.map.setView(activePin.getLatLng(), zoom, { animate: false });
    } else {
      view.map.flyTo(activePin.getLatLng(), zoom, { duration: 0.6 });
    }
  }
}

function initFootprintMap(root) {
  const buttons = Array.from(root.querySelectorAll('.map-community-btn'));
  const view = buildLeafletMap(root.querySelector('.js-map-canvas'), buttons);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveCommunity(root, view, button.dataset.community, true);
    });
  });

  if (view) {
    view.pins.forEach((pin, community) => {
      pin.on('click', () => {
        setActiveCommunity(root, view, community, false);
      });
    });
  }
}

document.querySelectorAll(MAP_SELECTOR).forEach(initFootprintMap);
