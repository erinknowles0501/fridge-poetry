export const APP_WIDTH = 500;
export const APP_HEIGHT = 300;

export function scaleApp(appEl) {
    appEl.style.width = APP_WIDTH + "px";
    appEl.style.height = APP_HEIGHT + "px";

    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    const UISize = 50; // TODO: De-magic this. Currently 50px is the width in landscape, and the height in portrait

    const scale = { x: 1, y: 1, isPortrait: false };

    if (clientHeight <= clientWidth) {
        // is landscape
        scale.x = (clientWidth - UISize) / APP_WIDTH;
        scale.y = clientHeight / APP_HEIGHT;
        scale.isPortrait = false;

        appEl.style.rotate = "0deg";
        appEl.style.translate = "0px";
        document.body.style.marginLeft = `${UISize}px`;
        document.body.style.marginTop = 0;
    } else {
        // is portrait
        scale.x = (clientHeight - UISize) / APP_WIDTH;
        scale.y = clientWidth / APP_HEIGHT;
        scale.isPortrait = true;

        appEl.style.rotate = "90deg";
        appEl.style.translate = clientWidth + "px";
        document.body.style.marginLeft = 0;
        document.body.style.marginTop = `${UISize}px`;
    }

    appEl.style.scale = scale.x + " " + scale.y;
    return scale;
}
