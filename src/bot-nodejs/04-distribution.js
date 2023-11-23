const fs = require('fs')

const snapshot = JSON.parse(fs.readFileSync('snapshot.json'))
const settlement = JSON.parse(fs.readFileSync('settlement.json'))

const targetItemIds = [
  process.env.TARGET_ITEM_ID_1,
  process.env.TARGET_ITEM_ID_2,
  process.env.TARGET_ITEM_ID_3,
]
console.log(`targetItemIds: ${targetItemIds}`)

// [{id, mp}]
distribution = []
// {id(userid), mp}
for (const e of snapshot) {
  // 加算するMP
  let mp = 0
  for (item of e.items) {
    // 投票券でないならスキップ
    if (!targetItemIds.includes(item.id)) continue

    mp += item.quantity * settlement.distribution.distribute[item.id]
  }
  if (mp <= 0) continue
  distribution.push({id: e.id, mp: Math.floor(mp)})
}

fs.writeFileSync('distribution.json', JSON.stringify(distribution, null, 2))
