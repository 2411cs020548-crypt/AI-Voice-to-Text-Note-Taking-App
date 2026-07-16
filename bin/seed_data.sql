-- MySQL Script for Seeding Voice Notes Management System
-- Database: notes_app
-- Standard Password for seeded users: password123

CREATE DATABASE IF NOT EXISTS notes_app;
USE notes_app;

-- Seed Users (Passwords are BCrypt encrypted hashes of 'password123')
INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES
(1, 'John Doe', 'john@example.com', '$2a$10$Uu9.kK8mUvJj4sR0h6P85OSL3b9Xj3nJqJqZ6Jm7zS85f6u/z6z7y', NOW(), NOW()),
(2, 'Jane Smith', 'jane@example.com', '$2a$10$Uu9.kK8mUvJj4sR0h6P85OSL3b9Xj3nJqJqZ6Jm7zS85f6u/z6z7y', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Seed Notes for John Doe (user_id = 1)
INSERT INTO notes (id, title, content, voice_transcript, category, color, pinned, archived, favorite, created_date, updated_date, user_id) VALUES
(1, 'Welcome to Voice Notes', 'This is your first voice note. You can record audio directly from your browser in English, Hindi, or Telugu, and translate it to another language. Use the sidebar to navigate through your categories, favorites, and archives.', 'This is your first voice note. You can record audio directly from your browser in English, Hindi, or Telugu, and translate it to another language. Use the sidebar to navigate through your categories, favorites, and archives.', 'Personal', '#dbeafe', 1, 0, 0, NOW(), NOW(), 1),
(2, 'Project Alpha Standup', '1. Discuss frontend integration with backend API.\n2. Confirm CORS origin configurations are working.\n3. Review design tokens and dark mode styles.\n4. Plan the deployment phases.', 'discuss frontend integration with backend API confirm cors origin configurations are working review design tokens and dark mode styles plan the deployment phases', 'Meeting', '#fee2e2', 0, 0, 1, NOW(), NOW(), 1),
(3, 'Learning Telugu Greetings', 'Useful Telugu words:\n- నమస్కారం (Namaskaram) = Hello\n- ధన్యవాదాలు (Dhanyavadalu) = Thank you\n- బాగున్నారా (Bagunnara) = How are you?\n- మళ్ళీ కలుద్దాం (Malli Kaluddam) = See you again', 'useful telugu words namaskaram hello dhanyavadalu thank you bagunnara how are you malli kaluddam see you again', 'Study', '#fef3c7', 0, 0, 0, NOW(), NOW(), 1),
(4, 'SaaS Startup Ideas Checklist', 'Checklist:\n- Target niche audiophile communities.\n- Simple drag-and-drop landing page.\n- Speech-to-text transcript analysis engine.\n- AI summary generators for meetings.', 'checklist target niche audiophile communities simple drag and drop landing page speech to text transcript analysis engine AI summary generators for meetings', 'Ideas', '#dcfce7', 1, 0, 1, NOW(), NOW(), 1),
(5, 'Weekly Grocery List', 'Grocery shopping checklist:\n- Milk and Greek yogurt\n- Organic honey and chamomile tea\n- Whole wheat bread and avocados\n- Fresh apples, bananas, and spinach\n- Eggs and free-range chicken breast', 'grocery shopping checklist milk and greek yogurt organic honey and chamomile tea whole wheat bread and avocados fresh apples bananas and spinach eggs and free range chicken breast', 'Shopping', '#f3e8ff', 0, 0, 0, NOW(), NOW(), 1),
(6, 'Old Project Brainstorming', 'This is an archived note containing old ideas for Project Omega. It is archived so it does not clutter the main dashboard, but it can be restored anytime.', 'this is an archived note containing old ideas for project omega it is archived so it does not clutter the main dashboard but it can be restored anytime', 'Others', '#f3f4f6', 0, 1, 0, NOW(), NOW(), 1)
ON DUPLICATE KEY UPDATE title=title;
