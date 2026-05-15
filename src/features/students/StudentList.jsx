import React from 'react';

const StudentList = ({ students = [] }) => {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {students.length > 0 ? (
          students.map((student) => (
            <li key={student.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-indigo-600">{student.name}</p>
                  <div className="ml-2 flex flex-shrink-0">
                    <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {student.course}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>Enrolled on {student.enrolledDate}</p>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-4 py-12 text-center text-gray-500">
            No students found.
          </li>
        )}
      </ul>
    </div>
  );
};

export default StudentList;
