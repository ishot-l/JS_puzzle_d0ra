const BOARD_HEIGHT = 5;
const BOARD_WIDTH = 6;

const JEWEL_CLASS_NAME = [
    'None',
    'Heal',
    'Fire',
    'Aqua',
    'Leaf',
    'Light',
    'Dark'
];

let selectedX = -1;
let selectedY = -1;
let selectMoved = false;

function getRandom(min, max){
    let random = Math.floor(Math.random() * (max + 1 - min)) + min;
    return random;
}

function getTouchedArea(event, puzzlePosition){
    let touchX = event.changedTouches[0].pageX;
    let touchY = event.changedTouches[0].pageY;

    let touchXarea = Math.floor( (touchX - puzzlePosition.left) / ((puzzlePosition.right - puzzlePosition.left) / BOARD_WIDTH));
    let touchYarea = Math.floor( (touchY - puzzlePosition.top) / ((puzzlePosition.bottom - puzzlePosition.top) / BOARD_HEIGHT));

    if(touchXarea < 0) touchXarea = 0;
    if(touchXarea >= BOARD_WIDTH) touchXarea = BOARD_WIDTH - 1;
    if(touchYarea < 0) touchYarea = 0;
    if(touchYarea >= BOARD_HEIGHT) touchYarea = BOARD_HEIGHT - 1;

    return {touchXarea, touchYarea};
}

function updateSelectedJewel(){
    let beforeSelected = document.getElementsByClassName('Selected');
    if (beforeSelected.length > 0){
        for(let i=0; i < beforeSelected.length; i++){
            beforeSelected[i].classList.remove('Selected');
        }
    }
    let SelectedJewel = document.getElementById(`${selectedY}_${selectedX}`);
    if (SelectedJewel){
        SelectedJewel.classList.add('Selected');
    }
}

function swapJewel(x1, y1, x2, y2){
    let temp = board[y1][x1];

    document.getElementById(`${y1}_${x1}`).classList.remove(JEWEL_CLASS_NAME[board[y1][x1]]);
    board[y1][x1] = board[y2][x2];
    document.getElementById(`${y1}_${x1}`).classList.add(JEWEL_CLASS_NAME[board[y1][x1]]);
    
    document.getElementById(`${y2}_${x2}`).classList.remove(JEWEL_CLASS_NAME[board[y2][x2]]);
    board[y2][x2] = temp;
    document.getElementById(`${y2}_${x2}`).classList.add(JEWEL_CLASS_NAME[board[y2][x2]]);

}

function drawing() {
    while(Puzzle.firstChild){
        Puzzle.removeChild(Puzzle.firstChild);
    }

    for(let row=0; row<BOARD_HEIGHT; row++){
        for(let col=0; col<BOARD_WIDTH; col++){
            let Jewel = document.createElement('span');
            Jewel.classList.add('Jewel');
            Jewel.classList.add(JEWEL_CLASS_NAME[board[row][col]]);
            if (col === selectedX && row === selectedY) Jewel.classList.add('Selected');
            Jewel.setAttribute('id', `${row}_${col}`);
            Puzzle.appendChild(Jewel);
        }
    }    
}

// パズル処理関連
let ischecked = new Array(BOARD_HEIGHT);
for(let i=0; i<BOARD_HEIGHT; i++){
    ischecked[i] = new Array(BOARD_WIDTH);
    for(let j=0; j < BOARD_WIDTH; j++){
        ischecked[i][j] = false;
    }
}

let contiH = new Array(BOARD_HEIGHT);
for(let i=0; i<BOARD_HEIGHT; i++){
    contiH[i] = new Array(BOARD_WIDTH);
    for(let j=0; j < BOARD_WIDTH; j++){
        contiH[i][j] = 0;
    }
}

let contiV = new Array(BOARD_HEIGHT);
for(let i=0; i<BOARD_HEIGHT; i++){
    contiV[i] = new Array(BOARD_WIDTH);
    for(let j=0; j < BOARD_WIDTH; j++){
        contiV[i][j] = 0;
    }
}

function ResetCheckedFlag(){
    for(let i=0; i<BOARD_HEIGHT; i++){
        ischecked[i] = new Array(BOARD_WIDTH);
        for(let j=0; j < BOARD_WIDTH; j++){
            ischecked[i][j] = false;
        }
    }
}

function CountConnectedDrop(x, y, type, count, is_horiz){
    /*
    ・範囲外の場合
    ・チェック済みの場合
    ・タイプが異なる場合
    ・タイプがNoneな場合（すでに消されている）
    は数えない
    */
    if(x < 0 || y < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT ||
        ischecked[y][x] === true || board[y][x] !== type || type === 0){
        return count;
    }

    count += 1;
    ischecked[y][x] = true;

    if(is_horiz){
        count = CountConnectedDrop(x-1, y, type, count, is_horiz);
        count = CountConnectedDrop(x+1, y, type, count, is_horiz);
    }else{
        count = CountConnectedDrop(x, y-1, type, count, is_horiz);
        count = CountConnectedDrop(x, y+1, type, count, is_horiz);
    } 

    return count;
}

function RemoveDrop(x, y, type){
    if(x < 0 || y < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT ||
        board[y][x] !== type || type === 0){
        return false;
    }

    document.getElementById(`${y}_${x}`).classList.remove(JEWEL_CLASS_NAME[board[y][x]]);
    board[y][x] = 0;
    document.getElementById(`${y}_${x}`).classList.add(JEWEL_CLASS_NAME[board[y][x]]);
    
    if(contiH[y][x] >= 3){
        RemoveDrop(x-1, y, type);
        RemoveDrop(x+1, y, type);
    }

    if(contiV[y][x] >= 3){
        RemoveDrop(x, y-1, type);
        RemoveDrop(x, y+1, type);
    }

    return true;
}


// コンボ回数
let combocount = 1;

function PuzzleProcessing(){
    // boardから消えるところを抜き出す
    ResetCheckedFlag();

    let removedrops = [];

    // 横を見ていく
    for(let i=0; i<BOARD_HEIGHT; i++){
        for(let j=0; j < BOARD_WIDTH; j++){
            count = CountConnectedDrop(j, i, board[i][j], 0, true);

            if(count === 0){
                contiH[i][j] = contiH[i][j-1];
            }else{
                contiH[i][j] = count;
            }

        }
    }

    ResetCheckedFlag();

    // 縦を見ていく
    for(let i=0; i<BOARD_HEIGHT; i++){
        for(let j=0; j < BOARD_WIDTH; j++){
            count = CountConnectedDrop(j, i, board[i][j], 0, false);
            if(count === 0){
                contiV[i][j] = contiV[i-1][j];
            }else{
                contiV[i][j] = count;
            }
        }
    }

    //ここエラーおきないか？
    dropcheck = DropCheck();

    DropCheckLoop();

}

function DropCheckLoop() {
    console.log("DropCheckLoop");
    let isCleared = false;

    dropcheckloop = setInterval(()=>{
        ret = dropcheck.next(combocount);
        if(ret.done){
            if(isCleared){
                DropFallLoop();
            }else{
                // 余分に足しちゃった分を消す
                combocount--;
                NextTurnProcess();
                // DeleteComboCounter();
                console.log("次のターン");
            }
            clearInterval(dropcheckloop);
        }else{
            isCleared = true;
            combocount++;
        }
    }, 500);
}

function *DropCheck() {
    // 消す処理
    for(let i=0; i<BOARD_HEIGHT; i++){
        for(let j=0; j < BOARD_WIDTH; j++){
            if (contiH[i][j] >= 3 || contiV[i][j] >= 3) {
                if(RemoveDrop(j, i, board[i][j], true)){
                    AddComboCounter(i, j);
                    if(IsSoundEffect) sound_combo();
                    yield;
                }
            }
        }
    }
}

function DropFallLoop() {
    console.log("DropFallLoop");
    dropfallloop = setInterval(()=>{
        if(!DropFall()){
            console.log("ドロップ落ち切った");
            PuzzleProcessing();
            clearInterval(dropfallloop);
        }
    }, 100);
}

function DropFall() {
    let dropped = false;

    for(j=0; j<BOARD_WIDTH; j++){
        fallthiscol = false;
        for(i = BOARD_HEIGHT-1; i>=0; i--){
            if(fallthiscol){
                swapJewel(j, i, j, i+1);
            }
            if(board[i][j] == 0){
                fallthiscol = true;
            }
            if(i == 0 && fallthiscol){
                document.getElementById(`${i}_${j}`).classList.remove(JEWEL_CLASS_NAME[board[i][j]]);
                board[i][j] = getRandom(1, 6);
                document.getElementById(`${i}_${j}`).classList.add(JEWEL_CLASS_NAME[board[i][j]]);
            }
        }
        if(fallthiscol) dropped = true;
    }
    return dropped;
}



// 何コンボか表示する
function AddComboCounter(i, j){
    let dropposition = document.getElementById(`${i}_${j}`).getBoundingClientRect();

    let counter = document.createElement('div');
    counter.classList.add('ComboCounter');
    counter.textContent = `${combocount}コンボ`;
    
    counter.style.top = Math.round(dropposition.top + 10).toString() + 'px';
    counter.style.left = Math.round(dropposition.left + 20).toString() + 'px';
    root.appendChild(counter);
}

function DeleteComboCounter(){
    const elements = document.getElementsByClassName('ComboCounter');
    while (elements.length) {
        elements.item(0).remove()
    }
}

let board = new Array(BOARD_HEIGHT);
for(let i=0; i<BOARD_HEIGHT; i++){
    board[i] = new Array(BOARD_WIDTH);
    for(let j=0; j < BOARD_WIDTH; j++){
        board[i][j] = getRandom(1, 6);
    }
}

// 次のターンへ進む処理
function NextTurnProcess(){
    // 敵の攻撃とか
    state = 3;

    root.dispatchEvent(new Event('TurnChange'));

    // コンボカウントをリセット
    combocount = 1;

    DeleteComboCounter();

    // おわったら
    state = 0;
    
}


// パズル画面
let BottomWindow = document.getElementById('BottomWindow');
let Puzzle = document.createElement('div');
Puzzle.classList.add('Puzzle');
BottomWindow.appendChild(Puzzle);

// パズル画面を作成したのでドロップ追加
drawing();

// 音声の初期化
let DropSound = document.getElementById('sound-drop');
let ComboSound = document.getElementById('sound-combo');

function sound_drop()
{
    DropSound.currentTime = 0;

    const playPromise = DropSound.play();
    if (playPromise !== null){
        playPromise.catch(() => { DropSound.play(); });
    }
}

function sound_combo()
{
    ComboSound.currentTime = 0;

    const playPromise = ComboSound.play();
    if (playPromise !== null){
        playPromise.catch(() => { ComboSound.play(); });
    }
}



// rootでタッチ捕捉イベント
let root = document.querySelector('.root');
let puzzlePosition = Puzzle.getBoundingClientRect();

// パズル中についてくるドロップ
let HandingDrop = document.createElement('div');
HandingDrop.classList.add('Jewel');
HandingDrop.setAttribute('id', 'HandingJewel');
root.appendChild(HandingDrop);

let handing_info = HandingDrop.getBoundingClientRect();
let HandingDropWidth = (puzzlePosition.right - puzzlePosition.left) * 0.16;
let HandingDropHeight = (puzzlePosition.bottom - puzzlePosition.top) * 0.19;


// 持っているドロップのタイプ
HandingDropType = 0;

// 
function appearHandingDrop(){
    HandingDrop.style.display = 'block';
    HandingDrop.classList.add(JEWEL_CLASS_NAME[HandingDropType]);
}

function disappearHandingDrop(){
    HandingDrop.style.display = 'none';
    HandingDrop.classList.remove(JEWEL_CLASS_NAME[HandingDropType]);
}

// 持っているドロップ移動させる関数
function MoveHandingDrop(event){
    // 半分左上に移動させる必要があるな
    HandingDrop.style.top = Math.round(event.changedTouches[0].pageY - (HandingDropWidth / 2)).toString() + 'px';
    HandingDrop.style.left = Math.round(event.changedTouches[0].pageX - (HandingDropHeight / 2)).toString() + 'px';

}

// 設定とか

/*
0:パズル待ち
1:パズル中
2:パズル後処理（消える・落ちコン）
3:ターン移動処理（攻撃とか）
-1: モーダル等イベント待機中
*/
let state = 0;

// 音声流すかどうか
let IsSoundEffect = false;


// 音声切り替えボタン
let SoundButton = document.querySelector('.SoundButton');


SoundButton.addEventListener('touchstart', function(event) {
    if(!IsSoundEffect){
        IsSoundEffect = true;
        SoundButton.classList.remove('fa-volume-mute');
        SoundButton.classList.add('fa-volume-up');
    }else{
        IsSoundEffect = false;
        SoundButton.classList.remove('fa-volume-up');
        SoundButton.classList.add('fa-volume-mute');
    }
}, false);

// はじめからボタン
let ReloadButton = document.querySelector('.ReloadButton')
ReloadButton.addEventListener('touchstart', ()=>{
    window.location.reload();
}, false);


root.addEventListener('touchstart', function(event) {
    if(state !== 0){
        return false;
    }
    
    let touchX = event.changedTouches[0].pageX;
    let touchY = event.changedTouches[0].pageY;
    selectMoved = false;

    if(!(puzzlePosition.left <= touchX && puzzlePosition.right >= touchX && puzzlePosition.top <= touchY && puzzlePosition.bottom >= touchY)){
        return false;
    }

    // 正しい範囲でタップしているなら
    state = 1;

    let {touchXarea, touchYarea} = getTouchedArea(event, puzzlePosition);
    
    selectedX = touchXarea;
    selectedY = touchYarea;

    updateSelectedJewel();

    // HandingDropTypeの指定をわすれずに
    HandingDropType = board[selectedY][selectedX];

    appearHandingDrop();
    MoveHandingDrop(event);

}, false);

root.addEventListener('touchmove', function(event) {
    event.preventDefault(); // タッチによる画面スクロールを止める
    if(state !== 1){
        return false;
    }

    let {touchXarea, touchYarea} = getTouchedArea(event, puzzlePosition);

    MoveHandingDrop(event);

    if(touchXarea == selectedX && touchYarea == selectedY) return false;

    // ドロップが移動した
    if(IsSoundEffect) sound_drop();

    selectMoved = true;

    swapJewel(touchXarea, touchYarea, selectedX, selectedY);

    selectedX = touchXarea;
    selectedY = touchYarea;

    updateSelectedJewel();

}, false);

root.addEventListener('touchend', function(event) {
    if(state == -1){
        return;
    }
    // 消したりいろんな処理
    selectedX = -1;
    selectedY = -1;
    updateSelectedJewel();
    disappearHandingDrop();

    if(selectMoved){
        state = 2;
        PuzzleProcessing();
    }else{
        state = 0;
    }

    selectMoved = false;

}, false);

let ModalWindow = document.querySelector('.ModalWindow');

let modalstateid;

// モーダルウィンドウ
function OpenModal(title, description){
    ModalWindow.querySelector(".title").innerHTML = title;
    ModalWindow.querySelector(".description").innerHTML = description;

    ModalWindow.style.display = 'block';

    modalstateid = setTimeout(()=>{
        state = -1;
    }, 100);    
}

document.querySelector('.ModalWindow .CloseButton').addEventListener('touchstart', ()=>{
    let timer1 = setTimeout(()=>{
        ModalWindow.style.display = 'none';
        state = 0;
    }, 200);
    clearTimeout(modalstateid);

}, false);


