/**
 * WIKIPEDIA FULL-SYSTEM OVERHAUL - TAURITAVERN ENGINE
 * Fixed: Zero infinite loops, event-driven architecture.
 */

function getST() {
    return window.SillyTavern ? window.SillyTavern.getContext() : null;
}

/**
 * 1. THEME LOCK (Runs ONCE per event, never in a loop)
 */
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
        
        // Neutralize native SillyTavern colors
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

    const themeStyle = document.getElementById('theme-custom-css');
    if (themeStyle) themeStyle.disabled = true;

    if (!document.body.classList.contains('wiki-total-overhaul')) {
        document.body.classList.add('wiki-total-overhaul');
    }
}

/**
 * 2. TOP BAR RE-ARCHITECTURE
 */
function buildWikipediaHeader() {
    const topBar = document.getElementById('top-bar');
    if (!topBar || document.getElementById('wiki-custom-nav')) return;

    const wikiNav = document.createElement('div');
    wikiNav.id = 'wiki-custom-nav';
    wikiNav.innerHTML = `
        <div class="wiki-top-row">
            <button id="wiki-btn-characters" class="wiki-nav-btn" title="Characters">☰ Menu</button>
            <div class="wiki-brand-block">
                <span class="wiki-brand-title">WIKIPEDIA</span>
                <span class="wiki-brand-subtitle">The Free Encyclopedia</span>
            </div>
            <div class="wiki-right-actions">
                <button id="wiki-btn-lorebook" class="wiki-nav-btn" title="Lorebooks">📖 Lore</button>
                <button id="wiki-btn-settings" class="wiki-nav-btn" title="Settings">⚙</button>
            </div>
        </div>
        <div class="wiki-tabs-strip">
            <button class="wiki-tab-btn active" id="wiki-tab-article">Article</button>
            <button class="wiki-tab-btn" id="wiki-tab-edit">Edit Section</button>
        </div>
    `;

    topBar.prepend(wikiNav);

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
        document.getElementById('send_textarea')?.focus();
        document.getElementById('form_sheld')?.scrollIntoView({ behavior: 'smooth' });
    });
}

/**
 * 3. AUTO-GENERATE COMPREHENSIVE INFOBOX
 */
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
                    <div class="wiki-infobox-caption">Archival record: ${char.name}</div>
                </td>
            </tr>` : ''}
            <tr>
                <th scope="row">Classification</th>
                <td>Entity Record</td>
            </tr>
            <tr>
                <th scope="row">Origin / Creator</th>
                <td>${creator}</td>
            </tr>
            <tr>
                <th scope="row">Metadata Tags</th>
                <td>${tags}</td>
            </tr>
            <tr>
                <th scope="row">Status</th>
                <td>Verified Entry</td>
            </tr>
        </tbody>
    `;

    chat.prepend(infobox);
}

/**
 * 4. EVENT-BASED LIFECYCLE (Zero recursive loops)
 */
export function init() {
    enforceWikipediaTokens();

    const context = getST();
    if (!context || !context.eventSource) {
        setTimeout(init, 300);
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