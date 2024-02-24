const fs = require('fs')

// 既に過去に当選したメンバーは対象外
const gachaLotteryExcludeNames = process.env.GACHA_LOTTERY_EXCLUDE_NAMES.split(',')
console.log({gachaLotteryExcludeNames})

const favscore = JSON.parse(fs.readFileSync('favscore.json'))
  .filter((e) => !gachaLotteryExcludeNames.includes(e.name))

let winner = []

for (let i = 0; i < 6; i++){
  let base = 0.0
  for (let e of favscore) {
    base += e.score
  }
  for (let idx = 0; idx < favscore.length; idx++) {
    e = favscore[idx]
    if (Math.random() < (e.score / base)) {
      winner.push(e)
      favscore.splice(idx, 1)
      break
    }
    base -= e.score
    console.log(base)
  }  
}

fs.writeFileSync('winner.json', JSON.stringify(winner, null, 2))

// 投稿内容を出力
console.log('ガチャチケ当選者 :tada:')
for (const e of winner) {
  console.log(`- ${e.id} (${e.name})`)
}
