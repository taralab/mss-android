package fr.taralab.monsuivisportif;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private SoftInputAssist softInputAssist;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        softInputAssist = new SoftInputAssist(this);
        softInputAssist.onResume();
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
