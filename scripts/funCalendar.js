var tableManager = null;
var currentButton = -1;
var tableColors = ['#ffff00', '#00ff00', '#0000ff', '#4f4f7a', '#88ff00'];
var buttonIds = ['#btn0', '#btn1', '#btn2', '#btn3', '#btn4'];
var colCount = 6; //列の数
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
    var td = [ //テストデータ
        {
            jigen: 1,
            teachers: [1],
            disp_lecture: "講義１",
            rooms: [128],

        },
        {
            jigen: 2,
            teachers: [2],
            disp_lecture: "講義２",
            rooms: [128],

        },
        {
            jigen: 3,
            teachers: [1, 2],
            disp_lecture: "講義３",
            rooms: [128],
        },
    ]
    var count = 7;
    var testData = new Array(count);
    for (var i = 0; i < count; i++) {
        var t = null;
        if (i % 2 == 0) {
            t = datas.teachers[0];
        } else {
            t = datas.teachers[1];
        }
        testData[i] = new TableData(t.disp_teacher, 0, t.teacher_id);
    }
    displayTableDatas(testData, datas.lectures);
}

/*テーブルにデータを渡すときに使用する
type 0 = 講師, type 1 = クラス, type 2 = 部屋
idはそれぞれの名前で与えられているものの数値 ex)teacher_id*/
TableData = function (name, type, id) {
    this.name = name;
    this.type = type;
    this.id = id;
};

//講義データを表示する。
//曜日判定はこの関数では行っていない。
function displayTableDatas(verData, lectures) {
    tableManager.createTable(verData.length + 1, colCount);
    setupTable();

    var count = 0; //データの表示順にidを割り振るためのカウンタ
    for (var i = 0; i < verData.length; i++) {
        tableManager.insertHTML(i + 1, 0, verData[i].name);

        lectures.forEach(x => {
            var findID = false;

            switch (verData[i].type) {
                case 0:
                    findID = x.teachers.indexOf(verData[i].id) >= 0;
                    break;
                case 1:
                    findID = x.classes.indexOf(verData[i].id) >= 0;
                    break;
                case 2:
                    findID = x.rooms.indexOf(verData[i].id) >= 0;
                    break;
            }

            if (findID) {
                tableManager.appendChild(i + 1, x.jigen, makeLectureObject(count++, x));
            }
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
    div.onclick = () => {
        var mordal = document.getElementById("lectureModal");
        var mordalContent = document.getElementById("lectureModal-content");
        mordalContent.innerHTML = makeLectureContentHTML(lecture);
        var overlay = document.getElementById("modal-overlay");
        overlay.style.display = "block";
        mordal.style.display = 'block';
        mordal.classList.add("fadeIn");
    }

    //講義名でボタンを作成する
    div.innerHTML += lecture.disp_lecture;
    return div;
}

function closeLectureModal() {
    var mordal = document.getElementById("lectureModal");

    var mordalContent = document.getElementById("lectureModal-content");
    var overlay = document.getElementById("modal-overlay");
    mordal.style.display = 'none';
    mordalContent.innerHTML = "";
    overlay.style.display = 'none';
}

//講義の詳細データを作成する
function makeLectureContentHTML(lecture) {
    var html = "";
    //講義名の表示
    html += "<h3>" + lecture.disp_lecture + "</h3><br>";

    //担当の表示
    html += "担当 ";
    var teachers = getTeachersFromLecture(lecture);
    for (var i = 0, len = teachers.length; i < len; i++) {
        html += teachers[i].disp_teacher;
        if (i < len - 1) html += ", ";
    }
    html += "<br>";

    //クラスの表示
    html += "対象 ";
    var classes = getClassesFromLecture(lecture);
    for (var i = 0, len = classes.length; i < len; i++) {
        html += classes[i].disp_class;
        if (i < len - 1) html += ", ";
    }
    html += "<br>";

    //教室の表示
    html += "教室 ";
    var rooms = getRoomsFromLecture(lecture);
    for (var i = 0, len = rooms.length; i < len; i++) {
        html += rooms[i].disp_room;
        if (i < len - 1) html += ", ";
    }
    html += "<br>";

    //日時の表示
    html += "日時 " + getDateAndTimeFromLecture(lecture);
    return html;
}

//講義オブジェクトから教師オブジェクトを取得
function getTeachersFromLecture(lecture) {
    var teachers = [];
    datas.teachers.forEach(x => {
        if (lecture.teachers.indexOf(x.teacher_id) >= 0)
            teachers.push(x);
    });
    return teachers;
}

//講義オブジェクトから教室オブジェクトを取得
function getRoomsFromLecture(lecture) {
    var rooms = [];
    datas.rooms.forEach(x => {
        if (lecture.rooms.indexOf(x.room_id) >= 0)
            rooms.push(x);
    });
    return rooms;
}

//講義オブジェクトからクラスオブジェクトを取得
function getClassesFromLecture(lecture) {
    var classes = [];
    datas.classes.forEach(x => {
        if (lecture.classes.indexOf(x.class_id) >= 0)
            classes.push(x);
    });
    return classes;
}

//講義オブジェクトから日時情報を取得
function getDateAndTimeFromLecture(lecture) {
    var weeks = ["月曜", "火曜", "水曜", "木曜", "金曜"];
    var week = weeks[lecture.week - 1];
    return week + lecture.jigen + "限";
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