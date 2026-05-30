package com.uni.medicare.prescription;

import com.uni.medicare.consultation.Consultation;
import com.uni.medicare.lab.PrescriptionLabTest;
import com.uni.medicare.lab.PrescriptionLabTestRepository;
import com.uni.medicare.shared.entity.MedicalStaff;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository repo;
    private final PrescriptionLabTestRepository labTestRepo;
    private final EntityManager          em;

    /** Rule 4: only doctors (can_prescribe = true) may create prescriptions. */
    @Transactional
    public Prescription create(CreatePrescriptionRequest req, int staffId) {
        MedicalStaff staff = em.find(MedicalStaff.class, staffId);
        if (staff == null || !staff.getRole().getCanPrescribe()) {
            throw new IllegalStateException("Only doctors with prescribing rights can create prescriptions");
        }

        Consultation consultation = em.find(Consultation.class, req.consultId());
        if (consultation == null) throw new EntityNotFoundException("Consultation not found");

        Prescription p = new Prescription();
        p.setConsultation(consultation);
        p.setChiefComplaint(req.chiefComplaint());
        p.setDiagnosis(req.diagnosis());
        p.setFollowUpDate(req.followUpDate());
        return repo.save(p);
    }

    public Prescription getById(int id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prescription not found"));
    }

    public List<Prescription> getForPatient(int patientId) {
        return repo.findByConsultation_Patient_PatientId(patientId);
    }

    public List<PrescriptionLabTest> getLabTests(int prescriptionId) {
        return labTestRepo.findByPrescription_PrescriptionId(prescriptionId);
    }

    @Transactional
    public Prescription addMedicine(int prescriptionId, AddMedicineRequest req) {
        Prescription p = getById(prescriptionId);
        PrescriptionMedicine m = new PrescriptionMedicine();
        m.setPrescription(p);
        m.setMedicineName(req.medicineName());
        m.setDosage(req.dosage());
        m.setFrequency(req.frequency());
        m.setDays(req.days());
        m.setInstructions(req.instructions());
        p.getMedicines().add(m);
        return repo.save(p);
    }

    @Transactional
    public PrescriptionLabTest addLabTest(int prescriptionId, AddLabTestRequest req) {
        Prescription p = getById(prescriptionId);
        PrescriptionLabTest lt = new PrescriptionLabTest();
        lt.setPrescription(p);
        lt.setLabTestName(req.labTestName());
        if (req.catalogId() != null) {
            lt.setCatalog(em.getReference(
                    com.uni.medicare.lab.LabTestCatalog.class, req.catalogId()));
        }
        em.persist(lt);

        // Create corresponding LabResult row with status=pending
        com.uni.medicare.lab.LabResult labResult = new com.uni.medicare.lab.LabResult();
        labResult.setLabTest(lt);
        labResult.setResultStatus("pending");
        em.persist(labResult);

        return lt;
    }
}
