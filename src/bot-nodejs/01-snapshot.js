const fs = require('fs')

const { 
  Client: DisClient, 
  EmbedBuilder,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require('discord.js')

const { Client: UnbClient } = require('unb-api')

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

// Discord botが動き続けてしまうため、Ctrl+Cで中断できるように
process.on('SIGINT', () => {
  console.log("Caught interrupt signal");
  process.exit();
})

const unbClient = new UnbClient(process.env.UNB_TOKEN)
const disClient = new DisClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
})

const guildId = process.env.DISCORD_GUILD_ID

// unbインベントリのitemIdの配列（フィルタリング用）
const targetItemIds = process.env.TARGET_ITEM_IDS.split(',')

disClient.once(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}`)
})

async function snapshot() {
  const retryCountMax = 5

  console.log('Logging in')
  await disClient.login(process.env.DISCORD_TOKEN)
  console.log(targetItemIds)

  // unbインベントリ所持状況の格納先
  // {id, name, items:[{id,quantity}]}
  results = []

  const guild = disClient.guilds.cache.get(guildId)
  // list({after, cache, limit})
  const members = await guild.members.list()
  
  for ([k, v] of members) {
    // 目的のギルドが見つかるまでスキップ
    if (v.guild.id != guildId) continue

    // unbClient.getApplicationPermission(v.guild.id)
    //   .then(permission =>  console.log(`permission: ${JSON.stringify(permission.json)}`))

    // ギルドのすべてのメンバーを取得
    const allMembers = await v.guild.members.fetch()
    console.log(`allMembers: ${allMembers.size}`)
    let processedMemberCount = 0

    for ([k, v] of allMembers) {
      // botをスキップ
      if (v.user.bot) continue

      // console.log(v.user.id, v.user.username, v.user.globalName)

      // Print progress
      if (processedMemberCount % 100 == 0) {
        console.log(`${processedMemberCount} / ${allMembers.size}`)
      }
      processedMemberCount++

      let retryCount = 0
  
      while(retryCount <= retryCountMax) {
        try {
          ret = await unbClient.getInventoryItems(guildId, v.user.id)
          if (ret.totalPages > 1) console.error('THIS GUY HAS TONS OF ITEMS', v.user.id, v.user.username, v.user.globalName)

          await sleep(100)

          results.push({
            id: v.user.id,
            name: v.user.username,
            handle: v.user.globalName,
            items: ret.items.filter(e => targetItemIds.includes(e.itemId)).map(e => ({id: e.itemId, quantity: e.quantity}))
          })
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
    break
  }

  fs.writeFileSync('snapshot.json', JSON.stringify(results, null, 2))
  console.log('Done.')
}

// Run
snapshot().catch(console.error)
