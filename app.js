// ========== FIREBASE CONFIGURATION ==========
const firebaseConfig = {
    apiKey: "AIzaSyBUg917YwHALAYCIGbOyH142FWDVDdNUGo",
    authDomain: "m7fdha-9bf18.firebaseapp.com",
    projectId: "m7fdha-9bf18",
    storageBucket: "m7fdha-9bf18.firebasestorage.app",
    messagingSenderId: "354288385604",
    appId: "1:354288385604:web:2c078dd2b41cd1287ec611"
};

// Initialize Firebase
let db = null;
let firebaseInitialized = false;

// ========== CONSTANTS ==========
const REFERRAL_BONUS = 25; // 25 TWT per referral
const WELCOME_BONUS = 10; // 10 TWT for new user
const SWAP_RATE = 1; // 1 USDT = 1 TWT
const ADMIN_ID = "1653918641"; // CHANGE THIS

// TWT CoinGecko ID
const TWT_COINGECKO_ID = 'trust-wallet-token';

// Live prices storage
let livePrices = {
    TWT: { price: 1.25, change: 0 },
    USDT: { price: 1, change: 0 },
    BNB: { price: 600, change: 0 },
    BTC: { price: 65000, change: 0 },
    ETH: { price: 3400, change: 0 },
    SOL: { price: 150, change: 0 },
    TRX: { price: 0.25, change: 0 }
};

// ========== COINMARKETCAP ICONS (احترافية) ==========
const CMC_ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',  // Trust Wallet Token
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',   // Tether
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',   // BNB
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',      // Bitcoin
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',   // Ethereum
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',   // Solana
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',   // TRON
    THB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21430.png',  // Thunder Brawl
    ZDX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/30507.png',  // ZedDex
    SHIB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',  // Shiba Inu
    PEPE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png', // Pepe
    TRUMP: 'https://s2.coinmarketcap.com/static/img/coins/64x64/35336.png' // Trump Coin
};

// Assets list
const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'THB', name: 'Thunder Brawl' },
    { symbol: 'ZDX', name: 'ZedDex' }
];

// Referral Milestones (بـ TWT)
const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'TWT' },
    { referrals: 25, reward: 120, unit: 'TWT' },
    { referrals: 50, reward: 250, unit: 'TWT' },
    { referrals: 100, reward: 500, unit: 'TWT' },
    { referrals: 250, reward: 1000, unit: 'TWT' }
];

// ========== COINGECKO PRICE FETCH ==========
const CRYPTO_IDS = {
    TWT: 'trust-wallet-token',
    USDT: 'tether',
    BNB: 'binancecoin',
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    TRX: 'tron'
};

async function fetchLivePrices() {
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
        
        console.log("💰 Prices updated:", livePrices);
        updateUIPrices();
        return true;
    } catch (error) {
        console.error("Error fetching prices:", error);
        return false;
    }
}

function updateUIPrices() {
    if (currentTab === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
}

function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

// ========== USER DATA MANAGEMENT ==========
let userData = null;
let currentUser = null;
let currentTab = 'wallet';
let isAdmin = false;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Update app name in UI
    updateAppName();
    
    // Initialize Firebase
    await initFirebase();
    
    // Fetch prices
    await fetchLivePrices();
    setInterval(fetchLivePrices, 1800000); // كل 30 دقيقة
    
    // Hide splash
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 1500);
    
    // Check for existing user
    const storedUser = localStorage.getItem('twtpay_user');
    if (storedUser) {
        userData = JSON.parse(storedUser);
        currentUser = userData.userId;
        isAdmin = currentUser === ADMIN_ID;
        showMainApp();
        updateUI();
        setupEventListeners();
        
        // Sync with Firebase if available
        if (firebaseInitialized) {
            syncWithFirebase();
        }
    } else {
        showOnboarding();
    }
    
    setupAdminCheck();
    setupNavbar();
});

function updateAppName() {
    // Update title
    document.title = "Trust Wallet Lite";
    
    // Update any elements with app name
    const appNameElements = document.querySelectorAll('.app-name, .splash-logo h1, .onboarding-container h1');
    appNameElements.forEach(el => {
        if (el.tagName === 'H1') el.textContent = "Trust Wallet Lite";
    });
    
    const logoIcon = document.querySelector('.logo-icon-large i, .logo-icon i');
    if (logoIcon) logoIcon.className = "fas fa-shield-alt";
}

async function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log("✅ Firebase initialized");
            firebaseInitialized = true;
        }
    } catch (error) {
        console.warn("⚠️ Firebase not available:", error);
    }
}

async function syncWithFirebase() {
    if (!db || !userData) return;
    
    try {
        const userDoc = await db.collection('users').doc(userData.userId).get();
        if (userDoc.exists) {
            const fbData = userDoc.data();
            // Merge Firebase data with local
            userData.balances = { ...userData.balances, ...fbData.balances };
            userData.referralCount = fbData.referralCount || userData.referralCount;
            localStorage.setItem('twtpay_user', JSON.stringify(userData));
            updateUI();
        }
    } catch (error) {
        console.error("Sync error:", error);
    }
}

// ========== ONBOARDING ==========
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
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const referralCode = userId.substr(-8).toUpperCase();
    
    userData = {
        userId: userId,
        userName: 'User',
        referralCode: referralCode,
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
            TRX: 0,
            THB: 0,
            ZDX: 0
        },
        referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
        notifications: [],
        transactions: [],
        totalTwtEarned: WELCOME_BONUS,
        totalUsdtEarned: 0,
        createdAt: new Date().toISOString()
    };
    
    currentUser = userId;
    isAdmin = currentUser === ADMIN_ID;
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    // Save to Firebase if available
    if (db) {
        db.collection('users').doc(userId).set(userData).catch(console.error);
    }
    
    // Check for referral in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && refCode !== referralCode) {
        processReferral(refCode);
    }
    
    showMainApp();
    updateUI();
    setupAdminCheck();
    showToast(`🎉 Welcome! You received ${WELCOME_BONUS} TWT!`, 'success');
}

function showImportModal() {
    document.getElementById('importModal').classList.add('show');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('show');
}

function importWallet() {
    const code = document.getElementById('importCode').value.trim();
    if (!code) {
        showToast('Please enter your referral code or wallet ID', 'error');
        return;
    }
    
    // Try to load from localStorage
    const storedData = localStorage.getItem('twtpay_user');
    if (storedData) {
        const existing = JSON.parse(storedData);
        if (existing.referralCode === code || existing.userId === code) {
            userData = existing;
            currentUser = userData.userId;
            isAdmin = currentUser === ADMIN_ID;
            localStorage.setItem('twtpay_user', JSON.stringify(userData));
            closeImportModal();
            showMainApp();
            updateUI();
            setupAdminCheck();
            showToast('Wallet imported successfully!', 'success');
            return;
        }
    }
    
    // Create new wallet with this referral code
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    userData = {
        userId: userId,
        userName: 'User',
        referralCode: userId.substr(-8).toUpperCase(),
        referredBy: code,
        referralCount: 0,
        referrals: [],
        balances: {
            TWT: WELCOME_BONUS,
            USDT: 0,
            BNB: 0,
            BTC: 0,
            ETH: 0,
            SOL: 0,
            TRX: 0,
            THB: 0,
            ZDX: 0
        },
        referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
        notifications: [],
        transactions: [],
        totalTwtEarned: WELCOME_BONUS,
        totalUsdtEarned: 0,
        createdAt: new Date().toISOString()
    };
    
    currentUser = userId;
    isAdmin = currentUser === ADMIN_ID;
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userId).set(userData).catch(console.error);
    }
    
    processReferral(code);
    
    closeImportModal();
    showMainApp();
    updateUI();
    setupAdminCheck();
    showToast(`🎉 Wallet created! You received ${WELCOME_BONUS} TWT!`, 'success');
}

async function processReferral(referralCode) {
    // Add referral bonus
    userData.balances.TWT = (userData.balances.TWT || 0) + REFERRAL_BONUS;
    userData.totalTwtEarned = (userData.totalTwtEarned || 0) + REFERRAL_BONUS;
    userData.referralCount++;
    
    addNotification(`🎉 Someone joined with your link! You got ${REFERRAL_BONUS} TWT!`, 'success');
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    if (db) {
        await db.collection('users').doc(userData.userId).update({
            balances: userData.balances,
            referralCount: userData.referralCount,
            totalTwtEarned: userData.totalTwtEarned
        }).catch(console.error);
    }
    
    updateUI();
    if (currentTab === 'referral') renderReferral();
}

// ========== WALLET FUNCTIONS ==========
function calculateTotalBalance() {
    if (!userData) return 0;
    let total = 0;
    total += userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * (livePrices.TWT?.price || 1.25);
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 600);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 65000);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 3400);
    total += (userData.balances.SOL || 0) * (livePrices.SOL?.price || 150);
    total += (userData.balances.TRX || 0) * (livePrices.TRX?.price || 0.25);
    return total;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT' || symbol === 'THB' || symbol === 'ZDX') {
        return balance.toLocaleString() + ' ' + symbol;
    } else if (symbol === 'USDT') {
        return '$' + balance.toFixed(2);
    } else if (symbol === 'BNB' || symbol === 'ETH' || symbol === 'SOL' || symbol === 'TRX') {
        return balance.toFixed(4) + ' ' + symbol;
    }
    return balance.toLocaleString() + ' ' + symbol;
}

function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    
    const sortedAssets = [...ALL_ASSETS].sort((a, b) => {
        const aBalance = userData.balances[a.symbol] || 0;
        const bBalance = userData.balances[b.symbol] || 0;
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
            <div class="asset-item">
                <div class="asset-left">
                    <img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img" alt="${asset.symbol}">
                    <div class="asset-info">
                        <h4>${asset.name}</h4>
                        <p>
                            ${asset.symbol}
                            <span class="asset-change ${changeClass}">${changeSymbol}${change.toFixed(2)}%</span>
                        </p>
                    </div>
                </div>
                <div class="asset-right">
                    <div class="asset-balance">${formatBalance(balance, asset.symbol)}</div>
                    <div class="asset-value">$${value.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateTotalBalance() {
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) {
        const total = calculateTotalBalance();
        totalBalanceEl.textContent = `$${total.toFixed(2)}`;
    }
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
            <button class="action-btn" onclick="showSendModal()">
                <i class="fas fa-paper-plane"></i>
                <span>Send</span>
            </button>
            <button class="action-btn" onclick="showReceiveModal()">
                <i class="fas fa-arrow-down"></i>
                <span>Receive</span>
            </button>
            <button class="action-btn" onclick="showSwapModal()">
                <i class="fas fa-exchange-alt"></i>
                <span>Swap</span>
            </button>
            <button class="action-btn" onclick="showBuyModal()">
                <i class="fas fa-shopping-cart"></i>
                <span>Buy</span>
            </button>
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

// ========== REFERRAL FUNCTIONS ==========
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
                <button class="copy-btn" onclick="copyReferralLink()">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="share-btn" onclick="shareReferral()">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 12px;">
                Share your link and get ${REFERRAL_BONUS} TWT for every friend who joins!
            </p>
        </div>
        
        <div class="milestones-list" id="milestonesList"></div>
    `;
    
    renderMilestones();
}

function getReferralLink() {
    return `${window.location.origin}${window.location.pathname}?ref=${userData.referralCode}`;
}

function copyReferralLink() {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    showToast('Referral link copied!', 'success');
}

function shareReferral() {
    const link = getReferralLink();
    const text = `Join Trust Wallet Lite and get ${WELCOME_BONUS} TWT bonus! Use my link: ${link}`;
    navigator.clipboard.writeText(text);
    showToast('Link copied to clipboard!', 'success');
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
                        <i class="fas fa-users"></i>
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
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userData.userId).update({
            balances: userData.balances,
            referralMilestones: userData.referralMilestones
        }).catch(console.error);
    }
    
    updateUI();
    renderMilestones();
    showToast(`🎉 Claimed ${milestone.reward} ${milestone.unit}!`, 'success');
}

// ========== SWAP FUNCTIONS ==========
function updateSwapModal() {
    updateSwapBalances();
    calculateSwap();
}

function updateSwapBalances() {
    const fromSymbol = document.getElementById('swapFromSymbol').textContent;
    const toSymbol = document.getElementById('swapToSymbol').textContent;
    
    document.getElementById('swapFromBalance').textContent = formatBalance(userData.balances[fromSymbol] || 0, fromSymbol);
    document.getElementById('swapToBalance').textContent = formatBalance(userData.balances[toSymbol] || 0, toSymbol);
}

function calculateSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount').value) || 0;
    const fromSymbol = document.getElementById('swapFromSymbol').textContent;
    const toSymbol = document.getElementById('swapToSymbol').textContent;
    
    let toAmount = 0;
    let rateText = '';
    
    if (fromSymbol === 'USDT' && toSymbol === 'TWT') {
        toAmount = fromAmount * (livePrices.TWT?.price || 1.25);
        rateText = `1 USDT = ${(livePrices.TWT?.price || 1.25).toFixed(4)} TWT`;
    } else if (fromSymbol === 'TWT' && toSymbol === 'USDT') {
        toAmount = fromAmount / (livePrices.TWT?.price || 1.25);
        rateText = `1 TWT = ${(1 / (livePrices.TWT?.price || 1.25)).toFixed(4)} USDT`;
    } else if (fromSymbol === 'USDT' && toSymbol === 'BNB') {
        toAmount = fromAmount / (livePrices.BNB?.price || 600);
        rateText = `1 USDT = ${(1 / (livePrices.BNB?.price || 600)).toFixed(6)} BNB`;
    } else {
        toAmount = fromAmount;
        rateText = `1 ${fromSymbol} = 1 ${toSymbol}`;
    }
    
    document.getElementById('swapToAmount').value = toAmount.toFixed(6);
    document.getElementById('swapRateDisplay').textContent = rateText;
}

function confirmSwap() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount').value) || 0;
    const fromSymbol = document.getElementById('swapFromSymbol').textContent;
    const toSymbol = document.getElementById('swapToSymbol').textContent;
    const toAmount = parseFloat(document.getElementById('swapToAmount').value) || 0;
    
    if (!fromAmount || fromAmount <= 0) {
        showToast('Please enter an amount', 'error');
        return;
    }
    
    if (!userData.balances[fromSymbol] || userData.balances[fromSymbol] < fromAmount) {
        showToast(`Insufficient ${fromSymbol} balance`, 'error');
        return;
    }
    
    userData.balances[fromSymbol] -= fromAmount;
    userData.balances[toSymbol] = (userData.balances[toSymbol] || 0) + toAmount;
    
    addTransaction({
        type: 'swap',
        fromAmount: fromAmount,
        fromCurrency: fromSymbol,
        toAmount: toAmount,
        toCurrency: toSymbol,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userData.userId).update({
            balances: userData.balances
        }).catch(console.error);
    }
    
    updateUI();
    showToast(`✅ Swapped ${fromAmount} ${fromSymbol} to ${toAmount.toFixed(4)} ${toSymbol}`, 'success');
    closeModal('swapModal');
    document.getElementById('swapFromAmount').value = '';
}

// ========== SEND/RECEIVE FUNCTIONS ==========
function sendTransaction() {
    const currency = document.getElementById('sendCurrencySymbol').textContent;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    const address = document.getElementById('sendAddress').value.trim();
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (!address) {
        showToast('Please enter a recipient address', 'error');
        return;
    }
    
    if (!userData.balances[currency] || userData.balances[currency] < amount) {
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
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    if (db) {
        db.collection('users').doc(userData.userId).update({
            balances: userData.balances
        }).catch(console.error);
    }
    
    updateUI();
    showToast(`✅ Sent ${amount} ${currency} to ${address.substring(0, 10)}...`, 'success');
    closeModal('sendModal');
    
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendAddress').value = '';
}

function updateReceiveAddress(currency) {
    const addressMap = {
        TWT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        USDT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        BNB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ETH: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        SOL: '3DjcSVxfeP3u4WcV9KniMH11btgThnoGxcx54dMtbfuR',
        TRX: 'TMSJH4QunFiUAqZ8iLvQDPajs1v4B3e5E6'
    };
    const address = addressMap[currency] || addressMap.TWT;
    document.getElementById('receiveAddress').textContent = address;
}

function copyAddress() {
    const address = document.getElementById('receiveAddress').textContent;
    navigator.clipboard.writeText(address);
    showToast('Address copied to clipboard!', 'success');
}

// ========== TWT PAY SCREEN ==========
function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="twpay-card">
            <i class="fas fa-credit-card"></i>
            <h2>TWT Pay Virtual Card</h2>
            <p>Spend your crypto anywhere Visa is accepted</p>
            <div class="coming-soon-badge" style="display: inline-block; margin-top: 8px;">Coming Soon</div>
        </div>
        
        <div class="twpay-features">
            <div class="feature-item">
                <i class="fas fa-globe"></i>
                <div>
                    <h4>Global Acceptance</h4>
                    <p>Use your card anywhere Visa is accepted worldwide</p>
                </div>
                <div class="coming-soon-badge">Soon</div>
            </div>
            <div class="feature-item">
                <i class="fas fa-chart-line"></i>
                <div>
                    <h4>Real-time Conversion</h4>
                    <p>Spend TWT and other crypto instantly converted to fiat</p>
                </div>
                <div class="coming-soon-badge">Soon</div>
            </div>
            <div class="feature-item">
                <i class="fas fa-shield-alt"></i>
                <div>
                    <h4>Secure & Protected</h4>
                    <p>Advanced security with 3D Secure authentication</p>
                </div>
                <div class="coming-soon-badge">Soon</div>
            </div>
            <div class="feature-item">
                <i class="fas fa-percent"></i>
                <div>
                    <h4>Cashback Rewards</h4>
                    <p>Earn up to 5% cashback in TWT on every purchase</p>
                </div>
                <div class="coming-soon-badge">Soon</div>
            </div>
        </div>
    `;
}

// ========== SETTINGS SCREEN ==========
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
                    <div class="desc">View your transaction history</div>
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
            <div class="settings-item" onclick="showLanguageSettings()">
                <i class="fas fa-language"></i>
                <div class="info">
                    <div class="label">Language</div>
                    <div class="desc">English</div>
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

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('twtpay_user');
        userData = null;
        currentUser = null;
        showOnboarding();
    }
}

function showTransactionHistory() {
    const transactions = userData.transactions || [];
    if (transactions.length === 0) {
        showToast('No transactions yet', 'info');
        return;
    }
    
    let message = '📋 Transaction History:\n\n';
    transactions.slice(0, 10).forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleDateString();
        if (tx.type === 'send') {
            message += `📤 Sent ${tx.amount} ${tx.currency} to ${tx.address?.substring(0, 10)}... (${date})\n`;
        } else if (tx.type === 'swap') {
            message += `🔄 Swapped ${tx.fromAmount} ${tx.fromCurrency} → ${tx.toAmount.toFixed(4)} ${tx.toCurrency} (${date})\n`;
        } else if (tx.type === 'referral_reward') {
            message += `🎉 Referral reward: +${tx.amount} ${tx.currency} (${date})\n`;
        }
    });
    
    alert(message);
}

// ========== NOTIFICATIONS ==========
function addNotification(message, type = 'info') {
    const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        message: message,
        type: type,
        read: false,
        timestamp: new Date().toISOString()
    };
    
    if (!userData.notifications) userData.notifications = [];
    userData.notifications.unshift(notification);
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
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

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    modal.classList.add('show');
    renderNotifications();
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    const notifications = userData.notifications || [];
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button onclick="clearReadNotifications()" class="btn-secondary" style="flex: 1; padding: 8px;">
                Clear Read
            </button>
            <button onclick="clearAllNotifications()" class="btn-secondary" style="flex: 1; padding: 8px; border-color: var(--danger); color: var(--danger);">
                Clear All
            </button>
        </div>
        ${notifications.map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="markNotificationRead('${notif.id}')" style="background: ${notif.read ? 'transparent' : 'rgba(5,0,255,0.05)'}; padding: 12px; border-radius: 12px; margin-bottom: 8px; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-weight: 600;">${notif.type === 'success' ? '✓' : 'ℹ️'} Notification</span>
                    <span style="font-size: 10px; color: var(--text-muted);">${new Date(notif.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style="font-size: 13px;">${notif.message}</div>
            </div>
        `).join('')}
    `;
}

function markNotificationRead(id) {
    const notif = userData.notifications.find(n => n.id === id);
    if (notif && !notif.read) {
        notif.read = true;
        localStorage.setItem('twtpay_user', JSON.stringify(userData));
        updateNotificationBadge();
        renderNotifications();
    }
}

function clearReadNotifications() {
    userData.notifications = userData.notifications.filter(n => !n.read);
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateNotificationBadge();
    renderNotifications();
    showToast('Cleared read notifications', 'success');
}

function clearAllNotifications() {
    if (confirm('Delete all notifications?')) {
        userData.notifications = [];
        localStorage.setItem('twtpay_user', JSON.stringify(userData));
        updateNotificationBadge();
        renderNotifications();
        showToast('All notifications cleared', 'success');
    }
}

function addTransaction(tx) {
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift(tx);
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
}

// ========== ADMIN PANEL ==========
function showAdminPanel() {
    if (!isAdmin) {
        showToast('Access denied', 'error');
        return;
    }
    document.getElementById('adminPanel').classList.add('show');
    showAdminTab('deposits');
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.remove('show');
}

function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    
    const content = document.getElementById('adminContent');
    
    if (tab === 'deposits') {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-hourglass-half" style="font-size: 48px; color: var(--text-muted);"></i>
                <p style="margin-top: 16px;">No pending transactions</p>
                <button onclick="refreshAdminPanel()" class="btn-primary" style="margin-top: 16px;">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        `;
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
            <div class="stats-grid" style="display: grid; gap: 16px;">
                <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: 20px; text-align: center;">
                    <h3>Total Users</h3>
                    <div style="font-size: 32px; font-weight: bold;">1</div>
                </div>
                <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: 20px; text-align: center;">
                    <h3>TWT Price</h3>
                    <div style="font-size: 32px; font-weight: bold;">$${(livePrices.TWT?.price || 1.25).toFixed(4)}</div>
                </div>
                <div class="stat-card" style="background: var(--card-bg); padding: 20px; border-radius: 20px; text-align: center;">
                    <h3>Total TWT Distributed</h3>
                    <div style="font-size: 32px; font-weight: bold;">${(userData?.totalTwtEarned || 0).toLocaleString()}</div>
                </div>
            </div>
        `;
    }
}

function refreshAdminPanel() {
    showToast('Admin panel refreshed', 'success');
    fetchLivePrices();
    showAdminTab('deposits');
}

function adminLoadUser() {
    const userId = document.getElementById('adminUserIdInput')?.value.trim();
    if (!userId) {
        showToast('Please enter User ID', 'error');
        return;
    }
    
    const statsDiv = document.getElementById('adminUserStats');
    
    if (userId === currentUser) {
        statsDiv.innerHTML = `
            <div class="admin-transaction-card">
                <h4>User: ${userData.userName}</h4>
                <p>ID: ${userData.userId}</p>
                <p>Referrals: ${userData.referralCount}</p>
                <p>TWT Balance: ${userData.balances.TWT?.toLocaleString()}</p>
                <p>USDT Balance: ${userData.balances.USDT?.toFixed(2)}</p>
                <div style="display: flex; gap: 10px; margin-top: 16px;">
                    <button onclick="adminAddBalance()" class="admin-approve-btn">Add Balance</button>
                    <button onclick="adminRemoveBalance()" class="admin-reject-btn">Remove Balance</button>
                </div>
            </div>
        `;
    } else {
        statsDiv.innerHTML = '<div style="padding: 20px; text-align: center;">User not found in demo mode</div>';
    }
}

function adminAddBalance() {
    const currency = prompt('Currency (TWT, USDT, BNB, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to ADD (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    userData.balances[currency] = (userData.balances[currency] || 0) + amount;
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    showToast(`✅ Added ${amount} ${currency}`, 'success');
    adminLoadUser();
}

function adminRemoveBalance() {
    const currency = prompt('Currency (TWT, USDT, BNB, etc.):', 'TWT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    userData.balances[currency] = Math.max(0, (userData.balances[currency] || 0) - amount);
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    showToast(`✅ Removed ${amount} ${currency}`, 'success');
    adminLoadUser();
}

// ========== UTILITY FUNCTIONS ==========
function updateUI() {
    if (currentTab === 'wallet') {
        renderWallet();
    } else if (currentTab === 'referral') {
        renderReferral();
    } else if (currentTab === 'twtpay') {
        renderTWTPay();
    } else if (currentTab === 'settings') {
        renderSettings();
    }
    updateNotificationBadge();
    updateTotalBalance();
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
    } else {
        icon.className = 'fa-regular fa-circle-info';
    }
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNavbar() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    currentTab = tab;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${tab}Section`).classList.add('active');
    
    switch(tab) {
        case 'wallet': renderWallet(); break;
        case 'referral': renderReferral(); break;
        case 'twtpay': renderTWTPay(); break;
        case 'settings': renderSettings(); break;
    }
}

function setupAdminCheck() {
    if (isAdmin) {
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) crownBtn.classList.remove('hidden');
    }
}

function setupEventListeners() {
    document.getElementById('createWalletBtn')?.addEventListener('click', createNewWallet);
    document.getElementById('importWalletBtn')?.addEventListener('click', showImportModal);
    document.getElementById('confirmImportBtn')?.addEventListener('click', importWallet);
    document.getElementById('confirmSendBtn')?.addEventListener('click', sendTransaction);
    document.getElementById('confirmSwapBtn')?.addEventListener('click', confirmSwap);
    
    window.showSendModal = () => document.getElementById('sendModal').classList.add('show');
    window.showReceiveModal = () => {
        updateReceiveAddress(document.getElementById('receiveCurrencySymbol').textContent);
        document.getElementById('receiveModal').classList.add('show');
    };
    window.showSwapModal = () => {
        updateSwapModal();
        document.getElementById('swapModal').classList.add('show');
    };
    window.showBuyModal = () => document.getElementById('buyModal').classList.add('show');
    
    window.showCurrencySelector = showCurrencySelector;
    window.filterCurrencies = filterCurrencies;
    window.selectCurrency = selectCurrency;
    window.selectSwapCurrency = selectSwapCurrency;
    window.showSwapCurrencySelector = showSwapCurrencySelector;
    window.closeModal = closeModal;
    window.closeImportModal = closeImportModal;
    window.closeAdminPanel = closeAdminPanel;
    window.copyAddress = copyAddress;
    window.scrollToTop = scrollToTop;
    window.copyReferralLink = copyReferralLink;
    window.shareReferral = shareReferral;
    window.claimReferralMilestone = claimReferralMilestone;
    window.showAdminPanel = showAdminPanel;
    window.showAdminTab = showAdminTab;
    window.refreshAdminPanel = refreshAdminPanel;
    window.adminLoadUser = adminLoadUser;
    window.adminAddBalance = adminAddBalance;
    window.adminRemoveBalance = adminRemoveBalance;
    window.showNotifications = showNotifications;
    window.markNotificationRead = markNotificationRead;
    window.clearReadNotifications = clearReadNotifications;
    window.clearAllNotifications = clearAllNotifications;
    window.showTransactionHistory = showTransactionHistory;
    window.showSecuritySettings = () => showToast('Security features coming soon!', 'info');
    window.showLanguageSettings = () => showToast('Language settings coming soon!', 'info');
    window.switchAssetTab = (tab) => renderAssets();
}

let currentCurrencyContext = null;
let currentSwapContext = null;

function showCurrencySelector(context) {
    currentCurrencyContext = context;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    
    list.innerHTML = ALL_ASSETS.map(asset => `
        <div class="currency-list-item" onclick="selectCurrency('${asset.symbol}')">
            <img src="${getCurrencyIcon(asset.symbol)}" alt="${asset.symbol}">
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
            <img src="${getCurrencyIcon(asset.symbol)}" alt="${asset.symbol}">
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
        updateReceiveAddress(symbol);
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
    const search = document.getElementById('currencySearch').value.toLowerCase();
    const items = document.querySelectorAll('.currency-list-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'flex' : 'none';
    });
}

// Scroll listener
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
        btn.classList.toggle('show', window.scrollY > 300);
    }
});

console.log('✅ Trust Wallet Lite v1.0');
console.log('✅ Features: Wallet, Send, Receive, Swap, Referral System (TWT rewards)');
console.log('✅ Prices from CoinGecko, Icons from CoinMarketCap');
