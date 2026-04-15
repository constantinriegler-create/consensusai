import { useState } from 'react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function IndividualAnswers({ individual }) {
  const [open, setOpen] = useState(false)
  if (!individual) return null
  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 8, color: '#666', fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}
      >
        {open ? 'Hide individual answers' : 'See individual answers'}
      </button>
      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['GPT-4o', individual.openai], ['Claude', individual.claude]].map(([name, text]) => (
            <div key={name} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 10, letterSpacing: '0.05em' }}>{name.toUpperCase()}</div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#bbb', margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [keys, setKeys] = useState({ openai: '', anthropic: '' })
  const [name, setName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [chats, setChats] = useState([{ id: 1, title: 'New chat', messages: [] }])
  const [activeChatId, setActiveChatId] = useState(1)

  const keysEntered = keys.openai && keys.anthropic

  async function handleSubmit() {
    if (!prompt.trim() || loading) return
    const userMessage = prompt
    setPrompt('')
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    const res = await fetch('http://localhost:3000/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage, keys })
    })
    const data = await res.json()
    const answer = data.answer
    if (!answer) { setLoading(false); return }
    const finalMessages = [...newMessages, { role: 'assistant', content: answer, individual: data.individual }]
    setMessages(finalMessages)

    setChats(prev => prev.map(c =>
      c.id === activeChatId
        ? { ...c, title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''), messages: finalMessages }
        : c
    ))
    setLoading(false)
  }

  function newChat() {
    const id = Date.now()
    setChats(prev => [...prev, { id, title: 'New chat', messages: [] }])
    setActiveChatId(id)
    setMessages([])
  }

  function switchChat(chat) {
    setActiveChatId(chat.id)
    setMessages(chat.messages)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>

      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 32, width: 420 }}>
            <h3 style={{ marginBottom: 6, fontSize: 18 }}>Setup</h3>
            <p style={{ color: '#555', fontSize: 13, marginBottom: 24 }}>Your keys are never stored — they live only in this session.</p>
            <label style={{ fontSize: 12, color: '#777' }}>Your name</label>
            <input placeholder="Constantin" value={name} onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', marginTop: 6, marginBottom: 20, borderRadius: 8, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 14 }} />
            <label style={{ fontSize: 12, color: '#777' }}>OpenAI API key</label>
            <input placeholder="sk-proj-..." value={keys.openai} onChange={e => setKeys({ ...keys, openai: e.target.value })} type="password"
              style={{ width: '100%', padding: '10px 12px', marginTop: 6, marginBottom: 16, borderRadius: 8, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13 }} />
            <label style={{ fontSize: 12, color: '#777' }}>Anthropic API key</label>
            <input placeholder="sk-ant-..." value={keys.anthropic} onChange={e => setKeys({ ...keys, anthropic: e.target.value })} type="password"
              style={{ width: '100%', padding: '10px 12px', marginTop: 6, marginBottom: 28, borderRadius: 8, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowKeyModal(false)}
                style={{ flex: 1, padding: '11px', borderRadius: 8, background: '#6366f1', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                Save & start
              </button>
              <button onClick={() => setShowKeyModal(false)}
                style={{ padding: '11px 16px', borderRadius: 8, background: 'none', border: '1px solid #2a2a2a', color: '#666', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: 260, background: '#111', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: '16px 12px' }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, padding: '0 8px' }}>ConsensusAI</div>
        <button onClick={newChat}
          style={{ padding: '9px 12px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', fontSize: 13, cursor: 'pointer', marginBottom: 20, textAlign: 'left' }}>
          + New chat
        </button>
        <div style={{ fontSize: 11, color: '#444', marginBottom: 8, padding: '0 8px', letterSpacing: '0.05em' }}>RECENT</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.slice().reverse().map(chat => (
            <div key={chat.id} onClick={() => switchChat(chat)}
              style={{ padding: '9px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: chat.id === activeChatId ? '#1e1e1e' : 'none', color: chat.id === activeChatId ? '#fff' : '#666', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {chat.title}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16, marginTop: 8 }}>
          <div style={{ fontSize: 11, color: '#444', marginBottom: 10, padding: '0 8px', letterSpacing: '0.05em' }}>MODELS ACTIVE</div>
          {['GPT-4o', 'Claude', 'Synthesis'].map(m => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }}/>
              <span style={{ fontSize: 13, color: '#666' }}>{m}</span>
            </div>
          ))}
          <button onClick={() => setShowKeyModal(true)}
            style={{ marginTop: 16, width: '100%', padding: '9px 12px', borderRadius: 8, background: keysEntered ? '#0f1f0f' : '#1a1a1a', border: `1px solid ${keysEntered ? '#1a3a1a' : '#2a2a2a'}`, color: keysEntered ? '#4ade80' : '#777', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
            {keysEntered ? '🔑 Keys connected' : '🔑 Add API keys'}
          </button>
          <div style={{ marginTop: 20, padding: '0 8px', fontSize: 11, color: '#333', lineHeight: 1.6 }}>
            Created by<br/>
            <span style={{ color: '#555', fontWeight: 500 }}>Constantin Riegler</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 0' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '14vh', padding: '0 40px' }}>
              <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 10, color: '#fff' }}>
                {getGreeting()}{name ? `, ${name}` : ''}.
              </div>
              <div style={{ fontSize: 16, color: '#555', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
                How can I help you today?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 580, margin: '0 auto 40px' }}>
                {[
                  { title: 'Multiple AIs, one answer', desc: 'Your prompt is sent to GPT-4o and Claude simultaneously — not just one.' },
                  { title: 'Confidence map', desc: 'See exactly where AIs agreed, partially agreed, or genuinely conflicted.' },
                  { title: 'Synthesis engine', desc: 'A third AI reads all answers and combines them into the most accurate response.' },
                  { title: 'More trustworthy', desc: 'Consensus across models reduces the chance of hallucination or bias.' },
                ].map((card, i) => (
                  <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px', textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#ccc', marginBottom: 6 }}>{card.title}</div>
                    <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{card.desc}</div>
                  </div>
                ))}
              </div>
              {!keysEntered && (
                <button onClick={() => setShowKeyModal(true)}
                  style={{ padding: '11px 24px', borderRadius: 8, background: '#6366f1', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                  Add API keys to start
                </button>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ maxWidth: 740, margin: '0 auto 28px', padding: '0 24px' }}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: '#1e1e2e', padding: '12px 18px', borderRadius: 18, maxWidth: '75%', fontSize: 15, lineHeight: 1.6 }}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, color: '#444', marginBottom: 12, letterSpacing: '0.05em' }}>CONSENSUSAI</div>

                  {/* Combined answer FIRST */}
                  <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: '#444', letterSpacing: '0.05em' }}>COMBINED ANSWER</span>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#1a1a1a', color: '#555', border: '1px solid #2a2a2a' }}>
                        {msg.content.confidence} confidence
                      </span>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: '#ddd', margin: 0 }}>{msg.content.summary}</p>
                  </div>

                  {/* Confidence map SECOND */}
                  <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#444', marginBottom: 14, letterSpacing: '0.05em' }}>CONFIDENCE MAP</div>
                    {msg.content.agreed?.map((point, j) => (
                      <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: 5 }}/>
                        <span style={{ fontSize: 14, color: '#bbb', lineHeight: 1.6 }}>{point}</span>
                      </div>
                    ))}
                    {msg.content.partial?.map((point, j) => (
                      <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#eab308', flexShrink: 0, marginTop: 5 }}/>
                        <span style={{ fontSize: 14, color: '#bbb', lineHeight: 1.6 }}>{point}</span>
                      </div>
                    ))}
                    {msg.content.conflicted?.map((point, j) => (
                      <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 5 }}/>
                        <span style={{ fontSize: 14, color: '#bbb', lineHeight: 1.6 }}>{point}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11 }}>
                      <span style={{ color: '#22c55e' }}>● Agreed</span>
                      <span style={{ color: '#eab308' }}>● Partial</span>
                      <span style={{ color: '#ef4444' }}>● Conflict</span>
                    </div>
                  </div>

                  <IndividualAnswers individual={msg.individual} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 24px' }}>
              <div style={{ fontSize: 11, color: '#444', marginBottom: 10, letterSpacing: '0.05em' }}>CONSENSUSAI</div>
              <div style={{ color: '#444', fontSize: 14 }}>Asking all AIs simultaneously...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid #151515' }}>
          <div style={{ maxWidth: 740, margin: '0 auto', position: 'relative' }}>
            <textarea
              placeholder={keysEntered ? 'Ask anything...' : 'Add API keys to start →'}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!keysEntered}
              rows={1}
              style={{ width: '100%', padding: '14px 56px 14px 18px', borderRadius: 12, border: '1px solid #1e1e1e', background: '#111', color: '#fff', fontSize: 15, resize: 'none', lineHeight: 1.6, opacity: keysEntered ? 1 : 0.4 }}
            />
            <button onClick={handleSubmit} disabled={loading || !keysEntered}
              style={{ position: 'absolute', right: 10, bottom: 10, background: loading || !keysEntered ? '#222' : '#6366f1', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: keysEntered && !loading ? 'pointer' : 'default', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ↑
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#2a2a2a', marginTop: 8 }}>
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  )
}

export default App