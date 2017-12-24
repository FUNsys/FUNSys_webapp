var tableManager = null;
var currentDay = -1;
var verticalData = {};
var fadeTime = 200;
var selectBoxes = {};
var popupList = {};

window.onload = function () {
    var t = window.applicationCache;
    var table = document.getElementById('mainTable');
    tableManager = new TableManager(table);
    setupDayButton();
    setupSetting();
    loadJson(firstJsonLoaded);
};

//初めにJsonが読み込まれたとき
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

//フィルタ設定ウィンドウを開く
function openFilterSetting() {
    var fab = document.getElementById("FAB");
    fab.onclick = closeFilterSetting;

    //FABボタンのアイコンを変更
    var fabIcon = document.getElementById("FABIcon");
    fabIcon.innerHTML = fabIconNames.pushed;

    var root = document.getElementById("selectBoxesRoot");
    root.style.display = "block";

}

//フィルタ設定ウィンドウを閉じる
function closeFilterSetting() {
    var fab = document.getElementById("FAB");
    fab.onclick = openFilterSetting;

    //FABボタンのアイコンを変更
    var fabIcon = document.getElementById("FABIcon");
    fabIcon.innerHTML = fabIconNames.normal;

    var root = document.getElementById("selectBoxesRoot");
    root.style.display = "none";
}

//設定ウィンドウの初期設定
function setupSetting() {
    var fab = document.getElementById("FAB");
    fab.onclick = openFilterSetting;

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

    //ローカルストレージから前回の値を読み出し、設定に反映させる
    for (var key in selectBoxes) {
        if (window.localStorage !== null) {
            var val = localStorage.getItem(key);
            if (val && val < selectBoxes[key].length) {
                selectBoxes[key].selectedIndex = val;
            }
        }
        selectBoxes[key].onchange = updateSetting;
    }
}

//ページを去るときに実行される
window.addEventListener('beforeunload', function () {
    //ローカルストレージに設定の値を保存させる
    if (window.localStorage !== null) {
        for (var key in selectBoxes) {
            var val = localStorage.setItem(key, selectBoxes[key].selectedIndex);
        }
    }
}, false);


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
    var colCount = 6;
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
                vCell.onclick = function (e) {
                    displayTeacher(getAllTeachers().find(x => x.teacher_id == verData[num].id), e);
                }
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
    }
}

//表内に挿入する講義データを作成する
function makeLectureObject(id, lecture) {
    var idtxt = "lecture-" + id; //講義の表示順に個別のidを振る
    var div = document.createElement('div');
    div.id = idtxt;
    div.classList.add('mdl-js-button');
    div.classList.add('mdl-ripple-effect');
    div.classList.add('mdl-button--accent');
    div.classList.add("lecture");

    //講義名をクリックしたときに実行される関数
    div.onclick = (e) => { displayLecture(e, lecture); }

    //講義名でボタンを作成する
    div.innerHTML += lecture.disp_lecture;
    return div;
}

//講義の詳細を表示する
function displayLecture(e, lecture) {
    var content = document.createElement('div');
    content.classList.add('lectureContent');
    content.innerHTML += '担当教員 : ';

    var teachers = getTeachersFromLecture(lecture);
    for (var i = 0, len = teachers.length; i < len; i++) {
        //担当教師の情報を埋め込む
        var teacherLink = document.createElement('span');
        teacherLink.classList.add('link');
        teacherLink.innerHTML += teachers[i].disp_teacher;
        (function (t) {
            teacherLink.onclick = function (e) {
                displayTeacher(t, e, content.parentNode.parentNode);
            }
        })(teachers[i]);

        content.appendChild(teacherLink);
        if (i < len - 1) {
            var kanma = document.createElement('span');
            kanma.innerHTML = ', ';
            content.appendChild(kanma);
        }
    }
    content.appendChild(document.createElement('br'));

    var link = document.createElement('p');
    link.classList.add('mdl-button');
    link.classList.add('mdl-js-button');
    link.classList.add('mdl-button--icon');
    var icon = document.createElement('i');
    icon.classList.add('material-icons');
    icon.innerHTML = 'link';
    link.appendChild(icon);
    content.appendChild(link);
    link.onclick = function () {

    }

    createPopup(lecture.disp_lecture, content, e);
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
/*
ポップアップは画面内に複数表示される場合あり。
ポップアップ上にあるリンクから別のポップアップを開いた場合、
新たに開かれるポップアップは元のポップアップの子要素になる。
ポップアップは自身の子孫オブジェクト以外がクリックされたときに閉じる。
*/
function createPopup(title, content, event, parent) {
    var root = document.createElement('div');
    root.classList.add('popup');
    root.classList.add('mdl-shadow--2dp');
    var top = document.createElement('div');
    top.classList.add('popup-top');
    var topInnner = document.createElement('div');
    topInnner.classList.add('popup-top-text');
    var bottom = document.createElement('div');
    bottom.classList.add('popup-bottom');

    var x = event.pageX + 10;
    var y = event.pageY + 10;
    if (parent) {
        var pPos = parent.getBoundingClientRect();
        pPos.x += window.pageXOffset;
        pPos.y += window.pageYOffset;
        x -= pPos.x;
        y -= pPos.y;
    }
    root.style.left = x + "px";
    root.style.top = y + "px";
    root.style.display = "block";

    topInnner.innerHTML = title;
    top.appendChild(topInnner);
    bottom.appendChild(content);
    root.appendChild(top);
    root.appendChild(bottom);
    if (parent) {
        parent.appendChild(root);
    } else {
        document.body.appendChild(root);
    }

    /*普通にクリックイベントをつけるとその場で実行されてしまうので、
    setTimeoutでタイミングをずらしている*/
    var cantCloseTime = 1;
    setTimeout(() => {
        window.addEventListener('click', (() => {
            return function f(e) {
                if (closePopup(e, root)) {
                    window.removeEventListener('click', f, false);
                }
            }
        })(), false);
    }, cantCloseTime);
}

//ポップアップウィンドウ外をクリックされたときウィンドウを閉じる
function closePopup(event, popup) {
    var point = document.elementFromPoint(event.clientX, event.clientY);
    var list = getAllChilden(popup);
    list.push(popup);

    if (list.indexOf(point) < 0) {
        popup.innerHTML = "";
        popup.style.display = "none";
        popup.parentNode.removeChild(popup);
        return true;
    }
    return false;
}

//全ての子要素を取得する
function getAllChilden(element) {
    var children = [];
    var stack = [];
    stack.push(element);
    var node;
    while ((node = stack.pop()) != null) {
        var list = node.children;
        for (var c in list) {
            stack.push(list[c]);
            children.push(list[c]);
        }
    }
    return children;
}

//教師の詳細情報を表示する
function displayTeacher(teacher, event, parent) {
    var title = "";
    var content = document.createElement('div');
    content.classList.add('teacherContent');
    //氏名の表示
    title += teacher.disp_teacher + "<br>(" + teacher.roma_name + ")";

    //役職の表示
    content.innerHTML += "役職 : " + teacher.position;
    content.innerHTML += "<br>";

    //専門分野の表示
    content.innerHTML += "専門分野 : " + teacher.research_area;
    content.innerHTML += "<br>";

    //所属の表示
    content.innerHTML += "所属学科 : " + teacher.role;

    createPopup(title, content, event, parent);
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