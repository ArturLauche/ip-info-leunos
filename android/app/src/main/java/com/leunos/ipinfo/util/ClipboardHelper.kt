package com.leunos.ipinfo.util

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle

object ClipboardHelper {

    /**
     * Copies [text]. Values that identify a network are flagged sensitive so Android 13+ hides them
     * from clipboard previews. Returns true when the app should confirm the copy itself (Android 12L
     * and older); newer versions show a system confirmation.
     */
    fun copy(context: Context, label: String, text: String, sensitive: Boolean): Boolean {
        val manager = context.getSystemService(ClipboardManager::class.java) ?: return false
        val clip = ClipData.newPlainText(label, text)
        if (sensitive && Build.VERSION.SDK_INT >= 33) {
            clip.description.extras = PersistableBundle().apply { putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true) }
        }
        manager.setPrimaryClip(clip)
        return Build.VERSION.SDK_INT < 33
    }
}
