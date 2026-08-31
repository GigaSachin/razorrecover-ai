import React, { useState } from 'react'
import { api } from '@/services/api'
import { HinglishChatResponse } from '@/types'
import { Card, Badge } from '@/components/common/Cards'
import {
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Tag,
  ShieldCheck,
  Smartphone,
  Bot,
  User,
  RotateCcw,
} from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface Message {
  sender: 'user' | 'agent'
  text: string
  timestamp: string
  metadata?: HinglishChatResponse
}

const SAMPLE_PROMPTS = [
  'Bhaiya abhi account me balance nahi hai, kal salary aane par pakka pay kar dunga.',
  'Sir yeh price thoda zyada lag raha hai, kuch discount mil sakta hai kya?',
  'Mere bank account se ₹1,499 kat gaye hain but yahan failed dikha raha hai!',
  'Mujhe payment link dobara bhejo, UPI se abhi karta hoon.',
  '5 tarikh ko EMI debit karna, tab tak paise arrange ho jayenge.',
]

export const HinglishRecoveryChatPage: React.FC = () => {
  const [customerName, setCustomerName] = useState('Rahul Sharma')
  const [amount, setAmount] = useState(1499)
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: 'Namaste Rahul ji! Razorpay recovery assistance se bol rahe hain. Aapka ₹1,499 ka transaction incomplete reh gaya tha. Kya aap abhi retry karna chahenge ya koi issue face kar rahe hain?',
      timestamp: 'Just now',
    },
  ])
  const [lastAnalysis, setLastAnalysis] = useState<HinglishChatResponse | null>(null)

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage
    if (!message.trim() || loading) return

    const userMsg: Message = {
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setLoading(true)

    try {
      const res = await api.sendHinglishChat({
        customer_message: message,
        customer_name: customerName,
        amount,
        failure_reason: 'UPI Intent Timed Out',
      })

      setLastAnalysis(res)

      const agentMsg: Message = {
        sender: 'agent',
        text: res.agent_reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: res,
      }

      setMessages((prev) => [...prev, agentMsg])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([
      {
        sender: 'agent',
        text: `Namaste ${customerName} ji! Razorpay recovery assistance se bol rahe hain. Aapka ${formatCurrency(amount)} ka transaction incomplete reh gaya tha. Kya aap abhi retry karna chahenge?`,
        timestamp: 'Just now',
      },
    ])
    setLastAnalysis(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Conversational Voice &amp; Chat Recovery
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hinglish Conversational Recovery Agent</h1>
          <p className="text-slate-400 text-sm mt-1">
            Empathetic Indian language negotiation: handles objections, generates 1-click payment links, and detects Promise-to-Pay commitments.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors w-fit"
        >
          <RotateCcw className="w-4 h-4" /> Reset Conversation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Chat Window (Mobile Mockup style) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col h-[620px]">
            {/* Chat Header */}
            <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    Razorpay Recovery Assistant
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  </h3>
                  <p className="text-xs text-slate-400">WhatsApp / Voice Conversational Engine</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Transaction Value</span>
                <span className="text-sm font-bold text-emerald-400">{formatCurrency(amount)}</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700/70 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[10px] block mt-1.5 ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-lg w-fit">
                  <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>AI Agent is analyzing intent & composing Hinglish reply...</span>
                </div>
              )}
            </div>

            {/* Quick Sample Prompts Bar */}
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80 overflow-x-auto flex gap-2">
              <span className="text-[11px] text-slate-400 flex items-center flex-shrink-0 font-medium">
                Try Sample Prompts:
              </span>
              {SAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700 transition-colors disabled:opacity-50"
                >
                  {prompt.slice(0, 32)}...
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type customer reply in Hindi/English/Hinglish (e.g. 5 tarikh ko salary aayegi)..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </Card>
        </div>

        {/* Live AI Reasoning & NLP Inspector */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> NLP Intelligence
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {lastAnalysis?.model_used || "Google Gemini 1.5 Flash"}
              </span>
            </div>

            {lastAnalysis ? (
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Detected Customer Intent
                  </span>
                  <span className="inline-block mt-1 font-mono text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md font-bold">
                    {lastAnalysis.intent_detected}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Customer Sentiment
                  </span>
                  <span className="text-xs font-semibold text-slate-200 capitalize">
                    {lastAnalysis.sentiment}
                  </span>
                </div>

                {lastAnalysis.promise_to_pay_detected && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Promise-to-Pay (PTP) Committed!
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Promised Date: <span className="font-bold text-white">{lastAnalysis.promised_date}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automated dunning paused to respect customer commitment.
                    </p>
                  </div>
                )}

                {lastAnalysis.discount_offered_percent && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Tag className="w-4 h-4" /> Dynamic Incentive Applied
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Discount: <span className="font-bold text-white">{lastAnalysis.discount_offered_percent}% OFF</span>
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Next Recommended Step
                  </span>
                  <p className="text-xs text-slate-300 mt-1 bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                    {lastAnalysis.next_recommended_step}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Send a message or click a sample prompt to view live NLP intent breakdown, sentiment, and PTP extraction.
              </div>
            )}
          </Card>

          {/* Context Settings */}
          <Card className="border-slate-800 bg-slate-900/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Simulation Context</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
