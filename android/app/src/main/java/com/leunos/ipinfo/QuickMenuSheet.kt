package com.leunos.ipinfo

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.leunos.ipinfo.databinding.SheetQuickMenuBinding
import com.leunos.ipinfo.navigation.AppNavigator
import com.leunos.ipinfo.updates.UpdatePhase
import kotlinx.coroutines.launch

/** Small native menu that complements (and never duplicates) the website's own navigation. */
class QuickMenuSheet : BottomSheetDialogFragment() {
    private var binding: SheetQuickMenuBinding? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        val b = SheetQuickMenuBinding.inflate(inflater, container, false)
        binding = b
        val main = activity as? MainActivity

        b.rowHome.setOnClickListener { dismiss(); main?.goHome() }
        b.rowReload.setOnClickListener { dismiss(); main?.reloadPage() }
        b.rowDiagnostics.setOnClickListener { dismiss(); AppNavigator.diagnostics(requireContext()) }
        b.rowSettings.setOnClickListener { dismiss(); AppNavigator.settings(requireContext()) }
        b.rowAbout.setOnClickListener { dismiss(); AppNavigator.about(requireContext()) }
        b.rowUpdate.setOnClickListener { dismiss(); AppNavigator.settings(requireContext()) }

        val graph = (requireActivity().application as IpInfoApplication).graph
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                graph.updates.state.collect { state ->
                    val candidate = state.candidate?.takeIf { state.phase != UpdatePhase.IDLE && graph.updates.updaterEnabled }
                    b.rowUpdate.isVisible = candidate != null
                    if (candidate != null) b.rowUpdate.text = getString(R.string.menu_update_available, candidate.metadata.versionName)
                }
            }
        }
        return b.root
    }

    override fun onDestroyView() {
        binding = null
        super.onDestroyView()
    }

    companion object {
        const val TAG = "quick_menu"
    }
}
