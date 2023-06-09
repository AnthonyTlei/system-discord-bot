const { SlashCommandBuilder } = require('discord.js');
const { AudioManager } = require('../../managers/audio.js');
const manager = new AudioManager();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lyrics')
		.setDescription('Displays lyrics of currently playing song.')
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('The query to search for.')
				.setRequired(false)
				.setMaxLength(2000),
		),
	async execute(interaction) {
		try {
			await interaction.deferReply();
			if (!interaction.member.voice.channelId) {
				await interaction.editReply(
					'You need to be in a voice channel to use this command.',
				);
				return;
			}
			const query = interaction.options.getString('query');
			const response = await manager.lyrics(query);
			await interaction.editReply(response);
		}
		catch (error) {
			console.error('Error executing lyrics command:', error);
		}
	},
};
