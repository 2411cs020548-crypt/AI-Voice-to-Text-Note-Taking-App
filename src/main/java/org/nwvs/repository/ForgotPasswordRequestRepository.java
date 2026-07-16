package org.nwvs.repository;

import org.nwvs.entity.ForgotPasswordRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForgotPasswordRequestRepository extends JpaRepository<ForgotPasswordRequest, Long> {
    Optional<ForgotPasswordRequest> findByToken(String token);
}
