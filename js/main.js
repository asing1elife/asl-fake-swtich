let $switch
let $screen

$(function () {
  $switch = $('#switch')
  $screen = $switch.find('.screen')

  // 开机
  // $switch.find('.home-btn').on('click', function () {
  //   let $this = $(this)

  //   // 已经开机则直接关机
  //   if ($switch.hasClass('on')) {
  //     $switch.removeClass('on')
  //     return
  //   }

  //   // 调用欢迎界面
  //   $screen.load('views/welcome.html', function () {
  //     // 延迟20毫秒，确认DOM元素已加载
  //     setTimeout(() => {
  //       $switch.addClass('on')

  //       // 播放音效
  //       playStartAudio()

  //       // logo动画结束后执行欢迎界面动画
  //       $screen.find('.logo-wrapper').on('animationend', function () {
  //         // 指定动画效果
  //         $screen.find('.welcome-wrapper').addClass('bye')

  //         // 欢迎界面动画结束后，加载主界面
  //         $screen.find('.welcome-wrapper').on('webkitTransitionEnd', function () {
  //           loadInterface()
  //         })
  //       })
  //     }, 20)
  //   })
  // })
  loadInterface()

  // 初始化键盘
  initKeyboard()
})

// 播放开机音效
function playStartAudio() {
  new Audio('audios/start.mp3').play()
}

// 加载主界面
function loadInterface() {
  $screen.load('views/interface.html', function () {
    // 选择主界面内容
    $screen.on('click', '.interface-item', function () {
      let $this = $(this)

      $screen.find('.interface-item').removeClass('active')
      $this.addClass('active')
    })

    // 获取游戏数据
    generateGameInfo()
  })
}

// 获取游戏数据
function generateGameInfo() {
  $screen.find('.game-panel').html('<div class="loading-tip">游戏数据加载中...</div>')

  let $localStorage = window.localStorage
  let gameDatas = $localStorage.getItem('game-datas')

  if (gameDatas) {
    console.log('从本地存储中获取游戏数据')

    $screen.find('.game-panel').empty()

    for (let gameData of eval(gameDatas)) {
      addGame(gameData.name, gameData.image)
    }

    // 默认选中第一个游戏
    $screen.find('.game-item').first().trigger('click')

    return
  }

  gameDatas = new Array()

  $.get('https://whatsmall.com/nintendo', {
    gametype: 'switch',
    alias: 'nintendohk'
  }, function (data) {
    let html = $.parseHTML(data)

    $.each(html, (i, el) => {
      if (el.id === 'mp-pusher') {
        let productList = $(el).find('.product_list')

        $screen.find('.game-panel').empty()

        $.each(productList.find('.slide'), (i, el) => {
          // 只获取4个
          if (i > 4) {
            return false
          }

          let $this = $(el)
          let name = $this.find('a').attr('title')
          let image = $this.find('img').data('src').replace('../', 'https://whatsmall.com/').replace('width:480', 'width:144').replace('height:270', 'height:144')

          gameDatas.push({
            name: name,
            image: image
          })

          addGame(name, image)
        })

        return false
      }

    })

    $localStorage.setItem('game-datas', JSON.stringify(gameDatas))

    // 默认选中第一个游戏
    $screen.find('.game-item').first().trigger('click')
  })
}

// 添加游戏
function addGame(name, image) {
  $screen.find('.game-panel').append(`
  <div class="game-item interface-item" data-name="${name}">
  <div class="item-thumbnail" style="background-image: url(${image})">        
  </div>
  </div>`)
}

// 初始化键盘操作
function initKeyboard() {
  $(window).on('keydown', function (e) {
    changeCurrentItem(e.keyCode)
  })

  // 方向键
  $switch.find('.direction-btn').on('click', function () {
    let $this = $(this)
    let keyCode = $this.data('key')

    changeCurrentItem(keyCode)
  })
}

// 改变当前项
function changeCurrentItem(keyCode) {
  // 只有开机时才监听
  if (!$switch.hasClass('on') || $screen.find('.game-item').length === 0) {
    return
  }

  // 获取当前激活项
  let currentItem = $screen.find('.interface-item.active')
  // 获取操作元素的真实索引，用于元素切换时使用
  let currentIndex = $screen.find('.interface-item').index(currentItem)
  // 获取当前激活项左侧偏移量
  let currentOffset = currentItem.offset().left

  let isUser = currentItem.hasClass('user-item')
  let isGame = currentItem.hasClass('game-item')
  let isOperate = currentItem.hasClass('operate-item')

  if (keyCode === 37) { // 左
    // 左侧移动
    leftMove(currentItem, currentIndex)
  } else if (keyCode === 38) { // 上
    // 向上移动
    topMove(currentOffset, isUser, isGame, isOperate)
  } else if (keyCode === 39) { // 右
    // 右侧移动
    rightMove(currentItem, currentIndex)
  } else if (keyCode === 40) { // 下
    // 向下移动
    bottomMove(currentOffset, isUser, isGame, isOperate)
  }
}

// 左侧移动
function leftMove(currentItem, currentIndex) {
  // 已经是第一个
  if ($screen.find('.user-item').index(currentItem) === 0 ||
    $screen.find('.game-item').index(currentItem) === 0 ||
    $screen.find('.operate-item').index(currentItem) === 0) {
    // 触发左侧动画
    toggleLimitAnimation('left')
    return
  }

  // 激活上一个
  $screen.find('.interface-item').removeClass('active')
  $screen.find('.interface-item').eq(currentIndex - 1).addClass('active')
}

// 向上移动
function topMove(currentOffset, isUser, isGame, isOperate) {
  // 没有上一个
  if (isUser) {
    toggleLimitAnimation('top')
    return
  }

  $screen.find('.interface-item').removeClass('active')

  if (isGame) {
    commonActiveItem(currentOffset, 'user')
  }

  if (isOperate) {
    commonActiveItem(currentOffset, 'game')
  }
}

// 右侧移动
function rightMove(currentItem, currentIndex) {
  // 已经是最后一个
  if ($screen.find('.user-item').index(currentItem) === $screen.find('.user-item').last().index() ||
    $screen.find('.game-item').index(currentItem) === $screen.find('.game-item').last().index() ||
    $screen.find('.operate-item').index(currentItem) === $screen.find('.operate-item').last().index()) {

    // 触发右侧动画
    toggleLimitAnimation('right')
    return
  }

  // 激活下一个
  $screen.find('.interface-item').removeClass('active')
  $screen.find('.interface-item').eq(currentIndex + 1).addClass('active')
}

// 向下移动
function bottomMove(currentOffset, isUser, isGame, isOperate) {
  // 没有下一个
  if (isOperate) {
    toggleLimitAnimation('bottom')
    return
  }

  $screen.find('.interface-item').removeClass('active')

  if (isUser) {
    commonActiveItem(currentOffset, 'game')
  }

  if (isGame) {
    commonActiveItem(currentOffset, 'operate')
  }
}

// 左右两侧的限制动画
function toggleLimitAnimation(direction) {
  let currentItem = $screen.find('.interface-item.active')
  let className = `${direction}-limit`

  currentItem.addClass(className)

  setTimeout(() => {
    currentItem.removeClass(className)
  }, 200)
}

// 通用激活操作
function commonActiveItem(currentOffset, type) {
  let className = `.${type}-item`
  let interfaceItem = $screen.find('.interface-item')

  $screen.find(className).each((index, item) => {
    let $this = $(item)
    // 需要考虑左侧偏移量和宽度
    let commonOffset = $this.offset().left + $this.width()

    if (commonOffset > currentOffset) {
      interfaceItem.removeClass('active')
      $this.addClass('active')

      return false
    }
  })

  if (!interfaceItem.hasClass('active')) {
    $screen.find(className).last().addClass('active')
  }
}