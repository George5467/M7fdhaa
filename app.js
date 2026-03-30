// ============================================================================
// TRUST WALLET LITE - PROFESSIONAL VERSION 1.0
// ============================================================================
// هندسة وتنظيم REFI Network - Zero Waste Architecture
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
    console.error("Firebase initialization error:", error);
}

// ============================================================================
// SECTION 3: CONSTANTS & CONFIGURATION
// ============================================================================

const BOT_LINK = "https://t.me/YourBot/TrustWalletLite";
const ADMIN_ID = "{{ADMIN_ID}}";
const REFERRAL_BONUS = 25; // 25 TWT per referral
const WELCOME_BONUS = 10; // 10 TWT for new user
const SWAP_RATE = 1; // 1 USDT = 1 TWT
const SWAP_FEE_PERCENT = 0.003; // 0.3%
let TWT_PRICE = 1.25;
let THB_PRICE = 0.0227;

// CoinGecko IDs
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
// SECTION 4: COINMARKETCAP ICONS
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
// SECTION 5: DEPOSIT ADDRESSES & LIMITS
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

const DEPOSIT_MINIMUMS = {
    TWT: 10,
    USDT: 10,
    BNB: 0.02,
    BTC: 0.0005,
    ETH: 0.005,
    SOL: 0.12,
    TRX: 40
};

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
// SECTION 6: REFERRAL MILESTONES
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
// SECTION 7: ALL ASSETS & SWAP CURRENCIES
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

const SWAP_CURRENCIES = ALL_ASSETS.map(asset => ({
    ...asset,
    icon: CMC_ICONS[asset.symbol]
}));

// ============================================================================
// SECTION 8: TOP CRYPTOS
// ============================================================================

const TOP_CRYPTOS = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' }
];

// ============================================================================
// SECTION 9: STATE MANAGEMENT
// ============================================================================

let userData = null;
let currentUser = null;
let currentTab = 'wallet';
let isAdmin = false;
let livePrices = {};
let unreadNotifications = 0;
let currentCurrencySelector = 'pay';
let currentHistoryFilter = 'all';
let currentSwapContext = null;
let currentCurrencyContext = null;
let appInitialized = false;

// Cache timers
let lastUserLoadTime = 0;
let lastPricesLoadTime = 0;
let lastHistoryCheckTime = 0;
const USER_CACHE_TIME = 300000;
const PRICES_CACHE_TIME = 10800000;
const HISTORY_CACHE_TIME = 600000;

// ============================================================================
// SECTION 10: STICKER SYSTEM
// ============================================================================

const WELCOME_STICKERS = [
    '🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱',
    '😤', '😎', '🤑', '💯', '💖', '✨', '🌟', '⭐', '🔥', '⚡',
    '💎', '🔔', '🎁', '🎈', '🎉', '🎊', '👑', '🚀', '💫', '⭐'
];

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
    console.log('🎨 Sticker displayed:', randomSticker);
}

// ============================================================================
// SECTION 11: USER IDENTIFICATION
// ============================================================================

const userId = tg?.initDataUnsafe?.user?.id?.toString() || 
               localStorage.getItem('twt_user_id') || 
               'user_' + Math.random().toString(36).substr(2, 9);

const userName = tg?.initDataUnsafe?.user?.first_name || 'TWT User';

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
    return !!(urlParams.get('ref') || urlParams.get('startapp') || tg?.initDataUnsafe?.start_param);
}

// ============================================================================
// SECTION 12: ADMIN SYSTEM
// ============================================================================

isAdmin = userId === ADMIN_ID;

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

// ============================================================================
// SECTION 13: TRANSACTIONS STORAGE
// ============================================================================

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
            t.id === transaction.id ||
            (t.timestamp === transaction.timestamp && t.type === transaction.type && t.amount === transaction.amount)
        );
        
        if (exists) {
            console.log("⏭️ Transaction already exists");
            return false;
        }
        
        const txWithId = {
            ...transaction,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5)
        };
        
        if (!userData.transactions) userData.transactions = [];
        userData.transactions.unshift(txWithId);
        
        allTransactions.unshift(txWithId);
        saveLocalTransactions(allTransactions);
        
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        
        if (currentTab === 'history' || document.getElementById('historyModal')?.classList.contains('show')) {
            renderHistory(currentHistoryFilter);
        }
        
        return true;
    } catch (error) {
        console.error("Error in addTransaction:", error);
        return false;
    }
}

// ============================================================================
// SECTION 14: ON-DEMAND LISTENERS SYSTEM (Zero Waste)
// ============================================================================

let activeListeners = new Map();
let listenerTimeouts = new Map();

function startOnDemandListener(collection, docId, callback, timeoutMs = 30000) {
    if (!db) return null;
    
    const listenerId = `${collection}_${docId}`;
    
    if (activeListeners.has(listenerId)) {
        activeListeners.get(listenerId)();
        activeListeners.delete(listenerId);
    }
    
    if (listenerTimeouts.has(listenerId)) {
        clearTimeout(listenerTimeouts.get(lististenerId));
        listenerTimeouts.delete(listenerId);
    }
    
    console.log(`👂 Starting on-demand listener for ${collection}/${docId} (${timeoutMs/1000}s)`);
    
    const unsubscribe = db.collection(collection).doc(docId).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            callback(data);
            
            if (data.status === 'approved' || data.status === 'rejected') {
                console.log(`✅ Final status, stopping listener for ${collection}/${docId}`);
                stopOnDemandListener(listenerId);
            }
        }
    }, (error) => {
        console.error(`❌ Listener error:`, error);
        stopOnDemandListener(listenerId);
    });
    
    activeListeners.set(listenerId, unsubscribe);
    
    const timeout = setTimeout(() => {
        console.log(`⏰ Listener timeout for ${collection}/${docId}`);
        stopOnDemandListener(listenerId);
    }, timeoutMs);
    
    listenerTimeouts.set(listenerId, timeout);
    return unsubscribe;
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
    console.log(`🛑 Stopping ${activeListeners.size} listeners`);
    activeListeners.forEach((unsubscribe) => unsubscribe());
    listenerTimeouts.forEach((timeout) => clearTimeout(timeout));
    activeListeners.clear();
    listenerTimeouts.clear();
}

// ============================================================================
// SECTION 15: PENDING TRANSACTIONS CHECKER
// ============================================================================

async function checkPendingTransactions() {
    if (!db || !userData) return;
    
    const now = Date.now();
    if (now - lastHistoryCheckTime < HISTORY_CACHE_TIME) {
        console.log("📦 Using cached history");
        return;
    }
    lastHistoryCheckTime = now;
    
    console.log("🔍 Checking pending transactions...");
    
    const localTransactions = loadLocalTransactions();
    const pendingTxs = localTransactions.filter(tx => 
        (tx.type === 'deposit' || tx.type === 'withdraw') && 
        tx.status === 'pending' &&
        tx.firebaseId && !tx.firebaseId.startsWith('temp_')
    );
    
    if (pendingTxs.length === 0) {
        console.log("✅ No pending transactions");
        return;
    }
    
    console.log(`⏳ Found ${pendingTxs.length} pending transactions`);
    let updated = false;
    
    for (const tx of pendingTxs) {
        try {
            const collection = tx.type === 'deposit' ? 'deposit_requests' : 'withdrawals';
            const docRef = db.collection(collection).doc(tx.firebaseId);
            const docSnap = await docRef.get();
            
            if (!docSnap.exists) continue;
            
            const data = docSnap.data();
            
            if (data.status !== tx.status) {
                console.log(`🔄 Transaction ${tx.firebaseId} status: ${tx.status} → ${data.status}`);
                
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
                        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
                        showToast(`✅ Your ${tx.amount} ${tx.currency} deposit has been approved!`, 'success');
                    }
                    
                    if (data.status === 'rejected' && tx.type === 'withdraw') {
                        userData.balances[tx.currency] = (userData.balances[tx.currency] || 0) + tx.amount;
                        if (tx.fee) {
                            userData.balances[tx.feeCurrency] = (userData.balances[tx.feeCurrency] || 0) + tx.fee;
                        }
                        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
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
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        
        if (currentTab === 'history' || document.getElementById('historyModal')?.classList.contains('show')) {
            renderHistory(currentHistoryFilter);
        }
        
        updateUI();
        showToast('✅ Transaction history updated!', 'success');
    }
}

// ============================================================================
// SECTION 16: LOAD USER DATA (with caching)
// ============================================================================

async function loadUserData(force = false) {
    try {
        console.log("📂 Loading user data for:", userId);
        
        const now = Date.now();
        const localData = localStorage.getItem(`twt_user_${userId}`);
        
        if (!force && localData && (now - lastUserLoadTime) < USER_CACHE_TIME) {
            userData = JSON.parse(localData);
            console.log("✅ Using cached user data");
            updateUI();
            updateNotificationBadge();
            checkAdminAndAddCrown();
            return;
        }
        
        if (localData) {
            userData = JSON.parse(localData);
            console.log("📦 Using localStorage data");
        }
        
        if (db) {
            console.log("🔥 Loading from Firebase...");
            
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (userDoc.exists) {
                const fbData = userDoc.data();
                userData = {
                    ...userData,
                    ...fbData,
                    balances: { ...userData?.balances, ...fbData.balances },
                    notifications: mergeNotifications(userData?.notifications || [], fbData.notifications || [])
                };
            } else if (!userData) {
                console.log("📝 Creating new user");
                userData = {
                    userId: userId,
                    userName: userName,
                    balances: {
                        TWT: 0, USDT: 0, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0
                    },
                    referralCode: generateReferralCode(),
                    referredBy: null,
                    referrals: [],
                    referralCount: 0,
                    referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
                    notifications: [],
                    depositRequests: [],
                    withdrawalRequests: [],
                    totalTwtEarned: 0,
                    totalUsdtEarned: 0,
                    createdAt: new Date().toISOString()
                };
                await db.collection('users').doc(userId).set(userData);
            }
            
            lastUserLoadTime = now;
            localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        }
        
        userData.transactions = loadLocalTransactions();
        
        updateUI();
        
        if (hasReferralCode() && !userData.referredBy) {
            await processReferral();
        }
        
        updateNotificationBadge();
        checkAdminAndAddCrown();
        
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

function mergeNotifications(local, firebase) {
    const map = new Map();
    local.forEach(n => map.set(n.id, n));
    firebase.forEach(n => {
        const existing = map.get(n.id);
        if (existing) {
            map.set(n.id, { ...n, read: existing.read });
        } else {
            map.set(n.id, n);
        }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ============================================================================
// SECTION 17: REFERRAL SYSTEM
// ============================================================================

async function processReferral() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let referralCode = urlParams.get('ref') || urlParams.get('startapp');
        
        if (!referralCode && tg?.initDataUnsafe?.start_param) {
            referralCode = tg.initDataUnsafe.start_param;
        }
        
        if (!referralCode) return;
        if (!userData) { setTimeout(processReferral, 1000); return; }
        if (referralCode === userData.referralCode) return;
        if (userData.referredBy) return;
        
        const pendingKey = `processed_referral_${userId}`;
        if (localStorage.getItem(pendingKey) === referralCode) return;
        
        console.log("🎯 Processing referral:", referralCode);
        
        if (!db) {
            localStorage.setItem('pending_referral', referralCode);
            return;
        }
        
        const referrerDoc = await db.collection('users').doc(referralCode).get();
        if (!referrerDoc.exists) return;
        
        const referrerData = referrerDoc.data();
        if (referrerData.referrals?.includes(userId)) return;
        
        await db.collection('users').doc(referralCode).update({
            referrals: [...(referrerData.referrals || []), userId],
            referralCount: (referrerData.referralCount || 0) + 1,
            'balances.TWT': (referrerData.balances?.TWT || 0) + REFERRAL_BONUS,
            totalTwtEarned: (referrerData.totalTwtEarned || 0) + REFERRAL_BONUS
        });
        
        userData.referredBy = referralCode;
        userData.balances.TWT = (userData.balances.TWT || 0) + WELCOME_BONUS;
        userData.totalTwtEarned = (userData.totalTwtEarned || 0) + WELCOME_BONUS;
        
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        localStorage.setItem(pendingKey, referralCode);
        
        await db.collection('users').doc(userId).update({
            referredBy: referralCode,
            'balances.TWT': userData.balances.TWT
        });
        
        await addNotification(referralCode, `🎉 Someone joined with your link! You got ${REFERRAL_BONUS} TWT!`, 'success');
        await addNotification(userId, `🎉 Welcome! You got ${WELCOME_BONUS} TWT!`, 'success');
        
        updateUI();
        if (currentTab === 'referral') renderReferral();
        
        console.log("✅ Referral processed!");
        
    } catch (error) {
        console.error("Error processing referral:", error);
    }
}

function copyReferralLink() {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    showToast('Referral link copied!', 'success');
}

function shareReferral() {
    const link = getReferralLink();
    const text = `🚀 Join Trust Wallet Lite and get ${WELCOME_BONUS} TWT bonus! Use my link: ${link}`;
    navigator.clipboard.writeText(text);
    showToast('Link copied!', 'success');
}

// ============================================================================
// SECTION 18: ADD NOTIFICATION
// ============================================================================

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
            localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        }
        
        console.log("✅ Notification added:", notification);
        
    } catch (error) {
        console.error("Error adding notification:", error);
    }
}

// ============================================================================
// SECTION 19: PRICE FETCHING (CoinGecko)
// ============================================================================

async function fetchLivePrices(force = false) {
    const now = Date.now();
    const cachedPrices = localStorage.getItem('live_prices');
    
    if (!force && cachedPrices && (now - lastPricesLoadTime) < PRICES_CACHE_TIME) {
        const { prices, timestamp } = JSON.parse(cachedPrices);
        livePrices = prices;
        lastPricesLoadTime = timestamp;
        console.log("📦 Using cached prices");
        updateUIPrices();
        return;
    }
    
    try {
        const ids = Object.values(CRYPTO_IDS).join(',');
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
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
        localStorage.setItem('live_prices', JSON.stringify({
            prices: livePrices,
            timestamp: now
        }));
        
        updateUIPrices();
        
    } catch (error) {
        console.error("Error fetching prices:", error);
    }
}

function updateUIPrices() {
    if (currentTab === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
    if (currentTab === 'swap') {
        updateSwapRate();
    }
}

function refreshPrices() {
    fetchLivePrices(true);
    showToast('Prices refreshed!', 'success');
}

// ============================================================================
// SECTION 20: UTILITY FUNCTIONS
// ============================================================================

function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (balance === undefined || balance === null) balance = 0;
    
    if (symbol === 'TWT') {
        return balance.toLocaleString() + ' TWT';
    } else if (symbol === 'USDT') {
        return '$' + balance.toFixed(2);
    } else if (symbol === 'BNB' || symbol === 'ETH' || symbol === 'SOL' || symbol === 'TRX') {
        return balance.toFixed(4) + ' ' + symbol;
    } else if (symbol === 'BTC') {
        return balance.toFixed(6) + ' BTC';
    }
    return balance.toLocaleString() + ' ' + symbol;
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    if (num < 0.0001) return num.toFixed(8);
    if (num < 0.01) return num.toFixed(6);
    return num.toFixed(2);
}

function calculateTotalBalance() {
    if (!userData) return 0;
    
    let total = 0;
    total += userData.balances.USDT || 0;
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
    if (totalEl) {
        totalEl.textContent = '$' + calculateTotalBalance().toFixed(2);
    }
}

function updateUI() {
    if (currentTab === 'wallet') renderWallet();
    else if (currentTab === 'swap') renderSwap();
    else if (currentTab === 'referral') renderReferral();
    else if (currentTab === 'twtpay') renderTWTPay();
    else if (currentTab === 'settings') renderSettings();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        const unread = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'block' : 'none';
        unreadNotifications = unread;
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

function scrollToTop() {
    const container = document.querySelector('.app-container') || window;
    if (container.scrollTo) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
}

// ============================================================================
// SECTION 21: RENDER FUNCTIONS
// ============================================================================

function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    
    const sortedAssets = [...ALL_ASSETS].sort((a, b) => {
        const aBalance = userData.balances[a.symbol] || 0;
        const bBalance = userData.balances[b.symbol] || 0;
        if (a.symbol === 'TWT') return -1;
        if (b.symbol === 'TWT') return 1;
        return bBalance - aBalance;
    });
    
    container.innerHTML = sortedAssets.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol]?.price || (asset.symbol === 'USDT' ? 1 : 0);
        const value = balance * price;
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

function renderTopCryptos() {
    const container = document.getElementById('topCryptoList');
    if (!container) return;
    
    if (Object.keys(livePrices).length === 0) {
        container.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading prices...</div>';
        return;
    }
    
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

function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    
    const totalBalance = calculateTotalBalance();
    
    container.innerHTML = `
        <div class="balance-card">
            <div class="total-balance" id="totalBalance">$${totalBalance.toFixed(2)}</div>
            <div class="balance-change">
                <i class="fas fa-arrow-up"></i>
                $${(totalBalance * 0.001).toFixed(2)} (+0.1%)
            </div>
        </div>
        
        <div class="action-buttons">
            <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>Send</span></button>
            <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-arrow-down"></i><span>Receive</span></button>
            <button class="action-btn" onclick="showSwapModal()"><i class="fas fa-exchange-alt"></i><span>Swap</span></button>
            <button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>Deposit</span></button>
            <button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>Withdraw</span></button>
        </div>
        
        <div class="section-tabs">
            <button class="section-tab active" onclick="switchAssetTab('crypto')">Crypto</button>
            <button class="section-tab" onclick="switchAssetTab('watchlist')">Watchlist</button>
            <button class="section-tab" onclick="switchAssetTab('nfts')">NFTs</button>
        </div>
        
        <div id="assetsList" class="assets-list"></div>
    `;
    
    renderAssets();
}

function switchAssetTab(tab) {
    const tabs = document.querySelectorAll('.section-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    renderAssets();
}

function showAssetDetails(symbol) {
    const balance = userData.balances[symbol] || 0;
    const price = livePrices[symbol]?.price || (symbol === 'USDT' ? 1 : 0);
    const value = balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}

function showCryptoDetails(symbol) {
    const priceData = livePrices[symbol] || { price: 0, change: 0 };
    const changeSymbol = priceData.change >= 0 ? '+' : '';
    showToast(`${symbol}: $${formatNumber(priceData.price)} (${changeSymbol}${priceData.change.toFixed(2)}%)`, 'info');
}

// ============================================================================
// SECTION 22: SWAP FUNCTIONS (DEX Professional)
// ============================================================================

function renderSwap() {
    const container = document.getElementById('swapContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="swap-container">
            <div class="swap-box">
                <div class="swap-label">From</div>
                <div class="swap-row">
                    <input type="number" id="swapFromAmount" placeholder="0.00" oninput="calculateSwap()">
                    <div class="currency-selector-small" onclick="showSwapCurrencySelector('from')">
                        <img id="swapFromIcon" src="${getCurrencyIcon('TWT')}">
                        <span id="swapFromSymbol">TWT</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="balance-hint">
                    Balance: <span id="swapFromBalance">${formatBalance(userData.balances.TWT || 0, 'TWT')}</span>
                    <span class="percentage-buttons">
                        <button onclick="setSwapPercentage(25)">25%</button>
                        <button onclick="setSwapPercentage(50)">50%</button>
                        <button onclick="setSwapPercentage(100)">Max</button>
                    </span>
                </div>
            </div>
            
            <div class="swap-arrow"><i class="fas fa-arrow-down"></i></div>
            
            <div class="swap-box">
                <div class="swap-label">To</div>
                <div class="swap-row">
                    <input type="number" id="swapToAmount" placeholder="0.00" readonly>
                    <div class="currency-selector-small" onclick="showSwapCurrencySelector('to')">
                        <img id="swapToIcon" src="${getCurrencyIcon('USDT')}">
                        <span id="swapToSymbol">USDT</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="balance-hint">
                    Balance: <span id="swapToBalance">${formatBalance(userData.balances.USDT || 0, 'USDT')}</span>
                </div>
            </div>
            
            <div class="swap-rate" id="swapRateDisplay">1 TWT ≈ $${(livePrices.TWT?.price || TWT_PRICE).toFixed(4)}</div>
            <div class="swap-fee"><span>Swapper fee</span><span id="swapFee">$0.01</span></div>
            <div class="swap-provider"><span>Provider</span><span>Rango</span></div>
            <button id="confirmSwapBtn" class="btn-primary">Continue</button>
        </div>
    `;
    
    document.getElementById('confirmSwapBtn')?.addEventListener('click', confirmSwap);
    updateSwapRate();
}

function updateSwapBalances() {
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    const fromBalance = userData.balances[fromSym] || 0;
    const toBalance = userData.balances[toSym] || 0;
    
    const fromEl = document.getElementById('swapFromBalance');
    const toEl = document.getElementById('swapToBalance');
    
    if (fromEl) fromEl.textContent = formatBalance(fromBalance, fromSym);
    if (toEl) toEl.textContent = formatBalance(toBalance, toSym);
}

function setSwapPercentage(percent) {
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const balance = userData.balances[fromSym] || 0;
    let amount = balance * (percent / 100);
    
    if (fromSym === 'TWT') {
        amount = Math.floor(amount);
    } else {
        amount = parseFloat(amount.toFixed(6));
    }
    
    const fromInput = document.getElementById('swapFromAmount');
    if (fromInput) fromInput.value = amount;
    calculateSwap();
}

function calculateSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    
    const fromPrice = livePrices[fromSym]?.price || (fromSym === 'USDT' ? 1 : TWT_PRICE);
    const toPrice = livePrices[toSym]?.price || (toSym === 'USDT' ? 1 : TWT_PRICE);
    
    let toAmount = 0;
    if (fromPrice > 0 && toPrice > 0) {
        toAmount = (fromAmount * fromPrice) / toPrice;
    }
    
    const toInput = document.getElementById('swapToAmount');
    if (toInput) toInput.value = toAmount.toFixed(6);
    
    updateSwapRate();
    
    // Update fee
    const fee = fromAmount * fromPrice * SWAP_FEE_PERCENT;
    const feeEl = document.getElementById('swapFee');
    if (feeEl) feeEl.textContent = `$${fee.toFixed(4)}`;
}

function updateSwapRate() {
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    const fromPrice = livePrices[fromSym]?.price || (fromSym === 'USDT' ? 1 : TWT_PRICE);
    const toPrice = livePrices[toSym]?.price || (toSym === 'USDT' ? 1 : TWT_PRICE);
    
    let rateText = '';
    if (fromPrice > 0 && toPrice > 0) {
        const rate = fromPrice / toPrice;
        rateText = `1 ${fromSym} ≈ ${rate.toFixed(6)} ${toSym}`;
    } else {
        rateText = `1 ${fromSym} ≈ 1 ${toSym}`;
    }
    
    const rateEl = document.getElementById('swapRateDisplay');
    if (rateEl) rateEl.textContent = rateText;
}

function confirmSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
    const fromSym = document.getElementById('swapFromSymbol')?.textContent || 'TWT';
    const toSym = document.getElementById('swapToSymbol')?.textContent || 'USDT';
    const toAmount = parseFloat(document.getElementById('swapToAmount')?.value) || 0;
    
    if (!fromAmount || fromAmount <= 0) {
        showToast('Please enter an amount', 'error');
        return;
    }
    
    if ((userData.balances[fromSym] || 0) < fromAmount) {
        showToast(`Insufficient ${fromSym} balance`, 'error');
        return;
    }
    
    const fromPrice = livePrices[fromSym]?.price || (fromSym === 'USDT' ? 1 : TWT_PRICE);
    const fee = fromAmount * fromPrice * SWAP_FEE_PERCENT;
    let finalFromAmount = fromAmount;
    
    if (fromSym === 'USDT') {
        finalFromAmount = fromAmount - fee;
        if (finalFromAmount <= 0) {
            showToast('Amount too small after fee', 'error');
            return;
        }
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
    
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userId).update({
            balances: userData.balances
        }).catch(console.error);
    }
    
    updateUI();
    showToast(`✅ Swapped ${formatBalance(finalFromAmount, fromSym)} to ${formatBalance(toAmount, toSym)}`, 'success');
    
    closeModal('swapModal');
    document.getElementById('swapFromAmount').value = '';
}

// ============================================================================
// SECTION 23: REFERRAL RENDER FUNCTIONS
// ============================================================================

function renderReferral() {
    const container = document.getElementById('referralContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="referral-stats">
            <h3>TOTAL REFERRALS</h3>
            <div class="stat-number">${userData.referralCount || 0}</div>
            <h3>TWT EARNED</h3>
            <div class="stat-number">${(userData.totalTwtEarned || 0).toLocaleString()} TWT</div>
            <h3>USDT EARNED</h3>
            <div class="stat-number">${(userData.totalUsdtEarned || 0).toFixed(2)} USDT</div>
        </div>
        
        <div class="referral-link-card">
            <h4>Your Referral Link</h4>
            <div class="link-container">
                <input type="text" id="referralLink" value="${getReferralLink()}" readonly>
                <button class="copy-btn" onclick="copyReferralLink()"><i class="fas fa-copy"></i></button>
                <button class="share-btn" onclick="shareReferral()"><i class="fas fa-share-alt"></i></button>
            </div>
            <p>Share your link and get ${REFERRAL_BONUS} TWT for every friend who joins!</p>
        </div>
        
        <div id="milestonesList" class="milestones-list"></div>
    `;
    
    renderMilestones();
}

function renderMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container) return;
    
    container.innerHTML = REFERRAL_MILESTONES.map(milestone => {
        const progress = Math.min((userData.referralCount / milestone.referrals) * 100, 100);
        const canClaim = userData.referralCount >= milestone.referrals && 
                        !userData.referralMilestones.find(m => m.referrals === milestone.referrals)?.claimed;
        const isClaimed = userData.referralMilestones.find(m => m.referrals === milestone.referrals)?.claimed;
        
        return `
            <div class="milestone-item">
                <div class="milestone-header">
                    <span class="milestone-referrals">
                        <i class="fa-regular ${milestone.icon}"></i>
                        ${milestone.referrals} Referrals
                    </span>
                    <span class="milestone-reward">${milestone.reward} ${milestone.unit}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${userData.referralCount}/${milestone.referrals}</div>
                ${canClaim ? 
                    `<button class="claim-btn" onclick="claimReferralMilestone(${milestone.referrals})">Claim Reward</button>` : 
                    isClaimed ? 
                    '<button class="claim-btn completed" disabled>Claimed</button>' : 
                    ''}
            </div>
        `;
    }).join('');
}

function claimReferralMilestone(referrals) {
    const milestone = REFERRAL_MILESTONES.find(m => m.referrals === referrals);
    const milestoneIndex = userData.referralMilestones.findIndex(m => m.referrals === referrals);
    
    if (milestoneIndex === -1 || userData.referralMilestones[milestoneIndex].claimed) return;
    if (userData.referralCount < referrals) {
        showToast(`You need ${referrals} referrals to claim this!`, 'error');
        return;
    }
    
    if (milestone.unit === 'TWT') {
        userData.balances.TWT = (userData.balances.TWT || 0) + milestone.reward;
        userData.totalTwtEarned = (userData.totalTwtEarned || 0) + milestone.reward;
    } else {
        userData.balances.USDT = (userData.balances.USDT || 0) + milestone.reward;
        userData.totalUsdtEarned = (userData.totalUsdtEarned || 0) + milestone.reward;
    }
    
    userData.referralMilestones[milestoneIndex].claimed = true;
    
    addTransaction({
        type: 'referral_reward',
        amount: milestone.reward,
        currency: milestone.unit,
        details: `Referral milestone: ${referrals} referrals`,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userId).update({
            balances: userData.balances,
            referralMilestones: userData.referralMilestones
        }).catch(console.error);
    }
    
    updateUI();
    renderMilestones();
    showToast(`🎉 Claimed ${milestone.reward} ${milestone.unit}!`, 'success');
}

// ============================================================================
// SECTION 24: SEND & RECEIVE FUNCTIONS
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
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (!address) {
        showToast('Please enter recipient address', 'error');
        return;
    }
    
    if ((userData.balances[currency] || 0) < amount) {
        showToast(`Insufficient ${currency} balance`, 'error');
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
    
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userId).update({
            balances: userData.balances
        }).catch(console.error);
    }
    
    updateUI();
    showToast(`✅ Sent ${formatBalance(amount, currency)} to ${address.substring(0, 10)}...`, 'success');
    
    closeModal('sendModal');
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendAddress').value = '';
}

function updateReceiveAddress() {
    const currency = document.getElementById('receiveCurrencySymbol')?.textContent || 'TWT';
    const address = DEPOSIT_ADDRESSES[currency] || DEPOSIT_ADDRESSES.TWT;
    const addressEl = document.getElementById('receiveAddress');
    if (addressEl) addressEl.textContent = address;
}

function copyAddress() {
    const address = document.getElementById('receiveAddress')?.textContent;
    if (address) {
        navigator.clipboard.writeText(address);
        showToast('Address copied!', 'success');
    }
}

// ============================================================================
// SECTION 25: DEPOSIT FUNCTIONS
// ============================================================================

function showDepositModal() {
    updateDepositInfo();
    document.getElementById('depositModal').classList.add('show');
}

function updateDepositInfo() {
    const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
    const address = DEPOSIT_ADDRESSES[currency] || DEPOSIT_ADDRESSES.TWT;
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    
    const addressEl = document.getElementById('depositAddress');
    const minEl = document.getElementById('depositMinAmount');
    
    if (addressEl) addressEl.textContent = address;
    if (minEl) minEl.textContent = minAmount;
}

function copyDepositAddress() {
    const address = document.getElementById('depositAddress')?.textContent;
    if (address) {
        navigator.clipboard.writeText(address);
        showToast('Address copied!', 'success');
    }
}

function submitDeposit() {
    const currency = document.getElementById('depositCurrencySymbol')?.textContent || 'TWT';
    const amount = parseFloat(document.getElementById('depositAmount')?.value);
    const txHash = document.getElementById('depositTxHash')?.value.trim() || '';
    
    if (!amount || amount <= 0) {
        showToast('Please enter amount', 'error');
        return;
    }
    
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    if (amount < minAmount) {
        showToast(`Minimum deposit is ${minAmount} ${currency}`, 'error');
        return;
    }
    
    const depositRequest = {
        customId: 'deposit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        userName: userName,
        currency: currency,
        amount: amount,
        txHash: txHash,
        address: DEPOSIT_ADDRESSES[currency],
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'deposit'
    };
    
    if (!userData.depositRequests) userData.depositRequests = [];
    userData.depositRequests.push(depositRequest);
    
    addTransaction({
        ...depositRequest,
        status: 'pending'
    });
    
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    
    if (db) {
        db.collection('deposit_requests').add(depositRequest).catch(console.error);
        addNotification(ADMIN_ID, `💰 New deposit request: ${amount} ${currency} from ${userId}`, 'info');
        
        // Start on-demand listener
        startOnDemandListener('deposit_requests', depositRequest.customId, (data) => {
            console.log("📥 Deposit update received:", data);
            
            if (data.status === 'approved') {
                userData.balances[currency] = (userData.balances[currency] || 0) + amount;
                localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
                addTransaction({ ...depositRequest, status: 'approved' });
                showToast(`✅ Your deposit of ${amount} ${currency} has been approved!`, 'success');
                updateUI();
            } else if (data.status === 'rejected') {
                addTransaction({ ...depositRequest, status: 'rejected', reason: data.reason });
                showToast(`❌ Your deposit was rejected: ${data.reason || 'Unknown reason'}`, 'error');
            }
        }, 30000);
    }
    
    showToast(`✅ Deposit request submitted for ${amount} ${currency}!`, 'success');
    closeModal('depositModal');
    
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositTxHash').value = '';
}

// ============================================================================
// SECTION 26: WITHDRAW FUNCTIONS
// ============================================================================

function showWithdrawModal() {
    updateWithdrawInfo();
    document.getElementById('withdrawModal').classList.add('show');
}

function updateWithdrawInfo() {
    const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    const fee = WITHDRAW_FEES[currency] || 1;
    
    const minEl = document.getElementById('withdrawMinAmount');
    const feeEl = document.getElementById('withdrawFee');
    
    if (minEl) minEl.textContent = minAmount;
    if (feeEl) feeEl.textContent = fee + ' ' + currency;
}

function submitWithdrawal() {
    const currency = document.getElementById('withdrawCurrencySymbol')?.textContent || 'TWT';
    const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
    const address = document.getElementById('withdrawAddress')?.value.trim();
    
    if (!amount || amount <= 0) {
        showToast('Please enter amount', 'error');
        return;
    }
    
    if (!address) {
        showToast('Please enter withdrawal address', 'error');
        return;
    }
    
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    if (amount < minAmount) {
        showToast(`Minimum withdrawal is ${minAmount} ${currency}`, 'error');
        return;
    }
    
    const fee = WITHDRAW_FEES[currency] || 1;
    const totalNeeded = amount + fee;
    
    if ((userData.balances[currency] || 0) < totalNeeded) {
        showToast(`Insufficient balance (need ${totalNeeded} ${currency} including fee)`, 'error');
        return;
    }
    
    userData.balances[currency] -= totalNeeded;
    
    const withdrawRequest = {
        customId: 'withdraw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: userId,
        userName: userName,
        currency: currency,
        amount: amount,
        fee: fee,
        address: address,
        status: 'pending',
        timestamp: new Date().toISOString(),
        type: 'withdraw'
    };
    
    if (!userData.withdrawalRequests) userData.withdrawalRequests = [];
    userData.withdrawalRequests.push(withdrawRequest);
    
    addTransaction({
        ...withdrawRequest,
        status: 'pending'
    });
    
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    
    if (db) {
        db.collection('withdrawal_requests').add(withdrawRequest).catch(console.error);
        addNotification(ADMIN_ID, `💸 New withdrawal request: ${amount} ${currency} from ${userId}`, 'info');
        
        startOnDemandListener('withdrawal_requests', withdrawRequest.customId, (data) => {
            console.log("📤 Withdrawal update received:", data);
            
            if (data.status === 'approved') {
                addTransaction({ ...withdrawRequest, status: 'approved' });
                showToast(`✅ Your withdrawal of ${amount} ${currency} has been approved!`, 'success');
            } else if (data.status === 'rejected') {
                userData.balances[currency] += amount + fee;
                localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
                addTransaction({ ...withdrawRequest, status: 'rejected', reason: data.reason });
                showToast(`❌ Your withdrawal was rejected: ${data.reason || 'Unknown reason'}`, 'error');
                updateUI();
            }
        }, 30000);
    }
    
    showToast(`✅ Withdrawal request submitted for ${amount} ${currency}!`, 'success');
    closeModal('withdrawModal');
    
    updateUI();
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawAddress').value = '';
}

// ============================================================================
// SECTION 27: TWT PAY VIRTUAL CARD
// ============================================================================

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    
    const twtBalance = userData.balances.TWT || 0;
    const twtValue = twtBalance * (livePrices.TWT?.price || TWT_PRICE);
    const cardNumber = userData.userId.slice(-4);
    
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
            <button class="card-action-btn" onclick="showTopUpModal()">
                <i class="fas fa-plus-circle"></i>
                <span>Top Up</span>
            </button>
            <button class="card-action-btn" onclick="showCardSettings()">
                <i class="fas fa-sliders-h"></i>
                <span>Settings</span>
            </button>
            <button class="card-action-btn" onclick="showCardTransactions()">
                <i class="fas fa-history"></i>
                <span>History</span>
            </button>
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
    showToast('Top up feature coming soon!', 'info');
}

function showCardSettings() {
    showToast('Card settings coming soon!', 'info');
}

function showCardTransactions() {
    const txs = (userData.transactions || []).filter(t => 
        t.currency === 'TWT' || t.fromCurrency === 'TWT' || t.toCurrency === 'TWT'
    );
    
    if (txs.length === 0) {
        showToast('No TWT transactions yet', 'info');
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
            message += `🎉 Referral: +${tx.amount} TWT (${date})\n`;
        }
    });
    
    alert(message);
}

// ============================================================================
// SECTION 28: SETTINGS FUNCTIONS
// ============================================================================

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()">
                <i class="fas fa-bell"></i>
                <div class="info">
                    <div class="label">Notifications</div>
                    <div class="desc">View all notifications</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showTransactionHistory()">
                <i class="fas fa-history"></i>
                <div class="info">
                    <div class="label">Transaction History</div>
                    <div class="desc">View all transactions</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showSecuritySettings()">
                <i class="fas fa-shield-alt"></i>
                <div class="info">
                    <div class="label">Security</div>
                    <div class="desc">Manage security settings</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item" onclick="showRecoveryPhrase()">
                <i class="fas fa-key"></i>
                <div class="info">
                    <div class="label">Recovery Phrase</div>
                    <div class="desc">View your backup phrase</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="settings-item logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <div class="info">
                    <div class="label">Logout</div>
                    <div class="desc">Sign out of your wallet</div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
            <span style="font-size: 10px; color: var(--text-muted);">Trust Wallet Lite v1.0</span>
        </div>
    `;
}

function showRecoveryPhrase() {
    if (!userData.recoveryPhrase) {
        const wordList = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 
                          'green', 'happy', 'island', 'jungle', 'king', 'light',
                          'mountain', 'night', 'ocean', 'panda', 'queen', 'river',
                          'sunset', 'tiger', 'universe', 'victory', 'whale', 'xray'];
        const selected = [];
        for (let i = 0; i < 12; i++) {
            selected.push(wordList[Math.floor(Math.random() * wordList.length)]);
        }
        userData.recoveryPhrase = selected.join(' ');
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    }
    
    alert(`🔐 Your Recovery Phrase:\n\n${userData.recoveryPhrase}\n\n⚠️ Write this down and keep it safe! Never share it with anyone.`);
}

function showTransactionHistory() {
    const txs = userData.transactions || [];
    if (txs.length === 0) {
        showToast('No transactions yet', 'info');
        return;
    }
    
    let message = '📋 Transaction History:\n\n';
    txs.slice(0, 20).forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleDateString();
        const time = new Date(tx.timestamp).toLocaleTimeString();
        if (tx.type === 'send') {
            message += `📤 SENT: ${tx.amount} ${tx.currency} to ${tx.address?.substring(0, 10)}... (${date} ${time})\n`;
        } else if (tx.type === 'swap') {
            message += `🔄 SWAP: ${tx.fromAmount} ${tx.fromCurrency} → ${tx.toAmount?.toFixed(4)} ${tx.toCurrency} (${date} ${time})\n`;
        } else if (tx.type === 'referral_reward') {
            message += `🎉 REFERRAL: +${tx.amount} ${tx.currency} (${date} ${time})\n`;
        } else if (tx.type === 'deposit') {
            message += `💰 DEPOSIT: ${tx.amount} ${tx.currency} (${tx.status}) (${date} ${time})\n`;
        } else if (tx.type === 'withdraw') {
            message += `💸 WITHDRAWAL: ${tx.amount} ${tx.currency} (${tx.status}) (${date} ${time})\n`;
        }
    });
    
    alert(message);
}

function showSecuritySettings() {
    showToast('Security features coming soon!', 'info');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(`twt_user_${userId}`);
        userData = null;
        showOnboarding();
    }
}

// ============================================================================
// SECTION 29: HISTORY FUNCTIONS
// ============================================================================

function renderHistory(filter = 'all') {
    const container = document.getElementById('historyList');
    if (!container) return;
    
    currentHistoryFilter = filter;
    let transactions = loadLocalTransactions();
    
    if (filter !== 'all') {
        transactions = transactions.filter(tx => tx.type === filter);
    }
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-clock"></i>
                <p>No transactions yet</p>
                <span>Your transactions will appear here</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(tx => {
        const date = new Date(tx.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + 
                             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
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
                ${tx.details ? `<div style="font-size: 11px; margin-top: 5px;">${tx.details}</div>` : ''}
            </div>
        `;
    }).join('');
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.add('show');
        
        setTimeout(() => {
            checkPendingTransactions();
        }, 500);
        
        renderHistory('all');
    }
}

function filterHistory(filter) {
    document.querySelectorAll('.history-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event.target) event.target.classList.add('active');
    renderHistory(filter);
}

// ============================================================================
// SECTION 30: NOTIFICATIONS FUNCTIONS
// ============================================================================

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container || !userData) return;
    
    const notifications = userData.notifications || [];
    
    const controlsHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button onclick="clearReadNotifications()" class="btn-secondary" style="flex: 1; padding: 8px;">
                <i class="fa-regular fa-trash-can"></i> Clear Read
            </button>
            <button onclick="clearAllNotifications()" class="btn-secondary" style="flex: 1; padding: 8px; border-color: #ef4444; color: #ef4444;">
                <i class="fa-regular fa-bell-slash"></i> Clear All
            </button>
        </div>
    `;
    
    if (notifications.length === 0) {
        container.innerHTML = controlsHTML + `
            <div class="empty-state">
                <i class="fa-regular fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }
    
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = controlsHTML + notifications.map(notif => {
        const date = new Date(notif.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + 
                             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="notification-item" onclick="markNotificationRead('${notif.id}')" 
                 style="background: ${notif.read ? 'transparent' : 'rgba(5,0,255,0.05)'}; 
                        padding: 12px; border-radius: 12px; margin-bottom: 8px; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-weight: 600;">
                        <i class="fa-regular ${notif.type === 'success' ? 'fa-circle-check' : 'fa-bell'}"></i>
                        Notification
                    </span>
                    <span style="font-size: 10px; color: var(--text-muted);">${formattedDate}</span>
                </div>
                <div style="font-size: 13px;">${notif.message}</div>
            </div>
        `;
    }).join('');
}

function markNotificationRead(notificationId) {
    if (!userData?.notifications) return;
    
    const notification = userData.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        updateNotificationBadge();
        renderNotifications();
        
        if (db) {
            db.collection('users').doc(userId).update({
                notifications: userData.notifications
            }).catch(console.error);
        }
    }
}

function clearReadNotifications() {
    if (!userData?.notifications) return;
    
    const readCount = userData.notifications.filter(n => n.read).length;
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    
    if (readCount === 0) {
        showToast('No read notifications to clear', 'info');
        return;
    }
    
    if (confirm(`Clear ${readCount} read notification(s)? ${unreadCount} unread will remain.`)) {
        userData.notifications = userData.notifications.filter(n => !n.read);
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        updateNotificationBadge();
        renderNotifications();
        showToast(`Cleared ${readCount} read notifications`, 'success');
    }
}

function clearAllNotifications() {
    if (!userData?.notifications) return;
    
    const unreadCount = userData.notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        if (!confirm(`Warning: You have ${unreadCount} unread notifications. Delete all?`)) {
            return;
        }
    } else {
        if (!confirm('Delete all notifications?')) {
            return;
        }
    }
    
    userData.notifications = [];
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    updateNotificationBadge();
    renderNotifications();
    showToast('Cleared all notifications', 'success');
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.classList.add('show');
        renderNotifications();
    }
}

// ============================================================================
// SECTION 31: ADMIN PANEL FUNCTIONS
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
    stopAllListeners();
}

function refreshAdminPanel() {
    const activeTab = document.querySelector('.admin-tab.active')?.textContent?.toLowerCase().includes('deposit') ? 'deposits' : 'withdrawals';
    showAdminTab(activeTab);
}

function showAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    if (tab === 'deposits') {
        const deposits = userData?.depositRequests?.filter(d => d.status === 'pending') || [];
        
        if (deposits.length === 0) {
            content.innerHTML = '<div class="empty-state">No pending deposits</div>';
        } else {
            content.innerHTML = deposits.map(d => `
                <div class="admin-transaction-card">
                    <div class="admin-tx-header">
                        <span class="admin-tx-type deposit">DEPOSIT</span>
                        <span class="admin-tx-status pending">Pending</span>
                    </div>
                    <div class="admin-tx-details">
                        <p><strong>User:</strong> ${d.userId}</p>
                        <p><strong>Amount:</strong> ${d.amount} ${d.currency}</p>
                        <p><strong>TX Hash:</strong> ${d.txHash?.substring(0, 20) || 'N/A'}...</p>
                        <p><strong>Time:</strong> ${new Date(d.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="admin-tx-actions">
                        <button class="admin-approve-btn" onclick="approveDeposit('${d.customId}')">Approve</button>
                        <button class="admin-reject-btn" onclick="rejectDeposit('${d.customId}')">Reject</button>
                    </div>
                </div>
            `).join('');
        }
    } else if (tab === 'withdrawals') {
        const withdrawals = userData?.withdrawalRequests?.filter(w => w.status === 'pending') || [];
        
        if (withdrawals.length === 0) {
            content.innerHTML = '<div class="empty-state">No pending withdrawals</div>';
        } else {
            content.innerHTML = withdrawals.map(w => `
                <div class="admin-transaction-card">
                    <div class="admin-tx-header">
                        <span class="admin-tx-type withdraw">WITHDRAWAL</span>
                        <span class="admin-tx-status pending">Pending</span>
                    </div>
                    <div class="admin-tx-details">
                        <p><strong>User:</strong> ${w.userId}</p>
                        <p><strong>Amount:</strong> ${w.amount} ${w.currency}</p>
                        <p><strong>Address:</strong> ${w.address?.substring(0, 20)}...</p>
                        <p><strong>Fee:</strong> ${w.fee} ${w.currency}</p>
                        <p><strong>Time:</strong> ${new Date(w.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="admin-tx-actions">
                        <button class="admin-approve-btn" onclick="approveWithdrawal('${w.customId}')">Approve</button>
                        <button class="admin-reject-btn" onclick="rejectWithdrawal('${w.customId}')">Reject</button>
                    </div>
                </div>
            `).join('');
        }
    } else if (tab === 'users') {
        content.innerHTML = `
            <div style="padding: 20px;">
                <input type="text" id="adminUserIdInput" placeholder="Enter User ID" class="modal-input">
                <button onclick="adminLoadUser()" class="btn-primary" style="width: 100%; margin-top: 10px;">Search User</button>
                <div id="adminUserStats" style="margin-top: 20px;"></div>
            </div>
        `;
    } else if (tab === 'stats') {
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>TWT Price</h3>
                    <div class="stat-value">$${(livePrices.TWT?.price || TWT_PRICE).toFixed(4)}</div>
                </div>
                <div class="stat-card">
                    <h3>Your TWT</h3>
                    <div class="stat-value">${(userData?.balances.TWT || 0).toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Referrals</h3>
                    <div class="stat-value">${userData?.referralCount || 0}</div>
                </div>
                <div class="stat-card">
                    <h3>Pending Deposits</h3>
                    <div class="stat-value">${userData?.depositRequests?.filter(d => d.status === 'pending').length || 0}</div>
                </div>
            </div>
        `;
    }
}

function approveDeposit(id) {
    const deposit = userData.depositRequests?.find(d => d.customId === id);
    if (deposit) {
        deposit.status = 'approved';
        userData.balances[deposit.currency] = (userData.balances[deposit.currency] || 0) + deposit.amount;
        addNotification(deposit.userId, `✅ Your deposit of ${deposit.amount} ${deposit.currency} has been approved!`, 'success');
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        updateUI();
        refreshAdminPanel();
        showToast('Deposit approved', 'success');
        
        if (db) {
            db.collection('deposit_requests').doc(id).update({ status: 'approved' }).catch(console.error);
            db.collection('users').doc(deposit.userId).update({
                [`balances.${deposit.currency}`]: firebase.firestore.FieldValue.increment(deposit.amount)
            }).catch(console.error);
        }
    }
}

function rejectDeposit(id) {
    const deposit = userData.depositRequests?.find(d => d.customId === id);
    if (deposit) {
        deposit.status = 'rejected';
        addNotification(deposit.userId, `❌ Your deposit of ${deposit.amount} ${deposit.currency} was rejected.`, 'error');
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        refreshAdminPanel();
        showToast('Deposit rejected', 'warning');
        
        if (db) {
            db.collection('deposit_requests').doc(id).update({ status: 'rejected' }).catch(console.error);
        }
    }
}

function approveWithdrawal(id) {
    const withdrawal = userData.withdrawalRequests?.find(w => w.customId === id);
    if (withdrawal) {
        withdrawal.status = 'approved';
        addNotification(withdrawal.userId, `✅ Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been approved!`, 'success');
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        updateUI();
        refreshAdminPanel();
        showToast('Withdrawal approved', 'success');
        
        if (db) {
            db.collection('withdrawal_requests').doc(id).update({ status: 'approved' }).catch(console.error);
        }
    }
}

function rejectWithdrawal(id) {
    const withdrawal = userData.withdrawalRequests?.find(w => w.customId === id);
    if (withdrawal) {
        withdrawal.status = 'rejected';
        userData.balances[withdrawal.currency] = (userData.balances[withdrawal.currency] || 0) + withdrawal.amount + (withdrawal.fee || 0);
        addNotification(withdrawal.userId, `❌ Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} was rejected.`, 'error');
        localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
        updateUI();
        refreshAdminPanel();
        showToast('Withdrawal rejected', 'warning');
        
        if (db) {
            db.collection('withdrawal_requests').doc(id).update({ status: 'rejected' }).catch(console.error);
            db.collection('users').doc(withdrawal.userId).update({
                [`balances.${withdrawal.currency}`]: firebase.firestore.FieldValue.increment(withdrawal.amount + (withdrawal.fee || 0))
            }).catch(console.error);
        }
    }
}

function adminLoadUser() {
    const userIdSearch = document.getElementById('adminUserIdInput')?.value.trim();
    const statsDiv = document.getElementById('adminUserStats');
    
    if (!userIdSearch) {
        showToast('Please enter User ID', 'error');
        return;
    }
    
    if (userIdSearch === userId) {
        statsDiv.innerHTML = `
            <div class="admin-transaction-card">
                <h4>User: ${userData.userName}</h4>
                <p><strong>ID:</strong> ${userData.userId}</p>
                <p><strong>Referrals:</strong> ${userData.referralCount}</p>
                <p><strong>TWT Balance:</strong> ${userData.balances.TWT?.toLocaleString()}</p>
                <p><strong>USDT Balance:</strong> $${userData.balances.USDT?.toFixed(2)}</p>
                <p><strong>Total TWT Earned:</strong> ${userData.totalTwtEarned?.toLocaleString()}</p>
                <div style="display: flex; gap: 10px; margin-top: 16px;">
                    <button onclick="adminAddBalance()" class="admin-approve-btn">Add Balance</button>
                    <button onclick="adminRemoveBalance()" class="admin-reject-btn">Remove Balance</button>
                </div>
            </div>
        `;
    } else {
        statsDiv.innerHTML = '<div style="padding: 20px; text-align: center;">User not found</div>';
    }
}

function adminAddBalance() {
    const currency = prompt('Currency (TWT, USDT, BNB, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to ADD (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    userData.balances[currency] = (userData.balances[currency] || 0) + amount;
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    updateUI();
    showToast(`✅ Added ${amount} ${currency}`, 'success');
    adminLoadUser();
    
    if (db) {
        db.collection('users').doc(userId).update({
            [`balances.${currency}`]: firebase.firestore.FieldValue.increment(amount)
        }).catch(console.error);
    }
}

function adminRemoveBalance() {
    const currency = prompt('Currency (TWT, USDT, BNB, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    userData.balances[currency] = Math.max(0, (userData.balances[currency] || 0) - amount);
    localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
    updateUI();
    showToast(`✅ Removed ${amount} ${currency}`, 'success');
    adminLoadUser();
    
    if (db) {
        db.collection('users').doc(userId).update({
            [`balances.${currency}`]: firebase.firestore.FieldValue.increment(-amount)
        }).catch(console.error);
    }
}

// ============================================================================
// SECTION 32: CURRENCY SELECTOR FUNCTIONS
// ============================================================================

function showCurrencySelector(context) {
    currentCurrencyContext = context;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    
    list.innerHTML = ALL_ASSETS.map(asset => `
        <div class="currency-list-item" onclick="selectCurrency('${asset.symbol}')">
            <img src="${getCurrencyIcon(asset.symbol)}">
            <div class="currency-list-info">
                <h4>${asset.name}</h4>
                <p>${asset.symbol}</p>
            </div>
        </div>
    `).join('');
    
    modal.classList.add('show');
}

function showSwapCurrencySelector(context) {
    currentSwapContext = context;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    
    list.innerHTML = ALL_ASSETS.map(asset => `
        <div class="currency-list-item" onclick="selectSwapCurrency('${asset.symbol}')">
            <img src="${getCurrencyIcon(asset.symbol)}">
            <div class="currency-list-info">
                <h4>${asset.name}</h4>
                <p>${asset.symbol}</p>
            </div>
        </div>
    `).join('');
    
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
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'flex' : 'none';
    });
}

// ============================================================================
// SECTION 33: NAVIGATION FUNCTIONS
// ============================================================================

function setupNavbar() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
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

function setupScrollListener() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (!scrollBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });
}

// ============================================================================
// SECTION 34: ONBOARDING FUNCTIONS
// ============================================================================

function showOnboarding() {
    const onboarding = document.getElementById('onboardingScreen');
    const main = document.getElementById('mainContent');
    if (onboarding) onboarding.classList.remove('hidden');
    if (main) main.classList.add('hidden');
}

function showMainApp() {
    const onboarding = document.getElementById('onboardingScreen');
    const main = document.getElementById('mainContent');
    if (onboarding) onboarding.classList.add('hidden');
    if (main) main.classList.remove('hidden');
    switchTab('wallet');
}

function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    
    setTimeout(async () => {
        const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        userData = {
            userId: newUserId,
            userName: userName,
            referralCode: generateReferralCode(),
            referredBy: null,
            referralCount: 0,
            referrals: [],
            balances: {
                TWT: WELCOME_BONUS,
                USDT: 0,
                BNB: 0,
                BTC: 0,
                ETH: 0,
                SOL: 0,
                TRX: 0
            },
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            depositRequests: [],
            withdrawalRequests: [],
            totalTwtEarned: WELCOME_BONUS,
            totalUsdtEarned: 0,
            createdAt: new Date().toISOString()
        };
        
        currentUser = newUserId;
        isAdmin = currentUser === ADMIN_ID;
        
        localStorage.setItem(`twt_user_${newUserId}`, JSON.stringify(userData));
        
        if (db) {
            await db.collection('users').doc(newUserId).set(userData).catch(console.error);
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode && refCode !== userData.referralCode) {
            await processReferral();
        }
        
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        showToast(`🎉 Welcome! You received ${WELCOME_BONUS} TWT!`, 'success');
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 800);
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
    const errorDiv = document.getElementById('importError');
    
    if (!phrase) {
        errorDiv.textContent = 'Please enter your recovery phrase';
        errorDiv.style.display = 'block';
        return;
    }
    
    const btn = document.getElementById('confirmImportBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    
    setTimeout(async () => {
        const stored = localStorage.getItem(`twt_user_${userId}`);
        if (stored) {
            const existing = JSON.parse(stored);
            if (existing.recoveryPhrase === phrase) {
                userData = existing;
                currentUser = userData.userId;
                isAdmin = currentUser === ADMIN_ID;
                localStorage.setItem(`twt_user_${userId}`, JSON.stringify(userData));
                closeImportModal();
                showMainApp();
                updateUI();
                checkAdminAndAddCrown();
                showToast('Wallet imported successfully!', 'success');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
        }
        
        const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        userData = {
            userId: newUserId,
            userName: userName,
            referralCode: generateReferralCode(),
            recoveryPhrase: phrase,
            referredBy: null,
            referralCount: 0,
            referrals: [],
            balances: {
                TWT: WELCOME_BONUS,
                USDT: 0,
                BNB: 0,
                BTC: 0,
                ETH: 0,
                SOL: 0,
                TRX: 0
            },
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            depositRequests: [],
            withdrawalRequests: [],
            totalTwtEarned: WELCOME_BONUS,
            totalUsdtEarned: 0,
            createdAt: new Date().toISOString()
        };
        
        currentUser = newUserId;
        isAdmin = currentUser === ADMIN_ID;
        localStorage.setItem(`twt_user_${newUserId}`, JSON.stringify(userData));
        
        if (db) {
            await db.collection('users').doc(newUserId).set(userData).catch(console.error);
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode && refCode !== userData.referralCode) {
            await processReferral();
        }
        
        closeImportModal();
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        showToast(`🎉 Wallet imported! You received ${WELCOME_BONUS} TWT!`, 'success');
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 800);
}

// ============================================================================
// SECTION 35: INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Set language direction
    if (currentLanguage === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
        const flagEl = document.getElementById('currentLanguageFlag');
        if (flagEl) flagEl.textContent = '🇸🇦';
    } else {
        const flagEl = document.getElementById('currentLanguageFlag');
        if (flagEl) flagEl.textContent = '🇬🇧';
    }
    updateAllTexts();
    
    // Hide splash after delay
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 1500);
    
    // Initialize
    await fetchLivePrices();
    setInterval(fetchLivePrices, 1800000);
    
    const stored = localStorage.getItem(`twt_user_${userId}`);
    if (stored) {
        userData = JSON.parse(stored);
        currentUser = userData.userId;
        isAdmin = currentUser === ADMIN_ID;
        showMainApp();
        updateUI();
        checkAdminAndAddCrown();
        processReferral();
    } else {
        showOnboarding();
    }
    
    setupNavbar();
    setupScrollListener();
    
    // Fix notification button
    setTimeout(() => {
        const notifBtn = document.getElementById('notificationBtn');
        if (notifBtn) {
            const newBtn = notifBtn.cloneNode(true);
            notifBtn.parentNode?.replaceChild(newBtn, notifBtn);
            newBtn.addEventListener('click', showNotifications);
        }
    }, 1000);
    
    // Show welcome sticker
    setTimeout(() => {
        showRandomSticker();
    }, 500);
});

// ============================================================================
// SECTION 36: EXPORT ALL FUNCTIONS
// ============================================================================

// Navigation
window.showWallet = () => switchTab('wallet');
window.showSwap = () => switchTab('swap');
window.showReferral = () => switchTab('referral');
window.showTWTPay = () => switchTab('twtpay');
window.showSettings = () => switchTab('settings');

// Modals
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

// Actions
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

// Swap
window.setSwapPercentage = setSwapPercentage;
window.calculateSwap = calculateSwap;
window.updateSwapRate = updateSwapRate;

// Referral
window.claimReferralMilestone = claimReferralMilestone;

// Settings
window.showTransactionHistory = showTransactionHistory;
window.showRecoveryPhrase = showRecoveryPhrase;
window.showSecuritySettings = showSecuritySettings;
window.logout = logout;

// TWT Pay
window.showTopUpModal = showTopUpModal;
window.showCardSettings = showCardSettings;
window.showCardTransactions = showCardTransactions;

// History
window.filterHistory = filterHistory;

// Currency
window.showCurrencySelector = showCurrencySelector;
window.showSwapCurrencySelector = showSwapCurrencySelector;
window.selectCurrency = selectCurrency;
window.selectSwapCurrency = selectSwapCurrency;
window.filterCurrencies = filterCurrencies;

// Admin
window.showAdminTab = showAdminTab;
window.refreshAdminPanel = refreshAdminPanel;
window.approveDeposit = approveDeposit;
window.rejectDeposit = rejectDeposit;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.adminLoadUser = adminLoadUser;
window.adminAddBalance = adminAddBalance;
window.adminRemoveBalance = adminRemoveBalance;

// Notifications
window.markNotificationRead = markNotificationRead;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;

// Utils
window.showToast = showToast;
window.animateElement = animateElement;
window.copyToClipboard = copyToClipboard;
window.showAssetDetails = showAssetDetails;
window.showCryptoDetails = showCryptoDetails;
window.switchAssetTab = switchAssetTab;

console.log("✅ Trust Wallet Lite v1.0 - Fully Loaded!");
console.log("✅ Features: Wallet, Swap (DEX), Referral (TWT Rewards), TWT Pay Card, Admin Panel");
console.log("✅ 8 Referral Milestones: 5, 10, 25, 50, 100, 250, 500, 1000 referrals");
console.log("✅ 7 Cryptocurrencies: TWT, USDT, BNB, BTC, ETH, SOL, TRX");
console.log("✅ Admin ID: " + ADMIN_ID);
console.log("✅ Zero Waste Architecture with caching and on-demand listeners");
