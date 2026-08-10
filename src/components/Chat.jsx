import { useState, useEffect, useRef } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore'

const Chat = ({ requestId }) => {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    const q = query(
      collection(db, 'requests', requestId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [requestId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    const messageText = text
    setText('')
    try {
      await addDoc(collection(db, 'requests', requestId, 'messages'), {
        text: messageText,
        senderId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="border-t border-warm-gray pt-4 mt-4">
      <h3 className="font-medium text-dark-text mb-3">المحادثة</h3>
      <div className="bg-white rounded-xl border border-warm-gray p-3 h-64 overflow-y-auto flex flex-col gap-2 mb-3">
        {messages.length === 0 && (
          <p className="text-dark-text/50 text-sm text-center my-auto">لا توجد رسائل بعد</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === auth.currentUser.uid
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  isMine ? 'bg-copper text-white' : 'bg-primary-bg text-dark-text'
                }`}
              >
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
        />
        <button
          type="submit"
          className="bg-copper text-white px-5 py-2.5 rounded-xl font-medium hover:bg-copper/90 transition-colors"
        >
          إرسال
        </button>
      </form>
    </div>
  )
}

export default Chat
