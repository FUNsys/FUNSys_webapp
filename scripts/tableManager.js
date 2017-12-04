//�?ーブルを管�?するクラス?��あまり意味がなかったかも�?

TableManager = function (tableObj) {
  this.table = tableObj;
};

// 現在の表を�?��?して空の表を作�?�す�?
TableManager.prototype.createTable = function (rowCount, colCount) {
  this.table.innerHTML = '';
  for (var i = 0; i < rowCount; i++) {
    var row = this.table.insertRow(-1);
    for (var j = 0; j < colCount; j++) {
      if (i == 0 || j == 0) {
        //?��行目&?���?�目は見�?�し行とする
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


// �?ーブルの�?定したセルにHTMLを挿入する
TableManager.prototype.insertHTML = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.innerHTML = value;
}

//�?ーブルの�?定したセルのHTMLを削除する
TableManager.prototype.deleteHTML = function (row, col) {
  var cell = this.table.rows[row].cells[col];
  cell.innerHTML = "";
}

//�?ーブルの�?定したセルの色を変更する
TableManager.prototype.changeCellColor = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.style.backgroundColor = value;
}

//�?ーブルの行数を返す
TableManager.prototype.getRowCount = function () {
  return this.table.rows.length;
}

//�?ーブルの列数を返す(�?ーブルの形状によっては正確でな�?場合あり�?
TableManager.prototype.getColCount = function () {
  return this.table.rows[0].cells.length;
}

