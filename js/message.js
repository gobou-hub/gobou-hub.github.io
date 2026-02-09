// DOM読み込み完了時の初期化処理
document.addEventListener('DOMContentLoaded', function () {
    updateMessageListTableFromSession();
});

function updateMessageListTableFromSession() {
    const messageTable = DOMElements.messagelist;

    // テーブル要素の存在確認
    if (!messageTable) {
        console.error("メッセージリストテーブル要素 (messagelist) が見つかりません。");
        return;
    }

    // ローディング表示 (もしあれば)
    if (loading) loading.style.display = 'block';

    try {
        // 1. セッションストレージからカンマ区切りの文字列を取得
        // キー名を正確に確認してください (例: 'messagelist' または 'userMessages')
        const rawMessageString = sessionStorage.getItem('messagelist');

        // 2. 文字列をカンマで分割し、空の要素を除外
        const flatMessageArray = rawMessageString ?
            rawMessageString.split(',').map(item => item.trim()).filter(item => item !== '') :
            [];

        // 3. 5つの要素 (ID, 日付, カテゴリ, タイトル, 内容) ごとにグループ化して2次元配列を作成
        // この部分で `groupArrayIntoSubArrays` 関数を使用できます（以前提案した関数）。
        // ここでは、その関数を使わないシンプルな実装を含めます。
        const groupedMessageData = [];
        const GROUP_SIZE = 5; // ID, 日付, カテゴリ, タイトル, 内容 の5要素

        for (let i = 0; i < flatMessageArray.length; i += GROUP_SIZE) {
            // slice() は、要素が足りなくても残りを全て含むので安全です
            const rowData = flatMessageArray.slice(i, i + GROUP_SIZE);
            if (rowData.length === GROUP_SIZE) { // 完全に5要素揃っている場合のみ追加
                groupedMessageData.push(rowData);
            } else {
                console.warn("不正な形式のメッセージデータ行をスキップしました (要素不足):", rowData);
            }
        }

        // 4. 既存のデータ行をクリア (ヘッダー行は残す)
        while (messageTable.rows.length > 1) {
            messageTable.deleteRow(1); // インデックス1（最初のデータ行）から削除
        }

        // 5. グループ化されたデータを使ってテーブル行を動的に生成
        if (groupedMessageData.length > 0) {
            groupedMessageData.forEach(messageEntry => {
                // messageEntry は [ID, 日付, カテゴリ, タイトル, 内容] の形式の配列

                // データのインデックスを定数化
                const MESSAGE_ID_IDX = 0;
                const DATE_IDX = 1;
                const CATEGORY_IDX = 2;
                const TITLE_IDX = 3;
                const CONTENT_IDX = 4; // メッセージ内容のインデックス

                // データの存在と完全性を再確認
                if (messageEntry.length !== GROUP_SIZE) {
                    console.warn("不正な形式のメッセージデータエントリをスキップしました:", messageEntry);
                    return; // このエントリはスキップ
                }

                // --- メインのメッセージ表示行 (クリック可能) ---
                const mainRow = messageTable.insertRow(-1); // テーブルの末尾に新しい行を挿入
                mainRow.classList.add('message-header-row'); // スタイル用クラス
                mainRow.dataset.messageId = messageEntry[MESSAGE_ID_IDX]; // メッセージIDをデータ属性に保存

                const dateCell = mainRow.insertCell(0);
                const categoryCell = mainRow.insertCell(1);
                const titleCell = mainRow.insertCell(2);
                const deleteCell = mainRow.insertCell(3); // 削除ボタン用のセル

                dateCell.textContent = messageEntry[DATE_IDX] || '';
                categoryCell.textContent = messageEntry[CATEGORY_IDX] || '';
                titleCell.textContent = messageEntry[TITLE_IDX] || '';

                // 削除ボタンの作成
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '削除';
                deleteButton.classList.add('btn-delete-message'); // スタイル用クラス
                // 削除ボタンにメッセージIDをデータ属性として保持
                deleteButton.dataset.messageId = messageEntry[MESSAGE_ID_IDX];
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // 行のクリックイベントが発火しないように停止
                    const confirmDelete = confirm("このメッセージを削除してもよろしいですか？");
                    if (confirmDelete) {
                        deleteMessage(event.target.dataset.messageId);
                    }
                });
                deleteCell.appendChild(deleteButton);

                // --- メッセージ内容表示用の隠れた行 ---
                const contentRow = messageTable.insertRow(-1); // メイン行のすぐ下に挿入
                contentRow.classList.add('message-content-row'); // スタイル用クラス
                contentRow.style.display = 'none'; // 最初は非表示

                const contentCell = contentRow.insertCell(0);
                contentCell.colSpan = 4; // 全ての列にまたがるように設定
                // メッセージ内容の改行を考慮（\nを<br>に変換）
                contentCell.innerHTML = String(messageEntry[CONTENT_IDX] || '').replace(/\n/g, '<br>');


                // --- クリックイベントで詳細を開閉 ---
                // ID, 日付, カテゴリ, タイトル (削除ボタン以外) がクリックされたら開閉
                // cell をクリック可能にする代わりに、mainRow 全体をリスナーにする
                mainRow.addEventListener('click', () => {
                    if (contentRow.style.display === 'none') {
                        readMessage(mainRow.dataset.messageId);
                        contentRow.style.display = 'table-row'; // 行を表示
                        mainRow.classList.add('active'); // アクティブ状態のスタイル
                    } else {
                        contentRow.style.display = 'none'; // 行を非表示
                        mainRow.classList.remove('active'); // アクティブ状態を解除
                    }
                });
            });
        } else {
            // メッセージデータが全くない場合
            console.log("メッセージがありません。");
            const row = messageTable.insertRow(-1);
            const cell = row.insertCell(0);
            cell.colSpan = 4; // 全ての列にまたがる
            cell.textContent = "現在、新しいメッセージはありません。";
            cell.style.textAlign = "center";
            cell.style.padding = "10px";
        }

    } catch (error) {
        console.error("メッセージリストの表示中にエラーが発生しました:", error);
        // エラーメッセージを表示する行を追加
        const row = messageTable.insertRow(-1);
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = "メッセージの読み込み中にエラーが発生しました。";
        cell.style.color = "red";
        cell.style.textAlign = "center";
        cell.style.padding = "10px";
    } finally {
        // ローディング表示を非表示 (もしあれば)
        if (loading) loading.style.display = 'none';
    }
}

async function deleteMessage(messageID) {
    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    if (loading) loading.style.display = 'block';

    setFormElementsDisabled(true);

    const params = new URLSearchParams({
        userName: userData.name,
        id: userData.id,
        rowNumber: messageID,
        token: userData.token,
        valueFlag: VALUE_FLAG.DELETE_MESSAGE
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
                sessionStorage.setItem('messagelist', result.messagelist);
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

async function readMessage(messageID) {
    const userData = getUserDataFromSession();

    if (!userData || !userData.id) {
        redirectToLogin('ログインしてください。');
        return;
    }

    const params = new URLSearchParams({
        userName: userData.name,
        id: userData.id,
        rowNumber: messageID,
        token: userData.token,
        valueFlag: VALUE_FLAG.READ_MESSAGE
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
                break;
            default:
                alert(result.message);
                break;
        }

    } catch (error) {
        return;
    }
}