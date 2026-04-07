import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const adminUser = {
  name: 'Admin1',
  email: 'admin1@example.com',
  password: 'test1234',
  role: 'ADMIN'
};

async function createAdminUser() {
  console.log('👑 Admin login for shelter testing...\n');
  
  // Test admin login only
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      console.log(`   Token: Present`);
      console.log(`   User ID: ${loginResponse.data.user?.id}`);
      console.log(`   Role: ${loginResponse.data.user?.role}`);
      
      console.log('\n🎉 Admin user ready for shelter performance testing!');
      console.log('📋 Admin credentials:');
      console.log(`   👑 Email: ${adminUser.email}`);
      console.log(`   🔑 Password: ${adminUser.password}`);
      console.log(`   🎭 Role: ${adminUser.role}`);
      
    } else {
      console.log('❌ Admin login failed - no token in response');
    }
    
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data || error.message);
  }
}

createAdminUser();
