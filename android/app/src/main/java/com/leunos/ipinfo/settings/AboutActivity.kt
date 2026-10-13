package com.leunos.ipinfo.settings

import android.os.Bundle
import com.leunos.ipinfo.BuildConfig
import com.leunos.ipinfo.R
import com.leunos.ipinfo.databinding.ActivityAboutBinding
import com.leunos.ipinfo.navigation.AppNavigator
import com.leunos.ipinfo.navigation.BaseNativeActivity
import com.leunos.ipinfo.updates.PackageIdentity
import com.leunos.ipinfo.updates.ReleaseContract
import com.leunos.ipinfo.util.ClipboardHelper
import com.google.android.material.snackbar.Snackbar

/** Version, signing identity and open-source information. */
class AboutActivity : BaseNativeActivity() {
    private lateinit var binding: ActivityAboutBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAboutBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setUpToolbar(binding.toolbar)
        applyEdgeToEdgeInsets(binding.root, binding.appBar, binding.scroll)

        binding.versionValue.text = getString(R.string.about_version_format, BuildConfig.VERSION_NAME, BuildConfig.VERSION_CODE)
        binding.channelValue.setText(if (BuildConfig.UPDATER_ENABLED) R.string.about_channel_stable else R.string.about_channel_debug)
        binding.applicationIdValue.text = packageName

        val fingerprints = PackageIdentity.signingFingerprints(this)
        val fingerprintText = fingerprints.joinToString("\n") { it.chunked(2).joinToString(":").uppercase() }
        binding.certificateValue.text = fingerprintText.ifEmpty { getString(R.string.value_not_available) }
        binding.certificateCard.setOnClickListener {
            if (fingerprints.isNotEmpty()) {
                val confirm = ClipboardHelper.copy(this, getString(R.string.about_certificate), fingerprintText, sensitive = false)
                if (confirm) Snackbar.make(binding.root, R.string.copied_to_clipboard, Snackbar.LENGTH_SHORT).show()
            }
        }

        binding.privacyText.text = getString(R.string.privacy_details)
        binding.licenseValue.setText(R.string.about_license_value)
        binding.sourceButton.setOnClickListener { AppNavigator.openInBrowser(this, ReleaseContract.REPOSITORY_URL) }
        binding.privacyPolicyButton.setOnClickListener { AppNavigator.website(this, "/privacy-policy") }
        binding.settingsButton.setOnClickListener { AppNavigator.settings(this) }
    }
}
