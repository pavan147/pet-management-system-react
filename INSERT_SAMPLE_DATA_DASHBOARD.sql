-- ============================================================================
-- PET MANAGEMENT SYSTEM - DASHBOARD SAMPLE DATA (MySQL)
-- Date baseline for alerts: 2026-04-05
-- Backend entity-aligned tables:
--   owner, pet, pet_vaccination_record, pet_medical, prescription, appointments
-- ============================================================================

SET @pavan_email  := 'PAVANMGAWANDE@GMAIL.COM';
SET @pavan_phone  := '09579967444';
SET @rajesh_email := 'rajesh.kumar@email.com';

-- ============================================================================
-- 1) OWNERS
-- ============================================================================

INSERT INTO owner (owner_name, email, password, phone_number, address)
SELECT 'Rajesh Kumar',
       @rajesh_email,
       '$2a$10$jQBRppZ8U7BLg2/11d10SeURRvU5ObeqW8axBPHD0M4U2f6Xo9hMO',
       '9876543210',
       '123 Park Lane, Mumbai, Maharashtra'
WHERE NOT EXISTS (
    SELECT 1 FROM owner WHERE email = @rajesh_email
);

-- ============================================================================
-- 2) PETS (Pavan gets 4 pets in sidebar)
-- ============================================================================

INSERT INTO pet (pet_name, pet_type, breed, registration_date, owner_id, photo_content_type)
SELECT 'Simba', 'Dog', 'Labrador', '2025-05-10', o.id, 'image/webp'
FROM owner o
WHERE o.email = @pavan_email
  AND NOT EXISTS (
      SELECT 1 FROM pet p WHERE p.owner_id = o.id AND p.pet_name = 'Simba'
  );

INSERT INTO pet (pet_name, pet_type, breed, registration_date, owner_id, photo_content_type)
SELECT 'mai', 'Cat', 'Persian', '2025-09-01', o.id, 'image/webp'
FROM owner o
WHERE o.email = @pavan_email
  AND NOT EXISTS (
      SELECT 1 FROM pet p WHERE p.owner_id = o.id AND p.pet_name = 'mai'
  );

INSERT INTO pet (pet_name, pet_type, breed, registration_date, owner_id, photo_content_type)
SELECT 'Tommy', 'Dog', 'Bulldog', '2025-12-15', o.id, 'image/webp'
FROM owner o
WHERE o.email = @pavan_email
  AND NOT EXISTS (
      SELECT 1 FROM pet p WHERE p.owner_id = o.id AND p.pet_name = 'Tommy'
  );

INSERT INTO pet (pet_name, pet_type, breed, registration_date, owner_id, photo_content_type)
SELECT 'Whiskers', 'Cat', 'Siamese', '2026-03-20', o.id, 'image/webp'
FROM owner o
WHERE o.email = @pavan_email
  AND NOT EXISTS (
      SELECT 1 FROM pet p WHERE p.owner_id = o.id AND p.pet_name = 'Whiskers'
  );

-- Optional second owner pets
INSERT INTO pet (pet_name, pet_type, breed, registration_date, owner_id, photo_content_type)
SELECT 'Max', 'Dog', 'German Shepherd', '2025-08-10', o.id, 'image/webp'
FROM owner o
WHERE o.email = @rajesh_email
  AND NOT EXISTS (
      SELECT 1 FROM pet p WHERE p.owner_id = o.id AND p.pet_name = 'Max'
  );

INSERT INTO pet (pet_name, pet_type, breed, registration_date, owner_id, photo_content_type)
SELECT 'Luna', 'Cat', 'British Shorthair', '2025-11-22', o.id, 'image/webp'
FROM owner o
WHERE o.email = @rajesh_email
  AND NOT EXISTS (
      SELECT 1 FROM pet p WHERE p.owner_id = o.id AND p.pet_name = 'Luna'
  );

-- ============================================================================
-- 3) VACCINATIONS (Pavan total target: 14 mixed statuses)
--    CRITICAL overdue: 1
--    URGENT (<=7 days): 1
--    WARNING (<=30 days): 1
-- ============================================================================

-- Simba
INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Hepatitis', 'Canine Hepatitis Vaccine', 'Vaccine Brand X', '2025-04-01', 12, '2026-03-01', 34
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Hepatitis' AND v.vaccination_date = '2025-04-01'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Bordetella', 'Canine Bordetella Vaccine', 'Vaccine Brand Y', '2025-04-05', 12, '2026-04-10', 34
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Bordetella' AND v.vaccination_date = '2025-04-05'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Leptospirosis', 'Canine Leptospirosis Vaccine', 'Vaccine Brand Z', '2025-05-05', 12, '2026-04-25', 34
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Leptospirosis' AND v.vaccination_date = '2025-05-05'
  );

-- Keep Simba with additional valid doses so total reaches 14
INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Rabies', 'Canine Rabies Vaccine', 'Premium Rabies', '2026-04-01', 12, '2027-04-01', 34
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Rabies' AND v.vaccination_date = '2026-04-01'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Deworming', 'Canine Deworming Dose', 'Deworm Plus', '2026-04-01', 12, '2027-04-01', 34
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Deworming' AND v.vaccination_date = '2026-04-01'
  );

-- mai
INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Feline Distemper', 'Feline Distemper Vaccine', 'Feline Vaccine A', '2026-03-15', 12, '2027-03-15', 4
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Feline Distemper' AND v.vaccination_date = '2026-03-15'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Rabies', 'Feline Rabies Vaccine', 'Rabies Vaccine', '2026-03-15', 12, '2027-03-15', 4
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Rabies' AND v.vaccination_date = '2026-03-15'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Feline Leukemia', 'Feline Leukemia Vaccine', 'Leukemia Vaccine', '2026-03-15', 12, '2027-03-15', 4
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Feline Leukemia' AND v.vaccination_date = '2026-03-15'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Calicivirus', 'Feline Calicivirus Vaccine', 'Calici Shield', '2026-03-15', 12, '2027-03-15', 4
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Calicivirus' AND v.vaccination_date = '2026-03-15'
  );

-- Tommy
INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Rabies', 'Canine Rabies Vaccine', 'Standard Rabies', '2026-04-01', 12, '2027-04-01', 25
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Tommy'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Rabies' AND v.vaccination_date = '2026-04-01'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'DHPP', 'Canine DHPP Vaccine', 'DHPP Combo', '2026-04-01', 12, '2027-04-01', 25
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Tommy'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'DHPP' AND v.vaccination_date = '2026-04-01'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Parvo', 'Canine Parvo Vaccine', 'Parvo Guard', '2026-04-01', 12, '2027-04-01', 25
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Tommy'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Parvo' AND v.vaccination_date = '2026-04-01'
  );

-- Whiskers
INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'Rabies', 'Feline Rabies Vaccine', 'Cat Rabies Prime', '2026-03-20', 12, '2027-03-20', 5
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Whiskers'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'Rabies' AND v.vaccination_date = '2026-03-20'
  );

INSERT INTO pet_vaccination_record (pet_id, vaccination, vaccine_name, brand_and_doses, vaccination_date, duration_months, valid_till, weight)
SELECT p.id, 'FVRCP', 'Feline FVRCP Vaccine', 'FVRCP Combo', '2026-03-20', 12, '2027-03-20', 5
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Whiskers'
  AND NOT EXISTS (
      SELECT 1 FROM pet_vaccination_record v
      WHERE v.pet_id = p.id AND v.vaccination = 'FVRCP' AND v.vaccination_date = '2026-03-20'
  );

-- ============================================================================
-- 4) MEDICAL RECORDS (Pavan target: 9 records, 1 expires soon, 4 expired)
-- ============================================================================

-- Simba: 4 records
INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-04-05', 'Fever', 'Rest, fluids, monitor temperature', NULL, '2026-04-18'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-04-05' AND m.diagnosis = 'Fever'
  );

INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-03-29', 'External Parasites (Fleas)', 'Use flea treatment and weekly bedding wash', NULL, '2026-04-08'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-03-29' AND m.diagnosis = 'External Parasites (Fleas)'
  );

INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-03-01', 'Skin Infection', 'Apply anti-fungal cream twice daily', 'Penicillin', '2026-03-28'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-03-01' AND m.diagnosis = 'Skin Infection'
  );

INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-02-20', 'Gastroenteritis', 'Bland diet for 5 days and hydration support', NULL, '2026-03-15'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-02-20' AND m.diagnosis = 'Gastroenteritis'
  );

-- mai: 2 records
INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-04-01', 'Hairball Obstruction', 'Increase fiber intake and hairball paste', NULL, '2026-04-22'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-04-01' AND m.diagnosis = 'Hairball Obstruction'
  );

INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2025-12-15', 'Food Allergy', 'Switch to hypoallergenic diet', 'Fish, Chicken', '2026-01-15'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2025-12-15' AND m.diagnosis = 'Food Allergy'
  );

-- Tommy: 2 records
INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-03-28', 'General Checkup', 'Healthy, continue diet and exercise', NULL, '2026-06-28'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Tommy'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-03-28' AND m.diagnosis = 'General Checkup'
  );

INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-02-05', 'Paw Injury', 'Topical ointment and activity restriction', NULL, '2026-02-25'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Tommy'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-02-05' AND m.diagnosis = 'Paw Injury'
  );

-- Whiskers: 1 record
INSERT INTO pet_medical (pet_id, visit_date, diagnosis, treatment_suggestions, allergies, validate_till)
SELECT p.id, '2026-04-02', 'Wellness Exam', 'Routine wellness and preventive care', NULL, '2026-05-10'
FROM pet p JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Whiskers'
  AND NOT EXISTS (
      SELECT 1 FROM pet_medical m WHERE m.pet_id = p.id AND m.visit_date = '2026-04-02' AND m.diagnosis = 'Wellness Exam'
  );

-- ============================================================================
-- 5) PRESCRIPTIONS (Pavan target: 10 entries)
-- ============================================================================

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Paracetamol', '500mg', '2', '4', 'after', 'Twice daily after meals', 'YES', 'NO', 'YES', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba' AND m.visit_date = '2026-04-05' AND m.diagnosis = 'Fever'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Paracetamol'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Amoxicillin', '250mg', '3', '5', 'after', 'Three times daily after food', 'YES', 'YES', 'YES', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba' AND m.visit_date = '2026-04-05' AND m.diagnosis = 'Fever'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Amoxicillin'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Fipronil Spot-On', '0.5ml', '1', '30', 'N/A', 'Apply between shoulder blades', 'NO', 'NO', 'YES', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba' AND m.visit_date = '2026-03-29' AND m.diagnosis = 'External Parasites (Fleas)'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Fipronil Spot-On'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Chlorpheniramine', '2mg', '2', '7', 'with', 'For itching relief', 'YES', 'NO', 'YES', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba' AND m.visit_date = '2026-03-29' AND m.diagnosis = 'External Parasites (Fleas)'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Chlorpheniramine'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Ketoconazole', '200mg', '1', '10', 'with', 'Daily with food', 'YES', 'NO', 'NO', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Simba' AND m.visit_date = '2026-03-01' AND m.diagnosis = 'Skin Infection'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Ketoconazole'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Hairball Paste', '1 tsp', '2', '14', 'N/A', 'Apply on paw twice weekly', 'YES', 'NO', 'YES', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai' AND m.visit_date = '2026-04-01' AND m.diagnosis = 'Hairball Obstruction'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Hairball Paste'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Fiber Supplement', '250mg', '1', '30', 'with', 'Daily with food', 'YES', 'NO', 'NO', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'mai' AND m.visit_date = '2026-04-01' AND m.diagnosis = 'Hairball Obstruction'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Fiber Supplement'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Mupirocin Ointment', 'Topical', '2', '7', 'N/A', 'Apply to paw wound twice daily', 'YES', 'NO', 'YES', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Tommy' AND m.visit_date = '2026-02-05' AND m.diagnosis = 'Paw Injury'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Mupirocin Ointment'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Multivitamin Syrup', '5ml', '1', '30', 'after', 'Daily after breakfast', 'YES', 'NO', 'NO', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Whiskers' AND m.visit_date = '2026-04-02' AND m.diagnosis = 'Wellness Exam'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Multivitamin Syrup'
  );

INSERT INTO prescription (pet_medical_id, medicine, dosage, frequency, duration, meal, instructions, morning, afternoon, evening, night)
SELECT m.pet_medical_id, 'Probiotic', '1 sachet', '1', '10', 'after', 'Mix with food once daily', 'YES', 'NO', 'NO', 'NO'
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email AND p.pet_name = 'Whiskers' AND m.visit_date = '2026-04-02' AND m.diagnosis = 'Wellness Exam'
  AND NOT EXISTS (
      SELECT 1 FROM prescription pr WHERE pr.pet_medical_id = m.pet_medical_id AND pr.medicine = 'Probiotic'
  );

-- ============================================================================
-- 6) APPOINTMENTS (Pavan target: waiting, confirmed, completed)
-- ============================================================================

INSERT INTO appointments (name, email, phone, address, date, time, reason, status, action)
SELECT 'Pavan Gawande', @pavan_email, @pavan_phone, 'NIMGAON', '2026-04-05', 'morning', 'Initial waiting queue', 'waiting', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.email = @pavan_email AND a.date = '2026-04-05' AND a.reason = 'Initial waiting queue'
);

INSERT INTO appointments (name, email, phone, address, date, time, reason, status, action)
SELECT 'Pavan Gawande', @pavan_email, @pavan_phone, 'NIMGAON', '2026-04-10', 'afternoon', 'Vaccination follow-up', 'confirmed', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.email = @pavan_email AND a.date = '2026-04-10' AND a.reason = 'Vaccination follow-up'
);

INSERT INTO appointments (name, email, phone, address, date, time, reason, status, action)
SELECT 'Pavan Gawande', @pavan_email, @pavan_phone, 'NIMGAON', '2026-03-28', 'morning', 'General checkup', 'completed', 'checked-out'
WHERE NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.email = @pavan_email AND a.date = '2026-03-28' AND a.reason = 'General checkup'
);

-- ============================================================================
-- 7) VERIFICATION QUERIES (run after inserts)
-- ============================================================================

-- 4 pets in sidebar for Pavan
SELECT COUNT(*) AS pavan_pet_count
FROM pet p
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email;

-- 14 vaccinations for Pavan and status buckets for 2026-04-05
SELECT
    COUNT(*) AS vaccination_total,
    SUM(CASE WHEN v.valid_till < '2026-04-05' THEN 1 ELSE 0 END) AS overdue,
    SUM(CASE WHEN v.valid_till BETWEEN '2026-04-05' AND '2026-04-12' THEN 1 ELSE 0 END) AS urgent_7_days,
    SUM(CASE WHEN v.valid_till BETWEEN '2026-04-13' AND '2026-05-05' THEN 1 ELSE 0 END) AS warning_30_days
FROM pet_vaccination_record v
JOIN pet p ON p.id = v.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email;

-- 9 medical records, 1 expires soon (3 days), 4 expired
SELECT
    COUNT(*) AS medical_total,
    SUM(CASE WHEN m.validate_till = '2026-04-08' THEN 1 ELSE 0 END) AS expires_in_3_days,
    SUM(CASE WHEN m.validate_till < '2026-04-05' THEN 1 ELSE 0 END) AS expired_total
FROM pet_medical m
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email;

-- 10 prescriptions
SELECT COUNT(*) AS prescription_total
FROM prescription pr
JOIN pet_medical m ON m.pet_medical_id = pr.pet_medical_id
JOIN pet p ON p.id = m.pet_id
JOIN owner o ON o.id = p.owner_id
WHERE o.email = @pavan_email;

-- 3 appointments with requested statuses
SELECT status, COUNT(*) AS status_count
FROM appointments
WHERE email = @pavan_email
GROUP BY status
ORDER BY status;

