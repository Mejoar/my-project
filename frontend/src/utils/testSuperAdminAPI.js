// Debug utility to test Super Admin API endpoints
export const testSuperAdminAPI = async () => {
  console.log('🔍 Testing Super Admin API Endpoints...');
  
  const endpoints = [
    '/api/v1/superadmin/dashboard/stats',
    '/api/v1/superadmin/users',
    '/api/v1/superadmin/blogs',
    '/api/v1/superadmin/comments'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error Response:`, errorText);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Success:`, data);
      
    } catch (error) {
      console.error(`❌ Network Error for ${endpoint}:`, error);
    }
  }
};

// Test authentication status
export const testAuthStatus = async () => {
  try {
    console.log('🔐 Testing Authentication Status...');
    
    const response = await fetch('/api/v1/user/profile', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ User authenticated:', userData);
      console.log('👤 User role:', userData.user?.role);
      return userData;
    } else {
      console.log('❌ User not authenticated');
      const errorData = await response.json();
      console.log('Error:', errorData);
      return null;
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return null;
  }
};

// Call this in browser console to debug
window.testSuperAdminAPI = testSuperAdminAPI;
window.testAuthStatus = testAuthStatus;
