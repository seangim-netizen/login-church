/* ==========================================================================
   Full Parallel Bible Comparison Web App - Core Engine & State Controller
   ========================================================================== */

(function() {
  // Master Book Order and Chapter Count Mapping
  const BIBLE_BOOKS = [
    // Old Testament (구약 39권)
    { name: '창세기', ot: true, chapters: 50 },
    { name: '출애굽기', ot: true, chapters: 40 },
    { name: '레위기', ot: true, chapters: 27 },
    { name: '민수기', ot: true, chapters: 36 },
    { name: '신명기', ot: true, chapters: 34 },
    { name: '여호수아', ot: true, chapters: 24 },
    { name: '재판관기', ot: true, chapters: 21 },
    { name: '룻기', ot: true, chapters: 4 },
    { name: '사무엘상', ot: true, chapters: 31 },
    { name: '사무엘하', ot: true, chapters: 24 },
    { name: '열왕기상', ot: true, chapters: 22 },
    { name: '열왕기하', ot: true, chapters: 25 },
    { name: '역대기상', ot: true, chapters: 29 },
    { name: '역대기하', ot: true, chapters: 36 },
    { name: '에스라', ot: true, chapters: 10 },
    { name: '느헤미야', ot: true, chapters: 13 },
    { name: '에스더', ot: true, chapters: 10 },
    { name: '욥기', ot: true, chapters: 42 },
    { name: '시편', ot: true, chapters: 150 },
    { name: '잠언', ot: true, chapters: 31 },
    { name: '전도서', ot: true, chapters: 12 },
    { name: '아가', ot: true, chapters: 8 },
    { name: '이사야', ot: true, chapters: 66 },
    { name: '예레미야', ot: true, chapters: 52 },
    { name: '예레미야애가', ot: true, chapters: 5 },
    { name: '에스겔', ot: true, chapters: 48 },
    { name: '다니엘', ot: true, chapters: 12 },
    { name: '호세아', ot: true, chapters: 14 },
    { name: '요엘', ot: true, chapters: 3 },
    { name: '아모스', ot: true, chapters: 9 },
    { name: '오바디야', ot: true, chapters: 1 },
    { name: '요나', ot: true, chapters: 4 },
    { name: '미카', ot: true, chapters: 7 },
    { name: '나훔', ot: true, chapters: 3 },
    { name: '하바꾹', ot: true, chapters: 3 },
    { name: '스파냐', ot: true, chapters: 3 },
    { name: '학개', ot: true, chapters: 2 },
    { name: '즈가리야', ot: true, chapters: 14 },
    { name: '말라기', ot: true, chapters: 4 },

    // New Testament (신약 27권)
    { name: '마태복음', ot: false, chapters: 28 },
    { name: '마르코복음', ot: false, chapters: 16 },
    { name: '루카복음', ot: false, chapters: 24 },
    { name: '요한복음', ot: false, chapters: 21 },
    { name: '사도행전', ot: false, chapters: 28 },
    { name: '로마서', ot: false, chapters: 16 },
    { name: '고린도전서', ot: false, chapters: 16 },
    { name: '고린도후서', ot: false, chapters: 13 },
    { name: '갈라티아서', ot: false, chapters: 6 },
    { name: '에페소서', ot: false, chapters: 6 },
    { name: '필립비서', ot: false, chapters: 4 },
    { name: '골로사이서', ot: false, chapters: 4 },
    { name: '데살로니가전서', ot: false, chapters: 5 },
    { name: '데살로니가후서', ot: false, chapters: 3 },
    { name: '디모테오전서', ot: false, chapters: 6 },
    { name: '디모테오후서', ot: false, chapters: 4 },
    { name: '디도서', ot: false, chapters: 3 },
    { name: '필레몬서', ot: false, chapters: 1 },
    { name: '히브리서', ot: false, chapters: 13 },
    { name: '야고보서', ot: false, chapters: 5 },
    { name: '베드로전서', ot: false, chapters: 5 },
    { name: '베드로후서', ot: false, chapters: 3 },
    { name: '요한1서', ot: false, chapters: 5 },
    { name: '요한2서', ot: false, chapters: 1 },
    { name: '요한3서', ot: false, chapters: 1 },
    { name: '유다서', ot: false, chapters: 1 },
    { name: '요한계시록', ot: false, chapters: 22 }
  ];

  // App State
  let state = {
    currentBook: '창세기',
    currentChapter: 1,
    viewMode: 'compare', // 'compare' | 'sideBySide' | 'single'
    activeVersions: ['KG', 'KH', 'SB'],
    singleVersion: 'KG',
    fontSize: 18,
    theme: 'dark', // 'dark' | 'light' | 'sepia'
    pickerTestament: 'OT' // 'OT' | 'NT'
  };

  // Load Saved Preferences
  function loadPreferences() {
    try {
      const saved = localStorage.getItem('FULL_BIBLE_COMPARE_STATE');
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      }
    } catch(e) {}
  }

  function savePreferences() {
    try {
      localStorage.setItem('FULL_BIBLE_COMPARE_STATE', JSON.stringify({
        currentBook: state.currentBook,
        currentChapter: state.currentChapter,
        viewMode: state.viewMode,
        activeVersions: state.activeVersions,
        singleVersion: state.singleVersion,
        fontSize: state.fontSize,
        theme: state.theme
      }));
    } catch(e) {}
  }

  // Ensure DB Fallbacks so all versions exist
  function ensureMasterDBs() {
    const master = window.BIBLE_66_DB_KG || window.BIBLE_66_DB_KH || window.BIBLE_66_DB_SB || {};
    if (!window.BIBLE_66_DB_KG) window.BIBLE_66_DB_KG = master;
    if (!window.BIBLE_66_DB_KH) window.BIBLE_66_DB_KH = master;
    if (!window.BIBLE_66_DB_SB) window.BIBLE_66_DB_SB = master;
  }

  // DOM Elements
  let el = {};

  function initDOMElements() {
    el = {
      app: document.getElementById('app'),
      themeBtn: document.getElementById('themeBtn'),
      searchBtn: document.getElementById('searchBtn'),
      pickerBtn: document.getElementById('pickerBtn'),
      pickerBtnText: document.getElementById('pickerBtnText'),
      viewCompareBtn: document.getElementById('viewCompareBtn'),
      viewSideBtn: document.getElementById('viewSideBtn'),
      viewSingleBtn: document.getElementById('viewSingleBtn'),
      fontDecBtn: document.getElementById('fontDecBtn'),
      fontIncBtn: document.getElementById('fontIncBtn'),
      fontVal: document.getElementById('fontVal'),
      readerCanvas: document.getElementById('readerCanvas'),
      prevChapterBtn: document.getElementById('prevChapterBtn'),
      nextChapterBtn: document.getElementById('nextChapterBtn'),
      
      // Picker Modal
      pickerModal: document.getElementById('pickerModal'),
      pickerCloseBtn: document.getElementById('pickerCloseBtn'),
      tabOT: document.getElementById('tabOT'),
      tabNT: document.getElementById('tabNT'),
      bookGrid: document.getElementById('bookGrid'),
      chapterGrid: document.getElementById('chapterGrid'),
      
      // Search Modal
      searchModal: document.getElementById('searchModal'),
      searchCloseBtn: document.getElementById('searchCloseBtn'),
      searchInput: document.getElementById('searchInput'),
      searchSubmitBtn: document.getElementById('searchSubmitBtn'),
      searchResults: document.getElementById('searchResults')
    };
  }

  // Set Theme
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (el.themeBtn) {
      if (state.theme === 'dark') el.themeBtn.innerHTML = '🌙 다크';
      else if (state.theme === 'light') el.themeBtn.innerHTML = '☀️ 라이트';
      else el.themeBtn.innerHTML = '📜 세피아';
    }
  }

  // Set Font Size
  function applyFontSize() {
    document.documentElement.style.setProperty('--font-base', state.fontSize + 'px');
    if (el.fontVal) el.fontVal.textContent = state.fontSize + 'px';
  }

  // Get Version Object
  function getDB(verCode) {
    if (verCode === 'KG') return window.BIBLE_66_DB_KG || {};
    if (verCode === 'KH') return window.BIBLE_66_DB_KH || {};
    if (verCode === 'SB') return window.BIBLE_66_DB_SB || {};
    return window.BIBLE_66_DB_KG || {};
  }

  // Render Reader Passage
  function renderPassage() {
    ensureMasterDBs();
    if (!el.readerCanvas) return;
    
    // Update Picker Button Text
    if (el.pickerBtnText) {
      el.pickerBtnText.textContent = `📖 ${state.currentBook} ${state.currentChapter}장 ▾`;
    }

    // HTML Output Container
    let html = `<div class="chapter-title">${state.currentBook} ${state.currentChapter}장</div>`;

    const dbKG = getDB('KG');
    const dbKH = getDB('KH');
    const dbSB = getDB('SB');

    const bookKG = (dbKG[state.currentBook] || {})[state.currentChapter] || [];
    const bookKH = (dbKH[state.currentBook] || {})[state.currentChapter] || [];
    const bookSB = (dbSB[state.currentBook] || {})[state.currentChapter] || [];

    const maxVerses = Math.max(bookKG.length, bookKH.length, bookSB.length);

    if (maxVerses === 0) {
      html += `<div style="text-align:center; padding:40px; color:var(--text-muted);">성경 데이터를 불러오는 중이거나 해당 장을 찾을 수 없습니다.</div>`;
      el.readerCanvas.innerHTML = html;
      return;
    }

    // MODE 1: Verse-by-Verse Parallel Comparison View (구절별 대조)
    if (state.viewMode === 'compare') {
      for (let v = 0; v < maxVerses; v++) {
        const verseNum = v + 1;
        html += `<div class="verse-compare-card">`;
        html += `<div class="verse-num-badge">${verseNum}절</div>`;

        if (state.activeVersions.includes('KG') && bookKG[v]) {
          html += `
            <div class="version-block kg">
              <span class="version-tag kg">개역개정</span>
              <div class="version-text">${bookKG[v]}</div>
            </div>`;
        }

        if (state.activeVersions.includes('KH') && bookKH[v]) {
          html += `
            <div class="version-block kh">
              <span class="version-tag kh">개역한글</span>
              <div class="version-text">${bookKH[v]}</div>
            </div>`;
        }

        if (state.activeVersions.includes('SB') && bookSB[v]) {
          html += `
            <div class="version-block sb">
              <span class="version-tag sb">표준새번역</span>
              <div class="version-text">${bookSB[v]}</div>
            </div>`;
        }

        html += `</div>`;
      }
    } 
    // MODE 2: Multi-Column Parallel View (다단 병렬 대조)
    else if (state.viewMode === 'sideBySide') {
      html += `<div class="columns-container">`;

      if (state.activeVersions.includes('KG')) {
        html += `<div class="column-box">
          <div class="column-header"><span class="version-tag kg">개역개정</span></div>`;
        for (let v = 0; v < bookKG.length; v++) {
          html += `<div class="column-verse-row"><span class="column-verse-num">${v+1}</span> ${bookKG[v]}</div>`;
        }
        html += `</div>`;
      }

      if (state.activeVersions.includes('KH')) {
        html += `<div class="column-box">
          <div class="column-header"><span class="version-tag kh">개역한글</span></div>`;
        for (let v = 0; v < bookKH.length; v++) {
          html += `<div class="column-verse-row"><span class="column-verse-num">${v+1}</span> ${bookKH[v]}</div>`;
        }
        html += `</div>`;
      }

      if (state.activeVersions.includes('SB')) {
        html += `<div class="column-box">
          <div class="column-header"><span class="version-tag sb">표준새번역</span></div>`;
        for (let v = 0; v < bookSB.length; v++) {
          html += `<div class="column-verse-row"><span class="column-verse-num">${v+1}</span> ${bookSB[v]}</div>`;
        }
        html += `</div>`;
      }

      html += `</div>`;
    }
    // MODE 3: Single Version Reader (단일 역본 독서)
    else {
      const activeDB = getDB(state.singleVersion);
      const verses = (activeDB[state.currentBook] || {})[state.currentChapter] || [];
      const verName = state.singleVersion === 'KG' ? '개역개정' : (state.singleVersion === 'KH' ? '개역한글' : '표준새번역');

      html += `<div style="text-align:center; margin-bottom:16px;"><span class="version-tag kg">${verName}</span></div>`;
      html += `<div class="verse-compare-card" style="line-height:2.0;">`;
      for (let v = 0; v < verses.length; v++) {
        html += `<p style="margin-bottom:12px;"><strong style="color:var(--accent-gold); margin-right:6px;">${v+1}</strong> ${verses[v]}</p>`;
      }
      html += `</div>`;
    }

    el.readerCanvas.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    savePreferences();
  }

  // Navigation Handlers
  function prevChapter() {
    if (state.currentChapter > 1) {
      state.currentChapter--;
    } else {
      const bIdx = BIBLE_BOOKS.findIndex(b => b.name === state.currentBook);
      if (bIdx > 0) {
        state.currentBook = BIBLE_BOOKS[bIdx - 1].name;
        state.currentChapter = BIBLE_BOOKS[bIdx - 1].chapters;
      }
    }
    renderPassage();
  }

  function nextChapter() {
    const bookObj = BIBLE_BOOKS.find(b => b.name === state.currentBook);
    if (bookObj && state.currentChapter < bookObj.chapters) {
      state.currentChapter++;
    } else {
      const bIdx = BIBLE_BOOKS.findIndex(b => b.name === state.currentBook);
      if (bIdx >= 0 && bIdx < BIBLE_BOOKS.length - 1) {
        state.currentBook = BIBLE_BOOKS[bIdx + 1].name;
        state.currentChapter = 1;
      }
    }
    renderPassage();
  }

  // Picker Modal Rendering
  function openPickerModal() {
    if (!el.pickerModal) return;
    el.pickerModal.classList.add('active');
    renderPickerBooks();
    renderPickerChapters();
  }

  function closePickerModal() {
    if (el.pickerModal) el.pickerModal.classList.remove('active');
  }

  function renderPickerBooks() {
    if (!el.bookGrid) return;
    const isOT = state.pickerTestament === 'OT';
    const filtered = BIBLE_BOOKS.filter(b => isOT ? b.ot : !b.ot);

    let html = '';
    filtered.forEach(b => {
      const isSelected = b.name === state.currentBook;
      html += `<button class="book-btn ${isSelected ? 'selected' : ''}" data-book="${b.name}">${b.name}</button>`;
    });
    el.bookGrid.innerHTML = html;

    // Attach click events
    el.bookGrid.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.currentBook = e.target.getAttribute('data-book');
        state.currentChapter = 1;
        renderPickerBooks();
        renderPickerChapters();
      });
    });
  }

  function renderPickerChapters() {
    if (!el.chapterGrid) return;
    const bookObj = BIBLE_BOOKS.find(b => b.name === state.currentBook);
    const totalCh = bookObj ? bookObj.chapters : 1;

    let html = '';
    for (let c = 1; c <= totalCh; c++) {
      const isSelected = c === state.currentChapter;
      html += `<button class="chapter-btn ${isSelected ? 'selected' : ''}" data-ch="${c}">${c}장</button>`;
    }
    el.chapterGrid.innerHTML = html;

    // Attach click events
    el.chapterGrid.querySelectorAll('.chapter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.currentChapter = parseInt(e.target.getAttribute('data-ch'), 10);
        closePickerModal();
        renderPassage();
      });
    });
  }

  // Search Modal Engine
  function openSearchModal() {
    if (!el.searchModal) return;
    el.searchModal.classList.add('active');
    if (el.searchInput) el.searchInput.focus();
  }

  function closeSearchModal() {
    if (el.searchModal) el.searchModal.classList.remove('active');
  }

  function executeSearch() {
    const query = el.searchInput.value.trim();
    if (!query) return;

    ensureMasterDBs();
    const db = getDB('KG');
    let results = [];
    const maxResults = 50;

    for (const bObj of BIBLE_BOOKS) {
      const bName = bObj.name;
      const bData = db[bName] || {};
      for (const chStr in bData) {
        const verses = bData[chStr] || [];
        for (let v = 0; v < verses.length; v++) {
          const text = verses[v];
          if (text.includes(query)) {
            results.push({
              book: bName,
              chapter: parseInt(chStr, 10),
              verse: v + 1,
              text: text
            });
            if (results.length >= maxResults) break;
          }
        }
        if (results.length >= maxResults) break;
      }
      if (results.length >= maxResults) break;
    }

    renderSearchResults(query, results);
  }

  function renderSearchResults(query, results) {
    if (!el.searchResults) return;
    if (results.length === 0) {
      el.searchResults.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">검색 결과가 없습니다.</div>`;
      return;
    }

    let html = `<div style="margin-bottom:10px; font-weight:700; color:var(--accent-gold);">검색 결과 ${results.length}건</div>`;
    results.forEach(r => {
      const highlightedText = r.text.replace(new RegExp(query, 'g'), `<span class="highlight">${query}</span>`);
      html += `
        <div class="search-result-item" data-book="${r.book}" data-ch="${r.chapter}">
          <div class="search-match-ref">${r.book} ${r.chapter}:${r.verse}절</div>
          <div>${highlightedText}</div>
        </div>`;
    });

    el.searchResults.innerHTML = html;

    // Attach click events to jump
    el.searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetItem = e.currentTarget;
        state.currentBook = targetItem.getAttribute('data-book');
        state.currentChapter = parseInt(targetItem.getAttribute('data-ch'), 10);
        closeSearchModal();
        renderPassage();
      });
    });
  }

  // Attach Event Listeners
  function bindEvents() {
    // Theme Toggle
    if (el.themeBtn) {
      el.themeBtn.addEventListener('click', () => {
        if (state.theme === 'dark') state.theme = 'light';
        else if (state.theme === 'light') state.theme = 'sepia';
        else state.theme = 'dark';
        applyTheme();
        savePreferences();
      });
    }

    // Font Controls
    if (el.fontIncBtn) {
      el.fontIncBtn.addEventListener('click', () => {
        if (state.fontSize < 36) {
          state.fontSize += 2;
          applyFontSize();
          savePreferences();
        }
      });
    }
    if (el.fontDecBtn) {
      el.fontDecBtn.addEventListener('click', () => {
        if (state.fontSize > 14) {
          state.fontSize -= 2;
          applyFontSize();
          savePreferences();
        }
      });
    }

    // View Tabs
    if (el.viewCompareBtn) {
      el.viewCompareBtn.addEventListener('click', () => {
        state.viewMode = 'compare';
        updateViewTabUI();
        renderPassage();
      });
    }
    if (el.viewSideBtn) {
      el.viewSideBtn.addEventListener('click', () => {
        state.viewMode = 'sideBySide';
        updateViewTabUI();
        renderPassage();
      });
    }
    if (el.viewSingleBtn) {
      el.viewSingleBtn.addEventListener('click', () => {
        state.viewMode = 'single';
        updateViewTabUI();
        renderPassage();
      });
    }

    // Nav Buttons
    if (el.prevChapterBtn) el.prevChapterBtn.addEventListener('click', prevChapter);
    if (el.nextChapterBtn) el.nextChapterBtn.addEventListener('click', nextChapter);

    // Picker Modal Controls
    if (el.pickerBtn) el.pickerBtn.addEventListener('click', openPickerModal);
    if (el.pickerCloseBtn) el.pickerCloseBtn.addEventListener('click', closePickerModal);
    if (el.tabOT) {
      el.tabOT.addEventListener('click', () => {
        state.pickerTestament = 'OT';
        el.tabOT.classList.add('active');
        el.tabNT.classList.remove('active');
        renderPickerBooks();
      });
    }
    if (el.tabNT) {
      el.tabNT.addEventListener('click', () => {
        state.pickerTestament = 'NT';
        el.tabNT.classList.add('active');
        el.tabOT.classList.remove('active');
        renderPickerBooks();
      });
    }

    // Search Modal Controls
    if (el.searchBtn) el.searchBtn.addEventListener('click', openSearchModal);
    if (el.searchCloseBtn) el.searchCloseBtn.addEventListener('click', closeSearchModal);
    if (el.searchSubmitBtn) el.searchSubmitBtn.addEventListener('click', executeSearch);
    if (el.searchInput) {
      el.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
      });
    }
  }

  function updateViewTabUI() {
    if (el.viewCompareBtn) el.viewCompareBtn.classList.toggle('active', state.viewMode === 'compare');
    if (el.viewSideBtn) el.viewSideBtn.classList.toggle('active', state.viewMode === 'sideBySide');
    if (el.viewSingleBtn) el.viewSingleBtn.classList.toggle('active', state.viewMode === 'single');
  }

  // App Initialization
  function init() {
    loadPreferences();
    initDOMElements();
    applyTheme();
    applyFontSize();
    bindEvents();
    updateViewTabUI();
    renderPassage();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Global Access for script.onload
  window.renderBiblePassage = renderPassage;
  window.ensureMasterDBFallbacks = ensureMasterDBs;
})();
