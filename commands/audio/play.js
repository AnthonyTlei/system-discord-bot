const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { AudioManager, AudioManagerEvents } = require('../../managers/audio.js');

const manager = new AudioManager();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song.')
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('The query to search for.')
				.setRequired(false)
				.setMaxLength(2000),
		)
		.addStringOption((option) =>
			option
				.setName('link')
				.setDescription('The Link of the Spotify/Youtube track/playlist to play.')
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
			const connection = joinVoiceChannel({
				channelId: interaction.member.voice.channelId,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			if (!connection) {
				await interaction.editReply('Failed to join voice channel.');
				return;
			}
			const link = interaction.options.getString('link');
			const query = interaction.options.getString('query');
			if (!link && !query) {
				await interaction.editReply('One of the parameters must be provided.');
				return;
			}
			if (link) {
				await manager.play({
					url: link,
					callback: (reply) => interaction.editReply(reply),
				});
			}
			else if (query) {
				await manager.play({
					query,
					callback: (reply) => interaction.editReply(reply),
				});
			}
			connection.subscribe(manager.player);
			await manager.on(AudioManagerEvents.ERROR, (error) => {
				// TODO: Make the message more descriptive. And display it last?
				console.error('Error playing song:', error);
				interaction.editReply('Error playing song. Moving to next song.');
			});
		}
		catch (error) {
			console.error('Error executing play command:', error);
		}
	},
};
