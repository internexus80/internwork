create extension if not exists pgcrypto;

create or replace function seed_domain_with_tasks(
  p_slug text,
  p_name text,
  p_short_description text,
  p_description text,
  p_level text,
  p_duration_weeks integer,
  p_icon text,
  p_color text,
  p_display_order integer,
  p_skills text[],
  p_tasks text[],
  p_resource_title text,
  p_resource_url text,
  p_tools jsonb
)
returns void
language plpgsql
as $$
declare
  v_domain_id uuid;
  v_title text;
  v_index integer := 1;
begin
  insert into domains (
    slug, name, short_description, description, level, duration_weeks,
    duration_label, icon, color, is_active, display_order
  )
  values (
    p_slug, p_name, p_short_description, p_description, p_level, p_duration_weeks,
    p_duration_weeks || ' Weeks', p_icon, p_color, true, p_display_order
  )
  on conflict (slug) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    level = excluded.level,
    duration_weeks = excluded.duration_weeks,
    duration_label = excluded.duration_label,
    icon = excluded.icon,
    color = excluded.color,
    is_active = excluded.is_active,
    display_order = excluded.display_order
  returning id into v_domain_id;

  delete from domain_skills where domain_id = v_domain_id;
  for v_index in 1..array_length(p_skills, 1) loop
    insert into domain_skills (domain_id, skill_name, display_order)
    values (v_domain_id, p_skills[v_index], v_index);
  end loop;

  v_index := 1;
  foreach v_title in array p_tasks loop
    insert into tasks (
      domain_id, title, slug, task_number, short_description, description,
      learning_objective, prerequisites, guide, tools, deliverables,
      evaluation_criteria, allowed_submission_types, difficulty, estimated_hours,
      due_days, is_active, is_required, display_order
    )
    values (
      v_domain_id,
      v_title,
      lower(regexp_replace(v_title, '[^a-zA-Z0-9]+', '-', 'g')),
      v_index,
      'Build a practical ' || p_name || ' deliverable focused on ' || lower(v_title) || '.',
      'In this task, you will produce a portfolio-ready deliverable for ' || p_name || '. The work must show clear planning, correct implementation, documentation, and a final submission that demonstrates what you built and why it matters.',
      'Apply core ' || p_name || ' concepts by completing a real project milestone and explaining the decisions behind your implementation.',
      'Review the previous roadmap steps, set up the required tools, and prepare a GitHub repository or design workspace before starting.',
      jsonb_build_object(
        'overview', 'This task moves your ' || p_name || ' internship forward by asking you to build, document, and submit a concrete project artifact for ' || lower(v_title) || '.',
        'learning_objectives', jsonb_build_array(
          'Understand the purpose and expected outcome of ' || lower(v_title) || '.',
          'Use industry-standard tools and documentation to build the deliverable.',
          'Document implementation decisions, limitations, and next improvements.'
        ),
        'prerequisites', jsonb_build_array(
          'A working development or design environment.',
          'Basic familiarity with the domain concepts introduced in earlier tasks.'
        ),
        'steps', jsonb_build_array(
          jsonb_build_object('step', 1, 'title', 'Define the outcome', 'description', 'Write a short scope covering the problem, target user, required features, and acceptance checklist.'),
          jsonb_build_object('step', 2, 'title', 'Set up the workspace', 'description', 'Create the repository, project folder, design file, or notebook structure with clear naming and initial documentation.'),
          jsonb_build_object('step', 3, 'title', 'Build the core artifact', 'description', 'Implement the main feature, analysis, design, security lab, or deployment workflow required by this task.'),
          jsonb_build_object('step', 4, 'title', 'Validate the work', 'description', 'Test the result with realistic input, screenshots, logs, checks, or review notes depending on the task type.'),
          jsonb_build_object('step', 5, 'title', 'Prepare submission', 'description', 'Update README or case-study notes with setup instructions, output screenshots, known limitations, and the final submission link.')
        ),
        'recommended_resources', jsonb_build_array(
          jsonb_build_object('title', p_resource_title, 'url', p_resource_url),
          jsonb_build_object('title', 'GitHub Docs', 'url', 'https://docs.github.com/')
        ),
        'common_mistakes', jsonb_build_array(
          'Submitting only screenshots without explaining the implementation.',
          'Leaving the repository or design file disorganized and hard to review.'
        ),
        'submission_checklist', jsonb_build_array(
          'Public GitHub, live URL, document, or design link is accessible to reviewers.',
          'README or notes explain what was built, how to run or inspect it, and what was learned.'
        )
      ),
      p_tools,
      jsonb_build_array(
        'Accessible project or design link',
        'README or case-study documentation',
        'Screenshots, logs, or validation evidence'
      ),
      jsonb_build_array(
        jsonb_build_object('criterion', 'Functionality', 'description', 'Required functionality works correctly.', 'weight', 30),
        jsonb_build_object('criterion', 'Technical Implementation', 'description', 'Implementation follows appropriate technical practices.', 'weight', 25),
        jsonb_build_object('criterion', 'Quality', 'description', 'Code/design is clean and organized.', 'weight', 20),
        jsonb_build_object('criterion', 'Documentation', 'description', 'Project is properly documented.', 'weight', 15),
        jsonb_build_object('criterion', 'Presentation', 'description', 'Final submission is clearly presented.', 'weight', 10)
      ),
      '["github_url","live_url","text"]'::jsonb,
      case when v_index <= 2 then 'Beginner' when v_index <= 4 then 'Intermediate' else 'Advanced' end,
      case when v_index <= 2 then 6 when v_index <= 4 then 10 else 14 end,
      v_index * 4,
      true,
      true,
      v_index
    )
    on conflict (domain_id, slug) do update set
      title = excluded.title,
      task_number = excluded.task_number,
      short_description = excluded.short_description,
      description = excluded.description,
      learning_objective = excluded.learning_objective,
      prerequisites = excluded.prerequisites,
      guide = excluded.guide,
      tools = excluded.tools,
      deliverables = excluded.deliverables,
      evaluation_criteria = excluded.evaluation_criteria,
      allowed_submission_types = excluded.allowed_submission_types,
      difficulty = excluded.difficulty,
      estimated_hours = excluded.estimated_hours,
      due_days = excluded.due_days,
      is_active = excluded.is_active,
      is_required = excluded.is_required,
      display_order = excluded.display_order;

    v_index := v_index + 1;
  end loop;
end;
$$;

select seed_domain_with_tasks(
  'generative-ai',
  'Generative AI',
  'Learn prompt engineering, build applications with LLM APIs, implement RAG systems, and create autonomous AI agents.',
  'Build practical Generative AI applications using modern LLM workflows. Learn prompt engineering, LLM API integration, embeddings, vector databases, RAG pipelines, tool calling, and AI agent workflows through project-based tasks.',
  'Intermediate',
  6,
  'sparkles',
  'indigo',
  1,
  array['Prompt Engineering & LLM APIs','RAG & Vector Databases','AI Agents & Automation'],
  array['Prompt Engineering & LLM Fundamentals','Build an LLM-Powered Application','Embeddings & Vector Search','Build a RAG Application','Build an AI Agent'],
  'OpenAI API Documentation',
  'https://platform.openai.com/docs',
  '["LLM API","Embeddings","Vector database","GitHub"]'::jsonb
);

select seed_domain_with_tasks(
  'cybersecurity-ethical-hacking',
  'Cybersecurity & Ethical Hacking',
  'Understand security principles, web vulnerabilities, OWASP Top 10, security assessment, and defensive security.',
  'Practice defensive security and ethical testing in intentionally vulnerable or explicitly authorized labs. Learn Linux fundamentals, reconnaissance boundaries, OWASP risks, secure coding, and incident-response documentation.',
  'Intermediate',
  6,
  'shield',
  'emerald',
  2,
  array['Linux & Reconnaissance','Web Application Security','Incident Response & Defense'],
  array['Linux Security Fundamentals','Authorized Reconnaissance Lab','OWASP Top 10 Security Assessment','Secure Web Application','Incident Response Simulation'],
  'OWASP Documentation',
  'https://owasp.org/',
  '["Linux lab","OWASP resources","Intentionally vulnerable app","Report template"]'::jsonb
);

select seed_domain_with_tasks(
  'cloud-computing-devops',
  'Cloud Computing & DevOps',
  'Deploy application infrastructure, containerize applications with Docker, and build CI/CD pipelines.',
  'Learn cloud fundamentals, deployment workflows, Docker containerization, multi-service orchestration, and CI/CD automation through progressively integrated infrastructure tasks.',
  'Intermediate',
  6,
  'cloud',
  'sky',
  3,
  array['Cloud Deployment & Networking','Docker Containerization','DevOps & CI/CD Pipelines'],
  array['Cloud Computing Fundamentals','Deploy a Web Application','Dockerize an Application','Multi-Service Application with Docker Compose','Build a CI/CD Pipeline'],
  'Docker Documentation',
  'https://docs.docker.com/',
  '["Cloud provider","Docker","Docker Compose","GitHub Actions"]'::jsonb
);

select seed_domain_with_tasks(
  'full-stack-development',
  'Full Stack Development',
  'Build modern full-stack applications using frontend, backend APIs, databases, authentication and deployment.',
  'Build frontend interfaces, REST APIs, relational data models, authentication flows, and deployed full-stack applications using practical software engineering workflows.',
  'Beginner',
  6,
  'code',
  'amber',
  4,
  array['Frontend Frameworks','REST API Backend','Database Modeling'],
  array['Responsive Portfolio Website','React Application','REST API Backend','Database Integration','Complete Full-Stack Application'],
  'React Documentation',
  'https://react.dev/',
  '["React","Node.js","PostgreSQL","GitHub"]'::jsonb
);

select seed_domain_with_tasks(
  'web-development',
  'Web Development',
  'Learn HTML, CSS, JavaScript and responsive web development through practical projects.',
  'Develop responsive websites from semantic HTML through CSS layouts, JavaScript interactivity, public API integration, accessibility checks, and production deployment.',
  'Beginner',
  4,
  'globe',
  'blue',
  5,
  array['Responsive CSS Layouts','Interactive JavaScript','Web Deployment'],
  array['Semantic HTML Website','Responsive Website Design','JavaScript Interactive Application','Public API Integration','Production Website Deployment'],
  'MDN Web Docs',
  'https://developer.mozilla.org/',
  '["HTML","CSS","JavaScript","Browser DevTools"]'::jsonb
);

select seed_domain_with_tasks(
  'data-science',
  'Data Science',
  'Explore data analysis, visualization and machine learning fundamentals using practical datasets.',
  'Analyze real datasets with Python, clean noisy data, create visual dashboards, train baseline models, and present insights with reproducible notebooks.',
  'Beginner',
  6,
  'database',
  'cyan',
  6,
  array['Data Preprocessing & Analysis','Model Training & Evaluation','Insight Visualization'],
  array['Python Data Analysis','Data Cleaning & Preprocessing','Data Visualization Dashboard','Machine Learning Model','Model Evaluation & Insights Report'],
  'Python Documentation',
  'https://docs.python.org/',
  '["Python","Pandas","Notebook","Visualization library"]'::jsonb
);

select seed_domain_with_tasks(
  'ai-machine-learning',
  'AI & Machine Learning',
  'Gain practical experience building machine learning models and prediction systems.',
  'Learn practical model pipelines from ML fundamentals to regression, classification, clustering, and a deployable prediction API.',
  'Intermediate',
  6,
  'cpu',
  'pink',
  7,
  array['Supervised & Unsupervised Learning','Machine Learning Algorithms','AI Model Pipelines'],
  array['Machine Learning Fundamentals','Regression Prediction Model','Classification Model','Clustering Analysis','ML Prediction API'],
  'scikit-learn Documentation',
  'https://scikit-learn.org/stable/',
  '["Python","scikit-learn","Dataset","API framework"]'::jsonb
);

select seed_domain_with_tasks(
  'ui-ux-design',
  'UI/UX Design',
  'Design user-friendly digital experiences using research, wireframes, prototypes and usability testing.',
  'Practice product design through user research, flows, wireframes, high-fidelity UI, interactive prototypes, and usability-test insights.',
  'Beginner',
  4,
  'palette',
  'purple',
  8,
  array['User Research & Personas','Wireframes & Prototypes','Interface Validation'],
  array['User Research & Personas','User Flow Design','Low-Fidelity Wireframes','High-Fidelity UI Design','Interactive Prototype & Usability Test'],
  'Figma Help Center',
  'https://help.figma.com/',
  '["Figma","User research notes","Prototype","Usability test plan"]'::jsonb
);

select seed_domain_with_tasks(
  'python-programming',
  'Python Programming',
  'Learn Python fundamentals, OOP, data analysis and REST API development.',
  'Move from Python fundamentals to OOP, data analysis, REST APIs, and database-backed services through practical coding tasks.',
  'Beginner',
  5,
  'terminal',
  'indigo',
  9,
  array['Python Fundamentals & OOP','Data Analysis','REST API Development'],
  array['Python Fundamentals Application','Object-Oriented Python','Data Analysis with Pandas','REST API with FastAPI','Database-Backed Python API'],
  'FastAPI Documentation',
  'https://fastapi.tiangolo.com/',
  '["Python","Pandas","FastAPI","SQLite or PostgreSQL"]'::jsonb
);

select seed_domain_with_tasks(
  'java-programming',
  'Java Programming',
  'Master Java programming, collections, OOP, JDBC, MySQL and Spring Boot APIs.',
  'Build Java applications from fundamentals and OOP to collections, JDBC CRUD workflows, MySQL integration, and Spring Boot web services.',
  'Beginner',
  6,
  'coffee',
  'rose',
  10,
  array['Java Collections & OOP','JDBC & MySQL','Spring Boot Web Services'],
  array['Java Fundamentals','Object-Oriented Java Application','Collections & Exception Handling','JDBC + MySQL CRUD Application','Spring Boot REST API'],
  'Oracle Java Documentation',
  'https://docs.oracle.com/en/java/',
  '["Java","JDK","MySQL","Spring Boot"]'::jsonb
);

select seed_domain_with_tasks(
  'graphic-designing',
  'Graphic Designing',
  'Create professional branding, social media creatives, marketing materials and visual identities.',
  'Create visual design assets from principle boards to identity systems, campaign creatives, posters, and a complete brand kit.',
  'Beginner',
  4,
  'image',
  'fuchsia',
  11,
  array['Canva & Figma Layouts','Visual Identity & Branding','Photoshop & Illustrator Workflow'],
  array['Design Principles Board','Brand Identity','Social Media Campaign','Marketing Poster','Complete Brand Kit'],
  'Adobe Help Center',
  'https://helpx.adobe.com/',
  '["Canva","Figma","Adobe tools","Brand assets"]'::jsonb
);

select seed_domain_with_tasks(
  'mobile-app-development',
  'Mobile App Development',
  'Build cross-platform mobile applications using Flutter or React Native with APIs, authentication and local storage.',
  'Build mobile apps with multi-screen navigation, state management, API integration, authentication flows, and local database persistence.',
  'Intermediate',
  6,
  'smartphone',
  'teal',
  12,
  array['Cross-Platform UI','APIs & Authentication','SQLite & Local Storage'],
  array['Multi-Screen Mobile UI','State Management','REST API Integration','Authentication','Local Database Application'],
  'Flutter Documentation',
  'https://docs.flutter.dev/',
  '["Flutter or React Native","REST API","Authentication","SQLite"]'::jsonb
);

drop function if exists seed_domain_with_tasks(text,text,text,text,text,integer,text,text,integer,text[],text[],text,text,jsonb);
