package com.leunos.ipinfo.util

import java.io.File
import java.io.InputStream
import java.security.MessageDigest

object Hex {
    private val DIGITS = "0123456789abcdef".toCharArray()

    fun encode(bytes: ByteArray): String {
        val out = CharArray(bytes.size * 2)
        for (i in bytes.indices) {
            val v = bytes[i].toInt() and 0xFF
            out[i * 2] = DIGITS[v ushr 4]
            out[i * 2 + 1] = DIGITS[v and 0x0F]
        }
        return String(out)
    }

    /** True for exactly 64 lowercase hexadecimal characters. */
    fun isSha256(value: String): Boolean =
        value.length == 64 && value.all { it in '0'..'9' || it in 'a'..'f' }
}

object Sha256 {
    fun newDigest(): MessageDigest = MessageDigest.getInstance("SHA-256")

    fun hex(bytes: ByteArray): String = Hex.encode(newDigest().digest(bytes))

    fun hex(file: File): String = file.inputStream().use { hex(it) }

    fun hex(input: InputStream): String {
        val digest = newDigest()
        val buffer = ByteArray(64 * 1024)
        while (true) {
            val read = input.read(buffer)
            if (read < 0) break
            digest.update(buffer, 0, read)
        }
        return Hex.encode(digest.digest())
    }
}
