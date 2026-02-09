const refreshButton = DOMElements.refreshPointHistoryButton;
const pointUsageTable = DOMElements.pointuselist;

document.addEventListener('DOMContentLoaded', function () {

    if (!refreshButton) {
        console.warn("更新ボタン要素 (refreshPointHistoryButton) が見つかりません。");
    }
    // 更新ボタンにイベントリスナーを設定
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            pointUsedLisRreload();
        });
    }
    updatePointUsageTableFromSession();
});

function updatePointUsageTableFromSession() {
    if (!pointUsageTable) {
        console.error("ポイント利用履歴テーブル要素 (pointuselist) が見つかりません。");
        return;
    }

    if (loading) loading.style.display = 'block';

    try {
        const rawHistoryString = sessionStorage.getItem('pointusageistory');

        const flatHistoryArray = rawHistoryString ?
            rawHistoryString.split(',').map(item => item.trim()).filter(item => item !== '') :
            [];

        const groupedHistoryData = [];
        const GROUP_SIZE = 3; // 利用日、項目名、状態 の3要素

        for (let i = 0; i < flatHistoryArray.length; i += GROUP_SIZE) {
            groupedHistoryData.push(flatHistoryArray.slice(i, i + GROUP_SIZE));
        }

        while (pointUsageTable.rows.length > 1) {
            pointUsageTable.deleteRow(1);
        }

        if (groupedHistoryData.length > 0) {
            groupedHistoryData.forEach(rowData => {
                if (Array.isArray(rowData) && rowData.length >= GROUP_SIZE) {
                    const row = pointUsageTable.insertRow(-1);

                    const dateCell = row.insertCell(0);     // 1列目 (利用日)
                    const itemNameCell = row.insertCell(1); // 2列目 (項目名)
                    const statusCell = row.insertCell(2);   // 3列目 (状態)

                    dateCell.textContent = rowData[0] || '';
                    itemNameCell.textContent = rowData[1] || '';
                    statusCell.textContent = rowData[2] || '';

                    if (rowData[2] && typeof rowData[2] === 'string') {
                        const statusClass = `status-${rowData[2].trim()}`;
                        statusCell.classList.add(statusClass);
                        // row.classList.add(statusClass); // 行全体にクラスを適用する場合
                    }
                } else {
                    console.warn("不正な形式の履歴データ行をスキップしました:", rowData);
                }
            });
        } else {
            console.log("ポイント利用履歴がありません。");
            const row = pointUsageTable.insertRow(-1); // 新しい行を挿入
            const cell = row.insertCell(0); // 新しいセルを挿入
            cell.colSpan = 3; // 3列にまたがるように設定
            cell.textContent = "ポイント利用履歴はありません。";
            cell.style.textAlign = "center"; // テキストを中央寄せ
            cell.style.padding = "10px"; // 余白を追加
        }

    } catch (error) {
        console.error("ポイント利用履歴の表示中にエラーが発生しました:", error);
        // エラーメッセージを表示する行を追加
        const row = pointUsageTable.insertRow(-1);
        const cell = row.insertCell(0);
        cell.colSpan = 3;
        cell.textContent = "履歴の読み込み中にエラーが発生しました。";
        cell.style.color = "red";
        cell.style.textAlign = "center";
        cell.style.padding = "10px";
    } finally {
        // ローディング表示を非表示 (もしあれば)
        if (loading) loading.style.display = 'none';
    }
}

async function pointUsedLisRreload() {
    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    if (loading) loading.style.display = 'block';

    setFormElementsDisabled(true);

    const params = new URLSearchParams({
        id: userData.id,
        token: userData.token,
        valueFlag: VALUE_FLAG.USED_POINT_LIST
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