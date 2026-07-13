import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MessageBubble({ message, isLast, onRegenerate }) {
  const isUser = message.role === 'user';
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser ? 'bg-blue-600' : 'bg-gray-800'
      }`}>
        <div className="prose prose-invert max-w-none text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative my-2">
                    <div className="flex justify-between items-center bg-gray-700 px-3 py-1 rounded-t text-xs text-gray-300">
                      <span>{match[1]}</span>
                      <button onClick={() => handleCopy(String(children).replace(/\n$/, ''))} className="hover:text-white">
                        <FiCopy size={12} />
                      </button>
                    </div>
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-700 px-1 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {isLast && message.role === 'assistant' && message.content && (
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => handleCopy(message.content)} className="text-gray-400 hover:text-white">
              <FiCopy size={14} />
            </button>
            <button onClick={onRegenerate} className="text-gray-400 hover:text-white">
              <FiRefreshCw size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
