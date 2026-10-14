package com.leunos.ipinfo.web

/**
 * Reads the website's rendered background colour (a one-way native-to-page query: no bridge, nothing
 * is exposed to the page) so the native chrome and system bars can match the site's theme, which the
 * user switches inside the website.
 */
object ThemeSampler {
    /** Resolves any CSS colour syntax (including oklch) to sRGB through a 1x1 canvas. Returns "r,g,b,a". */
    const val SCRIPT = """(function(){try{
var p=function(v){var k=document.createElement('canvas');k.width=1;k.height=1;var x=k.getContext('2d');
x.fillStyle='#000';x.fillStyle=v;x.clearRect(0,0,1,1);x.fillRect(0,0,1,1);var d=x.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]];};
var b=document.body?getComputedStyle(document.body).backgroundColor:'';var a=b?p(b):[0,0,0,0];
if(a[3]===0){a=p(getComputedStyle(document.documentElement).backgroundColor);}
return a.join(',');}catch(e){return '';}})()"""

    /** Parses the value returned by `evaluateJavascript` (a JSON string such as `"10,10,10,255"`). */
    fun parse(jsResult: String?): Int? {
        val text = jsResult?.trim()?.removeSurrounding("\"") ?: return null
        val parts = text.split(',').map { it.trim().toIntOrNull() ?: return null }
        if (parts.size != 4 || parts.any { it !in 0..255 } || parts[3] == 0) return null
        return (0xFF shl 24) or (parts[0] shl 16) or (parts[1] shl 8) or parts[2]
    }

    fun isLight(argb: Int): Boolean {
        val r = (argb shr 16) and 0xFF
        val g = (argb shr 8) and 0xFF
        val b = argb and 0xFF
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255.0 > 0.5
    }
}

/** Neutral palette mirroring the website's light and dark tokens (see app/globals.css). */
data class ChromePalette(
    val background: Int,
    val foreground: Int,
    val muted: Int,
    val primary: Int,
    val onPrimary: Int,
    val border: Int,
    val isLight: Boolean,
) {
    companion object {
        private const val LIGHT_FOREGROUND = 0xFF0A0A0A.toInt()
        private const val DARK_FOREGROUND = 0xFFFAFAFA.toInt()

        fun forBackground(background: Int): ChromePalette =
            if (ThemeSampler.isLight(background)) {
                ChromePalette(background, LIGHT_FOREGROUND, 0xFF737373.toInt(), 0xFF171717.toInt(), 0xFFFAFAFA.toInt(), 0xFFE5E5E5.toInt(), true)
            } else {
                ChromePalette(background, DARK_FOREGROUND, 0xFFA3A3A3.toInt(), 0xFFFAFAFA.toInt(), 0xFF171717.toInt(), 0xFF2E2E2E.toInt(), false)
            }

        /** The website's default theme is dark. */
        val DEFAULT_BACKGROUND: Int = 0xFF0A0A0A.toInt()
    }
}
