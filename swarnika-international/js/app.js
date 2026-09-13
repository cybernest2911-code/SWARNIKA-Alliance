/**
 * Swarnika International Private Limited
 * Apple-Grade Flagship Digital Platform - High Contrast & GSAP Visibility Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursorSpotlight();

  if (typeof THREE !== 'undefined') {
    initThreeJSGlobe();
    initAllianceCard3D();
    initAgroCard3D();
  }

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initGSAPScrollAnimations();
  }

  initMagneticButtons();
  initGlassCardTilt();
  initNavigation();
  initCorridorSelector();
  initStatsCounters();
  initContactForms();
  initModals();
});

/* ==========================================================================
   1. PRELOADER & CURSOR SPOTLIGHT
   ========================================================================== */

function initPreloader() {
  const preloader = document.getElementById('apple-preloader');
  const barFill = document.querySelector('.preloader-bar-fill');

  if (barFill) barFill.style.width = '100%';

  setTimeout(() => {
    if (preloader) preloader.classList.add('loaded');
  }, 800);
}

function initCursorSpotlight() {
  const spotlight = document.getElementById('cursor-spotlight');
  if (!spotlight) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    spotlight.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });
}

/* ==========================================================================
   2. THREE.JS 3D GLOBE ENGINE WITH SCROLL CAMERA LERPING
   ========================================================================== */

let globeScene, globeCamera, globeRenderer, globeGroup, originRing;
let targetRotationY = -0.8;
let targetRotationX = 0.35;
const corridorArcs = {};

function initThreeJSGlobe() {
  const container = document.getElementById('globe-3d-container');
  if (!container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 540;

  globeScene = new THREE.Scene();
  globeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  globeCamera.position.z = 280;

  globeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  globeRenderer.setSize(width, height);
  globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(globeRenderer.domElement);

  globeGroup = new THREE.Group();
  globeScene.add(globeGroup);

  // Real-world continents, rendered in the brand's ink/gold duotone
  // (gold landmasses on a dark ink ocean) instead of a flat abstract sphere.
  const earthTexture = new THREE.TextureLoader().load('./assets/earth-map.jpg');
  earthTexture.anisotropy = 4;

  const sphereGeo = new THREE.SphereGeometry(80, 64, 64);
  const sphereMat = new THREE.MeshPhongMaterial({
    map: earthTexture,
    emissive: 0x0D141C,
    emissiveIntensity: 0.25,
    specular: 0x2E4B60,
    shininess: 14
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(sphere);

  const gridGeo = new THREE.SphereGeometry(80.6, 24, 24);
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x2E4B60, wireframe: true, transparent: true, opacity: 0.18 });
  const gridMesh = new THREE.Mesh(gridGeo, gridMat);
  globeGroup.add(gridMesh);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  globeScene.add(ambient);

  const goldLight = new THREE.DirectionalLight(0xE8D48A, 1.3);
  goldLight.position.set(200, 150, 200);
  globeScene.add(goldLight);

  const cityNodes = [
    { name: 'NEW DELHI', lat: 28.6139, lon: 77.2090, isOrigin: true, key: 'delhi' },
    { name: 'STAVANGER', lat: 58.9699, lon: 5.7331, isOrigin: false, key: 'nordics' },
    { name: 'FRANKFURT', lat: 50.1109, lon: 8.6821, isOrigin: false, key: 'europe' },
    { name: 'NAIROBI', lat: -1.2921, lon: 36.8219, isOrigin: false, key: 'africa' },
    { name: 'DUBAI', lat: 25.2048, lon: 55.2708, isOrigin: false, key: 'gulf' }
  ];

  const nodePositions = {};
  cityNodes.forEach(city => {
    const pos = latLonToVector3(city.lat, city.lon, 81.5);
    nodePositions[city.key] = pos;

    const nodeGeo = new THREE.SphereGeometry(city.isOrigin ? 2.5 : 1.8, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: city.isOrigin ? 0xE8D48A : 0xC9A84C });
    const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
    nodeMesh.position.copy(pos);
    globeGroup.add(nodeMesh);
  });

  const delhiPos = nodePositions['delhi'];

  // Pulsing halo ring marking New Delhi as the origin of the four corridors
  const originRingGeo = new THREE.RingGeometry(3.4, 4.6, 40);
  const originRingMat = new THREE.MeshBasicMaterial({ color: 0xE8D48A, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  originRing = new THREE.Mesh(originRingGeo, originRingMat);
  originRing.position.copy(delhiPos);
  originRing.lookAt(0, 0, 0);
  globeGroup.add(originRing);

  const corridors = [
    { key: 'nordics', target: nodePositions['nordics'], color: 0xE8D48A },
    { key: 'europe', target: nodePositions['europe'], color: 0xC9A84C },
    { key: 'africa', target: nodePositions['africa'], color: 0xE8D48A },
    { key: 'gulf', target: nodePositions['gulf'], color: 0xC29A3B }
  ];

  corridors.forEach(corr => {
    const curve = create3DArcCurve(delhiPos, corr.target, 81.5, 1.25);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.7, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: corr.color, transparent: true, opacity: 0.65 });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    globeGroup.add(tubeMesh);
    corridorArcs[corr.key] = tubeMesh;
  });

  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 200;
  const posArray = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 500;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({ size: 1.2, color: 0xC9A84C, transparent: true, opacity: 0.3 });
  const particles = new THREE.Points(particleGeo, particleMat);
  globeScene.add(particles);

  globeGroup.rotation.y = -0.8;
  globeGroup.rotation.x = 0.35;

  window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = -0.8 + mouseX * 0.2;
    targetRotationX = 0.35 + mouseY * 0.1;
  });

  window.addEventListener('scroll', () => {
    const scrollFactor = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
    targetRotationY = -0.8 + scrollFactor * Math.PI * 1.5;
    globeCamera.position.z = 280 - scrollFactor * 30;
  });

  function animate() {
    requestAnimationFrame(animate);
    globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.05;
    globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.05;
    particles.rotation.y += 0.0003;

    if (originRing) {
      const t = performance.now() * 0.001;
      originRing.material.opacity = 0.4 + Math.sin(t * 1.3) * 0.25;
    }

    globeRenderer.render(globeScene, globeCamera);
  }
  animate();
}

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

function create3DArcCurve(p1, p2, radius, midElevation) {
  const distance = p1.distanceTo(p2);
  const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  midPoint.normalize().multiplyScalar(radius + (distance * 0.25 * midElevation));
  return new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
}

function initAllianceCard3D() {
  const container = document.getElementById('alliance-3d-card');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const geo = new THREE.IcosahedronGeometry(4.5, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0x2E4B60, wireframe: true, transparent: true, opacity: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();
}

function initAgroCard3D() {
  const container = document.getElementById('agro-3d-card');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const ringGeo = new THREE.TorusGeometry(3.5, 0.8, 16, 50);
  const ringMat = new THREE.MeshPhongMaterial({ color: 0x4F7243, wireframe: true, transparent: true, opacity: 0.65 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  const light = new THREE.PointLight(0x4F7243, 1, 100);
  light.position.set(10, 10, 10);
  scene.add(light);

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.z += 0.004;
    renderer.render(scene, camera);
  }
  animate();
}

/* ==========================================================================
   3. GSAP SCROLLTRIGGER CINEMATIC REVEALS (WITH STABILITY PROPS CLEAR)
   ========================================================================== */

function initGSAPScrollAnimations() {
  gsap.utils.toArray('.hero-eyebrow, .hero-headline, .hero-copy-text, .editorial-title').forEach(elem => {
    gsap.fromTo(elem, 
      { opacity: 0, y: 30, filter: 'blur(6px)' },
      { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        duration: 1, 
        ease: 'power3.out',
        clearProps: 'opacity,transform,filter',
        scrollTrigger: {
          trigger: elem,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  const header = document.querySelector('.header');
  if (header) {
    ScrollTrigger.create({
      start: 'top -50',
      onUpdate: (self) => {
        if (self.direction === 1) {
          header.classList.add('scrolled');
        } else if (window.scrollY < 50) {
          header.classList.remove('scrolled');
        }
      }
    });
  }
}

/* ==========================================================================
   4. MAGNETIC BUTTONS & 3D GLASS TILT INTERACTION
   ========================================================================== */

function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.btn, .nav-link');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px) scale(1)';
    });
  });
}

function initGlassCardTilt() {
  const glassCards = document.querySelectorAll('.glass-card, .glass-enquiry-box');

  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 8;
      const rotateY = (x / rect.width) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ==========================================================================
   5. NAVIGATION & ROUTING (RECALL SCROLLTRIGGER ON VIEW SWITCH)
   ========================================================================== */

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-view]');
  const viewSections = document.querySelectorAll('.view-section');

  function switchView(viewId) {
    if (!viewId) viewId = 'group-home';

    navLinks.forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    viewSections.forEach(section => {
      if (section.id === viewId) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    history.pushState(null, null, `#${viewId}`);

    // Refresh ScrollTrigger so text is 100% visible on tab switch
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => {
        ScrollTrigger.refresh();
        window.scrollTo(0, 0);
      }, 100);
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(link.getAttribute('data-view'));
      closeMobileNav();
    });
  });

  document.querySelectorAll('[data-view-trigger]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(trigger.getAttribute('data-view-trigger'));
      closeMobileNav();
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    switchView(hash);
  }

  initMobileNav();
}

function closeMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.classList.remove('open');
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    closeMobileNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMobileNav();
  });
}

function initCorridorSelector() {
  const corridorBtns = document.querySelectorAll('.corridor-btn');
  const corridorDisplay = document.getElementById('corridor-dynamic-info');

  const corridorDetails = {
    'nordics': { title: 'India ⇄ Nordics Corridor', desc: 'Headquartered in Stavanger, Norway (Nordic Office), we facilitate technology transfer, green energy transitions, and market entry between Scandinavia and India.', stats: 'Stavanger Base • Cleantech & Offshore Energy' },
    'europe': { title: 'India ⇄ Europe Corridor', desc: 'Connecting Indian technology champions and European industrial networks. Facilitating DFI capital introductions and bilateral trade structuring.', stats: 'Frankfurt & Paris Hubs • DFIs & Impact Funds' },
    'africa': { title: 'India ⇄ Africa Corridor', desc: 'Sponsor-side development for energy and infrastructure projects, including solar IPPs and agricultural supply corridors across East & West Africa.', stats: 'Energy IPP Mandates • Agri Infrastructure' },
    'gulf': { title: 'India ⇄ Gulf Corridor', desc: 'Structured capital access across UAE, Qatar, and Saudi Arabia. Strategic representation for family offices and cross-border trade facilitation.', stats: 'GCC Family Offices • Middle East Trade Hubs' },
    'friendly-origin': { title: 'Friendly-Origin Supply Trade Corridors', desc: 'Structuring resilient trade flows, trade insurance, and verified counterpart networks across neutral international origin hubs.', stats: 'Resilient Logistics • Verified Counterparts' }
  };

  corridorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      corridorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const corrKey = btn.getAttribute('data-corridor-key');
      const info = corridorDetails[corrKey];

      if (info && corridorDisplay) {
        corridorDisplay.innerHTML = `
          <h4 style="font-family: var(--font-sans); font-weight: 700; font-size: 1.6rem; color: var(--color-ink); margin-bottom: 0.5rem;">${info.title}</h4>
          <p style="color: #424245; font-size: 1.05rem; margin-bottom: 1rem;">${info.desc}</p>
          <div style="display: inline-block; background: rgba(194, 154, 59, 0.15); color: var(--color-gold-deep); padding: 0.4rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 700;">
            ${info.stats}
          </div>
        `;
      }

      Object.keys(corridorArcs).forEach(k => {
        if (corridorArcs[k]) {
          if (k === corrKey) {
            corridorArcs[k].material.opacity = 1.0;
            corridorArcs[k].material.color.setHex(0xE8D48A);
          } else {
            corridorArcs[k].material.opacity = 0.35;
            corridorArcs[k].material.color.setHex(0xC29A3B);
          }
        }
      });
    });
  });
}

function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.count-up');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(num => {
          const target = parseInt(num.getAttribute('data-target'), 10);
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 40));
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              num.innerText = target;
              clearInterval(timer);
            } else {
              num.innerText = current;
            }
          }, 30);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.getElementById('global-stats-section');
  if (statsSection) observer.observe(statsSection);
}

function initContactForms() {
  const allianceForm = document.getElementById('alliance-enquiry-form');
  const agroForm = document.getElementById('agro-enquiry-form');

  if (allianceForm) {
    allianceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you. Your mandate brief has been dispatched directly to alliance@swarnikainternational.com.');
      allianceForm.reset();
      closeAllModals();
    });
  }

  if (agroForm) {
    agroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you. Your agro trade enquiry has been dispatched directly to agro@swarnikainternational.com.');
      agroForm.reset();
      closeAllModals();
    });
  }
}

function initModals() {
  document.querySelectorAll('[data-open-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-open-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) targetModal.classList.add('active');
    });
  });

  document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
}
