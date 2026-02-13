package com.doer.app.util

import androidx.compose.ui.graphics.Color

object ColorHelpers {

    /**
     * Parses a hex color string (e.g., "#dc2626") to a Compose Color.
     */
    fun parseHexColor(hex: String): Color {
        return try {
            val sanitized = hex.removePrefix("#")
            val colorLong = sanitized.toLong(16)
            when (sanitized.length) {
                6 -> Color(0xFF000000 or colorLong)
                8 -> Color(colorLong)
                else -> Color.Gray
            }
        } catch (e: Exception) {
            Color.Gray
        }
    }

    /**
     * Returns a color for the given priority level.
     * P1 = red, P2 = orange, P3 = blue, P4 = gray
     */
    fun priorityColor(priority: Int): Color {
        return when (priority) {
            1 -> Color(0xFFDC2626) // Red
            2 -> Color(0xFFEA580C) // Orange
            3 -> Color(0xFF2563EB) // Blue
            else -> Color(0xFF9CA3AF) // Gray
        }
    }

    /**
     * A curated list of project color hex strings.
     */
    val projectColors: List<String> = listOf(
        "#dc2626", // Red
        "#ea580c", // Orange
        "#d97706", // Amber
        "#16a34a", // Green
        "#0d9488", // Teal
        "#2563eb", // Blue
        "#7c3aed", // Violet
        "#db2777", // Pink
        "#64748b", // Slate
        "#78716c", // Stone
        "#059669", // Emerald
        "#0891b2"  // Cyan
    )
}
