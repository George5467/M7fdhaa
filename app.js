// ============================================================================
// TRUST WALLET LITE - FINAL WORKING VERSION
// ============================================================================

// ====== 1. WAIT FOR TELEGRAM WEBAPP TO BE READY ======
// هذا هو المفتاح - ننتظر حتى يتم تحميل WebApp بالكامل

function initApp() {
    console.log("🚀 Initializing app...");
    
    // محاولة الحصول على WebApp بعدة طرق
    let tg = window.Telegram?.WebApp;
    
    if (!tg && window.Telegram) {
        tg = window.Telegram.WebApp;
    }
    
    if (!tg && window.WebApp) {
        tg = window.WebApp;
    }
    
    if (tg) {
        tg.ready();
        tg.expand();
        console.log("✅ Telegram WebApp found and ready");
    } else {
        console.error("❌ Telegram WebApp not found");
        // عرض رسالة للمستخدم
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; background: #0a0b0f; color: white;">
                <div>
                    <div style="font-size: 64px;">⚠️</div>
                    <h2>Please open from Telegram</h2>
                    <p>This app must be opened from the Telegram Mini App.</p>
                    <p>Click the button below to open correctly:</p>
                    <a href="https://t.me/TrustTgWalletbot/TWT" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0088cc; border-radius: 8px; color: white; text-decoration: none;">Open in Telegram</a>
                </div>
            </div>
        `;
        return;
    }
    
    // الآن نحصل على المستخدم
    let userId = null;
    let userName = 'User';
    
    // محاولة الحصول على user.id من مصادر متعددة
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id?.toString();
        userName = tg.initDataUnsafe.user.first_name || 'User';
        console.log("✅ User from initDataUnsafe.user:", userId);
    }
    
    // إذا لم نجد، نحاول من initData
    if (!userId && tg.initData) {
        try {
            const params = new URLSearchParams(tg.initData);
            const userJson = params.get('user');
            if (userJson) {
                const user = JSON.parse(decodeURIComponent(userJson));
                userId = user.id?.toString();
                userName = user.first_name || 'User';
                console.log("✅ User from initData parsing:", userId);
            }
        } catch(e) {}
    }
    
    // إذا لم نجد، نحاول من window.location
    if (!userId) {
        const urlParams = new URLSearchParams(window.location.search);
        userId = urlParams.get('user_id') || urlParams.get('startapp') || urlParams.get('ref');
        console.log("✅ User from URL params:", userId);
    }
    
    // أخيراً، نستخدم localStorage
    if (!userId) {
        userId = localStorage.getItem('twt_user_id');
        console.log("📦 User from localStorage:", userId);
    }
    
    // إذا لم نجد أي مستخدم، نعرض خطأ
    if (!userId) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; background: #0a0b0f; color: white;">
                <div>
                    <div style="font-size: 64px;">❌</div>
                    <h2>Unable to identify user</h2>
                    <p>Please make sure you are opening this app from the Telegram bot.</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0088cc; border: none; border-radius: 8px; color: white;">Retry</button>
                </div>
            </div>
        `;
        return;
    }
    
    // حفظ المستخدم
    localStorage.setItem('twt_user_id', userId);
    
    console.log("🎉 FINAL - User ID:", userId);
    console.log("🎉 FINAL - User Name:", userName);
    
    // الآن نعرض واجهة المستخدم
    showMainApp(userId, userName);
}

// ====== 2. SHOW MAIN APP ======
function showMainApp(userId, userName) {
    // إخفاء شاشة التحميل
    const splash = document.getElementById('splashScreen');
    if (splash) splash.style.display = 'none';
    
    // إخفاء شاشة البداية
    const onboarding = document.getElementById('onboardingScreen');
    if (onboarding) onboarding.style.display = 'none';
    
    // إظهار المحتوى الرئيسي
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.style.display = 'block';
    
    // تحديث معلومات المستخدم
    const userNameEl = document.getElementById('userName');
    const userIdEl = document.getElementById('userIdDisplay');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = userName;
    if (userIdEl) userIdEl.textContent = `ID: ${userId.slice(-8)}`;
    if (userAvatarEl) userAvatarEl.textContent = userName.charAt(0).toUpperCase();
    
    // تحديث الرصيد
    const totalEl = document.getElementById('totalBalance');
    if (totalEl) totalEl.textContent = '$1,250.00';
    
    console.log("✅ App ready for user:", userName);
}

// ====== 3. HANDLE CREATE WALLET ======
function handleCreateWallet() {
    console.log("Create wallet clicked");
    // في هذا الإصدار، ننتقل مباشرة للتطبيق
    const userId = localStorage.getItem('twt_user_id');
    const userName = 'User';
    
    if (userId) {
        showMainApp(userId, userName);
    } else {
        alert("Please open this app from Telegram");
    }
}

function handleImportWallet() {
    console.log("Import wallet clicked");
    showToast("Import feature coming soon!", "info");
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ====== 4. SETUP EVENT LISTENERS ======
document.addEventListener('DOMContentLoaded', function() {
    console.log("📱 DOM loaded, setting up...");
    
    // تأخير بسيط للتأكد من تحميل Telegram WebApp
    setTimeout(initApp, 100);
    
    // ربط الأزرار
    const createBtn = document.getElementById('createWalletBtn');
    const importBtn = document.getElementById('importWalletBtn');
    
    if (createBtn) {
        createBtn.onclick = handleCreateWallet;
        console.log("✅ Create button attached");
    }
    
    if (importBtn) {
        importBtn.onclick = handleImportWallet;
        console.log("✅ Import button attached");
    }
    
    // إخفاء شاشة التحميل بعد 3 ثواني كحد أقصى
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.style.display = 'none';
    }, 3000);
});

// ====== 5. EXPOSE FUNCTIONS ======
window.handleCreateWallet = handleCreateWallet;
window.handleImportWallet = handleImportWallet;
window.showToast = showToast;

console.log("✅ app.js loaded successfully");
