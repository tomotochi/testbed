const fs = require('fs')

const snapshot = JSON.parse(fs.readFileSync('snapshot.json'))

const targetItemId1 = process.env.TARGET_ITEM_ID_1
console.log(`targetItemId1: ${targetItemId1}`)

const bonusItemIdPen = process.env.BONUS_ITEM_ID_PEN
const bonusItemIdFan = process.env.BONUS_ITEM_ID_FAN
const bonusItemIdCard = process.env.BONUS_ITEM_ID_CARD

// [{id, name, score}]
favscore = []
// {id(userid), mp}
for (const e of snapshot) {
  // 1位の投票券の数
  let quantity = 0
  // ボーナス倍率
  let ratio = 1.0
  // ペン・うちわ・トレカコンプリートのカウント用
  let completeCount = 0

  for (item of e.items) {
    // スコア倍率 =
    // 　ペンライト所持数 * 300 * 0.003
    // 　+ うちわ所持数 * 1000 * 0.01
    // 　+ トレカ所持数 * 5000 * 0.05
    // 　+ (ペン・うちわ・トレカコンプリートボーナス) 0.1
    if (bonusItemIdPen == item.id) {
      ratio += item.quantity * 0.003
      completeCount++
    }
    if (bonusItemIdFan == item.id) {
      ratio += item.quantity * 0.01
      completeCount++
    }
    if (bonusItemIdCard == item.id) {
      ratio += item.quantity * 0.05
      completeCount++
    }
    // 1位の投票券
    if (targetItemId1 == item.id) {
      quantity = item.quantity      
    }
  }
  // 1位の投票券がないならスキップ
  if (quantity <= 0) continue
  if (completeCount >= 3) ratio += 0.1

  // 持つ者、持たざる者の差がつきすぎないように2倍までのキャップを設ける
  if (ratio > 2.0) ratio = 2.0

  favscore.push({
    id: e.id,
    name: e.name,
    handle: e.handle,
    quantity: parseInt(quantity),
    ratio,
    score: quantity * ratio, 
  })
}

fs.writeFileSync('favscore.json', JSON.stringify(favscore, null, 2))
