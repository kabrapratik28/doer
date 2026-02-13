package com.doer.app.ui.components

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.doer.app.util.ColorHelpers

@Composable
fun LabelChip(
    name: String,
    color: String,
    modifier: Modifier = Modifier
) {
    val chipColor = ColorHelpers.parseHexColor(color)

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = chipColor.copy(alpha = 0.15f)
    ) {
        Text(
            text = name,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            color = chipColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
    }
}
