import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Department from '../models/Department.js';
import AcademicSession from '../models/AcademicSession.js';
import ProjectDomain from '../models/ProjectDomain.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import Document from '../models/Document.js';
import Meeting from '../models/Meeting.js';
import Evaluation from '../models/Evaluation.js';
import Notification from '../models/Notification.js';
import MentorRequest from '../models/MentorRequest.js';
import AuditLog from '../models/AuditLog.js';

export const seedDatabase = async () => {
  try {
    console.log('Seeding database with realistic academic lifecycle data...');

    // Clear existing data cleanly
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      AcademicSession.deleteMany({}),
      ProjectDomain.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Milestone.deleteMany({}),
      Document.deleteMany({}),
      Meeting.deleteMany({}),
      Evaluation.deleteMany({}),
      Notification.deleteMany({}),
      MentorRequest.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 1. Create Departments
    const cseDept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science & Engineering and Software Systems',
    });

    const itDept = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology and Cloud Infrastructures',
    });

    const eceDept = await Department.create({
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Department of Electronics, Embedded Systems, and IoT',
    });

    const aidsDept = await Department.create({
      name: 'Artificial Intelligence & Data Science',
      code: 'AI&DS',
      description: 'Department of AI, Machine Learning, and Big Data Engineering',
    });

    // 2. Create Project Domains
    const domainNames = [
      { name: 'Artificial Intelligence & ML', description: 'Deep learning, NLP, computer vision, and predictive analytics.' },
      { name: 'Web Engineering & SaaS', description: 'Modern distributed web applications, microservices, and real-time systems.' },
      { name: 'Cybersecurity & Blockchain', description: 'Smart contracts, zero-knowledge proofs, vulnerability detection, and pen-testing.' },
      { name: 'Cloud Computing & DevOps', description: 'Kubernetes orchestration, serverless microservices, and automated CI/CD pipelines.' },
      { name: 'Internet of Things (IoT)', description: 'Hardware sensor networks, edge compute, and embedded microcontroller systems.' },
      { name: 'Data Science & Big Data', description: 'Large-scale pipeline processing, data warehousing, and business intelligence.' },
    ];
    await ProjectDomain.insertMany(domainNames);

    // 3. Create Academic Session
    const activeSession = await AcademicSession.create({
      name: '2025 - 2026 Academic Year',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-05-31'),
      proposalDeadline: new Date('2025-09-30'),
      reviewDeadline: new Date('2025-11-15'),
      finalSubmissionDeadline: new Date('2026-04-20'),
      isActive: true,
    });

    // 4. Create Passwords
    const studentPass = await bcrypt.hash('student123', 10);
    const facultyPass = await bcrypt.hash('faculty123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);

    // 5. Create Users
    // Admin
    const adminUser = await User.create({
      name: 'Dr. Eleanor Vance (Dean & Admin)',
      email: 'admin@college.edu',
      passwordHash: adminPass,
      role: 'admin',
      department: 'Computer Science & Engineering',
      employeeId: 'ADM-1001',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    // Faculty
    const facultyHarikesh = await User.create({
      name: 'Dr. Harikesh Singh',
      email: 'dr.harikesh@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-1001',
      expertise: ['Artificial Intelligence', 'Machine Learning', 'Cloud Systems', 'Full-Stack Web Engineering', 'Capstone Project Mentorship'],
      researchInterests: ['Deep Neural Architectures', 'Edge AI Optimization', 'Distributed Intelligent Systems'],
      bio: 'Senior Faculty Mentor and Associate Professor specializing in AI systems, modern software architectures, and guiding student capstone innovations.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const facultyRashmi = await User.create({
      name: 'Rashmi Singh',
      email: 'rashmi.singh@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-1002',
      expertise: ['Software Engineering', 'Web Technologies', 'Database Systems', 'Object Oriented Design'],
      researchInterests: ['Full-Stack Frameworks', 'Relational Optimization', 'Software Verification'],
      bio: 'Assistant Professor of Computer Science dedicated to guiding student web architectures and scalable application development.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const facultyHarendra = await User.create({
      name: 'Harendra Singh',
      email: 'harendra.singh@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Information Technology',
      employeeId: 'FAC-1003',
      expertise: ['Cloud Computing', 'DevOps', 'Distributed Systems', 'Network Security'],
      researchInterests: ['Kubernetes Orchestration', 'Microservices Architecture', 'CI/CD Pipelines'],
      bio: 'Associate Professor specializing in cloud-native platforms, containerization, and network infrastructure.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const facultyAditya = await User.create({
      name: 'Aditya Adarsh',
      email: 'aditya.adarsh@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-1004',
      expertise: ['Cybersecurity', 'Blockchain & Web3', 'Cryptography', 'Data Structures & Algorithms'],
      researchInterests: ['Zero-Knowledge Proofs', 'Smart Contract Auditing', 'Privacy-Preserving Protocols'],
      bio: 'Assistant Professor with research focus on distributed cryptographic protocols, blockchain engineering, and network security.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const facultyPromodanibala = await User.create({
      name: 'Promodanibala',
      email: 'promodanibala@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Artificial Intelligence & Data Science',
      employeeId: 'FAC-1005',
      expertise: ['Natural Language Processing', 'Machine Learning', 'Big Data Analytics', 'Conversational AI'],
      researchInterests: ['Large Language Models', 'Sentiment Analysis', 'Predictive Modeling'],
      bio: 'Associate Professor in AI & Data Science leading research in NLP models, conversational intelligence, and data analytics.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    const facultyKajal = await User.create({
      name: 'Kajal Yadav',
      email: 'kajal.yadav@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Electronics & Communication',
      employeeId: 'FAC-1006',
      expertise: ['Internet of Things (IoT)', 'Embedded Systems', 'Sensor Networks', 'Edge AI'],
      researchInterests: ['Smart Sensing Nodes', 'ESP32/Raspberry Pi Hardware', 'Robotics Telemetry'],
      bio: 'Assistant Professor of Electronics specializing in embedded microcontrollers, IoT telemetry, and low-power sensor design.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    });

    // Compatibility faculty
    const facultyMarcus = await User.create({
      name: 'Dr. Marcus Vance',
      email: 'dr.marcus@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-2001',
      expertise: ['Cybersecurity', 'Blockchain & Web3', 'Cryptography'],
      researchInterests: ['Zero-Knowledge Proofs', 'Smart Contract Auditing'],
      bio: 'Professor of Computer Science specializing in distributed systems.',
      accountStatus: 'active',
    });

    const facultySarah = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'prof.sarah@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Information Technology',
      employeeId: 'FAC-2002',
      expertise: ['Cloud Architecture', 'Distributed Systems', 'DevOps'],
      researchInterests: ['Serverless Computing', 'Kubernetes Orchestration'],
      bio: 'Associate Professor specializing in scalable web engineering.',
      accountStatus: 'active',
    });

    const facultyArun = await User.create({
      name: 'Dr. Arun Sharma',
      email: 'dr.arun@college.edu',
      passwordHash: facultyPass,
      role: 'faculty',
      department: 'Artificial Intelligence & Data Science',
      employeeId: 'FAC-2003',
      expertise: ['Machine Learning', 'Computer Vision', 'Deep Learning'],
      researchInterests: ['Autonomous Navigation', 'Edge ML Optimization'],
      bio: 'Chair of AI Research Lab focusing on autonomous systems.',
      accountStatus: 'active',
    });

    // Students
    const studentHarsh = await User.create({
      name: 'Harsh Singh',
      email: 'harsh.singh@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2022-001',
      academicYear: '4th Year (Senior)',
      bio: 'Team Lead and Full-stack engineer passionate about modern web engineering, AI integrations, and cloud architectures.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    const studentDeepak = await User.create({
      name: 'Deepak Gupta',
      email: 'deepak.gupta@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2022-002',
      academicYear: '4th Year (Senior)',
      bio: 'Backend developer focused on scalable APIs, database design, and real-time WebSocket systems.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    });

    const studentDeep = await User.create({
      name: 'Deep Jain',
      email: 'deep.jain@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2022-003',
      academicYear: '4th Year (Senior)',
      bio: 'Frontend and UI/UX specialist passionate about accessible interfaces, component libraries, and animations.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    });

    const studentDeepanshu = await User.create({
      name: 'Deepanshu Vashishtha',
      email: 'deepanshu.vashishtha@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2022-004',
      academicYear: '4th Year (Senior)',
      bio: 'Machine learning enthusiast working on model deployment, data pipelines, and telemetry optimization.',
      accountStatus: 'active',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    });

    // Compatibility students
    const studentAlex = await User.create({
      name: 'Alex Rivera',
      email: 'alex.student@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2022-041',
      academicYear: '4th Year (Senior)',
      bio: 'Full-stack developer interested in distributed consensus protocols.',
      accountStatus: 'active',
    });

    const studentMaya = await User.create({
      name: 'Maya Lin',
      email: 'maya.student@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'STU-2022-088',
      academicYear: '4th Year (Senior)',
      bio: 'Frontend engineer passionate about accessible UI design systems.',
      accountStatus: 'active',
    });

    const studentLiam = await User.create({
      name: 'Liam Chen',
      email: 'liam.student@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Electronics & Communication',
      studentId: 'STU-2022-114',
      academicYear: '4th Year (Senior)',
      accountStatus: 'active',
    });

    const studentSophia = await User.create({
      name: 'Sophia Patel',
      email: 'sophia.student@college.edu',
      passwordHash: studentPass,
      role: 'student',
      department: 'Artificial Intelligence & Data Science',
      studentId: 'STU-2022-159',
      academicYear: '4th Year (Senior)',
      accountStatus: 'active',
    });

    // 6. Create Student Teams
    const teamCyberShield = await Team.create({
      name: 'Innovators Capstone Team',
      description: 'Final year capstone engineering squad building an AI-Powered College Project Lifecycle & Mentorship Management System.',
      leader: studentHarsh._id,
      members: [
        { user: studentHarsh._id, role: 'Team Lead / Full-Stack Architect', joinedAt: new Date('2025-08-15') },
        { user: studentDeepak._id, role: 'Backend & Database Engineer', joinedAt: new Date('2025-08-16') },
        { user: studentDeep._id, role: 'Frontend & UI/UX Specialist', joinedAt: new Date('2025-08-16') },
        { user: studentDeepanshu._id, role: 'AI & Systems Specialist', joinedAt: new Date('2025-08-17') },
      ],
      academicSession: activeSession._id,
    });

    const teamAutonomousTransit = await Team.create({
      name: 'Campus Transit AI',
      description: 'Developing IoT telematics and real-time scheduling forecasting for campus fleet transit.',
      leader: studentSophia._id,
      members: [
        { user: studentSophia._id, role: 'Team Lead / ML Engineer', joinedAt: new Date('2025-08-20') },
        { user: studentLiam._id, role: 'Hardware & Embedded IoT', joinedAt: new Date('2025-08-21') },
      ],
      academicSession: activeSession._id,
    });

    // 7. Create Projects
    // Project 1 (Active, Approved, Mentored by Dr. Harikesh Singh)
    const project1 = await Project.create({
      title: 'Student Project & Mentorship Management System',
      abstract: 'A web application to help college students and faculty mentors collaborate on capstone projects. Teams can submit proposals, manage tasks, schedule review meetings, and submit milestones for grading.',
      problemStatement: 'College projects often lack clear progress tracking, leading to missed deadlines and poor communication between students and faculty mentors.',
      objectives: '1. Enable students to create teams and propose projects.\n2. Allow faculty mentors to review proposals and grade milestones.\n3. Provide a shared dashboard for tasks, meetings, and file uploads.',
      domain: 'Web Engineering & SaaS',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
      expectedOutcomes: 'A fully functioning web portal for student teams and faculty mentors.',
      references: '1. College Capstone Guidelines\n2. Modern Web Development with React and Node.js',
      team: teamCyberShield._id,
      mentor: facultyHarikesh._id,
      academicSession: activeSession._id,
      status: 'approved',
      submissionVersion: 2,
      progress: 72,
      approvalHistory: [
        { status: 'draft', updatedBy: studentHarsh._id, feedback: 'Initial proposal drafted by Harsh Singh and team.', updatedAt: new Date('2025-09-02') },
        { status: 'submitted', updatedBy: studentHarsh._id, feedback: 'Proposal submitted for Dr. Harikesh Singh review.', updatedAt: new Date('2025-09-10') },
        { status: 'changes_requested', updatedBy: facultyHarikesh._id, feedback: 'Please simplify the deliverables and clarify the timeline.', updatedAt: new Date('2025-09-14') },
        { status: 'submitted', updatedBy: studentHarsh._id, feedback: 'Updated version submitted with clear sprint timeline.', updatedAt: new Date('2025-09-18') },
        { status: 'approved', updatedBy: facultyHarikesh._id, feedback: 'Proposal approved by Dr. Harikesh Singh. Clear goals and realistic plan. Good luck team!', updatedAt: new Date('2025-09-21') },
      ],
    });

    teamCyberShield.project = project1._id;
    await teamCyberShield.save();

    // Project 2 (Approved, Mentored by Dr. Arun)
    const project2 = await Project.create({
      title: 'Campus Shuttle Tracking & Arrival App',
      abstract: 'A mobile-friendly web app that tracks campus shuttle buses in real-time, helping students plan their trips and avoid missing classes.',
      problemStatement: 'Students often wait long periods for campus shuttles without knowing when the next bus will arrive.',
      objectives: '1. Track shuttle GPS locations.\n2. Estimate bus arrival times.\n3. Show a live map for students.',
      domain: 'Internet of Things (IoT)',
      technologies: ['Python', 'FastAPI', 'ESP32', 'React', 'Leaflet Maps'],
      expectedOutcomes: 'Working shuttle tracking dashboard with live map updates.',
      team: teamAutonomousTransit._id,
      mentor: facultyArun._id,
      academicSession: activeSession._id,
      status: 'approved',
      submissionVersion: 1,
      progress: 45,
      approvalHistory: [
        { status: 'submitted', updatedBy: studentSophia._id, feedback: 'Proposal submitted.', updatedAt: new Date('2025-09-12') },
        { status: 'approved', updatedBy: facultyArun._id, feedback: 'Approved by Dr. Arun Sharma.', updatedAt: new Date('2025-09-16') },
      ],
    });

    teamAutonomousTransit.project = project2._id;
    await teamAutonomousTransit.save();

    // 8. Create Tasks for Project 1
    const tasksP1 = [
      {
        project: project1._id,
        title: 'Set up database and user login',
        description: 'Create MongoDB user and project models with JWT authentication.',
        assignee: studentHarsh._id,
        creator: studentHarsh._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2025-10-15'),
        completedAt: new Date('2025-10-14'),
      },
      {
        project: project1._id,
        title: 'Build clean student dashboard UI',
        description: 'Design simple, responsive dashboard screens with Tailwind CSS.',
        assignee: studentDeep._id,
        creator: studentHarsh._id,
        priority: 'medium',
        status: 'completed',
        dueDate: new Date('2025-10-25'),
        completedAt: new Date('2025-10-24'),
      },
      {
        project: project1._id,
        title: 'Create task board and mentor request API',
        description: 'Implement API routes for tasks, meetings, and mentorship requests.',
        assignee: studentDeepak._id,
        creator: studentHarsh._id,
        priority: 'urgent',
        status: 'in_progress',
        dueDate: new Date('2025-11-20'),
      },
      {
        project: project1._id,
        title: 'Connect AI project assistant',
        description: 'Integrate AI assistant for helpful project tips and suggestions.',
        assignee: studentDeepanshu._id,
        creator: studentHarsh._id,
        priority: 'high',
        status: 'in_review',
        dueDate: new Date('2025-11-28'),
      },
      {
        project: project1._id,
        title: 'Test forms and permissions',
        description: 'Verify login, student forms, and mentor approvals work properly.',
        assignee: studentHarsh._id,
        creator: studentHarsh._id,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date('2025-12-15'),
      },
    ];
    await Task.insertMany(tasksP1);

    // 9. Create Milestones for Project 1
    const milestonesP1 = [
      {
        project: project1._id,
        title: 'Milestone 1: Project Plan & Requirements',
        description: 'Define project scope, user needs, and timeline.',
        targetDate: new Date('2025-09-25'),
        status: 'approved',
        evidenceDocuments: [{ title: 'Project_Requirements.pdf', url: '/uploads/sample-lit-review.pdf', uploadedAt: new Date('2025-09-24') }],
        facultyFeedback: 'Good clear scope. Approved by Dr. Harikesh Singh.',
        approvedBy: facultyHarikesh._id,
        approvedAt: new Date('2025-09-26'),
      },
      {
        project: project1._id,
        title: 'Milestone 2: Prototype & Core API',
        description: 'Complete basic screens, API endpoints, and database connection.',
        targetDate: new Date('2025-11-10'),
        status: 'approved',
        evidenceDocuments: [{ title: 'Prototype_Demo.pdf', url: '/uploads/sample-deploy-report.pdf', uploadedAt: new Date('2025-11-08') }],
        facultyFeedback: 'Prototype looks good. Proceed with task boards.',
        approvedBy: facultyHarikesh._id,
        approvedAt: new Date('2025-11-12'),
      },
      {
        project: project1._id,
        title: 'Milestone 3: Full Feature Integration',
        description: 'Complete task management, document uploads, and meeting booking.',
        targetDate: new Date('2026-02-15'),
        status: 'in_progress',
        evidenceDocuments: [],
      },
      {
        project: project1._id,
        title: 'Milestone 4: Final Testing & Viva',
        description: 'End-to-end testing, documentation, and final presentation.',
        targetDate: new Date('2026-04-10'),
        status: 'pending',
        evidenceDocuments: [],
      },
    ];
    await Milestone.insertMany(milestonesP1);

    // 10. Create Documents
    const docsP1 = [
      {
        project: project1._id,
        uploadedBy: studentHarsh._id,
        category: 'Project Proposal',
        originalFilename: 'MentorHub_AI_Project_Proposal_v2.pdf',
        storageKey: 'sample-proposal-v2.pdf',
        secureUrl: '/api/documents/download/sample-proposal-v2.pdf',
        mimeType: 'application/pdf',
        fileSize: 1845200,
        version: 2,
        reviewStatus: 'reviewed',
        facultyFeedback: 'Well structured and technically complete. Approved by Dr. Harikesh Singh.',
      },
      {
        project: project1._id,
        uploadedBy: studentDeep._id,
        category: 'Progress Report',
        originalFilename: 'MidTerm_Milestone_Progress_Summary.pdf',
        storageKey: 'sample-progress-report.pdf',
        secureUrl: '/api/documents/download/sample-progress-report.pdf',
        mimeType: 'application/pdf',
        fileSize: 2450100,
        version: 1,
        reviewStatus: 'reviewed',
        facultyFeedback: 'Good progress recorded. Next phase should focus on live testing.',
      },
      {
        project: project1._id,
        uploadedBy: studentHarsh._id,
        category: 'Source Code Archive',
        originalFilename: 'mentorhub-source-v1.0.zip',
        storageKey: 'sample-code-archive.zip',
        secureUrl: '/api/documents/download/sample-code-archive.zip',
        mimeType: 'application/zip',
        fileSize: 8421000,
        version: 1,
        reviewStatus: 'pending',
      },
    ];
    await Document.insertMany(docsP1);

    // 11. Create Meetings
    const meeting1 = await Meeting.create({
      project: project1._id,
      requestedBy: studentHarsh._id,
      faculty: facultyHarikesh._id,
      title: 'Bi-Weekly Capstone Progress Sync',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      duration: 30,
      agenda: 'Review sprint deliverables with Dr. Harikesh Singh and discuss AI rubric testing.',
      meetingLink: 'https://meet.google.com/mentorhub-sync-p1',
      status: 'confirmed',
    });

    const meeting2 = await Meeting.create({
      project: project1._id,
      requestedBy: studentHarsh._id,
      faculty: facultyHarikesh._id,
      title: 'Initial Architecture Consultation',
      scheduledAt: new Date('2025-10-05'),
      duration: 45,
      agenda: 'Discuss system architecture and role permissions with Dr. Harikesh Singh.',
      meetingLink: 'https://meet.google.com/mentorhub-arch-sync',
      status: 'completed',
      outcome: 'Agreed on React + Express + MongoDB architecture with clean JWT authentication.',
    });

    // 12. Create Mentor Requests
    await MentorRequest.create({
      project: project1._id,
      team: teamCyberShield._id,
      requestedFaculty: facultyHarikesh._id,
      studentMessage: 'Respected Dr. Harikesh Singh, our team is developing the AI-Powered College Project Lifecycle System. We would be honored to develop our capstone under your mentorship.',
      status: 'approved',
      facultyFeedback: 'I will gladly mentor Harsh Singh and the team. The research and engineering goals align closely with our department standards.',
      decisionAt: new Date('2025-09-21'),
    });

    // Another pending request to Rashmi Singh for secondary guidance
    await MentorRequest.create({
      project: project1._id,
      team: teamCyberShield._id,
      requestedFaculty: facultyRashmi._id,
      studentMessage: 'Dear Rashmi Singh Maam, our team would appreciate your guidance on database indexing and software engineering best practices.',
      status: 'pending',
    });

    // 13. Create In-App Notifications
    await Notification.create({
      recipient: studentHarsh._id,
      type: 'mentor_request_approved',
      title: 'Mentorship Request Approved',
      message: 'Dr. Harikesh Singh approved your mentorship request for "AI-Powered College Project Lifecycle & Mentorship Management System".',
      relatedResource: { resourceType: 'Project', resourceId: project1._id, link: `/student/projects/${project1._id}` },
      isRead: true,
      readAt: new Date('2025-09-22'),
    });

    await Notification.create({
      recipient: studentHarsh._id,
      type: 'meeting_confirmed',
      title: 'Upcoming Meeting Confirmed',
      message: 'Dr. Harikesh Singh confirmed your progress sync meeting for 3 days from now.',
      relatedResource: { resourceType: 'Meeting', resourceId: meeting1._id, link: '/student/meetings' },
      isRead: false,
    });

    await Notification.create({
      recipient: facultyHarikesh._id,
      type: 'document_uploaded',
      title: 'New Document Uploaded',
      message: 'Harsh Singh uploaded MentorHub_AI_Project_Proposal_v2.pdf for your review.',
      relatedResource: { resourceType: 'Document', resourceId: docsP1[0]._id, link: '/faculty/documents' },
      isRead: false,
    });

    // 14. Create Sample Evaluation for Archive
    await Evaluation.create({
      project: project1._id,
      evaluator: facultyHarikesh._id,
      criteria: [
        { name: 'Problem Understanding & Scope', maxScore: 15, score: 14, comment: 'Clear identification of academic project lifecycle requirements.' },
        { name: 'Technical Implementation & Architecture', maxScore: 20, score: 19, comment: 'Clean full-stack implementation and thoughtful API design.' },
        { name: 'Innovation & Research Value', maxScore: 15, score: 14, comment: 'Practical impact for university project management.' },
        { name: 'Code Quality & Engineering Standards', maxScore: 15, score: 14, comment: 'Well organized modular React components and Express services.' },
        { name: 'Documentation & Technical Reporting', maxScore: 15, score: 15, comment: 'Thorough documentation and clear system flows.' },
        { name: 'Viva Voce & Final Presentation', maxScore: 10, score: 9, comment: 'Confident presentation by Harsh Singh and team.' },
        { name: 'Team Collaboration & Agile Execution', maxScore: 10, score: 10, comment: 'Seamless collaboration across Deepak, Deep, and Deepanshu.' },
      ],
      totalScore: 95,
      maxTotalScore: 100,
      feedback: 'Outstanding project achievement under my mentorship. High engineering standards demonstrated.',
      status: 'draft',
    });

    // 15. Create Audit Logs
    await AuditLog.create({
      actor: adminUser._id,
      actorName: adminUser.name,
      actorRole: 'admin',
      action: 'SYSTEM_INITIALIZED',
      resourceType: 'System',
      metadata: { session: activeSession.name },
      ip: '127.0.0.1',
    });

    console.log('Seed completed successfully!');
    console.log('Sample Accounts for Demo & Testing:');
    console.log('  Admin:   admin@college.edu       (pass: admin123)');
    console.log('  Faculty Mentor: dr.harikesh@college.edu (pass: faculty123) - Dr. Harikesh Singh');
    console.log('  Faculty: rashmi.singh@college.edu   (pass: faculty123) - Rashmi Singh');
    console.log('  Faculty: harendra.singh@college.edu (pass: faculty123) - Harendra Singh');
    console.log('  Faculty: aditya.adarsh@college.edu  (pass: faculty123) - Aditya Adarsh');
    console.log('  Faculty: promodanibala@college.edu  (pass: faculty123) - Promodanibala');
    console.log('  Faculty: kajal.yadav@college.edu    (pass: faculty123) - Kajal Yadav');
    console.log('  Student Leader: harsh.singh@college.edu (pass: student123) - Harsh Singh');
    console.log('  Student Teammate: deepak.gupta@college.edu (pass: student123) - Deepak Gupta');
    console.log('  Student Teammate: deep.jain@college.edu (pass: student123) - Deep Jain');
    console.log('  Student Teammate: deepanshu.vashishtha@college.edu (pass: student123) - Deepanshu Vashishtha');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};

// If run directly via `node scripts/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  import('../config/db.js').then(async ({ connectDB, closeDB }) => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}
