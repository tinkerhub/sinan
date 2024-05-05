import {
  ApplicationCommandType,
  CommandInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputStyle,
  TextInputBuilder,
  ModalActionRowComponentBuilder,
  ApplicationCommandOptionType,
  BaseInteraction,
  AttachmentBuilder,
} from "discord.js";
import { Sinan, SlashCommand } from "../../types/interfaces";

export = {
  name: "submit-answer",
  description: "Submit your answer for the code champs.",
  type: ApplicationCommandType.ChatInput,
  teamOnly: true,
  options: [
    {
      name: "language",
      description: "Select the language of your code",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "JavaScript",
          value: "js",
        },
        {
          name: "TypeScript",
          value: "ts",
        },
        {
          name: "Python",
          value: "py",
        },
        {
          name: "C",
          value: "c",
        },
        {
          name: "C++",
          value: "cpp",
        },
        {
          name: "Rust",
          value: "rs",
        },
        {
          name: "Java",
          value: "java",
        },
      ],
    },
  ],
  run: async (client: Sinan, interaction: CommandInteraction) => {
    const { submissionChannel } = client.config;

    if (interaction.channelId !== submissionChannel)
      return interaction.reply({
        content: `Please use the submit command in <#${submissionChannel}> only! `,
        ephemeral: true,
      });

    const language = interaction.options.get("language")?.value ?? "js";

    const submissionModal = new ModalBuilder()
      .setTitle("💫 CodeChamps </>")
      .setCustomId("submissionModal");

    const code = new TextInputBuilder()
      .setPlaceholder(
        getHelloWorldSnippet(language as string) ?? "console.log('Hello, World!')"
      )
      .setCustomId("code")
      .setLabel("Code")
      .setMaxLength(4000)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const explanation = new TextInputBuilder()
      .setPlaceholder("In this code I used...")
      .setCustomId("explanation")
      .setMaxLength(2000)
      .setLabel("Explanation (if any)")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    // Action rows
    const codeActionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        code
      );
    const explanationActionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        explanation
      );

    submissionModal.addComponents(codeActionRow, explanationActionRow);

    // Sending the modal
    await interaction.showModal(submissionModal);

    // Handling modal event here
    client.on(
      "interactionCreate",
      async (modalInteraction: BaseInteraction | any) => {
        if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== "submissionModal") return;

        const code = modalInteraction.fields.getTextInputValue("code");
        const explanation =
          modalInteraction.fields.getTextInputValue("explanation");

        // Build the code into a file
        const codeFile = new AttachmentBuilder(Buffer.from(code)).setName(
          "code." + language
        );

        const files = [codeFile];

        if (explanation) {
          const explanationFile = new AttachmentBuilder(
            Buffer.from(explanation)
          ).setName("explanation.txt");
          files.push(explanationFile);
        }

        // Send the code to the evaluation channel.
        const evaluationChannel: any = interaction.guild?.channels.cache.get(
          client.config.evaluationChannel
        );
        evaluationChannel
          ?.send({
            content: `${client.emojis.cache.get(
              getLanguageEmoji(language)
            )} Submitted by ${interaction.user.username} (${
              interaction.user.id
            })`,
            files,
          })
          .then(() => {
            modalInteraction.reply({
              content: `${client.emojis.cache.get(
                getLanguageEmoji(language)
              )} Your code has been submitted!`,
              ephemeral: false,
            });
          })
          .catch((_err: any) => {
            modalInteraction.reply({
              content: `There was an error while submitting your code. Please try again later.`,
              ephemeral: false,
            });
          });
      }
    );
  },
} as SlashCommand;

function getLanguageEmoji(language: any): string {
  return language === "js" ? "1236672655009251348" : language === "ts" ? "1236673114981531810" : language === "py" ? "1236674326925807707" : language === "c" ? "1236673635905966080" : language === "cpp" ? "1236673748279496804" : language === "rs" ? "1236673904790077594" : language === "java" ? "1236673808358707232" : "❓";
}

const getHelloWorldSnippet = (language: string) => {
  const snippets: { [key: string]: string } = {
    js: "console.log('Hello, World!')",
    ts: "console.log('Hello, World!')",
    py: "print('Hello, World!')",
    c: `printf("Hello, World!");`,
    cpp: `std::cout << "Hello, World!";`,
    rs: `fn main() {
  println!("Hello, World!");
}`,
    java: `System.out.println("Hello, World!");`,
  };
  return snippets[language];
};
