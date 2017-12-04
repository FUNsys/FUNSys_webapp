//ã?ã¼ãã«ãç®¡ç?ããã¯ã©ã¹?¼ãã¾ãæå³ããªãã£ãããï¼?

TableManager = function (tableObj) {
  this.table = tableObj;
};

// ç¾å¨ã®è¡¨ãç?´æ£?ãã¦ç©ºã®è¡¨ãä½æ?ãã?
TableManager.prototype.createTable = function (rowCount, colCount) {
  this.table.innerHTML = '';
  for (var i = 0; i < rowCount; i++) {
    var row = this.table.insertRow(-1);
    for (var j = 0; j < colCount; j++) {
      if (i == 0 || j == 0) {
        //?¼è¡ç®&?¼å?ç®ã¯è¦å?ºãè¡ã¨ãã
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


// ã?ã¼ãã«ã®æ?å®ããã»ã«ã«HTMLãæ¿å¥ãã
TableManager.prototype.insertHTML = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.innerHTML = value;
}

//ã?ã¼ãã«ã®æ?å®ããã»ã«ã®HTMLãåé¤ãã
TableManager.prototype.deleteHTML = function (row, col) {
  var cell = this.table.rows[row].cells[col];
  cell.innerHTML = "";
}

//ã?ã¼ãã«ã®æ?å®ããã»ã«ã®è²ãå¤æ´ãã
TableManager.prototype.changeCellColor = function (row, col, value) {
  var cell = this.table.rows[row].cells[col];
  cell.style.backgroundColor = value;
}

//ã?ã¼ãã«ã®è¡æ°ãè¿ã
TableManager.prototype.getRowCount = function () {
  return this.table.rows.length;
}

//ã?ã¼ãã«ã®åæ°ãè¿ã(ã?ã¼ãã«ã®å½¢ç¶ã«ãã£ã¦ã¯æ­£ç¢ºã§ãªã?å ´åããï¼?
TableManager.prototype.getColCount = function () {
  return this.table.rows[0].cells.length;
}

