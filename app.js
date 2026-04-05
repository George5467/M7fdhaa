// ============================================================================
// TRUST WALLET LITE - مستنسخ من REFI NETWORK بالكامل
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION (نسخة طبق الأصل من REFI) ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation?.();
    console.log("✅ Telegram WebApp initialized");
}

// 🔥 هذا هو السطر السحري من REFI - لا تغيره أبداً 🔥
const userId = tg?.initDataUnsafe?.user?.id?.toString() || 
               localStorage.getItem('twt_user_id') || 
               'guest_' + Math.random().toString(36).substr(2, 9);

const userName = tg?.initDataUnsafe?.user?.first_name || 'TWT User';

// حفظ معرف المستخدم
localStorage.setItem('twt_user_id', userId);

console.log("📱 User ID:", userId);
console.log("👤 Name:", userName);

// التحقق من وجود كود إحالة في الرابط (مثل REFI)
function hasReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return !!(urlParams.get('startapp') || urlParams.get('ref') || tg?.initDataUnsafe?.start_param);
}

// ====== 2. ADMIN SYSTEM (نسخة طبق الأصل من REFI) ======
const ADMIN_ID = "1653918641";
let isAdmin = userId === ADMIN_ID;

// إضافة تاج المشرف (مثل REFI)
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

// ====== 3. CONSTANTS (معدلة لـ TWT) ======
const BOT_LINK = "https://t.me/TrustTgWalletbot/TWT";
const AIRDROP_BONUS = 10;
const REFERRAL_BONUS = 25;
const SWAP_RATE = 500000;
const TWT_PRICE = 1.25;

// ====== 4. أيقونات العملات (مثل REFI) ======
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

// جميع الأصول (مثل REFI)
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

// مراحل الإحالة (مثل REFI)
const REFERRAL_MILESTONES = [
    { referrals: 10, reward: 50, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 25, reward: 120, unit: 'USDT', icon: 'fa-medal' },
    { referrals: 50, reward: 250, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 100, reward: 500, unit: 'USDT', icon: 'fa-crown' },
    { referrals: 250, reward: 1000, unit: 'USDT', icon: 'fa-gem' }
];

// ====== 5. TRANSLATIONS (مثل REFI) ======
const translations = {
    en: {
        'app.name': 'Trust Wallet Lite',
        'nav.wallet': 'Wallet',
        'nav.airdrop': 'Airdrop',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'Settings',
        'actions.deposit': 'Deposit',
        'actions.withdraw': 'Withdraw',
        'actions.history': 'History',
        'wallet.totalBalance': 'Total Balance',
        'wallet.myAssets': 'My Assets',
        'airdrop.totalInvites': 'Total Invites',
        'airdrop.earned': 'USDT Earned',
        'airdrop.yourLink': 'Your Invite Link',
        'airdrop.milestones': 'Airdrop Milestones',
        'notifications.title': 'Notifications',
        'notifications.clear_read': 'Clear Read',
        'notifications.clear_all': 'Clear All',
        'notifications.no_notifications': 'No notifications',
        'admin.title': 'Admin Panel',
        'admin.users': 'User Management',
        'admin.searchUser': 'Search User',
        'admin.addBalance': 'Add Balance',
        'admin.removeBalance': 'Remove Balance',
        'admin.refresh': 'Refresh'
    },
    ar: {
        'app.name': 'Trust Wallet Lite',
        'nav.wallet': 'المحفظة',
        'nav.airdrop': 'الإسقاط الجوي',
        'nav.twtpay': 'TWT Pay',
        'nav.settings': 'الإعدادات',
        'actions.deposit': 'إيداع',
        'actions.withdraw': 'سحب',
        'actions.history': 'السجل',
        'wallet.totalBalance': 'الرصيد الإجمالي',
        'wallet.myAssets': 'أصولي',
        'airdrop.totalInvites': 'إجمالي الدعوات',
        'airdrop.earned': 'USDT المكتسبة',
        'airdrop.yourLink': 'رابط الدعوة',
        'airdrop.milestones': 'مراحل الإسقاط',
        'notifications.title': 'الإشعارات',
        'notifications.clear_read': 'حذف المقروء',
        'notifications.clear_all': 'حذف الكل',
        'notifications.no_notifications': 'لا توجد إشعارات',
        'admin.title': 'لوحة المشرف',
        'admin.users': 'إدارة المستخدمين',
        'admin.searchUser': 'بحث عن مستخدم',
        'admin.addBalance': 'إضافة رصيد',
        'admin.removeBalance': 'خصم رصيد',
        'admin.refresh': 'تحديث'
    }
};

let currentLanguage = localStorage.getItem('preferred_language') || 'en';

function t(key, params = {}) {
    let text = translations[currentLanguage]?.[key] || translations.en[key] || key;
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    return text;
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('preferred_language', currentLanguage);
    const flagEl = document.getElementById('currentLanguageFlag');
    if (flagEl) flagEl.textContent = currentLanguage === 'en' ? '🇬🇧' : '🇸🇦';
    if (currentLanguage === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.dir = 'ltr';
    }
    updateAllTexts();
    showToast('Language changed', 'success');
}

function updateAllTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

// ====== 6. UTILITY FUNCTIONS (مثل REFI) ======
function getCurrencyIcon(symbol) {
    return CMC_ICONS[symbol] || CMC_ICONS.TWT;
}

function formatBalance(balance, symbol) {
    if (symbol === 'TWT') return balance.toLocaleString() + ' TWT';
    if (symbol === 'USDT') return '$' + balance.toFixed(2);
    return balance.toFixed(4) + ' ' + symbol;
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    if (num < 0.0001) return num.toFixed(8);
    if (num < 0.01) return num.toFixed(6);
    return num.toFixed(2);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast) return;
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    const icon = toast.querySelector('i');
    if (type === 'success') icon.className = 'fa-regular fa-circle-check';
    else if (type === 'error') icon.className = 'fa-regular fa-circle-xmark';
    else if (type === 'warning') icon.className = 'fa-regular fa-circle-exclamation';
    else icon.className = 'fa-regular fa-circle-info';
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied!', 'success');
}

function animateElement(selector, animationClass) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add(animationClass);
        setTimeout(() => element.classList.remove(animationClass), 500);
    }
}

// ====== 7. STATE MANAGEMENT (مثل REFI) ======
let userData = null;
let livePrices = {};
let unreadNotifications = 0;
let appInitialized = false;

// ====== 8. PRICES (مثل REFI) ======
async function fetchLivePrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=trust-wallet-token,tether,binancecoin,bitcoin,ethereum,solana,tron,cardano,dogecoin,shiba-inu,pepe,the-open-network&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        livePrices = {
            TWT: { price: data['trust-wallet-token']?.usd || 1.25, change: data['trust-wallet-token']?.usd_24h_change || 0 },
            USDT: { price: data.tether?.usd || 1, change: data.tether?.usd_24h_change || 0 },
            BNB: { price: data.binancecoin?.usd || 0, change: data.binancecoin?.usd_24h_change || 0 },
            BTC: { price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
            ETH: { price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
            SOL: { price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 },
            TRX: { price: data.tron?.usd || 0, change: data.tron?.usd_24h_change || 0 },
            ADA: { price: data.cardano?.usd || 0, change: data.cardano?.usd_24h_change || 0 },
            DOGE: { price: data.dogecoin?.usd || 0, change: data.dogecoin?.usd_24h_change || 0 },
            SHIB: { price: data['shiba-inu']?.usd || 0, change: data['shiba-inu']?.usd_24h_change || 0 },
            PEPE: { price: data.pepe?.usd || 0, change: data.pepe?.usd_24h_change || 0 },
            TON: { price: data['the-open-network']?.usd || 0, change: data['the-open-network']?.usd_24h_change || 0 }
        };
        
        if (currentPage === 'wallet') renderAssets();
        updateTotalBalance();
    } catch (error) {
        console.error("Price fetch error:", error);
    }
}

// ====== 9. RENDER FUNCTIONS (مثل REFI) ======
function renderAssets() {
    const assetsList = document.getElementById('assetsList');
    if (!assetsList || !userData) return;
    
    const sortedAssets = [...ALL_ASSETS].sort((a, b) => {
        if (a.symbol === 'TWT') return -1;
        if (b.symbol === 'TWT') return 1;
        const aBalance = userData.balances[a.symbol] || 0;
        const bBalance = userData.balances[b.symbol] || 0;
        return bBalance - aBalance;
    });
    
    assetsList.innerHTML = sortedAssets.map(asset => {
        const balance = userData.balances[asset.symbol] || 0;
        const price = livePrices[asset.symbol]?.price || (asset.symbol === 'TWT' ? TWT_PRICE : 0);
        const value = asset.symbol === 'USDT' ? balance : balance * price;
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

function updateTotalBalance() {
    if (!userData) return;
    
    let total = 0;
    total += userData.balances.USDT || 0;
    total += (userData.balances.TWT || 0) * TWT_PRICE;
    total += (userData.balances.BNB || 0) * (livePrices.BNB?.price || 0);
    total += (userData.balances.BTC || 0) * (livePrices.BTC?.price || 0);
    total += (userData.balances.ETH || 0) * (livePrices.ETH?.price || 0);
    total += (userData.balances.SOL || 0) * (livePrices.SOL?.price || 0);
    
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

function renderAirdrop() {
    const container = document.getElementById('referralContainer');
    if (!container || !userData) return;
    
    const inviteLink = `${BOT_LINK}?startapp=${userId}`;
    
    container.innerHTML = `
        <div class="referral-stats">
            <div class="stat-card"><span>${t('airdrop.totalInvites')}</span><span id="totalInvites">${userData.inviteCount || 0}</span></div>
            <div class="stat-card"><span>${t('airdrop.earned')}</span><span id="usdtEarned">${(userData.totalUsdtEarned || 0).toFixed(2)}</span></div>
        </div>
        <div class="referral-link-card">
            <div class="link-label">${t('airdrop.yourLink')}</div>
            <div class="link-container">
                <input type="text" id="inviteLink" value="${inviteLink}" readonly>
                <button class="copy-btn" onclick="copyInviteLink()"><i class="fas fa-copy"></i></button>
                <button class="share-btn" onclick="shareInvite()"><i class="fas fa-share-alt"></i></button>
            </div>
        </div>
        <div class="referral-description"><i class="fas fa-gift"></i><p>${t('airdrop.inviteBonus')}</p></div>
        <div class="section-header"><h3>${t('airdrop.milestones')}</h3></div>
        <div id="milestonesList" class="milestones-list"></div>
    `;
    
    renderAirdropMilestones();
}

function renderAirdropMilestones() {
    const container = document.getElementById('milestonesList');
    if (!container || !userData) return;
    
    container.innerHTML = REFERRAL_MILESTONES.map(m => {
        const progress = Math.min((userData.inviteCount / m.referrals) * 100, 100);
        const canClaim = userData.inviteCount >= m.referrals && !userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        const isClaimed = userData.referralMilestones?.find(x => x.referrals === m.referrals)?.claimed;
        
        return `
            <div class="milestone-item">
                <div class="milestone-header"><span><i class="fas ${m.icon}"></i> ${m.referrals} Referrals</span><span>${m.reward} ${m.unit}</span></div>
                <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                <div class="progress-text">${userData.inviteCount}/${m.referrals}</div>
                ${canClaim ? `<button class="claim-btn" onclick="claimMilestone(${m.referrals})">Claim Reward</button>` : isClaimed ? '<p style="color:var(--success);text-align:center;">✓ Claimed</p>' : ''}
            </div>
        `;
    }).join('');
}

async function claimMilestone(referrals) {
    const milestone = userData.referralMilestones?.find(x => x.referrals === referrals);
    if (!milestone || milestone.claimed) return;
    if (userData.inviteCount < referrals) {
        showToast(`Need ${referrals} referrals`, 'error');
        return;
    }
    const reward = REFERRAL_MILESTONES.find(x => x.referrals === referrals).reward;
    userData.balances.USDT = (userData.balances.USDT || 0) + reward;
    userData.totalUsdtEarned = (userData.totalUsdtEarned || 0) + reward;
    milestone.claimed = true;
    saveUserData();
    renderAirdrop();
    renderWallet();
    updateTotalBalance();
    showToast(`Claimed ${reward} USDT!`, 'success');
}

function copyInviteLink() {
    copyToClipboard(`${BOT_LINK}?startapp=${userId}`);
}

function shareInvite() {
    const text = `🚀 Join Trust Wallet Lite and get ${AIRDROP_BONUS} USDT Airdrop! Use my link: ${BOT_LINK}?startapp=${userId}`;
    if (tg?.shareToStory) tg.shareToStory(text);
    else copyToClipboard(text);
}

function renderTWTPay() {
    const container = document.getElementById('twtpayContainer');
    if (!container) return;
    const twtBalance = userData?.balances?.TWT || 0;
    const cardNumber = userId?.slice(-4) || '8888';
    container.innerHTML = `
        <div class="virtual-card">
            <div class="card-chip"><i class="fas fa-microchip"></i></div>
            <div class="card-brand">TWT Pay</div>
            <div class="card-number"><span>****</span><span>****</span><span>****</span><span>${cardNumber}</span></div>
            <div class="card-details"><div><div class="label">Card Holder</div><div class="value">${userData?.userName || 'User'}</div></div><div><div class="label">Expires</div><div class="value">12/28</div></div></div>
            <div class="card-balance"><div class="balance-label">Card Balance</div><div class="balance-value">${twtBalance} TWT</div><div class="balance-usd">≈ $${(twtBalance * TWT_PRICE).toFixed(2)}</div></div>
            <div class="card-footer"><i class="fab fa-visa"></i><span>Virtual Card</span></div>
        </div>
    `;
}

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="settings-list">
            <div class="settings-item" onclick="showNotifications()"><i class="fas fa-bell"></i><div><div class="label">${t('notifications.title')}</div><div class="desc">View all notifications</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="showHistory()"><i class="fas fa-history"></i><div><div class="label">${t('actions.history')}</div><div class="desc">View all transactions</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleLanguage()"><i class="fas fa-language"></i><div><div class="label">${t('settings.language')}</div><div class="desc">${currentLanguage === 'en' ? 'English / العربية' : 'العربية / English'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item" onclick="toggleTheme()"><i class="fas fa-moon"></i><div><div class="label">${t('settings.theme')}</div><div class="desc">${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div></div><i class="fas fa-chevron-right"></i></div>
            <div class="settings-item logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i><div><div class="label">${t('settings.logout')}</div><div class="desc">Sign out of your wallet</div></div></div>
        </div>
    `;
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    if (!modal || !list) return;
    const txs = userData?.transactions || [];
    if (txs.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-clock"></i><p>No transactions yet</p></div>';
    } else {
        list.innerHTML = txs.map(tx => `
            <div class="history-item">
                <div><span>${tx.type}</span> <span>${tx.amount} ${tx.currency}</span></div>
                <div style="font-size:10px;">${new Date(tx.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    modal.classList.add('show');
}

function showNotifications() {
    const modal = document.getElementById('notificationsModal');
    const list = document.getElementById('notificationsList');
    if (!modal || !list || !userData) return;
    
    const notifications = userData.notifications || [];
    
    let controlsHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button onclick="clearReadNotifications()" class="clear-read-btn">${t('notifications.clear_read')}</button>
            <button onclick="clearAllNotifications()" class="clear-all-btn">${t('notifications.clear_all')}</button>
        </div>
    `;
    
    if (notifications.length === 0) {
        list.innerHTML = controlsHTML + '<div class="empty-state">' + t('notifications.no_notifications') + '</div>';
    } else {
        list.innerHTML = controlsHTML + notifications.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead('${n.id}')">
                <div class="notification-header">
                    <span class="notification-title"><i class="fa-regular fa-bell"></i> Notification</span>
                    <span class="notification-time">${new Date(n.timestamp).toLocaleString()}</span>
                </div>
                <div class="notification-message">${n.message}</div>
            </div>
        `).join('');
    }
    
    modal.classList.add('show');
}

function markNotificationRead(id) {
    const n = userData.notifications?.find(n => n.id === id);
    if (n && !n.read) {
        n.read = true;
        saveUserData();
        showNotifications();
        updateNotificationBadge();
    }
}

function clearReadNotifications() {
    if (!userData.notifications) return;
    userData.notifications = userData.notifications.filter(n => !n.read);
    saveUserData();
    showNotifications();
    updateNotificationBadge();
    showToast('Cleared read notifications', 'success');
}

function clearAllNotifications() {
    userData.notifications = [];
    saveUserData();
    showNotifications();
    updateNotificationBadge();
    showToast('All notifications cleared', 'success');
}

function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    if (badge && userData) {
        const unread = userData.notifications?.filter(n => !n.read).length || 0;
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        location.reload();
    }
}

function showAssetDetails(symbol) {
    const balance = userData?.balances[symbol] || 0;
    const price = livePrices[symbol]?.price || (symbol === 'TWT' ? TWT_PRICE : 0);
    const value = symbol === 'USDT' ? balance : balance * price;
    showToast(`${symbol}: ${formatBalance(balance, symbol)} ($${formatNumber(value)})`, 'info');
}

// ====== 10. MODAL FUNCTIONS ======
function showDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function showWithdrawModal() { document.getElementById('withdrawModal').classList.add('show'); }
function showSendModal() { document.getElementById('sendModal').classList.add('show'); }
function showReceiveModal() { document.getElementById('receiveModal').classList.add('show'); }
function showSwapModal() { showToast('Coming soon!'); }

// ====== 11. NAVIGATION ======
let currentPage = 'wallet';
let currentTheme = localStorage.getItem('theme') || 'light';

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function showWallet() { 
    currentPage = 'wallet'; 
    document.getElementById('walletSection').classList.remove('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="wallet"]').classList.add('active');
    
    renderAssets();
    updateTotalBalance();
}

function showAirdrop() { 
    currentPage = 'airdrop'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.remove('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="referral"]').classList.add('active');
    
    renderAirdrop();
}

function showTWTPay() { 
    currentPage = 'twtpay'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.remove('hidden');
    document.getElementById('settingsSection').classList.add('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="twtpay"]').classList.add('active');
    
    renderTWTPay();
}

function showSettings() { 
    currentPage = 'settings'; 
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('referralSection').classList.add('hidden');
    document.getElementById('twtpaySection').classList.add('hidden');
    document.getElementById('settingsSection').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="settings"]').classList.add('active');
    
    renderSettings();
}

// ====== 12. ADMIN PANEL ======
function showAdminPanel() {
    if (!isAdmin) { showToast('Access denied', 'error'); return; }
    alert('Admin Panel - Coming Soon');
}

// ====== 13. LOAD USER DATA (مثل REFI) ======
async function loadUserData() {
    try {
        console.log("📂 Loading user data for:", userId);
        
        const localData = localStorage.getItem(`user_${userId}`);
        if (localData) {
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
        
        if (!userData) {
            console.log("📝 Creating new user");
            userData = {
                userId: userId,
                userName: userName,
                balances: { TWT: 1000, USDT: AIRDROP_BONUS, BNB: 0, BTC: 0, ETH: 0, SOL: 0, TRX: 0, ADA: 0, DOGE: 0, SHIB: 0, PEPE: 0, TON: 0 },
                inviteCount: 0,
                invitedBy: null,
                totalUsdtEarned: AIRDROP_BONUS,
                referralMilestones: REFERRAL_MILESTONES.map(m => ({ ...m, claimed: false })),
                notifications: [{ id: Date.now().toString(), message: '🎉 Welcome! +10 USDT', read: false, timestamp: new Date().toISOString() }],
                transactions: [{ type: 'airdrop', amount: AIRDROP_BONUS, currency: 'USDT', timestamp: new Date().toISOString() }],
                withdrawBlocked: false,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
        }
        
        updateUI();
        updateNotificationBadge();
        checkAdminAndAddCrown();
        
        if (hasReferralCode()) {
            await processReferral();
        }
        
        // إخفاء شاشة البداية
        const onboarding = document.getElementById('onboardingScreen');
        const mainContent = document.getElementById('mainContent');
        if (onboarding) onboarding.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        
    } catch (error) {
        console.error("❌ Error loading user data:", error);
    }
}

function saveUserData() {
    if (userData) {
        localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    }
}

function updateUI() {
    if (currentPage === 'wallet') {
        renderAssets();
        updateTotalBalance();
    }
    if (currentPage === 'airdrop') renderAirdrop();
    if (currentPage === 'settings') renderSettings();
    
    const userNameEl = document.getElementById('userName');
    if (userNameEl && userData) {
        userNameEl.textContent = userData.userName || userName;
    }
    const userIdEl = document.getElementById('userIdDisplay');
    if (userIdEl && userData) {
        userIdEl.textContent = `ID: ${userData.userId?.slice(-8)}`;
    }
    const userAvatarEl = document.getElementById('userAvatar');
    if (userAvatarEl && userData) {
        userAvatarEl.textContent = (userData.userName || userName).charAt(0).toUpperCase();
    }
}

async function processReferral() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let referralCode = urlParams.get('start') || urlParams.get('ref');
        
        if (!referralCode && tg?.initDataUnsafe?.start_param) {
            referralCode = tg.initDataUnsafe.start_param;
        }
        
        if (!referralCode || referralCode === userId || userData.invitedBy) return;
        
        console.log("🎯 Processing referral code:", referralCode);
        
        userData.invitedBy = referralCode;
        userData.balances.USDT = (userData.balances.USDT || 0) + REFERRAL_BONUS;
        userData.totalUsdtEarned = (userData.totalUsdtEarned || 0) + REFERRAL_BONUS;
        
        saveUserData();
        updateUI();
        
        showToast(`🎉 +${REFERRAL_BONUS} USDT from referral!`, 'success');
        
    } catch (error) {
        console.error("❌ Error processing referral:", error);
    }
}

// ====== 14. RENDER WALLET ======
function renderWallet() {
    const container = document.getElementById('walletContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="balance-card">
            <div class="total-balance" id="totalBalance">$0</div>
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
    updateTotalBalance();
}

// ====== 15. INITIALIZATION (مثل REFI) ======
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Initializing Trust Wallet Lite...");
    
    initTheme();
    updateAllTexts();
    
    // أزرار التنقل
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'wallet') showWallet();
            else if (tab === 'referral') showAirdrop();
            else if (tab === 'twtpay') showTWTPay();
            else if (tab === 'settings') showSettings();
        });
    });
    
    await fetchLivePrices();
    await loadUserData();
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('hidden');
        document.getElementById('mainContent').style.display = 'block';
    }, 1500);
    
    console.log("✅ Trust Wallet Lite initialized!");
    console.log("📱 User ID:", userId);
    console.log("👑 Is Admin:", isAdmin);
});

// ====== 16. EXPOSE GLOBALS ======
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
window.copyInviteLink = copyInviteLink;
window.shareInvite = shareInvite;
window.claimMilestone = claimMilestone;
window.showAssetDetails = showAssetDetails;
window.markNotificationRead = markNotificationRead;
window.clearReadNotifications = clearReadNotifications;
window.clearAllNotifications = clearAllNotifications;

console.log("✅ Trust Wallet Lite - REFI STYLE - READY!");
