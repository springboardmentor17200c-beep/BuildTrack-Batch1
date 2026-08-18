from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:1234@localhost:5432/buildtrack_db', connect_args={'options': '-csearch_path=buildtrack,public'})
with engine.connect() as conn:
    emp = conn.execute(text("SELECT employee_id FROM employee_profiles WHERE employee_code = 'ww99'")).first()
    if emp:
        emp_id = emp[0]
        # Insert some mock attendance for August 2026
        queries = [
            f"INSERT INTO attendance (employee_id, attendance_date, status, check_in_time, check_out_time) VALUES ({emp_id}, '2026-08-01', 'Present', '08:00 AM', '05:00 PM')",
            f"INSERT INTO attendance (employee_id, attendance_date, status, check_in_time, check_out_time) VALUES ({emp_id}, '2026-08-02', 'Absent', NULL, NULL)",
            f"INSERT INTO attendance (employee_id, attendance_date, status, check_in_time, check_out_time) VALUES ({emp_id}, '2026-08-03', 'Present', '08:15 AM', '05:00 PM')",
            f"INSERT INTO attendance (employee_id, attendance_date, status, check_in_time, check_out_time) VALUES ({emp_id}, '2026-08-04', 'Half Day', '08:00 AM', '12:00 PM')",
            f"INSERT INTO attendance (employee_id, attendance_date, status, check_in_time, check_out_time) VALUES ({emp_id}, '2026-08-05', 'On Leave', NULL, NULL)",
        ]
        for q in queries:
            try:
                conn.execute(text(q))
            except Exception as e:
                pass # ignore duplicates
        conn.commit()
