// ============================================================================
// TRUST WALLET LITE - ULTIMATE PROFESSIONAL VERSION 3.2
// ============================================================================
// Features: CoinPayments API - Unique Deposit Addresses per User
//           Deposit without TXID - Admin adds balance manually
//           Search by Wallet Address in Admin Panel
//           12 Cryptocurrencies | 8 Referral Milestones | TWT Pay Card
//           Swap DEX (0.3% fee) | Withdraw | Admin Panel
//           Zero Waste Architecture | Dark/Light Mode | RTL Support
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
    databaseURL: "{{FIREBASE_DATABASE_URL}}",
    projectId: "{{FIREBASE_PROJECT_ID}}",
    storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
    messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
    appId: "{{FIREBASE_APP_ID}}"
};

let db;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("🔥 Firebase initialized");
    }
} catch (error) {
    console.error("Firebase error:", error);
}

// ====== 3. COINPAYMENTS API CONFIGURATION ======
const COINPAYMENTS_API_KEY = "{{COINPAYMENTS_API_KEY}}";
const COINPAYMENTS_API_SECRET = "{{COINPAYMENTS_API_SECRET}}";
const COINPAYMENTS_IPN_URL = "https://your-app.onrender.com/api/ipn";

async function coinPaymentsRequest(cmd, req = {}) {
    const formData = new URLSearchParams();
    formData.append('cmd', cmd);
    formData.append('key', COINPAYMENTS_API_KEY);
    formData.append('version', '1');
    Object.keys(req).forEach(k => formData.append(k, req[k]));

    const response = await fetch('https://www.coinpayments.net/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    });
    const data = await response.json();
    if (data.error !== 'ok') throw new Error(data.error);
    return data.result;
}

async function generateDepositAddress(userId, currency) {
    const cacheKey = `deposit_addr_${userId}_${currency}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;

    if (db && userData && userData.depositAddresses && userData.depositAddresses[currency]) {
        const address = userData.depositAddresses[currency];
        localStorage.setItem(cacheKey, address);
        return address;
    }

    try {
        const result = await coinPaymentsRequest('get_callback_address', {
            currency: currency,
            ipn_url: `${COINPAYMENTS_IPN_URL}/${userId}`,
            label: `twt_${userId}_${currency}`
        });
        const address = result.address;
        localStorage.setItem(cacheKey, address);
        if (db && userData) {
            if (!userData.depositAddresses) userData.depositAddresses = {};
            userData.depositAddresses[currency] = address;
            await db.collection('users').doc(userId).update({
                depositAddresses: userData.depositAddresses
            });
            saveUserData();
        }
        console.log(`✅ Generated CoinPayments address for ${userId} - ${currency}: ${address}`);
        return address;
    } catch (error) {
        console.error("CoinPayments error:", error);
        const mockAddress = `0x${userId.slice(-40).padStart(40, '0')}`;
        localStorage.setItem(cacheKey, mockAddress);
        return mockAddress;
    }
}

// ====== 4. TRANSLATION SYSTEM (i18n) ======
const translations = {
    en: {
        'app.name': 'Trust Wallet Lite',
        'nav.wallet': 'Wallet', 'nav.swap': 'Swap', 'nav.referral': 'Referral',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.send': 'Send', 'actions.receive': 'Receive', 'actions.swap': 'Swap',
        'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw', 'actions.history': 'History',
        'actions.copy': 'Copy', 'wallet.totalBalance': 'Total Balance',
        'swap.from': 'From', 'swap.to': 'To', 'swap.exchangeRate': 'Exchange Rate',
        'swap.swapperFee': 'Swapper fee', 'swap.provider': 'Provider',
        'referral.totalReferrals': 'TOTAL REFERRALS', 'referral.twtEarned': 'TWT EARNED',
        'referral.usdtEarned': 'USDT EARNED', 'referral.yourLink': 'Your Referral Link',
        'referral.milestones': 'Referral Milestones',
        'deposit.title': 'Deposit Funds', 'deposit.selectCurrency': 'Select Currency',
        'deposit.amount': 'Amount', 'deposit.sendTo': 'Send to this address:',
        'deposit.confirmation': '✓ Send funds to this address. Admin will add balance manually.',
        'deposit.submit': 'Copy Address',
        'withdraw.title': 'Withdraw Funds', 'withdraw.selectCurrency': 'Select Currency',
        'withdraw.amount': 'Amount', 'withdraw.address': 'Wallet Address',
        'withdraw.networkFee': 'Network fee:', 'withdraw.submit': 'Submit Withdrawal',
        'history.title': 'Transaction History', 'history.all': 'All',
        'history.deposits': 'Deposits', 'history.withdrawals': 'Withdrawals',
        'history.swaps': 'Swaps', 'history.referrals': 'Referrals',
        'notifications.title': 'Notifications', 'currency.select': 'Select Currency',
        'settings.language': 'Language', 'settings.theme': 'Theme',
        'settings.recovery': 'Recovery Phrase', 'settings.logout': 'Logout',
        'messages.success': 'Success', 'messages.error': 'Error',
        'notif.welcomeBonus': '🎉 Welcome! You got 10 TWT bonus!',
        'notif.referralBonus': '🎉 Someone joined! You got 25 TWT!',
        'notif.balanceAdded': '✅ Admin added {amount} {currency} to your balance!',
        'error.insufficientBalance': 'Insufficient {currency} balance',
        'error.enterAmount': 'Please enter a valid amount',
        'success.withdrawSubmitted': '✅ Withdrawal request submitted for {amount} {currency}!',
        'success.swapCompleted': '✅ Swapped {fromAmount} {fromCurrency} to {toAmount} {toCurrency}',
        'success.referralCopied': '✅ Referral link copied!',
        'success.addressCopied': '✅ Address copied!',
        'notifications.clear_read': 'Clear Read', 'notifications.clear_all': 'Clear All',
        'notifications.no_notifications': 'No notifications'
    },
    ar: {
        'app.name': 'Trust Wallet Lite',
        'nav.wallet': 'المحفظة', 'nav.swap': 'تحويل', 'nav.referral': 'إحالة',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.send': 'إرسال', 'actions.receive': 'استلام', 'actions.swap': 'تحويل',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب', 'actions.history': 'السجل',
        'actions.copy': 'نسخ', 'wallet.totalBalance': 'الرصيد الإجمالي',
        'swap.from': 'من', 'swap.to': 'إلى', 'swap.exchangeRate': 'سعر الصرف',
        'swap.swapperFee': 'رسوم التحويل', 'swap.provider': 'المزود',
        'referral.totalReferrals': 'إجمالي الإحالات', 'referral.twtEarned': 'TWT المكتسبة',
        'referral.usdtEarned': 'USDT المكتسبة', 'referral.yourLink': 'رابط الإحالة',
        'referral.milestones': 'مراحل الإحالة',
        'deposit.title': 'إيداع الأموال', 'deposit.selectCurrency': 'اختر العملة',
        'deposit.amount': 'المبلغ', 'deposit.sendTo': 'أرسل إلى هذا العنوان:',
        'deposit.confirmation': '✓ أرسل الأموال إلى هذا العنوان. سيقوم المشرف بإضافة الرصيد يدوياً.',
        'deposit.submit': 'نسخ العنوان',
        'withdraw.title': 'سحب الأموال', 'withdraw.selectCurrency': 'اختر العملة',
        'withdraw.amount': 'المبلغ', 'withdraw.address': 'عنوان المحفظة',
        'withdraw.networkFee': 'رسوم الشبكة:', 'withdraw.submit': 'تقديم السحب',
        'history.title': 'سجل المعاملات', 'history.all': 'الكل',
        'history.deposits': 'إيداعات', 'history.withdrawals': 'سحوبات',
        'history.swaps': 'تحويلات', 'history.referrals': 'إحالات',
        'notifications.title': 'الإشعارات', 'currency.select': 'اختر العملة',
        'settings.language': 'اللغة', 'settings.theme': 'المظهر',
        'settings.recovery': 'عبارة الاسترداد', 'settings.logout': 'تسجيل الخروج',
        'messages.success': 'نجاح', 'messages.error': 'خطأ',
        'notif.welcomeBonus': '🎉 مرحباً! حصلت على 10 TWT!',
        'notif.referralBonus': '🎉 شخص انضم عبر رابطك! حصلت على 25 TWT!',
        'notif.balanceAdded': '✅ أضاف المشرف {amount} {currency} إلى رصيدك!',
        'error.insufficientBalance': 'رصيد {currency} غير كافٍ',
        'error.enterAmount': 'الرجاء إدخال مبلغ صحيح',
        'success.withdrawSubmitted': '✅ تم تقديم طلب السحب بمبلغ {amount} {currency}!',
        'success.swapCompleted': '✅ تم تحويل {fromAmount} {fromCurrency} إلى {toAmount} {toCurrency}',
        'success.referralCopied': '✅ تم نسخ رابط الإحالة!',
        'success.addressCopied': '✅ تم نسخ العنوان!',
        'notifications.clear_read': 'حذف المقروء', 'notifications.clear_all': 'حذف الكل',
        'notifications.no_notifications': 'لا توجد إشعارات'
    }
};

let currentLanguage = localStorage.getItem('preferred_language') || 'en';

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
    showToast(t('messages.success'), 'success');
}

function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

// ====== 5. DARK/LIGHT MODE SYSTEM ======
let currentTheme = localStorage.getItem('theme') || 'light';

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    showToast(`${currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode`, 'success');
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('#themeBtn i');
    if (themeIcon) themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ====== 6. COINMARKETCAP ICONS (12 Cryptocurrencies) ======
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

// ====== 7. CONSTANTS & CONFIGURATION ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const ADMIN_ID = "{{ADMIN_ID}}";
const REFERRAL_BONUS = 25;
const WELCOME_BONUS = 10;
const SWAP_FEE_PERCENT = 0.003;
let TWT_PRICE = 1.25;

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

const CRYPTO_IDS = {
    TWT: 'trust-wallet-token', USDT: 'tether', BNB: 'binancecoin',
    BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', TRX: 'tron',
    ADA: 'cardano', DOGE: 'dogecoin', SHIB: 'shiba-inu',
    PEPE: 'pepe', TON: 'the-open-network'
};

const DEPOSIT_MINIMUMS = {
    TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
    SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000,
    PEPE: 5000000, TON: 1
};

const WITHDRAW_FEES = {
    TWT: 1, USDT: 0.16, BNB: 0.0005, BTC: 0.0002, ETH: 0.001,
    SOL: 0.005, TRX: 1, ADA: 0.5, DOGE: 1, SHIB: 50000,
    PEPE: 500000, TON: 0.1
};

const WITHDRAW_MINIMUMS = {
    TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
    SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000,
    PEPE: 5000000, TON: 1
};

// ====== 8. REFERRAL MILESTONES (8 Levels) ======
const REFERRAL_MILESTONES = [
    { referrals: 5, reward: 25, unit: 'TWT', icon: 'fa-star' },
    { referrals: 10, reward: 50, unit: 'TWT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'TWT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'TWT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'TWT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'TWT', icon: 'fa-gem' },
    { referrals: 500, reward: 2500, unit: 'TWT', icon: 'fa-gem' },
    { referrals: 1000, reward: 5000, unit: 'TWT', icon: 'fa-diamond' }
];

// ====== 9. STATE MANAGEMENT ======
let userData = null;
let livePrices = {};
let unreadNotifications = 0;
let currentCurrencySelector = null;
let currentHistoryFilter = 'all';
let currentPage = 'wallet';
let appInitialized = false;

let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;
let lastHistoryCheckTime = 0;
const USER_CACHE_TIME = 300000;
const PRICES_CACHE_TIME = 10800000;
const HISTORY_CACHE_TIME = 600000;

// ====== 10. STICKER SYSTEM ======
const WELCOME_STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '✨', '🌟', '⭐', '🔥', '⚡', '💎', '🔔', '🎁', '🎈', '🎉', '🎊', '👑', '🚀', '💫'];
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

// ====== 11. USER IDENTIFICATION ======
const userId = tg?.initDataUnsafe?.user?.id?.toString() || localStorage.getItem('twt_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('twt_user_id', userId);

function generateReferralCode() {
    return userId.slice(-8).toUpperCase();
}

function getReferralLink() {
    return `${BOT_LINK}?startapp=${userData.referralCode}`;
}

function hasReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return !!(urlParams.get('startapp') || urlParams.get('ref') || tg?.initDataUnsafe?.start_param);
}

// ====== 12. ADMIN SYSTEM ======
let isAdmin = userId === ADMIN_ID;

function checkAdminAndAddCrown() {
    if (!isAdmin) return;
    const addCrown = () => {
        const header = document.querySelector('.header-actions');
        if (!header) return false;
        const existingCrown = document.getElementById('adminCrownBtn');
        if (existingCrown) existingCrown.remove();
        const adminBtn = document.createElement('button');
        adminBtn.id = 'adminCrownBtn';
        adminBtn.className = 'icon-btn';
        adminBtn.innerHTML = '<i class="fa-solid fa-crown" style="color: gold;"></i>';
        adminBtn.onclick = showAdminPanel;
        adminBtn.title = 'Admin Panel';
        const notifBtn = document.getElementById('notificationBtn');
        if (notifBtn) header.insertBefore(adminBtn, notifBtn);
        else header.appendChild(adminBtn);
        return true;
    };
    if (!addCrown()) setTimeout(addCrown, 500);
}

// ====== 13. TRANSACTIONS STORAGE ======
const TRANSACTIONS_KEY = `transactions_${userId}`;

function loadLocalTransactions() {
    try {
        const saved = localStorage.getItem(TRANSACTIONS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        return [];
    }
}

function saveLocalTransactions(transactions) {
    try {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {}
}

function addTransaction(transaction) {
    try {
        const allTransactions = loadLocalTransactions();
        const exists = allTransactions.some(t => (t.firebaseId && t.firebaseId === transaction.firebaseId) || (t.timestamp === transaction.timestamp && t.type === transaction.type && t.amount === transaction.amount));
        if (exists) return;
        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift(transaction);
        allTransactions.unshift(transaction);
        saveLocalTransactions(allTransactions);
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        if (currentPage === 'history' || document.getElementById('historyModal')?.classList.contains('show')) renderHistory(currentHistoryFilter);
    } catch (error) {
        console.error("Error adding transaction:", error);
    }
}

// ====== 14. ON-DEMAND LISTENERS SYSTEM ======
let activeListeners = new Map();
let listenerTimeouts = new Map();

function startOnDemandListener(collection, docId, callback, timeoutMs = 30000) {
    if (!db) return;
    const listenerId = `${collection}_${docId}`;
    if (activeListeners.has(listenerId)) {
        activeListeners.get(listenerId)();
        activeListeners.delete(listenerId);
    }
    if (listenerTimeouts.has(listenerId)) {
        clearTimeout(listenerTimeouts.get(listenerId));
        listenerTimeouts.delete(listenerId);
    }
    const unsubscribe = db.collection(collection).doc(docId).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            callback(data);
            if (data.status === 'approved' || data.status === 'rejected') {
                stopOnDemandListener(listenerId);
            }
        }
    }, (error) => {
        stopOnDemandListener(listenerId);
    });
    activeListeners.set(listenerId, unsubscribe);
    const timeout = setTimeout(() => {
        stopOnDemandListener(listenerId);
    }, timeoutMs);
    listenerTimeouts.set(listenerId, timeout);
}

function stopOnDemandListener(listenerId) {
    if (activeListeners.has(listenerId)) {
        activeListeners.get(listenerId)();
        activeListeners.delete(listenerId);
    }
    if (listenerTimeouts.has(listenerId)) {
        clearTimeout(listenerTimeouts.get(listenerId));
        listenerTimeouts.delete(listenerId);
    }
}

function stopAllListeners() {
    activeListeners.forEach((unsubscribe) => unsubscribe());
    listenerTimeouts.forEach((timeout) => clearTimeout(timeout));
    activeListeners.clear();
    listenerTimeouts.clear();
}

// ====== 15. LOAD USER DATA ======
async function loadUserData(force = false) {
    try {
        const now = Date.now();
        const localData = localStorage.getItem(`user_${userId}`);
        if (!force && localData && (now - lastUserLoadTime) < USER_CACHE_TIME) {
            userData = JSON.parse(localData);
            updateUI();
            updateNotificationBadge();
            checkAdminAndAddCrown();
            return;
        }
        if (localData) userData = JSON.parse(localData);
        if (db) {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const fbData = userDoc.data();
                userData = { ...userData, ...fbData, balances: { ...userData?.balances, ...fbData.balances }, notifications: mergeNotifications(userData?.notifications || [], fbData.notifications || []) };
            } else if (!userData) {
                userData = {
                    userId: userId,
                    userName: 'User',
                    balances: { TWT: WELCOME_BONUS, USDT: 0, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
                    referralCode: generateReferralCode(),
                    referredBy: null,
                    referrals: [],
                    referralCount: 0,
                    referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
                    notifications: [],
                    withdrawalRequests: [],
                    transactions: [],
                    depositAddresses: {},
                    totalTwtEarned: WELCOME_BONUS,
                    totalUsdtEarned: 0,
                    withdrawBlocked: false,
                    createdAt: new Date().toISOString()
                };
                await db.collection('users').doc(userId).set(userData);
            }
            lastUserLoadTime = now;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        }
        userData.transactions = loadLocalTransactions();
        updateUI();
        if (hasReferralCode()) await processReferral();
        updateNotificationBadge();
        checkAdminAndAddCrown();
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

function mergeNotifications(local, firebase) {
    const map = new Map();
    local.forEach(n => map.set(n.id, n));
    firebase.forEach(fb => {
        const localNotif = map.get(fb.id);
        if (localNotif) map.set(fb.id, { ...fb, read: localNotif.read });
        else map.set(fb.id, fb);
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function saveUserData() {
    if (userData) localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
}

// ====== 16. REFERRAL SYSTEM ======
async function processReferral() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let referralCode = urlParams.get('start') || urlParams.get('ref');
        if (!referralCode && tg?.initDataUnsafe?.start_param) referralCode = tg.initDataUnsafe.start_param;
        if (!referralCode || !userData || referralCode === userData.referralCode || userData.referredBy) return;
        const pendingKey = `processed_referral_${userId}`;
        if (localStorage.getItem(pendingKey) === referralCode) return;
        const referrerId = referralCode;
        if (!referrerId || referrerId === userId) return;
        if (!db) { localStorage.setItem('pending_referral', referralCode); return; }
        const referrerDoc = await db.collection('users').doc(referrerId).get();
        if (!referrerDoc.exists) return;
        const referrerData = referrerDoc.data();
        if (referrerData.referrals && referrerData.referrals.includes(userId)) return;
        await db.collection('users').doc(referrerId).update({
            referrals: [...(referrerData.referrals || []), userId],
            referralCount: (referrerData.referralCount || 0) + 1,
            'balances.TWT': (referrerData.balances?.TWT || 0) + REFERRAL_BONUS,
            totalTwtEarned: (referrerData.totalTwtEarned || 0) + REFERRAL_BONUS,
            lastReferralAt: new Date().toISOString()
        });
        userData.referredBy = referralCode;
        userData.balances.TWT = (userData.balances.TWT || 0) + WELCOME_BONUS;
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        localStorage.setItem(pendingKey, referralCode);
        await db.collection('users').doc(userId).update({
            referredBy: referralCode,
            'balances.TWT': userData.balances.TWT,
            referredAt: new Date().toISOString()
        });
        addTransaction({ type: 'referral_bonus', amount: WELCOME_BONUS, currency: 'TWT', details: 'Welcome bonus from referral' });
        addNotification(referrerId, t('notif.referralBonus', { amount: REFERRAL_BONUS }), 'success');
        addNotification(userId, t('notif.welcomeBonus'), 'success');
        updateUI();
        if (currentPage === 'referral') {
            updateReferralStats();
            renderReferralMilestones();
        }
    } catch (error) {
        console.error("Error processing referral:", error);
    }
}

function copyReferralLink() {
    navigator.clipboard.writeText(getReferralLink());
    showToast(t('success.referralCopied'), 'success');
}

function shareReferral() {
    const text = `🚀 Join Trust Wallet Lite and get ${WELCOME_BONUS} TWT bonus! Use my link: ${getReferralLink()}`;
    if (tg?.shareToStory) tg.shareToStory(text);
    else navigator.clipboard.writeText(text);
    showToast(t('success.referralCopied'), 'success');
}

// ====== 17. ADD NOTIFICATION ======
async function addNotification(targetUserId, message, type = 'info') {
    if (!db) return;
    const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        message: message,
        type: type,
        read: false,
        timestamp: new Date().toISOString()
    };
    try {
        await db.collection('users').doc(targetUserId).update({
            notifications: firebase.firestore.FieldValue.arrayUnion(notification)
        });
        if (targetUserId === userData?.userId) {
            if (!userData.notifications) userData.notifications = [];
            userData.notifications.push(notification);
            updateNotificationBadge();
            showToast(message, type);
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        }
    } catch (error) {
        console.error("Error adding notification:", error);
    }
}

// ====== 18. PRICES (Zero Waste - 3 Hours Cache) ======
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
            if (data[id]) livePrices[symbol] = { price: data[id].usd, change: data[id].usd_24h_change || 0 };
        }
        if (!livePrices.TWT) livePrices.TWT = { price: 1.25, change: 0 };
        TWT_PRICE = livePrices.TWT.price;
        lastPricesLoadTime = now;
        localStorage.setItem('live_prices', JSON.stringify({ prices: livePrices, timestamp: now }));
        updatePrices();
    } catch (error) {
        console.error("Error fetching prices:", error);
    }
}

function updatePrices() {
    renderAssets();
    updateTotalBalance();
}

function refreshPrices() {
    fetchLivePrices(true);
    showToast(t('messages.success'), 'success');
}

// ====== 19. UTILITY FUNCTIONS ======
function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (['BNB', 'ETH', 'SOL', 'TRX', 'ADA', 'TON'].includes(symbol)) return balance.toFixed(4) + ' ' + symbol;
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    if (['DOGE', 'SHIB', 'PEPE'].includes(symbol)) return balance.toLocaleString() + ' ' + symbol;
    return balance.toString();
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    if (num < 0.0001) return num.toFixed(8);
    if (num < 0.01) return num.toFixed(6);
    return num.toFixed(2);
}

function updateTotalBalance() {
    if (!userData) return;
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * TWT_PRICE;
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 600);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 65000);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 3400);
    total += (userData.balances.SOL || 0) * (livePrices.SOL?.price || 150);
    total += (userData.balances.TRX || 0) * (livePrices.TRX?.price || 0.25);
    total += (userData.balances.ADA || 0) * (livePrices.ADA?.price || 0.45);
    total += (userData.balances.DOGE || 0) * (livePrices.DOGE?.price || 0.15);
    total += (userData.balances.SHIB || 0) * (livePrices.SHIB?.price || 0.000025);
    total += (userData.balances.PEPE || 0) * (livePrices.PEPE?.price || 0.000015);
    total += (userData.balances.TON || 0) * (livePrices.TON?.price || 5.5);
    document.getElementById('totalBalance').textContent = '$' + total.toFixed(2);
}

function updateUI() {
    renderAssets();
    updateTotalBalance();
    updateReferralStats();
    updateSwapBalances();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        unreadNotifications = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unreadNotifications;
        badge.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

function animateElement(selector, animationClass) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add(animationClass);
        setTimeout(() => element.classList.remove(animationClass), 500);
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    const icon = toast.querySelector('i');
    if (type === 'success') icon.className = 'fa-regular fa-circle-check';
    else if (type === 'error') icon.className = 'fa-regular fa-circle-xmark';
    else icon.className = 'fa-regular fa-circle-info';
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function scrollToTop() {
    document.querySelector('.app-container')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupScrollListener() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    const container = document.querySelector('.app-container');
    if (!scrollBtn || !container) return;
    container.addEventListener('scroll', () => {
        if (container.scrollTop > 300) scrollBtn.classList.add('show');
        else scrollBtn.classList.remove('show');
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    if (modalId === 'historyModal') currentPage = 'wallet';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast(t('success.addressCopied'), 'success');
}

// ====== 20. RENDER FUNCTIONS ======
function renderAssets() {
    const assetsList = document.getElementById('assetsList');
    if (!assetsList || !userData) return;
    assetsList.innerHTML = ALL_ASSETS.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        let price = 0;
        if (asset.symbol === 'TWT') price = TWT_PRICE;
        else price = livePrices[asset.symbol]?.price || 0;
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

// ====== 21. HISTORY FUNCTIONS ======
function renderHistory(filter = 'all') {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    currentHistoryFilter = filter;
    let transactions = loadLocalTransactions();
    if (filter !== 'all') transactions = transactions.filter(tx => tx.type === filter);
    if (transactions.length === 0) {
        historyList.innerHTML = `<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p></div>`;
        return;
    }
    historyList.innerHTML = transactions.map(tx => {
        const date = new Date(tx.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let icon = 'fa-circle-down', typeClass = 'deposit', typeText = 'Deposit';
        if (tx.type === 'withdraw') { icon = 'fa-circle-up'; typeClass = 'withdraw'; typeText = 'Withdrawal'; }
        else if (tx.type === 'swap') { icon = 'fa-arrow-right-arrow-left'; typeClass = 'swap'; typeText = 'Swap'; }
        else if (tx.type === 'referral_bonus') { icon = 'fa-users'; typeClass = 'referral'; typeText = 'Referral'; }
        let statusClass = 'completed', statusText = 'Completed';
        if (tx.status === 'pending') { statusClass = 'pending'; statusText = 'Pending'; }
        else if (tx.status === 'rejected') { statusClass = 'rejected'; statusText = 'Rejected'; }
        return `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-type ${typeClass}"><i class="fa-regular ${icon}"></i><span>${typeText}</span></div>
                    <span class="history-status ${statusClass}">${statusText}</span>
                </div>
                <div class="history-details">
                    <span class="history-amount">${tx.amount} ${tx.currency}</span>
                    <span class="history-date">${formattedDate}</span>
                </div>
                ${tx.details ? `<div style="font-size: 11px; margin-top: 5px;">${tx.details}</div>` : ''}
            </div>
        `;
    }).join('');
}

function filterHistory(filter) {
    document.querySelectorAll('.history-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    renderHistory(filter);
}

function showHistory() {
    currentPage = 'history';
    const modal = document.getElementById('historyModal');
    const header = modal.querySelector('.modal-header');
    let refreshBtn = header.querySelector('.refresh-history-btn');
    if (!refreshBtn) {
        refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-history-btn';
        refreshBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
        refreshBtn.onclick = function(e) {
            e.preventDefault();
            this.querySelector('i').classList.add('fa-spin');
            lastHistoryCheckTime = 0;
            // Check pending withdrawals only (deposits are manual)
            checkPendingWithdrawals().finally(() => {
                setTimeout(() => this.querySelector('i').classList.remove('fa-spin'), 1000);
            });
        };
        refreshBtn.style.marginLeft = '10px';
        refreshBtn.style.background = 'transparent';
        refreshBtn.style.border = 'none';
        refreshBtn.style.color = 'var(--primary)';
        refreshBtn.style.fontSize = '16px';
        refreshBtn.style.cursor = 'pointer';
        header.appendChild(refreshBtn);
    }
    modal.classList.add('show');
    checkPendingWithdrawals();
    renderHistory('all');
}

// ====== 22. PENDING WITHDRAWALS CHECKER ======
async function checkPendingWithdrawals() {
    if (!db || !userData) return;
    const now = Date.now();
    if (now - lastHistoryCheckTime < HISTORY_CACHE_TIME) return;
    lastHistoryCheckTime = now;
    const localTransactions = loadLocalTransactions();
    const pendingTxs = localTransactions.filter(tx => 
        tx.type === 'withdraw' && tx.status === 'pending' && tx.firebaseId && !tx.firebaseId.startsWith('temp_')
    );
    if (pendingTxs.length === 0) return;
    let updated = false;
    for (const tx of pendingTxs) {
        try {
            const docRef = db.collection('withdrawals').doc(tx.firebaseId);
            const docSnap = await docRef.get();
            if (!docSnap.exists) continue;
            const data = docSnap.data();
            if (data.status !== tx.status) {
                const allTxs = loadLocalTransactions();
                const index = allTxs.findIndex(t => t.firebaseId === tx.firebaseId);
                if (index !== -1) {
                    allTxs[index] = { ...allTxs[index], ...data, status: data.status };
                    saveLocalTransactions(allTxs);
                    if (userData.transactions) {
                        const userIndex = userData.transactions.findIndex(t => t.firebaseId === tx.firebaseId);
                        if (userIndex !== -1) userData.transactions[userIndex] = { ...userData.transactions[userIndex], ...data, status: data.status };
                    }
                    if (data.status === 'approved') {
                        showToast(`✅ Your withdrawal of ${tx.amount} ${tx.currency} has been approved!`, 'success');
                    }
                    if (data.status === 'rejected') {
                        userData.balances[tx.currency] = (userData.balances[tx.currency] || 0) + tx.amount + (tx.fee || 0);
                        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                        showToast(`❌ Your withdrawal was rejected: ${data.reason || 'Unknown reason'}`, 'error');
                        updateUI();
                    }
                    updated = true;
                }
            }
        } catch (error) {
            console.error(`Error checking withdrawal:`, error);
        }
    }
    if (updated) {
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        if (currentPage === 'history' || document.getElementById('historyModal')?.classList.contains('show')) renderHistory(currentHistoryFilter);
        updateUI();
        showToast('✅ Withdrawal status updated!', 'success');
    }
}

// ====== 23. NOTIFICATIONS FUNCTIONS ======
function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container || !userData) return;
    const notifications = userData.notifications || [];
    const controls = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button onclick="clearReadNotifications()" class="btn-secondary" style="flex:1;">${t('notifications.clear_read')}</button>
            <button onclick="clearAllNotifications()" class="btn-secondary" style="flex:1; border-color: var(--danger); color: var(--danger);">${t('notifications.clear_all')}</button>
        </div>
    `;
    if (notifications.length === 0) {
        container.innerHTML = controls + `<div class="empty-state"><i class="fa-regular fa-bell-slash"></i><p>${t('notifications.no_notifications')}</p></div>`;
        return;
    }
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    container.innerHTML = controls + notifications.map(notif => {
        let date = notif.timestamp?.toDate ? notif.timestamp.toDate() : new Date(notif.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const unreadClass = notif.read ? '' : 'unread';
        let icon = 'fa-bell';
        if (notif.type === 'success') icon = 'fa-circle-check';
        if (notif.type === 'error') icon = 'fa-circle-xmark';
        return `
            <div class="notification-item ${unreadClass}" onclick="markNotificationRead('${notif.id}')">
                <div class="notification-header">
                    <span class="notification-title"><i class="fa-regular ${icon}"></i> ${t('notifications.title')}</span>
                    <span class="notification-time">${formattedDate}</span>
                </div>
                <div class="notification-message">${notif.message}</div>
            </div>
        `;
    }).join('');
}

async function markNotificationRead(notificationId) {
    const notification = userData.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        unreadNotifications--;
        updateNotificationBadge();
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        if (db) await db.collection('users').doc(userId).update({ notifications: userData.notifications });
        renderNotifications();
    }
}

function clearReadNotifications() {
    if (!userData.notifications?.length) { showToast(t('notifications.no_notifications'), 'info'); return; }
    const readCount = userData.notifications.filter(n => n.read).length;
    if (readCount === 0) { showToast(t('notifications.no_read'), 'info'); return; }
    if (confirm(t('notifications.confirm_clear_read', { count: readCount, unread: userData.notifications.filter(n => !n.read).length }))) {
        userData.notifications = userData.notifications.filter(n => !n.read);
        unreadNotifications = userData.notifications.length;
        updateNotificationBadge();
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        if (db) db.collection('users').doc(userId).update({ notifications: userData.notifications });
        renderNotifications();
        showToast(t('notifications.cleared', { count: readCount }), 'success');
    }
}

function clearAllNotifications() {
    if (!userData.notifications?.length) { showToast(t('notifications.no_notifications'), 'info'); return; }
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    if (unreadCount > 0 && !confirm(t('notifications.confirm_clear_all_unread', { count: unreadCount }))) return;
    if (unreadCount === 0 && !confirm(t('notifications.confirm_clear_all'))) return;
    userData.notifications = [];
    unreadNotifications = 0;
    updateNotificationBadge();
    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    if (db) db.collection('users').doc(userId).update({ notifications: [] });
    renderNotifications();
    showToast(t('notifications.cleared', { count: 'all' }), 'success');
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.classList.add('show');
        renderNotifications();
    }
}

function fixNotificationButton() {
    const notifBtn = document.getElementById('notificationBtn');
    if (notifBtn) {
        const newBtn = notifBtn.cloneNode(true);
        notifBtn.parentNode?.replaceChild(newBtn, notifBtn);
        newBtn.addEventListener('click', () => showNotifications());
    } else {
        setTimeout(fixNotificationButton, 1000);
    }
}

// ====== 24. NAVIGATION FUNCTIONS ======
function showWallet() {
    currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item:nth-child(1)').classList.add('active');
    renderAssets();
    updateTotalBalance();
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
    document.querySelector('.nav-item:nth-child(2)').classList.add('active');
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
    document.querySelector('.nav-item:nth-child(3)').classList.add('active');
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
    document.querySelector('.nav-item:nth-child(4)').classList.add('active');
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
    document.querySelector('.nav-item:nth-child(5)').classList.add('active');
    renderSettings();
    showRandomSticker();
}

// ====== 25. SWAP FUNCTIONS ======
function renderSwap() {
    const container = document.getElementById('swapContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="swap-container">
            <div class="swap-card">
                <div class="swap-label">${t('swap.from')}</div>
                <div class="swap-input-card">
                    <div class="swap-header">
                        <span class="balance-text" id="payBalance">Balance: 0 TWT</span>
                        <div class="currency-selector" onclick="showCurrencySelector('pay')">
                            <img src="${getCurrencyIcon('TWT')}" class="currency-icon" id="payCurrencyIcon">
                            <span id="payCurrency">TWT</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="swap-input-group">
                        <input type="number" id="payAmount" placeholder="0" value="1" oninput="calculateSwap()">
                    </div>
                </div>
                <div class="swap-actions">
                    <button class="swap-action-btn" onclick="swapDirection('down')"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="swap-action-btn" onclick="swapDirection('up')"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="swap-action-btn max-btn" onclick="setMaxAmount()">MAX</button>
                </div>
                <div class="swap-label">${t('swap.to')}</div>
                <div class="swap-input-card">
                    <div class="swap-header">
                        <span class="balance-text" id="receiveBalance">Balance: 0 USDT</span>
                        <div class="currency-selector" onclick="showCurrencySelector('receive')">
                            <img src="${getCurrencyIcon('USDT')}" class="currency-icon" id="receiveCurrencyIcon">
                            <span id="receiveCurrency">USDT</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="swap-input-group">
                        <input type="number" id="receiveAmount" placeholder="0" readonly>
                    </div>
                </div>
                <div class="swap-info">
                    <div class="info-row"><span>${t('swap.exchangeRate')}</span><span id="swapRate">1 TWT ≈ $${TWT_PRICE.toFixed(4)}</span></div>
                    <div class="info-row"><span>${t('swap.swapperFee')}</span><span id="swapFee">$0.00</span></div>
                </div>
                <button class="confirm-btn" onclick="confirmSwap()"><i class="fa-regular fa-circle-check"></i> ${t('actions.confirmSwap')}</button>
            </div>
        </div>
    `;
    updateSwapBalances();
    calculateSwap();
}

function updateSwapBalances() {
    if (!userData) return;
    const payCurrency = document.getElementById('payCurrency').textContent;
    const receiveCurrency = document.getElementById('receiveCurrency').textContent;
    document.getElementById('payBalance').textContent = `Balance: ${formatBalance(userData.balances[payCurrency] || 0, payCurrency)}`;
    document.getElementById('receiveBalance').textContent = `Balance: ${formatBalance(userData.balances[receiveCurrency] || 0, receiveCurrency)}`;
}

function showCurrencySelector(type) {
    currentCurrencySelector = type;
    const modal = document.getElementById('currencySelectorModal');
    const currencyList = document.getElementById('currencyList');
    currencyList.innerHTML = ALL_ASSETS.map(asset => `
        <div class="currency-list-item" onclick="selectCurrency('${asset.symbol}')">
            <img src="${getCurrencyIcon(asset.symbol)}">
            <div class="currency-list-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div>
        </div>
    `).join('');
    modal.classList.add('show');
}

function selectCurrency(symbol) {
    if (currentCurrencySelector === 'pay') {
        document.getElementById('payCurrency').textContent = symbol;
        document.getElementById('payCurrencyIcon').src = getCurrencyIcon(symbol);
        document.getElementById('receiveCurrency').textContent = symbol === 'TWT' ? 'USDT' : 'TWT';
        document.getElementById('receiveCurrencyIcon').src = getCurrencyIcon(symbol === 'TWT' ? 'USDT' : 'TWT');
    } else if (currentCurrencySelector === 'receive') {
        document.getElementById('receiveCurrency').textContent = symbol;
        document.getElementById('receiveCurrencyIcon').src = getCurrencyIcon(symbol);
    }
    closeModal('currencySelectorModal');
    updateSwapBalances();
    calculateSwap();
}

function calculateSwap() {
    const payAmount = parseFloat(document.getElementById('payAmount').value) || 0;
    const payCurrency = document.getElementById('payCurrency').textContent;
    const receiveCurrency = document.getElementById('receiveCurrency').textContent;
    let receiveAmount = 0;
    if (payCurrency === 'TWT' && receiveCurrency === 'USDT') receiveAmount = payAmount * TWT_PRICE;
    else if (payCurrency === 'USDT' && receiveCurrency === 'TWT') receiveAmount = payAmount / TWT_PRICE;
    else {
        const payPrice = payCurrency === 'TWT' ? TWT_PRICE : livePrices[payCurrency]?.price || 0;
        const receivePrice = receiveCurrency === 'TWT' ? TWT_PRICE : livePrices[receiveCurrency]?.price || 0;
        if (payPrice > 0 && receivePrice > 0) receiveAmount = (payAmount * payPrice) / receivePrice;
    }
    document.getElementById('receiveAmount').value = receiveAmount.toFixed(6);
    const fee = payAmount * (payCurrency === 'TWT' ? TWT_PRICE : livePrices[payCurrency]?.price || 0) * SWAP_FEE_PERCENT;
    document.getElementById('swapFee').textContent = `$${fee.toFixed(4)}`;
    document.getElementById('swapRate').textContent = `1 ${payCurrency} ≈ ${((payCurrency === 'TWT' ? TWT_PRICE : livePrices[payCurrency]?.price || 0) / (receiveCurrency === 'TWT' ? TWT_PRICE : livePrices[receiveCurrency]?.price || 0)).toFixed(6)} ${receiveCurrency}`;
}

function setMaxAmount() {
    const payCurrency = document.getElementById('payCurrency').textContent;
    const balance = userData.balances[payCurrency] || 0;
    document.getElementById('payAmount').value = balance;
    calculateSwap();
}

function swapDirection(direction) {
    if (direction === 'down') {
        document.getElementById('payCurrency').textContent = 'TWT';
        document.getElementById('payCurrencyIcon').src = getCurrencyIcon('TWT');
        document.getElementById('receiveCurrency').textContent = 'USDT';
        document.getElementById('receiveCurrencyIcon').src = getCurrencyIcon('USDT');
    } else {
        document.getElementById('payCurrency').textContent = 'USDT';
        document.getElementById('payCurrencyIcon').src = getCurrencyIcon('USDT');
        document.getElementById('receiveCurrency').textContent = 'TWT';
        document.getElementById('receiveCurrencyIcon').src = getCurrencyIcon('TWT');
    }
    updateSwapBalances();
    calculateSwap();
}

function confirmSwap() {
    const payAmount = parseFloat(document.getElementById('payAmount').value);
    const payCurrency = document.getElementById('payCurrency').textContent;
    const receiveCurrency = document.getElementById('receiveCurrency').textContent;
    const receiveAmount = parseFloat(document.getElementById('receiveAmount').value);
    if (!payAmount || payAmount <= 0) { showToast(t('error.enterAmount'), 'error'); return; }
    if (!userData.balances[payCurrency] || userData.balances[payCurrency] < payAmount) { showToast(t('error.insufficientBalance', { currency: payCurrency }), 'error'); return; }
    const fee = payAmount * (payCurrency === 'TWT' ? TWT_PRICE : livePrices[payCurrency]?.price || 0) * SWAP_FEE_PERCENT;
    let finalPayAmount = payAmount;
    if (payCurrency === 'USDT') finalPayAmount = payAmount - (fee / (livePrices.USDT?.price || 1));
    if (finalPayAmount <= 0) { showToast('Amount too small after fee', 'error'); return; }
    userData.balances[payCurrency] -= finalPayAmount;
    userData.balances[receiveCurrency] = (userData.balances[receiveCurrency] || 0) + receiveAmount;
    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    addTransaction({ type: 'swap', amount: payAmount, currency: payCurrency, details: `Swapped to ${receiveAmount} ${receiveCurrency}` });
    if (db) db.collection('users').doc(userId).update({ balances: userData.balances });
    showToast(t('success.swapCompleted', { fromAmount: formatBalance(finalPayAmount, payCurrency), fromCurrency: payCurrency, toAmount: formatBalance(receiveAmount, receiveCurrency), toCurrency: receiveCurrency }), 'success');
    document.getElementById('payAmount').value = '1';
    calculateSwap();
    updateSwapBalances();
    updateUI();
}

// ====== 26. DEPOSIT FUNCTIONS (WITHOUT TXID - MANUAL ADMIN APPROVAL) ======
function showDepositModal() {
    document.getElementById('depositModal').classList.add('show');
    updateDepositInfo();
}

async function updateDepositInfo() {
    const currency = document.getElementById('depositCurrency').value;
    const address = await generateDepositAddress(userId, currency);
    document.getElementById('depositAddress').textContent = address;
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    const amountInput = document.getElementById('depositAmount');
    amountInput.placeholder = `Min ${minAmount} ${currency}`;
    document.getElementById('depositMinAmount').textContent = minAmount;
}

function copyDepositAddress() {
    const address = document.getElementById('depositAddress').textContent;
    navigator.clipboard.writeText(address);
    showToast(t('success.addressCopied'), 'success');
}

// No submitDeposit function - admin adds balance manually via admin panel

// ====== 27. WITHDRAW FUNCTIONS ======
function showWithdrawModal() {
    document.getElementById('withdrawModal').classList.add('show');
    updateWithdrawInfo();
}

function updateWithdrawInfo() {
    const currency = document.getElementById('withdrawCurrency').value;
    document.getElementById('withdrawMinAmount').textContent = WITHDRAW_MINIMUMS[currency] || 10;
    document.getElementById('withdrawFee').textContent = (WITHDRAW_FEES[currency] || 1) + ' ' + currency;
}

async function submitWithdraw() {
    if (userData?.withdrawBlocked) { showToast('⛔ Your account is blocked from withdrawals', 'error'); return; }
    const currency = document.getElementById('withdrawCurrency').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const address = document.getElementById('walletAddress').value.trim();
    if (!amount || amount <= 0 || !address) { showToast('Please fill all fields', 'error'); return; }
    const minAmount = WITHDRAW_MINIMUMS[currency] || 10;
    if (amount < minAmount) { showToast(`Minimum withdrawal is ${minAmount} ${currency}`, 'error'); return; }
    if (!userData.balances[currency] || userData.balances[currency] < amount) { showToast(`Insufficient ${currency} balance`, 'error'); return; }
    const fee = WITHDRAW_FEES[currency] || 1;
    const totalNeeded = amount + fee;
    if (userData.balances[currency] < totalNeeded) { showToast(`Insufficient balance (need ${totalNeeded} ${currency})`, 'error'); return; }
    userData.balances[currency] -= totalNeeded;
    const withdrawRequest = {
        id: 'withdraw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        currency: currency,
        amount: amount,
        address: address,
        fee: fee,
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'withdraw'
    };
    const submitBtn = document.getElementById('submitWithdrawBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'; }
    try {
        if (!userData.withdrawalRequests) userData.withdrawalRequests = [];
        userData.withdrawalRequests.push(withdrawRequest);
        if (db) {
            const docRef = await db.collection('withdrawals').add(withdrawRequest);
            withdrawRequest.firebaseId = docRef.id;
            await addNotification(ADMIN_ID, `💸 New withdrawal request: ${amount} ${currency} from ${userId}`, 'info');
            startOnDemandListener('withdrawals', docRef.id, (data) => {
                if (data.status === 'approved') {
                    addTransaction({ ...withdrawRequest, status: 'approved' });
                    showToast(`✅ Your withdrawal of ${amount} ${currency} has been approved!`, 'success');
                } else if (data.status === 'rejected') {
                    userData.balances[currency] += amount + fee;
                    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                    addTransaction({ ...withdrawRequest, status: 'rejected', reason: data.reason });
                    showToast(`❌ Your withdrawal was rejected: ${data.reason || 'Unknown reason'}`, 'error');
                    updateUI();
                }
            }, 30000);
        }
        addTransaction(withdrawRequest);
        showToast(t('success.withdrawSubmitted', { amount, currency }), 'success');
        closeModal('withdrawModal');
        document.getElementById('withdrawAmount').value = '';
        document.getElementById('walletAddress').value = '';
        updateUI();
    } catch (error) {
        userData.balances[currency] += amount + fee;
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        showToast('❌ Failed to submit withdrawal request', 'error');
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal'; }
    }
}

// ====== 28. REFERRAL FUNCTIONS ======
function updateReferralStats() {
    if (!userData) return;
    document.getElementById('totalReferrals').textContent = userData.referralCount || 0;
    document.getElementById('twtEarned').textContent = ((userData.referralCount || 0) * REFERRAL_BONUS).toLocaleString() + ' TWT';
    document.getElementById('usdtEarned').textContent = (userData.totalUsdtEarned || 0).toFixed(2) + ' USDT';
    const referralLinkInput = document.getElementById('referralLink');
    if (referralLinkInput) referralLinkInput.value = getReferralLink();
}

function renderReferral() {
    const container = document.getElementById('referralContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="referral-header"><span class="referral-title">${t('referral.title')}</span></div>
        <div class="referral-stats">
            <div class="stat-card"><span class="stat-label">${t('referral.totalReferrals')}</span><span class="stat-value" id="totalReferrals">0</span></div>
            <div class="stat-card"><span class="stat-label">${t('referral.twtEarned')}</span><span class="stat-value" id="twtEarned">0 TWT</span></div>
            <div class="stat-card"><span class="stat-label">${t('referral.usdtEarned')}</span><span class="stat-value" id="usdtEarned">0.00 USDT</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('referral.yourLink')}</div>
            <div class="link-container">
                <input type="text" class="referral-link" id="referralLink" readonly>
                <button class="copy-btn" onclick="copyReferralLink()"><i class="fa-regular fa-copy"></i></button>
                <button class="share-btn" onclick="shareReferral()"><i class="fa-regular fa-share-from-square"></i></button>
            </div>
        </div>
        <div class="referral-description"><i class="fa-regular fa-star"></i><p>${t('referral.description')} <span class="highlight">${REFERRAL_BONUS} TWT</span> ${t('referral.description2')}</p></div>
        <div class="section-header"><h3>${t('referral.milestones')}</h3></div>
        <div class="milestones-list" id="milestonesList"></div>
    `;
    updateReferralStats();
    renderReferralMilestones();
}

function claimReferralMilestone(referrals) {
    const milestoneIndex = userData.referralMilestones.findIndex(m => m.referrals === referrals);
    if (milestoneIndex === -1 || userData.referralMilestones[milestoneIndex].claimed) return;
    if (userData.referralCount < referrals) { showToast(`You need ${referrals} referrals to claim this!`, 'error'); return; }
    const reward = REFERRAL_MILESTONES.find(m => m.referrals === referrals).reward;
    userData.balances.USDT += reward;
    userData.totalUsdtEarned += reward;
    userData.referralMilestones[milestoneIndex].claimed = true;
    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    addTransaction({ type: 'referral_bonus', amount: reward, currency: 'USDT', details: `Referral milestone: ${referrals} referrals` });
    if (db) db.collection('users').doc(userId).update({ balances: userData.balances, totalUsdtEarned: userData.totalUsdtEarned, referralMilestones: userData.referralMilestones });
    showToast(`Claimed ${reward} USDT!`, 'success');
    updateReferralStats();
    renderReferralMilestones();
    updateUI();
}

// ====== 29. TWT PAY CARD ======
function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const twtBalance = userData.balances.TWT || 0;
    const twtValue = twtBalance * TWT_PRICE;
    const cardNumber = userData.userId?.slice(-4) || '0000';
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-chip"><i class="fas fa-microchip"></i></div>
            <div class="card-brand">TWT Pay</div>
            <div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div>
            <div class="card-details"><div><div class="label">Card Holder</div><div class="value">${userData.userName || 'TWT User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div>
            <div class="card-balance"><div class="balance-label">Available Balance</div><div class="balance-value">${twtBalance.toLocaleString()} TWT</div><div class="balance-usd">≈ $${twtValue.toFixed(2)} USD</div></div>
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
function showCardTransactions() {
    const txs = (userData.transactions || []).filter(t => t.currency === 'TWT' || t.fromCurrency === 'TWT' || t.toCurrency === 'TWT');
    if (txs.length === 0) { showToast('No TWT transactions', 'info'); return; }
    let msg = '💳 TWT Card Transactions:\n\n';
    txs.slice(0, 10).forEach(tx => {
        const d = new Date(tx.timestamp).toLocaleDateString();
        if (tx.type === 'send' && tx.currency === 'TWT') msg += `📤 Sent ${tx.amount} TWT (${d})\n`;
        else if (tx.type === 'swap' && tx.toCurrency === 'TWT') msg += `🔄 Received ${tx.toAmount?.toFixed(4)} TWT (${d})\n`;
        else if (tx.type === 'referral_bonus' && tx.currency === 'TWT') msg += `🎉 Referral +${tx.amount} TWT (${d})\n`;
    });
    alert(msg);
}

// ====== 30. SETTINGS ======
function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div><div class="desc">View all notifications</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('history.title')}</div><div class="desc">View all transactions</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showRecoveryPhrase()"><i class="fas fa-key"></i><div><div class="label">${t('settings.recovery')}</div><div class="desc">View your backup phrase</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div><div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div><div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div><div class="desc">Sign out of your wallet</div></div></div>
        </div>
        <div style="text-align:center;margin-top:24px;"><span style="font-size:10px;">Trust Wallet Lite v3.2</span></div>
    `;
}

function showRecoveryPhrase() {
    if (!userData.recoveryPhrase) {
        const words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'];
        userData.recoveryPhrase = words.map(() => words[Math.floor(Math.random() * words.length)]).join(' ');
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    }
    document.getElementById('recoveryPhraseDisplay').innerHTML = `<div class="recovery-box">${userData.recoveryPhrase}</div>`;
    document.getElementById('recoveryModal').classList.add('show');
}

function copyRecoveryPhrase() {
    if (userData.recoveryPhrase) copyToClipboard(userData.recoveryPhrase);
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem(`user_${userId}`);
        userData = null;
        document.getElementById('onboardingScreen').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
    }
}

// ====== 31. ADMIN FUNCTIONS ======
function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAdminData();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
    stopAllListeners();
}

async function loadAdminData() {
    if (!db) return;
    try {
        const [withdrawalsSnapshot] = await Promise.all([
            db.collection('withdrawals').where('status', '==', 'pending').get()
        ]);
        const pendingCount = withdrawalsSnapshot.size;
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvedCount').textContent = '...';
        document.getElementById('totalReferralsCount').textContent = '...';
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `<div style="text-align:center;padding:30px;"><i class="fa-solid fa-hand-pointer" style="font-size:48px;color:var(--primary);"></i><p style="margin:20px 0;">Click refresh to view requests</p><button onclick="refreshAdminPanel()" class="admin-approve-btn" style="width:auto;padding:10px 20px;"><i class="fa-solid fa-rotate-right"></i> Refresh</button></div>`;
    } catch (error) {
        console.error("Error loading admin data:", error);
    }
}

async function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    currentAdminTab = tab;
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `<div style="text-align:center;padding:30px;"><i class="fa-solid fa-hand-pointer" style="font-size:48px;color:var(--primary);"></i><p style="margin:20px 0;">Click refresh to view requests</p><button onclick="refreshAdminPanel()" class="admin-approve-btn" style="width:auto;padding:10px 20px;"><i class="fa-solid fa-rotate-right"></i> Refresh</button></div>`;
}

window.refreshAdminPanel = async function() {
    if (!isAdmin) return;
    const refreshBtn = document.getElementById('adminRefreshBtn');
    if (refreshBtn) refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    try {
        const activeTab = document.querySelector('.admin-tab.active')?.textContent.toLowerCase().includes('withdraw') ? 'withdrawals' : 
                          document.querySelector('.admin-tab.active')?.textContent.toLowerCase().includes('user') ? 'users' : 
                          document.querySelector('.admin-tab.active')?.textContent.toLowerCase().includes('stat') ? 'stats' : 'withdrawals';
        
        if (activeTab === 'withdrawals') {
            const query = db.collection('withdrawals').where('status', '==', 'pending');
            const snapshot = await query.get();
            if (snapshot.empty) { adminContent.innerHTML = '<div class="empty-state">No pending withdrawals</div>'; return; }
            const userIds = [];
            const transactions = [];
            snapshot.forEach(doc => {
                const tx = { firebaseId: doc.id, ...doc.data() };
                transactions.push(tx);
                if (tx.userId && !userIds.includes(tx.userId)) userIds.push(tx.userId);
            });
            const referralCounts = {};
            if (userIds.length > 0) {
                const chunks = [];
                for (let i = 0; i < userIds.length; i += 30) chunks.push(userIds.slice(i, i + 30));
                for (const chunk of chunks) {
                    const usersSnapshot = await db.collection('users').where('userId', 'in', chunk).get();
                    usersSnapshot.forEach(doc => { const ud = doc.data(); referralCounts[ud.userId] = ud.referralCount || 0; });
                }
            }
            let html = '';
            transactions.forEach(tx => { html += renderAdminTransactionCard(tx, activeTab, referralCounts[tx.userId] || 0); });
            adminContent.innerHTML = html;
        } else if (activeTab === 'users') {
            adminContent.innerHTML = `
                <div style="padding:20px;">
                    <div style="margin-bottom:20px;">
                        <h4>Search by User ID</h4>
                        <div style="display:flex;gap:10px;">
                            <input type="text" id="adminUserIdInput" placeholder="Enter User ID" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px;color:white;">
                            <button onclick="adminLoadUser()" class="btn-primary">Search</button>
                        </div>
                    </div>
                    <div style="margin-bottom:20px;">
                        <h4>Search by Wallet Address</h4>
                        <div style="display:flex;gap:10px;">
                            <input type="text" id="adminAddressSearch" placeholder="Enter Deposit Address" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:12px;color:white;">
                            <button onclick="adminLoadUserByAddress()" class="btn-primary">Search</button>
                        </div>
                    </div>
                    <div id="adminUserStats" style="display:none;"></div>
                </div>
            `;
        } else if (activeTab === 'stats') {
            const usersSnapshot = await db.collection('users').get();
            const totalUsers = usersSnapshot.size;
            const withdrawalsSnapshot = await db.collection('withdrawals').where('status', '==', 'pending').get();
            const pendingWithdrawals = withdrawalsSnapshot.size;
            adminContent.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><h3>Total Users</h3><div class="stat-value">${totalUsers}</div></div>
                    <div class="stat-card"><h3>TWT Price</h3><div class="stat-value">$${(livePrices.TWT?.price || TWT_PRICE).toFixed(4)}</div></div>
                    <div class="stat-card"><h3>Your TWT</h3><div class="stat-value">${(userData?.balances.TWT || 0).toLocaleString()}</div></div>
                    <div class="stat-card"><h3>Total Referrals</h3><div class="stat-value">${userData?.referralCount || 0}</div></div>
                    <div class="stat-card"><h3>Pending Withdrawals</h3><div class="stat-value">${pendingWithdrawals}</div></div>
                </div>
            `;
        }
        showToast('Admin panel refreshed', 'success');
    } catch (error) {
        console.error("Error refreshing admin panel:", error);
        adminContent.innerHTML = '<div class="empty-state">Error loading data</div>';
    } finally {
        if (refreshBtn) setTimeout(() => refreshBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>', 500);
    }
};

function renderAdminTransactionCard(tx, tab, referralCount = 0) {
    const date = new Date(tx.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    const telegramId = tx.userId || 'N/A';
    const displayUserId = tx.userName ? `${tx.userName}` : telegramId.substring(0, 8);
    return `
        <div class="admin-transaction-card">
            <div class="admin-tx-header"><div class="admin-tx-type ${tx.type}"><i class="fa-regular ${tx.type === 'withdraw' ? 'fa-circle-up' : 'fa-circle-down'}"></i><span>${tx.type.toUpperCase()}</span></div><span class="admin-tx-status ${tx.status}">${tx.status}</span></div>
            <div class="admin-tx-details">
                <div class="admin-tx-row"><span class="admin-tx-label">User:</span><span class="admin-tx-value">${displayUserId}</span></div>
                <div class="admin-tx-row"><span class="admin-tx-label">Telegram ID:</span><div class="admin-address-container"><code>${telegramId}</code><button class="admin-copy-btn" onclick="copyToClipboard('${telegramId}')"><i class="fa-regular fa-copy"></i></button></div></div>
                <div class="admin-tx-row"><span class="admin-tx-label">Amount:</span><span class="admin-tx-value">${tx.amount} ${tx.currency}</span></div>
                ${tx.address ? `<div class="admin-tx-row"><span class="admin-tx-label">Address:</span><div class="admin-address-container"><code>${tx.address.substring(0,20)}...</code><button class="admin-copy-btn" onclick="copyToClipboard('${tx.address}')"><i class="fa-regular fa-copy"></i></button></div></div>` : ''}
                <div class="admin-tx-row"><span class="admin-tx-label">Fee:</span><span class="admin-tx-value">${tx.fee} ${tx.currency}</span></div>
                <div class="admin-tx-row"><span class="admin-tx-label">Time:</span><span class="admin-tx-value">${formattedDate}</span></div>
                <div class="admin-tx-row"><span class="admin-tx-label">Total Referrals:</span><span class="admin-tx-value">${referralCount}</span></div>
            </div>
            <div class="admin-tx-actions">
                <button class="admin-approve-btn" onclick="approveWithdrawal('${tx.firebaseId}', '${tx.userId}', '${tx.currency}', ${tx.amount}, ${tx.fee || 0})">Approve</button>
                <button class="admin-reject-btn" onclick="rejectWithdrawal('${tx.firebaseId}', '${tx.userId}', '${tx.currency}', ${tx.amount}, ${tx.fee || 0})">Reject</button>
            </div>
        </div>
    `;
}

async function approveWithdrawal(firebaseId, targetUserId, currency, amount, fee) {
    if (!isAdmin || !db) { showToast('Admin access required', 'error'); return; }
    try {
        const docRef = db.collection('withdrawals').doc(firebaseId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) { showToast('Withdrawal request not found', 'error'); return; }
        await docRef.update({ status: 'approved', approvedAt: firebase.firestore.FieldValue.serverTimestamp(), approvedBy: 'admin' });
        await addNotification(targetUserId, `✅ Your withdrawal of ${amount} ${currency} has been approved!`, 'success');
        showToast('Withdrawal approved!', 'success');
        refreshAdminPanel();
    } catch (error) { showToast('Error approving withdrawal', 'error'); }
}

async function rejectWithdrawal(firebaseId, targetUserId, currency, amount, fee) {
    if (!isAdmin || !db) { showToast('Admin access required', 'error'); return; }
    const reason = prompt("Enter rejection reason:", "Insufficient balance or invalid address");
    if (!reason) return;
    try {
        const docRef = db.collection('withdrawals').doc(firebaseId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) { showToast('Withdrawal request not found', 'error'); return; }
        await docRef.update({ status: 'rejected', rejectionReason: reason, rejectedAt: firebase.firestore.FieldValue.serverTimestamp(), rejectedBy: 'admin' });
        const userDoc = await db.collection('users').doc(targetUserId).get();
        const user = userDoc.data();
        const updates = {};
        updates[`balances.${currency}`] = (user.balances[currency] || 0) + amount + fee;
        await db.collection('users').doc(targetUserId).update(updates);
        await addNotification(targetUserId, `❌ Your withdrawal of ${amount} ${currency} was rejected. Reason: ${reason}`, 'error');
        showToast('Withdrawal rejected', 'success');
        refreshAdminPanel();
    } catch (error) { showToast('Error rejecting withdrawal', 'error'); }
}

// ====== 32. ADMIN USER MANAGEMENT (WITH ADDRESS SEARCH) ======
async function adminLoadUser() {
    const targetUserId = document.getElementById('adminUserIdInput')?.value.trim();
    if (!targetUserId) { showToast('Enter User ID', 'error'); return; }
    const statsDiv = document.getElementById('adminUserStats');
    statsDiv.style.display = 'block';
    statsDiv.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    try {
        const userDoc = await db.collection('users').doc(targetUserId).get();
        if (!userDoc.exists) { statsDiv.innerHTML = `<div style="text-align:center;color:var(--danger);padding:30px;"><i class="fa-solid fa-user-slash"></i><p>User not found!</p></div>`; return; }
        const user = userDoc.data();
        displayUserStats(user, targetUserId, statsDiv);
    } catch (error) {
        statsDiv.innerHTML = `<div style="text-align:center;color:var(--danger);padding:20px;">❌ Error loading user</div>`;
    }
}

async function adminLoadUserByAddress() {
    const address = document.getElementById('adminAddressSearch')?.value.trim();
    if (!address) { showToast('Enter wallet address', 'error'); return; }
    const statsDiv = document.getElementById('adminUserStats');
    statsDiv.style.display = 'block';
    statsDiv.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Searching...</div>';
    try {
        const usersSnapshot = await db.collection('users').get();
        let foundUser = null;
        let foundUserId = null;
        
        for (const doc of usersSnapshot.docs) {
            const user = doc.data();
            if (user.depositAddresses) {
                for (const [currency, addr] of Object.entries(user.depositAddresses)) {
                    if (addr === address) {
                        foundUser = user;
                        foundUserId = doc.id;
                        break;
                    }
                }
            }
            if (foundUser) break;
        }
        
        if (!foundUser) {
            statsDiv.innerHTML = `<div style="text-align:center;color:var(--danger);padding:30px;"><i class="fa-solid fa-search"></i><p>No user found with this wallet address!</p></div>`;
            return;
        }
        displayUserStats(foundUser, foundUserId, statsDiv);
    } catch (error) {
        console.error("Error searching by address:", error);
        statsDiv.innerHTML = `<div style="text-align:center;color:var(--danger);padding:20px;">❌ Error searching</div>`;
    }
}

function displayUserStats(user, userId, statsDiv) {
    currentManageUserId = userId;
    const now = new Date();
    const activeStakes = (user.staking || []).filter(s => new Date(s.endDate) > now);
    const depositAddressesHtml = user.depositAddresses ? 
        Object.entries(user.depositAddresses).map(([cur, addr]) => 
            `<div style="font-size:11px;margin:4px 0;"><strong>${cur}:</strong> ${addr.substring(0,20)}... <button class="admin-copy-btn" onclick="copyToClipboard('${addr}')"><i class="fa-regular fa-copy"></i></button></div>`
        ).join('') : '<div>No deposit addresses</div>';
    
    statsDiv.innerHTML = `
        <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:15px;margin-top:15px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
                <h4>👤 ${user.userName || 'User'}</h4>
                <div class="admin-address-container">
                    <span>🆔 ${userId}</span>
                    <button class="admin-copy-btn" onclick="copyToClipboard('${userId}')"><i class="fa-regular fa-copy"></i></button>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
                <div style="background:rgba(0,212,255,0.1);border-radius:12px;padding:10px;text-align:center;">
                    <div>👥</div>
                    <div style="font-weight:bold;">${user.referralCount || 0}</div>
                    <div style="font-size:11px;">Referrals</div>
                </div>
                <div style="background:rgba(0,212,255,0.1);border-radius:12px;padding:10px;text-align:center;">
                    <div>🔒</div>
                    <div style="font-weight:bold;">${activeStakes.length}</div>
                    <div style="font-size:11px;">Active Stakes</div>
                </div>
            </div>
            <details style="margin-bottom:15px;">
                <summary style="cursor:pointer;color:var(--primary);">📋 Deposit Addresses</summary>
                <div style="margin-top:8px;padding-left:10px;border-left:2px solid var(--primary);font-size:12px;">
                    ${depositAddressesHtml}
                </div>
            </details>
            <hr><h4>💰 Balances</h4>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;">
                ${Object.entries(user.balances || {}).filter(([_,v]) => v > 0).map(([c,v]) => `<span style="background:rgba(255,255,255,0.1);border-radius:20px;padding:4px 10px;font-size:12px;"><strong>${c}</strong>: ${c === 'USDT' ? v.toFixed(2) : v.toLocaleString()}</span>`).join('') || '<span>No balances</span>'}
            </div>
            <hr>
            <div style="display:flex;gap:10px;margin:15px 0;">
                <button onclick="adminAddBalance()" style="flex:1;background:#10b981;border:none;padding:10px;border-radius:8px;cursor:pointer;">➕ Add Balance</button>
                <button onclick="adminRemoveBalance()" style="flex:1;background:#ef4444;border:none;padding:10px;border-radius:8px;cursor:pointer;">➖ Remove Balance</button>
            </div>
            <div style="margin-top:15px;">
                ${user.withdrawBlocked ? 
                    `<div style="background:rgba(239,68,68,0.2);border-radius:12px;padding:10px;text-align:center;"><i class="fa-solid fa-ban"></i> USER IS PERMANENTLY BLOCKED FROM WITHDRAWALS</div>` : 
                    `<button onclick="blockUserWithdrawals('${userId}')" style="width:100%;background:#ef4444;border:none;padding:10px;border-radius:8px;cursor:pointer;"><i class="fa-solid fa-ban"></i> PERMANENTLY BLOCK FROM WITHDRAWALS</button>`
                }
            </div>
            <div style="margin-top:10px;">
                <button onclick="adminRefreshUserData()" style="width:100%;background:rgba(0,212,255,0.2);border:1px solid var(--primary);padding:10px;border-radius:8px;cursor:pointer;"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
            </div>
        </div>
    `;
}

async function adminAddBalance() {
    if (!isAdmin || !currentManageUserId) return;
    const currency = prompt('Currency (TWT, USDT, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to ADD (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    try {
        await db.collection('users').doc(currentManageUserId).update({
            [`balances.${currency}`]: firebase.firestore.FieldValue.increment(amount)
        });
        await addNotification(currentManageUserId, t('notif.balanceAdded', { amount, currency }), 'success');
        await db.collection('transactions').add({
            userId: currentManageUserId,
            type: 'admin_add',
            amount: amount,
            currency: currency,
            status: 'completed',
            timestamp: new Date().toISOString(),
            details: `Admin added ${amount} ${currency}`
        });
        showToast(`✅ Added ${amount} ${currency}`, 'success');
        if (currentManageUserId === userId) {
            userData.balances[currency] = (userData.balances[currency] || 0) + amount;
            saveUserData();
            updateUI();
        }
        adminLoadUser();
    } catch (error) { showToast('Error adding balance', 'error'); }
}

async function adminRemoveBalance() {
    if (!isAdmin || !currentManageUserId) return;
    const currency = prompt('Currency (TWT, USDT, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    try {
        await db.collection('users').doc(currentManageUserId).update({
            [`balances.${currency}`]: firebase.firestore.FieldValue.increment(-amount)
        });
        await db.collection('transactions').add({
            userId: currentManageUserId,
            type: 'admin_remove',
            amount: amount,
            currency: currency,
            status: 'completed',
            timestamp: new Date().toISOString(),
            details: `Admin removed ${amount} ${currency}`
        });
        showToast(`✅ Removed ${amount} ${currency}`, 'success');
        if (currentManageUserId === userId) {
            userData.balances[currency] = Math.max(0, (userData.balances[currency] || 0) - amount);
            saveUserData();
            updateUI();
        }
        adminLoadUser();
    } catch (error) { showToast('Error removing balance', 'error'); }
}

async function adminRefreshUserData() { if (currentManageUserId) await adminLoadUser(); }

async function blockUserWithdrawals(targetUserId) {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    if (!confirm(`⚠️⚠️⚠️ PERMANENT ACTION WARNING ⚠️⚠️⚠️\n\nAre you ABSOLUTELY sure you want to permanently block this user from withdrawals?\n\nTHIS ACTION CANNOT BE UNDONE!`)) return;
    try {
        if (db) await db.collection('users').doc(targetUserId).update({ withdrawBlocked: true, withdrawBlockedAt: firebase.firestore.FieldValue.serverTimestamp(), withdrawBlockedBy: ADMIN_ID, withdrawBlockedPermanent: true });
        if (targetUserId === userId) { userData.withdrawBlocked = true; localStorage.setItem(`user_${userId}`, JSON.stringify(userData)); }
        showToast('User has been PERMANENTLY blocked from withdrawals', 'success');
        await adminLoadUser();
    } catch (error) { showToast('Failed to block user', 'error'); }
}

// ====== 33. MODAL FUNCTIONS ======
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); updateDepositInfo(); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); updateWithdrawInfo(); }
function showP2P() { document.getElementById('p2pModal').classList.add('show'); document.getElementById('p2pCountdown').textContent = '90 days'; }
function showAllAssets() { showToast('All assets view coming soon!', 'info'); }
function showAssetDetails(symbol) {
    const balance = userData.balances[symbol] || 0;
    const price = symbol === 'TWT' ? TWT_PRICE : livePrices[symbol]?.price || 0;
    const value = symbol === 'USDT' ? balance : balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}
function showStakingDetails(type) { showToast('Staking coming soon!', 'info'); }

// ====== 34. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
    if (currentLanguage === 'ar') { document.body.classList.add('rtl'); document.documentElement.dir = 'rtl'; document.getElementById('currentLanguageFlag').textContent = '🇸🇦'; }
    else { document.getElementById('currentLanguageFlag').textContent = '🇬🇧'; }
    updateAllTexts();
    initTheme();
    setTimeout(checkAdminAndAddCrown, 300);
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
        document.getElementById('mainContent').style.display = 'block';
        setTimeout(() => showRandomSticker(), 500);
    }, 2000);
    setTimeout(fixNotificationButton, 1500);
    initApp();
});

async function initApp() {
    if (appInitialized) return;
    try {
        await loadUserData();
        await fetchLivePrices();
        renderAssets();
        updateTotalBalance();
        updateReferralStats();
        setupScrollListener();
        appInitialized = true;
        console.log("✅ Trust Wallet Lite v3.2 initialized");
        console.log("✅ CoinPayments API - Unique deposit addresses per user");
        console.log("✅ Admin can search by wallet address and add balance manually");
    } catch (error) { console.error("Error initializing app:", error); }
}

let currentAdminTab = 'withdrawals';

// ====== 35. EXPORT FUNCTIONS ======
window.showWallet = showWallet;
window.showSwap = showSwap;
window.showReferral = showReferral;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showP2P = showP2P;
window.showAllAssets = showAllAssets;
window.showAssetDetails = showAssetDetails;
window.showStakingDetails = showStakingDetails;
window.showCurrencySelector = showCurrencySelector;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;
window.filterHistory = filterHistory;
window.refreshPrices = refreshPrices;
window.selectCurrency = selectCurrency;
window.calculateSwap = calculateSwap;
window.confirmSwap = confirmSwap;
window.setMaxAmount = setMaxAmount;
window.swapDirection = swapDirection;
window.copyReferralLink = copyReferralLink;
window.shareReferral = shareReferral;
window.copyDepositAddress = copyDepositAddress;
window.submitWithdraw = submitWithdraw;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.scrollToTop = scrollToTop;
window.checkPendingWithdrawals = checkPendingWithdrawals;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;
window.showAdminTab = showAdminTab;
window.refreshAdminPanel = refreshAdminPanel;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.copyToClipboard = copyToClipboard;
window.adminLoadUser = adminLoadUser;
window.adminLoadUserByAddress = adminLoadUserByAddress;
window.adminAddBalance = adminAddBalance;
window.adminRemoveBalance = adminRemoveBalance;
window.adminRefreshUserData = adminRefreshUserData;
window.blockUserWithdrawals = blockUserWithdrawals;
window.showRecoveryPhrase = showRecoveryPhrase;
window.copyRecoveryPhrase = copyRecoveryPhrase;
window.logout = logout;
window.showTopUpModal = showTopUpModal;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;
window.claimReferralMilestone = claimReferralMilestone;

console.log("✅ Trust Wallet Lite v3.2 - ULTIMATE PROFESSIONAL VERSION");
console.log("✅ 12 Cryptocurrencies | 8 Referral Milestones | TWT Pay Card");
console.log("✅ CoinPayments API - Unique Deposit Addresses per User");
console.log("✅ Admin: Search by User ID or Wallet Address | Manual Balance Addition");
console.log("✅ Languages: English / العربية | Dark/Light Mode | RTL Support");
