const request = require('supertest');
const app = require('../app');
const path = require('path');
const fs = require('fs');

describe('Job Application & Hiring Pipeline Flow', () => {
  let adminToken;
  let candidateToken;
  let dummyPdfPath;

  beforeAll(async () => {
    // 1. Authenticate Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@recruitment.com', password: 'Password@123' });
    adminToken = adminLogin.body.data.token;

    // 2. Authenticate Candidate
    const candidateLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'Password@123' });
    candidateToken = candidateLogin.body.data.token;

    // Create a temporary dummy PDF file for testing
    dummyPdfPath = path.resolve(__dirname, 'test-resume.pdf');
    fs.writeFileSync(dummyPdfPath, '%PDF-1.4 dummy test content');
  });

  afterAll(() => {
    if (fs.existsSync(dummyPdfPath)) {
      fs.unlinkSync(dummyPdfPath);
    }
  });

  it('should allow a candidate to apply to an open job with a PDF resume', async () => {
    const res = await request(app)
      .post('/api/jobs/1/apply')
      .set('Authorization', `Bearer ${candidateToken}`)
      .attach('resume', dummyPdfPath)
      .field('cover_note', 'I am very excited about this role!');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('applied');
  });

  it('should reject application if resume is not a PDF', async () => {
    const txtPath = path.resolve(__dirname, 'test.txt');
    fs.writeFileSync(txtPath, 'not a pdf');

    const res = await request(app)
      .post('/api/jobs/1/apply')
      .set('Authorization', `Bearer ${candidateToken}`)
      .attach('resume', txtPath);

    fs.unlinkSync(txtPath);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only pdf/i);
  });

  it('should prevent duplicate applications by the same candidate to the same job', async () => {
    const res = await request(app)
      .post('/api/jobs/1/apply')
      .set('Authorization', `Bearer ${candidateToken}`)
      .attach('resume', dummyPdfPath)
      .field('cover_note', 'Attempting duplicate application');

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already applied/i);
  });

  it('should allow candidate to retrieve their submitted applications', async () => {
    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].status).toBe('applied');
  });

  it('should allow admin to advance status through pipeline: applied -> shortlisted', async () => {
    const res = await request(app)
      .patch('/api/admin/applications/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'shortlisted' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('shortlisted');
  });

  it('should prevent invalid pipeline transitions (shortlisted directly to offered)', async () => {
    const res = await request(app)
      .patch('/api/admin/applications/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'offered' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid pipeline transition/i);
  });

  it('should advance from shortlisted -> interview -> offered', async () => {
    // 1. shortlisted -> interview
    const res1 = await request(app)
      .patch('/api/admin/applications/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'interview' });
    expect(res1.status).toBe(200);
    expect(res1.body.data.status).toBe('interview');

    // 2. interview -> offered
    const res2 = await request(app)
      .patch('/api/admin/applications/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'offered' });
    expect(res2.status).toBe(200);
    expect(res2.body.data.status).toBe('offered');
  });

  it('should prevent candidates from changing application status (403 Forbidden)', async () => {
    const res = await request(app)
      .patch('/api/admin/applications/1/status')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ status: 'offered' });

    expect(res.status).toBe(403);
  });
});
