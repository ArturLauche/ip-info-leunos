package com.leunos.ipinfo.navigation

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import androidx.core.net.toUri
import com.leunos.ipinfo.MainActivity
import com.leunos.ipinfo.diagnostics.NetworkDiagnosticsActivity
import com.leunos.ipinfo.settings.AboutActivity
import com.leunos.ipinfo.settings.SettingsActivity
import com.leunos.ipinfo.web.TrustedOrigin

/** Entry points between the website shell and the native screens. */
object AppNavigator {

    fun diagnostics(context: Context) = context.startActivity(Intent(context, NetworkDiagnosticsActivity::class.java))

    fun settings(context: Context) = context.startActivity(Intent(context, SettingsActivity::class.java))

    fun about(context: Context) = context.startActivity(Intent(context, AboutActivity::class.java))

    /** Brings the existing website screen forward (no reload) and optionally opens a site path. */
    fun website(context: Context, path: String? = null) {
        val intent = Intent(context, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        path?.let { intent.putExtra(MainActivity.EXTRA_OPEN_PATH, it) }
        context.startActivity(intent)
    }

    /** Opens a web link in the user's browser. Returns false if no browser can handle it. */
    fun openInBrowser(context: Context, url: String): Boolean = try {
        val intent = Intent(Intent.ACTION_VIEW, url.toUri())
            .addCategory(Intent.CATEGORY_BROWSABLE)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        true
    } catch (e: ActivityNotFoundException) {
        false
    }

    fun composeMail(context: Context, mailto: String): Boolean = try {
        context.startActivity(Intent(Intent.ACTION_SENDTO, mailto.toUri()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (e: ActivityNotFoundException) {
        false
    }

    fun openExternal(context: Context, url: String, kind: TrustedOrigin.ExternalKind): Boolean = when (kind) {
        TrustedOrigin.ExternalKind.WEB -> openInBrowser(context, url)
        TrustedOrigin.ExternalKind.MAIL -> composeMail(context, url)
    }
}
