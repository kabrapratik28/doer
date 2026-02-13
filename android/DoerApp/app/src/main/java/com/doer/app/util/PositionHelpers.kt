package com.doer.app.util

object PositionHelpers {

    /**
     * Returns a position value between [before] and [after].
     * Useful for inserting items between two existing items in an ordered list.
     */
    fun getPositionBetween(before: Double, after: Double): Double {
        return (before + after) / 2.0
    }

    /**
     * Returns a position value at the end of a list.
     * Takes the current maximum position and adds a step value.
     */
    fun getPositionAtEnd(currentMax: Double, step: Double = 65536.0): Double {
        return currentMax + step
    }
}
