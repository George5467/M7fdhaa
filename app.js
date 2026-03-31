// ============================================================================
// TRUST WALLET LITE - PROFESSIONAL CRYPTO WALLET
// Version 3.0 | Full Featured | Zero Waste Architecture
// ============================================================================
// Developed by: Trust Wallet Team
// Features: 12 Cryptocurrencies | 8 Referral Milestones | TWT Pay Card
//           Swap DEX (0.3% fee) | Deposit/Withdraw | Admin Panel
//           Dark/Light Mode | RTL Support | 12-Word Recovery Phrase
//           Telegram Mini App Integration | StartApp Referral System
// ============================================================================

(function() {
    'use strict';

    // ==========================================================================
    // SECTION 1: TELEGRAM WEBAPP INITIALIZATION
    // ==========================================================================
    
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
        telegram.ready();
        telegram.expand();
        if (telegram.enableClosingConfirmation) telegram.enableClosingConfirmation();
        console.log("[TrustWallet] Telegram WebApp initialized");
    }

    // Get referral parameter from Telegram startapp or URL
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = telegram?.initDataUnsafe?.start_param || 
                       urlParams.get('startapp') || 
                       urlParams.get('ref');

    // ==========================================================================
    // SECTION 2: FIREBASE CONFIGURATION
    // ==========================================================================
    
    const FIREBASE_CONFIG = {
        apiKey: "{{FIREBASE_API_KEY}}",
        authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
        databaseURL: "{{FIREBASE_DATABASE_URL}}",
        projectId: "{{FIREBASE_PROJECT_ID}}",
        storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
        messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
        appId: "{{FIREBASE_APP_ID}}"
    };

    let firestore = null;
    let firebaseInitialized = false;

    try {
        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
            firebase.initializeApp(FIREBASE_CONFIG);
            firestore = firebase.firestore();
            firebaseInitialized = true;
            console.log("[TrustWallet] Firebase initialized");
        }
    } catch (error) {
        console.error("[TrustWallet] Firebase error:", error);
    }

    // ==========================================================================
    // SECTION 3: INTERNATIONALIZATION (i18n)
    // ==========================================================================
    
    const TRANSLATIONS = {
        en: {
            'nav.wallet': 'Wallet', 'nav.swap': 'Swap', 'nav.referral': 'Referral',
            'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
            'actions.send': 'Send', 'actions.receive': 'Receive', 'actions.swap': 'Swap',
            'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw', 'actions.history': 'History',
            'actions.copy': 'Copy', 'actions.confirm': 'Confirm', 'actions.cancel': 'Cancel',
            'wallet.total': 'Total Balance', 'wallet.assets': 'My Assets',
            'swap.from': 'From', 'swap.to': 'To', 'swap.rate': 'Exchange Rate',
            'swap.fee': 'Swapper Fee', 'swap.provider': 'Provider',
            'referral.total': 'Total Referrals', 'referral.twt': 'TWT Earned',
            'referral.usdt': 'USDT Earned', 'referral.link': 'Your Referral Link',
            'referral.milestones': 'Referral Milestones',
            'deposit.title': 'Deposit Funds', 'deposit.amount': 'Amount',
            'deposit.address': 'Send to this address', 'deposit.submit': 'Submit Deposit',
            'withdraw.title': 'Withdraw Funds', 'withdraw.amount': 'Amount',
            'withdraw.address': 'Wallet Address', 'withdraw.fee': 'Network Fee',
            'withdraw.submit': 'Submit Withdrawal',
            'history.title': 'Transaction History',
            'notifications.title': 'Notifications',
            'settings.language': 'Language', 'settings.theme': 'Theme',
            'settings.recovery': 'Recovery Phrase', 'settings.logout': 'Logout',
            'messages.success': 'Success', 'messages.error': 'Error',
            'messages.loading': 'Loading...', 'messages.confirm': 'Are you sure?'
        },
        ar: {
            'nav.wallet': 'المحفظة', 'nav.swap': 'تحويل', 'nav.referral': 'إحالة',
            'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
            'actions.send': 'إرسال', 'actions.receive': 'استلام', 'actions.swap': 'تحويل',
            'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب', 'actions.history': 'السجل',
            'actions.copy': 'نسخ', 'actions.confirm': 'تأكيد', 'actions.cancel': 'إلغاء',
            'wallet.total': 'الرصيد الإجمالي', 'wallet.assets': 'أصولي',
            'swap.from': 'من', 'swap.to': 'إلى', 'swap.rate': 'سعر الصرف',
            'swap.fee': 'رسوم التحويل', 'swap.provider': 'المزود',
            'referral.total': 'إجمالي الإحالات', 'referral.twt': 'TWT المكتسبة',
            'referral.usdt': 'USDT المكتسبة', 'referral.link': 'رابط الإحالة',
            'referral.milestones': 'مراحل الإحالة',
            'deposit.title': 'إيداع الأموال', 'deposit.amount': 'المبلغ',
            'deposit.address': 'أرسل إلى هذا العنوان', 'deposit.submit': 'تقديم الإيداع',
            'withdraw.title': 'سحب الأموال', 'withdraw.amount': 'المبلغ',
            'withdraw.address': 'عنوان المحفظة', 'withdraw.fee': 'رسوم الشبكة',
            'withdraw.submit': 'تقديم السحب',
            'history.title': 'سجل المعاملات',
            'notifications.title': 'الإشعارات',
            'settings.language': 'اللغة', 'settings.theme': 'المظهر',
            'settings.recovery': 'عبارة الاسترداد', 'settings.logout': 'تسجيل الخروج',
            'messages.success': 'نجاح', 'messages.error': 'خطأ',
            'messages.loading': 'جاري التحميل...', 'messages.confirm': 'هل أنت متأكد؟'
        }
    };

    let currentLanguage = localStorage.getItem('twt_language') || 'en';

    function translate(key, params = {}) {
        let text = TRANSLATIONS[currentLanguage]?.[key] || TRANSLATIONS.en[key] || key;
        Object.keys(params).forEach(p => {
            text = text.replace(new RegExp(`{${p}}`, 'g'), params[p]);
        });
        return text;
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('twt_language', lang);
        document.getElementById('currentLanguageFlag').textContent = lang === 'en' ? '🇬🇧' : '🇸🇦';
        document.body.classList.toggle('rtl', lang === 'ar');
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = translate(key);
        });
        showToast(translate('messages.success'), 'success');
    }

    function toggleLanguage() {
        setLanguage(currentLanguage === 'en' ? 'ar' : 'en');
    }

    // ==========================================================================
    // SECTION 4: THEME MANAGEMENT (Dark/Light Mode)
    // ==========================================================================
    
    let currentTheme = localStorage.getItem('twt_theme') || 'light';

    function setTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('twt_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#themeBtn i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    function toggleTheme() {
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
        showToast(`${currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode`, 'success');
    }

    // ==========================================================================
    // SECTION 5: CRYPTOCURRENCY ICONS (CoinMarketCap)
    // ==========================================================================
    
    const CRYPTO_ICONS = {
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

    function getCurrencyIcon(symbol) {
        return CRYPTO_ICONS[symbol] || CRYPTO_ICONS.TWT;
    }

    // ==========================================================================
    // SECTION 6: CONSTANTS & CONFIGURATION
    // ==========================================================================
    
    const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
    const ADMIN_ID = "{{ADMIN_ID}}";
    const REFERRAL_BONUS = 25;
    const WELCOME_BONUS = 10;
    const SWAP_FEE_PERCENT = 0.003;
    let TWT_PRICE = 1.25;

    const SUPPORTED_ASSETS = [
        { symbol: 'TWT', name: 'Trust Wallet Token', decimals: 0 },
        { symbol: 'USDT', name: 'Tether', decimals: 2 },
        { symbol: 'BNB', name: 'BNB', decimals: 4 },
        { symbol: 'BTC', name: 'Bitcoin', decimals: 6 },
        { symbol: 'ETH', name: 'Ethereum', decimals: 4 },
        { symbol: 'SOL', name: 'Solana', decimals: 4 },
        { symbol: 'TRX', name: 'TRON', decimals: 4 },
        { symbol: 'ADA', name: 'Cardano', decimals: 4 },
        { symbol: 'DOGE', name: 'Dogecoin', decimals: 0 },
        { symbol: 'SHIB', name: 'Shiba Inu', decimals: 0 },
        { symbol: 'PEPE', name: 'Pepe', decimals: 0 },
        { symbol: 'TON', name: 'Toncoin', decimals: 4 }
    ];

    const COINGECKO_IDS = {
        TWT: 'trust-wallet-token', USDT: 'tether', BNB: 'binancecoin',
        BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', TRX: 'tron',
        ADA: 'cardano', DOGE: 'dogecoin', SHIB: 'shiba-inu',
        PEPE: 'pepe', TON: 'the-open-network'
    };

    const DEPOSIT_LIMITS = {
        TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
        SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000,
        PEPE: 5000000, TON: 1
    };

    const WITHDRAW_FEES = {
        TWT: 1, USDT: 0.16, BNB: 0.0005, BTC: 0.0002, ETH: 0.001,
        SOL: 0.005, TRX: 1, ADA: 0.5, DOGE: 1, SHIB: 50000,
        PEPE: 500000, TON: 0.1
    };

    const WITHDRAW_LIMITS = {
        TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
        SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000,
        PEPE: 5000000, TON: 1
    };

    // ==========================================================================
    // SECTION 7: REFERRAL MILESTONES (8 Levels)
    // ==========================================================================
    
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

    // ==========================================================================
    // SECTION 8: STATE MANAGEMENT
    // ==========================================================================
    
    let userData = null;
    let activeTab = 'wallet';
    let isAdmin = false;
    let marketPrices = {};
    let unreadCount = 0;
    let currentCurrencyContext = null;
    let currentSwapContext = null;
    let currentHistoryFilter = 'all';
    let lastPriceFetch = 0;
    const PRICE_CACHE_DURATION = 10800000; // 3 hours

    // ==========================================================================
    // SECTION 9: USER IDENTIFICATION
    // ==========================================================================
    
    const userId = localStorage.getItem('twt_user_id') || 
                   'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    localStorage.setItem('twt_user_id', userId);

    function generateReferralCode() {
        return userId.slice(-8).toUpperCase();
    }

    function getReferralLink() {
        if (!userData) return '';
        return `${BOT_LINK}?startapp=${userData.referralCode}`;
    }

    // ==========================================================================
    // SECTION 10: ADMIN SYSTEM
    // ==========================================================================
    
    isAdmin = userId === ADMIN_ID;

    function showAdminCrown() {
        if (!isAdmin) return;
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) crownBtn.classList.remove('hidden');
    }

    // ==========================================================================
    // SECTION 11: STORAGE MANAGEMENT
    // ==========================================================================
    
    const STORAGE_KEY = `twt_user_${userId}`;
    const TRANSACTIONS_KEY = `twt_transactions_${userId}`;

    function loadUserData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            userData = JSON.parse(stored);
            isAdmin = userData.userId === ADMIN_ID;
            return true;
        }
        return false;
    }

    function saveUserData() {
        if (userData) localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }

    function loadTransactions() {
        try {
            const stored = localStorage.getItem(TRANSACTIONS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    function saveTransactions(transactions) {
        try {
            localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
        } catch {}
    }

    function addTransaction(transaction) {
        const txs = loadTransactions();
        const newTx = {
            ...transaction,
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 8),
            timestamp: transaction.timestamp || new Date().toISOString()
        };
        if (txs.some(t => t.id === newTx.id)) return false;
        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift(newTx);
        txs.unshift(newTx);
        saveTransactions(txs);
        saveUserData();
        if (document.getElementById('historyModal')?.classList.contains('show')) {
            renderHistory(currentHistoryFilter);
        }
        return true;
    }

    // ==========================================================================
    // SECTION 12: PRICE FETCHING (Zero Waste - 3 Hours Cache)
    // ==========================================================================
    
    async function fetchMarketPrices(force = false) {
        const now = Date.now();
        const cached = localStorage.getItem('twt_prices');
        
        if (!force && cached && (now - lastPriceFetch) < PRICE_CACHE_DURATION) {
            const { prices, timestamp } = JSON.parse(cached);
            marketPrices = prices;
            lastPriceFetch = timestamp;
            updatePriceDisplay();
            return;
        }
        
        try {
            const ids = Object.values(COINGECKO_IDS).join(',');
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
            );
            const data = await response.json();
            
            for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
                if (data[id]) {
                    marketPrices[symbol] = {
                        price: data[id].usd,
                        change: data[id].usd_24h_change || 0
                    };
                }
            }
            
            if (!marketPrices.TWT) marketPrices.TWT = { price: 1.25, change: 0 };
            TWT_PRICE = marketPrices.TWT.price;
            lastPriceFetch = now;
            localStorage.setItem('twt_prices', JSON.stringify({
                prices: marketPrices,
                timestamp: now
            }));
            updatePriceDisplay();
        } catch (error) {
            console.error("[TrustWallet] Price fetch failed:", error);
        }
    }

    function updatePriceDisplay() {
        if (activeTab === 'wallet') renderWallet();
        if (activeTab === 'swap') updateSwapRate();
        updateTotalBalance();
    }

    function refreshPrices() {
        fetchMarketPrices(true);
        showToast(translate('messages.success'), 'success');
    }

    // ==========================================================================
    // SECTION 13: UTILITY FUNCTIONS
    // ==========================================================================
    
    function formatBalance(amount, symbol) {
        if (!amount) amount = 0;
        const asset = SUPPORTED_ASSETS.find(a => a.symbol === symbol);
        const decimals = asset?.decimals || 0;
        
        if (symbol === 'USDT') return '$' + amount.toFixed(2);
        if (symbol === 'TWT') return amount.toLocaleString() + ' TWT';
        if (decimals === 0) return amount.toLocaleString() + ' ' + symbol;
        if (decimals === 2) return amount.toFixed(2) + ' ' + symbol;
        if (decimals === 4) return amount.toFixed(4) + ' ' + symbol;
        if (decimals === 6) return amount.toFixed(6) + ' ' + symbol;
        return amount.toLocaleString() + ' ' + symbol;
    }

    function formatNumber(value) {
        if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
        return value.toFixed(2);
    }

    function calculateTotalPortfolioValue() {
        if (!userData) return 0;
        let total = userData.balances.USDT || 0;
        total += (userData.balances.TWT || 0) * (marketPrices.TWT?.price || TWT_PRICE);
        total += (userData.balances.BNB || 0) * (marketPrices.BNB?.price || 600);
        total += (userData.balances.BTC || 0) * (marketPrices.BTC?.price || 65000);
        total += (userData.balances.ETH || 0) * (marketPrices.ETH?.price || 3400);
        total += (userData.balances.SOL || 0) * (marketPrices.SOL?.price || 150);
        total += (userData.balances.TRX || 0) * (marketPrices.TRX?.price || 0.25);
        total += (userData.balances.ADA || 0) * (marketPrices.ADA?.price || 0.45);
        total += (userData.balances.DOGE || 0) * (marketPrices.DOGE?.price || 0.15);
        total += (userData.balances.SHIB || 0) * (marketPrices.SHIB?.price || 0.000025);
        total += (userData.balances.PEPE || 0) * (marketPrices.PEPE?.price || 0.000015);
        total += (userData.balances.TON || 0) * (marketPrices.TON?.price || 5.5);
        return total;
    }

    function updateTotalBalance() {
        const el = document.getElementById('totalBalance');
        if (el) el.textContent = '$' + calculateTotalPortfolioValue().toFixed(2);
    }

    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        const msgEl = document.getElementById('toastMessage');
        const icon = toast.querySelector('i');
        if (msgEl) msgEl.textContent = message;
        toast.classList.remove('hidden');
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
        showToast(translate('actions.copy'), 'success');
    }

    // ==========================================================================
    // SECTION 14: NOTIFICATION SYSTEM
    // ==========================================================================
    
    function addNotification(message, type = 'info') {
        if (!userData) return;
        if (!userData.notifications) userData.notifications = [];
        const notification = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 8),
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
        const controls = `
            <div class="notif-controls">
                <button onclick="clearReadNotifications()" class="btn-sm">${translate('notifications.clear_read')}</button>
                <button onclick="clearAllNotifications()" class="btn-sm danger">${translate('notifications.clear_all')}</button>
            </div>
        `;
        
        if (!notifications.length) {
            container.innerHTML = controls + '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
            return;
        }
        
        container.innerHTML = controls + notifications.map(n => {
            const date = new Date(n.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                <div onclick="markNotificationRead('${n.id}')" class="notif-item ${n.read ? '' : 'unread'}">
                    <div class="notif-header">
                        <span class="notif-type ${n.type}">${n.type.toUpperCase()}</span>
                        <span class="notif-time">${timeStr}</span>
                    </div>
                    <div class="notif-message">${n.message}</div>
                </div>
            `;
        }).join('');
    }

    function markNotificationRead(id) {
        const notification = userData.notifications?.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            saveUserData();
            updateNotificationBadge();
            renderNotifications();
        }
    }

    function clearReadNotifications() {
        if (userData) {
            userData.notifications = userData.notifications.filter(n => !n.read);
            saveUserData();
            updateNotificationBadge();
            renderNotifications();
            showToast(translate('notifications.cleared'), 'success');
        }
    }

    function clearAllNotifications() {
        if (userData && confirm(translate('messages.confirm'))) {
            userData.notifications = [];
            saveUserData();
            updateNotificationBadge();
            renderNotifications();
            showToast(translate('notifications.cleared'), 'success');
        }
    }

    function showNotificationsModal() {
        const modal = document.getElementById('notificationsModal');
        if (modal) {
            modal.classList.add('show');
            renderNotifications();
        }
    }

    // ==========================================================================
    // SECTION 15: REFERRAL SYSTEM
    // ==========================================================================
    
    function processReferral() {
        const refCode = startParam;
        if (!refCode || !userData || refCode === userData.referralCode || userData.referredBy) return;
        
        const processedKey = `ref_processed_${userId}`;
        if (localStorage.getItem(processedKey) === refCode) return;
        
        userData.referredBy = refCode;
        userData.balances.TWT = (userData.balances.TWT || 0) + WELCOME_BONUS;
        userData.totalTwtEarned = (userData.totalTwtEarned || 0) + WELCOME_BONUS;
        userData.referralCount = (userData.referralCount || 0) + 1;
        localStorage.setItem(processedKey, refCode);
        saveUserData();
        addNotification(`🎉 ${translate('notif.welcomeBonus')}`, 'success');
        if (activeTab === 'referral') renderReferral();
    }

    function copyReferralLink() {
        copyToClipboard(getReferralLink());
        showToast(translate('success.referralCopied'), 'success');
    }

    function shareReferral() {
        copyToClipboard(`Join Trust Wallet Lite and get ${WELCOME_BONUS} TWT! ${getReferralLink()}`);
        showToast(translate('success.referralCopied'), 'success');
    }

    function claimReferralMilestone(referrals) {
        const milestone = REFERRAL_MILESTONES.find(m => m.referrals === referrals);
        if (!milestone) return;
        
        if (!userData.referralMilestones) {
            userData.referralMilestones = REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false }));
        }
        
        const idx = userData.referralMilestones.findIndex(m => m.referrals === referrals);
        if (idx === -1 || userData.referralMilestones[idx].claimed) return;
        
        if (userData.referralCount < referrals) {
            showToast(`Need ${referrals} referrals`, 'error');
            return;
        }
        
        if (milestone.unit === 'TWT') {
            userData.balances.TWT += milestone.reward;
            userData.totalTwtEarned += milestone.reward;
        } else {
            userData.balances.USDT += milestone.reward;
            userData.totalUsdtEarned += milestone.reward;
        }
        
        userData.referralMilestones[idx].claimed = true;
        addTransaction({
            type: 'referral_reward',
            amount: milestone.reward,
            currency: milestone.unit,
            details: `Milestone: ${referrals} referrals`
        });
        saveUserData();
        renderMilestones();
        updateUI();
        showToast(`🎉 Claimed ${milestone.reward} ${milestone.unit}!`, 'success');
    }

    // ==========================================================================
    // SECTION 16: WALLET RENDERING
    // ==========================================================================
    
    function renderWallet() {
        const container = document.getElementById('walletContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="balance-card">
                <div class="total-balance" id="totalBalance">$${calculateTotalPortfolioValue().toFixed(2)}</div>
                <div class="balance-change"><i class="fas fa-arrow-up"></i> +0.00%</div>
            </div>
            <div class="action-buttons">
                <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${translate('actions.send')}</span></button>
                <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-arrow-down"></i><span>${translate('actions.receive')}</span></button>
                <button class="action-btn" onclick="showSwapModal()"><i class="fas fa-exchange-alt"></i><span>${translate('actions.swap')}</span></button>
                <button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>${translate('actions.deposit')}</span></button>
                <button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>${translate('actions.withdraw')}</span></button>
            </div>
            <div class="section-tabs">
                <button class="section-tab active" onclick="switchAssetTab('crypto')">Crypto</button>
                <button class="section-tab" onclick="switchAssetTab('nfts')">NFTs</button>
            </div>
            <div id="assetsList" class="assets-list"></div>
        `;
        
        renderAssets();
    }

    function renderAssets() {
        const container = document.getElementById('assetsList');
        if (!container || !userData) return;
        
        container.innerHTML = SUPPORTED_ASSETS.map(asset => {
            const balance = userData.balances[asset.symbol] || 0;
            const price = marketPrices[asset.symbol]?.price || (asset.symbol === 'USDT' ? 1 : 0);
            const value = balance * price;
            const change = marketPrices[asset.symbol]?.change || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSign = change >= 0 ? '+' : '';
            
            return `
                <div class="asset-item" onclick="showAssetDetails('${asset.symbol}')">
                    <div class="asset-left">
                        <img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img" alt="${asset.symbol}">
                        <div class="asset-info">
                            <h4>${asset.name}</h4>
                            <p>${asset.symbol} <span class="asset-change ${changeClass}">${changeSign}${change.toFixed(2)}%</span></p>
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
        const price = marketPrices[symbol]?.price || 0;
        showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(balance * price)})`, 'info');
    }

    function switchAssetTab(tab) {
        const tabs = document.querySelectorAll('.section-tab');
        tabs.forEach(t => t.classList.remove('active'));
        if (tab === 'crypto') tabs[0]?.classList.add('active');
        else if (tab === 'nfts') tabs[1]?.classList.add('active');
        showToast(tab === 'crypto' ? 'Crypto assets' : 'NFTs coming soon', 'info');
    }

    // ==========================================================================
    // SECTION 17: REFERRAL RENDERING
    // ==========================================================================
    
    function renderReferral() {
        const container = document.getElementById('referralContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="referral-stats">
                <h3>${translate('referral.total')}</h3>
                <div class="stat-number">${userData.referralCount || 0}</div>
                <h3>${translate('referral.twt')}</h3>
                <div class="stat-number">${(userData.totalTwtEarned || 0).toLocaleString()} TWT</div>
                <h3>${translate('referral.usdt')}</h3>
                <div class="stat-number">${(userData.totalUsdtEarned || 0).toFixed(2)} USDT</div>
            </div>
            <div class="referral-link-card">
                <h4>${translate('referral.link')}</h4>
                <div class="link-container">
                    <input type="text" id="referralLink" value="${getReferralLink()}" readonly>
                    <button class="copy-btn" onclick="copyReferralLink()"><i class="fas fa-copy"></i></button>
                    <button class="share-btn" onclick="shareReferral()"><i class="fas fa-share-alt"></i></button>
                </div>
                <p>${translate('referral.description')} ${REFERRAL_BONUS} ${translate('referral.description2')}</p>
            </div>
            <div id="milestonesList" class="milestones-list"></div>
        `;
        
        renderMilestones();
    }

    function renderMilestones() {
        const container = document.getElementById('milestonesList');
        if (!container) return;
        
        if (!userData.referralMilestones) {
            userData.referralMilestones = REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false }));
        }
        
        container.innerHTML = REFERRAL_MILESTONES.map(m => {
            const progress = Math.min((userData.referralCount / m.referrals) * 100, 100);
            const canClaim = userData.referralCount >= m.referrals && 
                            !userData.referralMilestones.find(x => x.referrals === m.referrals)?.claimed;
            const claimed = userData.referralMilestones.find(x => x.referrals === m.referrals)?.claimed;
            
            return `
                <div class="milestone-item">
                    <div class="milestone-header">
                        <span class="milestone-referrals"><i class="fa-regular ${m.icon}"></i> ${m.referrals} Referrals</span>
                        <span class="milestone-reward">${m.reward} ${m.unit}</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
                    <div class="progress-text">${userData.referralCount}/${m.referrals}</div>
                    ${canClaim ? 
                        `<button class="claim-btn" onclick="claimReferralMilestone(${m.referrals})">${translate('actions.confirm')}</button>` : 
                        claimed ? '<button class="claim-btn completed" disabled>Claimed</button>' : ''
                    }
                </div>
            `;
        }).join('');
    }

    // ==========================================================================
    // SECTION 18: SWAP FUNCTIONS
    // ==========================================================================
    
    function renderSwap() {
        const container = document.getElementById('swapContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="swap-container">
                <div class="swap-box">
                    <div class="swap-label">${translate('swap.from')}</div>
                    <div class="swap-row">
                        <input type="number" id="swapFromAmount" placeholder="0.00" oninput="calculateSwap()">
                        <div class="currency-selector-small" onclick="showSwapCurrencySelector('from')">
                            <img id="swapFromIcon" src="${getCurrencyIcon('TWT')}">
                            <span id="swapFromSymbol">TWT</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="balance-hint">
                        ${translate('wallet.balance')}: <span id="swapFromBalance">${formatBalance(userData.balances.TWT || 0, 'TWT')}</span>
                        <span class="percentage-buttons">
                            <button onclick="setSwapPercentage(25)">25%</button>
                            <button onclick="setSwapPercentage(50)">50%</button>
                            <button onclick="setSwapPercentage(100)">Max</button>
                        </span>
                    </div>
                </div>
                <div class="swap-arrow"><i class="fas fa-arrow-down"></i></div>
                <div class="swap-box">
                    <div class="swap-label">${translate('swap.to')}</div>
                    <div class="swap-row">
                        <input type="number" id="swapToAmount" placeholder="0.00" readonly>
                        <div class="currency-selector-small" onclick="showSwapCurrencySelector('to')">
                            <img id="swapToIcon" src="${getCurrencyIcon('USDT')}">
                            <span id="swapToSymbol">USDT</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="balance-hint">${translate('wallet.balance')}: <span id="swapToBalance">${formatBalance(userData.balances.USDT || 0, 'USDT')}</span></div>
                </div>
                <div class="swap-rate" id="swapRateDisplay">1 TWT ≈ $${(marketPrices.TWT?.price || TWT_PRICE).toFixed(4)}</div>
                <div class="swap-fee"><span>${translate('swap.fee')}</span><span id="swapFee">$0.00</span></div>
                <div class="swap-provider"><span>${translate('swap.provider')}</span><span>Rango</span></div>
                <button class="btn-primary" onclick="confirmSwap()">${translate('actions.confirm')}</button>
            </div>
        `;
        
        updateSwapRate();
    }

    function updateSwapBalances() {
        const fromSymbol = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
        const toSymbol = document.getElementById('swapToSymbol')?.textContent || 'USDT';
        const fromBalance = document.getElementById('swapFromBalance');
        const toBalance = document.getElementById('swapToBalance');
        if (fromBalance) fromBalance.textContent = formatBalance(userData.balances[fromSymbol] || 0, fromSymbol);
        if (toBalance) toBalance.textContent = formatBalance(userData.balances[toSymbol] || 0, toSymbol);
    }

    function setSwapPercentage(percent) {
        const fromSymbol = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
        const balance = userData.balances[fromSymbol] || 0;
        let amount = balance * (percent / 100);
        if (['TWT', 'SHIB', 'PEPE', 'DOGE'].includes(fromSymbol)) {
            amount = Math.floor(amount);
        } else {
            amount = parseFloat(amount.toFixed(6));
        }
        const input = document.getElementById('swapFromAmount');
        if (input) input.value = amount;
        calculateSwap();
    }

    function calculateSwap() {
        const amount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
        const fromSymbol = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
        const toSymbol = document.getElementById('swapToSymbol')?.textContent || 'USDT';
        const fromPrice = marketPrices[fromSymbol]?.price || (fromSymbol === 'USDT' ? 1 : TWT_PRICE);
        const toPrice = marketPrices[toSymbol]?.price || (toSymbol === 'USDT' ? 1 : TWT_PRICE);
        
        let toAmount = 0;
        if (fromPrice > 0 && toPrice > 0) {
            toAmount = (amount * fromPrice) / toPrice;
        }
        
        const toInput = document.getElementById('swapToAmount');
        if (toInput) toInput.value = toAmount.toFixed(6);
        
        updateSwapRate();
        
        const fee = amount * fromPrice * SWAP_FEE_PERCENT;
        const feeEl = document.getElementById('swapFee');
        if (feeEl) feeEl.textContent = `$${fee.toFixed(4)}`;
    }

    function updateSwapRate() {
        const fromSymbol = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
        const toSymbol = document.getElementById('swapToSymbol')?.textContent || 'USDT';
        const fromPrice = marketPrices[fromSymbol]?.price || (fromSymbol === 'USDT' ? 1 : TWT_PRICE);
        const toPrice = marketPrices[toSymbol]?.price || (toSymbol === 'USDT' ? 1 : TWT_PRICE);
        
        const rateEl = document.getElementById('swapRateDisplay');
        if (rateEl && fromPrice > 0 && toPrice > 0) {
            rateEl.textContent = `1 ${fromSymbol} ≈ ${(fromPrice / toPrice).toFixed(6)} ${toSymbol}`;
        }
    }

    function confirmSwap() {
        const amount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
        const fromSymbol = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
        const toSymbol = document.getElementById('swapToSymbol')?.textContent || 'USDT';
        const toAmount = parseFloat(document.getElementById('swapToAmount')?.value) || 0;
        
        if (!amount || amount <= 0) {
            showToast(translate('error.enterAmount'), 'error');
            return;
        }
        
        if ((userData.balances[fromSymbol] || 0) < amount) {
            showToast(translate('error.insufficientBalance', { currency: fromSymbol }), 'error');
            return;
        }
        
        const fromPrice = marketPrices[fromSymbol]?.price || (fromSymbol === 'USDT' ? 1 : TWT_PRICE);
        const fee = amount * fromPrice * SWAP_FEE_PERCENT;
        let finalAmount = amount;
        
        if (fromSymbol === 'USDT') {
            finalAmount = amount - (fee / fromPrice);
        }
        
        if (finalAmount <= 0) {
            showToast('Amount too small after fee', 'error');
            return;
        }
        
        userData.balances[fromSymbol] -= finalAmount;
        userData.balances[toSymbol] = (userData.balances[toSymbol] || 0) + toAmount;
        
        addTransaction({
            type: 'swap',
            fromAmount: finalAmount,
            fromCurrency: fromSymbol,
            toAmount: toAmount,
            toCurrency: toSymbol,
            fee: fee
        });
        
        saveUserData();
        updateUI();
        showToast(`✅ Swapped ${formatBalance(finalAmount, fromSymbol)} to ${formatBalance(toAmount, toSymbol)}`, 'success');
        closeModal('swapModal');
        
        const input = document.getElementById('swapFromAmount');
        if (input) input.value = '';
    }

    // ==========================================================================
    // SECTION 19: SEND & RECEIVE FUNCTIONS
    // ==========================================================================
    
    function showSendModal() {
        document.getElementById('sendModal').classList.add('show');
    }

    function showReceiveModal() {
        updateReceiveAddress();
        document.getElementById('receiveModal').classList.add('show');
    }

    function showSwapModal() {
        document.getElementById('swapModal').classList.add('show');
        updateSwapBalances();
        calculateSwap();
    }

    function sendTransaction() {
        const currency = document.getElementById('sendCurrencySymbol')?.textContent || 'TWT';
        const amount = parseFloat(document.getElementById('sendAmount')?.value);
        const address = document.getElementById('sendAddress')?.value.trim();
        
        if (!amount || amount <= 0) {
            showToast(translate('error.enterAmount'), 'error');
            return;
        }
        
        if (!address) {
            showToast('Enter recipient address', 'error');
            return;
        }
        
        if ((userData.balances[currency] || 0) < amount) {
            showToast(translate('error.insufficientBalance', { currency }), 'error');
            return;
        }
        
        userData.balances[currency] -= amount;
        addTransaction({
            type: 'send',
            amount: amount,
            currency: currency,
            address: address,
            status: 'completed'
        });
        
        saveUserData();
        updateUI();
        showToast(`✅ Sent ${formatBalance(amount, currency)}`, 'success');
        closeModal('sendModal');
        
        const amountInput = document.getElementById('sendAmount');
        const addressInput = document.getElementById('sendAddress');
        if (amountInput) amountInput.value = '';
        if (addressInput) addressInput.value = '';
    }

    function updateReceiveAddress() {
        const currency = document.getElementById('receiveCurrencySymbol')?.textContent || 'TWT';
        const address = `0x${userId.slice(-40).padStart(40, '0')}`;
        const addressEl = document.getElementById('receiveAddress');
        if (addressEl) addressEl.textContent = address;
    }

    function copyAddress() {
        const address = document.getElementById('receiveAddress')?.textContent;
        if (address) copyToClipboard(address);
    }

    // ==========================================================================
    // SECTION 20: DEPOSIT FUNCTIONS
    // ==========================================================================
    
    async function showDepositModal() {
        await updateDepositInfo();
        document.getElementById('depositModal').classList.add('show');
    }

    async function updateDepositInfo() {
        const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
        const address = `0x${userId.slice(-40).padStart(40, '0')}`;
        const addressEl = document.getElementById('depositAddress');
        const minEl = document.getElementById('depositMinAmount');
        if (addressEl) addressEl.textContent = address;
        if (minEl) minEl.textContent = DEPOSIT_LIMITS[currency] || 10;
    }

    function copyDepositAddress() {
        const address = document.getElementById('depositAddress')?.textContent;
        if (address) copyToClipboard(address);
    }

    function submitDeposit() {
        const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
        const amount = parseFloat(document.getElementById('depositAmount')?.value);
        const txHash = document.getElementById('depositTxHash')?.value.trim() || '';
        
        if (!amount || amount <= 0) {
            showToast(translate('error.enterAmount'), 'error');
            return;
        }
        
        const minLimit = DEPOSIT_LIMITS[currency] || 10;
        if (amount < minLimit) {
            showToast(`Minimum deposit is ${minLimit} ${currency}`, 'error');
            return;
        }
        
        const depositRequest = {
            id: 'dep_' + Date.now(),
            userId: userId,
            currency: currency,
            amount: amount,
            txHash: txHash,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        if (!userData.depositRequests) userData.depositRequests = [];
        userData.depositRequests.push(depositRequest);
        addTransaction({ ...depositRequest, type: 'deposit' });
        saveUserData();
        addNotification(`💰 Deposit request: ${amount} ${currency} submitted`, 'info');
        showToast(`✅ Deposit request submitted for ${amount} ${currency}!`, 'success');
        closeModal('depositModal');
        
        const amountInput = document.getElementById('depositAmount');
        const hashInput = document.getElementById('depositTxHash');
        if (amountInput) amountInput.value = '';
        if (hashInput) hashInput.value = '';
    }

    // ==========================================================================
    // SECTION 21: WITHDRAW FUNCTIONS
    // ==========================================================================
    
    function showWithdrawModal() {
        updateWithdrawInfo();
        document.getElementById('withdrawModal').classList.add('show');
    }

    function updateWithdrawInfo() {
        const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
        const minEl = document.getElementById('withdrawMinAmount');
        const feeEl = document.getElementById('withdrawFee');
        if (minEl) minEl.textContent = WITHDRAW_LIMITS[currency] || 10;
        if (feeEl) feeEl.textContent = (WITHDRAW_FEES[currency] || 1) + ' ' + currency;
    }

    function submitWithdrawal() {
        if (userData?.withdrawBlocked) {
            showToast('⛔ Your account is blocked from withdrawals', 'error');
            return;
        }
        
        const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
        const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
        const address = document.getElementById('withdrawAddress')?.value.trim();
        
        if (!amount || amount <= 0) {
            showToast(translate('error.enterAmount'), 'error');
            return;
        }
        
        if (!address) {
            showToast('Enter withdrawal address', 'error');
            return;
        }
        
        const minLimit = WITHDRAW_LIMITS[currency] || 10;
        if (amount < minLimit) {
            showToast(`Minimum withdrawal is ${minLimit} ${currency}`, 'error');
            return;
        }
        
        const fee = WITHDRAW_FEES[currency] || 1;
        const totalNeeded = amount + fee;
        
        if ((userData.balances[currency] || 0) < totalNeeded) {
            showToast(`Insufficient balance (need ${totalNeeded} ${currency})`, 'error');
            return;
        }
        
        userData.balances[currency] -= totalNeeded;
        
        const withdrawalRequest = {
            id: 'wd_' + Date.now(),
            userId: userId,
            currency: currency,
            amount: amount,
            fee: fee,
            address: address,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        if (!userData.withdrawalRequests) userData.withdrawalRequests = [];
        userData.withdrawalRequests.push(withdrawalRequest);
        addTransaction({ ...withdrawalRequest, type: 'withdraw' });
        saveUserData();
        addNotification(`💸 Withdrawal request: ${amount} ${currency} submitted`, 'info');
        showToast(`✅ Withdrawal request submitted for ${amount} ${currency}!`, 'success');
        closeModal('withdrawModal');
        updateUI();
        
        const amountInput = document.getElementById('withdrawAmount');
        const addressInput = document.getElementById('withdrawAddress');
        if (amountInput) amountInput.value = '';
        if (addressInput) addressInput.value = '';
    }

    // ==========================================================================
    // SECTION 22: TWT PAY VIRTUAL CARD
    // ==========================================================================
    
    function renderTWTPay() {
        const container = document.getElementById('twtpayContainer');
        if (!container) return;
        
        const twtBalance = userData.balances.TWT || 0;
        const twtValue = twtBalance * (marketPrices.TWT?.price || TWT_PRICE);
        const cardNumber = userData.userId?.slice(-4) || '0000';
        
        container.innerHTML = `
            <div class="virtual-card">
                <div class="card-chip"><i class="fas fa-microchip"></i></div>
                <div class="card-brand">TWT Pay</div>
                <div class="card-number">
                    <span>****</span><span>****</span><span>****</span><span>${cardNumber}</span>
                </div>
                <div class="card-details">
                    <div>
                        <div class="label">Card Holder</div>
                        <div class="value">${userData.userName || 'TWT User'}</div>
                    </div>
                    <div>
                        <div class="label">Expires</div>
                        <div class="value">12/28</div>
                    </div>
                </div>
                <div class="card-balance">
                    <div class="balance-label">Available Balance</div>
                    <div class="balance-value">${twtBalance.toLocaleString()} TWT</div>
                    <div class="balance-usd">≈ $${twtValue.toFixed(2)} USD</div>
                </div>
                <div class="card-footer">
                    <i class="fab fa-visa"></i>
                    <span>Virtual Card</span>
                </div>
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

    function showTopUpModal() {
        showToast('Top up coming soon!', 'info');
    }

    function showCardSettings() {
        showToast('Card settings coming soon!', 'info');
    }

    function showCardTransactions() {
        const txs = (userData.transactions || []).filter(t => 
            t.currency === 'TWT' || t.fromCurrency === 'TWT' || t.toCurrency === 'TWT'
        );
        
        if (!txs.length) {
            showToast('No TWT transactions', 'info');
            return;
        }
        
        let message = '💳 TWT Card Transactions:\n\n';
        txs.slice(0, 10).forEach(tx => {
            const date = new Date(tx.timestamp).toLocaleDateString();
            if (tx.type === 'send' && tx.currency === 'TWT') {
                message += `📤 Sent ${tx.amount} TWT (${date})\n`;
            } else if (tx.type === 'swap' && tx.toCurrency === 'TWT') {
                message += `🔄 Received ${tx.toAmount?.toFixed(4)} TWT (${date})\n`;
            } else if (tx.type === 'swap' && tx.fromCurrency === 'TWT') {
                message += `🔄 Sent ${tx.fromAmount} TWT (${date})\n`;
            } else if (tx.type === 'referral_reward' && tx.currency === 'TWT') {
                message += `🎉 Referral +${tx.amount} TWT (${date})\n`;
            }
        });
        alert(message);
    }

    // ==========================================================================
    // SECTION 23: SETTINGS
    // ==========================================================================
    
    function renderSettings() {
        const container = document.getElementById('settingsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="settings-list">
                <div class="settings-item" onclick="showNotificationsModal()">
                    <i class="fas fa-bell"></i>
                    <div class="info">
                        <div class="label">${translate('notifications.title')}</div>
                        <div class="desc">View all notifications</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="settings-item" onclick="showHistory()">
                    <i class="fas fa-history"></i>
                    <div class="info">
                        <div class="label">${translate('history.title')}</div>
                        <div class="desc">View all transactions</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="settings-item" onclick="showRecoveryPhrase()">
                    <i class="fas fa-key"></i>
                    <div class="info">
                        <div class="label">${translate('settings.recovery')}</div>
                        <div class="desc">View your backup phrase</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="settings-item" onclick="toggleLanguage()">
                    <i class="fas fa-language"></i>
                    <div class="info">
                        <div class="label">${translate('settings.language')}</div>
                        <div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="settings-item" onclick="toggleTheme()">
                    <i class="fas fa-moon"></i>
                    <div class="info">
                        <div class="label">${translate('settings.theme')}</div>
                        <div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="settings-item logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    <div class="info">
                        <div class="label">${translate('settings.logout')}</div>
                        <div class="desc">Sign out of your wallet</div>
                    </div>
                </div>
            </div>
            <div class="app-version">Trust Wallet Lite v3.0</div>
        `;
    }

    function showRecoveryPhrase() {
        if (!userData.recoveryPhrase) {
            const words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'];
            const shuffled = [...words];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            userData.recoveryPhrase = shuffled.join(' ');
            saveUserData();
        }
        
        const displayEl = document.getElementById('recoveryPhraseDisplay');
        if (displayEl) {
            displayEl.innerHTML = `<div class="recovery-box">${userData.recoveryPhrase}</div>`;
        }
        document.getElementById('recoveryModal').classList.add('show');
    }

    function copyRecoveryPhrase() {
        if (userData.recoveryPhrase) copyToClipboard(userData.recoveryPhrase);
    }

    function logout() {
        if (confirm(translate('messages.confirm'))) {
            localStorage.removeItem(STORAGE_KEY);
            userData = null;
            showOnboarding();
        }
    }

    // ==========================================================================
    // SECTION 24: HISTORY
    // ==========================================================================
    
    function renderHistory(filter = 'all') {
        const container = document.getElementById('historyList');
        if (!container) return;
        
        currentHistoryFilter = filter;
        let transactions = loadTransactions();
        
        if (filter !== 'all') {
            transactions = transactions.filter(tx => tx.type === filter);
        }
        
        if (!transactions.length) {
            container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p></div>';
            return;
        }
        
        container.innerHTML = transactions.map(tx => {
            const date = new Date(tx.timestamp);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
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
            } else if (tx.type === 'referral_reward') {
                icon = 'fa-users';
                typeClass = 'referral';
                typeText = 'Referral';
            }
            
            let statusClass = 'completed';
            let statusText = 'Completed';
            if (tx.status === 'pending') {
                statusClass = 'pending';
                statusText = 'Pending';
            }
            
            const amount = tx.amount || tx.fromAmount || 0;
            const currency = tx.currency || tx.fromCurrency || 'TWT';
            
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
                        <span class="history-amount">${formatBalance(amount, currency)}</span>
                        <span class="history-date">${dateStr} ${timeStr}</span>
                    </div>
                    ${tx.details ? `<div class="history-details">${tx.details}</div>` : ''}
                </div>
            `;
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
        const tabs = document.querySelectorAll('.history-tab');
        tabs.forEach(t => t.classList.remove('active'));
        if (event?.target) event.target.classList.add('active');
        renderHistory(filter);
    }

    // ==========================================================================
    // SECTION 25: ADMIN PANEL
    // ==========================================================================
    
    function showAdminPanel() {
        if (!isAdmin) {
            showToast('Access denied', 'error');
            return;
        }
        document.getElementById('adminPanel').classList.add('show');
        refreshAdminPanel();
    }

    function closeAdminPanel() {
        document.getElementById('adminPanel').classList.remove('show');
    }

    function refreshAdminPanel() {
        const activeTab = document.querySelector('.admin-tab.active')?.textContent?.toLowerCase().includes('deposit') ? 'deposits' : 'withdrawals';
        showAdminTab(activeTab);
    }

    function showAdminTab(tab) {
        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(t => t.classList.remove('active'));
        if (event?.target) event.target.classList.add('active');
        
        const content = document.getElementById('adminContent');
        if (!content) return;
        
        if (tab === 'deposits') {
            const deposits = userData?.depositRequests?.filter(d => d.status === 'pending') || [];
            if (!deposits.length) {
                content.innerHTML = '<div class="empty-state">No pending deposits</div>';
            } else {
                content.innerHTML = deposits.map(d => `
                    <div class="admin-transaction-card">
                        <div class="admin-tx-header">
                            <span class="admin-tx-type deposit">DEPOSIT</span>
                            <span class="admin-tx-status pending">Pending</span>
                        </div>
                        <p><strong>User:</strong> ${d.userId}</p>
                        <p><strong>Amount:</strong> ${d.amount} ${d.currency}</p>
                        <p><strong>TX Hash:</strong> ${d.txHash?.substring(0, 20) || 'N/A'}</p>
                        <div class="admin-tx-actions">
                            <button class="admin-approve-btn" onclick="approveDeposit('${d.id}')">Approve</button>
                            <button class="admin-reject-btn" onclick="rejectDeposit('${d.id}')">Reject</button>
                        </div>
                    </div>
                `).join('');
            }
        } else if (tab === 'withdrawals') {
            const withdrawals = userData?.withdrawalRequests?.filter(w => w.status === 'pending') || [];
            if (!withdrawals.length) {
                content.innerHTML = '<div class="empty-state">No pending withdrawals</div>';
            } else {
                content.innerHTML = withdrawals.map(w => `
                    <div class="admin-transaction-card">
                        <div class="admin-tx-header">
                            <span class="admin-tx-type withdraw">WITHDRAWAL</span>
                            <span class="admin-tx-status pending">Pending</span>
                        </div>
                        <p><strong>User:</strong> ${w.userId}</p>
                        <p><strong>Amount:</strong> ${w.amount} ${w.currency}</p>
                        <p><strong>Address:</strong> ${w.address?.substring(0, 20)}...</p>
                        <p><strong>Fee:</strong> ${w.fee} ${w.currency}</p>
                        <div class="admin-tx-actions">
                            <button class="admin-approve-btn" onclick="approveWithdrawal('${w.id}')">Approve</button>
                            <button class="admin-reject-btn" onclick="rejectWithdrawal('${w.id}')">Reject</button>
                        </div>
                    </div>
                `).join('');
            }
        } else if (tab === 'users') {
            content.innerHTML = `
                <div class="admin-user-search">
                    <input type="text" id="adminUserIdInput" placeholder="Enter User ID" class="modal-input">
                    <button onclick="adminLoadUser()" class="btn-primary">Search User</button>
                    <div id="adminUserStats"></div>
                </div>
            `;
        } else if (tab === 'stats') {
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><h3>TWT Price</h3><div class="stat-value">$${(marketPrices.TWT?.price || TWT_PRICE).toFixed(4)}</div></div>
                    <div class="stat-card"><h3>Your TWT</h3><div class="stat-value">${(userData?.balances.TWT || 0).toLocaleString()}</div></div>
                    <div class="stat-card"><h3>Total Referrals</h3><div class="stat-value">${userData?.referralCount || 0}</div></div>
                    <div class="stat-card"><h3>Pending Requests</h3><div class="stat-value">${(userData?.depositRequests?.filter(d => d.status === 'pending').length || 0) + (userData?.withdrawalRequests?.filter(w => w.status === 'pending').length || 0)}</div></div>
                </div>
            `;
        }
    }

    function approveDeposit(id) {
        const deposit = userData.depositRequests?.find(d => d.id === id);
        if (deposit) {
            deposit.status = 'approved';
            userData.balances[deposit.currency] = (userData.balances[deposit.currency] || 0) + deposit.amount;
            addNotification(`✅ Deposit of ${deposit.amount} ${deposit.currency} approved!`, 'success');
            saveUserData();
            updateUI();
            refreshAdminPanel();
            showToast('Deposit approved', 'success');
        }
    }

    function rejectDeposit(id) {
        const deposit = userData.depositRequests?.find(d => d.id === id);
        if (deposit) {
            deposit.status = 'rejected';
            addNotification(`❌ Deposit of ${deposit.amount} ${deposit.currency} rejected.`, 'error');
            saveUserData();
            refreshAdminPanel();
            showToast('Deposit rejected', 'warning');
        }
    }

    function approveWithdrawal(id) {
        const withdrawal = userData.withdrawalRequests?.find(w => w.id === id);
        if (withdrawal) {
            withdrawal.status = 'approved';
            addNotification(`✅ Withdrawal of ${withdrawal.amount} ${withdrawal.currency} approved!`, 'success');
            saveUserData();
            refreshAdminPanel();
            showToast('Withdrawal approved', 'success');
        }
    }

    function rejectWithdrawal(id) {
        const withdrawal = userData.withdrawalRequests?.find(w => w.id === id);
        if (withdrawal) {
            withdrawal.status = 'rejected';
            userData.balances[withdrawal.currency] = (userData.balances[withdrawal.currency] || 0) + withdrawal.amount + (withdrawal.fee || 0);
            addNotification(`❌ Withdrawal of ${withdrawal.amount} ${withdrawal.currency} rejected.`, 'error');
            saveUserData();
            updateUI();
            refreshAdminPanel();
            showToast('Withdrawal rejected', 'warning');
        }
    }

    function adminLoadUser() {
        const uid = document.getElementById('adminUserIdInput')?.value.trim();
        const stats = document.getElementById('adminUserStats');
        if (!uid) {
            showToast('Enter User ID', 'error');
            return;
        }
        
        if (uid === userId) {
            stats.innerHTML = `
                <div class="admin-transaction-card">
                    <h4>User: ${userData.userName}</h4>
                    <p><strong>ID:</strong> ${userData.userId}</p>
                    <p><strong>Referrals:</strong> ${userData.referralCount}</p>
                    <p><strong>TWT:</strong> ${userData.balances.TWT?.toLocaleString()}</p>
                    <p><strong>USDT:</strong> $${userData.balances.USDT?.toFixed(2)}</p>
                    <div class="admin-tx-actions">
                        <button class="admin-approve-btn" onclick="adminAddBalance()">Add Balance</button>
                        <button class="admin-reject-btn" onclick="adminRemoveBalance()">Remove Balance</button>
                        <button class="admin-reject-btn" onclick="adminBlockUser()" style="background:#dc2626;">Block User</button>
                    </div>
                </div>
            `;
        } else {
            stats.innerHTML = '<div class="empty-state">User not found (demo mode)</div>';
        }
    }

    function adminAddBalance() {
        const currency = prompt('Currency (TWT, USDT, etc.):', 'TWT');
        if (!currency) return;
        const amount = parseFloat(prompt(`Amount to ADD (${currency}):`, '0'));
        if (isNaN(amount) || amount <= 0) return;
        userData.balances[currency] = (userData.balances[currency] || 0) + amount;
        saveUserData();
        updateUI();
        showToast(`✅ Added ${amount} ${currency}`, 'success');
        adminLoadUser();
    }

    function adminRemoveBalance() {
        const currency = prompt('Currency (TWT, USDT, etc.):', 'TWT');
        if (!currency) return;
        const amount = parseFloat(prompt(`Amount to REMOVE (${currency}):`, '0'));
        if (isNaN(amount) || amount <= 0) return;
        userData.balances[currency] = Math.max(0, (userData.balances[currency] || 0) - amount);
        saveUserData();
        updateUI();
        showToast(`✅ Removed ${amount} ${currency}`, 'success');
        adminLoadUser();
    }

    function adminBlockUser() {
        if (confirm('⚠️ PERMANENT BLOCK WARNING ⚠️\n\nBlock this user from withdrawals?\nTHIS CANNOT BE UNDONE!')) {
            userData.withdrawBlocked = true;
            saveUserData();
            showToast('User permanently blocked from withdrawals', 'warning');
            adminLoadUser();
        }
    }

    // ==========================================================================
    // SECTION 26: CURRENCY SELECTOR
    // ==========================================================================
    
    function showCurrencySelector(context) {
        currentCurrencyContext = context;
        const modal = document.getElementById('currencySelectorModal');
        const list = document.getElementById('currencyList');
        
        if (list) {
            list.innerHTML = SUPPORTED_ASSETS.map(asset => `
                <div class="currency-list-item" onclick="selectCurrency('${asset.symbol}')">
                    <img src="${getCurrencyIcon(asset.symbol)}">
                    <div>
                        <h4>${asset.name}</h4>
                        <p>${asset.symbol}</p>
                    </div>
                </div>
            `).join('');
        }
        
        if (modal) modal.classList.add('show');
    }

    function showSwapCurrencySelector(context) {
        currentSwapContext = context;
        const modal = document.getElementById('currencySelectorModal');
        const list = document.getElementById('currencyList');
        
        if (list) {
            list.innerHTML = SUPPORTED_ASSETS.map(asset => `
                <div class="currency-list-item" onclick="selectSwapCurrency('${asset.symbol}')">
                    <img src="${getCurrencyIcon(asset.symbol)}">
                    <div>
                        <h4>${asset.name}</h4>
                        <p>${asset.symbol}</p>
                    </div>
                </div>
            `).join('');
        }
        
        if (modal) modal.classList.add('show');
    }

    function selectCurrency(symbol) {
        if (currentCurrencyContext === 'send') {
            const symbolEl = document.getElementById('sendCurrencySymbol');
            const iconEl = document.getElementById('sendCurrencyIcon');
            if (symbolEl) symbolEl.textContent = symbol;
            if (iconEl) iconEl.src = getCurrencyIcon(symbol);
        } else if (currentCurrencyContext === 'receive') {
            const symbolEl = document.getElementById('receiveCurrencySymbol');
            const iconEl = document.getElementById('receiveCurrencyIcon');
            if (symbolEl) symbolEl.textContent = symbol;
            if (iconEl) iconEl.src = getCurrencyIcon(symbol);
            updateReceiveAddress();
        } else if (currentCurrencyContext === 'deposit') {
            const symbolEl = document.getElementById('depositCurrencySymbol');
            const iconEl = document.getElementById('depositCurrencyIcon');
            if (symbolEl) symbolEl.textContent = symbol;
            if (iconEl) iconEl.src = getCurrencyIcon(symbol);
            updateDepositInfo();
        } else if (currentCurrencyContext === 'withdraw') {
            const symbolEl = document.getElementById('withdrawCurrencySymbol');
            const iconEl = document.getElementById('withdrawCurrencyIcon');
            if (symbolEl) symbolEl.textContent = symbol;
            if (iconEl) iconEl.src = getCurrencyIcon(symbol);
            updateWithdrawInfo();
        }
        closeModal('currencySelectorModal');
    }

    function selectSwapCurrency(symbol) {
        if (currentSwapContext === 'from') {
            const symbolEl = document.getElementById('swapFromSymbol');
            const iconEl = document.getElementById('swapFromIcon');
            if (symbolEl) symbolEl.textContent = symbol;
            if (iconEl) iconEl.src = getCurrencyIcon(symbol);
            updateSwapBalances();
            calculateSwap();
        } else if (currentSwapContext === 'to') {
            const symbolEl = document.getElementById('swapToSymbol');
            const iconEl = document.getElementById('swapToIcon');
            if (symbolEl) symbolEl.textContent = symbol;
            if (iconEl) iconEl.src = getCurrencyIcon(symbol);
            updateSwapBalances();
            calculateSwap();
        }
        closeModal('currencySelectorModal');
    }

    function filterCurrencies() {
        const search = document.getElementById('currencySearch')?.value.toLowerCase() || '';
        const items = document.querySelectorAll('.currency-list-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(search) ? 'flex' : 'none';
        });
    }

    // ==========================================================================
    // SECTION 27: NAVIGATION & UI
    // ==========================================================================
    
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                if (tab) switchTab(tab);
            });
        });
    }

    function switchTab(tab) {
        activeTab = tab;
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => content.classList.remove('active'));
        
        const activeContent = document.getElementById(`${tab}Section`);
        if (activeContent) activeContent.classList.add('active');
        
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
        if (activeTab === 'wallet') renderWallet();
        else if (activeTab === 'swap') renderSwap();
        else if (activeTab === 'referral') renderReferral();
        else if (activeTab === 'twtpay') renderTWTPay();
        else if (activeTab === 'settings') renderSettings();
    }

    // ==========================================================================
    // SECTION 28: STICKER SYSTEM
    // ==========================================================================
    
    const STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '✨', '🌟', '⭐', '🔥', '⚡', '💎', '🔔', '🎁', '🎈', '🎉', '🎊', '👑', '🚀', '💫'];
    let lastStickerTime = 0;
    const STICKER_COOLDOWN = 720000; // 12 minutes

    function showRandomSticker() {
        const now = Date.now();
        if (now - lastStickerTime < STICKER_COOLDOWN) return;
        
        const stickerEl = document.getElementById('welcomeSticker');
        if (!stickerEl) return;
        
        const randomSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
        stickerEl.textContent = randomSticker;
        stickerEl.classList.remove('sticker-pop', 'sticker-shake');
        
        void stickerEl.offsetWidth;
        stickerEl.classList.add('sticker-pop');
        
        setTimeout(() => stickerEl.classList.add('sticker-shake'), 200);
        setTimeout(() => {
            stickerEl.classList.remove('sticker-pop', 'sticker-shake');
            setTimeout(() => stickerEl.textContent = '', 300);
        }, 3000);
        
        lastStickerTime = now;
    }

    // ==========================================================================
    // SECTION 29: ONBOARDING & WALLET CREATION
    // ==========================================================================
    
    function showOnboarding() {
        const onboarding = document.getElementById('onboardingScreen');
        const main = document.getElementById('mainContent');
        if (onboarding) onboarding.style.display = 'flex';
        if (main) main.style.display = 'none';
    }

    function showMainApp() {
        const onboarding = document.getElementById('onboardingScreen');
        const main = document.getElementById('mainContent');
        if (onboarding) onboarding.style.display = 'none';
        if (main) main.style.display = 'block';
        switchTab('wallet');
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

    function createNewWallet() {
        const btn = document.getElementById('createWalletBtn');
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        btn.disabled = true;
        
        setTimeout(() => {
            userData = {
                userId: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
                userName: 'User',
                referralCode: generateReferralCode(),
                balances: {
                    TWT: WELCOME_BONUS, USDT: 0, BNB: 0, BTC: 0, ETH: 0,
                    SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
                },
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
            
            isAdmin = userData.userId === ADMIN_ID;
            saveUserData();
            showMainApp();
            updateUI();
            showAdminCrown();
            processReferral();
            showToast(`🎉 Welcome! You received ${WELCOME_BONUS} TWT!`, 'success');
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 500);
    }

    function importWallet() {
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
        
        setTimeout(() => {
            userData = {
                userId: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
                userName: 'User',
                recoveryPhrase: recoveryPhrase,
                referralCode: generateReferralCode(),
                balances: {
                    TWT: WELCOME_BONUS, USDT: 0, BNB: 0, BTC: 0, ETH: 0,
                    SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
                },
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
            
            isAdmin = userData.userId === ADMIN_ID;
            saveUserData();
            closeModal('importModal');
            showMainApp();
            updateUI();
            showAdminCrown();
            processReferral();
            showToast(`🎉 Wallet imported! You received ${WELCOME_BONUS} TWT!`, 'success');
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 500);
    }

    // ==========================================================================
    // SECTION 30: INITIALIZATION
    // ==========================================================================
    
    document.addEventListener('DOMContentLoaded', async () => {
        setTheme(currentTheme);
        setLanguage(currentLanguage);
        
        setTimeout(() => {
            const splash = document.getElementById('splashScreen');
            if (splash) splash.classList.add('hidden');
        }, 1500);
        
        await fetchMarketPrices();
        setInterval(() => fetchMarketPrices(), 1800000); // Every 30 minutes
        
        if (loadUserData()) {
            showMainApp();
            updateUI();
            showAdminCrown();
            processReferral();
        } else {
            showOnboarding();
        }
        
        setupNavigation();
        
        window.addEventListener('scroll', () => {
            const scrollBtn = document.getElementById('scrollTopBtn');
            if (scrollBtn) {
                scrollBtn.classList.toggle('show', window.scrollY > 300);
            }
        });
        
        setTimeout(() => showRandomSticker(), 500);
    });

    // ==========================================================================
    // SECTION 31: GLOBAL EXPORTS (Professional)
    // ==========================================================================
    
    // Core Navigation
    window.showWallet = () => switchTab('wallet');
    window.showSwap = () => switchTab('swap');
    window.showReferral = () => switchTab('referral');
    window.showTWTPay = () => switchTab('twtpay');
    window.showSettings = () => switchTab('settings');
    
    // Modal Controllers
    window.showSendModal = showSendModal;
    window.showReceiveModal = showReceiveModal;
    window.showSwapModal = showSwapModal;
    window.showDepositModal = showDepositModal;
    window.showWithdrawModal = showWithdrawModal;
    window.showHistory = showHistory;
    window.showNotifications = showNotificationsModal;
    window.showAdminPanel = showAdminPanel;
    window.closeModal = closeModal;
    window.closeAdminPanel = closeAdminPanel;
    
    // Transaction Actions
    window.sendTransaction = sendTransaction;
    window.confirmSwap = confirmSwap;
    window.submitDeposit = submitDeposit;
    window.submitWithdrawal = submitWithdrawal;
    window.copyAddress = copyAddress;
    window.copyDepositAddress = copyDepositAddress;
    window.copyReferralLink = copyReferralLink;
    window.shareReferral = shareReferral;
    
    // Price & Utilities
    window.refreshPrices = refreshPrices;
    window.scrollToTop = scrollToTop;
    window.setSwapPercentage = setSwapPercentage;
    window.calculateSwap = calculateSwap;
    
    // Referral
    window.claimReferralMilestone = claimReferralMilestone;
    
    // Settings
    window.showRecoveryPhrase = showRecoveryPhrase;
    window.copyRecoveryPhrase = copyRecoveryPhrase;
    window.logout = logout;
    
    // TWT Pay
    window.showTopUpModal = showTopUpModal;
    window.showCardSettings = showCardSettings;
    window.showCardTransactions = showCardTransactions;
    
    // History & Filters
    window.filterHistory = filterHistory;
    
    // Currency Selectors
    window.showCurrencySelector = showCurrencySelector;
    window.showSwapCurrencySelector = showSwapCurrencySelector;
    window.selectCurrency = selectCurrency;
    window.selectSwapCurrency = selectSwapCurrency;
    window.filterCurrencies = filterCurrencies;
    
    // Admin Functions
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
    
    // Notifications
    window.markNotificationRead = markNotificationRead;
    window.clearReadNotifications = clearReadNotifications;
    window.clearAllNotifications = clearAllNotifications;
    
    // Language & Theme
    window.toggleLanguage = toggleLanguage;
    window.toggleTheme = toggleTheme;
    
    // Asset & Toast
    window.showAssetDetails = showAssetDetails;
    window.showToast = showToast;
    window.copyToClipboard = copyToClipboard;
    
    // Onboarding
    window.createNewWallet = createNewWallet;
    window.showImportModal = showImportModal;
    window.importWallet = importWallet;
    
    console.log('[TrustWallet] v3.0 - Fully Loaded');
    console.log('[TrustWallet] Features: 12 Cryptocurrencies, 8 Referral Milestones, TWT Pay Card');
    console.log('[TrustWallet] Zero Waste Architecture | Dark/Light Mode | RTL Support');
})();
