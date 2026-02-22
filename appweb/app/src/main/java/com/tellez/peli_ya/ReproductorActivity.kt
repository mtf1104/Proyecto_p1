package com.tellez.peli_ya

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.tellez.peli_ya.databinding.ActivityReproductorBinding

class ReproductorActivity : AppCompatActivity() {

    private lateinit var binding: ActivityReproductorBinding

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityReproductorBinding.inflate(layoutInflater)

        // 1. MODO INMERSIVO: Oculta barras de estado y navegación para usar toda la pantalla
        supportActionBar?.hide()
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY)

        setContentView(binding.root)

        // 2. CONFIGURACIÓN DEL WEBVIEW PARA VIDEO
        binding.wvReproductor.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            mediaPlaybackRequiresUserGesture = false
        }

        binding.wvReproductor.webViewClient = WebViewClient()
        binding.wvReproductor.webChromeClient = WebChromeClient()

        val urlVideo = intent.getStringExtra("URL_VIDEO") ?: ""

        // 3. INYECCIÓN DE REPRODUCTOR RESPONSIVO (Soluciona el video cortado y el scroll)
        if (urlVideo.contains("watch?v=")) {
            val videoId = urlVideo.split("v=")[1].split("&")[0]

            // Este HTML fuerza al video a llenar la pantalla y bloquea el scroll externo
            val htmlData = """
                <html>
                <style>
                    body { margin: 0; background: black; overflow: hidden; }
                    .video-container { position: relative; width: 100vw; height: 100vh; }
                    iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                </style>
                <body>
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/$videoId?autoplay=1&controls=1&modestbranding=1&rel=0&fs=0" 
                                frameborder="0" allowfullscreen></iframe>
                    </div>
                </body>
                </html>
            """.trimIndent()

            binding.wvReproductor.loadData(htmlData, "text/html", "utf-8")
        } else {
            binding.wvReproductor.loadUrl(urlVideo)
        }

        // Manejar regreso a la cartelera
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { finish() }
        })
    }
}