package com.leunos.ipinfo.updates

import android.content.pm.PackageInstaller
import org.junit.Assert.assertEquals
import org.junit.Test

class InstallStatusMapperTest {
    private fun map(status: Int) = InstallStatusMapper.map(status, "message")

    @Test
    fun successAndUserConfirmationAreDistinguished() {
        assertEquals(InstallEvent.Success, map(PackageInstaller.STATUS_SUCCESS))
        assertEquals(InstallEvent.PendingUserAction, map(PackageInstaller.STATUS_PENDING_USER_ACTION))
    }

    @Test
    fun cancellationByTheUserIsNotAFailure() {
        assertEquals(InstallEvent.Aborted, map(PackageInstaller.STATUS_FAILURE_ABORTED))
    }

    @Test
    fun everyFailureStatusMapsToAUserFacingFailure() {
        assertEquals(InstallEvent.Failed(UpdateFailure.INSTALL_BLOCKED, "message"), map(PackageInstaller.STATUS_FAILURE_BLOCKED))
        assertEquals(InstallEvent.Failed(UpdateFailure.INSTALL_CONFLICT, "message"), map(PackageInstaller.STATUS_FAILURE_CONFLICT))
        assertEquals(InstallEvent.Failed(UpdateFailure.INSTALL_INCOMPATIBLE, "message"), map(PackageInstaller.STATUS_FAILURE_INCOMPATIBLE))
        assertEquals(InstallEvent.Failed(UpdateFailure.INSTALL_STORAGE, "message"), map(PackageInstaller.STATUS_FAILURE_STORAGE))
        assertEquals(InstallEvent.Failed(UpdateFailure.INSTALL_INVALID, "message"), map(PackageInstaller.STATUS_FAILURE_INVALID))
        assertEquals(InstallEvent.Failed(UpdateFailure.INSTALL_FAILED, "message"), map(PackageInstaller.STATUS_FAILURE))
        assertEquals(InstallEvent.Failed(UpdateFailure.INSTALL_FAILED, "message"), map(12345))
    }
}
