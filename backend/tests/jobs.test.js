const request = require('supertest');
const app = require('../app');

describe('Jobs Module Integration Tests', () => {
  let adminToken;
  let candidateToken;

  beforeAll(async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@recruitment.com', password: 'Password@123' });
    adminToken = adminLogin.body.data.token;

    const candidateLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'Password@123' });
    candidateToken = candidateLogin.body.data.token;
  });

  it('should list open jobs publicly with pagination metadata', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('should return a single job by valid ID', async () => {
    const res = await request(app).get('/api/jobs/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.title).toMatch(/Full-Stack/i);
  });

  it('should return 404 for non-existent job ID', async () => {
    const res = await request(app).get('/api/jobs/9999');
    expect(res.status).toBe(404);
  });

  it('should deny unauthenticated requests to create a job (401)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({
        title: 'Unauthorized Job',
        description: 'Should not succeed',
        location: 'Remote',
        job_type: 'Full-time'
      });

    expect(res.status).toBe(401);
  });

  it('should deny candidates from creating a job (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        title: 'Candidate Posted Job',
        description: 'Should be blocked by role guard',
        location: 'Remote',
        job_type: 'Full-time'
      });

    expect(res.status).toBe(403);
  });

  it('should allow admin to create a new job posting', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Staff Platform Engineer',
        description: 'Build enterprise-grade distributed cloud microservices.',
        location: 'Seattle, WA',
        job_type: 'Full-time',
        salary_range: '$160,000 - $190,000',
        status: 'open'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Staff Platform Engineer');
  });

  it('should allow admin to update a job posting', async () => {
    const res = await request(app)
      .put('/api/jobs/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'closed'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should allow admin to delete a job posting', async () => {
    const res = await request(app)
      .delete('/api/jobs/2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should search live external jobs from India tech feed via GET /api/jobs/external/live', async () => {
    const res = await request(app)
      .get('/api/jobs/external/live')
      .query({ query: 'React', location: 'Bengaluru' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.provider).toBeDefined();
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('title');
      expect(res.body.data[0]).toHaveProperty('company');
      expect(res.body.data[0]).toHaveProperty('location');
    }
  });

  it('should allow admin to 1-click import an external job posting into portal', async () => {
    const externalJob = {
      title: 'Senior Cloud Platform Engineer (Imported)',
      description: 'Role imported directly from live external aggregator',
      location: 'Bengaluru, India',
      jobType: 'Full-time',
      salaryRange: '₹25,00,000 - ₹35,00,000',
      applyUrl: 'https://example.com/apply',
      source: 'Adzuna India'
    };

    const res = await request(app)
      .post('/api/jobs/external/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(externalJob);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(externalJob.title);
    expect(res.body.data.location).toBe(externalJob.location);
  });

  it('should deny candidate from importing external jobs (403)', async () => {
    const res = await request(app)
      .post('/api/jobs/external/import')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        title: 'Unauthorized Import',
        description: 'Test',
        location: 'Remote'
      });

    expect(res.status).toBe(403);
  });
});

