# EPUB Reader Pro

A lightweight, browser-based EPUB reader with advanced features for managing and reading digital books. Built with vanilla JavaScript for maximum compatibility and performance.

## Features

### Library Management
- Upload and manage multiple EPUB files
- Automatic book metadata extraction (title, author, etc.)
- Persistent storage using browser localStorage
- Quick book switching and organization
- Reading progress tracking per book

### Reading Experience
- **Paginated View**: Traditional page-by-page reading with smooth transitions
- **Continuous View**: Scroll through entire chapters seamlessly
- Intelligent content parsing and pagination
- Chapter navigation with table of contents
- Responsive design for desktop and mobile

### Text Highlighting
- Multi-color highlighting system (yellow, blue, green)
- Context menu for quick highlight actions
- Highlights panel for reviewing marked passages
- Jump to highlighted text with one click
- Copy text selections to clipboard

### Keyboard Navigation
```
Navigation:
← / →          Previous/Next page
Space          Next page
Shift+Space    Previous page
Home / End     First/Last chapter
Page Up/Down   Previous/Next page

Books:
Ctrl+← / →     Switch between books
Ctrl+O         Open file dialog
L              Toggle library panel

View:
V              Toggle view mode
H              Show/hide highlights
D              Toggle debug panel
?              Show keyboard shortcuts
Esc            Close modals
```

## Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- No server required - runs entirely in the browser

### Installation
1. Download or clone the project files
2. Open `index.html` in your web browser
3. Start uploading EPUB files to build your library

### File Structure
```
epub-reader-pro/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and layout
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## Usage

### Adding Books
- **Drag & Drop**: Drag EPUB files directly onto the upload area
- **File Browser**: Click the upload area to open file selection dialog
- **Multiple Files**: Select multiple EPUB files at once for batch upload

### Reading
1. Select a book from your library panel
2. Use navigation controls or keyboard shortcuts to move through pages
3. Click on table of contents entries to jump to specific chapters
4. Switch between paginated and continuous reading modes as needed

### Highlighting
1. Select text while reading
2. Right-click to open context menu
3. Choose highlight color or copy text
4. View all highlights in the highlights panel
5. Click on highlights to jump to their location

### Data Management
All reading data is automatically saved to your browser's localStorage:
- Book files and metadata
- Reading positions for each book
- Text highlights and notes
- User preferences and settings

## Browser Compatibility

Tested and supported on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Details

### Dependencies
- [JSZip](https://stuk.github.io/jszip/) - EPUB file extraction
- [Font Awesome](https://fontawesome.com/) - Icons
- [Google Fonts](https://fonts.google.com/) - Typography (Inter, Crimson Text)

### EPUB Support
Supports EPUB 2.0 and 3.0 formats with:
- XHTML content parsing
- Metadata extraction from OPF files
- Table of contents from NCX files
- Fallback TOC generation
- Image handling (basic support)

### Storage
Uses browser localStorage for data persistence:
- Book content and metadata
- Reading positions
- Highlights and annotations
- User preferences

**Note**: localStorage has size limitations (typically 5-10MB). For large libraries, consider the browser's storage capacity.

## Development

### Architecture
The application follows a modular class-based architecture:

- **EPUBReaderPro**: Main application class
- **Book Management**: Library operations and metadata handling
- **Reading Engine**: Content parsing, pagination, and rendering
- **UI Controller**: User interface and interaction handling
- **Storage Manager**: Data persistence and retrieval

### Debugging
Built-in debug panel provides:
- Real-time application logging
- Performance monitoring
- Error tracking and reporting
- EPUB parsing details

Toggle debug panel with `D` key or click the bug icon.

## Contributing

Feel free to submit issues and enhancement requests. When contributing:

1. Follow existing code style and conventions
2. Test across multiple browsers
3. Include debug logging for new features
4. Update documentation as needed

## Known Limitations

- **Image Support**: Basic image handling - complex layouts may not render perfectly
- **Storage Size**: Limited by browser localStorage capacity
- **DRM**: No support for DRM-protected EPUB files
- **Complex Layouts**: Advanced CSS layouts in EPUBs may not display correctly

## License

This project is open source. Feel free to use, modify, and distribute as needed.

## Changelog

### v1.0.0
- Initial release with core reading functionality
- Multi-book library management
- Text highlighting system
- Keyboard navigation
- Responsive design
- Debug panel and logging

---

*Built for readers who want a clean, fast, and feature-rich EPUB reading experience without the bloat.*
