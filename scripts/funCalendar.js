var tableManager = null;
var currentButton = -1;
var tableColors = ['#ffff00', '#00ff00', '#0000ff', '#4f4f7a', '#88ff00'];
var buttonIds = ['#btn0', '#btn1', '#btn2', '#btn3', '#btn4'];
var colCount = 6; //列の数

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
        if (jsonLoaded) dispTest();
    }
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
            week: 2,
            disp_lecture: "講義１",
            classes: [120],
            rooms: [1],

        },
        {
            jigen: 2,
            teachers: [2],
            week: 1,
            disp_lecture: "講義２",
            classes: [120],
            rooms: [1],
        },
        {
            jigen: 3,
            teachers: [1, 2],
            week: 2,
            disp_lecture: "講義３",
            classes: [120],
            rooms: [1],
        },
    ]
    var count = 2;
    var testData = new Array(count);
    for (var i = 0; i < count; i++) {
        testData[i] = new TableData(datas.teachers[i].disp_teacher, 0, datas.teachers[i].teacher_id);
    }
    displayTableDatas(testData, getCurrentDayLectureData(datas.lectures));
    // displayTableDatas(testData, getCurrentDayLectureData(td));
}

/*テーブルにデータを渡すときに使用する
type 0 = 講師, type 1 = クラス, type 2 = 部屋
idはそれぞれの名前で与えられているものの数値 ex)teacher_id*/
TableData = function (name, type, id) {
    this.name = name;
    this.type = type;
    this.id = id;
};

//現在の曜日の講義データを取得する
function getCurrentDayLectureData(lectures) {
    var newLectures = [];
    lectures.forEach(x => {
        if (x.week == currentButton + 1) {
            newLectures.push(x);
        }
    });
    return newLectures;
}

//テーブルデータを表示する
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
    div.classList.add('link');
    div.id = idtxt;

    //講義名をクリックしたときに実行される関数
    div.onclick = () => {
        var modal = document.getElementById("lectureModal");
        var modalContent = document.getElementById("lectureModal-content");

        //mordalContent.innerHTML = makeLectureContentHTML(lecture);
        appendLectureContentHTML(lecture, modalContent);
        var overlay = document.getElementById("modal-overlay");
        overlay.style.display = "block";
        modal.style.display = 'block';
        modal.classList.add("fadeIn");
    }

    //講義名でボタンを作成する
    div.innerHTML += lecture.disp_lecture;
    return div;
}

//講義のモーダルウィンドウを閉じる
function closeLectureModal() {
    var mordal = document.getElementById("lectureModal");

    var mordalContent = document.getElementById("lectureModal-content");
    var overlay = document.getElementById("modal-overlay");
    mordal.style.display = 'none';
    mordalContent.innerHTML = "";
    overlay.style.display = 'none';
}

//講義の詳細データを付け足す
function appendLectureContentHTML(lecture, parent) {
    //講義名を表示
    parent.innerHTML += "<h3>" + lecture.disp_lecture + "</h3>";
    parent.innerHTML += '<br>';

    //担当を表示
    parent.innerHTML += "担当 ";
    var teachers = getTeachersFromLecture(lecture);
    for (var i = 0, len = teachers.length; i < len; i++) {
        var teacherLink = document.createElement('span');
        teacherLink.classList.add('link');
        teacherLink.innerHTML += teachers[i].disp_teacher;
        parent.appendChild(teacherLink);
        parent.onclick += () => {
            /**/
        }
        if (i < len - 1) parent.innerHTML += ", ";
    }
    parent.innerHTML += '<br>';

    //クラスを表示
    parent.innerHTML += "対象 ";
    var classes = getClassesFromLecture(lecture);
    for (var i = 0, len = classes.length; i < len; i++) {
        parent.innerHTML += classes[i].disp_class;
        if (i < len - 1) parent.innerHTML += ", ";
    }
    parent.innerHTML += '<br>';

    //教室を表示
    parent.innerHTML += "教室 ";
    var rooms = getRoomsFromLecture(lecture);
    for (var i = 0, len = rooms.length; i < len; i++) {
        parent.innerHTML += rooms[i].disp_room;
        if (i < len - 1) parent.innerHTML += ", ";
    }
    parent.innerHTML += '<br>';

    //日時を表示
    parent.innerHTML += "日時 " + getDayAndTimeFromLecture(lecture);
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
function getDayAndTimeFromLecture(lecture) {
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