// ============================================================================
// TRUST WALLET LITE - ULTIMATE PROFESSIONAL VERSION 2.0
// ============================================================================
// Features: 12 Cryptocurrencies | 8 Referral Milestones | TWT Pay Card
//           Swap DEX (0.3% fee) | Deposit/Withdraw | Admin Panel
//           Zero Waste Architecture | Dark/Light Mode | RTL Support
//           Unique Deposit Addresses per User | CoinPayments API Ready
// ============================================================================

// ============================================================================
// SECTION 1: TELEGRAM WEBAPP INITIALIZATION
// ============================================================================

const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// ============================================================================
// SECTION 2: FIREBASE CONFIGURATION (Environment Variables)
// ============================================================================

const firebaseConfig = {
    apiKey: "{{FIREBASE_API_KEY}}",
    authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
    databaseURL: "{{FIREBASE_DATABASE_URL}}",
    projectId: "{{FIREBASE_PROJECT_ID}}",
    storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
    messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
    appId: "{{FIREBASE_APP_ID}}"
};

let db = null;
let firebaseInitialized = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log("🔥 Firebase initialized");
    }
} catch (error) {
    console.error("Firebase error:", error);
}

// ============================================================================
// SECTION 3: COINPAYMENTS API CONFIGURATION
// ============================================================================

const COINPAYMENTS_API_KEY = "{{COINPAYMENTS_API_KEY}}";
const COINPAYMENTS_API_SECRET = "{{COINPAYMENTS_API_SECRET}}";
const COINPAYMENTS_IPN_URL = "https://your-app.onrender.com/api/ipn";

// ============================================================================
// SECTION 4: TRANSLATION SYSTEM (i18n) - Full English & Arabic
// ============================================================================

const translations = {
    en: {
        'app.name': 'Trust Wallet Lite',
        'welcome.title': 'Welcome back,',
        'nav.wallet': 'Wallet',
        'nav.swap': 'Swap',
        'nav.referral': 'Referral',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'Settings',
        'actions.send': 'Send',
        'actions.receive': 'Receive',
        'actions.swap': 'Swap',
        'actions.buy': 'Buy',
        'actions.deposit': 'Deposit',
        'actions.withdraw': 'Withdraw',
        'actions.history': 'History',
        'actions.copy': 'Copy',
        'actions.confirmSwap': 'Confirm Swap',
        'actions.stake': 'Stake',
        'actions.gotIt': 'Got it!',
        'wallet.totalBalance': 'Total Balance',
        'wallet.myAssets': 'My Assets',
        'wallet.topCryptos': 'Top Cryptocurrencies',
        'swap.from': 'From',
        'swap.to': 'To',
        'swap.exchangeRate': 'Exchange Rate',
        'swap.networkFee': 'Network Fee',
        'swap.swapperFee': 'Swapper fee',
        'swap.provider': 'Provider',
        'referral.title': 'EARN TWT',
        'referral.totalReferrals': 'TOTAL REFERRALS',
        'referral.twtEarned': 'TWT EARNED',
        'referral.usdtEarned': 'USDT EARNED',
        'referral.yourLink': 'Your Referral Link',
        'referral.description': 'Share your link and get',
        'referral.description2': 'TWT for every friend who joins',
        'referral.milestones': 'Referral Milestones',
        'deposit.title': 'Deposit Funds',
        'deposit.selectCurrency': 'Select Currency',
        'deposit.amount': 'Amount',
        'deposit.transactionId': 'Transaction ID',
        'deposit.sendTo': 'Send to this address:',
        'deposit.confirmation': '✓ Blockchain confirmation 1-15 minutes',
        'deposit.submit': 'Submit Deposit',
        'withdraw.title': 'Withdraw Funds',
        'withdraw.selectCurrency': 'Select Currency',
        'withdraw.amount': 'Amount',
        'withdraw.address': 'Wallet Address',
        'withdraw.youReceive': 'You will receive:',
        'withdraw.networkFee': 'Network fee:',
        'withdraw.submit': 'Submit Withdrawal',
        'history.title': 'Transaction History',
        'history.all': 'All',
        'history.deposits': 'Deposits',
        'history.withdrawals': 'Withdrawals',
        'history.swaps': 'Swaps',
        'history.referrals': 'Referrals',
        'notifications.title': 'Notifications',
        'currency.select': 'Select Currency',
        'settings.language': 'Language',
        'settings.theme': 'Theme',
        'settings.recovery': 'Recovery Phrase',
        'settings.logout': 'Logout',
        'messages.loading': 'Loading...',
        'messages.success': 'Success',
        'messages.error': 'Error',
        'messages.warning': 'Warning',
        'notif.referralBonus': '🎉 Someone joined with your link! You got {amount} TWT!',
        'notif.welcomeBonus': '🎉 Welcome! You got 10 TWT bonus!',
        'notif.depositApproved': '✅ Your deposit of {amount} {currency} has been approved!',
        'notif.depositRejected': '❌ Your deposit was rejected. Reason: {reason}',
        'notif.withdrawApproved': '✅ Your withdrawal of {amount} {currency} has been approved!',
        'notif.withdrawRejected': '❌ Your withdrawal was rejected. Reason: {reason}',
        'error.minDeposit': 'Minimum deposit is {min} {currency}',
        'error.insufficientBalance': 'Insufficient {currency} balance',
        'error.minSwap': 'Minimum swap is {min} {currency}',
        'error.enterAmount': 'Please enter a valid amount',
        'success.depositSubmitted': '✅ Deposit request submitted! Amount: {amount} {currency}',
        'success.withdrawSubmitted': '✅ Withdrawal request submitted for {amount} {currency}',
        'success.swapCompleted': '✅ Swapped {fromAmount} {fromCurrency} to {toAmount} {toCurrency}',
        'success.referralCopied': '✅ Referral link copied!',
        'success.addressCopied': '✅ Address copied!',
        'notifications.clear_read': 'Clear Read',
        'notifications.clear_all': 'Clear All',
        'notifications.no_notifications': 'No notifications'
    },
    ar: {
        'app.name': 'Trust Wallet Lite',
        'welcome.title': 'أهلاً بعودتك،',
        'nav.wallet': 'المحفظة',
        'nav.swap': 'تحويل',
        'nav.referral': 'إحالة',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'الإعدادات',
        'actions.send': 'إرسال',
        'actions.receive': 'استلام',
        'actions.swap': 'تحويل',
        'actions.buy': 'شراء',
        'actions.deposit': 'إيداع',
        'actions.withdraw': 'سحب',
        'actions.history': 'السجل',
        'actions.copy': 'نسخ',
        'actions.confirmSwap': 'تأكيد التحويل',
        'actions.stake': 'تجميد',
        'actions.gotIt': 'حسناً!',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'wallet.myAssets': 'أصولي',
        'wallet.topCryptos': 'أفضل العملات',
        'swap.from': 'من',
        'swap.to': 'إلى',
        'swap.exchangeRate': 'سعر الصرف',
        'swap.networkFee': 'رسوم الشبكة',
        'swap.swapperFee': 'رسوم التحويل',
        'swap.provider': 'المزود',
        'referral.title': 'اربح TWT',
        'referral.totalReferrals': 'إجمالي الإحالات',
        'referral.twtEarned': 'TWT المكتسبة',
        'referral.usdtEarned': 'USDT المكتسبة',
        'referral.yourLink': 'رابط الإحالة الخاص بك',
        'referral.description': 'شارك رابطك واحصل على',
        'referral.description2': 'TWT لكل صديق ينضم',
        'referral.milestones': 'مراحل الإحالة',
        'deposit.title': 'إيداع الأموال',
        'deposit.selectCurrency': 'اختر العملة',
        'deposit.amount': 'المبلغ',
        'deposit.transactionId': 'رقم المعاملة',
        'deposit.sendTo': 'أرسل إلى هذا العنوان:',
        'deposit.confirmation': '✓ تأكيد البلوكشين 1-15 دقيقة',
        'deposit.submit': 'تقديم الإيداع',
        'withdraw.title': 'سحب الأموال',
        'withdraw.selectCurrency': 'اختر العملة',
        'withdraw.amount': 'المبلغ',
        'withdraw.address': 'عنوان المحفظة',
        'withdraw.youReceive': 'سوف تستلم:',
        'withdraw.networkFee': 'رسوم الشبكة:',
        'withdraw.submit': 'تقديم السحب',
        'history.title': 'سجل المعاملات',
        'history.all': 'الكل',
        'history.deposits': 'إيداعات',
        'history.withdrawals': 'سحوبات',
        'history.swaps': 'تحويلات',
        'history.referrals': 'إحالات',
        'notifications.title': 'الإشعارات',
        'currency.select': 'اختر العملة',
        'settings.language': 'اللغة',
        'settings.theme': 'المظهر',
        'settings.recovery': 'عبارة الاسترداد',
        'settings.logout': 'تسجيل الخروج',
        'messages.loading': 'جاري التحميل...',
        'messages.success': 'نجاح',
        'messages.error': 'خطأ',
        'messages.warning': 'تحذير',
        'notif.referralBonus': '🎉 شخص ما انضم عبر رابطك! حصلت على {amount} TWT!',
        'notif.welcomeBonus': '🎉 مرحباً! حصلت على 10 TWT كمكافأة!',
        'notif.depositApproved': '✅ تمت الموافقة على إيداعك {amount} {currency}!',
        'notif.depositRejected': '❌ تم رفض إيداعك. السبب: {reason}',
        'notif.withdrawApproved': '✅ تمت الموافقة على سحبك {amount} {currency}!',
        'notif.withdrawRejected': '❌ تم رفض سحبك. السبب: {reason}',
        'error.minDeposit': 'الحد الأدنى للإيداع هو {min} {currency}',
        'error.insufficientBalance': 'رصيد {currency} غير كافٍ',
        'error.minSwap': 'الحد الأدنى للتحويل هو {min} {currency}',
        'error.enterAmount': 'الرجاء إدخال مبلغ صحيح',
        'success.depositSubmitted': '✅ تم تقديم طلب الإيداع! المبلغ: {amount} {currency}',
        'success.withdrawSubmitted': '✅ تم تقديم طلب السحب بمبلغ {amount} {currency}',
        'success.swapCompleted': '✅ تم تحويل {fromAmount} {fromCurrency} إلى {toAmount} {toCurrency}',
        'success.referralCopied': '✅ تم نسخ رابط الإحالة!',
        'success.addressCopied': '✅ تم نسخ العنوان!',
        'notifications.clear_read': 'حذف المقروء',
        'notifications.clear_all': 'حذف الكل',
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
    document.getElementById('currentLanguageFlag').textContent = currentLanguage === 'en' ? '🇬🇧' : '🇸🇦';
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
        if (key) el.textContent = t(key);
    });
}

// ============================================================================
// SECTION 5: DARK/LIGHT MODE SYSTEM
// ============================================================================

let currentTheme = localStorage.getItem('theme') || 'light';

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    showToast(`${currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`, 'success');
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

// ============================================================================
// SECTION 6: COINMARKETCAP ICONS (12 Cryptocurrencies)
// ============================================================================

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

// ============================================================================
// SECTION 7: CONSTANTS & CONFIGURATION
// ============================================================================

const BOT_LINK = "https://t.me/YourBot/TrustWalletLite";
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
    TWT: 'trust-wallet-token',
    USDT: 'tether',
    BNB: 'binancecoin',
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    TRX: 'tron',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    SHIB: 'shiba-inu',
    PEPE: 'pepe',
    TON: 'the-open-network'
};

// ============================================================================
// SECTION 8: DEPOSIT ADDRESSES & LIMITS (Unique per user via CoinPayments)
// ============================================================================

const DEPOSIT_MINIMUMS = {
    TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
    SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000, PEPE: 5000000, TON: 1
};

const WITHDRAW_FEES = {
    TWT: 1, USDT: 0.16, BNB: 0.0005, BTC: 0.0002, ETH: 0.001,
    SOL: 0.005, TRX: 1, ADA: 0.5, DOGE: 1, SHIB: 50000, PEPE: 500000, TON: 0.1
};

const WITHDRAW_MINIMUMS = {
    TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
    SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000, PEPE: 5000000, TON: 1
};

// ============================================================================
// SECTION 9: UNIQUE DEPOSIT ADDRESS GENERATION (CoinPayments API)
// ============================================================================

async function generateDepositAddress(userId, currency) {
    const cacheKey = `address_${userId}_${currency}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    
    // Demo mode - generate unique address based on userId
    const mockAddress = `0x${userId.slice(-40).padStart(40, '0')}`;
    localStorage.setItem(cacheKey, mockAddress);
    return mockAddress;
    
    // Real CoinPayments API (enable when API keys are set)
    /*
    try {
        const response = await fetch('https://www.coinpayments.net/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                cmd: 'get_callback_address',
                key: COINPAYMENTS_API_KEY,
                currency: currency,
                ipn_url: `${COINPAYMENTS_IPN_URL}/${userId}`,
                label: `twt_${userId}_${currency}`
            })
        });
        const data = await response.json();
        if (data.error === 'ok') {
            const address = data.result.address;
            localStorage.setItem(cacheKey, address);
            return address;
        }
    } catch (error) {
        console.error("CoinPayments error:", error);
    }
    return null;
    */
}

// ============================================================================
// SECTION 10: WALLET GENERATION (Public/Private Keys)
// ============================================================================

function generateWalletKeys() {
    const userId = localStorage.getItem('twt_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
    const publicKey = `0x${userId.slice(-40).padStart(40, '0')}`;
    const privateKey = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    return { publicKey, privateKey };
}

// ============================================================================
// SECTION 11: 8 REFERRAL MILESTONES
// ============================================================================

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

// ============================================================================
// SECTION 12: STATE MANAGEMENT
// ============================================================================

let userData = null;
let currentUser = null;
let currentTab = 'wallet';
let isAdmin = false;
let livePrices = {};
let unreadNotifications = 0;
let currentCurrencySelector = null;
let currentSwapContext = null;
let currentHistoryFilter = 'all';
let appInitialized = false;

let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;
let lastHistoryCheckTime = 0;
const USER_CACHE_TIME = 300000;
const PRICES_CACHE_TIME = 10800000;
const HISTORY_CACHE_TIME = 600000;

// ============================================================================
// SECTION 13: STICKER SYSTEM
// ============================================================================

const WELCOME_STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '✨', '🌟', '⭐', '🔥', '⚡', '💎', '🔔', '🎁', '🎈', '🎉', '🎊', '👑', '🚀', '💫', '⭐'];
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

// ============================================================================
// SECTION 14: USER IDENTIFICATION & REFERRAL
// ============================================================================

const userId = localStorage.getItem('twt_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('twt_user_id', userId);

function generateReferralCode() {
    return userId.substr(-8).toUpperCase();
}

function getReferralLink() {
    if (!userData) return '';
    return `${window.location.origin}${window.location.pathname}?ref=${userData.referralCode}`;
}

function hasReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return !!(urlParams.get('ref') || urlParams.get('startapp'));
}

// ============================================================================
// SECTION 15: ADMIN SYSTEM
// ============================================================================

isAdmin = userId === ADMIN_ID;

function checkAdminAndAddCrown() {
    if (!isAdmin) return;
    const crownBtn = document.getElementById('adminCrownBtn');
    if (crownBtn) crownBtn.classList.remove('hidden');
}

// ============================================================================
// SECTION 16: TRANSACTIONS STORAGE
// ============================================================================

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
        const txWithId = { ...transaction, id: Date.now().toString() + Math.random().toString(36).substr(2, 5), timestamp: transaction.timestamp || new Date().toISOString() };
        const exists = allTransactions.some(t => t.id === txWithId.id);
        if (exists) return false;
        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift(txWithId);
        allTransactions.unshift(txWithId);
        saveLocalTransactions(allTransactions);
        saveUserData();
        if (document.getElementById('historyModal')?.classList.contains('show')) renderHistory(currentHistoryFilter);
        return true;
    } catch (error) {
        return false;
    }
}

// ============================================================================
// SECTION 17: PRICE FETCHING (CoinGecko - Zero Waste: 3 hours cache)
// ============================================================================

async function fetchLivePrices(force = false) {
    const now = Date.now();
    const cachedPrices = localStorage.getItem('live_prices');
    if (!force && cachedPrices && (now - lastPricesLoadTime) < PRICES_CACHE_TIME) {
        const { prices, timestamp } = JSON.parse(cachedPrices);
        livePrices = prices;
        lastPricesLoadTime = timestamp;
        updateUIPrices();
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
        updateUIPrices();
    } catch (error) {
        console.error("Price fetch error:", error);
    }
}

function updateUIPrices() {
    if (currentTab === 'wallet') renderWallet();
    if (currentTab === 'swap') updateSwapRate();
    updateTotalBalance();
}

function refreshPrices() {
    fetchLivePrices(true);
    showToast(t('messages.success'), 'success');
}

// ============================================================================
// SECTION 18: UTILITY FUNCTIONS
// ============================================================================

function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (balance === undefined) balance = 0;
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (['BNB', 'ETH', 'SOL', 'TRX', 'ADA', 'TON'].includes(symbol)) return balance.toFixed(4) + ' ' + symbol;
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    if (['DOGE', 'SHIB', 'PEPE'].includes(symbol)) return balance.toLocaleString() + ' ' + symbol;
    return balance.toLocaleString() + ' ' + symbol;
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function calculateTotalBalance() {
    if (!userData) return 0;
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * (livePrices.TWT?.price || TWT_PRICE);
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
    return total;
}

function updateTotalBalance() {
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$' + calculateTotalBalance().toFixed(2);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    const icon = toast.querySelector('i');
    if (type === 'success') icon.className = 'fa-regular fa-circle-check';
    else if (type === 'error') icon.className = 'fa-regular fa-circle-xmark';
    else icon.className = 'fa-regular fa-circle-info';
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast(t('success.addressCopied'), 'success');
}

// ============================================================================
// SECTION 19: NOTIFICATION SYSTEM
// ============================================================================

function addNotification(message, type = 'info') {
    if (!userData) return;
    if (!userData.notifications) userData.notifications = [];
    const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        message: message,
        type: type,
        read: false,
        timestamp: new Date().toISOString()
    };
    userData.notifications.unshift(notification);
    saveUserData();
    updateNotificationBadge();
    showToast(message, type);
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        const unread = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'block' : 'none';
    }
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container || !userData) return;
    const notifications = userData.notifications || [];
    const controls = `<div style="display:flex;gap:10px;margin-bottom:15px;"><button onclick="clearReadNotifications()" class="btn-secondary" style="flex:1;padding:8px;"><i class="fas fa-trash"></i> ${t('notifications.clear_read')}</button><button onclick="clearAllNotifications()" class="btn-secondary" style="flex:1;padding:8px;border-color:var(--danger);color:var(--danger);"><i class="fas fa-bell-slash"></i> ${t('notifications.clear_all')}</button></div>`;
    if (notifications.length === 0) {
        container.innerHTML = controls + '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>' + t('notifications.no_notifications') + '</p></div>';
        return;
    }
    container.innerHTML = controls + notifications.map(n => {
        const d = new Date(n.timestamp);
        const fd = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `<div onclick="markNotificationRead('${n.id}')" class="notification-item ${n.read ? '' : 'unread'}" style="background:${n.read ? 'transparent' : 'rgba(41,98,255,0.05)'};padding:12px;border-radius:12px;margin-bottom:8px;cursor:pointer;"><div style="display:flex;justify-content:space-between;"><span><i class="fas ${n.type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${n.type.toUpperCase()}</span><span>${fd}</span></div><div style="margin-top:8px;">${n.message}</div></div>`;
    }).join('');
}

function markNotificationRead(id) {
    const n = userData.notifications.find(n => n.id == id);
    if (n && !n.read) {
        n.read = true;
        saveUserData();
        updateNotificationBadge();
        renderNotifications();
    }
}

function clearReadNotifications() {
    if (userData) {
        const unread = userData.notifications.filter(n => !n.read);
        userData.notifications = unread;
        saveUserData();
        updateNotificationBadge();
        renderNotifications();
        showToast(t('notifications.cleared'), 'success');
    }
}

function clearAllNotifications() {
    if (userData && confirm(t('notifications.confirm_clear_all'))) {
        userData.notifications = [];
        saveUserData();
        updateNotificationBadge();
        renderNotifications();
        showToast(t('notifications.cleared'), 'success');
    }
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.classList.add('show');
        renderNotifications();
    }
}

// ============================================================================
// SECTION 20: USER DATA MANAGEMENT
// ============================================================================

function loadUserData() {
    const stored = localStorage.getItem(`twt_user_${userId}`);
    if (stored) {
        userData = JSON.parse(stored);
        currentUser = userData.userId;
        isAdmin = currentUser === ADMIN_ID;
        return true;
    }
    return false;
}

function saveUserData() {
    if (userData) localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
}

// ============================================================================
// SECTION 21: REFERRAL SYSTEM
// ============================================================================

function processReferral() {
    const refCode = new URLSearchParams(window.location.search).get('ref');
    if (!refCode || !userData || refCode === userData.referralCode || userData.referredBy) return;
    const pendingKey = `processed_ref_${userId}`;
    if (localStorage.getItem(pendingKey) === refCode) return;
    userData.referredBy = refCode;
    userData.balances.TWT = (userData.balances.TWT || 0) + WELCOME_BONUS;
    userData.totalTwtEarned = (userData.totalTwtEarned || 0) + WELCOME_BONUS;
    userData.referralCount = (userData.referralCount || 0) + 1;
    localStorage.setItem(pendingKey, refCode);
    saveUserData();
    addNotification(t('notif.welcomeBonus'), 'success');
    if (currentTab === 'referral') renderReferral();
}

function copyReferralLink() {
    navigator.clipboard.writeText(getReferralLink());
    showToast(t('success.referralCopied'), 'success');
}

function shareReferral() {
    navigator.clipboard.writeText(`Join Trust Wallet Lite and get ${WELCOME_BONUS} TWT! ${getReferralLink()}`);
    showToast(t('success.referralCopied'), 'success');
}

// ============================================================================
// SECTION 22: RENDER WALLET (12 Cryptocurrencies)
// ============================================================================

function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="balance-card">
            <div class="total-balance" id="totalBalance">$${calculateTotalBalance().toFixed(2)}</div>
            <div class="balance-change"><i class="fas fa-arrow-up"></i> +0.00%</div>
        </div>
        <div class="action-buttons">
            <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${t('actions.send')}</span></button>
            <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-arrow-down"></i><span>${t('actions.receive')}</span></button>
            <button class="action-btn" onclick="showSwapModal()"><i class="fas fa-exchange-alt"></i><span>${t('actions.swap')}</span></button>
            <button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>${t('actions.deposit')}</span></button>
            <button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>${t('actions.withdraw')}</span></button>
        </div>
        <div class="section-tabs">
            <button class="section-tab active">Crypto</button>
            <button class="section-tab">NFTs</button>
        </div>
        <div id="assetsList" class="assets-list"></div>
    `;
    renderAssets();
}

function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    container.innerHTML = ALL_ASSETS.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol]?.price || (asset.symbol === 'USDT' ? 1 : 0);
        const value = balance * price;
        const change = livePrices[asset.symbol]?.change || 0;
        return `
            <div class="asset-item" onclick="showAssetDetails('${asset.symbol}')">
                <div class="asset-left">
                    <img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img">
                    <div class="asset-info">
                        <h4>${asset.name}</h4>
                        <p>${asset.symbol} <span class="asset-change ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></p>
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
    const price = livePrices[symbol]?.price || 0;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(balance * price)})`, 'info');
}

// ============================================================================
// SECTION 23: RENDER REFERRAL (8 Milestones)
// ============================================================================

function renderReferral() {
    const container = document.getElementById('referralContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="referral-stats">
            <h3>${t('referral.totalReferrals')}</h3>
            <div class="stat-number">${userData.referralCount || 0}</div>
            <h3>${t('referral.twtEarned')}</h3>
            <div class="stat-number">${(userData.totalTwtEarned || 0).toLocaleString()} TWT</div>
            <h3>${t('referral.usdtEarned')}</h3>
            <div class="stat-number">${(userData.totalUsdtEarned || 0).toFixed(2)} USDT</div>
        </div>
        <div class="referral-link-card">
            <h4>${t('referral.yourLink')}</h4>
            <div class="link-container">
                <input type="text" id="referralLink" value="${getReferralLink()}" readonly>
                <button class="copy-btn" onclick="copyReferralLink()"><i class="fas fa-copy"></i></button>
                <button class="share-btn" onclick="shareReferral()"><i class="fas fa-share-alt"></i></button>
            </div>
            <p>${t('referral.description')} ${REFERRAL_BONUS} ${t('referral.description2')}</p>
        </div>
        <div id="milestonesList" class="milestones-list"></div>
    `;
    renderMilestones();
}

function renderMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container) return;
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const progress = Math.min((userData.referralCount / m.referrals) * 100, 100);
        const canClaim = userData.referralCount >= m.referrals && !userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        const claimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        return `
            <div class="milestone-item">
                <div class="milestone-header">
                    <span class="milestone-referrals"><i class="fa-regular ${m.icon}"></i> ${m.referrals} Referrals</span>
                    <span class="milestone-reward">${m.reward} ${m.unit}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                <div class="progress-text">${userData.referralCount}/${m.referrals}</div>
                ${canClaim ? `<button class="claim-btn" onclick="claimReferralMilestone(${m.referrals})">Claim Reward</button>` : claimed ? '<button class="claim-btn completed" disabled>Claimed</button>' : ''}
            </div>
        `;
    }).join('');
}

function claimReferralMilestone(referrals) {
    const m = REFERRAL_MILESTONES.find(x => x.referrals === referrals);
    if (!userData.referralMilestones) userData.referralMilestones = REFERRAL_MILESTONES.map(x => ({ ...x, claimed: false }));
    const idx = userData.referralMilestones.findIndex(x => x.referrals === referrals);
    if (idx === -1 || userData.referralMilestones[idx].claimed) return;
    if (userData.referralCount < referrals) {
        showToast(`Need ${referrals} referrals`, 'error');
        return;
    }
    if (m.unit === 'TWT') {
        userData.balances.TWT += m.reward;
        userData.totalTwtEarned += m.reward;
    } else {
        userData.balances.USDT += m.reward;
        userData.totalUsdtEarned += m.reward;
    }
    userData.referralMilestones[idx].claimed = true;
    addTransaction({ type: 'referral_reward', amount: m.reward, currency: m.unit, details: `Milestone: ${referrals} referrals` });
    saveUserData();
    renderMilestones();
    updateUI();
    showToast(`🎉 Claimed ${m.reward} ${m.unit}!`, 'success');
}

// ============================================================================
// SECTION 24: SWAP FUNCTIONS (DEX with 0.3% fee)
// ============================================================================

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
                        <img id="swapFromIcon" src="${getCurrencyIcon('TWT')}">
                        <span id="swapFromSymbol">TWT</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="balance-hint">Balance: <span id="swapFromBalance">${formatBalance(userData.balances.TWT || 0, 'TWT')}</span>
                    <span class="percentage-buttons">
                        <button onclick="setSwapPercentage(25)">25%</button>
                        <button onclick="setSwapPercentage(50)">50%</button>
                        <button onclick="setSwapPercentage(100)">Max</button>
                    </span>
                </div>
            </div>
            <div class="swap-arrow"><i class="fas fa-arrow-down"></i></div>
            <div class="swap-box">
                <div class="swap-label">${t('swap.to')}</div>
                <div class="swap-row">
                    <input type="number" id="swapToAmount" placeholder="0.00" readonly>
                    <div class="currency-selector-small" onclick="showSwapCurrencySelector('to')">
                        <img id="swapToIcon" src="${getCurrencyIcon('USDT')}">
                        <span id="swapToSymbol">USDT</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="balance-hint">Balance: <span id="swapToBalance">${formatBalance(userData.balances.USDT || 0, 'USDT')}</span></div>
            </div>
            <div class="swap-rate" id="swapRateDisplay">1 TWT ≈ $${(livePrices.TWT?.price || TWT_PRICE).toFixed(4)}</div>
            <div class="swap-fee"><span>${t('swap.swapperFee')}</span><span id="swapFee">$0.00</span></div>
            <div class="swap-provider"><span>${t('swap.provider')}</span><span>Rango</span></div>
            <button id="confirmSwapBtn" class="btn-primary" onclick="confirmSwap()"><i class="fas fa-exchange-alt"></i> ${t('actions.confirmSwap')}</button>
        </div>
    `;
    updateSwapRate();
}

function updateSwapBalances() {
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    document.getElementById('swapFromBalance').textContent = formatBalance(userData.balances[fromSym] || 0, fromSym);
    document.getElementById('swapToBalance').textContent = formatBalance(userData.balances[toSym] || 0, toSym);
}

function setSwapPercentage(percent) {
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const balance = userData.balances[fromSym] || 0;
    let amount = balance * (percent / 100);
    if (fromSym === 'TWT' || fromSym === 'SHIB' || fromSym === 'PEPE' || fromSym === 'DOGE') amount = Math.floor(amount);
    else amount = parseFloat(amount.toFixed(6));
    document.getElementById('swapFromAmount').value = amount;
    calculateSwap();
}

function calculateSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    const fromPrice = livePrices[fromSym]?.price || (fromSym === 'USDT' ? 1 : TWT_PRICE);
    const toPrice = livePrices[toSym]?.price || (toSym === 'USDT' ? 1 : TWT_PRICE);
    let toAmount = 0;
    if (fromPrice > 0 && toPrice > 0) toAmount = (fromAmount * fromPrice) / toPrice;
    document.getElementById('swapToAmount').value = toAmount.toFixed(6);
    updateSwapRate();
    const fee = fromAmount * fromPrice * SWAP_FEE_PERCENT;
    document.getElementById('swapFee').textContent = `$${fee.toFixed(4)}`;
}

function updateSwapRate() {
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    const fromPrice = livePrices[fromSym]?.price || (fromSym === 'USDT' ? 1 : TWT_PRICE);
    const toPrice = livePrices[toSym]?.price || (toSym === 'USDT' ? 1 : TWT_PRICE);
    let rateText = '';
    if (fromPrice > 0 && toPrice > 0) rateText = `1 ${fromSym} ≈ ${(fromPrice / toPrice).toFixed(6)} ${toSym}`;
    document.getElementById('swapRateDisplay').textContent = rateText;
}

function confirmSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    const toAmount = parseFloat(document.getElementById('swapToAmount')?.value) || 0;
    if (!fromAmount || fromAmount <= 0) {
        showToast(t('error.enterAmount'), 'error');
        return;
    }
    if ((userData.balances[fromSym] || 0) < fromAmount) {
        showToast(t('error.insufficientBalance', { currency: fromSym }), 'error');
        return;
    }
    const fromPrice = livePrices[fromSym]?.price || (fromSym === 'USDT' ? 1 : TWT_PRICE);
    const fee = fromAmount * fromPrice * SWAP_FEE_PERCENT;
    let finalFromAmount = fromAmount;
    if (fromSym === 'USDT') finalFromAmount = fromAmount - (fee / fromPrice);
    if (finalFromAmount <= 0) {
        showToast('Amount too small after fee', 'error');
        return;
    }
    userData.balances[fromSym] -= finalFromAmount;
    userData.balances[toSym] = (userData.balances[toSym] || 0) + toAmount;
    addTransaction({ type: 'swap', fromAmount: finalFromAmount, fromCurrency: fromSym, toAmount, toCurrency: toSym, fee });
    saveUserData();
    updateUI();
    showToast(t('success.swapCompleted', { fromAmount: formatBalance(finalFromAmount, fromSym), fromCurrency: fromSym, toAmount: formatBalance(toAmount, toSym), toCurrency: toSym }), 'success');
    closeModal('swapModal');
    document.getElementById('swapFromAmount').value = '';
}

// ============================================================================
// SECTION 25: SEND & RECEIVE FUNCTIONS
// ============================================================================

function showSendModal() {
    document.getElementById('sendModal').classList.add('show');
}

function showReceiveModal() {
    updateReceiveAddress();
    document.getElementById('receiveModal').classList.add('show');
}

function sendTransaction() {
    const currency = document.getElementById('sendCurrencySymbol')?.textContent || 'TWT';
    const amount = parseFloat(document.getElementById('sendAmount')?.value);
    const address = document.getElementById('sendAddress')?.value.trim();
    if (!amount || amount <= 0) {
        showToast(t('error.enterAmount'), 'error');
        return;
    }
    if (!address) {
        showToast('Enter address', 'error');
        return;
    }
    if ((userData.balances[currency] || 0) < amount) {
        showToast(t('error.insufficientBalance', { currency }), 'error');
        return;
    }
    userData.balances[currency] -= amount;
    addTransaction({ type: 'send', amount, currency, address, status: 'completed' });
    saveUserData();
    updateUI();
    showToast(`✅ Sent ${formatBalance(amount, currency)}`, 'success');
    closeModal('sendModal');
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendAddress').value = '';
}

function updateReceiveAddress() {
    const currency = document.getElementById('receiveCurrencySymbol')?.textContent || 'TWT';
    generateDepositAddress(userId, currency).then(addr => {
        document.getElementById('receiveAddress').textContent = addr;
    });
}

function copyAddress() {
    const addr = document.getElementById('receiveAddress')?.textContent;
    if (addr) copyToClipboard(addr);
}

// ============================================================================
// SECTION 26: DEPOSIT FUNCTIONS (Unique addresses per user)
// ============================================================================

async function showDepositModal() {
    await updateDepositInfo();
    document.getElementById('depositModal').classList.add('show');
}

async function updateDepositInfo() {
    const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
    const address = await generateDepositAddress(userId, currency);
    document.getElementById('depositAddress').textContent = address;
    document.getElementById('depositMinAmount').textContent = DEPOSIT_MINIMUMS[currency] || 10;
}

function copyDepositAddress() {
    const addr = document.getElementById('depositAddress')?.textContent;
    if (addr) copyToClipboard(addr);
}

function submitDeposit() {
    const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
    const amount = parseFloat(document.getElementById('depositAmount')?.value);
    const txHash = document.getElementById('depositTxHash')?.value.trim() || '';
    if (!amount || amount <= 0) {
        showToast(t('error.enterAmount'), 'error');
        return;
    }
    const min = DEPOSIT_MINIMUMS[currency] || 10;
    if (amount < min) {
        showToast(t('error.minDeposit', { min, currency }), 'error');
        return;
    }
    const req = { id: 'dep_' + Date.now(), userId, currency, amount, txHash, status: 'pending', timestamp: new Date().toISOString() };
    if (!userData.depositRequests) userData.depositRequests = [];
    userData.depositRequests.push(req);
    addTransaction({ ...req, type: 'deposit' });
    saveUserData();
    addNotification(`💰 Deposit request: ${amount} ${currency} submitted. Waiting for admin approval.`, 'info');
    showToast(t('success.depositSubmitted', { amount, currency }), 'success');
    closeModal('depositModal');
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositTxHash').value = '';
}

// ============================================================================
// SECTION 27: WITHDRAW FUNCTIONS
// ============================================================================

function showWithdrawModal() {
    updateWithdrawInfo();
    document.getElementById('withdrawModal').classList.add('show');
}

function updateWithdrawInfo() {
    const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
    document.getElementById('withdrawMinAmount').textContent = WITHDRAW_MINIMUMS[currency] || 10;
    document.getElementById('withdrawFee').textContent = (WITHDRAW_FEES[currency] || 1) + ' ' + currency;
}

function submitWithdrawal() {
    const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
    const address = document.getElementById('withdrawAddress')?.value.trim();
    if (!amount || amount <= 0) {
        showToast(t('error.enterAmount'), 'error');
        return;
    }
    if (!address) {
        showToast('Enter address', 'error');
        return;
    }
    const min = WITHDRAW_MINIMUMS[currency] || 10;
    if (amount < min) {
        showToast(`Minimum withdrawal is ${min} ${currency}`, 'error');
        return;
    }
    const fee = WITHDRAW_FEES[currency] || 1;
    const totalNeeded = amount + fee;
    if ((userData.balances[currency] || 0) < totalNeeded) {
        showToast(`Insufficient balance (need ${totalNeeded} ${currency})`, 'error');
        return;
    }
    userData.balances[currency] -= totalNeeded;
    const req = { id: 'wd_' + Date.now(), userId, currency, amount, fee, address, status: 'pending', timestamp: new Date().toISOString() };
    if (!userData.withdrawalRequests) userData.withdrawalRequests = [];
    userData.withdrawalRequests.push(req);
    addTransaction({ ...req, type: 'withdraw' });
    saveUserData();
    addNotification(`💸 Withdrawal request: ${amount} ${currency} submitted. Waiting for admin approval.`, 'info');
    showToast(t('success.withdrawSubmitted', { amount, currency }), 'success');
    closeModal('withdrawModal');
    updateUI();
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawAddress').value = '';
}

// ============================================================================
// SECTION 28: TWT PAY VIRTUAL CARD
// ============================================================================

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const twtBalance = userData.balances.TWT || 0;
    const twtValue = twtBalance * (livePrices.TWT?.price || TWT_PRICE);
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
function showCardTransactions() {
    const txs = (userData.transactions || []).filter(t => t.currency === 'TWT' || t.fromCurrency === 'TWT' || t.toCurrency === 'TWT');
    if (txs.length === 0) { showToast('No TWT transactions', 'info'); return; }
    let msg = '💳 TWT Card Transactions:\n\n';
    txs.slice(0, 10).forEach(tx => {
        const d = new Date(tx.timestamp).toLocaleDateString();
        if (tx.type === 'send' && tx.currency === 'TWT') msg += `📤 Sent ${tx.amount} TWT (${d})\n`;
        else if (tx.type === 'swap' && tx.toCurrency === 'TWT') msg += `🔄 Received ${tx.toAmount?.toFixed(4)} TWT (${d})\n`;
        else if (tx.type === 'swap' && tx.fromCurrency === 'TWT') msg += `🔄 Sent ${tx.fromAmount} TWT (${d})\n`;
        else if (tx.type === 'referral_reward' && tx.currency === 'TWT') msg += `🎉 Referral +${tx.amount} TWT (${d})\n`;
    });
    alert(msg);
}

// ============================================================================
// SECTION 29: SETTINGS
// ============================================================================

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()">
                <i class="fas fa-bell"></i><div class="info"><div class="label">${t('notifications.title')}</div><div class="desc">View all notifications</div></div><i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showTransactionHistory()">
                <i class="fas fa-history"></i><div class="info"><div class="label">${t('history.title')}</div><div class="desc">View all transactions</div></div><i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showRecoveryPhrase()">
                <i class="fas fa-key"></i><div class="info"><div class="label">${t('settings.recovery')}</div><div class="desc">View your backup phrase</div></div><i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleLanguage()">
                <i class="fas fa-language"></i><div class="info"><div class="label">${t('settings.language')}</div><div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div></div><i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleTheme()">
                <i class="fas fa-moon"></i><div class="info"><div class="label">${t('settings.theme')}</div><div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div></div><i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i><div class="info"><div class="label">${t('settings.logout')}</div><div class="desc">Sign out of your wallet</div></div>
            </div>
        </div>
        <div style="text-align:center;margin-top:24px;"><span style="font-size:10px;">Trust Wallet Lite v2.0</span></div>
    `;
}

function showRecoveryPhrase() {
    if (!userData.recoveryPhrase) {
        const words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'];
        const selected = [];
        for (let i = 0; i < 12; i++) selected.push(words[Math.floor(Math.random() * words.length)]);
        userData.recoveryPhrase = selected.join(' ');
        saveUserData();
    }
    document.getElementById('recoveryPhraseDisplay').innerHTML = `<div class="recovery-phrase-box" style="background:var(--bg-secondary);padding:20px;border-radius:16px;font-family:monospace;word-break:break-all;margin-bottom:16px;">${userData.recoveryPhrase}</div>`;
    document.getElementById('recoveryModal').classList.add('show');
}

function copyRecoveryPhrase() {
    if (userData.recoveryPhrase) copyToClipboard(userData.recoveryPhrase);
}

function showTransactionHistory() {
    showHistory();
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem(`twt_user_${userId}`);
        userData = null;
        showOnboarding();
    }
}

// ============================================================================
// SECTION 30: HISTORY
// ============================================================================

function renderHistory(filter = 'all') {
    const container = document.getElementById('historyList');
    if (!container) return;
    currentHistoryFilter = filter;
    let transactions = loadLocalTransactions();
    if (filter !== 'all') transactions = transactions.filter(tx => tx.type === filter);
    if (transactions.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p></div>';
        return;
    }
    container.innerHTML = transactions.map(tx => {
        const d = new Date(tx.timestamp);
        const fd = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let icon = 'fa-circle-down', typeClass = 'deposit', typeText = 'Deposit';
        if (tx.type === 'withdraw') { icon = 'fa-circle-up'; typeClass = 'withdraw'; typeText = 'Withdrawal'; }
        else if (tx.type === 'swap') { icon = 'fa-arrow-right-arrow-left'; typeClass = 'swap'; typeText = 'Swap'; }
        else if (tx.type === 'referral_reward') { icon = 'fa-users'; typeClass = 'referral'; typeText = 'Referral'; }
        let statusClass = 'completed', statusText = 'Completed';
        if (tx.status === 'pending') { statusClass = 'pending'; statusText = 'Pending'; }
        return `<div class="history-item"><div class="history-item-header"><div class="history-type ${typeClass}"><i class="fa-regular ${icon}"></i><span>${typeText}</span></div><span class="history-status ${statusClass}">${statusText}</span></div><div class="history-details"><span class="history-amount">${tx.amount} ${tx.currency || tx.fromCurrency || 'TWT'}</span><span class="history-date">${fd}</span></div>${tx.details ? `<div style="font-size:11px;margin-top:5px;">${tx.details}</div>` : ''}</div>`;
    }).join('');
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.add('show');
        renderHistory('all');
    }
}

function filterHistory(filter) {
    document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    renderHistory(filter);
}

// ============================================================================
// SECTION 31: ADMIN PANEL
// ============================================================================

function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    document.getElementById('adminPanel').classList.add('show');
    refreshAdminPanel();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.remove('show');
}

function refreshAdminPanel() {
    const activeTab = document.querySelector('.admin-tab.active')?.textContent.toLowerCase().includes('deposit') ? 'deposits' : 'withdrawals';
    showAdminTab(activeTab);
}

function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    const content = document.getElementById('adminContent');
    if (!content) return;
    if (tab === 'deposits') {
        const deposits = userData?.depositRequests?.filter(d => d.status === 'pending') || [];
        if (deposits.length === 0) content.innerHTML = '<div class="empty-state">No pending deposits</div>';
        else content.innerHTML = deposits.map(d => `<div class="admin-transaction-card"><div class="admin-tx-header"><span class="admin-tx-type deposit">DEPOSIT</span><span class="admin-tx-status pending">Pending</span></div><p><strong>User:</strong> ${d.userId}</p><p><strong>Amount:</strong> ${d.amount} ${d.currency}</p><p><strong>TX Hash:</strong> ${d.txHash?.substring(0, 20) || 'N/A'}</p><div class="admin-tx-actions"><button class="admin-approve-btn" onclick="approveDeposit('${d.id}')">Approve</button><button class="admin-reject-btn" onclick="rejectDeposit('${d.id}')">Reject</button></div></div>`).join('');
    } else if (tab === 'withdrawals') {
        const withdrawals = userData?.withdrawalRequests?.filter(w => w.status === 'pending') || [];
        if (withdrawals.length === 0) content.innerHTML = '<div class="empty-state">No pending withdrawals</div>';
        else content.innerHTML = withdrawals.map(w => `<div class="admin-transaction-card"><div class="admin-tx-header"><span class="admin-tx-type withdraw">WITHDRAWAL</span><span class="admin-tx-status pending">Pending</span></div><p><strong>User:</strong> ${w.userId}</p><p><strong>Amount:</strong> ${w.amount} ${w.currency}</p><p><strong>Address:</strong> ${w.address?.substring(0, 20)}...</p><p><strong>Fee:</strong> ${w.fee} ${w.currency}</p><div class="admin-tx-actions"><button class="admin-approve-btn" onclick="approveWithdrawal('${w.id}')">Approve</button><button class="admin-reject-btn" onclick="rejectWithdrawal('${w.id}')">Reject</button></div></div>`).join('');
    } else if (tab === 'users') {
        content.innerHTML = `<div style="padding:20px;"><input type="text" id="adminUserIdInput" placeholder="Enter User ID" class="modal-input"><button onclick="adminLoadUser()" class="btn-primary" style="width:100%;margin-top:10px;">Search User</button><div id="adminUserStats"></div></div>`;
    } else if (tab === 'stats') {
        content.innerHTML = `<div class="stats-grid"><div class="stat-card"><h3>TWT Price</h3><div class="stat-value">$${(livePrices.TWT?.price || TWT_PRICE).toFixed(4)}</div></div><div class="stat-card"><h3>Your TWT</h3><div class="stat-value">${(userData?.balances.TWT || 0).toLocaleString()}</div></div><div class="stat-card"><h3>Total Referrals</h3><div class="stat-value">${userData?.referralCount || 0}</div></div><div class="stat-card"><h3>Pending Requests</h3><div class="stat-value">${(userData?.depositRequests?.filter(d => d.status === 'pending').length || 0) + (userData?.withdrawalRequests?.filter(w => w.status === 'pending').length || 0)}</div></div></div>`;
    }
}

function approveDeposit(id) {
    const d = userData.depositRequests?.find(x => x.id === id);
    if (d) {
        d.status = 'approved';
        userData.balances[d.currency] = (userData.balances[d.currency] || 0) + d.amount;
        addNotification(t('notif.depositApproved', { amount: d.amount, currency: d.currency }), 'success');
        saveUserData();
        updateUI();
        refreshAdminPanel();
        showToast('Deposit approved', 'success');
    }
}

function rejectDeposit(id) {
    const d = userData.depositRequests?.find(x => x.id === id);
    if (d) {
        d.status = 'rejected';
        addNotification(t('notif.depositRejected', { reason: 'Admin rejected' }), 'error');
        saveUserData();
        refreshAdminPanel();
        showToast('Deposit rejected', 'warning');
    }
}

function approveWithdrawal(id) {
    const w = userData.withdrawalRequests?.find(x => x.id === id);
    if (w) {
        w.status = 'approved';
        addNotification(t('notif.withdrawApproved', { amount: w.amount, currency: w.currency }), 'success');
        saveUserData();
        refreshAdminPanel();
        showToast('Withdrawal approved', 'success');
    }
}

function rejectWithdrawal(id) {
    const w = userData.withdrawalRequests?.find(x => x.id === id);
    if (w) {
        w.status = 'rejected';
        userData.balances[w.currency] = (userData.balances[w.currency] || 0) + w.amount + (w.fee || 0);
        addNotification(t('notif.withdrawRejected', { reason: 'Admin rejected' }), 'error');
        saveUserData();
        updateUI();
        refreshAdminPanel();
        showToast('Withdrawal rejected', 'warning');
    }
}

function adminLoadUser() {
    const uid = document.getElementById('adminUserIdInput')?.value.trim();
    const stats = document.getElementById('adminUserStats');
    if (!uid) { showToast('Enter User ID', 'error'); return; }
    if (uid === userId) {
        stats.innerHTML = `<div class="admin-transaction-card"><h4>User: ${userData.userName}</h4><p><strong>ID:</strong> ${userData.userId}</p><p><strong>Referrals:</strong> ${userData.referralCount}</p><p><strong>TWT:</strong> ${userData.balances.TWT?.toLocaleString()}</p><p><strong>USDT:</strong> $${userData.balances.USDT?.toFixed(2)}</p><div style="display:flex;gap:10px;margin-top:16px;"><button onclick="adminAddBalance()" class="admin-approve-btn">Add Balance</button><button onclick="adminRemoveBalance()" class="admin-reject-btn">Remove Balance</button><button onclick="adminBlockUser()" class="admin-reject-btn" style="background:#dc2626;">Block User</button></div></div>`;
    } else {
        stats.innerHTML = '<div style="padding:20px;text-align:center;">User not found (demo mode)</div>';
    }
}

function adminAddBalance() {
    const cur = prompt('Currency (TWT, USDT, etc.):', 'TWT');
    if (!cur) return;
    const amount = parseFloat(prompt(`Amount to ADD (${cur}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    userData.balances[cur] = (userData.balances[cur] || 0) + amount;
    saveUserData();
    updateUI();
    showToast(`✅ Added ${amount} ${cur}`, 'success');
    adminLoadUser();
}

function adminRemoveBalance() {
    const cur = prompt('Currency (TWT, USDT, etc.):', 'TWT');
    if (!cur) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${cur}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    userData.balances[cur] = Math.max(0, (userData.balances[cur] || 0) - amount);
    saveUserData();
    updateUI();
    showToast(`✅ Removed ${amount} ${cur}`, 'success');
    adminLoadUser();
}

function adminBlockUser() {
    if (confirm('⚠️ PERMANENT BLOCK WARNING ⚠️\n\nAre you sure you want to permanently block this user from withdrawals?\n\nTHIS ACTION CANNOT BE UNDONE!')) {
        userData.withdrawBlocked = true;
        saveUserData();
        showToast('User permanently blocked from withdrawals', 'warning');
        adminLoadUser();
    }
}

// ============================================================================
// SECTION 32: CURRENCY SELECTOR
// ============================================================================

function showCurrencySelector(context) {
    currentCurrencySelector = context;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    list.innerHTML = ALL_ASSETS.map(asset => `<div class="currency-list-item" onclick="selectCurrency('${asset.symbol}')"><img src="${getCurrencyIcon(asset.symbol)}"><div class="currency-list-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div></div>`).join('');
    modal.classList.add('show');
}

function showSwapCurrencySelector(context) {
    currentSwapContext = context;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    list.innerHTML = ALL_ASSETS.map(asset => `<div class="currency-list-item" onclick="selectSwapCurrency('${asset.symbol}')"><img src="${getCurrencyIcon(asset.symbol)}"><div><h4>${asset.name}</h4><p>${asset.symbol}</p></div></div>`).join('');
    modal.classList.add('show');
}

function selectCurrency(symbol) {
    if (currentCurrencySelector === 'send') {
        document.getElementById('sendCurrencySymbol').textContent = symbol;
        document.getElementById('sendCurrencyIcon').src = getCurrencyIcon(symbol);
    } else if (currentCurrencySelector === 'receive') {
        document.getElementById('receiveCurrencySymbol').textContent = symbol;
        document.getElementById('receiveCurrencyIcon').src = getCurrencyIcon(symbol);
        updateReceiveAddress();
    } else if (currentCurrencySelector === 'deposit') {
        document.getElementById('depositCurrencySymbol').textContent = symbol;
        document.getElementById('depositCurrencyIcon').src = getCurrencyIcon(symbol);
        updateDepositInfo();
    } else if (currentCurrencySelector === 'withdraw') {
        document.getElementById('withdrawCurrencySymbol').textContent = symbol;
        document.getElementById('withdrawCurrencyIcon').src = getCurrencyIcon(symbol);
        updateWithdrawInfo();
    }
    closeModal('currencySelectorModal');
}

function selectSwapCurrency(symbol) {
    if (currentSwapContext === 'from') {
        document.getElementById('swapFromSymbol').textContent = symbol;
        document.getElementById('swapFromIcon').src = getCurrencyIcon(symbol);
        updateSwapBalances();
        calculateSwap();
    } else if (currentSwapContext === 'to') {
        document.getElementById('swapToSymbol').textContent = symbol;
        document.getElementById('swapToIcon').src = getCurrencyIcon(symbol);
        updateSwapBalances();
        calculateSwap();
    }
    closeModal('currencySelectorModal');
}

function filterCurrencies() {
    const search = document.getElementById('currencySearch')?.value.toLowerCase() || '';
    document.querySelectorAll('.currency-list-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(search) ? 'flex' : 'none';
    });
}

// ============================================================================
// SECTION 33: NAVIGATION & UI
// ============================================================================

function setupNavbar() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${tab}"]`)?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}Section`)?.classList.add('active');
    if (tab === 'wallet') renderWallet();
    else if (tab === 'swap') renderSwap();
    else if (tab === 'referral') renderReferral();
    else if (tab === 'twtpay') renderTWTPay();
    else if (tab === 'settings') renderSettings();
    showRandomSticker();
}

function updateUI() {
    updateTotalBalance();
    updateNotificationBadge();
    if (currentTab === 'wallet') renderWallet();
    else if (currentTab === 'swap') renderSwap();
    else if (currentTab === 'referral') renderReferral();
    else if (currentTab === 'twtpay') renderTWTPay();
    else if (currentTab === 'settings') renderSettings();
}

// ============================================================================
// SECTION 34: ONBOARDING
// ============================================================================

function showOnboarding() {
    document.getElementById('onboardingScreen').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

function showMainApp() {
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    switchTab('wallet');
}

function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    setTimeout(() => {
        const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        const { publicKey, privateKey } = generateWalletKeys();
        userData = {
            userId: newUserId,
            userName: 'User',
            publicKey: publicKey,
            privateKey: privateKey,
            referralCode: generateReferralCode(),
            balances: { TWT: WELCOME_BONUS, USDT: 0, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
            referralCount: 0,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            transactions: [],
            depositRequests: [],
            withdrawalRequests: [],
            totalTwtEarned: WELCOME_BONUS,
            totalUsdtEarned: 0,
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        currentUser = newUserId;
        isAdmin = currentUser === ADMIN_ID;
        saveUserData();
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        processReferral();
        showToast(`🎉 Welcome! You received ${WELCOME_BONUS} TWT!`, 'success');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 500);
}

function showImportModal() {
    document.getElementById('importModal').classList.add('show');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('show');
    document.getElementById('importPhrase').value = '';
}

function importWallet() {
    const phrase = document.getElementById('importPhrase').value.trim();
    if (!phrase) { showToast('Enter recovery phrase', 'error'); return; }
    const btn = document.getElementById('confirmImportBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    setTimeout(() => {
        const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        const { publicKey, privateKey } = generateWalletKeys();
        userData = {
            userId: newUserId,
            userName: 'User',
            publicKey: publicKey,
            privateKey: privateKey,
            recoveryPhrase: phrase,
            referralCode: generateReferralCode(),
            balances: { TWT: WELCOME_BONUS, USDT: 0, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
            referralCount: 0,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            transactions: [],
            depositRequests: [],
            withdrawalRequests: [],
            totalTwtEarned: WELCOME_BONUS,
            totalUsdtEarned: 0,
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        currentUser = newUserId;
        isAdmin = currentUser === ADMIN_ID;
        saveUserData();
        closeImportModal();
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        processReferral();
        showToast(`🎉 Wallet imported! You received ${WELCOME_BONUS} TWT!`, 'success');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 500);
}

// ============================================================================
// SECTION 35: INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 1500);
    await fetchLivePrices();
    setInterval(fetchLivePrices, 1800000);
    if (loadUserData()) {
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        processReferral();
    } else {
        showOnboarding();
    }
    setupNavbar();
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('scrollTopBtn');
        if (btn) btn.classList.toggle('show', window.scrollY > 300);
    });
    setTimeout(() => {
        const notifBtn = document.getElementById('notificationBtn');
        if (notifBtn) {
            const newBtn = notifBtn.cloneNode(true);
            notifBtn.parentNode?.replaceChild(newBtn, notifBtn);
            newBtn.addEventListener('click', showNotifications);
        }
    }, 1000);
    setTimeout(() => showRandomSticker(), 500);
});

// ============================================================================
// SECTION 36: EXPORT FUNCTIONS
// ============================================================================

window.showWallet = () => switchTab('wallet');
window.showSwap = () => switchTab('swap');
window.showReferral = () => switchTab('referral');
window.showTWTPay = () => switchTab('twtpay');
window.showSettings = () => switchTab('settings');
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.showSwapModal = () => document.getElementById('swapModal').classList.add('show');
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;
window.sendTransaction = sendTransaction;
window.confirmSwap = confirmSwap;
window.submitDeposit = submitDeposit;
window.submitWithdrawal = submitWithdrawal;
window.copyAddress = copyAddress;
window.copyDepositAddress = copyDepositAddress;
window.copyReferralLink = copyReferralLink;
window.shareReferral = shareReferral;
window.refreshPrices = refreshPrices;
window.scrollToTop = scrollToTop;
window.setSwapPercentage = setSwapPercentage;
window.calculateSwap = calculateSwap;
window.claimReferralMilestone = claimReferralMilestone;
window.showRecoveryPhrase = showRecoveryPhrase;
window.copyRecoveryPhrase = copyRecoveryPhrase;
window.logout = logout;
window.showTopUpModal = showTopUpModal;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;
window.filterHistory = filterHistory;
window.showCurrencySelector = showCurrencySelector;
window.showSwapCurrencySelector = showSwapCurrencySelector;
window.selectCurrency = selectCurrency;
window.selectSwapCurrency = selectSwapCurrency;
window.filterCurrencies = filterCurrencies;
window.showAdminTab = showAdminTab;
window.refreshAdminPanel = refreshAdminPanel;
window.approveDeposit = approveDeposit;
window.rejectDeposit = rejectDeposit;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.adminLoadUser = adminLoadUser;
window.adminAddBalance = adminAddBalance;
window.adminRemoveBalance = adminRemoveBalance;
window.adminBlockUser = adminBlockUser;
window.markNotificationRead = markNotificationRead;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.showToast = showToast;
window.copyToClipboard = copyToClipboard;
window.showAssetDetails = showAssetDetails;
window.createNewWallet = createNewWallet;
window.showImportModal = showImportModal;
window.importWallet = importWallet;
window.closeImportModal = closeImportModal;

console.log("✅ Trust Wallet Lite v2.0 - Fully Loaded!");
console.log("✅ 12 Cryptocurrencies | 8 Referral Milestones | TWT Pay Card");
console.log("✅ Unique Deposit Addresses per User | CoinPayments API Ready");
console.log("✅ Zero Waste Architecture | Dark/Light Mode | RTL Support");
