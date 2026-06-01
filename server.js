const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// 1. 🔐 LOAD ENVIRONMENT VARIABLES & SECRETS
// ============================================================================

let serviceAccount = null;
let firebaseWebConfig = {};
let ADMIN_ID = null;
let ADMIN_PASSWORD = null;
let BOT_TOKEN = null;
let WITHDRAWAL_GROUP_ID = null;
let OWNER_WALLET = null;
let APP_URL = null;
let BOT_USERNAME = null;

// Load Firebase Admin Key
try {
    const firebasePath = '/etc/secrets/firebase-admin-key.json';
    if (fs.existsSync(firebasePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(firebasePath, 'utf8'));
        console.log('✅ Firebase Admin key loaded');
    }
} catch (error) {
    console.error('❌ Firebase Admin key error:', error.message);
}

// Load Firebase Web Config
try {
    const configPath = '/etc/secrets/firebase-web-config.json';
    if (fs.existsSync(configPath)) {
        firebaseWebConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('✅ Firebase Web config loaded');
    }
} catch (error) {
    console.error('❌ Firebase Web config error:', error.message);
}

// Load Admin Config
try {
    const adminPath = '/etc/secrets/admin-config.json';
    if (fs.existsSync(adminPath)) {
        const adminConfig = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
        ADMIN_ID = adminConfig.admin_id;
        ADMIN_PASSWORD = adminConfig.admin_password;
        console.log('✅ Admin config loaded | ID:', ADMIN_ID);
    }
} catch (error) {
    console.error('❌ Admin config error:', error.message);
}

// Environment Variables
BOT_TOKEN = process.env.BOT_TOKEN;
WITHDRAWAL_GROUP_ID = process.env.WITHDRAWAL_GROUP_ID;
OWNER_WALLET = process.env.OWNER_WALLET;
APP_URL = process.env.APP_URL;

// ============================================================================
// 2. ⚙️ APPLICATION CONFIGURATION
// ============================================================================

const APP_CONFIG = {
    welcomeBonus: 7.5,
    referralBonus: 5,
    minWithdrawUSDT: 50,
    maxWithdrawUSDT: 5000,
    sessionTTL: 3600000,
    adminSessionTTL: 86400000,
    syncInterval: 3600000,
    cacheTTL: 3600000,
    rateLimitWindow: 60000,
    rateLimitMax: 30,
    sessionCleanupInterval: 3600000
};

// Required Channels
const REQUIRED_CHANNELS = [
    { name: 'Daily Airdrop X', username: '@Daily_AirdropX' },
    { name: 'Airdrop Master VIP', username: '@Airdrop_MasterVIP' },
    { name: 'Realfinance REFI', username: '@Realfinance_REFI' }
];

// Social Links
const SOCIAL_LINKS = [
    { name: '📢 Daily Airdrop X', url: 'https://t.me/Daily_AirdropX', type: 'telegram' },
    { name: '📢 Airdrop Master VIP', url: 'https://t.me/Airdrop_MasterVIP', type: 'telegram' },
    { name: '📢 Realfinance REFI', url: 'https://t.me/Realfinance_REFI', type: 'telegram' },
    { name: '🐦 Twitter (X)', url: 'https://twitter.com/Daily_AirdropX', type: 'twitter' }
];

// ============================================================================
// 3. 🎨 PROFESSIONAL FORMATTING (HTML ONLY)
// ============================================================================

const DIVIDER = '═'.repeat(35);
const STAR_DIVIDER = '✧' + '═'.repeat(33) + '✧';
const MINI_DIVIDER = '•' + '─'.repeat(10) + '✧' + '─'.repeat(10) + '•';
const BOTTOM_DIVIDER = '✧' + '═'.repeat(33) + '✧';

function formatProfessionalMessage(title, content, footer = '') {
    return `
${STAR_DIVIDER}
✨ <b>${title}</b> ✨
${MINI_DIVIDER}

${content}

${footer ? footer + '\n' : ''}${BOTTOM_DIVIDER}`;
}

function formatUSD(amount) {
    return `$${amount.toFixed(2)} USDT`;
}

function formatTransactionHistory(transactions) {
    if (!transactions || transactions.length === 0) {
        return '📭 No transactions yet.';
    }
    
    let history = '';
    for (let i = 0; i < Math.min(transactions.length, 20); i++) {
        const tx = transactions[i];
        const date = new Date(tx.timestamp).toLocaleString();
        
        let statusDisplay = '';
        if (tx.status === 'approved') {
            statusDisplay = '✅ Approved';
        } else if (tx.status === 'pending') {
            statusDisplay = '⏳ Pending';
        } else if (tx.status === 'rejected') {
            statusDisplay = '❌ Rejected';
        } else if (tx.status === 'processing') {
            statusDisplay = '📤 Processing';
        } else {
            statusDisplay = tx.status || 'Unknown';
        }
        
        history += `
📌 <b>${tx.type.toUpperCase()}</b>
   Amount: ${formatUSD(tx.amount)}
   Status: ${statusDisplay}
   ${tx.status === 'rejected' ? `Reason: ${tx.reason || 'N/A'}\n` : ''}
   📅 ${date}
${MINI_DIVIDER}`;
    }
    return history;
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isValidBEP20(address) {
    return /^0x[a-fA-F0-9]{40}$/i.test(address);
}

function isAdmin(userId) {
    return userId === ADMIN_ID;
}

// ============================================================================
// 4. 🛡️ RATE LIMITING SYSTEM
// ============================================================================

class RateLimiter {
    constructor(windowMs = 60000, maxRequests = 30) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.requests = new Map();
    }

    isRateLimited(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return true;
        }
        
        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return false;
    }

    getRemainingRequests(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
        return Math.max(0, this.maxRequests - validRequests.length);
    }

    cleanup() {
        const now = Date.now();
        for (const [userId, timestamps] of this.requests.entries()) {
            const valid = timestamps.filter(t => now - t < this.windowMs);
            if (valid.length === 0) {
                this.requests.delete(userId);
            } else {
                this.requests.set(userId, valid);
            }
        }
    }
}

const rateLimiter = new RateLimiter(APP_CONFIG.rateLimitWindow, APP_CONFIG.rateLimitMax);
setInterval(() => rateLimiter.cleanup(), 3600000);

// ============================================================================
// 5. 💾 ADVANCED CACHE SYSTEM WITH PERIODIC SYNC
// ============================================================================

class UserCache {
    constructor() {
        this.cache = new Map();
        this.dirtyUsers = new Set();
        this.isShuttingDown = false;
        this.isWarmingUp = false;
    }

    async warmup(db, limit = 100) {
        if (!db || this.isWarmingUp) return;
        this.isWarmingUp = true;
        console.log('🔥 Warming up cache...');
        
        try {
            const snapshot = await db.collection('users').limit(limit).get();
            let loaded = 0;
            snapshot.forEach(doc => {
                this.cache.set(doc.id, { ...doc.data(), lastAccess: Date.now(), cachedAt: Date.now() });
                loaded++;
            });
            console.log(`✅ Cache warmed up with ${loaded} users`);
        } catch (error) {
            console.error('Cache warmup error:', error.message);
        } finally {
            this.isWarmingUp = false;
        }
    }

    get(userId) {
        const user = this.cache.get(userId);
        if (user) {
            user.lastAccess = Date.now();
            return { ...user };
        }
        return null;
    }

    set(userId, userData) {
        const user = { ...userData, lastAccess: Date.now(), cachedAt: Date.now() };
        this.cache.set(userId, user);
        return user;
    }

    update(userId, updates) {
        const existing = this.cache.get(userId);
        if (existing) {
            const updated = { ...existing, ...updates, lastAccess: Date.now() };
            this.cache.set(userId, updated);
            this.dirtyUsers.add(userId);
            return updated;
        }
        return null;
    }

    async updateImmediate(userId, updates, db) {
        const updated = this.update(userId, updates);
        if (updated && db) {
            try {
                await db.collection('users').doc(userId).update(updates);
                this.dirtyUsers.delete(userId);
                console.log(`⚡ Immediate sync: ${userId}`);
            } catch (error) {
                console.error(`Immediate sync failed:`, error.message);
            }
        }
        return updated;
    }

    async syncAllToFirebase(db) {
        if (!db) return;
        const dirtyArray = Array.from(this.dirtyUsers);
        if (dirtyArray.length === 0) return;
        
        console.log(`🔄 Periodic sync: Saving ${dirtyArray.length} dirty users to Firebase...`);
        let success = 0;
        
        for (const userId of dirtyArray) {
            const user = this.cache.get(userId);
            if (user) {
                try {
                    const { lastAccess, cachedAt, ...userToSave } = user;
                    await db.collection('users').doc(userId).set(userToSave, { merge: true });
                    success++;
                } catch (error) {
                    console.error(`Failed to sync ${userId}:`, error.message);
                }
            }
        }
        
        this.dirtyUsers.clear();
        console.log(`✅ Periodic sync complete: ${success} users updated`);
    }

    getStats() {
        return { cacheSize: this.cache.size, dirtyCount: this.dirtyUsers.size };
    }
}

const userCache = new UserCache();

// ============================================================================
// 6. 🔥 FIREBASE SETUP
// ============================================================================

const admin = require('firebase-admin');
let db = null;

if (serviceAccount) {
    try {
        if (admin.apps.length === 0) {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        }
        db = admin.firestore();
        console.log('🔥 Firebase initialized');
        
        setTimeout(() => userCache.warmup(db, 500), 5000);
        
        setInterval(async () => {
            await userCache.syncAllToFirebase(db);
        }, APP_CONFIG.syncInterval);
        
    } catch (error) {
        console.error('❌ Firebase init error:', error.message);
    }
}

function checkDb() {
    return db !== null;
}

// ============================================================================
// 7. 📊 USER MANAGEMENT WITH CACHE
// ============================================================================

async function getUser(userId) {
    let user = userCache.get(userId);
    if (user) return user;
    
    if (!checkDb()) return null;
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return userCache.set(userId, userData);
        }
        return null;
    } catch (error) {
        console.error('Get user error:', error.message);
        return null;
    }
}

async function getOrCreateUser(userId, userName, username) {
    let user = userCache.get(userId);
    if (user) return user;
    
    if (!checkDb()) return null;
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            return userCache.set(userId, userDoc.data());
        }
        
        const newUser = {
            userId,
            userName: userName || 'User',
            userUsername: username || '',
            balance: 0,
            totalEarned: 0,
            inviteCount: 0,
            referredBy: null,
            referral_clicks: 0,
            referrals: [],
            walletAddress: null,
            isVerified: false,
            verifiedAt: null,
            transactions: [],
            withdrawals: [],
            createdAt: new Date().toISOString(),
            notifications: [{
                id: Date.now().toString(),
                type: 'welcome',
                title: '🎉 Welcome to Daily Airdrop!',
                message: `Complete verification to get ${APP_CONFIG.welcomeBonus} USDT bonus!`,
                read: false,
                timestamp: new Date().toISOString()
            }]
        };
        
        await userRef.set(newUser);
        console.log(`✅ New user created: ${userId} (${userName})`);
        return userCache.set(userId, newUser);
        
    } catch (error) {
        console.error('Create user error:', error.message);
        return null;
    }
}

async function updateUser(userId, updates, immediate = false) {
    if (immediate) {
        return await userCache.updateImmediate(userId, updates, db);
    }
    return userCache.update(userId, updates);
}

async function addTransaction(userId, transaction, immediate = false) {
    const user = await getUser(userId);
    if (!user) return;
    
    const transactions = user.transactions || [];
    transactions.unshift({
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 8),
        ...transaction,
        timestamp: new Date().toISOString()
    });
    
    const limited = transactions.slice(0, 100);
    await updateUser(userId, { transactions: limited }, immediate);
}

// ============================================================================
// 8. 🔍 CHANNEL VERIFICATION
// ============================================================================

const channelStatusCache = new Map();

async function verifyChannelMembership(userId, channelUsername, forceRefresh = false) {
    const cacheKey = `${userId}_${channelUsername}`;
    
    if (!forceRefresh) {
        const cached = channelStatusCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < 30000) {
            return cached.isMember;
        }
    }
    
    try {
        const cleanChannel = channelUsername.replace('@', '').trim();
        const chatMember = await bot.telegram.getChatMember(`@${cleanChannel}`, parseInt(userId));
        const isMember = ['member', 'administrator', 'creator'].includes(chatMember.status);
        
        channelStatusCache.set(cacheKey, { isMember, timestamp: Date.now() });
        return isMember;
        
    } catch (error) {
        console.log(`⚠️ Channel check failed for ${channelUsername}:`, error.code);
        return false;
    }
}

async function getMissingChannels(userId, forceRefresh = false) {
    const results = await Promise.all(REQUIRED_CHANNELS.map(async (channel) => ({
        channel,
        isMember: await verifyChannelMembership(userId, channel.username, forceRefresh)
    })));
    return results.filter(r => !r.isMember).map(r => r.channel);
}

async function isUserVerifiedInChannels(userId) {
    const missing = await getMissingChannels(userId, true);
    return missing.length === 0;
}

// ============================================================================
// 9. 🔗 REFERRAL SYSTEM
// ============================================================================

async function processReferralAfterVerification(referrerId, newUserId, newUserName) {
    if (!checkDb()) return false;
    if (referrerId === newUserId) return false;

    try {
        console.log(`🎁 PROCESSING REFERRAL: ${referrerId} → ${newUserId}`);

        const referrer = await getUser(referrerId);
        if (!referrer) {
            console.log(`❌ Referral failed: Referrer ${referrerId} not found`);
            return false;
        }

        const currentReferrals = referrer.referrals || [];
        if (currentReferrals.includes(newUserId)) {
            console.log(`❌ Duplicate referral blocked: ${referrerId} → ${newUserId}`);
            return false;
        }

        const newInviteCount = (referrer.inviteCount || 0) + 1;

        await updateUser(referrerId, {
            referrals: [...currentReferrals, newUserId],
            inviteCount: newInviteCount,
            balance: (referrer.balance || 0) + APP_CONFIG.referralBonus,
            totalEarned: (referrer.totalEarned || 0) + APP_CONFIG.referralBonus,
            lastReferralAt: new Date().toISOString()
        }, false);
        
        await addTransaction(referrerId, {
            type: 'referral',
            amount: APP_CONFIG.referralBonus,
            currency: 'USDT',
            status: 'completed',
            description: `Referral bonus for ${newUserName}`
        }, false);

        console.log(`✅ REFERRAL BONUS PAID: ${referrerId} +${APP_CONFIG.referralBonus} USDT (User ${newUserId})`);

        const message = formatProfessionalMessage(
            '🎉 NEW REFERRAL!',
            `👤 <b>${escapeHtml(newUserName)}</b> joined and verified!\n\n💰 <b>+${APP_CONFIG.referralBonus} USDT</b>\n\n👥 <b>Total Referrals:</b> ${newInviteCount}`,
            `💡 Keep inviting to earn more!`
        );
        
        await bot.telegram.sendMessage(referrerId, message, { parse_mode: 'HTML' }).catch(() => {});
        
        return true;
        
    } catch (error) {
        console.error(`❌ CRITICAL REFERRAL ERROR ${referrerId} → ${newUserId}:`, error.message);
        return false;
    }
}

// ============================================================================
// 10. 💸 WITHDRAWAL SYSTEM (AUTO-APPROVED, NO COOLDOWN)
// ============================================================================

async function createWithdrawalRequest(userId, amount, walletAddress) {
    if (!checkDb()) return { success: false, error: 'Database error' };

    try {
        const user = await getUser(userId);
        if (!user) return { success: false, error: 'User not found' };

        if (amount < APP_CONFIG.minWithdrawUSDT) {
            return { success: false, error: `📌 Minimum withdrawal is ${formatUSD(APP_CONFIG.minWithdrawUSDT)}` };
        }
        
        if (amount > APP_CONFIG.maxWithdrawUSDT) {
            return { success: false, error: `📌 Maximum withdrawal is ${formatUSD(APP_CONFIG.maxWithdrawUSDT)}` };
        }
        
        if (amount > (user.balance || 0)) {
            return { success: false, error: `💡 Your balance is ${formatUSD(user.balance || 0)}. Invite friends to earn more!` };
        }

        // Deduct balance
        await updateUser(userId, { balance: (user.balance || 0) - amount }, false);

        const withdrawalRef = db.collection('withdrawals').doc();
        const requestId = withdrawalRef.id;
        
        const approvedAt = new Date().toISOString();

        await withdrawalRef.set({
            id: requestId,
            userId,
            userName: user.userName,
            amount,
            currency: 'USDT',
            walletAddress,
            status: 'approved',
            approvedAt: approvedAt,
            autoApproved: true,
            createdAt: new Date().toISOString()
        });

        await addTransaction(userId, {
            type: 'withdrawal',
            amount: amount,
            currency: 'USDT',
            status: 'approved',
            approvedAt: approvedAt,
            description: `Withdrawal to ${walletAddress.substring(0, 10)}...`
        }, false);

        const userWithdrawals = user.withdrawals || [];
        userWithdrawals.push({ 
            id: requestId, 
            amount, 
            currency: 'USDT', 
            status: 'approved', 
            approvedAt: approvedAt,
            createdAt: new Date().toISOString() 
        });
        await updateUser(userId, { withdrawals: userWithdrawals }, false);

        // Send notification to admin group
        if (WITHDRAWAL_GROUP_ID) {
            const referralCount = user.inviteCount || 0;
            
            const message = formatProfessionalMessage(
                '💸 NEW WITHDRAWAL REQUEST (AUTO-APPROVED)',
                `👤 <b>User:</b> ${escapeHtml(user.userName)}\n🆔 <b>ID:</b> ${userId}\n👥 <b>Referrals:</b> ${referralCount}\n💰 <b>Amount:</b> ${formatUSD(amount)}\n💳 <b>Wallet:</b> <code>${walletAddress}</code>\n🆔 <b>Request ID:</b> <code>${requestId}</code>\n\n✅ <b>Status:</b> Auto-approved - Ready for manual transfer`,
                `📌 Admin: Please verify user and send funds manually to the address above.`
            );
            await bot.telegram.sendMessage(WITHDRAWAL_GROUP_ID, message, { parse_mode: 'HTML' }).catch(() => {});
        }

        return { success: true, requestId };
        
    } catch (error) {
        console.error('Withdrawal error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// 11. 🎨 KEYBOARDS
// ============================================================================

function getMainKeyboard(userId) {
    const keyboard = [
        ['💰 BALANCE', '🔗 REFERRAL'],
        ['💸 WITHDRAW', '📜 HISTORY'],
        ['⚙️ SETTINGS']
    ];
    if (isAdmin(userId)) keyboard.push(['👑 ADMIN PANEL']);
    return { keyboard, resize_keyboard: true, persistent: true };
}

function getChannelsKeyboard() {
    const keyboard = [];
    for (const channel of REQUIRED_CHANNELS) {
        keyboard.push([{ text: `📢 ${channel.name}`, url: `https://t.me/${channel.username.substring(1)}` }]);
    }
    keyboard.push([{ text: '✅ VERIFY MEMBERSHIP', callback_data: 'verify_membership' }]);
    return { inline_keyboard: keyboard };
}

function getSocialKeyboard() {
    const keyboard = [];
    for (const social of SOCIAL_LINKS) {
        keyboard.push([{ text: social.name, url: social.url }]);
    }
    keyboard.push([{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]);
    return { inline_keyboard: keyboard };
}

function getWithdrawAmountKeyboard(balance) {
    const suggestions = [
        { text: `${APP_CONFIG.minWithdrawUSDT} USDT (Min)`, callback_data: `withdraw_amount_${APP_CONFIG.minWithdrawUSDT}` },
        { text: `${Math.floor(balance / 4)} USDT (25%)`, callback_data: `withdraw_amount_${Math.floor(balance / 4)}` },
        { text: `${Math.floor(balance / 2)} USDT (50%)`, callback_data: `withdraw_amount_${Math.floor(balance / 2)}` },
        { text: `${balance} USDT (100%)`, callback_data: `withdraw_amount_${balance}` }
    ];
    return {
        inline_keyboard: [
            suggestions.slice(0, 2),
            suggestions.slice(2, 4),
            [{ text: '✏️ ENTER CUSTOM AMOUNT', callback_data: 'withdraw_custom_amount' }],
            [{ text: '🔙 BACK', callback_data: 'back_to_withdraw' }]
        ]
    };
}

function getAdminKeyboard() {
    const keyboard = {
        inline_keyboard: [
            [{ text: '📊 STATISTICS', callback_data: 'admin_stats' }],
            [{ text: '👥 TOTAL USERS', callback_data: 'admin_users' }],
            [{ text: '💰 ADD BALANCE', callback_data: 'admin_add_balance' }],
            [{ text: '➖ REMOVE BALANCE', callback_data: 'admin_remove_balance' }],
            [{ text: '📢 BROADCAST', callback_data: 'admin_broadcast' }],
            [{ text: '🔄 SYNC CACHE', callback_data: 'admin_sync_cache' }],
            [{ text: '🚪 LOGOUT', callback_data: 'admin_logout' }]
        ]
    };
    return keyboard;
}

function getCancelKeyboard() {
    return {
        inline_keyboard: [
            [{ text: '❌ CANCEL', callback_data: 'cancel_action' }],
            [{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]
        ]
    };
}

const userLastMessages = new Map();

async function sendAndTrack(ctx, message, keyboard = null) {
    if (rateLimiter.isRateLimited(ctx.from.id.toString())) {
        const remaining = rateLimiter.getRemainingRequests(ctx.from.id.toString());
        await ctx.reply(`⚠️ <b>Rate limit exceeded!</b>\n\nPlease slow down. You have ${remaining} requests remaining this minute.`, { parse_mode: 'HTML' });
        return null;
    }
    
    try {
        const lastMsg = userLastMessages.get(ctx.from.id);
        if (lastMsg?.id) {
            try { await ctx.telegram.deleteMessage(ctx.chat.id, lastMsg.id); } catch (e) {}
        }
        const opts = { parse_mode: 'HTML', disable_web_page_preview: true };
        if (keyboard) opts.reply_markup = keyboard;
        const sentMsg = await ctx.reply(message, opts);
        userLastMessages.set(ctx.from.id, { id: sentMsg.message_id, timestamp: Date.now() });
        return sentMsg;
    } catch (error) {
        return await ctx.reply(message, { parse_mode: 'HTML' });
    }
}

// ============================================================================
// 12. 🤖 MAIN BOT COMMANDS & HANDLERS
// ============================================================================

const bot = new Telegraf(BOT_TOKEN);

// Prevent bot from working in groups
bot.use((ctx, next) => {
    if (ctx.chat?.type === 'private' || ctx.callbackQuery) {
        return next();
    }
    return;
});

bot.telegram.deleteWebhook({ drop_pending_updates: true }).catch(() => {});
bot.telegram.getMe().then((botInfo) => { BOT_USERNAME = botInfo.username; console.log(`🤖 Bot: @${BOT_USERNAME}`); }).catch(() => {});

// ==================== START COMMAND ====================
bot.start(async (ctx) => {
    const refCode = ctx.startPayload;
    const userId = ctx.from.id.toString();
    const userName = ctx.from.first_name || 'User';
    const userUsername = ctx.from.username || '';

    if (!checkDb()) {
        await ctx.reply('⚠️ Database unavailable. Please try again later.');
        return;
    }

    let user = await getOrCreateUser(userId, userName, userUsername);
    if (!user) return;

    if (refCode && refCode !== userId && !user.referredBy) {
        console.log(`🔗 REFERRAL CLICK: ${userId} ← ${refCode}`);
        
        await updateUser(userId, { referredBy: refCode }, true);
        
        const referrer = await getUser(refCode);
        if (referrer) {
            const newClicks = (referrer.referral_clicks || 0) + 1;
            await updateUser(refCode, { referral_clicks: newClicks }, false);
            
            const notifyMsg = formatProfessionalMessage(
                '👀 NEW REFERRAL CLICK!',
                `Someone used your referral link.\n\nThey will earn you ${APP_CONFIG.referralBonus} USDT after verification.`,
                `Total clicks: ${newClicks}`
            );
            await bot.telegram.sendMessage(refCode, notifyMsg, { parse_mode: 'HTML' }).catch(() => {});
            console.log(`✅ REFERRAL CLICK NOTIFIED: ${refCode} (Total: ${newClicks})`);
        }
        
        user = await getUser(userId);
    }

    const isVerified = await isUserVerifiedInChannels(userId);
    
    if (isVerified && !user.isVerified) {
        await updateUser(userId, { isVerified: true, verifiedAt: new Date().toISOString() }, true);
        
        if (user.balance === 0) {
            await updateUser(userId, { balance: APP_CONFIG.welcomeBonus, totalEarned: APP_CONFIG.welcomeBonus }, true);
            await addTransaction(userId, {
                type: 'welcome_bonus',
                amount: APP_CONFIG.welcomeBonus,
                currency: 'USDT',
                status: 'completed',
                description: 'Welcome bonus for joining Daily Airdrop'
            }, true);
            
            if (user.referredBy) {
                await processReferralAfterVerification(user.referredBy, userId, user.userName);
            }
        }
        
        const updatedUser = await getUser(userId);
        const message = formatProfessionalMessage(
            '✅ VERIFICATION COMPLETE!',
            `Welcome to Daily Airdrop, ${escapeHtml(userName)}!\n\n💰 Balance: ${formatUSD(updatedUser?.balance || 0)}\n👥 Referrals: ${updatedUser?.inviteCount || 0}`,
            `Use the buttons below to manage your account.`
        );
        
        const keyboard = {
            inline_keyboard: [
                [{ text: '💰 BALANCE', callback_data: 'main_balance' }, { text: '🔗 REFERRAL', callback_data: 'main_referral' }],
                [{ text: '💸 WITHDRAW', callback_data: 'main_withdraw' }, { text: '📜 HISTORY', callback_data: 'main_history' }],
                [{ text: '📢 OUR CHANNELS', callback_data: 'social_channels' }]
            ]
        };
        await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
        return;
    }
    
    if (isVerified && user.isVerified) {
        const message = formatProfessionalMessage(
            `✨ Welcome Back, ${escapeHtml(userName)} ✨`,
            `💰 Balance: ${formatUSD(user.balance || 0)}\n👥 Referrals: ${user.inviteCount || 0}`,
            `Select an option below:`
        );
        
        const keyboard = {
            inline_keyboard: [
                [{ text: '💰 BALANCE', callback_data: 'main_balance' }, { text: '🔗 REFERRAL', callback_data: 'main_referral' }],
                [{ text: '💸 WITHDRAW', callback_data: 'main_withdraw' }, { text: '📜 HISTORY', callback_data: 'main_history' }],
                [{ text: '📢 OUR CHANNELS', callback_data: 'social_channels' }]
            ]
        };
        await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
        return;
    }
    
    const message = formatProfessionalMessage(
        '🌟 WELCOME TO DAILY AIRDROP 🌟',
        `🎁 Get ${APP_CONFIG.welcomeBonus} USDT after verification\n👥 Get ${APP_CONFIG.referralBonus} USDT per referral\n💎 Min Withdrawal: ${APP_CONFIG.minWithdrawUSDT} USDT`,
        `Please join our channels below and click VERIFY:`
    );
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '📢 Daily Airdrop X', url: 'https://t.me/Daily_AirdropX' }],
            [{ text: '📢 Airdrop Master VIP', url: 'https://t.me/Airdrop_MasterVIP' }],
            [{ text: '📢 Realfinance REFI', url: 'https://t.me/Realfinance_REFI' }],
            [{ text: '🐦 Twitter (X)', url: 'https://twitter.com/Daily_AirdropX' }],
            [{ text: '✅ VERIFY MEMBERSHIP', callback_data: 'verify_membership' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

// ==================== MAIN MENU CALLBACKS ====================
bot.action('main_balance', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    const user = await getUser(userId);
    if (!user) return;
    
    const message = formatProfessionalMessage(
        '📊 YOUR BALANCE',
        `💰 <b>USDT:</b> ${formatUSD(user.balance || 0)}\n\n👥 <b>Referrals:</b> ${user.inviteCount || 0}\n🎁 <b>Total Earned:</b> ${formatUSD(user.totalEarned || 0)}`,
        `Invite friends to earn more!`
    );
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

bot.action('main_referral', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    const user = await getUser(userId);
    if (!user) return;
    
    const link = `https://t.me/${BOT_USERNAME}?start=${userId}`;
    
    const message = formatProfessionalMessage(
        '🔗 YOUR REFERRAL LINK',
        `<code>${link}</code>\n\n📊 <b>Stats:</b>\n👥 Total Referrals: ${user.inviteCount || 0}\n🎁 Earned: ${formatUSD((user.inviteCount || 0) * APP_CONFIG.referralBonus)}`,
        `Share your link and earn rewards!`
    );
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '📤 SHARE LINK', url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=Join%20Daily%20Airdrop%20and%20earn%20USDT!` }],
            [{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

bot.action('main_history', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    const user = await getUser(userId);
    if (!user) return;
    
    const history = formatTransactionHistory(user.transactions || []);
    
    const message = formatProfessionalMessage(
        '📜 TRANSACTION HISTORY',
        `${history}`,
        `Showing last 20 transactions.`
    );
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

bot.action('main_withdraw', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    const user = await getUser(userId);
    if (!user) return;
    
    const isVerified = await isUserVerifiedInChannels(userId);
    if (!isVerified) {
        const missing = await getMissingChannels(userId);
        let list = '';
        for (const ch of missing) list += `📢 ${ch.name}\n`;
        const message = formatProfessionalMessage(
            '⚠️ VERIFICATION REQUIRED',
            `You are not a member of all required channels.\n\n<b>Missing channels:</b>\n${list}`,
            `Please join all channels and click VERIFY.`
        );
        
        const keyboard = {
            inline_keyboard: [
                [{ text: '✅ VERIFY MEMBERSHIP', callback_data: 'verify_membership' }]
            ]
        };
        await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
        return;
    }
    
    if (!user.isVerified) {
        await updateUser(userId, { isVerified: true, verifiedAt: new Date().toISOString() }, true);
        if (user.balance === 0) {
            await updateUser(userId, { balance: APP_CONFIG.welcomeBonus, totalEarned: APP_CONFIG.welcomeBonus }, true);
            await addTransaction(userId, {
                type: 'welcome_bonus',
                amount: APP_CONFIG.welcomeBonus,
                currency: 'USDT',
                status: 'completed',
                description: 'Welcome bonus'
            }, true);
            if (user.referredBy) {
                await processReferralAfterVerification(user.referredBy, userId, user.userName);
            }
        }
    }
    
    if (!user.walletAddress) {
        const message = formatProfessionalMessage(
            '💳 SETUP WITHDRAWAL WALLET',
            `Please send your BEP20 wallet address to continue.\n\n<i>Example:</i> <code>0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0</code>`,
            `Send your address now:`
        );
        await ctx.reply(message, { parse_mode: 'HTML', reply_markup: getCancelKeyboard() });
        withdrawSessions.set(userId, { step: 'waitingForWallet', createdAt: Date.now() });
        return;
    }
    
    const message = formatProfessionalMessage(
        '💸 WITHDRAWAL',
        `💰 <b>USDT Balance:</b> ${formatUSD(user.balance || 0)}\n💳 <b>Wallet:</b> <code>${user.walletAddress.substring(0, 10)}...${user.walletAddress.substring(38)}</code>`,
        `Enter amount to withdraw:`
    );
    
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: getWithdrawAmountKeyboard(user.balance || 0) });
    withdrawSessions.set(userId, { currency: 'USDT', step: 'waitingForAmount', createdAt: Date.now() });
});

bot.action('social_channels', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    
    const message = formatProfessionalMessage(
        '📢 OUR CHANNELS',
        `Join our communities and follow us on social media!`,
        `Click the buttons below to subscribe.`
    );
    
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: getSocialKeyboard() });
});

// ==================== VERIFY MEMBERSHIP ====================
bot.action('verify_membership', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery('🔍 Checking channels...');
    
    console.log(`🔍 Verifying channels for user ${userId}...`);
    
    const missing = await getMissingChannels(userId, true);
    
    if (missing.length > 0) {
        let list = '';
        const keyboard = { inline_keyboard: [] };
        
        for (const ch of missing) {
            list += `📢 ${ch.name}\n`;
            keyboard.inline_keyboard.push([{ text: `📢 Join ${ch.name}`, url: `https://t.me/${ch.username.substring(1)}` }]);
        }
        keyboard.inline_keyboard.push([{ text: '🔄 TRY AGAIN', callback_data: 'verify_membership' }]);
        keyboard.inline_keyboard.push([{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]);
        
        const message = formatProfessionalMessage(
            '⚠️ VERIFICATION FAILED',
            `You are not a member of:\n\n${list}\n\nPlease join all channels and try again.`,
            `After joining, click TRY AGAIN.`
        );
        await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
        return;
    }
    
    const user = await getUser(userId);
    const wasVerified = user?.isVerified || false;
    
    await updateUser(userId, {
        isVerified: true,
        verifiedAt: new Date().toISOString()
    }, true);
    
    if (!wasVerified && (user?.balance || 0) === 0) {
        await updateUser(userId, {
            balance: APP_CONFIG.welcomeBonus,
            totalEarned: APP_CONFIG.welcomeBonus
        }, true);
        
        await addTransaction(userId, {
            type: 'welcome_bonus',
            amount: APP_CONFIG.welcomeBonus,
            currency: 'USDT',
            status: 'completed',
            description: 'Welcome bonus for joining channels'
        }, true);
        
        if (user?.referredBy) {
            await processReferralAfterVerification(user.referredBy, userId, user.userName);
        }
    }
    
    const updatedUser = await getUser(userId);
    
    const message = formatProfessionalMessage(
        '✅ VERIFICATION SUCCESSFUL!',
        `🎉 Welcome to Daily Airdrop!\n\n💰 <b>Your Balance:</b> ${formatUSD(updatedUser?.balance || 0)}\n👥 <b>Referrals:</b> ${updatedUser?.inviteCount || 0}`,
        `You can now withdraw funds and invite friends!`
    );
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '💰 BALANCE', callback_data: 'main_balance' }, { text: '🔗 REFERRAL', callback_data: 'main_referral' }],
            [{ text: '💸 WITHDRAW', callback_data: 'main_withdraw' }, { text: '📜 HISTORY', callback_data: 'main_history' }],
            [{ text: '📢 OUR CHANNELS', callback_data: 'social_channels' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

// ==================== WITHDRAW AMOUNT SELECTION ====================
const withdrawSessions = new Map();

bot.action(/withdraw_amount_(.+)/, async (ctx) => {
    const userId = ctx.from.id.toString();
    const amount = parseFloat(ctx.match[1]);
    await ctx.answerCbQuery();
    
    const session = withdrawSessions.get(userId);
    if (!session || session.step !== 'waitingForAmount') {
        await ctx.reply('❌ Session expired. Please start over.');
        return;
    }
    
    const user = await getUser(userId);
    const balance = user?.balance || 0;
    
    if (amount < APP_CONFIG.minWithdrawUSDT || amount > APP_CONFIG.maxWithdrawUSDT || amount > balance) {
        await ctx.reply(formatProfessionalMessage('❌ INVALID AMOUNT', `Amount must be between ${APP_CONFIG.minWithdrawUSDT} USDT and ${APP_CONFIG.maxWithdrawUSDT} USDT\nYour balance: ${formatUSD(balance)}`));
        return;
    }
    
    withdrawSessions.set(userId, { ...session, amount, step: 'confirmWithdraw' });
    
    const message = formatProfessionalMessage(
        '✅ CONFIRM WITHDRAWAL',
        `💰 <b>Currency:</b> USDT\n💵 <b>Amount:</b> ${formatUSD(amount)}\n💳 <b>Wallet:</b> <code>${user?.walletAddress?.substring(0, 10)}...${user?.walletAddress?.substring(38)}</code>`,
        `⚠️ Click CONFIRM to submit your request.`
    );
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '✅ CONFIRM WITHDRAWAL', callback_data: 'confirm_withdraw_final' }],
            [{ text: '🔙 BACK', callback_data: 'back_to_withdraw' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

bot.action('withdraw_custom_amount', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    
    const session = withdrawSessions.get(userId);
    if (!session) return;
    
    withdrawSessions.set(userId, { ...session, step: 'waitingForCustomAmount' });
    await ctx.reply(formatProfessionalMessage('✏️ CUSTOM AMOUNT', 'Please send the amount you wish to withdraw as a number.\n\nExample: 100', 'Send a number now:'));
});

bot.action('confirm_withdraw_final', async (ctx) => {
    const userId = ctx.from.id.toString();
    const session = withdrawSessions.get(userId);
    await ctx.answerCbQuery();
    
    if (!session?.amount) {
        await ctx.reply('❌ Session expired. Please start over.');
        return;
    }
    
    const user = await getUser(userId);
    if (!user) return;
    
    const isVerified = await isUserVerifiedInChannels(userId);
    if (!isVerified) {
        await ctx.reply('⚠️ You left one or more required channels. Please re-verify.');
        return;
    }
    
    const result = await createWithdrawalRequest(userId, session.amount, user.walletAddress);
    
    if (result.success) {
        const message = formatProfessionalMessage(
            '✅ WITHDRAWAL SUBMITTED!',
            `💰 Amount: ${formatUSD(session.amount)}\n⏳ <b>Processing Time:</b> 1-12 hours\n🆔 <b>Request ID:</b> <code>${result.requestId}</code>\n\n<b>ℹ️ Your withdrawal has been auto-approved.</b>\nAn admin will review and send funds to your wallet.`,
            `Thank you for trusting Daily Airdrop!`
        );
        await ctx.reply(message, { parse_mode: 'HTML' });
    } else {
        await ctx.reply(formatProfessionalMessage('❌ WITHDRAWAL FAILED', result.error));
    }
    
    withdrawSessions.delete(userId);
});

bot.action('back_to_withdraw', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    withdrawSessions.delete(userId);
    
    const user = await getUser(userId);
    const message = formatProfessionalMessage('💸 WITHDRAWAL', `💰 USDT Balance: ${formatUSD(user?.balance || 0)}`, `Enter amount:`);
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: getWithdrawAmountKeyboard(user?.balance || 0) });
    withdrawSessions.set(userId, { currency: 'USDT', step: 'waitingForAmount', createdAt: Date.now() });
});

// ==================== SETTINGS ====================
bot.action('main_settings', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    const user = await getUser(userId);
    
    const message = formatProfessionalMessage(
        '⚙️ SETTINGS',
        `💳 <b>Wallet:</b> ${user?.walletAddress ? `<code>${user.walletAddress.substring(0, 10)}...${user.walletAddress.substring(38)}</code>` : 'Not set'}\n🔐 <b>Verified:</b> ${user?.isVerified ? '✅ Yes' : '❌ No'}`,
        `Select an option:`
    );
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '💳 CHANGE WALLET', callback_data: 'change_wallet' }],
            [{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

bot.action('change_wallet', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    
    const message = formatProfessionalMessage(
        '💳 CHANGE WALLET',
        `Send your new BEP20 wallet address.\n\n<i>Example:</i> <code>0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0</code>`,
        `Send your new address now:`
    );
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: getCancelKeyboard() });
    withdrawSessions.set(userId, { step: 'waitingForWalletUpdate', createdAt: Date.now() });
});

// ==================== GENERAL ACTIONS ====================
bot.action('cancel_action', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    withdrawSessions.delete(userId);
    const message = formatProfessionalMessage('❌ ACTION CANCELLED', 'Returning to main menu.');
    const keyboard = {
        inline_keyboard: [
            [{ text: '💰 BALANCE', callback_data: 'main_balance' }, { text: '🔗 REFERRAL', callback_data: 'main_referral' }],
            [{ text: '💸 WITHDRAW', callback_data: 'main_withdraw' }, { text: '📜 HISTORY', callback_data: 'main_history' }],
            [{ text: '📢 OUR CHANNELS', callback_data: 'social_channels' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

bot.action('back_to_menu', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    withdrawSessions.delete(userId);
    const user = await getUser(userId);
    const message = formatProfessionalMessage('🎯 MAIN MENU', `💰 Balance: ${formatUSD(user?.balance || 0)}`, `Select an option:`);
    const keyboard = {
        inline_keyboard: [
            [{ text: '💰 BALANCE', callback_data: 'main_balance' }, { text: '🔗 REFERRAL', callback_data: 'main_referral' }],
            [{ text: '💸 WITHDRAW', callback_data: 'main_withdraw' }, { text: '📜 HISTORY', callback_data: 'main_history' }],
            [{ text: '📢 OUR CHANNELS', callback_data: 'social_channels' }]
        ]
    };
    await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
});

// ==================== TEXT MESSAGE HANDLER ====================
bot.on('text', async (ctx) => {
    const userId = ctx.from.id.toString();
    const messageText = ctx.message.text;
    
    if (messageText.startsWith('/')) return;
    
    const adminSession = adminSessions.get(userId);
    
    if (adminSession?.waitingForPassword && isAdmin(userId)) {
        if (messageText === ADMIN_PASSWORD) {
            adminSessions.set(userId, { authenticated: true, createdAt: Date.now() });
            const stats = await getBotStats();
            const message = formatProfessionalMessage('✅ LOGIN SUCCESSFUL', `Welcome Admin.\n\n👥 Users: ${stats.users}\n\n✨ Withdrawals are auto-approved!`, `Select an option:`);
            await ctx.reply(message, { reply_markup: getAdminKeyboard(), parse_mode: 'HTML' });
        } else {
            await ctx.reply('❌ Invalid password.');
            adminSessions.delete(userId);
        }
        return;
    }
    
    if (adminSession?.step === 'broadcasting' && isAdmin(userId)) {
        await ctx.reply(`⏳ Sending broadcast to ${userCache.cache.size} users...`);
        const result = await broadcastToAllUsers(messageText);
        await ctx.reply(`✅ Broadcast sent to ${result.sent} users${result.failed > 0 ? ` (${result.failed} failed)` : ''}`);
        adminSessions.delete(userId);
        return;
    }
    
    if (adminSession?.step === 'adding_balance' && isAdmin(userId)) {
        const parts = messageText.trim().split(' ');
        if (parts.length === 2) {
            const targetUserId = parts[0];
            const amount = parseFloat(parts[1]);
            if (isNaN(amount) || amount <= 0) {
                await ctx.reply('❌ Invalid amount.');
            } else {
                const user = await getUser(targetUserId);
                await updateUser(targetUserId, { balance: (user?.balance || 0) + amount, totalEarned: (user?.totalEarned || 0) + amount }, true);
                await addTransaction(targetUserId, {
                    type: 'admin_add',
                    amount: amount,
                    currency: 'USDT',
                    status: 'completed',
                    description: `Admin added ${formatUSD(amount)}`
                }, true);
                await ctx.reply(`✅ Added ${formatUSD(amount)} to user ${targetUserId}`);
            }
        } else {
            await ctx.reply('❌ Format: USER_ID AMOUNT\nExample: 123456789 100');
        }
        adminSessions.delete(userId);
        return;
    }
    
    if (adminSession?.step === 'removing_balance' && isAdmin(userId)) {
        const parts = messageText.trim().split(' ');
        if (parts.length === 2) {
            const targetUserId = parts[0];
            const amount = parseFloat(parts[1]);
            if (isNaN(amount) || amount <= 0) {
                await ctx.reply('❌ Invalid amount.');
            } else {
                const user = await getUser(targetUserId);
                if ((user?.balance || 0) < amount) {
                    await ctx.reply(`❌ User balance is only ${formatUSD(user?.balance || 0)}`);
                } else {
                    await updateUser(targetUserId, { balance: (user?.balance || 0) - amount }, true);
                    await addTransaction(targetUserId, {
                        type: 'admin_remove',
                        amount: amount,
                        currency: 'USDT',
                        status: 'completed',
                        description: `Admin removed ${formatUSD(amount)}`
                    }, true);
                    await ctx.reply(`✅ Removed ${formatUSD(amount)} from user ${targetUserId}`);
                }
            }
        } else {
            await ctx.reply('❌ Format: USER_ID AMOUNT\nExample: 123456789 50');
        }
        adminSessions.delete(userId);
        return;
    }
    
    const session = withdrawSessions.get(userId);
    
    if (session?.step === 'waitingForWallet') {
        if (isValidBEP20(messageText)) {
            await updateUser(userId, { walletAddress: messageText }, true);
            withdrawSessions.delete(userId);
            const message = formatProfessionalMessage('✅ WALLET SAVED!', `💳 <code>${messageText}</code>\n\nYou can now withdraw funds.`);
            const keyboard = {
                inline_keyboard: [
                    [{ text: '💰 BALANCE', callback_data: 'main_balance' }, { text: '🔗 REFERRAL', callback_data: 'main_referral' }],
                    [{ text: '💸 WITHDRAW', callback_data: 'main_withdraw' }, { text: '📜 HISTORY', callback_data: 'main_history' }],
                    [{ text: '📢 OUR CHANNELS', callback_data: 'social_channels' }]
                ]
            };
            await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
        } else {
            await ctx.reply('❌ Invalid BEP20 address. Please send a valid wallet address starting with 0x...');
        }
        return;
    }
    
    if (session?.step === 'waitingForWalletUpdate') {
        if (isValidBEP20(messageText)) {
            await updateUser(userId, { walletAddress: messageText }, true);
            withdrawSessions.delete(userId);
            const message = formatProfessionalMessage('✅ WALLET UPDATED!', `💳 <code>${messageText}</code>`);
            const keyboard = {
                inline_keyboard: [
                    [{ text: '🔙 BACK TO MENU', callback_data: 'back_to_menu' }]
                ]
            };
            await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
        } else {
            await ctx.reply('❌ Invalid BEP20 address.');
        }
        return;
    }
    
    if (session?.step === 'waitingForCustomAmount') {
        const amount = parseFloat(messageText);
        const user = await getUser(userId);
        const balance = user?.balance || 0;
        
        if (isNaN(amount) || amount < APP_CONFIG.minWithdrawUSDT || amount > APP_CONFIG.maxWithdrawUSDT || amount > balance) {
            await ctx.reply(formatProfessionalMessage('❌ INVALID AMOUNT', `Amount must be between ${APP_CONFIG.minWithdrawUSDT} USDT and ${APP_CONFIG.maxWithdrawUSDT} USDT\nYour balance: ${formatUSD(balance)}`));
            return;
        }
        
        withdrawSessions.set(userId, { ...session, amount, step: 'confirmWithdraw' });
        
        const message = formatProfessionalMessage('✅ CONFIRM WITHDRAWAL', `💰 Currency: USDT\n💵 Amount: ${formatUSD(amount)}\n💳 Wallet: <code>${user?.walletAddress?.substring(0, 10)}...${user?.walletAddress?.substring(38)}</code>`, `Click CONFIRM to submit.`);
        const keyboard = {
            inline_keyboard: [
                [{ text: '✅ CONFIRM WITHDRAWAL', callback_data: 'confirm_withdraw_final' }],
                [{ text: '🔙 BACK', callback_data: 'back_to_withdraw' }]
            ]
        };
        await ctx.reply(message, { parse_mode: 'HTML', reply_markup: keyboard });
        return;
    }
});

// ============================================================================
// 13. 👑 ADMIN PANEL
// ============================================================================

const adminSessions = new Map();

setInterval(() => {
    const now = Date.now();
    for (const [userId, session] of adminSessions.entries()) {
        if (session.createdAt && (now - session.createdAt) > APP_CONFIG.adminSessionTTL) {
            adminSessions.delete(userId);
        }
    }
}, APP_CONFIG.sessionCleanupInterval);

async function getBotStats() {
    if (!checkDb()) return { users: 0, totalBalance: 0 };
    try {
        let totalBalance = 0;
        for (const [_, user] of userCache.cache) {
            totalBalance += user.balance || 0;
        }
        return { users: userCache.cache.size, totalBalance };
    } catch (error) {
        return { users: 0, totalBalance: 0 };
    }
}

async function broadcastToAllUsers(message) {
    let sent = 0, failed = 0;
    for (const [userId, _] of userCache.cache) {
        try {
            await bot.telegram.sendMessage(userId, formatProfessionalMessage('📢 ANNOUNCEMENT', message), { parse_mode: 'HTML' });
            sent++;
            await new Promise(r => setTimeout(r, 50));
        } catch (e) { failed++; }
    }
    return { success: true, sent, failed };
}

bot.hears('👑 ADMIN PANEL', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdmin(userId)) {
        await ctx.reply('⛔ Access Denied');
        return;
    }
    
    const session = adminSessions.get(userId);
    if (session?.authenticated) {
        const stats = await getBotStats();
        const cacheStats = userCache.getStats();
        const message = formatProfessionalMessage(
            '👑 ADMIN PANEL',
            `✅ Authenticated\n\n👥 Users: ${stats.users}\n💰 Total USDT: ${formatUSD(stats.totalBalance)}\n📦 Cache: ${cacheStats.cacheSize} users (${cacheStats.dirtyCount} dirty)\n\n📌 <b>Note:</b> Withdrawals are auto-approved. Check withdrawal group for manual transfer requests.`,
            `Select an option:`
        );
        await ctx.reply(message, { reply_markup: getAdminKeyboard(), parse_mode: 'HTML' });
        return;
    }
    
    await ctx.reply(formatProfessionalMessage('🔐 ADMIN LOGIN', 'Please enter your admin password.'));
    adminSessions.set(userId, { waitingForPassword: true, createdAt: Date.now() });
});

bot.action('admin_stats', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdmin(userId) || !adminSessions.get(userId)?.authenticated) {
        await ctx.answerCbQuery('⛔ Unauthorized');
        return;
    }
    await ctx.answerCbQuery();
    const stats = await getBotStats();
    const message = formatProfessionalMessage('📊 STATISTICS', `👥 Users: ${stats.users}\n💰 Total USDT: ${formatUSD(stats.totalBalance)}\n\n✨ All withdrawals are auto-approved!`);
    await ctx.reply(message, { parse_mode: 'HTML' });
});

bot.action('admin_users', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdmin(userId) || !adminSessions.get(userId)?.authenticated) {
        await ctx.answerCbQuery('⛔ Unauthorized');
        return;
    }
    await ctx.answerCbQuery();
    let verified = 0, withWallet = 0;
    for (const [_, user] of userCache.cache) {
        if (user.isVerified) verified++;
        if (user.walletAddress) withWallet++;
    }
    const message = formatProfessionalMessage('👥 USERS', `📊 Total: ${userCache.cache.size}\n✅ Verified: ${verified}\n💳 With Wallet: ${withWallet}`);
    await ctx.reply(message, { parse_mode: 'HTML' });
});

bot.action('admin_add_balance', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdmin(userId) || !adminSessions.get(userId)?.authenticated) {
        await ctx.answerCbQuery('⛔ Unauthorized');
        return;
    }
    await ctx.answerCbQuery();
    adminSessions.get(userId).step = 'adding_balance';
    await ctx.reply('💰 <b>ADD BALANCE</b>\n\nFormat: <code>USER_ID AMOUNT</code>\nExample: <code>123456789 100</code>\n\n⚠️ Use immediate sync (saves to Firebase now)', { parse_mode: 'HTML' });
});

bot.action('admin_remove_balance', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdmin(userId) || !adminSessions.get(userId)?.authenticated) {
        await ctx.answerCbQuery('⛔ Unauthorized');
        return;
    }
    await ctx.answerCbQuery();
    adminSessions.get(userId).step = 'removing_balance';
    await ctx.reply('➖ <b>REMOVE BALANCE</b>\n\nFormat: <code>USER_ID AMOUNT</code>\nExample: <code>123456789 50</code>\n\n⚠️ Use immediate sync (saves to Firebase now)', { parse_mode: 'HTML' });
});

bot.action('admin_broadcast', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdmin(userId) || !adminSessions.get(userId)?.authenticated) {
        await ctx.answerCbQuery('⛔ Unauthorized');
        return;
    }
    await ctx.answerCbQuery();
    adminSessions.get(userId).step = 'broadcasting';
    await ctx.reply('📢 <b>BROADCAST</b>\n\nSend your message to all users:', { parse_mode: 'HTML' });
});

bot.action('admin_sync_cache', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdmin(userId) || !adminSessions.get(userId)?.authenticated) {
        await ctx.answerCbQuery('⛔ Unauthorized');
        return;
    }
    await ctx.answerCbQuery('🔄 Syncing...');
    await userCache.syncAllToFirebase(db);
    await ctx.reply('✅ Cache synced to Firebase!');
});

bot.action('admin_logout', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    adminSessions.delete(userId);
    await ctx.reply('🔓 Logged out successfully.');
});

// ============================================================================
// 14. 🌐 API ROUTES
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve index.html for mini app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'alive', timestamp: Date.now(), totalUsers: userCache.cache.size, firebase: !!db, cache: userCache.getStats() });
});

// Ping endpoint to keep server alive (called every 5 minutes)
app.get('/api/ping', (req, res) => {
    res.json({ status: 'pong', timestamp: Date.now() });
});

// Config endpoint
app.get('/api/config', (req, res) => {
    res.json({
        firebaseConfig: firebaseWebConfig,
        appUrl: APP_URL,
        ownerWallet: OWNER_WALLET,
        config: {
            welcomeBonus: APP_CONFIG.welcomeBonus,
            referralBonus: APP_CONFIG.referralBonus,
            minWithdrawUSDT: APP_CONFIG.minWithdrawUSDT,
            maxWithdrawUSDT: APP_CONFIG.maxWithdrawUSDT
        }
    });
});

// Get user data for mini app
app.get('/api/user/:userId', async (req, res) => {
    try {
        const user = await getUser(req.params.userId);
        if (!user) return res.json({ success: false, error: 'User not found' });
        res.json({ success: true, user: {
            userId: user.userId,
            userName: user.userName,
            balance: user.balance || 0,
            totalEarned: user.totalEarned || 0,
            inviteCount: user.inviteCount || 0,
            isVerified: user.isVerified || false,
            walletAddress: user.walletAddress || null,
            transactions: (user.transactions || []).slice(0, 30)
        }});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// 15. 🚀 START BOT & SERVER
// ============================================================================

// Auto-ping every 5 minutes to keep server awake
setInterval(async () => {
    try {
        const response = await fetch(`http://localhost:${PORT}/api/ping`);
        console.log(`🔄 Auto-ping at ${new Date().toISOString()}: ${response.status}`);
    } catch (error) {
        console.log('Auto-ping failed:', error.message);
    }
}, 300000); // 5 minutes

bot.launch({ dropPendingUpdates: true })
    .then(() => console.log('🚀 Daily Airdrop Bot Started'))
    .catch(err => console.error('❌ Bot error:', err));

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                     DAILY AIRDROP BOT - PROFESSIONAL EDITION                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  📍 Port: ${PORT}                                                              ║
║  🔥 Firebase: ${db ? '✅ Connected' : '❌ Disconnected'}                                             ║
║  👑 Admin: ${ADMIN_ID ? '✅ Configured' : '❌ Missing'}                                              ║
║  🤖 Bot: ${BOT_TOKEN ? '✅ Running' : '❌ Missing'}                                                ║
║  📦 Cache: ${userCache.getStats().cacheSize} users (${userCache.getStats().dirtyCount} dirty)                     ║
║  🔄 Periodic Sync: Every ${APP_CONFIG.syncInterval / 3600000} hours                                    ║
║  🛡️ Rate Limit: ${APP_CONFIG.rateLimitMax} req/${APP_CONFIG.rateLimitWindow / 1000}s                        ║
║  🎁 Welcome Bonus: ${APP_CONFIG.welcomeBonus} USDT                                           ║
║  👥 Referral Bonus: ${APP_CONFIG.referralBonus} USDT                                            ║
║  💎 Min Withdraw: ${APP_CONFIG.minWithdrawUSDT} USDT                                          ║
║  💎 Max Withdraw: ${APP_CONFIG.maxWithdrawUSDT} USDT                                          ║
║  ✨ Withdrawals: AUTO-APPROVED (No Cooldown)                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
async function gracefulShutdown() {
    console.log('🛑 Shutting down gracefully...');
    console.log('💾 Saving all dirty users to Firebase...');
    await userCache.syncAllToFirebase(db);
    console.log('✅ All data saved. Goodbye!');
    process.exit(0);
}

process.once('SIGINT', gracefulShutdown);
process.once('SIGTERM', gracefulShutdown);

// ============================================================================
// END OF FILE 🎯
// ============================================================================
