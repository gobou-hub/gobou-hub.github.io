const whatIsThisDisplay = DOMElements.whatIsThis;
const noticeDisplay = DOMElements.notice;
let pointListItems = [];

document.addEventListener('DOMContentLoaded', function () {
    const userData = getUserDataFromSession();
    const usePointSelect = DOMElements.usePointList;

    const flatArrayFromCsv = userData.benefitslist.split(',');
    pointListItems = groupArrayIntoSubArrays(flatArrayFromCsv, 5);

    while (usePointSelect.options.length > 1) {
        usePointSelect.remove(1);
    }

    if (pointListItems.length > 0) {
        pointListItems.forEach(item => {
            if (item[0] && item[1] && item[2] !== undefined && item[2] !== null && !isNaN(Number(item[2]))) {
                const option = document.createElement('option');
                option.value = item[0] + "," + item[2];
                option.textContent = item[1];
                usePointSelect.appendChild(option);

            } else {
                console.warn("無効な特典リスト項目をスキップしました:", item);
            }
        });
    } else {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "利用可能な特典はありません";
        option.disabled = true;
        usePointSelect.appendChild(option);
        usePointSelect.disabled = true;
    }
});

usePointList.addEventListener('change', (event) => {
    const selectedValue = event.target.value;

    const whatIsThisDisplay = DOMElements.whatIsThis;
    const noticeDisplay = DOMElements.notice;

    if (whatIsThisDisplay) whatIsThisDisplay.textContent = "";
    if (noticeDisplay) noticeDisplay.textContent = "";

    if (selectedValue === "選択してください" || selectedValue === "") {
        return;
    }

    const parts = selectedValue.split(',');
    const selectedItemId = parts[0];

    const foundItemArray = pointListItems.find(itemArray => {
        return Array.isArray(itemArray) && itemArray.length > 0 && String(itemArray[0]) === String(selectedItemId); // selectedItemId は既にID文字列
    });

    if (foundItemArray) {
        if (foundItemArray.length > 3 && whatIsThisDisplay) {
            whatIsThisDisplay.textContent = String(foundItemArray[3]);
        } else {
            if (whatIsThisDisplay) whatIsThisDisplay.textContent = "詳細情報が不足しています。";
        }

        if (foundItemArray.length > 4 && noticeDisplay) {
            noticeDisplay.textContent = String(foundItemArray[4]);
        } else {
            if (noticeDisplay) noticeDisplay.textContent = "";
        }

    } else {
        console.warn(`Selected item ID "${selectedItemId}" not found in the structured data.`);
        if (whatIsThisDisplay) whatIsThisDisplay.textContent = "エラー: 特典の詳細情報が見つかりません。";
        if (noticeDisplay) noticeDisplay.textContent = "";
    }
});

function groupArrayIntoSubArrays(flatArray, groupSize) {
    if (!Array.isArray(flatArray)) {
        return [];
    }
    if (typeof groupSize !== 'number' || groupSize <= 0 || !Number.isInteger(groupSize)) {
        return [];
    }

    const result = [];
    for (let i = 0; i < flatArray.length; i += groupSize) {

        result.push(flatArray.slice(i, i + groupSize));
    }
    return result;
}

async function Submit() {
    const selectedOption = usePointList.options[usePointList.selectedIndex];
    const selectedValue = DOMElements.usePointList.value;
    const displayedText = selectedOption.text;
    const values = selectedValue.split(',');

    let confirmationMessage = "下記内容でポイント使用しますか？\n\n";
    confirmationMessage += "利用項目；" + displayedText + "\n";
    confirmationMessage += "利用ポイント；" + values[1] + "\n\n";
    confirmationMessage += "※利用項目が抽選の場合、当選しなかった場合もポイントは消費されます。\n";
    confirmationMessage += "※一度利用したポイントは取り消しできません";

    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    if (selectedValue === "選択してください") {
        alert("利用項目を選択してください。");
        if (DOMElements.usePointList) DOMElements.usePointList.focus();
        return;
    }

    if (values.length < 2) {
        alert("選択項目に無効な値が含まれています。再度選択してください。");
        return;
    }

    if (!confirm(confirmationMessage)) {
        return;
    }

    if (loading) loading.style.display = 'block';

    setFormElementsDisabled(true);

    const params = new URLSearchParams({
        userID: userData.tiktokid,
        pointList: values[0],
        usePoints: values[1],
        token: userData.token,
        valueFlag: VALUE_FLAG.USE_POINT
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
                sessionStorage.setItem('points', result.points);
                sessionStorage.setItem('pointusageistory', result.pointusageistory);
                window.location.reload();
                alert(result.message);
                break;
            case "ITEM_NOT_FOUND":
            case "TIMEOUT":
            case "SHORTAGE":
                sessionStorage.setItem('points', result.points);
                sessionStorage.setItem('pointusageistory', result.pointusageistory);
                window.location.reload();
                alert(result.message);
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