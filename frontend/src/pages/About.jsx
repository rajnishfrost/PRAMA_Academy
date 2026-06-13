export default function About() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/team.jpg)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">About Us</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Our Story</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Prama Academy was founded in 2018 by a team of passionate educators with a vision
              to make quality education accessible to children around the world. What started as
              a small tutoring initiative has grown into a comprehensive online academy serving
              students across multiple countries.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              We specialize in brain development courses that have stood the test of time &mdash;
              Abacus, Vedic Mathematics, Handwriting improvement, and Shloka learning. These
              courses are designed not just to teach skills, but to develop the cognitive
              abilities that form the foundation for lifelong learning.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-12">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              To empower children with the tools and techniques that enhance their mathematical
              abilities, concentration, memory, and overall brain development through
              time-tested educational methods delivered by expert instructors.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-12">
              What Sets Us Apart
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {[
                { title: 'Small Batch Sizes', desc: 'Maximum 7-10 students per batch ensuring personalized attention.' },
                { title: 'Expert Faculty', desc: 'Specially trained instructors with years of teaching experience.' },
                { title: 'Structured Curriculum', desc: 'Well-designed levels with certification at each milestone.' },
                { title: 'Global Reach', desc: 'Students from multiple countries learning through our online platform.' },
                { title: 'Proven Results', desc: '3,000+ success stories with students excelling in academics.' },
                { title: 'Flexible Scheduling', desc: 'Classes designed around international school vacation schedules.' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 mt-12">
              Franchise Opportunity
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We offer franchise opportunities for passionate educators who want to bring
              Prama Academy&apos;s proven curriculum to their community. Our franchise partners
              receive complete training, teaching materials, and ongoing support.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Interested? Reach out to us at{' '}
              <a href="mailto:pramaacademy@gmail.com" className="text-primary hover:underline font-medium">
                pramaacademy@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
