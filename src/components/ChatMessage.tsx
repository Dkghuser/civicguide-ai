import { motion } from "motion/react";
import { User, Bot } from "lucide-react";
import { Message } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-6 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isAssistant ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div
        className={`max-w-[80%] p-4 rounded-2xl overflow-hidden ${
          isAssistant
            ? "bg-white border border-zinc-100 text-zinc-800 shadow-sm"
            : "bg-blue-600 text-white"
        }`}
      >
        {isAssistant ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap markdown-content overflow-x-auto">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-zinc-900" {...props} />,
                code: ({node, ...props}) => <code className="bg-zinc-100 px-1 py-0.5 rounded text-xs" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </motion.div>
  );
}
