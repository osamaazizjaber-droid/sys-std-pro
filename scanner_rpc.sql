-- scanner_rpc.sql (UNIFIED v2.0)
-- INSTRUCTIONS: Run this script precisely once in your Supabase SQL Editor.

-- RPC 1: Safely retrieve the student name
CREATE OR REPLACE FUNCTION get_scanner_student_info(
    p_college_code TEXT,
    p_student_id TEXT
) RETURNS TEXT AS $$
DECLARE
    v_college_id UUID;
    v_student_name TEXT;
BEGIN
    SELECT id INTO v_college_id FROM public.colleges WHERE trim(upper(college_code)) = trim(upper(p_college_code));
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid College Code'; END IF;

    SELECT student_name INTO v_student_name FROM public.students WHERE college_id = v_college_id AND trim(lower(student_id)) = trim(lower(p_student_id));
    IF NOT FOUND THEN RAISE EXCEPTION 'Student not found'; END IF;

    RETURN v_student_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC 2: Log the attendance securely
CREATE OR REPLACE FUNCTION log_scanner_attendance(
    p_college_code TEXT,
    p_action_mode TEXT,
    p_student_id TEXT,
    p_prof_id TEXT DEFAULT NULL,
    p_subject TEXT DEFAULT 'General'
) RETURNS JSON AS $$
DECLARE
    v_college_id UUID;
    v_student RECORD;
    v_prof RECORD;
    v_scan_date DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Baghdad')::DATE;
    v_scan_time TEXT := to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Baghdad', 'HH12:MI AM');
    v_curr_ay TEXT;
BEGIN
    SELECT id INTO v_college_id FROM public.colleges WHERE trim(upper(college_code)) = trim(upper(p_college_code));
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid College Code. Re-login on scanner.'; END IF;

    SELECT * INTO v_student FROM public.students WHERE college_id = v_college_id AND trim(lower(student_id)) = trim(lower(p_student_id));
    IF NOT FOUND THEN RAISE EXCEPTION 'Student not found.'; END IF;

    v_curr_ay := v_student.academic_year;

    IF p_prof_id IS NOT NULL THEN
        SELECT * INTO v_prof FROM public.professors WHERE college_id = v_college_id AND trim(lower(prof_id)) = trim(lower(p_prof_id));
    END IF;

    PERFORM 1 FROM public.attendance 
    WHERE college_id = v_college_id AND student_id = v_student.student_id AND date = v_scan_date AND subject = p_subject AND (p_prof_id IS NULL OR prof_id = v_prof.prof_id);

    IF FOUND THEN
        RAISE EXCEPTION '% is already logged today for this subject.', v_student.student_name;
    ELSE
        INSERT INTO public.attendance (college_id, student_id, student_name, prof_id, prof_name, date, subject, grade, status, academic_year, check_in, notes)
        VALUES (v_college_id, v_student.student_id, v_student.student_name, v_prof.prof_id, v_prof.prof_name, v_scan_date, p_subject, v_student.grade, 'Present', v_curr_ay, v_scan_time, 'Mobile Scanner');
        
        RETURN json_build_object('status', 'success', 'student_name', v_student.student_name, 'action', 'Logged', 'time', v_scan_time);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 3: Get Professor Config
CREATE OR REPLACE FUNCTION get_scanner_prof_info(
    p_college_code TEXT,
    p_prof_id TEXT
) RETURNS JSON AS $$
DECLARE
    v_college_id UUID;
    v_prof RECORD;
BEGIN
    SELECT id INTO v_college_id FROM public.colleges WHERE trim(upper(college_code)) = trim(upper(p_college_code));
    IF NOT FOUND THEN RETURN json_build_object('valid', false, 'error', 'Invalid College Code'); END IF;

    SELECT * INTO v_prof FROM public.professors WHERE college_id = v_college_id AND trim(lower(prof_id)) = trim(lower(p_prof_id));
    IF NOT FOUND THEN RETURN json_build_object('valid', false, 'error', 'Professor not found'); END IF;

    RETURN json_build_object('valid', true, 'prof_name', v_prof.prof_name, 'subject', v_prof.subject, 'teaching_stage', v_prof.teaching_stage);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
