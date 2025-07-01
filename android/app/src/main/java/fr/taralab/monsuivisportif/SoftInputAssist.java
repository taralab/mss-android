package fr.taralab.monsuivisportif;

import android.app.Activity;
import android.graphics.Rect;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout;

public class SoftInputAssist {
    private View rootView;
    private ViewGroup contentContainer;
    private ViewTreeObserver viewTreeObserver;
    private final ViewTreeObserver.OnGlobalLayoutListener listener = this::possiblyResizeChildOfContent;
    private final Rect contentAreaOfWindowBounds = new Rect();
    private int usableHeightPrevious = 0;

    public SoftInputAssist(Activity activity) {
        contentContainer = activity.findViewById(android.R.id.content);
        rootView = contentContainer.getChildAt(0);
    }

    public void onPause() {
        if (viewTreeObserver != null && viewTreeObserver.isAlive()) {
            viewTreeObserver.removeOnGlobalLayoutListener(listener);
        }
    }

    public void onResume() {
        if (viewTreeObserver == null || !viewTreeObserver.isAlive()) {
            viewTreeObserver = rootView.getViewTreeObserver();
        }
        viewTreeObserver.addOnGlobalLayoutListener(listener);
    }

    public void onDestroy() {
        viewTreeObserver = null;
    }

    private void possiblyResizeChildOfContent() {
        contentContainer.getWindowVisibleDisplayFrame(contentAreaOfWindowBounds);
        int usableHeightNow = contentAreaOfWindowBounds.height();

        if (usableHeightNow != usableHeightPrevious) {
            FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) rootView.getLayoutParams();
            params.height = usableHeightNow;
            rootView.setLayoutParams(params);
            rootView.requestLayout();

            usableHeightPrevious = usableHeightNow;
        }
    }
}
