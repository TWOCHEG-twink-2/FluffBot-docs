document.addEventListener('DOMContentLoaded', async function () {
    const files = ['image.md', 'cats.md', 'end.md'];
    const folderPath = 'texts';
    const contentDiv = document.getElementById('content');
    const menu = document.getElementById('menu');
  
    // загрузка markdown и рендер
    async function loadMarkdownContent() {
      for (const file of files) {
        try {
          const res = await fetch(`${folderPath}/${file}`);
          if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
          const text = await res.text();
          const html = marked.parse(text);
          const block = document.createElement('div');
          block.className = 'markdown-block';
          block.id = file;             // важно, чтобы id совпадал с именем файла
          block.innerHTML = html;
          contentDiv.appendChild(block);
        } catch (e) {
          console.error(e);
          const errorBlock = document.createElement('div');
          errorBlock.className = 'markdown-block';
          errorBlock.textContent = `Error loading ${file}: ${e.message}`;
          contentDiv.appendChild(errorBlock);
        }
      }
    }
  
    // создание пунктов меню и навешивание клика
    function populateMenu() {
      files.forEach(file => {
        const name = file.replace('.md', '');
        const p = document.createElement('p');
        p.textContent = name;
        p.dataset.target = file;
        p.classList.add('menu-item');
        p.addEventListener('click', () => {
          document.getElementById(file)
                  .scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        menu.appendChild(p);
      });
    }
  
    // подсветка текущего пункта меню
    function setActiveItem(currentFile) {
      document.querySelectorAll('#menu .menu-item').forEach(el => {
        el.classList.toggle('active', el.dataset.target === currentFile);
      });
    }
  
    // отслеживаем скролл и определяем элемент, занимающий середину экрана
    function watchScroll() {
      const centerY = () => window.innerHeight / 2;
      const sections = files.map(f => document.getElementById(f));
  
      window.addEventListener('scroll', () => {
        const mid = centerY();
        let current = sections[0].id;
  
        sections.forEach(sec => {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= mid && rect.bottom >= mid) {
            current = sec.id;
          }
        });
  
        setActiveItem(current);
      });
  
      // сразу установить начальный активный пункт
      window.dispatchEvent(new Event('scroll'));
    }
  
    // обработчик поиска
    function searchHeandler() {
      const button = document.querySelector('#search-button');
      const inputContainer = document.querySelector('#background');
      const inputSector = document.querySelector('#search-input-button');
      const searchInput = document.getElementById('search-input-button');
      const form = searchInput.closest('form');
  
      function findText(text) {
        if (inputContainer.classList.contains('show')) inputContainer.classList.remove('show');
        if (inputSector.classList.contains('show'))   inputSector.classList.remove('show');
        if (!text.trim()) return;
  
        // удалить старую подсветку
        document.querySelectorAll('.highlight').forEach(span => {
          const parent = span.parentNode;
          parent.replaceChild(document.createTextNode(span.textContent), span);
        });
  
        const searchText = text.toLowerCase().trim();
        const elements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td');
        let foundElement = null, textNode = null;
  
        for (const el of elements) {
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.toLowerCase().includes(searchText)) {
              foundElement = el;
              textNode = node;
              break;
            }
          }
          if (foundElement) break;
        }
  
        if (foundElement && textNode) {
          const range = document.createRange();
          const txt = textNode.textContent;
          const start = txt.toLowerCase().indexOf(searchText);
          range.setStart(textNode, start);
          range.setEnd(textNode, start + searchText.length);
  
          const highlightSpan = document.createElement('span');
          highlightSpan.className = 'highlight';
          highlightSpan.style.backgroundColor = 'yellow';
          range.surroundContents(highlightSpan);
          highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
          setTimeout(() => {
            const parent = highlightSpan.parentNode;
            parent.replaceChild(document.createTextNode(highlightSpan.textContent), highlightSpan);
          }, 2000);
        }
      }
  
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          findText(searchInput.value);
        }
      });
      if (form) {
        form.addEventListener('submit', e => {
          e.preventDefault();
          findText(searchInput.value);
        });
      }
  
      button.addEventListener('click', () => {
        inputContainer.classList.add('show');
        inputSector.classList.add('show');
      });
      inputContainer.addEventListener('click', e => {
        if (!inputSector.contains(e.target)) {
          inputContainer.classList.remove('show');
          inputSector.classList.remove('show');
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          inputContainer.classList.remove('show');
          inputSector.classList.remove('show');
        }
      });
    }

    // Обработчик выпадающего меню
    function menuHeandler() {
      const menu = document.querySelector('#menu');
      const button = document.querySelector('#menu-button');
      const backGround = document.querySelector('#background-2');
  
      button.addEventListener('click', () => {
        menu.classList.add('show');
        backGround.classList.add('show');
      });
      document.addEventListener('click', e => {
        if (!menu.contains(e.target) && !button.contains(e.target)) {
          menu.classList.remove('show');
          backGround.classList.remove('show');
        }
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          menu.classList.remove('show');
          backGround.classList.remove('show');
        }
      });
    }
  
    // инициализация
    await loadMarkdownContent();
    populateMenu();
    watchScroll();
    searchHeandler();
    menuHeandler();
  });
  