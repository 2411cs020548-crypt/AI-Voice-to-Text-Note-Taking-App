package org.nwvs.config;

import org.nwvs.entity.Category;
import org.nwvs.entity.Note;
import org.nwvs.entity.User;
import org.nwvs.repository.NoteRepository;
import org.nwvs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed Users
            User john = User.builder()
                    .name("John Doe")
                    .email("john@example.com")
                    .phoneNumber("1234567890")
                    .password(passwordEncoder.encode("password123"))
                    .verified(true)
                    .build();

            User jane = User.builder()
                    .name("Jane Smith")
                    .email("jane@example.com")
                    .phoneNumber("0987654321")
                    .password(passwordEncoder.encode("password123"))
                    .verified(true)
                    .build();

            userRepository.saveAll(Arrays.asList(john, jane));

            // Seed Notes for John Doe
            Note welcomeNote = Note.builder()
                    .title("Welcome to Voice Notes")
                    .content("This is your first voice note. You can record audio directly from your browser in English, Hindi, or Telugu, and translate it to another language. Use the sidebar to navigate through your categories, favorites, and archives.")
                    .voiceTranscript("This is your first voice note. You can record audio directly from your browser in English, Hindi, or Telugu, and translate it to another language. Use the sidebar to navigate through your categories, favorites, and archives.")
                    .category(Category.Personal)
                    .color("#dbeafe") // blue color shade
                    .pinned(true)
                    .archived(false)
                    .favorite(false)
                    .user(john)
                    .build();

            Note meetingNote = Note.builder()
                    .title("Project Alpha Standup")
                    .content("1. Discuss frontend integration with backend API.\n2. Confirm CORS origin configurations are working.\n3. Review design tokens and dark mode styles.\n4. Plan the deployment phases.")
                    .voiceTranscript("discuss frontend integration with backend API confirm cors origin configurations are working review design tokens and dark mode styles plan the deployment phases")
                    .category(Category.Meeting)
                    .color("#fee2e2") // red shade
                    .pinned(false)
                    .archived(false)
                    .favorite(true)
                    .user(john)
                    .build();

            Note studyNote = Note.builder()
                    .title("Learning Telugu Greetings")
                    .content("Useful Telugu words:\n- నమస్కారం (Namaskaram) = Hello\n- ధన్యవాదాలు (Dhanyavadalu) = Thank you\n- బాగున్నారా (Bagunnara) = How are you?\n- మళ్ళీ కలుద్దాం (Malli Kaluddam) = See you again")
                    .voiceTranscript("useful telugu words namaskaram hello dhanyavadalu thank you bagunnara how are you malli kaluddam see you again")
                    .category(Category.Study)
                    .color("#fef3c7") // amber shade
                    .pinned(false)
                    .archived(false)
                    .favorite(false)
                    .user(john)
                    .build();

            Note ideasNote = Note.builder()
                    .title("SaaS Startup Ideas Checklist")
                    .content("Checklist:\n- Target niche audiophile communities.\n- Simple drag-and-drop landing page.\n- Speech-to-text transcript analysis engine.\n- AI summary generators for meetings.")
                    .voiceTranscript("checklist target niche audiophile communities simple drag and drop landing page speech to text transcript analysis engine AI summary generators for meetings")
                    .category(Category.Ideas)
                    .color("#dcfce7") // green shade
                    .pinned(true)
                    .archived(false)
                    .favorite(true)
                    .user(john)
                    .build();

            Note groceryNote = Note.builder()
                    .title("Weekly Grocery List")
                    .content("Grocery shopping checklist:\n- Milk and Greek yogurt\n- Organic honey and chamomile tea\n- Whole wheat bread and avocados\n- Fresh apples, bananas, and spinach\n- Eggs and free-range chicken breast")
                    .voiceTranscript("grocery shopping checklist milk and greek yogurt organic honey and chamomile tea whole wheat bread and avocados fresh apples bananas and spinach eggs and free range chicken breast")
                    .category(Category.Shopping)
                    .color("#f3e8ff") // purple shade
                    .pinned(false)
                    .archived(false)
                    .favorite(false)
                    .user(john)
                    .build();

            Note archivedNote = Note.builder()
                    .title("Old Project Brainstorming")
                    .content("This is an archived note containing old ideas for Project Omega. It is archived so it does not clutter the main dashboard, but it can be restored anytime.")
                    .voiceTranscript("this is an archived note containing old ideas for project omega it is archived so it does not clutter the main dashboard but it can be restored anytime")
                    .category(Category.Others)
                    .color("#f3f4f6") // gray shade
                    .pinned(false)
                    .archived(true)
                    .favorite(false)
                    .user(john)
                    .build();

            noteRepository.saveAll(Arrays.asList(welcomeNote, meetingNote, studyNote, ideasNote, groceryNote, archivedNote));
        }
    }
}
