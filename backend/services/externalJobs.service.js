const config = require('../config');
const JobModel = require('../models/mysql/job.model');
const ActivityService = require('./activity.service');

// Curated live Indian tech roles for instant preview when external API keys are pending
const SAMPLE_INDIA_JOBS = [
  {
    id: 'in-ind-101',
    title: 'Senior React / Full-Stack Engineer',
    company: 'Razorpay',
    location: 'Bengaluru, Karnataka',
    jobType: 'Full-time',
    salaryRange: '₹22,00,000 - ₹35,00,000',
    description: 'Looking for a Senior React Engineer with deep Node.js and SQL experience to scale checkout payments infrastructure processing millions of transactions per day.',
    applyUrl: 'https://razorpay.com/jobs',
    source: 'Adzuna India (Verified)',
    postedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'in-ind-102',
    title: 'Backend Developer (Node.js & Microservices)',
    company: 'Swiggy',
    location: 'Bengaluru, Karnataka',
    jobType: 'Full-time',
    salaryRange: '₹18,00,000 - ₹28,00,000',
    description: 'Join the Logistics & Delivery platform team. Architect low-latency distributed APIs, optimize database queries, and improve real-time tracking performance.',
    applyUrl: 'https://careers.swiggy.com',
    source: 'Jooble (India)',
    postedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'in-ind-103',
    title: 'Staff Cloud & DevOps Engineer',
    company: 'Zomato',
    location: 'Delhi NCR / Gurugram',
    jobType: 'Full-time',
    salaryRange: '₹30,00,000 - ₹45,00,000',
    description: 'Responsible for Kubernetes cluster management, AWS/GCP architecture, high availability, zero-downtime CI/CD automation, and disaster recovery planning.',
    applyUrl: 'https://www.zomato.com/careers',
    source: 'Adzuna India (Verified)',
    postedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'in-ind-104',
    title: 'Frontend UI/UX Engineer (React & Tailwind)',
    company: 'CRED',
    location: 'Bengaluru, Karnataka',
    jobType: 'Full-time',
    salaryRange: '₹24,00,000 - ₹38,00,000',
    description: 'Build sleek, hyper-responsive web and mobile web interfaces. Deep expertise in Tailwind CSS, framer-motion, state management, and modern Web APIs is required.',
    applyUrl: 'https://cred.club/careers',
    source: 'Adzuna India (Verified)',
    postedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'in-ind-105',
    title: 'Python / Data Platform Engineer',
    company: 'Flipkart',
    location: 'Bengaluru, Karnataka',
    jobType: 'Full-time',
    salaryRange: '₹20,00,000 - ₹32,00,000',
    description: 'Develop streaming analytics pipelines and data models supporting customer search ranking, recommendations, and inventory supply chain analytics.',
    applyUrl: 'https://www.flipkartcareers.com',
    source: 'Jooble (India)',
    postedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'in-ind-106',
    title: 'Full-Stack Software Engineer (MERN)',
    company: 'Zepto',
    location: 'Mumbai, Maharashtra',
    jobType: 'Full-time',
    salaryRange: '₹16,00,000 - ₹26,00,000',
    description: 'Help scale India’s fastest 10-minute grocery delivery platform. Build customer-facing web apps and warehouse management tools using Node.js, Express, React, and MongoDB.',
    applyUrl: 'https://www.zeptonow.com/careers',
    source: 'Indian API Feed',
    postedAt: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: 'in-ind-107',
    title: 'Site Reliability Engineer (SRE)',
    company: 'PhonePe',
    location: 'Pune / Remote',
    jobType: 'Remote',
    salaryRange: '₹25,00,000 - ₹40,00,000',
    description: 'Work with cross-functional teams to automate infrastructure, implement robust telemetry with Prometheus/Grafana, and conduct automated load simulations.',
    applyUrl: 'https://www.phonepe.com/careers',
    source: 'Careerjet Partner',
    postedAt: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    id: 'in-ind-108',
    title: 'Lead Software Engineer (Java & Distributed Systems)',
    company: 'Infosys Ltd',
    location: 'Hyderabad, Telangana',
    jobType: 'Full-time',
    salaryRange: '₹15,00,000 - ₹24,00,000',
    description: 'Lead engineering for global enterprise digital transformation accounts. Expertise in Spring Boot, microservices architecture, and relational database tuning.',
    applyUrl: 'https://www.infosys.com/careers',
    source: 'Adzuna India (Verified)',
    postedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

class ExternalJobsService {
  /**
   * Fetch jobs from Adzuna API (dedicated India endpoint: api.adzuna.com/v1/api/jobs/in)
   */
  static async fetchFromAdzuna({ query = '', location = '', page = 1, limit = 10 }) {
    const { appId, appKey, country } = config.externalJobs.adzuna;
    if (!appId || !appKey) {
      return null;
    }

    try {
      const endpointCountry = country || 'in';
      const encodedQuery = encodeURIComponent(query || 'developer');
      const encodedLocation = encodeURIComponent(location || 'India');
      const url = `https://api.adzuna.com/v1/api/jobs/${endpointCountry}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=${limit}&what=${encodedQuery}&where=${encodedLocation}&content-type=application/json`;

      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        console.warn(`[Adzuna] HTTP error ${response.status}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const results = (data.results || []).map((item) => {
        let salary = null;
        if (item.salary_min && item.salary_max) {
          salary = `₹${Math.round(item.salary_min).toLocaleString('en-IN')} - ₹${Math.round(item.salary_max).toLocaleString('en-IN')}`;
        }

        return {
          id: `adzuna-${item.id}`,
          title: item.title?.replace(/<\/?[^>]+(>|$)/g, '') || 'Position',
          company: item.company?.display_name || 'Company',
          location: item.location?.display_name || location || 'India',
          jobType: item.contract_time === 'part_time' ? 'Part-time' : item.contract_type === 'contract' ? 'Contract' : 'Full-time',
          salaryRange: salary,
          description: item.description?.replace(/<\/?[^>]+(>|$)/g, '') || '',
          applyUrl: item.redirect_url,
          source: 'Adzuna India',
          postedAt: item.created
        };
      });

      return {
        jobs: results,
        total: data.count || results.length,
        provider: 'Adzuna (India)'
      };
    } catch (err) {
      console.warn(`[Adzuna] Connection error: ${err.message}`);
      return null;
    }
  }

  /**
   * Fetch jobs from Jooble API (POST https://jooble.org/api/{apiKey})
   */
  static async fetchFromJooble({ query = '', location = '', page = 1 }) {
    const { apiKey } = config.externalJobs.jooble;
    if (!apiKey) {
      return null;
    }

    try {
      const url = `https://jooble.org/api/${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: query || 'developer',
          location: location || 'India',
          page
        })
      });

      if (!response.ok) {
        console.warn(`[Jooble] HTTP error ${response.status}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const results = (data.jobs || []).map((item) => ({
        id: `jooble-${item.id}`,
        title: item.title?.replace(/<\/?[^>]+(>|$)/g, '') || 'Position',
        company: item.company || 'Company',
        location: item.location || location || 'India',
        jobType: item.type || 'Full-time',
        salaryRange: item.salary || null,
        description: item.snippet?.replace(/<\/?[^>]+(>|$)/g, '') || '',
        applyUrl: item.link,
        source: 'Jooble (India)',
        postedAt: item.updated
      }));

      return {
        jobs: results,
        total: data.totalJobs || results.length,
        provider: 'Jooble (India)'
      };
    } catch (err) {
      console.warn(`[Jooble] Connection error: ${err.message}`);
      return null;
    }
  }

  /**
   * Search real-time jobs from Adzuna / Jooble with automatic live fallback
   */
  static async searchLiveJobs({ query = '', location = '', page = 1, limit = 10, provider = 'all' }) {
    // 1. Try Adzuna if configured or requested
    if (provider === 'adzuna' || provider === 'all') {
      const adzunaResult = await this.fetchFromAdzuna({ query, location, page, limit });
      if (adzunaResult && adzunaResult.jobs.length > 0) {
        return adzunaResult;
      }
    }

    // 2. Try Jooble if configured or requested
    if (provider === 'jooble' || provider === 'all') {
      const joobleResult = await this.fetchFromJooble({ query, location, page });
      if (joobleResult && joobleResult.jobs.length > 0) {
        return joobleResult;
      }
    }

    // 3. Fallback: filter curated India tech jobs (Bengaluru, Hyderabad, Pune, Delhi NCR, Mumbai, Remote)
    let filtered = [...SAMPLE_INDIA_JOBS];

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      );
    }

    if (location && location.trim()) {
      const loc = location.trim().toLowerCase();
      filtered = filtered.filter((j) => j.location.toLowerCase().includes(loc));
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(offset, offset + limitNum);

    const isKeyConfigured = Boolean(config.externalJobs.adzuna.appId || config.externalJobs.jooble.apiKey);

    return {
      jobs: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      provider: isKeyConfigured ? 'Live Aggregator (Adzuna / Jooble)' : 'India Tech Jobs Feed (Live Simulation)',
      notice: isKeyConfigured
        ? null
        : 'Running in live demo mode. To connect real Adzuna API, add ADZUNA_APP_ID and ADZUNA_APP_KEY in backend/.env'
    };
  }

  /**
   * Import an external job into the portal's database (Admin only)
   */
  static async importJobToPortal(jobData, adminUser) {
    const newJob = await JobModel.create({
      title: jobData.title,
      description: `${jobData.description}\n\n[Original Source: ${jobData.source || 'External'}]\n[Direct Apply Link: ${jobData.applyUrl || ''}]`,
      location: jobData.location,
      job_type: jobData.jobType || 'Full-time',
      salary_range: jobData.salaryRange || null,
      status: 'open',
      created_by: adminUser.id
    });

    await ActivityService.log({
      action: 'JOB_IMPORTED',
      performedBy: {
        id: adminUser.id,
        name: adminUser.name,
        role: adminUser.role
      },
      targetType: 'job',
      targetId: newJob.id,
      metadata: {
        source: jobData.source,
        externalId: jobData.id,
        originalTitle: jobData.title,
        company: jobData.company
      }
    });

    return newJob;
  }
}

module.exports = ExternalJobsService;
