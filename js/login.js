document.addEventListener('DOMContentLoaded', () => {
    const TIkTokID = document.getElementById('TIkTokID');
    const Password = document.getElementById('Password');
    const LoginForm = document.getElementById('LoginForm');
    const LoginButton = document.getElementById('LoginButton');
    const GoTopButton = document.getElementById('GoTopButton');
    const Loading = document.getElementById('Loading');

    const apiUrl = "https://script.google.com/macros/s/AKfycbwfW_YesVb1KA__q8I0LrmCJ43VSltrWqYmWjNc6DoauJyTl-B6wZ6GuWARiMTKPgxL/exec";

    if (LoginForm) {
        LoginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleLogin();
        });
    }

    if (GoTopButton) {
        GoTopButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    async function handleLogin() {
        const TIkTokID_Value = TIkTokID.value.trim();
        const Password_Value = Password.value.trim();

        if (!TIkTokID_Value || !Password_Value) {
            alert('TikTokIDとパスワードを入力してください。');
            if (!TIkTokID_Value) TIkTokID.focus(); else Password.focus();
            return;
        }

        if (Loading) Loading.style.display = 'block';
        TIkTokID.disabled = true;
        Password.disabled = true;
        LoginButton.disabled = true;
        GoTopButton.disabled = true;

        try {
            const params = new URLSearchParams({
                userID: TIkTokID_Value,
                passWord: Password_Value,
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
                    TIkTokID.value = "";
                    Password.value = "";
                    TIkTokID.focus();
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
            if (Loading) Loading.style.display = 'none';
            TIkTokID.disabled = false;
            Password.disabled = false;
            LoginButton.disabled = false;
            GoTopButton.disabled = false;
        }
    }
});