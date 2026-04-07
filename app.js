// ============================================================================
// TRUST WALLET LITE - PROFESSIONAL PRODUCTION VERSION v7.0
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// ====== 2. GET REAL TELEGRAM ID (5 METHODS) ======
let REAL_USER_ID = null;
let USER_NAME = 'User';
let USER_USERNAME = '';
let USER_PHOTO = '';

// Method 1: From tg.initDataUnsafe.user
if (tg?.initDataUnsafe?.user?.id) {
    REAL_USER_ID = tg.initDataUnsafe.user.id.toString();
    USER_NAME = tg.initDataUnsafe.user.first_name || 'User';
    USER_USERNAME = tg.initDataUnsafe.user.username || '';
    USER_PHOTO = tg.initDataUnsafe.user.photo_url || '';
    console.log("✅ Method 1 - Telegram ID:", REAL_USER_ID);
}

// Method 2: From window.Telegram.WebApp.initDataUnsafe.user
if (!REAL_USER_ID && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    REAL_USER_ID = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    USER_NAME = window.Telegram.WebApp.initDataUnsafe.user.first_name || 'User';
    USER_USERNAME = window.Telegram.WebApp.initDataUnsafe.user.username || '';
    console.log("✅ Method 2 - Telegram ID:", REAL_USER_ID);
}

// Method 3: From initData parsing
if (!REAL_USER_ID) {
    const initData = tg?.initData || window.Telegram?.WebApp?.initData || '';
    
    if (initData) {
        try {
            const params = new URLSearchParams(initData);
            const userJson = params.get('user');
            
            if (userJson) {
                const user = JSON.parse(decodeURIComponent(userJson));
                
                if (user.id) {
                    REAL_USER_ID = user.id.toString();
                    USER_NAME = user.first_name || 'User';
                    USER_USERNAME = user.username || '';
                    console.log("✅ Method 3 - Telegram ID:", REAL_USER_ID);
                }
            }
        } catch(e) {
            console.error("Parse error:", e);
        }
    }
}

// Method 4: From localStorage
if (!REAL_USER_ID) {
    const savedId = localStorage.getItem('twt_user_id');
    
    if (savedId && !savedId.startsWith('guest_')) {
        REAL_USER_ID = savedId;
        console.log("📦 Method 4 - Using saved ID:", REAL_USER_ID);
    }
}

// Method 5: Fallback for testing (will be removed in production)
if (!REAL_USER_ID) {
    REAL_USER_ID = "1653918641";
    USER_NAME = "Admin Tester";
    console.warn("⚠️ Method 5 - Using admin ID for testing");
}

const userId = REAL_USER_ID;
const userName = USER_NAME;

localStorage.setItem('twt_user_id', userId);

console.log("📱 FINAL User ID:", userId);
console.log("👤 FINAL User Name:", userName);
console.log("🔹 Username:", USER_USERNAME);

const startParam = tg?.initDataUnsafe?.start_param || 
                   new URLSearchParams(window.location.search).get('startapp') || 
                   new URLSearchParams(window.location.search).get('ref');

// ====== 3. DIAGNOSTIC PANEL ======
(function() {
    const diagDiv = document.createElement('div');
    
    diagDiv.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        right: 10px;
        background: #000000cc;
        backdrop-filter: blur(10px);
        color: #00ff00;
        font-family: monospace;
        font-size: 10px;
        padding: 12px;
        border-radius: 12px;
        z-index: 10000;
        border-left: 4px solid #3b82f6;
        pointer-events: none;
        word-break: break-all;
        max-height: 200px;
        overflow-y: auto;
    `;
    
    const hasWebApp = !!window.Telegram?.WebApp;
    const hasInitData = !!window.Telegram?.WebApp?.initData;
    const hasUser = !!window.Telegram?.WebApp?.initDataUnsafe?.user;
    
    diagDiv.innerHTML = `
        <b>🔧 TECHNICAL DIAGNOSTIC</b><br>
        ├─ WebApp available: ${hasWebApp ? '✅ YES' : '❌ NO'}<br>
        ├─ initData available: ${hasInitData ? '✅ YES' : '❌ NO'}<br>
        ├─ User object found: ${hasUser ? '✅ YES' : '❌ NO'}<br>
        ├─ User ID: <b style="color:#ffaa00">${userId}</b><br>
        ${!hasWebApp ? '<br><b style="color:#ff5555">⚠️ CRITICAL: No Telegram WebApp!</b>' : ''}
        ${hasWebApp && !hasInitData ? '<br><b style="color:#ff5555">⚠️ CRITICAL: initData is EMPTY! Bot not configured as Mini App.</b>' : ''}
        ${hasUser ? '<br><b style="color:#00ff00">✅✅✅ USER DETECTED! App will work normally.</b>' : ''}
    `;
    
    document.body.appendChild(diagDiv);
    
    setTimeout(() => {
        diagDiv.style.opacity = '0';
        
        setTimeout(() => {
            diagDiv.remove();
        }, 1000);
    }, 20000);
})();

// ====== 4. ADMIN SYSTEM ======
const ADMIN_ID = "1653918641";
let isAdmin = userId === ADMIN_ID;

function checkAdminAndAddCrown() {
    if (!isAdmin) return;
    
    const header = document.querySelector('.header-actions');
    if (!header) return;
    
    if (document.getElementById('adminCrownBtn')) return;
    
    const adminBtn = document.createElement('button');
    adminBtn.id = 'adminCrownBtn';
    adminBtn.className = 'icon-btn';
    adminBtn.innerHTML = '<i class="fa-solid fa-crown" style="color: gold;"></i>';
    adminBtn.onclick = showAdminPanel;
    
    header.appendChild(adminBtn);
}

function showAdminPanel() {
    if (!isAdmin) {
        showToast('Access denied', 'error');
        return;
    }
    
    alert('Admin Panel - Coming Soon');
}

function closeAdminPanel() {
    document.getElementById('adminPanel')?.classList.add('hidden');
}

// ====== 5. CONSTANTS ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const AIRDROP_BONUS = 10;
const REFERRAL_BONUS = 25;
const TWT_PRICE = 1.25;
const SWAP_RATE = 500000;

const CMC_ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
    SHIB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
    PEPE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png',
    TON: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
    ADA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
    DOGE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png'
};

const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'PEPE', name: 'Pepe' }
];

const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' }
];

const TOP_CRYPTOS = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'PEPE', name: 'Pepe' }
];

const SWAP_CURRENCIES = [
    { symbol: 'USDT', name: 'Tether', icon: CMC_ICONS.USDT },
    { symbol: 'TWT', name: 'Trust Wallet Token', icon: CMC_ICONS.TWT },
    { symbol: 'BNB', name: 'BNB', icon: CMC_ICONS.BNB },
    { symbol: 'BTC', name: 'Bitcoin', icon: CMC_ICONS.BTC },
    { symbol: 'ETH', name: 'Ethereum', icon: CMC_ICONS.ETH },
    { symbol: 'SOL', name: 'Solana', icon: CMC_ICONS.SOL },
    { symbol: 'TRX', name: 'TRON', icon: CMC_ICONS.TRX },
    { symbol: 'SHIB', name: 'Shiba Inu', icon: CMC_ICONS.SHIB },
    { symbol: 'PEPE', name: 'Pepe', icon: CMC_ICONS.PEPE }
];

const DEPOSIT_ADDRESSES = {
    TWT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    USDT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    BNB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    BTC: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    ETH: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    SOL: '3DjcSVxfeP3u4WcV9KniMH11btgThnoGxcx54dMtbfuR',
    TRX: 'TMSJH4QunFiUAqZ8iLvQDPajs1v4B3e5E6'
};

const DEPOSIT_MINIMUMS = {
    TWT: 500000,
    USDT: 10,
    BNB: 0.02,
    BTC: 0.0005,
    ETH: 0.005,
    SHIB: 2000000,
    PEPE: 3000000,
    SOL: 0.12,
    TRX: 40
};

// ====== 6. STATE MANAGEMENT ======
let userData = null;
let livePrices = {};
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let unreadNotifications = 0;
let appInitialized = false;
let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;

const USER_CACHE_TIME = 300000;
const PRICES_CACHE_TIME = 10800000;

// ====== 7. TRANSLATIONS ======
const translations = {
    en: {
        'nav.wallet': 'Wallet',
        'nav.swap': 'Swap',
        'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'Settings',
        'actions.deposit': 'Deposit',
        'actions.withdraw': 'Withdraw',
        'actions.send': 'Send',
        'actions.receive': 'Receive',
        'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance',
        'airdrop.totalInvites': 'Total Invites',
        'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link',
        'airdrop.milestones': 'Airdrop Milestones',
        'notifications.title': 'Notifications',
        'notifications.clear_read': 'Clear Read',
        'notifications.clear_all': 'Clear All',
        'notifications.no_notifications': 'No notifications',
        'settings.language': 'Language',
        'settings.theme': 'Theme',
        'settings.logout': 'Logout'
    },
    ar: {
        'nav.wallet': 'المحفظة',
        'nav.swap': 'تحويل',
        'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع',
        'actions.withdraw': 'سحب',
        'actions.send': 'إرسال',
        'actions.receive': 'استلام',
        'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'airdrop.totalInvites': 'إجمالي الدعوات',
        'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة',
        'airdrop.milestones': 'مراحل الإسقاط',
        'notifications.title': 'الإشعارات',
        'notifications.clear_read': 'حذف المقروء',
        'notifications.clear_all': 'حذف الكل',
        'notifications.no_notifications': 'لا توجد إشعارات',
        'settings.language': 'اللغة',
        'settings.theme': 'المظهر',
        'settings.logout': 'تسجيل الخروج'
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
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
}

function animateElement(selector, animation) {
    const el = document.querySelector(selector);
    if (el) {
        el.classList.add(animation);
        setTimeout(() => el.classList.remove(animation), 500);
    }
}

// ====== 8. THEME & LANGUAGE ======
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
    
    updateAllTexts();
    showToast('Language changed');
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

// ====== 9. API CALLS ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// ====== 10. PRICES ======
async function fetchLivePrices(force = false) {
    const now = Date.now();
    const cached = localStorage.getItem('live_prices');
    
    if (!force && cached && (now - lastPricesLoadTime) < PRICES_CACHE_TIME) {
        const { prices, timestamp } = JSON.parse(cached);
        livePrices = prices;
        lastPricesLoadTime = timestamp;
        
        if (currentPage === 'wallet') renderAssets();
        updateTotalBalance();
        return;
    }
    
    try {
        const ids = ['trust-wallet-token', 'tether', 'binancecoin', 'bitcoin', 'ethereum', 'solana', 'tron', 'shiba-inu', 'pepe'].join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        livePrices = {
            TWT: { price: data['trust-wallet-token']?.usd || 1.25, change: data['trust-wallet-token']?.usd_24h_change || 0 },
            USDT: { price: data.tether?.usd || 1, change: data.tether?.usd_24h_change || 0 },
            BNB: { price: data.binancecoin?.usd || 0, change: data.binancecoin?.usd_24h_change || 0 },
            BTC: { price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
            ETH: { price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
            SOL: { price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 },
            TRX: { price: data.tron?.usd || 0, change: data.tron?.usd_24h_change || 0 },
            SHIB: { price: data['shiba-inu']?.usd || 0, change: data['shiba-inu']?.usd_24h_change || 0 },
            PEPE: { price: data.pepe?.usd || 0, change: data.pepe?.usd_24h_change || 0 }
        };
        
        lastPricesLoadTime = now;
        localStorage.setItem('live_prices', JSON.stringify({ prices: livePrices, timestamp: now }));
        
        if (currentPage === 'wallet') renderAssets();
        updateTotalBalance();
        
    } catch (error) {
        console.error("Price error:", error);
    }
}

function refreshPrices() {
    fetchLivePrices(true);
    showToast('Prices refreshed!');
}

// ====== 11. CREATE NEW WALLET ======
async function createNewWallet() {
    console.log("Creating wallet for user:", userId);
    
    const btn = document.getElementById('createWalletBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        btn.disabled = true;
    }
    
    try {
        const newUserData = {
            userId: userId,
            userName: userName,
            balances: {
                TWT: 1000,
                USDT: AIRDROP_BONUS,
                BNB: 0,
                BTC: 0,
                ETH: 0,
                SOL: 0,
                TRX: 0,
                SHIB: 0,
                PEPE: 0
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{
                id: Date.now().toString(),
                message: '🎉 Welcome! +10 USDT',
                read: false,
                timestamp: new Date().toISOString()
            }],
            transactions: [{
                type: 'airdrop',
                amount: AIRDROP_BONUS,
                currency: 'USDT',
                timestamp: new Date().toISOString()
            }],
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        const response = await apiCall('/users', 'POST', { userId, userData: newUserData });
        
        if (response.success) {
            userData = newUserData;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            
            updateUI();
            showToast('✅ Wallet created! +10 USDT');
            
            if (startParam && startParam !== userId) {
                await processReferral();
            }
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error("Error:", error);
        showToast('Failed to create wallet', 'error');
        
    } finally {
        if (btn) {
            btn.innerHTML = 'Create a new wallet';
            btn.disabled = false;
        }
    }
}

function showImportModal() {
    const modal = document.getElementById('importModal');
    if (!modal) {
        showToast('Import feature coming soon', 'info');
        return;
    }
    
    const grid = document.getElementById('wordsGrid');
    if (grid) {
        grid.innerHTML = '';
        
        for (let i = 1; i <= 12; i++) {
            grid.innerHTML += `<div class="word-field"><span>${i}</span><input type="text" id="word_${i}" placeholder="word ${i}"></div>`;
        }
    }
    
    modal.classList.add('show');
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
    
    showToast('Import feature coming soon', 'info');
}

// ====== 12. REFERRAL SYSTEM ======
async function processReferral() {
    const referralCode = startParam;
    
    if (!referralCode) return;
    if (referralCode === userId) return;
    if (userData?.invitedBy) return;
    
    const response = await apiCall('/referrals', 'POST', {
        referrerId: referralCode,
        newUserId: userId
    });
    
    if (response.success && userData) {
        userData.invitedBy = referralCode;
        userData.balances.USDT += REFERRAL_BONUS;
        userData.totalUsdtEarned += REFERRAL_BONUS;
        
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        updateUI();
        
        showToast(`🎉 +${REFERRAL_BONUS} USDT from referral!`, 'success');
    }
}

function copyInviteLink() {
    copyToClipboard(`${BOT_LINK}?startapp=${userId}`);
}

async function claimMilestone(referrals) {
    const milestone = userData.referralMilestones?.find(x => x.referrals === referrals);
    
    if (!milestone || milestone.claimed) return;
    if (userData.inviteCount < referrals) {
        showToast(`Need ${referrals} referrals`, 'error');
        return;
    }
    
    const reward = REFERRAL_MILESTONES.find(x => x.referrals === referrals).reward;
    
    userData.balances.USDT += reward;
    userData.totalUsdtEarned += reward;
    milestone.claimed = true;
    
    saveUserData();
    renderAirdrop();
    renderWallet();
    updateTotalBalance();
    
    showToast(`Claimed ${reward} USDT!`);
}

// ====== 13. LOAD USER DATA ======
async function loadUserData() {
    try {
        const localData = localStorage.getItem(`user_${userId}`);
        
        if (localData) {
            userData = JSON.parse(localData);
            console.log("✅ Using cached user data");
            
            updateUI();
            updateNotificationBadge();
            checkAdminAndAddCrown();
            
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            return;
        }
        
        const response = await apiCall(`/users/${userId}`);
        
        if (response.success && response.data) {
            userData = response.data;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            
            console.log("✅ Data loaded from API");
            
            updateUI();
            updateNotificationBadge();
            checkAdminAndAddCrown();
            
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
        } else {
            document.getElementById('onboardingScreen').style.display = 'flex';
            document.getElementById('mainContent').style.display = 'none';
        }
        
    } catch (error) {
        console.error("Error loading user:", error);
        
        document.getElementById('onboardingScreen').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
    }
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        apiCall(`/users/${userId}`, 'PATCH', { updates: userData });
    }
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    
    if (badge && userData) {
        const unread = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'block' : 'none';
    }
}

function updateUI() {
    if (currentPage === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
    
    if (currentPage === 'airdrop') {
        renderAirdrop();
    }
    
    if (currentPage === 'settings') {
        renderSettings();
    }
    
    const userNameEl = document.getElementById('userName');
    const userIdEl = document.getElementById('userIdDisplay');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl && userData) {
        userNameEl.textContent = userData.userName || userName;
    }
    
    if (userIdEl && userData) {
        userIdEl.textContent = `ID: ${userData.userId?.slice(-8)}`;
    }
    
    if (userAvatarEl && userData) {
        userAvatarEl.textContent = (userData.userName || userName).charAt(0).toUpperCase();
    }
}

function updateTotalBalance() {
    if (!userData) return;
    
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * TWT_PRICE;
    
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

// ====== 14. RENDER FUNCTIONS ======
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
        <div class="section-header">
            <h3>${t('wallet.topCryptos')}</h3>
        </div>
        <div id="topCryptoList" class="top-crypto-list"></div>
    `;
    
    renderAssets();
    updateTotalBalance();
}

function showAssetDetails(symbol) {
    const balance = userData?.balances[symbol] || 0;
    const price = livePrices[symbol]?.price || (symbol === 'TWT' ? TWT_PRICE : 0);
    const value = symbol === 'USDT' ? balance : balance * price;
    
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}

function renderTopCryptos() {
    const container = document.getElementById('topCryptoList');
    if (!container) return;
    
    container.innerHTML = TOP_CRYPTOS.map(crypto => {
        const priceData = livePrices[crypto.symbol] || { price: 0, change: 0 };
        const changeClass = priceData.change >= 0 ? 'positive' : 'negative';
        const changeSymbol = priceData.change >= 0 ? '+' : '';
        
        return `
            <div class="crypto-item" onclick="showCryptoDetails('${crypto.symbol}')">
                <div class="crypto-left">
                    <img src="${getCurrencyIcon(crypto.symbol)}" class="crypto-icon-img">
                    <div class="crypto-info">
                        <h4>${crypto.name}</h4>
                        <p>${crypto.symbol}</p>
                    </div>
                </div>
                <div class="crypto-right">
                    <div class="crypto-price">$${formatNumber(priceData.price)}</div>
                    <div class="crypto-change ${changeClass}">${changeSymbol}${priceData.change.toFixed(2)}%</div>
                </div>
            </div>
        `;
    }).join('');
}

function showCryptoDetails(symbol) {
    const price = livePrices[symbol]?.price || 0;
    const change = livePrices[symbol]?.change || 0;
    const changeSymbol = change >= 0 ? '+' : '';
    
    showToast(`${symbol}: $${formatNumber(price)} (${changeSymbol}${change.toFixed(2)}%)`, 'info');
}

function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    
    const inviteLink = `${BOT_LINK}?startapp=${userId}`;
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card">
                <span>${t('airdrop.totalInvites')}</span>
                <span>${userData.inviteCount || 0}</span>
            </div>
            <div class="stat-card">
                <span>${t('airdrop.earned')}</span>
                <span>${(userData.totalUsdtEarned || 0).toFixed(2)}</span>
            </div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('airdrop.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button>
            </div>
        </div>
        <div id="milestonesList" class="milestones-list"></div>
    `;
    
    renderReferralMilestones();
}

function renderReferralMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const progress = Math.min((userData.inviteCount / m.referrals) * 100, 100);
        const canClaim = userData.inviteCount >= m.referrals && !userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        const isClaimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        
        return `
            <div class="milestone-item">
                <div class="milestone-header">
                    <span><i class="fas ${m.icon}"></i> ${m.referrals} Referrals</span>
                    <span>${m.reward} ${m.unit}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
                <div class="progress-text">${userData.inviteCount}/${m.referrals}</div>
                ${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.referrals})">Claim Reward</button>` : isClaimed ? '<p style="color:green;text-align:center;">✓ Claimed</p>' : ''}
            </div>
        `;
    }).join('');
}

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    
    const twtBalance = userData?.balances?.TWT || 0;
    const cardNumber = userId?.slice(-4) || '8888';
    
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
                    <div class="value">${userData?.userName || 'User'}</div>
                </div>
                <div>
                    <div class="label">Expires</div>
                    <div class="value">12/28</div>
                </div>
            </div>
            <div class="card-balance">
                <div class="balance-label">Card Balance</div>
                <div class="balance-value">${twtBalance} TWT</div>
                <div class="balance-usd">≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div>
            </div>
            <div class="card-footer">
                <i class="fab fa-visa"></i>
                <span>Virtual Card</span>
            </div>
        </div>
    `;
}

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()">
                <i class="fas fa-bell"></i>
                <div>
                    <div class="label">${t('notifications.title')}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showHistory()">
                <i class="fas fa-history"></i>
                <div>
                    <div class="label">${t('actions.history')}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleLanguage()">
                <i class="fas fa-language"></i>
                <div>
                    <div class="label">${t('settings.language')}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleTheme()">
                <i class="fas fa-moon"></i>
                <div>
                    <div class="label">${t('settings.theme')}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <div>
                    <div class="label">${t('settings.logout')}</div>
                </div>
            </div>
        </div>
    `;
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    
    if (!modal || !list) return;
    
    const txs = userData?.transactions || [];
    
    if (txs.length === 0) {
        list.innerHTML = '<div class="empty-state">No transactions</div>';
        return;
    }
    
    list.innerHTML = txs.map(tx => {
        const date = new Date(tx.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let icon = 'fa-circle-down';
        let typeClass = 'deposit';
        let typeText = 'Deposit';
        
        if (tx.type === 'withdraw') {
            icon = 'fa-circle-up';
            typeClass = 'withdraw';
            typeText = 'Withdrawal';
        } else if (tx.type === 'swap') {
            icon = 'fa-arrow-right-arrow-left';
            typeClass = 'swap';
            typeText = 'Swap';
        } else if (tx.type === 'referral_bonus') {
            icon = 'fa-users';
            typeClass = 'referral';
            typeText = 'Referral Bonus';
        }
        
        let statusClass = 'completed';
        let statusText = 'Completed';
        
        if (tx.status === 'pending') {
            statusClass = 'pending';
            statusText = 'Pending';
        } else if (tx.status === 'rejected') {
            statusClass = 'rejected';
            statusText = 'Rejected';
        }
        
        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-type ${typeClass}">
                        <i class="fa-regular ${icon}"></i>
                        <span>${typeText}</span>
                    </div>
                    <span class="history-status ${statusClass}">${statusText}</span>
                </div>
                <div class="history-details">
                    <span class="history-amount">${tx.amount} ${tx.currency}</span>
                    <span class="history-date">${formattedDate}</span>
                </div>
            </div>
        `;
    }).join('');
    
    modal.classList.add('show');
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    
    if (!modal || !list || !userData) return;
    
    const notifications = userData.notifications || [];
    
    if (notifications.length === 0) {
        list.innerHTML = '<div class="empty-state">No notifications</div>';
        return;
    }
    
    list.innerHTML = notifications.map(n => `
        <div class="notification-item">
            <div>${n.message}</div>
            <div style="font-size:10px;">${new Date(n.timestamp).toLocaleString()}</div>
        </div>
    `).join('');
    
    modal.classList.add('show');
}

// ====== 15. MODAL FUNCTIONS ======
function showDepositModal() {
    document.getElementById('depositModal').classList.add('show');
}

function showWithdrawModal() {
    document.getElementById('withdrawModal').classList.add('show');
}

function showSendModal() {
    document.getElementById('sendModal').classList.add('show');
}

function showReceiveModal() {
    document.getElementById('receiveModal').classList.add('show');
    document.getElementById('receiveAddress').innerText = userId;
}

function showSwapModal() {
    showToast('Coming soon!');
}

function sendTransaction() {
    showToast('Coming soon!');
}

function submitWithdraw() {
    showToast('Coming soon!');
}

function copyDepositAddress() {
    const address = document.getElementById('depositAddress')?.innerText;
    if (address) copyToClipboard(address);
}

function copyAddress() {
    const address = document.getElementById('receiveAddress')?.innerText;
    if (address) copyToClipboard(address);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== 16. NAVIGATION ======
function showWallet() {
    currentPage = 'wallet';
    
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="wallet"]')?.classList.add('active');
    
    renderWallet();
}

function showSwap() {
    currentPage = 'swap';
    
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.remove('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="swap"]')?.classList.add('active');
    
    showSwapModal();
}

function showAirdrop() {
    currentPage = 'airdrop';
    
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="airdrop"]')?.classList.add('active');
    
    renderAirdrop();
}

function showTWTPay() {
    currentPage = 'twtpay';
    
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="twtpay"]')?.classList.add('active');
    
    renderTWTPay();
}

function showSettings() {
    currentPage = 'settings';
    
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="settings"]')?.classList.add('active');
    
    renderSettings();
}

// ====== 17. STICKER SYSTEM ======
const WELCOME_STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '👑', '❤️‍🔥', '🫂', '🔥', '🧡', '🤑', '🧟', '🎁', '💌', '🎉', '❤️‍🔥', '👑', '🚀', '💟', '🤍'];
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
        
        setTimeout(() => {
            stickerElement.textContent = '';
        }, 300);
    }, 3000);
    
    lastStickerTime = now;
}

// ====== 18. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Initializing Trust Wallet Lite...");
    
    initTheme();
    updateAllTexts();
    
    const createBtn = document.getElementById('createWalletBtn');
    const importBtn = document.getElementById('importWalletBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const refreshBtn = document.getElementById('refreshPricesBtn');
    
    if (createBtn) createBtn.addEventListener('click', createNewWallet);
    if (importBtn) importBtn.addEventListener('click', showImportModal);
    if (confirmImportBtn) confirmImportBtn.addEventListener('click', importWallet);
    if (refreshBtn) refreshBtn.addEventListener('click', refreshPrices);
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            if (tab === 'wallet') showWallet();
            else if (tab === 'swap') showSwap();
            else if (tab === 'airdrop') showAirdrop();
            else if (tab === 'twtpay') showTWTPay();
            else if (tab === 'settings') showSettings();
        });
    });
    
    await fetchLivePrices();
    await loadUserData();
    checkAdminAndAddCrown();
    
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
        
        setTimeout(() => {
            showRandomSticker();
        }, 500);
    }, 1500);
    
    console.log("✅ Trust Wallet Lite initialized!");
    console.log("📱 User ID:", userId);
    console.log("👑 Is Admin:", isAdmin);
});

// ====== 19. EXPORT GLOBALS (كل دالة في سطر واحد) ======
window.showWallet = showWallet;
window.showSwap = showSwap;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.showSwapModal = showSwapModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.scrollToTop = scrollToTop;
window.refreshPrices = refreshPrices;
window.copyToClipboard = copyToClipboard;
window.copyInviteLink = copyInviteLink;
window.claimMilestone = claimMilestone;
window.copyDepositAddress = copyDepositAddress;
window.copyAddress = copyAddress;
window.sendTransaction = sendTransaction;
window.submitWithdraw = submitWithdraw;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
window.showAssetDetails = showAssetDetails;
window.showCryptoDetails = showCryptoDetails;
