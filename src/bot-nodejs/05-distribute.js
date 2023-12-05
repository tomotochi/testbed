const fs = require('fs')
const { parseArgs } = require("util")

const { Client: UnbClient } = require('unb-api')

const unbClient = new UnbClient(process.env.UNB_TOKEN)

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

const guildID = process.env.DISCORD_GUILD_ID

const parsed = parseArgs({
  options: {
    // 再開オプション
    resume: { type: 'boolean', short: 'r'}
  }
})
console.log(parsed.values)

async function main() {
  const distribution = JSON.parse(fs.readFileSync('distribution.json'))
  // console.log(distribution)
  
  const retryCountMax = 5
  let results = []
  let processedMemberCount = 0

  // 再開処理
  let resumedIds = []
  if (parsed.values.resume) {
    results = JSON.parse(fs.readFileSync('distribute.json'))

    console.log(`Resuming ${results.length} entries...`)
    resumedIds = results.map(e => e.id)
    processedMemberCount = results.length
  }

  for (const e of distribution) {
    // skip resumed
    if (resumedIds.includes(e.id)) continue

    // Print progress
    if (processedMemberCount % 100 == 0) {
      console.log(`${processedMemberCount} / ${distribution.length}`)
    }
    processedMemberCount++

    let retryCount = 0

    while(retryCount <= retryCountMax) {
      try {
        // ret: User {rank, user_id, cash, bank, total}
        let ret = await unbClient.editUserBalance(guildID, e.id, {cash: e.mp})
        // console.log(ret)
        results.push({...e, cash: ret?.cash})
        fs.writeFileSync('distribute.json', JSON.stringify(results, null, 2))
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
main().catch(console.error)
