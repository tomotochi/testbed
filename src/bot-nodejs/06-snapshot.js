const fs = require('fs')
const { parseArgs } = require("util")

const { Client: UnbClient } = require('unb-api')

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))
const unbClient = new UnbClient(process.env.UNB_TOKEN)
const guildId = process.env.DISCORD_GUILD_ID
// unbインベントリのitemIdの配列（フィルタリング用）
const targetItemIds = process.env.TARGET_ITEM_IDS.split(',')

const parsed = parseArgs({
  options: {
    // 再開オプション
    resume: { type: 'boolean', short: 'r'}
  }
})
console.log(parsed.values)

async function main() {
  const retryCountMax = 5
  const members = JSON.parse(fs.readFileSync('members.json'))

  console.log(targetItemIds)
  console.log(`Members: ${members.length}`)

  // unbインベントリ所持状況の格納先
  // {id, name, items:[{id,quantity}]}
  let results = []
  let processedMemberCount = 0

  // 再開処理
  let resumedIds = []
  if (parsed.values.resume) {
    results = JSON.parse(fs.readFileSync('snapshot.json'))

    console.log(`Resuming ${results.length} entries...`)
    resumedIds = results.map(e => e.id)
    processedMemberCount = results.length
  }

  for (const member of members) {
    // skip resumed
    if (resumedIds.includes(member.id)) continue

    // Print progress
    if (processedMemberCount % 100 == 0) {
      console.log(`${processedMemberCount} / ${members.length}`)
    }
    processedMemberCount++

    let retryCount = 0

    while(retryCount <= retryCountMax) {
      try {
        // console.log(JSON.stringify(member))
        // console.log(`member.id: ${member.id}`)
        ret = await unbClient.getInventoryItems(guildId, member.id)
        if (ret.totalPages > 1) console.error('THIS GUY HAS TONS OF ITEMS', member.id, member.name, member.handle)

        await sleep(100)

        results.push({
          id: member.id,
          name: member.name,
          handle: member.handle,
          items: ret.items.filter(e => targetItemIds.includes(e.itemId)).map(e => ({id: e.itemId, quantity: e.quantity}))
        })
        fs.writeFileSync('snapshot.json', JSON.stringify(results, null, 2))
        break
      } catch(ex) {
        console.error(ex.toString())
        retryCount++

        if (retryCount > retryCountMax) {
          console.error('Aborting..')
          break
        }
        await sleep(1000 * 10)
      }
    } // while retry
  } // for members

  fs.writeFileSync('snapshot.json', JSON.stringify(results, null, 2))
  console.log('Done.')
}

// Run
main().catch(console.error)
