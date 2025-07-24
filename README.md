# FEDevHelper

> **A comprehensive Chrome extension designed for front-end developers to enhance productivity and streamline workflows.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/akarindt/FEDevHelper)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chromewebstore.google.com/detail/FEDevHelper/baeclcblbbhhmpjmglcpnpoagnmfiahn)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Overview

FEDevHelper is a powerful Chrome extension that provides essential tools for front-end developers. Whether you're debugging, analyzing performance, or working with APIs, this extension offers a comprehensive suite of utilities right in your browser.

## Features

### Font Detector

- Identify fonts used on any webpage
- Get detailed font family information
- Perfect for design analysis and inspiration

### Load Time Checker

- Measure website loading performance
- Get detailed timing metrics
- Optimize your web applications based on real data

### URI Encoder/Decoder

- Encode and decode URIs with ease
- Handle special characters and URL parameters
- Essential for API development and debugging

### Color Picker

- Pick colors from any webpage
- Get color values in multiple formats (HEX, RGB, HSL)
- Build consistent color palettes

### JSON Formatter

- Format, minify, and validate JSON data
- Syntax highlighting for better readability
- Perfect for API response analysis

### Lighthouse Test

- Quick website performance analysis
- Built-in Lighthouse integration
- Get actionable insights for optimization

### Ruler Tool

- Measure elements on any webpage
- Get precise height and width measurements
- Perfect for design verification and layout debugging

### Fetch Tool

- Make HTTP requests directly from the extension
- Postman-like functionality in your browser
- Works with localhost for local development
- Test APIs without leaving your current tab

## Installation

### From Chrome Web Store (Recommended)

[![Install from Chrome Web Store](https://img.shields.io/badge/Install-Chrome%20Web%20Store-blue.svg)](https://chromewebstore.google.com/detail/FEDevHelper/baeclcblbbhhmpjmglcpnpoagnmfiahn)

**[Install FEDevHelper from Chrome Web Store](https://chromewebstore.google.com/detail/FEDevHelper/baeclcblbbhhmpjmglcpnpoagnmfiahn)**

### Manual Installation (Developer Mode)

1. **Clone the repository:**

    ```bash
    git clone https://github.com/akarindt/FEDevHelper.git
    cd FEDevHelper
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Load the extension in Chrome:**
    - Open Chrome and navigate to `chrome://extensions/`
    - Enable "Developer mode" in the top right corner
    - Click "Load unpacked" and select the project folder
    - The extension will appear in your Chrome toolbar

## Usage

1. **Access the extension:** Click on the FEDevHelper icon in your Chrome toolbar
2. **Select a tool:** Choose from the available tools in the popup
3. **Use the feature:** Each tool opens in a dedicated interface with intuitive controls

### Tool-Specific Usage

- **Font Detector:** Click the tool and hover over text elements to see font information
- **Load Time Checker:** Click to analyze the current page's loading performance
- **URI Encoder/Decoder:** Paste your URI and choose encode or decode
- **Color Picker:** Click and select any color on the webpage
- **JSON Formatter:** Paste JSON data to format, minify, or validate
- **Lighthouse Test:** Run a quick performance audit on the current page
- **Ruler Tool:** Click and drag to measure elements on the page
- **Fetch Tool:** Configure and send HTTP requests with full control

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser

### Setup Development Environment

1. **Clone and install:**

    ```bash
    git clone https://github.com/akarindt/FEDevHelper.git
    cd FEDevHelper
    npm install
    ```

2. **Format code:**

    ```bash
    npm run format
    ```

3. **Load extension in Chrome:**
    - Follow the manual installation steps above
    - Make changes to the code
    - Reload the extension in `chrome://extensions/`

### Tech Stack

- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No frameworks, pure performance
- **CSS3** - Modern styling with custom properties
- **Chrome APIs** - Full integration with browser capabilities

## Project Structure

```
FEDevHelper/
├── assets/                 # Static assets
│   ├── fonts/             # Custom fonts (OpenSans family)
│   ├── icons/             # Extension icons (16, 32, 48, 128px)
│   └── styles/            # Global stylesheets
├── popup/                 # Main extension popup
│   ├── popup.html         # Main popup interface
│   ├── popup.css          # Popup styling
│   ├── popup.js           # Popup functionality
│   └── popup*/            # Individual tool popups
├── scripts/               # Content scripts
│   ├── checkLoadTime.js   # Load time analysis
│   ├── fontDetector.js    # Font detection
│   └── ruler.js           # Measurement tool
├── manifest.json          # Extension manifest
├── package.json           # Node.js configuration
└── LICENSE               # MIT license
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
    ```bash
    git checkout -b feature/amazing-feature
    ```
3. **Commit your changes:**
    ```bash
    git commit -m 'Add some amazing feature'
    ```
4. **Push to the branch:**
    ```bash
    git push origin feature/amazing-feature
    ```
5. **Open a Pull Request**

### Code Style

- Use Prettier for code formatting (`npm run format`)
- Follow existing naming conventions
- Add comments for complex functionality
- Test your changes thoroughly

### Reporting Issues

- Use the GitHub issue tracker
- Provide detailed reproduction steps
- Include browser version and extension version
- Screenshots are helpful for UI issues

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Akari** - [@akarindt](https://github.com/akarindt)

---

<div align="center">
  <p>Made with ❤️ for the front-end developer community</p>
  <p>If you find this extension helpful, please consider giving it a ⭐ on GitHub!</p>
</div>
