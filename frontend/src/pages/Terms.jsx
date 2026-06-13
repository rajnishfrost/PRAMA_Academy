export default function Terms() {
  const sections = [
    {
      title: '1. Declaration',
      content: 'By enrolling your child in Prama Academy, you agree to the following terms and conditions. Please read them carefully before proceeding with enrollment.',
    },
    {
      title: '2. Payment',
      content: 'Fees are to be paid in advance before the start of each level. No refund will be provided once the payment is made and classes have commenced. Payment can be made through the accepted payment methods listed on our website.',
    },
    {
      title: '3. Attendance',
      content: 'Regular attendance is mandatory for the progress of the child. If a child misses a class, a makeup class may be arranged subject to availability. Consistent absence may affect the child\'s progress and certification.',
    },
    {
      title: '4. Practice',
      content: 'Daily practice of 15 minutes at home is essential for the child\'s progress. Parents are requested to ensure the child practices regularly using the provided materials.',
    },
    {
      title: '5. Materials',
      content: 'For Indian students, hardcopy books will be provided. For international students, PDF links will be provided and parents need to print the books before class. Parents need to purchase the required abacus (17 rod) from their side before the start of abacus classes.',
    },
    {
      title: '6. Certification',
      content: 'Certification will be provided at the end of each level upon successful completion. The student must meet the minimum requirements and demonstrate proficiency to receive certification.',
    },
    {
      title: '7. Class Conduct',
      content: 'Students are expected to maintain proper conduct during online classes. The academy reserves the right to take appropriate action in case of any disruptive behavior that affects the learning environment.',
    },
    {
      title: '8. Privacy',
      content: 'We are committed to protecting the privacy of our students. Personal information collected during enrollment will be used solely for educational purposes and will not be shared with third parties.',
    },
  ]

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Terms & Conditions</h1>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-gray-600 leading-relaxed mb-10">
            Please read the following terms and conditions carefully before enrolling your child
            at Prama Academy. By proceeding with enrollment, you acknowledge that you have read,
            understood, and agree to these terms.
          </p>
          <div className="space-y-8">
            {sections.map((s, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-sm text-gray-700">
              For any questions regarding these terms, please contact us at{' '}
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
