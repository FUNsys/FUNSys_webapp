var tableManager = null;
var currentButton = -1;
var tableColors = ['#ffff00', '#00ff00', '#0000ff', '#4f4f7a', '#88ff00'];
var buttonIds = ['#btn0', '#btn1', '#btn2', '#btn3', '#btn4'];
var colCount = 6; //列の数
var lecButtonClass = "lecButton"; //表内に表示される講義のボタンクラス
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
    var td = [ //テストデータ
        {
            jigen: 1,
            teachers: [1, 2],
            disp_lecture: "講義１",
        },
        {
            jigen: 1,
            teachers: [1, 2],
            disp_lecture: "講義２",
        },
        {
            jigen: 1,
            teachers: [1, 2],
            disp_lecture: "講義３",
        },
    ]
    var testData = new Array(count);
    for (var i = 0; i < count; i++) {
        testData[i] = new TableData(0, 1);
    }
    tableManager.createTable(10, colCount);
    setupTable();
    dispLecture(testData, datas.lectures);
}

//テーブルにデータを渡すときに使用する
//type 0 = 講師, type 1 = クラス, type 2 = 部屋
TableData = function (type, id) {
    this.type = type;
    this.id = id;
};

var displayLectures = []; //現在表示中の講義オブジェクトを格納しておくクラス

//講義データを表示する。
//曜日判定はこの関数では行っていない。
function dispLecture(verData, lectures) {
    displayLectures = [];
    var id = 0; //データの表示順にidを割り振るためのカウンタ
    for (var i = 0; i < verData.length; i++) {
        lectures.forEach(x => {
            var hasRows = [];

            var check = function (t) { //対応する講義データを持っているか確認する関数
                if (t == verData[i].id) {
                    hasRows.push(i);
                }
            }

            switch (verData[i].type) {
                case 0: x.teachers.forEach(y => check(y));
                    break;
                case 1: x.classes.forEach(y => check(y));
                    break;
                case 2: x.rooms.forEach(y => check(y));
                    break;
            }
            hasRows.forEach(y => {
                tableManager.appendChild(y + 1, x.jigen, makeLectureObject(id++, x));
                displayLectures.push[x];
            });
        });
    }
}

//表内に挿入する講義データを作成する
function makeLectureObject(id, lecture) {
    var idtxt = "lecture-" + id; //講義の表示順に個別のidを振る
    var div = document.createElement('div');
    div.classList.add("lecture");
    div.id = idtxt;
    //講義名をクリックしたときに実行される関数
    div.onclick = function () {
        var mordal = document.getElementById("lectureMordal");
        mordal.style.display = "block";
        mordal.innerHTML = makeLectureContentHTML(lecture);
    }

    //講義名でボタンを作成する
    div.innerHTML += lecture.disp_lecture;
    return div;
}
function closeLectureMordal(){
    var mordal = document.getElementById("lectureMordal");
    mordal.style.display = "none";   
}
//講義の詳細データを作成する
function makeLectureContentHTML(lecture) {
    var html = "";
    html += "<ul>\n";
    for (var n in lecture) {
        html += "<li>";
        html += n + " : " + lecture[n];
        html += "<br>";
        html += "</li>";
    }
    html += "</ul>\n";
    return html;
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