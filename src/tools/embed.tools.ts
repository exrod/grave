import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";

export function chunk(list: any[], size: number): any[][] {
  const chunk = [];
  for (let index = 0; index < list.length; index += size) {
    chunk.push(list.slice(index, size + index));
  }
  return chunk;
}

export async function paginate(pages: EmbedBuilder[], message: Message): Promise<void> {
  let page = 0;
  let embed = pages[page];
  const prevButton = new ButtonBuilder().setCustomId("prev").setLabel("Previous").setStyle(ButtonStyle.Primary).setDisabled(page === 0);
  const pageIndex = new ButtonBuilder().setCustomId("pageIndex").setLabel(`${page + 1}/${pages.length}`).setStyle(ButtonStyle.Secondary).setDisabled(true);
  const nextButton = new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Primary).setDisabled(page === pages.length - 1);;
  const row = new ActionRowBuilder().addComponents(prevButton, pageIndex, nextButton);
  const msg = await message.reply({ embeds: [embed], components: [row as any] });

  const filter = (int: any): any => int.user.id === message.author.id;
  const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
  collector.on("collect", async (int) => {
    if (int.user.id !== message.author.id) {
      int.reply({ content: "You are not allowed to interact with this button", ephemeral: true });
      return;
    };
    if (int.customId === "prev") {
      page = page > 0 ? --page : pages.length - 1;
    } else if (int.customId === "next") {
      page = page + 1 < pages.length ? ++page : 0;
    }
    embed = pages[page];
    prevButton.setDisabled(page === 0);
    nextButton.setDisabled(page === pages.length - 1);
    pageIndex.setLabel(`${page + 1}/${pages.length}`);
    await int.update({ embeds: [embed], components: [row as any] });
  });
  collector.on("end", async () => {
    await msg.edit({ embeds: [embed], components: [] });
  });
}
export function formatTime(ms: number): string {
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  if (ms < minuteMs) return `${ms / 1000}s`;
  if (ms < hourMs)
    return `${Math.floor(ms / minuteMs)}m ${Math.floor(
      (ms % minuteMs) / 1000
    )}s`;
  if (ms < dayMs)
    return `${Math.floor(ms / hourMs)}h ${Math.floor(
      (ms % hourMs) / minuteMs
    )}m`;
  return `${Math.floor(ms / dayMs)}d ${Math.floor((ms % dayMs) / hourMs)}h`;
}
export function parseTime(string: string): number {
  const time = string.match(/([0-9]+[d,h,m,s])/g);
  if (!time) return 0;
  let ms = 0;
  for (const t of time) {
    const unit = t[t.length - 1];
    const amount = Number(t.slice(0, -1));
    if (unit === "d") ms += amount * 24 * 60 * 60 * 1000;
    else if (unit === "h") ms += amount * 60 * 60 * 1000;
    else if (unit === "m") ms += amount * 60 * 1000;
    else if (unit === "s") ms += amount * 1000;
  }
  return ms;
}
