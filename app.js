// ========== CONSTANTS ==========
const REFERRAL_BONUS = 250000; // REFI per referral
const WELCOME_BONUS = 10000; // REFI for new user
const REFI_PRICE = 0.000002; // REFI price in USD
const SWAP_RATE = 500000; // 1 USDT = 500,000 REFI
const ADMIN_ID = "1653918641"; // CHANGE THIS TO YOUR TELEGRAM ID

// Admin check
let isAdmin = false;

// User data
let userData = null;
let currentUser = null;
let currentTab = 'wallet';

// Currency Icons
const CURRENCY_ICONS = {
    REFI: 'https://cryptologos.cc/logos/refi-network-refi-logo.png',
    USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    BTC: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    ETH: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    SOL: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    TRX: 'https://cryptologos.cc/logos/tron-trx-logo.png',
    THB: 'https://cryptologos.cc/logos/thunder-brawl-thb-logo.png',
    ZDX: 'https://cryptologos.cc/logos/zeddex-zdz-logo.png',
    SHIB: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
    PEPE: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
    TRUMP: 'https://cryptologos.cc/logos/official-trump-trump-logo.png'
};

// Assets list
const ALL_ASSETS = [
    { symbol: 'REFI', name: 'REFI Network' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'THB', name: 'Thunder Brawl' },
    { symbol: 'ZDX', name: 'ZedDex' }
];

// Referral Milestones
const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'USDT' },
    { referrals: 25, reward: 120, unit: 'USDT' },
    { referrals: 50, reward: 250, unit: 'USDT' },
    { referrals: 100, reward: 500, unit: 'USDT' },
    { referrals: 250, reward: 1000, unit: 'USDT' }
];

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    // Hide splash after 1.5s
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 1500);
    
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('twtpay_user');
    if (storedUser) {
        userData = JSON.parse(storedUser);
        currentUser = userData.userId;
        isAdmin = currentUser === ADMIN_ID;
        showMainApp();
        updateUI();
        setupEventListeners();
    } else {
        showOnboarding();
    }
    
    setupAdminCheck();
    setupNavbar();
});

function setupEventListeners() {
    // Action buttons
    document.getElementById('createWalletBtn')?.addEventListener('click', createNewWallet);
    document.getElementById('importWalletBtn')?.addEventListener('click', showImportModal);
    document.getElementById('confirmImportBtn')?.addEventListener('click', importWallet);
    
    // Main actions
    document.getElementById('confirmSendBtn')?.addEventListener('click', sendTransaction);
    document.getElementById('confirmSwapBtn')?.addEventListener('click', confirmSwap);
    
    // Currency selector
    window.showCurrencySelector = showCurrencySelector;
    window.filterCurrencies = filterCurrencies;
    window.selectCurrency = selectCurrency;
    window.showSwapCurrencySelector = showSwapCurrencySelector;
    
    // Modals
    window.closeModal = closeModal;
    window.closeImportModal = closeImportModal;
    window.closeAdminPanel = closeAdminPanel;
    window.copyAddress = copyAddress;
    window.scrollToTop = scrollToTop;
    
    // Referral
    window.copyReferralLink = copyReferralLink;
    window.shareReferral = shareReferral;
    window.claimReferralMilestone = claimReferralMilestone;
    
    // Admin
    window.showAdminTab = showAdminTab;
    window.approveTransaction = approveTransaction;
    window.rejectTransaction = rejectTransaction;
    window.adminLoadUser = adminLoadUser;
    window.adminAddBalance = adminAddBalance;
    window.adminRemoveBalance = adminRemoveBalance;
    window.blockUserWithdrawals = blockUserWithdrawals;
    
    // Notifications
    window.showNotifications = showNotifications;
    window.markNotificationRead = markNotificationRead;
    window.clearReadNotifications = clearReadNotifications;
    window.clearAllNotifications = clearAllNotifications;
}

function setupAdminCheck() {
    if (isAdmin) {
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) {
            crownBtn.classList.remove('hidden');
            crownBtn.onclick = showAdminPanel;
        }
    }
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
    
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`${tab}Section`).classList.add('active');
    
    // Render content based on tab
    switch(tab) {
        case 'wallet':
            renderWallet();
            break;
        case 'referral':
            renderReferral();
            break;
        case 'twtpay':
            renderTWTPay();
            break;
        case 'settings':
            renderSettings();
            break;
    }
}

// ========== ONBOARDING ==========
function showOnboarding() {
    document.getElementById('onboardingScreen')?.classList.remove('hidden');
    document.getElementById('mainContent')?.classList.add('hidden');
}

function showMainApp() {
    document.getElementById('onboardingScreen')?.classList.add('hidden');
    document.getElementById('mainContent')?.classList.remove('hidden');
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
            REFI: WELCOME_BONUS,
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
        usedHashes: [],
        totalRefiEarned: WELCOME_BONUS,
        totalUsdtEarned: 0,
        createdAt: new Date().toISOString()
    };
    
    currentUser = userId;
    isAdmin = currentUser === ADMIN_ID;
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && refCode !== referralCode) {
        processReferral(refCode);
    }
    
    showMainApp();
    updateUI();
    setupAdminCheck();
    showToast(`Welcome! You received ${WELCOME_BONUS.toLocaleString()} REFI!`, 'success');
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
    
    // Create new with this referral code
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    userData = {
        userId: userId,
        userName: 'User',
        referralCode: userId.substr(-8).toUpperCase(),
        referredBy: code,
        referralCount: 0,
        referrals: [],
        balances: {
            REFI: WELCOME_BONUS,
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
        usedHashes: [],
        totalRefiEarned: WELCOME_BONUS,
        totalUsdtEarned: 0,
        createdAt: new Date().toISOString()
    };
    
    currentUser = userId;
    isAdmin = currentUser === ADMIN_ID;
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    
    // Process referral
    processReferral(code);
    
    closeImportModal();
    showMainApp();
    updateUI();
    setupAdminCheck();
    showToast(`Wallet imported! You received ${WELCOME_BONUS.toLocaleString()} REFI!`, 'success');
}

async function processReferral(referralCode) {
    // In a real app, this would check if the referrer exists
    // For demo, we'll just add the bonus
    userData.balances.REFI += REFERRAL_BONUS;
    userData.totalRefiEarned += REFERRAL_BONUS;
    userData.referralCount++;
    
    addNotification(`🎉 Someone joined with your link! You got ${REFERRAL_BONUS.toLocaleString()} REFI!`, 'success');
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    
    if (currentTab === 'referral') renderReferral();
}

// ========== WALLET SCREEN ==========
function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    
    const totalBalance = calculateTotalBalance();
    const totalChange = 0.05;
    
    container.innerHTML = `
        <div class="balance-card">
            <div class="total-balance">$${totalBalance.toFixed(2)}</div>
            <div class="balance-change">
                <i class="fas fa-arrow-up"></i>
                $${totalChange.toFixed(2)} (+0.0%)
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

function calculateTotalBalance() {
    if (!userData) return 0;
    let total = 0;
    total += userData.balances.USDT || 0;
    total += (userData.balances.REFI || 0) * REFI_PRICE;
    total += (userData.balances.BNB || 0) * 600; // Approx BNB price
    total += (userData.balances.BTC || 0) * 65000;
    total += (userData.balances.ETH || 0) * 3400;
    total += (userData.balances.SOL || 0) * 150;
    total += (userData.balances.TRX || 0) * 0.25;
    total += (userData.balances.THB || 0) * 0.0227;
    return total;
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
        
        let price = 0;
        let value = 0;
        if (asset.symbol === 'REFI') {
            price = REFI_PRICE;
            value = balance * REFI_PRICE;
        } else if (asset.symbol === 'USDT') {
            price = 1;
            value = balance;
        } else if (asset.symbol === 'BNB') {
            price = 600;
            value = balance * 600;
        } else if (asset.symbol === 'BTC') {
            price = 65000;
            value = balance * 65000;
        } else if (asset.symbol === 'ETH') {
            price = 3400;
            value = balance * 3400;
        } else if (asset.symbol === 'SOL') {
            price = 150;
            value = balance * 150;
        } else if (asset.symbol === 'TRX') {
            price = 0.25;
            value = balance * 0.25;
        } else if (asset.symbol === 'THB') {
            price = 0.0227;
            value = balance * 0.0227;
        }
        
        return `
            <div class="asset-item">
                <div class="asset-left">
                    <img src="${CURRENCY_ICONS[asset.symbol] || CURRENCY_ICONS.REFI}" class="asset-icon-img" alt="${asset.symbol}">
                    <div class="asset-info">
                        <h4>${asset.name}</h4>
                        <p>${asset.symbol}</p>
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

function formatBalance(balance, symbol) {
    if (symbol === 'REFI' || symbol === 'THB' || symbol === 'ZDX') {
        return balance.toLocaleString() + ' ' + symbol;
    } else if (symbol === 'USDT') {
        return '$' + balance.toFixed(2);
    } else if (symbol === 'BNB' || symbol === 'ETH' || symbol === 'SOL' || symbol === 'TRX') {
        return balance.toFixed(4) + ' ' + symbol;
    }
    return balance.toLocaleString() + ' ' + symbol;
}

function switchAssetTab(tab) {
    const tabs = document.querySelectorAll('.section-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // For now, just show assets
    renderAssets();
}

// ========== MODAL ACTIONS ==========
window.showSendModal = function() {
    document.getElementById('sendModal').classList.add('show');
}

window.showReceiveModal = function() {
    updateReceiveInfo();
    document.getElementById('receiveModal').classList.add('show');
}

window.showSwapModal = function() {
    updateSwapModal();
    document.getElementById('swapModal').classList.add('show');
}

window.showBuyModal = function() {
    document.getElementById('buyModal').classList.add('show');
}

let currentCurrencyContext = null;
let currentSwapContext = null;

function showCurrencySelector(context) {
    currentCurrencyContext = context;
    const modal = document.getElementById('currencySelectorModal');
    const list = document.getElementById('currencyList');
    
    list.innerHTML = ALL_ASSETS.map(asset => `
        <div class="currency-list-item" onclick="selectCurrency('${asset.symbol}')">
            <img src="${CURRENCY_ICONS[asset.symbol] || CURRENCY_ICONS.REFI}" alt="${asset.symbol}">
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
            <img src="${CURRENCY_ICONS[asset.symbol] || CURRENCY_ICONS.REFI}" alt="${asset.symbol}">
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
        document.getElementById('sendCurrencyIcon').src = CURRENCY_ICONS[symbol] || CURRENCY_ICONS.REFI;
    } else if (currentCurrencyContext === 'receive') {
        document.getElementById('receiveCurrencySymbol').textContent = symbol;
        document.getElementById('receiveCurrencyIcon').src = CURRENCY_ICONS[symbol] || CURRENCY_ICONS.REFI;
        updateReceiveAddress(symbol);
    }
    closeModal('currencySelectorModal');
}

function selectSwapCurrency(symbol) {
    if (currentSwapContext === 'from') {
        document.getElementById('swapFromSymbol').textContent = symbol;
        document.getElementById('swapFromIcon').src = CURRENCY_ICONS[symbol] || CURRENCY_ICONS.REFI;
        updateSwapBalances();
        calculateSwap();
    } else if (currentSwapContext === 'to') {
        document.getElementById('swapToSymbol').textContent = symbol;
        document.getElementById('swapToIcon').src = CURRENCY_ICONS[symbol] || CURRENCY_ICONS.REFI;
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
        if (text.includes(search)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function updateReceiveInfo() {
    const currency = document.getElementById('receiveCurrencySymbol').textContent;
    updateReceiveAddress(currency);
}

function updateReceiveAddress(currency) {
    const addressMap = {
        REFI: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        USDT: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        BNB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ETH: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        SOL: '3DjcSVxfeP3u4WcV9KniMH11btgThnoGxcx54dMtbfuR',
        TRX: 'TMSJH4QunFiUAqZ8iLvQDPajs1v4B3e5E6',
        THB: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450',
        ZDX: '0xbf70420f57342c6Bd4267430D4D3b7E946f09450'
    };
    const address = addressMap[currency] || addressMap.REFI;
    document.getElementById('receiveAddress').textContent = address;
}

function copyAddress() {
    const address = document.getElementById('receiveAddress').textContent;
    navigator.clipboard.writeText(address);
    showToast('Address copied to clipboard!', 'success');
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
        status: 'completed',
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    
    showToast(`Sent ${amount} ${currency} to ${address.substring(0, 10)}...`, 'success');
    closeModal('sendModal');
    
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendAddress').value = '';
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
    
    if (fromSymbol === 'USDT' && toSymbol === 'REFI') {
        toAmount = fromAmount * SWAP_RATE;
        rateText = `1 USDT = ${SWAP_RATE.toLocaleString()} REFI`;
    } else if (fromSymbol === 'REFI' && toSymbol === 'USDT') {
        toAmount = fromAmount / SWAP_RATE;
        rateText = `${SWAP_RATE.toLocaleString()} REFI = 1 USDT`;
    } else {
        toAmount = fromAmount;
        rateText = `1 ${fromSymbol} = 1 ${toSymbol}`;
    }
    
    document.getElementById('swapToAmount').value = toAmount.toFixed(toSymbol === 'REFI' ? 0 : 2);
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
        status: 'completed',
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    
    showToast(`Swapped ${fromAmount} ${fromSymbol} to ${toAmount.toFixed(2)} ${toSymbol}`, 'success');
    closeModal('swapModal');
    
    document.getElementById('swapFromAmount').value = '';
}

// ========== REFERRAL SCREEN ==========
function renderReferral() {
    const container = document.getElementById('referralContainer');
    if (!container) return;
    
    const pendingRewards = userData.referralMilestones.filter(m => 
        userData.referralCount >= m.referrals && !m.claimed
    ).length;
    
    container.innerHTML = `
        <div class="referral-stats">
            <h3>TOTAL REFERRALS</h3>
            <div class="stat-number">${userData.referralCount || 0}</div>
            <h3>REFI EARNED</h3>
            <div class="stat-number">${userData.totalRefiEarned.toLocaleString()} REFI</div>
            <h3>USDT EARNED</h3>
            <div class="stat-number">${userData.totalUsdtEarned.toFixed(2)} USDT</div>
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
                Share your link and get ${REFERRAL_BONUS.toLocaleString()} REFI for every friend who joins!
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
    const text = `Join TWT Pay and get ${WELCOME_BONUS.toLocaleString()} REFI bonus! Use my link: ${link}`;
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
    
    userData.balances.USDT += milestone.reward;
    userData.totalUsdtEarned += milestone.reward;
    userData.referralMilestones[milestoneIndex].claimed = true;
    
    addTransaction({
        type: 'referral_reward',
        amount: milestone.reward,
        currency: milestone.unit,
        details: `Referral milestone: ${referrals} referrals`,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    renderMilestones();
    
    showToast(`Claimed ${milestone.reward} ${milestone.unit}!`, 'success');
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
                    <p>Spend crypto instantly converted to fiat</p>
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
                    <p>Earn up to 5% cashback on every purchase</p>
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
            <span style="font-size: 10px; color: var(--text-muted);">TWT Pay v1.0.0</span>
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
            message += `🔄 Swapped ${tx.fromAmount} ${tx.fromCurrency} → ${tx.toAmount.toFixed(2)} ${tx.toCurrency} (${date})\n`;
        } else if (tx.type === 'referral_reward') {
            message += `🎉 Referral reward: +${tx.amount} ${tx.currency} (${date})\n`;
        }
    });
    
    alert(message);
}

function showSecuritySettings() {
    showToast('Security features coming soon!', 'info');
}

function showLanguageSettings() {
    showToast('Language settings coming soon!', 'info');
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
    event.target.classList.add('active');
    
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
                <button onclick="adminLoadUser()" class="btn-primary" style="width: 100%;">Search User</button>
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
                    <h3>Total REFI Distributed</h3>
                    <div style="font-size: 32px; font-weight: bold;">${userData?.totalRefiEarned?.toLocaleString() || 0}</div>
                </div>
            </div>
        `;
    }
}

function refreshAdminPanel() {
    showToast('Admin panel refreshed', 'success');
    showAdminTab('deposits');
}

async function adminLoadUser() {
    const userId = document.getElementById('adminUserIdInput')?.value.trim();
    if (!userId) {
        showToast('Please enter User ID', 'error');
        return;
    }
    
    const statsDiv = document.getElementById('adminUserStats');
    
    // Check if it's current user
    if (userId === currentUser) {
        statsDiv.innerHTML = `
            <div class="admin-transaction-card">
                <h4>User: ${userData.userName}</h4>
                <p>ID: ${userData.userId}</p>
                <p>Referrals: ${userData.referralCount}</p>
                <p>REFI Balance: ${userData.balances.REFI?.toLocaleString()}</p>
                <p>USDT Balance: ${userData.balances.USDT?.toFixed(2)}</p>
                <div style="display: flex; gap: 10px; margin-top: 16px;">
                    <button onclick="adminAddBalance()" class="admin-approve-btn">Add Balance</button>
                    <button onclick="adminRemoveBalance()" class="admin-reject-btn">Remove Balance</button>
                    <button onclick="blockUserWithdrawals('${userId}')" class="admin-reject-btn">Block</button>
                </div>
            </div>
        `;
        return;
    }
    
    statsDiv.innerHTML = '<div class="loading-spinner">User not found in demo mode</div>';
}

function adminAddBalance() {
    const currency = prompt('Currency (REFI, USDT, BNB, etc.):', 'USDT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to ADD (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    userData.balances[currency] = (userData.balances[currency] || 0) + amount;
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    showToast(`Added ${amount} ${currency}`, 'success');
    adminLoadUser();
}

function adminRemoveBalance() {
    const currency = prompt('Currency (REFI, USDT, BNB, etc.):', 'USDT');
    if (!currency) return;
    const amount = parseFloat(prompt(`Amount to REMOVE (${currency}):`, '0'));
    if (isNaN(amount) || amount <= 0) return;
    
    userData.balances[currency] = Math.max(0, (userData.balances[currency] || 0) - amount);
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
    updateUI();
    showToast(`Removed ${amount} ${currency}`, 'success');
    adminLoadUser();
}

function blockUserWithdrawals(userId) {
    if (confirm('⚠️ PERMANENT ACTION: Block this user from withdrawals? This cannot be undone!')) {
        showToast('User blocked from withdrawals', 'warning');
    }
}

function approveTransaction(id, userId, type) {
    showToast(`Transaction ${id} approved`, 'success');
}

function rejectTransaction(id, userId, type) {
    showToast(`Transaction ${id} rejected`, 'error');
}

function addTransaction(tx) {
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift(tx);
    localStorage.setItem('twtpay_user', JSON.stringify(userData));
}

// ========== UTILITY FUNCTIONS ==========
function updateUI() {
    if (currentTab === 'wallet') {
        renderWallet();
    } else if (currentTab === 'referral') {
        renderReferral();
    } else if (currentTab === 'settings') {
        renderSettings();
    }
    updateNotificationBadge();
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

// Setup scroll listener
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    }
});

console.log('✅ TWT Pay v1.0 - Trust Wallet Style with REFI Network Features');
console.log('✅ Features: Wallet, Send, Receive, Swap, Referral System, Admin Panel');
console.log('✅ All data stored in localStorage');
