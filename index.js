import { getContext } from '../../extensions.js';
import { eventSource, event_types } from '../../../../script.js';

// Global helper to safely access SillyTavern context
function getST() {
    return typeof SillyTavern !== 'undefined' ? SillyTavern.getContext() : getContext();
}

/**
 * 1. OVERHAUL TOP BAR INTO WIKIPEDIA NAVIGATION
 */
function buildWikipediaHeader() {
    const topBar = document.getElementById('top-bar');
    if (!topBar || document.getElementById('wiki-custom-nav')) return;

    // Create Wikipedia Header Container
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
            <button class="wiki-tab" id="wiki-tab-talk">Talk / Notes</button>
            <button class="wiki-tab" id="wiki-tab-edit">Edit Page</button>
        </div>
    `;

    // Insert at the very top
    topBar.prepend(wikiNav);

    // Wire up native drawer buttons to our new Wikipedia buttons
    document.getElementById('wiki-menu-trigger')?.addEventListener('click', () => {
        document.getElementById('left-nav-panel-button')?.click();
    });

    document.getElementById('wiki-settings-trigger')?.addEventListener('click', () => {
        document.getElementById('right-nav-panel-button')?.click();
    });

    // Wire up "Edit Page" tab to scroll to the input area
    document.getElementById('wiki-tab-edit')?.addEventListener('click', () => {
        document.getElementById('send_textarea')?.focus();
        document.getElementById('form_sheld')?.scrollIntoView({ behavior: 'smooth' });
    });
}

/**
 * 2. DYNAMICALLY GENERATE WIKIPEDIA INFOBOX
 * Reads the active character card and generates an Infobox table at the top of #chat
 */
function injectCharacterInfobox() {
    const context = getST();
    const chat = document.getElementById('chat');
    if (!chat || !context.characters || context.characterId === undefined) return;

    const char = context.characters[context.characterId];
    if (!char) return;

    // Remove existing infobox if present
    document.getElementById('wiki-character-infobox')?.remove();

    // Build Infobox Table
    const infobox = document.createElement('table');
    infobox.id = 'wiki-character-infobox';
    infobox.className = 'wiki-infobox';
    
    const avatarUrl = char.avatar ? `/thumbnail?type=avatar&avatar=${char.avatar}` : '';
    const creator = char.creator || 'Community Entry';
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
                <th scope="row">Creator / Origin</th>
                <td>${creator}</td>
            </tr>
            <tr>
                <th scope="row">Keywords</th>
                <td>${tags}</td>
            </tr>
            <tr>
                <th scope="row">Status</th>
                <td>Active Record</td>
            </tr>
        </tbody>
    `;

    // Prepend to top of the article
    chat.prepend(infobox);
}

/**
 * 3. FORMAT BOT MESSAGES AS ENCYCLOPEDIA SECTIONS
 */
function formatMessageAsWikiSection(mesId) {
    const messageNode = document.querySelector(`.mes[mesid="${mesId}"]`);
    if (!messageNode) return;

    const isUser = messageNode.getAttribute('is_user') === 'true';
    const block = messageNode.querySelector('.mes_block');
    const nameText = messageNode.querySelector('.name_text');

    if (!isUser && nameText && block) {
        // Ensure character name acts as a genuine Wikipedia Section Header
        nameText.classList.add('wiki-section-heading');
    }
}

/**
 * 4. INITIALIZATION HOOKS
 */
export function init() {
    // When SillyTavern finishes loading
    eventSource.on(event_types.APP_READY, () => {
        buildWikipediaHeader();
        injectCharacterInfobox();
    });

    // When changing characters or starting a new chat
    eventSource.on(event_types.CHAT_CHANGED, () => {
        injectCharacterInfobox();
    });

    // When a message is rendered into the DOM
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (mesId) => {
        formatMessageAsWikiSection(mesId);
    });

    eventSource.on(event_types.USER_MESSAGE_RENDERED, (mesId) => {
        formatMessageAsWikiSection(mesId);
    });
}

// Auto-run initialization
init();