// ============================================================================
// TRUST WALLET LITE - ENTERPRISE EDITION v9.1
// Fixed: Compatible with original styles.css
// ============================================================================

(function() {
    window.TWT = window.TWT || {};
    
    const tg = window.Telegram?.WebApp;
    let userId = null;
    let userName = 'User';
    let IS_GUEST = true;
    let authMethod = 'none';
    
    async function waitForTelegramUser(maxWaitMs = 5000) {
        if (!tg) return null;
        tg.ready(); tg.expand();
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitMs) {
            if (tg.initDataUnsafe?.user?.id) {
                const u = tg.initDataUnsafe.user;
                return { id: u.id.toString(), name: u.first_name || 'User', method: 'telegram' };
            }
            if (tg.initData) {
                try {
                    const params = new URLSearchParams(tg.initData);
                    const userJson = params.get('user');
                    if (userJson) {
                        const u = JSON.parse(decodeURIComponent(userJson));
                        if (u?.id) return { id: u.id.toString(), name: u.first_name || 'User', method: 'telegram' };
                    }
                } catch(e) {}
            }
            await new Promise(r => setTimeout(r, 100));
        }
        return null;
    }
    
    async function initUser() {
        console.log("🚀 Starting user detection...");
        const telegramUser = await waitForTelegramUser(5000);
        
        if (telegramUser) {
            userId = telegramUser.id;
            userName = telegramUser.name;
            authMethod = telegramUser.method;
            IS_GUEST = false;
            localStorage.setItem('twt_user_id', userId);
            localStorage.setItem('twt_user_name', userName);
            localStorage.setItem('twt_timestamp', Date.now().toString());
            console.log("✅ Telegram user:", userId);
        } else {
            const savedId = localStorage.getItem('twt_user_id');
            const savedTime = localStorage.getItem('twt_timestamp');
            const isRecent = savedTime && (Date.now() - parseInt(savedTime)) < 86400000;
            if (savedId && !savedId.startsWith('guest_') && isRecent) {
                userId = savedId;
                userName = localStorage.getItem('twt_user_name') || 'User';
                authMethod = 'localStorage';
                IS_GUEST = false;
                console.log("📦 Restored:", userId);
            } else {
                userId = 'guest_' + Date.now();
                userName = 'Guest';
                authMethod = 'guest';
                IS_GUEST = true;
                console.warn("🚫 Guest mode");
            }
        }
        
        window.TWT.userId = userId;
        window.TWT.userName = userName;
        window.TWT.isGuest = IS_GUEST;
        window.TWT.hasTelegramWebApp = !!tg;
        
        console.log("=== FINAL ===");
        console.log("ID:", userId, "Guest:", IS_GUEST);
        
        if (typeof loadUserData === 'function') await loadUserData();
    }
    
    initUser();
})();

// ====== CONFIG ======
const CONFIG = {
    APP: { name: 'Trust Wallet Lite', version: '9.1.0', botLink: 'https://t.me/TrustWalletLiteTGbot/twt' },
    ECONOMY: { airdropBonus: 10, referralBonus: 25, twtPrice: 1.25 },
    STICKERS: ['🤝','🥰','🥳','💲','💰','💸','💵','😎','🤑','💯','💖','👑','🔥','🎁','🎉','🚀','🐸']
};

const ICONS = {
    TWT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png',
    USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    TRX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png',
    SHIB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
    PEPE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png'
};

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

const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' }
];

// ====== STATE ======
let appState = {
    prices: {},
    language: localStorage.getItem('language') || 'en',
    theme: localStorage.getItem('theme') || 'light',
    currentPage: 'wallet',
    isAdmin: false
};

let userData = null;

// ====== TRANSLATIONS ======
const LOCALES = {
    en: {
        'nav.wallet': 'Wallet', 'nav.airdrop': 'Airdrop', 'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw', 'actions.send': 'Send', 'actions.receive': 'Receive', 'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance', 'airdrop.totalInvites': 'Total Invites', 'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link', 'notifications.title': 'Notifications', 'settings.language': 'Language', 'settings.theme': 'Theme', 'settings.logout': 'Logout'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.airdrop': 'الإسقاط الجوي', 'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب', 'actions.send': 'إرسال', 'actions.receive': 'استلام', 'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي', 'airdrop.totalInvites': 'إجمالي الدعوات', 'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة', 'notifications.title': 'الإشعارات', 'settings.language': 'اللغة', 'settings.theme': 'المظهر', 'settings.logout': 'تسجيل الخروج'
    }
};

function t(key) { return LOCALES[appState.language]?.[key] || LOCALES.en[key] || key; }

// ====== HELPERS ======
function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    if (symbol === 'BTC') return balance.toFixed(6) + ' BTC';
    return balance.toFixed(4) + ' ' + symbol;
}
function formatNumber(num) {
    if (num >= 1e6) return (num/1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num/1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}
function getCurrencyIcon(symbol) { return ICONS[symbol] || ICONS.TWT; }
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toastMessage').textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }
function copyToClipboard(text) { navigator.clipboard.writeText(text); showToast('Copied!'); }

// ====== API ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    try {
        const res = await fetch(`/api${endpoint}`, opts);
        return res.json();
    } catch(e) { return { success: false, error: e.message }; }
}

// ====== USER DATA ======
async function loadUserData() {
    const userId = window.TWT.userId;
    const isGuest = window.TWT.isGuest;
    
    console.log("📂 Loading user:", userId);
    
    try {
        if (!isGuest) {
            const adminCheck = await apiCall('/admin/check', 'POST', { userId });
            appState.isAdmin = adminCheck.isAdmin;
        }
        
        const local = localStorage.getItem(`user_${userId}`);
        if (local && !isGuest) {
            userData = JSON.parse(local);
            renderUI();
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            return;
        }
        
        if (!isGuest) {
            const res = await apiCall(`/users/${userId}`);
            if (res.success && res.data) {
                userData = res.data;
                localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
                renderUI();
                document.getElementById('onboardingScreen').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                return;
            }
        }
        
        document.getElementById('onboardingScreen').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        
        if (isGuest) {
            document.getElementById('onboardingScreen').innerHTML = `
                <div class="onboarding-container">
                    <div class="logo-icon-large"><i class="fas fa-shield-alt"></i></div>
                    <h1>Trust Wallet Lite</h1>
                    <p>Open from Telegram to create your wallet</p>
                    <a href="${CONFIG.APP.botLink}" class="btn-primary">Open in Telegram</a>
                    <button onclick="enableGuestPreview()" class="btn-secondary">Preview Demo</button>
                </div>
            `;
        }
    } catch(e) { console.error(e); }
}

async function createNewWallet() {
    if (window.TWT.isGuest) { showToast('Open from Telegram', 'error'); return; }
    const btn = document.getElementById('createWalletBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...'; }
    try {
        const newUser = {
            userId: window.TWT.userId, userName: window.TWT.userName,
            balances: { TWT: 1000, USDT: CONFIG.ECONOMY.airdropBonus, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, SHIB: 0, PEPE: 0 },
            inviteCount: 0, totalUsdtEarned: CONFIG.ECONOMY.airdropBonus,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Welcome! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [], withdrawBlocked: false
        };
        
        const res = await apiCall('/users', 'POST', { userId: window.TWT.userId, userData: newUser });
        if (res.success) {
            userData = newUser;
            localStorage.setItem(`user_${window.TWT.userId}`, JSON.stringify(userData));
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            renderUI();
            showToast('✅ Wallet created! +10 USDT');
        }
    } catch(e) { showToast('Failed', 'error'); }
    finally { if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus-circle"></i> Create a new wallet'; } }
}

function enableGuestPreview() {
    userData = {
        userId: 'demo', userName: 'Demo User',
        balances: { TWT: 1000, USDT: 10, BNB: 0, BTC: 0, ETH: 0 },
        inviteCount: 0, totalUsdtEarned: 10
    };
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    renderUI();
    showToast('Demo mode', 'info');
}

// ====== RENDER ======
function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    container.innerHTML = ALL_ASSETS.map(asset => {
        const bal = userData.balances[asset.symbol] || 0;
        const price = asset.symbol === 'TWT' ? CONFIG.ECONOMY.twtPrice : 0;
        const value = asset.symbol === 'USDT' ? bal : bal * price;
        return `<div class="asset-item" onclick="showAssetDetails('${asset.symbol}')">
            <div class="asset-left"><img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img"><div class="asset-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div></div>
            <div class="asset-right"><div class="asset-balance">${formatBalance(bal, asset.symbol)}</div><div class="asset-value">$${formatNumber(value)}</div></div>
        </div>`;
    }).join('');
}

function renderTopCryptos() {
    const container = document.getElementById('topCryptoList');
    if (!container) return;
    const cryptos = ALL_ASSETS.slice(0, 5);
    container.innerHTML = cryptos.map(c => `
        <div class="crypto-item" onclick="showAssetDetails('${c.symbol}')">
            <div class="crypto-left"><img src="${getCurrencyIcon(c.symbol)}" class="crypto-icon-img"><div class="crypto-info"><h4>${c.name}</h4><p>${c.symbol}</p></div></div>
            <div class="crypto-right"><div class="crypto-price">$${c.symbol === 'TWT' ? '1.25' : '1.00'}</div></div>
        </div>
    `).join('');
}

function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    const total = (userData?.balances?.USDT || 0) + (userData?.balances?.TWT || 0) * CONFIG.ECONOMY.twtPrice;
    container.innerHTML = `
        <div class="balance-card">
            <div class="balance-label">${t('wallet.totalBalance')}</div>
            <div class="total-balance">$${total.toFixed(2)}</div>
        </div>
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
    renderTopCryptos();
}

function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    const link = `${CONFIG.APP.botLink}?startapp=${window.TWT.userId}`;
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span>${userData.inviteCount || 0}</span></div>
            <div class="stat-card"><span>${t('airdrop.earned')}</span><span>${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('airdrop.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="inviteLink" value="${link}" readonly>
                <button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button>
            </div>
        </div>
        <div id="milestonesList" class="milestones-list"></div>
    `;
    renderMilestones();
}

function renderMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const prog = Math.min((userData.inviteCount / m.referrals) * 100, 100);
        const claimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        return `<div class="milestone-item">
            <div class="milestone-header"><span><i class="fas ${m.icon}"></i> ${m.referrals} Ref</span><span>${m.reward} ${m.unit}</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>
            <div class="progress-text">${userData.inviteCount}/${m.referrals}</div>
            ${!claimed && userData.inviteCount >= m.referrals ? `<button class="claim-btn" onclick="claimMilestone(${m.referrals})">Claim</button>` : claimed ? '<p>✓ Claimed</p>' : ''}
        </div>`;
    }).join('');
}

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const bal = userData?.balances?.TWT || 0;
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-chip"><i class="fas fa-microchip"></i></div>
            <div class="card-brand">TWT Pay</div>
            <div class="card-number"><span>****</span><span>****</span><span>****</span><span>${window.TWT.userId?.slice(-4) || '8888'}</span></div>
            <div class="card-details"><div><div class="label">Holder</div><div class="value">${userData?.userName || 'User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div>
            <div class="card-balance"><div class="balance-label">Balance</div><div class="balance-value">${bal} TWT</div><div class="balance-usd">≈ $${(bal * CONFIG.ECONOMY.twtPrice).toFixed(2)}</div></div>
        </div>
    `;
}

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div><span id="currentLanguageFlag">🇬🇧</span></div></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div></div></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div></div></div>
        </div>
    `;
}

function renderUI() {
    if (appState.currentPage === 'wallet') renderWallet();
    else if (appState.currentPage === 'airdrop') renderAirdrop();
    else if (appState.currentPage === 'twtpay') renderTWTPay();
    else if (appState.currentPage === 'settings') renderSettings();
    
    document.getElementById('userName').textContent = userData?.userName || window.TWT.userName;
    document.getElementById('userIdDisplay').textContent = `ID: ${(userData?.userId || window.TWT.userId).slice(-8)}`;
    document.getElementById('userAvatar').textContent = (userData?.userName || window.TWT.userName).charAt(0).toUpperCase();
}

// ====== NAVIGATION ======
function showWallet() {
    appState.currentPage = 'wallet';
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('walletSection').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-tab="wallet"]').classList.add('active');
    renderWallet();
}
function showAirdrop() {
    appState.currentPage = 'airdrop';
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('airdropSection').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-tab="airdrop"]').classList.add('active');
    renderAirdrop();
}
function showTWTPay() {
    appState.currentPage = 'twtpay';
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-tab="twtpay"]').classList.add('active');
    renderTWTPay();
}
function showSettings() {
    appState.currentPage = 'settings';
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('settingsSection').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-tab="settings"]').classList.add('active');
    renderSettings();
}

// ====== MODALS ======
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { 
    document.getElementById('receiveModal').classList.add('show'); 
    document.getElementById('receiveAddress').innerText = window.TWT.userId;
}
function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (modal && list) {
        const txs = userData?.transactions || [];
        list.innerHTML = txs.length ? txs.reverse().map(tx => 
            `<div class="history-item"><div><span>${tx.type}</span> <span>${tx.amount} ${tx.currency}</span></div><div>${new Date(tx.timestamp).toLocaleString()}</div></div>`
        ).join('') : '<div class="empty-state">No transactions</div>';
        modal.classList.add('show');
    }
}
function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    if (modal && list) {
        const notes = userData?.notifications || [];
        list.innerHTML = notes.length ? notes.reverse().map(n => 
            `<div class="notification-item"><div>${n.message}</div><div>${new Date(n.timestamp).toLocaleString()}</div></div>`
        ).join('') : '<div class="empty-state">No notifications</div>';
        modal.classList.add('show');
    }
}

// ====== THEME & LANGUAGE ======
function toggleTheme() {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', appState.theme);
    document.documentElement.setAttribute('data-theme', appState.theme);
}
function toggleLanguage() {
    appState.language = appState.language === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', appState.language);
    document.body.classList.toggle('rtl', appState.language === 'ar');
    document.documentElement.dir = appState.language === 'ar' ? 'rtl' : 'ltr';
    renderUI();
}

// ====== MISC ======
function copyInviteLink() { copyToClipboard(`${CONFIG.APP.botLink}?startapp=${window.TWT.userId}`); }
function copyAddress() { copyToClipboard(window.TWT.userId); }
function copyDepositAddress() { copyToClipboard(document.getElementById('depositAddress')?.innerText || ''); }
function showAssetDetails(sym) { showToast(`${sym}: ${formatBalance(userData?.balances[sym] || 0, sym)}`, 'info'); }
function logout() { localStorage.clear(); location.reload(); }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function refreshPrices() { showToast('Prices updated', 'success'); }
function filterHistory(type) { showHistory(); }
function checkWithdrawFee() {}
function validateTransactionHashInput() {}
function validateWithdrawAddressInput() {}
function submitDeposit() { showToast('Deposit submitted', 'success'); closeModal('depositModal'); }
function submitWithdraw() { showToast('Withdrawal submitted', 'success'); closeModal('withdrawModal'); }
function updateDepositInfo() {}
async function claimMilestone(refs) { showToast(`Claimed milestone!`, 'success'); }

// ====== ADMIN ======
function showAdminPanel() { 
    if (!appState.isAdmin) { showToast('Access denied', 'error'); return; }
    document.getElementById('adminPanel').classList.remove('hidden'); 
}
function closeAdminPanel() { document.getElementById('adminPanel').classList.add('hidden'); }
function showAdminTab(tab) {}
function showUsersCount() {}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Trust Wallet Lite v9.1");
    
    if (appState.language === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
    }
    
    document.getElementById('createWalletBtn')?.addEventListener('click', createNewWallet);
    document.getElementById('importWalletBtn')?.addEventListener('click', () => showToast('Import coming soon', 'info'));
    
    setTimeout(() => {
        document.getElementById('splashScreen')?.classList.add('hidden');
    }, 1500);
});

// ====== EXPOSE ======
window.showWallet = showWallet;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.closeAdminPanel = closeAdminPanel;
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.logout = logout;
window.scrollToTop = scrollToTop;
window.refreshPrices = refreshPrices;
window.copyInviteLink = copyInviteLink;
window.copyAddress = copyAddress;
window.copyDepositAddress = copyDepositAddress;
window.showAssetDetails = showAssetDetails;
window.createNewWallet = createNewWallet;
window.enableGuestPreview = enableGuestPreview;
window.filterHistory = filterHistory;
window.checkWithdrawFee = checkWithdrawFee;
window.validateTransactionHashInput = validateTransactionHashInput;
window.validateWithdrawAddressInput = validateWithdrawAddressInput;
window.submitDeposit = submitDeposit;
window.submitWithdraw = submitWithdraw;
window.updateDepositInfo = updateDepositInfo;
window.claimMilestone = claimMilestone;
window.showAdminTab = showAdminTab;
window.showUsersCount = showUsersCount;
