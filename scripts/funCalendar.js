var tableManager = null;
var currentButton = -1;
var tableColors = ['#ffff00', '#00ff00', '#0000ff', '#4f4f7a', '#88ff00'];
var buttonIds = ['#btn0', '#btn1', '#btn2', '#btn3', '#btn4'];
var colCount = 6;
var loaded = false;

$(function () {
    var table = document.getElementById('mainTable');
    tableManager = new TableManager(table);
    pushButton(0);
    loadJson(createTable);
});

//選択中のボタンを引数の番号のボタンに変更
function pushButton(num) {
    if (currentButton != num) {
        $(buttonIds[currentButton]).removeClass('btn_selected');
        $(buttonIds[num]).addClass('btn_selected');
        currentButton = num;
        if (loaded) createTable();
    }
}

//テーブルを作成する
function createTable(data) {
    loaded = true;
}

//縦行の見出しを表示する
function dispVerticalHeadder() {
    tableManager.createTable(datas.rooms.length + 1, colCount);
    setupTable();
    for (var i = 0; i < datas.rooms.length; i++) {
        tableManager.insertHTML(i + 1, 0, datas.rooms[i].disp_room);
    }
}

function dispLecture(dataNum) {
    var week = currentButton + 1;
    var count = 0;
    datas.lectures.forEach(x => {
        if (x.week == week) {
            tableManager.insertHTML(++count, x.jigen, x.disp_lecture);
        }
    });
}

function dispTeacher() {
    tableManager.createTable(datas.teachers.length + 1, colCount);
    setupTable();
    for (var i = 0; i < datas.teachers.length; i++) {
        tableManager.insertHTML(i + 1, 0, datas.teachers[i].disp_teacher);
        tableManager.addClass(i + 1, 0, "lecture");
        tableManager.insertHTML(i + 1, 1, datas.teachers[i].research_area);
    }
}

//テーブルにデフォルトのレイアウトを適用する
function setupTable() {
    for (var i = 0; i < tableManager.getColCount() - 1; i++) {
        tableManager.insertHTML(0, i + 1, i + 1);
        tableManager.changeCellColor(0, i + 1, tableColors[currentButton]);   //見出し位置の色
    }
}