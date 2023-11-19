const fs = require('fs')

const { Client: UnbClient } = require('unb-api')

const unbClient = new UnbClient(process.env.UNB_TOKEN)

// unbインベントリのitemIdの配列（フィルタリング用）
const targetItemIds = process.env.TARGET_ITEM_IDS.split(',')

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

const guildID = process.env.DISCORD_GUILD_ID

const distribution = JSON.parse(fs.readFileSync('distribution.json'))
console.log(distribution)
async function distribute() {
  console.log(targetItemIds)

  const retryCountMax = 5

  for (let id of Object.keys(distribution)) {
    let mp = distribution[id]
    let retryCount = 0

    while(retryCount <= retryCountMax) {
      try {
        let ret = await unbClient.editUserBalance(guildID, id, {cash: mp})

        console.log(ret)
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

// Run
distribute().catch(console.error)
