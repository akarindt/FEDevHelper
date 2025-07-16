// Color picker functionality - DOM elements
let colorPicker, preview, hexInput, rgbInput, hslInput, rgbaInput;
let opacitySlider, opacityValue, randomBtn, copyAllBtn, copyButtons, paletteItems;

// Initialize DOM elements
const initElements = () => {
    colorPicker = document.getElementById("popup-color__picker");
    preview = document.getElementById("popup-color__preview");
    hexInput = document.getElementById("popup-color__hex");
    rgbInput = document.getElementById("popup-color__rgb");
    hslInput = document.getElementById("popup-color__hsl");
    rgbaInput = document.getElementById("popup-color__rgba");
    opacitySlider = document.getElementById("popup-color__opacity");
    opacityValue = document.getElementById("popup-color__opacity-value");
    randomBtn = document.getElementById("popup-color__random-btn");
    copyAllBtn = document.getElementById("popup-color__copy-all-btn");
    copyButtons = document.querySelectorAll(".popup-color__copy-btn");
    paletteItems = document.querySelectorAll(".popup-color__palette-item");
};

// Bind event listeners
const bindEvents = () => {
    // Color picker change event
    colorPicker.addEventListener("input", e => {
        updateColorValues(e.target.value);
    });

    // Opacity slider change event
    opacitySlider.addEventListener("input", e => {
        updateOpacity(parseFloat(e.target.value));
    });

    // Random color button
    randomBtn.addEventListener("click", () => {
        generateRandomColor();
    });

    // Copy all values button
    copyAllBtn.addEventListener("click", () => {
        copyAllValues();
    });

    // Individual copy buttons
    copyButtons.forEach(btn => {
        btn.addEventListener("click", e => {
            const type = e.target.getAttribute("data-copy");
            copyValue(type, e.target);
        });
    });

    // Palette items
    paletteItems.forEach(item => {
        item.addEventListener("click", e => {
            const color = e.target.getAttribute("data-color");
            setColor(color);
            updatePaletteSelection(e.target);
        });
    });
};

// Convert hex to RGB
const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

// Convert RGB to HSL
const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
        s,
        l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
};

// Update color values in all formats
const updateColorValues = hex => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const opacity = parseFloat(opacitySlider.value);

    // Update inputs
    hexInput.value = hex.toUpperCase();
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    rgbaInput.value = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;

    // Update preview
    preview.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;

    // Update opacity slider background
    opacitySlider.style.background = `linear-gradient(to right, 
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0), 
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1))`;

    // Update color picker value
    colorPicker.value = hex;
};

// Update opacity value and RGBA
const updateOpacity = opacity => {
    const opacityPercent = Math.round(opacity * 100);
    opacityValue.textContent = `${opacityPercent}%`;

    const rgb = hexToRgb(colorPicker.value);
    if (rgb) {
        rgbaInput.value = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        preview.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }
};

// Set color from hex value
const setColor = hex => {
    colorPicker.value = hex;
    updateColorValues(hex);
};

// Update palette selection
const updatePaletteSelection = selectedItem => {
    paletteItems.forEach(item => item.classList.remove("selected"));
    selectedItem.classList.add("selected");
};

// Generate random color
const generateRandomColor = () => {
    const randomHex =
        "#" +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0");
    setColor(randomHex);

    // Clear palette selection
    paletteItems.forEach(item => item.classList.remove("selected"));
};

// Copy individual color value
const copyValue = async (type, button) => {
    let value = "";

    switch (type) {
        case "hex":
            value = hexInput.value;
            break;
        case "rgb":
            value = rgbInput.value;
            break;
        case "hsl":
            value = hslInput.value;
            break;
        case "rgba":
            value = rgbaInput.value;
            break;
    }

    try {
        await navigator.clipboard.writeText(value);
        showCopyFeedback(button);
    } catch (err) {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(value);
        showCopyFeedback(button);
    }
};

// Copy all color values
const copyAllValues = async () => {
    const allValues = `HEX: ${hexInput.value}
RGB: ${rgbInput.value}
HSL: ${hslInput.value}
RGBA: ${rgbaInput.value}`;

    try {
        await navigator.clipboard.writeText(allValues);
        showCopyFeedback(copyAllBtn, "All values copied!");
    } catch (err) {
        fallbackCopyTextToClipboard(allValues);
        showCopyFeedback(copyAllBtn, "All values copied!");
    }
};

// Fallback copy method for older browsers
const fallbackCopyTextToClipboard = text => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand("copy");
    } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
};

// Show copy feedback
const showCopyFeedback = (button, customText = null) => {
    const originalText = button.textContent;
    const originalHTML = button.innerHTML;

    button.classList.add("copied");

    if (customText) {
        button.textContent = customText;
    } else {
        button.innerHTML = "✓";
    }

    setTimeout(() => {
        button.classList.remove("copied");
        if (customText) {
            button.textContent = originalText;
        } else {
            button.innerHTML = originalHTML;
        }
    }, 1500);
};

// Initialize color picker
const initColorPicker = () => {
    initElements();
    bindEvents();
    updateColorValues(colorPicker.value);
};

// Initialize color picker when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initColorPicker();
});

// Keyboard shortcuts
document.addEventListener("keydown", e => {
    // Ctrl/Cmd + R for random color
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        document.getElementById("popup-color__random-btn").click();
    }

    // Ctrl/Cmd + A for copy all
    if ((e.ctrlKey || e.metaKey) && e.key === "a" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("popup-color__copy-all-btn").click();
    }
});
