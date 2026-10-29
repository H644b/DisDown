import type { DataClient } from "../main/discord";
import type {
  Channel,
  Guild,
  GuildView,
  Message,
  SessionInfo,
  User,
} from "./types";
export const demoUsers: User[] = [
  {
    id: "10001",
    username: "alex.park",
    global_name: "Alex Park",
    accent_color: 0x92b49e,
    bio: "Collecting good conversations. Building small things.",
  },
  {
    id: "10002",
    username: "jules",
    global_name: "Jules",
    accent_color: 0xba9ce1,
    bio: "Design, long walks, and too many browser tabs.",
  },
  {
    id: "10003",
    username: "maya.chen",
    global_name: "Maya Chen",
    accent_color: 0xe9a28a,
    bio: "Making things for the internet.",
  },
  {
    id: "10004",
    username: "rowan",
    global_name: "Rowan",
    accent_color: 0x8eafdc,
  },
];
const guilds: Guild[] = [
  {
    id: "20001",
    name: "The Commons",
    description: "A little corner of the internet for making things together.",
    roles: [
      { id: "20001", name: "@everyone", permissions: "1024" },
      { id: "21001", name: "Makers", permissions: "1024", color: 0xa89cff },
    ],
    emojis: [{ id: "22001", name: "made_it", animated: false }],
  },
  {
    id: "20002",
    name: "Design After Hours",
    description: "Good ideas, after hours.",
  },
  {
    id: "20003",
    name: "Weekend Projects",
    description: "Things we make for the joy of it.",
  },
];
const channels: Channel[] = [
  { id: "30000", guild_id: "20001", type: 4, name: "START HERE", position: 0 },
  {
    id: "30001",
    guild_id: "20001",
    type: 0,
    parent_id: "30000",
    name: "welcome",
    topic: "Say hello. Find your people.",
    position: 1,
  },
  {
    id: "30002",
    guild_id: "20001",
    type: 0,
    parent_id: "30000",
    name: "announcements",
    topic: "A few things worth keeping.",
    position: 2,
  },
  {
    id: "30003",
    guild_id: "20001",
    type: 4,
    name: "THE GOOD STUFF",
    position: 3,
  },
  {
    id: "30004",
    guild_id: "20001",
    type: 0,
    parent_id: "30003",
    name: "general",
    topic: "Ideas, discoveries, and everything in between.",
    position: 4,
  },
  {
    id: "30005",
    guild_id: "20001",
    type: 0,
    parent_id: "30003",
    name: "show-and-tell",
    topic: "What are you working on?",
    position: 5,
  },
  {
    id: "30006",
    guild_id: "20001",
    type: 15,
    parent_id: "30003",
    name: "resources",
    topic: "Links for future you.",
    position: 6,
  },
  {
    id: "30007",
    guild_id: "20001",
    type: 2,
    parent_id: "30003",
    name: "The lounge",
    position: 7,
  },
  {
    id: "30008",
    guild_id: "20001",
    parent_id: "30004",
    type: 11,
    name: "Little things worth saving",
    thread_metadata: { archived: false },
  },
  {
    id: "30009",
    guild_id: "20001",
    parent_id: "30006",
    type: 11,
    name: "Our favorite type foundries",
    thread_metadata: {
      archived: true,
      archive_timestamp: "2026-10-27T10:00:00Z",
    },
  },
  { id: "40001", type: 1, recipients: [demoUsers[1]] },
  {
    id: "40002",
    type: 3,
    name: "The weekend crew",
    recipients: [demoUsers[1], demoUsers[2], demoUsers[3]],
  },
];
const makeMessage = (
  id: string,
  user: number,
  content: string,
  extra: Partial<Message> = {},
): Message => ({
  id,
  channel_id: "30004",
  author: demoUsers[user],
  content,
  timestamp: `2026-10-28T${id === "50001" ? "13:12" : id === "50002" ? "13:14" : id === "50003" ? "13:18" : id === "50004" ? "13:21" : "13:24"}:00Z`,
  attachments: [],
  embeds: [],
  ...extra,
});
export const demoMessages: Message[] = [
  makeMessage(
    "50001",
    1,
    "A small thought for today: the best part of this place is all the little things we share.\n\nThe half-finished ideas. The links someone leaves at 2am. The projects that start with “what if.”",
    {
      reactions: [
        { emoji: { id: null, name: "💜" }, count: 8 },
        { emoji: { id: null, name: "✨" }, count: 4 },
      ],
    },
  ),
  makeMessage(
    "50002",
    0,
    "Exactly this. I found a conversation from last spring that completely changed how I approached my project. Would love to keep more of those moments.",
  ),
  makeMessage(
    "50003",
    2,
    "Started collecting a few of my favorites. This is the moodboard from our first weekend build!",
    {
      attachments: [
        {
          id: "60001",
          filename: "weekend-moodboard.txt",
          size: 126,
          url: "https://cdn.discordapp.com/attachments/30004/60001/weekend-moodboard.txt",
          content_type: "text/plain",
        },
      ],
      reactions: [
        { emoji: { id: null, name: "🔥" }, count: 6 },
        { emoji: { id: null, name: "🫶" }, count: 3 },
      ],
    },
  ),
  makeMessage(
    "50004",
    3,
    "That weekend was so good. Also, for anyone who missed it, here’s our reading list.",
    {
      embeds: [
        {
          type: "link",
          title: "A few things worth reading",
          description:
            "A shared list of design essays, tiny tools, and ideas we keep coming back to.",
          url: "https://example.com/reading-list",
          color: 0xb9a0ed,
        },
      ],
      thread: channels[8],
    },
  ),
  makeMessage("50005", 1, "Future us will be happy we saved these. ☺️", {
    poll: {
      question: { text: "What should we make next?" },
      answers: [
        { answer_id: 1, poll_media: { text: "A tiny tool" } },
        { answer_id: 2, poll_media: { text: "A weekend zine" } },
      ],
    },
    sticker_items: [{ id: "70001", name: "Good things", format_type: 1 }],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            label: "View reading list",
            style: 5,
            url: "https://example.com",
          },
        ],
      },
    ],
  }),
];
export class DemoClient implements DataClient {
  info: SessionInfo = {
    user: demoUsers[0],
    mode: "demo",
    guilds,
    dms: channels.filter((c) => [1, 3].includes(c.type)),
    warnings: [],
  };
  disconnect() {}
  async appearance() {
    return { source: "default" as const, base: "dark" as const };
  }
  async guild(guildId: string): Promise<GuildView> {
    const guild = guilds.find((g) => g.id === guildId)!;
    const base = channels
      .filter((c) => c.guild_id === "20001")
      .map((c) => ({ ...c, guild_id: guildId }));
    return {
      guild,
      channels: base.filter((c) => ![11, 12].includes(c.type)),
      threads: base.filter(
        (c) => [11, 12].includes(c.type) && !c.thread_metadata?.archived,
      ),
      members: demoUsers,
      extras: [
        ...(guild.roles || []).map((r) => ({
          kind: "role" as const,
          id: r.id,
          label: r.name,
          data: r,
        })),
        ...(guild.emojis || []).map((e) => ({
          kind: "emoji" as const,
          id: String(e.id),
          label: String(e.name),
          data: e,
        })),
        {
          kind: "event",
          id: "80001",
          label: "Sunday show & tell",
          data: {
            id: "80001",
            name: "Sunday show & tell",
            scheduled_start_time: "2026-11-01T18:00:00Z",
          },
        },
      ],
      warnings: [],
    };
  }
  async messages(channelId: string, before?: string) {
    return before
      ? []
      : [...demoMessages]
          .reverse()
          .map((m) => ({ ...m, channel_id: channelId }));
  }
  async threads(channel: Channel) {
    return {
      threads: channels.filter(
        (c) => c.parent_id === channel.id && [11, 12].includes(c.type),
      ),
      warnings: [],
    };
  }
  async threadPage(channel: Channel) {
    return this.threads(channel);
  }
  async profile(userId: string) {
    return {
      user: demoUsers.find((u) => u.id === userId) || demoUsers[0],
      bio: demoUsers.find((u) => u.id === userId)?.bio,
      member: { joined_at: "2024-04-08T10:00:00Z", roles: ["21001"] },
    };
  }
  async reactionUsers() {
    return demoUsers.slice(0, 3);
  }
}
