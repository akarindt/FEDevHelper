(() => {
    const getFonts = () => {
        const fontSet = new Set();
        const elements = document.querySelectorAll("*");

        elements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const fontFamily = computedStyle.getPropertyValue("font-family");
            if (fontFamily) {
                const fonts = fontFamily.split(",").map(font => font.trim().replace(/['"]/g, ""));
                fonts.forEach(font => fontSet.add(font));
            }
        });

        return Array.from(fontSet);
    };

    chrome.runtime.sendMessage({ fonts: getFonts() });
})();
