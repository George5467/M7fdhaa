// ============================================================================
// TRUST WALLET LITE - FINAL FIXED VERSION v9.1
// Architecture: Telegram-First, localStorage as fallback ONLY
// Fixed: Proper async wait before ANY localStorage check
// ============================================================================

(function() {
    window.TWT = window.TWT || {};
    
    const tg = window.Telegram?.WebApp;
    let userId = null;
    let userName = 'User';
    let userFirstName = 'User';
    let userLastName = '';
    let userUsername = '';
    let userPhoto = '';
    let authMethod = 'none';
    let IS_GUEST = true;
    
    // ✅ 1. انتظار Telegram الحقيقي (أولوية قصوى)
    async function waitForTelegramUser(maxWaitMs = 5000) {
        if (!tg) {
            console.log("❌ No Telegram WebApp object");
            return null;
        }
        
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation?.();
        
        const startTime = Date.now();
        let attempts = 0;
        
        while (Date.now() - startTime < maxWaitMs) {
            attempts++;
            
            // المحاولة 1: initDataUnsafe.user (الأسرع)
            if (tg.initDataUnsafe?.user?.id) {
                const u = tg.initDataUnsafe.user;
                console.log(`✅ Telegram user found after ${attempts} attempts via initDataUnsafe`);
                return {
                    id: u.id.toString(),
                    firstName: u.first_name || 'User',
                    lastName: u.last_name || '',
                    username: u.username || '',
                    photoUrl: u.photo_url || '',
                    method: 'telegram_initDataUnsafe'
                };
            }
            
            // المحاولة 2: فك initData يدوياً
            if (tg.initData) {
                try {
                    const params = new URLSearchParams(tg.initData);
                    const userJson = params.get('user');
                    if (userJson) {
                        const u = JSON.parse(decodeURIComponent(userJson));
                        if (u?.id) {
                            console.log(`✅ Telegram user found after ${attempts} attempts via initData parse`);
                            return {
                                id: u.id.toString(),
                                firstName: u.first_name || 'User',
                                lastName: u.last_name || '',
                                username: u.username || '',
                                photoUrl: u.photo_url || '',
                                method: 'telegram_initData'
                            };
                        }
                    }
                } catch(e) {}
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`⚠️ Telegram timeout after ${attempts} attempts`);
        return null;
    }
    
    // ✅ 2. التهيئة الرئيسية (async كاملة - Telegram أولاً)
    async function initUser() {
        console.log("🚀 Starting user detection (Telegram-first approach)...");
        
        // 🎯 الأولوية القصوى: انتظار Telegram
        const telegramUser = await waitForTelegramUser(5000);
        
        if (telegramUser) {
            // ✅✅✅ مستخدم حقيقي من Telegram
            userId = telegramUser.id;
            userName = telegramUser.firstName;
            userFirstName = telegramUser.firstName;
            userLastName = telegramUser.lastName;
            userUsername = telegramUser.username;
            userPhoto = telegramUser.photoUrl;
            authMethod = telegramUser.method;
            IS_GUEST = false;
            
            console.log("🎉 AUTHENTICATED TELEGRAM USER:", userId);
            
            // حفظ للاستخدام المستقبلي (مع توقيت)
            localStorage.setItem('twt_user_id', userId);
            localStorage.setItem('twt_user_name', userName);
            localStorage.setItem('twt_auth_method', authMethod);
            localStorage.setItem('twt_timestamp', Date.now().toString());
            
        } else {
            // ❌ Telegram غير موجود - نحاول localStorage كـ FALLBACK فقط
            console.log("⚠️ No Telegram detected, checking localStorage fallback...");
            
            const savedId = localStorage.getItem('twt_user_id');
            const savedName = localStorage.getItem('twt_user_name');
            const savedMethod = localStorage.getItem('twt_auth_method');
            const savedTime = localStorage.getItem('twt_timestamp');
            
            // قبول فقط إذا كان من Telegram سابقاً وحديث (< 24 ساعة)
            const isRecent = savedTime && (Date.now() - parseInt(savedTime)) < (24 * 60 * 60 * 1000);
            const isTelegramSource = savedMethod?.startsWith('telegram_');
            
            if (savedId && isTelegramSource && !savedId.startsWith('guest_') && isRecent) {
                userId = savedId;
                userName = savedName || 'User';
                authMethod = 'localStorage_restore';
                IS_GUEST = false;
                console.log("📦 Restored from recent Telegram session:", userId);
            } else {
                // 🚫 وضع ضيف حقيقي
                userId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                userName = 'Guest User';
                authMethod = 'guest';
                IS_GUEST = true;
                console.warn("🚫 GUEST MODE - No valid Telegram session found");
            }
        }
        
        // ✅ 3. تعيين القيم النهائية
        window.TWT.userId = userId;
        window.TWT.userName = userName;
        window.TWT.userFirstName = userFirstName;
        window.TWT.userLastName = userLastName;
        window.TWT.userUsername = userUsername;
        window.TWT.userPhoto = userPhoto;
        window.TWT.isGuest = IS_GUEST;
        window.TWT.authMethod = authMethod;
        window.TWT.hasTelegramWebApp = !!tg;
        
        // ✅ 4. عرض النتيجة
        console.log("=== FINAL USER DETECTION ===");
        console.log("ID:", userId);
        console.log("Name:", userName);
        console.log("Guest:", IS_GUEST);
        console.log("Method:", authMethod);
        console.log("=============================");
        
        showDebugToast();
        
        // ✅ 5. تحميل بيانات المستخدم بعد التأكد التام
        if (typeof loadUserData === 'function') {
            await loadUserData();
        }
        
        // ✅ 6. معالجة الإحالة من الرابط (إن وجد)
        await processReferralFromUrl();
    }
    
    function showDebugToast() {
        const debugToast = document.createElement('div');
        debugToast.style.cssText = `
            position: fixed; bottom: 16px; left: 16px; right: 16px;
            background: ${IS_GUEST ? '#ff9800' : '#4caf50'}; color: #000;
            font-family: monospace; font-size: 11px; padding: 10px;
            border-radius: 12px; z-index: 10000; text-align: center;
            backdrop-filter: blur(8px); opacity: 0.9; pointer-events: none;
        `;
        debugToast.innerHTML = `
            <strong>${IS_GUEST ? '🔶 GUEST MODE' : '✅ AUTHENTICATED'}</strong> &nbsp;|&nbsp;
            ID: ${userId.slice(-12)} &nbsp;|&nbsp;
            Method: ${authMethod} &nbsp;|&nbsp;
            ${tg ? '📱 WebApp' : '🌐 Direct'}
        `;
        document.body.appendChild(debugToast);
        setTimeout(() => { debugToast.style.opacity = '0'; setTimeout(() => debugToast.remove(), 500); }, 8000);
    }
    
    async function processReferralFromUrl() {
        if (IS_GUEST) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('startapp') || urlParams.get('start') || urlParams.get('ref');
        
        if (startParam && startParam !== userId) {
            console.log("🔗 Referral code detected:", startParam);
            window.TWT.pendingReferral = startParam;
        }
    }
    
    // ✅ 6. تشغيل فوري
    initUser();
    
    console.log("✅ User Detection System Initialized (Telegram-First, localStorage as fallback)");
})();

// ====== 2. GLOBAL CONFIGURATION (NO SECRETS) ======
const CONFIG = {
    APP: {
        name: 'Trust Wallet Lite',
        version: '9.1.0',
        botLink: 'https://t.me/TrustWalletLiteTGbot/twt'
    },
    ECONOMY: {
        airdropBonus: 10,
        referralBonus: 25,
        twtPrice: 1.25,
        swapRate: 500000,
        minDeposit: { TWT: 500000, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005, SHIB: 2000000, PEPE: 3000000, SOL: 0.12, TRX: 40 },
        minWithdraw: { USDT: 10, TWT: 1000000, BNB: 0.02 },
        withdrawFee: { USDT: 0.00016, BNB: 0.0005, TWT: 1 }
    },
    CACHE: {
        userTTL: 300000,
        pricesTTL: 10800000,
        historyTTL: 600000
    },
    STICKERS: ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '👑', '❤️‍🔥', '🫂', '🔥', '🧡', '🎁', '💌', '🎉', '👑', '🚀', '💟', '🐸']
};

// ====== 3. ICONS REGISTRY ======
const ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
    SHIB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
    PEPE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png'
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

// ====== 4. STATE MANAGEMENT ======
let appState = {
    user: null,
    prices: {},
    language: localStorage.getItem('language') || 'en',
    theme: localStorage.getItem('theme') || 'light',
    currentPage: 'wallet',
    unreadCount: 0,
    isInitialized: false,
    isAdmin: false
};

// ====== 5. TRANSLATIONS ======
const LOCALES = {
    en: {
        'nav.wallet': 'Wallet', 'nav.airdrop': 'Airdrop', 'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw', 'actions.send': 'Send', 'actions.receive': 'Receive', 'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance', 'airdrop.totalInvites': 'Total Invites', 'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link', 'airdrop.milestones': 'Airdrop Milestones',
        'notifications.title': 'Notifications', 'settings.language': 'Language', 'settings.theme': 'Theme', 'settings.logout': 'Logout',
        'notifications.clear_read': 'Clear Read', 'notifications.clear_all': 'Clear All',
        'notifications.no_notifications': 'No notifications',
        'admin.panel': 'Admin Panel', 'admin.refresh': 'Refresh', 'admin.manageUsers': 'Manage Users'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.airdrop': 'الإسقاط الجوي', 'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب', 'actions.send': 'إرسال', 'actions.receive': 'استلام', 'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي', 'airdrop.totalInvites': 'إجمالي الدعوات', 'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة', 'airdrop.milestones': 'مراحل الإسقاط',
        'notifications.title': 'الإشعارات', 'settings.language': 'اللغة', 'settings.theme': 'المظهر', 'settings.logout': 'تسجيل الخروج',
        'notifications.clear_read': 'حذف المقروء', 'notifications.clear_all': 'حذف الكل',
        'notifications.no_notifications': 'لا توجد إشعارات',
        'admin.panel': 'لوحة المشرف', 'admin.refresh': 'تحديث', 'admin.manageUsers': 'إدارة المستخدمين'
    }
};

function t(key) { return LOCALES[appState.language]?.[key] || LOCALES.en[key] || key; }

// ====== 6. HELPER FUNCTIONS ======
function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    return balance.toFixed(4) + ' ' + symbol;
}
function formatNumber(num) {
    if (num >= 1e6) return (num/1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num/1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}
function getCurrencyIcon(symbol) { return ICONS[symbol] || ICONS.TWT; }
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toastMessage').textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }
function copyToClipboard(text) { navigator.clipboard.writeText(text); showToast('Copied!'); }

// ====== 7. THEME & LANGUAGE ======
function toggleLanguage() {
    appState.language = appState.language === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', appState.language);
    document.getElementById('currentLanguageFlag').textContent = appState.language === 'en' ? '🇬🇧' : '🇸🇦';
    if (appState.language === 'ar') { document.body.classList.add('rtl'); document.documentElement.dir = 'rtl'; }
    else { document.body.classList.remove('rtl'); document.documentElement.dir = 'ltr'; }
    updateAllTexts();
    showToast('Language changed');
}
function toggleTheme() {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', appState.theme);
    document.documentElement.setAttribute('data-theme', appState.theme);
}
function initTheme() { document.documentElement.setAttribute('data-theme', appState.theme); }
function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
}

// ====== 8. API LAYER (ALL SECRETS IN RENDER SERVER) ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`/api${endpoint}`, opts);
    return res.json();
}

// ====== 9. PRICES WITH CACHE ======
let lastPricesFetch = 0;
async function fetchLivePrices(force = false) {
    const now = Date.now();
    if (!force && lastPricesFetch && (now - lastPricesFetch) < CONFIG.CACHE.pricesTTL) return;
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=trust-wallet-token,tether,binancecoin,bitcoin,ethereum,solana,tron,shiba-inu,pepe&vs_currencies=usd');
        const data = await res.json();
        appState.prices = {
            TWT: data['trust-wallet-token']?.usd || 1.25,
            USDT: data.tether?.usd || 1,
            BNB: data.binancecoin?.usd || 0,
            BTC: data.bitcoin?.usd || 0,
            ETH: data.ethereum?.usd || 0,
            SOL: data.solana?.usd || 0,
            TRX: data.tron?.usd || 0,
            SHIB: data['shiba-inu']?.usd || 0,
            PEPE: data.pepe?.usd || 0
        };
        lastPricesFetch = now;
        if (appState.currentPage === 'wallet') renderAssets();
        updateTotalBalance();
    } catch(e) { console.error(e); }
}
function refreshPrices() { fetchLivePrices(true); showToast('Prices refreshed!'); }

// ====== 10. USER DATA MANAGEMENT (VIA API) ======
let userData = null;

async function loadUserData() {
    const userId = window.TWT.userId;
    const isGuest = window.TWT.isGuest;
    
    console.log("📂 Loading user data for:", userId, "| Guest:", isGuest);
    
    try {
        // Check admin status via API
        if (!isGuest) {
            try {
                const adminCheck = await apiCall('/admin/check', 'POST', { userId });
                appState.isAdmin = adminCheck.isAdmin;
            } catch(e) { appState.isAdmin = false; }
        }
        
        const local = localStorage.getItem(`user_${userId}`);
        if (local && !isGuest) {
            userData = JSON.parse(local);
            renderUI();
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            checkAdminAndAddCrown();
            return;
        }
        
        if (!isGuest) {
            const res = await apiCall(`/users/${userId}`);
            if (res.success && res.data) {
                userData = res.data;
                localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                renderUI();
                document.getElementById('onboardingScreen').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                checkAdminAndAddCrown();
                
                // Process pending referral if exists
                if (window.TWT.pendingReferral) {
                    await processReferral(window.TWT.pendingReferral);
                }
                return;
            }
        }
        
        // No user found - show onboarding
        document.getElementById('onboardingScreen').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        
        if (isGuest) {
            document.getElementById('onboardingScreen').innerHTML = `
                <div class="onboarding-container">
                    <div class="logo-icon-large"><i class="fas fa-shield-alt"></i></div>
                    <h1>Trust Wallet Lite</h1>
                    <p>Open from Telegram to create your wallet</p>
                    <a href="${CONFIG.APP.botLink}" class="btn-primary">Open in Telegram</a>
                    <button onclick="enableGuestPreview()" class="btn-secondary" style="margin-top:12px;">Preview Demo</button>
                </div>
            `;
        }
    } catch(e) { console.error(e); }
}

function saveUserData() {
    if (userData && !window.TWT.isGuest) {
        localStorage.setItem(`user_${window.TWT.userId}`, JSON.stringify(userData));
        apiCall(`/users/${window.TWT.userId}`, 'PATCH', { updates: userData });
    }
}

async function createNewWallet() {
    if (window.TWT.isGuest) { 
        showToast('Please open from Telegram to create a wallet', 'error');
        return; 
    }
    const btn = document.getElementById('createWalletBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...'; }
    try {
        const newUser = {
            userId: window.TWT.userId,
            userName: window.TWT.userName,
            balances: { TWT: 1000, USDT: CONFIG.ECONOMY.airdropBonus, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, SHIB: 0, PEPE: 0 },
            inviteCount: 0, invitedBy: null, totalUsdtEarned: CONFIG.ECONOMY.airdropBonus,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Welcome! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [{ type: 'airdrop', amount: CONFIG.ECONOMY.airdropBonus, currency: 'USDT', timestamp: new Date().toISOString() }],
            withdrawBlocked: false, createdAt: new Date().toISOString()
        };
        
        const res = await apiCall('/users', 'POST', { userId: window.TWT.userId, userData: newUser });
        if (res.success) {
            userData = newUser;
            localStorage.setItem(`user_${window.TWT.userId}`, JSON.stringify(userData));
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            renderUI();
            showToast('✅ Wallet created! +10 USDT');
            checkAdminAndAddCrown();
            
            if (window.TWT.pendingReferral) {
                await processReferral(window.TWT.pendingReferral);
            }
        }
    } catch(e) { showToast('Failed to create wallet', 'error'); }
    finally { if (btn) { btn.disabled = false; btn.innerHTML = 'Create a new wallet'; } }
}

function enableGuestPreview() {
    userData = {
        userId: 'demo_preview',
        userName: 'Demo User',
        balances: { TWT: 1000, USDT: 10, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, SHIB: 0, PEPE: 0 },
        inviteCount: 0, totalUsdtEarned: 10
    };
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    renderUI();
    showToast('Demo mode - Preview only', 'info');
}

function checkAdminAndAddCrown() {
    if (!appState.isAdmin) return;
    
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
    
    if (!addCrown()) setTimeout(addCrown, 500);
}

// ====== 11. REFERRAL SYSTEM ======
async function processReferral(code) {
    if (!code || code === window.TWT.userId || userData?.invitedBy) return;
    
    const res = await apiCall('/referrals', 'POST', { referrerId: code, newUserId: window.TWT.userId });
    if (res.success && userData) {
        userData.invitedBy = code;
        userData.balances.USDT += CONFIG.ECONOMY.referralBonus;
        userData.totalUsdtEarned += CONFIG.ECONOMY.referralBonus;
        saveUserData();
        renderUI();
        showToast(`🎉 +${CONFIG.ECONOMY.referralBonus} USDT from referral!`, 'success');
    }
}

function copyInviteLink() { copyToClipboard(`${CONFIG.APP.botLink}?startapp=${window.TWT.userId}`); }

async function claimMilestone(refs) {
    const m = userData.referralMilestones?.find(x => x.referrals === refs);
    if (!m || m.claimed) return;
    if (userData.inviteCount < refs) { showToast(`Need ${refs} referrals`, 'error'); return; }
    const reward = REFERRAL_MILESTONES.find(x => x.referrals === refs).reward;
    
    const res = await apiCall('/referrals/claim', 'POST', { userId: window.TWT.userId, milestone: refs });
    if (res.success) {
        userData.balances.USDT += reward;
        userData.totalUsdtEarned += reward;
        m.claimed = true;
        saveUserData();
        renderAirdrop();
        renderWallet();
        updateTotalBalance();
        showToast(`Claimed ${reward} USDT!`);
    }
}

// ====== 12. RENDER UI COMPONENTS ======
function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    container.innerHTML = ALL_ASSETS.map(asset => {
        const bal = userData.balances[asset.symbol] || 0;
        const price = appState.prices[asset.symbol] || (asset.symbol === 'TWT' ? CONFIG.ECONOMY.twtPrice : 0);
        const value = asset.symbol === 'USDT' ? bal : bal * price;
        return `<div class="asset-item" onclick="showAssetDetails('${asset.symbol}')"><div class="asset-left"><img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img"><div class="asset-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div></div><div class="asset-right"><div class="asset-balance">${formatBalance(bal, asset.symbol)}</div><div class="asset-value">$${formatNumber(value)}</div></div></div>`;
    }).join('');
}

function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    container.innerHTML = `<div class="balance-card"><div class="total-balance" id="totalBalance">$0</div></div><div class="action-buttons"><button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>${t('actions.deposit')}</span></button><button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>${t('actions.withdraw')}</span></button><button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${t('actions.send')}</span></button><button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>${t('actions.receive')}</span></button><button class="action-btn" onclick="showHistory()"><i class="fas fa-history"></i><span>${t('actions.history')}</span></button></div><div id="assetsList" class="assets-list"></div>`;
    renderAssets();
    updateTotalBalance();
}

function updateTotalBalance() {
    if (!userData) return;
    let total = (userData.balances.USDT || 0) + (userData.balances.TWT || 0) * CONFIG.ECONOMY.twtPrice;
    const el = document.getElementById('totalBalance');
    if (el) el.textContent = '$' + total.toFixed(2);
}

function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    const link = `${CONFIG.APP.botLink}?startapp=${window.TWT.userId}`;
    container.innerHTML = `<div class="referral-stats"><div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span>${userData.inviteCount || 0}</span></div><div class="stat-card"><span>${t('airdrop.earned')}</span><span>${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div></div><div class="referral-link-card"><div class="link-label">${t('airdrop.yourLink')}</div><div class="link-container"><input type="text" id="inviteLink" value="${link}" readonly><button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button></div></div><div id="milestonesList" class="milestones-list"></div>`;
    renderMilestones();
}

function renderMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const prog = Math.min((userData.inviteCount / m.referrals) * 100, 100);
        const canClaim = userData.inviteCount >= m.referrals && !userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        const claimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        return `<div class="milestone-item"><div class="milestone-header"><span><i class="fas ${m.icon}"></i> ${m.referrals} Ref</span><span>${m.reward} ${m.unit}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div><div class="progress-text">${userData.inviteCount}/${m.referrals}</div>${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.referrals})">Claim</button>` : claimed ? '<p>✓ Claimed</p>' : ''}</div>`;
    }).join('');
}

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const bal = userData?.balances?.TWT || 0;
    const cardNum = window.TWT.userId?.slice(-4) || '8888';
    container.innerHTML = `<div class="virtual-card"><div class="card-chip"><i class="fas fa-microchip"></i></div><div class="card-brand">TWT Pay</div><div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNum}</span></div><div class="card-details"><div><div class="label">Holder</div><div class="value">${userData?.userName || 'User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div><div class="card-balance"><div class="balance-label">Balance</div><div class="balance-value">${bal} TWT</div><div class="balance-usd">≈ $${(bal * CONFIG.ECONOMY.twtPrice).toFixed(2)}</div></div><div class="card-footer"><i class="fab fa-visa"></i><span>Virtual Card</span></div></div>`;
}

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `<div class="settings-list"><div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div></div></div></div>`;
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    const txs = userData?.transactions || [];
    if (!txs.length) list.innerHTML = '<div class="empty-state">No transactions</div>';
    else list.innerHTML = txs.reverse().map(tx => `<div class="history-item"><div><span>${tx.type}</span> <span>${tx.amount} ${tx.currency}</span></div><div>${new Date(tx.timestamp).toLocaleString()}</div></div>`).join('');
    modal.classList.add('show');
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    if (!modal || !list || !userData) return;
    const notes = userData.notifications || [];
    
    let controlsHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button onclick="clearReadNotifications()" style="flex:1; padding:8px; background:rgba(0,212,255,0.1); border:1px solid rgba(0,212,255,0.2); border-radius:8px; cursor:pointer;">
                <i class="fa-regular fa-trash-can"></i> ${t('notifications.clear_read')}
            </button>
            <button onclick="clearAllNotifications()" style="flex:1; padding:8px; background:rgba(255,68,68,0.1); border:1px solid rgba(255,68,68,0.2); border-radius:8px; cursor:pointer;">
                <i class="fa-regular fa-bell-slash"></i> ${t('notifications.clear_all')}
            </button>
        </div>
    `;
    
    if (!notes.length) list.innerHTML = controlsHTML + '<div class="empty-state">' + t('notifications.no_notifications') + '</div>';
    else {
        list.innerHTML = controlsHTML + notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead('${n.id}')">
                <div>${n.message}</div>
                <div style="font-size:11px;color:var(--text-secondary);">${new Date(n.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    modal.classList.add('show');
}

function clearReadNotifications() {
    if (!userData?.notifications) return;
    const readCount = userData.notifications.filter(n => n.read).length;
    if (readCount === 0) { showToast('No read notifications', 'info'); return; }
    userData.notifications = userData.notifications.filter(n => !n.read);
    saveUserData();
    showNotifications();
    showToast(`Cleared ${readCount} notifications`, 'success');
}

function clearAllNotifications() {
    if (!userData) return;
    userData.notifications = [];
    saveUserData();
    showNotifications();
    showToast('All notifications cleared', 'success');
}

function markNotificationRead(id) {
    const n = userData.notifications?.find(x => x.id === id);
    if (n) { n.read = true; saveUserData(); }
}

function showAssetDetails(sym) {
    const bal = userData?.balances[sym] || 0;
    const price = appState.prices[sym] || (sym === 'TWT' ? CONFIG.ECONOMY.twtPrice : 0);
    const val = sym === 'USDT' ? bal : bal * price;
    showToast(`${sym}: ${formatBalance(bal, sym)} ($${formatNumber(val)})`, 'info');
}

function logout() { if (confirm('Logout?')) { localStorage.clear(); location.reload(); } }

// ====== 13. MODAL PLACEHOLDERS ======
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); document.getElementById('receiveAddress').innerText = window.TWT.userId; }
function copyAddress() { const a = document.getElementById('receiveAddress')?.innerText; if (a) copyToClipboard(a); }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ====== 14. NAVIGATION ======
function showWallet() {
    appState.currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="wallet"]').classList.add('active');
    renderWallet();
    showRandomSticker();
}
function showAirdrop() {
    appState.currentPage = 'airdrop';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="airdrop"]').classList.add('active');
    renderAirdrop();
    showRandomSticker();
}
function showTWTPay() {
    appState.currentPage = 'twtpay';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="twtpay"]').classList.add('active');
    renderTWTPay();
    showRandomSticker();
}
function showSettings() {
    appState.currentPage = 'settings';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="settings"]').classList.add('active');
    renderSettings();
}

function renderUI() {
    if (appState.currentPage === 'wallet') renderWallet();
    else if (appState.currentPage === 'airdrop') renderAirdrop();
    else if (appState.currentPage === 'twtpay') renderTWTPay();
    else if (appState.currentPage === 'settings') renderSettings();
    
    const nameEl = document.getElementById('userName');
    const idEl = document.getElementById('userIdDisplay');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl && userData) nameEl.textContent = userData.userName || window.TWT.userName;
    if (idEl && userData) idEl.textContent = `ID: ${userData.userId?.slice(-8) || window.TWT.userId.slice(-8)}`;
    if (avatarEl && userData) avatarEl.textContent = (userData.userName || window.TWT.userName).charAt(0).toUpperCase();
}

// ====== 15. STICKER SYSTEM ======
let lastSticker = 0;
function showRandomSticker() {
    const now = Date.now();
    if (now - lastSticker < 12*60*1000) return;
    const el = document.getElementById('welcomeSticker');
    if (!el) return;
    el.textContent = CONFIG.STICKERS[Math.floor(Math.random() * CONFIG.STICKERS.length)];
    el.classList.add('sticker-pop');
    setTimeout(() => el.classList.add('sticker-shake'), 200);
    setTimeout(() => { el.classList.remove('sticker-pop', 'sticker-shake'); setTimeout(() => el.textContent = '', 300); }, 3000);
    lastSticker = now;
}

// ====== 16. FLOATING NOTIFICATIONS ======
const FLOATING_NOTIFICATIONS = [
    "💸 Withdrawal • 0x3f...a2d1 • 12 USDT", "💰 Deposit • 0x8b...c4e9 • 275 USDT",
    "💸 Withdrawal • 0x7d...f1b3 • 24 USDT", "💰 Deposit • 0x2a...e7f8 • 580 USDT",
    "🔄 Swap • 1,000,000 TWT → 2 USDT", "🔄 Swap • 2,500,000 TWT → 5 USDT",
    "👥 Referral • +25 USDT", "🎁 Airdrop Claimed • 50 USDT"
];

let notificationTimeouts = [];

function initFloatingNotifications() {
    const schedules = [16000, 24000, 90000, 260000, 20000, 30000];
    let scheduleIndex = 0;
    
    function showNext() {
        const notification = FLOATING_NOTIFICATIONS[Math.floor(Math.random() * FLOATING_NOTIFICATIONS.length)];
        showFloatingToast(notification);
        const nextDelay = schedules[scheduleIndex % schedules.length];
        scheduleIndex++;
        notificationTimeouts.push(setTimeout(showNext, nextDelay));
    }
    
    setTimeout(showNext, 3000);
}

function showFloatingToast(message) {
    let toast = document.getElementById('floatingToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'floatingToast';
        toast.className = 'floating-toast';
        toast.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
            background: rgba(20,20,30,0.95); color: white; padding: 12px 24px;
            border-radius: 50px; font-size: 14px; z-index: 9999;
            backdrop-filter: blur(10px); border: 1px solid rgba(0,212,255,0.3);
            opacity: 0; transition: opacity 0.3s; white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 4000);
}

// ====== 17. ADMIN PANEL (VIA API) ======
async function showAdminPanel() {
    if (!appState.isAdmin) { showToast('Access denied', 'error'); return; }
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAdminData();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
}

async function loadAdminData() {
    try {
        const res = await apiCall('/admin/stats');
        if (res.success) {
            document.getElementById('totalUsers').textContent = res.totalUsers || '...';
            document.getElementById('pendingCount').textContent = res.pendingCount || '0';
        }
        
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <div style="text-align:center;padding:30px;">
                <i class="fa-solid fa-hand-pointer" style="font-size:48px;color:#00d4ff;"></i>
                <p style="margin:20px 0;">Click refresh to view pending requests</p>
                <button onclick="refreshAdminPanel()" class="admin-approve-btn" style="width:auto;padding:10px 20px;">
                    <i class="fa-solid fa-rotate-right"></i> ${t('admin.refresh')}
                </button>
                <button onclick="showUserManagementInterface()" class="admin-approve-btn" style="width:auto;padding:10px 20px;margin-top:10px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);">
                    <i class="fa-solid fa-user-gear"></i> ${t('admin.manageUsers')}
                </button>
            </div>
        `;
    } catch(e) { console.error(e); }
}

async function refreshAdminPanel() {
    if (!appState.isAdmin) return;
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    
    try {
        const res = await apiCall('/admin/pending');
        if (res.success && res.transactions) {
            if (res.transactions.length === 0) {
                adminContent.innerHTML = '<div class="empty-state">No pending transactions</div>';
                return;
            }
            
            adminContent.innerHTML = res.transactions.map(tx => `
                <div class="admin-transaction-card">
                    <div class="admin-tx-header">
                        <div class="admin-tx-type ${tx.type}">
                            <i class="fa-regular ${tx.type === 'deposit' ? 'fa-circle-down' : 'fa-circle-up'}"></i>
                            <span>${tx.type.toUpperCase()}</span>
                        </div>
                        <span class="admin-tx-status ${tx.status}">${tx.status}</span>
                    </div>
                    <div class="admin-tx-details">
                        <div class="admin-tx-row"><span>User:</span><span>${tx.userName || tx.userId}</span></div>
                        <div class="admin-tx-row"><span>Telegram ID:</span><code>${tx.userId}</code></div>
                        <div class="admin-tx-row"><span>Referrals:</span><span style="color:#00d4ff;">${tx.referralCount || 0}</span></div>
                        <div class="admin-tx-row"><span>Amount:</span><span>${tx.amount} ${tx.currency}</span></div>
                        <div class="admin-tx-row"><span>Time:</span><span>${new Date(tx.timestamp).toLocaleString()}</span></div>
                    </div>
                    <div class="admin-tx-actions">
                        <button class="admin-approve-btn" onclick="approveTransaction('${tx.id}', '${tx.userId}', '${tx.type}', '${tx.currency}', ${tx.amount})">
                            <i class="fa-regular fa-circle-check"></i> Approve
                        </button>
                        <button class="admin-reject-btn" onclick="rejectTransaction('${tx.id}', '${tx.userId}', '${tx.type}')">
                            <i class="fa-regular fa-circle-xmark"></i> Reject
                        </button>
                    </div>
                </div>
            `).join('');
            
            showToast('Admin panel refreshed', 'success');
        }
    } catch(e) { console.error(e); }
}

async function approveTransaction(id, userId, type, currency, amount) {
    if (!appState.isAdmin) return;
    try {
        const res = await apiCall('/admin/approve', 'POST', { id, userId, type, currency, amount });
        if (res.success) {
            showToast('Transaction approved!', 'success');
            refreshAdminPanel();
        }
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function rejectTransaction(id, userId, type) {
    if (!appState.isAdmin) return;
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
        const res = await apiCall('/admin/reject', 'POST', { id, userId, type, reason });
        if (res.success) {
            showToast('Transaction rejected', 'success');
            refreshAdminPanel();
        }
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function showUserManagementInterface() {
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div style="padding:20px;">
            <h3 style="margin-bottom:20px;"><i class="fa-solid fa-user-gear"></i> User Management</h3>
            <div style="display:flex;gap:10px;margin-bottom:20px;">
                <input type="text" id="adminUserIdInput" placeholder="Enter Telegram User ID" 
                       style="flex:1;padding:12px;border-radius:12px;border:none;background:rgba(255,255,255,0.1);color:white;">
                <button onclick="adminLoadUser()" style="padding:0 20px;border-radius:12px;border:none;background:#00d4ff;cursor:pointer;">
                    <i class="fa-solid fa-magnifying-glass"></i> Search
                </button>
            </div>
            <div id="adminUserStats"></div>
        </div>
    `;
}

async function adminLoadUser() {
    const userId = document.getElementById('adminUserIdInput').value.trim();
    const statsDiv = document.getElementById('adminUserStats');
    if (!userId) { showToast('Enter User ID', 'error'); return; }
    
    statsDiv.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    try {
        const res = await apiCall(`/admin/user/${userId}`);
        if (res.success && res.user) {
            const user = res.user;
            statsDiv.innerHTML = `
                <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:15px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
                        <h4>👤 ${user.userName || 'User'}</h4>
                        <span>🆔 ${userId}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
                        <div style="background:rgba(0,212,255,0.1);border-radius:12px;padding:10px;text-align:center;">
                            <div>👥</div>
                            <div style="font-weight:bold;">${user.inviteCount || 0}</div>
                            <div style="font-size:11px;">Referrals</div>
                        </div>
                        <div style="background:rgba(0,212,255,0.1);border-radius:12px;padding:10px;text-align:center;">
                            <div>💰</div>
                            <div style="font-weight:bold;">$${user.totalValue || '0.00'}</div>
                            <div style="font-size:11px;">Total Value</div>
                        </div>
                    </div>
                    <h4>Balances</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:5px;margin:10px 0;">
                        ${Object.entries(user.balances || {}).filter(([_,v]) => v > 0).map(([c,v]) => 
                            `<span style="background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:20px;font-size:12px;">
                                ${c}: ${c === 'USDT' ? v.toFixed(2) : v.toLocaleString()}
                            </span>`
                        ).join('') || 'No balances'}
                    </div>
                    <div style="display:flex;gap:10px;margin-top:15px;">
                        <button onclick="adminAddBalance('${userId}')" style="flex:1;padding:10px;background:#10b981;border:none;border-radius:8px;color:white;cursor:pointer;">
                            ➕ Add Balance
                        </button>
                        <button onclick="adminRemoveBalance('${userId}')" style="flex:1;padding:10px;background:#ef4444;border:none;border-radius:8px;color:white;cursor:pointer;">
                            ➖ Remove Balance
                        </button>
                    </div>
                    <div style="margin-top:10px;">
                        ${user.withdrawBlocked ? 
                            '<div style="background:rgba(239,68,68,0.2);padding:10px;border-radius:8px;text-align:center;">⚠️ WITHDRAWALS PERMANENTLY BLOCKED</div>' :
                            `<button onclick="blockUserWithdrawals('${userId}')" style="width:100%;padding:10px;background:#ef4444;border:none;border-radius:8px;color:white;cursor:pointer;">
                                🔒 PERMANENTLY BLOCK WITHDRAWALS
                            </button>`
                        }
                    </div>
                </div>
            `;
        } else {
            statsDiv.innerHTML = '<div style="color:red;text-align:center;">User not found</div>';
        }
    } catch(e) { statsDiv.innerHTML = '<div style="color:red;">Error loading user</div>'; }
}

async function adminAddBalance(userId) {
    if (!appState.isAdmin) return;
    const currency = prompt('Currency (USDT, TWT, BNB, etc.):', 'USDT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to ADD (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) { showToast('Invalid amount', 'error'); return; }
    try {
        const res = await apiCall('/admin/add-balance', 'POST', { userId, currency, amount });
        if (res.success) {
            showToast(`Added ${amount} ${currency}`, 'success');
            adminLoadUser();
        }
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function adminRemoveBalance(userId) {
    if (!appState.isAdmin) return;
    const currency = prompt('Currency (USDT, TWT, BNB, etc.):', 'USDT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) { showToast('Invalid amount', 'error'); return; }
    try {
        const res = await apiCall('/admin/remove-balance', 'POST', { userId, currency, amount });
        if (res.success) {
            showToast(`Removed ${amount} ${currency}`, 'success');
            adminLoadUser();
        }
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function blockUserWithdrawals(userId) {
    if (!appState.isAdmin) return;
    if (!confirm('⚠️ PERMANENTLY BLOCK this user from withdrawals? This CANNOT be undone!')) return;
    try {
        const res = await apiCall('/admin/block-withdrawals', 'POST', { userId });
        if (res.success) {
            showToast('User permanently blocked from withdrawals', 'success');
            adminLoadUser();
        }
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

// ====== 18. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Booting Trust Wallet Lite v9.1...");
    initTheme();
    updateAllTexts();
    
    if (appState.language === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
    }
    
    document.getElementById('createWalletBtn')?.addEventListener('click', createNewWallet);
    document.getElementById('refreshPricesBtn')?.addEventListener('click', refreshPrices);
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'wallet') showWallet();
            else if (tab === 'airdrop') showAirdrop();
            else if (tab === 'twtpay') showTWTPay();
            else if (tab === 'settings') showSettings();
        });
    });
    
    await fetchLivePrices();
    
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
        setTimeout(() => { showRandomSticker(); initFloatingNotifications(); }, 500);
    }, 1500);
    
    console.log("✅ Trust Wallet Lite v9.1 Ready | Telegram-First Detection | Zero Secrets");
});

// ====== 19. EXPOSE GLOBALS ======
window.showWallet = showWallet;
window.showAirdrop = showAirdrop;
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
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.scrollToTop = scrollToTop;
window.refreshPrices = refreshPrices;
window.copyToClipboard = copyToClipboard;
window.copyInviteLink = copyInviteLink;
window.claimMilestone = claimMilestone;
window.copyAddress = copyAddress;
window.createNewWallet = createNewWallet;
window.enableGuestPreview = enableGuestPreview;
window.showAssetDetails = showAssetDetails;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;
window.markNotificationRead = markNotificationRead;
window.refreshAdminPanel = refreshAdminPanel;
window.showUserManagementInterface = showUserManagementInterface;
window.adminLoadUser = adminLoadUser;
window.adminAddBalance = adminAddBalance;
window.adminRemoveBalance = adminRemoveBalance;
window.blockUserWithdrawals = blockUserWithdrawals;
window.approveTransaction = approveTransaction;
window.rejectTransaction = rejectTransaction;

console.log("✅ Trust Wallet Lite v9.1 - FINAL FIXED VERSION");
console.log("✅ FIX: Telegram-first detection with proper async wait");
console.log("✅ localStorage used ONLY as fallback after Telegram timeout");
