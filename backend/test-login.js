// Simple Node.js script to test login endpoint
// Run: node test-login.js

const https = require('https');
const http = require('http');

// Get API URL from command line or use default
const API_URL = process.argv[2] || 'http://localhost:3000';

console.log('🧪 Testing Login Endpoint...\n');
console.log(`API URL: ${API_URL}\n`);

// Test users
const testUsers = [
  { email: 'superadmin@gmail.com', password: 'abc123', role: 'SUPER_ADMIN' },
  { email: 'classteacher@gmail.com', password: 'abc123', role: 'CLASS_TEACHER' },
  { email: 'subjectteacher@gmail.com', password: 'abc123', role: 'SUBJECT_TEACHER' },
  { email: 'parentchild@gmail.com', password: 'abc123', role: 'STUDENT_PARENT' }
];

// Test invalid credentials
const invalidTest = { email: 'wrong@gmail.com', password: 'wrong123' };

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testLogin(email, password, expectedRole = null) {
  try {
    const response = await makeRequest(`${API_URL}/api/auth/login`, { email, password });
    
    if (response.status === 200) {
      console.log(`✅ SUCCESS - ${email}`);
      console.log(`   Role: ${response.data.user.role}`);
      console.log(`   Token: ${response.data.token.substring(0, 50)}...`);
      
      if (expectedRole && response.data.user.role !== expectedRole) {
        console.log(`   ⚠️  WARNING: Expected role ${expectedRole}, got ${response.data.user.role}`);
      }
    } else {
      console.log(`❌ FAILED - ${email}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ ERROR - ${email}`);
    console.log(`   ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('Testing Valid Logins\n');
  
  for (const user of testUsers) {
    await testLogin(user.email, user.password, user.role);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('='.repeat(50));
  console.log('Testing Invalid Login\n');
  await testLogin(invalidTest.email, invalidTest.password);
  
  console.log('='.repeat(50));
  console.log('✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);


