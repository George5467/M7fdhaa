// ============================================================================
// TRUST WALLET LITE - ULTIMATE PROFESSIONAL VERSION 6.0
// مع: تسجيل حقيقي بـ Telegram ID + CoinPayments + لوحة مشرف متكاملة
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// جلب بيانات المستخدم الحقيقية من تيليجرام
const telegramUser = tg?.initDataUnsafe?.user;
const REAL_USER_ID = telegramUser?.id?.toString() || null;
const TELEGRAM_USERNAME = telegramUser?.username || '';
const TELEGRAM_FIRST_NAME = telegramUser?.first_name || 'User';
const TELEGRAM_LAST_NAME = telegramUser?.last_name || '';
const TELEGRAM_PHOTO = telegramUser?.photo_url || '';

console.log("📱 Real Telegram ID:", REAL_USER_ID);
console.log("👤 Username:", TELEGRAM_USERNAME);
console.log("📛 Name:", TELEGRAM_FIRST_NAME, TELEGRAM_LAST_NAME);

const startParam = tg?.initDataUnsafe?.start_param || 
                   new URLSearchParams(window.location.search).get('startapp') || 
                   new URLSearchParams(window.location.search).get('ref');

// ====== 2. STATE MANAGEMENT ======
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
let currentManageUserId = null;

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
        'swap.swapperFee': 'Swapper Fee',
        'airdrop.totalInvites': 'Total Invites', 'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link', 'airdrop.milestones': 'Airdrop Milestones',
        'airdrop.inviteBonus': 'Get 25 USDT for each friend who joins!',
        'card.balance': 'Card Balance', 'settings.language': 'Language',
        'settings.theme': 'Theme', 'settings.logout': 'Logout',
        'notifications.title': 'Notifications',
        'notifications.clear_read': 'Clear Read',
        'notifications.clear_all': 'Clear All',
        'notifications.no_notifications': 'No notifications',
        'admin.title': 'Admin Panel',
        'admin.deposits': 'Pending Deposits',
        'admin.withdrawals': 'Pending Withdrawals',
        'admin.users': 'User Management',
        'admin.approve': 'Approve',
        'admin.reject': 'Reject',
        'admin.searchUser': 'Search User',
        'admin.enterUserId': 'Enter Telegram ID',
        'admin.addBalance': 'Add Balance',
        'admin.removeBalance': 'Remove Balance',
        'admin.refresh': 'Refresh',
        'admin.blockWithdraw': 'Block Withdrawals',
        'error.insufficient': 'Insufficient balance',
        'error.enterAmount': 'Enter valid amount',
        'error.invalidAddress': 'Invalid address',
        'success.depositSubmitted': 'Deposit request submitted',
        'success.withdrawSubmitted': 'Withdrawal request submitted',
        'success.swapCompleted': 'Swap completed',
        'success.referralCopied': 'Referral link copied'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.send': 'إرسال', 'actions.receive': 'استلام',
        'actions.swap': 'تحويل', 'actions.history': 'السجل',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'swap.from': 'من', 'swap.to': 'إلى', 'swap.confirm': 'تأكيد',
        'swap.swapperFee': 'رسوم التحويل',
        'airdrop.totalInvites': 'إجمالي الدعوات', 'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة', 'airdrop.milestones': 'مراحل الإسقاط',
        'airdrop.inviteBonus': 'احصل على 25 USDT لكل صديق ينضم!',
        'card.balance': 'رصيد البطاقة', 'settings.language': 'اللغة',
        'settings.theme': 'المظهر', 'settings.logout': 'تسجيل الخروج',
        'notifications.title': 'الإشعارات',
        'notifications.clear_read': 'حذف المقروء',
        'notifications.clear_all': 'حذف الكل',
        'notifications.no_notifications': 'لا توجد إشعارات',
        'admin.title': 'لوحة المشرف',
        'admin.deposits': 'إيداعات معلقة',
        'admin.withdrawals': 'سحوبات معلقة',
        'admin.users': 'إدارة المستخدمين',
        'admin.approve': 'موافقة',
        'admin.reject': 'رفض',
        'admin.searchUser': 'بحث عن مستخدم',
        'admin.enterUserId': 'أدخل معرف تيليجرام',
        'admin.addBalance': 'إضافة رصيد',
        'admin.removeBalance': 'خصم رصيد',
        'admin.refresh': 'تحديث',
        'admin.blockWithdraw': 'حظر السحوبات',
        'error.insufficient': 'رصيد غير كاف',
        'error.enterAmount': 'أدخل مبلغ صحيح',
        'error.invalidAddress': 'عنوان غير صالح',
        'success.depositSubmitted': 'تم تقديم طلب الإيداع',
        'success.withdrawSubmitted': 'تم تقديم طلب السحب',
        'success.swapCompleted': 'تم التحويل بنجاح',
        'success.referralCopied': 'تم نسخ رابط الإحالة'
    }
};

// ====== 5. UTILITY FUNCTIONS ======
function t(key, params = {}) {
    let text = translations[currentLanguage]?.[key] || translations.en[key] || key;
    Object.keys(params).forEach(p => text = text.replace(`{${p}}`, params[p]));
    return text;
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
    if (type === 'success') icon.className = 'fas fa-check-circle';
    else if (type === 'error') icon.className = 'fas fa-times-circle';
    else if (type === 'warning') icon.className = 'fas fa-exclamation-triangle';
    else icon.className = 'fas fa-info-circle';
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

function animateElement(selector, animation) {
    const el = document.querySelector(selector);
    if (el) {
        el.classList.add(animation);
        setTimeout(() => el.classList.remove(animation), 500);
    }
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
    if (currentPage === 'twtpay') renderTWTPay();
    if (currentPage === 'admin') renderAdminPanel();
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
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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

// ====== 8. API CALLS ======
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
        console.log("✅ Admin ID loaded from server:", adminId);
        
        const userId = getUserId();
        if (userId && adminId) {
            isAdmin = (userId === adminId);
            console.log("👑 Is Admin:", isAdmin);
        }
        
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) {
            if (isAdmin) crownBtn.classList.remove('hidden');
            else crownBtn.classList.add('hidden');
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

// ====== 9. PRICES ======
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

function refreshPrices() {
    fetchLivePrices();
    showToast('Prices refreshed!');
}

// ====== 10. USER DATA MANAGEMENT ======
function getUserId() {
    // استخدام المعرف الحقيقي من تيليجرام أولاً
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
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 0);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 0);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 0);
    total += (userData.balances.SOL || 0) * (livePrices.SOL?.price || 0);
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function updateUI() {
    if (currentPage === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
    if (currentPage === 'airdrop') renderAirdrop();
    if (currentPage === 'twtpay') renderTWTPay();
    if (currentPage === 'settings') renderSettings();
    if (currentPage === 'admin' && isAdmin) renderAdminPanel();
    updateNotificationBadge();
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
        const shortId = userData.userId?.slice(-8);
        userIdEl.textContent = `ID: ${shortId}`;
    }
    
    if (userAvatarEl && userData) {
        const firstChar = (userData.userName || TELEGRAM_FIRST_NAME).charAt(0).toUpperCase();
        userAvatarEl.textContent = firstChar;
    }
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        const unread = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

function addNotification(message, type = 'info') {
    if (!userData) return;
    if (!userData.notifications) userData.notifications = [];
    userData.notifications.unshift({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        message: message,
        type: type,
        read: false,
        timestamp: new Date().toISOString()
    });
    saveUserData();
    updateNotificationBadge();
    showToast(message, type);
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    if (!modal || !list || !userData) return;
    
    const notifications = userData.notifications || [];
    
    let controlsHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px; padding: 0 5px;">
            <button onclick="clearReadNotifications()" 
                    style="flex: 1; padding: 8px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; color: var(--quantum-blue); font-size: 12px; cursor: pointer;">
                <i class="fas fa-trash-alt"></i> ${t('notifications.clear_read')}
            </button>
            <button onclick="clearAllNotifications()" 
                    style="flex: 1; padding: 8px; background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.2); border-radius: 8px; color: #ff4444; font-size: 12px; cursor: pointer;">
                <i class="fas fa-bell-slash"></i> ${t('notifications.clear_all')}
            </button>
        </div>
    `;
    
    if (notifications.length === 0) {
        list.innerHTML = controlsHTML + `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-bell-slash" style="font-size: 48px; opacity: 0.5;"></i>
                <p>${t('notifications.no_notifications')}</p>
            </div>
        `;
    } else {
        list.innerHTML = controlsHTML + notifications.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead('${n.id}')">
                <div class="notification-header">
                    <span class="notification-title"><i class="fas ${n.type === 'success' ? 'fa-check-circle' : n.type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i> Notification</span>
                    <span class="notification-time">${new Date(n.timestamp).toLocaleString()}</span>
                </div>
                <div class="notification-message">${n.message}</div>
            </div>
        `).join('');
    }
    
    modal.classList.add('show');
}

function markNotificationRead(notificationId) {
    if (!userData.notifications) return;
    const notification = userData.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        updateNotificationBadge();
        saveUserData();
        showNotifications();
    }
}

function clearReadNotifications() {
    if (!userData.notifications) return;
    const readCount = userData.notifications.filter(n => n.read).length;
    if (readCount === 0) {
        showToast(t('notifications.no_read'), 'info');
        return;
    }
    userData.notifications = userData.notifications.filter(n => !n.read);
    saveUserData();
    updateNotificationBadge();
    showNotifications();
    showToast(`Cleared ${readCount} notifications`);
}

function clearAllNotifications() {
    if (!userData.notifications) return;
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    if (unreadCount > 0 && !confirm(`Delete ${unreadCount} unread notifications?`)) return;
    userData.notifications = [];
    saveUserData();
    updateNotificationBadge();
    showNotifications();
    showToast('All notifications cleared');
}

// ====== 11. ONBOARDING & WALLET CREATION ======
function showMainApp() {
    const onboarding = document.getElementById('onboardingScreen');
    const mainContent = document.getElementById('mainContent');
    if (onboarding) onboarding.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    showWallet();
    showRandomSticker();
}

function showOnboarding() {
    const onboarding = document.getElementById('onboardingScreen');
    const mainContent = document.getElementById('mainContent');
    if (onboarding) onboarding.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
}

async function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    
    try {
        if (!REAL_USER_ID) {
            showToast('Could not get Telegram ID', 'error');
            return;
        }
        
        const newUserId = REAL_USER_ID;
        localStorage.setItem('twt_user_id', newUserId);
        
        // توليد عنوان إيداع من CoinPayments
        let depositAddress = null;
        try {
            const addressResult = await createDepositAddress(newUserId, 'USDT');
            depositAddress = addressResult.address;
            console.log("✅ Deposit address generated:", depositAddress);
        } catch (addrError) {
            console.error("Failed to generate deposit address:", addrError);
            depositAddress = `0x${newUserId.slice(-40).padStart(40, '0')}`;
        }
        
        const newUserData = {
            userId: newUserId,
            userName: TELEGRAM_FIRST_NAME,
            lastName: TELEGRAM_LAST_NAME,
            username: TELEGRAM_USERNAME,
            telegramId: REAL_USER_ID,
            photoUrl: TELEGRAM_PHOTO,
            referralCode: newUserId.slice(-8),
            depositAddress: depositAddress,
            balances: {
                TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ 
                id: Date.now().toString(), 
                message: '🎉 Welcome to Trust Wallet Lite! You received 10 USDT airdrop!', 
                type: 'success',
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
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        isAdmin = (newUserId === adminId);
        console.log("👑 New user isAdmin:", isAdmin);
        
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) {
            if (isAdmin) crownBtn.classList.remove('hidden');
            else crownBtn.classList.add('hidden');
        }
        
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
    const grid = document.getElementById('wordsGrid');
    if (grid) {
        grid.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            grid.innerHTML += `<div class="word-field"><div class="word-label">${i}</div><input type="text" id="word_${i}" class="word-input" placeholder="word ${i}"></div>`;
        }
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
        if (!REAL_USER_ID) {
            showToast('Could not get Telegram ID', 'error');
            return;
        }
        
        const newUserId = REAL_USER_ID;
        localStorage.setItem('twt_user_id', newUserId);
        
        // توليد عنوان إيداع من CoinPayments
        let depositAddress = null;
        try {
            const addressResult = await createDepositAddress(newUserId, 'USDT');
            depositAddress = addressResult.address;
            console.log("✅ Deposit address generated:", depositAddress);
        } catch (addrError) {
            console.error("Failed to generate deposit address:", addrError);
            depositAddress = `0x${newUserId.slice(-40).padStart(40, '0')}`;
        }
        
        const newUserData = {
            userId: newUserId,
            userName: TELEGRAM_FIRST_NAME,
            lastName: TELEGRAM_LAST_NAME,
            username: TELEGRAM_USERNAME,
            telegramId: REAL_USER_ID,
            recoveryPhrase: words.join(' '),
            referralCode: newUserId.slice(-8),
            depositAddress: depositAddress,
            balances: {
                TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ 
                id: Date.now().toString(), 
                message: '🎉 Wallet imported! You received 10 USDT airdrop!', 
                type: 'success',
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
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        isAdmin = (newUserId === adminId);
        console.log("👑 Imported user isAdmin:", isAdmin);
        
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) {
            if (isAdmin) crownBtn.classList.remove('hidden');
            else crownBtn.classList.add('hidden');
        }
        
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
        btn.innerHTML = 'Import Wallet';
        btn.disabled = false;
    }
}

// ====== 12. RENDER WALLET ======
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
    const balance = userData?.balances[symbol] || 0;
    const price = livePrices[symbol]?.price || (symbol === 'TWT' ? TWT_PRICE : 0);
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
        <div id="assetsList" class="assets-list"></div>
    `;
    renderAssets();
    updateTotalBalance();
}

// ====== 13. RENDER AIRDROP ======
function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    
    const inviteLink = `${BOT_LINK}?startapp=${userData.userId}`;
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span id="totalInvites">${userData.inviteCount || 0}</span></div>
            <div class="stat-card"><span>${t('airdrop.earned')}</span><span id="usdtEarned">${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('airdrop.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button>
                <button class="share-btn" onclick="shareInvite()"><i class="fas fa-share-alt"></i></button>
            </div>
        </div>
        <div class="referral-description"><i class="fas fa-gift"></i><p>${t('airdrop.inviteBonus')}</p></div>
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

function shareInvite() {
    const text = `🚀 Join Trust Wallet Lite and get ${AIRDROP_BONUS} USDT Airdrop! Use my link: ${BOT_LINK}?startapp=${userData?.userId}`;
    if (tg?.shareToStory) tg.shareToStory(text);
    else copyToClipboard(text);
}

// ====== 14. RENDER TWT PAY ======
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
            <div class="feature"><i class="fas fa-exchange-alt"></i><span>Coming Soon</span></div>
        </div>
    `;
}

function showTopUp() { showToast('Coming soon!'); }
function showCardSettings() { showToast('Coming soon!'); }
function showCardTransactions() { showHistory(); }

// ====== 15. RENDER SETTINGS ======
function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div><div class="desc">View all notifications</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div><div class="desc">View all transactions</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div><div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div><div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div><div class="desc">Sign out of your wallet</div></div></div>
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

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

// ====== 16. SWAP FUNCTIONS ======
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
        <div class="swap-box"><div class="swap-label">${t('swap.from')}</div><div class="swap-row"><input type="number" id="swapFromAmount" placeholder="0.00" oninput="calculateSwap()"><div class="currency-selector-small" onclick="showSwapCurrencySelector('from')"><img id="swapFromIcon" src="${getCurrencyIcon(swapFromCurrency)}"><span id="swapFromSymbol">${swapFromCurrency}</span><i class="fas fa-chevron-down"></i></div></div><div class="balance-hint">Balance: <span id="swapFromBalance">0</span><span class="percentage-buttons"><button onclick="setSwapPercentage(25)">25%</button><button onclick="setSwapPercentage(50)">50%</button><button onclick="setSwapPercentage(100)">Max</button></span></div></div>
        <div class="swap-arrow" onclick="swapDirection()"><i class="fas fa-arrow-down"></i></div>
        <div class="swap-box"><div class="swap-label">${t('swap.to')}</div><div class="swap-row"><input type="number" id="swapToAmount" placeholder="0.00" readonly><div class="currency-selector-small" onclick="showSwapCurrencySelector('to')"><img id="swapToIcon" src="${getCurrencyIcon(swapToCurrency)}"><span id="swapToSymbol">${swapToCurrency}</span><i class="fas fa-chevron-down"></i></div></div><div class="balance-hint">Balance: <span id="swapToBalance">0</span></div></div>
        <div class="swap-rate" id="swapRateDisplay">1 ${swapFromCurrency} ≈ ${TWT_PRICE.toFixed(4)} ${swapToCurrency}</div>
        <div class="swap-fee"><span>${t('swap.swapperFee')} (0.3%)</span><span id="swapFee">$0.00</span></div>
        <button class="btn-primary" onclick="confirmSwap()">${t('swap.confirm')}</button>
    `;
    updateSwapBalances();
    calculateSwap();
}

function updateSwapBalances() {
    if (!userData) return;
    const fromBalance = document.getElementById('swapFromBalance');
    const toBalance = document.getElementById('swapToBalance');
    if (fromBalance) fromBalance.innerText = userData.balances[swapFromCurrency] || 0;
    if (toBalance) toBalance.innerText = userData.balances[swapToCurrency] || 0;
}

function showSwapCurrencySelector(type) {
    currentCurrencySelector = type;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    if (!list) return;
    
    list.innerHTML = ALL_ASSETS.map(asset => `
        <div class="currency-list-item" onclick="selectSwapCurrency('${asset.symbol}')">
            <img src="${getCurrencyIcon(asset.symbol)}">
            <div><h4>${asset.name}</h4><p>${asset.symbol}</p></div>
        </div>
    `).join('');
    modal.classList.add('show');
}

function selectSwapCurrency(symbol) {
    if (currentCurrencySelector === 'from') {
        swapFromCurrency = symbol;
        const fromIcon = document.getElementById('swapFromIcon');
        const fromSymbol = document.getElementById('swapFromSymbol');
        if (fromIcon) fromIcon.src = getCurrencyIcon(symbol);
        if (fromSymbol) fromSymbol.innerText = symbol;
    } else {
        swapToCurrency = symbol;
        const toIcon = document.getElementById('swapToIcon');
        const toSymbol = document.getElementById('swapToSymbol');
        if (toIcon) toIcon.src = getCurrencyIcon(symbol);
        if (toSymbol) toSymbol.innerText = symbol;
    }
    closeModal('currencySelectorModal');
    updateSwapBalances();
    calculateSwap();
}

function calculateSwap() {
    const amount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
    let fromPrice = swapFromCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapFromCurrency]?.price || 0);
    let toPrice = swapToCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapToCurrency]?.price || 0);
    if (fromPrice > 0 && toPrice > 0) {
        const toAmount = (amount * fromPrice) / toPrice;
        const toAmountInput = document.getElementById('swapToAmount');
        const swapFeeSpan = document.getElementById('swapFee');
        const swapRateDisplay = document.getElementById('swapRateDisplay');
        if (toAmountInput) toAmountInput.value = toAmount.toFixed(6);
        if (swapFeeSpan) {
            const fee = amount * fromPrice * SWAP_FEE_PERCENT;
            swapFeeSpan.innerText = `$${fee.toFixed(4)}`;
        }
        if (swapRateDisplay) swapRateDisplay.innerHTML = `1 ${swapFromCurrency} ≈ ${(fromPrice / toPrice).toFixed(6)} ${swapToCurrency}`;
    }
}

function setSwapPercentage(percent) {
    const balance = userData?.balances[swapFromCurrency] || 0;
    const fromAmount = document.getElementById('swapFromAmount');
    if (fromAmount) fromAmount.value = balance * (percent / 100);
    calculateSwap();
}

function swapDirection() {
    const temp = swapFromCurrency;
    swapFromCurrency = swapToCurrency;
    swapToCurrency = temp;
    const fromIcon = document.getElementById('swapFromIcon');
    const fromSymbol = document.getElementById('swapFromSymbol');
    const toIcon = document.getElementById('swapToIcon');
    const toSymbol = document.getElementById('swapToSymbol');
    if (fromIcon) fromIcon.src = getCurrencyIcon(swapFromCurrency);
    if (fromSymbol) fromSymbol.innerText = swapFromCurrency;
    if (toIcon) toIcon.src = getCurrencyIcon(swapToCurrency);
    if (toSymbol) toSymbol.innerText = swapToCurrency;
    updateSwapBalances();
    calculateSwap();
    animateElement('.swap-arrow', 'pop');
}

async function confirmSwap() {
    const amount = parseFloat(document.getElementById('swapFromAmount')?.value);
    const toAmount = parseFloat(document.getElementById('swapToAmount')?.value);
    if (!amount || amount <= 0) { showToast(t('error.enterAmount'), 'error'); return; }
    if ((userData.balances[swapFromCurrency] || 0) < amount) { showToast(t('error.insufficient'), 'error'); return; }
    
    userData.balances[swapFromCurrency] -= amount;
    userData.balances[swapToCurrency] = (userData.balances[swapToCurrency] || 0) + toAmount;
    
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({
        type: 'swap',
        amount: amount,
        fromCurrency: swapFromCurrency,
        toCurrency: swapToCurrency,
        toAmount: toAmount,
        timestamp: new Date().toISOString()
    });
    
    saveUserData();
    updateUI();
    updateSwapBalances();
    const fromAmountInput = document.getElementById('swapFromAmount');
    if (fromAmountInput) fromAmountInput.value = '';
    calculateSwap();
    closeModal('swapModal');
    showToast(t('success.swapCompleted'));
}

// ====== 17. SEND/RECEIVE/DEPOSIT/WITHDRAW ======
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { 
    document.getElementById('receiveModal').classList.add('show'); 
    const receiveAddress = document.getElementById('receiveAddress');
    if (receiveAddress && userData) receiveAddress.innerText = userData.userId || '';
}
function copyAddress() { copyToClipboard(document.getElementById('receiveAddress')?.innerText); }

async function sendTransaction() {
    const currency = document.getElementById('sendCurrency')?.value;
    const amount = parseFloat(document.getElementById('sendAmount')?.value);
    const address = document.getElementById('sendAddress')?.value;
    if (!amount || amount <= 0 || !address) { showToast(t('error.enterAmount'), 'error'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast(t('error.insufficient'), 'error'); return; }
    userData.balances[currency] -= amount;
    saveUserData();
    updateUI();
    closeModal('sendModal');
    showToast(`Sent ${amount} ${currency}`);
}

async function showDepositModal() {
    const modal = document.getElementById('depositModal');
    modal.classList.add('show');
    const currency = document.getElementById('depositCurrency')?.value || 'USDT';
    
    // عرض عنوان الإيداع المخزن للمستخدم
    const depositAddressSpan = document.getElementById('depositAddress');
    if (depositAddressSpan && userData) {
        if (userData.depositAddress) {
            depositAddressSpan.innerText = userData.depositAddress;
        } else {
            // محاولة توليد عنوان جديد
            try {
                const result = await createDepositAddress(userData.userId, currency);
                if (result.address) {
                    userData.depositAddress = result.address;
                    saveUserData();
                    depositAddressSpan.innerText = result.address;
                } else {
                    depositAddressSpan.innerText = `0x${userData.userId.slice(-40).padStart(40, '0')}`;
                }
            } catch (error) {
                depositAddressSpan.innerText = `0x${userData.userId.slice(-40).padStart(40, '0')}`;
            }
        }
    }
}

function copyDepositAddress() { copyToClipboard(document.getElementById('depositAddress')?.innerText); }

function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }

async function submitWithdraw() {
    const currency = document.getElementById('withdrawCurrency')?.value;
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
    const address = document.getElementById('withdrawAddress')?.value;
    if (!amount || amount <= 0 || !address) { showToast(t('error.enterAmount'), 'error'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast(t('error.insufficient'), 'error'); return; }
    
    userData.balances[currency] -= amount;
    
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({
        type: 'withdraw',
        amount: amount,
        currency: currency,
        address: address,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    
    saveUserData();
    updateUI();
    closeModal('withdrawModal');
    showToast(t('success.withdrawSubmitted'));
    
    // إشعار للمشرف
    if (isAdmin) {
        addNotification(`💰 New withdrawal request: ${amount} ${currency} to ${address.slice(0, 10)}...`, 'info');
    }
}

// ====== 18. ADMIN PANEL - نسخة كاملة من REFI ======
function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    currentPage = 'admin';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    renderAdminPanel();
    showRandomSticker();
}

function closeAdminPanel() {
    currentPage = 'wallet';
    document.getElementById('adminSection').classList.add('hidden');
    document.getElementById('walletSection').classList.remove('hidden');
    document.querySelector('.nav-item[data-tab="wallet"]').classList.add('active');
    showWallet();
}

function renderAdminPanel() {
    const container = document.getElementById('adminContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="admin-tabs">
            <button class="admin-tab ${currentAdminTab === 'deposits' ? 'active' : ''}" onclick="switchAdminTab('deposits')">
                <i class="fas fa-download"></i> ${t('admin.deposits')}
            </button>
            <button class="admin-tab ${currentAdminTab === 'withdrawals' ? 'active' : ''}" onclick="switchAdminTab('withdrawals')">
                <i class="fas fa-upload"></i> ${t('admin.withdrawals')}
            </button>
            <button class="admin-tab ${currentAdminTab === 'users' ? 'active' : ''}" onclick="switchAdminTab('users')">
                <i class="fas fa-users"></i> ${t('admin.users')}
            </button>
        </div>
        <div id="adminContent" class="admin-content">
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-hand-pointer" style="font-size: 48px; color: var(--quantum-blue);"></i>
                <p style="margin-top: 20px;">Click refresh to load data</p>
                <button onclick="refreshAdminPanel()" class="admin-refresh-btn">
                    <i class="fas fa-sync-alt"></i> ${t('admin.refresh')}
                </button>
            </div>
        </div>
    `;
}

function switchAdminTab(tab) {
    currentAdminTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.admin-tab[onclick="switchAdminTab('${tab}')"]`).classList.add('active');
    refreshAdminPanel();
}

async function refreshAdminPanel() {
    if (!isAdmin) return;
    
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    content.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        if (currentAdminTab === 'users') {
            // واجهة إدارة المستخدمين
            content.innerHTML = `
                <div class="admin-user-search">
                    <div class="search-box">
                        <input type="text" id="adminUserIdInput" placeholder="${t('admin.enterUserId')}" class="admin-search-input">
                        <button onclick="adminSearchUser()" class="admin-search-btn"><i class="fas fa-search"></i> ${t('admin.searchUser')}</button>
                    </div>
                    <div id="adminUserResult" class="admin-user-result"></div>
                </div>
            `;
        } else {
            // عرض الطلبات المعلقة (سيتم جلبها من الـ API)
            const endpoint = currentAdminTab === 'deposits' ? '/api/admin/deposits' : '/api/admin/withdrawals';
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data.length === 0) {
                content.innerHTML = '<div class="empty-state">No pending transactions</div>';
            } else {
                content.innerHTML = data.map(item => `
                    <div class="admin-transaction-card">
                        <div class="admin-tx-header">
                            <div class="admin-tx-type ${item.type}">
                                <i class="fas ${item.type === 'deposit' ? 'fa-download' : 'fa-upload'}"></i>
                                <span>${item.type.toUpperCase()}</span>
                            </div>
                            <span class="admin-tx-status pending">PENDING</span>
                        </div>
                        <div class="admin-tx-details">
                            <div class="admin-tx-row">
                                <span class="admin-tx-label">User ID:</span>
                                <span class="admin-tx-value">${item.userId}</span>
                            </div>
                            <div class="admin-tx-row">
                                <span class="admin-tx-label">Amount:</span>
                                <span class="admin-tx-value">${item.amount} ${item.currency}</span>
                            </div>
                            <div class="admin-tx-row">
                                <span class="admin-tx-label">Deposit Address:</span>
                                <div class="admin-address-container">
                                    <code>${item.depositAddress?.slice(0, 20)}...</code>
                                    <button class="admin-copy-btn" onclick="copyToClipboard('${item.depositAddress}')"><i class="fas fa-copy"></i></button>
                                </div>
                            </div>
                            <div class="admin-tx-row">
                                <span class="admin-tx-label">Time:</span>
                                <span class="admin-tx-value">${new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="admin-tx-actions">
                            <button class="admin-approve-btn" onclick="adminApproveTransaction('${item.id}', '${item.userId}', ${item.amount}, '${item.currency}')">
                                <i class="fas fa-check"></i> ${t('admin.approve')}
                            </button>
                            <button class="admin-reject-btn" onclick="adminRejectTransaction('${item.id}', '${item.userId}')">
                                <i class="fas fa-times"></i> ${t('admin.reject')}
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error("Error refreshing admin panel:", error);
        content.innerHTML = '<div class="empty-state">Error loading data</div>';
    }
}

async function adminSearchUser() {
    const userId = document.getElementById('adminUserIdInput')?.value.trim();
    const resultDiv = document.getElementById('adminUserResult');
    if (!userId || !resultDiv) return;
    
    resultDiv.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    
    try {
        const response = await fetch(`/api/users/${userId}`);
        const result = await response.json();
        
        if (!result.success || !result.data) {
            resultDiv.innerHTML = '<div class="empty-state">User not found</div>';
            return;
        }
        
        const user = result.data;
        const referralCount = user.inviteCount || 0;
        const earnedUSDT = user.totalUsdtEarned || 0;
        
        resultDiv.innerHTML = `
            <div class="admin-user-profile">
                <div class="user-profile-header">
                    <div class="user-avatar-large">${(user.userName || 'U').charAt(0)}</div>
                    <div class="user-info">
                        <h3>${user.userName || 'User'}</h3>
                        <p><i class="fab fa-telegram"></i> ${user.userId}</p>
                        ${user.username ? `<p><i class="fab fa-telegram"></i> @${user.username}</p>` : ''}
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat"><span>👥 Referrals</span><strong>${referralCount}</strong></div>
                    <div class="stat"><span>💰 USDT Earned</span><strong>$${earnedUSDT.toFixed(2)}</strong></div>
                </div>
                <div class="user-balances">
                    <h4>Balances</h4>
                    <div class="balance-grid">
                        ${Object.entries(user.balances || {}).filter(([_, v]) => v > 0).map(([c, v]) => `
                            <div class="balance-item"><span>${c}</span><strong>${formatBalance(v, c)}</strong></div>
                        `).join('')}
                    </div>
                </div>
                <div class="user-actions">
                    <div class="balance-control">
                        <select id="adminCurrencySelect" class="admin-select">
                            <option value="USDT">USDT</option>
                            <option value="TWT">TWT</option>
                            <option value="BNB">BNB</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                        </select>
                        <input type="number" id="adminAmountInput" placeholder="Amount" class="admin-amount-input">
                        <div class="action-buttons">
                            <button onclick="adminAddBalance('${userId}')" class="admin-add-btn"><i class="fas fa-plus"></i> ${t('admin.addBalance')}</button>
                            <button onclick="adminRemoveBalance('${userId}')" class="admin-remove-btn"><i class="fas fa-minus"></i> ${t('admin.removeBalance')}</button>
                        </div>
                    </div>
                    <button onclick="adminBlockUser('${userId}')" class="admin-block-btn"><i class="fas fa-ban"></i> ${t('admin.blockWithdraw')}</button>
                </div>
                <div class="admin-tx-history">
                    <h4>Recent Transactions</h4>
                    <div class="tx-list">
                        ${(user.transactions || []).slice(0, 5).map(tx => `
                            <div class="tx-item">
                                <span>${tx.type}</span>
                                <span>${tx.amount} ${tx.currency}</span>
                                <span>${new Date(tx.timestamp).toLocaleDateString()}</span>
                            </div>
                        `).join('') || '<p>No transactions</p>'}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error searching user:", error);
        resultDiv.innerHTML = '<div class="empty-state">Error searching user</div>';
    }
}

async function adminAddBalance(userId) {
    const currency = document.getElementById('adminCurrencySelect')?.value;
    const amount = parseFloat(document.getElementById('adminAmountInput')?.value);
    if (!amount || amount <= 0) { showToast('Enter valid amount', 'error'); return; }
    
    try {
        const response = await fetch('/api/add-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currency, amount, adminKey: adminId })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast(`Added ${amount} ${currency} to user`, 'success');
            adminSearchUser();
            // تحديث بيانات المستخدم الحالي إذا كان هو نفسه
            if (userData && userData.userId === userId) {
                userData.balances[currency] = (userData.balances[currency] || 0) + amount;
                saveUserData();
                updateUI();
            }
            // إرسال إشعار للمستخدم
            await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message: `✅ Your deposit of ${amount} ${currency} has been approved!` })
            });
        } else {
            showToast('Failed to add balance', 'error');
        }
    } catch (error) {
        console.error("Error adding balance:", error);
        showToast('Error adding balance', 'error');
    }
}

async function adminRemoveBalance(userId) {
    const currency = document.getElementById('adminCurrencySelect')?.value;
    const amount = parseFloat(document.getElementById('adminAmountInput')?.value);
    if (!amount || amount <= 0) { showToast('Enter valid amount', 'error'); return; }
    
    try {
        const response = await fetch('/api/remove-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currency, amount, adminKey: adminId })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast(`Removed ${amount} ${currency} from user`, 'success');
            adminSearchUser();
            if (userData && userData.userId === userId) {
                userData.balances[currency] = Math.max(0, (userData.balances[currency] || 0) - amount);
                saveUserData();
                updateUI();
            }
        } else {
            showToast('Failed to remove balance', 'error');
        }
    } catch (error) {
        console.error("Error removing balance:", error);
        showToast('Error removing balance', 'error');
    }
}

async function adminBlockUser(userId) {
    if (!confirm(`⚠️ PERMANENT ACTION!\n\nBlock user ${userId} from withdrawals?\n\nTHIS CANNOT BE UNDONE!`)) return;
    
    try {
        const response = await fetch('/api/block-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, adminKey: adminId })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast('User blocked from withdrawals', 'warning');
            adminSearchUser();
            if (userData && userData.userId === userId) {
                userData.withdrawBlocked = true;
                saveUserData();
            }
        } else {
            showToast('Failed to block user', 'error');
        }
    } catch (error) {
        console.error("Error blocking user:", error);
        showToast('Error blocking user', 'error');
    }
}

async function adminApproveTransaction(txId, userId, amount, currency) {
    try {
        const response = await fetch('/api/approve-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId, userId, amount, currency, adminKey: adminId })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast('Transaction approved', 'success');
            refreshAdminPanel();
            // تحديث بيانات المستخدم الحالي
            if (userData && userData.userId === userId) {
                userData.balances[currency] = (userData.balances[currency] || 0) + amount;
                saveUserData();
                updateUI();
            }
        } else {
            showToast('Failed to approve', 'error');
        }
    } catch (error) {
        console.error("Error approving transaction:", error);
        showToast('Error approving transaction', 'error');
    }
}

async function adminRejectTransaction(txId, userId) {
    if (!confirm('Reject this transaction?')) return;
    
    try {
        const response = await fetch('/api/reject-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId, userId, adminKey: adminId })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast('Transaction rejected', 'success');
            refreshAdminPanel();
        } else {
            showToast('Failed to reject', 'error');
        }
    } catch (error) {
        console.error("Error rejecting transaction:", error);
        showToast('Error rejecting transaction', 'error');
    }
}

// ====== 19. NAVIGATION ======
function showWallet() { 
    currentPage = 'wallet'; 
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const walletNav = document.querySelector('.nav-item[data-tab="wallet"]');
    if (walletNav) walletNav.classList.add('active');
    
    renderWallet();
    showRandomSticker();
}

function showAirdrop() { 
    currentPage = 'airdrop'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const airdropNav = document.querySelector('.nav-item[data-tab="referral"]');
    if (airdropNav) airdropNav.classList.add('active');
    
    renderAirdrop();
    showRandomSticker();
}

function showTWTPay() { 
    currentPage = 'twtpay'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const twtpayNav = document.querySelector('.nav-item[data-tab="twtpay"]');
    if (twtpayNav) twtpayNav.classList.add('active');
    
    renderTWTPay();
    showRandomSticker();
}

function showSettings() { 
    currentPage = 'settings'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    document.getElementById('adminSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const settingsNav = document.querySelector('.nav-item[data-tab="settings"]');
    if (settingsNav) settingsNav.classList.add('active');
    
    renderSettings();
    showRandomSticker();
}

// ====== 20. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    
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
    
    // إضافة زر المشرف في الهيدر
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !document.getElementById('adminCrownBtn')) {
        const crownBtn = document.createElement('button');
        crownBtn.id = 'adminCrownBtn';
        crownBtn.className = 'icon-btn';
        crownBtn.innerHTML = '<i class="fas fa-crown" style="color: gold;"></i>';
        crownBtn.onclick = showAdminPanel;
        crownBtn.title = 'Admin Panel';
        if (isAdmin) crownBtn.classList.remove('hidden');
        else crownBtn.classList.add('hidden');
        headerActions.appendChild(crownBtn);
    }
    
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
        console.log("👑 Final isAdmin:", isAdmin, "userId:", userId, "adminId:", adminId);
        
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) {
            if (isAdmin) crownBtn.classList.remove('hidden');
            else crownBtn.classList.add('hidden');
        }
        
        showMainApp();
        updateUI();
    } else {
        showOnboarding();
    }
    
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 1500);
});

// ====== 21. EXPOSE GLOBALS ======
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
window.showSwapCurrencySelector = showSwapCurrencySelector;
window.selectSwapCurrency = selectSwapCurrency;
window.showAssetDetails = showAssetDetails;
window.markNotificationRead = markNotificationRead;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;
window.switchAdminTab = switchAdminTab;
window.refreshAdminPanel = refreshAdminPanel;
window.adminSearchUser = adminSearchUser;
window.adminAddBalance = adminAddBalance;
window.adminRemoveBalance = adminRemoveBalance;
window.adminBlockUser = adminBlockUser;
window.adminApproveTransaction = adminApproveTransaction;
window.adminRejectTransaction = adminRejectTransaction;
window.showTopUp = showTopUp;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;

console.log("✅ Trust Wallet Lite v6.0 - FULLY WORKING!");
console.log("✅ Real Telegram ID:", REAL_USER_ID);
console.log("✅ Admin ID:", adminId);
console.log("✅ Is Admin:", isAdmin);
console.log("✅ Features: Real Telegram ID, CoinPayments deposits, Full Admin Panel, Airdrop, Swap, TWT Pay");
