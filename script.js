class EPUBReaderPro {
    constructor() {
        // Core properties
        this.books = new Map();
        this.currentBookId = null;
        this.currentChapterIndex = 0;
        this.currentPageIndex = 0;
        this.pages = [];
        this.highlights = new Map();
        this.debugLogs = [];
        this.isDebugOpen = false;
        this.isLibraryOpen = true;
        this.isHighlightsOpen = false;
        this.viewMode = 'paginated'; // 'paginated' or 'continuous'
        this.currentSelection = null;

        // Initialize
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadSavedData();
        this.initializeDebugPanel();
        this.debug('EPUB Reader Pro initialized', 'success');
    }

    initializeElements() {
        // File upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');

        // UI elements
        this.bookTitle = document.getElementById('bookTitle');
        this.bookAuthor = document.getElementById('bookAuthor');
        this.bookCount = document.getElementById('bookCount');
        this.libraryList = document.getElementById('libraryList');
        this.tocList = document.getElementById('tocList');

        // Reading area elements
        this.readingArea = document.getElementById('readingArea');
        this.pageView = document.getElementById('pageView');
        this.continuousView = document.getElementById('continuousView');
        this.pageContainer = document.getElementById('pageContainer');
        this.continuousContent = document.getElementById('continuousContent');

        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');

        // Navigation elements
        this.prevChapterBtn = document.getElementById('prevChapter');
        this.nextChapterBtn = document.getElementById('nextChapter');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');

        // Control elements
        this.addBookBtn = document.getElementById('addBookBtn');
        this.libraryBtn = document.getElementById('libraryBtn');
        this.viewModeBtn = document.getElementById('viewModeBtn');
        this.viewModeText = document.getElementById('viewModeText');
        this.highlightsBtn = document.getElementById('highlightsBtn');
        this.settingsBtn = document.getElementById('settingsBtn');

        // Modal and panel elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.highlightsPanel = document.getElementById('highlightsPanel');
        this.highlightsList = document.getElementById('highlightsList');
        this.shortcutsModal = document.getElementById('shortcutsModal');
        this.contextMenu = document.getElementById('contextMenu');

        // Debug elements
        this.debugPanel = document.getElementById('debugPanel');
        this.debugContent = document.getElementById('debugContent');
        this.debugToggle = document.getElementById('debugToggle');
        this.shortcutsToggle = document.getElementById('shortcutsToggle');

        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }

    setupEventListeners() {
        // File upload events
        this.addBookBtn.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Upload first book button
        const uploadFirstBook = document.getElementById('uploadFirstBook');
        if (uploadFirstBook) {
            uploadFirstBook.addEventListener('click', () => this.fileInput.click());
        }

        // Drag and drop
        this.setupDragAndDrop();

        // Navigation events
        this.prevChapterBtn.addEventListener('click', () => this.previousChapter());
        this.nextChapterBtn.addEventListener('click', () => this.nextChapter());
        this.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());

        // Control events
        this.libraryBtn.addEventListener('click', () => this.toggleLibrary());
        this.viewModeBtn.addEventListener('click', () => this.toggleViewMode());
        this.highlightsBtn.addEventListener('click', () => this.toggleHighlights());

        // Debug and shortcuts
        this.debugToggle.addEventListener('click', () => this.toggleDebugPanel());
        this.shortcutsToggle.addEventListener('click', () => this.showShortcuts());

        // Modal close events
        document.getElementById('closeHighlights')?.addEventListener('click', () => this.toggleHighlights());
        document.getElementById('closeShortcuts')?.addEventListener('click', () => this.hideShortcuts());
        document.getElementById('clearDebug')?.addEventListener('click', () => this.clearDebugLogs());

        // Text selection events
        document.addEventListener('mouseup', (e) => this.handleTextSelection(e));
        document.addEventListener('click', (e) => this.hideContextMenu(e));

        // Context menu events
        this.setupContextMenuEvents();

        // Window events
        window.addEventListener('beforeunload', () => this.saveData());
        window.addEventListener('resize', () => this.handleResize());
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('dragover');
            });
        });

        this.uploadArea.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files).filter(file =>
                file.name.endsWith('.epub')
            );
            if (files.length > 0) {
                this.handleFileSelect(files);
            }
        });
    }

    setupContextMenuEvents() {
        document.getElementById('highlightYellow')?.addEventListener('click', () => {
            this.addHighlight('yellow');
        });

        document.getElementById('highlightBlue')?.addEventListener('click', () => {
            this.addHighlight('blue');
        });

        document.getElementById('highlightGreen')?.addEventListener('click', () => {
            this.addHighlight('green');
        });

        document.getElementById('removeHighlight')?.addEventListener('click', () => {
            this.removeHighlight();
        });

        document.getElementById('copyText')?.addEventListener('click', () => {
            this.copySelectedText();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't handle shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const { key, ctrlKey, shiftKey, altKey } = e;

            // Navigation shortcuts
            if (!ctrlKey && !altKey) {
                switch (key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousPage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextPage();
                        break;
                    case ' ':
                        e.preventDefault();
                        if (shiftKey) {
                            this.previousPage();
                        } else {
                            this.nextPage();
                        }
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goToChapter(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.goToChapter(this.getCurrentBook()?.chapters?.length - 1 || 0);
                        break;
                    case 'PageUp':
                        e.preventDefault();
                        this.previousPage();
                        break;
                    case 'PageDown':
                        e.preventDefault();
                        this.nextPage();
                        break;
                }
            }

            // Book navigation shortcuts
            if (ctrlKey && !altKey) {
                switch (key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.switchToPreviousBook();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.switchToNextBook();
                        break;
                    case 'o':
                    case 'O':
                        e.preventDefault();
                        this.fileInput.click();
                        break;
                }
            }

            // UI shortcuts (no modifiers)
            if (!ctrlKey && !altKey && !shiftKey) {
                switch (key.toLowerCase()) {
                    case 'l':
                        e.preventDefault();
                        this.toggleLibrary();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.toggleViewMode();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.toggleHighlights();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleDebugPanel();
                        break;
                    case '?':
                        e.preventDefault();
                        this.showShortcuts();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.hideModals();
                        break;
                }
            }
        });
    }

    // === CORE FUNCTIONALITY ===

    async handleFileSelect(files) {
        if (!files || files.length === 0) return;

        this.showLoading('Processing EPUB files...', `0/${files.length}`);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                this.showLoading(`Processing ${file.name}...`, `${i + 1}/${files.length}`);
                await this.processEPUBFile(file);
            }

            this.hideLoading();
            this.updateLibraryDisplay();
            this.saveData();

            // Switch to the first uploaded book if no book is currently selected
            if (!this.currentBookId && this.books.size > 0) {
                const firstBookId = Array.from(this.books.keys())[0];
                this.switchToBook(firstBookId);
            }

            this.showToast(`Successfully added ${files.length} book(s)`, 'success');

        } catch (error) {
            this.hideLoading();
            this.debug(`Error processing files: ${error.message}`, 'error');
            this.showToast(`Error processing files: ${error.message}`, 'error');
        }
    }

    async processEPUBFile(file) {
        try {
            const bookId = this.generateBookId();
            this.debug(`Processing EPUB: ${file.name} (ID: ${bookId})`);

            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);

            const book = await this.parseEPUB(zip, file.name, bookId);
            this.books.set(bookId, book);

            this.debug(`Successfully processed: ${book.metadata.title}`, 'success');

        } catch (error) {
            this.debug(`Failed to process ${file.name}: ${error.message}`, 'error');
            throw error;
        }
    }

    async parseEPUB(zip, filename, bookId) {
        // Find container.xml
        const containerFile = zip.file('META-INF/container.xml');
        if (!containerFile) {
            throw new Error('Invalid EPUB: Missing container.xml');
        }

        const containerXML = await containerFile.async('text');
        const parser = new DOMParser();
        const containerDoc = parser.parseFromString(containerXML, 'text/xml');
        const rootfile = containerDoc.querySelector('rootfile');
        const opfPath = rootfile.getAttribute('full-path');

        // Parse OPF file
        const opfFile = zip.file(opfPath);
        const opfXML = await opfFile.async('text');
        const opfDoc = parser.parseFromString(opfXML, 'text/xml');

        // Extract metadata
        const metadata = this.extractMetadata(opfDoc);

        // Extract spine and chapters
        const chapters = await this.extractChapters(opfDoc, zip, opfPath);

        // Extract table of contents
        await this.extractTOC(opfDoc, zip, opfPath, chapters);

        const book = {
            id: bookId,
            filename: filename,
            metadata: metadata,
            chapters: chapters,
            currentChapter: 0,
            currentPage: 0,
            highlights: new Map(),
            dateAdded: new Date().toISOString(),
            lastRead: new Date().toISOString()
        };

        return book;
    }

    extractMetadata(opfDoc) {
        const metadata = opfDoc.querySelector('metadata');

        return {
            title: metadata.querySelector('title')?.textContent || 'Unknown Title',
            creator: metadata.querySelector('creator')?.textContent || 'Unknown Author',
            language: metadata.querySelector('language')?.textContent || 'en',
            identifier: metadata.querySelector('identifier')?.textContent || '',
            description: metadata.querySelector('description')?.textContent || '',
            publisher: metadata.querySelector('publisher')?.textContent || '',
            date: metadata.querySelector('date')?.textContent || ''
        };
    }

    async extractChapters(opfDoc, zip, opfPath) {
        const manifest = opfDoc.querySelector('manifest');
        const spine = opfDoc.querySelector('spine');

        // Build manifest map
        const manifestMap = new Map();
        manifest.querySelectorAll('item').forEach(item => {
            manifestMap.set(item.getAttribute('id'), {
                href: item.getAttribute('href'),
                mediaType: item.getAttribute('media-type')
            });
        });

        const chapters = [];
        const spineItems = spine.querySelectorAll('itemref');
        const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

        for (let i = 0; i < spineItems.length; i++) {
            const itemref = spineItems[i];
            const idref = itemref.getAttribute('idref');
            const manifestItem = manifestMap.get(idref);

            if (manifestItem && manifestItem.mediaType === 'application/xhtml+xml') {
                const chapterPath = basePath + manifestItem.href;
                const chapterFile = zip.file(chapterPath);

                if (chapterFile) {
                    const content = await chapterFile.async('text');
                    chapters.push({
                        id: idref,
                        title: `Chapter ${i + 1}`,
                        content: content,
                        path: chapterPath,
                        index: i
                    });
                }
            }
        }

        return chapters;
    }

    async extractTOC(opfDoc, zip, opfPath, chapters) {
        try {
            const manifest = opfDoc.querySelector('manifest');
            const ncxItem = manifest.querySelector('item[media-type="application/x-dtbncx+xml"]');

            if (ncxItem) {
                const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
                const ncxPath = basePath + ncxItem.getAttribute('href');
                const ncxFile = zip.file(ncxPath);

                if (ncxFile) {
                    const ncxContent = await ncxFile.async('text');
                    const parser = new DOMParser();
                    const ncxDoc = parser.parseFromString(ncxContent, 'text/xml');
                    this.parseTOCFromNCX(ncxDoc, chapters);
                    return;
                }
            }

            this.generateFallbackTOC(chapters);

        } catch (error) {
            this.debug(`TOC extraction failed: ${error.message}`, 'warning');
            this.generateFallbackTOC(chapters);
        }
    }

    parseTOCFromNCX(ncxDoc, chapters) {
        const navPoints = ncxDoc.querySelectorAll('navPoint');

        navPoints.forEach((navPoint, index) => {
            const navLabel = navPoint.querySelector('navLabel text');
            if (navLabel && chapters[index]) {
                chapters[index].title = navLabel.textContent.trim();
            }
        });
    }

    generateFallbackTOC(chapters) {
        chapters.forEach((chapter, index) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(chapter.content, 'text/html');

            const h1 = doc.querySelector('h1');
            const h2 = doc.querySelector('h2');
            const title = doc.querySelector('title');

            if (h1?.textContent?.trim()) {
                chapter.title = h1.textContent.trim();
            } else if (h2?.textContent?.trim()) {
                chapter.title = h2.textContent.trim();
            } else if (title?.textContent?.trim()) {
                chapter.title = title.textContent.trim();
            } else {
                chapter.title = `Chapter ${index + 1}`;
            }
        });
    }

    // === BOOK MANAGEMENT ===

    switchToBook(bookId) {
        if (!this.books.has(bookId)) return;

        const previousBook = this.getCurrentBook();
        if (previousBook) {
            this.saveReadingPosition(previousBook);
        }

        this.currentBookId = bookId;
        const book = this.getCurrentBook();

        // Restore reading position
        this.currentChapterIndex = book.currentChapter || 0;
        this.currentPageIndex = book.currentPage || 0;

        // Update last read time
        book.lastRead = new Date().toISOString();

        this.updateBookInfo();
        this.updateLibraryDisplay();
        this.renderTOC();
        this.renderCurrentChapter();
        this.updateNavigation();
        this.updateProgress();

        this.debug(`Switched to book: ${book.metadata.title}`, 'info');
    }

    switchToNextBook() {
        const bookIds = Array.from(this.books.keys());
        if (bookIds.length <= 1) return;

        const currentIndex = bookIds.indexOf(this.currentBookId);
        const nextIndex = (currentIndex + 1) % bookIds.length;
        this.switchToBook(bookIds[nextIndex]);

        this.showToast(`Switched to: ${this.getCurrentBook().metadata.title}`, 'info');
    }

    switchToPreviousBook() {
        const bookIds = Array.from(this.books.keys());
        if (bookIds.length <= 1) return;

        const currentIndex = bookIds.indexOf(this.currentBookId);
        const prevIndex = currentIndex === 0 ? bookIds.length - 1 : currentIndex - 1;
        this.switchToBook(bookIds[prevIndex]);

        this.showToast(`Switched to: ${this.getCurrentBook().metadata.title}`, 'info');
    }

    removeBook(bookId) {
        if (!this.books.has(bookId)) return;

        const book = this.books.get(bookId);
        this.books.delete(bookId);

        // If this was the current book, switch to another
        if (this.currentBookId === bookId) {
            this.currentBookId = null;
            if (this.books.size > 0) {
                const firstBookId = Array.from(this.books.keys())[0];
                this.switchToBook(firstBookId);
            } else {
                this.clearReader();
            }
        }

        this.updateLibraryDisplay();
        this.saveData();
        this.showToast(`Removed: ${book.metadata.title}`, 'info');
        this.debug(`Removed book: ${book.metadata.title}`, 'info');
    }

    getCurrentBook() {
        return this.books.get(this.currentBookId);
    }

    // === RENDERING ===

    updateBookInfo() {
        const book = this.getCurrentBook();
        if (!book) {
            this.bookTitle.textContent = 'Select a book from your library';
            this.bookAuthor.textContent = '';
            return;
        }

        this.bookTitle.textContent = book.metadata.title;
        this.bookAuthor.textContent = book.metadata.creator;
    }

    updateLibraryDisplay() {
        const bookArray = Array.from(this.books.values()).sort((a, b) =>
            new Date(b.lastRead) - new Date(a.lastRead)
        );

        this.bookCount.textContent = `${this.books.size} book${this.books.size !== 1 ? 's' : ''}`;

        if (bookArray.length === 0) {
            this.libraryList.innerHTML = `
                <div class="empty-library">
                    <i class="fas fa-book"></i>
                    <div>No books in library</div>
                    <button class="btn-small" id="uploadFirstBook">Upload your first book</button>
                </div>
            `;
            document.getElementById('uploadFirstBook')?.addEventListener('click', () => this.fileInput.click());
            return;
        }

        this.libraryList.innerHTML = bookArray.map(book => {
            const progress = this.calculateBookProgress(book);
            return `
                <div class="library-item ${book.id === this.currentBookId ? 'active' : ''}"
                     data-book-id="${book.id}">
                    <div class="book-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="library-item-info">
                        <div class="library-item-title">${book.metadata.title}</div>
                        <div class="library-item-author">${book.metadata.creator}</div>
                        <div class="library-item-progress">${progress}% complete</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        this.libraryList.querySelectorAll('.library-item').forEach(item => {
            const bookId = item.dataset.bookId;
            item.addEventListener('click', () => this.switchToBook(bookId));

            // Add context menu for book removal
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm(`Remove "${this.books.get(bookId).metadata.title}" from library?`)) {
                    this.removeBook(bookId);
                }
            });
        });
    }

    renderTOC() {
        const book = this.getCurrentBook();
        if (!book) {
            this.tocList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <div>Select a book to view contents</div>
                </div>
            `;
            return;
        }

        this.tocList.innerHTML = book.chapters.map((chapter, index) => `
            <div class="toc-item ${index === this.currentChapterIndex ? 'active' : ''}"
                 data-chapter-index="${index}">
                <i class="fas fa-file-alt"></i>
                <span>${chapter.title}</span>
            </div>
        `).join('');

        // Add click handlers
        this.tocList.querySelectorAll('.toc-item').forEach(item => {
            const chapterIndex = parseInt(item.dataset.chapterIndex);
            item.addEventListener('click', () => this.goToChapter(chapterIndex));
        });
    }

    renderCurrentChapter() {
        const book = this.getCurrentBook();
        if (!book || !book.chapters[this.currentChapterIndex]) return;

        if (this.viewMode === 'paginated') {
            this.renderPaginatedView();
        } else {
            this.renderContinuousView();
        }
    }

    renderPaginatedView() {
        const book = this.getCurrentBook();
        const chapter = book.chapters[this.currentChapterIndex];

        if (!chapter) return;

        // Process and paginate content
        const cleanHTML = this.processChapterHTML(chapter.content);
        this.paginateContent(cleanHTML);
        this.renderCurrentPage();
    }

    renderContinuousView() {
        const book = this.getCurrentBook();
        const chapter = book.chapters[this.currentChapterIndex];

        if (!chapter) return;

        const cleanHTML = this.processChapterHTML(chapter.content);
        this.continuousContent.innerHTML = `<div class="page-content">${cleanHTML}</div>`;

        // Restore scroll position if available
        this.restoreScrollPosition();
    }

    processChapterHTML(html) {
        // Clean up HTML
        html = html.replace(/<\?xml[^>]*\?>/gi, '');
        html = html.replace(/<!DOCTYPE[^>]*>/gi, '');

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove unwanted elements
        doc.querySelectorAll('script, style, meta, link').forEach(el => el.remove());

        // Handle images (basic implementation)
        doc.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http')) {
                img.style.display = 'none';
            }
        });

        return doc.body.innerHTML || '';
    }

    paginateContent(html) {
        // Simple pagination based on word count
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const textContent = doc.body.textContent || '';
        const words = textContent.split(/\s+/).filter(word => word.length > 0);

        const wordsPerPage = 400;
        const pageCount = Math.max(1, Math.ceil(words.length / wordsPerPage));

        this.pages = [];

        for (let i = 0; i < pageCount; i++) {
            const startWord = i * wordsPerPage;
            const endWord = Math.min((i + 1) * wordsPerPage, words.length);
            const pageWords = words.slice(startWord, endWord);

            // Create page content (simplified approach)
            const pageContent = this.createPageFromWords(html, pageWords, startWord, endWord, words.length);

            this.pages.push({
                content: pageContent,
                wordStart: startWord,
                wordEnd: endWord
            });
        }

        this.debug(`Paginated chapter into ${this.pages.length} pages`);
    }

    createPageFromWords(fullHTML, pageWords, startWord, endWord, totalWords) {
        // For simplicity, we'll distribute HTML elements across pages
        const parser = new DOMParser();
        const doc = parser.parseFromString(fullHTML, 'text/html');
        const elements = Array.from(doc.body.children);

        if (elements.length === 0) {
            return `<div class="page-content"><p>${pageWords.join(' ')}</p></div>`;
        }

        // Calculate which elements belong to this page
        const elementsPerPage = Math.max(1, Math.ceil(elements.length / this.pages.length || 1));
        const pageIndex = Math.floor(startWord / (totalWords / this.pages.length || 1));
        const startElement = Math.floor(pageIndex * elementsPerPage);
        const endElement = Math.min(startElement + elementsPerPage, elements.length);

        const pageElements = elements.slice(startElement, endElement);
        const pageHTML = pageElements.map(el => el.outerHTML).join('');

        return `<div class="page-content">${pageHTML}</div>`;
    }

    renderCurrentPage() {
        if (!this.pages[this.currentPageIndex]) return;

        const page = this.pages[this.currentPageIndex];
        this.pageContainer.innerHTML = `<div class="page">${page.content}</div>`;
    }

    // === NAVIGATION ===

    goToChapter(chapterIndex) {
        const book = this.getCurrentBook();
        if (!book || chapterIndex < 0 || chapterIndex >= book.chapters.length) return;

        this.currentChapterIndex = chapterIndex;
        this.currentPageIndex = 0;

        this.renderTOC();
        this.renderCurrentChapter();
        this.updateNavigation();
        this.updateProgress();

        this.saveReadingPosition();
        this.debug(`Navigated to chapter ${chapterIndex + 1}`);
    }

    previousChapter() {
        if (this.currentChapterIndex > 0) {
            this.goToChapter(this.currentChapterIndex - 1);
        }
    }

    nextChapter() {
        const book = this.getCurrentBook();
        if (book && this.currentChapterIndex < book.chapters.length - 1) {
            this.goToChapter(this.currentChapterIndex + 1);
        }
    }

    previousPage() {
        if (this.viewMode === 'continuous') {
            this.previousChapter();
            return;
        }

        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.renderCurrentPage();
            this.updateNavigation();
            this.updateProgress();
            this.saveReadingPosition();
        } else if (this.currentChapterIndex > 0) {
            this.previousChapter();
            // Go to last page of previous chapter
            setTimeout(() => {
                this.currentPageIndex = this.pages.length - 1;
                this.renderCurrentPage();
                this.updateNavigation();
                this.updateProgress();
                this.saveReadingPosition();
            }, 100);
        }
    }

    nextPage() {
        if (this.viewMode === 'continuous') {
            this.nextChapter();
            return;
        }

        if (this.currentPageIndex < this.pages.length - 1) {
            this.currentPageIndex++;
            this.renderCurrentPage();
            this.updateNavigation();
            this.updateProgress();
            this.saveReadingPosition();
        } else {
            this.nextChapter();
        }
    }

    updateNavigation() {
        const book = this.getCurrentBook();
        if (!book) {
            this.prevChapterBtn.disabled = true;
            this.nextChapterBtn.disabled = true;
            this.prevPageBtn.disabled = true;
            this.nextPageBtn.disabled = true;
            return;
        }

        // Chapter navigation
        this.prevChapterBtn.disabled = this.currentChapterIndex === 0;
        this.nextChapterBtn.disabled = this.currentChapterIndex === book.chapters.length - 1;

        // Page navigation
        if (this.viewMode === 'paginated') {
            this.prevPageBtn.disabled = this.currentChapterIndex === 0 && this.currentPageIndex === 0;
            this.nextPageBtn.disabled = this.currentChapterIndex === book.chapters.length - 1 &&
                                        this.currentPageIndex === this.pages.length - 1;
        } else {
            this.prevPageBtn.disabled = this.currentChapterIndex === 0;
            this.nextPageBtn.disabled = this.currentChapterIndex === book.chapters.length - 1;
        }
    }

    updateProgress() {
        const book = this.getCurrentBook();
        if (!book) {
            this.progressBar.style.width = '0%';
            this.progressText.textContent = '0%';
            return;
        }

        const progress = this.calculateBookProgress(book);
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${progress}%`;
    }

    calculateBookProgress(book) {
        if (!book || book.chapters.length === 0) return 0;

        if (this.viewMode === 'paginated' && this.pages.length > 0) {
            // Calculate progress within current chapter
            const chapterProgress = this.currentPageIndex / Math.max(1, this.pages.length - 1);
            const totalProgress = (this.currentChapterIndex + chapterProgress) / book.chapters.length;
            return Math.round(totalProgress * 100);
        } else {
            // Simple chapter-based progress
            return Math.round((this.currentChapterIndex / Math.max(1, book.chapters.length - 1)) * 100);
        }
    }

    // === VIEW MODE ===

    toggleViewMode() {
        this.viewMode = this.viewMode === 'paginated' ? 'continuous' : 'paginated';

        this.pageView.classList.toggle('hidden', this.viewMode === 'continuous');
        this.continuousView.classList.toggle('hidden', this.viewMode === 'paginated');

        this.viewModeText.textContent = this.viewMode === 'paginated' ? 'Paginated' : 'Continuous';
        this.viewModeBtn.querySelector('i').className = this.viewMode === 'paginated' ?
            'fas fa-expand-alt' : 'fas fa-th-large';

        this.renderCurrentChapter();
        this.updateNavigation();

        this.showToast(`Switched to ${this.viewMode} view`, 'info');
        this.debug(`View mode changed to: ${this.viewMode}`);
    }

    // === HIGHLIGHTING ===

    handleTextSelection(e) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            this.currentSelection = {
                text: selectedText,
                range: selection.getRangeAt(0).cloneRange(),
                x: e.pageX,
                y: e.pageY
            };

            this.showContextMenu(e.pageX, e.pageY);
        }
    }

    showContextMenu(x, y) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.remove('hidden');
    }

    hideContextMenu(e) {
        if (!this.contextMenu.contains(e.target)) {
            this.contextMenu.classList.add('hidden');
        }
    }

    addHighlight(color) {
        if (!this.currentSelection || !this.getCurrentBook()) return;

        try {
            const book = this.getCurrentBook();
            const highlightId = this.generateHighlightId();

            // Create highlight element
            const span = document.createElement('span');
            span.className = `highlight ${color}`;
            span.dataset.highlightId = highlightId;

            this.currentSelection.range.surroundContents(span);

            // Store highlight data
            const highlight = {
                id: highlightId,
                text: this.currentSelection.text,
                color: color,
                bookId: book.id,
                chapter: this.currentChapterIndex,
                page: this.currentPageIndex,
                dateCreated: new Date().toISOString()
            };

            book.highlights.set(highlightId, highlight);
            this.updateHighlightsList();
            this.saveData();

            this.debug(`Added ${color} highlight: ${this.currentSelection.text.substring(0, 50)}...`);
            this.showToast('Highlight added', 'success');

        } catch (error) {
            this.debug(`Failed to add highlight: ${error.message}`, 'error');
            this.showToast('Failed to add highlight', 'error');
        }

        this.contextMenu.classList.add('hidden');
        window.getSelection().removeAllRanges();
    }

    removeHighlight() {
        // Implementation for removing highlights
        this.contextMenu.classList.add('hidden');
        window.getSelection().removeAllRanges();
    }

    copySelectedText() {
        if (!this.currentSelection) return;

        navigator.clipboard.writeText(this.currentSelection.text).then(() => {
            this.showToast('Text copied to clipboard', 'success');
        }).catch(() => {
            this.showToast('Failed to copy text', 'error');
        });

        this.contextMenu.classList.add('hidden');
        window.getSelection().removeAllRanges();
    }

    toggleHighlights() {
        this.isHighlightsOpen = !this.isHighlightsOpen;
        this.highlightsPanel.classList.toggle('open', this.isHighlightsOpen);

        if (this.isHighlightsOpen) {
            this.updateHighlightsList();
        }
    }

    updateHighlightsList() {
        const book = this.getCurrentBook();
        if (!book || book.highlights.size === 0) {
            this.highlightsList.innerHTML = `
                <div class="empty-highlights">
                    <i class="fas fa-highlighter"></i>
                    <div>No highlights yet</div>
                    <div>Select text while reading to add highlights</div>
                </div>
            `;
            return;
        }

        const highlights = Array.from(book.highlights.values()).sort((a, b) =>
            new Date(b.dateCreated) - new Date(a.dateCreated)
        );

        this.highlightsList.innerHTML = highlights.map(highlight => `
            <div class="highlight-item ${highlight.color}">
                <div class="highlight-text">"${highlight.text}"</div>
                <div class="highlight-meta">
                    <span>Chapter ${highlight.chapter + 1}</span>
                    <div class="highlight-actions">
                        <button class="highlight-action" onclick="epubReader.goToHighlight('${highlight.id}')">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button class="highlight-action" onclick="epubReader.deleteHighlight('${highlight.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    goToHighlight(highlightId) {
        const book = this.getCurrentBook();
        const highlight = book?.highlights.get(highlightId);

        if (highlight) {
            this.goToChapter(highlight.chapter);
            this.currentPageIndex = highlight.page;
            this.renderCurrentChapter();
            this.updateNavigation();
            this.updateProgress();
        }
    }

    deleteHighlight(highlightId) {
        const book = this.getCurrentBook();
        if (book?.highlights.has(highlightId)) {
            book.highlights.delete(highlightId);
            this.updateHighlightsList();
            this.saveData();
            this.showToast('Highlight deleted', 'info');
        }
    }

    // === UI MANAGEMENT ===

    toggleLibrary() {
        this.isLibraryOpen = !this.isLibraryOpen;
        // Implementation depends on responsive design
        this.debug(`Library ${this.isLibraryOpen ? 'opened' : 'closed'}`);
    }

    showShortcuts() {
        this.shortcutsModal.classList.remove('hidden');
    }

    hideShortcuts() {
        this.shortcutsModal.classList.add('hidden');
    }

    hideModals() {
        this.shortcutsModal.classList.add('hidden');
        this.contextMenu.classList.add('hidden');
        if (this.isHighlightsOpen) {
            this.toggleHighlights();
        }
    }

    // === LOADING AND PROGRESS ===

    showLoading(text, progress = '') {
        this.loadingText.textContent = text;
        this.loadingProgress.textContent = progress;
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    // === DATA PERSISTENCE ===

    saveData() {
        try {
            const data = {
                books: Array.from(this.books.entries()).map(([id, book]) => [id, {
                    ...book,
                    highlights: Array.from(book.highlights.entries())
                }]),
                currentBookId: this.currentBookId,
                viewMode: this.viewMode,
                settings: {
                    // Add user settings here
                }
            };

            localStorage.setItem('epubReaderData', JSON.stringify(data));
            this.debug('Data saved to localStorage', 'success');

        } catch (error) {
            this.debug(`Failed to save data: ${error.message}`, 'error');
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('epubReaderData');
            if (!savedData) return;

            const data = JSON.parse(savedData);

            // Restore books
            this.books = new Map(data.books.map(([id, book]) => [id, {
                ...book,
                highlights: new Map(book.highlights || [])
            }]));

            // Restore current book
            if (data.currentBookId && this.books.has(data.currentBookId)) {
                this.currentBookId = data.currentBookId;
            }

            // Restore view mode
            if (data.viewMode) {
                this.viewMode = data.viewMode;
                this.viewModeText.textContent = this.viewMode === 'paginated' ? 'Paginated' : 'Continuous';
            }

            this.updateLibraryDisplay();

            if (this.currentBookId) {
                this.switchToBook(this.currentBookId);
            }

            this.debug(`Loaded ${this.books.size} books from localStorage`, 'success');

        } catch (error) {
            this.debug(`Failed to load saved data: ${error.message}`, 'error');
        }
    }

    saveReadingPosition(book = null) {
        const currentBook = book || this.getCurrentBook();
        if (!currentBook) return;

        currentBook.currentChapter = this.currentChapterIndex;
        currentBook.currentPage = this.currentPageIndex;
        currentBook.lastRead = new Date().toISOString();

        // Save scroll position for continuous view
        if (this.viewMode === 'continuous') {
            currentBook.scrollPosition = this.continuousContent.scrollTop;
        }

        this.saveData();
    }

    restoreScrollPosition() {
        const book = this.getCurrentBook();
        if (book?.scrollPosition && this.viewMode === 'continuous') {
            setTimeout(() => {
                this.continuousContent.scrollTop = book.scrollPosition;
            }, 100);
        }
    }

    // === DEBUG PANEL ===

    initializeDebugPanel() {
        this.debug('Debug panel initialized');
    }

    toggleDebugPanel() {
        this.isDebugOpen = !this.isDebugOpen;
        this.debugPanel.classList.toggle('open', this.isDebugOpen);
    }

    debug(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const log = { timestamp, message, type };
        this.debugLogs.push(log);

        const logElement = document.createElement('div');
        logElement.className = `debug-log ${type}`;
        logElement.textContent = `[${timestamp}] ${message}`;

        this.debugContent.appendChild(logElement);
        this.debugContent.scrollTop = this.debugContent.scrollHeight;

        // Keep only last 100 logs
        if (this.debugLogs.length > 100) {
            this.debugLogs.shift();
            if (this.debugContent.firstChild) {
                this.debugContent.removeChild(this.debugContent.firstChild);
            }
        }

        console.log(`[EPUB Reader Pro] ${message}`);
    }

    clearDebugLogs() {
        this.debugLogs = [];
        this.debugContent.innerHTML = '';
        this.debug('Debug logs cleared');
    }

    // === TOAST NOTIFICATIONS ===

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';

        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // === UTILITY METHODS ===

    generateBookId() {
        return 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateHighlightId() {
        return 'highlight_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    clearReader() {
        this.currentBookId = null;
        this.currentChapterIndex = 0;
        this.currentPageIndex = 0;
        this.pages = [];

        this.updateBookInfo();
        this.renderTOC();
        this.pageContainer.innerHTML = `
            <div class="page">
                <div class="empty-state">
                    <i class="fas fa-book-reader"></i>
                    <div>Select a book to start reading</div>
                    <div class="shortcuts-hint">Press <kbd>?</kbd> for keyboard shortcuts</div>
                </div>
            </div>
        `;

        this.continuousContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-scroll"></i>
                <div>Continuous reading view</div>
                <div>Select a book to start reading</div>
            </div>
        `;

        this.updateNavigation();
        this.updateProgress();
    }

    handleResize() {
        // Re-paginate current chapter if in paginated view
        if (this.viewMode === 'paginated' && this.getCurrentBook()) {
            setTimeout(() => {
                this.renderCurrentChapter();
            }, 100);
        }
    }
}

// === INITIALIZATION ===

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReader);
} else {
    initializeReader();
}

function initializeReader() {
    // Create global instance
    window.epubReader = new EPUBReaderPro();

    // Add some helpful global functions
    window.switchToBook = (bookId) => window.epubReader.switchToBook(bookId);
    window.goToHighlight = (highlightId) => window.epubReader.goToHighlight(highlightId);
    window.deleteHighlight = (highlightId) => window.epubReader.deleteHighlight(highlightId);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.epubReader.saveData();
        }
    });

    // Handle beforeunload for saving data
    window.addEventListener('beforeunload', () => {
        window.epubReader.saveData();
    });

    // Add some CSS for dynamic styling
    const style = document.createElement('style');
    style.textContent = `
        /* Dynamic highlight colors */
        .highlight.yellow { background-color: var(--highlight-yellow); }
        .highlight.blue { background-color: var(--highlight-blue); }
        .highlight.green { background-color: var(--highlight-green); }

        /* Selection styling */
        ::selection {
            background-color: rgba(0, 0, 0, 0.2);
        }

        /* Smooth scrolling */
        .continuous-content {
            scroll-behavior: smooth;
        }

        /* Custom scrollbar for webkit browsers */
        .continuous-content::-webkit-scrollbar,
        .toc-list::-webkit-scrollbar,
        .library-list::-webkit-scrollbar,
        .highlights-list::-webkit-scrollbar,
        .debug-content::-webkit-scrollbar {
            width: 6px;
        }

        .continuous-content::-webkit-scrollbar-track,
        .toc-list::-webkit-scrollbar-track,
        .library-list::-webkit-scrollbar-track,
        .highlights-list::-webkit-scrollbar-track,
        .debug-content::-webkit-scrollbar-track {
            background: var(--bg-tertiary);
        }

        .continuous-content::-webkit-scrollbar-thumb,
        .toc-list::-webkit-scrollbar-thumb,
        .library-list::-webkit-scrollbar-thumb,
        .highlights-list::-webkit-scrollbar-thumb,
        .debug-content::-webkit-scrollbar-thumb {
            background: var(--border-medium);
            border-radius: 3px;
        }

        .continuous-content::-webkit-scrollbar-thumb:hover,
        .toc-list::-webkit-scrollbar-thumb:hover,
        .library-list::-webkit-scrollbar-thumb:hover,
        .highlights-list::-webkit-scrollbar-thumb:hover,
        .debug-content::-webkit-scrollbar-thumb:hover {
            background: var(--accent);
        }

        /* Focus styles */
        .btn:focus,
        .btn-icon:focus,
        .toc-item:focus,
        .library-item:focus {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
        }

        /* Print-specific styles */
        @media print {
            .page-content,
            .continuous-content {
                font-size: 12pt !important;
                line-height: 1.5 !important;
                color: black !important;
            }

            .highlight {
                background: none !important;
                border-bottom: 1px solid black;
            }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
            :root {
                --bg-primary: #ffffff;
                --bg-secondary: #f0f0f0;
                --text-primary: #000000;
                --border-light: #000000;
                --accent: #000000;
            }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }

            .page-container {
                transition: none !important;
            }
        }

        /* Dark mode support (future enhancement) */
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-primary: #1a1a1a;
                --bg-secondary: #2d2d2d;
                --bg-tertiary: #3a3a3a;
                --text-primary: #ffffff;
                --text-secondary: #cccccc;
                --text-muted: #999999;
                --border-light: #444444;
                --border-medium: #555555;
                --accent: #ffffff;
            }
        }
    `;
    document.head.appendChild(style);

    console.log('EPUB Reader Pro initialized successfully!');
}

// === ADDITIONAL UTILITY FUNCTIONS ===

// Function to handle keyboard shortcuts globally
function handleGlobalKeyboard(event) {
    // These can be used for additional global shortcuts
    if (window.epubReader) {
        // Add any additional global keyboard handling here
    }
}

// Function to handle file drops on the entire window
function handleWindowDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).filter(file =>
        file.name.endsWith('.epub')
    );

    if (files.length > 0 && window.epubReader) {
        window.epubReader.handleFileSelect(files);
    }
}

// Function to handle window dragover for file drops
function handleWindowDragover(event) {
    event.preventDefault();
}

// Add global event listeners
document.addEventListener('keydown', handleGlobalKeyboard);
document.addEventListener('drop', handleWindowDrop);
document.addEventListener('dragover', handleWindowDragover);

// === SERVICE WORKER REGISTRATION (Optional) ===
// Uncomment the following if you want to add PWA capabilities

/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/

// === EXPORT FOR MODULE USAGE (Optional) ===
// Uncomment if you want to use this as a module

/*
export default EPUBReaderPro;
export {
    EPUBReaderPro,
    initializeReader,
    handleGlobalKeyboard,
    handleWindowDrop,
    handleWindowDragover
};
*/
