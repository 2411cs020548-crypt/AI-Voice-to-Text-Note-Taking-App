package org.nwvs.repository;

import org.nwvs.entity.Category;
import org.nwvs.entity.Note;
import org.nwvs.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    Optional<Note> findByIdAndUser(Long id, User user);

    @Query("SELECT n FROM Note n WHERE n.user = :user " +
           "AND (:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(n.content) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(n.voiceTranscript) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(n.category) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR n.category = :category) " +
           "AND (:pinned IS NULL OR n.pinned = :pinned) " +
           "AND (:archived IS NULL OR n.archived = :archived) " +
           "AND (:favorite IS NULL OR n.favorite = :favorite)")
    Page<Note> findAllFiltered(
            @Param("user") User user,
            @Param("search") String search,
            @Param("category") Category category,
            @Param("pinned") Boolean pinned,
            @Param("archived") Boolean archived,
            @Param("favorite") Boolean favorite,
            Pageable pageable
    );

    List<Note> findByUserAndPinnedTrueAndArchivedFalseOrderByCreatedDateDesc(User user);

    List<Note> findByUserAndFavoriteTrueAndArchivedFalseOrderByCreatedDateDesc(User user);

    List<Note> findByUserAndArchivedTrueOrderByCreatedDateDesc(User user);

    List<Note> findByUserAndCategoryAndArchivedFalseOrderByCreatedDateDesc(User user, Category category);

    List<Note> findTop5ByUserAndArchivedFalseOrderByCreatedDateDesc(User user);

    long countByUserAndArchivedFalse(User user);

    long countByUserAndPinnedTrueAndArchivedFalse(User user);

    long countByUserAndFavoriteTrueAndArchivedFalse(User user);

    long countByUserAndArchivedTrue(User user);

    @Query("SELECT n.category, COUNT(n) FROM Note n WHERE n.user = :user GROUP BY n.category")
    List<Object[]> countNotesByCategory(@Param("user") User user);
}
