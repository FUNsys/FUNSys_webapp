var tableManager = null;
var currentButton = -1;
var tableColors = ['#ffff00', '#00ff00', '#0000ff', '#4f4f7a', '#88ff00'];
var buttonIds = ['#btn0', '#btn1', '#btn2', '#btn3', '#btn4'];
var colCount = 6;
var loaded = false;
var verticalData = {};

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

/*テーブルにデータを渡すときに使用する
type 0 = 講師, type 1 = クラス, type 2 = 部屋
idはそれぞれの名前で与えられているものの数値 ex)teacher_id*/
TableData = function (name, type, id) {
    this.name = name;
    this.type = type;
    this.id = id;
};

//テーブルを作成する
function createTable(data) {
    loaded = true;
}

$(function () {
    var select = document.getElementById('settings');
    //IDを参照してselectに格納する
    select.onchange = function () {//verticalDataのが配列にTableData型のオブジェクトとしてそれぞれデータを格納していく
        var tables;
        verticalData = {};
        if (select.value == 0) {
            tables = datas.teachers;
            var len = tables.length;
            for (var i = 0; i < len; i++) {
                verticalData[i] = new TableData(tables[i].disp_teacher, select.value, tables[i].teacher_id);
                //console.log(verticalData[i]);
            }
        } else if (select.value == 1) {
            tables = datas.classes;
            var len = tables.length;
            for (var i = 0; i < len; i++) {
                verticalData[i] = new TableData(tables[i].disp_class, select.value, tables[i].class_id);
                //console.log(verticalData[i]);
            }
        } else if (select.value == 2) {
            tables = datas.rooms;
            var len = tables.length;
            for (var i = 0; i < len; i++) {
                verticalData[i] = new TableData(tables[i].disp_room, select.value, tables[i].room_id);
                //console.log(verticalData[i]);
            }
        }
    }
})

function setTableData() {
    var selectedItem = this.options[this.selectedIndex];
    aleart(selectedItem.value);
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

$(function () {
    $("#modal-open").click(
        function () {
            //[id:modal-open]をクリックしたら起こる処理
            //キーボード操作などにより、オーバーレイが多重起動するのを防止する
            $(this).blur();	//ボタンからフォーカスを外す
            if ($("#modal-overlay")[0]) return false;		//新しくモーダルウィンドウを起動しない [下とどちらか選択]
            //if($("#modal-overlay")[0]) $("#modal-overlay").remove() ;		//現在のモーダルウィンドウを削除して新しく起動する [上とどちらか選択]

            //オーバーレイ用のHTMLコードを、[body]内の最後に生成する
            $("body").append('<div id="modal-overlay"></div>');

            //[$modal-overlay]をフェードインさせる
            $("#modal-overlay").fadeIn("dast");
            //[$modal-content]をフェードインさせる
            centeringModalSyncer();
            $("#modal-content").fadeIn("fast");
        }
    );
    $("#modal-overlay,#modal-close").unbind().click(function () {
        //[#modal-overlay]、または[#modal-close]をクリックしたら起こる処理
        //[#modal-overlay]と[#modal-close]をフェードアウトする
        $("#modal-content,#modal-overlay").fadeOut("fast", function () {
            //フェードアウト後、[#modal-overlay]をHTML(DOM)上から削除
            $("#modal-overlay").remove();
        });
    });

    $("#settings").unbind().onchange(function () {
        //[#modal-overlay]と[#modal-close]をフェードアウトする
        $("#modal-content,#modal-overlay").fadeOut("fast", function () {
            //フェードアウト後、[#modal-overlay]をHTML(DOM)上から削除
            $("#modal-overlay").remove();
        });
    });

    //センタリングをする関数
    function centeringModalSyncer() {

        //画面(ウィンドウ)の幅を取得し、変数[w]に格納
        var w = $(window).width();

        //画面(ウィンドウ)の高さを取得し、変数[h]に格納
        var h = $(window).height();

        //コンテンツ(#modal-content)の幅を取得し、変数[cw]に格納
        var cw = $("#modal-content").outerWidth({ margin: true });

        //コンテンツ(#modal-content)の高さを取得し、変数[ch]に格納
        var ch = $("#modal-content").outerHeight({ margin: true });

        //コンテンツ(#modal-content)を真ん中に配置するのに、左端から何ピクセル離せばいいか？を計算して、変数[pxleft]に格納
        var pxleft = ((w - cw) / 2);

        //コンテンツ(#modal-content)を真ん中に配置するのに、上部から何ピクセル離せばいいか？を計算して、変数[pxtop]に格納
        var pxtop = ((h - ch) / 2);

        //[#modal-content]のCSSに[left]の値(pxleft)を設定
        $("#modal-content").css({ "left": pxleft + "px" });

        //[#modal-content]のCSSに[top]の値(pxtop)を設定
        $("#modal-content").css({ "top": pxtop + "px" });

    }
})

