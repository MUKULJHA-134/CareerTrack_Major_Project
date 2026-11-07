const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Admin = require('../models/Admin');
const Job = require('../models/Job');
const Application = require('../models/Application');

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Checking existing database records...');

    // 1. Create or Verify Default Admin
    const adminEmail = 'admin@careertrack.com';
    let admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      admin = await Admin.create({
        name: 'Talent Acquisition Director',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'superadmin'
      });
      console.log(`[Seeder] Created default admin account: ${adminEmail} / AdminPassword123!`);
    } else {
      console.log(`[Seeder] Admin account already exists: ${adminEmail}`);
    }

    // 2. Check if jobs exist
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      console.log('[Seeder] Seeding initial job openings...');

      const sampleJobs = [
        {
          title: 'Senior Full-Stack Engineer (MERN)',
          company: 'InnovateTech Solutions',
          location: 'San Francisco, CA',
          isRemote: true,
          employmentType: 'Full-time',
          experienceLevel: 'Senior-level',
          department: 'Engineering',
          salaryMin: 140000,
          salaryMax: 185000,
          salaryCurrency: 'USD',
          isSalaryDisclosed: true,
          description:
            'InnovateTech is seeking an experienced Senior Full-Stack Engineer to lead the architecture and development of scalable cloud-native web applications. You will collaborate with cross-functional teams to deliver performant, user-centric solutions using the MERN stack.',
          responsibilities: [
            'Architect, build, and maintain scalable full-stack applications with React and Node.js',
            'Design high-throughput RESTful and GraphQL APIs with robust security standards',
            'Optimize MongoDB schemas, aggregation pipelines, and indexing strategies',
            'Champion clean code standards, unit/integration testing, and code review processes',
            'Mentor junior and mid-level software engineers across engineering practices'
          ],
          qualifications: [
            "Bachelor's or Master's degree in Computer Science, Software Engineering, or equivalent experience",
            '5+ years of production experience in JavaScript/TypeScript full-stack development',
            'Strong proficiency in React.js, Node.js, Express, and MongoDB',
            'Experience with Docker, Kubernetes, AWS/GCP, and CI/CD pipelines',
            'Solid understanding of authentication protocols, OAuth2, JWT, and web security'
          ],
          skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS'],
          benefits: [
            'Competitive equity package and annual performance bonuses',
            'Comprehensive health, dental, and vision insurance coverage',
            'Remote-first work culture with $1,500 home office stipend',
            'Unlimited Paid Time Off (PTO) and paid parental leave',
            '$2,000 annual professional development and conference budget'
          ],
          applicationInstructions:
            'Upload your updated résumé and a brief cover letter outlining your experience scaling Node.js/React applications.',
          status: 'Published',
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdBy: admin._id
        },
        {
          title: 'Cloud DevOps & Infrastructure Architect',
          company: 'CloudSphere Dynamics',
          location: 'Austin, TX',
          isRemote: true,
          employmentType: 'Full-time',
          experienceLevel: 'Lead',
          department: 'Infrastructure',
          salaryMin: 155000,
          salaryMax: 200000,
          salaryCurrency: 'USD',
          isSalaryDisclosed: true,
          description:
            'We are searching for a visionary Cloud DevOps Architect to supervise our AWS and GCP infrastructure, automate deployment pipelines, and ensure 99.99% uptime for enterprise clients.',
          responsibilities: [
            'Design and implement Terraform-based Infrastructure as Code (IaC) across multi-region environments',
            'Manage and optimize production Kubernetes (EKS/GKE) clusters',
            'Establish automated CI/CD deployment pipelines using GitHub Actions and ArgoCD',
            'Implement proactive Prometheus, Grafana, and Datadog monitoring and alerting',
            'Conduct regular penetration testing and enforce cloud security posture management'
          ],
          qualifications: [
            '6+ years in DevOps, SRE, or Cloud Infrastructure engineering',
            'Deep expertise in AWS, Terraform, Docker, and Kubernetes',
            'Hands-on experience with Linux administration and networking protocols',
            'AWS Certified Solutions Architect or CKA certification is strongly preferred'
          ],
          skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Prometheus', 'Linux'],
          benefits: [
            'Top-tier medical, vision, and dental plans',
            '401(k) matching up to 5%',
            'Flexible working hours and remote flexibility',
            'Wellness programs and gym membership reimbursement'
          ],
          applicationInstructions:
            'Submit your résumé along with links to public GitHub repositories or technical blogs showcasing your infrastructure work.',
          status: 'Published',
          applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          createdBy: admin._id
        },
        {
          title: 'Lead UI/UX Product Designer',
          company: 'PixelCraft Studio',
          location: 'New York, NY',
          isRemote: false,
          employmentType: 'Full-time',
          experienceLevel: 'Senior-level',
          department: 'Design',
          salaryMin: 125000,
          salaryMax: 160000,
          salaryCurrency: 'USD',
          isSalaryDisclosed: true,
          description:
            'PixelCraft Studio is looking for a creative Lead Product Designer who blends aesthetics with usability. You will define design systems, conduct qualitative user interviews, and deliver pixel-perfect user journeys.',
          responsibilities: [
            'Lead the end-to-end design lifecycle from wireframes and journey maps to high-fidelity prototypes',
            'Maintain and scale our Figma design system and component libraries',
            'Collaborate closely with product managers and front-end developers to ensure flawless implementation',
            'Plan and conduct user research, usability testing sessions, and competitive benchmarking'
          ],
          qualifications: [
            '4+ years designing web and mobile SaaS products',
            'Mastery of Figma, interactive prototyping, and design tokens',
            'Proven track record of shipping complex enterprise or consumer web apps',
            'Strong portfolio demonstrating design thinking, typography, and layout mastery'
          ],
          skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research'],
          benefits: [
            'Modern studio office in downtown Manhattan with catered lunches',
            'Commuter transit subsidy and health wellness credits',
            'Generous annual vacation package and learning stipend'
          ],
          applicationInstructions:
            'Please include a link to your online design portfolio in your cover letter or resume.',
          status: 'Published',
          applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          createdBy: admin._id
        },
        {
          title: 'Junior Frontend Developer (React)',
          company: 'NextWave Digital Labs',
          location: 'Seattle, WA',
          isRemote: true,
          employmentType: 'Full-time',
          experienceLevel: 'Entry-level',
          department: 'Engineering',
          salaryMin: 75000,
          salaryMax: 95000,
          salaryCurrency: 'USD',
          isSalaryDisclosed: true,
          description:
            'Start your software engineering career with NextWave Labs! Work side-by-side with seasoned mentors while building responsive, accessible React web apps for high-growth startups.',
          responsibilities: [
            'Build responsive UI components using React, HTML5, and CSS3',
            'Integrate REST APIs and handle asynchronous data flows with error handling',
            'Write clean, readable code and participate in collaborative code reviews',
            'Ensure cross-browser compatibility and responsive performance across mobile and desktop'
          ],
          qualifications: [
            "Bachelor's in CS, bootcamp graduate, or demonstrated equivalent self-taught portfolio",
            'Solid foundation in JavaScript (ES6+), HTML5, and modern CSS',
            'Familiarity with React components, hooks, and Git version control',
            'Eagerness to learn, strong problem-solving skills, and proactive communication'
          ],
          skills: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'REST APIs'],
          benefits: [
            'Dedicated 1-on-1 mentorship program from day one',
            'Comprehensive health coverage',
            'Work from home allowance',
            'Fun virtual team events and quarterly hackathons'
          ],
          applicationInstructions:
            'Submit your application with GitHub repository links to projects you have built.',
          status: 'Published',
          applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          createdBy: admin._id
        },
        {
          title: 'Data Engineer & Machine Learning Specialist',
          company: 'DataVanguard AI',
          location: 'Boston, MA',
          isRemote: true,
          employmentType: 'Full-time',
          experienceLevel: 'Mid-level',
          department: 'Data & Analytics',
          salaryMin: 120000,
          salaryMax: 150000,
          salaryCurrency: 'USD',
          isSalaryDisclosed: true,
          description:
            'DataVanguard AI develops cutting-edge predictive analytics engines. We are looking for a Data Engineer to build ETL pipelines, manage data lakes, and deploy machine learning inference models.',
          responsibilities: [
            'Build automated, fault-tolerant ETL/ELT pipelines using Python, Spark, and Airflow',
            'Model data warehouses on Snowflake and PostgreSQL for real-time reporting',
            'Package and deploy ML models into production REST microservices',
            'Monitor data pipeline latency, data quality, and anomaly detection'
          ],
          qualifications: [
            '3+ years of hands-on data engineering or ML deployment experience',
            'Proficiency with Python, SQL, Apache Spark, and Docker',
            'Familiarity with Scikit-Learn, PyTorch, or TensorFlow inference pipelines',
            'Strong background in data modeling and distributed computing'
          ],
          skills: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'Machine Learning', 'Docker'],
          benefits: [
            'Full medical, dental, and life insurance',
            'Flexible PTO and paid sabbatical after 3 years',
            'High-end developer workstation (MacBook Pro M-series)'
          ],
          applicationInstructions: 'Submit your résumé and summarize your favorite ETL/data pipeline project.',
          status: 'Published',
          applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          createdBy: admin._id
        },
        {
          title: 'Software Engineering Intern (Summer 2027)',
          company: 'InnovateTech Solutions',
          location: 'San Francisco, CA',
          isRemote: true,
          employmentType: 'Internship',
          experienceLevel: 'Entry-level',
          department: 'Engineering',
          salaryMin: 45000,
          salaryMax: 60000,
          salaryCurrency: 'USD',
          isSalaryDisclosed: true,
          description:
            'Join our 12-week paid summer internship program! Gain real-world software engineering experience working on production features used by hundreds of thousands of users.',
          responsibilities: [
            'Collaborate with mentor engineers to ship meaningful user-facing features',
            'Participate in sprint planning, daily standups, and retrospective meetings',
            'Write automated tests to guarantee code quality and prevent regressions'
          ],
          qualifications: [
            'Currently pursuing a degree in Computer Science, Software Engineering, or related field',
            'Familiarity with JavaScript, Python, or Java and web development fundamentals',
            'Passion for building software and continuous learning'
          ],
          skills: ['JavaScript', 'React.js', 'Node.js', 'Problem Solving'],
          benefits: [
            'Competitive hourly pay',
            'Full mentorship and career development workshops',
            'Consideration for full-time offer upon graduation'
          ],
          applicationInstructions: 'Submit your resume and academic transcript (optional).',
          status: 'Published',
          applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          createdBy: admin._id
        },
        {
          title: 'Legacy PHP Backend Specialist (Archived)',
          company: 'Legacy Systems Inc.',
          location: 'Chicago, IL',
          isRemote: false,
          employmentType: 'Contract',
          experienceLevel: 'Mid-level',
          department: 'Engineering',
          salaryMin: 80000,
          salaryMax: 100000,
          salaryCurrency: 'USD',
          isSalaryDisclosed: true,
          description: 'Maintenance of legacy internal PHP monolithic billing applications.',
          responsibilities: ['Patch legacy PHP 7.x scripts', 'Database maintenance'],
          qualifications: ['3 years PHP experience'],
          skills: ['PHP', 'MySQL', 'Apache'],
          benefits: ['Contract hourly rate'],
          applicationInstructions: 'Applications are closed.',
          status: 'Closed',
          applicationDeadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expired 10 days ago
          createdBy: admin._id
        }
      ];

      const createdJobs = await Job.insertMany(sampleJobs);
      console.log(`[Seeder] Seeded ${createdJobs.length} sample jobs.`);

      // 3. Seed Sample Applications
      const targetJob = createdJobs[0]; // Senior Full-Stack Engineer

      // Ensure upload directory and sample resume file exist
      const uploadDir = path.join(__dirname, '../../uploads/resumes');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const sampleResumePath = path.join(uploadDir, 'Sample_Resume_Candidate.pdf');
      if (!fs.existsSync(sampleResumePath)) {
        fs.writeFileSync(
          sampleResumePath,
          '%PDF-1.4\n% CareerTrack Sample Candidate Resume PDF Document Content Placeholder\n%%EOF'
        );
      }

      const sampleApplications = [
        {
          job: targetJob._id,
          candidateName: 'Alex Morgan',
          email: 'alex.morgan.dev@example.com',
          phone: '+1 (555) 234-5678',
          education: 'B.S. in Computer Science, Stanford University',
          experienceYears: 6,
          currentRole: 'Senior Software Engineer at Horizon Labs',
          technicalSkills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker'],
          coverLetter:
            'I have spent the past 6 years building and scaling full-stack applications in the MERN ecosystem. I led the migration of a monolithic backend to Node.js microservices handling 2M+ requests daily. InnovateTech’s mission aligns directly with my engineering passion.',
          resume: {
            originalName: 'Alex_Morgan_Resume_2026.pdf',
            fileName: 'Sample_Resume_Candidate.pdf',
            filePath: sampleResumePath,
            mimeType: 'application/pdf',
            fileSize: 45280
          },
          status: 'Shortlisted',
          notes: [
            {
              note: 'Exceptional architectural background in MERN. Scheduled for technical panel interview next Tuesday.',
              authorName: 'Talent Acquisition Director',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
          ]
        },
        {
          job: targetJob._id,
          candidateName: 'Elena Rostova',
          email: 'elena.rostova@techmail.io',
          phone: '+1 (555) 876-5432',
          education: 'M.S. in Software Engineering, Carnegie Mellon',
          experienceYears: 5,
          currentRole: 'Full Stack Engineer at CloudScale',
          technicalSkills: ['React', 'Express', 'Node.js', 'PostgreSQL', 'GraphQL', 'Kubernetes'],
          coverLetter:
            'Excited to apply for the Senior Full-Stack Engineer role. Experienced in optimizing MongoDB query speeds by 40% and designing high-fidelity React UI design systems.',
          resume: {
            originalName: 'Elena_Rostova_CV.pdf',
            fileName: 'Sample_Resume_Candidate.pdf',
            filePath: sampleResumePath,
            mimeType: 'application/pdf',
            fileSize: 52140
          },
          status: 'Interview Scheduled',
          notes: [
            {
              note: 'Screening passed with stellar feedback. Coding round scheduled.',
              authorName: 'Talent Acquisition Director',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
          ]
        },
        {
          job: createdJobs[3]._id, // Junior Frontend Developer
          candidateName: 'Marcus Chen',
          email: 'marcus.chen.web@gmail.com',
          phone: '+1 (555) 345-6789',
          education: 'B.A. in Interactive Media, UC Berkeley',
          experienceYears: 1.5,
          currentRole: 'Junior Frontend Intern',
          technicalSkills: ['JavaScript', 'React.js', 'HTML5', 'CSS3', 'Tailwind', 'Git'],
          coverLetter:
            'I am deeply passionate about crafting accessible, responsive user experiences. Built 4 live React portfolio applications with rich micro-animations.',
          resume: {
            originalName: 'Marcus_Chen_Resume.pdf',
            fileName: 'Sample_Resume_Candidate.pdf',
            filePath: sampleResumePath,
            mimeType: 'application/pdf',
            fileSize: 38200
          },
          status: 'Under Review',
          notes: []
        },
        {
          job: createdJobs[1]._id, // DevOps Architect
          candidateName: 'Sarah Jenkins',
          email: 'sarah.jenkins.cloud@outlook.com',
          phone: '+1 (555) 901-2345',
          education: 'B.S. in Information Systems, Purdue',
          experienceYears: 8,
          currentRole: 'Principal SRE at DataCore Systems',
          technicalSkills: ['AWS', 'Kubernetes', 'Terraform', 'Prometheus', 'CI/CD', 'Python'],
          coverLetter:
            'Specialized in multi-region high-availability Kubernetes setups and automated zero-downtime deployments. Certified Kubernetes Administrator (CKA).',
          resume: {
            originalName: 'Sarah_Jenkins_DevOps.pdf',
            fileName: 'Sample_Resume_Candidate.pdf',
            filePath: sampleResumePath,
            mimeType: 'application/pdf',
            fileSize: 61400
          },
          status: 'Selected',
          notes: [
            {
              note: 'Offer extended. Candidate accepted verbal offer, pending background check.',
              authorName: 'Talent Acquisition Director',
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
            }
          ]
        }
      ];

      for (const app of sampleApplications) {
        await Application.create(app);
        await Job.findByIdAndUpdate(app.job, { $inc: { totalApplications: 1 } });
      }
      console.log(`[Seeder] Seeded ${sampleApplications.length} candidate applications.`);
    }

    console.log('[Seeder] Database seeding check completed.');
  } catch (err) {
    console.error('[Seeder] Error during seeding:', err);
  }
};

module.exports = { seedDatabase };

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
