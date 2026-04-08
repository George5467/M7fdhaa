// ============================================================================
// TRUST WALLET LITE - FINAL PRODUCTION VERSION v10.0
// مع حل Race Condition + أزرار تعمل بشكل صحيح
// ============================================================================

// ====== 1. TELEGRAM WEBAPP - SIMPLE FIX ======
const tg = window.Telegram?.WebApp;
let REAL_USER_ID = null;
let USER_NAME = 'User';
let USER_USERNAME = '';

// تأخير بسيط 300ms قبل محاولة قراءة البيانات
setTimeout(() => {
    if (tg) {
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
            REAL_USER_ID = tg.initDataUnsafe.user.id.toString();
            USER_NAME = tg.initDataUnsafe.user.first_name || 'User';
            USER_USERNAME = tg.initDataUnsafe.user.username || '';
            console.log("✅ User detected:", REAL_USER_ID);
            console.log("👤 Name:", USER_NAME);
        } else {
            console.log("⚠️ No user data, using guest mode");
        }
    } else {
        console.log("⚠️ Telegram WebApp not available");
    }
    
    // بدء التطبيق بعد التأخير
    startApp();
}, 300);

// ====== 2. GLOBAL CONSTANTS ======
const BOT_LINK = "https://t.me/TrustWalletLiteTGbot/twt";
const AIRDROP_BONUS = 10;
const REFERRAL_BONUS = 25;
const TWT_PRICE = 1.25;
const ADMIN_ID = "1653918641";

// ====== 3. ICONS ======
const CMC_ICONS = {
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

// ====== 4. STATE ======
let userData = null;
let livePrices = {};
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentPage = 'wallet';
let unreadNotifications = 0;
let isGuest = false;

// ====== 5. TRANSLATIONS ======
const translations = {
    en: {
        'nav.wallet': 'Wallet', 'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'Settings',
        'actions.deposit': 'Deposit', 'actions.withdraw': 'Withdraw',
        'actions.send': 'Send', 'actions.receive': 'Receive',
        'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance',
        'airdrop.totalInvites': 'Total Invites',
        'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link',
        'airdrop.milestones': 'Airdrop Milestones',
        'notifications.title': 'Notifications'
    },
    ar: {
        'nav.wallet': 'المحفظة', 'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay', 'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع', 'actions.withdraw': 'سحب',
        'actions.send': 'إرسال', 'actions.receive': 'استلام',
        'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'airdrop.totalInvites': 'إجمالي الدعوات',
        'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة',
        'airdrop.milestones': 'مراحل الإسقاط',
        'notifications.title': 'الإشعارات'
    }
};

function t(key) { return translations[currentLanguage]?.[key] || translations.en[key] || key; }
function getCurrencyIcon(symbol) { return CMC_ICONS[symbol] || CMC_ICONS.TWT; }
function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    return balance.toFixed(4) + ' ' + symbol;
}
function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toastMessage').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
function closeModal(modalId) { document.getElementById(modalId)?.classList.remove('show'); }
function copyToClipboard(text) { navigator.clipboard.writeText(text); showToast('Copied!'); }

// ====== 6. THEME & LANGUAGE ======
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', currentLanguage);
    document.getElementById('currentLanguageFlag').textContent = currentLanguage === 'en' ? '🇬🇧' : '🇸🇦';
    if (currentLanguage === 'ar') { document.body.classList.add('rtl'); document.documentElement.dir = 'rtl'; }
    else { document.body.classList.remove('rtl'); document.documentElement.dir = 'ltr'; }
    updateAllTexts();
    showToast('Language changed');
}
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
}
function initTheme() { document.documentElement.setAttribute('data-theme', currentTheme); }
function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
}

// ====== 7. API CALLS ======
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`/api${endpoint}`, options);
    return response.json();
}

// ====== 8. PRICES ======
async function fetchLivePrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=trust-wallet-token,tether,binancecoin,bitcoin,ethereum,solana,tron,shiba-inu,pepe&vs_currencies=usd');
        const data = await response.json();
        livePrices = {
            TWT: data['trust-wallet-token']?.usd || 1.25,
            USDT: data.tether?.usd || 1,
            BNB: data.binancecoin?.usd || 0,
            BTC: data.bitcoin?.usd || 0,
            ETH: data.ethereum?.usd || 0,
            SOL: data.solana?.usd || 0,
            TRX: data.tron?.usd || 0,
            SHIB: data['shiba-inu']?.usd || 0,
            PEPE: data.pepe?.usd || 0
        };
        if (currentPage === 'wallet') renderAssets();
        updateTotalBalance();
    } catch (error) { console.error("Price error:", error); }
}
function refreshPrices() { fetchLivePrices(); showToast('Prices refreshed!'); }

// ====== 9. CREATE WALLET (DEFINED FIRST) ======
async function createNewWallet() {
    console.log("🔄 createNewWallet called");
    
    if (isGuest) { 
        showGuestPrompt(); 
        return; 
    }
    
    const btn = document.getElementById('createWalletBtn');
    if (btn) { 
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...'; 
        btn.disabled = true; 
    }
    
    try {
        const finalUserId = REAL_USER_ID || localStorage.getItem('twt_user_id');
        if (!finalUserId || finalUserId.startsWith('guest_')) {
            showToast('Please open from Telegram to create wallet', 'error');
            return;
        }
        
        const newUserData = {
            userId: finalUserId, 
            userName: USER_NAME,
            balances: { TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, SHIB: 0, PEPE: 0 },
            inviteCount: 0, invitedBy: null, totalUsdtEarned: AIRDROP_BONUS,
            referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
            notifications: [{ id: Date.now().toString(), message: '🎉 Welcome! +10 USDT', read: false, timestamp: new Date().toISOString() }],
            transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date().toISOString() }],
            withdrawBlocked: false, createdAt: new Date().toISOString()
        };
        
        const response = await apiCall('/users', 'POST', { userId: finalUserId, userData: newUserData });
        
        if (response.success) {
            userData = newUserData;
            localStorage.setItem(`user_${finalUserId}`, JSON.stringify(userData));
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            updateUI();
            showToast('✅ Wallet created! +10 USDT');
            
            const urlParams = new URLSearchParams(window.location.search);
            const startParam = urlParams.get('startapp');
            if (startParam && startParam !== finalUserId) await processReferral(startParam);
        } else {
            throw new Error(response.error);
        }
    } catch (error) { 
        showToast('Failed to create wallet', 'error'); 
    } finally { 
        if (btn) { 
            btn.innerHTML = 'Create a new wallet'; 
            btn.disabled = false; 
        } 
    }
}

// ====== 10. IMPORT WALLET ======
function showImportModal() {
    console.log("🔓 showImportModal called");
    if (isGuest) { showGuestPrompt(); return; }
    
    const modal = document.getElementById('importModal');
    if (modal) {
        const grid = document.getElementById('wordsGrid');
        if (grid) { 
            grid.innerHTML = ''; 
            for (let i = 1; i <= 12; i++) { 
                grid.innerHTML += `<div class="word-field"><span>${i}</span><input type="text" id="word_${i}" placeholder="word ${i}"></div>`; 
            } 
        }
        modal.classList.add('show');
    } else { 
        showToast('Import coming soon', 'info'); 
    }
}

async function importWallet() {
    console.log("📥 importWallet called");
    if (isGuest) { showGuestPrompt(); return; }
    
    const words = [];
    for (let i = 1; i <= 12; i++) {
        const word = document.getElementById(`word_${i}`)?.value.trim();
        if (!word) { showToast(`Please enter word ${i}`, 'error'); return; }
        words.push(word);
    }
    showToast('Import coming soon', 'info');
}

// ====== 11. REFERRAL SYSTEM ======
async function processReferral(referralCode) {
    if (!referralCode || referralCode === REAL_USER_ID || userData?.invitedBy) return;
    const response = await apiCall('/referrals', 'POST', { referrerId: referralCode, newUserId: REAL_USER_ID });
    if (response.success && userData) {
        userData.invitedBy = referralCode;
        userData.balances.USDT += REFERRAL_BONUS;
        userData.totalUsdtEarned += REFERRAL_BONUS;
        saveUserData();
        updateUI();
        showToast(`🎉 +${REFERRAL_BONUS} USDT from referral!`, 'success');
    }
}

function copyInviteLink() { 
    const userId = REAL_USER_ID || localStorage.getItem('twt_user_id') || 'user';
    copyToClipboard(`${BOT_LINK}?startapp=${userId}`); 
}

async function claimMilestone(referrals) {
    const milestone = userData.referralMilestones?.find(x => x.referrals === referrals);
    if (!milestone || milestone.claimed) return;
    if (userData.inviteCount < referrals) { showToast(`Need ${referrals} referrals`, 'error'); return; }
    const reward = REFERRAL_MILESTONES.find(x => x.referrals === referrals).reward;
    userData.balances.USDT += reward;
    userData.totalUsdtEarned += reward;
    milestone.claimed = true;
    saveUserData();
    renderAirdrop();
    renderWallet();
    updateTotalBalance();
    showToast(`Claimed ${reward} USDT!`);
}

// ====== 12. LOAD USER DATA ======
async function loadUserData() {
    try {
        const finalUserId = REAL_USER_ID || localStorage.getItem('twt_user_id');
        
        if (!finalUserId || finalUserId.startsWith('guest_')) {
            isGuest = true;
            document.getElementById('onboardingScreen').style.display = 'flex';
            document.getElementById('mainContent').style.display = 'none';
            return;
        }
        
        const localData = localStorage.getItem(`user_${finalUserId}`);
        if (localData) {
            userData = JSON.parse(localData);
            updateUI();
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            return;
        }
        
        const response = await apiCall(`/users/${finalUserId}`);
        if (response.success && response.data) {
            userData = response.data;
            localStorage.setItem(`user_${finalUserId}`, JSON.stringify(userData));
            updateUI();
            document.getElementById('onboardingScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
        } else {
            document.getElementById('onboardingScreen').style.display = 'flex';
            document.getElementById('mainContent').style.display = 'none';
        }
    } catch (error) {
        console.error("Error loading user:", error);
        document.getElementById('onboardingScreen').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
    }
}

function saveUserData() {
    const finalUserId = REAL_USER_ID || localStorage.getItem('twt_user_id');
    if (userData && !isGuest && finalUserId && !finalUserId.startsWith('guest_')) {
        localStorage.setItem(`user_${finalUserId}`, JSON.stringify(userData));
        apiCall(`/users/${finalUserId}`, 'PATCH', { updates: userData });
    }
}

function updateUI() {
    if (currentPage === 'wallet') { renderAssets(); updateTotalBalance(); }
    if (currentPage === 'airdrop') renderAirdrop();
    if (currentPage === 'settings') renderSettings();
    
    const userNameEl = document.getElementById('userName');
    const userIdEl = document.getElementById('userIdDisplay');
    const userAvatarEl = document.getElementById('userAvatar');
    const displayName = userData?.userName || USER_NAME || 'User';
    const displayId = userData?.userId || REAL_USER_ID || localStorage.getItem('twt_user_id') || 'Guest';
    
    if (userNameEl) userNameEl.textContent = displayName;
    if (userIdEl) userIdEl.textContent = `ID: ${displayId.slice(-8)}`;
    if (userAvatarEl) userAvatarEl.textContent = displayName.charAt(0).toUpperCase();
}

function updateTotalBalance() {
    if (!userData) return;
    let total = (userData.balances.USDT || 0) + (userData.balances.TWT || 0) * TWT_PRICE;
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function logout() { if (confirm('Logout?')) { localStorage.clear(); location.reload(); } }

// ====== 13. RENDER FUNCTIONS ======
function renderAssets() {
    const container = document.getElementById('assetsList');
    if (!container || !userData) return;
    container.innerHTML = ALL_ASSETS.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol] || (asset.symbol === 'TWT' ? TWT_PRICE : 0);
        const value = asset.symbol === 'USDT' ? balance : balance * price;
        return `<div class="asset-item" onclick="showAssetDetails('${asset.symbol}')"><div class="asset-left"><img src="${getCurrencyIcon(asset.symbol)}" class="asset-icon-img"><div class="asset-info"><h4>${asset.name}</h4><p>${asset.symbol}</p></div></div><div class="asset-right"><div class="asset-balance">${formatBalance(balance, asset.symbol)}</div><div class="asset-value">$${formatNumber(value)}</div></div></div>`;
    }).join('');
}

function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    container.innerHTML = `<div class="balance-card"><div class="total-balance" id="totalBalance">$0</div></div><div class="action-buttons"><button class="action-btn" onclick="showDepositModal()"><i class="fas fa-plus-circle"></i><span>${t('actions.deposit')}</span></button><button class="action-btn" onclick="showWithdrawModal()"><i class="fas fa-minus-circle"></i><span>${t('actions.withdraw')}</span></button><button class="action-btn" onclick="showSendModal()"><i class="fas fa-paper-plane"></i><span>${t('actions.send')}</span></button><button class="action-btn" onclick="showReceiveModal()"><i class="fas fa-qrcode"></i><span>${t('actions.receive')}</span></button><button class="action-btn" onclick="showHistory()"><i class="fas fa-history"></i><span>${t('actions.history')}</span></button></div><div id="assetsList" class="assets-list"></div>`;
    renderAssets(); updateTotalBalance();
}

function showAssetDetails(symbol) {
    const balance = userData?.balances[symbol] || 0;
    const price = livePrices[symbol] || (symbol === 'TWT' ? TWT_PRICE : 0);
    const value = symbol === 'USDT' ? balance : balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}

function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    const userId = REAL_USER_ID || localStorage.getItem('twt_user_id') || 'user';
    const inviteLink = `${BOT_LINK}?startapp=${userId}`;
    container.innerHTML = `<div class="referral-stats"><div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span>${userData.inviteCount || 0}</span></div><div class="stat-card"><span>${t('airdrop.earned')}</span><span>${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div></div><div class="referral-link-card"><div class="link-label">${t('airdrop.yourLink')}</div><div class="link-container"><input type="text" id="inviteLink" value="${inviteLink}" readonly><button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button></div></div><div id="milestonesList" class="milestones-list"></div>`;
    renderReferralMilestones();
}

function renderReferralMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const progress = Math.min((userData.inviteCount / m.referrals) * 100, 100);
        const canClaim = userData.inviteCount >= m.referrals && !userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        const isClaimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        return `<div class="milestone-item"><div class="milestone-header"><span><i class="fas ${m.icon}"></i> ${m.referrals} Referrals</span><span>${m.reward} ${m.unit}</span></div><div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div><div class="progress-text">${userData.inviteCount}/${m.referrals}</div>${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.referrals})">Claim Reward</button>` : isClaimed ? '<p style="color:green;">✓ Claimed</p>' : ''}</div>`;
    }).join('');
}

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const twtBalance = userData?.balances?.TWT || 0;
    const userId = REAL_USER_ID || localStorage.getItem('twt_user_id') || '8888';
    const cardNumber = userId.slice(-4);
    container.innerHTML = `<div class="virtual-card"><div class="card-chip"><i class="fas fa-microchip"></i></div><div class="card-brand">TWT Pay</div><div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div><div class="card-details"><div><div class="label">Card Holder</div><div class="value">${userData?.userName || 'User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div><div class="card-balance"><div class="balance-label">Card Balance</div><div class="balance-value">${twtBalance} TWT</div><div class="balance-usd">≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div></div><div class="card-footer"><i class="fab fa-visa"></i><span>Virtual Card</span></div></div>`;
}

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    container.innerHTML = `<div class="settings-list"><div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div></div><i class="fas fa-chevron-right"></i></div><div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div></div></div></div>`;
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    const txs = userData?.transactions || [];
    if (txs.length === 0) list.innerHTML = '<div class="empty-state">No transactions</div>';
    else list.innerHTML = txs.map(tx => `<div class="history-item"><div><span>${tx.type}</span> <span>${tx.amount} ${tx.currency}</span></div><div>${new Date(tx.timestamp).toLocaleString()}</div></div>`).join('');
    modal.classList.add('show');
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    if (!modal || !list || !userData) return;
    const notifications = userData.notifications || [];
    if (notifications.length === 0) list.innerHTML = '<div class="empty-state">No notifications</div>';
    else list.innerHTML = notifications.map(n => `<div class="notification-item"><div>${n.message}</div><div>${new Date(n.timestamp).toLocaleString()}</div></div>`).join('');
    modal.classList.add('show');
}

function showGuestPrompt() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `<div class="modal-content" style="text-align:center;padding:30px;"><div style="font-size:60px;">📱</div><h2>Open in Telegram</h2><p>Please open this app from Telegram to create your wallet.</p><a href="${BOT_LINK}" class="btn-primary">Open Bot</a><button onclick="this.closest('.modal').remove()" class="btn-secondary" style="margin-top:12px;">Close</button></div>`;
    document.body.appendChild(modal);
}

// ====== 14. MODAL FUNCTIONS ======
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); const userId = REAL_USER_ID || localStorage.getItem('twt_user_id') || 'User'; document.getElementById('receiveAddress').innerText = userId; }
function showSwapModal() { showToast('Coming soon!'); }
function sendTransaction() { showToast('Coming soon!'); }
function submitWithdraw() { showToast('Coming soon!'); }
function copyDepositAddress() { const a = document.getElementById('depositAddress')?.innerText; if (a) copyToClipboard(a); }
function copyAddress() { const a = document.getElementById('receiveAddress')?.innerText; if (a) copyToClipboard(a); }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function showAdminPanel() { alert('Admin Panel - Coming Soon'); }

// ====== 15. NAVIGATION ======
function showWallet() {
    currentPage = 'wallet';
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const walletNav = document.querySelector('.nav-item[data-tab="wallet"]');
    if (walletNav) walletNav.classList.add('active');
    renderWallet();
}

function showAirdrop() {
    currentPage = 'airdrop';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const airdropNav = document.querySelector('.nav-item[data-tab="airdrop"]');
    if (airdropNav) airdropNav.classList.add('active');
    renderAirdrop();
}

function showTWTPay() {
    currentPage = 'twtpay';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const twtpayNav = document.querySelector('.nav-item[data-tab="twtpay"]');
    if (twtpayNav) twtpayNav.classList.add('active');
    renderTWTPay();
}

function showSettings() {
    currentPage = 'settings';
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('airdropSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const settingsNav = document.querySelector('.nav-item[data-tab="settings"]');
    if (settingsNav) settingsNav.classList.add('active');
    renderSettings();
}

// ====== 16. STICKER SYSTEM ======
const STICKERS = ['🤝', '🫣', '🥰', '🥳', '💲', '💰', '💸', '💵', '🤪', '😱', '😤', '😎', '🤑', '💯', '💖', '👑', '❤️‍🔥', '🫂', '🔥', '🧡', '🎁', '💌', '🎉', '👑', '🚀', '💟'];
let lastStickerTime = 0;
const STICKER_COOLDOWN = 12 * 60 * 1000;

function showRandomSticker() {
    const now = Date.now();
    if (now - lastStickerTime < STICKER_COOLDOWN) return;
    const stickerElement = document.getElementById('welcomeSticker');
    if (!stickerElement) return;
    const randomSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
    stickerElement.textContent = randomSticker;
    stickerElement.classList.remove('sticker-pop', 'sticker-shake');
    void stickerElement.offsetWidth;
    stickerElement.classList.add('sticker-pop');
    setTimeout(() => stickerElement.classList.add('sticker-shake'), 200);
    setTimeout(() => { stickerElement.classList.remove('sticker-pop', 'sticker-shake'); setTimeout(() => stickerElement.textContent = '', 300); }, 3000);
    lastStickerTime = now;
}

// ====== 17. START APP FUNCTION ======
function startApp() {
    console.log("🚀 Starting Trust Wallet Lite...");
    
    const finalUserId = REAL_USER_ID || localStorage.getItem('twt_user_id') || 'guest_' + Date.now();
    const finalUserName = USER_NAME || 'User';
    
    if (!REAL_USER_ID) {
        localStorage.setItem('twt_user_id', finalUserId);
        isGuest = true;
    }
    
    console.log("📱 User ID:", finalUserId);
    console.log("👤 User Name:", finalUserName);
    console.log("👑 Guest Mode:", isGuest);
    
    initTheme();
    updateAllTexts();
    
    // 🔥 ربط الأزرار (مرة أخرى للتأكيد)
    const createBtn = document.getElementById('createWalletBtn');
    const importBtn = document.getElementById('importWalletBtn');
    const refreshBtn = document.getElementById('refreshPricesBtn');
    
    if (createBtn) {
        createBtn.onclick = createNewWallet;
        console.log("✅ Create button attached");
    }
    if (importBtn) {
        importBtn.onclick = showImportModal;
        console.log("✅ Import button attached");
    }
    if (refreshBtn) refreshBtn.onclick = refreshPrices;
    
    // ربط أزرار التنقل
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'wallet') showWallet();
            else if (tab === 'airdrop') showAirdrop();
            else if (tab === 'twtpay') showTWTPay();
            else if (tab === 'settings') showSettings();
        });
    });
    
    fetchLivePrices();
    loadUserData();
    
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
        setTimeout(() => showRandomSticker(), 500);
    }, 1500);
    
    console.log("✅ Trust Wallet Lite initialized!");
}

// ====== 18. EXPOSE GLOBALS ======
window.showWallet = showWallet;
window.showAirdrop = showAirdrop;
window.showTWTPay = showTWTPay;
window.showSettings = showSettings;
window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showSendModal = showSendModal;
window.showReceiveModal = showReceiveModal;
window.showSwapModal = showSwapModal;
window.showHistory = showHistory;
window.showNotifications = showNotifications;
window.showAdminPanel = showAdminPanel;
window.closeModal = closeModal;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.scrollToTop = scrollToTop;
window.refreshPrices = refreshPrices;
window.copyToClipboard = copyToClipboard;
window.copyInviteLink = copyInviteLink;
window.claimMilestone = claimMilestone;
window.copyDepositAddress = copyDepositAddress;
window.copyAddress = copyAddress;
window.sendTransaction = sendTransaction;
window.submitWithdraw = submitWithdraw;
window.createNewWallet = createNewWallet;
window.importWallet = importWallet;
window.showImportModal = showImportModal;
window.showAssetDetails = showAssetDetails;

console.log("✅ Trust Wallet Lite v10.0 - FINAL READY!");
