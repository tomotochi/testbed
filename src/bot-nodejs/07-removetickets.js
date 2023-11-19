const fs = require('fs')
const { Client: UnbClient } = require('unb-api')

const unbClient = new UnbClient(process.env.UNB_TOKEN)

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

const snapshot = JSON.parse(fs.readFileSync('snapshot.json'))

const guildId = process.env.DISCORD_GUILD_ID
const targetItemIds = [
  process.env.TARGET_ITEM_ID_1,
  process.env.TARGET_ITEM_ID_2,
  process.env.TARGET_ITEM_ID_3,
]
console.log(`targetItemIds: ${targetItemIds}`)

async function removeticket(){

  const retryCountMax = 5
  let processedMemberCount = 0
  
  for (let e of snapshot) {
    // Print progress
    if (processedMemberCount % 100 == 0) {
      console.log(`${processedMemberCount} / ${snapshot.length}`)
    }
    processedMemberCount++
  
    for (let item of e.items) {
      // 投票券以外はスキップ
      if (!targetItemIds.includes(item.id)) continue
  
      let retryCount = 0
    
      while(retryCount <= retryCountMax) {
        try {
          ret = await unbClient.removeInventoryItem(guildId, e.id, item.id, item.quantity)
    
          await sleep(100)
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
      }
    }
  }  
  console.log('Done.')
}
// Run
removeticket().catch(console.error)

