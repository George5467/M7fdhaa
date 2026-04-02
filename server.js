const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// ====== FIREBASE ADMIN ======
const admin = require('firebase-admin');

const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length && serviceAccount.private_key) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log("✅ Firebase Admin initialized");
}

const db = admin.firestore();

// ====== API ENDPOINTS ======

// 1. Config (بدون مفاتيح حساسة)
app.get('/api/config', (req, res) => {
    res.json({
        status: 'ok',
        adminId: process.env.ADMIN_ID || '',
        version: '5.0.0'
    });
});

// 2. إنشاء مستخدم
app.post('/api/users', async (req, res) => {
    try {
        const { userId, userData } = req.body;
        await db.collection('users').doc(userId).set(userData);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. الحصول على مستخدم
app.get('/api/users/:userId', async (req, res) => {
    try {
        const doc = await db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, data: doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. تحديث مستخدم
app.patch('/api/users/:userId', async (req, res) => {
    try {
        await db.collection('users').doc(req.params.userId).update(req.body.updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. معالجة الإحالة
app.post('/api/referrals', async (req, res) => {
    try {
        const { referrerId, newUserId } = req.body;
        const referrerRef = db.collection('users').doc(referrerId);
        const referrer = await referrerRef.get();
        
        if (referrer.exists) {
            const invites = referrer.data().invites || [];
            if (!invites.includes(newUserId)) {
                await referrerRef.update({
                    invites: [...invites, newUserId],
                    inviteCount: (referrer.data().inviteCount || 0) + 1,
                    'balances.USDT': (referrer.data().balances?.USDT || 0) + 25
                });
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. إنشاء عنوان إيداع
app.post('/api/deposit-address', async (req, res) => {
    try {
        const { userId, currency } = req.body;
        const address = `0x${userId.slice(-40).padStart(40, '0')}`;
        await db.collection('users').doc(userId).update({
            [`depositAddresses.${currency}`]: address
        });
        res.json({ success: true, address });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
