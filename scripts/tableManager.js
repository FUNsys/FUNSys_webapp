
//テーブルを管理するクラス
TableManager = function (tableObj) {
  this.table = tableObj;
};

// 現在の表を削除して空の表を作成する
TableManager.prototype.createTable = function (rowCount, colCount) {
  this.table.innerHTML = '';
  for (var i = 0; i < rowCount; i++) {
    var row = this.table.insertRow(-1);
    for (var j = 0; j < colCount; j++) {
      if (i == 0 || j == 0) {
        //1行目&1列目は見出し行とする
        row.innerHTML += "<th></th>";
      } else {
        var cell = row.insertCell(-1);
      }
    }
  }
}

//テーブルのセルを取得する
TableManager.prototype.getCell = function (row, col) {
  return this.table.rows[row].cells[col];
}

//テーブルの行数を返す
TableManager.prototype.getRowCount = function () {
  return this.table.rows.length;
}

//テーブルの列数を返す
TableManager.prototype.getColCount = function () {
  return this.table.rows[0].cells.length;
}

