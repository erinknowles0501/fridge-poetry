export default function scaleApp(appEl) {
    const contentWidth = 500;
    const contentHeight = 300;
    appEl.style.width = contentWidth + "px";
    appEl.style.height = contentHeight + "px";

    const availableWidth = document.documentElement.clientWidth;
    const availableHeight = document.documentElement.clientHeight;

    const scale = { x: 1, y: 1 };

    if (availableHeight <= availableWidth) {
        // is landscape
        scale.x = availableWidth / contentWidth;
        scale.y = availableHeight / contentHeight;

        appEl.style.rotate = "0deg";
        appEl.style.translate = "0px";
    } else {
        // is portrait
        scale.x = availableHeight / contentWidth;
        scale.y = availableWidth / contentHeight;

        appEl.style.rotate = "90deg";
        appEl.style.translate = availableWidth + "px";
    }

    appEl.style.scale = scale.x + " " + scale.y;
    return scale;
}
