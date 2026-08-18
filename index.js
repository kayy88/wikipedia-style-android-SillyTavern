import { getContext } from '../../extensions.js';
import { eventSource, event_types } from '../../../../script.js';

function getST() {
    return typeof SillyTavern !== 'undefined' ? SillyTavern.getContext() : getContext();
}

/**
 * 0. THEME NEUTRALIZER: Purges all active user theme presets and locks variables
 */
function purgeAndLockThemePresets() {
    const root = document.documentElement;

    // 1. Force Wikipedia Design Tokens into CSS Root
    const wikiTokens = {
        '--wiki-bg': '#ffffff',
        '--wiki-surface': '#f8f9fa',
        '--wiki-border': '#a2a9b1',
        '--wiki-border-light': '#eaecf0',
        '--wiki-text-main': '#202122',
        '--wiki-text-muted': '#54595e',
        '--wiki-link': '#3366cc',
        
        // Neutralize SillyTavern's native theme variables
        '--main-text-color': '#202122',
        '--italics-text-color': '#54595e',
        '--underline-text-color': '#3366cc',
        '--quote-text-color': '#54595e',
        '--blur-tint-color': 'rgba(255, 255, 255, 1)',
        '--chat-tint-color': 'rgba(255, 255, 255, 1)',
        '--user-mes-blur-tint-color': 'rgba(248, 249, 250, 1)',
        '--bot-mes-blur-tint-color': 'rgba(255, 255, 255, 1)',
        '--shadow-color': 'transparent',
        '--shadow-width': '0px',
        '--blur-strength': '0px',
        '--border-color': '#a2a9b1'
    };

    for (const [key, value] of Object.entries(wikiTokens)) {
        root.style.setProperty(key, value, 'important');
    }

    // 2. Disable user-injected Theme Custom CSS that clashes
    const userThemeStyle = document.getElementById('theme-custom-css');
    if (userThemeStyle) {
        userThemeStyle.disabled = true;
    }

    // 3. Mark body with extension isolation flag
    document.body.classList.add('wikipedia-ui-active');
}

/**
 * 1. OVERHAUL TOP BAR INTO WIKIPEDIA NAVIGATION
 */
function buildWikipediaHeader() {
    const topBar = document.getElementById('top-bar');
    if (!topBar || document.getElementById('wiki-custom-nav')) return;

    const wikiNav = document.createElement('div');
    wikiNav.id = 'wiki-custom-nav';
    wikiNav.innerHTML = `
        <div class="wiki-top-row">
            <button id="wiki-menu-trigger" class="wiki-btn" title="Open Characters">☰</button>
            <div class="wiki-branding">
                <span class="wiki-logo-text">WIKIPEDIA</span>
                <span class="wiki-subtext">The Free Encyclopedia</span>
            </div>
            <div class="wiki-actions">
                <button id="wiki-settings-trigger" class="wiki-btn" title="Settings">⚙</button>
            </div>
        </div>
        <div class="wiki-tabs-row">
            <button class="wiki-tab active" id="wiki-tab-article">Article</button>
            <button class="wiki-tab" id="wiki-tab-edit">Edit Page</button>
        </div>
    `;

    topBar.prepend(wikiNav);

    document.getElementById('wiki-menu-trigger')?.addEventListener('click', () => {
        document.getElementById('left-nav-panel-button')?.click();
    });

    document.getElementById('wiki-settings-trigger')?.addEventListener('click', () => {
        document.getElementById('right-nav-panel-button')?.click();
    });

    document.getElementById('wiki-tab-edit')?.addEventListener('click', () => {
        document.getElementById('send_textarea')?.focus();
        document.getElementById('form_sheld')?.scrollIntoView({ behavior: 'smooth' });
    });
}

/**
 * 2. DYNAMICALLY GENERATE WIKIPEDIA INFOBOX
 */
function injectCharacterInfobox() {
    const context = getST();
    const chat = document.getElementById('chat');
    if (!chat || !context.characters || context.characterId === undefined) return;

    const char = context.characters[context.characterId];
    if (!char) return;

    document.getElementById('wiki-character-infobox')?.remove();

    const infobox = document.createElement('table');
    infobox.id = 'wiki-character-infobox';
    infobox.className = 'wiki-infobox';
    
    const avatarUrl = char.avatar ? `/thumbnail?type=avatar&avatar=${char.avatar}` : '';
    const creator = char.creator || 'Community Record';
    const tags = Array.isArray(char.tags) && char.tags.length > 0 ? char.tags.join(', ') : 'Article Subject';

    infobox.innerHTML = `
        <tbody>
            <tr>
                <th colspan="2" class="wiki-infobox-header">${char.name}</th>
            </tr>
            ${avatarUrl ? `
            <tr>
                <td colspan="2" class="wiki-infobox-image">
                    <img src="${avatarUrl}" alt="${char.name}" />
                    <div class="wiki-infobox-caption">Primary visual record of ${char.name}</div>
                </td>
            </tr>` : ''}
            <tr>
                <th scope="row">Classification</th>
                <td>Character / Entity</td>
            </tr>
            <tr>
                <th scope="row">Author / Origin</th>
                <td>${creator}</td>
            </tr>
            <tr>
                <th scope="row">Keywords</th>
                <td>${tags}</td>
            </tr>
            <tr>
                <th scope="row">Status</th>
                <td>Archived Entry</td>
            </tr>
        </tbody>
    `;

    chat.prepend(infobox);
}

/**
 * 3. INITIALIZATION & LIFECYCLE HOOKS
 */
export function init() {
    // Initial purge
    purgeAndLockThemePresets();

    // App loaded
    eventSource.on(event_types.APP_READY, () => {
        purgeAndLockThemePresets();
        buildWikipediaHeader();
        injectCharacterInfobox();
    });

    // Character or chat changed
    eventSource.on(event_types.CHAT_CHANGED, () => {
        purgeAndLockThemePresets();
        injectCharacterInfobox();
    });

    // If user changes a theme setting in the menu, immediately re-purge it
    if (event_types.THEME_CHANGED) {
        eventSource.on(event_types.THEME_CHANGED, () => {
            purgeAndLockThemePresets();
        });
    }

    if (event_types.SETTINGS_LOADED) {
        eventSource.on(event_types.SETTINGS_LOADED, () => {
            purgeAndLockThemePresets();
        });
    }
}

init();