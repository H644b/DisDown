export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };
export interface User {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
  banner?: string | null;
  accent_color?: number;
  [key: string]: unknown;
}
export interface Guild {
  id: string;
  name: string;
  icon?: string | null;
  owner?: boolean;
  owner_id?: string;
  roles?: Role[];
  emojis?: Record<string, unknown>[];
  [key: string]: unknown;
}
export interface Role {
  id: string;
  name: string;
  permissions: string;
  color?: number;
  [key: string]: unknown;
}
export interface Channel {
  id: string;
  name?: string;
  type: number;
  guild_id?: string;
  parent_id?: string | null;
  topic?: string | null;
  position?: number;
  recipients?: User[];
  last_message_id?: string;
  permission_overwrites?: {
    id: string;
    type: number;
    allow: string;
    deny: string;
  }[];
  thread_metadata?: { archived: boolean; archive_timestamp?: string };
  [key: string]: unknown;
}
export interface Attachment {
  id: string;
  filename: string;
  url: string;
  proxy_url?: string;
  size: number;
  content_type?: string;
  [key: string]: unknown;
}
export interface Reaction {
  emoji: { id: string | null; name: string | null; animated?: boolean };
  count: number;
  me?: boolean;
  [key: string]: unknown;
}
export interface Message {
  id: string;
  channel_id: string;
  author: User;
  content: string;
  timestamp: string;
  edited_timestamp?: string | null;
  attachments: Attachment[];
  embeds: Record<string, unknown>[];
  reactions?: Reaction[];
  thread?: Channel;
  sticker_items?: Record<string, unknown>[];
  poll?: Record<string, unknown>;
  components?: Record<string, unknown>[];
  referenced_message?: Message | null;
  [key: string]: unknown;
}
export type EntityKind =
  | "guild"
  | "category"
  | "channel"
  | "thread"
  | "message"
  | "reaction"
  | "user"
  | "attachment"
  | "embed"
  | "sticker"
  | "poll"
  | "component"
  | "role"
  | "emoji"
  | "event"
  | "field";
export interface Selection {
  key: string;
  kind: EntityKind;
  id: string;
  label: string;
  guildId?: string;
  channelId?: string;
  messageId?: string;
  index?: number;
  data?: unknown;
}
export type Format = "html" | "json" | "csv" | "md" | "txt";
export interface ExportOptions {
  format: Format;
  packaging: "zip" | "file";
  media: boolean;
  threads: boolean;
  reactions: boolean;
  profiles: boolean;
  after: string;
  before: string;
  contains: string;
  authors: string;
  maxMessages: number;
  redact: boolean;
}
export const defaultOptions: ExportOptions = {
  format: "html",
  packaging: "zip",
  media: false,
  threads: true,
  reactions: true,
  profiles: true,
  after: "",
  before: "",
  contains: "",
  authors: "",
  maxMessages: 0,
  redact: false,
};
export interface SessionInfo {
  user: User;
  mode: "user" | "bot" | "demo";
  guilds: Guild[];
  dms: Channel[];
  warnings: string[];
}
export interface GuildView {
  guild: Guild;
  channels: Channel[];
  threads: Channel[];
  members: User[];
  extras: { kind: EntityKind; id: string; label: string; data: unknown }[];
  warnings: string[];
}
export interface ThreadPage {
  threads: Channel[];
  warnings: string[];
  cursor?: { archived: boolean; offset: number };
}
export interface DirectoryEntry {
  name: string;
  path: string;
  directory: boolean;
}
export interface DirectoryListing {
  path: string;
  parent: string | null;
  entries: DirectoryEntry[];
  shortcuts: { name: string; path: string }[];
}
export interface Progress {
  phase: "collecting" | "media" | "writing" | "done" | "cancelled" | "error";
  current: number;
  total: number;
  detail: string;
  messages: number;
  bytes: number;
  path?: string;
  warnings?: string[];
}
export interface ExportRequest {
  selections: Selection[];
  options: ExportOptions;
  directory: string;
  filename: string;
  overwrite: boolean;
}
export interface ExportResult {
  path: string;
  messages: number;
  bytes: number;
  warnings: string[];
}
export interface Archive {
  version: 1;
  app: "DisDown";
  exportedAt: string;
  account: { id: string; username: string };
  selection: Selection[];
  options: ExportOptions;
  guilds: Guild[];
  channels: Channel[];
  messages: Message[];
  users: User[];
  items: Selection[];
  warnings: string[];
  media: Record<string, string>;
  truncated: boolean;
}
export interface DisdownBridge {
  connect(input: {
    token: string;
    mode: "user" | "bot";
    consent: boolean;
    policyAccepted: boolean;
  }): Promise<SessionInfo>;
  session(): Promise<SessionInfo | null>;
  demo(): Promise<SessionInfo>;
  disconnect(): Promise<void>;
  guild(id: string): Promise<GuildView>;
  messages(channelId: string, before?: string): Promise<Message[]>;
  threads(channel: Channel): Promise<ThreadPage>;
  threadPage(
    channel: Channel,
    cursor?: ThreadPage["cursor"],
  ): Promise<ThreadPage>;
  profile(id: string, guildId?: string): Promise<Record<string, unknown>>;
  reactionUsers(
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<User[]>;
  browse(path?: string): Promise<DirectoryListing>;
  mkdir(parent: string, name: string): Promise<DirectoryListing>;
  exists(directory: string, filename: string): Promise<boolean>;
  export(request: ExportRequest): Promise<ExportResult>;
  cancel(): Promise<void>;
  onProgress(callback: (progress: Progress) => void): () => void;
  openPath(path: string): Promise<void>;
  openExternal(url: string): Promise<void>;
  platform: string;
}
