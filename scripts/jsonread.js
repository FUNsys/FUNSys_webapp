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

//指定した条件に沿ったクラスオブジェクトを取得
function getClassByFilter(course, grade, classNum) {
    return datas.classes.filter(x => {
        if (course != 0 && x.course != course) {
            return false;
        }
        if (grade != 0 && getGradeFromClass(x) != grade) {
            return false;
        }
        if (classNum != 0 && getClassNumFromClass(x) != classNum) {
            return false;
        }
        return true;
    });
}

//クラスオブジェクトから学年を取得
function getGradeFromClass(target) {
    var str = target.class_id.toString();
    var grade = str.substring(str.length - 3, str.length - 2);
    return Number(grade);
}

//クラスオブジェクトから組番号を取得
function getClassNumFromClass(target) {
    var str = target.class_id.toString();
    var classNum = str.substring(str.length - 2, str.length);
    return Number(classNum);
}

//すべての講師オブジェクトを取得
function getAllTeachers() {
    return datas.teachers;
}

//指定した条件に沿った講師オブジェクトを取得
function getTeachersByFilter(role) {
    return datas.teachers.filter(x => {
        if (role != 0 && x.role != role) {
            return false;
        }
        return true;
    });
}

//すべての教室を取得
function getAllRooms() {
    return datas.rooms;
}
