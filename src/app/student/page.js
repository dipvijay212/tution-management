export default function StudentPage() {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white">
        <h2 className="text-2xl font-bold">Hello, Student!</h2>
        <p className="mt-2 opacity-90">You have 2 assignments due this week.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">94%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Grade</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">A-</p>
        </div>
      </div>
    </div>
  );
}
