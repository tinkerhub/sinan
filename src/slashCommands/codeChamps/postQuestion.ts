import {
  ApplicationCommandType,
  CommandInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputStyle,
  TextInputBuilder,
  ModalActionRowComponentBuilder,
  ApplicationCommandOptionType,
  EmbedBuilder,
  BaseInteraction,
} from "discord.js";
import { Sinan, SlashCommand } from "../../types/interfaces";

export = {
  name: "post-question",
  description: "Post a question in the code champs channel.",
  type: ApplicationCommandType.ChatInput,
  teamOnly: true,
  options: [
    {
      name: "image",
      type: ApplicationCommandOptionType.Attachment,
      description: "Attach an image to the question.",
    },
  ],
  run: async (client: Sinan, interaction: CommandInteraction) => {
    const { codeChampsChannel } = client.config;
    const channel = interaction.guild?.channels.cache.get(codeChampsChannel);

    // If the channel is not found, return an error message
    if (!channel) {
      return interaction.reply({
        content: `> ***Code Champs channel not found!***`,
        ephemeral: true,
      });
    }

    const codeChampsModal = new ModalBuilder()
      .setTitle("💫 CodeChamps </>")
      .setCustomId("codeChampsModal");

    const questionTitle = new TextInputBuilder()
      .setPlaceholder("Enter the title of the question.")
      .setCustomId("questionTitle")
      .setLabel("Title (Short , styled)")
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const questionBody = new TextInputBuilder()
      .setPlaceholder("Enter the body of the question.")
      .setCustomId("questionBody")
      .setMaxLength(2000)
      .setLabel("Description (Use markdown syntax)")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const image = interaction.options?.get("image") ?? null;
    const imageUrl = image?.attachment?.url ?? null;

    const titleActionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        questionTitle
      );
    const bodyActionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        questionBody
      );

    codeChampsModal.addComponents(titleActionRow, bodyActionRow);

    // Sending the modal
    await interaction.showModal(codeChampsModal);

    // Handling modal event here
    client.on(
      "interactionCreate",
      async (modalInteraction: BaseInteraction | any) => {        
        if (
          !modalInteraction.isModalSubmit() ||
          modalInteraction.customId !== "codeChampsModal"
        )
          return;
          const questionTitle = modalInteraction?.fields?.getTextInputValue("questionTitle");
          const questionBody = modalInteraction?.fields?.getTextInputValue("questionBody");

        const codeChampsEmbed = new EmbedBuilder()
          .setTitle("Code Champs")
          .setColor("#2b2d31")
          .setDescription(`${questionTitle}\n\n${questionBody}`)
          .setTimestamp()
          .setImage(imageUrl)
          .setFooter({
            text: `Posted by ${modalInteraction?.user?.username}`,
            iconURL: modalInteraction?.user?.displayAvatarURL?.(),
          });

        const channelId = client.config.codeChampsChannel;
        const channel = modalInteraction.guild?.channels.cache.get(
          channelId
        ) as any;
        await channel
          ?.send({
            embeds: [codeChampsEmbed],
          })
          .then(() => {
            modalInteraction.reply(`Question posted in <#${channelId}>`);
          })
          .catch((_err: any) => {
            modalInteraction.reply("Unable to post the question!");
          });
      }
    );
  },
} as SlashCommand;
