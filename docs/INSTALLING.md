# Installing DisDown

Choose packages from the GitHub release matching your architecture. A SHA256SUMS file accompanies published release files.

## macOS

Use `mac-arm64` for Apple Silicon or `mac-x64` for Intel. Open the DMG and drag DisDown to Applications, or unzip the ZIP into Applications. These initial builds do not have Developer ID signing or Apple notarization. macOS can show an unidentified-developer warning. Review the source and published checksums before deciding whether to allow the app through System Settings → Privacy & Security. Do not disable Gatekeeper globally.

## Windows

Use the `setup.exe` installer for a normal installation, or `portable.exe` to run without installing. Initial binaries do not have a Windows publisher signing certificate, so SmartScreen may show an unknown-publisher notice. Review the source and checksums before deciding whether to proceed.

## Linux

Install the DEB using your distribution’s package manager, or mark the AppImage executable and run it. AppImage may require FUSE support on your distribution; the DEB is an alternative. The application needs a graphical session. Build checks run on Ubuntu 24.04 x64; they are not proof of compatibility with every Linux distribution.

## First launch

You can explore the sample workspace without an account. For live data, choose the token type, enter your token locally, and read the consent screen. User-token automation is unsupported by Discord and can risk the account. Bot-token capabilities are narrower. Tokens are not persisted; reconnect after exiting.

Choose a local folder through DisDown’s own themed browser. OS privacy settings may still require permission for protected folders. The app cannot override macOS, Windows, or Linux filesystem permissions.
