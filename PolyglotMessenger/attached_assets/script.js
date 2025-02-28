// Initialize DOM elements
  const themeToggle = document.getElementById('theme-toggle');
  const toggleSidebar = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  const messagesContainer = document.getElementById('messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const history = document.getElementById('history');
  const newChatBtn = document.getElementById('new-chat-btn');
  const searchInput = document.getElementById('search-input');
  const translateToggle = document.getElementById('translate-toggle');
  const languageDropdown = document.getElementById('language-dropdown');
  const overlay = document.getElementById('overlay');

  // Theme handling
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  document.body.setAttribute('data-theme', savedTheme || (prefersDark ? 'dark' : 'light'));
  themeToggle.textContent = document.body.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
  });

  // Sidebar handling
  toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    if (!sidebar.classList.contains('hidden')) {
      overlay.style.display = 'block';
    } else {
      overlay.style.display = 'none';
    }
  });

  // Chat functionality
  let currentChatId = Date.now();
  let chats = {};
  let currentLang = localStorage.getItem('selectedLanguage') || 'en';

  function generateChatName(messages) {
    if (messages.length === 0) return translations[currentLang].newChat;
    const firstMessage = messages[0];
    const words = firstMessage.content.split(' ').slice(0, 3).join(' ');
    return words + (words.length < firstMessage.content.length ? '...' : '');
  }

  // Translations
  const translations = {
    en: {
      newChat: "New Chat",
      history: "AMIK History",
      assistant: "AMIK AI ASSISTANT",
      searchPlaceholder: "Search messages...",
      messagePlaceholder: "Type a message...",
      send: "Send",
      noResults: "No messages found"
    },
    zh: {
      newChat: "新对话",
      history: "艾米克历史",
      assistant: "艾米克人工智能助手",
      searchPlaceholder: "搜索消息...",
      messagePlaceholder: "输入消息...",
      send: "发送",
      noResults: "未找到消息"
    },
    ur: {
      newChat: "نئی چیٹ",
      history: "اے ایم آئی کے ہسٹری",
      assistant: "اے ایم آئی کے مصنوعی ذہانت اسسٹنٹ",
      searchPlaceholder: "پیغامات تلاش کریں...",
      messagePlaceholder: "پیغام ٹائپ کریں...",
      send: "بھیجیں",
      noResults: "کوئی پیغام نہیں ملا"
    }
  };

  // Language handling
  function updateUILanguage() {
    const t = translations[currentLang];
    searchInput.placeholder = t.searchPlaceholder;
    messageInput.placeholder = t.messagePlaceholder;
    sendButton.textContent = t.send;
    document.querySelector('#sidebar-header h2').textContent = t.history;
    document.querySelector('#header h1').textContent = t.assistant;
    newChatBtn.textContent = t.newChat;
    updateHistory();
  }

  translateToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.style.display = languageDropdown.style.display === 'none' ? 'block' : 'none';
    overlay.style.display = languageDropdown.style.display === 'none' ? 'none' : 'block';
  });

  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
      currentLang = option.getAttribute('data-lang');
      localStorage.setItem('selectedLanguage', currentLang);
      updateUILanguage();
      languageDropdown.style.display = 'none';
      overlay.style.display = 'none';
    });
  });

  overlay.addEventListener('click', () => {
    languageDropdown.style.display = 'none';
    overlay.style.display = 'none';
    if (!sidebar.classList.contains('hidden')) {
      sidebar.classList.add('hidden');
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    updateUILanguage();
    createNewChat();
  });

  function createNewChat() {
    currentChatId = Date.now();
    chats[currentChatId] = {
      messages: [],
      timestamp: Date.now(),
      name: translations[currentLang].newChat
    };
    clearMessages();
    updateHistory();
  }

  function addMessage(content, isUser = true) {
    const message = {
      content,
      isUser,
      timestamp: new Date()
    };
    
    if (!chats[currentChatId]) {
      createNewChat();
    }

    chats[currentChatId].messages.push(message);
    
    if (chats[currentChatId].messages.length === 1) {
      chats[currentChatId].name = generateChatName(chats[currentChatId].messages);
    }

    displayMessage(message);
    updateHistory();
  }

  function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.isUser ? 'user' : ''} animate-fade-in`;
    messageElement.innerHTML = `
      ${message.content}
      <div class="timestamp">${message.timestamp}</div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function clearMessages() {
    messagesContainer.innerHTML = '';
  }

  function updateHistory() {
    history.innerHTML = '';
    const sortedChats = Object.entries(chats)
      .sort(([, a], [, b]) => b.timestamp - a.timestamp);

    sortedChats.forEach(([chatId, chat]) => {
      const chatElement = document.createElement('div');
      chatElement.className = 'chat-section';
      if (chatId === currentChatId.toString()) {
        chatElement.classList.add('active');
      }

      chatElement.innerHTML = `
        <div class="chat-section-header">
          ${generateChatName(chat.messages)}
          <button class="delete-chat-btn" aria-label="Delete chat">🗑️</button>
        </div>
      `;

      const deleteBtn = chatElement.querySelector('.delete-chat-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        delete chats[chatId];
        if (chatId === currentChatId.toString()) {
          createNewChat();
        } else {
          updateHistory();
        }
      });

      chatElement.addEventListener('click', () => {
        currentChatId = parseInt(chatId);
        document.querySelectorAll('.chat-section').forEach(el => el.classList.remove('active'));
        chatElement.classList.add('active');
        clearMessages();
        chat.messages.forEach(msg => displayMessage(msg));
        
        // Auto-close sidebar on mobile after selecting a chat
        if (window.innerWidth <= 768) {
          sidebar.classList.add('hidden');
          overlay.style.display = 'none';
        }
      });

      history.appendChild(chatElement);
    });
  }

  // Event listeners
  newChatBtn.addEventListener('click', createNewChat);

  sendButton.addEventListener('click', () => {
    const content = messageInput.value.trim();
    if (content) {
      addMessage(content);
      messageInput.value = '';
    }
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const chatElements = history.querySelectorAll('.chat-section');

    chatElements.forEach(chatElement => {
      const chatName = chatElement.querySelector('.chat-section-header').textContent.toLowerCase();
      chatElement.style.display = chatName.includes(searchTerm) ? 'block' : 'none';
    });

    if ([...chatElements].every(el => el.style.display === 'none')) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No matching chats found';
      history.appendChild(noResults);
    }
  });

  // Initialize the chat
  createNewChat();
  document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      sidebar.classList.add('hidden');
    }
    updateUILanguage();
  });

  // Update sidebar state on window resize
  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile && sidebar.classList.contains('hidden')) {
      sidebar.classList.remove('hidden');
    } else if (isMobile && !sidebar.classList.contains('hidden')) {
      sidebar.classList.add('hidden');
    }
  });

  // Handle clicks outside of sidebar and language dropdown
  document.addEventListener('click', (e) => {
    // Handle language dropdown clicks
    if (!languageDropdown.contains(e.target) && e.target !== translateToggle) {
      languageDropdown.style.display = 'none';
      overlay.style.display = 'none';
    }

    // Handle sidebar clicks on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !sidebar.contains(e.target) && !toggleSidebar.contains(e.target)) {
      sidebar.classList.add('hidden');
      overlay.style.display = 'none';
    }
  });

  // Initialize the chat interface
  updateUILanguage();
  createNewChat();

  // Update language dropdown positioning
  const updateDropdownPosition = () => {
    const translateButton = document.getElementById('translate-toggle');
    const dropdown = document.getElementById('language-dropdown');
    const rect = translateButton.getBoundingClientRect();
    
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 10}px`;
    dropdown.style.right = '20px';
    dropdown.style.left = 'auto';
    dropdown.style.transform = 'none';
  };

  window.addEventListener('resize', () => {
    if (languageDropdown.style.display === 'block') {
      updateDropdownPosition();
    }
  });