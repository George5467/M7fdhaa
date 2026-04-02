const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Firebase Admin - Uses Render Environment Variables
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

// Config - sends admin ID to frontend
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

// Create deposit address (stores in Firebase)
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

// Get user by deposit address
app.post('/api/get-user-by-address', async (req, res) => {
    try {
        const { address, currency } = req.body;
        if (!db) {
            res.json({ success: false, error: "Firebase not available" });
            return;
        }
        
        const usersSnapshot = await db.collection('users').get();
        let foundUser = null;
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const depositAddresses = userData.depositAddresses || {};
            if (depositAddresses[currency] === address) {
                foundUser = { userId: doc.id, ...userData };
            }
        });
        
        if (foundUser) {
            res.json({ success: true, user: foundUser });
        } else {
            res.json({ success: false, error: "No user found with this address" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by Telegram ID
app.get('/api/get-user-by-id/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (db) {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                res.json({ success: true, user: { userId: doc.id, ...doc.data() } });
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

// Process invite
app.post('/api/process-invite', async (req, res) => {
    try {
        const { inviterId, newUserId } = req.body;
        if (db && inviterId && newUserId) {
            const inviterRef = db.collection('users').doc(inviterId);
            const inviter = await inviterRef.get();
            if (inviter.exists) {
                const referrals = inviter.data()?.referrals || [];
                if (!referrals.includes(newUserId)) {
                    await inviterRef.update({
                        referrals: [...referrals, newUserId],
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

// Add notification
app.post('/api/add-notification', async (req, res) => {
    try {
        const { userId, message, type } = req.body;
        if (db && userId) {
            const notification = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                message: message,
                type: type || 'info',
                read: false,
                timestamp: new Date().toISOString()
            };
            
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const notifications = userDoc.data()?.notifications || [];
            notifications.push(notification);
            await userRef.update({ notifications: notifications });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', version: '5.0.0' });
});

// Serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
