import { UserProfile, Task, InternshipDomain, PaymentItem, CertificateData } from '@/lib/types';

export const mockUser: UserProfile = {
  name: "Hari Narayan S",
  initials: "HN",
  internId: "CAI45872",
  domain: "Full Stack Development",
  joinedOn: "12 Aug 2026",
  status: "Active",
  totalInternships: 1,
  completedInternships: 1,
  email: "hari@example.com",
  phone: "+91 98765 43210",
  college: "Indian Institute of Technology",
  graduationYear: "2026"
};

export const mockTasks: Task[] = [
  {
    id: "task-1",
    taskNumber: "in",
    title: "Mandatory: Offer Letter & LinkedIn Post",
    dueDate: "Immediate Submission",
    status: "Completed",
    submittedOnTrack: true,
    description: "Download your offer letter, post it on LinkedIn tagging InternJourneys, and share the post URL here.",
    iconType: "linkedin",
    bottomStatusText: "Completed Successfully!",
    submissionUrl: "https://linkedin.com/posts/harinarayan-offer-letter-cai45872"
  },
  {
    id: "task-2",
    taskNumber: 1,
    title: "Personal Portfolio Website",
    dueDate: "12 Aug 2026",
    status: "Completed",
    submittedOnTrack: true,
    description: "Build a full-stack personal portfolio to showcase your projects and skills.",
    keyFeatures: [
      "Frontend: HTML, CSS, JavaScript or React.js",
      "Backend: Node.js/Express.js or Django/Flask",
      "Database: MySQL, MongoDB, or PostgreSQL",
      "Deploy using a hosting platform"
    ],
    iconType: "number",
    bottomStatusText: "Completed Successfully!",
    submissionUrl: "https://github.com/harinarayan/portfolio"
  },
  {
    id: "task-3",
    taskNumber: 2,
    title: "Task Management Application",
    dueDate: "19 Aug 2026",
    status: "Completed",
    submittedOnTrack: true,
    description: "Develop a task management web application for creating, updating, and tracking tasks.",
    keyFeatures: [
      "User authentication",
      "CRUD operations",
      "Responsive design",
      "Optional real-time updates"
    ],
    iconType: "number",
    bottomStatusText: "Completed Successfully!",
    submissionUrl: "https://github.com/harinarayan/task-manager-app"
  },
  {
    id: "task-4",
    taskNumber: 3,
    title: "E-Commerce Web Application",
    dueDate: "26 Aug 2026",
    status: "Completed",
    submittedOnTrack: true,
    description: "Build a basic online store with product management and order tracking.",
    keyFeatures: [
      "Product catalog",
      "Add to cart",
      "Checkout functionality",
      "Login and role-based access",
      "Backend APIs",
      "Database integration"
    ],
    iconType: "number",
    bottomStatusText: "Completed Successfully!",
    submissionUrl: "https://github.com/harinarayan/ecommerce-app"
  },
  {
    id: "task-5",
    taskNumber: 4,
    title: "Blog Platform with Comments",
    dueDate: "02 Sept 2026",
    status: "Completed",
    submittedOnTrack: true,
    description: "Develop a blogging platform where users can create posts and comment.",
    keyFeatures: [
      "Registration and login",
      "Create/edit/delete posts",
      "Comment system",
      "REST API",
      "Database integration"
    ],
    iconType: "number",
    bottomStatusText: "Completed Successfully!",
    submissionUrl: "https://github.com/harinarayan/blog-platform"
  },
  {
    id: "task-6",
    taskNumber: 5,
    title: "Share Certificate on LinkedIn",
    dueDate: "Available",
    status: "Available",
    isCertificateTask: true,
    description: "Post your verified certificate on LinkedIn tagging InternJourneys.",
    iconType: "cert"
  }
];

export const mockDomains: InternshipDomain[] = [
  {
    id: "full-stack",
    title: "Full Stack Development",
    description: "Master modern web development from scalable Next.js & React frontends to robust Node.js APIs.",
    duration: "4 Weeks",
    level: "Beginner",
    projectCount: 5,
    category: "Software Development",
    skills: ["React.js", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    popular: true
  },
  {
    id: "frontend",
    title: "Frontend Development",
    description: "Craft responsive, interactive, and beautifully animated user interfaces using modern CSS & React.",
    duration: "4 Weeks",
    level: "Beginner",
    projectCount: 4,
    category: "Software Development",
    skills: ["HTML5", "CSS3", "JavaScript", "React.js", "TypeScript"]
  },
  {
    id: "backend",
    title: "Backend Development",
    description: "Build robust REST APIs, authentication services, database schemas, and microservices architecture.",
    duration: "4 Weeks",
    level: "Intermediate",
    projectCount: 4,
    category: "Software Development",
    skills: ["Node.js", "Python", "Express.js", "PostgreSQL", "Docker"]
  },
  {
    id: "python",
    title: "Python Development",
    description: "Learn Python automation, data processing, Django web frameworks, and algorithmic logic.",
    duration: "4 Weeks",
    level: "Beginner",
    projectCount: 4,
    category: "Software Development",
    skills: ["Python 3", "Django", "Flask", "SQLAlchemy", "REST APIs"]
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    description: "Explore neural networks, computer vision, natural language processing, and LLM integrations.",
    duration: "6 Weeks",
    level: "Intermediate",
    projectCount: 4,
    category: "Data & AI",
    skills: ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "OpenCV"],
    popular: true
  },
  {
    id: "data-science",
    title: "Data Science",
    description: "Analyze complex datasets, generate predictive models, build dashboards, and uncover business insights.",
    duration: "4 Weeks",
    level: "Beginner",
    projectCount: 4,
    category: "Data & AI",
    skills: ["Python", "Pandas", "NumPy", "Matplotlib", "PowerBI"]
  },
  {
    id: "cyber-security",
    title: "Cyber Security",
    description: "Understand ethical hacking, vulnerability assessments, network security protocols, and cryptography.",
    duration: "4 Weeks",
    level: "Intermediate",
    projectCount: 4,
    category: "Security & Cloud",
    skills: ["Network Security", "Wireshark", "Metasploit", "Ethical Hacking"]
  },
  {
    id: "ui-ux",
    title: "UI/UX Design",
    description: "Design intuitive user journeys, wireframes, high-fidelity prototypes, and cohesive visual design systems.",
    duration: "4 Weeks",
    level: "Beginner",
    projectCount: 4,
    category: "Design",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"]
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    description: "Execute SEO strategies, run content campaigns, optimize conversion rates, and master social analytics.",
    duration: "4 Weeks",
    level: "Beginner",
    projectCount: 4,
    category: "Business",
    skills: ["SEO", "Google Analytics", "Content Marketing", "Meta Ads", "Email Marketing"]
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    description: "Implement CI/CD pipelines, containerize applications with Docker, and deploy infrastructure on AWS.",
    duration: "6 Weeks",
    level: "Advanced",
    projectCount: 4,
    category: "Security & Cloud",
    skills: ["AWS", "Docker", "Kubernetes", "GitHub Actions", "Terraform"]
  }
];

export const mockPayment: PaymentItem = {
  id: "pay_100",
  title: "Certificate Processing Fee",
  purpose: "Certificate fee",
  amount: 199,
  currency: "INR",
  status: "Pending",
  dueDate: "Immediate"
};

export const mockCertificate: CertificateData = {
  id: "cert_45872",
  certId: "CAI-CERT-2026-45872",
  studentName: "Hari Narayan S",
  program: "Full Stack Development Internship",
  issueDate: "26 Aug 2026",
  status: "Pending Payment",
  verificationUrl: "https://careerai.in/verify/CAI-CERT-2026-45872"
};
