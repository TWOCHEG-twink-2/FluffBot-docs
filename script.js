document.addEventListener('DOMContentLoaded', async function () {
  const files = [
    'auto_mod.md',
    'cats.md', 
    'chatbot.md', 
    'clicker.md', 
    'auto_roles.md',
    'moderation_control.md',
    'notify_of_members.md',
    'sticky_roles.md',
    'verify.md',
    'youtube.md',
    'iq.md',
    'messages.md',
    'quote.md',
    'roulette.md',
    'image.md', 
  ];
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
            block.id = file; // ID matches the file name, as required
            block.innerHTML = html;
            contentDiv.appendChild(block);

            // Set up IntersectionObserver for this block
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        block.classList.add('visible');
                        observer.unobserve(block);
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(block);
        } catch (e) {
            console.error(e);
            const errorBlock = document.createElement('div');
            errorBlock.className = 'markdown-block';
            errorBlock.textContent = `Error loading ${file}: ${e.message}`;
            contentDiv.appendChild(errorBlock);

            // Set up IntersectionObserver for the error block
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        errorBlock.classList.add('visible');
                        observer.unobserve(errorBlock);
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(errorBlock);
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
        const block = document.getElementById(file);
        const rect = block.getBoundingClientRect();
        const blockMid = rect.top + rect.height / 2; // Середина блока относительно верха документа
        const windowMid = window.innerHeight / 2; // Середина окна
        const scrollOffset = blockMid - windowMid + window.scrollY; // Смещение для центрирования

        window.scrollTo({
            top: scrollOffset,
            behavior: 'smooth'
        });
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
      // Скрыть контейнеры, если они видны
      if (inputContainer.classList.contains('show')) inputContainer.classList.remove('show');
      if (inputSector.classList.contains('show')) inputSector.classList.remove('show');
      if (!text.trim()) return;
  
      // Удалить старую подсветку
      document.querySelectorAll('.highlight').forEach(span => {
          const parent = span.parentNode;
          parent.replaceChild(document.createTextNode(span.textContent), span);
          parent.normalize();
      });
  
      const searchText = text.toLowerCase().trim();
      const markdownBlocks = document.querySelectorAll('.markdown-block');
      let foundElement = null;
  
      // Поиск первого блока, содержащего текст
      for (const block of markdownBlocks) {
          const blockText = block.textContent.toLowerCase();
          if (blockText.includes(searchText)) {
              foundElement = block;
              break;
          }
      }
  
      if (foundElement) {
        // Обход текстовых узлов в найденном блоке
        const walker = document.createTreeWalker(
            foundElement,
            NodeFilter.SHOW_TEXT,
        );

        let node;
        while ((node = walker.nextNode())) {
            const nodeText = node.textContent.toLowerCase();
            const start = nodeText.indexOf(searchText);
            if (start !== -1) {
              const range = document.createRange();
              range.setStart(node, start);
              range.setEnd(node, start + searchText.length);

              const highlightSpan = document.createElement('span');
              highlightSpan.className = 'highlight';
              range.surroundContents(highlightSpan);
              highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });

              // Удаляем подсветку через 2 секунды
              setTimeout(() => {
                  const parent = highlightSpan.parentNode;
                  parent.replaceChild(document.createTextNode(highlightSpan.textContent), highlightSpan);
                  parent.normalize();
              }, 2000);

              break; // Подсветили первое совпадение, выходим
            }
          }
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
  