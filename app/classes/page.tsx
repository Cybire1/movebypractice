import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import LiveHero from '@/app/components/classes/LiveHero';

export const metadata = {
  title: 'Live Classes - Move By Practice',
  description: 'Join live classes and learn Move programming from experienced instructors',
};

export default async function ClassesPage() {
  // Fetch all upcoming and live classes using Prisma
  let classes;
  try {
    classes = await prisma.class.findMany({
      where: {
        status: {
          in: ['scheduled', 'live']
        }
      },
      include: {
        instructor: {
          select: {
            username: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    classes = [];
  }

  const liveClasses = classes?.filter((c) => c.status === 'live') || [];
  const upcomingClasses = classes?.filter((c) => c.status === 'scheduled') || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Spacer for fixed navbar */}
      <div className="h-28" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
            <div>
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest">
                Academy Schedule
              </div>
              <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-4">
                Flight Comm.
              </h1>
              <p className="text-xl text-zinc-600 max-w-2xl leading-relaxed">
                Join live tactical briefings and advanced Move workshops. Real-time instruction from verified engineers.
              </p>
            </div>
            <Link
              href="/classes/schedule"
              className="px-8 py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all hover:-translate-y-1 shadow-xl flex items-center gap-2"
            >
              <span>Schedule Briefing</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>

          {/* Live Hero Section */}
          <LiveHero liveClasses={liveClasses} />

          {/* Upcoming Classes */}
          <div className="mt-24">
            <h2 className="text-3xl font-black text-zinc-900 mb-12 tracking-tight flex items-center gap-4">
              Upcoming Deployments
              <span className="text-sm font-mono font-normal text-zinc-500 bg-zinc-200 px-3 py-1 rounded-full">{upcomingClasses.length} Scheduled</span>
            </h2>

            {upcomingClasses.length === 0 ? (
              <div className="bg-white rounded-[2rem] border-2 border-dashed border-zinc-300 p-24 text-center">
                <div className="text-6xl mb-6 opacity-30">📡</div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">No upcoming deployments</h3>
                <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                  The flight calendar is currently clear. Be the first to schedule a session.
                </p>
                <Link
                  href="/classes/schedule"
                  className="inline-block px-6 py-3 bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-900 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                >
                  Initiate Protocol
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="group bg-white border border-zinc-200 rounded-[2rem] overflow-hidden hover:border-zinc-900 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col"
                  >
                    <div className="relative h-56 bg-zinc-100 p-8 flex flex-col justify-between overflow-hidden">
                      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />

                      <div className="relative z-10 flex justify-between items-start">
                        <div className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-lg text-xs font-mono font-bold text-zinc-700 border border-zinc-200">
                          MODULE {classItem.id.slice(0, 4).toUpperCase()}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <span className="inline-block p-4 bg-white rounded-2xl shadow-lg text-4xl mb-2">
                          🎓
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-zinc-900 mb-3 leading-tight group-hover:text-zinc-600 transition-colors">
                          {classItem.title}
                        </h3>
                        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
                          {classItem.description}
                        </p>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-3 text-sm text-zinc-700 font-medium p-3 bg-zinc-100 rounded-xl">
                          <span>📅</span>
                          <span>
                            {format(new Date(classItem.scheduledAt), 'MMM d, yyyy')}
                          </span>
                          <span className="w-1 h-1 bg-zinc-400 rounded-full" />
                          <span>
                            {format(new Date(classItem.scheduledAt), 'h:mm a')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                              {classItem.instructor?.username?.[0]?.toUpperCase() || 'I'}
                            </div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                              {classItem.instructor?.username || 'Command'}
                            </span>
                          </div>
                          <button className="text-xs font-bold text-zinc-900 uppercase tracking-widest hover:text-zinc-600 transition-colors">
                            Reserve Seat →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

