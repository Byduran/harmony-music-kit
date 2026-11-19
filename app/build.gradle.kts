plugins {
    id("com.android.application")
}

android {
    namespace = "com.harmonylab.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.harmonylab.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 33
        versionName = "0.9.30"
    }

    sourceSets.getByName("main").assets.setSrcDirs(listOf("../web"))

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
