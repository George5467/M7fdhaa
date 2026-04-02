const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Firebase Admin (من متغيرات البيئة في Render)
let db = null;
try {
    if (process.env.FIREBASE_PROJECT_ID) {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            console.log("🔥 Firebase Admin initialized");
        }
        db = admin.firestore();
    }
} catch (error) {
    console.error("Firebase error:", error);
}

// ====== API ENDPOINTS ======

// Config
app.get('/api/config', (req, res) => {
    res.json({
        status: 'ok',
        adminId: process.env.ADMIN_ID || '',
        timestamp: Date.now()
    });
});

// Create user
app.post('/api/create-user', async (req, res) => {
    try {
        const { userId, userData } = req.body;
        if (db) {
            await db.collection('users').doc(userId).set(userData);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (db) {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                res.json({ success: true, data: doc.data() });
            } else {
                res.json({ success: false });
            }
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Update user
app.post('/api/update-user', async (req, res) => {
    try {
        const { userId, updates } = req.body;
        if (db) {
            await db.collection('users').doc(userId).update(updates);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Create deposit address
app.post('/api/create-deposit-address', async (req, res) => {
    try {
        const { userId, currency } = req.body;
        const mockAddress = `0x${userId.slice(-40).padStart(40, '0')}`;
        if (db) {
            await db.collection('users').doc(userId).update({
                [`depositAddresses.${currency}`]: mockAddress
            });
        }
        res.json({ success: true, address: mockAddress });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Process invite
app.post('/api/process-invite', async (req, res) => {
    try {
        const { inviterId, newUserId } = req.body;
        if (db && inviterId && newUserId) {
            const inviterRef = db.collection('users').doc(inviterId);
            const inviter = await inviterRef.get();
            if (inviter.exists) {
                const invites = inviter.data()?.invites || [];
                if (!invites.includes(newUserId)) {
                    await inviterRef.update({
                        invites: [...invites, newUserId],
                        inviteCount: (inviter.data()?.inviteCount || 0) + 1,
                        'balances.USDT': (inviter.data()?.balances?.USDT || 0) + 25,
                        totalUsdtEarned: (inviter.data()?.totalUsdtEarned || 0) + 25
                    });
                }
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', version: '4.0.0' });
});

// Serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
