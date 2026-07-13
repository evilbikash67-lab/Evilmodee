import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatArea({ messages, streaming, onRegenerate, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !streaming && (
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          Start a conversation by typing below
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} isLast={i === messages.length - 1 && msg.role === 'assistant'} onRegenerate={onRegenerate} />
      ))}
      {streaming && messages.length > 0 && messages[messages.length-1].role === 'assistant' && messages[messages.length-1].content === '' && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
