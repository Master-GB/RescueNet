import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const testUsers = [
  {
    name: 'Test User 1',
    email: 'user1@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Test User 2',
    email: 'user2@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Test User 3',
    email: 'user3@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Test User 4',
    email: 'user4@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  },
  {
    name: 'Test User 5',
    email: 'user5@example.com',
    password: 'test1234',
    role: 'CITIZEN'
  }
];

async function createHelpTestUsers() {
  console.log('👥 Setting up test users for help request testing...\n');
  
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
      if (error.response?.status === 409) {
        console.log(`✅ User already exists: ${user.email}`);
      } else {
        console.log(`❌ Error with user ${user.email}:`, error.response?.data?.message || error.message);
      }
    }
  }
  
  console.log('\n🎉 Help request test users ready!');
  console.log('📋 Test user credentials:');
  testUsers.forEach(user => {
    console.log(`   📧 ${user.email} / 🔑 ${user.password}`);
  });
  console.log('\n💡 Use these credentials in help-test-users.csv for Artillery load testing');
}

createHelpTestUsers();
