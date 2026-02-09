const DOMElements = {
    //ユーザー情報
    userNameDisplay: document.getElementById("UserName"),
    tikTokIdLink: document.getElementById("TIkTokID"),

    rankDisplay: document.getElementById("Rank"),
    expDisplay: document.getElementById("ExperiencePoints"),
    nextRankDisplay: document.getElementById("NextRank"),

    coinDisplay: document.getElementById("Coin"),
    likeDisplay: document.getElementById("Like"),

    bonusDisplay: document.getElementById("Bonus"),
    pointsDisplay: document.getElementById("Point"),

    medal01Image: document.getElementById("Medal01"),
    medal02Image: document.getElementById("Medal02"),
    medal03Image: document.getElementById("Medal03"),

    //メダル欄
    medalCollectionContainer: document.getElementById("MedalCollection"),

    refreshButton: document.getElementById("refreshButton"),
    //ログアウトボタン
    logoutButton: document.getElementById("LogoutButton"),

    //ページ移行ボタン
    contact: document.getElementById("goToContactPageButton"),
    messages: document.getElementById("goToMessagesPageButton"),
    changePass: document.getElementById("goToChangePassPageButton"),
    changeName: document.getElementById("goToChangeNamePageButton"),
    usePoint: document.getElementById("goToUsePointPageButton"),
    usedPoints: document.getElementById("goToUsedPointsPageButton"),
    gameRecord: document.getElementById("goToUsedGameRecordPageButton"),

    //お問い合わせ
    messageInput: document.getElementById("messageInput"),
    SubmitButton: document.getElementById("SubmitButton"),

    //名前変更フォーム要素
    newNameInput: document.getElementById("newNameInput"),

    //パスワード変更
    newPassInput: document.getElementById("newPassInput"),
    confirmNewPass: document.getElementById("confirmNewPass"),

    //ポイント使用
    usePointList: document.getElementById("usePointList"),
    whatIsThis: document.getElementById("whatIsThis"),
    notice: document.getElementById("notice"),

    //ポイント使用履歴
    pointuselist: document.getElementById("pointuselist"),
    refreshPointHistoryButton: document.getElementById("refreshPointHistoryButton"),

    //メッセージ
    messagelist: document.getElementById("messagelist"),
    messageDeleteButton: document.getElementsByClassName("btn-delete-message"),

    loading: document.getElementById('loading')
};

const API_URL = "https://script.google.com/macros/s/AKfycbwfW_YesVb1KA__q8I0LrmCJ43VSltrWqYmWjNc6DoauJyTl-B6wZ6GuWARiMTKPgxL/exec";

const VALUE_FLAG = {
    CONTACT: "2",
    CHANGE_PASS: "3",
    CHANGE_NAME: "4",
    USE_POINT: "5",
    USED_POINT_LIST: "6",
    DELETE_MESSAGE: "7",
    READ_MESSAGE: "8"
};

const SESSION_STORAGE_KEYS = [
    'name', 'id', 'tiktokid', 'coin', 'like', 'rank', 'bonus', 'exp', 'nextrank', 'points',
    'medal', 'benefitslist',
    'token', 'pointusageistory', 'messagelist'
];

// DOM読み込み完了時の初期化処理
document.addEventListener('DOMContentLoaded', function () {
    const userData = getUserDataFromSession();
    updateUserDisplay(userData);
    setupEventListeners();
});

// セッションストレージからユーザーデータを取得
function getUserDataFromSession() {
    const userData = {};
    SESSION_STORAGE_KEYS.forEach(key => {
        userData[key] = sessionStorage.getItem(key);
    });
    return userData;
}

// イベントリスナーを設定
function setupEventListeners() {
    //アクションボタン
    if (DOMElements.SubmitButton) {
        DOMElements.SubmitButton.addEventListener('click', Submit);
    }
    // 更新ボタン
    if (DOMElements.refreshButton) {
        DOMElements.refreshButton.addEventListener('click', refresh);
    }
    // ログアウトボタン
    if (DOMElements.logoutButton) {
        DOMElements.logoutButton.addEventListener('click', logout);
    }

    // ナビゲーションボタンのページ遷移
    const navigationMap = {
        contact: 'contact.html',
        messages: 'message.html',
        changePass: 'change-password.html',
        changeName: 'change-name.html',
        usePoint: 'use-point.html',
        usedPoints: 'used-points.html',
        gameRecord: 'game-record.html'
    };

    Object.keys(navigationMap).forEach(key => {
        if (DOMElements[key]) {
            DOMElements[key].addEventListener('click', (event) => {
                window.location.href = navigationMap[key];
            });
        }
    });
}

// ユーザー情報をDOMに反映
function updateUserDisplay(userData) {
    if (DOMElements.userNameDisplay) DOMElements.userNameDisplay.textContent = `${userData.name || ''}`;
    if (DOMElements.tikTokIdLink) DOMElements.tikTokIdLink.textContent = `${userData.tiktokid || ''}`;

    // 各ステータス項目の表示/非表示と値設定 (要素が存在する場合のみ)
    const updateStatusItem = (displayElement, value) => {
        if (displayElement) { // 値を表示するspan要素
            if (displayElement.parentElement && displayElement.parentElement.classList.contains('status-item')) {
                displayElement.parentElement.style.display = value ? "block" : "none";
            }
            if (value) displayElement.textContent = `${value}`;
            else displayElement.textContent = ''; // 値がない場合は空にする
        }
    };

    updateStatusItem(DOMElements.coinDisplay, userData.coin);
    updateStatusItem(DOMElements.likeDisplay, userData.like);
    updateStatusItem(DOMElements.rankDisplay, userData.rank);
    updateStatusItem(DOMElements.bonusDisplay, userData.bonus);
    updateStatusItem(DOMElements.pointsDisplay, userData.points);
    updateStatusItem(DOMElements.expDisplay, userData.exp);
    updateStatusItem(DOMElements.nextRankDisplay, userData.nextrank);


    if (DOMElements.rankDisplay && userData.rank === "★") {
        DOMElements.rankDisplay.style.color = "#ffd700";
    }

    updateMedalDisplayFromSession()
}

function updateMedalDisplayFromSession() {
    const medalContainer = DOMElements.medalCollectionContainer;

    // 1. コンテナ要素が存在するか確認
    if (!medalContainer) {
        console.warn("MedalCollection コンテナ要素が見つかりません。メダルを表示できません。");
        return;
    }

    const medalUrlsString = sessionStorage.getItem('medal');

    const medalUrls = medalUrlsString ?
        medalUrlsString.split(',').map(url => url.trim()).filter(url => url !== '') :
        [];

    let anyMedalDisplayed = false;

    if (medalUrls.length > 0) {
        medalUrls.forEach(url => {
            const imgElement = document.createElement('img');
            imgElement.src = url; // 画像のURLを設定
            imgElement.width = 40; // 幅を設定
            imgElement.height = 40; // 高さを設定
            imgElement.alt = "獲得メダル"; // アクセシビリティのためのalt属性
            imgElement.classList.add('dynamic-medal'); // 後でクリアするためのクラスを追加
            imgElement.style.display = 'inline-block'; // 表示形式を設定

            medalContainer.appendChild(imgElement); // コンテナに追加
            anyMedalDisplayed = true;
        });
    }

    if (anyMedalDisplayed) {
        medalContainer.style.display = 'block'; // または 'flex', 'grid' など適切な親要素のスタイル
    } else {
        medalContainer.style.display = 'none'; // メダルがない場合はコンテナを非表示
    }
}

// フォーム要素の有効/無効を切り替え
function setFormElementsDisabled(disabled) {
    const elements = [
        DOMElements.refreshButton,
        DOMElements.logoutButton,
        DOMElements.contact,
        DOMElements.messages,
        DOMElements.changePass,
        DOMElements.changeName,
        DOMElements.usePoint,
        DOMElements.usedPoints,
        DOMElements.messageInput,
        DOMElements.newNameInput,
        DOMElements.newPassInput,
        DOMElements.confirmNewPass,
        DOMElements.usePointList,
        DOMElements.SubmitButton,
        DOMElements.refreshPointHistoryButton,
        DOMElements.gameRecord
    ].filter(el => el);

    for (let i = 0; i < DOMElements.messageDeleteButton.length; i++) {
        DOMElements.messageDeleteButton[i].disabled = disabled;
    }
    elements.forEach(el => {
        if (el) el.disabled = disabled;
    });
}

async function refresh() {
    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    const params = new URLSearchParams({
        id: userData.id,
        token: userData.token,
        valueFlag: "10"
    });

    setFormElementsDisabled(true);
    if (loading) loading.style.display = 'block';

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
            case "MAINTENANCE":
                alert(result.message);
                window.location.href = 'maintenance.html';
                break;
            case "TOKEN_ERROR":
            case "ID_ERROR":
            case "ID_NOT_FOUND":
                redirectToLogin(result.message);
                break;
            case "SUCCESS":
                const propertiesToStore = typeof SESSION_STORAGE_KEYS !== 'undefined'
                    ? SESSION_STORAGE_KEYS
                    : [
                        'name', 'id', 'tiktokid', 'coin', 'like', 'rank', 'bonus', 'exp', 'nextrank', 'points',
                        'medal', 'benefitslist',
                        'token', 'pointusageistory', 'messagelist'
                    ];
                if (result.data) {
                    propertiesToStore.forEach(prop => {
                        if (result.data[prop] !== undefined) {
                            sessionStorage.setItem(prop, result.data[prop]);
                        } else {
                            console.warn(`API response missing expected property: ${prop}`);
                            sessionStorage.removeItem(prop);
                        }
                    });
                } else {
                    console.error("API response missing 'data' property on SUCCESS.");
                    alert("ユーザーデータが取得できませんでした。");
                    return;
                }

                window.location.reload();

                return;
            default:
                alert(result.message);
                break;
        }

    } catch (error) {
        console.log(error);
        alert("通信中にエラーが発生しました。しばらくしてから再度お試しください。");
    } finally {
        if (loading) loading.style.display = 'none';
        setFormElementsDisabled(false);
    }
}

// ログインページへリダイレクト（セッションクリア含む）
function redirectToLogin(alertMessage) {
    SESSION_STORAGE_KEYS.forEach(key => sessionStorage.removeItem(key));
    alert(alertMessage);
    window.location.href = 'login.html';
}

// ログアウト処理
function logout() {
    SESSION_STORAGE_KEYS.forEach(key => sessionStorage.removeItem(key));
    window.location.href = 'login.html';
}