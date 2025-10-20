import { useEffect, useRef, useState } from 'react'
import { authenticateSession, fetchMessages, sendMessage } from '@/lib/api'
import { getSocket } from '@/lib/socket'

export function useRealtimeMessages(selectedAppointmentId?: string) {
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const roomRef = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedAppointmentId) return
    let isMounted = true

    async function loadMessages() {
      try {
        await authenticateSession()
        const threadId = `appointment_${selectedAppointmentId}`
        roomRef.current = threadId
        const data = await fetchMessages(threadId)
        if (isMounted) setMessages(data)
      } catch (error) {
        console.error('Message load failed', error)
      }
    }

    loadMessages()

    const socket = getSocket()
    socket.on('message:new', msg => {
      if (msg.threadId === roomRef.current) {
        setMessages(prev => [...prev, msg])
      }
    })

    return () => {
      isMounted = false
      socket.off('message:new')
    }
  }, [selectedAppointmentId])

  const sendChat = async () => {
    if (!roomRef.current || !messageText.trim()) return
    await authenticateSession()
    await sendMessage(roomRef.current, messageText.trim())
    setMessageText('')
  }

  return { messages, messageText, setMessageText, sendChat }
}
