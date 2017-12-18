var request = [
    { url: "https://private-anon-7a79af6424-funsys.apiary-mock.com/lectures" },
    { url: "https://private-anon-7a79af6424-funsys.apiary-mock.com/teachers" },
    { url: "https://private-anon-7a79af6424-funsys.apiary-mock.com/classes" },
    { url: "https://private-anon-7a79af6424-funsys.apiary-mock.com/rooms" },
]
var datas = {
    lectures: null, //講義
    teachers: null, //講師
    classes: null,  //クラス
    rooms: null,    //部屋
};

var jsonLoaded = false;

function loadJson(callback) {
    var jqXHRList = [];
    for (var i = 0; i < request.length; i++) {
        jqXHRList.push($.ajax({
            crossDomain: true,
            url: request[i].url,
            type: "get",
            cache: false,
            dataType: 'json',
        }));
    }
    $.when.apply($, jqXHRList).done(function () {
        datas.lectures = arguments[0][0];
        datas.teachers = arguments[1][0];
        datas.classes = arguments[2][0];
        datas.rooms = arguments[3][0];
        jsonLoaded = true;
        callback();
    }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
        console.log("ajax通信に失敗しました");
        console.log("XMLHttpRequest : " + XMLHttpRequest.status);
        console.log("textStatus     : " + textStatus);
        console.log("errorThrown    : " + errorThrown.message);
    });
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

//現在の曜日の講義データを取得する
function getCurrentDayLectureData() {
    return datas.lectures.filter(x => x.week == currentDay + 1);
}

