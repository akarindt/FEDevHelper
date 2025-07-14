const loadFonts = () => {
    const currentURLAnchor = document.getElementById("popup-font__url");
    const loadingDiv = document.getElementById("popup-font__loading");
    const fontListDivContainer = document.getElementById("popup-font__list-container");
    const noFontsDiv = document.getElementById("popup-font__no-fonts");
    const storedFonts = localStorage.getItem("detectedFonts");

    if (storedFonts) {
        try {
            const data = JSON.parse(storedFonts);
            const fonts = data.fonts;
            currentURLAnchor.textContent = data.url;
            currentURLAnchor.setAttribute("href", data.url);
            currentURLAnchor.setAttribute("target", "_blank");

            if (fonts && fonts.length > 0) {
                displayFonts(fonts);
                fontListDivContainer.style.display = "flex";
                loadingDiv.style.display = "none";
                return;
            }
            noFontsDiv.style.display = "block";
        } catch (error) {
            noFontsDiv.style.display = "block";
        }

        loadingDiv.style.display = "none";
        return;
    }
};

const displayFonts = fonts => {
    const fontListEl = document.getElementById("popup-font__list");
    const uniqueFonts = [...new Set(fonts)].sort();

    uniqueFonts.forEach(font => {
        const fontItem = document.createElement("span");
        fontItem.className = "popup-font__detail";
        fontItem.textContent = font;
        fontListEl.appendChild(fontItem);
    });

    const copyButton = document.getElementById("popup-font__button--copy");
    copyButton.addEventListener("click", () => {
        const cssText = "font-family: ";
        const fontDeclarations = uniqueFonts
            .map(font => (font.includes(" ") ? `"${font}"` : font))
            .join(", ");
        navigator.clipboard.writeText(cssText + fontDeclarations + ";").catch(err => {
            console.error("Failed to copy text: ", err);
        });
    });
};

document.addEventListener("DOMContentLoaded", loadFonts);
