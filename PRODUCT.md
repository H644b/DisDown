# DisDown

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Delegated by the user: Electron, React and TypeScript for a desktop application on macOS, Linux and Windows. Electron hosts a local interface, not a hosted website.

## Users
Discord account holders who explicitly authorize read-only access and want to save chosen accessible content locally.

## Product Purpose
Browse accessible servers and conversations in a Discord-style interface, select content at multiple levels, choose export options, then save using an in-app themed file browser and animated progress.

## Capabilities and Constraints
User-token and bot-token sessions; explicit consent before connecting. Credentials remain in memory. No sending, reacting, editing, deleting, joining, privilege bypass or credential discovery. API permission failures must be visible. User token automation is unsupported by Discord and can risk account termination. Live verification requires user-entered credentials. Public GitHub repo and macOS, Windows, Linux releases are requested after verification. OS signing is contingent on available signing credentials.

## Brand Commitments
DisDown, a custom logo, Discord-like client browsing, a persistent unobtrusive Next control, a large glowing save button, themed in-app folder picker, and animated save progress. User chose code-first implementation.

## Evidence on Hand
Empty starting workspace. No real Discord data or credentials supplied. Demonstration data must be labeled sample data. User agreed to enter a token locally for live testing when ready.

## Product Principles
- Keep browsing familiar and selection explicit.
- Keep credentials local and transient.
- Preserve scope and report partial exports honestly.
- Separate fixture tests, live API checks and OS release checks.
