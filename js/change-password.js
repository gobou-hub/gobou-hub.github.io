const MIN_PASSWORD_LENGTH = 8;

async function Submit() {
    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    const newPasswordValue = DOMElements.newPassInput.value;
    const confirmPasswordValue = DOMElements.confirmNewPass.value;

    if (newPasswordValue.length < MIN_PASSWORD_LENGTH) {
        alert(`新しいパスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください。`);
        if (DOMElements.newPassInput) {
            DOMElements.newPassInput.focus();
        }
        return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
        alert('新しいパスワードと確認用のパスワードが一致しません。');
        if (DOMElements.confirmNewPass) {
            DOMElements.confirmNewPass.value = "";
            DOMElements.confirmNewPass.focus();
        }
        return;
    }

    if (loading) loading.style.display = 'block';

    setFormElementsDisabled(true);

    const params = new URLSearchParams({
        id: userData.id,
        passWord: newPasswordValue,
        token: userData.token,
        valueFlag: VALUE_FLAG.CHANGE_PASS
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
            case "SUCCESS":
                redirectToLogin(result.message);
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