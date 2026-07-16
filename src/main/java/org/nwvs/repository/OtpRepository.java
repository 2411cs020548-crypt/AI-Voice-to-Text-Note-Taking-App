package org.nwvs.repository;

import org.nwvs.entity.Otp;
import org.nwvs.entity.OtpPurpose;
import org.nwvs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    List<Otp> findByUserAndPurposeAndUsedFalse(User user, OtpPurpose purpose);
    List<Otp> findByUserAndPurpose(User user, OtpPurpose purpose);
    void deleteByUser(User user);
}
