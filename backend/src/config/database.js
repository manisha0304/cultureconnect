import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/cultureconnect.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDatabase() {
  const db = getDb();
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      history TEXT,
      image_url TEXT,
      state TEXT,
      region TEXT,
      dress_suggestions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Event Managers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_managers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      specialty TEXT,
      location TEXT,
      rating REAL DEFAULT 0,
      event_category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      event_manager_id TEXT,
      event_date DATE NOT NULL,
      venue TEXT,
      guest_count INTEGER,
      special_requests TEXT,
      total_amount REAL,
      payment_status TEXT DEFAULT 'pending',
      payment_id TEXT,
      booking_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (event_manager_id) REFERENCES event_managers(id)
    )
  `);

  // Seed initial data
  seedData(db);
  
  console.log('Database initialized successfully');
}

function seedData(db) {
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
  
  if (eventCount.count === 0) {
    const events = [
      {
        id: 'evt-1',
        name: 'Diwali - Festival of Lights',
        category: 'festival',
        description: 'Diwali is one of the most celebrated festivals in India, marking the victory of light over darkness and good over evil.',
        history: 'Diwali has been celebrated for thousands of years. The festival is mentioned in ancient Sanskrit texts and is associated with various legends including the return of Lord Rama to Ayodhya after 14 years of exile. The tradition of lighting diyas (oil lamps) symbolizes the inner light that protects from spiritual darkness.',
        image_url: 'https://images.pexels.com/photos/18849427/pexels-photo-18849427.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'All India',
        region: 'Pan India',
        dress_suggestions: JSON.stringify(['Traditional silk sarees for women', 'Kurta pajama or sherwani for men', 'Lehenga choli for young women', 'Gold and maroon colors are auspicious'])
      },
      {
        id: 'evt-2',
        name: 'Holi - Festival of Colors',
        category: 'festival',
        description: 'Holi is the vibrant festival of colors celebrating the arrival of spring and the triumph of good over evil.',
        history: 'Holi commemorates the divine love of Radha and Krishna, and also celebrates the legend of Holika and Prahlad. The festival has been celebrated since ancient times and finds mention in 4th century texts.',
        image_url: 'https://images.pexels.com/photos/3367460/pexels-photo-3367460.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'All India',
        region: 'Pan India',
        dress_suggestions: JSON.stringify(['White cotton clothes that can get colored', 'Old comfortable clothes', 'Avoid silk or expensive fabrics', 'Kurta and pajama recommended'])
      },
      {
        id: 'evt-3',
        name: 'Traditional Indian Wedding',
        category: 'wedding',
        description: 'Indian weddings are elaborate multi-day celebrations filled with rituals, music, dance, and feasting.',
        history: 'Indian wedding traditions date back thousands of years to Vedic times. The ceremonies are designed to unite two families and invoke blessings for the couple. Different regions have unique customs, from the Baraat procession to the Saptapadi (seven steps).',
        image_url: 'https://images.pexels.com/photos/31189422/pexels-photo-31189422.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'All India',
        region: 'Pan India',
        dress_suggestions: JSON.stringify(['Bridal lehenga in red/maroon for bride', 'Sherwani or bandhgala for groom', 'Sarees or lehengas for women guests', 'Kurta pajama or suits for men guests', 'Avoid white and black colors'])
      },
      {
        id: 'evt-4',
        name: 'Durga Puja',
        category: 'festival',
        description: 'Durga Puja is the grandest festival of West Bengal, celebrating the goddess Durga\'s victory over the demon Mahishasura.',
        history: 'Durga Puja dates back to the 16th century when zamindars started elaborate celebrations. It became a community festival in Kolkata in the 18th century. The festival spans 10 days with the last five being the most significant.',
        image_url: 'https://images.pexels.com/photos/9461016/pexels-photo-9461016.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'West Bengal',
        region: 'East India',
        dress_suggestions: JSON.stringify(['Traditional Bengali sarees (tant/jamdani)', 'Dhoti kurta for men', 'Red and white combination is traditional', 'Designer sarees for pandal hopping'])
      },
      {
        id: 'evt-5',
        name: 'Onam',
        category: 'festival',
        description: 'Onam is the harvest festival of Kerala, celebrating the homecoming of the legendary King Mahabali.',
        history: 'Onam commemorates the reign of King Mahabali, a benevolent ruler whose annual visit from the netherworld is celebrated. The 10-day festival includes elaborate feasts (Onasadya), boat races, and traditional dances.',
        image_url: 'https://images.pexels.com/photos/34058997/pexels-photo-34058997.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'Kerala',
        region: 'South India',
        dress_suggestions: JSON.stringify(['Kerala kasavu saree (cream with gold border)', 'Mundu and shirt for men', 'Traditional white and gold attire', 'Flower jewelry for women'])
      },
      {
        id: 'evt-6',
        name: 'College Cultural Fest',
        category: 'college',
        description: 'Annual college cultural festivals featuring competitions, performances, and celebrations.',
        history: 'College fests in India began in the 1970s and have grown into massive events. Famous fests like IIT\'s Mood Indigo and St. Xavier\'s Malhar attract thousands of participants from across the country.',
        image_url: 'https://images.pexels.com/photos/8197534/pexels-photo-8197534.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'All India',
        region: 'Pan India',
        dress_suggestions: JSON.stringify(['Smart casuals', 'College t-shirts or merchandise', 'Comfortable footwear for long hours', 'Theme-based costumes for events'])
      },
      {
        id: 'evt-7',
        name: 'Birthday Celebration',
        category: 'birthday',
        description: 'Modern birthday celebrations in India blend Western customs with traditional elements.',
        history: 'While birthday celebrations in their current form are relatively new to India, the concept of celebrating birth anniversaries existed in ancient times through religious ceremonies and blessings.',
        image_url: 'https://images.pexels.com/photos/1684039/pexels-photo-1684039.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'All India',
        region: 'Pan India',
        dress_suggestions: JSON.stringify(['Party wear dresses', 'Smart casuals', 'Theme-based outfits if applicable', 'Comfortable yet stylish attire'])
      },
      {
        id: 'evt-8',
        name: 'Pongal',
        category: 'festival',
        description: 'Pongal is the Tamil harvest festival thanking the Sun God and farm animals.',
        history: 'Pongal has been celebrated for over 1000 years and is mentioned in ancient Tamil literature. The four-day festival marks the end of winter solstice and beginning of the sun\'s journey northward.',
        image_url: 'https://share.google/3vRuZb65lMzqaZTe2',
        state: 'Tamil Nadu',
        region: 'South India',
        dress_suggestions: JSON.stringify(['Traditional Kanjivaram silk sarees', 'Veshti and angavastram for men', 'Bright colors especially yellow and orange', 'Traditional jewelry'])
      },
      {
        id: 'evt-9',
        name: 'Ganesh Chaturthi',
        category: 'festival',
        description: 'Ganesh Chaturthi celebrates the birth of Lord Ganesha with elaborate pandals and processions.',
        history: 'While Ganesh worship is ancient, the public celebration was popularized by Lokmanya Tilak in 1893 as a means to unite communities during the freedom struggle. Mumbai\'s celebration is world-famous.',
        image_url: 'https://images.pexels.com/photos/28770093/pexels-photo-28770093.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'Maharashtra',
        region: 'West India',
        dress_suggestions: JSON.stringify(['Traditional Marathi sarees (nauvari)', 'Kurta pajama for men', 'Dhoti and kurta', 'Orange and red colors preferred'])
      },
      {
        id: 'evt-10',
        name: 'School Annual Day',
        category: 'school',
        description: 'Annual day celebrations in schools featuring performances, awards, and cultural programs.',
        history: 'School annual days in India became popular post-independence as a way to showcase student talent and achievements. These events bring together students, teachers, and parents.',
        image_url: 'https://images.pexels.com/photos/8197511/pexels-photo-8197511.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'All India',
        region: 'Pan India',
        dress_suggestions: JSON.stringify(['School uniform or formal wear', 'Cultural costume for performers', 'Traditional attire for cultural items', 'Comfortable shoes'])
      },
      {
        id: 'evt-11',
        name: 'Navratri & Garba',
        category: 'festival',
        description: 'Nine nights of devotion to Goddess Durga featuring energetic Garba and Dandiya dances.',
        history: 'Navratri has been celebrated for centuries across India. The Gujarati tradition of Garba evolved from ritualistic worship to a vibrant social celebration. The dance represents the cycle of life.',
        image_url: 'https://images.pexels.com/photos/34293083/pexels-photo-34293083.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'Gujarat',
        region: 'West India',
        dress_suggestions: JSON.stringify(['Chaniya choli for women', 'Kediyu and dhoti for men', 'Bright mirror-work outfits', 'Traditional jewelry and accessories', 'Comfortable footwear for dancing'])
      },
      {
        id: 'evt-12',
        name: 'Bihu',
        category: 'festival',
        description: 'Assamese festival marking the harvesting season with traditional Bihu dance.',
        history: 'Bihu has been celebrated since ancient times in Assam. There are three Bihus - Rongali (spring), Kongali (autumn), and Bhogali (harvest). Rongali Bihu is the most celebrated, marking Assamese New Year.',
        image_url: 'https://images.pexels.com/photos/6976918/pexels-photo-6976918.jpeg?auto=compress&cs=tinysrgb&w=800',
        state: 'Assam',
        region: 'Northeast India',
        dress_suggestions: JSON.stringify(['Mekhela chador for women', 'Dhoti and gamosa for men', 'Traditional Assamese silk', 'Red and gold colors'])
      }
    ];

    const insertEvent = db.prepare(`
      INSERT INTO events (id, name, category, description, history, image_url, state, region, dress_suggestions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const event of events) {
      insertEvent.run(
        event.id, event.name, event.category, event.description,
        event.history, event.image_url, event.state, event.region, event.dress_suggestions
      );
    }

    // Seed event managers
    const managers = [
      { id: 'mgr-1', name: 'Sharma Events', phone: '+91 98765 43210', email: 'sharma@events.com', specialty: 'Weddings', location: 'Delhi', rating: 4.8, event_category: 'wedding' },
      { id: 'mgr-2', name: 'Royal Celebrations', phone: '+91 98765 43211', email: 'royal@celebrations.com', specialty: 'Grand Events', location: 'Mumbai', rating: 4.9, event_category: 'wedding' },
      { id: 'mgr-3', name: 'Festival Masters', phone: '+91 98765 43212', email: 'festival@masters.com', specialty: 'Religious Events', location: 'Kolkata', rating: 4.7, event_category: 'festival' },
      { id: 'mgr-4', name: 'Party Planners Pro', phone: '+91 98765 43213', email: 'party@planners.com', specialty: 'Birthday Parties', location: 'Bangalore', rating: 4.6, event_category: 'birthday' },
      { id: 'mgr-5', name: 'Campus Events Co', phone: '+91 98765 43214', email: 'campus@events.com', specialty: 'College Festivals', location: 'Chennai', rating: 4.5, event_category: 'college' },
      { id: 'mgr-6', name: 'Diwali Decorators', phone: '+91 98765 43215', email: 'diwali@decor.com', specialty: 'Diwali Celebrations', location: 'Jaipur', rating: 4.8, event_category: 'festival' },
      { id: 'mgr-7', name: 'School Fest Experts', phone: '+91 98765 43216', email: 'school@fest.com', specialty: 'School Events', location: 'Hyderabad', rating: 4.4, event_category: 'school' },
      { id: 'mgr-8', name: 'Dream Weddings', phone: '+91 98765 43217', email: 'dream@weddings.com', specialty: 'Destination Weddings', location: 'Udaipur', rating: 4.9, event_category: 'wedding' }
    ];

    const insertManager = db.prepare(`
      INSERT INTO event_managers (id, name, phone, email, specialty, location, rating, event_category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const mgr of managers) {
      insertManager.run(mgr.id, mgr.name, mgr.phone, mgr.email, mgr.specialty, mgr.location, mgr.rating, mgr.event_category);
    }

    console.log('Database seeded with initial data');
  }
}
