import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Automated API Verification Suite ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  assert.strictEqual(health.status, 'healthy', 'Health status should be healthy');
  console.log('✓ Health check passed');

  // 2. Student login
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex.student@college.edu', password: 'student123' }),
  });
  const studentAuth = await studentLoginRes.json();
  assert(studentAuth.token, 'Student should receive auth token');
  assert.strictEqual(studentAuth.user.role, 'student', 'Role must be student');
  console.log(`✓ Student login successful: ${studentAuth.user.name}`);

  // 3. Faculty login
  const facultyLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dr.marcus@college.edu', password: 'faculty123' }),
  });
  const facultyAuth = await facultyLoginRes.json();
  assert(facultyAuth.token, 'Faculty should receive auth token');
  assert.strictEqual(facultyAuth.user.role, 'faculty', 'Role must be faculty');
  console.log(`✓ Faculty login successful: ${facultyAuth.user.name}`);

  // 4. Admin login
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'admin123' }),
  });
  const adminAuth = await adminLoginRes.json();
  assert(adminAuth.token, 'Admin should receive auth token');
  assert.strictEqual(adminAuth.user.role, 'admin', 'Role must be admin');
  console.log(`✓ Admin login successful: ${adminAuth.user.name}`);

  // 5. Student fetches their project
  const projectsRes = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${studentAuth.token}` },
  });
  const projectsData = await projectsRes.json();
  assert(projectsData.projects.length > 0, 'Student should have an active seeded project');
  console.log(`✓ Student project lookup passed (Found "${projectsData.projects[0].title.slice(0, 30)}...")`);

  // 6. Security check: Student forbidden from admin endpoint
  const unauthorizedRes = await fetch(`${BASE_URL}/admin/workload`, {
    headers: { Authorization: `Bearer ${studentAuth.token}` },
  });
  assert.strictEqual(unauthorizedRes.status, 403, 'Student must be rejected with 403 Forbidden from admin endpoints');
  console.log('✓ Security check: Student blocked from admin endpoints (403)');

  // 7. Admin can access workload
  const workloadRes = await fetch(`${BASE_URL}/admin/workload`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  const workloadData = await workloadRes.json();
  assert(workloadData.facultyWorkload.length > 0, 'Admin can view faculty workload');
  console.log(`✓ Admin workload query passed (Found ${workloadData.facultyWorkload.length} faculty members)`);

  // 8. AI Project ideas test
  const aiRes = await fetch(`${BASE_URL}/ai/project-ideas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAuth.token}`,
    },
    body: JSON.stringify({ domain: 'Cybersecurity', interests: 'Smart contracts' }),
  });
  const aiData = await aiRes.json();
  assert(aiData.success, 'AI idea generation must succeed');
  assert(aiData.text.length > 100, 'AI response must contain structured content');
  console.log(`✓ AI project ideas endpoint passed (Source: ${aiData.source})`);

  console.log('\n--- All Automated Backend Tests Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
