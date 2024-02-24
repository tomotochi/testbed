const fs = require('fs')

const snapshotContent = fs.readFileSync('snapshot.json')
const snapshot = JSON.parse(snapshotContent)

const targetItemIds = [
  process.env.TARGET_ITEM_ID_1,
  process.env.TARGET_ITEM_ID_2,
  process.env.TARGET_ITEM_ID_3,
  process.env.TARGET_ITEM_ID_4,
  process.env.TARGET_ITEM_ID_5,
  process.env.TARGET_ITEM_ID_6,
]
console.log(`targetItemIds: ${targetItemIds}`)

// {id: quantity}
let items = {
  [process.env.TARGET_ITEM_ID_1]: 0,
  [process.env.TARGET_ITEM_ID_2]: 0,
  [process.env.TARGET_ITEM_ID_3]: 0,
  [process.env.TARGET_ITEM_ID_4]: 0,
  [process.env.TARGET_ITEM_ID_5]: 0,
  [process.env.TARGET_ITEM_ID_6]: 0,
}
let total = 0
// {id, mp}
let distribution = []

// Flatten 投票券 items
for (let e of snapshot) {
  for (let item of e.items) {
    // 投票券以外はスキップ
    if (!targetItemIds.includes(item.id)) continue

    let quantity = parseInt(item.quantity)
    items[item.id] += quantity
    total += quantity
  }
}

// MPを山分け
distribution = {
  total: {
    [process.env.TARGET_ITEM_ID_1]: total * 100 * parseFloat(process.env.DISTRIBUTION_RATIO_1),
    [process.env.TARGET_ITEM_ID_2]: total * 100 * parseFloat(process.env.DISTRIBUTION_RATIO_2),
    [process.env.TARGET_ITEM_ID_3]: total * 100 * parseFloat(process.env.DISTRIBUTION_RATIO_3),
    [process.env.TARGET_ITEM_ID_4]: total * 100 * parseFloat(process.env.DISTRIBUTION_RATIO_4),
    [process.env.TARGET_ITEM_ID_5]: total * 100 * parseFloat(process.env.DISTRIBUTION_RATIO_5),
    [process.env.TARGET_ITEM_ID_6]: total * 100 * parseFloat(process.env.DISTRIBUTION_RATIO_6),
  }
}

distribution.distribute = {
  [process.env.TARGET_ITEM_ID_1]: distribution.total[process.env.TARGET_ITEM_ID_1] / items[process.env.TARGET_ITEM_ID_1],
  [process.env.TARGET_ITEM_ID_2]: distribution.total[process.env.TARGET_ITEM_ID_2] / items[process.env.TARGET_ITEM_ID_2],
  [process.env.TARGET_ITEM_ID_3]: distribution.total[process.env.TARGET_ITEM_ID_3] / items[process.env.TARGET_ITEM_ID_3],
  [process.env.TARGET_ITEM_ID_4]: distribution.total[process.env.TARGET_ITEM_ID_4] / items[process.env.TARGET_ITEM_ID_4],
  [process.env.TARGET_ITEM_ID_5]: distribution.total[process.env.TARGET_ITEM_ID_5] / items[process.env.TARGET_ITEM_ID_5],
  [process.env.TARGET_ITEM_ID_6]: distribution.total[process.env.TARGET_ITEM_ID_6] / items[process.env.TARGET_ITEM_ID_6],
}

console.log(JSON.stringify(items, null, 2))
console.log(JSON.stringify({total: total, mp: total * 100}))
console.log(JSON.stringify({distribution}, null, 2))

fs.writeFileSync('settlement.json', JSON.stringify({
  items,
  total: {quantity: total, mp: total * 100},
  distribution,
}, null, 2))

// 投稿内容を出力
console.log('投票券の購入状況:')
for (let [k, v] of Object.entries(items)) {
  console.log(`${k}: ${v}`)
}
console.log(`計: ${total}`)

console.log('1投票券あたりのMPの配分:')
for (let [k, v] of Object.entries(distribution.distribute)) {
  console.log(`${k}: ${v}`)
}
