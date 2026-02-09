document.addEventListener('DOMContentLoaded', pageLoad);

const API_URL = "https://script.google.com/macros/s/AKfycbwfW_YesVb1KA__q8I0LrmCJ43VSltrWqYmWjNc6DoauJyTl-B6wZ6GuWARiMTKPgxL/exec";
const MIN_PASSWORD_LENGTH = 8;
const VALUE_FLAG_PASSWORD_CHANGE = "9";

let passwordInput;
let form;
let submitButton;
let loading;

function pageLoad() {
    passwordInput = document.getElementById("passwordInput");
    form = document.getElementById('form');
    submitButton = document.getElementById("submitButton");
    loading = document.getElementById('loading');
    passwordInput.addEventListener('keypress', handleEnterKeyPress);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (loading) loading.style.display = 'block';
        await handleSubmit();
    });
}

function handleEnterKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (form) {
            if (loading) loading.style.display = 'block';
            handleSubmit();
        }
    }
}

function redirectToLogin(alertMessage) {
    const keysToClear = [
        'name', 'id', 'tiktokid', 'coin', 'like', 'rank', 'bonus', 'exp', 'nextrank', 'points',
        'medal', 'benefitslist',
        'token', 'pointusageistory', 'messagelist'
    ];
    keysToClear.forEach(key => sessionStorage.removeItem(key));

    alert(alertMessage);
    window.location.href = 'login.html';
}

async function handleSubmit() {
    const id = sessionStorage.getItem('id');
    const token = sessionStorage.getItem('token');

    if (!id) {
        redirectToLogin('ログインしてください');
        if (loading) loading.style.display = 'none';
        return;
    }

    const newPassword = passwordInput.value;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        alert(`新しいパスワードは${MIN_PASSWORD_LENGTH}文字以上で設定してください`);
        if (loading) loading.style.display = 'none';
        return;
    }

    if (submitButton) submitButton.disabled = true;
    if (passwordInput) passwordInput.disabled = true;

    const params = new URLSearchParams({
        id: id,
        passWord: newPassword,
        token: token,
        valueFlag: VALUE_FLAG_PASSWORD_CHANGE
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        if (!response.ok) {
            const errorText = await response.text();
            redirectToLogin(`サーバー通信エラー(${response.status}): 再度ログインしてください。`);
            return;
        }

        const result = await response.json();

        switch (result.status) {
            case "TOKEN_ERROR":
            case "ID_ERROR":
            case "ID_NOT_FOUND":
                redirectToLogin(result.message);
                break;
            case "SUCCESS":
                alert(result.message);
                window.location.href = 'main.html';
                break;
            default:
                alert(result.message);
                break;
        }

    } catch (error) {
        alert('通信エラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
        if (submitButton) submitButton.disabled = false;
        if (passwordInput) passwordInput.disabled = false;
        if (loading) loading.style.display = 'none';
    }
}