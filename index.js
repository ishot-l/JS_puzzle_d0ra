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


let board = new Array(BOARD_HEIGHT);
for(let i=0; i<BOARD_HEIGHT; i++){
    board[i] = new Array(BOARD_WIDTH);
    for(let j=0; j < BOARD_WIDTH; j++){
        board[i][j] = getRandom(1, 6);
    }
}

let BottomWindow = document.getElementById('BottomWindow');
let Puzzle = document.createElement('div');
Puzzle.classList.add('Puzzle');
BottomWindow.appendChild(Puzzle);


drawing();

// rootでタッチ捕捉イベント
let root = document.querySelector('.root');
let puzzlePosition = Puzzle.getBoundingClientRect();

root.addEventListener('touchstart', function(event) {
    let touchX = event.changedTouches[0].pageX;
    let touchY = event.changedTouches[0].pageY;
    selectMoved = false;

    if(!(puzzlePosition.left <= touchX && puzzlePosition.right >= touchX && puzzlePosition.top <= touchY && puzzlePosition.bottom >= touchY)){
        return false;
    }
    console.log("touched!");
    let {touchXarea, touchYarea} = getTouchedArea(event, puzzlePosition);
    
    selectedX = touchXarea;
    selectedY = touchYarea;

    updateSelectedJewel();

}, false);

root.addEventListener('touchmove', function(event) {
    event.preventDefault(); // タッチによる画面スクロールを止める
    let {touchXarea, touchYarea} = getTouchedArea(event, puzzlePosition);

    if(touchXarea == selectedX && touchYarea == selectedY) return false;

    console.log("move!");
    selectMoved = true;

    swapJewel(touchXarea, touchYarea, selectedX, selectedY);

    selectedX = touchXarea;
    selectedY = touchYarea;

    updateSelectedJewel();

}, false);

root.addEventListener('touchend', function(event) {
    // 消したりいろんな処理
    console.log("end!");
    selectedX = -1;
    selectedY = -1;
    updateSelectedJewel();

    if(selectMoved){
        console.log("kesusyori");
    }

}, false);