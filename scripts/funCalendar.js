var tableManager = null;
var currentDay = -1;
var colCount = 6; //列の数
var verticalData = {};
var fadeTime = 200;
var selectBoxes = {};

$(function () {
    var table = document.getElementById('mainTable');
    tableManager = new TableManager(table);
    setupDayButton();
    setupSetting();
    createPopup();
    loadJson(firstJsonLoaded);
});

//初めにJsonが呼ばれたとき
function firstJsonLoaded() {
    updateSetting();
    updateTable();
}

//曜日設定ボタンの初期化
//ページを開いたとき現在の曜日が選択されるようにする
function setupDayButton() {
    var date = new Date();
    var day = date.getDay();
    day -= 1; //内部的に月曜日を0として扱っているため、それに揃える 
    if (day == -1 || day == 5) {
        day = 0; //土、日曜日の場合は月曜日を選択された状態にする
    }
    pushDayButton(day);
}

function openFilterSetting() {
    var settingModalContent = document.getElementById("settingModal-content");
    settingModalContent.style.display = "block";
    settingModalContent.classList.remove("fadeOut");
    settingModalContent.classList.add("fadeIn");
    setTimeout(() => {
        settingModalContent.classList.remove("fadeIn");
    }, fadeTime);

    var settingClose = document.getElementById("settingModal-close");
    openModalOverlay(closeFilterSetting);

}
function closeFilterSetting() {
    var settingModalContent = document.getElementById("settingModal-content");
    settingModalContent.classList.remove("fadeIn");
    settingModalContent.classList.add("fadeOut");
    setTimeout(() => {
        settingModalContent.classList.remove("fadeOut");
        settingModalContent.style.display = "none";
    }, fadeTime);
    closeModalOverlay();
}

//設定ウィンドウの初期設定
function setupSetting() {
    var mainSelectBox = document.getElementById('mainSelectBox');
    var roleSelectBox = document.getElementById('roleSelectBox');
    var classNumSelectBox = document.getElementById('classNumSelectBox');
    var gradeSelectBox = document.getElementById('gradeSelectBox');
    var courseSelectBox = document.getElementById('courseSelectBox');

    appendSelectBoxOptions(mainSelectBox, mainOptions);
    appendSelectBoxOptions(roleSelectBox, roleOptions);
    appendSelectBoxOptions(classNumSelectBox, classNumOptions);
    appendSelectBoxOptions(gradeSelectBox, gradeOptions);
    appendSelectBoxOptions(courseSelectBox, courseOptions);

    //再利用のためにエレメントを変数に格納しておく
    selectBoxes = {
        'mainSelectBox': mainSelectBox,
        'roleSelectBox': roleSelectBox,
        'classNumSelectBox': classNumSelectBox,
        'gradeSelectBox': gradeSelectBox,
        'courseSelectBox': courseSelectBox
    }
    updateDisplaySubSelectBox(mainSelectBox.value);
    for (var key in selectBoxes) {
        selectBoxes[key].onchange = updateSetting;
    }
}

//連想配列からセレクトボックスのオプションを作成する
function appendSelectBoxOptions(select, options) {
    for (var o in options) {
        var option = document.createElement('option');
        option.innerHTML = o;
        option.value = options[o];
        select.appendChild(option);
    }
    return select;
}

//フィルタ設定の更新
function updateSetting() {
    var objects = [];
    verticalData = [];
    updateDisplaySubSelectBox(mainSelectBox.value);
    var type = selectBoxes['mainSelectBox'].value;
    switch (type) {
        case '0':
            objects = getClassByFilter(selectBoxes['courseSelectBox'].value,
                selectBoxes['gradeSelectBox'].value, selectBoxes['classNumSelectBox'].value);
            for (var i = 0, len = objects.length; i < len; i++) {
                verticalData[i] = new TableData(objects[i].disp_class, type, objects[i].class_id);
            }
            break;
        case '1':
            objects = getAllRooms();
            for (var i = 0, len = objects.length; i < len; i++) {
                verticalData[i] = new TableData(objects[i].disp_room, type, objects[i].room_id);
            }
            break;
        case '2':
            objects = getTeachersByFilter(selectBoxes['roleSelectBox'].value);
            for (var i = 0, len = objects.length; i < len; i++) {
                verticalData[i] = new TableData(objects[i].disp_teacher, type, objects[i].teacher_id);
            }
            break;
    }
    updateTable();
}

//サブセレクトボックスの表示、非表示を切り替える
function updateDisplaySubSelectBox(num) {
    for (var select in selectBoxRelations) {
        var elem = selectBoxes[select];
        if (selectBoxRelations[select] == num) {
            elem.style.display = 'block';
        } else {
            elem.style.display = 'none';
        }
    }
}

//オブジェクトからテーブルデータを作成する
function makeTableData(object) {
    var data = null;
    switch (distinctObjectType(object)) {
        case 0:
            data = new TableData(object.disp_class, 1, object.class_id);
            break;
        case 1:
            data = new TableData(object.disp_room, 2, object.room_id);
            break;
        case 2:
            data = new TableData(object.disp_teacher, 0, object.teacher_id);
            break;
    }
    return data;
}

//引数が、クラス、講師、教室のうちどれであるか判別する
function distinctObjectType(object) {
    if (object.class_id != null) {
        return 0;
    } else if (object.room_id != null) {
        return 1;
    } else if (object.teacher_id != null) {
        return 2;
    } else {
        return -1;
    }
}

//ポップアップを作成する
function createPopup() {
    var p = document.createElement('div');
    p.id = "popup";
    document.body.appendChild(p);
}

//選択中の曜日ボタンを引数の番号のボタンに変更
function pushDayButton(num) {
    if (currentDay != num) {
        $(buttonIds[currentDay]).removeClass('btn_selected');
        $(buttonIds[num]).addClass('btn_selected');
        currentDay = num;
        if (jsonLoaded) updateTable();
    }
}

//テーブル更新関数
function updateTable() {
    displayTableDatas(verticalData, getCurrentDayLectureData(currentDay));
}

/*テーブルにデータを渡すときに使用する
type 0 = クラス, type 1 = 教室, type 2 = 講師
idはそれぞれの名前で与えられているものの数値 ex)teacher_id*/
TableData = function (name, type, id) {
    this.name = name;
    this.type = type;
    this.id = id;
};

//テーブルデータを表示する
function displayTableDatas(verData, lectures) {
    if (typeof verData.length !== "undefined") {
        tableManager.createTable(verData.length + 1, colCount);
    } else {
        tableManager.createTable(1, colCount);
    }
    setDefaultLayoutToTable();
    var count = 0; //データの表示順にidを割り振るためのカウンタ
    for (var i = 0; i < verData.length; i++) {
        //縦列見出しの表示
        var vCell = tableManager.getCell(i + 1, 0);
        vCell.innerHTML = verData[i].name;

        //縦列が教員の場合、教員情報を挿入する
        if (verData[i].type == 2) {
            vCell.classList.add('link');
            (function (num) {
                vCell.onclick = function (e) { displayTeacher(verData[num].id, e); }
            })(i);
        }

        lectures.forEach(x => {
            var findID = false;
            switch (verData[i].type) {
                case '0':
                case 0:
                    findID = x.classes.indexOf(verData[i].id) >= 0;
                    break;
                case '1':
                case 1:
                    findID = x.rooms.indexOf(verData[i].id) >= 0;
                    break;
                case '2':
                case 2:
                    findID = x.teachers.indexOf(verData[i].id) >= 0;
                    break;
                default:
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
function setDefaultLayoutToTable() {
    for (var i = 0; i < tableManager.getColCount() - 1; i++) {
        var cell = tableManager.getCell(0, i + 1);
        cell.innerHTML = i + 1;
        cell.style.background = tableColors[currentDay];   //見出し位置の色
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
    div.onclick = () => { openLectureModal(lecture); }

    //講義名でボタンを作成する
    div.innerHTML += lecture.disp_lecture;
    return div;
}

//講義のモーダルウィンドウを開く
function openLectureModal(lecture) {
    var modal = document.getElementById("lectureModal");
    var modalContent = document.getElementById("lectureModal-content");
    appendLectureContentHTML(lecture, modalContent);
    openModalOverlay(closeLectureModal);
    modal.style.display = 'block';
    modal.classList.remove("fadeOut");
    modal.classList.add("fadeIn");
    setTimeout(() => {
        modal.classList.remove("fadeIn");
    }, fadeTime);
}

//講義のモーダルウィンドウを閉じる
function closeLectureModal() {
    var modal = document.getElementById("lectureModal");
    var modalContent = document.getElementById("lectureModal-content");
    closeModalOverlay();
    modal.classList.remove("fadeIn");
    modal.classList.add("fadeOut");
    setTimeout(() => {
        modal.classList.remove("fadeOut");
        modalContent.innerHTML = "";
        modal.style.display = 'none';
    }, fadeTime);
}

//ポップアップウィンドウを表示する
function displayPopup(html, event) {
    //TODO
    //ポップアップの表示位置がずれるバグを確認
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