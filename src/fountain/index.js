const { 
  Client: DisClient, 
  EmbedBuilder,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require('discord.js')

const { Client: UnbClient } = require('unb-api')

const unbClient = new UnbClient(process.env.UNB_TOKEN)
const disClient = new DisClient({
  intents: [GatewayIntentBits.Guilds],
})

const guildID = '696412936691908668'
const userID = '695663775541493771'

// unbClient.getUserBalance(guildID, userID).then(user => console.log(user))


disClient.commands = new Collection()

var command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
}

disClient.commands.set(command.data.name, command)

disClient.once(Events.ClientReady, () => {
  console.log(`Logged in as ${disClient.user.tag}`)
})

disClient.on(Events.InteractionCreate, async interaction => {
  console.log(interaction)

	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})

console.log('Logging in')
disClient.login(process.env.DISCORD_TOKEN)
