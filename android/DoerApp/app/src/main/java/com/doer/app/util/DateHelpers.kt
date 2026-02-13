package com.doer.app.util

import androidx.compose.ui.graphics.Color
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

object DateHelpers {

    private val isoFormatter = DateTimeFormatter.ISO_LOCAL_DATE

    fun todayString(): String {
        return LocalDate.now().format(isoFormatter)
    }

    fun dateString(daysFromNow: Int): String {
        return LocalDate.now().plusDays(daysFromNow.toLong()).format(isoFormatter)
    }

    fun formatDueDate(dateString: String?): String {
        if (dateString == null) return ""
        return try {
            val date = LocalDate.parse(dateString.take(10), isoFormatter)
            val today = LocalDate.now()
            val tomorrow = today.plusDays(1)
            val yesterday = today.minusDays(1)

            when (date) {
                today -> "Today"
                tomorrow -> "Tomorrow"
                yesterday -> "Yesterday"
                else -> {
                    val daysUntil = ChronoUnit.DAYS.between(today, date)
                    if (daysUntil in 2..6) {
                        date.dayOfWeek.name.lowercase()
                            .replaceFirstChar { it.uppercase() }
                    } else {
                        val formatter = DateTimeFormatter.ofPattern("MMM d")
                        date.format(formatter)
                    }
                }
            }
        } catch (e: Exception) {
            dateString.take(10)
        }
    }

    fun dueDateColor(dateString: String?): Color {
        if (dateString == null) return Color.Gray
        return try {
            val date = LocalDate.parse(dateString.take(10), isoFormatter)
            val today = LocalDate.now()
            when {
                date.isBefore(today) -> Color(0xFFDC2626) // Overdue - red
                date.isEqual(today) -> Color(0xFF16A34A) // Today - green
                date.isEqual(today.plusDays(1)) -> Color(0xFFEA580C) // Tomorrow - orange
                else -> Color(0xFF7C3AED) // Future - purple
            }
        } catch (e: Exception) {
            Color.Gray
        }
    }

    fun isOverdue(dateString: String?): Boolean {
        if (dateString == null) return false
        return try {
            val date = LocalDate.parse(dateString.take(10), isoFormatter)
            date.isBefore(LocalDate.now())
        } catch (e: Exception) {
            false
        }
    }
}
