const fs = require('fs')

const { 
  Client: DisClient, 
  EmbedBuilder,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require('discord.js')

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec))

// Discord botが動き続けてしまうため、Ctrl+Cで中断できるように
process.on('SIGINT', () => {
  console.log("Caught interrupt signal");
  process.exit();
})

const disClient = new DisClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  
})

const guildId = process.env.DISCORD_GUILD_ID
const raceRoleId = process.env.RACE_ROLE_ID

disClient.once(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}`)
})

async function main() {
  console.log('Logging in')
  await disClient.login(process.env.DISCORD_TOKEN)
  await sleep(1000 * 5)

  // [{id, name, handle}]
  let results = []

  const guild = disClient.guilds.cache.get(guildId)
  // list({after, cache, limit})
  const members = await guild.members.list()
  
  for ([k, v] of members) {
    // 目的のギルドが見つかるまでスキップ
    if (v.guild.id != guildId) continue

    const Role = v.guild.roles.cache.get(raceRoleId);

    console.log(JSON.stringify(Role, null, 2))
    console.log(Role.members)
    
    // ギルドのすべてのメンバーを取得
    const allMembers = await v.guild.members.fetch()
    console.log(`allMembers: ${allMembers.size}`)
    for ([k, v] of allMembers) {
      // botをスキップ
      if (v.user.bot) continue
      // Roleを不所持ならスキップ
      if (!v.roles.cache.find(role => role.id == raceRoleId)) continue

      await v.roles.remove(raceRoleId);

      results.push(v.id)
      await sleep(100)
    }

    fs.writeFileSync('removeroles.json', JSON.stringify(results, null, 2))
    break
  }

  console.log('Done. Hit Ctrl+C to exit.')
}

// Run
main().catch(console.error)
