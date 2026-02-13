package com.doer.app

import android.app.Application
import com.doer.app.data.remote.SupabaseModule

class DoerApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize the Supabase client singleton eagerly on app start
        SupabaseModule.client
    }
}
