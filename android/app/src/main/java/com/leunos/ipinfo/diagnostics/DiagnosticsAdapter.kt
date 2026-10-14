package com.leunos.ipinfo.diagnostics

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.leunos.ipinfo.databinding.ItemDiagFieldBinding
import com.leunos.ipinfo.databinding.ItemDiagHeaderBinding
import com.leunos.ipinfo.databinding.ItemDiagNoticeBinding

class DiagnosticsAdapter(
    private val onCopy: (DiagnosticsRow.Field) -> Unit,
    private val onNoticeAction: (NoticeAction) -> Unit,
) : ListAdapter<DiagnosticsRow, RecyclerView.ViewHolder>(Diff) {

    override fun getItemViewType(position: Int): Int = when (getItem(position)) {
        is DiagnosticsRow.Header -> TYPE_HEADER
        is DiagnosticsRow.Field -> TYPE_FIELD
        is DiagnosticsRow.Notice -> TYPE_NOTICE
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            TYPE_HEADER -> HeaderHolder(ItemDiagHeaderBinding.inflate(inflater, parent, false))
            TYPE_FIELD -> FieldHolder(ItemDiagFieldBinding.inflate(inflater, parent, false))
            else -> NoticeHolder(ItemDiagNoticeBinding.inflate(inflater, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (val row = getItem(position)) {
            is DiagnosticsRow.Header -> (holder as HeaderHolder).binding.title.text = row.title
            is DiagnosticsRow.Field -> (holder as FieldHolder).bind(row)
            is DiagnosticsRow.Notice -> (holder as NoticeHolder).bind(row)
        }
    }

    private class HeaderHolder(val binding: ItemDiagHeaderBinding) : RecyclerView.ViewHolder(binding.root)

    private inner class FieldHolder(val binding: ItemDiagFieldBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(row: DiagnosticsRow.Field) {
            binding.label.text = row.label
            binding.value.text = row.value
            binding.value.alpha = if (row.unavailable) 0.6f else 1f
            val copyable = row.copyText != null
            binding.copyIcon.isVisible = copyable
            binding.root.isClickable = copyable
            binding.root.isFocusable = copyable
            binding.root.setOnClickListener(if (copyable) View.OnClickListener { onCopy(row) } else null)
            binding.root.contentDescription = if (copyable) {
                binding.root.context.getString(com.leunos.ipinfo.R.string.diag_copy_description, row.label, row.value)
            } else {
                null
            }
        }
    }

    private inner class NoticeHolder(val binding: ItemDiagNoticeBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(row: DiagnosticsRow.Notice) {
            binding.text.text = row.text
            val action = row.action
            binding.action.isVisible = action != null && row.actionLabel != null
            binding.action.text = row.actionLabel
            binding.action.setOnClickListener { action?.let(onNoticeAction) }
        }
    }

    private object Diff : DiffUtil.ItemCallback<DiagnosticsRow>() {
        override fun areItemsTheSame(oldItem: DiagnosticsRow, newItem: DiagnosticsRow) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: DiagnosticsRow, newItem: DiagnosticsRow) = oldItem == newItem
    }

    private companion object {
        const val TYPE_HEADER = 0
        const val TYPE_FIELD = 1
        const val TYPE_NOTICE = 2
    }
}
