import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const testUsers = [
  {
    name: 'Missing Test User 1',
    email: 'missing_user1@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Missing Test User 2',
    email: 'missing_user2@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Missing Test User 3',
    email: 'missing_user3@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Missing Test User 4',
    email: 'missing_user4@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Missing Test User 5',
    email: 'missing_user5@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  }
];

async function createMissingTestUsers() {
  console.log('👥 Setting up test users for missing person testing...\n');
  
  for (const user of testUsers) {
    try {
      console.log(`📝 Creating or confirming user: ${user.email}...`);
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role
      });
      
      console.log(`✅ User created successfully: ${user.email}`);
      console.log(`   User ID: ${registerResponse.data.user?.id}`);
      
    } catch (error) {
      if (error.response?.status === 409 || error.response?.status === 400) {
        console.log(`✅ User already exists or bad request (maybe duplicate): ${user.email}`);
      } else {
        console.log(`❌ Error with user ${user.email}:`, error.response?.data?.message || error.message);
      }
    }
  }
  
  console.log('\n🎉 Missing person test users ready!');
  console.log('📋 Test user credentials:');
  testUsers.forEach(user => {
    console.log(`   📧 ${user.email} / 🔑 ${user.password}`);
  });
  console.log('\n💡 Use these credentials in missing-test-users.csv for Artillery load testing');
}

createMissingTestUsers();
