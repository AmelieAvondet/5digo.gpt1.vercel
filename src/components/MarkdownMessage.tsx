// Componente para renderizar mensajes con formato Markdown
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export default function MarkdownMessage({ content, isUser = false }: MarkdownMessageProps) {
  if (isUser) {
    // Mensajes del usuario sin formato especial
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }

  // Mensajes de la IA con formato Markdown
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Encabezados
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold text-gray-900 mt-3 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold text-gray-900 mt-2 mb-1" {...props} />
          ),

          // Párrafos
          p: ({ node, ...props }) => (
            <p className="text-sm text-gray-800 mb-2 leading-relaxed" {...props} />
          ),

          // Listas
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside text-sm text-gray-800 mb-2 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside text-sm text-gray-800 mb-2 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
          ),

          // Código en línea
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');

            return !inline && match ? (
              // Bloque de código con syntax highlighting
              <div className="my-3">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    padding: '1rem',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              // Código en línea
              <code
                className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Citas
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-2"
              {...props}
            />
          ),

          // Énfasis
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),

          // Enlaces
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Línea horizontal
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-gray-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
