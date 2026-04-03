const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// ====== FIREBASE ADMIN SDK ======
let db = null;
let admin = null;

try {
    admin = require('firebase-admin');
    
    // قراءة Secret File من Render
    const serviceAccountPath = '/etc/secrets/firebase-key.json';
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
            console.log("✅ Firebase Admin SDK initialized");
        }
        db = admin.firestore();
    } else {
        console.log("⚠️ Secret file not found, running in demo mode");
    }
} catch (error) {
    console.error("Firebase init error:", error);
}

// ====== API ENDPOINTS ======

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'online', 
        firebase: db ? 'connected' : 'demo',
        timestamp: Date.now()
    });
});

// Get config
app.get('/api/config', (req, res) => {
    res.json({
        status: 'ok',
        adminId: process.env.ADMIN_ID || '',
        version: '5.0.0'
    });
});

// Create user
app.post('/api/users', async (req, res) => {
    try {
        const { userId, userData } = req.body;
        
        if (!db) {
            return res.status(500).json({ error: 'Database not available' });
        }
        
        await db.collection('users').doc(userId).set({
            ...userData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ User created: ${userId}`);
        res.json({ success: true });
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
        
        await db.collection('users').doc(userId).update(updates);
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
                    totalUsdtEarned: (referrer.data().totalUsdtEarned || 0) + 25
                });
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Referral error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create deposit address
app.post('/api/deposit-address', async (req, res) => {
    try {
        const { userId, currency } = req.body;
        const address = `0x${userId.slice(-40).padStart(40, '0')}`;
        
        if (db) {
            await db.collection('users').doc(userId).update({
                [`depositAddresses.${currency}`]: address
            });
        }
        
        res.json({ success: true, address });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server on port ${PORT}`);
    console.log(`🔥 Firebase: ${db ? 'Connected' : 'Demo Mode'}`);
});
