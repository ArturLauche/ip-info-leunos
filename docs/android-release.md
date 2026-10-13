# Android release runbook

Owner guide for publishing the IP Info Android app (application ID `com.leunos.ipinfo`) through GitHub Releases. The app architecture is described in [docs/android.md](android.md); this file covers the release contract, signing identity, GitHub configuration, the first stable release, and recovery.

Labels used below:

- **Automated**: performed by `.github/workflows/android-ci.yml` or `.github/workflows/android-release.yml`.
- **Owner, once**: one-time repository-owner setup.
- **Owner, per release**: routine steps before tagging.

## 1. Release contract (v1)

The publisher scripts in `android/scripts/`, the release workflow and the Android updater share this contract. The updater downloads only the published stable release for the tag pattern below; it never trusts the metadata as proof of authenticity and always verifies the APK signature itself.

| Item | Rule | Example for 1.2.3 |
| --- | --- | --- |
| Tag | `android-vMAJOR.MINOR.PATCH` (annotated tag on `main`) | `android-v1.2.3` |
| Version source | `versionName=` in `android/version.properties` must equal the tag version | `versionName=1.2.3` |
| `versionCode` | `MAJOR * 1000000 + MINOR * 1000 + PATCH`, must be 1 to 2099999999 | `1002003` |
| Release title | `IP Info for Android <version>` | `IP Info for Android 1.2.3` |
| APK asset | `ip-info-android-v<version>.apk` | `ip-info-android-v1.2.3.apk` |
| Checksum asset | `<apk>.sha256`, content `<sha256>  <apk name>` | `ip-info-android-v1.2.3.apk.sha256` |
| Metadata asset | `android-update.json` (schema 1) | generated, never hand-written |
| Release notes | `## [1.2.3]` section from `android/CHANGELOG.md` plus a standard footer | generated |
| Release kind | stable only; never a prerelease; never the repository's generic "Latest" | |

Version rules and worked examples:

- `MAJOR` is 0 to 2099; `MINOR` and `PATCH` are 0 to 999; no leading zeros, prerelease or build suffixes; `0.0.0` is invalid.
- `0.0.1` gives `1`; `1.0.0` gives `1000000`; `1.2.3` gives `1002003`; `2.0.0` gives `2000000`; `2099.999.999` gives `2099999999` (the largest allowed code).
- Rejected: `2100.0.0`, `1.1000.0`, `01.0.0`, `1.0.0-rc.1`.
- A new release must be strictly newer than every published `android-v*` release, including prereleases with a stable-format tag. Versions and version codes are never reused, and a published tag, asset or binary is never replaced.

`android-update.json` (UTF-8, two-space indentation, trailing newline, fixed key order). The reference copy is `android/contract/fixtures/android-update.valid.json`, which is byte-identical to `android/scripts/__fixtures__/android-update.valid.json`:

```json
{
  "schemaVersion": 1,
  "applicationId": "com.leunos.ipinfo",
  "tag": "android-v1.0.0",
  "versionName": "1.0.0",
  "versionCode": 1000000,
  "minSdk": 29,
  "publishedAt": "2026-10-13T12:00:00Z",
  "releaseNotesUrl": "https://github.com/ArturLauche/ip-info-leunos/releases/tag/android-v1.0.0",
  "apk": {
    "fileName": "ip-info-android-v1.0.0.apk",
    "downloadUrl": "https://github.com/ArturLauche/ip-info-leunos/releases/download/android-v1.0.0/ip-info-android-v1.0.0.apk",
    "sizeBytes": 20,
    "sha256": "1fad2632cbad7bf5bcf894e3397373b11f1e2fb83a06f579822c07e34ee8c5de"
  },
  "signing": {
    "certificateSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
}
```

`publishedAt` is the UTC time at which the signed artifacts were generated in the `build-sign` job, a few minutes before the release becomes public.

## 2. Versioning and changelog

1. **Owner, per release:** set `versionName=X.Y.Z` in `android/version.properties`. Use a version that has never been published.
2. **Owner, per release:** add a section to `android/CHANGELOG.md`. The heading must match `## [X.Y.Z]` optionally followed by ` - <date>`, and the notes must be non-empty. The section ends at the next line that starts with `## `.

   ```markdown
   ## [1.2.3] - 2026-11-02
   - Short, user-facing notes for this release.
   ```

3. **Owner, per release:** merge through a reviewed pull request after Android CI is green. Tag only commits that are on `main`.

## 3. Production signing identity

### 3.1 Generate the key once, on a trusted machine (owner, once)

```bash
bash android/scripts/generate-release-keystore.sh
```

Options: `--out-dir DIR` (default `$HOME/ip-info-android-signing`), `--alias NAME` (default `ip-info-release`), and `--record` (also appends the fingerprint to `android/release/signing-identity.json`; you still need a reviewed pull request).

- The script creates a PKCS12 RSA 4096 key with SHA256withRSA and 10950 days of validity, using the distinguished name `CN=IP Info Android Release, O=Leunos`.
- Passwords are random 256-bit values from `openssl rand`. They are written only to files with mode 0600 and are never printed.
- The output directory must be outside every Git work tree and must not already contain a keystore. The script refuses both cases.
- Files written: `keystore.p12`, `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
- The script prints no secret values: only the public certificate SHA-256 fingerprint, the output path, and the next commands.

Do not generate the production key on CI or on an ephemeral runner.

### 3.2 Record the public fingerprint (owner, once)

Record the lowercase fingerprint printed by the script in a pull request:

```bash
node android/scripts/record-signing-identity.mjs --sha256 <64-lowercase-hex-characters>
```

The gradle build pins the recorded fingerprints into the app, the release workflow fails while the file is empty, and `verify-apk.mjs` accepts only APKs signed by a recorded certificate. Recording a different fingerprint requires `--rotate` and is a key-rotation event (section 8).

### 3.3 Back up the key (owner, once, and test the restore)

Keep two encrypted offline copies in independent locations (for example, two encrypted drives stored in different buildings). Each copy must contain the five files above. Store the decryption secret separately from the copies, for example in a password manager. Never store the keystore, its base64 form, or the passwords in the repository, in issue trackers, in chat, or as a workflow artifact.

Test restoring one copy before relying on it:

```bash
RESTORE_DIR="$(mktemp -d)"
chmod 700 "$RESTORE_DIR"
# Decrypt the copy into $RESTORE_DIR with your encryption tool, then:
ANDROID_KEYSTORE_PASSWORD="$(cat "$RESTORE_DIR/ANDROID_KEYSTORE_PASSWORD")" \
  keytool -list -v -storetype PKCS12 -keystore "$RESTORE_DIR/keystore.p12" \
  -storepass:env ANDROID_KEYSTORE_PASSWORD | grep -E 'Alias name|SHA256:'
rm -rf "$RESTORE_DIR"
```

Confirm that the alias is `ip-info-release` and that the SHA-256 (uppercase, colon-separated in `keytool` output) equals the recorded fingerprint once colons are removed and the value is lowercased.

### 3.4 Consequences of losing the key

- Existing installs accept updates only when the new APK is signed by the same key. If the key is lost, no future APK can update existing installs. Users must uninstall the app, which deletes its local data, and install the new APK.
- The package ID cannot move to a new signer, and a new key cannot be attached to the existing installs without an Android signing-certificate lineage created while the old key still exists. The current pipeline does not create lineages (section 8).
- Therefore keep two verified backups from the beginning, and never keep the only copy on a laptop or CI system.

## 4. GitHub configuration (owner, once)

Run these as a repository administrator with `gh` authenticated for `ArturLauche/ip-info-leunos`. Replace the placeholder reviewer login with a trusted collaborator.

```bash
export REPOSITORY=ArturLauche/ip-info-leunos
export REVIEWER_LOGIN=trusted-maintainer
SETUP_DIR="$(mktemp -d)"
chmod 700 "$SETUP_DIR"
```

### 4.1 Environment `android-release`

The environment holds the signing secrets. Only jobs that reference it can read them, and only for tags matching `android-v*`.

```bash
REVIEWER_ID="$(gh api "users/$REVIEWER_LOGIN" --jq .id)"
[[ "$REVIEWER_ID" =~ ^[0-9]+$ ]]
jq -n --argjson reviewer_id "$REVIEWER_ID" '{
  wait_timer: 0,
  prevent_self_review: true,
  reviewers: [{type: "User", id: $reviewer_id}],
  deployment_branch_policy: {protected_branches: false, custom_branch_policies: true}
}' > "$SETUP_DIR/environment.json"
gh api --method PUT "repos/$REPOSITORY/environments/android-release" \
  -H 'Accept: application/vnd.github+json' --input "$SETUP_DIR/environment.json"
jq -n '{name: "android-v*", type: "tag"}' |
  gh api --method POST "repos/$REPOSITORY/environments/android-release/deployment-branch-policies" \
    -H 'Accept: application/vnd.github+json' --input -
```

`prevent_self_review: true` means the person who pushed the tag cannot approve the run. A repository with a single maintainer must either add a second reviewer or set it to `false`; in that case the tag-creation ruleset below is the only gate.

### 4.2 Environment secrets

Set the four secrets from the protected files. The commands read the files directly, so no value is printed or placed on the command line:

```bash
KEY_DIR="$HOME/ip-info-android-signing"
gh secret set ANDROID_KEYSTORE_BASE64 --env android-release --repo "$REPOSITORY" < "$KEY_DIR/ANDROID_KEYSTORE_BASE64"
gh secret set ANDROID_KEYSTORE_PASSWORD --env android-release --repo "$REPOSITORY" < "$KEY_DIR/ANDROID_KEYSTORE_PASSWORD"
gh secret set ANDROID_KEY_ALIAS --env android-release --repo "$REPOSITORY" < "$KEY_DIR/ANDROID_KEY_ALIAS"
gh secret set ANDROID_KEY_PASSWORD --env android-release --repo "$REPOSITORY" < "$KEY_DIR/ANDROID_KEY_PASSWORD"
```

Secrets are write-only. To rotate one, set it again (section 8).

### 4.3 Rulesets for tags and `main`

Tag creation is restricted to the repository owner (the only bypass actor), and existing Android tags cannot be deleted or moved:

```bash
OWNER_ID="$(gh api users/ArturLauche --jq .id)"
[[ "$OWNER_ID" =~ ^[0-9]+$ ]]
jq -n --argjson owner_id "$OWNER_ID" '{
  name: "Restrict Android release tag creation",
  target: "tag",
  enforcement: "active",
  conditions: {ref_name: {include: ["refs/tags/android-v*"], exclude: []}},
  rules: [{type: "creation"}],
  bypass_actors: [{actor_id: $owner_id, actor_type: "User", bypass_mode: "always"}]
}' > "$SETUP_DIR/tag-creation.json"
gh api --method POST "repos/$REPOSITORY/rulesets" -H 'Accept: application/vnd.github+json' --input "$SETUP_DIR/tag-creation.json"

jq -n '{
  name: "Keep Android release tags immutable",
  target: "tag",
  enforcement: "active",
  conditions: {ref_name: {include: ["refs/tags/android-v*"], exclude: []}},
  rules: [
    {type: "deletion"},
    {type: "update", parameters: {update_allows_fetch_and_merge: false}}
  ],
  bypass_actors: []
}' > "$SETUP_DIR/tag-immutability.json"
gh api --method POST "repos/$REPOSITORY/rulesets" -H 'Accept: application/vnd.github+json' --input "$SETUP_DIR/tag-immutability.json"
```

Protect `main` with the existing `CI` check (its `check` job) and pull requests. Do not require the path-filtered Android CI workflow, because it does not run for web-only changes. Set `required_approving_review_count` to 1 only when a second maintainer can review; a single-owner repository needs 0 or an explicit bypass.

```bash
jq -n '{
  name: "Protect main",
  target: "branch",
  enforcement: "active",
  conditions: {ref_name: {include: ["refs/heads/main"], exclude: []}},
  rules: [
    {type: "deletion"},
    {type: "non_fast_forward"},
    {type: "pull_request", parameters: {
      required_approving_review_count: 1,
      dismiss_stale_reviews_on_push: true,
      require_code_owner_review: false,
      require_last_push_approval: true,
      required_review_thread_resolution: true
    }},
    {type: "required_status_checks", parameters: {
      strict_required_status_checks_policy: true,
      required_status_checks: [{context: "check"}]
    }}
  ],
  bypass_actors: []
}' > "$SETUP_DIR/main.json"
gh api --method POST "repos/$REPOSITORY/rulesets" -H 'Accept: application/vnd.github+json' --input "$SETUP_DIR/main.json"
```

### 4.4 Immutable releases and token permissions

Enable immutable releases so that a published release, its tag and its assets cannot be changed. The publish job relies on this setting: its fallback of reverting a failed release to draft is refused once immutability applies.

```bash
gh api --method PUT "repos/$REPOSITORY/immutable-releases" -H 'Accept: application/vnd.github+json'
gh api "repos/$REPOSITORY/immutable-releases" --jq .enabled   # expect true
```

Make the default workflow token read-only. Each Android job also declares the minimum permissions it needs; the publish job alone requests `contents: write`.

```bash
gh api --method PUT "repos/$REPOSITORY/actions/permissions/workflow" \
  -H 'Accept: application/vnd.github+json' \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
```

Verify the environment and rulesets once:

```bash
gh api "repos/$REPOSITORY/environments/android-release" --jq '{name, reviewers: [.protection_rules[]? | select(.type == "required_reviewers")]}'
gh api "repos/$REPOSITORY/rulesets" --jq '.[] | {name, target, enforcement}'
```

## 5. Automated pipelines

### 5.1 Android CI (`.github/workflows/android-ci.yml`) — automated

Runs on pull requests and pushes to `main` that touch `android/**` or the workflow, and on manual dispatch. It uses no secrets and has read-only permissions.

- `build`: validates the Gradle wrapper, runs the release-script tests (`node --test`), `testDebugUnitTest`, `lintDebug`, and `assembleDebug`, inspects the debug APK (package `com.leunos.ipinfo.debug`, minSdk 29, targetSdk 37, version `<versionName>-debug` from `version.properties`, verified v2/v3 signature) and uploads `ip-info-android-debug-apk` (14 days) plus `android-reports` (7 days).
- `release-dry-run`: generates an ephemeral keystore in `$RUNNER_TEMP` with a masked random password, builds `assembleRelease` against that certificate, verifies it with `verify-apk.mjs`, generates contract metadata, runs `ReleaseContractEndToEndTest`, confirms that a wrong fingerprint is rejected, and deletes the key. It never reads production secrets and never publishes.
- `instrumented`: API 29, 36 and 37.0 emulators (`google_apis`, `x86_64`) first capture UI screenshots with `android/scripts/capture-screenshots.sh` (artifact `android-ui-screenshots-api-<level>`, 7 days), then run `connectedDebugAndroidTest` and `android/scripts/emulator-upgrade-test.sh`. The upgrade script installs the current debug version, seeds settings, installs the next patch version (for example `1.0.0-debug` then `1.0.1-debug`) over it with the same signature, verifies the settings survived, and checks that the install time is unchanged while the update time changed.

Read results in **Actions → Android CI**. Failure logs are in each job; the debug APK and reports are under the run's artifacts.

### 5.2 Android Release (`.github/workflows/android-release.yml`) — automated, gated

Runs only when a tag matching `android-v[0-9]+.[0-9]+.[0-9]+` is pushed. There is no branch, pull-request or manual trigger.

| Job | Permissions | What it proves |
| --- | --- | --- |
| `validate` | read | The tag resolves to the pushed commit; that commit is on `origin/main`; the tag equals `version.properties`; the CHANGELOG section exists; the production identity has at least one fingerprint; no published release uses this tag; the version is strictly newer than all published `android-v*` releases. |
| `test` | read, no secrets | Release-script tests, `testDebugUnitTest` and `lintDebug` on the tagged commit. |
| `build-sign` | read, environment `android-release` (approval required) | All four secrets are present, the keystore is rebuilt with `umask 077` outside the workspace, `assembleRelease` runs, `verify-apk.mjs` verifies the APK against the recorded identity, and metadata, the checksum and release notes are generated. The keystore is removed in an `always()` step. Only the verified assets are uploaded as `android-release-assets` (7 days). |
| `publish` | write, no secrets | Re-checks metadata against the APK and the identity, deletes a leftover draft for the tag (refuses if a published release exists), creates a draft with exactly the three assets, checks their states and sizes, publishes with `--latest=false`, then downloads the assets anonymously and compares them with the artifact. On mismatch it tries to revert the release to draft and fails. |

Concurrency is `android-release` with `cancel-in-progress: false`, so two releases never run at once. The `build-sign` job waits for the environment approval; approve it under **Actions → the run → Review deployments**.

## 6. First stable release checklist (1.0.0)

1. **Owner, once:** merge the Android feature pull request (`feat/android-app`) into `main` after review and a green Android CI.
2. **Owner, once:** generate the key (section 3.1) on a trusted machine, outside the repository.
3. **Owner, once:** record the fingerprint in a reviewed pull request (section 3.2) and merge it.
4. **Owner, once:** create two encrypted backups and test one restore (section 3.3).
5. **Owner, once:** configure the environment, secrets, rulesets, immutable releases and token permissions (section 4).
6. **Owner, per release:** confirm `android/version.properties` contains `versionName=1.0.0` and `android/CHANGELOG.md` contains a non-empty `## [1.0.0]` section, both on `main`.
7. **Owner, per release:** confirm the commit you will tag has a green Android CI run on `main`.
8. **Owner, per release:** tag and push from an up-to-date `main`:

   ```bash
   git switch main && git pull --ff-only
   git tag -a android-v1.0.0 -m "IP Info for Android 1.0.0"
   git push origin android-v1.0.0
   ```

9. **Owner:** open **Actions → Android Release**, review the run's `validate` and `test` results, and approve the `android-release` deployment for `build-sign`.
10. **Owner:** after the run finishes, open the release page for `android-v1.0.0`. Confirm it is published, is not marked Latest, and has exactly three assets: the APK, the `.sha256` file and `android-update.json`.
11. **Owner:** verify the public download as in section 9, then install the APK once on an Android 10 or newer device and confirm that the app's update settings report version 1.0.0.

Do not create the tag from an unmerged pull request. Do not publish 1.0.0 without the protected key and the recorded fingerprint: the workflow fails closed in that case.

## 7. Routine release

1. Bump `android/version.properties` and add the CHANGELOG section (section 2); merge through a pull request.
2. Confirm the Android CI run on `main` is green.
3. Tag and push (step 8 of section 6), approve the deployment, and verify the release.

## 8. Recovery, rotation and key changes

- **Failed before approval or before a draft exists:** fix the cause on `main` and release the next version. Tags cannot be moved or deleted, so do not reuse the failed tag. A tag without a release has no users; leave it in place.
- **Transient failure (GitHub outage, network):** use **Re-run failed jobs** on the same tag. The job re-checks the same commit.
- **`build-sign` failed after approval:** re-run that job. No release exists yet, so no public state changes.
- **`publish` failed before the release became public:** re-run `publish`. It deletes only the draft for the tag and recreates it. A published release is never replaced; the job refuses.
- **Public verification failed after publishing:** the job tries to revert the release to draft. If immutable releases refuse the revert, leave the release alone, investigate, and publish a corrected higher patch version (for example `1.0.1`). Never delete, replace or re-upload assets of a published release, and never reuse a version code.
- **Rotating secrets without changing the key:** set the same secret name again from updated files, for example after changing the keystore password with `keytool -importkeystore` into a new PKCS12 file. Confirm the certificate fingerprint is unchanged before updating the secrets and both backups.
- **Changing the signing key:** this is not a routine operation. Existing installs accept only updates signed by a valid lineage that includes the old key. The current pipeline verifies one signer against the recorded identity and does not create or verify lineage. `record-signing-identity.mjs --rotate` only appends a fingerprint and prints a warning; it must be paired with a reviewed design and updater change before any rotated APK is released.

## 9. Users: download and verify an APK

1. Open the GitHub Releases page for the tag `android-v<version>` (not the repository's Latest release) and download `ip-info-android-v<version>.apk`, `ip-info-android-v<version>.apk.sha256` and, optionally, `android-update.json`.
2. Check the checksum on a computer:

   ```bash
   sha256sum -c ip-info-android-v<version>.apk.sha256
   ```

3. Check the signer. The `Signer #1 certificate SHA-256 digest` must match the fingerprint in the release notes and in `android/release/signing-identity.json`:

   ```bash
   apksigner verify --print-certs ip-info-android-v<version>.apk
   ```

4. Install on the device, allowing installs from the browser or file manager when Android asks. Afterwards the app updates itself from GitHub Releases. Scheduled downloads happen only on unmetered networks; the app shows a manual **Download now** action on metered networks.

## 10. Troubleshooting

| Message or symptom | Cause | Fix |
| --- | --- | --- |
| `Release tag ... does not match android/version.properties` | Tag and `versionName` differ | Use the tag that matches the version file. |
| `CHANGELOG section for X.Y.Z is missing or empty` | Heading or body missing | Add `## [X.Y.Z]` with non-empty notes on `main`. |
| `A published release already exists for ...` | Tag already published | Release the next version. |
| `must be newer than every published Android release` | Lower or equal version | Bump the version. |
| `Tag does not resolve to the pushed commit` | Tag moved during the run | Re-run; do not move tags. |
| `Refusing a release tag whose commit is not on origin/main` | Tag on an unmerged commit | Merge first, then tag the merged commit. |
| `Stable release signing is disabled until the owner records ...` | Identity file empty | Record the fingerprint (section 3.2). |
| `Required android-release secret is missing: NAME` | Secret absent from the environment | Set it (section 4.2). |
| `Signer certificate SHA-256 ... is not in the expected signing identity` | Wrong keystore in secrets | Restore the correct secrets; do not add the fingerprint to the identity unless the key is the intended new key. |
| `APK is signed with the Android Debug certificate` | Release build used the debug key | Check `ANDROID_KEYSTORE_*` were set for `assembleRelease`. |
| `APK applicationId ... expected 'com.leunos.ipinfo'` | Wrong package ID | Stop; the application ID must never change. |
| `Release metadata signing certificate is not in the protected signing identity` | Metadata and identity disagree | Investigate the artifact; do not publish. |
| `Refusing to overwrite published release` | A published release for the tag exists | Release a new version. |
| `Unauthenticated public verification failed` | Asset not publicly downloadable or changed | Read the run log, then follow section 8. |
| `Refusing to overwrite different release asset` (`generate-update-metadata.mjs`) | Output directory already holds other assets | Use a clean directory. |
| `Refusing to create signing material inside Git work tree` | Key generation path inside the repository | Use the default `$HOME/ip-info-android-signing`. |

## 11. Local checks

```bash
node --test android/scripts/*.test.mjs android/scripts/lib/*.test.mjs
shellcheck -x android/scripts/*.sh
actionlint .github/workflows/android-ci.yml .github/workflows/android-release.yml
pnpm lint
```

Run the APK verifier locally against a built APK. Example for the debug APK (it must fail, because debug APKs are not stable releases):

```bash
node android/scripts/verify-apk.mjs \
  --apk android/app/build/outputs/apk/debug/app-debug.apk \
  --version 1.0.0-debug \
  --identity android/release/signing-identity.json
```

The script prints the facts JSON on success and an explicit error list on failure.
