document.addEventListener('DOMContentLoaded', pageLoad);

function pageLoad() {
    passwordInput = document.getElementById("newNameInput");
    form = document.getElementById('changeNameForm');
    passwordInput.addEventListener('keypress', handleEnterKeyPress);
}

function handleEnterKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (form) {
            Submit();
        }
    }
}

async function Submit() {
    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    const newNameValue = DOMElements.newNameInput.value.trim();

    if (newNameValue === "") {
        alert('新しい名前を入力してください。');
        if (DOMElements.newNameInput) {
            DOMElements.newNameInput.focus();
        }
        return;
    }

    if (loading) loading.style.display = 'block';

    setFormElementsDisabled(true);

    const params = new URLSearchParams({
        id: userData.id,
        name: newNameValue,
        token: userData.token,
        valueFlag: VALUE_FLAG.CHANGE_NAME
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
                sessionStorage.setItem('name', result.name);
                window.location.reload();
                break;
            default:
                alert(result.message);
                break;
        }

    } catch (error) {
        alert("通信中にエラーが発生しました。しばらくしてから再度お試しください。");
    } finally {
        if (loading) loading.style.display = 'none';
        setFormElementsDisabled(false);
    }
}