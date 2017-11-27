//テーブルを管理するクラス（あまり意味がなかったかも）

TableManager = function (tableObj) {
  this.table = tableObj;
};

// 現在の表を破棄して空の表を作成する
TableManager.prototype.createTable = function (rowCount, colCount) {
  this.table.innerHTML = '';
  for (var i = 0; i < rowCount; i++) {
    var row = this.table.insertRow(-1);
    for (var j = 0; j < colCount; j++) {
      if (i == 0 || j == 0) {
        //０行目&０列目は見出し行とする
        row.innerHTML += "<th></th>";
      } else {
        var cell = row.insertCell(-1);
      }
    }
  }
}


TableManager.prototype.addClass = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.classList.add(value);
}


TableManager.prototype.hasClass = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  return cell.classList.contains(value);
}

TableManager.prototype.removeClass = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.classList.remove(value);
}


// テーブルの指定したセルにHTMLを挿入する
TableManager.prototype.insertHTML = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.innerHTML = value;
}

//テーブルの指定したセルのHTMLを削除する
TableManager.prototype.deleteHTML = function (row, col) {
  var cell = this.table.rows[row].cells[col];
  cell.innerHTML = "";
}

//テーブルの指定したセルの色を変更する
TableManager.prototype.changeCellColor = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.style.backgroundColor = value;
}

//テーブルの行数を返す
TableManager.prototype.getRowCount = function () {
  return this.table.rows.length;
}

//テーブルの列数を返す(テーブルの形状によっては正確でない場合あり）
TableManager.prototype.getColCount = function () {
  return this.table.rows[0].cells.length;
}

