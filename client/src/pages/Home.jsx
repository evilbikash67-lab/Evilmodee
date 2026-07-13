import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatArea from '../components/Chat/ChatArea';
import ChatInput from '../components/Chat/ChatInput';
import ModelSelector from '../components/Chat/ModelSelector';
import TypingIndicator from '../components/Chat/TypingIndicator';
import ExportMenu from '../components/Chat/ExportMenu';
import MaintenanceBanner from '../components/UI/MaintenanceBanner';
import { getConversations, addConversation, updateConversation, deleteConversation } from '../utils/localStorage';
import { streamChatCompletion } from '../utils/stream';
import { fetchModels, fetchAnnouncement } from '../utils/api';
import toast from 'react-hot-toast';

export default function Home() {
  const [conversations, setConversations] = useState(getConversations());
  const [activeConvId, setActiveConvId] = useState(null);
  const [modelAlias, setModelAlias] = useState('Evil Alpha');
  const [models, setModels] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const abortRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  // Load model list
  useEffect(() => {
    fetchModels().then(setModels).catch(() => toast.error('Failed to load models'));
  }, []);

  // Check for announcements/maintenance
  useEffect(() => {
    fetchAnnouncement().then(data => {
      if (data && data.message) setAnnouncement(data);
    });
  }, []);

  // Auto-create first conversation
  useEffect(() => {
    if (conversations.length === 0) {
      handleNewChat();
    } else if (!activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleNewChat = () => {
    const newConv = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      modelAlias,
      createdAt: Date.now(),
    };
    addConversation(newConv);
    setConversations(getConversations());
    setActiveConvId(newConv.id);
  };

  const handleSelect = (id) => setActiveConvId(id);

  const handleDelete = (id) => {
    deleteConversation(id);
    setConversations(getConversations());
    if (activeConvId === id) {
      const remaining = getConversations();
      setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRename = (id, title) => {
    updateConversation(id, { title });
    setConversations(getConversations());
  };

  const handleSend = async (userInput) => {
    if (!activeConvId || streaming) return;
    const updatedMessages = [
      ...activeConv.messages,
      { role: 'user', content: userInput },
    ];
    updateConversation(activeConvId, { messages: updatedMessages });
    setConversations(getConversations());

    // Auto title on first message
    if (activeConv.messages.length === 0) {
      updateConversation(activeConvId, { title: userInput.slice(0, 40) });
    }

    setStreaming(true);
    const assistantMsg = { role: 'assistant', content: '' };
    updateConversation(activeConvId, { messages: [...updatedMessages, assistantMsg] });
    setConversations(getConversations());

    abortRef.current = new AbortController();
    try {
      await streamChatCompletion(
        modelAlias,
        updatedMessages,
        (chunk) => {
          const conv = getConversations().find(c => c.id === activeConvId);
          if (conv) {
            const msgs = [...conv.messages];
            const last = { ...msgs[msgs.length - 1] };
            last.content += chunk;
            msgs[msgs.length - 1] = last;
            updateConversation(activeConvId, { messages: msgs });
            setConversations(getConversations());
          }
        },
        () => setStreaming(false),
        (err) => {
          toast.error(err.message);
          setStreaming(false);
        },
        abortRef.current.signal
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Generation failed');
      }
      setStreaming(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const handleRegenerate = async () => {
    if (!activeConv || activeConv.messages.length < 2) return;
    const msgs = [...activeConv.messages];
    if (msgs[msgs.length - 1].role === 'assistant') msgs.pop();
    const userMsg = msgs.pop();
    updateConversation(activeConvId, { messages: msgs });
    setConversations(getConversations());
    await handleSend(userMsg.content);
  };

  const exportChat = (format) => {
    if (!activeConv) return;
    let content = '';
    if (format === 'markdown') {
      content = `# ${activeConv.title}\n\n` + activeConv.messages.map(m =>
        `**${m.role}:** ${m.content}`
      ).join('\n\n');
    } else {
      content = JSON.stringify(activeConv, null, 2);
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${activeConv.title.slice(0,20)}.${format === 'markdown' ? 'md' : 'json'}`;
    a.click();
    toast.success('Exported!');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={handleSelect}
        onNew={handleNewChat}
        onDelete={handleDelete}
        onRename={handleRename}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-900">
          <ModelSelector selected={modelAlias} onChange={setModelAlias} models={models} />
          <div className="flex gap-2">
            {streaming && (
              <button onClick={handleStop} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
                Stop
              </button>
            )}
            <button
              onClick={() => setShowExport(!showExport)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Export
            </button>
          </div>
        </div>

        {/* Announcement banner */}
        {announcement && <MaintenanceBanner message={announcement.message} type={announcement.type} />}

        {/* Chat area */}
        <ChatArea
          messages={activeConv?.messages || []}
          streaming={streaming}
          onRegenerate={handleRegenerate}
          messagesEndRef={messagesEndRef}
        />
        {streaming && !activeConv?.messages.some(m => m.role === 'assistant' && m.content.length > 0) && (
          <TypingIndicator />
        )}

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={streaming} />

        {/* Export dropdown */}
        {showExport && (
          <ExportMenu
            onExport={exportChat}
            onClose={() => setShowExport(false)}
          />
        )}
      </div>
    </div>
  );
    }
