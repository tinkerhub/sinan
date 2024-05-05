import {
  ApplicationCommandType,
  CommandInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputStyle,
  TextInputBuilder,
  ModalActionRowComponentBuilder,
  ApplicationCommandOptionType,
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

    // return interaction.reply({
    //   content: `\`\`\`json\n${JSON.stringify(image, null, 2)}\n\`\`\``
    // });

    const titleActionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        questionTitle
      );
    const bodyActionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        questionBody
      );

    codeChampsModal.addComponents(titleActionRow, bodyActionRow);

      const questionImage = new TextInputBuilder()
        .setCustomId("questionImage")
        .setLabel("Image (Do not modify!!)")
        .setPlaceholder("Image URL for embed.")
        .setStyle(TextInputStyle.Short)
        .setValue(imageUrl ?? "")
        .setRequired(false);

      const imageActionRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          questionImage
        );
      codeChampsModal.addComponents(imageActionRow);

      // Sending the modal
    await interaction.showModal(codeChampsModal);

    // Handling modal event in interactionCreate.ts
  },
} as SlashCommand;
