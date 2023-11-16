const { 
  Client: DisClient, 
  EmbedBuilder,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require('discord.js')

const { Client: UnbClient } = require('unb-api')

process.on('SIGINT', () => {
  console.log("Caught interrupt signal");
  process.exit();
})

const unbClient = new UnbClient(process.env.UNB_TOKEN)
const disClient = new DisClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})

const guildID = process.env.DISCORD_GUILD_ID
const userID = process.env.DISCORD_USER_ID

const targetItemIds = process.env.TARGET_ITEM_IDS.split(',')

// unbClient.getUserBalance(guildID, userID).then(user => console.log(user))
// unbClient.editUserBalance(guildID, userID, { cash: 5 })
// unbClient.getInventoryItems(guildID, userID, { sort: 'id', page: 1 }).then(ret => console.log(ret.items))

disClient.once(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}`)
  // console.log(`Guild: ${disClient.guild}`)
  // const guild = disClient.guilds.get(guildID)
  // const members = guild.members.map(member => member.id);
	// console.log(members)

  // client.guild.members.fetch().then(m => console.log(m))
})

async function main() {
  console.log('Logging in')
  await disClient.login(process.env.DISCORD_TOKEN)
  console.log(targetItemIds)

  // {id, name, items:[{id,quantity}]}
  result = []

  const guild = disClient.guilds.cache.get(guildID)
  // list({after, cache, limit})
  const members = await guild.members.list()
  for ([k, v] of members) {
    if (v.guild.id != guildID) continue

    const allMembers = await v.guild.members.fetch()
    for ([k, v] of allMembers) {
      if (v.user.bot) continue

      console.log(v.user.id)
      console.log(v.user.username)
      // unbClient.getApplicationPermission(v.guild.id)
      //   .then(permission =>  console.log(`permission: ${JSON.stringify(permission.json)}`))
      
      ret = await unbClient.getInventoryItems(guildID, v.user.id)
      result.push({
        id: v.user.id,
        name: v.user.username,
        items: ret.items.filter(e => targetItemIds.includes(e.itemId)).map(e => ({id: e.itemId, quantity: e.quantity}))
      })

      // unbClient.getUserBalance(guildID, v.user.id)
      //   .then(user => console.log(user))
    }
    break
  }

  console.log(JSON.stringify(result, null, 2))  
}

main().catch(console.error)
