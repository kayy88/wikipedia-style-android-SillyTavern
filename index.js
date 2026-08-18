/**
 * WIKIPEDIA FULL-SYSTEM TOTAL CONVERSION ENGINE
 * Reconstructs the entire application DOM, drawers, modals, and input controls.
 */

function getST() {
    return window.SillyTavern ? window.SillyTavern.getContext() : null;
}

// 1. COMPREHENSIVE THEME PURGE & VARIABLE LOCK
function enforceWikipediaTokens() {
    const root = document.documentElement;

    const tokens = {
        '--wiki-bg': '#ffffff',
        '--wiki-surface': '#f8f9fa',
        '--wiki-surface-hover': '#eaecf0',
        '--wiki-border': '#a2a9b1',
        '--wiki-border-light': '#eaecf0',
        '--wiki-text-main': '#202122',
        '--wiki-text-muted': '#54595e',
        '--wiki-link': '#3366cc',
        '--wiki-link-hover': '#2a4b8d',
        
        // Hard override of all SillyTavern native theme variables
        '--main-text-color': '#202122',
        '--italics-text-color': '#54595e',
        '--underline-text-color': '#3366cc',
        '--quote-text-color': '#202122',
        '--blur-tint-color': 'rgba(255, 255, 255, 1)',
        '--chat-tint-color': 'rgba(255, 255, 255, 1)',
        '--user-mes-blur-tint-color': 'rgba(248, 249, 250, 1)',
        '--bot-mes-blur-tint-color': 'rgba(255, 255, 255, 1)',
        '--shadow-color': 'transparent',
        '--shadow-width': '0px',
        '--blur-strength': '0px',
        '--border-color': '#a2a9b1'
    };

    for (const [k, v] of Object.entries(tokens)) {
        root.style.setProperty(k, v, 'important');
    }

    // Disable any active theme custom css tag
    const themeStyle = document.getElementById('theme-custom-css');
    if (themeStyle) themeStyle.disabled = true;

    document.body.classList.add('wiki-total-overhaul');
}

// 2. REBUILD TOP BAR (CLEAN HIDING OF STOCK CLUTTER)
function buildWikipediaHeader() {
    const topBar = document.getElementById('top-bar');
    if (!topBar || document.getElementById('wiki-custom-nav')) return;

    const wikiNav = document.createElement('div');
    wikiNav.id = 'wiki-custom-nav';
    wikiNav.innerHTML = `
        <div class="wiki-top-row">
            <button id="wiki-btn-characters" class="wiki-nav-btn" title="Characters & Personas">☰ Menu</button>
            <div class="wiki-brand-block">
                <span class="wiki-brand-title">WIKIPEDIA</span>
                <span class="wiki-brand-subtitle">The Free Encyclopedia</span>
            </div>
            <div class="wiki-right-actions">
                <button id="wiki-btn-lorebook" class="wiki-nav-btn" title="World Info">📖 Lore</button>
                <button id="wiki-btn-settings" class="wiki-nav-btn" title="Settings">⚙ Settings</button>
            </div>
        </div>
        <div class="wiki-tabs-strip">
            <button class="wiki-tab-btn active" id="wiki-tab-article">Article</button>
            <button class="wiki-tab-btn" id="wiki-tab-talk">Revision Log</button>
            <button class="wiki-tab-btn" id="wiki-tab-edit">Edit Section</button>
        </div>
    `;

    topBar.prepend(wikiNav);

    // Event Bindings
    document.getElementById('wiki-btn-characters')?.addEventListener('click', () => {
        document.getElementById('left-nav-panel-button')?.click();
    });

    document.getElementById('wiki-btn-settings')?.addEventListener('click', () => {
        document.getElementById('right-nav-panel-button')?.click();
    });

    document.getElementById('wiki-btn-lorebook')?.addEventListener('click', () => {
        document.getElementById('world-info-button')?.click();
    });

    document.getElementById('wiki-tab-edit')?.addEventListener('click', () => {
        const textarea = document.getElementById('send_textarea');
        textarea?.focus();
        document.getElementById('form_sheld')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// 3. AUTO-GENERATE COMPREHENSIVE INFOBOX
function injectCharacterInfobox() {
    const context = getST();
    const chat = document.getElementById('chat');
    if (!chat || !context || !context.characters || context.characterId === undefined) return;

    const char = context.characters[context.characterId];
    if (!char) return;

    document.getElementById('wiki-character-infobox')?.remove();

    const infobox = document.createElement('table');
    infobox.id = 'wiki-character-infobox';
    infobox.className = 'wiki-infobox';
    
    const avatarUrl = char.avatar ? `/thumbnail?type=avatar&avatar=${encodeURIComponent(char.avatar)}` : '';
    const creator = char.creator || 'Community Contributor';
    const tags = Array.isArray(char.tags) && char.tags.length > 0 ? char.tags.join(', ') : 'Archived Subject';

    infobox.innerHTML = `
        <tbody>
            <tr>
                <th colspan="2" class="wiki-infobox-header">${char.name}</th>
            </tr>
            ${avatarUrl ? `
            <tr>
                <td colspan="2" class="wiki-infobox-image">
                    <img src="${avatarUrl}" alt="${char.name}" />
                    <div class="wiki-infobox-caption">Archival photographic plate: ${char.name}</div>
                </td>
            </tr>` : ''}
            <tr>
                <th scope="row">Classification</th>
                <td>Entity / Subject Record</td>
            </tr>
            <tr>
                <th scope="row">Author / Origin</th>
                <td>${creator}</td>
            </tr>
            <tr>
                <th scope="row">Metadata Tags</th>
                <td>${tags}</td>
            </tr>
            <tr>
                <th scope="row">Record Status</th>
                <td>Verified Entry</td>
            </tr>
        </tbody>
    `;

    chat.prepend(infobox);
}

// 4. WATCHDOG MUTATION OBSERVER (Prevents any popup/menu from escaping Wikipedia theme)
function startMutationWatchdog() {
    const observer = new MutationObserver(() => {
        enforceWikipediaTokens();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

// 5. MASTER INITIALIZATION
export function init() {
    enforceWikipediaTokens();
    startMutationWatchdog();

    const context = getST();
    if (!context || !context.eventSource) {
        setTimeout(init, 250);
        return;
    }

    const { eventSource, event_types } = context;

    buildWikipediaHeader();
    injectCharacterInfobox();

    if (event_types.CHAT_CHANGED) {
        eventSource.on(event_types.CHAT_CHANGED, () => {
            enforceWikipediaTokens();
            injectCharacterInfobox();
        });
    }

    if (event_types.THEME_CHANGED) {
        eventSource.on(event_types.THEME_CHANGED, () => {
            enforceWikipediaTokens();
        });
    }

    if (event_types.SETTINGS_LOADED) {
        eventSource.on(event_types.SETTINGS_LOADED, () => {
            enforceWikipediaTokens();
        });
    }
}

init();