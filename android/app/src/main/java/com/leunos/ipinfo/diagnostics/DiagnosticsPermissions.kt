package com.leunos.ipinfo.diagnostics

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import com.leunos.ipinfo.diagnostics.model.LocationAccess
import com.leunos.ipinfo.diagnostics.model.LocationPermissionState

/**
 * The Wi-Fi name (SSID/BSSID) is location-sensitive: Android requires the precise location permission
 * AND the device's location setting for it. NEARBY_WIFI_DEVICES is deliberately not used because none
 * of the APIs this app calls are gated by it, and it does not unlock SSID access.
 */
object DiagnosticsPermissions {
    val RUNTIME_PERMISSIONS = arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)

    fun access(context: Context, activity: Activity?, requestedBefore: Boolean): LocationAccess {
        val fine = granted(context, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = granted(context, Manifest.permission.ACCESS_COARSE_LOCATION)
        val permission = when {
            fine -> LocationPermissionState.PRECISE_GRANTED
            coarse -> LocationPermissionState.APPROXIMATE_ONLY
            !requestedBefore -> LocationPermissionState.NOT_ASKED
            activity != null && !ActivityCompat.shouldShowRequestPermissionRationale(activity, Manifest.permission.ACCESS_FINE_LOCATION) ->
                LocationPermissionState.DENIED_PERMANENTLY
            else -> LocationPermissionState.DENIED
        }
        return LocationAccess(permission, locationServicesEnabled(context))
    }

    fun locationServicesEnabled(context: Context): Boolean {
        val manager = context.getSystemService(LocationManager::class.java) ?: return false
        return LocationManagerCompat.isLocationEnabled(manager)
    }

    private fun granted(context: Context, permission: String) =
        ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
}
