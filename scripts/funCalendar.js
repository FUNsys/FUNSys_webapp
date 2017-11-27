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
    loadJson(dispTest);
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


//講義表示テスト用関数
function dispTest() {
    var count = 7;
    var testData = new Array(count);
    for (var i = 0; i < count; i++) {
        testData[i] = new TableData(2, 2);
    }
    tableManager.createTable(10, colCount);
    setupTable();
    dispLecture(testData);
}

//テーブルにデータを渡すときに使用する
TableData = function (type, id) {
    this.type = type;
    this.id = id;
};

/*
講義データを表示する。
曜日判定はこの関数より上層で行っておく。
dataNum 0 = 講師, dataNum 1 = クラス, dataNum 2 = 部屋
*/
function dispLecture(data) {
    for (var i = 0; i < data.length; i++) {
        datas.lectures.forEach(x => {
            var hasRows = [];

            var check = function (t) { //対応する講義データを持っているか確認する関数
                if (t == data[i].id) {
                    hasRows.push(i)
                };
            }

            switch (data[i].type) {
                case 0: x.teachers.forEach(y => check(y));
                    break;
                case 1: x.classes.forEach(y => check(y));
                    break;
                case 2: x.rooms.forEach(y => check(y));
                    break;
            }

            hasRows.forEach(y => {
                tableManager.addHTML(y + 1, x.jigen, makeLectureHTML(x));
            });
        });
    }
}

//表内に挿入する講義データを作成する
function makeLectureHTML(lecture) {
    return lecture.disp_lecture;
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