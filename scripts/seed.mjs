// Seeds CognoDB with a realistic Computer Science curriculum:
// courses, departments, topics, instructors, students and their
// completed-course history. Safe to re-run — it clears the graph first.
//
// Usage: npm run seed   (reads COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD from .env)

import "dotenv/config";
import neo4j from "neo4j-driver";

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !user || !password) {
  console.error(
    "Missing COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD. Copy .env.example to .env and fill it in.",
  );
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const departments = ["Computer Science", "Mathematics", "Statistics"];

const topics = [
  "Programming Fundamentals",
  "Data Structures",
  "Algorithms",
  "Discrete Math",
  "Linear Algebra",
  "Probability",
  "Systems Programming",
  "Operating Systems",
  "Computer Networks",
  "Databases",
  "Distributed Systems",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "NLP",
  "Software Engineering",
  "Theory of Computation",
  "Security",
  "Human-Computer Interaction",
  "Graph Theory",
];

const instructors = [
  { name: "Dr. Anjali Rao", title: "Professor" },
  { name: "Dr. Marcus Webb", title: "Associate Professor" },
  { name: "Dr. Priya Nair", title: "Professor" },
  { name: "Dr. Kevin Zhang", title: "Assistant Professor" },
  { name: "Dr. Sofia Alvarez", title: "Associate Professor" },
  { name: "Dr. Ben Okafor", title: "Professor" },
];

// requires: array of course codes that are direct prerequisites
const courses = [
  {
    code: "CS101",
    title: "Programming Fundamentals",
    credits: 4,
    level: 100,
    dept: "Computer Science",
    description:
      "Introduction to programming using Python: variables, control flow, functions, and basic problem solving.",
    topics: ["Programming Fundamentals"],
    requires: [],
  },
  {
    code: "CS102",
    title: "Data Structures",
    credits: 4,
    level: 100,
    dept: "Computer Science",
    description:
      "Arrays, linked lists, stacks, queues, trees, hash tables, and their time/space trade-offs.",
    topics: ["Data Structures", "Programming Fundamentals"],
    requires: ["CS101"],
  },
  {
    code: "MATH101",
    title: "Discrete Mathematics",
    credits: 3,
    level: 100,
    dept: "Mathematics",
    description:
      "Logic, sets, relations, induction, combinatorics, and graph theory foundations for computer science.",
    topics: ["Discrete Math", "Graph Theory"],
    requires: [],
  },
  {
    code: "MATH201",
    title: "Linear Algebra",
    credits: 3,
    level: 200,
    dept: "Mathematics",
    description:
      "Vectors, matrices, eigenvalues, and vector spaces, with applications to computing.",
    topics: ["Linear Algebra"],
    requires: ["MATH101"],
  },
  {
    code: "STAT201",
    title: "Probability & Statistics",
    credits: 3,
    level: 200,
    dept: "Statistics",
    description:
      "Random variables, distributions, estimation, and hypothesis testing.",
    topics: ["Probability"],
    requires: ["MATH101"],
  },
  {
    code: "CS201",
    title: "Algorithms",
    credits: 4,
    level: 200,
    dept: "Computer Science",
    description:
      "Algorithm design and analysis: divide-and-conquer, greedy methods, dynamic programming, NP-completeness.",
    topics: ["Algorithms", "Discrete Math"],
    requires: ["CS102", "MATH101"],
  },
  {
    code: "CS202",
    title: "Systems Programming",
    credits: 4,
    level: 200,
    dept: "Computer Science",
    description:
      "C programming, memory management, processes, and the Unix systems interface.",
    topics: ["Systems Programming"],
    requires: ["CS102"],
  },
  {
    code: "CS210",
    title: "Discrete Structures for CS",
    credits: 3,
    level: 200,
    dept: "Computer Science",
    description:
      "Applied graph algorithms, proofs, and combinatorics for CS majors.",
    topics: ["Discrete Math", "Graph Theory"],
    requires: ["MATH101", "CS102"],
  },
  {
    code: "CS301",
    title: "Operating Systems",
    credits: 4,
    level: 300,
    dept: "Computer Science",
    description:
      "Processes, threads, scheduling, memory management, and file systems.",
    topics: ["Operating Systems", "Systems Programming"],
    requires: ["CS202", "CS201"],
  },
  {
    code: "CS302",
    title: "Computer Networks",
    credits: 3,
    level: 300,
    dept: "Computer Science",
    description: "Network layers, TCP/IP, routing, and application protocols.",
    topics: ["Computer Networks", "Systems Programming"],
    requires: ["CS202"],
  },
  {
    code: "CS303",
    title: "Databases",
    credits: 3,
    level: 300,
    dept: "Computer Science",
    description:
      "Relational modeling, SQL, transactions, and an introduction to NoSQL and graph databases.",
    topics: ["Databases"],
    requires: ["CS201"],
  },
  {
    code: "CS304",
    title: "Software Engineering",
    credits: 3,
    level: 300,
    dept: "Computer Science",
    description:
      "Requirements, design patterns, testing, and team development practices.",
    topics: ["Software Engineering"],
    requires: ["CS201"],
  },
  {
    code: "CS310",
    title: "Theory of Computation",
    credits: 3,
    level: 300,
    dept: "Computer Science",
    description: "Automata, formal languages, computability, and complexity.",
    topics: ["Theory of Computation", "Discrete Math"],
    requires: ["CS201", "CS210"],
  },
  {
    code: "CS320",
    title: "Human-Computer Interaction",
    credits: 3,
    level: 300,
    dept: "Computer Science",
    description: "User-centered design, prototyping, and usability evaluation.",
    topics: ["Human-Computer Interaction"],
    requires: ["CS201"],
  },
  {
    code: "CS330",
    title: "Introduction to Machine Learning",
    credits: 4,
    level: 300,
    dept: "Computer Science",
    description:
      "Supervised and unsupervised learning, model evaluation, and core ML algorithms.",
    topics: ["Machine Learning"],
    requires: ["CS201", "MATH201", "STAT201"],
  },
  {
    code: "CS401",
    title: "Distributed Systems",
    credits: 4,
    level: 400,
    dept: "Computer Science",
    description:
      "Consensus, replication, consistency models, and large-scale system design.",
    topics: ["Distributed Systems", "Computer Networks"],
    requires: ["CS301", "CS302"],
  },
  {
    code: "CS402",
    title: "Computer Security",
    credits: 3,
    level: 400,
    dept: "Computer Science",
    description:
      "Cryptography fundamentals, network security, and secure system design.",
    topics: ["Security", "Computer Networks"],
    requires: ["CS301", "CS302"],
  },
  {
    code: "CS403",
    title: "Advanced Databases",
    credits: 3,
    level: 400,
    dept: "Computer Science",
    description:
      "Query optimization, distributed transactions, and graph & document data models at scale.",
    topics: ["Databases", "Distributed Systems"],
    requires: ["CS303"],
  },
  {
    code: "CS430",
    title: "Deep Learning",
    credits: 4,
    level: 400,
    dept: "Computer Science",
    description:
      "Neural networks, backpropagation, CNNs and RNNs, and modern training practices.",
    topics: ["Deep Learning", "Machine Learning"],
    requires: ["CS330"],
  },
  {
    code: "CS431",
    title: "Computer Vision",
    credits: 3,
    level: 400,
    dept: "Computer Science",
    description:
      "Image formation, feature extraction, and deep learning approaches to vision tasks.",
    topics: ["Computer Vision", "Deep Learning"],
    requires: ["CS430"],
  },
  {
    code: "CS432",
    title: "Natural Language Processing",
    credits: 3,
    level: 400,
    dept: "Computer Science",
    description:
      "Language modeling, sequence models, and transformer architectures.",
    topics: ["NLP", "Deep Learning"],
    requires: ["CS430"],
  },
  {
    code: "CS440",
    title: "Capstone Project",
    credits: 4,
    level: 400,
    dept: "Computer Science",
    description:
      "A semester-long team project applying software engineering practice to a real system.",
    topics: ["Software Engineering"],
    requires: ["CS304", "CS303"],
  },
];

const students = [
  {
    studentId: "S1001",
    name: "Ananya Reddy",
    year: 2,
    major: "Computer Science",
    completed: ["CS101", "CS102", "MATH101", "STAT201"],
  },
  {
    studentId: "S1002",
    name: "Rahul Varma",
    year: 3,
    major: "Computer Science",
    completed: [
      "CS101",
      "CS102",
      "MATH101",
      "MATH201",
      "STAT201",
      "CS201",
      "CS202",
      "CS210",
    ],
  },
  {
    studentId: "S1003",
    name: "Meera Iyer",
    year: 4,
    major: "Computer Science",
    completed: [
      "CS101",
      "CS102",
      "MATH101",
      "MATH201",
      "STAT201",
      "CS201",
      "CS202",
      "CS210",
      "CS301",
      "CS302",
      "CS303",
      "CS330",
    ],
  },
  {
    studentId: "S1004",
    name: "Faisal Khan",
    year: 1,
    major: "Computer Science",
    completed: ["CS101"],
  },
  {
    studentId: "S1005",
    name: "Sneha Kulkarni",
    year: 3,
    major: "Computer Science",
    completed: [
      "CS101",
      "CS102",
      "MATH101",
      "MATH201",
      "STAT201",
      "CS201",
      "CS210",
      "CS330",
    ],
  },
];

async function seed() {
  const session = driver.session();
  try {
    console.log("Connecting to CognoDB...");
    await driver.verifyConnectivity();

    console.log("Clearing existing graph...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("Creating constraints...");
    await session.run(
      "CREATE CONSTRAINT course_code IF NOT EXISTS FOR (c:Course) REQUIRE c.code IS UNIQUE",
    );
    await session.run(
      "CREATE CONSTRAINT dept_name IF NOT EXISTS FOR (d:Department) REQUIRE d.name IS UNIQUE",
    );
    await session.run(
      "CREATE CONSTRAINT topic_name IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE",
    );
    await session.run(
      "CREATE CONSTRAINT student_id IF NOT EXISTS FOR (s:Student) REQUIRE s.studentId IS UNIQUE",
    );

    console.log("Loading departments...");
    for (const name of departments) {
      await session.run("MERGE (:Department {name: $name})", { name });
    }

    console.log("Loading topics...");
    for (const name of topics) {
      await session.run("MERGE (:Topic {name: $name})", { name });
    }

    console.log("Loading instructors...");
    for (const inst of instructors) {
      await session.run(
        "MERGE (:Instructor {name: $name, title: $title})",
        inst,
      );
    }

    console.log("Loading courses...");
    for (const c of courses) {
      await session.run(
        `MERGE (c:Course {code: $code})
         SET c.title = $title, c.credits = $credits, c.level = $level, c.description = $description
         WITH c
         MATCH (d:Department {name: $dept})
         MERGE (c)-[:BELONGS_TO]->(d)`,
        c,
      );
      for (const topic of c.topics) {
        await session.run(
          `MATCH (c:Course {code: $code}), (t:Topic {name: $topic})
           MERGE (c)-[:COVERS]->(t)`,
          { code: c.code, topic },
        );
      }
    }

    console.log("Wiring prerequisites...");
    for (const c of courses) {
      for (const req of c.requires) {
        await session.run(
          `MATCH (c:Course {code: $code}), (p:Course {code: $req})
           MERGE (c)-[:REQUIRES]->(p)`,
          { code: c.code, req },
        );
      }
    }

    console.log("Assigning instructors...");
    for (const [i, c] of courses.entries()) {
      const inst = instructors[i % instructors.length];
      await session.run(
        `MATCH (c:Course {code: $code}), (i:Instructor {name: $name})
     MERGE (i)-[:TEACHES]->(c)`,
        { code: c.code, name: inst.name },
      );
    }

    console.log("Loading students & completion history...");
    for (const s of students) {
      await session.run(
        `MERGE (s:Student {studentId: $studentId})
         SET s.name = $name, s.year = $year, s.major = $major
         WITH s
         MATCH (d:Department {name: $major})
         MERGE (s)-[:MAJORS_IN]->(d)`,
        s,
      );
      for (const [idx, code] of s.completed.entries()) {
        await session.run(
          `MATCH (s:Student {studentId: $studentId}), (c:Course {code: $code})
           MERGE (s)-[r:COMPLETED]->(c)
           SET r.grade = $grade, r.term = $term`,
          {
            studentId: s.studentId,
            code,
            grade: ["A", "A-", "B+", "B"][idx % 4],
            term: `Term ${Math.ceil((idx + 1) / 4)}`,
          },
        );
      }
    }

    const counts = await session.run(
      `MATCH (n) RETURN labels(n)[0] AS label, count(*) AS n ORDER BY label`,
    );
    console.log("\nSeed complete. Node counts:");
    counts.records.forEach((r) =>
      console.log(`  ${r.get("label")}: ${r.get("n").toNumber()}`),
    );
  } catch (err) {
    console.error("\nSeed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
