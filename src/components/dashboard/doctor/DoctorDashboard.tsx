'use client'

import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  limit,
} from 'firebase/firestore'
import { auth, db as firebaseDb } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/types'
import {
  FirestoreAppointment,
  FirestoreSymptom,
  FirestoreEmergency,
  FirestoreCall,
  FirestoreMessage,
} from '../../../types/DoctorTypes'

import DoctorSideBar from './DoctorSideBar'
import DoctorHeader from './DoctorHeader'
import DoctorHome from './DoctorHome'
// import AppointmentList from './AppointmentList'
// import SymptomsList from './SymptomsList'
import ChatSection from './ChatSection'
import EmergencyList from './EmergencyList'
import IncomingCallModal from './IncomingCallModal'
import VideoCallModal from './VideoCallModal'
import PatientList from './PatientList'
import ChatList from './ChatList'
import VideoAppointments from './VideoAppointments'
import DoctorSettings from './Setting'
import VideoCall from '../VideoCall';
import LocationTracker from '../LocationTracker';


const DoctorVideoCall = dynamic(() => import('./VideoCallModal'), { ssr: false })
const db = firebaseDb

export default function DoctorDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<
    'home' | 'patients' | 'chats' | 'video' | 'alerts' | 'settings'
  >('home')
  const [expanded, setExpanded] = useState<boolean>(false)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([])
  const [selectedAppointment, setSelectedAppointment] =
    useState<FirestoreAppointment | null>(null)
  const [symptoms, setSymptoms] = useState<FirestoreSymptom[]>([])
  const [chatMessages, setChatMessages] = useState<FirestoreMessage[]>([])
  const [messageText, setMessageText] = useState<string>('')
  const [showVideoCall, setShowVideoCall] = useState<boolean>(false)
  const [incomingCall, setIncomingCall] = useState<FirestoreCall | null>(null)
  const [newBookingsCount, setNewBookingsCount] = useState<number>(0)
  const [emergencies, setEmergencies] = useState<FirestoreEmergency[]>([])
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


  // Firestore listeners


  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('scheduledAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const list: FirestoreAppointment[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
      setAppointments(list)

      if (!selectedAppointment && list.length) setSelectedAppointment(list[0])

      const tenMinutesAgo = Date.now() - 10 * 60 * 1000
      const recent = list.filter((a) => {
        const created = (a as any).createdAt?.seconds
          ? (a as any).createdAt.seconds * 1000
          : (a as any).createdAt
        return typeof created === 'number' && created >= tenMinutesAgo
      })
      setNewBookingsCount(recent.length)

      setEmergencies(list.filter((a) => a.urgent === true))
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'symptoms'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    const unsub = onSnapshot(q, (snap) => {
      const list: FirestoreSymptom[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
      setSymptoms(list)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'calls'),
      where('doctorId', '==', user.uid),
      where('status', 'in', ['requested', 'accepted']),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const callDoc = snap.docs[0]
        setIncomingCall({ id: callDoc.id, ...(callDoc.data() as any) } as FirestoreCall)
      } else {
        setIncomingCall(null)
      }
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!selectedAppointment) {
      setChatMessages([])
      chatRoomRef.current = null
      return
    }
    const roomId = `appointment_${selectedAppointment.id}`
    chatRoomRef.current = roomId
    const q = query(
      collection(db, 'chats', roomId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setChatMessages(msgs)
    })
    return () => unsub()
  }, [selectedAppointment])

  // ---------------------------
  //  Core Handlers
  // ---------------------------

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/')
  }

  const sendMessage = async () => {
    if (!chatRoomRef.current || !messageText.trim() || !user) return
    await addDoc(collection(db, 'chats', chatRoomRef.current, 'messages'), {
      text: messageText.trim(),
      senderId: user.uid,
      createdAt: serverTimestamp(),
    })
    setMessageText('')
  }

  const acceptAppointment = async (appt: FirestoreAppointment) => {
    if (!appt?.id) return
    await updateDoc(doc(db, 'appointments', appt.id), { status: 'accepted' })
  }

  const openVideoForAppointment = (appt: FirestoreAppointment) => {
    setSelectedAppointment(appt)
    setShowVideoCall(true)
  }

  const acceptIncomingCall = async () => {
    if (!incomingCall) return
    await updateDoc(doc(db, 'calls', incomingCall.id), {
      status: 'accepted',
      answeredBy: user?.uid,
      answeredAt: serverTimestamp(),
    })
    setShowVideoCall(true)
  }

  const declineIncomingCall = async () => {
    if (!incomingCall) return
    await updateDoc(doc(db, 'calls', incomingCall.id), {
      status: 'declined',
      declinedBy: user?.uid,
      declinedAt: serverTimestamp(),
    })
    setIncomingCall(null)
  }

  const endVideoCallViaModal = async () => {
    setShowVideoCall(false)
    if (incomingCall) {
      await updateDoc(doc(db, 'calls', incomingCall.id), { status: 'ended' })
      setIncomingCall(null)
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
            onSendMessage={sendMessage}
            onSelectAppointment={(appt) => setSelectedAppointment(appt)}
          />
        )

      case 'patients':
        return (<PatientList doctorId={user?.uid!} />)

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
            onSend={sendMessage}
            user={user as User}
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
          user={user as User}
          />
        )
      default:
        return <DoctorHome />
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
        setActiveTab={setActiveTab}
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
