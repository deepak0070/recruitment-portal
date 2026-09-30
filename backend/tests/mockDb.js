// In-memory relational database mock for integration testing with Jest & Supertest
const bcrypt = require('bcryptjs');

class MockDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    const passwordHash = bcrypt.hashSync('Password@123', 10);
    this.users = [
      { id: 1, name: 'Admin Test', email: 'admin@recruitment.com', password_hash: passwordHash, role: 'admin', created_at: new Date() },
      { id: 2, name: 'Candidate John', email: 'john@example.com', password_hash: passwordHash, role: 'candidate', created_at: new Date() },
      { id: 3, name: 'Candidate Jane', email: 'jane@example.com', password_hash: passwordHash, role: 'candidate', created_at: new Date() }
    ];

    this.jobs = [
      {
        id: 1,
        title: 'Senior Full-Stack Engineer',
        description: 'Comprehensive Node.js and React fullstack role.',
        location: 'Remote',
        job_type: 'Full-time',
        salary_range: '$120,000 - $150,000',
        status: 'open',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
        creator_name: 'Admin Test',
        applicant_count: 0
      },
      {
        id: 2,
        title: 'Backend Specialist',
        description: 'Database and API specialist role.',
        location: 'New York, NY',
        job_type: 'Contract',
        salary_range: '$80 / hour',
        status: 'closed',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
        creator_name: 'Admin Test',
        applicant_count: 0
      }
    ];

    this.applications = [];
    this.nextUserId = 4;
    this.nextJobId = 3;
    this.nextAppId = 1;
  }

  async execute(sql, params = []) {
    const queryStr = sql.trim().replace(/\s+/g, ' ');

    // 1. SELECT users by email
    if (queryStr.includes('SELECT * FROM users WHERE email = ?')) {
      const email = params[0].toLowerCase();
      const user = this.users.find(u => u.email.toLowerCase() === email);
      return user ? [user] : [];
    }

    // 2. SELECT users by id
    if (queryStr.includes('SELECT id, name, email, role, created_at FROM users WHERE id = ?')) {
      const id = parseInt(params[0], 10);
      const user = this.users.find(u => u.id === id);
      if (user) {
        return [{ id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }];
      }
      return [];
    }

    // 3. INSERT INTO users
    if (queryStr.includes('INSERT INTO users')) {
      const [name, email, passwordHash, role] = params;
      const newUser = {
        id: this.nextUserId++,
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: role || 'candidate',
        created_at: new Date()
      };
      this.users.push(newUser);
      return { insertId: newUser.id };
    }

    // 4. COUNT(*) FROM jobs
    if (queryStr.includes('SELECT COUNT(*) as total FROM jobs')) {
      const isOpenOnly = queryStr.includes('j.status = ?') && params[0] === 'open';
      const count = isOpenOnly ? this.jobs.filter(j => j.status === 'open').length : this.jobs.length;
      return [{ total: count }];
    }

    // 5. SELECT single job WHERE j.id = ?
    if (queryStr.includes('WHERE j.id = ?')) {
      const id = parseInt(params[0], 10);
      const job = this.jobs.find(j => j.id === id);
      return job ? [job] : [];
    }

    // 6. SELECT jobs with pagination
    if (queryStr.includes('SELECT') && queryStr.includes('FROM jobs j')) {
      let result = [...this.jobs];
      if (queryStr.includes('j.status = ?')) {
        result = result.filter(j => j.status === params[0]);
      }
      return result;
    }

    // 7. INSERT INTO jobs
    if (queryStr.includes('INSERT INTO jobs')) {
      const [title, description, location, job_type, salary_range, status, created_by] = params;
      const newJob = {
        id: this.nextJobId++,
        title,
        description,
        location,
        job_type,
        salary_range,
        status: status || 'open',
        created_by,
        created_at: new Date(),
        updated_at: new Date(),
        creator_name: 'Admin Test',
        applicant_count: 0
      };
      this.jobs.push(newJob);
      return { insertId: newJob.id };
    }

    // 8. UPDATE jobs
    if (queryStr.includes('UPDATE jobs SET')) {
      const id = parseInt(params[params.length - 1], 10);
      const job = this.jobs.find(j => j.id === id);
      if (job) {
        if (queryStr.includes('status = ?')) {
          job.status = params[0];
        }
      }
      return { affectedRows: 1 };
    }

    // 9. DELETE FROM jobs
    if (queryStr.includes('DELETE FROM jobs WHERE id = ?')) {
      const id = parseInt(params[0], 10);
      this.jobs = this.jobs.filter(j => j.id !== id);
      return { affectedRows: 1 };
    }

    // 10. SELECT applications WHERE job_id = ? AND user_id = ?
    if (queryStr.includes('SELECT * FROM applications WHERE job_id = ? AND user_id = ?')) {
      const [jobId, userId] = params.map(n => parseInt(n, 10));
      const app = this.applications.find(a => a.job_id === jobId && a.user_id === userId);
      return app ? [app] : [];
    }

    // 11. INSERT INTO applications
    if (queryStr.includes('INSERT INTO applications')) {
      const [job_id, user_id, resume_path, cover_note] = params;
      const newApp = {
        id: this.nextAppId++,
        job_id: parseInt(job_id, 10),
        user_id: parseInt(user_id, 10),
        resume_path,
        cover_note,
        status: 'applied',
        applied_at: new Date(),
        updated_at: new Date()
      };
      this.applications.push(newApp);

      // Increment job applicant count
      const j = this.jobs.find(job => job.id === newApp.job_id);
      if (j) j.applicant_count = (j.applicant_count || 0) + 1;

      return { insertId: newApp.id };
    }

    // 12. SELECT applications WHERE a.id = ?
    if (queryStr.includes('FROM applications a') && queryStr.includes('WHERE a.id = ?')) {
      const id = parseInt(params[0], 10);
      const app = this.applications.find(a => a.id === id);
      if (!app) return [];
      const user = this.users.find(u => u.id === app.user_id) || {};
      const job = this.jobs.find(j => j.id === app.job_id) || {};
      return [{
        ...app,
        candidate_name: user.name,
        candidate_email: user.email,
        job_title: job.title,
        job_location: job.location,
        job_type: job.job_type,
        job_salary_range: job.salary_range,
        job_status: job.status
      }];
    }

    // 13. SELECT applications WHERE a.user_id = ? (mine)
    if (queryStr.includes('FROM applications a') && queryStr.includes('WHERE a.user_id = ?')) {
      const userId = parseInt(params[0], 10);
      return this.applications
        .filter(a => a.user_id === userId)
        .map(app => {
          const job = this.jobs.find(j => j.id === app.job_id) || {};
          return {
            ...app,
            job_title: job.title,
            job_location: job.location,
            job_type: job.job_type,
            job_salary_range: job.salary_range,
            job_status: job.status
          };
        });
    }

    // 14. SELECT applications for job WHERE a.job_id = ?
    if (queryStr.includes('FROM applications a') && queryStr.includes('a.job_id = ?')) {
      const jobId = parseInt(params[0], 10);
      let list = this.applications.filter(a => a.job_id === jobId);
      if (queryStr.includes('a.status = ?')) {
        list = list.filter(a => a.status === params[1]);
      }
      return list.map(app => {
        const user = this.users.find(u => u.id === app.user_id) || {};
        return {
          ...app,
          candidate_name: user.name,
          candidate_email: user.email
        };
      });
    }

    // 15. UPDATE applications SET status = ? WHERE id = ?
    if (queryStr.includes('UPDATE applications SET status = ? WHERE id = ?')) {
      const [newStatus, id] = params;
      const app = this.applications.find(a => a.id === parseInt(id, 10));
      if (app) {
        app.status = newStatus;
        app.updated_at = new Date();
      }
      return { affectedRows: 1 };
    }

    // 16. Admin metrics: COUNT(*) AS total_jobs ...
    if (queryStr.includes('COUNT(*) AS total_jobs')) {
      return [{
        total_jobs: this.jobs.length,
        open_jobs: this.jobs.filter(j => j.status === 'open').length,
        closed_jobs: this.jobs.filter(j => j.status === 'closed').length
      }];
    }

    // 17. Total applications
    if (queryStr.includes('SELECT COUNT(*) AS total FROM applications')) {
      return [{ total: this.applications.length }];
    }

    // 18. Status counts
    if (queryStr.includes('GROUP BY status')) {
      const counts = {};
      this.applications.forEach(a => {
        counts[a.status] = (counts[a.status] || 0) + 1;
      });
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    }

    return [];
  }
}

const mockDb = new MockDatabase();

module.exports = mockDb;
