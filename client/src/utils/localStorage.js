const STORAGE_KEY = 'evilmod_conversations';

export const getConversations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveConversations = (conversations) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
};

export const addConversation = (conv) => {
  const conversations = getConversations();
  conversations.unshift(conv);
  saveConversations(conversations);
};

export const updateConversation = (id, updates) => {
  const conversations = getConversations().map(c =>
    c.id === id ? { ...c, ...updates } : c
  );
  saveConversations(conversations);
};

export const deleteConversation = (id) => {
  saveConversations(getConversations().filter(c => c.id !== id));
};
