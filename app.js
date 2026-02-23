// Synthetic Studio™ — The Drop Vault
// Core App Logic

const STORAGE_KEY = 'ss_vault_v3';

// App State
const state = {
    models: [],
    filters: {
        search: '',
        status: 'all',
        tribe: [],
        vibe: [],
        role: [],
        visual: [],
        roleplay: []
    },
    isAdmin: false,
    currentAdminModelId: null,
    currentModel: null
};

// Initialization
async function init() {
    console.log('Initializing The Drop Vault...');
    loadData();
    setupEventListeners();
    renderFilters();
    startStatusRefresh();
    applyFilters();
}

// Data Management
function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        state.models = JSON.parse(savedData);
    } else {
        // Initialize with mock/default data for 109 days if empty
        state.models = generateInitialModels();
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.models));
}

function generateInitialModels() {
    const names = [
        "Marco", "Luca", "Rafael", "Diego", "Bruno", "Thiago", "André", "Caio", "Henrique", "Pedro",
        "Gabriel", "Matheus", "Leonardo", "Felipe", "Lucas", "Rodrigo", "Gustavo", "Daniel", "Eduardo", "Victor",
        "Arthur", "Bernardo", "Samuel", "Nicolas", "Enzo", "Miguel", "Davi", "Lorenzo", "Theo", "Heitor",
        "Murilo", "Benício", "Valentim", "Noah", "Gael", "Ravi", "Antônio", "Levi", "Joaquim", "Isaac",
        "Tomás", "Vicente", "Otávio", "Caleb", "Raul", "Ian", "Bryan", "Yuri", "Cauã", "Dante",
        "Oliver", "Elias", "Bento", "Ryan", "Martin", "Adriano", "Fabrício", "Renato", "Márcio", "Sérgio",
        "Álvaro", "Ramiro", "Cristiano", "Neymar", "Kauan", "Tales", "Ítalo", "Vinicius", "Renan", "Alex",
        "Breno", "Cézar", "Dimitri", "Emílio", "Flávio", "Giorgio", "Hugo", "Igor", "Júlio", "Klaus",
        "Leandro", "Marcos", "Nelson", "Oscar", "Pablo", "Quentin", "Ricardo", "Stefan", "Tiago", "Ulisses",
        "Valentin", "Wagner", "Xavier", "Yago", "Zeus", "Adriel", "Boris", "Ciro", "Dário", "Erick",
        "Fernando", "Gianluca", "Hector", "Ivan", "Joel", "Kevin", "Luciano", "Matteo", "Nando"
    ];

    const models = [];
    const startDate = new Date('2026-02-23');

    for (let i = 1; i <= 109; i++) {
        const dropDate = new Date(startDate);
        dropDate.setDate(startDate.getDate() + (i - 1));

        models.push({
            id: i,
            name: names[i - 1] || `Modelo ${String(i).padStart(3, '0')}`,
            dropNumber: String(i).padStart(3, '0'),
            dropDate: dropDate.toISOString().split('T')[0],
            statusOverride: null,
            description: `Este é o ensaio exclusivo de ${names[i - 1] || 'Modelo'}. Conteúdo premium produzido pela Synthetic Studio.`,
            tribe: 'Jock', // Default
            vibe: 'Teasing',
            role: 'Vers',
            visual: 'Smooth',
            roleplay: 'Amateur',
            photo: '',
            link: ''
        });
    }
    return models;
}

// Logic
function computeStatus(dropDateStr, override) {
    if (override) return override;

    const now = new Date();
    const dropDate = new Date(dropDateStr);

    // Set drop time to 00:00:00 of the drop date
    const dropTime = new Date(dropDate.getFullYear(), dropDate.getMonth(), dropDate.getDate()).getTime();
    const currentTime = now.getTime();

    const diffMs = dropTime - currentTime;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs <= 0) return 'live';
    if (diffDays <= 7) return 'soon';
    return 'upcoming';
}

function startStatusRefresh() {
    setInterval(() => {
        updateModelsStatus();
        applyFilters(); // Re-filter and render
        updateCountdown();
    }, 60000); // 60s

    setInterval(updateCountdown, 1000); // 1s for the timer

    updateModelsStatus();
    updateCountdown();
}

function updateModelsStatus() {
    state.models.forEach(m => {
        m.status = computeStatus(m.dropDate, m.statusOverride);
    });
}

function updateCountdown() {
    const now = new Date();
    // Find the next upcoming/soon drop
    const nextDrop = state.models
        .filter(m => computeStatus(m.dropDate, m.statusOverride) !== 'live')
        .sort((a, b) => new Date(a.dropDate) - new Date(b.dropDate))[0];

    if (!nextDrop) {
        document.getElementById('next-drop-timer').innerText = '--:--:--';
        return;
    }

    const dropDate = new Date(nextDrop.dropDate);
    const dropTime = new Date(dropDate.getFullYear(), dropDate.getMonth(), dropDate.getDate()).getTime();
    const diffMs = dropTime - now.getTime();

    if (diffMs <= 0) {
        document.getElementById('next-drop-timer').innerText = '00:00:00';
        return;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    document.getElementById('next-drop-timer').innerText =
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// UI Rendering
function renderFilters() {
    const categories = {
        tribe: ['Daddy', 'Jock', 'Twink', 'Bear', 'Chubby'],
        vibe: ['Alpha/Dom', 'Rough Play', 'Teasing', 'Slow/Sensual', 'Shy/Nervous'],
        role: ['Top', 'Bottom', 'Vers'],
        visual: ['Hairy', 'Smooth', 'Tattooed', 'Thick'],
        roleplay: ['Locker Room', 'Uniform', 'Blue Collar', 'Amateur']
    };

    const container = document.getElementById('dynamic-filters');
    container.innerHTML = '';

    for (const [key, options] of Object.entries(categories)) {
        const group = document.createElement('div');
        group.className = 'filter-category';
        group.innerHTML = `<h4>${key === 'role' ? 'FUNÇÃO' : key}</h4>`;

        const pillGroup = document.createElement('div');
        pillGroup.className = 'pill-group';

        options.forEach(opt => {
            const label = document.createElement('label');
            label.className = 'filter-pill';
            label.innerHTML = `
                <input type="checkbox" data-category="${key}" value="${opt}">
                <span>${opt}</span>
            `;
            pillGroup.appendChild(label);
        });
        group.appendChild(pillGroup);
        container.appendChild(group);
    }
}

function applyFilters() {
    const filtered = state.models.filter(m => {
        const searchMatch = !state.filters.search ||
            m.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            [m.tribe, m.vibe, m.role, m.visual, m.roleplay].some(tag =>
                tag.toLowerCase().includes(state.filters.search.toLowerCase())
            );

        // Status Filter Logic
        let statusMatch = true;
        if (state.filters.status !== 'all') {
            statusMatch = m.status === state.filters.status;
        }

        const tribeMatch = state.filters.tribe.length === 0 || state.filters.tribe.includes(m.tribe);
        const vibeMatch = state.filters.vibe.length === 0 || state.filters.vibe.includes(m.vibe);
        const roleMatch = state.filters.role.length === 0 || state.filters.role.includes(m.role);
        const visualMatch = state.filters.visual.length === 0 || state.filters.visual.includes(m.visual);
        const roleplayMatch = state.filters.roleplay.length === 0 || state.filters.roleplay.includes(m.roleplay);

        return searchMatch && statusMatch && tribeMatch && vibeMatch && roleMatch && visualMatch && roleplayMatch;
    });

    renderGrid(filtered);
    document.getElementById('results-count').innerText = `${filtered.length} DE ${state.models.length} MODELOS`;
}

function renderGrid(filteredModels = state.models) {
    const grid = document.getElementById('model-grid');
    grid.innerHTML = '';

    const icons = {
        live: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 3 14 9-14 9V3z"/></svg>`,
        soon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
        camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
        lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
    };

    filteredModels.forEach(m => {
        const card = document.createElement('div');
        card.className = `model-card status-${m.status}`;

        let statusLabel, statusIcon;
        if (m.status === 'live') {
            statusLabel = 'AO VIVO';
            statusIcon = icons.live;
        } else if (m.status === 'soon') {
            statusLabel = 'EM BREVE';
            statusIcon = icons.soon;
        } else {
            statusLabel = 'BLOQUEADO';
            statusIcon = icons.soon; // Keeping same icon as soon for upcoming
        }

        const mainIcon = m.status === 'live' ? icons.camera : icons.lock;

        let mediaHtml = `
            ${m.photo ? `<img src="${m.photo}" alt="${m.name}" loading="lazy" style="${m.status !== 'live' ? 'filter: blur(20px)' : ''}">` :
                `<div class="card-media-placeholder">${mainIcon}</div>`}
            <div class="badge-drop">#${m.dropNumber}</div>
            <div class="badge-status">${statusIcon} ${statusLabel}</div>
        `;

        if (m.status !== 'live') {
            mediaHtml += `
                <div class="blur-overlay">
                    <span>${m.status === 'soon' ? 'Disponível em breve' : 'Bloqueado'}</span>
                    <span style="font-size: 0.6rem; opacity: 0.8">${m.dropDate}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="card-media">
                ${mediaHtml}
            </div>
            <div class="card-info">
                <div class="card-header-row">
                    <h4 class="card-name">${m.name}</h4>
                    <span class="card-date">${m.dropDate}</span>
                </div>
                <div class="card-tags">
                    <span>${m.tribe}</span>
                    <span>${m.vibe}</span>
                    <span>${m.role}</span>
                </div>
                ${m.status === 'live' ? `<div class="btn-card-cta">VER ENSAIO →</div>` : ''}
            </div>
        `;

        card.addEventListener('click', () => {
            handleCardClick(m.id);
        });

        grid.appendChild(card);
    });
}

// Navigation & Details
function handleCardClick(id) {
    state.currentModel = state.models.find(m => m.id === id);
    // Check if age already confirmed this session (optional, but user said "on this transition")
    openGate();
}

function openDetails(id) {
    const m = state.models.find(mod => mod.id === id);
    if (!m) return;

    state.currentModel = m;
    const detailsContainer = document.querySelector('#details-view .details-main');
    const status = computeStatus(m.dropDate, m.statusOverride);
    const statusLabel = status === 'live' ? 'AO VIVO' : (status === 'soon' ? 'EM BREVE' : 'BLOQUEADO');

    document.getElementById('details-view').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const icons = {
        flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
    };

    detailsContainer.innerHTML = `
        <div class="details-media-panel">
            ${m.photo ? `<img src="${m.photo}" alt="${m.name}">` : `<div class="placeholder-icon">${icons.flame}</div>`}
        </div>
        <div class="details-info-panel">
            <div class="details-badges">
                <span class="badge-pill drop-num">DROP #${m.dropNumber}</span>
                <span class="badge-pill status">${statusLabel}</span>
            </div>
            
            <h2 style="font-size: 4rem; font-weight: 950; text-transform: uppercase; letter-spacing: -2px; line-height: 1; margin: -0.5rem 0;">${m.name.toUpperCase()}</h2>
            
            <p class="details-date">Disponível em <strong>${new Date(m.dropDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
            
            <div class="details-attributes">
                <div class="attr-row">
                    <span class="attr-label">TRIBO</span>
                    <span class="attr-value">${m.tribe}</span>
                </div>
                <div class="attr-row">
                    <span class="attr-label">VIBE</span>
                    <span class="attr-value">${m.vibe}</span>
                </div>
                <div class="attr-row">
                    <span class="attr-label">FUNÇÃO</span>
                    <span class="attr-value">${m.role}</span>
                </div>
                <div class="attr-row">
                    <span class="attr-label">VISUAL</span>
                    <span class="attr-value">${m.visual}</span>
                </div>
                <div class="attr-row">
                    <span class="attr-label">ROLEPLAY</span>
                    <span class="attr-value">${m.roleplay}</span>
                </div>
            </div>

            <div class="details-description" style="font-size: 0.95rem; line-height: 1.6; color: #888; font-style: italic; border-top: 1px solid #1a1a1a; padding-top: 2rem;">
                ${m.description || 'Nenhuma descrição disponível.'}
            </div>

            <div class="details-cta" style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${m.link && status === 'live' ? `<a href="${m.link}" target="_blank" class="btn-details-main">ACESSAR ENSAIO COMPLETO</a>` : `<p><em>Link do ensaio ainda não liberado ou não configurado.</em></p>`}
                <p style="font-size: 0.75rem; color: #444; line-height: 1.4; max-width: 400px;">Ao clicar, você será redirecionado para a plataforma externa onde o ensaio completo está hospedado. Conteúdo exclusivo para maiores de 18 anos.</p>
            </div>
        </div>
    `;
}

function closeDetails() {
    document.getElementById('details-view').classList.add('hidden');
    document.body.style.overflow = '';
    state.currentModel = null;
}

// Age Gate
function openGate() {
    document.getElementById('age-gate-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function confirmAge() {
    closeGate();
    if (state.currentModel) {
        openDetails(state.currentModel.id);
    }
}

function closeGate() {
    document.getElementById('age-gate-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

// Admin Logic
function openAdminLogin() {
    document.getElementById('admin-login-modal').classList.remove('hidden');
}

function handleLogin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (user === 'admin' && pass === 'studio2026') {
        state.isAdmin = true;
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');

        // Auto-select first model
        if (!state.currentAdminModelId && state.models.length > 0) {
            state.currentAdminModelId = state.models[0].id;
        }

        renderAdminList();
        if (state.currentAdminModelId) loadEditor(state.currentAdminModelId);
    } else {
        alert('Credenciais inválidas');
    }
}

function logout() {
    state.isAdmin = false;
    document.getElementById('admin-panel').classList.add('hidden');
}

function renderAdminList() {
    const container = document.getElementById('admin-model-list');
    const searchTerm = document.getElementById('admin-model-search').value.toLowerCase();

    container.innerHTML = '';

    // Sort models by drop number
    const sorted = [...state.models].sort((a, b) => parseInt(a.dropNumber) - parseInt(b.dropNumber));
    const filtered = sorted.filter(m =>
        m.name.toLowerCase().includes(searchTerm) || m.dropNumber.includes(searchTerm)
    );

    filtered.forEach(m => {
        const item = document.createElement('div');
        item.className = `admin-model-item ${state.currentAdminModelId === m.id ? 'active' : ''}`;
        const status = computeStatus(m.dropDate, m.statusOverride);
        const statusColor = status === 'live' ? 'var(--green)' : (status === 'soon' ? 'var(--gold)' : 'var(--text-muted)');

        item.innerHTML = `
            <div class="status-dot" style="background: ${statusColor}"></div>
            <span>${m.dropNumber} &nbsp; ${m.name}</span>
        `;

        item.addEventListener('click', () => {
            state.currentAdminModelId = m.id;
            renderAdminList();
            loadEditor(m.id);
        });
        container.appendChild(item);
    });

    // Update Stats Icons
    const live = state.models.filter(m => computeStatus(m.dropDate, m.statusOverride) === 'live').length;
    const soon = state.models.filter(m => computeStatus(m.dropDate, m.statusOverride) === 'soon').length;
    const upcoming = state.models.length - live - soon;

    document.getElementById('admin-sidebar-stats').innerHTML = `
        <span style="color:var(--green)">⚡ ${live}</span>
        <span style="color:var(--gold)">🕒 ${soon}</span>
        <span style="color:var(--text-muted)">🔒 ${upcoming}</span>
    `;
}

function loadEditor(id) {
    const model = state.models.find(m => m.id === id);
    if (!model) return;

    state.currentAdminModelId = id; // Set current model ID for active state in list

    const status = computeStatus(model.dropDate, model.statusOverride);
    const statusLabel = status === 'live' ? 'AO VIVO' : 'EM BREVE';

    const editor = document.getElementById('admin-editor');
    editor.innerHTML = `
        <div class="editor-header">
            <h2>#${model.dropNumber} — ${model.name.toUpperCase()}</h2>
            <div class="badge-status" style="position:static">${statusLabel}</div>
        </div>
        <div class="editor-form">
            <div class="input-block">
                <label>FOTO DO MODELO</label>
                <div class="photo-input-group">
                    <div class="photo-controls">
                        <div class="photo-preview-container" id="photo-preview-box">
                            ${model.photo ? `<img src="${model.photo}" alt="Preview">` : `<div class="preview-placeholder">Sem imagem</div>`}
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                            <input type="text" id="edit-photo" value="${model.photo}" placeholder="https://... ou clique ao lado">
                            <label for="local-upload" class="btn-upload-local" style="display: inline-block; text-align: center;">UPLOAD LOCAL</label>
                            <input type="file" id="local-upload" accept="image/*" style="display: none;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="input-block">
                <label>NOME</label>
                <input type="text" id="edit-name" value="${model.name}">
            </div>
            <div class="input-block">
                <label>DATA DO DROP</label>
                <input type="date" id="edit-date" value="${model.dropDate}">
            </div>
            <div class="input-block">
                <label>LINK DO ENSAIO</label>
                <input type="text" id="edit-link" value="${model.link}" placeholder="https://cakto.com/...">
            </div>
            <div class="input-block">
                <label>DESCRIÇÃO</label>
                <textarea id="edit-desc" rows="4" style="background:#1a1a1a;border:1px solid #222;color:#eee;padding:1rem;border-radius:6px;font-family:inherit">${model.description || ''}</textarea>
            </div>
            <div class="input-block">
                <label>STATUS MANUAL</label>
                <select id="edit-override">
                    <option value="" ${!model.statusOverride ? 'selected' : ''}>Automático (baseado na data)</option>
                    <option value="live" ${model.statusOverride === 'live' ? 'selected' : ''}>Forçar Liberado (Ao Vivo)</option>
                    <option value="upcoming" ${model.statusOverride === 'upcoming' ? 'selected' : ''}>Forçar Bloqueado (Em Breve/Bloqueado)</option>
                </select>
            </div>
            <div class="input-row">
                <div class="input-block"><label>TRIBO</label><select id="edit-tribe">${genOptions(['Daddy', 'Bear', 'Jock', 'Twink', 'Chubby'], model.tribe)}</select></div>
                <div class="input-block"><label>VIBE</label><select id="edit-vibe">${genOptions(['Alpha/Dom', 'Rough Play', 'Teasing', 'Slow/Sensual', 'Shy/Nervous'], model.vibe)}</select></div>
            </div>
            <div class="input-row">
                <div class="input-block"><label>FUNÇÃO</label><select id="edit-role">${genOptions(['Top', 'Bottom', 'Vers'], model.role)}</select></div>
                <div class="input-block"><label>VISUAL</label><select id="edit-visual">${genOptions(['Hairy', 'Smooth', 'Tattooed', 'Thick'], model.visual)}</select></div>
            </div>
            <div class="input-block" style="width: 50%">
                <label>ROLEPLAY</label>
                <select id="edit-roleplay">${genOptions(['Locker Room', 'Uniform', 'Blue Collar', 'Amateur'], model.roleplay)}</select>
            </div>
            <button id="btn-save-model" class="btn-admin-save">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                SALVAR ALTERAÇÕES
            </button>
        </div>
    `;

    document.getElementById('btn-save-model').addEventListener('click', () => saveModel(id));

    // Image Upload Handling
    const photoInput = document.getElementById('edit-photo');
    const uploadInput = document.getElementById('local-upload');
    const previewBox = document.getElementById('photo-preview-box');

    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                photoInput.value = base64;
                previewBox.innerHTML = `<img src="${base64}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        });
    }

    if (photoInput) {
        photoInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val) {
                previewBox.innerHTML = `<img src="${val}" alt="Preview">`;
            } else {
                previewBox.innerHTML = `<div class="preview-placeholder">Sem imagem</div>`;
            }
        });
    }
}

function genOptions(opts, selected) {
    return opts.map(o => `<option value="${o}" ${o === selected ? 'selected' : ''}>${o}</option>`).join('');
}

function saveModel(id) {
    const idx = state.models.findIndex(m => m.id === id);
    if (idx === -1) return;

    state.models[idx] = {
        ...state.models[idx],
        name: document.getElementById('edit-name').value,
        photo: document.getElementById('edit-photo').value,
        link: document.getElementById('edit-link').value,
        description: document.getElementById('edit-desc').value,
        dropDate: document.getElementById('edit-date').value,
        statusOverride: document.getElementById('edit-override').value || null,
        tribe: document.getElementById('edit-tribe').value,
        vibe: document.getElementById('edit-vibe').value,
        role: document.getElementById('edit-role').value,
        visual: document.getElementById('edit-visual').value,
        roleplay: document.getElementById('edit-roleplay').value
    };

    saveData();
    renderAdminList();
    loadEditor(id); // Reload to reflect status changes in header
    applyFilters();
    updateCountdown();
    alert('Alterações salvas com sucesso!');
}


function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('model-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            applyFilters();
        });
    }

    // Status Buttons
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filters.status = btn.dataset.status;
            applyFilters();
        });
    });

    // Checkboxes (Pills)
    document.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            const category = e.target.dataset.category;
            if (category) {
                if (e.target.checked) {
                    state.filters[category].push(e.target.value);
                } else {
                    state.filters[category] = state.filters[category].filter(v => v !== e.target.value);
                }
                applyFilters();
            }
        }
    });

    // Modals
    const closeDetailsBtn = document.querySelector('.btn-close-details');
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeDetails);

    const confirmAgeBtn = document.getElementById('btn-confirm-age');
    if (confirmAgeBtn) confirmAgeBtn.addEventListener('click', confirmAge);

    const cancelAgeBtn = document.getElementById('btn-cancel-age');
    if (cancelAgeBtn) cancelAgeBtn.addEventListener('click', closeGate);

    // Admin
    const adminTrigger = document.getElementById('admin-login-trigger');
    if (adminTrigger) adminTrigger.addEventListener('click', openAdminLogin);

    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);

    const cancelLoginBtn = document.getElementById('btn-cancel-login');
    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', () => document.getElementById('admin-login-modal').classList.add('hidden'));

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const closeAdminBtn = document.getElementById('btn-close-admin');
    if (closeAdminBtn) closeAdminBtn.addEventListener('click', () => {
        document.getElementById('admin-panel').classList.add('hidden');
    });

    const adminSearch = document.getElementById('admin-model-search');
    if (adminSearch) adminSearch.addEventListener('input', renderAdminList);

    // Filter Toggle
    const filterToggle = document.querySelector('.filter-toggle-header');
    const filterGrid = document.getElementById('dynamic-filters');
    if (filterToggle && filterGrid) {
        filterToggle.addEventListener('click', () => {
            filterToggle.classList.toggle('active');
            filterGrid.classList.toggle('visible');
        });
    }
}

// Start
init();
