import axios from 'axios';

// Base URL for the API
const BASE_URL = 'http://localhost:3001';

// Test data
const testMothers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+251911123456',
    dob: '1990-05-15',
    gender: 'female',
    notes: 'First pregnancy, due in 3 months'
  },
  {
    name: 'Mary Williams',
    email: 'mary.williams@example.com',
    phone: '+251922654321',
    dob: '1988-12-20',
    gender: 'female',
    notes: 'Second pregnancy, high-risk case'
  },
  {
    name: 'Grace Davis',
    email: 'grace.davis@example.com',
    phone: '+251933789012',
    dob: '1992-08-10',
    gender: 'female',
    notes: 'Twin pregnancy, regular check-ups needed'
  }
];

const testAppointments = [
  {
    motherId: '', // Will be set after creating mothers
    doctorId: 'yjxCOEdlTMgdJw7aeYfOEXJsne63', // Use a test doctor ID
    startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour later
    type: 'checkup',
    notes: 'Regular prenatal check-up'
  },
  {
    motherId: '', // Will be set after creating mothers
    doctorId: 'yjxCOEdlTMgdJw7aeYfOEXJsne63',
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    type: 'ultrasound',
    notes: 'Ultrasound examination'
  }
];

const testSymptoms = [
  {
    motherId: '', // Will be set after creating mothers
    summary: 'Morning sickness and fatigue',
    details: 'Experiencing nausea in the mornings and feeling very tired throughout the day.'
  },
  {
    motherId: '', // Will be set after creating mothers
    summary: 'Back pain and swelling',
    details: 'Lower back pain and mild swelling in ankles, especially after standing for long periods.'
  }
];

async function seedData() {
  try {
    console.log('Starting database seeding...');

    // Create mothers
    console.log('Creating mothers...');
    const createdMothers = [];
    for (const mother of testMothers) {
      try {
        const response = await axios.post(`${BASE_URL}/api/mothers`, mother);
        createdMothers.push(response.data);
        console.log(`✓ Created mother: ${mother.name}`);
      } catch (error) {
        console.error(`✗ Failed to create mother ${mother.name}:`, error.response?.data || error.message);
      }
    }

    // Create appointments
    console.log('Creating appointments...');
    for (let i = 0; i < testAppointments.length; i++) {
      const appointment = { ...testAppointments[i] };
      if (createdMothers[i]) {
        appointment.motherId = createdMothers[i].id;
      } else if (createdMothers[0]) {
        appointment.motherId = createdMothers[0].id;
      }

      try {
        await axios.post(`${BASE_URL}/api/appointments`, appointment);
        console.log(`✓ Created appointment for ${appointment.type}`);
      } catch (error) {
        console.error(`✗ Failed to create appointment:`, error.response?.data || error.message);
      }
    }

    // Create symptoms
    console.log('Creating symptoms...');
    for (let i = 0; i < testSymptoms.length; i++) {
      const symptom = { ...testSymptoms[i] };
      if (createdMothers[i]) {
        symptom.motherId = createdMothers[i].id;
      } else if (createdMothers[0]) {
        symptom.motherId = createdMothers[0].id;
      }

      try {
        await axios.post(`${BASE_URL}/api/symptoms`, symptom);
        console.log(`✓ Created symptom: ${symptom.summary}`);
      } catch (error) {
        console.error(`✗ Failed to create symptom:`, error.response?.data || error.message);
      }
    }

    console.log('Database seeding completed!');
    console.log(`Created ${createdMothers.length} mothers, ${testAppointments.length} appointments, and ${testSymptoms.length} symptoms.`);

  } catch (error) {
    console.error('Seeding failed:', error.message);
  }
}

// Run the seeding
seedData();