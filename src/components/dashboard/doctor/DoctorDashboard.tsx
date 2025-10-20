'use client'

import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from "firebase/auth";
import { useDoctorData } from '@/hooks/useDoctorData'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import {
  FirestoreAppointment,
  FirestoreSymptom,
  FirestoreEmergency,
  FirestoreCall,
  FirestoreMessage,
} from '../../../types/DoctorTypes'
import {
  authenticateSession,
  fetchAppointments,
  fetchMessages,
  sendMessage,
  updateAppointment,
  fetchSymptoms,
  fetchMothers,
  Appointment,
  Message,
  Symptom,
  Mother
} from '@/lib/api'
import { getSocket } from '@/lib/socket'

import DoctorSideBar from './DoctorSideBar'
import DoctorHeader from './DoctorHeader'
import DoctorHome from './DoctorHome'
// import AppointmentList from './AppointmentList'
import SymptomsList from './SymptomsList'
import ChatSection from './ChatSection'
import EmergencyList from './EmergencyList'
import IncomingCallModal from './IncomingCallModal'
import VideoCallModal from './VideoCallModal'
import MotherList from './MotherList'
import ChatList from './ChatList'
import DoctorSettings from './Setting'
import VideoCall from '../VideoCall';
import LocationTracker from '../LocationTracker';
import { signOut } from 'firebase/auth';

export default function DoctorDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<
    'home' | 'patients' | 'chats' | 'video' | 'alerts' | 'settings'
  >('home')


   const { mothers, appointments, emergencies, newBookingsCount, symptoms } = useDoctorData(user?.uid)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const { messages, messageText, setMessageText, sendChat } = useRealtimeMessages(selectedAppointment?.id)


  const [expanded, setExpanded] = useState<boolean>(false)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  const [chatMessages, setChatMessages] = useState<FirestoreMessage[]>([])
  const [showVideoCall, setShowVideoCall] = useState<boolean>(false)
  const [incomingCall, setIncomingCall] = useState<FirestoreCall | null>(null)
  
const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);


  const chatRoomRef = useRef<string | null>(null)

  const navItems = [
    { name: 'Home', key: 'home' },
    { name: 'Patients', key: 'patients' },
    { name: 'Chats', key: 'chats' },
    { name: 'Video', key: 'video' },
    { name: 'Alerts', key: 'alerts' },
    { name: 'Settings', key: 'settings' },
  ]


  // API data fetching

  // useEffect(() => {
  //   if (!user) return

  //   const loadAppointments = async () => {
  //     try {
  //       await authenticateSession()
  //       const appointmentsData = await fetchAppointments(user.uid)
  //       const firestoreAppointments: FirestoreAppointment[] = appointmentsData.map((appt: Appointment) => {
  //         const mother = mothers.find(m => m.id === appt.motherId)
  //         return {
  //           id: appt.id,
  //           motherId: appt.motherId,
  //           motherName: mother ? mother.name : 'Mother',
  //           notes: appt.notes,
  //           scheduledAt: new Date(appt.startAt),
  //           status: appt.status,
  //           urgent: appt.urgent,
  //           createdAt: appt.createdAt,
  //         }
  //       })
  //       setAppointments(firestoreAppointments)

  //       if (!selectedAppointment && firestoreAppointments.length) setSelectedAppointment(firestoreAppointments[0])

  //       const tenMinutesAgo = Date.now() - 10 * 60 * 1000
  //       const recent = firestoreAppointments.filter((a) => {
  //         const created = typeof a.createdAt === 'object' && a.createdAt.seconds
  //           ? a.createdAt.seconds * 1000
  //           : new Date(a.createdAt).getTime()
  //         return created >= tenMinutesAgo
  //       })
  //       setNewBookingsCount(recent.length)

  //       setEmergencies(firestoreAppointments.filter((a) => a.urgent === true))
  //     } catch (error) {
  //       console.error('Failed to load appointments:', error)
  //     }
  //   }

  //   loadAppointments()
  // }, [user])

  // Fetch mothers data
  // useEffect(() => {
  //   if (!user) return

  //   const loadMothers = async () => {
  //     try {
  //       await authenticateSession()
  //       const mothersData = await fetchMothers()
  //       setMothers(mothersData)
  //     } catch (error) {
  //       console.error('Failed to load mothers:', error)
  //     }
  //   }

  //   loadMothers()
  // }, [user])

  // Fetch symptoms
  // useEffect(() => {
  //   if (!user) return

  //   const loadSymptoms = async () => {
  //     try {
  //       await authenticateSession()
  //       const symptomsData = await fetchSymptoms()
  //       const firestoreSymptoms: FirestoreSymptom[] = symptomsData.map((symptom: Symptom) => ({
  //         id: symptom.id,
  //         motherId: symptom.motherId,
  //         summary: symptom.summary,
  //         details: symptom.details,
  //         createdAt: symptom.createdAt,
  //       }))
  //       setSymptoms(firestoreSymptoms)
  //     } catch (error) {
  //       console.error('Failed to load symptoms:', error)
  //     }
  //   }

  //   loadSymptoms()
  // }, [user])

  // Symptoms are now fetched from API

  // Video calls - now integrated with API calls

  // useEffect(() => {
  //   if (!selectedAppointment) {
  //     setChatMessages([])
  //     chatRoomRef.current = null
  //     return
  //   }

  //   const loadMessages = async () => {
  //     try {
  //       await authenticateSession()
  //       const threadId = `appointment_${selectedAppointment.id}`
  //       chatRoomRef.current = threadId
  //       const messagesData = await fetchMessages(threadId)
  //       const firestoreMessages: FirestoreMessage[] = messagesData.map((msg: Message) => ({
  //         id: msg.id,
  //         threadId: msg.threadId,
  //         senderId: msg.senderId,
  //         text: msg.text,
  //         createdAt: msg.createdAt,
  //       }))
  //       setChatMessages(firestoreMessages)
  //     } catch (error) {
  //       console.error('Failed to load messages:', error)
  //     }
  //   }

  //   loadMessages()

  //   // Set up Socket.IO for real-time messages
  //   const socket = getSocket()
  //   socket.on('message:new', (message: { id: string; threadId: string; senderId: string; text: string; createdAt: string | number | Date }) => {
  //     if (message.threadId === chatRoomRef.current) {
  //       setChatMessages(prev => [...prev, {
  //         id: message.id,
  //         threadId: message.threadId,
  //         senderId: message.senderId,
  //         text: message.text,
  //         createdAt: message.createdAt,
  //       }])
  //     }
  //   })

  //   return () => {
  //     socket.off('message:new')
  //   }
  // }, [selectedAppointment, user])


  
  // ---------------------------
  //  Core Handlers
  // ---------------------------

  const handleLogout = async () => {
     try {
          await signOut(auth);
          try {
            await fetch('/api/logout', { method: 'POST' });
          } catch {}
          router.push('/');
        } catch (error) {
          console.error('Logout error:', error);
        }
  }

  const sendChatMessage = async () => {
    if (!chatRoomRef.current || !messageText.trim() || !user) return
    try {
      await authenticateSession()
      await sendMessage(chatRoomRef.current, messageText.trim())
      setMessageText('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const acceptAppointment = async (appt: FirestoreAppointment) => {
    if (!appt?.id) return
    try {
      await authenticateSession()
      await updateAppointment(appt.id, { status: 'accepted' })
    } catch (error) {
      console.error('Failed to accept appointment:', error)
    }
  }


  // Video call handlers - now with API integration
  const acceptIncomingCall = async () => {
    if (!incomingCall) return
    try {
      await authenticateSession()
      // TODO: Implement accept call API endpoint
      setShowVideoCall(true)
    } catch (error) {
      console.error('Failed to accept call:', error)
    }
  }

  const declineIncomingCall = async () => {
    if (!incomingCall) return
    try {
      await authenticateSession()
      // TODO: Implement decline call API endpoint
      setIncomingCall(null)
    } catch (error) {
      console.error('Failed to decline call:', error)
    }
  }

  const endVideoCallViaModal = async () => {
    setShowVideoCall(false)
    if (incomingCall) {
      try {
        await authenticateSession()
        // TODO: Implement end call API endpoint
        setIncomingCall(null)
      } catch (error) {
        console.error('Failed to end call:', error)
      }
    }
  }

  // ---------------------------
  // Tab Content
  // ---------------------------
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DoctorHome
            appointments={appointments}
            emergencies={emergencies}
            symptoms={symptoms}
            chatMessages={chatMessages}
            messageText={messageText}
            setMessageText={setMessageText}
            selectedAppointment={selectedAppointment}
            onSendMessage={sendChatMessage}
            onSelectAppointment={(appt) => setSelectedAppointment(appt)}
            onAcceptAppointment={acceptAppointment}
          />
        )

      case 'patients':
        return (<MotherList doctorId={user?.uid || ''} />)

      case 'chats':
        return (
          <><ChatList
      appointments={appointments}
      selectedAppointmentId={selectedAppointment?.id || null}
      onSelectAppointment={(appt) => setSelectedAppointment(appt)}
    />
          <ChatSection
            selectedAppointment={selectedAppointment}
            messages={chatMessages}
            messageText={messageText}
            setMessageText={setMessageText}
            onSend={sendChatMessage}
            user={user as User | null}
          /></>
        )

      case 'video':
        return (
          <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Video Consultation
                    </h2>
                    <p className="text-gray-600">
                      Connect with doctors for immediate medical advice
                    </p>
                    
                  </div>
                  

                  
                  <VideoCall currentLocation={currentLocation} isOnline={true} />
                </div>
        )
      case 'alerts':
        return (
          <EmergencyList
            emergencies={emergencies}
            onOpenPatient={() => {}}
            onCall={() => {}}
          />
        )

      case 'settings':
        return (
          <DoctorSettings
          user={user as User | null}
          />
        )
      default:
        return (
          <DoctorHome
            appointments={appointments}
            emergencies={emergencies}
            symptoms={symptoms}
            chatMessages={chatMessages}
            messageText={messageText}
            setMessageText={setMessageText}
            selectedAppointment={selectedAppointment}
            onSendMessage={sendChatMessage}
            onSelectAppointment={(appt) => setSelectedAppointment(appt)}
            onAcceptAppointment={acceptAppointment}
          />
        )
    }
  }

  // ---------------------------
  //  Layout
  // ---------------------------
  return (
    <div className="min-h-screen flex bg-gray-50">
      <DoctorSideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        expanded={expanded}
        setExpanded={setExpanded}
        navItems={navItems}
        user={user as User | null}
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab as 'home' | 'patients' | 'chats' | 'video' | 'alerts' | 'settings')}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col">
        <DoctorHeader
          user={user as User | null}
          onToggleSidebar={() => setSidebarOpen((s) => !s)}
          onLogout={handleLogout}
          newBookingsCount={newBookingsCount}
        />
        <div className='hidden'><LocationTracker onLocationUpdate={setCurrentLocation} /></div>

         <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className='md:px-16'
                    >
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto transition-all duration-300">
          {renderContent()}
        </div>
        </motion.div>
      </main>


      {/* Modals */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAccept={acceptIncomingCall}
        onDecline={declineIncomingCall}
      />

      {showVideoCall && (
        <VideoCallModal
          incomingCall={incomingCall}
          appointment={selectedAppointment}
          doctorId={user?.uid}
          onEnd={endVideoCallViaModal}
        />
      )}
    </div>
  )
}
