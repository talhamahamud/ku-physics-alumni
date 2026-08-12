/**
 * Khulna University Physics Discipline Alumni Web Portal Logic
 * Off-White & Black Palette, Text-Based Cards, Contact Handles with SVG Logos, Admin Protection & Delete Profile Manager
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let selectedCategory = 'all';
  let searchQuery = '';
  let selectedBatch = 'all';
  let isAdminAuthenticated = false;
  const ADMIN_PASSCODE = "kuphysics2026"; // Default Admin Passcode

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
    researchGate: `<svg class="contact-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9 9h6v6H9z"></path></svg>`
  };

  // localStorage Keys
  const LS_DELETED_IDS = 'kuphy_deleted_ids';
  const LS_ADDED_ALUMNI = 'kuphy_added_alumni';

  // Load persisted deletions and additions from localStorage
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

  // Initialize Application
  loadPersistedData();
  initSpaceNetCanvas();
  renderAlumniCards(ALUMNI_DATA);
  renderRoadmap();
  setupEventListeners();

  /* ==========================================================================
     6-Pendulum Physics Animation — Hero Background
     ========================================================================== */
  function initSpaceNetCanvas() {
    if (!canvas || !ctx) return;

    const G = 0.6;          // gravity constant
    const DAMPING = 0.999;  // air resistance
    const TRAIL_LEN = 100;  // trail length (frames)

    let pivotY = 0;
    let pendulums = [];

    function buildPendulums(w, h) {
      pivotY = h * 0.08; // pivot near top of hero
      pendulums = [];

      // Scale pendulum lengths dynamically for small viewports (mobile/tablet/PC)
      const scale = Math.max(0.45, Math.min(1, w / 800));

      const configs = [
        { l1: 90 * scale,  l2: 70 * scale,  a1: 1.8,  a2: -1.2, px: 0.14 },
        { l1: 110 * scale, l2: 85 * scale,  a1: 2.1,  a2: 0.9,  px: 0.28 },
        { l1: 80 * scale,  l2: 95 * scale,  a1: -1.6, a2: 1.5,  px: 0.42 },
        { l1: 100 * scale, l2: 75 * scale,  a1: 1.4,  a2: -2.0, px: 0.56 },
        { l1: 115 * scale, l2: 65 * scale,  a1: -1.9, a2: 1.1,  px: 0.70 },
        { l1: 85 * scale,  l2: 90 * scale,  a1: 2.3,  a2: -0.8, px: 0.84 },
      ];

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

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      const heroEl = document.querySelector('.hero');
      const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;
      canvas.height = heroRect ? heroRect.height + 60 : 450;
      buildPendulums(canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;

      pendulums.forEach((p) => {
        const { pivX, b1x, b1y, b2x, b2y } = stepPendulum(p, w);

        // Draw fading trail of bob2
        for (let i = 1; i < p.trail.length; i++) {
          const t = i / p.trail.length;
          ctx.beginPath();
          ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
          ctx.strokeStyle = `rgba(9,9,11,${t * 0.16})`;
          ctx.lineWidth = t * 1.1;
          ctx.stroke();
        }

        // Draw pivot point
        ctx.beginPath();
        ctx.arc(pivX, pivotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,9,11,0.25)';
        ctx.fill();

        // Draw arm 1
        ctx.beginPath();
        ctx.moveTo(pivX, pivotY);
        ctx.lineTo(b1x, b1y);
        ctx.strokeStyle = 'rgba(9,9,11,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw bob 1
        ctx.beginPath();
        ctx.arc(b1x, b1y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,9,11,0.18)';
        ctx.fill();

        // Draw arm 2
        ctx.beginPath();
        ctx.moveTo(b1x, b1y);
        ctx.lineTo(b2x, b2y);
        ctx.strokeStyle = 'rgba(9,9,11,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw bob 2
        ctx.beginPath();
        ctx.arc(b2x, b2y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(9,9,11,0.5)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
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
        'tech': 'Tech, Data & AI'
      };
      const categoryLabel = categoryNames[alumni.categoryTag] || 'Alumni';

      // Determine available contact handles
      const hasContacts = alumni.email || alumni.linkedin || alumni.scholar || alumni.facebook || alumni.website || alumni.researchGate;

      return `
        <article class="alumni-card" data-id="${alumni.id}">
          <div class="card-header-flex">
            <div class="card-title-group">
              <h3>${alumni.name}</h3>
              <span class="batch-badge">${alumni.batch}</span>
              <p class="card-role">${alumni.title}</p>
              <p class="card-org">${alumni.organization}</p>
              <p class="card-location">${alumni.location}</p>
            </div>
          </div>

          <div class="category-tag-label">
            ${categoryLabel}
          </div>

          ${hasContacts ? `
            <div class="contact-handles-box">
              <div class="contact-handles-title">Contact Information</div>
              <div class="contact-links-list">
                ${alumni.email ? `
                  <a href="mailto:${alumni.email}" class="contact-link-item" title="Email">
                    ${SVG_ICONS.email} <span>${alumni.email}</span>
                  </a>
                ` : ''}
                ${alumni.linkedin ? `
                  <a href="${alumni.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-link-item" title="LinkedIn">
                    ${SVG_ICONS.linkedin} <span>LinkedIn Profile</span>
                  </a>
                ` : ''}
                ${alumni.scholar ? `
                  <a href="${alumni.scholar}" target="_blank" rel="noopener noreferrer" class="contact-link-item" title="Google Scholar">
                    ${SVG_ICONS.scholar} <span>Google Scholar</span>
                  </a>
                ` : ''}
                ${alumni.facebook ? `
                  <a href="${alumni.facebook}" target="_blank" rel="noopener noreferrer" class="contact-link-item" title="Facebook">
                    ${SVG_ICONS.facebook} <span>Facebook Profile</span>
                  </a>
                ` : ''}
                ${alumni.website ? `
                  <a href="${alumni.website}" target="_blank" rel="noopener noreferrer" class="contact-link-item" title="Personal Website">
                    ${SVG_ICONS.website} <span>Personal Website</span>
                  </a>
                ` : ''}
                ${alumni.researchGate ? `
                  <a href="${alumni.researchGate}" target="_blank" rel="noopener noreferrer" class="contact-link-item" title="ResearchGate">
                    ${SVG_ICONS.researchGate} <span>ResearchGate</span>
                  </a>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${isAdminAuthenticated ? `
            <div style="margin-top: 1rem; width: 100%;">
              <button class="btn-danger" style="width: 100%;" data-action="admin-delete" data-id="${alumni.id}">
                Delete Profile
              </button>
            </div>
          ` : ''}
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
     Delete Profile Functionality (persisted via localStorage)
     ========================================================================== */
  function deleteAlumniProfile(alumniId) {
    const alumniIndex = ALUMNI_DATA.findIndex(a => a.id === alumniId);
    if (alumniIndex === -1) return;

    const alumniName = ALUMNI_DATA[alumniIndex].name;
    if (confirm(`Are you sure you want to delete the profile for "${alumniName}"?`)) {
      // Persist deletion in localStorage so it survives page refresh
      const deletedIds = JSON.parse(localStorage.getItem(LS_DELETED_IDS) || '[]');
      if (!deletedIds.includes(alumniId)) {
        deletedIds.push(alumniId);
        localStorage.setItem(LS_DELETED_IDS, JSON.stringify(deletedIds));
      }

      // Also remove from added alumni list if it was admin-added
      const addedAlumni = JSON.parse(localStorage.getItem(LS_ADDED_ALUMNI) || '[]');
      const updatedAdded = addedAlumni.filter(a => a.id !== alumniId);
      localStorage.setItem(LS_ADDED_ALUMNI, JSON.stringify(updatedAdded));

      ALUMNI_DATA.splice(alumniIndex, 1);
      filterDirectory();
      showToast(`Profile for ${alumniName} has been deleted.`);

      // Re-render admin manage modal if currently open
      const manageContainer = document.getElementById('admin-manage-list');
      if (manageContainer) {
        renderAdminManageList();
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
        <button class="btn-danger" data-action="delete-from-list" data-id="${alumni.id}">
          Delete
        </button>
      </div>
    `).join('');

    manageContainer.querySelectorAll('[data-action="delete-from-list"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        deleteAlumniProfile(e.currentTarget.dataset.id);
      });
    });
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
        Adding or managing alumni profiles is restricted to discipline administrators. Please enter the admin passcode.
      </p>

      <form id="admin-auth-form">
        <div class="form-group">
          <label class="form-label">Admin Passcode</label>
          <input type="password" class="form-input" id="auth-passcode" placeholder="Enter admin passcode" required />
          <p id="auth-error" style="color: #e11d48; font-size: 0.8rem; margin-top: 0.3rem; display: none;">Invalid passcode. Try again.</p>
        </div>
        <button type="submit" class="btn-black" style="width: 100%;">
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

      if (inputPasscode === ADMIN_PASSCODE) {
        isAdminAuthenticated = true;
        modalBackdrop.classList.remove('active');
        showToast("Admin access granted.");
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
        <button id="admin-tab-add" class="pill-btn active">Add New Profile</button>
        <button id="admin-tab-manage" class="pill-btn">Delete / Manage Profiles (${ALUMNI_DATA.length})</button>
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

          <div class="form-group">
            <label class="form-label">Personal / Custom Website Link</label>
            <input type="url" class="form-input" id="add-website" placeholder="https://yourwebsite.com" />
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
            <button type="submit" class="btn-black" style="flex: 1; min-width: 180px;">
              Save & Publish Profile
            </button>
            <button type="button" class="btn-outline" id="btn-export-json" style="flex: 1; min-width: 160px;">
              Export JSON Data
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
    document.getElementById('admin-add-alumni-form')?.addEventListener('submit', (e) => {
      e.preventDefault();

      const newAlumni = {
        id: "ku-phy-" + Date.now(),
        name: document.getElementById('add-name').value,
        batch: document.getElementById('add-batch').value,
        session: "2015-2016",
        title: document.getElementById('add-title').value,
        organization: document.getElementById('add-org').value,
        location: document.getElementById('add-location').value,
        categoryTag: document.getElementById('add-category').value,
        tags: ["Alumni", document.getElementById('add-category').value],
        email: document.getElementById('add-email').value || null,
        linkedin: document.getElementById('add-linkedin').value || null,
        scholar: document.getElementById('add-scholar').value || null,
        facebook: document.getElementById('add-facebook').value || null,
        website: document.getElementById('add-website').value || null,
        kuThesisTopic: "Applied Physics Research",
        availableForMentorship: true,
        careerPathway: [
          { year: "2018", event: "B.Sc. in Physics, Khulna University" },
          { year: "2020", event: "Joined " + document.getElementById('add-org').value }
        ]
      };

      ALUMNI_DATA.unshift(newAlumni);

      // Persist newly added profile to localStorage so it survives page refresh
      const addedAlumni = JSON.parse(localStorage.getItem(LS_ADDED_ALUMNI) || '[]');
      addedAlumni.unshift(newAlumni);
      localStorage.setItem(LS_ADDED_ALUMNI, JSON.stringify(addedAlumni));

      filterDirectory();
      modalBackdrop.classList.remove('active');
      showToast(`Profile for ${newAlumni.name} added successfully.`);
    });

    // JSON Export button
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent("const ALUMNI_DATA = " + JSON.stringify(ALUMNI_DATA, null, 2) + ";");
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "alumni-data.js");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Downloaded updated alumni-data.js for GitHub push.");
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
