// ============================================================================
// TRUST WALLET LITE - SIMPLE TEST VERSION
// ============================================================================

// ====== 1. TELEGRAM WEBAPP INITIALIZATION ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    console.log("✅ Telegram WebApp initialized");
}

// الحصول على معرف المستخدم
const userId = tg?.initDataUnsafe?.user?.id?.toString() || 
               localStorage.getItem('twt_user_id') || 
               'guest_' + Math.random().toString(36).substr(2, 9);

const userName = tg?.initDataUnsafe?.user?.first_name || 'User';

localStorage.setItem('twt_user_id', userId);

console.log("📱 User ID:", userId);
console.log("👤 Name:", userName);

// ====== 2. عرض معلومات بسيطة ======
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 App loaded");
    
    // إخفاء شاشة التحميل
    const splash = document.getElementById('splashScreen');
    if (splash) splash.style.display = 'none';
    
    // عرض معلومات المستخدم
    const container = document.getElementById('walletContainer');
    if (container) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h2>✅ App Working!</h2>
                <p><strong>User ID:</strong> ${userId}</p>
                <p><strong>Name:</strong> ${userName}</p>
                <p><strong>Telegram WebApp:</strong> ${tg ? '✅ Available' : '❌ Not available'}</p>
                <hr>
                <button onclick="testAPI()" style="padding: 10px 20px; background: #0088cc; border: none; border-radius: 10px; color: white;">Test API</button>
                <button onclick="createTestWallet()" style="padding: 10px 20px; background: #22c55e; border: none; border-radius: 10px; color: white; margin-left: 10px;">Create Wallet</button>
                <div id="apiResult" style="margin-top: 20px; padding: 10px; background: #1a1a2a; border-radius: 10px;"></div>
            </div>
        `;
    }
});

// اختبار الـ API
window.testAPI = async function() {
    const resultDiv = document.getElementById('apiResult');
    resultDiv.innerHTML = 'Testing API...';
    
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
};

// إنشاء محفظة اختبارية
window.createTestWallet = async function() {
    const resultDiv = document.getElementById('apiResult');
    resultDiv.innerHTML = 'Creating wallet...';
    
    try {
        const userData = {
            userId: userId,
            userName: userName,
            balances: { TWT: 1000, USDT: 10, BNB: 0, BTC: 0, ETH: 0 },
            createdAt: new Date().toISOString()
        };
        
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userData })
        });
        
        const data = await response.json();
        resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        
        if (data.success) {
            alert('✅ Wallet created successfully!');
        }
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.message}`;
    }
};

console.log("✅ Test version loaded");
