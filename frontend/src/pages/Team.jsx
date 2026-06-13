import { useTeam } from '../lib/useTeam'
import { getImageUrl } from '../lib/imageUrl'

export default function Team() {
  const { members, loading } = useTeam()

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/team.jpg)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Meet Our Experts</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Our Team</h1>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member, i) => (
                <div
                  key={member._id || i}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-64 overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(member.image)}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary text-sm font-medium mb-1">{member.role}</p>
                    <p className="text-xs text-gray-500 mb-3">{member.qualification}</p>
                    {member.education && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-0.5">Education</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{member.education}</p>
                      </div>
                    )}
                    {member.experience && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-0.5">Experience</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{member.experience}</p>
                      </div>
                    )}
                    {member.achievements && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-0.5">Achievements</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{member.achievements}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Courses: </span>
                        {member.courses}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Franchise Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Franchise Opportunity</h2>
          <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Are you passionate about education? Join our growing network of franchise partners
            and bring Prama Academy&apos;s proven curriculum to your community. We provide complete
            training, materials, and ongoing support.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left mb-10">
            {[
              'Complete training program',
              'Teaching materials provided',
              'Marketing support',
              'Ongoing mentorship',
              'Proven curriculum',
              'Growing brand recognition',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <a
            href="mailto:pramaacademy@gmail.com"
            className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get In Touch
          </a>
        </div>
      </section>
    </>
  )
}
