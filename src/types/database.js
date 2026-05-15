/**
 * @typedef {Object} Student
 * @property {string} id - Primary Key
 * @property {string} [user_id] - Foreign Key to auth.users
 * @property {string} student_code - Unique Student Code
 * @property {string} class_name - Current Class/Grade
 * @property {string} school_name - School name
 * @property {string} parent_name - Father/Mother name
 * @property {string} parent_phone - Contact number of parent
 * @property {string} address - Physical address
 * @property {string} full_name - Student full name
 * @property {string} email - Student email
 * @property {string} phone - Student phone
 * @property {string} gender - male/female/other
 * @property {string} date_of_birth - ISO Date
 * @property {string} created_at - ISO Timestamp
 */

/**
 * @typedef {Object} Teacher
 * @property {string} id - Primary Key
 * @property {string} [user_id] - Foreign Key to auth.users
 * @property {string} qualification - Educational qualification
 * @property {string} specialization - Specialization subject
 * @property {number} experience_years - Years of experience
 * @property {number} salary - Monthly salary
 * @property {string} full_name - Teacher full name
 * @property {string} email - Teacher email
 * @property {string} phone - Teacher phone
 * @property {string} created_at - ISO Timestamp
 */

/**
 * @typedef {Object} Batch
 * @property {string} id - Primary Key
 * @property {string} batch_name - Name of the batch
 * @property {string} subject_id - Foreign Key to subjects
 * @property {string} teacher_id - Foreign Key to teachers
 * @property {string} start_time - Start time (HH:mm)
 * @property {string} end_time - End time (HH:mm)
 * @property {number} fees - Batch monthly fees
 * @property {string} room_number - Assigned room
 * @property {number} capacity - Student capacity
 * @property {string[]} days - Days of week (Mon, Tue, etc.)
 * @property {string} created_at - ISO Timestamp
 */

/**
 * @typedef {Object} FeeRecord
 * @property {string} id - Primary Key
 * @property {string} student_id - Foreign Key to students
 * @property {string} batch_id - Foreign Key to batches
 * @property {number} amount - Amount paid
 * @property {string} payment_method - Cash/UPI/Bank/Cheque
 * @property {string} transaction_id - Transaction reference
 * @property {string} due_date - ISO Date for next payment
 * @property {string} payment_date - ISO Date
 * @property {string} status - paid/partial/pending
 * @property {string} created_at - ISO Timestamp
 */

export const Schema = {};
