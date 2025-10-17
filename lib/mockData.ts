export const mockUsers = [
  {
    id: '1',
    email: 'john.doe@university.edu',
    username: 'johndoe',
    phone_number: '+1234567890',
    full_name: 'John Doe',
    major: 'Computer Science',
    faculty: 'Engineering',
    year_of_study: 3,
    bio: 'Passionate about web development and AI. Love helping fellow students with programming questions.',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'student',
    point: 450,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    email: 'sarah.smith@university.edu',
    username: 'sarahsmith',
    phone_number: '+1234567891',
    full_name: 'Sarah Smith',
    major: 'Data Science',
    faculty: 'Engineering',
    year_of_study: 2,
    bio: 'Machine learning enthusiast. Always ready to discuss algorithms and data analysis.',
    avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'student',
    point: 320,
    created_at: '2024-02-20T10:00:00Z'
  },
  {
    id: '3',
    email: 'mike.johnson@university.edu',
    username: 'mikej',
    phone_number: '+1234567892',
    full_name: 'Mike Johnson',
    major: 'Software Engineering',
    faculty: 'Engineering',
    year_of_study: 4,
    bio: 'Senior year student. Interested in cloud architecture and DevOps.',
    avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'student',
    point: 680,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '4',
    email: 'dr.wilson@university.edu',
    username: 'drwilson',
    phone_number: '+1234567893',
    full_name: 'Dr. Emily Wilson',
    major: 'Computer Science',
    faculty: 'Engineering',
    year_of_study: null,
    bio: 'Associate Professor of Computer Science. Specializing in Algorithms and Data Structures.',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'lecturer',
    point: 0,
    created_at: '2023-08-01T10:00:00Z'
  },
  {
    id: '5',
    email: 'emma.davis@university.edu',
    username: 'emmad',
    phone_number: '+1234567894',
    full_name: 'Emma Davis',
    major: 'Information Systems',
    faculty: 'Engineering',
    year_of_study: 1,
    bio: 'Freshman exploring the world of tech. Eager to learn and contribute!',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'student',
    point: 120,
    created_at: '2024-09-01T10:00:00Z'
  }
];

export const mockCategories = [
  { id: 'cat1', name: 'Programming' },
  { id: 'cat2', name: 'Web Development' },
  { id: 'cat3', name: 'Data Science' },
  { id: 'cat4', name: 'Algorithms' },
  { id: 'cat5', name: 'Career Advice' },
  { id: 'cat6', name: 'Study Tips' },
  { id: 'cat7', name: 'Project Help' },
  { id: 'cat8', name: 'General Discussion' }
];

export const mockPosts = [
  {
    id: 'post1',
    author_id: '1',
    title: 'Best practices for React state management in 2025?',
    content: 'I\'m working on a large-scale React project and wondering what the community thinks about state management solutions. Should I go with Redux, Zustand, or stick with Context API? Any experiences to share?',
    is_question: true,
    created_at: '2025-10-15T08:30:00Z',
    updated_at: '2025-10-15T08:30:00Z',
    is_deleted_at: null
  },
  {
    id: 'post2',
    author_id: '2',
    title: 'Machine Learning Study Group - Join Us!',
    content: 'Hey everyone! We\'re forming a study group for the upcoming ML course. We plan to meet twice a week to go through assignments and discuss concepts. DM me if you\'re interested!',
    is_question: false,
    created_at: '2025-10-14T15:20:00Z',
    updated_at: '2025-10-14T15:20:00Z',
    is_deleted_at: null
  },
  {
    id: 'post3',
    author_id: '3',
    title: 'How to prepare for technical interviews?',
    content: 'I have interviews coming up with several tech companies. What resources did you use to prepare? LeetCode, HackerRank, or something else? Any tips would be appreciated!',
    is_question: true,
    created_at: '2025-10-14T10:45:00Z',
    updated_at: '2025-10-14T10:45:00Z',
    is_deleted_at: null
  },
  {
    id: 'post4',
    author_id: '4',
    title: 'Understanding Big O Notation - A Guide',
    content: 'I\'ve noticed many students struggle with Big O notation. Here\'s a comprehensive guide I\'ve put together with examples and practice problems. Feel free to ask questions!\n\n1. O(1) - Constant Time\n2. O(log n) - Logarithmic Time\n3. O(n) - Linear Time\n4. O(n log n) - Linearithmic Time\n5. O(n²) - Quadratic Time',
    is_question: false,
    created_at: '2025-10-13T14:00:00Z',
    updated_at: '2025-10-13T14:00:00Z',
    is_deleted_at: null
  },
  {
    id: 'post5',
    author_id: '5',
    title: 'Need help with Python assignment',
    content: 'I\'m stuck on this recursive function problem for my intro programming class. The function should calculate factorial but my code keeps giving wrong results. Can someone help me understand where I\'m going wrong?',
    is_question: true,
    created_at: '2025-10-13T09:15:00Z',
    updated_at: '2025-10-13T09:15:00Z',
    is_deleted_at: null
  },
  {
    id: 'post6',
    author_id: '1',
    title: 'Great resources for learning TypeScript',
    content: 'Just finished a TypeScript course and wanted to share some amazing resources:\n- TypeScript Handbook (official docs)\n- Execute Program\n- Type Challenges on GitHub\n\nWhat are your favorite TS learning resources?',
    is_question: false,
    created_at: '2025-10-12T16:30:00Z',
    updated_at: '2025-10-12T16:30:00Z',
    is_deleted_at: null
  },
  {
    id: 'post7',
    author_id: '3',
    title: 'Database design question for final project',
    content: 'Working on my capstone project and need advice on database normalization. Should I normalize to 3NF for a small e-commerce app or is 2NF sufficient? The database will have about 5 tables.',
    is_question: true,
    created_at: '2025-10-11T11:00:00Z',
    updated_at: '2025-10-11T11:00:00Z',
    is_deleted_at: null
  },
  {
    id: 'post8',
    author_id: '2',
    title: 'Data visualization with Python - Workshop this Friday',
    content: 'Organizing a hands-on workshop on data visualization using matplotlib and seaborn. We\'ll cover:\n- Basic plots\n- Customization\n- Interactive dashboards\n\nFriday 3 PM, CS Lab 101. See you there!',
    is_question: false,
    created_at: '2025-10-10T13:45:00Z',
    updated_at: '2025-10-10T13:45:00Z',
    is_deleted_at: null
  }
];

export const mockComments = [
  {
    id: 'comment1',
    post_id: 'post1',
    author_id: '2',
    content: 'I\'ve used both Redux and Zustand. For large projects, Redux Toolkit is great, but Zustand is much simpler for medium-sized apps. The learning curve is way less steep with Zustand.',
    parent_comment_id: null,
    created_at: '2025-10-15T09:00:00Z',
    updated_at: '2025-10-15T09:00:00Z'
  },
  {
    id: 'comment2',
    post_id: 'post1',
    author_id: '3',
    content: 'Agreed! I recently migrated a project from Context API to Zustand and the performance improvements were noticeable. Plus the DevTools are excellent.',
    parent_comment_id: 'comment1',
    created_at: '2025-10-15T09:30:00Z',
    updated_at: '2025-10-15T09:30:00Z'
  },
  {
    id: 'comment3',
    post_id: 'post3',
    author_id: '1',
    content: 'LeetCode is essential! I recommend doing at least 2 problems daily. Focus on medium difficulty and cover all major patterns: arrays, trees, graphs, DP.',
    parent_comment_id: null,
    created_at: '2025-10-14T11:00:00Z',
    updated_at: '2025-10-14T11:00:00Z'
  },
  {
    id: 'comment4',
    post_id: 'post3',
    author_id: '4',
    content: 'Don\'t forget to practice explaining your thought process out loud. Communication is just as important as solving the problem. Mock interviews really help!',
    parent_comment_id: null,
    created_at: '2025-10-14T11:15:00Z',
    updated_at: '2025-10-14T11:15:00Z'
  },
  {
    id: 'comment5',
    post_id: 'post5',
    author_id: '1',
    content: 'Check if you have a base case in your recursion. For factorial, it should be: if n <= 1: return 1. Otherwise you\'ll get infinite recursion.',
    parent_comment_id: null,
    created_at: '2025-10-13T09:45:00Z',
    updated_at: '2025-10-13T09:45:00Z'
  },
  {
    id: 'comment6',
    post_id: 'post5',
    author_id: '5',
    content: 'Oh! That was exactly my issue. I forgot the base case. Thank you so much!',
    parent_comment_id: 'comment5',
    created_at: '2025-10-13T10:00:00Z',
    updated_at: '2025-10-13T10:00:00Z'
  },
  {
    id: 'comment7',
    post_id: 'post4',
    author_id: '5',
    content: 'This is really helpful! Could you explain when we use O(log n)? I\'m still confused about logarithmic time.',
    parent_comment_id: null,
    created_at: '2025-10-13T14:30:00Z',
    updated_at: '2025-10-13T14:30:00Z'
  },
  {
    id: 'comment8',
    post_id: 'post4',
    author_id: '4',
    content: 'Great question! Binary search is the classic example. Every iteration cuts the search space in half, which gives us O(log n). Think of finding a name in a phone book - you keep dividing in half.',
    parent_comment_id: 'comment7',
    created_at: '2025-10-13T15:00:00Z',
    updated_at: '2025-10-13T15:00:00Z'
  }
];

export const mockReactions = [
  { id: 'react1', post_id: 'post1', user_id: '2', is_positive: true, created_at: '2025-10-15T09:00:00Z' },
  { id: 'react2', post_id: 'post1', user_id: '3', is_positive: true, created_at: '2025-10-15T09:30:00Z' },
  { id: 'react3', post_id: 'post1', user_id: '4', is_positive: true, created_at: '2025-10-15T10:00:00Z' },
  { id: 'react4', post_id: 'post2', user_id: '1', is_positive: true, created_at: '2025-10-14T15:30:00Z' },
  { id: 'react5', post_id: 'post2', user_id: '3', is_positive: true, created_at: '2025-10-14T16:00:00Z' },
  { id: 'react6', post_id: 'post3', user_id: '1', is_positive: true, created_at: '2025-10-14T11:00:00Z' },
  { id: 'react7', post_id: 'post3', user_id: '2', is_positive: true, created_at: '2025-10-14T11:30:00Z' },
  { id: 'react8', post_id: 'post4', user_id: '1', is_positive: true, created_at: '2025-10-13T14:15:00Z' },
  { id: 'react9', post_id: 'post4', user_id: '2', is_positive: true, created_at: '2025-10-13T14:20:00Z' },
  { id: 'react10', post_id: 'post4', user_id: '3', is_positive: true, created_at: '2025-10-13T14:25:00Z' },
  { id: 'react11', post_id: 'post4', user_id: '5', is_positive: true, created_at: '2025-10-13T14:30:00Z' },
  { id: 'react12', post_id: 'post5', user_id: '1', is_positive: true, created_at: '2025-10-13T09:30:00Z' },
  { id: 'react13', post_id: 'post6', user_id: '2', is_positive: true, created_at: '2025-10-12T16:45:00Z' },
  { id: 'react14', post_id: 'post6', user_id: '3', is_positive: true, created_at: '2025-10-12T17:00:00Z' }
];

export const mockCategoryPost = [
  { post_id: 'post1', category_id: 'cat1' },
  { post_id: 'post1', category_id: 'cat2' },
  { post_id: 'post2', category_id: 'cat3' },
  { post_id: 'post2', category_id: 'cat6' },
  { post_id: 'post3', category_id: 'cat5' },
  { post_id: 'post4', category_id: 'cat4' },
  { post_id: 'post4', category_id: 'cat1' },
  { post_id: 'post5', category_id: 'cat1' },
  { post_id: 'post5', category_id: 'cat7' },
  { post_id: 'post6', category_id: 'cat1' },
  { post_id: 'post6', category_id: 'cat2' },
  { post_id: 'post7', category_id: 'cat7' },
  { post_id: 'post8', category_id: 'cat3' }
];

export const mockFriendships = [
  { id: 'friend1', follower_id: '1', followed_user_id: '2', status: 'accepted', created_at: '2025-09-01T10:00:00Z' },
  { id: 'friend2', follower_id: '1', followed_user_id: '3', status: 'accepted', created_at: '2025-09-05T10:00:00Z' },
  { id: 'friend3', follower_id: '2', followed_user_id: '1', status: 'accepted', created_at: '2025-09-01T10:00:00Z' },
  { id: 'friend4', follower_id: '2', followed_user_id: '3', status: 'accepted', created_at: '2025-09-10T10:00:00Z' },
  { id: 'friend5', follower_id: '3', followed_user_id: '1', status: 'accepted', created_at: '2025-09-05T10:00:00Z' },
  { id: 'friend6', follower_id: '5', followed_user_id: '1', status: 'pending', created_at: '2025-10-10T10:00:00Z' }
];

export const mockChats = [
  { id: 'chat1', name: null, member_1_id: '1', member_2_id: '2', created_at: '2025-09-01T10:00:00Z' },
  { id: 'chat2', name: null, member_1_id: '1', member_2_id: '3', created_at: '2025-09-05T10:00:00Z' },
  { id: 'chat3', name: null, member_1_id: '2', member_2_id: '3', created_at: '2025-09-10T10:00:00Z' }
];

export const mockMessages = [
  {
    id: 'msg1',
    chat_id: 'chat1',
    sender_id: '1',
    content: 'Hey Sarah! Did you finish the ML assignment?',
    created_at: '2025-10-15T09:00:00Z',
    is_read: true
  },
  {
    id: 'msg2',
    chat_id: 'chat1',
    sender_id: '2',
    content: 'Yes! Just submitted it. The neural network problem was tricky.',
    created_at: '2025-10-15T09:05:00Z',
    is_read: true
  },
  {
    id: 'msg3',
    chat_id: 'chat1',
    sender_id: '1',
    content: 'I struggled with the backpropagation part. Mind if I ask you about it later?',
    created_at: '2025-10-15T09:10:00Z',
    is_read: true
  },
  {
    id: 'msg4',
    chat_id: 'chat1',
    sender_id: '2',
    content: 'Sure! I\'m free after 3 PM today.',
    created_at: '2025-10-15T09:12:00Z',
    is_read: false
  },
  {
    id: 'msg5',
    chat_id: 'chat2',
    sender_id: '3',
    content: 'John, are you going to the career fair tomorrow?',
    created_at: '2025-10-14T14:00:00Z',
    is_read: true
  },
  {
    id: 'msg6',
    chat_id: 'chat2',
    sender_id: '1',
    content: 'Definitely! I have my resume ready. You?',
    created_at: '2025-10-14T14:05:00Z',
    is_read: true
  },
  {
    id: 'msg7',
    chat_id: 'chat2',
    sender_id: '3',
    content: 'Yep! Targeting the tech companies. Good luck!',
    created_at: '2025-10-14T14:10:00Z',
    is_read: true
  }
];

export const mockMaterials = [
  {
    id: 'mat1',
    uploader_id: '4',
    post_id: 'post4',
    comment_id: null,
    message_id: null,
    title: 'Big O Notation Cheat Sheet',
    description: 'Comprehensive guide to time and space complexity',
    file_url: 'https://example.com/files/big-o-cheatsheet.pdf',
    uploaded_at: '2025-10-13T14:00:00Z'
  },
  {
    id: 'mat2',
    uploader_id: '2',
    post_id: 'post8',
    comment_id: null,
    message_id: null,
    title: 'Data Visualization Workshop Slides',
    description: 'Workshop materials including code examples',
    file_url: 'https://example.com/files/dataviz-workshop.pdf',
    uploaded_at: '2025-10-10T13:45:00Z'
  },
  {
    id: 'mat3',
    uploader_id: '1',
    post_id: 'post6',
    comment_id: null,
    message_id: null,
    title: 'TypeScript Learning Resources',
    description: 'Curated list of TS tutorials and exercises',
    file_url: 'https://example.com/files/typescript-resources.pdf',
    uploaded_at: '2025-10-12T16:30:00Z'
  }
];

export const mockNotifications = [
  {
    id: 'notif1',
    reciever_id: '1',
    type: 'comment',
    content: 'Sarah Smith commented on your post "Best practices for React state management"',
    url: '/forum/post1',
    is_read: true,
    created_at: '2025-10-15T09:00:00Z'
  },
  {
    id: 'notif2',
    reciever_id: '1',
    type: 'reaction',
    content: 'Mike Johnson liked your post',
    url: '/forum/post1',
    is_read: true,
    created_at: '2025-10-15T10:00:00Z'
  },
  {
    id: 'notif3',
    reciever_id: '1',
    type: 'follow_request',
    content: 'Emma Davis wants to connect with you',
    url: '/friends',
    is_read: false,
    created_at: '2025-10-10T10:00:00Z'
  },
  {
    id: 'notif4',
    reciever_id: '5',
    type: 'comment',
    content: 'John Doe replied to your question',
    url: '/forum/post5',
    is_read: false,
    created_at: '2025-10-13T09:45:00Z'
  }
];

export const mockBadges = [
  { id: 'badge1', point: 100, name: 'Newcomer' },
  { id: 'badge2', point: 250, name: 'Contributor' },
  { id: 'badge3', point: 500, name: 'Expert' },
  { id: 'badge4', point: 1000, name: 'Master' }
];

export function getPostWithDetails(postId: string) {
  const post = mockPosts.find(p => p.id === postId);
  if (!post) return null;

  const author = mockUsers.find(u => u.id === post.author_id);
  const comments = mockComments
    .filter(c => c.post_id === postId)
    .map(comment => ({
      ...comment,
      author: mockUsers.find(u => u.id === comment.author_id)
    }));

  const reactions = mockReactions.filter(r => r.post_id === postId);
  const categories = mockCategoryPost
    .filter(cp => cp.post_id === postId)
    .map(cp => mockCategories.find(cat => cat.id === cp.category_id))
    .filter(Boolean);

  return {
    ...post,
    author,
    comments,
    reactions,
    categories,
    upvotes: reactions.filter(r => r.is_positive).length,
    downvotes: reactions.filter(r => !r.is_positive).length
  };
}

export function getUserProfile(userId: string) {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return null;

  const posts = mockPosts.filter(p => p.author_id === userId);
  const comments = mockComments.filter(c => c.author_id === userId);
  const followers = mockFriendships.filter(f => f.followed_user_id === userId && f.status === 'accepted');
  const following = mockFriendships.filter(f => f.follower_id === userId && f.status === 'accepted');

  return {
    ...user,
    posts,
    comments,
    followerCount: followers.length,
    followingCount: following.length
  };
}

export function getChatWithMessages(chatId: string) {
  const chat = mockChats.find(c => c.id === chatId);
  if (!chat) return null;

  const messages = mockMessages
    .filter(m => m.chat_id === chatId)
    .map(msg => ({
      ...msg,
      sender: mockUsers.find(u => u.id === msg.sender_id)
    }));

  return {
    ...chat,
    messages,
    member1: mockUsers.find(u => u.id === chat.member_1_id),
    member2: mockUsers.find(u => u.id === chat.member_2_id)
  };
}

export const currentUser = mockUsers[0];
