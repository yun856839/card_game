//定義遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃(0)
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 紅心(1)
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊(2)
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花(3)
]

//和介面有關的程式碼
const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardContent(index) {
    // 卡片數字7，index = 32，32 / 13 = 2...6，6 + 1 = 7
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)] // 32 / 13 = 2...6，2(方塊)
    return `<p>${number}</p>
      <img src="${symbol}" alt="">
        <p>${number}</p>
    </div>`
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  //flipCards(...cards)
  //flipCards(1,2,3,4,5)
  //catds = [1,2,3,4,5]
  flipCards(...cards) {
    cards.map(card => {
      //如果是背面，回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //如果是正面，回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCard(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedRimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      }, {
        once: true //一次性的 觸發完消失
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div) //before在原本的元素「之前」加入內容 (after在原本之後)
  }

}

//和流程有關的程式碼
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同遊戲狀態，做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        model.revealedCards.push(card)
        view.flipCards(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        //翻了兩張牌，次數 + 1
        view.renderTriedRimes((++model.triedTimes))
        model.revealedCards.push(card)
        view.flipCards(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //配對正確
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('current', this.currentState)
    console.log('revealedCards', model.revealedCards)
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

//和資料有關的程式碼
const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

// 存放小工具
const utility = {
  getRandomNumberArray(count) {
    // count = 5 => [2, 3, 4, 1, 0]
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

//Node List
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})