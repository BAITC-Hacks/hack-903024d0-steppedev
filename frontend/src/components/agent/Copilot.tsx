import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ArrowUpRight, Bot, MessageSquare, Sparkles } from 'lucide-react'
import { useOperations } from '../../state/OperationsContext'
import { getCopilotAnswer, suggestedQuestions } from '../../services/copilot'
import { Dialog } from '../ui/dialog'
import { Button } from '../ui/button'
interface Message {
  question: string
  answer: string
  references: string[]
}
export function Copilot() {
  const { forecast, turbines, setPage, scenario } = useOperations()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setMessages([])
  }, [scenario])
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])
  const ask = (question: string) => {
    if (!forecast || !question.trim()) return
    setMessages((m) => [...m, { question, ...getCopilotAnswer(question, forecast, turbines) }])
    setInput('')
  }
  return (
    <>
      <button className="copilot-trigger" onClick={() => setOpen(true)}>
        <Sparkles size={16} />
        <span>Ask WindOps AI</span>
        <span className="copilot-key">
          <MessageSquare size={12} />
        </span>
      </button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="WindOps Copilot"
        description="Operational clarity, grounded in your forecast."
        drawer
      >
        <div className="copilot-intro">
          <div className="agent-orb small">
            <Bot size={23} />
          </div>
          <h3>What would you like to understand?</h3>
          <p>Explore your forecast and turbine behaviour.</p>
        </div>
        <div className="space-y-2">
          {suggestedQuestions.map((q) => (
            <button className="suggested-question" key={q} onClick={() => ask(q)}>
              {q}
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-5" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i}>
              <p className="mb-3 rounded-lg bg-white/5 p-3 text-sm">{m.question}</p>
              <div className="border-l-2 border-emerald-300/40 pl-4">
                <span className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-300">
                  <Sparkles size={11} />
                  WINDOPS AI
                </span>
                <p className="text-xs leading-6 text-[#a8b5c0]">{m.answer}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.references.map((r) => (
                    <button
                      className="reference-link"
                      key={r}
                      onClick={() => {
                        setPage(
                          r === 'Twin comparison' ? 'twin' : r === 'Agent event log' ? 'agent' : 'forecast',
                        )
                        setOpen(false)
                      }}
                    >
                      {r}
                      <ArrowUpRight size={10} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div ref={end} />
        </div>
        <form
          className="copilot-input"
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
        >
          <input
            aria-label="Ask WindOps AI"
            placeholder="Ask about your wind farm…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button size="icon" disabled={!input.trim() || !forecast} aria-label="Send question">
            <ArrowUp size={17} />
          </Button>
        </form>
        <p className="mt-3 text-center text-[10px] text-muted">
          Demo copilot · answers reference the displayed dataset
        </p>
      </Dialog>
    </>
  )
}
