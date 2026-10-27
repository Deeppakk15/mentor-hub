import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  Lightbulb,
  FileCheck,
  Compass,
  Calendar,
  ShieldAlert,
} from 'lucide-react';

export const StudentAIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your MentorHub AI Project Assistant.

I can help your team with:
- **Project Ideation:** Brainstorming domain-specific capstone topics.
- **Proposal Refinement:** Improving abstracts, problem statements, and objectives.
- **Architecture & Tech Stack:** Selecting frameworks, databases, and APIs.
- **12-Week Roadmaps:** Structuring milestone deliverables and tasks.
- **Viva Voce Prep:** Practicing questions typically asked by faculty review panels.

*Disclaimer: AI suggestions are advisory. Final academic sign-off rests with your faculty mentor.*`,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const promptSuggestions = [
    'Suggest innovative project ideas in Cybersecurity & Blockchain',
    'Review and improve our project abstract for clarity',
    'Recommend a scalable technology stack for our capstone',
    'Create a 12-week development milestone roadmap',
    'Generate challenging viva voce defense questions',
    'Suggest possible project security risks and mitigations',
  ];

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message,
        history: newMessages.slice(-6),
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.text }]);
    } catch (err) {
      toast.error('AI assistant response timed out. Please try again.');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I could not reach the Gemini service at this moment. Please check your network or try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    if (!window.confirm('Clear current conversation history?')) return;
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist with your capstone project today?',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Academic Project Assistant"
        description="Brainstorm capstone topics, refine proposals, architect technology stacks, and prepare for viva examinations with advisory AI support."
        actions={
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleClearChat}>
            Clear Chat
          </Button>
        }
      />

      {/* Advisory Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Academic Integrity Notice:</strong> All AI outputs are advisory suggestions. Your team is responsible for original code implementation, and faculty mentors make final decisions.
          </span>
        </div>
      </div>

      {/* Chat Window */}
      <Card className="h-[620px] flex flex-col overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`relative max-w-[85%] sm:max-w-2xl group ${isUser ? 'text-right' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none text-left'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none font-sans'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-200/80 text-xs text-slate-500">
                MentorHub AI is formulating academic recommendations...
              </div>
            </div>
          )}
        </div>

        {/* Prompt Suggestions Pills */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex gap-1.5 overflow-x-auto">
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about project ideas, abstract improvements, stack choices, or viva prep..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <Button
              type="submit"
              size="md"
              disabled={!inputMessage.trim() || loading}
              icon={Send}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
