// 画面要素の取得
const introScreen = document.getElementById("intro_screen")
const selectScreen = document.getElementById("character_select")
const battleScreen = document.getElementById("battle_screen")

const startBtn = document.getElementById("start_btn")
const selectOKBtn = document.getElementById("select_ok")
const changeCharBtn = document.getElementById("change_character")
const CPU_CHAR_LIST = ["goku", "vegeta", "piccoro"];

// 共通：画面切り替え関数
function showScreen(screen){
    // 全画面を非表示
    introScreen.classList.remove("active");
    selectScreen.classList.remove("active");
    battleScreen.classList.remove("active");

    // 指定画面のみ表示
    screen.classList.add("active");
}

// COMBO変数を追加
let playerCombo = 0;
let cpuCombo = 0;

// ① Intro → キャラ選択へ
startBtn.addEventListener("click", () => {
    showScreen(selectScreen);
});

// ② キャラ選択 → バトルへ

// プレイヤーが何を選んだか保存する
let selectedCharacter = null;

document.querySelectorAll(".character_card").forEach(card => {
    card.addEventListener("click", () => {

        // 選択キャラの名前(id)を保存
        selectedCharacter = card.dataset.char;

        // ボタン解禁
        selectOKBtn.disabled = false;

        // UI上で「選択された」見た目を付与 
        document.querySelectorAll(".character_card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    });
});

function getRandomCpuCharacter(playerChar) {
    // プレイヤー以外のキャラだけをフィルタリング
    const candidates = CPU_CHAR_LIST.filter(char => char !== playerChar);

    // ランダム選択
    const i = Math.floor(Math.random() * candidates.length);
    return candidates[i];
}

selectOKBtn.addEventListener("click", () => {
    if(!selectedCharacter) return;

    // バトル画面へ切り替え
    showScreen(battleScreen);

    // バトル画面へキャラ画像反映(仮)
    document.getElementById("player_img").src = `img/${selectedCharacter}.png`;
    document.getElementById("player_face").src = `img/${selectedCharacter}_face.png`;

    // ★ CPUキャラをランダムに選ぶ（プレイヤーと被らない）
    const cpuChar = getRandomCpuCharacter(selectedCharacter);

    // CPUキャラ画像セット
    document.getElementById("cpu_img").src = `img/${cpuChar}.png`;
    document.getElementById("cpu_face").src = `img/${cpuChar}_face.png`;

    // HP/COMBO/CARRYも初期化
    playerHP = 200;
    cpuHP = 200;
    playerCombo = 0;
    cpuCombo = 0;

    document.getElementById("player_hp").textContent = playerHP;
    document.getElementById("cpu_hp").textContent = cpuHP;
    document.getElementById("player_combo").textContent = playerCombo;
    document.getElementById("cpu_combo").textContent = cpuCombo;
    document.getElementById("player_carry").textContent = "OFF";

});

// ③ バトル画面 → キャラ選択へ戻る
changeCharBtn.addEventListener("click", () => {
    showScreen(selectScreen);
});


// じゃんけんロジック

// CPUの手の候補
const HANDS = ["rock", "scissors", "paper"];

// CPUの手をランダムに返す
function cpuHand() {
    const i = Math.floor(Math.random() * HANDS.length);
    return HANDS[i];
}

// 勝敗判定
function judge(player, cpu) {
    if (player === cpu) return "draw";
    if (
        (player === "rock" && cpu === "scissors") ||
        (player === "scissors" && cpu === "paper") ||
        (player === "paper" && cpu === "rock")
    ) {
        return "win";
    }
    return "lose"
}

// COMBOに応じたダメージを返す関数
function calcDamage(combo) {
    if (combo >= 2) return 40;   // 2連勝以上 40ダメージ
    if (combo === 1) return 30;  // 1連勝 30ダメージ
    return 20;                   // 通常 20ダメージ
}



// ボタンをクリックした時の処理
document.querySelectorAll(".card_btn").forEach(btn => {
    btn.addEventListener("click", () => {

        // HP0なら処理を止める
        if (playerHP <= 0 || cpuHP <= 0) return;

        const player = btn.dataset.hand;   // プレイヤーの手
        const cpu = cpuHand();             // CPUの手
        const result = judge (player, cpu);

        // 手の表示
        document.querySelector(".player_hand").textContent = handLabel(player);
        document.querySelector(".cpu_hand").textContent = handLabel(cpu);

        // 結果表示
        if (result === "win") {

            // ダメージをCOMBOに応じて決定
            const dmg = calcDamage(playerCombo);

            cpuHP -= dmg;    // プレイヤー勝ち、CPU HP減らす
            cpuHP = Math.max(0, cpuHP);  // HP下限調整(マイナスにしない)
            updateHPBars();

            // 攻撃演出
            screenShake();
            hitFlash("cpu_img");
            shockwave("cpu_img");
            aura("player");

            // COMBO
            playerCombo++;  // プレイヤー連勝
            cpuCombo = 0;   // CPUリセット

            // 表示更新
            document.getElementById("player_combo").textContent = playerCombo;
            document.getElementById("cpu_combo").textContent = cpuCombo;

            document.getElementById("cpu_hp").textContent = cpuHP;
            document.getElementById("battle_result").textContent = `You Win!! 相手に${dmg}のダメージ`;
        }
        else if (result === "lose") {

            const dmg = calcDamage(cpuCombo);

            playerHP -= dmg;    // CPU勝ち、プレイヤー HP減らす
            playerHP = Math.max(0, playerHP);  // HP下限調整(マイナスにしない)
            updateHPBars();

            // 攻撃演出
            screenShake();
            hitFlash("player_img");
            shockwave("player_img");
            aura("cpu");

            // COMBO
            cpuCombo++;  // CPU連勝
            playerCombo = 0;   // プレイヤーリセット

            // 表示更新
            document.getElementById("player_combo").textContent = playerCombo;
            document.getElementById("cpu_combo").textContent = cpuCombo;

            document.getElementById("player_hp").textContent = playerHP;
            document.getElementById("battle_result").textContent = `You Lose... あなたに${dmg}のダメージ`;
        } else {
            // あいこ 両方COMBOリセット
            playerCombo = 0;
            cpuCombo = 0;

            document.getElementById("player_combo").textContent = playerCombo;
            document.getElementById("cpu_combo").textContent = cpuCombo;

            document.getElementById("battle_result").textContent = "Draw";
        }




        // HPが0になったら勝敗確定メッセージと共にキャラ選択画面へ戻す
        if (playerHP === 0) {
            document.getElementById("battle_result").textContent = "次こそは倒す... GAME OVER";

            setTimeout(() => {
                showScreen(selectScreen);  // キャラ選択画面へ戻る
                resetBattle();             // HP/COMBOを初期化
            }, 1500);
            
            return;                        // これ以上じゃんけんを続けない
        }

        if (cpuHP <= 0) {
            document.getElementById("battle_result").textContent = "勝利！ 相手を倒した！";

            setTimeout(() => {
                showScreen(selectScreen);  // キャラ選択画面へ戻る
                resetBattle();             // HP/COMBOを初期化
            }, 1500);
            
            return;                        // これ以上じゃんけんを続けない
        }

    });
});


// HPバーの更新
function updateHPBars() {
    const pRate = playerHP / 200;  // 0〜1
    const cRate = cpuHP / 200;

    document.getElementById("player_hp_bar").style.width = (pRate * 100) + "%";
    document.getElementById("cpu_hp_bar").style.width    = (cRate * 100) + "%";
}

// 手の文字ラベル
function handLabel(hand) {
    switch(hand) {
        case "rock": return "👊";
        case "scissors": return "✌️";
        case "paper": return "🖐️";
    }
}

// HP初期値
let playerHP = 200;
let cpuHP = 200;


// リセット用の関数
function resetBattle() {
    playerHP = 200;
    cpuHP = 200;
    playerCombo = 0;
    cpuCombo = 0;

    document.getElementById("player_hp").textContent = playerHP;
    document.getElementById("cpu_hp").textContent = cpuHP;
    document.getElementById("player_combo").textContent = 0;
    document.getElementById("cpu_combo").textContent = 0;
    document.getElementById("battle_result").textContent = "👊 ✌️ 🖐️から選んで相手を攻撃せよ!!";

    document.querySelector(".player_hand").textContent = "-";
    document.querySelector(".cpu_hand").textContent = "-";

    updateHPBars();
}

// リセットボタンの処理（バトルの状態だけ初期化）
document.getElementById("reset").addEventListener("click", () => {

    // バトルの HP・手・COMBO・ログを初期化
    resetBattle();

    // メッセージも初期化
    document.getElementById("battle_result").textContent = "👊 ✌️ 🖐️から相手を選んで攻撃せよ!!";

});

// 攻撃演出：画面揺れ
function screenShake() {
    const screen = document.querySelector(".battle_area");
    screen.classList.add("shake");

    setTimeout(() => {
        screen.classList.remove("shake");
    }, 250);
}

// 攻撃演出：赤フラッシュ
function hitFlash(targetId) {
    const t = document.getElementById(targetId);
    t.classList.add("hit_flash");

    setTimeout(() => {
        t.classList.remove("hit_flash");
    }, 250);
}

// エフェクトを発動する関数
function shockwave(targetId) {
    const target = document.getElementById(targetId);
    const layer = document.getElementById("effect_layer");

    // 対象キャラの位置を取得
    const rect = target.getBoundingClientRect();

    layer.style.left = rect.left + rect.width / 2 + "px";
    layer.style.top  = rect.top  + rect.height / 2 + "px";

    layer.classList.add("shockwave");

    setTimeout(() => {
        layer.classList.remove("shockwave");
    }, 400);
}

// オーラ発動関数
function aura(targetId) {
    const auraLayer = document.getElementById(targetId + "_aura");
    auraLayer.classList.add("aura_on");

    setTimeout(() => {
        auraLayer.classList.remove("aura_on");
    }, 600);
}