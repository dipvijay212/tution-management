import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="relative overflow-hidden pt-16 pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:-top-10 lg:-top-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-violet-100 opacity-40" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Manage your Tuition Center with{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Confidence
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The all-in-one platform for educators to track students, schedule classes, and manage payments with ease. Built for modern tuition centers.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">Start Free Trial</Button>
            <Button variant="secondary" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Feature Preview Card */}
        <div className="mt-20 flow-root sm:mt-24">
          <div className="rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-gray-200 lg:-m-4 lg:p-8">
            <div className="relative rounded-2xl bg-slate-50 p-8 min-h-[400px] border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
               {/* Decorative grid */}
              <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 mb-6">
                  Coming Soon
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Preview</h2>
                <p className="mt-2 text-gray-500">Visualizing student growth and attendance data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
