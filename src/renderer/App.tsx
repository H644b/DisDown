import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Archive,
  AtSign,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  File,
  FileArchive,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Hash,
  Heart,
  Info,
  LoaderCircle,
  LogOut,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Table2,
  Users,
  Volume2,
  X,
  Calendar,
  Smile,
  Paperclip,
  PanelRightClose,
  ExternalLink,
  LockKeyhole,
  CheckCheck,
  StopCircle,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { bridge } from "./bridge";
import {
  avatarUrl,
  channelSelection,
  entityKey,
  extension,
  isTextChannel,
  nameOf,
  prettyBytes,
  safeImage,
} from "../shared/utils";
import {
  defaultOptions,
  type Channel,
  type DirectoryListing,
  type EntityKind,
  type ExportOptions,
  type ExportResult,
  type GuildView,
  type Message,
  type Progress,
  type Selection,
  type SessionInfo,
  type User,
} from "../shared/types";
const IconForChannel = ({ c, size = 18 }: { c: Channel; size?: number }) =>
  c.type === 2 || c.type === 13 ? (
    <Volume2 size={size} />
  ) : c.type === 15 || c.type === 16 ? (
    <MessageSquare size={size} />
  ) : c.type === 1 ? (
    <AtSign size={size} />
  ) : c.type === 3 ? (
    <Users size={size} />
  ) : c.type === 11 || c.type === 12 || c.type === 10 ? (
    <MessageCircle size={size} />
  ) : (
    <Hash size={size} />
  );
function Avatar({ user, size = 38 }: { user: User; size?: number }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: user.accent_color
          ? `#${user.accent_color.toString(16).padStart(6, "0")}`
          : undefined,
      }}
    >
      {avatarUrl(user) ? (
        <img src={avatarUrl(user)} alt="" loading="lazy" />
      ) : (
        (user.global_name || user.username).slice(0, 1).toUpperCase()
      )}
    </span>
  );
}
function Pick({
  item,
  selected,
  toggle,
  small = false,
}: {
  item: Selection;
  selected: Map<string, Selection>;
  toggle: (s: Selection) => void;
  small?: boolean;
}) {
  const checked = selected.has(item.key);
  return (
    <button
      className={`pick ${checked ? "checked" : ""} ${small ? "small" : ""}`}
      aria-label={`${checked ? "Deselect" : "Select"} ${item.kind}: ${item.label}`}
      aria-pressed={checked}
      onClick={(e) => {
        e.stopPropagation();
        toggle(item);
      }}
      title={`${checked ? "Deselect" : "Select"} ${item.label}`}
    >
      {checked ? (
        <Check size={small ? 12 : 14} strokeWidth={3} />
      ) : (
        <Plus size={small ? 12 : 14} />
      )}
    </button>
  );
}
const leaf = (
  kind: EntityKind,
  id: string,
  label: string,
  data: unknown,
  extra: Partial<Selection> = {},
): Selection => ({
  key: entityKey(kind, id, extra.channelId, extra.index),
  kind,
  id,
  label,
  data,
  ...extra,
});
function ErrorNotice({
  message,
  clear,
}: {
  message: string;
  clear: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <AlertTriangle size={17} />
      <span>{message}</span>
      <button
        className="icon-button"
        aria-label="Dismiss error"
        onClick={clear}
      >
        <X size={16} />
      </button>
    </div>
  );
}
function DataTree({
  data,
  label = "Data",
  onSelect,
  path = "data",
}: {
  data: unknown;
  label?: string;
  onSelect: (s: Selection) => void;
  path?: string;
}) {
  if (data === null || typeof data !== "object")
    return (
      <div className="data-field">
        <span>{label}</span>
        <code>{String(data ?? "null")}</code>
        <button
          className="icon-button"
          title={`Select field ${label}`}
          aria-label={`Select field ${label}`}
          onClick={() => onSelect(leaf("field", path, label, data))}
        >
          <Plus size={13} />
        </button>
      </div>
    );
  return (
    <details className="data-tree" open={path === "data"}>
      <summary>
        {label}{" "}
        <span>
          {Array.isArray(data)
            ? `${data.length} items`
            : `${Object.keys(data).length} fields`}
        </span>
        <button
          className="icon-button"
          title={`Select ${label}`}
          aria-label={`Select data ${label}`}
          onClick={(e) => {
            e.preventDefault();
            onSelect(leaf("field", path, label, data));
          }}
        >
          <Plus size={13} />
        </button>
      </summary>
      {Object.entries(data).map(([key, value]) => (
        <DataTree
          key={key}
          data={value}
          label={key}
          path={`${path}.${key}`}
          onSelect={onSelect}
        />
      ))}
    </details>
  );
}
function Consent({
  onSession,
  onError,
}: {
  onSession: (s: SessionInfo) => void;
  onError: (s: string) => void;
}) {
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"user" | "bot">("user");
  const [consent, setConsent] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  async function connect() {
    setBusy(true);
    try {
      const value = token;
      setToken("");
      onSession(
        await bridge.connect({
          token: value,
          mode,
          consent,
          policyAccepted: policy,
        }),
      );
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="welcome">
      <div className="welcome-copy">
        <img className="welcome-logo" src="./logo.svg" alt="DisDown logo" />
        <h1>
          Good conversations.
          <br />
          <span>Yours to keep.</span>
        </h1>
        <p>
          Bring the parts of Discord that matter to you into a place of your
          own.
        </p>
        <div className="welcome-preview">
          <div>
            <Hash size={17} />
            <span>that one conversation</span>
            <Check size={16} />
          </div>
          <div>
            <MessageCircle size={17} />
            <span>the weekend plans</span>
            <Check size={16} />
          </div>
          <div>
            <Paperclip size={17} />
            <span>your next big idea</span>
            <Check size={16} />
          </div>
        </div>
        <div className="local-promise">
          <ShieldCheck size={18} />
          <span>Local app. Local files. No DisDown server.</span>
        </div>
      </div>
      <section className="connect-panel">
        <h2>Make yourself at home</h2>
        <p>Connect an account to start choosing what to save.</p>
        <div className="segmented" aria-label="Token type">
          <button
            aria-pressed={mode === "user"}
            className={mode === "user" ? "active" : ""}
            onClick={() => setMode("user")}
          >
            User token
          </button>
          <button
            aria-pressed={mode === "bot"}
            className={mode === "bot" ? "active" : ""}
            onClick={() => setMode("bot")}
          >
            Bot token
          </button>
        </div>
        <label className="field-label" htmlFor="discord-token">
          Discord token <LockKeyhole size={13} />
        </label>
        <div className="token-field">
          <input
            id="discord-token"
            type={show ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your token here"
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
          />
          <button onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <p className="field-hint">
          Used only to connect directly to Discord. Never stored on disk or sent
          to DisDown.
        </p>
        {mode === "user" ? (
          <div className="policy-note">
            <Info size={17} />
            <p>
              Discord does not support user-token automation and may terminate
              accounts that use it.{" "}
              <button
                className="text-link"
                onClick={() =>
                  void bridge.openExternal(
                    "https://support.discord.com/hc/en-us/articles/115002192352-Automated-User-Accounts-Self-Bots",
                  )
                }
              >
                Read Discord’s policy <ExternalLink size={11} />
              </button>
            </p>
          </div>
        ) : (
          <div className="policy-note">
            <Info size={17} />
            <p>
              A bot sees only servers it belongs to and content it has
              permission to read. Personal DMs and group chats are unavailable.
              Message Content intent may be required.
            </p>
          </div>
        )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I own this account or have permission to use it, and consent to
            DisDown reading the content I choose.
          </span>
        </label>
        {mode === "user" && (
          <label className="check-label">
            <input
              type="checkbox"
              checked={policy}
              onChange={(e) => setPolicy(e.target.checked)}
            />
            <span>I understand Discord’s policy and the account risk.</span>
          </label>
        )}
        <button
          className="primary wide"
          onClick={() => void connect()}
          disabled={!token || !consent || (mode === "user" && !policy) || busy}
        >
          {busy ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <>
              Connect to Discord <ArrowRight size={17} />
            </>
          )}
        </button>
        <div className="or-divider">
          <span>or take a look around</span>
        </div>
        <button
          className="sample-button"
          onClick={() =>
            void bridge
              .demo()
              .then(onSession)
              .catch((e) => onError(e.message))
          }
        >
          <Sparkles size={17} /> Explore with sample data{" "}
          <ArrowRight size={15} />
        </button>
        <p className="sample-note">
          No account needed. Nothing connects to Discord.
        </p>
      </section>
    </main>
  );
}
export default function App() {
  const [session, setSession] = useState<SessionInfo>();
  const [step, setStep] = useState(0);
  const [guildId, setGuildId] = useState<string>("");
  const [guild, setGuild] = useState<GuildView>();
  const [channel, setChannel] = useState<Channel>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState(new Map<string, Selection>());
  const [error, setError] = useState("");
  const [exportBusy, setExportBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [navQuery, setNavQuery] = useState("");
  const [options, setOptions] = useState<ExportOptions>({ ...defaultOptions });
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [inspector, setInspector] = useState<{
    title: string;
    data: unknown;
    selection?: Selection;
  }>();
  const [threadView, setThreadView] = useState<Channel[]>([]);
  const [showThreads, setShowThreads] = useState(false);
  const [inspectorBusy, setInspectorBusy] = useState(false);
  const [extraTab, setExtraTab] = useState(false);
  const requestId = useRef(0);
  const guildRequest = useRef(0);
  const inspectRequest = useRef(0);
  const messageArea = useRef<HTMLDivElement>(null);
  const toggle = (s: Selection) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(s.key)) next.delete(s.key);
      else next.set(s.key, s);
      return next;
    });
  const userSelection = (user: User) =>
    leaf("user", user.id, user.global_name || user.username, user, {
      guildId: guildId || undefined,
    });
  async function openChannel(c: Channel) {
    const nonce = ++requestId.current;
    setChannel(c);
    setQuery("");
    setMessages([]);
    setShowThreads(false);
    setLoadingMessages(true);
    setHasMore(true);
    try {
      const page = await bridge.messages(c.id);
      if (nonce !== requestId.current) return;
      setMessages([...page].reverse());
      setHasMore(page.length === 100);
      requestAnimationFrame(() => {
        if (messageArea.current)
          messageArea.current.scrollTop = messageArea.current.scrollHeight;
      });
    } catch (e) {
      if (nonce === requestId.current) {
        setError((e as Error).message);
        setHasMore(false);
      }
    } finally {
      if (nonce === requestId.current) setLoadingMessages(false);
    }
  }
  async function openGuild(id: string, info = session) {
    const nonce = ++guildRequest.current;
    ++requestId.current;
    setGuildId(id);
    setGuild(undefined);
    setChannel(undefined);
    setMessages([]);
    setNavQuery("");
    setExtraTab(false);
    setInspector(undefined);
    setBusy(true);
    try {
      if (!id) {
        if (info?.dms[0]) await openChannel(info.dms[0]);
      } else {
        const view = await bridge.guild(id);
        if (nonce !== guildRequest.current) return;
        setGuild(view);
        const first =
          view.channels.find((c) => c.name === "general") ||
          view.channels.find(isTextChannel) ||
          view.channels.find((c) => c.type !== 4);
        if (first) await openChannel(first);
      }
    } catch (e) {
      if (nonce === guildRequest.current) setError((e as Error).message);
    } finally {
      if (nonce === guildRequest.current) setBusy(false);
    }
  }
  function startSession(info: SessionInfo) {
    setSession(info);
    setSelected(new Map());
    setStep(0);
    setError("");
    setInspector(undefined);
    void openGuild(info.guilds[0]?.id || "", info);
  }
  async function profile(user: User) {
    const nonce = ++inspectRequest.current;
    setInspector({
      title: user.global_name || user.username,
      data: { user },
      selection: userSelection(user),
    });
    setInspectorBusy(true);
    try {
      const data = await bridge.profile(user.id, guildId || undefined);
      if (nonce === inspectRequest.current)
        setInspector({
          title: user.global_name || user.username,
          data,
          selection: { ...userSelection(user), data },
        });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (nonce === inspectRequest.current) setInspectorBusy(false);
    }
  }
  async function loadOlder() {
    if (!channel || loadingMessages || !messages.length) return;
    const nonce = requestId.current;
    setLoadingMessages(true);
    try {
      const page = await bridge.messages(channel.id, messages[0].id);
      if (nonce !== requestId.current) return;
      setMessages((prev) =>
        [...[...page].reverse(), ...prev].filter(
          (m, i, all) => all.findIndex((x) => x.id === m.id) === i,
        ),
      );
      setHasMore(page.length === 100);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (nonce === requestId.current) setLoadingMessages(false);
    }
  }
  async function loadThreads() {
    if (!channel) return;
    setShowThreads(true);
    setBusy(true);
    try {
      const result = await bridge.threads(channel);
      setThreadView(result.threads);
      if (result.warnings.length) setError(result.warnings.join(" "));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const scopedChannels = guildId ? guild?.channels || [] : session?.dms || [];
  const visibleMessages = useMemo(
    () =>
      messages.filter((m) =>
        `${m.content} ${m.author.username} ${m.author.global_name || ""} ${m.attachments.map((a) => a.filename).join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [messages, query],
  );
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const s of selected.values())
      result[s.kind] = (result[s.kind] || 0) + 1;
    return result;
  }, [selected]);
  const chooseStep = (n: number) => {
    if (!exportBusy && (n === 0 || selected.size)) setStep(n);
  };
  const channelRow = (c: Channel, thread = false) => (
    <div
      key={c.id}
      className={`channel-row ${channel?.id === c.id ? "active" : ""} ${thread ? "thread-row" : ""}`}
    >
      <button
        className="channel-target"
        onClick={() => void openChannel(c)}
        title={nameOf(c)}
      >
        <IconForChannel c={c} size={17} />
        <span>{nameOf(c)}</span>
        {c.thread_metadata?.archived && <Archive size={12} />}
      </button>
      <Pick
        small
        item={channelSelection(c)}
        selected={selected}
        toggle={toggle}
      />
    </div>
  );
  return (
    <div className={`app platform-${bridge.platform}`}>
      <header className="titlebar">
        <div className="app-brand">
          <img src="./logo.svg" alt="" />
          <span>DisDown</span>
        </div>
        {session && (
          <nav className="steps" aria-label="Export steps">
            {["Choose", "Configure", "Save"].map((label, i) => (
              <button
                key={label}
                disabled={exportBusy || (i > 0 && !selected.size)}
                aria-current={step === i ? "step" : undefined}
                className={step === i ? "active" : step > i ? "complete" : ""}
                onClick={() => chooseStep(i)}
              >
                <span className="step-dot">
                  {step > i ? <Check size={11} /> : i + 1}
                </span>
                {label}
                {i < 2 && <ChevronRight size={12} />}
              </button>
            ))}
          </nav>
        )}
        <div className="titlebar-end">
          {session?.mode === "demo" ? (
            <span className="sample-badge">
              <span />
              Sample workspace
            </span>
          ) : session ? (
            <span className="session-status">
              <span />
              Connected · read only
            </span>
          ) : (
            <span className="version">v0.1.0</span>
          )}
        </div>
      </header>
      {error && <ErrorNotice message={error} clear={() => setError("")} />}
      <div className="app-body">
        {!session ? (
          <Consent onSession={startSession} onError={setError} />
        ) : (
          <>
            {step === 0 ? (
              <div className="client">
                <nav className="server-rail" aria-label="Servers">
                  <button
                    className={
                      !guildId ? "rail-button home active" : "rail-button home"
                    }
                    onClick={() => void openGuild("")}
                    title="Direct messages"
                    aria-label="Direct messages"
                  >
                    <MessageCircle size={24} />
                  </button>
                  <div className="rail-divider" />
                  {session.guilds.map((g, i) => (
                    <button
                      key={g.id}
                      aria-label={`Open server ${g.name}`}
                      title={g.name}
                      className={`rail-button server-${i % 5} ${guildId === g.id ? "active" : ""}`}
                      onClick={() => void openGuild(g.id)}
                    >
                      {g.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=96`}
                          alt=""
                        />
                      ) : (
                        g.name
                          .split(" ")
                          .filter(
                            (w) => !["the", "and"].includes(w.toLowerCase()),
                          )
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                      )}
                    </button>
                  ))}
                  <div className="rail-spacer" />
                  <button
                    className="rail-button settings"
                    title="Disconnect"
                    aria-label="Disconnect"
                    onClick={() =>
                      void bridge.disconnect().then(() => {
                        ++requestId.current;
                        ++guildRequest.current;
                        setSession(undefined);
                        setSelected(new Map());
                      })
                    }
                  >
                    <LogOut size={19} />
                  </button>
                </nav>
                <aside className="channel-sidebar">
                  <div className="server-heading">
                    <button
                      onClick={() =>
                        setInspector({
                          title: guild?.guild.name || "Direct messages",
                          data: guild?.guild || session.dms,
                          selection: guild
                            ? leaf(
                                "guild",
                                guild.guild.id,
                                guild.guild.name,
                                guild.guild,
                              )
                            : undefined,
                        })
                      }
                    >
                      <span>
                        {guildId
                          ? guild?.guild.name || "Loading server…"
                          : "Direct messages"}
                      </span>
                      <ChevronDown size={16} />
                    </button>
                    {guild && (
                      <Pick
                        item={leaf(
                          "guild",
                          guild.guild.id,
                          guild.guild.name,
                          guild.guild,
                        )}
                        selected={selected}
                        toggle={toggle}
                      />
                    )}
                  </div>
                  <div className="sidebar-search">
                    <Search size={14} />
                    <input
                      aria-label="Find a channel or conversation"
                      placeholder={
                        guildId ? "Find a channel" : "Find a conversation"
                      }
                      value={navQuery}
                      onChange={(e) => setNavQuery(e.target.value)}
                    />
                  </div>
                  <div className="channel-list">
                    {busy && !guild && !channel ? (
                      <div className="loading-state">
                        <LoaderCircle className="spin" size={22} />
                      </div>
                    ) : (
                      <>
                        {scopedChannels
                          .filter(
                            (c) =>
                              !c.parent_id &&
                              c.type !== 4 &&
                              nameOf(c)
                                .toLowerCase()
                                .includes(navQuery.toLowerCase()),
                          )
                          .map((c) => channelRow(c))}
                        {scopedChannels
                          .filter((c) => c.type === 4)
                          .map((category) => {
                            const children = scopedChannels.filter(
                              (c) =>
                                c.parent_id === category.id &&
                                nameOf(c)
                                  .toLowerCase()
                                  .includes(navQuery.toLowerCase()),
                            );
                            if (navQuery && !children.length) return null;
                            return (
                              <div className="category" key={category.id}>
                                <div className="category-heading">
                                  <button
                                    onClick={() =>
                                      setCollapsed((prev) => {
                                        const n = new Set(prev);
                                        n.has(category.id)
                                          ? n.delete(category.id)
                                          : n.add(category.id);
                                        return n;
                                      })
                                    }
                                  >
                                    {collapsed.has(category.id) ? (
                                      <ChevronRight size={12} />
                                    ) : (
                                      <ChevronDown size={12} />
                                    )}
                                    <span>{nameOf(category)}</span>
                                  </button>
                                  <Pick
                                    small
                                    item={channelSelection(category)}
                                    selected={selected}
                                    toggle={toggle}
                                  />
                                </div>
                                {!collapsed.has(category.id) &&
                                  children.map((c) => (
                                    <div key={c.id}>
                                      {channelRow(c)}
                                      {guild?.threads
                                        .filter((t) => t.parent_id === c.id)
                                        .map((t) => channelRow(t, true))}
                                    </div>
                                  ))}
                              </div>
                            );
                          })}
                        {guild && (
                          <button
                            className={`server-extras-button ${extraTab ? "active" : ""}`}
                            onClick={() => setExtraTab(!extraTab)}
                          >
                            <Smile size={16} /> Roles, emoji & events{" "}
                            <span>{guild.extras.length}</span>
                          </button>
                        )}
                        {!scopedChannels.length && !busy && (
                          <p className="sidebar-empty">
                            No conversations available for this account.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="account">
                    <Avatar user={session.user} size={30} />
                    <div>
                      <strong>
                        {session.user.global_name || session.user.username}
                      </strong>
                      <span>
                        {session.mode === "demo"
                          ? "Exploring sample data"
                          : "Read-only session"}
                      </span>
                    </div>
                    <ShieldCheck size={16} />
                  </div>
                </aside>
                <main className="conversation">
                  <div className="conversation-header">
                    <div className="conversation-name">
                      {channel ? (
                        <IconForChannel c={channel} size={22} />
                      ) : (
                        <MessageCircle size={22} />
                      )}
                      <strong>
                        {extraTab
                          ? "Server library"
                          : channel
                            ? nameOf(channel)
                            : "Your conversations"}
                      </strong>
                      {channel?.topic && (
                        <>
                          <div className="header-divider" />
                          <button
                            className="topic"
                            title="Inspect channel topic"
                            onClick={() =>
                              setInspector({
                                title: "Channel details",
                                data: channel,
                                selection: channelSelection(channel),
                              })
                            }
                          >
                            {channel.topic}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="conversation-actions">
                      {channel && (
                        <>
                          <button
                            className="icon-button"
                            aria-label="Browse threads"
                            title="Browse active and archived threads"
                            onClick={() => void loadThreads()}
                          >
                            <MessageSquare size={19} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label="Inspect channel"
                            title="Inspect channel"
                            onClick={() =>
                              setInspector({
                                title: nameOf(channel),
                                data: channel,
                                selection: channelSelection(channel),
                              })
                            }
                          >
                            <Info size={19} />
                          </button>
                        </>
                      )}
                      <div className="message-search">
                        <Search size={14} />
                        <input
                          aria-label="Search loaded messages"
                          placeholder="Search loaded messages"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {(session.warnings.length > 0 ||
                    (guild?.warnings.length || 0) > 0) && (
                    <details className="access-notice">
                      <summary>
                        <Info size={14} /> Access notices (
                        {session.warnings.length +
                          (guild?.warnings.length || 0)}
                        )
                      </summary>
                      {[...session.warnings, ...(guild?.warnings || [])].map(
                        (w, i) => (
                          <p key={i}>{w}</p>
                        ),
                      )}
                    </details>
                  )}
                  {showThreads ? (
                    <div className="thread-browser">
                      <div className="section-heading">
                        <h2>Threads in #{channel && nameOf(channel)}</h2>
                        <button
                          className="icon-button"
                          aria-label="Close threads"
                          onClick={() => setShowThreads(false)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      {busy ? (
                        <LoaderCircle className="spin" />
                      ) : threadView.length ? (
                        threadView.map((t) => (
                          <div className="thread-card" key={t.id}>
                            <button onClick={() => void openChannel(t)}>
                              <MessageCircle size={23} />
                              <div>
                                <strong>{nameOf(t)}</strong>
                                <span>
                                  {t.thread_metadata?.archived
                                    ? "Archived thread"
                                    : "Active thread"}
                                </span>
                              </div>
                              <ArrowRight size={17} />
                            </button>
                            <Pick
                              item={channelSelection(t)}
                              selected={selected}
                              toggle={toggle}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="empty-inline">
                          <MessageSquare size={32} />
                          <h3>No threads available</h3>
                          <p>
                            Threads this account can access will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : extraTab ? (
                    <div className="extras-list">
                      <h2>A little more of this server</h2>
                      <p>
                        Choose individual roles, custom emoji, and scheduled
                        events.
                      </p>
                      {guild?.extras.map((item) => (
                        <div className="extra-row" key={item.kind + item.id}>
                          <div className="extra-icon">
                            {item.kind === "role" ? (
                              <ShieldCheck size={20} />
                            ) : item.kind === "emoji" ? (
                              <Smile size={20} />
                            ) : (
                              <Calendar size={20} />
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setInspector({
                                title: item.label,
                                data: item.data,
                                selection: leaf(
                                  item.kind,
                                  item.id,
                                  item.label,
                                  item.data,
                                  { guildId },
                                ),
                              })
                            }
                          >
                            <strong>{item.label}</strong>
                            <span>{item.kind}</span>
                          </button>
                          <Pick
                            item={leaf(
                              item.kind,
                              item.id,
                              item.label,
                              item.data,
                              { guildId },
                            )}
                            selected={selected}
                            toggle={toggle}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="message-area" ref={messageArea}>
                      <div className="channel-intro">
                        <div className="channel-intro-icon">
                          {channel ? (
                            <IconForChannel c={channel} size={33} />
                          ) : (
                            <MessageCircle size={33} />
                          )}
                        </div>
                        <h1>
                          {channel ? nameOf(channel) : "Choose a conversation"}
                        </h1>
                        <p>
                          {channel?.topic ||
                            "A few things worth keeping. Select any item with its + button."}
                        </p>
                      </div>
                      <div className="date-divider">
                        <span>
                          {messages[0]
                            ? new Date(
                                messages[0].timestamp,
                              ).toLocaleDateString(undefined, {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Your conversation"}
                        </span>
                      </div>
                      {hasMore && messages.length > 0 && (
                        <button
                          className="load-older"
                          onClick={() => void loadOlder()}
                          disabled={loadingMessages}
                        >
                          {loadingMessages ? (
                            <LoaderCircle className="spin" size={14} />
                          ) : (
                            <ArrowUp size={14} />
                          )}{" "}
                          Load older messages
                        </button>
                      )}
                      {loadingMessages && !messages.length ? (
                        <div className="loading-state">
                          <LoaderCircle className="spin" size={27} />
                          <p>Reading this conversation…</p>
                        </div>
                      ) : (
                        visibleMessages.map((m) => {
                          const msg = leaf(
                            "message",
                            m.id,
                            `${m.author.global_name || m.author.username}: ${m.content.slice(0, 55) || "Message"}`,
                            m,
                            { channelId: m.channel_id, guildId },
                          );
                          const selectedMessage = selected.has(msg.key);
                          return (
                            <article
                              className={`message ${selectedMessage ? "is-selected" : ""}`}
                              key={m.id}
                            >
                              <div className="message-avatar">
                                <button
                                  onClick={() => void profile(m.author)}
                                  aria-label={`View profile ${m.author.global_name || m.author.username}`}
                                >
                                  <Avatar user={m.author} />
                                </button>
                                <Pick
                                  small
                                  item={userSelection(m.author)}
                                  selected={selected}
                                  toggle={toggle}
                                />
                              </div>
                              <div className="message-main">
                                <header>
                                  <button
                                    className="author-name"
                                    onClick={() => void profile(m.author)}
                                  >
                                    {m.author.global_name || m.author.username}
                                  </button>
                                  {m.author.bot && (
                                    <span className="bot-label">BOT</span>
                                  )}
                                  <time title={m.timestamp}>
                                    {new Date(m.timestamp).toLocaleTimeString(
                                      undefined,
                                      { hour: "numeric", minute: "2-digit" },
                                    )}
                                  </time>
                                  {m.edited_timestamp && (
                                    <span className="edited">(edited)</span>
                                  )}
                                </header>
                                {m.referenced_message && (
                                  <div className="reply-preview">
                                    <MessageCircle size={12} />
                                    {m.referenced_message.author.username}:{" "}
                                    {m.referenced_message.content.slice(0, 150)}
                                  </div>
                                )}
                                <div className="message-content">
                                  <ReactMarkdown
                                    skipHtml
                                    components={{
                                      a: ({ href, children }) => (
                                        <button
                                          className="message-link"
                                          onClick={() =>
                                            href &&
                                            void bridge
                                              .openExternal(href)
                                              .catch((e) => setError(e.message))
                                          }
                                        >
                                          {children}
                                        </button>
                                      ),
                                      img: ({ src, alt }) => (
                                        <span>{alt || src}</span>
                                      ),
                                    }}
                                  >
                                    {m.content}
                                  </ReactMarkdown>
                                </div>
                                {m.attachments.map((a) => (
                                  <div className="attachment" key={a.id}>
                                    {a.content_type?.startsWith("image/") &&
                                    safeImage(a.url) ? (
                                      <img
                                        className="attachment-image"
                                        src={safeImage(a.url)}
                                        alt={a.filename}
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="attachment-file">
                                        <FileText size={28} />
                                        <div>
                                          <strong>{a.filename}</strong>
                                          <span>
                                            {prettyBytes(a.size)} · attachment
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    <Pick
                                      item={leaf(
                                        "attachment",
                                        a.id,
                                        a.filename,
                                        a,
                                        {
                                          channelId: m.channel_id,
                                          messageId: m.id,
                                        },
                                      )}
                                      selected={selected}
                                      toggle={toggle}
                                    />
                                  </div>
                                ))}
                                {m.embeds.map((embed, i) => (
                                  <div className="embed" key={i}>
                                    <div>
                                      <button
                                        className="embed-title"
                                        onClick={() =>
                                          setInspector({
                                            title: String(
                                              embed.title || "Embed",
                                            ),
                                            data: embed,
                                            selection: leaf(
                                              "embed",
                                              m.id,
                                              String(embed.title || "Embed"),
                                              embed,
                                              {
                                                channelId: m.channel_id,
                                                messageId: m.id,
                                                index: i,
                                              },
                                            ),
                                          })
                                        }
                                      >
                                        {String(
                                          embed.title ||
                                            embed.url ||
                                            "Embedded content",
                                        )}
                                      </button>
                                      {Boolean(embed.description) && (
                                        <p>{String(embed.description)}</p>
                                      )}
                                    </div>
                                    <Pick
                                      small
                                      item={leaf(
                                        "embed",
                                        m.id,
                                        String(embed.title || "Embed"),
                                        embed,
                                        {
                                          channelId: m.channel_id,
                                          messageId: m.id,
                                          index: i,
                                        },
                                      )}
                                      selected={selected}
                                      toggle={toggle}
                                    />
                                  </div>
                                ))}
                                {m.poll && (
                                  <div className="poll-item">
                                    <span>
                                      <Table2 size={17} />
                                      {String(
                                        (m.poll.question as { text?: string })
                                          ?.text || "Poll",
                                      )}
                                    </span>
                                    <Pick
                                      small
                                      item={leaf("poll", m.id, "Poll", m.poll, {
                                        channelId: m.channel_id,
                                        messageId: m.id,
                                      })}
                                      selected={selected}
                                      toggle={toggle}
                                    />
                                    <button
                                      className="text-link"
                                      onClick={() =>
                                        setInspector({
                                          title: "Poll",
                                          data: m.poll,
                                        })
                                      }
                                    >
                                      Details
                                    </button>
                                  </div>
                                )}
                                {m.sticker_items?.map((s, i) => (
                                  <div className="sticker-item" key={i}>
                                    <Smile size={18} />
                                    <span>{String(s.name || "Sticker")}</span>
                                    <Pick
                                      small
                                      item={leaf(
                                        "sticker",
                                        String(s.id),
                                        String(s.name || "Sticker"),
                                        s,
                                        {
                                          channelId: m.channel_id,
                                          messageId: m.id,
                                          index: i,
                                        },
                                      )}
                                      selected={selected}
                                      toggle={toggle}
                                    />
                                  </div>
                                ))}
                                {m.components?.map((component, i) => (
                                  <div className="component-item" key={i}>
                                    <button
                                      className="text-link"
                                      onClick={() =>
                                        setInspector({
                                          title: "Message component",
                                          data: component,
                                        })
                                      }
                                    >
                                      <Settings2 size={14} /> Message component{" "}
                                      {i + 1}
                                    </button>
                                    <Pick
                                      small
                                      item={leaf(
                                        "component",
                                        m.id,
                                        `Message component ${i + 1}`,
                                        component,
                                        {
                                          channelId: m.channel_id,
                                          messageId: m.id,
                                          index: i,
                                        },
                                      )}
                                      selected={selected}
                                      toggle={toggle}
                                    />
                                  </div>
                                ))}
                                <div className="reactions">
                                  {m.reactions?.map((r, i) => {
                                    const item = leaf(
                                      "reaction",
                                      `${m.id}-${r.emoji.id || r.emoji.name}`,
                                      `${r.emoji.name} · ${r.count} reactions`,
                                      r,
                                      {
                                        channelId: m.channel_id,
                                        messageId: m.id,
                                        index: i,
                                      },
                                    );
                                    return (
                                      <div
                                        className={`reaction ${selected.has(item.key) ? "selected" : ""}`}
                                        key={item.key}
                                      >
                                        <button
                                          aria-label={`Inspect reaction ${r.emoji.name}`}
                                          onClick={() => {
                                            setInspector({
                                              title: `${r.emoji.name} reactions`,
                                              data: r,
                                              selection: item,
                                            });
                                            setInspectorBusy(true);
                                            void bridge
                                              .reactionUsers(
                                                m.channel_id,
                                                m.id,
                                                r.emoji.id
                                                  ? `${r.emoji.name}:${r.emoji.id}`
                                                  : r.emoji.name || "",
                                              )
                                              .then((users) =>
                                                setInspector({
                                                  title: `${r.emoji.name} reactions`,
                                                  data: { ...r, users },
                                                  selection: {
                                                    ...item,
                                                    data: { ...r, users },
                                                  },
                                                }),
                                              )
                                              .catch((e) => setError(e.message))
                                              .finally(() =>
                                                setInspectorBusy(false),
                                              );
                                          }}
                                        >
                                          {r.emoji.id ? (
                                            <img
                                              src={`https://cdn.discordapp.com/emojis/${r.emoji.id}.png?size=32`}
                                              alt={r.emoji.name || ""}
                                            />
                                          ) : (
                                            <span>{r.emoji.name}</span>
                                          )}
                                          <span>{r.count}</span>
                                        </button>
                                        <Pick
                                          small
                                          item={item}
                                          selected={selected}
                                          toggle={toggle}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                                {m.thread && (
                                  <button
                                    className="inline-thread"
                                    onClick={() => void openChannel(m.thread!)}
                                  >
                                    <MessageSquare size={15} />
                                    {nameOf(m.thread)}
                                    <ChevronRight size={13} />
                                  </button>
                                )}
                              </div>
                              <div className="message-actions">
                                <Pick
                                  item={msg}
                                  selected={selected}
                                  toggle={toggle}
                                />
                                <button
                                  className="icon-button"
                                  aria-label={`Inspect message ${m.id}`}
                                  title="Inspect all message fields"
                                  onClick={() =>
                                    setInspector({
                                      title: "Message details",
                                      data: m,
                                      selection: msg,
                                    })
                                  }
                                >
                                  <MoreHorizontal size={17} />
                                </button>
                              </div>
                            </article>
                          );
                        })
                      )}
                      {!visibleMessages.length && !loadingMessages && (
                        <div className="empty-inline">
                          <Search size={28} />
                          <h3>
                            {query
                              ? "No matching loaded messages"
                              : "No messages to show"}
                          </h3>
                          <p>
                            {query
                              ? "Try another search. Export filters can search the full history."
                              : channel?.type === 15
                                ? "Open the threads view to browse forum posts."
                                : "Choose another channel or inspect this channel’s metadata."}
                          </p>
                        </div>
                      )}
                      <div className="conversation-bottom">
                        <ShieldCheck size={14} />
                        <span>
                          You’re choosing what to keep. This view is read only.
                        </span>
                      </div>
                    </div>
                  )}
                </main>
                <aside className="collection">
                  <div className="collection-heading">
                    <div className="collection-mark">
                      <Archive size={18} />
                    </div>
                    <h2>Your collection</h2>
                    <span>{selected.size}</span>
                  </div>
                  {inspector ? (
                    <div className="inspector">
                      <div className="section-heading">
                        <h3>{inspector.title}</h3>
                        <button
                          className="icon-button"
                          aria-label="Close details"
                          onClick={() => {
                            ++inspectRequest.current;
                            setInspector(undefined);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {inspector.selection?.kind === "user" && (
                        <div className="profile-card">
                          <Avatar
                            user={
                              (inspector.data as { user?: User })?.user ||
                              (inspector.selection.data as User)
                            }
                            size={64}
                          />
                          <h3>{inspector.title}</h3>
                          <span>
                            @
                            {
                              (
                                (inspector.data as { user?: User })?.user ||
                                (inspector.selection.data as User)
                              )?.username
                            }
                          </span>
                          {(inspector.data as { bio?: string })?.bio && (
                            <p>
                              {String((inspector.data as { bio: string }).bio)}
                            </p>
                          )}
                        </div>
                      )}
                      {inspector.selection && (
                        <button
                          className="secondary wide"
                          onClick={() => toggle(inspector.selection!)}
                        >
                          {selected.has(inspector.selection.key) ? (
                            <Check size={15} />
                          ) : (
                            <Plus size={15} />
                          )}{" "}
                          {selected.has(inspector.selection.key)
                            ? "In your collection"
                            : `Select ${inspector.selection.kind}`}
                        </button>
                      )}
                      {inspectorBusy ? (
                        <div className="loading-state">
                          <LoaderCircle className="spin" size={22} />
                        </div>
                      ) : (
                        <DataTree
                          data={inspector.data}
                          onSelect={toggle}
                          path={`data.${inspector.selection?.id || inspector.title}`}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="collection-description">
                        A whole server or a single moment.
                        <br />
                        Save as much, or as little, as you like.
                      </p>
                      {selected.size ? (
                        <div className="selection-list">
                          {[...selected.values()].map((s) => (
                            <div className="selection-item" key={s.key}>
                              <span className="selection-icon">
                                {s.kind === "message" ? (
                                  <MessageSquare size={16} />
                                ) : s.kind === "guild" ? (
                                  <Users size={16} />
                                ) : s.kind === "user" ? (
                                  <AtSign size={16} />
                                ) : s.kind === "channel" ||
                                  s.kind === "thread" ||
                                  s.kind === "category" ? (
                                  <Hash size={16} />
                                ) : (
                                  <File size={16} />
                                )}
                              </span>
                              <div>
                                <span>{s.label}</span>
                                <small>{s.kind}</small>
                              </div>
                              <button
                                className="icon-button"
                                aria-label={`Remove ${s.label}`}
                                onClick={() => toggle(s)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="collection-empty">
                          <div className="empty-stack">
                            <MessageSquare size={32} />
                            <span className="empty-plus">
                              <Plus size={13} />
                            </span>
                          </div>
                          <h3>Keep the good parts</h3>
                          <p>
                            Use the <span className="inline-plus">+</span>{" "}
                            beside any item to start your collection.
                          </p>
                          <div className="selection-tip">
                            <span>Try it</span>
                            <p>
                              Select a channel, pick a few messages, or open a
                              profile.
                            </p>
                          </div>
                        </div>
                      )}
                      {selected.size > 0 && (
                        <button
                          className="clear-selection"
                          onClick={() => setSelected(new Map())}
                        >
                          Clear collection
                        </button>
                      )}
                    </>
                  )}
                  <div className="collection-footer">
                    <div>
                      <span>
                        {selected.size
                          ? `${selected.size} ${selected.size === 1 ? "item" : "items"} selected`
                          : "Nothing selected yet"}
                      </span>
                      <span>Saved only when you’re ready</span>
                    </div>
                    <button
                      className="primary wide"
                      disabled={!selected.size}
                      onClick={() => setStep(1)}
                    >
                      Choose export options <ArrowRight size={17} />
                    </button>
                    <span className="footer-note">
                      <LockKeyhole size={11} /> Your selection stays on this
                      device
                    </span>
                  </div>
                </aside>
              </div>
            ) : step === 1 ? (
              <Configure
                options={options}
                setOptions={setOptions}
                selected={[...selected.values()]}
                back={() => setStep(0)}
                next={() => setStep(2)}
              />
            ) : (
              <SaveView
                onBusyChange={setExportBusy}
                options={options}
                selected={[...selected.values()]}
                session={session}
                back={() => setStep(1)}
                reset={() => {
                  setStep(0);
                  setSelected(new Map());
                }}
                onError={setError}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
function Configure({
  options,
  setOptions,
  selected,
  back,
  next,
}: {
  options: ExportOptions;
  setOptions: (o: ExportOptions) => void;
  selected: Selection[];
  back: () => void;
  next: () => void;
}) {
  const change = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K],
  ) =>
    setOptions({
      ...options,
      [key]: value,
      ...(key === "media" && value ? { packaging: "zip" as const } : {}),
    });
  const formats = [
    {
      id: "html",
      name: "HTML",
      description: "A readable archive that opens in your browser.",
      icon: FileCode2,
    },
    {
      id: "json",
      name: "JSON",
      description: "Structured data, ready for tools and future projects.",
      icon: FileJson,
    },
    {
      id: "csv",
      name: "CSV",
      description: "A spreadsheet-friendly table of your collection.",
      icon: Table2,
    },
    {
      id: "md",
      name: "Markdown",
      description: "Portable text for notes, docs, and knowledge bases.",
      icon: FileText,
    },
    {
      id: "txt",
      name: "Plain text",
      description: "A simple, readable record. Open it anywhere.",
      icon: File,
    },
  ];
  const invalidDates = !!(
    options.after &&
    options.before &&
    options.after > options.before
  );
  return (
    <main className="configure">
      <div className="flow-heading">
        <button className="back-button" onClick={back}>
          <ArrowLeft size={16} /> Back to your collection
        </button>
        <h1>A format for future you.</h1>
        <p>Choose how your collection lives outside Discord.</p>
      </div>
      <div className="configure-grid">
        <section className="format-section">
          <h2>File format</h2>
          <div
            className="format-list"
            role="radiogroup"
            aria-label="Export format"
          >
            {formats.map(({ id, name, description, icon: Icon }) => (
              <button
                key={id}
                role="radio"
                aria-checked={options.format === id}
                className={`format-row ${options.format === id ? "active" : ""}`}
                onClick={() => change("format", id as ExportOptions["format"])}
              >
                <Icon size={25} />
                <span>
                  <strong>
                    {name}
                    {id === "html" && <small>Recommended</small>}
                  </strong>
                  <span>{description}</span>
                </span>
                <span className="radio-mark">
                  {options.format === id && <span />}
                </span>
              </button>
            ))}
          </div>
          <h2 className="section-gap">Package</h2>
          <label className="setting-row">
            <span>
              <strong>ZIP bundle</strong>
              <span>
                Includes a manifest and structured data alongside your export.
              </span>
            </span>
            <input
              aria-label="ZIP bundle"
              type="checkbox"
              checked={options.packaging === "zip"}
              disabled={options.media}
              onChange={(e) =>
                change("packaging", e.target.checked ? "zip" : "file")
              }
            />
          </label>
          <p className="field-hint">
            Standalone files keep metadata in the selected format. ZIP bundles
            also keep a machine-readable copy.
          </p>
          <h2 className="section-gap">
            Narrow it down <span className="optional">optional</span>
          </h2>
          <div className="date-fields">
            <label>
              From <span>UTC</span>
              <input
                aria-label="From date"
                type="date"
                value={options.after}
                onChange={(e) => change("after", e.target.value)}
              />
            </label>
            <label>
              Through <span>UTC</span>
              <input
                aria-label="Through date"
                type="date"
                value={options.before}
                onChange={(e) => change("before", e.target.value)}
              />
            </label>
          </div>
          {invalidDates && (
            <p className="inline-error">
              The start date must come before the end date.
            </p>
          )}
          <label className="filter-field">
            Message contains
            <input
              aria-label="Message contains"
              placeholder="A word or phrase"
              value={options.contains}
              onChange={(e) => change("contains", e.target.value)}
            />
          </label>
          <label className="filter-field">
            Author IDs
            <input
              aria-label="Author IDs"
              placeholder="Comma-separated Discord user IDs"
              value={options.authors}
              onChange={(e) => change("authors", e.target.value)}
            />
          </label>
          <label className="filter-field">
            Matching messages per channel
            <input
              aria-label="Matching messages per channel"
              type="number"
              min={0}
              max={250000}
              value={options.maxMessages}
              onChange={(e) =>
                change(
                  "maxMessages",
                  Math.min(
                    250000,
                    Math.max(0, Math.floor(Number(e.target.value) || 0)),
                  ),
                )
              }
            />
            <span className="field-hint">
              0 saves all matching history. Any limit is recorded in the
              archive.
            </span>
          </label>
        </section>
        <aside className="options-section">
          <h2>Bring along</h2>
          {[
            {
              key: "threads",
              label: "Threads & forum posts",
              description:
                "Include accessible active and archived threads when you select a channel or server.",
            },
            {
              key: "reactions",
              label: "Reactions",
              description:
                "Keep reaction emoji and counts on selected messages.",
            },
            {
              key: "profiles",
              label: "Author profiles",
              description:
                "Include available public profiles for message authors.",
            },
            {
              key: "media",
              label: "Download attachments",
              description:
                "Save Discord-hosted files in the ZIP. Up to 512 MB per file; failures are reported.",
            },
            {
              key: "redact",
              label: "Pseudonymize author names",
              description:
                "Replace author display names. IDs, message text, quotes, and selected fields remain.",
            },
          ].map((setting) => (
            <label className="setting-row" key={setting.key}>
              <span>
                <strong>{setting.label}</strong>
                <span>{setting.description}</span>
              </span>
              <input
                type="checkbox"
                checked={options[setting.key as "threads"]}
                onChange={(e) =>
                  change(setting.key as "threads", e.target.checked)
                }
              />
            </label>
          ))}
          <div className="scope-note">
            <Info size={17} />
            <p>
              Individual selections keep their scope. Selecting a reaction won’t
              export the surrounding conversation. Broader selections expand
              when saving.
            </p>
          </div>
          <div className="collection-summary">
            <h3>
              Your collection <span>{selected.length} items</span>
            </h3>
            {selected.slice(0, 5).map((s) => (
              <div key={s.key}>
                <Check size={13} />
                <span>{s.label}</span>
                <small>{s.kind}</small>
              </div>
            ))}
            {selected.length > 5 && <p>and {selected.length - 5} more</p>}
          </div>
        </aside>
      </div>
      <footer className="flow-footer">
        <span>
          <FileArchive size={17} /> .{extension(options)}{" "}
          <span>· {selected.length} selected items</span>
        </span>
        <button className="primary" disabled={invalidDates} onClick={next}>
          Choose where to save <ArrowRight size={17} />
        </button>
      </footer>
    </main>
  );
}
function FolderPicker({
  onChoose,
  onClose,
  onError,
  initial,
}: {
  onChoose: (path: string) => void;
  onClose: () => void;
  onError: (s: string) => void;
  initial?: string;
}) {
  const [listing, setListing] = useState<DirectoryListing>();
  const [path, setPath] = useState(initial || "");
  const [loading, setLoading] = useState(true);
  const [newFolder, setNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [search, setSearch] = useState("");
  const [localError, setLocalError] = useState("");
  const nonce = useRef(0);
  async function navigate(target?: string) {
    const current = ++nonce.current;
    setLoading(true);
    setLocalError("");
    try {
      const result = await bridge.browse(target);
      if (current === nonce.current) {
        setListing(result);
        setPath(result.path);
        setSearch("");
      }
    } catch (e) {
      if (current === nonce.current) setLocalError((e as Error).message);
    } finally {
      if (current === nonce.current) setLoading(false);
    }
  }
  useEffect(() => {
    void navigate(initial);
  }, []);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    dialog.current
      ?.querySelector<HTMLElement>("button:not(:disabled)")
      ?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialog.current) {
        const nodes = [
          ...dialog.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input:not(:disabled),[tabindex="0"]',
          ),
        ];
        const first = nodes[0],
          last = nodes.at(-1);
        if (!nodes.length) {
          e.preventDefault();
        } else if (
          document.activeElement === dialog.current ||
          !dialog.current.contains(document.activeElement)
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      before?.focus();
    };
  }, [onClose]);
  return (
    <div className="picker-backdrop">
      <div
        className="folder-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        tabIndex={-1}
        ref={dialog}
      >
        <header>
          <div>
            <FolderOpen size={21} />
            <h2 id="picker-title">A place for your collection</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close folder picker"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>
        <div className="picker-layout">
          <nav aria-label="Folder shortcuts">
            {listing?.shortcuts.map((s) => (
              <button
                key={s.path}
                onClick={() => void navigate(s.path)}
                className={listing.path === s.path ? "active" : ""}
              >
                <Folder size={16} />
                {s.name}
              </button>
            ))}
          </nav>
          <div className="picker-main">
            <form
              className="path-bar"
              onSubmit={(e) => {
                e.preventDefault();
                void navigate(path);
              }}
            >
              <button
                className="icon-button"
                type="button"
                title="Parent folder"
                aria-label="Parent folder"
                disabled={!listing?.parent || loading}
                onClick={() => void navigate(listing?.parent || undefined)}
              >
                <ArrowUp size={17} />
              </button>
              <input
                aria-label="Folder path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="Absolute folder path"
              />
              <button
                className="icon-button"
                title="Go to folder"
                aria-label="Go to folder"
              >
                <ArrowRight size={16} />
              </button>
              <button
                className="icon-button"
                type="button"
                title="Refresh folder"
                aria-label="Refresh folder"
                onClick={() => void navigate(listing?.path)}
              >
                <RefreshCw size={15} />
              </button>
            </form>
            <div className="picker-tools">
              <div>
                <Search size={14} />
                <input
                  aria-label="Filter folders"
                  placeholder="Filter this folder"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                className="text-link"
                onClick={() => setNewFolder(!newFolder)}
              >
                <Plus size={14} />
                New folder
              </button>
            </div>
            {newFolder && (
              <form
                className="new-folder"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (listing)
                    void bridge
                      .mkdir(listing.path, folderName)
                      .then((result) => {
                        setListing(result);
                        setNewFolder(false);
                        setFolderName("");
                      })
                      .catch((e) => setLocalError(e.message));
                }}
              >
                <Folder size={17} />
                <input
                  autoFocus
                  aria-label="New folder name"
                  value={folderName}
                  placeholder="Folder name"
                  onChange={(e) => setFolderName(e.target.value)}
                />
                <button className="secondary" disabled={!folderName}>
                  Create
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Cancel new folder"
                  onClick={() => setNewFolder(false)}
                >
                  <X size={15} />
                </button>
              </form>
            )}
            {localError && (
              <div className="picker-error" role="alert">
                {localError}
              </div>
            )}
            <div className="directory-entries">
              {loading ? (
                <div className="loading-state">
                  <LoaderCircle className="spin" size={24} />
                </div>
              ) : (
                listing?.entries
                  .filter((e) =>
                    e.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((entry) => (
                    <button
                      className={`directory-entry ${entry.directory ? "" : "is-file"}`}
                      key={entry.path}
                      disabled={!entry.directory}
                      onClick={() => void navigate(entry.path)}
                    >
                      {entry.directory ? (
                        <Folder size={19} />
                      ) : (
                        <File size={19} />
                      )}
                      <span>{entry.name}</span>
                      {entry.directory ? (
                        <ChevronRight size={15} />
                      ) : (
                        <small>file</small>
                      )}
                    </button>
                  ))
              )}
              {!loading &&
                listing &&
                !listing.entries.filter((e) =>
                  e.name.toLowerCase().includes(search.toLowerCase()),
                ).length && (
                  <div className="empty-inline">
                    <FolderOpen size={30} />
                    <p>
                      {search
                        ? "No matches in this folder."
                        : "This folder is empty."}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
        <footer>
          <span>{listing?.path || "Choose a folder"}</span>
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary"
            disabled={!listing || loading}
            onClick={() => listing && onChoose(listing.path)}
          >
            Use this folder <Check size={16} />
          </button>
        </footer>
      </div>
    </div>
  );
}
function SaveView({
  options,
  selected,
  session,
  back,
  reset,
  onError,
  onBusyChange,
}: {
  options: ExportOptions;
  selected: Selection[];
  session: SessionInfo;
  back: () => void;
  reset: () => void;
  onError: (s: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [directory, setDirectory] = useState("");
  const [stem, setStem] = useState(
    `DisDown-${new Date().toLocaleDateString("en-CA")}`,
  );
  const [picker, setPicker] = useState(false);
  const [saveAfterPicker, setSaveAfterPicker] = useState(false);
  const [progress, setProgress] = useState<Progress>();
  const [result, setResult] = useState<ExportResult>();
  const [saving, setSaving] = useState(false);
  const [replace, setReplace] = useState(false);
  const [localError, setLocalError] = useState("");
  const filename = `${stem}.${extension(options)}`;
  useEffect(() => bridge.onProgress(setProgress), []);
  useEffect(() => {
    const stop = (e: BeforeUnloadEvent) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", stop);
    return () => window.removeEventListener("beforeunload", stop);
  }, [saving]);
  async function save(folder = directory, overwrite = false) {
    if (!folder) {
      setSaveAfterPicker(true);
      setPicker(true);
      return;
    }
    setLocalError("");
    try {
      if (!stem.trim()) throw new Error("Give your archive a filename.");
      if (!overwrite && (await bridge.exists(folder, filename))) {
        setReplace(true);
        return;
      }
      setSaving(true);
      onBusyChange(true);
      setReplace(false);
      setProgress({
        phase: "collecting",
        current: 0,
        total: 0,
        detail: "Preparing your collection",
        messages: 0,
        bytes: 0,
      });
      setResult(
        await bridge.export({
          selections: selected,
          options,
          directory: folder,
          filename,
          overwrite,
        }),
      );
    } catch (e) {
      const message = (e as Error).message;
      setLocalError(
        message.includes("Cancelled")
          ? "Export cancelled. Your existing files are safe."
          : message,
      );
      setProgress(undefined);
    } finally {
      setSaving(false);
      onBusyChange(false);
    }
  }
  const percent =
    progress?.phase === "done"
      ? 100
      : progress?.phase === "media" && progress.total
        ? Math.round((progress.current / progress.total) * 100)
        : undefined;
  return (
    <main className="save-view">
      <button className="back-button" disabled={saving} onClick={back}>
        <ArrowLeft size={16} /> Back to export options
      </button>
      <div className="save-content">
        <div
          className={`save-illustration ${saving ? "is-saving" : ""} ${result ? "is-done" : ""}`}
          aria-hidden="true"
        >
          <div className="save-orbit orbit-one" />
          <div className="save-orbit orbit-two" />
          <div className="download-stream">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="save-icon">
            {result ? (
              <CheckCheck size={48} />
            ) : saving ? (
              <Archive size={45} />
            ) : (
              <ArrowDownToLine size={45} />
            )}
          </div>
          <span className="spark spark-one" />
          <span className="spark spark-two" />
          <span className="spark spark-three" />
        </div>
        <h1>
          {result
            ? "A little piece of Discord. Kept."
            : saving
              ? "Making it yours."
              : "Ready when you are."}
        </h1>
        <p className="save-description">
          {result
            ? `${result.messages.toLocaleString()} ${result.messages === 1 ? "message" : "messages"} · ${prettyBytes(result.bytes)} · saved on your device`
            : saving
              ? "Keep DisDown open while your collection is saved."
              : `${selected.length} selected ${selected.length === 1 ? "item" : "items"}, one place to come back to.`}
        </p>
        {session.mode === "demo" && (
          <span className="sample-export-note">
            <Sparkles size={13} /> This export contains sample data
          </span>
        )}
        {result ? (
          <div className="save-result">
            <div className="saved-file">
              <FileArchive size={27} />
              <div>
                <strong>{filename}</strong>
                <span>{result.path}</span>
              </div>
              <Check size={18} />
            </div>
            <button
              className="primary wide"
              onClick={() =>
                void bridge
                  .openPath(result.path)
                  .catch((e) => onError(e.message))
              }
            >
              <FolderOpen size={17} /> Show in folder
            </button>
            {result.warnings.length > 0 && (
              <details className="export-warnings">
                <summary>
                  <Info size={14} />
                  {result.warnings.length} export{" "}
                  {result.warnings.length === 1 ? "notice" : "notices"}
                </summary>
                {result.warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </details>
            )}
            <button className="text-link start-again" onClick={reset}>
              Start a new collection <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="save-destination">
              <label className="filename-field">
                <FileArchive size={20} />
                <input
                  aria-label="Archive filename"
                  value={stem}
                  onChange={(e) => setStem(e.target.value)}
                  disabled={saving}
                />
                <span>.{extension(options)}</span>
              </label>
              <button
                className="folder-field"
                disabled={saving}
                onClick={() => {
                  setSaveAfterPicker(false);
                  setPicker(true);
                }}
              >
                <Folder size={17} />
                <span>{directory || "Choose a place to save"}</span>
                <span>
                  {directory ? "Change" : "Browse"}
                  <ChevronRight size={13} />
                </span>
              </button>
            </div>
            {localError && (
              <p className="inline-error" role="alert">
                {localError}
              </p>
            )}
            {replace ? (
              <div className="replace-confirmation">
                <p>
                  A file named <strong>{filename}</strong> already exists.
                  Replace it?
                </p>
                <button className="secondary" onClick={() => setReplace(false)}>
                  Keep existing file
                </button>
                <button
                  className="primary"
                  onClick={() => void save(directory, true)}
                >
                  Replace file
                </button>
              </div>
            ) : saving ? (
              <div className="save-progress" role="status" aria-live="polite">
                <div>
                  <span>{progress?.detail}</span>
                  {percent !== undefined && <span>{percent}%</span>}
                </div>
                <progress value={percent} max={100} />
                <div className="progress-meta">
                  <span>
                    {progress?.messages.toLocaleString()} messages read{" "}
                    {progress?.bytes ? `· ${prettyBytes(progress.bytes)}` : ""}
                  </span>
                  <button
                    className="text-link"
                    onClick={() => void bridge.cancel()}
                  >
                    <StopCircle size={13} /> Cancel export
                  </button>
                </div>
              </div>
            ) : (
              <button className="glow-save" onClick={() => void save()}>
                <Download size={21} /> Save collection <ArrowDown size={19} />
              </button>
            )}
            <p className="save-fineprint">
              <ShieldCheck size={13} /> Saved directly to your device. Nothing
              is uploaded.
            </p>
          </>
        )}
      </div>
      {picker && (
        <FolderPicker
          initial={directory || undefined}
          onError={onError}
          onClose={() => setPicker(false)}
          onChoose={(folder) => {
            setDirectory(folder);
            setPicker(false);
            if (saveAfterPicker) void save(folder);
          }}
        />
      )}
    </main>
  );
}
