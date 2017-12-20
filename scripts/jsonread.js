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

//現在の曜日の講義データを取得
function getCurrentDayLectureData(day) {
    return datas.lectures.filter(x => x.week == day + 1);
}

//すべてのクラスオブジェクトを取得
function getAllClasses() {
    return datas.classes;
}

//学年でクラスオブジェクトを取得
function getClassesFromYear(year) {
    return datas.classes.filter(x => getYearFromClass(x) == year);
}

//複数学年のクラスオブジェクトを取得
function getClassesFromYears(years) {
    return datas.classes.filter(x => {
        for (var i = 0, len = years.length; i < len; i++) {
            if (getYearFromClass(x) == years[i]) {
                return true;
            }
        }
        return false;
    });
}

//コースからクラスオブジェクトを取得
function getClassesFromCourse(course) {
    return datas.classes.filter(x => x.course == course);
}

//クラスオブジェクトから学年を取得
function getYearFromClass(target) {
    var str = target.class_id.toString();
    var year = str.substring(str.length - 3, str.length - 2);
    return Number(year);
}

//クラスオブジェクトから組番号を取得
function getSetNumFromClass(target) {
    var str = target.class_id.toString();
    var setNum = str.substring(str.length - 2, str.length);
}

//すべての講師オブジェクトを取得
function getAllTeachers() {
    return datas.teachers;
}

//所属から講師オブジェクトを取得
function getTeachersFromRole(role) {
    return datas.teachers.filter(x => x.role == role);
}

//複数の所属から講師オブジェクトを取得
function getTeachersFromRoles(roles) {
    return datas.teachers.filter(x => {
        for (var i = 0, len = roles.length; i < len; i++) {
            if (x.role == roles[i]) {
                return true;
            }
        }
        return false;
    });
}

//すべての教室を取得
function getAllRooms() {
    return datas.rooms;
}
