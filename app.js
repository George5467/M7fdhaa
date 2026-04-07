// ============================================================================
// TRUST WALLET LITE - ULTIMATE PROFESSIONAL VERSION (REFI STYLE)
// مستنسخ من REFI NETWORK بالكامل مع تعديل لـ TWT و Backend API
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
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

// ====== 2. ADMIN SYSTEM (مثل REFI) ======
const ADMIN_ID = "1653918641";
let isAdmin = userId === ADMIN_ID;

// إضافة تاج المشرف (مثل REFI)
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

// ====== 3. CONSTANTS (معدلة لـ TWT) ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const AIRDROP_BONUS = 10;  // 10 USDT للمستخدم الجديد
const REFERRAL_BONUS = 25; // 25 USDT لكل إحالة
const TWT_PRICE = 1.25;    // سعر TWT التقريبي
const SWAP_RATE = 500000;   // 1 USDT = 500,000 TWT

// ====== 4. ICONS (مثل REFI مع تعديل لـ TWT) ======
const CMC_ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    TON: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
    ADA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
    DOGE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png',
    SHIB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
    PEPE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png',
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png'
};

// ====== 5. DEPOSIT ADDRESSES (مثل REFI) ======
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

// ====== 6. REFERRAL MILESTONES (مثل REFI) ======
const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' }
];

// ====== 7. TOP CRYPTOS (مثل REFI) ======
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

// ====== 8. SWAP CURRENCIES (مثل REFI) ======
const SWAP_CURRENCIES = [
    { symbol: 'USDT', name: 'Tether', icon: CMC_ICONS.USDT },
    { symbol: 'TWT', name: 'Trust Wallet Token', icon: CMC_ICONS.TWT },
    { symbol: 'BNB', name: 'Binance Coin', icon: CMC_ICONS.BNB },
    { symbol: 'ETH', name: 'Ethereum', icon: CMC_ICONS.ETH },
    { symbol: 'SOL', name: 'Solana', icon: CMC_ICONS.SOL },
    { symbol: 'SHIB', name: 'Shiba Inu', icon: CMC_ICONS.SHIB },
    { symbol: 'PEPE', name: 'Pepe', icon: CMC_ICONS.PEPE },
    { symbol: 'TRX', name: 'TRON', icon: CMC_ICONS.TRX }
];

// ====== 9. ALL ASSETS (مثل REFI) ======
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

// ====== 10. STATE MANAGEMENT (مثل REFI) ======
let userData = null;
let livePrices = {};
let currentLanguage = localStorage.getItem('preferred_language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let unreadNotifications = 0;
let appInitialized = false;

// متغيرات لتتبع وقت آخر تحميل
let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;
const USER_CACHE_TIME = 300000; // 5 دقائق
const PRICES_CACHE_TIME = 10800000; // 3 ساعات

// ====== 11. TRANSLATIONS (مثل REFI بالكامل) ======
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

// ====== 12. UTILITY FUNCTIONS (مثل REFI) ======
function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function getCurrencyName(symbol) {
    const names = {
        TWT: 'Trust Wallet Token',
        USDT: 'Tether',
        BNB: 'BNB',
        BTC: 'Bitcoin',
        ETH: 'Ethereum',
        SOL: 'Solana',
        ADA: 'Cardano',
        DOGE: 'Dogecoin',
        SHIB: 'Shiba Inu',
        PEPE: 'Pepe',
        TON: 'Toncoin',
        TRX: 'TRON'
    };
    return names[symbol] || symbol;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT' || symbol === 'SHIB' || symbol === 'PEPE') {
        return balance.toLocaleString() + ' ' + symbol;
    } else if (symbol === 'USDT') {
        return '$' + balance.toFixed(2);
    } else if (symbol === 'BNB' || symbol === 'ETH' || symbol === 'SOL' || symbol === 'TRX') {
        return balance.toFixed(4) + ' ' + symbol;
    }
    return balance.toString();
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    if (num < 0.0001) return num.toFixed(8);
    if (num < 0.01) return num.toFixed(6);
    return num.toFixed(2);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast) return;
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    const icon = toast.querySelector('i');
    if (type === 'success') {
        icon.className = 'fa-regular fa-circle-check';
    } else if (type === 'error') {
        icon.className = 'fa-regular fa-circle-xmark';
    } else if (type === 'warning') {
        icon.className = 'fa-regular fa-circle-exclamation';
    } else {
        icon.className = 'fa-regular fa-circle-info';
    }
    
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
    showToast(t('success.addressCopied'), 'success');
}

function animateElement(selector, animationClass) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add(animationClass);
        setTimeout(() => element.classList.remove(animationClass), 500);
    }
}

function scrollToTop() {
    document.querySelector('.app-container')?.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== 13. API CALLS (بدلاً من Firebase المباشر) ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// ====== 14. PRICES (مثل REFI) ======
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
        const ids = ['trust-wallet-token', 'tether', 'binancecoin', 'bitcoin', 'ethereum', 'solana', 'the-open-network', 'cardano', 'dogecoin', 'shiba-inu', 'pepe', 'tron'].join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        
        livePrices = {
            TWT: { price: data['trust-wallet-token']?.usd || 1.25, change: data['trust-wallet-token']?.usd_24h_change || 0 },
            USDT: { price: data.tether?.usd || 1, change: data.tether?.usd_24h_change || 0 },
            BNB: { price: data.binancecoin?.usd || 0, change: data.binancecoin?.usd_24h_change || 0 },
            BTC: { price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
            ETH: { price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
            SOL: { price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 },
            TON: { price: data['the-open-network']?.usd || 0, change: data['the-open-network']?.usd_24h_change || 0 },
            ADA: { price: data.cardano?.usd || 0, change: data.cardano?.usd_24h_change || 0 },
            DOGE: { price: data.dogecoin?.usd || 0, change: data.dogecoin?.usd_24h_change || 0 },
            SHIB: { price: data['shiba-inu']?.usd || 0, change: data['shiba-inu']?.usd_24h_change || 0 },
            PEPE: { price: data.pepe?.usd || 0, change: data.pepe?.usd_24h_change || 0 },
            TRX: { price: data.tron?.usd || 0, change: data.tron?.usd_24h_change || 0 }
        };
        
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

// ====== 15. RENDER FUNCTIONS (مثل REFI) ======
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
        <div class="section-header">
            <h3>${t('wallet.topCryptos')}</h3>
            <button class="section-action" onclick="refreshPrices()">${t('actions.seeAll')} <i class="fas fa-arrow-right"></i></button>
        </div>
        <div id="topCryptoList" class="top-crypto-list"></div>
    `;
    renderAssets();
    renderTopCryptos();
    updateTotalBalance();
}

function updateTotalBalance() {
    if (!userData) return;
    
    let total = 0;
    total += userData.balances.USDT || 0;
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
    renderAssets();
    updateTotalBalance();
    renderTopCryptos();
    updateReferralStats();
    updateSwapBalances();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        const unread = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'block' : 'none';
    }
}

// ====== 16. LOAD USER DATA (مع API بدلاً من Firebase المباشر) ======
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
        
        // محاولة جلب البيانات من الـ API
        const response = await apiCall(`/users/${userId}`);
        
        if (response.success && response.data) {
            userData = response.data;
            console.log("✅ Data loaded from API");
        } else if (!userData) {
            // مستخدم جديد
            console.log("📝 Creating new user");
            userData = {
                userId: userId,
                userName: userName,
                balances: {
                    TWT: 1000,
                    USDT: AIRDROP_BONUS,
                    BNB: 0,
                    BTC: 0,
                    ETH: 0,
                    SOL: 0,
                    ADA: 0,
                    DOGE: 0,
                    SHIB: 0,
                    PEPE: 0,
                    TON: 0,
                    TRX: 0
                },
                referralCode: userId,
                referredBy: null,
                referrals: [],
                referralCount: 0,
                inviteCount: 0,
                invitedBy: null,
                totalUsdtEarned: AIRDROP_BONUS,
                referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
                notifications: [],
                usedHashes: [],
                transactions: [],
                withdrawBlocked: false,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            
            // حفظ المستخدم الجديد في الـ API
            await apiCall('/users', 'POST', { userId, userData });
        }
        
        lastUserLoadTime = now;
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        
        updateUI();
        updateNotificationBadge();
        checkAdminAndAddCrown();
        
        // معالجة الإحالة
        if (startParam && startParam !== userId && !userData.invitedBy) {
            await processReferral();
        }
        
        // إخفاء شاشة البداية
        const onboarding = document.getElementById('onboardingScreen');
        const mainContent = document.getElementById('mainContent');
        if (onboarding) onboarding.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        
    } catch (error) {
        console.error("❌ Error loading user data:", error);
    }
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        apiCall(`/users/${userId}`, 'PATCH', { updates: userData });
    }
}

// ====== 17. REFERRAL SYSTEM (مثل REFI) ======
function getReferralLink() {
    return `${BOT_LINK}?startapp=${userData?.referralCode || userId}`;
}

function hasReferralCode() {
    return !!(startParam);
}

async function processReferral() {
    try {
        console.log("🔍 Checking for referral...");
        
        let referralCode = startParam;
        
        if (!referralCode) {
            console.log("ℹ️ No referral code detected");
            return;
        }
        
        if (!userData) {
            console.log("⏳ User data not loaded yet, waiting...");
            setTimeout(processReferral, 1000);
            return;
        }
        
        if (referralCode === userData.referralCode) {
            console.log("⚠️ Cannot refer yourself");
            return;
        }
        
        if (userData.referredBy) {
            console.log("✅ User already referred by:", userData.referredBy);
            return;
        }
        
        const pendingReferralKey = `processed_referral_${userId}`;
        if (localStorage.getItem(pendingReferralKey) === referralCode) {
            console.log("⚠️ This referral already processed");
            return;
        }
        
        console.log("🎯 Processing referral code:", referralCode);
        
        const referrerId = referralCode;
        
        if (!referrerId || referrerId === userId) {
            console.log("⚠️ Invalid referrer ID");
            return;
        }
        
        // معالجة الإحالة عبر الـ API
        const response = await apiCall('/referrals', 'POST', { referrerId, newUserId: userId });
        
        if (response.success) {
            userData.referredBy = referralCode;
            userData.balances.USDT = (userData.balances.USDT || 0) + REFERRAL_BONUS;
            userData.totalUsdtEarned = (userData.totalUsdtEarned || 0) + REFERRAL_BONUS;
            
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            localStorage.setItem(pendingReferralKey, referralCode);
            
            // إضافة إشعار للمستخدم
            if (!userData.notifications) userData.notifications = [];
            userData.notifications.unshift({
                id: Date.now().toString(),
                message: t('notif.referralBonus', { amount: REFERRAL_BONUS }),
                type: 'success',
                read: false,
                timestamp: new Date().toISOString()
            });
            
            showToast(t('notif.referralBonus', { amount: REFERRAL_BONUS }), 'success');
            updateUI();
            
            console.log("✅ Referral processed successfully!");
        }
        
    } catch (error) {
        console.error("❌ Error processing referral:", error);
    }
}

function copyReferralLink() {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    showToast(t('success.referralCopied'), 'success');
    animateElement('.copy-btn', 'pop');
}

function shareReferral() {
    const link = getReferralLink();
    const text = `🚀 Join Trust Wallet Lite and get ${AIRDROP_BONUS} USDT Airdrop! Use my link: ${link}`;
    
    if (tg?.shareToStory) {
        tg.shareToStory(text);
    } else {
        navigator.clipboard.writeText(text);
        showToast(t('messages.success'), 'success');
    }
}

function updateReferralStats() {
    const totalInvites = document.getElementById('totalInvites');
    const usdtEarned = document.getElementById('usdtEarned');
    const referralLinkInput = document.getElementById('inviteLink');
    
    if (totalInvites && userData) totalInvites.textContent = userData.inviteCount || 0;
    if (usdtEarned && userData) usdtEarned.textContent = (userData.totalUsdtEarned || 0).toFixed(2);
    if (referralLinkInput && userData) referralLinkInput.value = getReferralLink();
}

function renderReferralMilestones() {
    const milestonesList = document.getElementById('milestonesList');
    if (!milestonesList || !userData) return;
    
    milestonesList.innerHTML = REFERRAL_MILESTONES.map(milestone => {
        const progress = Math.min((userData.inviteCount / milestone.referrals) * 100, 100);
        const canClaim = userData.inviteCount >= milestone.referrals && 
                        !userData.referralMilestones?.find(m => m.referrals === milestone.referrals)?.claimed;
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
                ${canClaim ? 
                    `<button class="claim-btn" onclick="claimReferralMilestone(${milestone.referrals})" style="margin-top: 10px; width: 100%;">Claim Reward</button>` : 
                    isClaimed ? 
                    '<p style="color: var(--success); text-align: center; margin-top: 10px;">✓ Claimed</p>' : 
                    ''}
            </div>
        `;
    }).join('');
}

async function claimReferralMilestone(referrals) {
    const milestoneIndex = userData.referralMilestones?.findIndex(m => m.referrals === referrals);
    if (milestoneIndex === -1 || userData.referralMilestones[milestoneIndex].claimed) return;
    
    if (userData.inviteCount < referrals) {
        showToast(`You need ${referrals} referrals to claim this!`, 'error');
        return;
    }
    
    const reward = REFERRAL_MILESTONES.find(m => m.referrals === referrals).reward;
    userData.balances.USDT += reward;
    userData.totalUsdtEarned += reward;
    userData.referralMilestones[milestoneIndex].claimed = true;
    
    saveUserData();
    updateUI();
    renderReferralMilestones();
    
    showToast(`Claimed ${reward} USDT!`, 'success');
    animateElement('.milestone-item', 'pop');
}

function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    
    const inviteLink = getReferralLink();
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span id="totalInvites">${userData.inviteCount || 0}</span></div>
            <div class="stat-card"><span>${t('airdrop.earned')}</span><span id="usdtEarned">${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('airdrop.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyReferralLink()"><i class="fas fa-copy"></i></button>
                <button class="share-btn" onclick="shareReferral()"><i class="fas fa-share-alt"></i></button>
            </div>
        </div>
        <div class="referral-description"><i class="fas fa-gift"></i><p>${t('airdrop.description')} <strong>${REFERRAL_BONUS} USDT</strong> ${t('airdrop.description2')}</p></div>
        <div class="section-header"><h3>${t('airdrop.milestones')}</h3></div>
        <div id="milestonesList" class="milestones-list"></div>
    `;
    
    renderReferralMilestones();
    updateReferralStats();
}

// ====== 18. SWAP FUNCTIONS (مثل REFI) ======
let swapFromCurrency = 'USDT';
let swapToCurrency = 'TWT';
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
                <div class="currency-selector-small" onclick="showCurrencySelector('from')">
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
        <div class="swap-arrow" onclick="flipSwapPair()"><i class="fas fa-arrow-down"></i></div>
        <div class="swap-box">
            <div class="swap-label">${t('swap.to')}</div>
            <div class="swap-row">
                <input type="number" id="swapToAmount" placeholder="0.00" readonly>
                <div class="currency-selector-small" onclick="showCurrencySelector('to')">
                    <img id="swapToIcon" src="${getCurrencyIcon(swapToCurrency)}">
                    <span id="swapToSymbol">${swapToCurrency}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="balance-hint">Balance: <span id="swapToBalance">0</span></div>
        </div>
        <div class="swap-rate" id="swapRateDisplay">1 ${swapFromCurrency} ≈ ${swapFromCurrency === 'USDT' ? SWAP_RATE.toLocaleString() : (1/SWAP_RATE).toFixed(6)} ${swapToCurrency}</div>
        <div class="swap-fee"><span>${t('swap.networkFee')} (0.3%)</span><span id="swapFee">$0.00</span></div>
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

function showCurrencySelector(type) {
    currentCurrencySelector = type;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    if (!list) return;
    
    list.innerHTML = SWAP_CURRENCIES.map(curr => `
        <div class="currency-list-item" onclick="selectCurrency('${curr.symbol}')">
            <img src="${curr.icon}" alt="${curr.symbol}">
            <div class="currency-list-info">
                <h4>${curr.name}</h4>
                <p>${curr.symbol}</p>
            </div>
        </div>
    `).join('');
    modal.classList.add('show');
}

function selectCurrency(symbol) {
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
    let toAmount = 0;
    let rate = 0;
    
    if (swapFromCurrency === 'USDT' && swapToCurrency === 'TWT') {
        rate = SWAP_RATE;
        toAmount = amount * rate;
    } else if (swapFromCurrency === 'TWT' && swapToCurrency === 'USDT') {
        rate = 1 / SWAP_RATE;
        toAmount = amount * rate;
    } else {
        const fromPrice = swapFromCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapFromCurrency]?.price || 0);
        const toPrice = swapToCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapToCurrency]?.price || 0);
        if (fromPrice > 0 && toPrice > 0) {
            rate = fromPrice / toPrice;
            toAmount = amount * rate;
        }
    }
    
    const toAmountInput = document.getElementById('swapToAmount');
    const swapFeeSpan = document.getElementById('swapFee');
    const swapRateDisplay = document.getElementById('swapRateDisplay');
    
    if (toAmountInput) toAmountInput.value = toAmount.toFixed(6);
    if (swapFeeSpan) {
        const fee = amount * (swapFromCurrency === 'USDT' ? 0.003 : (swapFromCurrency === 'TWT' ? 0.003 * TWT_PRICE : 0.003));
        swapFeeSpan.innerText = `$${fee.toFixed(4)}`;
    }
    if (swapRateDisplay) swapRateDisplay.innerHTML = `1 ${swapFromCurrency} ≈ ${rate.toFixed(6)} ${swapToCurrency}`;
}

function setSwapPercentage(percent) {
    const balance = userData?.balances[swapFromCurrency] || 0;
    const fromAmount = document.getElementById('swapFromAmount');
    if (fromAmount) fromAmount.value = balance * (percent / 100);
    calculateSwap();
}

function flipSwapPair() {
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
    
    if (!amount || amount <= 0) {
        showToast(t('error.enterAmount'), 'error');
        return;
    }
    
    if ((userData.balances[swapFromCurrency] || 0) < amount) {
        showToast(t('error.insufficientBalance', { currency: swapFromCurrency }), 'error');
        return;
    }
    
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
    showToast(t('success.swapCompleted', {
        fromAmount: formatBalance(amount, swapFromCurrency),
        fromCurrency: swapFromCurrency,
        toAmount: formatBalance(toAmount, swapToCurrency),
        toCurrency: swapToCurrency
    }), 'success');
}

// ====== 19. DEPOSIT FUNCTIONS (مثل REFI) ======
function showDepositModal() {
    document.getElementById('depositModal').classList.add('show');
    updateDepositInfo();
    animateElement('.modal-content', 'slideUpModal');
}

function updateDepositInfo() {
    const currency = document.getElementById('depositCurrency').value;
    const depositIcon = document.getElementById('depositIcon');
    const minEl = document.getElementById('depositMinAmount');
    const amountInput = document.getElementById('depositAmount');
    const addressSpan = document.getElementById('depositAddress');
    const addressNote = document.getElementById('depositAddressNote');
    const hashHint = document.getElementById('hashFormatHint');
    
    if (depositIcon) depositIcon.src = getCurrencyIcon(currency);
    if (addressSpan) addressSpan.textContent = DEPOSIT_ADDRESSES[currency] || DEPOSIT_ADDRESSES.TWT;
    if (addressNote) addressNote.innerHTML = `<i class="fa-regular fa-circle-check"></i> <span>${DEPOSIT_NOTES[currency] || '✓ Blockchain confirmation 1-5 minutes'}</span>`;
    
    let formatText = '';
    const bscNetworks = ['USDT', 'BNB', 'TWT', 'ETH', 'SHIB', 'PEPE'];
    const solanaNetworks = ['SOL'];
    const tronNetworks = ['TRX'];
    
    if (bscNetworks.includes(currency)) {
        formatText = 'BSC/ETH format: 0x... (66 characters)';
    } else if (solanaNetworks.includes(currency)) {
        formatText = 'Solana format: 86-88 characters (no 0x required)';
    } else if (tronNetworks.includes(currency)) {
        formatText = 'TRON format: 64 characters (no 0x required)';
    }
    
    if (hashHint) hashHint.textContent = formatText;
    
    const minAmount = DEPOSIT_MINIMUMS[currency] || 0;
    if (minEl) minEl.textContent = `${minAmount} ${currency}`;
    
    if (amountInput) {
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
    }
}

function copyDepositAddress() {
    const address = document.getElementById('depositAddress').textContent;
    navigator.clipboard.writeText(address);
    showToast(t('success.addressCopied'), 'success');
    animateElement('.copy-address-btn', 'pop');
}

function validateTransactionHashInput() {
    const hashInput = document.getElementById('txnId');
    const currency = document.getElementById('depositCurrency').value;
    const hintEl = document.getElementById('hashValidationHint');
    const submitBtn = document.getElementById('submitDepositBtn');
    
    if (!hashInput || !hintEl || !submitBtn) return;
    
    const hash = hashInput.value.trim();
    
    if (!hash) {
        hintEl.style.display = 'none';
        submitBtn.disabled = true;
        return;
    }
    
    const strictNetworks = ['USDT', 'BNB', 'TWT', 'ETH', 'SHIB', 'PEPE'];
    const exemptNetworks = ['SOL', 'TRX'];
    
    let isValid = false;
    let message = '';
    
    if (strictNetworks.includes(currency)) {
        isValid = hash.startsWith('0x') && hash.length === 66;
        message = isValid ? 
            '✓ Valid BSC/ETH transaction hash' : 
            'Invalid format. Must start with 0x and be 66 characters';
    }
    
    if (exemptNetworks.includes(currency)) {
        isValid = hash.length >= 10 && hash.length <= 100;
        message = isValid ?
            `✓ ${currency} transaction hash accepted (will be verified manually)` :
            'Transaction hash seems too short';
    }
    
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
        hintEl.textContent = message || '✓ Valid transaction hash';
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
    
    const strictNetworks = ['USDT', 'BNB', 'TWT', 'ETH', 'SHIB', 'PEPE'];
    
    if (strictNetworks.includes(currency)) {
        if (!txnId.startsWith('0x') || txnId.length !== 66) {
            showToast(t('error.invalidHash'), 'error');
            return;
        }
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
        id: 'deposit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        userName: userName,
        currency: currency,
        amount: amount,
        txnId: txnId,
        address: DEPOSIT_ADDRESSES[currency],
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
        
        // حفظ طلب الإيداع عبر الـ API
        const response = await apiCall('/deposit-requests', 'POST', depositRequest);
        
        if (response.success) {
            if (!userData.transactions) userData.transactions = [];
            userData.transactions.unshift({ ...depositRequest, status: 'pending' });
            saveUserData();
            
            showToast(t('success.depositSubmitted', { amount, currency }), 'success');
            closeModal('depositModal');
            
            document.getElementById('depositAmount').value = '';
            document.getElementById('txnId').value = '';
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error("❌ Deposit error:", error);
        showToast('❌ Failed to submit deposit request: ' + error.message, 'error');
    } finally {
        if (submitBtn) {
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Deposit';
            }, 1000);
        }
    }
}

// ====== 20. WITHDRAW FUNCTIONS (مثل REFI) ======
function showWithdrawModal() {
    document.getElementById('withdrawModal').classList.add('show');
    checkWithdrawFee();
    updateWithdrawIcon();
    animateElement('.modal-content', 'slideUpModal');
}

function checkWithdrawFee() {
    const currency = document.getElementById('withdrawCurrency').value;
    const feeWarning = document.getElementById('feeWarning');
    const feeWarningText = document.getElementById('feeWarningText');
    const networkFee = document.getElementById('networkFee');
    const receiveAmount = document.getElementById('receiveAmount_');
    const amount = parseFloat(document.getElementById('withdrawAmount').value) || 0;
    
    updateWithdrawIcon();
    
    if (currency === 'USDT') {
        if (feeWarning) feeWarning.classList.remove('hidden');
        if (feeWarningText) feeWarningText.textContent = 'USDT withdrawal requires 0.00016 BNB fee';
        if (networkFee) networkFee.textContent = '0.00016 BNB';
        if (receiveAmount) receiveAmount.textContent = amount.toFixed(2) + ' USDT';
    } else if (currency === 'BNB') {
        if (feeWarning) feeWarning.classList.remove('hidden');
        if (feeWarningText) feeWarningText.textContent = 'BNB withdrawal requires 0.0005 BNB fee';
        if (networkFee) networkFee.textContent = '0.0005 BNB';
        if (receiveAmount) receiveAmount.textContent = (amount - 0.0005).toFixed(4) + ' BNB';
    } else if (currency === 'TWT') {
        if (feeWarning) feeWarning.classList.remove('hidden');
        if (feeWarningText) feeWarningText.textContent = 'TWT withdrawal requires 1 TWT fee';
        if (networkFee) networkFee.textContent = '1 TWT';
        if (receiveAmount) receiveAmount.textContent = (amount - 1).toFixed(0) + ' TWT';
    } else {
        if (feeWarning) feeWarning.classList.add('hidden');
        if (networkFee) networkFee.textContent = '0 BNB';
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
        if (hintEl) hintEl.style.display = 'none';
        if (submitBtn) submitBtn.disabled = true;
        return;
    }
    
    const isValid = address.startsWith('0x') && address.length === 42;
    
    if (!isValid) {
        if (hintEl) {
            hintEl.textContent = 'Invalid address. Must start with 0x and be 42 characters';
            hintEl.className = 'address-validation-hint invalid';
            hintEl.style.display = 'block';
        }
        if (submitBtn) submitBtn.disabled = true;
    } else {
        if (hintEl) {
            hintEl.textContent = '✓ Valid address';
            hintEl.className = 'address-validation-hint valid';
            hintEl.style.display = 'block';
        }
        if (submitBtn) submitBtn.disabled = false;
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
    
    const minAmounts = {
        USDT: 10,
        TWT: 1000000,
        BNB: 0.02
    };
    
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
    } else if (currency === 'TWT') {
        fee = 1;
        feeCurrency = 'TWT';
        if (!userData.balances.TWT || userData.balances.TWT < (amount + fee)) {
            showToast(`Insufficient TWT balance including fee`, 'error');
            return;
        }
    }
    
    const submitBtn = document.getElementById('submitWithdrawBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    userData.balances[currency] -= amount;
    if (fee > 0) {
        userData.balances[feeCurrency] -= fee;
    }
    
    const withdrawRequest = {
        id: 'withdraw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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
        // حفظ طلب السحب عبر الـ API
        const response = await apiCall('/withdrawals', 'POST', withdrawRequest);
        
        if (response.success) {
            if (!userData.transactions) userData.transactions = [];
            userData.transactions.unshift({ ...withdrawRequest, status: 'pending' });
            saveUserData();
            
            showToast(`✅ Withdrawal request submitted for ${amount} ${currency}`, 'success');
            closeModal('withdrawModal');
            
            document.getElementById('withdrawAmount').value = '';
            document.getElementById('walletAddress').value = '';
            updateUI();
        } else {
            throw new Error(response.error);
        }
        
    } catch (error) {
        console.error("❌ Withdraw error:", error);
        showToast('❌ Failed to submit withdrawal request: ' + error.message, 'error');
        
        userData.balances[currency] += amount;
        if (fee > 0) userData.balances[feeCurrency] += fee;
        saveUserData();
    } finally {
        if (submitBtn) {
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal';
            }, 1000);
        }
    }
}

// ====== 21. SEND/RECEIVE FUNCTIONS (مثل REFI) ======
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); }

function copyAddress() {
    const address = document.getElementById('receiveAddress')?.innerText;
    if (address) copyToClipboard(address);
}

async function sendTransaction() {
    const currency = document.getElementById('sendCurrency')?.value;
    const amount = parseFloat(document.getElementById('sendAmount')?.value);
    const address = document.getElementById('sendAddress')?.value;
    
    if (!amount || amount <= 0 || !address) {
        showToast(t('error.enterAmount'), 'error');
        return;
    }
    
    if ((userData.balances[currency] || 0) < amount) {
        showToast(t('error.insufficientBalance', { currency }), 'error');
        return;
    }
    
    userData.balances[currency] -= amount;
    
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({
        type: 'send',
        amount: amount,
        currency: currency,
        address: address,
        timestamp: new Date().toISOString()
    });
    
    saveUserData();
    updateUI();
    closeModal('sendModal');
    showToast(`Sent ${amount} ${currency}`, 'success');
}

// ====== 22. NOTIFICATIONS FUNCTIONS (مثل REFI) ======
function renderNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList || !userData) return;
    
    const notifications = userData.notifications || [];
    
    let controlsHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px; padding: 0 5px;">
            <button onclick="clearReadNotifications()" 
                    style="flex: 1; padding: 8px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; color: var(--quantum-blue); font-size: 12px; cursor: pointer;">
                <i class="fa-regular fa-trash-can"></i> ${t('notifications.clear_read')}
            </button>
            <button onclick="clearAllNotifications()" 
                    style="flex: 1; padding: 8px; background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.2); border-radius: 8px; color: #ff4444; font-size: 12px; cursor: pointer;">
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
        saveUserData();
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
        saveUserData();
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
    saveUserData();
    renderNotifications();
    showToast(t('notifications.cleared', { count: 'all' }), 'success');
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (!modal) return;
    modal.classList.add('show');
    renderNotifications();
    animateElement('.modal-content', 'slideUpModal');
}

// ====== 23. ADMIN PANEL (مثل REFI) ======
function showAdminPanel() {
    if (!isAdmin) {
        showToast('Access denied', 'error');
        return;
    }
    
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAdminData();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
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
        if (adminContent) {
            adminContent.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <i class="fa-solid fa-hand-pointer" style="font-size: 48px; color: var(--pink-1);"></i>
                    <p style="margin: 20px 0; color: var(--text-secondary);">اضغط على زر التحديث لعرض الطلبات</p>
                    <button onclick="refreshAdminPanel()" class="admin-approve-btn" style="width: auto; padding: 10px 20px; margin: 0 auto;">
                        <i class="fa-solid fa-rotate-right"></i> تحديث
                    </button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error("Error loading admin data:", error);
        showToast('Error loading admin data', 'error');
    }
}

function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    currentAdminTab = tab;
    
    const adminContent = document.getElementById('adminContent');
    if (adminContent) {
        adminContent.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <i class="fa-solid fa-hand-pointer" style="font-size: 48px; color: var(--pink-1);"></i>
                <p style="margin: 20px 0; color: var(--text-secondary);">اضغط على زر التحديث لعرض الطلبات</p>
                <button onclick="refreshAdminPanel()" class="admin-approve-btn" style="width: auto; padding: 10px 20px; margin: 0 auto;">
                    <i class="fa-solid fa-rotate-right"></i> تحديث
                </button>
            </div>
        `;
    }
}

let currentAdminTab = 'deposits';

window.refreshAdminPanel = async function() {
    if (!isAdmin) return;
    
    console.log("🔄 Manually refreshing admin panel...");
    
    const refreshBtn = document.getElementById('adminRefreshBtn');
    if (refreshBtn) refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    const adminContent = document.getElementById('adminContent');
    if (adminContent) adminContent.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    
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
            if (adminContent) adminContent.innerHTML = '<div class="empty-state">No pending transactions found</div>';
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
        
        if (adminContent) adminContent.innerHTML = html;
        showToast('Admin panel refreshed', 'success');
        
    } catch (error) {
        console.error("❌ Error refreshing admin panel:", error);
        if (adminContent) adminContent.innerHTML = '<div class="empty-state">Error loading transactions</div>';
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
                <div class="admin-tx-row">
                    <span class="admin-tx-label">User:</span>
                    <span class="admin-tx-value">${displayUserId}</span>
                </div>
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
                <div class="admin-tx-row">
                    <span class="admin-tx-label">Amount:</span>
                    <span class="admin-tx-value">${tx.amount} ${tx.currency}</span>
                </div>
                ${tx.txnId ? `
                <div class="admin-tx-row">
                    <span class="admin-tx-label">TXID:</span>
                    <div class="admin-address-container">
                        <code>${tx.txnId.substring(0, 16)}...</code>
                        <button class="admin-copy-btn" onclick="copyToClipboard('${tx.txnId}')">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </div>` : ''}
                ${tx.address ? `
                <div class="admin-tx-row">
                    <span class="admin-tx-label">Address:</span>
                    <div class="admin-address-container">
                        <code>${tx.address.substring(0, 16)}...</code>
                        <button class="admin-copy-btn" onclick="copyToClipboard('${tx.address}')">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </div>` : ''}
                ${tx.fee ? `
                <div class="admin-tx-row">
                    <span class="admin-tx-label">Fee:</span>
                    <span class="admin-tx-value">${tx.fee} ${tx.feeCurrency}</span>
                </div>` : ''}
                <div class="admin-tx-row">
                    <span class="admin-tx-label">Time:</span>
                    <span class="admin-tx-value">${formattedDate}</span>
                </div>
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
        if (type === 'deposit') {
            collectionName = 'deposit_requests';
        } else if (type === 'withdraw') {
            collectionName = 'withdrawals';
        } else {
            collectionName = 'transactions';
        }
        
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
                saveUserData();
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
            saveUserData();
        }
        
        console.log("✅ Notification added:", notification);
    } catch (error) {
        console.error("❌ Error adding notification:", error);
    }
}

// ====== 24. STICKER SYSTEM (مثل REFI) ======
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
        setTimeout(() => stickerElement.textContent = '', 300);
    }, 3000);
    lastStickerTime = now;
}

// ====== 25. OTHER FUNCTIONS ======
function showAssetDetails(symbol) {
    const balance = userData.balances[symbol] || 0;
    const price = symbol === 'TWT' ? TWT_PRICE : (livePrices[symbol]?.price || 0);
    const value = symbol === 'USDT' ? balance : balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}

function showCryptoDetails(symbol) {
    let price, change;
    if (symbol === 'TWT') {
        price = TWT_PRICE;
        change = 0;
    } else {
        price = livePrices[symbol]?.price || 0;
        change = livePrices[symbol]?.change || 0;
    }
    const changeSymbol = change >= 0 ? '+' : '';
    showToast(`${symbol}: $${formatNumber(price)} (${changeSymbol}${change.toFixed(2)}%)`, 'info');
}

function showP2P() {
    document.getElementById('p2pModal').classList.add('show');
}

function showAllAssets() {
    showToast('All assets view coming soon!', 'info');
}

function showStakingDetails(type) {
    showToast('Staking coming soon!', 'info');
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    
    const txs = userData?.transactions || [];
    if (txs.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p><span>Your transactions will appear here</span></div>';
    } else {
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
            } else if (tx.type === 'send') {
                icon = 'fa-paper-plane';
                typeClass = 'send';
                typeText = 'Send';
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
    modal.classList.add('show');
}

function filterHistory(filter) {
    document.querySelectorAll('.history-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event && event.target) event.target.classList.add('active');
    renderHistory(filter);
}

function renderHistory(filter = 'all') {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    let transactions = userData?.transactions || [];
    
    if (filter !== 'all') {
        transactions = transactions.filter(tx => tx.type === filter);
    }
    
    if (transactions.length === 0) {
        historyList.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p><span>Your transactions will appear here</span></div>';
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
        } else if (tx.type === 'send') {
            icon = 'fa-paper-plane';
            typeClass = 'send';
            typeText = 'Send';
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

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

// ====== 26. RENDER TWT PAY (بطاقة افتراضية) ======
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
            <div class="card-details">
                <div><div class="label">Card Holder</div><div class="value">${userData?.userName || 'User'}</div></div>
                <div><div class="label">Expires</div><div class="value">12/28</div></div>
            </div>
            <div class="card-balance">
                <div class="balance-label">${t('card.balance')}</div>
                <div class="balance-value">${twtBalance} TWT</div>
                <div class="balance-usd">≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div>
            </div>
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

// ====== 27. RENDER SETTINGS (مثل REFI) ======
function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()">
                <i class="fas fa-bell"></i>
                <div><div class="label">${t('notifications.title')}</div><div class="desc">View all notifications</div></div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showHistory()">
                <i class="fas fa-history"></i>
                <div><div class="label">${t('actions.history')}</div><div class="desc">View all transactions</div></div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleLanguage()">
                <i class="fas fa-language"></i>
                <div><div class="label">${t('settings.language')}</div><div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div></div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="toggleTheme()">
                <i class="fas fa-moon"></i>
                <div><div class="label">${t('settings.theme')}</div><div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div></div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <div><div class="label">${t('settings.logout')}</div><div class="desc">Sign out of your wallet</div></div>
            </div>
        </div>
    `;
}

// ====== 28. NAVIGATION (مثل REFI) ======
function showWallet() {
    currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item:nth-child(1)').classList.add('active');
    
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
    document.querySelector('.nav-item:nth-child(2)').classList.add('active');
    
    showSwapModal();
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
    document.querySelector('.nav-item:nth-child(3)').classList.add('active');
    
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
    document.querySelector('.nav-item:nth-child(4)').classList.add('active');
    
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
    document.querySelector('.nav-item:nth-child(5)').classList.add('active');
    
    renderSettings();
    showRandomSticker();
}

// ====== 29. INITIALIZATION (مثل REFI) ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Initializing Trust Wallet Lite...");
    
    initTheme();
    updateAllTexts();
    
    // أزرار التنقل
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
    
    // أزرار الإجراءات السريعة
    const depositBtn = document.querySelector('.action-btn[onclick="showDepositModal()"]');
    const withdrawBtn = document.querySelector('.action-btn[onclick="showWithdrawModal()"]');
    const sendBtn = document.querySelector('.action-btn[onclick="showSendModal()"]');
    const receiveBtn = document.querySelector('.action-btn[onclick="showReceiveModal()"]');
    const historyBtn = document.querySelector('.action-btn[onclick="showHistory()"]');
    const swapBtn = document.querySelector('.action-btn[onclick="showSwapModal()"]');
    
    if (depositBtn) depositBtn.onclick = showDepositModal;
    if (withdrawBtn) withdrawBtn.onclick = showWithdrawModal;
    if (sendBtn) sendBtn.onclick = showSendModal;
    if (receiveBtn) receiveBtn.onclick = showReceiveModal;
    if (historyBtn) historyBtn.onclick = showHistory;
    if (swapBtn) swapBtn.onclick = showSwapModal;
    
    await fetchLivePrices();
    await loadUserData();
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
        document.getElementById('mainContent').style.display = 'block';
        
        setTimeout(() => {
            showRandomSticker();
        }, 500);
    }, 2000);
    
    console.log("✅ Trust Wallet Lite initialized successfully!");
    console.log("📱 User ID:", userId);
    console.log("👑 Is Admin:", isAdmin);
});

// ====== 30. EXPOSE GLOBALS (تصدير احترافي) ======
// Navigation
window.showWallet = showWallet;
window.showSwap = showSwap;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;

// Actions
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.showSwapModal = showSwapModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showAdminPanel = showAdminPanel;

// Modals
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;

// Utilities
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.scrollToTop = scrollToTop;
window.refreshPrices = refreshPrices;
window.copyToClipboard = copyToClipboard;

// Airdrop
window.copyReferralLink = copyReferralLink;
window.shareReferral = shareReferral;
window.claimReferralMilestone = claimReferralMilestone;

// Swap
window.showCurrencySelector = showCurrencySelector;
window.selectCurrency = selectCurrency;
window.calculateSwap = calculateSwap;
window.setSwapPercentage = setSwapPercentage;
window.flipSwapPair = flipSwapPair;
window.confirmSwap = confirmSwap;

// Deposit/Withdraw
window.copyDepositAddress = copyDepositAddress;
window.validateTransactionHashInput = validateTransactionHashInput;
window.submitDeposit = submitDeposit;
window.validateWithdrawAddressInput = validateWithdrawAddressInput;
window.submitWithdraw = submitWithdraw;

// Send/Receive
window.sendTransaction = sendTransaction;
window.copyAddress = copyAddress;

// Admin
window.refreshAdminPanel = refreshAdminPanel;
window.approveTransaction = approveTransaction;
window.rejectTransaction = rejectTransaction;
window.showAdminTab = showAdminTab;

// Other
window.showTopUp = showTopUp;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;
window.showCryptoDetails = showCryptoDetails;
window.showAssetDetails = showAssetDetails;
window.showP2P = showP2P;
window.showAllAssets = showAllAssets;
window.showStakingDetails = showStakingDetails;
window.filterHistory = filterHistory;
window.markNotificationRead = markNotificationRead;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;

console.log("✅ Trust Wallet Lite - PROFESSIONAL VERSION READY!");
console.log("✅ Languages: English / العربية");
console.log("✅ Referral system: checks only when code present");
console.log("✅ Admin: manual refresh only - zero auto reads");
console.log("✅ Prices: cached for 3 hours - manual refresh available");
console.log("✅ Notifications: cleanup buttons - delete read or all");
console.log("✅ Ready for production with backend API!");
