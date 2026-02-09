async function Submit() {
    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    if (DOMElements.messageInput.value.trim() === "") {
        alert('内容を入力してください');
    }

    if (loading) loading.style.display = 'block';

    setFormElementsDisabled(true);

    const params = new URLSearchParams({
        userName: userData.name,
        userID: userData.tiktokid,
        main: DOMElements.messageInput.value,
        token: userData.token,
        valueFlag: VALUE_FLAG.CONTACT
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