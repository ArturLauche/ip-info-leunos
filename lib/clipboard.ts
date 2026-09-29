export interface ClipboardEnvironment {
  clipboard?: Pick<Clipboard, "writeText">;
  document?: Pick<Document, "activeElement" | "body" | "createElement" | "execCommand">;
}

function browserEnvironment(): ClipboardEnvironment {
  return {
    clipboard: typeof navigator === "undefined" ? undefined : navigator.clipboard,
    document: typeof document === "undefined" ? undefined : document,
  };
}

/** Selection-based copy for pages without the async Clipboard API. */
function copyWithSelection(text: string, doc: NonNullable<ClipboardEnvironment["document"]>): boolean {
  const previous = doc.activeElement as HTMLElement | null;
  const field = doc.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.setAttribute("aria-hidden", "true");
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  doc.body.append(field);

  try {
    field.select();
    field.setSelectionRange(0, text.length);
    return doc.execCommand("copy");
  } finally {
    field.remove();
    previous?.focus?.();
  }
}

/**
 * Copies text with the async Clipboard API and falls back to a hidden selection
 * where it is missing. Self-hosted deployments served over plain HTTP are not
 * secure contexts, so `navigator.clipboard` is undefined there.
 */
export async function writeClipboardText(
  text: string,
  environment: ClipboardEnvironment = browserEnvironment(),
): Promise<void> {
  const { clipboard, document: doc } = environment;

  if (clipboard) {
    try {
      await clipboard.writeText(text);
      return;
    } catch (error) {
      if (!doc) throw error;
    }
  }

  if (!doc || !copyWithSelection(text, doc)) {
    throw new Error("Copying to the clipboard is not available.");
  }
}
