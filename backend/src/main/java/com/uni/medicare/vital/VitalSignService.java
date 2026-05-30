package com.uni.medicare.vital;

import com.uni.medicare.consultation.Consultation;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VitalSignService {

    private final VitalSignRepository repo;
    private final EntityManager       em;

    /**
     * Record vitals for a consultation.
     * The DB trigger generates_invoice_after_vitals automatically
     * creates a pending invoice — no billing call needed here.
     */
    @Transactional
    public VitalSign record(int consultId, RecordVitalsRequest req) {
        Consultation c = em.find(Consultation.class, consultId);
        if (c == null) throw new EntityNotFoundException("Consultation not found");

        VitalSign v = new VitalSign();
        v.setConsultation(c);
        v.setBp(req.bp());
        v.setPulse(req.pulse());
        v.setTemp(req.temp());
        v.setRespiratoryRate(req.respiratoryRate());
        v.setOxygenSaturation(req.oxygenSaturation());
        v.setBloodGlucose(req.bloodGlucose());
        v.setWeight(req.weight());
        v.setHeight(req.height());
        // bmi is a generated column — PostgreSQL calculates it automatically

        return repo.save(v);
    }

    public VitalSign get(int consultId) {
        return repo.findById(consultId)
                .orElseThrow(() -> new EntityNotFoundException("Vitals not found"));
    }
}
