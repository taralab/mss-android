package fr.taralab.monsuivisportif;

import android.app.Activity;
import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout;

public class SoftInputAssist {
    private final View rootView;
    private final ViewGroup contentContainer;
    private ViewTreeObserver viewTreeObserver;
    private final ViewTreeObserver.OnGlobalLayoutListener listener = this::possiblyResizeChildOfContent;
    private final Rect contentAreaOfWindowBounds = new Rect();
    private int usableHeightPrevious = 0;

    public SoftInputAssist(Activity activity) {
        contentContainer = activity.findViewById(android.R.id.content);
        rootView = contentContainer.getChildAt(0);
    }

    public void onResume() {
        if (viewTreeObserver == null || !viewTreeObserver.isAlive()) {
            viewTreeObserver = rootView.getViewTreeObserver();
        }
        viewTreeObserver.addOnGlobalLayoutListener(listener);
    }

    public void onPause() {
        if (viewTreeObserver != null && viewTreeObserver.isAlive()) {
            viewTreeObserver.removeOnGlobalLayoutListener(listener);
        }
    }

    public void onDestroy() {
        viewTreeObserver = null;
    }

    private void possiblyResizeChildOfContent() {
        // Obtenir la zone visible de la fenêtre (sans le clavier)
        contentContainer.getWindowVisibleDisplayFrame(contentAreaOfWindowBounds);
        int usableHeightNow = contentAreaOfWindowBounds.height();

        // Hauteur totale de la fenêtre (incluant status bar)
        int totalHeight = rootView.getRootView().getHeight();

        // Calculer la différence pour détecter le clavier
        int heightDifference = totalHeight - usableHeightNow;
        boolean isKeyboardVisible = heightDifference > (totalHeight / 4);

        if (usableHeightNow != usableHeightPrevious) {
            FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) rootView.getLayoutParams();

            if (isKeyboardVisible) {
                // Clavier affiché : ajuster à la zone visible
                params.height = usableHeightNow;
            } else {
                // Clavier caché : rétablir hauteur totale
                params.height = FrameLayout.LayoutParams.MATCH_PARENT;
            }

            rootView.setLayoutParams(params);
            rootView.requestLayout();
            usableHeightPrevious = usableHeightNow;
        }
    }
}
