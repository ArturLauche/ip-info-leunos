#!/usr/bin/env bash
set -euo pipefail
umask 077

usage() {
  cat <<'USAGE'
Usage: generate-release-keystore.sh [--out-dir DIR] [--alias NAME] [--record]

Creates the initial production PKCS12 signing identity outside every Git work tree.
Passwords and the base64 keystore are written to mode-0600 files and are never printed.
USAGE
}

out_dir="${HOME:?HOME must be set}/ip-info-android-signing"
key_alias="ip-info-release"
record_identity=false
while (($#)); do
  case "$1" in
    --out-dir)
      (($# >= 2)) || { echo "--out-dir requires a directory." >&2; exit 2; }
      out_dir=$2
      shift 2
      ;;
    --alias)
      (($# >= 2)) || { echo "--alias requires a name." >&2; exit 2; }
      key_alias=$2
      shift 2
      ;;
    --record)
      [[ "$record_identity" == false ]] || { echo "--record may only be supplied once." >&2; exit 2; }
      record_identity=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

[[ -n "$out_dir" ]] || { echo "Output directory cannot be empty." >&2; exit 2; }
[[ "$key_alias" =~ ^[A-Za-z0-9._-]{1,64}$ ]] || { echo "Alias must use only letters, numbers, dot, underscore, or hyphen (1-64 characters)." >&2; exit 2; }
command -v keytool >/dev/null || { echo "keytool is required (install a supported JDK)." >&2; exit 1; }
command -v openssl >/dev/null || { echo "openssl is required to generate random passwords and fingerprints." >&2; exit 1; }
command -v base64 >/dev/null || { echo "base64 is required." >&2; exit 1; }
command -v git >/dev/null || { echo "git is required to reject output paths inside work trees." >&2; exit 1; }

out_dir=${out_dir%/}
[[ -n "$out_dir" ]] || { echo "Refusing to use the filesystem root as the output directory." >&2; exit 1; }
if [[ -d "$out_dir" ]]; then
  canonical_out=$(cd -- "$out_dir" && pwd -P)
  canonical_parent=$(dirname -- "$canonical_out")
  out_name=$(basename -- "$canonical_out")
else
  out_name=$(basename -- "$out_dir")
  parent_input=$(dirname -- "$out_dir")
  [[ -d "$parent_input" ]] || { echo "The output directory's parent must already exist: $parent_input" >&2; exit 1; }
  canonical_parent=$(cd -- "$parent_input" && pwd -P)
  canonical_out="$canonical_parent/$out_name"
fi
[[ -n "$out_name" && "$out_name" != . && "$out_name" != .. ]] || { echo "Invalid output directory." >&2; exit 1; }

for git_candidate in "$canonical_parent" "$canonical_out"; do
  [[ -d "$git_candidate" ]] || continue
  if git_root=$(git -C "$git_candidate" rev-parse --show-toplevel 2>/dev/null); then
    canonical_git_root=$(cd -- "$git_root" && pwd -P)
    case "$canonical_out" in
      "$canonical_git_root"|"$canonical_git_root"/*)
        echo "Refusing to create signing material inside Git work tree '$canonical_git_root'. Choose an external path such as \$HOME/ip-info-android-signing." >&2
        exit 1
        ;;
    esac
  fi
done

keystore="$canonical_out/keystore.p12"
secret_files=(
  "$canonical_out/ANDROID_KEYSTORE_BASE64"
  "$canonical_out/ANDROID_KEYSTORE_PASSWORD"
  "$canonical_out/ANDROID_KEY_ALIAS"
  "$canonical_out/ANDROID_KEY_PASSWORD"
)
for file in "$keystore" "${secret_files[@]}"; do
  [[ ! -e "$file" ]] || { echo "Refusing to overwrite existing signing file '$file'." >&2; exit 1; }
done

mkdir -m 700 -- "$canonical_out" 2>/dev/null || {
  [[ -d "$canonical_out" ]] || { echo "Cannot create output directory '$canonical_out'." >&2; exit 1; }
  chmod 700 -- "$canonical_out"
}
work_dir=$(mktemp -d "$canonical_out/.keygen.XXXXXX")
chmod 700 -- "$work_dir"
trap 'rm -rf -- "$work_dir"' EXIT

store_password=$(openssl rand -hex 32)
key_password=$store_password
export ANDROID_KEYSTORE_PASSWORD="$store_password"
export ANDROID_KEY_PASSWORD="$key_password"

if ! keytool -genkeypair -noprompt \
  -storetype PKCS12 \
  -keystore "$work_dir/keystore.p12" \
  -storepass:env ANDROID_KEYSTORE_PASSWORD \
  -keypass:env ANDROID_KEY_PASSWORD \
  -alias "$key_alias" \
  -keyalg RSA \
  -keysize 4096 \
  -sigalg SHA256withRSA \
  -validity 10950 \
  -dname 'CN=IP Info Android Release, O=Leunos' \
  >"$work_dir/keytool.log" 2>&1; then
  cat "$work_dir/keytool.log" >&2
  echo "keytool failed to create the signing key." >&2
  exit 1
fi

if ! keytool -exportcert \
  -storetype PKCS12 \
  -keystore "$work_dir/keystore.p12" \
  -storepass:env ANDROID_KEYSTORE_PASSWORD \
  -alias "$key_alias" \
  -file "$work_dir/certificate.der" \
  >"$work_dir/export.log" 2>&1; then
  cat "$work_dir/export.log" >&2
  echo "Could not export the signing certificate for fingerprint calculation." >&2
  exit 1
fi
certificate_sha256=$(openssl dgst -sha256 "$work_dir/certificate.der" | awk '{ print tolower($NF) }')
[[ "$certificate_sha256" =~ ^[0-9a-f]{64}$ ]] || { echo "Could not calculate a valid certificate SHA-256 fingerprint." >&2; exit 1; }

printf '%s' "$ANDROID_KEYSTORE_PASSWORD" > "$work_dir/ANDROID_KEYSTORE_PASSWORD"
printf '%s' "$ANDROID_KEY_PASSWORD" > "$work_dir/ANDROID_KEY_PASSWORD"
printf '%s' "$key_alias" > "$work_dir/ANDROID_KEY_ALIAS"
base64 < "$work_dir/keystore.p12" | tr -d '\r\n' > "$work_dir/ANDROID_KEYSTORE_BASE64"
chmod 600 "$work_dir/keystore.p12" "$work_dir/ANDROID_KEYSTORE_PASSWORD" "$work_dir/ANDROID_KEY_PASSWORD" "$work_dir/ANDROID_KEY_ALIAS" "$work_dir/ANDROID_KEYSTORE_BASE64"

mv -- "$work_dir/keystore.p12" "$keystore"
for name in ANDROID_KEYSTORE_BASE64 ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
  mv -- "$work_dir/$name" "$canonical_out/$name"
done
chmod 700 -- "$canonical_out"

printf 'Production signing certificate SHA-256: %s\n' "$certificate_sha256"
printf 'Private signing files were created in: %s\n' "$canonical_out"
printf 'Store and key passwords are equal because PKCS12 requires one password for the private key.\n'
printf '\nNext steps (these commands read the protected files; no secret values are displayed):\n'
printf '  gh secret set ANDROID_KEYSTORE_BASE64 --env android-release < %q\n' "$canonical_out/ANDROID_KEYSTORE_BASE64"
printf '  gh secret set ANDROID_KEYSTORE_PASSWORD --env android-release < %q\n' "$canonical_out/ANDROID_KEYSTORE_PASSWORD"
printf '  gh secret set ANDROID_KEY_ALIAS --env android-release < %q\n' "$canonical_out/ANDROID_KEY_ALIAS"
printf '  gh secret set ANDROID_KEY_PASSWORD --env android-release < %q\n' "$canonical_out/ANDROID_KEY_PASSWORD"
printf '  node %q --sha256 %s\n' "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)/record-signing-identity.mjs" "$certificate_sha256"
printf '\nMake two encrypted offline backups of the keystore and all four credential files. Test restoration with keytool -list before storing the backups.\n'

if [[ "$record_identity" == true ]]; then
  script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
  node "$script_dir/record-signing-identity.mjs" --sha256 "$certificate_sha256"
fi
