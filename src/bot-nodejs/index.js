const { 
  Client: DisClient, 
  EmbedBuilder,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require('discord.js')

const { Client: UnbClient } = require('unb-api')

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
const userId = process.env.DISCORD_USER_ID

// unbインベントリのitemIdの配列（フィルタリング用）
const targetItemIds = process.env.TARGET_ITEM_IDS.split(',')

disClient.once(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}`)

  // unbClient.getUserBalance(guildId, userId).then(user => console.log(user))
  // unbClient.editUserBalance(guildId, userId, { cash: 5 })
  // unbClient.getInventoryItems(guildId, userId, { sort: 'id', page: 1 }).then(ret => console.log(ret.items))

  // console.log(`Guild: ${disClient.guild}`)
  // const guild = disClient.guilds.get(guildId)
  // const members = guild.members.map(member => member.id);
	// console.log(members)

  // client.guild.members.fetch().then(m => console.log(m))
})

async function snapshot() {
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
    for ([k, v] of allMembers) {
      // botをスキップ
      if (v.user.bot) continue

      // console.log(v.user.id)
      // console.log(v.user.username)
      try {
        ret = await unbClient.getInventoryItems(guildId, v.user.id)
        results.push({
          id: v.user.id,
          name: v.user.username,
          items: ret.items.filter(e => targetItemIds.includes(e.itemId)).map(e => ({id: e.itemId, quantity: e.quantity}))
        })  
      } catch(ex) {
        console.error(ex.toString())
        console.error('Aborting..')
        break
      }

      // unbClient.getUserBalance(guildId, v.user.id)
      //   .then(user => console.log(user))
    }
    break
  }

  console.log(JSON.stringify(results, null, 2))  
}


async function distribute() {
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
    for ([k, v] of allMembers) {
      // botをスキップ
      if (v.user.bot) continue

      // console.log(v.user.id)
      // console.log(v.user.username)
      try {
        ret = await unbClient.getInventoryItems(guildId, v.user.id)
        results.push({
          id: v.user.id,
          name: v.user.username,
          items: ret.items.filter(e => targetItemIds.includes(e.itemId)).map(e => ({id: e.itemId, quantity: e.quantity}))
        })  
      } catch(ex) {
        console.error(ex.toString())
        console.error('Aborting..')
        break
      }

      // unbClient.getUserBalance(guildId, v.user.id)
      //   .then(user => console.log(user))
    }
    break
  }

  console.log(JSON.stringify(results, null, 2))  
}


// Run
snapshot().catch(console.error)
