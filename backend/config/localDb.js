const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.resolve(__dirname, '../data/db.json');

class LocalDatabase {
  constructor() {
    this.dataFile = DATA_FILE;
    this.load();
  }

  load() {
    if (fs.existsSync(this.dataFile)) {
      try {
        const raw = fs.readFileSync(this.dataFile, 'utf8');
        const data = JSON.parse(raw);
        this.users = data.users || [];
        this.jobs = data.jobs || [];
        this.applications = data.applications || [];
        this.notes = data.notes || [];
        this.activity = data.activity || [];
        this.nextUserId = data.nextUserId || 5;
        this.nextJobId = data.nextJobId || 6;
        this.nextAppId = data.nextAppId || 1;
        this.nextNoteId = data.nextNoteId || 1;
        return;
      } catch (e) {
        console.warn('[LocalDB] Could not parse existing db.json, re-initializing default data.');
      }
    }
    this.initDefaultData();
  }

  initDefaultData() {
    const defaultPasswordHash = bcrypt.hashSync('Password@123', 10);
    const now = new Date().toISOString();

    this.users = [
      { id: 1, name: 'Admin Recruiter', email: 'admin@recruitment.com', password_hash: defaultPasswordHash, role: 'admin', created_at: now },
      { id: 2, name: 'John Doe', email: 'john.doe@example.com', password_hash: defaultPasswordHash, role: 'candidate', created_at: now },
      { id: 3, name: 'Jane Smith', email: 'jane.smith@example.com', password_hash: defaultPasswordHash, role: 'candidate', created_at: now },
      { id: 4, name: 'Alex Kumar', email: 'alex.kumar@example.com', password_hash: defaultPasswordHash, role: 'candidate', created_at: now }
    ];

    this.jobs = [
      {
        id: 1,
        title: 'Senior Full-Stack Engineer',
        description: 'We are seeking an experienced Senior Full-Stack Engineer to architect and build scalable web applications. You will work across Node.js, Express, React, MySQL, and modern cloud infrastructure.',
        location: 'Remote',
        job_type: 'Full-time',
        experience_level: 'Senior',
        salary_range: '$120,000 - $150,000',
        status: 'open',
        created_by: 1,
        created_at: now,
        updated_at: now,
        creator_name: 'Admin Recruiter',
        applicant_count: 0
      },
      {
        id: 2,
        title: 'Frontend Developer (React / Tailwind)',
        description: 'Join our UI team to build sleek, accessible, and responsive user experiences using React, Vite, and Tailwind CSS. Experience with state management and REST APIs is required.',
        location: 'New York, NY',
        job_type: 'Full-time',
        experience_level: 'Junior',
        salary_range: '$90,000 - $115,000',
        status: 'open',
        created_by: 1,
        created_at: now,
        updated_at: now,
        creator_name: 'Admin Recruiter',
        applicant_count: 0
      },
      {
        id: 3,
        title: 'Backend Engineer (Node.js & MySQL)',
        description: 'Focus on RESTful API design, database query optimization, security, and transaction management in high-throughput production environments.',
        location: 'San Francisco, CA',
        job_type: 'Contract',
        experience_level: 'Mid-Level',
        salary_range: '$70 - $90 / hour',
        status: 'open',
        created_by: 1,
        created_at: now,
        updated_at: now,
        creator_name: 'Admin Recruiter',
        applicant_count: 0
      },
      {
        id: 4,
        title: 'DevOps & Cloud Engineer',
        description: 'Automate container deployment, monitor infrastructure performance, and ensure reliability and high availability across cloud platforms.',
        location: 'Remote',
        job_type: 'Full-time',
        experience_level: 'Senior',
        salary_range: '$130,000 - $160,000',
        status: 'open',
        created_by: 1,
        created_at: now,
        updated_at: now,
        creator_name: 'Admin Recruiter',
        applicant_count: 0
      },
      {
        id: 5,
        title: 'Product Designer (UI/UX)',
        description: 'Create intuitive user flows, high-fidelity prototypes, and cohesive design systems for internal enterprise tooling and consumer web applications.',
        location: 'Austin, TX',
        job_type: 'Part-time',
        experience_level: 'Fresher',
        salary_range: '$50,000 - $65,000',
        status: 'closed',
        created_by: 1,
        created_at: now,
        updated_at: now,
        creator_name: 'Admin Recruiter',
        applicant_count: 0
      }
    ];

    this.applications = [];
    this.notes = [];
    this.activity = [
      {
        _id: 'act-1',
        action: 'SYSTEM_INITIALIZED',
        performedBy: { id: 1, name: 'Admin Recruiter', role: 'admin' },
        targetType: 'system',
        targetId: 'init',
        metadata: { message: 'Zero-install database initialized with default positions' },
        createdAt: now
      }
    ];

    this.nextUserId = 5;
    this.nextJobId = 6;
    this.nextAppId = 1;
    this.nextNoteId = 1;

    this.save();
  }

  save() {
    try {
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        this.dataFile,
        JSON.stringify(
          {
            users: this.users,
            jobs: this.jobs,
            applications: this.applications,
            notes: this.notes,
            activity: this.activity,
            nextUserId: this.nextUserId,
            nextJobId: this.nextJobId,
            nextAppId: this.nextAppId,
            nextNoteId: this.nextNoteId
          },
          null,
          2
        )
      );
    } catch (e) {
      console.error('[LocalDB] Failed to save state:', e.message);
    }
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
        created_at: new Date().toISOString()
      };
      this.users.push(newUser);
      this.save();
      return { insertId: newUser.id };
    }

    // 4. COUNT(*) FROM jobs
    if (queryStr.includes('SELECT COUNT(*) as total FROM jobs')) {
      let filtered = [...this.jobs];
      let pIdx = 0;
      if (queryStr.includes('j.status = ?')) {
        const statusVal = params[pIdx++];
        filtered = filtered.filter(j => j.status === statusVal);
      }
      if (queryStr.includes('j.title LIKE ?')) {
        const clean = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
        pIdx += 2;
        filtered = filtered.filter(j => j.title.toLowerCase().includes(clean) || j.description.toLowerCase().includes(clean));
      }
      if (queryStr.includes('j.location LIKE ?')) {
        const clean = String(params[pIdx++] || '').replace(/%/g, '').toLowerCase();
        filtered = filtered.filter(j => j.location.toLowerCase().includes(clean));
      }
      if (queryStr.includes('j.job_type = ?')) {
        const typeVal = params[pIdx++];
        filtered = filtered.filter(j => j.job_type === typeVal);
      }
      if (queryStr.includes('j.experience_level = ?')) {
        const expVal = params[pIdx++];
        filtered = filtered.filter(j => (j.experience_level || 'Mid-Level') === expVal);
      }
      return [{ total: filtered.length }];
    }

    // 5. SELECT single job WHERE j.id = ?
    if (queryStr.includes('WHERE j.id = ?')) {
      const id = parseInt(params[0], 10);
      const job = this.jobs.find(j => j.id === id);
      return job ? [{ ...job, experience_level: job.experience_level || 'Mid-Level', applicant_count: this.applications.filter(a => a.job_id === job.id).length }] : [];
    }

    // 6. SELECT jobs with pagination & filters
    if (queryStr.includes('SELECT') && queryStr.includes('FROM jobs j')) {
      let list = [...this.jobs];
      let pIdx = 0;
      if (queryStr.includes('j.status = ?')) {
        const statusVal = params[pIdx++];
        list = list.filter(j => j.status === statusVal);
      }
      if (queryStr.includes('j.title LIKE ?')) {
        const clean = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
        pIdx += 2;
        list = list.filter(j => j.title.toLowerCase().includes(clean) || j.description.toLowerCase().includes(clean));
      }
      if (queryStr.includes('j.location LIKE ?')) {
        const clean = String(params[pIdx++] || '').replace(/%/g, '').toLowerCase();
        list = list.filter(j => j.location.toLowerCase().includes(clean));
      }
      if (queryStr.includes('j.job_type = ?')) {
        const typeVal = params[pIdx++];
        list = list.filter(j => j.job_type === typeVal);
      }
      if (queryStr.includes('j.experience_level = ?')) {
        const expVal = params[pIdx++];
        list = list.filter(j => (j.experience_level || 'Mid-Level') === expVal);
      }

      // attach applicant counts
      list = list.map(j => ({
        ...j,
        experience_level: j.experience_level || 'Mid-Level',
        applicant_count: this.applications.filter(a => a.job_id === j.id).length
      }));

      // Pagination
      const limit = parseInt(params[params.length - 2] || '10', 10);
      const offset = parseInt(params[params.length - 1] || '0', 10);
      return list.slice(offset, offset + limit);
    }

    // 7. INSERT INTO jobs
    if (queryStr.includes('INSERT INTO jobs')) {
      const [title, description, location, job_type, experience_level, salary_range, status, created_by] = params;
      const newJob = {
        id: this.nextJobId++,
        title,
        description,
        location,
        job_type,
        experience_level: experience_level || 'Mid-Level',
        salary_range,
        status: status || 'open',
        created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator_name: 'Admin Recruiter',
        applicant_count: 0
      };
      this.jobs.unshift(newJob);
      this.save();
      return { insertId: newJob.id };
    }

    // 8. UPDATE jobs
    if (queryStr.includes('UPDATE jobs SET')) {
      const id = parseInt(params[params.length - 1], 10);
      const job = this.jobs.find(j => j.id === id);
      if (job) {
        const setSection = queryStr.split('SET ')[1].split(' WHERE')[0];
        const fields = setSection.split(',').map((part) => part.trim().split(' =')[0]);
        fields.forEach((field, idx) => {
          if (field && params[idx] !== undefined) {
            job[field] = params[idx];
          }
        });
        job.updated_at = new Date().toISOString();
        this.save();
      }
      return { affectedRows: 1 };
    }

    // 9. DELETE FROM jobs
    if (queryStr.includes('DELETE FROM jobs WHERE id = ?')) {
      const id = parseInt(params[0], 10);
      this.jobs = this.jobs.filter(j => j.id !== id);
      this.applications = this.applications.filter(a => a.job_id !== id);
      this.save();
      return { affectedRows: 1 };
    }

    // 10. SELECT applications WHERE job_id = ? AND user_id = ? (duplicate check)
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
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.applications.unshift(newApp);
      this.save();
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
        app.updated_at = new Date().toISOString();
        this.save();
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
      const counts = { applied: 0, shortlisted: 0, interview: 0, offered: 0, rejected: 0 };
      this.applications.forEach(a => {
        if (counts[a.status] !== undefined) counts[a.status]++;
      });
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    }

    return [];
  }

  // --- Document Store Helpers for MongoDB fallback ---
  addNote({ applicationId, adminId, adminName, note }) {
    const doc = {
      _id: `note-${this.nextNoteId++}`,
      applicationId: parseInt(applicationId, 10),
      adminId,
      adminName,
      note,
      createdAt: new Date().toISOString()
    };
    this.notes.unshift(doc);
    this.save();
    return doc;
  }

  getNotes(applicationId) {
    const appId = parseInt(applicationId, 10);
    return this.notes.filter(n => n.applicationId === appId);
  }

  logActivity({ action, performedBy, targetType, targetId, metadata }) {
    const doc = {
      _id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy,
      targetType,
      targetId: String(targetId),
      metadata,
      createdAt: new Date().toISOString()
    };
    this.activity.unshift(doc);
    if (this.activity.length > 100) this.activity.pop();
    this.save();
    return doc;
  }

  getRecentActivity(limit = 30) {
    return this.activity.slice(0, limit);
  }
}

const localDb = new LocalDatabase();
module.exports = localDb;
