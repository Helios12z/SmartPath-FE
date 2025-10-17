/*
  # Complete Database Schema

  ## Overview
  This migration creates the complete database schema for the student community platform including users, posts, comments, reactions, friendships, chat system, notifications, materials, and reports.

  ## Tables Created

  ### Core Tables
  1. **users** - User profiles with authentication details
     - id (uuid, primary key)
     - email (varchar, unique, required)
     - password (varchar)
     - username (varchar, unique, required)
     - phone_number (nvarchar)
     - full_name (varchar)
     - major (varchar)
     - faculty (text)
     - year_of_study (int)
     - bio (text)
     - avatar_url (text)
     - role (varchar, required) - student | admin | lecturer
     - point (int, default 0)
     - created_at (timestamp)

  2. **badges** - Achievement badges
     - id (uuid, primary key)
     - point (int)
     - name (varchar)

  3. **posts** - Forum posts and questions
     - id (uuid, primary key)
     - author_id (uuid, foreign key to users)
     - title (varchar)
     - content (text)
     - is_question (boolean)
     - created_at, updated_at, is_deleted_at (timestamps)

  4. **categories** - Post categories
     - id (uuid, primary key)
     - name (varchar)

  5. **category_post** - Many-to-many relationship between posts and categories
     - post_id (uuid, foreign key)
     - category_id (uuid, foreign key)

  6. **comments** - Comments on posts with threading support
     - id (uuid, primary key)
     - post_id (uuid, foreign key)
     - author_id (uuid, foreign key)
     - content (text)
     - parent_comment_id (uuid, self-referencing foreign key)
     - created_at, updated_at (timestamps)

  7. **reactions** - Likes/dislikes on posts
     - id (uuid, primary key)
     - post_id (uuid, foreign key)
     - user_id (uuid, foreign key)
     - is_positive (boolean)
     - created_at (timestamp)

  8. **reports** - Content moderation reports
     - id (uuid, primary key)
     - reporter_id (uuid, foreign key)
     - post_id, comment_id, reported_user_id (optional foreign keys)
     - reason (text)
     - status (varchar) - pending | accepted | rejected
     - reviewed_by (uuid, foreign key)
     - created_at (timestamp)

  9. **materials** - File uploads and documents
     - id (uuid, primary key)
     - uploader_id (uuid, foreign key)
     - post_id, comment_id, message_id (optional foreign keys)
     - title (varchar)
     - description (text)
     - file_url (text)
     - uploaded_at (timestamp)

  10. **friendships** - User connections and follow relationships
      - id (uuid, primary key)
      - follower_id (uuid, foreign key)
      - followed_user_id (uuid, foreign key)
      - status (varchar) - pending | accepted | rejected
      - created_at (timestamp)

  11. **chats** - Chat conversations
      - id (uuid, primary key)
      - name (varchar)
      - member_1_id, member_2_id (uuid, foreign keys)
      - created_at (timestamp)

  12. **messages** - Chat messages
      - id (uuid, primary key)
      - chat_id (uuid, foreign key)
      - sender_id (uuid, foreign key)
      - content (text)
      - created_at (timestamp)
      - is_read (boolean)

  13. **notifications** - User notifications
      - id (uuid, primary key)
      - reciever_id (uuid, foreign key)
      - type (varchar) - comment, reaction, follow_request, report
      - content (text)
      - url (text)
      - is_read (boolean)
      - created_at (timestamp)

  14. **system_logs** - Audit trail
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - action (varchar)
      - target_type (varchar)
      - url (text)
      - created_at (timestamp)

  ## Security
  - RLS enabled on all tables
  - Policies restrict access based on user authentication and ownership
  - Public read access for posts and categories
  - Users can only modify their own content
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255),
  username varchar(50) UNIQUE NOT NULL,
  phone_number varchar(50),
  full_name varchar(100),
  major varchar(100),
  faculty text,
  year_of_study int,
  bio text,
  avatar_url text,
  role varchar(20) NOT NULL DEFAULT 'student',
  point int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  point int,
  name varchar(50)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by all"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id),
  title varchar(255),
  content text,
  is_question boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted_at timestamptz
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by all"
  ON posts FOR SELECT
  TO authenticated
  USING (is_deleted_at IS NULL);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50)
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by all"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Category_post junction table
CREATE TABLE IF NOT EXISTS category_post (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

ALTER TABLE category_post ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Category posts are viewable by all"
  ON category_post FOR SELECT
  TO authenticated
  USING (true);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id),
  content text,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by all"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  is_positive boolean,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by all"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reactions"
  ON reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES users(id),
  reason text,
  status varchar(20) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES users(id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES users(id),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  message_id uuid,
  title varchar(255),
  description text,
  file_url text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materials are viewable by all"
  ON materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update own materials"
  ON materials FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploader_id)
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can delete own materials"
  ON materials FOR DELETE
  TO authenticated
  USING (auth.uid() = uploader_id);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id),
  followed_user_id uuid NOT NULL REFERENCES users(id),
  status varchar(20) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, followed_user_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view friendships involving them"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = followed_user_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update friendships involving them"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = followed_user_id)
  WITH CHECK (auth.uid() = follower_id OR auth.uid() = followed_user_id);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255),
  member_1_id uuid NOT NULL REFERENCES users(id),
  member_2_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chats they are part of"
  ON chats FOR SELECT
  TO authenticated
  USING (auth.uid() = member_1_id OR auth.uid() = member_2_id);

CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_1_id OR auth.uid() = member_2_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  content text,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.member_1_id = auth.uid() OR chats.member_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their chats"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_id
      AND (chats.member_1_id = auth.uid() OR chats.member_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their chats"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.member_1_id = auth.uid() OR chats.member_2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.member_1_id = auth.uid() OR chats.member_2_id = auth.uid())
    )
  );

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reciever_id uuid NOT NULL REFERENCES users(id),
  type varchar(50),
  content text,
  url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = reciever_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = reciever_id)
  WITH CHECK (auth.uid() = reciever_id);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action varchar(255),
  target_type varchar(50),
  url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );