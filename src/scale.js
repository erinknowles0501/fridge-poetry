export const APP_WIDTH = 500;
export const APP_HEIGHT = 300;

export function scaleApp(appEl) {
    appEl.style.width = APP_WIDTH + "px";
    appEl.style.height = APP_HEIGHT + "px";

    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;

    const scale = { x: 1, y: 1 };

    if (clientHeight <= clientWidth) {
        // is landscape
        scale.x = clientWidth / APP_WIDTH;
        scale.y = clientHeight / APP_HEIGHT;

        appEl.style.rotate = "0deg";
        appEl.style.translate = "0px";
    } else {
        // is portrait
        scale.x = clientHeight / APP_WIDTH;
        scale.y = clientWidth / APP_HEIGHT;

        appEl.style.rotate = "90deg";
        appEl.style.translate = clientWidth + "px";
    }

    appEl.style.scale = scale.x + " " + scale.y;
    return scale;
}
