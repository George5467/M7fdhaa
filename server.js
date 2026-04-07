// ============================================================================
// TRUST WALLET LITE - BACKEND SERVER (PRODUCTION READY)
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

// ====== 1. LOAD SECRETS ======
let ADMIN_ID = null;
let COINPAYMENTS_PUBLIC_KEY = null;
let COINPAYMENTS_PRIVATE_KEY = null;
let BOT_TOKEN = null;
let firebaseKey = null;
let db = null;
let admin = null;

console.log("🔐 Loading secrets...");

// Firebase Service Account
try {
    const firebasePath = '/etc/secrets/firebase-key.json';
    if (fs.existsSync(firebasePath)) {
        firebaseKey = JSON.parse(fs.readFileSync(firebasePath, 'utf8'));
        console.log("✅ Firebase key loaded");
    } else {
        const localPath = path.join(__dirname, 'firebase-key.json');
        if (fs.existsSync(localPath)) {
            firebaseKey = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            console.log("✅ Firebase key loaded from local");
        }
    }
} catch (error) {
    console.error("❌ Firebase key error:", error.message);
}

// Admin Config
try {
    const adminPath = '/etc/secrets/admin-config.json';
    if (fs.existsSync(adminPath)) {
        const adminConfig = JSON.parse(fs.readFileSync(adminPath, 'utf8'));
        ADMIN_ID = adminConfig.admin_id;
        console.log("✅ Admin config loaded, ID:", ADMIN_ID);
    } else {
        ADMIN_ID = process.env.ADMIN_ID || "1653918641";
    }
} catch (error) {
    ADMIN_ID = "1653918641";
}

// CoinPayments Keys
try {
    const coinPath = '/etc/secrets/coinpayments-keys.json';
    if (fs.existsSync(coinPath)) {
        const coinKeys = JSON.parse(fs.readFileSync(coinPath, 'utf8'));
        COINPAYMENTS_PUBLIC_KEY = coinKeys.public_key;
        COINPAYMENTS_PRIVATE_KEY = coinKeys.private_key;
        console.log("✅ CoinPayments keys loaded");
    } else {
        COINPAYMENTS_PUBLIC_KEY = process.env.COINPAYMENTS_PUBLIC_KEY;
        COINPAYMENTS_PRIVATE_KEY = process.env.COINPAYMENTS_PRIVATE_KEY;
    }
} catch (error) {
    console.error("❌ CoinPayments error:", error.message);
}

// Bot Token
try {
    const botPath = '/etc/secrets/bot-config.json';
    if (fs.existsSync(botPath)) {
        const botConfig = JSON.parse(fs.readFileSync(botPath, 'utf8'));
        BOT_TOKEN = botConfig.bot_token;
        console.log("✅ Bot token loaded");
    } else {
        BOT_TOKEN = process.env.BOT_TOKEN;
    }
} catch (error) {
    BOT_TOKEN = process.env.BOT_TOKEN;
}

// ====== 2. FIREBASE ADMIN SDK ======
try {
    admin = require('firebase-admin');
    
    if (firebaseKey && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseKey),
            projectId: firebaseKey.project_id
        });
        db = admin.firestore();
        console.log("✅ Firebase Admin SDK initialized");
    } else {
        console.log("⚠️ Firebase not available, running in demo mode");
        // Demo mode: in-memory storage
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
                        return { id };
                    },
                    update: async (data) => {
                        const existing = memoryStore.get(`${name}_${id}`) || {};
                        memoryStore.set(`${name}_${id}`, { ...existing, ...data });
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
    }
} catch (error) {
    console.error("❌ Firebase init error:", error.message);
    // Demo mode fallback
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
                    return { id };
                },
                update: async (data) => {
                    const existing = memoryStore.get(`${name}_${id}`) || {};
                    memoryStore.set(`${name}_${id}`, { ...existing, ...data });
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
}

// ====== 3. HELPER FUNCTIONS ======
async function sendTelegramMessage(chatId, message) {
    if (!BOT_TOKEN) return false;
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
        return data.ok;
    } catch (error) {
        console.error("Telegram error:", error);
        return false;
    }
}

async function callCoinPaymentsAPI(cmd, req = {}) {
    if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) return null;
    
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
        return data.error === 'ok' ? data.result : null;
    } catch (error) {
        console.error("CoinPayments error:", error);
        return null;
    }
}

// ====== 4. API ENDPOINTS ======
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', timestamp: Date.now() });
});

app.get('/api/config', (req, res) => {
    res.json({ adminId: ADMIN_ID, version: '6.0.0' });
});

// Users
app.post('/api/users', async (req, res) => {
    try {
        const { userId, userData } = req.body;
        console.log("📝 Creating/updating user:", userId);
        
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        
        if (doc.exists) {
            await userRef.update({
                ...userData,
                updatedAt: new Date().toISOString()
            });
        } else {
            await userRef.set({
                ...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            if (ADMIN_ID && BOT_TOKEN) {
                await sendTelegramMessage(ADMIN_ID, 
                    `🆕 <b>New User!</b>\n\n🆔 ID: <code>${userId}</code>\n👤 Name: ${userData.userName || 'User'}`
                );
            }
        }
        
        res.json({ success: true, userId });
    } catch (error) {
        console.error("User error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const doc = await db.collection('users').doc(userId).get();
        
        if (doc.exists) {
            res.json({ success: true, data: doc.data() });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { updates } = req.body;
        await db.collection('users').doc(userId).update({
            ...updates,
            updatedAt: new Date().toISOString()
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Referrals
app.post('/api/referrals', async (req, res) => {
    try {
        const { referrerId, newUserId } = req.body;
        console.log("🔗 Referral:", referrerId, "->", newUserId);
        
        const referrerRef = db.collection('users').doc(referrerId);
        const referrer = await referrerRef.get();
        
        if (referrer.exists) {
            const data = referrer.data();
            const invites = data.invites || [];
            
            if (!invites.includes(newUserId)) {
                await referrerRef.update({
                    invites: [...invites, newUserId],
                    inviteCount: (data.inviteCount || 0) + 1,
                    'balances.USDT': (data.balances?.USDT || 0) + 25,
                    totalUsdtEarned: (data.totalUsdtEarned || 0) + 25
                });
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deposit Address
app.post('/api/deposit-address', async (req, res) => {
    try {
        const { userId, currency } = req.body;
        let address = null;
        
        if (COINPAYMENTS_PUBLIC_KEY && COINPAYMENTS_PRIVATE_KEY) {
            const result = await callCoinPaymentsAPI('get_callback_address', {
                currency: currency,
                ipn_url: `https://${req.get('host')}/api/ipn/${userId}`,
                label: `twt_${userId}`
            });
            address = result?.address;
        }
        
        if (!address) {
            address = `0x${userId.slice(-40).padStart(40, '0')}`;
        }
        
        await db.collection('users').doc(userId).update({ depositAddress: address });
        res.json({ success: true, address });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deposit Requests
app.post('/api/deposit-requests', async (req, res) => {
    try {
        const deposit = req.body;
        const docRef = await db.collection('deposit_requests').add({
            ...deposit,
            timestamp: new Date().toISOString()
        });
        
        if (ADMIN_ID && BOT_TOKEN) {
            await sendTelegramMessage(ADMIN_ID,
                `💰 <b>New Deposit Request!</b>\n\n👤 User: ${deposit.userName}\n💵 Amount: ${deposit.amount} ${deposit.currency}\n🆔 ID: ${deposit.userId}`
            );
        }
        
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Withdrawal Requests
app.post('/api/withdrawals', async (req, res) => {
    try {
        const withdrawal = req.body;
        const docRef = await db.collection('withdrawals').add({
            ...withdrawal,
            timestamp: new Date().toISOString()
        });
        
        if (ADMIN_ID && BOT_TOKEN) {
            await sendTelegramMessage(ADMIN_ID,
                `💸 <b>New Withdrawal Request!</b>\n\n👤 User: ${withdrawal.userName}\n💵 Amount: ${withdrawal.amount} ${withdrawal.currency}\n📍 Address: ${withdrawal.address.slice(0, 20)}...`
            );
        }
        
        res.json({ success: true, id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Add Balance
app.post('/api/add-balance', async (req, res) => {
    try {
        const { userId, currency, amount, adminKey } = req.body;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await db.collection('users').doc(userId).update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Remove Balance
app.post('/api/remove-balance', async (req, res) => {
    try {
        const { userId, currency, amount, adminKey } = req.body;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const userDoc = await db.collection('users').doc(userId).get();
        const currentBalance = userDoc.data()?.balances?.[currency] || 0;
        
        if (currentBalance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        await db.collection('users').doc(userId).update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(-amount)
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Block User
app.post('/api/block-user', async (req, res) => {
    try {
        const { userId, adminKey } = req.body;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await db.collection('users').doc(userId).update({
            withdrawBlocked: true,
            withdrawBlockedAt: new Date().toISOString(),
            withdrawBlockedBy: ADMIN_ID
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get Pending Deposits
app.get('/api/admin/deposits', async (req, res) => {
    try {
        const adminKey = req.query.adminKey;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
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
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get Pending Withdrawals
app.get('/api/admin/withdrawals', async (req, res) => {
    try {
        const adminKey = req.query.adminKey;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
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
        res.status(500).json({ error: error.message });
    }
});

// Admin: Approve Deposit
app.post('/api/approve-deposit', async (req, res) => {
    try {
        const { txId, userId, amount, currency, adminKey } = req.body;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await db.collection('deposit_requests').doc(txId).update({
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: ADMIN_ID
        });
        
        await db.collection('users').doc(userId).update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
        });
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `✅ <b>Deposit Approved!</b>\n\nAmount: ${amount} ${currency}\nYour balance has been updated.`
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Reject Deposit
app.post('/api/reject-deposit', async (req, res) => {
    try {
        const { txId, userId, reason, adminKey } = req.body;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await db.collection('deposit_requests').doc(txId).update({
            status: 'rejected',
            reason: reason,
            rejectedAt: new Date().toISOString(),
            rejectedBy: ADMIN_ID
        });
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `❌ <b>Deposit Rejected</b>\n\nReason: ${reason}\nPlease contact support.`
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Approve Withdrawal
app.post('/api/approve-withdrawal', async (req, res) => {
    try {
        const { txId, userId, amount, currency, adminKey } = req.body;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await db.collection('withdrawals').doc(txId).update({
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: ADMIN_ID
        });
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `✅ <b>Withdrawal Approved!</b>\n\nAmount: ${amount} ${currency}\nYour withdrawal has been processed.`
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Reject Withdrawal
app.post('/api/reject-withdrawal', async (req, res) => {
    try {
        const { txId, userId, amount, currency, reason, adminKey } = req.body;
        if (adminKey !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await db.collection('withdrawals').doc(txId).update({
            status: 'rejected',
            reason: reason,
            rejectedAt: new Date().toISOString(),
            rejectedBy: ADMIN_ID
        });
        
        // Return funds to user
        await db.collection('users').doc(userId).update({
            [`balances.${currency}`]: admin.firestore.FieldValue.increment(amount)
        });
        
        if (BOT_TOKEN) {
            await sendTelegramMessage(userId,
                `❌ <b>Withdrawal Rejected</b>\n\nAmount: ${amount} ${currency}\nReason: ${reason}\nFunds have been returned.`
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send Notification
app.post('/api/send-notification', async (req, res) => {
    try {
        const { userId, message } = req.body;
        const success = await sendTelegramMessage(userId, message);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CoinPayments IPN Webhook
app.post('/api/ipn/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const ipnData = req.body;
        
        if (ipnData.status === 100) {
            await db.collection('deposit_requests').add({
                userId,
                amount: parseFloat(ipnData.amount),
                currency: ipnData.currency,
                status: 'pending',
                txId: ipnData.txn_id,
                timestamp: new Date().toISOString(),
                source: 'coinpayments'
            });
            
            if (ADMIN_ID && BOT_TOKEN) {
                await sendTelegramMessage(ADMIN_ID,
                    `💰 <b>CoinPayments Deposit!</b>\n\nUser: ${userId}\nAmount: ${ipnData.amount} ${ipnData.currency}`
                );
            }
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error("IPN error:", error);
        res.sendStatus(500);
    }
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔥 Firebase: ${admin?.apps?.length ? 'Connected' : 'Demo Mode'}`);
    console.log(`👑 Admin ID: ${ADMIN_ID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💳 CoinPayments: ${COINPAYMENTS_PUBLIC_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🤖 Bot Token: ${BOT_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
});
