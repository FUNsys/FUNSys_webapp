var days = ['Mon','Tue','Wed','Thu','Fri']

var fabIconNames = {
    'normal': 'dehaze',
    'pushed': 'clear'
}

var linkIconNames ={
    'normal': 'link',
    'pushed': 'clear'
}

var mainOptions = {
    'クラス': 0,
    '教室': 1,
    '教員': 2,
}

var roleOptions = {
    '全所属': 0,
    '情報アーキテクチャ学科': '情報アーキテクチャ学科',
    '複雑系知能学科': '複雑系知能学科',
    '社会連携センター': '社会連携センター',
    'メタ学習センター': 'メタ学習センター'
}

var courseOptions = {
    '全コース': 0,
    '未所属': 'Unassign',
    '情報システムコース': 'System',
    '情報デザインコース': 'Design',
    '複雑系コース': 'Complex',
    '知能システムコース': 'Intelligent',
    '高度ICTコース': 'ICT',
}

var classNumOptions = {
    '全クラス': 0,
    'A': 1,
    'B': 2,
    'C': 3,
    'D': 4,
    'E': 5,
    'F': 6,
    'G': 7,
    'H': 8,
    'I': 9,
    'J': 10,
    'K': 11,
    'L': 12,
    '院生': 13,
}
var gradeOptions = {
    '全学年': 0,
    '1年': 1,
    '2年': 2,
    '3年': 3,
    '4年': 4,
    '院1年': 5,
    '院2年': 6,
}

/*サブセレクトボックスの表示、非表示を切り替えるために、
idとメインセレクトボックスの値を関連付けている*/
var selectOptionRelations = {
    'courseSelectOption': 0,
    'gradeSelectOption': 0,
    'classNumSelectOption': 0,
    'roleSelectOption': 2,
}
