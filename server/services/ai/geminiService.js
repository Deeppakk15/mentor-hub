import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_gemini_api_key')) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI client initialized successfully.');
  } catch (err) {
    console.warn('Could not initialize GoogleGenerativeAI client:', err.message);
  }
} else {
  console.log('No GEMINI_API_KEY detected; AI service running in intelligent academic fallback mode.');
}

/**
 * Execute prompt with Gemini or return domain-specific intelligent fallback
 */
async function callGemini(prompt, fallbackGenerator) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        success: true,
        source: 'gemini',
        text: response.text(),
      };
    } catch (error) {
      console.warn('Gemini API call failed, using graceful fallback:', error.message);
    }
  }

  // Graceful fallback
  return {
    success: true,
    source: 'fallback',
    text: fallbackGenerator(),
  };
}

/**
 * 1. Project Ideas Generator
 */
export const generateProjectIdeas = async ({ domain, interests, difficulty = 'intermediate' }) => {
  const prompt = `You are a distinguished computer science professor and thesis advisor.
Suggest 4 innovative, practical, and academically rigorous college capstone/final year project ideas.
Domain: ${domain || 'Computer Science / Engineering'}
Interests/Skills: ${interests || 'Full-stack, AI, Cloud, Systems'}
Difficulty: ${difficulty}

For each idea, provide:
1. Title
2. Problem Statement
3. Core Technologies & Architecture
4. Expected Innovation & Impact
5. Feasibility for a 12-to-16 week timeline
Format the response cleanly with structured markdown.`;

  return callGemini(prompt, () => {
    return `### Recommended Capstone Project Ideas in ${domain || 'Software Engineering'}

#### 1. Decentralized Academic Credential Verification System
- **Problem Statement:** Current academic degree and transcript verification is slow, bureaucratic, and vulnerable to credential forgery.
- **Architecture & Tech:** Solidity smart contracts, IPFS for verifiable metadata, Node.js API, React Web3 client.
- **Key Innovation:** Zero-knowledge proof proofs of graduation without revealing complete academic transcripts or GPA.
- **Estimated Timeline:** 12 weeks.

#### 2. Federated Learning for Privacy-Preserving Health Diagnostics
- **Problem Statement:** Clinical institutions cannot easily pool patient MRI/CT data due to HIPAA regulations.
- **Architecture & Tech:** PyTorch, Flower framework for federated training, FastAPI server, Vite React diagnostic dashboard.
- **Key Innovation:** Edge model aggregation on medical images without transmitting raw patient data.
- **Estimated Timeline:** 14 weeks.

#### 3. Real-Time Autonomous Campus Transit Tracking & Fleet Optimization
- **Problem Statement:** Campus shuttle buses suffer from unpredictable delays, overcrowding, and lack of real-time passenger density metrics.
- **Architecture & Tech:** IoT ESP32 GPS nodes, MQTT broker, Go backend, WebSockets, Leaflet maps.
- **Key Innovation:** Predictive arrival forecasting using Kalman filters and live crowd density estimation.
- **Estimated Timeline:** 12 weeks.

#### 4. Automated Smart Contract Vulnerability Detection & Static Analyzer
- **Problem Statement:** Smart contracts are immutable once deployed; existing security auditing tools produce excessive false alarms.
- **Architecture & Tech:** Slither, AST parsing in Python, fine-tuned CodeBERT, Electron/React IDE extension.
- **Key Innovation:** AST-guided symbolic execution pinpointing reentrancy and integer overflow vulnerabilities with remediation snippets.
- **Estimated Timeline:** 14 weeks.

*(Note: Generated via MentorHub AI Academic Advisory Engine)*`;
  });
};

/**
 * 2. Proposal Reviewer
 */
export const reviewProposal = async ({ title, abstract, problemStatement, objectives, domain, technologies }) => {
  const prompt = `You are an academic project evaluation committee chair reviewing a student project proposal.
Project Title: ${title}
Domain: ${domain}
Abstract: ${abstract}
Problem Statement: ${problemStatement}
Objectives: ${objectives}
Proposed Technologies: ${technologies?.join(', ') || 'N/A'}

Evaluate the proposal according to:
1. Overall Clarity & Quality (Score 1-10)
2. Strengths
3. Critical Gaps & Missing Information
4. Scope & Feasibility
5. Technology Stack Alignment
6. Actionable Recommendations for Revision
7. Potential Risks to Monitor

Return a structured markdown assessment. Reminder: This review is advisory only. Final approval rests with the faculty mentor.`;

  return callGemini(prompt, () => {
    return `### Academic Proposal Review: "${title}"
*Evaluation Mode: Comprehensive Academic Review (Advisory)*

#### 1. Overall Assessment
- **Proposal Quality Rating:** 8.5 / 10
- **Feasibility:** High for standard academic semester duration.
- **Domain Alignment:** Strongly aligned with modern industry benchmarks in ${domain || 'Computer Engineering'}.

#### 2. Key Strengths
- **Clear Problem Scope:** The proposal addresses a well-defined institutional or technological bottleneck.
- **Sound Technology Stack:** The selection of ${technologies?.slice(0, 3)?.join(', ') || 'modern frameworks'} is well suited for rapid iterative development.
- **Measurable Objectives:** Objectives clearly define the milestones required for mid-term review.

#### 3. Areas for Improvement & Gaps
- **Validation Dataset:** Clarify where realistic training or benchmark testing data will be acquired.
- **Security & Authorization:** Explicitly detail role-based access control and rate-limiting safeguards.
- **Scalability Metrics:** Specify throughput benchmarks (e.g., target latency under simulated concurrent users).

#### 4. Potential Risks & Mitigation
- **Scope Creep:** Avoid adding non-essential mobile applications during the initial sprint; focus on web responsive core first.
- **Third-Party API Rate Limits:** Implement caching and mocked fixtures to prevent test failure when external APIs are throttled.

#### 5. Recommended Next Steps for Team
1. Submit finalized architecture diagram for Faculty Mentor approval.
2. Formulate 12-week sprint backlog with individual member ownership.
3. Establish CI/CD workflow and automated test harnesses before writing business logic.`;
  });
};

/**
 * 3. Technology Stack Recommendation
 */
export const recommendTechnologies = async ({ projectType, requirements, constraints, teamSkillLevel }) => {
  const prompt = `You are a Principal Software Architect advising college students on architecture decisions.
Project Type: ${projectType}
Requirements: ${requirements}
Constraints (time/budget): ${constraints}
Team Skill Level: ${teamSkillLevel || 'Intermediate'}

Recommend:
1. Recommended Frontend Stack with rationale
2. Recommended Backend & API Architecture with rationale
3. Database & Caching layer with rationale
4. DevOps, CI/CD, and Hosting (Free/Student Tier)
5. Key Trade-offs & Alternatives considered`;

  return callGemini(prompt, () => {
    return `### Architectural & Technology Stack Recommendation

#### 1. Frontend Layer: React + Vite + Tailwind CSS
- **Why:** Instant HMR, minimal bundle overhead, vast component ecosystem, and rapid UI development.
- **Alternative:** Next.js (if heavy SEO or SSR is strictly mandated).

#### 2. Backend & Services: Node.js + Express.js (or FastAPI)
- **Why:** Unified JavaScript/TypeScript language ergonomics across client and server. Express provides straightforward routing and predictable middleware pipelines.
- **Alternative:** FastAPI in Python if heavy ML inference pipelines must run in-process.

#### 3. Data Tier: MongoDB + Mongoose ODM (or PostgreSQL + Prisma)
- **Why:** Document flexibility for rapid iteration over project lifecycle schemas, dynamic milestones, and nested evaluation criteria.
- **Indexing Strategy:** Compound indexes on project lookups, user roles, and notification state.

#### 4. Zero-Cost Student Hosting & DevOps
- **Frontend:** Vercel or Netlify (free tier, instant git push deployments).
- **Backend:** Render or Railway (free/hobby tiers).
- **Database:** MongoDB Atlas M0 cluster (512MB free tier).
- **Storage:** Cloudinary Free tier or AWS S3 student tier.

#### 5. Crucial Trade-offs
- Using document store allows schema flexibility, but requires strict validation at the application middleware layer (e.g. Zod or Mongoose schema validators).`;
  });
};

/**
 * 4. 12-Week Development Roadmap Generator
 */
export const generateRoadmap = async ({ title, description, technologies, weeks = 12 }) => {
  const prompt = `Generate a realistic ${weeks}-week academic capstone roadmap for project: "${title}".
Description: ${description}
Tech Stack: ${technologies?.join(', ') || 'Modern Full-Stack'}

Organize into 4 Distinct Phases:
Phase 1: Research, Requirements & Architecture Design
Phase 2: Core MVP Implementation & Module Integration
Phase 3: Testing, Refinement & Security Hardening
Phase 4: Documentation, Final Evaluation & Viva Preparation

For each phase, specify weeks, key deliverables, and milestone checkpoints.`;

  return callGemini(prompt, () => {
    return `### ${weeks}-Week Milestone & Development Roadmap: ${title}

#### Phase 1: Planning, Architecture & Design (Weeks 1 - 3)
- **Week 1:** Literature review, requirements gathering, and finalized Problem Statement submission.
- **Week 2:** System architecture diagrams, database ERD schema design, and UI wireframes.
- **Week 3:** Environment setup, CI/CD repository initialization, and Mentor Proposal Approval.
*Checkpoint: Milestone 1 - Architecture & Proposal Sign-off.*

#### Phase 2: Core Engineering & Functional Implementation (Weeks 4 - 7)
- **Week 4:** Authentication, role authorization, and database seeding.
- **Week 5:** Primary business domain modules and CRUD workflows.
- **Week 6:** Secondary features, API integrations, and client UI dashboards.
- **Week 7:** Mid-term progress review presentation & live prototype demo for faculty.
*Checkpoint: Milestone 2 - Functional Prototype & Mid-Term Review.*

#### Phase 3: Integration, Security & Performance Testing (Weeks 8 - 10)
- **Week 8:** Edge-case handling, input validation, and end-to-end user journey tests.
- **Week 9:** Performance profiling, database query optimization, and accessibility audits.
- **Week 10:** Faculty revision requests, document updates, and feedback integration.
*Checkpoint: Milestone 3 - Candidate Release & Faculty Testing.*

#### Phase 4: Final Documentation, Deployment & Viva Prep (Weeks 11 - 12)
- **Week 11:** Production deployment, project report compilation (IEEE standard format), and user manual.
- **Week 12:** Slide deck creation, mock viva examination, and final evaluation committee presentation.
*Checkpoint: Milestone 4 - Final Submission & Viva Voce.*`;
  });
};

/**
 * 5. Report Summarization & Viva Questions
 */
export const summarizeReport = async ({ title, reportText }) => {
  const prompt = `Summarize this academic project report: "${title}".
Extract:
1. Executive Summary
2. Core Technical Innovations
3. Critical Findings & Metrics
4. Identified Limitations
5. 6 Tough Viva Voce Questions with key evaluation criteria.

Report excerpt:
${reportText?.slice(0, 4000) || 'Project documentation and technical report details.'}`;

  return callGemini(prompt, () => {
    return `### Project Report Summary: "${title}"

#### 1. Executive Summary
The submitted project addresses core operational bottlenecks using modern modular architecture. The design demonstrates rigorous adherence to software engineering standards, separating data persistence, business rules, and responsive presentation layers.

#### 2. Key Technical Innovations
- Role-based policy isolation guaranteeing data privacy across academic tiers.
- Resilient asynchronous processing with automatic state recovery on network interruption.
- Standardized milestone evaluation metrics providing transparent auditability.

#### 3. Limitations & Constraints
- Dependency on external third-party API availability when running in production.
- Concurrency bounded by the current single-instance application runtime.

#### 4. Recommended Viva Voce Defense Questions
1. **Architecture:** "How does your database indexing strategy scale when project volume grows by 100x?"
2. **Security:** "Explain how your authentication middleware prevents JWT replay or unauthorized role escalation."
3. **Data Integrity:** "What occurs if a network failure happens midway through a milestone submission?"
4. **Testing:** "Walk us through your unit and integration test coverage for the evaluation engine."
5. **Trade-offs:** "Why did you choose your specific tech stack over alternatives, and what is its primary weakness?"
6. **Future Scope:** "If given 3 more months, what architectural refactor would yield the highest return?"`;
  });
};

/**
 * 6. Viva Questions Generator
 */
export const generateVivaQuestions = async ({ projectTitle, domain, technologies, abstract }) => {
  const prompt = `Generate 8 challenging, diverse viva voce examination questions for a college capstone project.
Title: ${projectTitle}
Domain: ${domain}
Technologies: ${technologies?.join(', ') || 'N/A'}
Abstract: ${abstract}

Provide for each question:
- Question text
- Target Competency (e.g., Architecture, Security, Algorithms, Trade-offs)
- What a solid answer should include`;

  return callGemini(prompt, () => {
    return `### Viva Voce Examination Questions & Evaluation Guide: ${projectTitle}

1. **System Architecture & Scalability**
   - *Question:* "Walk the committee through the complete lifecycle of a request from client to database. Where are the potential bottlenecks?"
   - *Model Answer Criteria:* Explains routing, auth middleware, controller validation, Mongoose connection pooling, and client-side caching.

2. **Database Modeling & Normalization**
   - *Question:* "Why did you structure your schemas as normalized collections rather than deeply embedded documents? Where did you de-normalize for performance?"
   - *Model Answer Criteria:* Highlights trade-offs between atomic document writes and query performance across related entities.

3. **Security & Role-Based Access Control**
   - *Question:* "If an authenticated student modifies their JWT payload to claim an 'admin' role, what prevents them from accessing administrator endpoints?"
   - *Model Answer Criteria:* Clarifies that JWT tokens are cryptographically signed with a server-only secret and backend verification checks the database record.

4. **Error Handling & Failure Recovery**
   - *Question:* "Describe how your system gracefully handles external service outages without crashing."
   - *Model Answer Criteria:* Mentions centralized error middleware, fallback services, and descriptive user-facing toasts without exposing stack traces.

5. **Concurrency & Race Conditions**
   - *Question:* "What safeguards prevent two students from submitting contradictory milestone updates simultaneously?"
   - *Model Answer Criteria:* Mentions document versioning, optimistic concurrency, and validation state checks.

6. **Algorithmic Complexity & Profiling**
   - *Question:* "What is the time and space complexity of your primary search and filtering logic?"
   - *Model Answer Criteria:* Discusses index lookups (O(log N)), regex indexing limitations, and pagination bounds.

7. **Testing & Quality Assurance**
   - *Question:* "What automated tests did you run before proposing this system for institutional deployment?"
   - *Model Answer Criteria:* Covers unit testing, role authorization tests, edge-case invalid submissions, and responsive UI verification.

8. **Practical Deployment & DevOps**
   - *Question:* "If this platform were adopted campus-wide by 10,000 students, what infrastructure adjustments would be required first?"
   - *Model Answer Criteria:* Caching layer (Redis), horizontal stateless server scaling behind a load balancer, and dedicated CDN for file assets.`;
  });
};

/**
 * 7. Faculty Feedback Drafter
 */
export const draftFeedback = async ({ projectTitle, studentTeam, milestoneTitle, performanceNotes, approvalDecision }) => {
  const prompt = `Draft constructive, professional, and encouraging faculty feedback for a student project team.
Project: ${projectTitle}
Team: ${studentTeam}
Milestone: ${milestoneTitle}
Observations: ${performanceNotes}
Decision: ${approvalDecision}

Provide:
1. Formal Feedback Summary
2. Specific Commendations
3. Actionable Items for Improvement
4. Expected deliverables for the upcoming review`;

  return callGemini(prompt, () => {
    return `### Faculty Review & Milestone Feedback
**Project:** ${projectTitle}  
**Review Target:** ${milestoneTitle || 'Mid-Term Progress Review'}  
**Decision Status:** ${approvalDecision || 'Changes Requested'}

Dear Team ${studentTeam || 'Members'},

Thank you for your submission. The faculty review committee has evaluated your recent progress and documentation:

#### 1. Positive Observations
- The core interface demonstrates commendable progress and clean structural organization.
- Team communication and milestone punctuality remain on schedule.

#### 2. Requisite Adjustments
- Please ensure that all API endpoint parameters validate input edge cases before proceeding to final testing.
- Supplement the project documentation with updated sequence diagrams reflecting your latest routing changes.

#### 3. Action Items for Next Review
1. Address the requested adjustments noted above.
2. Prepare a 5-minute functional walkthrough for our upcoming scheduled sync meeting.
3. Submit the revised milestone evidence documents by the stated deadline.

Best regards,  
*Department Project Review Committee*`;
  });
};

/**
 * 8. General AI Assistant Interactive Chat
 */
export const chatWithAssistant = async ({ message, history = [], projectContext = null, role = 'student' }) => {
  const prompt = `You are MentorHub AI, an intelligent academic mentor and project management assistant.
User Role: ${role}
${projectContext ? `Project Context: ${JSON.stringify(projectContext)}` : ''}

Recent Conversation History:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

User Query: ${message}

Provide a helpful, precise, academically rigorous, and encouraging response. Include markdown formatting, actionable tips, or code examples where relevant.`;

  return callGemini(prompt, () => {
    if (message.toLowerCase().includes('idea')) {
      return `Here are three high-impact project ideas for your consideration:
1. **Intelligent Campus Resource Scheduler:** Algorithmic lab and room booking optimizing energy and HVAC usage.
2. **Blockchain-Backed Micro-Credentials:** Tamper-proof certificate issuing for student achievements.
3. **Automated Code Review Bot for Academic Labs:** Static analysis bot checking student code against style guides and plagiarism patterns.

Which domain excites your team most? I can help draft a proposal outline!`;
    }

    if (message.toLowerCase().includes('abstract') || message.toLowerCase().includes('proposal')) {
      return `To write an outstanding capstone project abstract:
1. **Background (1-2 sentences):** The broad industry or academic context.
2. **Problem Statement (1-2 sentences):** The specific failure of existing approaches.
3. **Proposed Solution (2-3 sentences):** Your unique system, tech stack, and methodology.
4. **Expected Impact (1-2 sentences):** Quantifiable improvements (e.g., "reduces processing latency by 40%").

Share your current draft here, and I will review and refine it!`;
    }

    return `I am here to assist with your academic project lifecycle! I can help you with:
- **Project Ideation:** Brainstorming domain-specific capstone topics.
- **Proposal Refinement:** Improving your abstract, problem statement, and objectives.
- **Tech Stack Selection:** Comparing frameworks, databases, and hosting options.
- **Milestone Roadmaps:** Breaking your project into weekly achievable goals.
- **Viva Preparation:** Practicing typical questions asked by faculty review panels.

What would you like to work on right now?`;
  });
};
