package com.leunos.ipinfo.navigation

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.appbar.MaterialToolbar
import com.leunos.ipinfo.MainActivity

/**
 * Shared behaviour of the native screens: edge-to-edge insets, toolbar with Up navigation, and a
 * Back/Up that returns to the existing website screen instead of recreating it.
 */
abstract class BaseNativeActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
    }

    protected fun setUpToolbar(toolbar: MaterialToolbar) {
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
    }

    /**
     * Pads the app bar by the status bar / cutout insets and the scrolling content by the navigation
     * bar inset, keeping the content's own padding.
     */
    protected fun applyEdgeToEdgeInsets(root: View, appBar: View, scrollingContent: View) {
        val basePadding = intArrayOf(
            scrollingContent.paddingLeft,
            scrollingContent.paddingTop,
            scrollingContent.paddingRight,
            scrollingContent.paddingBottom,
        )
        ViewCompat.setOnApplyWindowInsetsListener(root) { _, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            appBar.setPadding(bars.left, bars.top, bars.right, 0)
            scrollingContent.setPadding(
                basePadding[0] + bars.left,
                basePadding[1],
                basePadding[2] + bars.right,
                basePadding[3] + bars.bottom,
            )
            WindowInsetsCompat.CONSUMED
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        // Opened from a launcher shortcut or notification as the first screen: Up leads to the website.
        if (isTaskRoot) {
            startActivity(
                Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            )
        }
        finish()
        return true
    }
}
