import { PrismaClient, Priority, LeadStage, LeadStatus, LeadSource, CallType, SimProvider } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to map string values to enums
function mapPriority(val: string): Priority {
  const map: Record<string, Priority> = {
    'High': 'HIGH',
    'Medium': 'MEDIUM',
    'Low': 'LOW',
  };
  return map[val] || 'MEDIUM';
}

function mapStage(val: string): LeadStage {
  const map: Record<string, LeadStage> = {
    'Call Done': 'CALL_DONE',
    'Followup Done': 'FOLLOWUP_DONE',
    'Demo Booked': 'DEMO_BOOKED',
    'Negotiation': 'NEGOTIATION',
    'Future Connect': 'FUTURE_CONNECT',
  };
  return map[val] || 'CALL_DONE';
}

function mapStatus(val: string): LeadStatus {
  const map: Record<string, LeadStatus> = {
    'New': 'NEW',
    'Connected': 'CONNECTED',
    'Demo Done': 'DEMO_DONE',
    'Closed Won': 'CLOSED_WON',
    'Lost': 'LOST',
    'Follow-up': 'FOLLOW_UP',
    'Demo Scheduled': 'FOLLOW_UP', // Map to closest
  };
  return map[val] || 'NEW';
}

function mapSource(val: string): LeadSource {
  const map: Record<string, LeadSource> = {
    'Website': 'WEBSITE',
    'Referral': 'REFERRAL',
    'Email Campaign': 'EMAIL_CAMPAIGN',
    'Social Media': 'SOCIAL_MEDIA',
  };
  return map[val] || 'WEBSITE';
}

function mapCallType(val: string): CallType {
  const map: Record<string, CallType> = {
    'incoming': 'INCOMING',
    'outgoing': 'OUTGOING',
    'missed': 'MISSED',
    'unanswered': 'UNANSWERED',
  };
  return map[val] || 'INCOMING';
}

function mapSimProvider(val: string): SimProvider {
  const map: Record<string, SimProvider> = {
    'Vi': 'VI',
    'Jio': 'JIO',
    'Airtel': 'AIRTEL',
    'BSNL': 'BSNL',
  };
  return map[val] || 'OTHER';
}

// Lead seed data (first 50 leads from the provided data)
const leadsData = [
  { leadName: 'Rahul Sharma', institution: 'Delhi Public School', phoneNumber: '9876543210', city: 'Delhi', priority: 'High', stage: 'Call Done', source: 'Website', owner: 'Ananya Sharma', status: 'New' },
  { leadName: 'Anita Rao', institution: 'Green Valley School', phoneNumber: '9998887776', city: 'Bangalore', priority: 'Medium', stage: 'Followup Done', source: 'Referral', owner: 'Vikram Singh', status: 'Connected' },
  { leadName: 'Sumit Patel', institution: 'Modern School', phoneNumber: '9345678123', city: 'Mumbai', priority: 'Low', stage: 'Demo Booked', source: 'Email Campaign', owner: 'Priya Patel', status: 'Demo Done' },
  { leadName: 'Sonal Gupta', institution: 'City International', phoneNumber: '9812345678', city: 'Hyderabad', priority: 'High', stage: 'Negotiation', source: 'Referral', owner: 'Rahul Mehta', status: 'Closed Won' },
  { leadName: 'Rakesh Kumar', institution: 'Sunshine Academy', phoneNumber: '9801223344', city: 'Kolkata', priority: 'Medium', stage: 'Demo Booked', source: 'Website', owner: 'Sneha Kapoor', status: 'Lost' },
  { leadName: 'Priya Menon', institution: 'Oakridge School', phoneNumber: '9765432109', city: 'Chennai', priority: 'Low', stage: 'Future Connect', source: 'Social Media', owner: 'Karan Malhotra', status: 'Follow-up' },
  { leadName: 'Amit Sharma', institution: 'Little Angels', phoneNumber: '9870123456', city: 'Pune', priority: 'Medium', stage: 'Negotiation', source: 'Website', owner: 'Deepika Iyer', status: 'Closed Won' },
  { leadName: 'Lakshmi Nair', institution: 'Lotus Valley', phoneNumber: '9812678901', city: 'Delhi', priority: 'High', stage: 'Followup Done', source: 'Referral', owner: 'Ananya Sharma', status: 'New' },
  { leadName: 'Ravi Teja', institution: 'St Xavier School', phoneNumber: '9876712345', city: 'Hyderabad', priority: 'Low', stage: 'Call Done', source: 'Website', owner: 'Vikram Singh', status: 'Connected' },
  { leadName: 'Simran Kaur', institution: 'Blue Bells Academy', phoneNumber: '9813322110', city: 'Chandigarh', priority: 'Medium', stage: 'Demo Booked', source: 'Email Campaign', owner: 'Priya Patel', status: 'Demo Done' },
  { leadName: 'Akash Mehta', institution: 'Global Public School', phoneNumber: '9922334455', city: 'Ahmedabad', priority: 'High', stage: 'Call Done', source: 'Social Media', owner: 'Rahul Mehta', status: 'Follow-up' },
  { leadName: 'Surbhi Jain', institution: 'Heritage School', phoneNumber: '9888776655', city: 'Gurgaon', priority: 'High', stage: 'Negotiation', source: 'Social Media', owner: 'Sneha Kapoor', status: 'Closed Won' },
  { leadName: 'Manoj Kumar', institution: 'Springfields High', phoneNumber: '9800112233', city: 'Dehradun', priority: 'Medium', stage: 'Demo Booked', source: 'Referral', owner: 'Karan Malhotra', status: 'Demo Done' },
  { leadName: 'Divya Singh', institution: 'National Public School', phoneNumber: '9811456789', city: 'Bangalore', priority: 'High', stage: 'Call Done', source: 'Website', owner: 'Deepika Iyer', status: 'Follow-up' },
  { leadName: 'Gaurav Mishra', institution: 'Hill Fort Academy', phoneNumber: '9912233445', city: 'Jaipur', priority: 'Low', stage: 'Future Connect', source: 'Social Media', owner: 'Ananya Sharma', status: 'Connected' },
  { leadName: 'Meena Agarwal', institution: 'Sunrise Convent', phoneNumber: '9833446655', city: 'Bhopal', priority: 'High', stage: 'Negotiation', source: 'Referral', owner: 'Vikram Singh', status: 'Closed Won' },
  { leadName: 'Vikas Pandey', institution: 'Cambridge School', phoneNumber: '9822233446', city: 'Lucknow', priority: 'Medium', stage: 'Followup Done', source: 'Email Campaign', owner: 'Priya Patel', status: 'Follow-up' },
  { leadName: 'Sapna Joshi', institution: "St John's", phoneNumber: '9877665544', city: 'Nagpur', priority: 'Low', stage: 'Call Done', source: 'Website', owner: 'Rahul Mehta', status: 'Follow-up' },
  { leadName: 'Pooja Reddy', institution: 'Gems School', phoneNumber: '9877662211', city: 'Hyderabad', priority: 'Low', stage: 'Future Connect', source: 'Referral', owner: 'Deepika Iyer', status: 'Connected' },
  { leadName: 'Kavita Reddy', institution: 'Bhavan Vidyalaya', phoneNumber: '9823456789', city: 'Hyderabad', priority: 'Low', stage: 'Call Done', source: 'Email Campaign', owner: 'Rahul Mehta', status: 'Follow-up' },
  { leadName: 'Sanjay Mehta', institution: 'Vidya Niketan', phoneNumber: '9467890123', city: 'Delhi', priority: 'Low', stage: 'Future Connect', source: 'Social Media', owner: 'Ananya Sharma', status: 'Connected' },
];

// Call Logs seed data (first 30 from the provided data)
const callLogsData = [
  { name: 'Gaurav Mishra', phoneNumber: '+91 99122 33445', callType: 'outgoing', duration: 536, simProvider: 'Vi', userEmail: 'admin@unite.com', callTime: new Date('2025-12-15T15:12:00Z') },
  { name: 'Sumit Patel', phoneNumber: '+91 93456 78123', callType: 'unanswered', duration: 0, simProvider: 'Vi', userEmail: 'support@unite.com', callTime: new Date('2025-12-15T13:25:00Z') },
  { name: 'Rakesh Kumar', phoneNumber: '+91 98012 23344', callType: 'unanswered', duration: 0, simProvider: 'Jio', userEmail: 'admin@unite.com', callTime: new Date('2025-12-15T11:59:00Z') },
  { name: 'Gaurav Mishra', phoneNumber: '+91 99122 33445', callType: 'incoming', duration: 159, simProvider: 'Vi', userEmail: 'support@unite.com', callTime: new Date('2025-12-14T11:50:00Z') },
  { name: 'Anita Rao', phoneNumber: '+91 99988 87776', callType: 'outgoing', duration: 222, simProvider: 'Airtel', userEmail: 'sales@unite.com', callTime: new Date('2025-12-13T20:34:00Z') },
  { name: 'Divya Singh', phoneNumber: '+91 98114 56789', callType: 'missed', duration: 0, simProvider: 'Airtel', userEmail: 'admin@unite.com', callTime: new Date('2025-12-13T16:32:00Z') },
  { name: 'Vikas Pandey', phoneNumber: '+91 98222 33446', callType: 'missed', duration: 0, simProvider: 'Jio', userEmail: 'sales@unite.com', callTime: new Date('2025-12-13T10:19:00Z') },
  { name: 'Sumit Patel', phoneNumber: '+91 93456 78123', callType: 'incoming', duration: 365, simProvider: 'Vi', userEmail: 'support@unite.com', callTime: new Date('2025-12-12T16:50:00Z') },
  { name: 'Simran Kaur', phoneNumber: '+91 98133 22110', callType: 'incoming', duration: 339, simProvider: 'Airtel', userEmail: 'support@unite.com', callTime: new Date('2025-12-12T15:10:00Z') },
  { name: 'Anita Rao', phoneNumber: '+91 99988 87776', callType: 'incoming', duration: 515, simProvider: 'Airtel', userEmail: 'admin@unite.com', callTime: new Date('2025-12-12T13:50:00Z') },
  { name: 'Sonal Gupta', phoneNumber: '+91 98123 45678', callType: 'outgoing', duration: 381, simProvider: 'BSNL', userEmail: 'support@unite.com', callTime: new Date('2025-12-12T11:15:00Z') },
  { name: 'Lakshmi Nair', phoneNumber: '+91 98126 78901', callType: 'outgoing', duration: 582, simProvider: 'BSNL', userEmail: 'support@unite.com', callTime: new Date('2025-12-11T16:22:00Z') },
  { name: 'Simran Kaur', phoneNumber: '+91 98133 22110', callType: 'unanswered', duration: 0, simProvider: 'Airtel', userEmail: 'sales@unite.com', callTime: new Date('2025-12-11T15:30:00Z') },
  { name: 'Meena Agarwal', phoneNumber: '+91 98334 46655', callType: 'incoming', duration: 430, simProvider: 'BSNL', userEmail: 'support@unite.com', callTime: new Date('2025-12-10T09:43:00Z') },
  { name: 'Surbhi Jain', phoneNumber: '+91 98887 76655', callType: 'incoming', duration: 69, simProvider: 'BSNL', userEmail: 'sales@unite.com', callTime: new Date('2025-12-09T13:30:00Z') },
  { name: 'Shruti Desai', phoneNumber: '+91 99112 23344', callType: 'unanswered', duration: 0, simProvider: 'BSNL', userEmail: 'sales@unite.com', callTime: new Date('2025-12-08T19:43:00Z') },
  { name: 'Vikas Pandey', phoneNumber: '+91 98222 33446', callType: 'outgoing', duration: 374, simProvider: 'Jio', userEmail: 'admin@unite.com', callTime: new Date('2025-12-08T18:29:00Z') },
  { name: 'Sonal Gupta', phoneNumber: '+91 98123 45678', callType: 'outgoing', duration: 576, simProvider: 'BSNL', userEmail: 'sales@unite.com', callTime: new Date('2025-12-08T15:02:00Z') },
  { name: 'Manoj Kumar', phoneNumber: '+91 98001 12233', callType: 'outgoing', duration: 293, simProvider: 'Jio', userEmail: 'support@unite.com', callTime: new Date('2025-12-06T13:37:00Z') },
  { name: 'Rahul Sharma', phoneNumber: '+91 98765 43210', callType: 'outgoing', duration: 67, simProvider: 'Jio', userEmail: 'support@unite.com', callTime: new Date('2025-12-06T12:39:00Z') },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🗑️ Clearing existing data...');
  await prisma.callLog.deleteMany({});
  await prisma.lead.deleteMany({});

  // Seed leads
  console.log('📋 Seeding leads...');
  for (const lead of leadsData) {
    await prisma.lead.create({
      data: {
        leadName: lead.leadName,
        institution: lead.institution,
        phoneNumber: lead.phoneNumber,
        city: lead.city,
        priority: mapPriority(lead.priority),
        stage: mapStage(lead.stage),
        source: mapSource(lead.source),
        owner: lead.owner,
        status: mapStatus(lead.status),
      },
    });
  }
  console.log(`✅ Created ${leadsData.length} leads`);

  // Seed call logs
  console.log('📞 Seeding call logs...');
  for (const log of callLogsData) {
    await prisma.callLog.create({
      data: {
        name: log.name,
        phoneNumber: log.phoneNumber,
        callType: mapCallType(log.callType),
        duration: log.duration,
        simProvider: mapSimProvider(log.simProvider),
        userEmail: log.userEmail,
        callTime: log.callTime,
      },
    });
  }
  console.log(`✅ Created ${callLogsData.length} call logs`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
