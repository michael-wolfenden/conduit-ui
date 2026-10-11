// oxlint-disable typescript/no-restricted-types
export interface DbUser {
  id: number;
  email: string;
  username: string;
  password: string;
  bio: string | null;
  image: string | null;
  followedBy: DbUser[];
}

export interface DbComment {
  id: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: DbUser;
}

export interface DbArticle {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favouritedBy: DbUser[];
  author: DbUser;
  comments: DbComment[];
}

// see: https://github.com/c4ffein/realworld-demo-deploy/blob/master/realworld_dummy_server.py

const johndoe: DbUser = {
  id: 1,
  email: "john.doe@example.com",
  username: "johndoe",
  password: "password123",
  bio: "Full-stack developer passionate about clean code and innovative solutions. Love working with modern web technologies.",
  image: "https://i.pravatar.cc/100?img=33",
  followedBy: [],
};

const janesmith: DbUser = {
  id: 2,
  email: "jane.smith@example.com",
  username: "janesmith",
  password: "password123",
  bio: "Frontend developer with a keen eye for UI/UX design. Specializing in React and modern CSS frameworks.",
  image: "https://i.pravatar.cc/100?img=9",
  followedBy: [],
};

const mikewilson: DbUser = {
  id: 3,
  email: "mike.wilson@example.com",
  username: "mikewilson",
  password: "password123",
  bio: "Backend engineer focused on scalable architecture and DevOps. Enthusiast of cloud technologies and automation.",
  image: "https://i.pravatar.cc/100?img=70",
  followedBy: [],
};

const sarahchen: DbUser = {
  id: 4,
  email: "sarah.chen@example.com",
  username: "sarahchen",
  password: "password123",
  bio: "Data scientist and machine learning engineer. Passionate about turning data into actionable insights.",
  image: "https://i.pravatar.cc/100?img=36",
  followedBy: [],
};

johndoe.followedBy.push(mikewilson);
janesmith.followedBy.push(johndoe);
mikewilson.followedBy.push(johndoe);
sarahchen.followedBy.push(janesmith, mikewilson);

export const dbArticles: DbArticle[] = [
  {
    id: 1,
    slug: "how-to-learn-javascript-efficiently",
    title: "How to Learn JavaScript Efficiently",
    description: "A comprehensive guide to mastering JavaScript from beginner to advanced level",
    body: "Learning JavaScript can be overwhelming with so many resources available. Here's a structured approach that has helped thousands of developers master this essential language.\n\n## Start with the Fundamentals\n\nBefore diving into frameworks, master the core concepts: variables, functions, objects, and arrays. Understanding these building blocks is crucial for writing clean, maintainable code.\n\n## Practice with Real Projects\n\nThe best way to learn is by building actual applications. Start with simple projects like a todo list or calculator, then gradually increase complexity.\n\n## Join the Community\n\nEngage with other developers through forums, Discord servers, and local meetups. The JavaScript community is incredibly welcoming and helpful.",
    tagList: ["beginners", "javascript", "programming", "webdev"],
    createdAt: "2026-01-15T09:23:41.123Z",
    updatedAt: "2026-02-10T14:55:22.456Z",
    favouritedBy: [mikewilson, sarahchen],
    author: johndoe,
    comments: [
      {
        id: 1,
        createdAt: "2026-01-20T10:15:22.567Z",
        updatedAt: "2026-01-20T10:15:22.567Z",
        body: "Great article! I've been struggling with JavaScript concepts and this really helps clarify things.",
        author: janesmith,
      },
      {
        id: 2,
        createdAt: "2026-02-05T14:30:41.890Z",
        updatedAt: "2026-02-05T14:30:41.890Z",
        body: "The project-based approach really works. I built three projects following this guide and learned so much!",
        author: mikewilson,
      },
    ],
  },

  {
    id: 2,
    slug: "react-hooks-best-practices",
    title: "React Hooks: Best Practices and Common Pitfalls",
    description: "Essential patterns and anti-patterns when working with React Hooks",
    body: "React Hooks have revolutionized how we write React components, but they come with their own set of best practices and potential pitfalls.\n\n## useEffect Dependencies\n\nOne of the most common mistakes is forgetting to include dependencies in the useEffect array. This can lead to stale closures and unexpected behavior.\n\n## Custom Hooks for Reusability\n\nCreate custom hooks to encapsulate stateful logic that can be shared across components. This promotes code reuse and maintainability.\n\n## Performance Considerations\n\nUse useMemo and useCallback judiciously. Don't optimize prematurely, but be aware of when these hooks can help prevent unnecessary re-renders.",
    tagList: ["frontend", "hooks", "javascript", "react"],
    createdAt: "2026-03-22T11:07:53.789Z",
    updatedAt: "2026-04-05T16:30:18.012Z",
    favouritedBy: [johndoe, sarahchen],
    author: janesmith,
    comments: [
      {
        id: 3,
        createdAt: "2026-03-28T09:45:16.123Z",
        updatedAt: "2026-04-01T11:20:33.456Z",
        body: "useEffect dependencies caught me so many times when I was learning React. Wish I had read this earlier!",
        author: johndoe,
      },
      {
        id: 4,
        createdAt: "2026-04-10T16:55:48.789Z",
        updatedAt: "2026-04-10T16:55:48.789Z",
        body: "Custom hooks are a game-changer. They make components so much cleaner and more reusable.",
        author: sarahchen,
      },
    ],
  },

  {
    id: 3,
    slug: "building-scalable-apis-with-node-js",
    title: "Building Scalable APIs with Node.js",
    description: "Architectural patterns and best practices for creating robust backend services",
    body: "Building scalable APIs requires careful consideration of architecture, error handling, and performance optimization.\n\n## API Design Principles\n\nFollow RESTful conventions and use appropriate HTTP status codes. Design your API to be intuitive and self-documenting.\n\n## Error Handling Strategy\n\nImplement comprehensive error handling with proper logging and monitoring. Use middleware to handle errors consistently across your application.\n\n## Database Optimization\n\nOptimize database queries and consider implementing caching strategies for frequently accessed data. Connection pooling is essential for production applications.",
    tagList: ["api", "architecture", "backend", "nodejs"],
    createdAt: "2026-05-08T08:42:35.345Z",
    updatedAt: "2026-06-15T13:18:47.678Z",
    favouritedBy: [janesmith],
    author: mikewilson,
    comments: [
      {
        id: 5,
        createdAt: "2026-05-20T12:10:05.012Z",
        updatedAt: "2026-05-25T08:35:19.345Z",
        body: "Error handling is definitely something I need to improve on. Thanks for the practical tips!",
        author: janesmith,
      },
      {
        id: 6,
        createdAt: "2026-06-10T07:28:42.678Z",
        updatedAt: "2026-06-10T07:28:42.678Z",
        body: "Connection pooling made such a difference in my API performance. Great advice!",
        author: johndoe,
      },
    ],
  },
  {
    id: 4,
    slug: "introduction-to-machine-learning-for-developers",
    title: "Introduction to Machine Learning for Developers",
    description:
      "Getting started with ML concepts and practical applications for software developers",
    body: "Machine learning might seem intimidating, but it's more accessible than ever for developers looking to expand their skillset.\n\n## Understanding the Basics\n\nStart with supervised learning concepts like classification and regression. These form the foundation for more complex ML algorithms.\n\n## Practical Tools and Libraries\n\nPython's scikit-learn is perfect for beginners, while TensorFlow and PyTorch offer more advanced capabilities for deep learning projects.\n\n## Data Preprocessing\n\nMost of ML work involves cleaning and preparing data. Learn to handle missing values, normalize features, and split datasets properly.",
    tagList: ["ai", "datascience", "machinelearning", "python"],
    createdAt: "2026-07-01T15:56:09.901Z",
    updatedAt: "2026-07-20T10:24:33.234Z",
    favouritedBy: [johndoe],
    author: sarahchen,
    comments: [
      {
        id: 7,
        createdAt: "2026-07-10T14:02:31.901Z",
        updatedAt: "2026-07-15T09:48:55.234Z",
        body: "As someone new to ML, this is exactly the kind of practical introduction I was looking for.",
        author: janesmith,
      },
      {
        id: 8,
        createdAt: "2026-07-25T11:33:17.567Z",
        updatedAt: "2026-07-25T11:33:17.567Z",
        body: "The data preprocessing section is spot on. It's definitely where most of the work happens in ML projects.",
        author: mikewilson,
      },
    ],
  },
];

export const dbUsers: DbUser[] = [johndoe, janesmith, mikewilson, sarahchen];
