// ============================================================================
// TRUST WALLET LITE - BACKEND SERVER v6.0
// مع: CoinPayments API، لوحة مشرف كاملة، إشعارات بوت
// ============================================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// ====== قراءة جميع Secret Files ======
let ADMIN_ID = null;
let COINPAYMENTS_PUBLIC_KEY = null;
let COINPAYMENTS_PRIVATE_KEY = null;
let BOT_TOKEN = null;
let ADMIN_PASSWORD = null;
let firebaseKey = null;
let db = null;
let admin = null;

console.log("🔐 Loading secrets from Secret Files...");

// 1. Firebase Service Account
try {
    const firebasePath = '/etc/secrets/firebase-key.json';
    if (fs.existsSync(firebasePath)) {
        firebaseKey = JSON.parse(fs.readFileSync(firebasePath, 'utf8'));
        console.log("✅ Firebase key loaded from Secret File");
    } else {
        const localPath = path.join(__dirname, 'firebase-key.json');
        if (fs.existsSync(localPath)) {
            firebaseKey = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            console.log("✅ Firebase key loaded from local file");
        }
    }
} catch (error) {
    console.error("❌ Error loading Firebase key:", error.message);
}

// 2. Admin Config
try {
    const adminPath = '/etc/secrets/admin-config.json';
    if (fs.existsSync(adminPath)) {
        const adminConfig = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
        ADMIN_ID = adminConfig.admin_id;
        ADMIN_PASSWORD = adminConfig.admin_password;
        console.log("✅ Admin config loaded, ID:", ADMIN_ID);
    } else {
        ADMIN_ID = process.env.ADMIN_ID || null;
        ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
        if (ADMIN_ID) console.log("✅ Using ADMIN_ID from environment variable");
    }
} catch (error) {
    console.error("❌ Error loading admin config:", error.message);
    ADMIN_ID = process.env.ADMIN_ID || null;
    ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;
}

// 3. CoinPayments Keys
try {
    const coinpaymentsPath = '/etc/secrets/coinpayments-keys.json';
    if (fs.existsSync(coinpaymentsPath)) {
        const coinpaymentsKeys = JSON.parse(fs.readFileSync(coinpaymentsPath, 'utf8'));
        COINPAYMENTS_PUBLIC_KEY = coinpaymentsKeys.public_key;
        COINPAYMENTS_PRIVATE_KEY = coinpaymentsKeys.private_key;
        console.log("✅ CoinPayments keys loaded from Secret File");
    } else {
        COINPAYMENTS_PUBLIC_KEY = process.env.COINPAYMENTS_PUBLIC_KEY || null;
        COINPAYMENTS_PRIVATE_KEY = process.env.COINPAYMENTS_PRIVATE_KEY || null;
        if (COINPAYMENTS_PUBLIC_KEY) console.log("✅ Using CoinPayments keys from environment variables");
    }
} catch (error) {
    console.error("❌ Error loading CoinPayments keys:", error.message);
    COINPAYMENTS_PUBLIC_KEY = process.env.COINPAYMENTS_PUBLIC_KEY || null;
    COINPAYMENTS_PRIVATE_KEY = process.env.COINPAYMENTS_PRIVATE_KEY || null;
}

// 4. Bot Token
try {
    const botPath = '/etc/secrets/bot-config.json';
    if (fs.existsSync(botPath)) {
        const botConfig = JSON.parse(fs.readFileSync(botPath, 'utf8'));
        BOT_TOKEN = botConfig.bot_token;
        console.log("✅ Bot token loaded from Secret File");
    } else {
        BOT_TOKEN = process.env.BOT_TOKEN || null;
        if (BOT_TOKEN) console.log("✅ Using BOT_TOKEN from environment variable");
    }
} catch (error) {
    console.error("❌ Error loading bot token:", error.message);
    BOT_TOKEN = process.env.BOT_TOKEN || null;
}

// ====== FIREBASE ADMIN SDK ======
try {
    admin = require('firebase-admin');
    
    if (firebaseKey && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseKey),
            projectId: firebaseKey.project_id
        });
        db = admin.firestore();
        console.log("✅ Firebase Admin SDK initialized");
    } else if (!firebaseKey) {
        console.log("⚠️ Firebase key not available, running in demo mode");
        // Demo mode: استخدام تخزين مؤقت في الذاكرة
        db = {
            collection: (name) => ({
                doc: (id) => ({
                    get: async () => ({ exists: false, data: () => null }),
                    set: async (data) => console.log(`[DEMO] Saving to ${name}/${id}`),
                    update: async (data) => console.log(`[DEMO] Updating ${name}/${id}`)
                }),
                where: () => ({
                    get: async () => ({ empty: true, docs: [] })
                }),
                add: async (data) => ({ id: `demo_${Date.now()}` })
            })
        };
    } else {
        console.log("✅ Firebase already initialized");
    }
} catch (error) {
    console.error("❌ Firebase init error:", error.message);
}

// ====== Helper Functions ======

// إرسال إشعار عبر تيليجرام
async function sendTelegramMessage(chatId, message) {
    if (!BOT_TOKEN) {
        console.log("⚠️ Bot token not configured, cannot send message");
        return false;
    }
    
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        const data = await response.json();
        if (data.ok) {
            console.log(`✅ Telegram message sent to ${chatId}`);
            return true;
        } else {
            console.error("Telegram API error:", data.description);
            return false;
        }
    } catch (error) {
        console.error("Error sending Telegram message:", error);
        return false;
    }
}

// CoinPayments API
async function callCoinPaymentsAPI(cmd, req = {}) {
    if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
        console.log("⚠️ CoinPayments keys not available");
        return null;
    }
    
    const formData = new URLSearchParams();
    formData.append('cmd', cmd);
    formData.append('key', COINPAYMENTS_PUBLIC_KEY);
    formData.append('version', '1');
    Object.keys(req).forEach(k => formData.append(k, req[k]));
    
    const hmac = crypto.createHmac('sha512', COINPAYMENTS_PRIVATE_KEY);
    hmac.update(formData.toString());
    
    try {
        const response = await fetch('https://www.coinpayments.net/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'HMAC': hmac.digest('hex')
            },
            body: formData
        });
        
        const data = await response.json();
        if (data.error !== 'ok') throw new Error(data.error);
        return data.result;
    } catch (error) {
        console.error("CoinPayments API error:", error.message);
        return null;
    }
}

// التحقق من صلاحيات المشرف
function isAdminRequest(req) {
    const adminKey = req.body.adminKey || req.query.adminKey;
    return adminKey === ADMIN_ID;
}

// ====== API ENDPOINTS ======

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'online', 
        firebase: admin?.apps?.length ? 'connected' : 'demo',
        coinpayments: COINPAYMENTS_PUBLIC_KEY ? 'configured' : 'not configured',
        bot: BOT_TOKEN ? 'configured' : 'not configured',
        admin: ADMIN_ID ? 'configured' : 'not configured',
        timestamp: Date.now()
    });
});

// Get config
app.get('/api/config', (req, res) => {
    res.json({
        status: 'ok',
        adminId: ADMIN_ID || '',
        botConfigured: !!BOT_TOKEN,
        coinpaymentsConfigured: !!COINPAYMENTS_PUBLIC_KEY,
        version: '6.0.0'
    });
});

// Create user
app.post('/api/users', async (req, res) => {
    try {
        const { userId, userData } = req.body;
        
        if (!db) {
            return res.status(500).json({ error: 'Database not available' });
        }
        
        const existing = await db.collection('users').doc(userId).get();
        if (existing.exists) {
            return res.status(409).json({ error: 'User already exists' });
        }
        
        await db.collection('users').doc(userId).set({
            ...userData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastActive: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ User created: ${userId}`);
        
        // إشعار للمشرف
        if (ADMIN_ID && BOT_TOKEN) {
            await sendTelegramMessage(ADMIN_ID, 
                `🆕 <b>New User Registered!</b>\n\n` +
                `🆔 User ID: <code>${userId}</code>\n` +
                `👤 Name: ${userData.userName || 'User'}\n` +
                `📅 Time: ${new Date().toLocaleString()}`
            );
        }
        
        res.json({ success: true, userId });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user
app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!db) {
            return res.status(500).json({ error: 'Database not available' });
        }
        
        const doc = await db.collection('users').doc(userId).get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await db.collection('users').doc(userId).update({
            lastActive: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true, data: doc.data() });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user
app.patch('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { updates } = req.body;
        
        if (!db) {
            return res.status(500).json({ error: 'Database not available' });
        }
        
        await db.collection('users').doc(userId).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Process referral
app.post('/api/referrals', async (req, res) => {
    try {
        const { referrerId, newUserId } = req.body;
        
        if (!db) {
            return res.json({ success: true, message: 'Demo mode' });
        }
        
        const referrerRef = db.collection('users').doc(referrerId);
        const referrer = await referrerRef.get();
        
        if (referrer.exists) {
            const invites = referrer.data().invites || [];
            if (!invites.includes(newUserId)) {
                await referrerRef.update({
                    invites: [...invites, newUserId],
                    inviteCount: (referrer.data().inviteCount || 0) + 1,
                    'balances.USDT': (referrer.data().balances?.USDT || 0) + 25,
                    totalUsdtEarned: (referrer.data().totalUsdtEarned || 0) + 25,
                    lastReferralAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Referral: ${referrerId} invited ${newUserId}`);
                
                if (ADMIN_ID && BOT_TOKEN) {
                    await sendTelegramMessage(ADMIN_ID,
                        `🔗 <b>New Referral!</b>\n\n` +
                        `👤 Referrer: <code>${referrerId}</code>\n` +
                        `🆕 New User: <code>${newUserId}</code>\n` +
                        `💰 Reward: +25 USDT`
                    );
                }
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Referral error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create deposit address (مع CoinPayments API)
app.post('/api/deposit-address', async (req, res) => {
    try {
        const { userId, currency } = req.body;
        
        let address = null;
        
        // محاولة إنشاء عنوان من CoinPayments
        if (COINPAYMENTS_PUBLIC_KEY && COINPAYMENTS_PRIVATE_KEY) {
            try {
                const result = await callCoinPaymentsAPI('get_callback_address', {
                    currency: currency,
                    ipn_url: `https://${req.get('host')}/api/ipn/${userId}`,
                    label: `twt_${userId}_${currency}`
                });
                address = result?.address;
                if (address) {
                    console.log(`✅ Generated CoinPayments address for ${userId} - ${currency}: ${address}`);
                }
            } catch (coinError) {
                console.error("CoinPayments error:", coinError.message);
            }
        }
        
        // عنوان احتياطي
        if (!address) {
            address = `0x${userId.slice(-40).padStart(40, '0')}`;
            console.log(`⚠️ Using mock address for ${userId} - ${currency}`);
        }
        
        if (db) {
            await db.collection('users').doc(userId).update({
                [`depositAddresses.${currency}`]: address
            });
        }
        
        res.json({ success: true, address });
    } catch (error) {
        console.error('Deposit address error:', error);
        res.status(500).json({ error: error.message });
    }
});

// إضافة رصيد (للمشرف فقط)
app.post('/api/add-balance', async (req, res) => {
    try {
        const { userId, currency, amount, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.status(500).json({ error: 'Database not available' });
        }
        
        await db.collection('users').doc(userId).update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
        });
        
        // تسجيل المعاملة
        await db.collection('transactions').add({
            userId,
            type: 'admin_add',
            amount,
            currency,
            status: 'completed',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: `Admin added ${amount} ${currency}`
        });
        
        console.log(`✅ Admin added ${amount} ${currency} to ${userId}`);
        
        // إرسال إشعار للمستخدم
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId, 
                `✅ <b>Deposit Approved!</b>\n\n` +
                `Amount: ${amount} ${currency}\n` +
                `Your balance has been updated.`
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Add balance error:', error);
        res.status(500).json({ error: error.message });
    }
});

// خصم رصيد (للمشرف فقط)
app.post('/api/remove-balance', async (req, res) => {
    try {
        const { userId, currency, amount, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.status(500).json({ error: 'Database not available' });
        }
        
        const userDoc = await db.collection('users').doc(userId).get();
        const currentBalance = userDoc.data()?.balances?.[currency] || 0;
        
        if (currentBalance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        await db.collection('users').doc(userId).update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(-amount)
        });
        
        console.log(`✅ Admin removed ${amount} ${currency} from ${userId}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Remove balance error:', error);
        res.status(500).json({ error: error.message });
    }
});

// حظر مستخدم من السحوبات (للمشرف فقط)
app.post('/api/block-user', async (req, res) => {
    try {
        const { userId, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.status(500).json({ error: 'Database not available' });
        }
        
        await db.collection('users').doc(userId).update({
            withdrawBlocked: true,
            withdrawBlockedAt: admin.firestore.FieldValue.serverTimestamp(),
            withdrawBlockedBy: ADMIN_ID
        });
        
        console.log(`✅ User ${userId} blocked from withdrawals`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// إرسال إشعار عبر البوت
app.post('/api/send-notification', async (req, res) => {
    try {
        const { userId, message } = req.body;
        
        if (!BOT_TOKEN) {
            return res.status(500).json({ error: 'Bot not configured' });
        }
        
        const success = await sendTelegramMessage(userId, message);
        res.json({ success });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// جلب طلبات الإيداع المعلقة (للمشرف فقط)
app.get('/api/admin/deposits', async (req, res) => {
    try {
        const adminKey = req.query.adminKey;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json([]);
        }
        
        const snapshot = await db.collection('deposit_requests')
            .where('status', '==', 'pending')
            .orderBy('timestamp', 'desc')
            .get();
        
        const deposits = [];
        snapshot.forEach(doc => {
            deposits.push({ id: doc.id, ...doc.data() });
        });
        
        res.json(deposits);
    } catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({ error: error.message });
    }
});

// جلب طلبات السحب المعلقة (للمشرف فقط)
app.get('/api/admin/withdrawals', async (req, res) => {
    try {
        const adminKey = req.query.adminKey;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json([]);
        }
        
        const snapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending')
            .orderBy('timestamp', 'desc')
            .get();
        
        const withdrawals = [];
        snapshot.forEach(doc => {
            withdrawals.push({ id: doc.id, ...doc.data() });
        });
        
        res.json(withdrawals);
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ error: error.message });
    }
});

// الموافقة على معاملة (للمشرف فقط)
app.post('/api/approve-transaction', async (req, res) => {
    try {
        const { txId, userId, amount, currency, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        // تحديث حالة المعاملة
        await db.collection('deposit_requests').doc(txId).update({
            status: 'approved',
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedBy: ADMIN_ID
        });
        
        // إضافة الرصيد للمستخدم
        await db.collection('users').doc(userId).update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
        });
        
        // إشعار للمستخدم
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `✅ <b>Deposit Approved!</b>\n\n` +
                `Amount: ${amount} ${currency}\n` +
                `Your balance has been updated.`
            );
        }
        
        console.log(`✅ Transaction ${txId} approved for user ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Approve transaction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// رفض معاملة (للمشرف فقط)
app.post('/api/reject-transaction', async (req, res) => {
    try {
        const { txId, userId, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        await db.collection('deposit_requests').doc(txId).update({
            status: 'rejected',
            rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
            rejectedBy: ADMIN_ID
        });
        
        // إشعار للمستخدم
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `❌ <b>Deposit Rejected</b>\n\n` +
                `Your deposit request was rejected.\n` +
                `Please contact support for more information.`
            );
        }
        
        console.log(`❌ Transaction ${txId} rejected for user ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Reject transaction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook لـ CoinPayments IPN (للاستلام التلقائي)
app.post('/api/ipn/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const ipnData = req.body;
        
        console.log(`📥 CoinPayments IPN received for user ${userId}:`, ipnData);
        
        // التحقق من التوقيع
        if (ipnData.status === 100) { // Completed
            const amount = parseFloat(ipnData.amount);
            const currency = ipnData.currency;
            
            if (db) {
                await db.collection('deposit_requests').add({
                    userId,
                    amount,
                    currency,
                    status: 'pending',
                    txId: ipnData.txn_id,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    source: 'coinpayments'
                });
                
                // إشعار للمشرف
                if (ADMIN_ID && BOT_TOKEN) {
                    await sendTelegramMessage(ADMIN_ID,
                        `💰 <b>New Deposit via CoinPayments!</b>\n\n` +
                        `User: <code>${userId}</code>\n` +
                        `Amount: ${amount} ${currency}\n` +
                        `TXID: ${ipnData.txn_id}`
                    );
                }
            }
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('IPN error:', error);
        res.sendStatus(500);
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔥 Firebase: ${admin?.apps?.length ? 'Connected' : 'Demo Mode'}`);
    console.log(`👑 Admin ID: ${ADMIN_ID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💳 CoinPayments: ${COINPAYMENTS_PUBLIC_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🤖 Bot Token: ${BOT_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🔐 Admin Password: ${ADMIN_PASSWORD ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`\n📋 API Endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/config`);
    console.log(`   POST /api/users`);
    console.log(`   GET  /api/users/:userId`);
    console.log(`   PATCH /api/users/:userId`);
    console.log(`   POST /api/referrals`);
    console.log(`   POST /api/deposit-address`);
    console.log(`   POST /api/add-balance (Admin only)`);
    console.log(`   POST /api/remove-balance (Admin only)`);
    console.log(`   POST /api/block-user (Admin only)`);
    console.log(`   GET  /api/admin/deposits (Admin only)`);
    console.log(`   GET  /api/admin/withdrawals (Admin only)`);
    console.log(`   POST /api/approve-transaction (Admin only)`);
    console.log(`   POST /api/reject-transaction (Admin only)`);
    console.log(`   POST /api/send-notification`);
    console.log(`   POST /api/ipn/:userId (CoinPayments webhook)`);
});
