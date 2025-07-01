package fr.taralab.monsuivisportif;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private SoftInputAssist softInputAssist;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Empêche le contenu d’aller sous la status bar (important pour les Samsung récents)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // Initialise le gestionnaire de resize pour le clavier
        softInputAssist = new SoftInputAssist(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        if (softInputAssist != null) {
            softInputAssist.onResume();
        }
    }

    @Override
    public void onPause() {
        if (softInputAssist != null) {
            softInputAssist.onPause();
        }
        super.onPause();
    }

    @Override
    public void onDestroy() {
        if (softInputAssist != null) {
            softInputAssist.onDestroy();
        }
        super.onDestroy();
    }
}
