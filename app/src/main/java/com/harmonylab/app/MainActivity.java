package com.harmonylab.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.res.Configuration;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.view.WindowInsetsController;
import android.view.View;
import android.view.WindowInsets;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private WebView webView;
    private FrameLayout root;
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Put safe-area padding on the native ROOT, not inside the WebView.
        // Android 15 (target SDK 35) enforces edge-to-edge windows.
        root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        // Only after setContentView: on Android 15 the window's insets controller needs the decor view.
        applyBars(Color.rgb(16,24,39), Color.rgb(20,31,48), false); // Midnight Jazz dark until the page reports its theme
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        root.requestApplyInsets();
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        webView.addJavascriptInterface(new Object(){
            @JavascriptInterface public boolean isDarkMode(){
                return (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
            }
            // Called by the page whenever its theme changes: colors behind the status/navigation bars follow the app.
            @JavascriptInterface public void setBars(String top, String bottom, boolean light){
                try {
                    final int t = Color.parseColor(top), b = Color.parseColor(bottom);
                    runOnUiThread(() -> applyBars(t, b, light));
                } catch (IllegalArgumentException ignored) { }
            }
        }, "AndroidAppearance");
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");
    }
    @SuppressWarnings("deprecation")
    private void applyBars(int top, int bottom, boolean light) {
        if (root == null) return;
        // The WebView covers the middle; the root's top and bottom padding show behind the system bars.
        root.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, new int[]{top, top, bottom, bottom}));
        getWindow().setStatusBarColor(top);       // ignored on Android 15+ (edge-to-edge), used on older versions
        getWindow().setNavigationBarColor(bottom);
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getDecorView().getWindowInsetsController();
            if (c != null) {
                int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                c.setSystemBarsAppearance(light ? mask : 0, mask);
            }
        } else if (android.os.Build.VERSION.SDK_INT >= 23) {
            View d = getWindow().getDecorView();
            int flags = d.getSystemUiVisibility();
            int lightFlags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | (android.os.Build.VERSION.SDK_INT >= 26 ? View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : 0);
            d.setSystemUiVisibility(light ? (flags | lightFlags) : (flags & ~lightFlags));
        }
    }
    @Override protected void onResume(){super.onResume();if(webView!=null)webView.evaluateJavascript("if(window.refreshHarmonyAppearance)window.refreshHarmonyAppearance()",null);}
    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
