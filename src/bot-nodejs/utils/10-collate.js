// 投票券のアイテムIDごとに、ユーザリストを作成する
// <item-id>.txtが出力される。中身はCSV
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

// {id, [`name,handle`, ...]}
let result = {}

// Flatten 投票券 items
for (let e of snapshot) {
  for (let item of e.items) {
    // 投票券以外はスキップ
    if (!targetItemIds.includes(item.id)) continue

    result[item.id] ||= []
    result[item.id].push(`${e.name},${e.handle}`)
  }
}

for (const k of Object.keys(result)) {
  fs.writeFileSync(`${k}.txt`, result[k].join("\n"))
}
