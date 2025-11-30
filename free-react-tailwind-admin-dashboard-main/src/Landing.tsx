
import { Link } from 'react-router';

const Landing = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Friday Night Fellowship",
      date: "Every Friday",
      time: "7:00 PM",
      location: "UDOM Chapel"
    },
    {
      id: 2,
      title: "Sabbath School",
      date: "Every Saturday",
      time: "9:00 AM",
      location: "UDOM Chapel"
    },
    {
      id: 3,
      title: "Divine Service",
      date: "Every Saturday",
      time: "11:00 AM",
      location: "UDOM Chapel"
    }
  ];

  const ministries = [
    {
      name: "Prayer Ministry",
      description: "Join us in prayer and spiritual warfare",
      icon: "🙏"
    },
    {
      name: "Bible Study",
      description: "Deep dive into God's word",
      icon: "📖"
    },
    {
      name: "Evangelism",
      description: "Spreading the gospel on campus",
      icon: "🎯"
    },
    {
      name: "Welfare",
      description: "Serving the community in love",
      icon: "❤️"
    }
  ];

  // Simple SVG icons as components
  const CalendarIcon = () => (
    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-900 dark:text-white">
                  TUCASA UDOM
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Seventh-day Adventist Church</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/signin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Join Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="text-blue-600 dark:text-blue-400">TUCASA UDOM ZONE</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The Tanzania University Seventh-day Adventist Church at the University of Dodoma. 
              A community of believers growing in faith, fellowship, and service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Join Our Community
              </Link>
              <Link 
                to="/about" 
                className="border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Ministries</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Serving God through various ministries on campus
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ministries.map((ministry) => (
              <div 
                key={ministry.name}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 text-2xl">
                  {ministry.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {ministry.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {ministry.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Join us for worship and fellowship
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <CalendarIcon />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                      {event.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    ⏰ {event.time}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    📍 {event.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bible Verse Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <blockquote className="text-2xl md:text-3xl font-light text-white italic mb-4">
            "But seek first the kingdom of God and His righteousness, and all these things shall be added to you."
          </blockquote>
          <p className="text-blue-100 text-lg">
            Matthew 6:33
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Join Our Family?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Become part of our growing community of faith at the University of Dodoma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Create Account
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TUCASA UDOM</h3>
              <p className="text-gray-400">
                Seventh-day Adventist Church<br />
                University of Dodoma
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/ministries" className="hover:text-white transition-colors">Ministries</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <address className="not-italic text-gray-400">
                University of Dodoma<br />
                Dodoma, Tanzania<br />
                info@tucasa-udom.ac.tz
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TUCASA UDOM ZONE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;