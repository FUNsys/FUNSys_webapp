var tableManager = null;
var currentButton = -1;
var tableColors = ['#ffff00', '#00ff00', '#0000ff', '#4f4f7a', '#88ff00'];
var buttonIds = ['#btn0', '#btn1', '#btn2', '#btn3', '#btn4'];
var colCount = 6; //列の数


$(function () {
    var table = document.getElementById('mainTable');
    tableManager = new TableManager(table);
    pushButton(0);
    createPopup();
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

//ポップアップを作成する
function createPopup() {
    var p = document.createElement('div');
    p.id = "popup";
    document.body.appendChild(p);
}

//講義表示テスト用関数
function dispTest() {
    var testData = [];
    datas.classes.forEach(x => {
        testData.push(new TableData(x.disp_class, 1, x.class_id));
    });
    displayTableDatas(testData, getCurrentDayLectureData(datas.lectures));
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
    return lectures.filter(x => x.week == currentButton + 1);
}

//テーブルデータを表示する
function displayTableDatas(verData, lectures) {
    tableManager.createTable(verData.length + 1, colCount);
    setupTable();

    var count = 0; //データの表示順にidを割り振るためのカウンタ
    for (var i = 0; i < verData.length; i++) {
        //縦列見出しの表示
        var vCell = tableManager.getCell(i + 1, 0);
        vCell.innerHTML = verData[i].name;
        //縦列が教員の場合、教員情報を挿入する
        if (verData[i].type == 0) {
            vCell.classList.add('link');
            (function (num) {
                vCell.onclick = function (e) { displayTeacher(verData[num].id, e); }
            })(i);
        }

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
                var cell = tableManager.getCell(i + 1, x.jigen);
                cell.appendChild(makeLectureObject(count++, x));
            }
        });
    }
}

//テーブルにデフォルトのレイアウトを適用する
function setupTable() {
    for (var i = 0; i < tableManager.getColCount() - 1; i++) {
        var cell = tableManager.getCell(0, i + 1);
        cell.innerHTML = i + 1;
        cell.style.background = tableColors[currentButton];   //見出し位置の色
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
    var modal = document.getElementById("lectureModal");
    var modalContent = document.getElementById("lectureModal-content");
    var overlay = document.getElementById("modal-overlay");
    modal.style.display = 'none';
    modalContent.innerHTML = "";
    overlay.style.display = 'none';
}

//ポップアップウィンドウを表示する
function displayPopup(html, event) {
    var p = document.getElementById("popup");
    p.innerHTML = html;
    p.style.display = "block";
    p.style.left = event.pageX - 10 + "px";
    p.style.top = event.pageY - 10 + "px";
    window.addEventListener('click', closePopup);
}

//ポップアップウィンドウ外をクリックされたときウィンドウを閉じる
function closePopup(event) {
    var p = document.getElementById('popup');
    var point = document.elementFromPoint(event.pageX, event.pageY);
    if (p != point) {
        p.innerHTML = "";
        p.style.display = "none";
        window.removeEventListener('click', closePopup);
    }
}

//教師の詳細情報を表示する
function displayTeacher(id, event) {
    var teacher = datas.teachers.find(x => x.teacher_id == id);

    var html = "";
    //氏名の表示
    html += "氏名 : " + teacher.disp_teacher + "(" + teacher.roma_name + ")";
    html += "<br>";

    //役職の表示
    html += "役職 : " + teacher.position;
    html += "<br>";

    //専門分野の表示
    html += "専門分野 : " + teacher.research_area;
    html += "<br>";

    //所属の表示
    html += "所属学科 : " + teacher.role;

    displayPopup(html, event);
}

//講義の詳細データを付け足す
function appendLectureContentHTML(lecture, parent) {
    //講義名を表示
    parent.innerHTML += "<h3>" + lecture.disp_lecture + "</h3>";
    parent.innerHTML += '<br>';

    //担当を表示
    parent.innerHTML += "担当 : ";
    var teachers = getTeachersFromLecture(lecture);
    for (var i = 0, len = teachers.length; i < len; i++) {
        //担当教師の情報を埋め込む
        var teacherLink = document.createElement('span');
        teacherLink.id = "teacherLink" + i;
        teacherLink.classList.add('link');
        teacherLink.innerHTML += teachers[i].disp_teacher;

        /*onclickイベントに直接関数を与えても動作しないようなので、
        親の要素のクリックイベントからidで探索している*/
        (function (num) {
            parent.addEventListener('click', function (event) {
                var point = document.elementFromPoint(event.pageX, event.pageY);
                if (point.id == "teacherLink" + num) {
                    displayTeacher(teachers[num].teacher_id, event);
                }
            });
        })(i);

        parent.appendChild(teacherLink);
        if (i < len - 1) parent.innerHTML += ", ";
    }
    parent.innerHTML += '<br>';

    //クラスを表示
    parent.innerHTML += "対象 : ";
    var classes = getClassesFromLecture(lecture);
    for (var i = 0, len = classes.length; i < len; i++) {
        parent.innerHTML += classes[i].disp_class;
        if (i < len - 1) parent.innerHTML += ", ";
    }
    parent.innerHTML += '<br>';

    //必修,選択情報を表示
    var must = "";
    var select = "";
    for (var t in lecture.must) {
        switch (lecture.must[t]) {
            case "必修":
                must += (must == "") ? t : ", " + t;
                break;
            case "選択":
                select += (select == "") ? t : ", " + t;
                break;
        }
    }
    parent.innerHTML += "必修 : " + must;
    parent.innerHTML += "<br>";
    parent.innerHTML += "選択 : " + select;
    parent.innerHTML += "<br>";

    //教室を表示
    parent.innerHTML += "教室 : ";
    var rooms = getRoomsFromLecture(lecture);
    for (var i = 0, len = rooms.length; i < len; i++) {
        parent.innerHTML += rooms[i].disp_room;
        if (i < len - 1) parent.innerHTML += ", ";
    }
    parent.innerHTML += '<br>';

    //日時を表示
    parent.innerHTML += "日時 : " + getDayAndTimeFromLecture(lecture);
}

//講義オブジェクトから教師オブジェクトを取得
function getTeachersFromLecture(lecture) {
    return datas.teachers.filter(x => lecture.teachers.indexOf(x.teacher_id) >= 0);
}

//講義オブジェクトから教室オブジェクトを取得
function getRoomsFromLecture(lecture) {
    return datas.rooms.filter(x => lecture.rooms.indexOf(x.room_id) >= 0);
}

//講義オブジェクトからクラスオブジェクトを取得
function getClassesFromLecture(lecture) {
    return datas.classes.filter(x => lecture.classes.indexOf(x.class_id) >= 0);
}

//講義オブジェクトから日時情報を取得
function getDayAndTimeFromLecture(lecture) {
    var weeks = ["月曜", "火曜", "水曜", "木曜", "金曜"];
    var week = weeks[lecture.week - 1];
    return week + lecture.jigen + "限";
}