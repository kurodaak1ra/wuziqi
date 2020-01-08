window.onload = function () {
  init()
}

/**
 * 数据棋盘
 * null: 未落子
 * 0: 黑棋
 * 1: 白棋
 */
var globalData = []
/**
 * 下个子轮到谁（第一个子是黑棋）
 * false: 黑棋
 * true: 白棋
 */
var globalNext = false
/**
 * 五子棋输赢自动判定
 */
var globalAutoCheck = true
/**
 * 游戏结束禁止点击
 */
var globalGameOver = false
/**
 * 游戏结束统计
 */
var globalBlack = 0
var globalWhite = 0
var globalTargetChess = null

/**
 * 仿 jq 选择器
 * @param {String} ele 名称
 */
function $(ele) {
  var el = document.querySelectorAll(ele).length
  if (el === 0) {
    return null
  } else if (el === 1) {
    return document.querySelectorAll(ele)[0]
  } else {
    return document.querySelectorAll(ele)
  }
}

/**
 * 创建元素
 * @param {String} ele 名称
 * @param {Object} attr 属性
 */
function createEle(ele, attr) {
  var el = document.createElement(ele)
  for (var i in attr) {
    el.setAttribute(i, attr[i])
  }
  return el
}

/**
 * 初始化游戏
 */
function init() {
  // 创建主容器
  document.body.prepend(createEle('div', { 'class': 'app' }))
  // 导入游戏入口
  $('.app').appendChild(creatInput())
}

/**
 * 检测横竖屏调棋盘布局
 * @param {Number} count 棋盘宽度
 */
function checkerboardResize(count) {
  var rate = 1
  var lattice = 0
  if (document.body.clientWidth > document.body.clientHeight) {
    lattice = Math.floor(document.body.clientHeight * rate / count)
  } else {
    lattice = Math.floor(document.body.clientWidth * rate / count)
  }
  $('.app-container').style.width = lattice * (count - 1) + 'px'
  $('.chess-piece-container').style.width = (lattice * count) + 'px'
  $('.chess-piece-container').style.top = (lattice / -2) + 'px'
  $('.chess-piece-container').style.left = (lattice / -2) + 'px'
  for (var i = 0; i < $('.chess-board').length; i++) {
    $('.chess-board')[i].style.width = lattice + 'px'
    $('.chess-board')[i].style.height = lattice + 'px'
  }
  for (var i = 0; i < $('.chess-piece').length; i++) {
    $('.chess-piece')[i].style.width = lattice + 'px'
    $('.chess-piece')[i].style.height = lattice + 'px'
  }
}

/**
 * 创建棋盘输入 input
 */
function creatInput() {
  var input = createEle('input', {
    'id': 'input',
    'autofocus': 'autofocus',
    'placeholder': '输入棋盘规格（例如 5*5 输入 5，MIN 5，MAX 20）'
  })
  input.onkeyup = insert
  input.onblur = function () {
    this.style.boxShadow = '0 0 0 0 rgba(0,0,0,0)'
  }
  input.onfocus = function () {
    this.style.boxShadow = '0 1px 6px 0 rgba(32,33,36,0.28)'
  }
  return input
}

/**
 * 生成棋盘
 * @param {Event} ev 键盘敲击事件
 */
function insert(ev) {
  if (ev.keyCode !== 13) return
  if (!/^-?\d+$/.test(this.value)) {
    alert('你输入的这是啥？？？')
    this.value = ''
    return
  } else if (this.value < 5) {
    alert('输入错误：棋盘太小，没法玩')
    this.value = ''
    return
  } else if (this.value > 20) {
    alert('输入错误：棋盘太大，放不下')
    this.value = ''
    return
  }
  // 移除 input
  $('#input').remove()
  // 创建棋盘容器
  var appContainer = createEle('div', { 'class': 'app-container' })
  var checkerboardContainer = createEle('div', { 'class': 'chess-board-container' })
  appContainer.appendChild(checkerboardContainer)
  $('.app').appendChild(appContainer)
  // 填充棋盘（减一是为了让横向点为输入的数值，插入的 element 减一）
  for (var i = 0; i < Math.pow((this.value - 1), 2); i++) {
    $('.chess-board-container').appendChild(createEle('i', { 'class': 'chess-board' }))
  }
  // 生成棋子
  chessPiece(parseInt(this.value))
  // 设置棋盘边框尺寸
  checkerboardResize(this.value)
}

/**
 * 生成棋子
 * @param {Number} c 棋盘尺寸
 */
function chessPiece(c) {
  $('.app-container').prepend(createEle('div', { 'class': 'chess-piece-container' }))
  for (var i = 0; i < Math.pow(c, 2); i++) {
    !function (i) {
      var iEl = createEle('i', { 'class': 'chess-piece' })
      var bEl = createEle('b')
      var emEl = createEle('em')
      // 计算点击坐标
      var x = 0
      var y = 0
      if (i / (c - 1) <= 1) {
        x = i
      } else {
        x = i % c
        y = Math.floor(i / c)
      }
      emEl.onclick = function () {
        target(c, x, y, this)
      }
      bEl.appendChild(emEl)
      iEl.appendChild(bEl)
      $('.chess-piece-container').appendChild(iEl)
    }(i)
  }
  // 生成数据棋盘数据
  for (var i = 0; i < c; i++) {
    var childArr = []
    for (var j = 0; j < c; j++) {
      childArr.push(null)
    }
    globalData.push(childArr)
  }
  // 生成信息框
  infoBox()
}

/**
 * 生成信息框
 */
function infoBox() {
  // 信息
  var template = '\
    <li>黑子数量：<span class="black-count">0</span></li>\
    <li>白字数量：<span class="white-count">0</span></li>\
    <li>下次落子：<span class="next-chess next-chess-black"></span></li>\
  '
  var infoBox = createEle('ul', { 'class': 'info-box' })
  infoBox.innerHTML = template
  // 功能按钮
  var featuresButton = createEle('div', { 'class': 'features-button' })
  // 重载
  var reload = createEle('div', { 'class': 'reload' })
  reload.innerHTML = '重载'
  reload.onclick = function () {
    var check = confirm('确认重载，重开一盘？')
    if (!check) return
    document.body.innerHTML = ''
    globalData = []
    globalNext = false
    globalAutoCheck = true
    globalGameOver = false
    globalBlack = 0
    globalWhite = 0
    globalTargetChess = null
    init()
  }
  // 自动判定选择按钮
  var autoCheck = createEle('div', { 'class': 'auto-check' })
  autoCheck.innerHTML = '自动判定 (开)'
  autoCheck.onclick = function () {
    if (globalAutoCheck) {
      globalAutoCheck = !globalAutoCheck
      this.innerHTML = '自动判定 (关)'
    } else {
      globalAutoCheck = !globalAutoCheck
      this.innerHTML = '自动判定 (开)'
    }
  }
  featuresButton.appendChild(autoCheck)
  featuresButton.appendChild(reload)
  $('.app').append(infoBox)
  $('.app').append(featuresButton)
}

/**
 * 棋子点击
 * @param {Number} c 棋盘尺寸
 * @param {Number} x x 轴点击坐标
 * @param {Number} y y 轴点击坐标
 * @param {Element} _this 被点击元素
 */
function target(c, x, y, _this) {
  if (globalGameOver) return
  if (globalData[y][x] !== null) return
  if (!globalNext) {
    globalData[y][x] = 0
    _this.setAttribute('class', 'black')
    var currentCunt = parseInt($('.black-count').innerHTML)
    $('.black-count').innerHTML = currentCunt += 1
    $('.next-chess').classList.replace('next-chess-black', 'next-chess-white')
  } else {
    globalData[y][x] = 1
    _this.setAttribute('class', 'white')
    var currentCunt = parseInt($('.white-count').innerHTML)
    $('.white-count').innerHTML = currentCunt += 1
    $('.next-chess').classList.replace('next-chess-white', 'next-chess-black')
  }
  globalNext = !globalNext
  dataCheck(c, x, y)
}

/**
 * 生成四个方位数据列表
 * @param {Number} c 棋盘尺寸
 * @param {Number} x x 轴点击坐标
 * @param {Number} y y 轴点击坐标
 */
function dataCheck(c, x, y) {
  if (!globalAutoCheck) return
  // console.log(globalData)
  var raw = []
  var column = []
  var left = []
  var right = []
  var startX = (x - 4) <= 0 ? 0 : (x - 4)
  var startY = (y - 4) <= 0 ? 0 : (y - 4)
  var endX = (x + 4) >= c ? (c - 1) : (x + 4)
  var endY = (y + 4) >= c ? (c - 1) : (y + 4)
  var countX = 9
  // var countY = 9
  if (x < 4) countX = 9 - (4 - x)
  if ((c - x) < 4) countX = 4 + (c - x)
  // if (y < 4) countY = 9 -  (4 - y)
  // if ((c - y) < 4) countY = 4 + (c - y)
  // console.log(
  //   'x: ' + x,
  //   'y: ' + y,
  //   'startX: ' + startX,
  //   'startY: ' + startY,
  //   'endX: ' + endX,
  //   'endY: ' + endY,
  //   'countX: ' + countX,
  //   'countY: ' + countY
  // )
  for (var i = startY; i <= endY ; i++) {
    var nextRawCount = 0
    if (countX === 9) {
      if (i === y) {
        nextRawCount = 9
      } else {
        nextRawCount = 3
      }
    } else {
      if (i === y) {
        nextRawCount = countX
      } else {
        nextRawCount = 2
      }
    }
    // 获取 横竖左右 数据
    if (nextRawCount <= 3) {
      column.push(globalData[i][x])
      var l = globalData[i][startX + (i - startY)]
      var r = globalData[i][endX - (i - startY)]
      if (l !== undefined && (x - 4) + (i - startY) >= 0) left.push(l)
      if (r !== undefined && (x + 4) - (i - startY) <= c) right.push(r)
    } else {
      for (var j = startX; j <= endX; j++) {
        raw.push(globalData[i][j])
      }
      column.push(globalData[i][x])
      left.push(globalData[i][x])
      right.push(globalData[i][x])
    }
  }
  judge(raw, column, left, right)
}

/**
 * 最终判定
 * @param {Array} raw 行
 * @param {Array} column 列
 * @param {Array} left 左
 * @param {Array} right 右
 */
function judge(raw, column, left, right) {
  // console.log(raw)
  // console.log(column)
  // console.log(left)
  // console.log(right)
  // 行
  globalBlack = 0
  globalWhite = 0
  globalTargetChess = null
  for (var i = 0; i < raw.length; i++) {
    if (judgeTools(raw[i])) return
  }
  // 列
  globalBlack = 0
  globalWhite = 0
  globalTargetChess = null
  for (var i = 0; i < column.length; i++) {
    if (judgeTools(column[i])) return
  }
  // 左
  globalBlack = 0
  globalWhite = 0
  globalTargetChess = null
  for (var i = 0; i < left.length; i++) {
    if (judgeTools(left[i])) return
  }
  // 右
  globalBlack = 0
  globalWhite = 0
  globalTargetChess = null
  for (var i = 0; i < right.length; i++) {
    if (judgeTools(right[i])) return
  }
  // console.log('globalBlack: ' + globalBlack)
  // console.log('globalWhite: ' + globalWhite)
  // console.log('globalTargetChess: ' + globalTargetChess)
  // console.log('')
}

/**
 * 判定工具
 * @param {Number} one 数组中的单个元素
 */
function judgeTools(one) {
  if (one === null) return
  if (one === 0) globalBlack++
  if (one === 1) globalWhite++
  if (globalBlack === 5) {
    globalGameOver = true
    setTimeout(function () { alert('黑棋获胜！') }, 200)
    return true
  } else if (globalWhite === 5) {
    globalGameOver = true
    setTimeout(function () { alert('白棋获胜！') }, 200)
    return true
  }
  if (globalTargetChess === null) {
    globalTargetChess = one
  } else {
    if (one !== globalTargetChess) {
      globalBlack = 0
      globalWhite = 0
      globalTargetChess = one
    }
  }
}