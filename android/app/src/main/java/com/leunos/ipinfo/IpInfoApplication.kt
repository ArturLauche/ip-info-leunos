package com.leunos.ipinfo

import android.app.Application
import androidx.appcompat.app.AppCompatDelegate
import kotlin.concurrent.thread

class IpInfoApplication : Application() {
    lateinit var graph: AppGraph
        private set

    override fun onCreate() {
        super.onCreate()
        graph = AppGraph(this)
        registerActivityLifecycleCallbacks(graph.foreground)
        graph.notifier.createChannel()
        // Follow the system light/dark setting; the website follows it too.
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)

        thread(name = "update-startup") {
            graph.updates.reconcile()
            graph.scheduler.syncPeriodicCheck(graph.preferences.autoUpdateChecks)
        }
    }
}
