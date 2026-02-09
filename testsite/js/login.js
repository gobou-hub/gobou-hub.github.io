// --- メンテナンス設定 ---
const IS_MAINTENANCE_MODE = false;
const MAINTENANCE_PAGE_URL = 'maintenance.html';
// --- 設定ここまで ---

(function () {
    if (!IS_MAINTENANCE_MODE) {
        return;
    }

    try {
        const currentUrl = new URL(window.location.href);
        const maintenanceUrl = new URL(MAINTENANCE_PAGE_URL, window.location.origin);
        const isCurrentlyOnMaintenancePage = currentUrl.pathname === maintenanceUrl.pathname;

        if (!isCurrentlyOnMaintenancePage) {
            window.location.href = MAINTENANCE_PAGE_URL;
            return;
        }
    } catch (e) {
        console.error("Maintenance mode URL processing error:", e);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const tiktokIdInput = document.getElementById('TIkTokID');
    const passwordInput = document.getElementById('Password');
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('LoginButton');
    const goTopButton = document.getElementById('GoTopButton');
    const loading = document.getElementById('Loading');

    const apiUrl = "https://script.google.com/macros/s/AKfycbwfW_YesVb1KA__q8I0LrmCJ43VSltrWqYmWjNc6DoauJyTl-B6wZ6GuWARiMTKPgxL/exec";

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleLogin();
        });
    }

    if (goTopButton) {
        goTopButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    async function handleLogin() {
        const tiktokId = tiktokIdInput.value.trim();
        const password = passwordInput.value.trim();

        if (!tiktokId || !password) {
            alert('TikTokIDとパスワードを入力してください。');
            if (!tiktokId) tiktokIdInput.focus(); else passwordInput.focus();
            return;
        }

        if (loading) loading.style.display = 'block';
        tiktokIdInput.disabled = true;
        passwordInput.disabled = true;
        loginButton.disabled = true;
        goTopButton.disabled = true;

        try {
            const params = new URLSearchParams({
                userID: tiktokId,
                passWord: password,
                valueFlag: "1"
            });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert("通信中にエラーが発生しました。しばらくしてから再度お試しください。");
                return;
            }

            const userData = await response.json();

            switch (userData.status) {
                case "MAINTENANCE":
                    alert(userData.message);
                    window.location.href = 'maintenance.html';
                    break;
                case "AUTH_ERROR":
                case "LOGIN_FAILED":
                    alert(userData.message);
                    tiktokIdInput.value = "";
                    passwordInput.value = "";
                    tiktokIdInput.focus();
                    break;
                case "SUCCESS":
                    const propertiesToStore = typeof SESSION_STORAGE_KEYS !== 'undefined'
                        ? SESSION_STORAGE_KEYS
                        : [
                            'name', 'id', 'tiktokid', 'coin', 'like', 'rank', 'bonus', 'exp', 'nextrank', 'points',
                            'medal', 'benefitslist',
                            'token', 'pointusageistory', 'messagelist'
                        ];
                    if (userData.data) {
                        propertiesToStore.forEach(prop => {
                            if (userData.data[prop] !== undefined) {
                                sessionStorage.setItem(prop, userData.data[prop]);
                            } else {
                                console.warn(`API response missing expected property: ${prop}`);
                                sessionStorage.removeItem(prop);
                            }
                        });
                    } else {
                        console.error("API response missing 'data' property on SUCCESS.");
                        alert("ログインは成功しましたが、ユーザーデータが取得できませんでした。");
                        return;
                    }

                    if (userData.data.first_password_flag) {
                        window.location.href = 'first-password.html';
                    } else {
                        window.location.href = 'main.html';
                    }
                    return;

                default:
                    alert(userData.message);
                    break;
            }

        } catch (error) {
            alert("通信中にエラーが発生しました。しばらくしてから再度お試しください。");
        } finally {
            if (loading) loading.style.display = 'none';
            tiktokIdInput.disabled = false;
            passwordInput.disabled = false;
            loginButton.disabled = false;
            goTopButton.disabled = false;
        }
    }
});