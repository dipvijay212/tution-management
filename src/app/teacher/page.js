export default function TeacherPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today&apos;s Classes</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">4</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Students</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">42</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Class Schedule</h2>
        <div className="divide-y divide-gray-100">
          <div className="py-4 flex justify-between">
            <span>Mathematics 101</span>
            <span className="text-indigo-600 font-medium">10:00 AM - 11:30 AM</span>
          </div>
          <div className="py-4 flex justify-between">
            <span>Physics Advanced</span>
            <span className="text-indigo-600 font-medium">02:00 PM - 03:30 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
