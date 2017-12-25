var mainTable = null;
var currentDay = -1;
var verticalData = {};
var selectOptions = {};
var currentFilter = "";

window.onload = function () {
    mainTable = document.getElementById('mainTable');
    setupDayButton();
    setupFilter();
    loadJson(firstJsonLoaded);
};

//子要素から特定のクラスのついたものを検索する
function getChildByClass(element, targetClass) {
    for (var c in element.children) {
        if (typeof element.children[c].classList != 'undefined' &&
            element.children[c].classList.contains(targetClass)) {
            return element.children[c];
        }
    }
    return null;
}

//初めにJsonが読み込まれたとき
function firstJsonLoaded() {
    updateFilter();
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
    setCurrentDay(day);
}

//曜日を一つ進める
function moveNextDay() {
    if (currentDay < 4) {
        setCurrentDay(currentDay + 1);
    } else {
        setCurrentDay(0);
    }
}
//曜日を一つ戻す
function movePrevDay() {
    if (currentDay > 0) {
        setCurrentDay(currentDay - 1);
    } else {
        setCurrentDay(4);
    }
}

//曜日を更新する
function setCurrentDay(num) {
    var daySelector = document.getElementById('daySelector');
    currentDay = num;
    daySelector.innerHTML = days[currentDay];
    if (jsonLoaded) updateTable();
}

//フィルタ設定ウィンドウを開く
function openFilterSetting() {
    var fab = document.getElementById("FAB");
    fab.onclick = closeFilterSetting;

    //FABボタンのアイコンを変更
    var fabIcon = document.getElementById("FABIcon");
    fabIcon.innerHTML = fabIconNames.pushed;

    var root = document.getElementById("selectOptionsRoot");
    // root.style.display = "block";

}

//フィルタ設定ウィンドウを閉じる
function closeFilterSetting() {
    var fab = document.getElementById("FAB");
    fab.onclick = openFilterSetting;

    //FABボタンのアイコンを変更
    var fabIcon = document.getElementById("FABIcon");
    fabIcon.innerHTML = fabIconNames.normal;

    var root = document.getElementById("selectOptionsRoot");
    // root.style.display = "none";
}


//設定ウィンドウの初期設定
function setupFilter() {
    var fab = document.getElementById("FAB");
    fab.onclick = openFilterSetting;

    var mainSelectOption = document.getElementById('mainSelectOption');
    var courseSelectOption = document.getElementById('courseSelectOption');
    var gradeSelectOption = document.getElementById('gradeSelectOption');
    var classNumSelectOption = document.getElementById('classNumSelectOption');
    var roleSelectOption = document.getElementById('roleSelectOption');

    createSelectOption(mainSelectOption, mainOptions);
    createSelectOption(courseSelectOption, courseOptions);
    createSelectOption(gradeSelectOption, gradeOptions);
    createSelectOption(classNumSelectOption, classNumOptions);
    createSelectOption(roleSelectOption, roleOptions);

    //再利用のためにエレメントを変数に格納しておく
    selectOptions = {
        'mainSelectOption': mainSelectOption,
        'roleSelectOption': roleSelectOption,
        'classNumSelectOption': classNumSelectOption,
        'gradeSelectOption': gradeSelectOption,
        'courseSelectOption': courseSelectOption
    }

    displaySubSelectOptions(mainOptions[getSelectValue(mainSelectOption)]);
}

//ページを去るときに実行される
window.addEventListener('beforeunload', function () {
    //ローカルストレージに設定の値を保存させる
    if (window.localStorage !== null) {
        for (var key in selectOptions) {
            var val = localStorage.setItem(key, getSelectValue(selectOptions[key]));
        }
    }
}, false);

//オプション内の選択中の値を取得する
function getSelectValue(select) {
    return getChildByClass(select, 'mdl-textfield__input').value;
}

//オプションに値をセットする
function setSelectValue(select, value) {
    getChildByClass(select, 'mdl-textfield__input').value = value;
}

//オプションが拡大する方向を計算を決める
function calcExtendDirection(ul, event) {
    var optionHeight = 150; //cssで設定した値によって変える
    if (window.innerHeight - event.clientY > optionHeight) {
        ul.classList.add('mdl-menu--bottom-left');
        ul.classList.remove('mdl-menu--top-left');
    } else {
        ul.classList.add('mdl-menu--top-left');
        ul.classList.remove('mdl-menu--bottom-left');
    }
}

//選択オプションを作成する
function createSelectOption(select, options) {
    var itemRoot = getChildByClass(select, 'mdl-menu');
    var input = getChildByClass(select, 'mdl-textfield__input');
    input.onclick = function (e) {
        calcExtendDirection(itemRoot, e);
    }
    var first = true;
    for (var o in options) {
        if (first) {
            if (input.value == "") input.value = o;
            first = false;
        }
        var li = document.createElement('li');
        li.classList.add('mdl-menu__item');
        li.innerHTML = o;
        (function (text) {
            li.onclick = function () {
                input.value = text;
                updateFilter();
            }
        })(o);
        itemRoot.appendChild(li);
    }

    if (window.localStorage !== null) {
        var item = localStorage.getItem(select.id);
        if (item != null && typeof item !== "undefined") {
            input.value = item;
        }
    }
}

//サブセレクトオプションの表示、非表示を切り替える
function displaySubSelectOptions(num) {
    for (var select in selectOptionRelations) {
        var elem = selectOptions[select];
        if (selectOptionRelations[select] == num) {
            elem.style.display = 'block';
        } else {
            elem.style.display = 'none';
        }
    }
}

//フィルタ設定の更新
function updateFilter() {
    verticalData = [];
    currentFilter = getSelectValue(selectOptions.mainSelectOption);

    var type = mainOptions[getSelectValue(selectOptions.mainSelectOption)];
    displaySubSelectOptions(type);
    switch (type) {
        case '0':
        case 0:
            var courseFilter = courseOptions[getSelectValue(selectOptions.courseSelectOption)];
            var gradeFilter = gradeOptions[getSelectValue(selectOptions.gradeSelectOption)];
            var classNumFilter = classNumOptions[getSelectValue(selectOptions.classNumSelectOption)];

            var objects = getClassByFilter(courseFilter, gradeFilter, classNumFilter);
            for (var i = 0, len = objects.length; i < len; i++) {
                verticalData[i] = new TableData(objects[i].disp_class, type, objects[i].class_id);
            }
            break;
        case '1':
        case 1:
            var objects = getAllRooms();
            for (var i = 0, len = objects.length; i < len; i++) {
                verticalData[i] = new TableData(objects[i].disp_room, type, objects[i].room_id);
            }
            break;
        case '2':
        case 2:
            var roleFilter = roleOptions[getSelectValue(selectOptions.roleSelectOption)];
            var objects = getTeachersByFilter(roleFilter);
            for (var i = 0, len = objects.length; i < len; i++) {
                verticalData[i] = new TableData(objects[i].disp_teacher, type, objects[i].teacher_id);
            }
            break;
        default:
            break;
    }
    updateTable();
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

//引数が、クラス、教員、教室のうちどれであるか判別する
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

//テーブル更新関数
function updateTable() {
    displayTableDatas(verticalData, getCurrentDayLectureData(currentDay));
}

/*テーブルにデータを渡すときに使用する
type 0 = クラス, type 1 = 教室, type 2 = 教員
idはそれぞれの名前で与えられているものの数値 ex)teacher_id*/
TableData = function (name, type, id) {
    this.name = name;
    this.type = type;
    this.id = id;
};

// 現在の表を削除して空の表を作成する
function createTable(rowCount, colCount) {
    var child;
    while (child = mainTable.lastChild) mainTable.removeChild(child);

    var thead = document.createElement('thead');
    thead.insertRow(-1);
    for (var i = 0; i < colCount; i++) {
        var val = "";
        if (i > 0) { val = i; }
        thead.firstChild.innerHTML += '<th>' + val + '</th>';
    }
    mainTable.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var i = 1; i < rowCount; i++) {
        tbody.insertRow(-1);
        for (var j = 0; j < colCount; j++) {
            if (j == 0) tbody.lastChild.innerHTML += '<th></th>';
            else tbody.lastChild.innerHTML += '<td></td>';
        }
    }
    mainTable.appendChild(tbody);
}

//テーブルデータを表示する
function displayTableDatas(verData, lectures) {
    var colCount = 6;
    if (typeof verData.length !== "undefined") {
        createTable(verData.length + 1, colCount);
    } else {
        createTable(1, colCount);
    }

    var tableTitle = document.createElement('div');
    tableTitle.id = 'tableTitle';
    tableTitle.innerHTML = currentFilter;
    mainTable.rows[0].cells[0].appendChild(tableTitle);

    var count = 0; //データの表示順にidを割り振るためのカウンタ
    for (var i = 0; i < verData.length; i++) {
        //縦列見出しの表示
        var vCell = mainTable.rows[i + 1].cells[0];
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
                var cell = mainTable.rows[i + 1].cells[x.jigen];
                cell.appendChild(makeLectureObject(count++, x));
            }
        });
    }
}

//表内に挿入する講義データを作成する
function makeLectureObject(id, lecture) {
    var div = document.createElement('div');
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

    var moreContent = document.createElement('div');
    var hiddenText = document.createElement('div');
    hiddenText.innerHTML = makeLectureContentHTML(lecture);
    hiddenText.style.display = 'none';
    var link = document.createElement('div');
    link.classList.add('mdl-button');
    link.classList.add('mdl-js-button');
    link.classList.add('mdl-button--icon');
    var icon = document.createElement('i');
    icon.classList.add('material-icons');
    icon.innerHTML = 'link';
    link.appendChild(icon);
    moreContent.appendChild(link);
    moreContent.appendChild(hiddenText);
    content.appendChild(moreContent);

    link.onclick = displayMore;
    function displayMore() {
        hiddenText.classList.add('lectureContent-more');
        hiddenText.style.display = 'block';
        icon.innerHTML = linkIconNames.pushed;
        link.onclick = hideContent;
    }

    function hideContent() {
        hiddenText.classList.remove('lectureContent-more');
        hiddenText.style.display = 'none';
        icon.innerHTML = linkIconNames.normal;
        link.onclick = displayMore;
    }
    createPopup(lecture.disp_lecture, content, e);
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

    //ポップアップをクリック位置の右下に表示させるように座標を計算
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
    if (popup.parentNode == null) {
        return true;
    }
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

//教員の詳細情報を表示する
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

//講義の詳細データを作成する
function makeLectureContentHTML(lecture) {
    var html = "";
    //クラスを表示
    html += "対象 : ";
    var classes = getClassesFromLecture(lecture);
    for (var i = 0, len = classes.length; i < len; i++) {
        html += classes[i].disp_class;
        if (i < len - 1) html += ", ";
    }
    html += '<br>';

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
    html += "必修 : " + must;
    html += "<br>";
    html += "選択 : " + select;
    html += "<br>";

    //教室を表示
    html += "教室 : ";
    var rooms = getRoomsFromLecture(lecture);
    for (var i = 0, len = rooms.length; i < len; i++) {
        html += rooms[i].disp_room;
        if (i < len - 1) html += ", ";
    }
    html += '<br>';

    //日時を表示
    html += "日時 : " + getDayAndTimeFromLecture(lecture);

    return html;
}