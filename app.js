/**
 * Khulna University Physics Discipline Alumni Web Portal Logic
 * Off-White & Black Palette, Text-Based Cards, Contact Handles with SVG Logos, Admin Protection & Delete Profile Manager
 * GitHub API Integration for persistent data commits
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let selectedCategory = 'all';
  let searchQuery = '';
  let selectedBatch = 'all';
  let isAdminAuthenticated = false;
  let editingAlumniId = null; // Tracks which profile is being edited
  const ADMIN_PASSCODE = "kuphysics2026"; // Default Admin Passcode

  // GitHub API Configuration
  const GITHUB_CONFIG = {
    owner: 'talhamahamud',
    repo: 'ku-physics-alumni',
    branch: 'main',
    filePath: 'alumni-data.js'
  };
  let githubToken = sessionStorage.getItem('kuphy_github_token') || null;

  // Space-Net Canvas Setup
  const canvas = document.getElementById('physics-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let mouse = { x: null, y: null };

  // SVG Vector Icons Definition
  const SVG_ICONS = {
    email: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    linkedin: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    scholar: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    facebook: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
    website: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    researchGate: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9 9h6v6H9z"></path></svg>`,
    phone: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`
  };

  // localStorage Keys (kept as fallback)
  const LS_DELETED_IDS = 'kuphy_deleted_ids';
  const LS_ADDED_ALUMNI = 'kuphy_added_alumni';

  // Load persisted deletions and additions from localStorage (fallback when GitHub API is unavailable)
  function loadPersistedData() {
    // Remove deleted profiles from ALUMNI_DATA
    const deletedIds = JSON.parse(localStorage.getItem(LS_DELETED_IDS) || '[]');
    deletedIds.forEach(id => {
      const idx = ALUMNI_DATA.findIndex(a => a.id === id);
      if (idx !== -1) ALUMNI_DATA.splice(idx, 1);
    });

    // Restore admin-added profiles
    const addedAlumni = JSON.parse(localStorage.getItem(LS_ADDED_ALUMNI) || '[]');
    addedAlumni.forEach(alumni => {
      if (!ALUMNI_DATA.find(a => a.id === alumni.id)) {
        ALUMNI_DATA.unshift(alumni);
      }
    });
  }

  /* ==========================================================================
     GitHub API — Commit alumni-data.js to Repository
     ========================================================================== */

  /**
   * Serializes the current ALUMNI_DATA and GUIDANCE_ROADMAP arrays back into
   * the alumni-data.js file format.
   */
  function serializeAlumniDataFile() {
    const header = `/**\n * Khulna University Physics Discipline Alumni Database\n * Curated dataset showcasing alumni in Researcher and Tech, Data & AI domains.\n */\n\n`;
    const alumniStr = `const ALUMNI_DATA = ${JSON.stringify(ALUMNI_DATA, null, 2)};\n\n`;
    const roadmapStr = `// Career tracks database for freshers (Study Abroad & Tech/Data/AI)\nconst GUIDANCE_ROADMAP = ${JSON.stringify(GUIDANCE_ROADMAP, null, 2)};\n`;
    return header + alumniStr + roadmapStr;
  }

  /**
   * Commits the current alumni-data.js content to GitHub via the Contents API.
   * Returns true on success, false on failure.
   */
  async function commitAlumniDataToGitHub(commitMessage) {
    if (!githubToken) {
      console.warn('No GitHub token available. Changes saved to localStorage only.');
      return false;
    }

    showSyncIndicator('Syncing with GitHub...');

    try {
      const { owner, repo, branch, filePath } = GITHUB_CONFIG;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

      // Step 1: Get current file SHA (required for update)
      const getResponse = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!getResponse.ok) {
        const errData = await getResponse.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch file (HTTP ${getResponse.status})`);
      }

      const fileData = await getResponse.json();
      const currentSha = fileData.sha;

      // Step 2: Encode the new content to Base64
      const newContent = serializeAlumniDataFile();
      const encodedContent = btoa(unescape(encodeURIComponent(newContent)));

      // Step 3: Commit the updated file
      const putResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          sha: currentSha,
          branch: branch
        })
      });

      if (!putResponse.ok) {
        const errData = await putResponse.json().catch(() => ({}));
        throw new Error(errData.message || `Commit failed (HTTP ${putResponse.status})`);
      }

      hideSyncIndicator();
      showToast('✅ Changes committed to GitHub successfully! Site will update in ~1 min.');

      // Clear localStorage fallback data since GitHub is now the source of truth
      localStorage.removeItem(LS_DELETED_IDS);
      localStorage.removeItem(LS_ADDED_ALUMNI);

      return true;
    } catch (error) {
      hideSyncIndicator();
      console.error('GitHub commit error:', error);
      showToast(`⚠️ GitHub sync failed: ${error.message}. Changes saved locally.`);
      return false;
    }
  }

  /** Show a floating sync indicator overlay */
  function showSyncIndicator(message) {
    let indicator = document.getElementById('github-sync-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'github-sync-indicator';
      document.body.appendChild(indicator);
    }
    indicator.innerHTML = `
      <div class="sync-spinner"></div>
      <span>${message}</span>
    `;
    indicator.classList.add('visible');
  }

  /** Hide the sync indicator */
  function hideSyncIndicator() {
    const indicator = document.getElementById('github-sync-indicator');
    if (indicator) indicator.classList.remove('visible');
  }

  // Initialize Application
  loadPersistedData();
  initSpaceNetCanvas();
  renderAlumniCards(ALUMNI_DATA);
  renderRoadmap();
  setupEventListeners();
  initHamburgerMenu();

  /* ==========================================================================
     Hamburger Menu Toggle (Mobile)
     ========================================================================== */
  function initHamburgerMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const drawer = document.getElementById('nav-drawer');
    if (!hamburger || !drawer) return;

    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close drawer when a nav link is clicked (smooth scroll)
    drawer.querySelectorAll('a.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !drawer.contains(e.target)) {
        drawer.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ==========================================================================
     6-Pendulum Physics Animation — Hero Background
     ========================================================================== */
  function initSpaceNetCanvas() {
    if (!canvas || !ctx) return;

    const isMobile = () => window.innerWidth <= 768;

    // Adaptive constants based on device
    let G = 0.6;
    let DAMPING = 0.999;
    let TRAIL_LEN = isMobile() ? 25 : 100;
    let MAX_PENDULUMS = isMobile() ? 3 : 6;

    let pivotY = 0;
    let pendulums = [];
    let animFrameId = null;
    let isVisible = true; // Page Visibility
    let isInView = true;  // IntersectionObserver

    function buildPendulums(w, h) {
      TRAIL_LEN = isMobile() ? 25 : 100;
      MAX_PENDULUMS = isMobile() ? 3 : 6;

      pivotY = h * 0.08;
      pendulums = [];

      const scale = Math.max(0.45, Math.min(1, w / 800));

      const configs = [
        { l1: 90 * scale,  l2: 70 * scale,  a1: 1.8,  a2: -1.2, px: 0.14 },
        { l1: 110 * scale, l2: 85 * scale,  a1: 2.1,  a2: 0.9,  px: 0.28 },
        { l1: 80 * scale,  l2: 95 * scale,  a1: -1.6, a2: 1.5,  px: 0.42 },
        { l1: 100 * scale, l2: 75 * scale,  a1: 1.4,  a2: -2.0, px: 0.56 },
        { l1: 115 * scale, l2: 65 * scale,  a1: -1.9, a2: 1.1,  px: 0.70 },
        { l1: 85 * scale,  l2: 90 * scale,  a1: 2.3,  a2: -0.8, px: 0.84 },
      ].slice(0, MAX_PENDULUMS);

      configs.forEach((c, i) => {
        pendulums.push({
          px: c.px,
          l1: c.l1, l2: c.l2,
          a1: c.a1, a2: c.a2,
          v1: 0, v2: 0,
          trail: [],
          hue: i
        });
      });
    }

    // Debounced resize handler
    let resizeTimer = null;
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      const heroEl = document.querySelector('.hero');
      const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;
      canvas.height = heroRect ? heroRect.height + 60 : 450;
      buildPendulums(canvas.width, canvas.height);
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    });
    resizeCanvas();

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && isInView) startLoop();
    });

    // Pause when canvas scrolls out of view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        isInView = entries[0].isIntersecting;
        if (isInView && isVisible) startLoop();
        else stopLoop();
      }, { threshold: 0.01 });
      observer.observe(canvas);
    }

    function stepPendulum(p, w) {
      const pivX = p.px * w;
      const m1 = 1, m2 = 1;
      const { l1, l2, a1, a2, v1, v2 } = p;

      const num1 = -G * (2 * m1 + m2) * Math.sin(a1)
                 - m2 * G * Math.sin(a1 - 2 * a2)
                 - 2 * Math.sin(a1 - a2) * m2
                   * (v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(a1 - a2));
      const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
      const dv1  = num1 / den1;

      const num2 = 2 * Math.sin(a1 - a2)
                 * (v1 * v1 * l1 * (m1 + m2)
                  + G * (m1 + m2) * Math.cos(a1)
                  + v2 * v2 * l2 * m2 * Math.cos(a1 - a2));
      const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
      const dv2  = num2 / den2;

      p.v1 = (p.v1 + dv1) * DAMPING;
      p.v2 = (p.v2 + dv2) * DAMPING;
      p.a1 += p.v1;
      p.a2 += p.v2;

      const b1x = pivX + l1 * Math.sin(p.a1);
      const b1y = pivotY + l1 * Math.cos(p.a1);
      const b2x = b1x + l2 * Math.sin(p.a2);
      const b2y = b1y + l2 * Math.cos(p.a2);

      p.trail.push({ x: b2x, y: b2y });
      if (p.trail.length > TRAIL_LEN) p.trail.shift();

      return { pivX, b1x, b1y, b2x, b2y };
    }

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;

      pendulums.forEach((p) => {
        const { pivX, b1x, b1y, b2x, b2y } = stepPendulum(p, w);

        // Batch all trail segments into a single Path2D (huge perf win on mobile)
        if (p.trail.length > 1) {
          const trail = p.trail;
          const len = trail.length;
          // Draw entire trail as one gradient path
          ctx.save();
          ctx.lineWidth = 1.2;
          const path = new Path2D();
          path.moveTo(trail[0].x, trail[0].y);
          for (let i = 1; i < len; i++) path.lineTo(trail[i].x, trail[i].y);
          ctx.strokeStyle = 'rgba(9,9,11,0.12)';
          ctx.stroke(path);
          ctx.restore();
        }

        // Pivot
        ctx.beginPath();
        ctx.arc(pivX, pivotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,9,11,0.25)';
        ctx.fill();

        // Arm 1
        ctx.beginPath();
        ctx.moveTo(pivX, pivotY);
        ctx.lineTo(b1x, b1y);
        ctx.strokeStyle = 'rgba(9,9,11,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bob 1
        ctx.beginPath();
        ctx.arc(b1x, b1y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,9,11,0.18)';
        ctx.fill();

        // Arm 2
        ctx.beginPath();
        ctx.moveTo(b1x, b1y);
        ctx.lineTo(b2x, b2y);
        ctx.strokeStyle = 'rgba(9,9,11,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bob 2
        ctx.beginPath();
        ctx.arc(b2x, b2y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,9,11,0.5)';
        ctx.fill();
      });
    }

    function startLoop() {
      if (!animFrameId) animate();
    }

    function stopLoop() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }

    animate();
  }

  /* ==========================================================================
     Alumni Directory Card Renderer (Pure Text & Information Cards)
     ========================================================================== */
  function renderAlumniCards(dataArray) {
    const gridContainer = document.getElementById('alumni-grid');
    const countLabel = document.getElementById('result-count');
    if (!gridContainer) return;

    if (countLabel) {
      countLabel.textContent = `Showing ${dataArray.length} alumni profile${dataArray.length === 1 ? '' : 's'}`;
    }

    if (dataArray.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-box">
          <h3>No Profiles Found</h3>
          <p>No alumni match your current search keywords or category filters.</p>
          <button class="btn-outline" id="btn-reset-filter">Reset Filters</button>
        </div>
      `;
      document.getElementById('btn-reset-filter')?.addEventListener('click', resetFilters);
      return;
    }

    gridContainer.innerHTML = dataArray.map(alumni => {
      const categoryNames = {
        'study-abroad': 'Researcher',
        'tech': 'Tech, Data & AI',
        'govt-job': 'GOVT. Job',
        'bank': 'Bank',
        'school': 'School'
      };
      const categoryLabel = categoryNames[alumni.categoryTag] || 'Alumni';

      // Determine available contact handles
      const hasContacts = alumni.email || alumni.linkedin || alumni.scholar || alumni.facebook || alumni.website || alumni.researchGate;

      // Default blank photo if no image
      const blankAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>`;
      const imgSource = alumni.image || blankAvatar;

      return `
        <article class="alumni-card list-view-card" data-id="${alumni.id}">
          <div class="alumni-info-col">
            <div class="card-header-flex">
              <img src="${imgSource}" alt="${alumni.name}" class="alumni-profile-img" loading="lazy" decoding="async">
              <div class="card-title-group">
                <h3>${alumni.name}</h3>
                <span class="batch-badge">${alumni.batch}</span>
                <p class="card-role">${alumni.title}</p>
                <p class="card-org">${alumni.organization}</p>
                <p class="card-location">${alumni.location}</p>
                ${alumni.phone ? `<p class="card-phone"><a href="tel:${alumni.phone}" style="color: inherit; text-decoration: none;">📞 ${alumni.phone}</a></p>` : ''}
              </div>
            </div>
          </div>

          <div class="alumni-action-col">
            <div class="category-tag-label">
              ${categoryLabel}
            </div>

            ${hasContacts ? `
              <div class="contact-links-row">
                ${alumni.email ? `<a href="mailto:${alumni.email}" class="contact-icon-only" title="Email">${SVG_ICONS.email}</a>` : ''}
                ${alumni.linkedin ? `<a href="${alumni.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-icon-only" title="LinkedIn">${SVG_ICONS.linkedin}</a>` : ''}
                ${alumni.scholar ? `<a href="${alumni.scholar}" target="_blank" rel="noopener noreferrer" class="contact-icon-only" title="Google Scholar">${SVG_ICONS.scholar}</a>` : ''}
                ${alumni.facebook ? `<a href="${alumni.facebook}" target="_blank" rel="noopener noreferrer" class="contact-icon-only" title="Facebook">${SVG_ICONS.facebook}</a>` : ''}
                ${alumni.website ? `<a href="${alumni.website}" target="_blank" rel="noopener noreferrer" class="contact-icon-only" title="Personal Website">${SVG_ICONS.website}</a>` : ''}
                ${alumni.researchGate ? `<a href="${alumni.researchGate}" target="_blank" rel="noopener noreferrer" class="contact-icon-only" title="ResearchGate">${SVG_ICONS.researchGate}</a>` : ''}
              </div>
            ` : ''}

            ${isAdminAuthenticated ? `
              <div style="margin-top: 0.8rem; width: 100%;">
                <button class="btn-danger" style="width: 100%; padding: 0.3rem;" data-action="admin-delete" data-id="${alumni.id}">
                  Delete
                </button>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    // Attach listeners for Admin Delete button on card if authenticated
    if (isAdminAuthenticated) {
      gridContainer.querySelectorAll('[data-action="admin-delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          deleteAlumniProfile(e.currentTarget.dataset.id);
        });
      });
    }
  }

  /* ==========================================================================
     Filtering Logic
     ========================================================================== */
  function filterDirectory() {
    const filtered = ALUMNI_DATA.filter(alumni => {
      const matchCategory = selectedCategory === 'all' || alumni.categoryTag === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        alumni.name.toLowerCase().includes(q) ||
        alumni.title.toLowerCase().includes(q) ||
        alumni.organization.toLowerCase().includes(q) ||
        alumni.batch.toLowerCase().includes(q) ||
        alumni.location.toLowerCase().includes(q) ||
        (alumni.kuThesisTopic && alumni.kuThesisTopic.toLowerCase().includes(q)) ||
        alumni.tags.some(t => t.toLowerCase().includes(q))
      );

      const matchBatch = selectedBatch === 'all' || alumni.batch.includes(selectedBatch);

      return matchCategory && matchSearch && matchBatch;
    });

    renderAlumniCards(filtered);
  }

  function resetFilters() {
    selectedCategory = 'all';
    searchQuery = '';
    selectedBatch = 'all';

    const searchInput = document.getElementById('search-input');
    const batchSelect = document.getElementById('batch-select');

    if (searchInput) searchInput.value = '';
    if (batchSelect) batchSelect.value = 'all';

    document.querySelectorAll('.category-pills-group .pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });

    filterDirectory();
  }

  /* ==========================================================================
     Roadmap Renderer
     ========================================================================== */
  function renderRoadmap() {
    const container = document.getElementById('roadmap-grid-container');
    if (!container) return;

    container.innerHTML = GUIDANCE_ROADMAP.map(track => `
      <div class="roadmap-card">
        <h3>${track.category}</h3>
        <p class="summary">${track.summary}</p>
        <div class="roadmap-step-list">
          ${track.steps.map(step => `
            <div class="step-item">
              <span class="step-title-pill">${step.title}</span>
              <div class="step-content">
                <p>${step.detail}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 1.2rem; font-size: 0.8rem; color: var(--text-muted);">
          Key Alumni Contacts: ${track.alumniContacts.join(', ')}
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     Delete Profile Functionality (committed to GitHub + localStorage fallback)
     ========================================================================== */
  async function deleteAlumniProfile(alumniId) {
    const alumniIndex = ALUMNI_DATA.findIndex(a => a.id === alumniId);
    if (alumniIndex === -1) return;

    const alumniName = ALUMNI_DATA[alumniIndex].name;
    if (confirm(`Are you sure you want to permanently delete the profile for "${alumniName}"? This will commit the change to GitHub.`)) {
      // Remove from in-memory array
      ALUMNI_DATA.splice(alumniIndex, 1);
      filterDirectory();

      // Re-render admin manage modal if currently open
      const manageContainer = document.getElementById('admin-manage-list');
      if (manageContainer) {
        renderAdminManageList();
      }

      // Commit to GitHub (permanent)
      const committed = await commitAlumniDataToGitHub(`Delete alumni profile: ${alumniName}`);

      if (!committed) {
        // Fallback: persist deletion in localStorage
        const deletedIds = JSON.parse(localStorage.getItem(LS_DELETED_IDS) || '[]');
        if (!deletedIds.includes(alumniId)) {
          deletedIds.push(alumniId);
          localStorage.setItem(LS_DELETED_IDS, JSON.stringify(deletedIds));
        }

        // Also remove from added alumni list if it was admin-added
        const addedAlumni = JSON.parse(localStorage.getItem(LS_ADDED_ALUMNI) || '[]');
        const updatedAdded = addedAlumni.filter(a => a.id !== alumniId);
        localStorage.setItem(LS_ADDED_ALUMNI, JSON.stringify(updatedAdded));

        showToast(`Profile for ${alumniName} deleted locally (GitHub sync failed).`);
      }
    }
  }

  function renderAdminManageList() {
    const manageContainer = document.getElementById('admin-manage-list');
    if (!manageContainer) return;

    if (ALUMNI_DATA.length === 0) {
      manageContainer.innerHTML = `<p style="font-size:0.85rem; color: var(--text-muted);">No alumni profiles in database.</p>`;
      return;
    }

    manageContainer.innerHTML = ALUMNI_DATA.map(alumni => `
      <div class="admin-manage-item">
        <div class="admin-manage-info">
          <div style="min-width: 0;">
            <div style="font-weight: 700; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${alumni.name}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${alumni.title} • ${alumni.batch}</div>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; align-items: center;">
          <button class="btn-outline" data-action="edit-from-list" data-id="${alumni.id}" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; min-width: 60px;">
            Edit
          </button>
          <button class="btn-danger" data-action="delete-from-list" data-id="${alumni.id}" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; min-width: 60px;">
            Delete
          </button>
        </div>
      </div>
    `).join('');

    manageContainer.querySelectorAll('[data-action="delete-from-list"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        deleteAlumniProfile(e.currentTarget.dataset.id);
      });
    });

    manageContainer.querySelectorAll('[data-action="edit-from-list"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        editAlumniProfile(e.currentTarget.dataset.id);
      });
    });
  }

  function editAlumniProfile(alumniId) {
    const alumni = ALUMNI_DATA.find(a => a.id === alumniId);
    if (!alumni) return;

    editingAlumniId = alumniId;

    // Switch to Add/Edit tab
    const tabAdd = document.getElementById('admin-tab-add');
    const tabManage = document.getElementById('admin-tab-manage');
    const panelAdd = document.getElementById('admin-panel-add');
    const panelManage = document.getElementById('admin-panel-manage');

    if (tabAdd) tabAdd.classList.add('active');
    if (tabManage) tabManage.classList.remove('active');
    if (panelAdd) panelAdd.style.display = 'block';
    if (panelManage) panelManage.style.display = 'none';

    // Populate form
    document.getElementById('add-name').value = alumni.name || '';
    document.getElementById('add-batch').value = alumni.batch || '';
    document.getElementById('add-title').value = alumni.title || '';
    document.getElementById('add-org').value = alumni.organization || '';
    document.getElementById('add-category').value = alumni.categoryTag || 'study-abroad';
    document.getElementById('add-location').value = alumni.location || '';
    document.getElementById('add-email').value = alumni.email || '';
    document.getElementById('add-linkedin').value = alumni.linkedin || '';
    document.getElementById('add-scholar').value = alumni.scholar || '';
    document.getElementById('add-facebook').value = alumni.facebook || '';
    document.getElementById('add-website').value = alumni.website || '';
    document.getElementById('add-phone').value = alumni.phone || '';
    
    const imageInput = document.getElementById('add-image');
    if (imageInput) imageInput.value = alumni.image || '';

    // Change button text
    const submitBtn = document.querySelector('#admin-add-alumni-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update Profile';
  }

  /* ==========================================================================
     Admin Access & "Join Network (Admin)" Management Modal
     ========================================================================== */
  function handleAdminAccessRequest() {
    if (isAdminAuthenticated) {
      openAdminAlumniModal();
      return;
    }

    // Open Admin Auth Modal
    const modalBox = document.getElementById('modal-admin-auth-box');
    const modalBackdrop = document.getElementById('modal-admin-auth-backdrop');

    modalBox.innerHTML = `
      <button class="modal-close" id="modal-auth-close">✕</button>
      <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.4rem;">Admin Verification Required</h2>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1.2rem;">
        Adding or managing alumni profiles is restricted to discipline administrators. Enter your admin passcode and GitHub token to enable permanent data changes.
      </p>

      <form id="admin-auth-form">
        <div class="form-group">
          <label class="form-label">Admin Passcode</label>
          <input type="password" class="form-input" id="auth-passcode" placeholder="Enter admin passcode" required />
          <p id="auth-error" style="color: #e11d48; font-size: 0.8rem; margin-top: 0.3rem; display: none;">Invalid passcode. Try again.</p>
        </div>

        <div class="form-group" style="margin-top: 0.8rem;">
          <label class="form-label">GitHub Personal Access Token</label>
          <input type="password" class="form-input" id="auth-github-token" placeholder="ghp_xxxxxxxxxxxx" />
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">
            Required for permanent changes. Token needs <strong>repo</strong> or <strong>contents:write</strong> scope.
            <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: underline;">Create token →</a>
          </p>
        </div>

        <button type="submit" class="btn-black" style="width: 100%; margin-top: 1rem;">
          Authenticate Admin
        </button>
      </form>
    `;

    modalBackdrop.classList.add('active');

    document.getElementById('modal-auth-close')?.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });

    document.getElementById('admin-auth-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputPasscode = document.getElementById('auth-passcode').value;
      const inputToken = document.getElementById('auth-github-token').value.trim();

      if (inputPasscode === ADMIN_PASSCODE) {
        isAdminAuthenticated = true;

        // Store GitHub token in sessionStorage (cleared when tab closes)
        if (inputToken) {
          githubToken = inputToken;
          sessionStorage.setItem('kuphy_github_token', inputToken);
        }

        modalBackdrop.classList.remove('active');
        showToast(githubToken
          ? "Admin access granted with GitHub sync enabled."
          : "Admin access granted (local-only mode — no GitHub token provided).");
        openAdminAlumniModal();
        filterDirectory(); // Update cards to show Delete buttons
      } else {
        document.getElementById('auth-error').style.display = 'block';
      }
    });
  }

  function openAdminAlumniModal() {
    const modalBox = document.getElementById('modal-add-box');
    const modalBackdrop = document.getElementById('modal-add-backdrop');

    modalBox.innerHTML = `
      <button class="modal-close" id="modal-add-close">✕</button>
      <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.3rem;">
        Alumni Management Panel
      </h2>
      
      <!-- Admin Tab Switcher -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.4rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        <button id="admin-tab-add" class="pill-btn active">Add / Edit Profile</button>
        <button id="admin-tab-manage" class="pill-btn">Manage Profiles (${ALUMNI_DATA.length})</button>
      </div>

      <!-- Tab 1: Add New Profile -->
      <div id="admin-panel-add">
        <form id="admin-add-alumni-form">
          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="add-name" required placeholder="e.g. Dr. Alamgir Hossain" />
            </div>
            <div class="form-group">
              <label class="form-label">KU Batch</label>
              <input type="text" class="form-input" id="add-batch" required placeholder="e.g. 14th Batch (2011-12)" />
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">Title / Role</label>
              <input type="text" class="form-input" id="add-title" required placeholder="e.g. Senior Software Engineer" />
            </div>
            <div class="form-group">
              <label class="form-label">Organization</label>
              <input type="text" class="form-input" id="add-org" required placeholder="e.g. Google / Cambridge" />
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">Category Segment</label>
              <select class="form-input" id="add-category" required>
                <option value="study-abroad">Researcher</option>
                <option value="tech">Tech, Data & AI</option>
                <option value="govt-job">GOVT. Job</option>
                <option value="bank">Bank</option>
                <option value="school">School</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">City & Country</label>
              <input type="text" class="form-input" id="add-location" required placeholder="e.g. Tokyo, Japan" />
            </div>
          </div>

          <!-- Contact Handles Inputs -->
          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="add-email" placeholder="alumni@domain.com" />
            </div>
            <div class="form-group">
              <label class="form-label">LinkedIn URL</label>
              <input type="url" class="form-input" id="add-linkedin" placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">Google Scholar URL</label>
              <input type="url" class="form-input" id="add-scholar" placeholder="https://scholar.google.com/..." />
            </div>
            <div class="form-group">
              <label class="form-label">Facebook URL</label>
              <input type="url" class="form-input" id="add-facebook" placeholder="https://facebook.com/..." />
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">Personal / Custom Website Link</label>
              <input type="url" class="form-input" id="add-website" placeholder="https://yourwebsite.com" />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" class="form-input" id="add-phone" placeholder="e.g. +880 1700 000000" />
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label">Profile Image URL (e.g., ImgBB)</label>
              <input type="url" class="form-input" id="add-image" placeholder="https://i.ibb.co/..." />
            </div>
            <div class="form-group"></div>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
            <button type="submit" class="btn-black" style="flex: 1; min-width: 180px;">
              Save & Publish Profile
            </button>
            <button type="button" class="btn-outline" id="btn-export-excel" style="flex: 1; min-width: 160px;">
              Export to Excel (CSV)
            </button>
          </div>
        </form>
      </div>

      <!-- Tab 2: Manage & Delete Profiles -->
      <div id="admin-panel-manage" style="display: none;">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Click "Delete" next to any profile below to permanently remove it from the directory:
        </p>
        <div id="admin-manage-list" style="max-height: 350px; overflow-y: auto;"></div>
      </div>
    `;

    modalBackdrop.classList.add('active');

    // Admin Tab Toggle Logic
    const tabAdd = document.getElementById('admin-tab-add');
    const tabManage = document.getElementById('admin-tab-manage');
    const panelAdd = document.getElementById('admin-panel-add');
    const panelManage = document.getElementById('admin-panel-manage');

    tabAdd?.addEventListener('click', () => {
      tabAdd.classList.add('active');
      tabManage.classList.remove('active');
      panelAdd.style.display = 'block';
      panelManage.style.display = 'none';

      if (editingAlumniId !== null) {
        editingAlumniId = null;
        document.getElementById('admin-add-alumni-form').reset();
        const submitBtn = document.querySelector('#admin-add-alumni-form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Save & Publish Profile';
      }
    });

    tabManage?.addEventListener('click', () => {
      tabManage.classList.add('active');
      tabAdd.classList.remove('active');
      panelAdd.style.display = 'none';
      panelManage.style.display = 'block';
      renderAdminManageList();
    });

    document.getElementById('modal-add-close')?.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });

    // Form Submission
    document.getElementById('admin-add-alumni-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const imageInput = document.getElementById('add-image');
      let imageVal = (imageInput && imageInput.value) ? imageInput.value.trim() : null;

      // ImgBB / Image URL Validation
      if (imageVal && !imageVal.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) {
        alert('Error: The Profile Image URL must be a direct image link (ending in .jpg, .png, etc.).\n\nIf using ImgBB, do not use the viewer link. Right-click the uploaded image and select "Copy image address" to get the direct link.');
        return;
      }

      const formData = {
        name: document.getElementById('add-name').value,
        batch: document.getElementById('add-batch').value,
        session: "2015-2016",
        title: document.getElementById('add-title').value,
        organization: document.getElementById('add-org').value,
        location: document.getElementById('add-location').value,
        categoryTag: document.getElementById('add-category').value,
        tags: ["Alumni", document.getElementById('add-category').value],
        email: document.getElementById('add-email').value || null,
        phone: document.getElementById('add-phone').value.trim() || null,
        linkedin: document.getElementById('add-linkedin').value || null,
        scholar: document.getElementById('add-scholar').value || null,
        facebook: document.getElementById('add-facebook').value || null,
        website: document.getElementById('add-website').value || null,
        image: imageVal,
        kuThesisTopic: "Applied Physics Research",
        availableForMentorship: true,
        careerPathway: [
          { year: "2018", event: "B.Sc. in Physics, Khulna University" },
          { year: "2020", event: "Joined " + document.getElementById('add-org').value }
        ]
      };

      let commitMsg = '';
      
      if (editingAlumniId) {
        // Edit mode
        const index = ALUMNI_DATA.findIndex(a => a.id === editingAlumniId);
        if (index !== -1) {
          ALUMNI_DATA[index] = { ...ALUMNI_DATA[index], ...formData };
        }
        commitMsg = `Update alumni profile: ${formData.name}`;
      } else {
        // Add mode
        const newAlumni = {
          id: "ku-phy-" + Date.now(),
          ...formData
        };
        ALUMNI_DATA.unshift(newAlumni);
        commitMsg = `Add alumni profile: ${formData.name}`;
      }

      filterDirectory();
      modalBackdrop.classList.remove('active');

      // Reset form and state
      editingAlumniId = null;
      document.getElementById('admin-add-alumni-form').reset();
      const submitBtn = document.querySelector('#admin-add-alumni-form button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Save & Publish Profile';

      // Commit to GitHub (permanent)
      const committed = await commitAlumniDataToGitHub(commitMsg);

      if (!committed && !editingAlumniId) { // Basic fallback for adding only for now
        const addedAlumni = JSON.parse(localStorage.getItem(LS_ADDED_ALUMNI) || '[]');
        // We recreate the newAlumni object since we didn't save it directly in scope above for fallback
        const newAlumni = ALUMNI_DATA[0]; 
        addedAlumni.unshift(newAlumni);
        localStorage.setItem(LS_ADDED_ALUMNI, JSON.stringify(addedAlumni));
        showToast(`Profile for ${formData.name} saved locally (GitHub sync failed).`);
      } else if (!committed) {
        showToast(`Warning: Update for ${formData.name} could not be synced to GitHub.`);
      }
    });

    // Excel (CSV) Export button
    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
      if (!ALUMNI_DATA || ALUMNI_DATA.length === 0) {
        showToast("No data to export.");
        return;
      }

      // 1. Define columns for CSV
      const headers = ["ID", "Name", "Batch", "Session", "Title", "Organization", "Location", "Category", "Email", "Phone", "LinkedIn", "Google Scholar", "Facebook", "Website", "Image URL", "Thesis Topic"];
      
      // 2. Build rows
      const rows = ALUMNI_DATA.map(alumni => {
        return [
          alumni.id,
          alumni.name,
          alumni.batch,
          alumni.session,
          alumni.title,
          alumni.organization,
          alumni.location,
          alumni.categoryTag,
          alumni.email || "",
          alumni.phone || "",
          alumni.linkedin || "",
          alumni.scholar || "",
          alumni.facebook || "",
          alumni.website || "",
          alumni.image || "",
          alumni.kuThesisTopic || ""
        ].map(value => {
          // Escape quotes and wrap fields in quotes to handle commas
          const str = String(value).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",");
      });

      // 3. Combine headers and rows (using proper newline characters)
      const csvContent = headers.join(",") + "\n" + rows.join("\n");

      // 4. Trigger download using Blob to include UTF-8 BOM (fixes Excel formatting)
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", "ku-physics-alumni-data.csv");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      
      showToast("Downloaded alumni data as Excel (CSV) file.");
    });
  }

  /* ==========================================================================
     Toast Notifications & Event Listeners
     ========================================================================== */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterDirectory();
      });
    }

    document.querySelectorAll('.category-pills-group .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-pills-group .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.dataset.category;
        filterDirectory();
      });
    });

    const batchSelect = document.getElementById('batch-select');
    if (batchSelect) {
      batchSelect.addEventListener('change', (e) => {
        selectedBatch = e.target.value;
        filterDirectory();
      });
    }

    document.getElementById('btn-open-admin-access')?.addEventListener('click', handleAdminAccessRequest);

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });
  }
});
