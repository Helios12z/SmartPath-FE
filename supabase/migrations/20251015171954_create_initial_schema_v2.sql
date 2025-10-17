/*
  # Academic Forum Database Schema

  ## Overview
  This migration creates the complete database structure for a modern academic forum platform
  that supports student learning, discussions, study materials, and social features.

  ## Tables Created

  ### 1. profiles - Extended user profile information
  ### 2. subjects - Academic subjects/courses
  ### 3. tags - Topic tags for posts and materials
  ### 4. posts - Forum discussion posts
  ### 5. post_tags - Many-to-many relationship between posts and tags
  ### 6. comments - Threaded comments on posts
  ### 7. likes - User likes on posts and comments
  ### 8. materials - Study materials (PDFs, slides, links)
  ### 9. material_tags - Many-to-many relationship between materials and tags
  ### 10. reports - User reports for inappropriate content
  ### 11. friendships - Friend connections between users
  ### 12. study_groups - Student study groups
  ### 13. group_members - Many-to-many relationship for group membership
  ### 14. messages - Private and group messages
  ### 15. notifications - User notifications for activities

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users
  - Role-based access for admin features
*/

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE material_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('like', 'comment', 'friend_request', 'friend_accepted', 'message', 'mention', 'group_invite');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  field_of_study text,
  role user_role DEFAULT 'student' NOT NULL,
  reputation_points integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  credits integer,
  semester integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subjects" ON subjects;
CREATE POLICY "Anyone can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Lecturers and admins can manage subjects" ON subjects;
CREATE POLICY "Lecturers and admins can manage subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('lecturer', 'admin')
    )
  );

-- 3. Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text DEFAULT '#3B82F6',
  parent_id uuid REFERENCES tags(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Lecturers and admins can manage tags" ON tags;
CREATE POLICY "Lecturers and admins can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('lecturer', 'admin')
    )
  );

-- 4. Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  views integer DEFAULT 0 NOT NULL,
  is_pinned boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- 5. Post tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post tags" ON post_tags;
CREATE POLICY "Anyone can view post tags"
  ON post_tags FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Post authors can manage post tags" ON post_tags;
CREATE POLICY "Post authors can manage post tags"
  ON post_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.author_id = auth.uid()
    )
  );

-- 6. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- 7. Likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_id_post_id_key'
  ) THEN
    ALTER TABLE likes ADD CONSTRAINT likes_user_id_post_id_key UNIQUE(user_id, post_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_id_comment_id_key'
  ) THEN
    ALTER TABLE likes ADD CONSTRAINT likes_user_id_comment_id_key UNIQUE(user_id, comment_id);
  END IF;
END $$;

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON likes;
CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text,
  file_type text,
  file_size integer,
  uploader_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  status material_status DEFAULT 'pending' NOT NULL,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  downloads integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved materials" ON materials;
CREATE POLICY "Anyone can view approved materials"
  ON materials FOR SELECT
  TO authenticated
  USING (status = 'approved' OR uploader_id = auth.uid());

DROP POLICY IF EXISTS "Users can upload materials" ON materials;
CREATE POLICY "Users can upload materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

DROP POLICY IF EXISTS "Users can update own materials" ON materials;
CREATE POLICY "Users can update own materials"
  ON materials FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploader_id OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('lecturer', 'admin')
    )
  );

-- 9. Material tags junction table
CREATE TABLE IF NOT EXISTS material_tags (
  material_id uuid REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (material_id, tag_id)
);

ALTER TABLE material_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view material tags" ON material_tags;
CREATE POLICY "Anyone can view material tags"
  ON material_tags FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Material uploaders can manage material tags" ON material_tags;
CREATE POLICY "Material uploaders can manage material tags"
  ON material_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM materials
      WHERE materials.id = material_tags.material_id
      AND materials.uploader_id = auth.uid()
    )
  );

-- 10. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status report_status DEFAULT 'pending' NOT NULL,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT report_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
CREATE POLICY "Admins can manage reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 11. Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status friendship_status DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT no_self_friendship CHECK (requester_id != receiver_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'friendships_requester_id_receiver_id_key'
  ) THEN
    ALTER TABLE friendships ADD CONSTRAINT friendships_requester_id_receiver_id_key UNIQUE(requester_id, receiver_id);
  END IF;
END $$;

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id OR
    auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "Users can create friend requests" ON friendships;
CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update received friend requests" ON friendships;
CREATE POLICY "Users can update received friend requests"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;
CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (
    auth.uid() = requester_id OR
    auth.uid() = receiver_id
  );

-- 12. Study groups table (without the problematic policy first)
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  leader_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  is_private boolean DEFAULT false NOT NULL,
  max_members integer DEFAULT 50,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

-- 13. Group members table (created before policies that reference it)
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'group_members_group_id_user_id_key'
  ) THEN
    ALTER TABLE group_members ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE(group_id, user_id);
  END IF;
END $$;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Now add policies for study_groups
DROP POLICY IF EXISTS "Anyone can view public groups" ON study_groups;
CREATE POLICY "Anyone can view public groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    is_private = false OR
    leader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = study_groups.id
      AND group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create study groups" ON study_groups;
CREATE POLICY "Users can create study groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Group leaders can update groups" ON study_groups;
CREATE POLICY "Group leaders can update groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id)
  WITH CHECK (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Group leaders can delete groups" ON study_groups;
CREATE POLICY "Group leaders can delete groups"
  ON study_groups FOR DELETE
  TO authenticated
  USING (auth.uid() = leader_id);

-- Policies for group_members
DROP POLICY IF EXISTS "Members can view group members" ON group_members;
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE study_groups.id = group_members.group_id
      AND (
        study_groups.is_private = false OR
        study_groups.leader_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = study_groups.id
          AND gm.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Group leaders can add members" ON group_members;
CREATE POLICY "Group leaders can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE study_groups.id = group_members.group_id
      AND study_groups.leader_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Group leaders can remove members" ON group_members;
CREATE POLICY "Group leaders can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE study_groups.id = group_members.group_id
      AND study_groups.leader_id = auth.uid()
    )
  );

-- 14. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT message_target CHECK (
    (receiver_id IS NOT NULL AND group_id IS NULL) OR
    (receiver_id IS NULL AND group_id IS NOT NULL)
  )
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update own received messages" ON messages;
CREATE POLICY "Users can update own received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 15. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  content text,
  link text,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_subject ON posts(subject_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_materials_uploader ON materials(uploader_id);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
