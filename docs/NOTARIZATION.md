# macOS signing and notarization

DisDown's notarization command starts from the checksum-verified ZIPs of an existing release. It signs both architectures with an installed **Developer ID Application** identity, submits the apps and disk images to Apple, staples the returned tickets, and checks Gatekeeper. The archived application code must keep the same SHA-256 throughout. It never exports the signing private key or uploads credentials to GitHub.

## Local prerequisites

- macOS with Xcode command-line tools (`notarytool`, `stapler`, and `codesign`).
- A valid Developer ID Application certificate **and its private key** in the local keychain. Apple Development and Apple Distribution certificates are not substitutes.
- A working notarytool keychain profile, or an App Store Connect API private-key file. Team API keys also require their Issuer ID; individual keys omit it.
- The original release files and `SHA256SUMS.txt` in `release/publish-<version>/`, with enough working space for extracted apps and installers.

For a keychain profile, configure `APPLE_KEYCHAIN_PROFILE` (and optionally `APPLE_KEYCHAIN`). Create or enter credentials locally; never paste passwords or private keys into an issue or chat.

For an API key, configure the local file path and metadata:

```sh
export APPLE_API_KEY=/absolute/path/to/AuthKey_KEY_ID.p8
export APPLE_API_KEY_ID=KEY_ID
export APPLE_API_ISSUER=ISSUER_UUID  # Team keys only
```

These variables are consumed by Apple's CLI. The private key remains on the local filesystem. Do not commit it, export it into a repository secret without authorization, or include its contents in logs.

## Run and verify

```sh
npm run notarize:mac -- --preflight-only --identity 'Your Organization (TEAM_ID)'
npm run notarize:mac -- --identity 'Your Organization (TEAM_ID)'
```

An identity qualifier or certificate SHA-1 can be supplied. Without one, exactly one valid Developer ID Application identity must be installed. The default output directory is `release/notarized-<version>/`; `--input` and `--output` override the locations.

The command refuses ad-hoc/App Store identities, failed authentication, changed input checksums, altered `app.asar` bytes, missing secure timestamps, invalid code signatures, rejected submissions, missing tickets, or failed Gatekeeper assessments. Both original apps are staged before the asynchronous notarization jobs start. Existing public release files are untouched.

Apple submission IDs and verified results are saved in `notarization-report.json` under the ignored output directory. If processing is interrupted or takes longer than the default 60-minute wait, continue the same submissions:

```sh
npm run notarize:mac -- --resume --identity 'Your Organization (TEAM_ID)'
```

`--timeout-minutes` adjusts the wait. A timeout or an uploaded submission does **not** mean Apple accepted the app. Publish only after the report has `complete: true`, both app and DMG submissions are `Accepted`, their tickets validate, Gatekeeper accepts them, and the ticket survives ZIP extraction. Run the packaged-app smoke check against the signed executable as well.

To publish, replace the four Mac assets only after those checks pass, regenerate checksums covering **all** release installers, and update the release notes with the verified signing/notarization state. Keep Windows/Linux artifacts and their checksums intact. Repository source and an installer build are separate from Apple's notarization acceptance.

The regular cross-platform CI build remains credential-free and uses ad-hoc macOS signing. This local command provides the explicit notarized distribution path; no Apple private keys or passwords are stored in public CI.

References: [Apple's notarization workflow](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow), [Developer ID certificates](https://developer.apple.com/help/account/certificates/create-developer-id-certificates/), and the installed `electron-builder`/`@electron/osx-sign` implementation used by this project.
