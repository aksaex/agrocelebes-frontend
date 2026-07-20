import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  BrainCircuit, 
  Map, 
  ArrowRight, 
  Mail, 
  Phone, 
  Instagram, 
  Linkedin, 
  MapPin, 
  Users, 
  Zap, 
  ShieldCheck, 
  Menu, 
  X,
  Lock,
  Cpu
} from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Data Anggota Tim Resmi Sesuai Proposal (PanenLinkTeam - Team ID: S0403)
  const teamMembers = [
    {
      name: "Muh. Aksa",
      role: "Project Lead & Software Engineer",
      school: "Arsitektur PWA Offline-First & Escrow Backend",
      image: "aksa.png",
      linkedin: "https://www.linkedin.com/in/muh-aksa/"
    },
    {
      name: "Aryaguna Nugraha Passulleri",
      role: "Tech & AI Engineer",
      school: "Satelit Spasial Sentinel-2 & Formulasi AgroScore",
      image: "arya.png",
      linkedin: "https://www.linkedin.com/in/aryaguna-nugraha-616879311/"
    }
  ];

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white overflow-x-hidden">
      
      {/* =========================================
          NAVBAR (Sticky & Berubah Warna saat Scroll)
          ========================================= */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Logo Agro Celebes" className="h-10 w-auto transform transition group-hover:scale-105" />
            <div className="flex flex-col">
              <span className={`text-xl font-extrabold tracking-tight leading-none ${isScrolled || isMobileMenuOpen ? 'text-gray-900' : 'text-white'}`}>
                Agro <span className='text-primary'>Celebes</span>
              </span>
             </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <a href="#home" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Home</a>
            <a href="#about" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Who We Are</a>
            <a href="#features" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Features</a>
            <a href="#contact" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Contact</a>
          </nav>

          {/* Tombol Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className={`px-5 py-2 rounded-full text-sm font-bold transition ${isScrolled ? 'text-primary hover:bg-green-50' : 'text-white hover:bg-white/20'}`}>
              Masuk
            </Link>
            <Link to="/register" className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/30">
              Regist
            </Link>
          </div>

          {/* Tombol Hamburger HP */}
          <button 
            className={`md:hidden p-1 rounded-md transition ${isScrolled || isMobileMenuOpen ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Menu Dropdown HP */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col px-6 py-6 gap-4 animate-fade-in">
            <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-semibold text-lg hover:text-primary transition">Home</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-semibold text-lg hover:text-primary transition">Who We Are</a>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-semibold text-lg hover:text-primary transition">Features</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-semibold text-lg hover:text-primary transition">Contact</a>
            
            <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-3">
              <Link to="/login" className="w-full text-center py-3 text-primary font-bold border border-primary rounded-xl hover:bg-green-50 transition">Masuk</Link>
              <Link to="/register" className="w-full text-center py-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition shadow-md">Regist</Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================
          SLIDE 1: HERO SECTION (Optimized for Mobile)
          ========================================= */}
      <section id="home" className="relative h-screen flex items-center justify-center pt-16 md:pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">    
          <img 
            src="/sawah.png" 
            alt="Background sawah padi" 
            className="w-full h-full object-cover"
          />
          {/* Sedikit menggelapkan overlay agar teks putih lebih kontras dan mudah dibaca di HP */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90 z-20"></div>
        </div>

        <div className="relative z-20 text-center px-4 md:px-6 max-w-4xl mx-auto text-white mt-10 md:mt-0">
          
          {/* Label disingkat dan ukurannya diperkecil untuk HP */}
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] md:text-sm font-semibold tracking-widest uppercase mb-4 md:mb-6 animate-fade-in-up">
            Agri-Logistik • Space-Verified Credit
          </span>
          
          {/* Judul dipersingkat. Ditambah line break (<br>) yang hanya aktif di desktop */}
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tighter mb-4 md:mb-6 leading-[1.25] md:leading-[1.15]">
            Putus Rantai Ijon Petani via <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Space-Verified Credit</span>
          </h1>
          
          {/* Paragraf dirangkum agar tidak memakan lebih dari 3 baris di HP */}
          <p className="text-sm md:text-xl text-gray-200 font-light mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Ekosistem terintegrasi bagi petani gurem, KUD, BPD, dan offtaker untuk jaminan likuiditas dan rantai pasok prapanen.
          </p>
          
          {/* Tombol disesuaikan ukurannya untuk jari di layar sentuh */}
          <a href="#about" className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-gray-900 rounded-full font-bold text-sm md:text-lg hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-2xl">
            Discover Our Solution <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
          </a>
        </div>
      </section>

      {/* =========================================
          SLIDE 2: WHO WE ARE (About & Tim Proposal)
          ========================================= */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Inovasi PanenLinkTeam (Team S0403) untuk memecahkan krisis eksklusi keuangan pra-panen pada sektor agrikultur Sulawesi Selatan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                <strong>Agro Celebes</strong> adalah Platform Agri-Logistik Digital yang secara spesifik menargetkan <strong>petani padi gurem (&lt;0,5 ha) di Kabupaten Barru dan Sulawesi Selatan</strong>, Koperasi Unit Desa (KUD), serta pabrik offtaker B2B.
              </p>
              <p>
                Kami mengintervensi langsung di awal musim tanam (Pra-Panen) untuk memecahkan akar masalah eksklusi keuangan, di mana petani sering terjerat ijon tengkulak akibat ketiadaan agunan fisik untuk mengakses kredit perbankan.
              </p>
              <p>
                Melalui kolaborasi <strong>Space-Verified Credit Score</strong> berbasis satelit ESA Sentinel-2 dan <strong>Pre-Harvest Forward Escrow</strong> di BPD Sulselbar, kami memastikan bank dapat mencairkan KUR tanpa agunan fisik, pabrik mengamankan pasokan gabah, dan petani merdeka secara ekonomi.
              </p>
            </div>
            
            {/* Nilai Inti Proposal */}
            <div className="bg-[#022c22] p-8 md:p-10 rounded-3xl border border-[#064e3b] shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500 rounded-full filter blur-[70px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-500 rounded-full filter blur-[70px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>

              <div className="flex gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 text-blue-400 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                  <ShieldCheck size={28}/>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Space-Verified Credit</h3>
                  <p className="text-sm text-green-50/70 leading-relaxed font-light">Validasi data lahan secara obyektif menggunakan data vegetasi satelit Sentinel-2 (NDVI) anti-manipulasi.</p>
                </div>
              </div>

              <div className="flex gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 text-green-400 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                  <Lock size={28}/>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Pre-Harvest Escrow</h3>
                  <p className="text-sm text-green-50/70 leading-relaxed font-light">Setoran DP pabrik di Virtual Account BPD Sulselbar bertindak sebagai Credit Enhancer pencairan KUR sejak hari pertama tanam.</p>
                </div>
              </div>

              <div className="flex gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 text-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                  <Zap size={28}/>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Inklusi Ekonomi Gurem</h3>
                  <p className="text-sm text-green-50/70 leading-relaxed font-light">Mengintegrasikan PWA offline-first dan Voice-Assisted UI untuk kemudahan penggunaan petani gurem di area blank-spot.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profil Developer / Leadership Team Proposal */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">PANENLINKTEAM</h3>
            <p className="text-gray-500 max-w-2xl mx-auto">Pengembang dan arsitek di balik platform Agro Celebes.</p>
          </div>

          {/* Grid 2 Anggota Tim Terpusat Rapi */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl transition duration-300 group flex flex-col justify-between">
                <div>
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-gray-50 group-hover:border-primary transition duration-300">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h4>
                  <p className="text-primary font-semibold text-sm mb-3">{member.role}</p>
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">{member.school}</p>
                </div>
                <a 
                  href={member.linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:underline pt-2"
                >
                  <Linkedin size={16} /> Profil LinkedIn
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================
          SLIDE 3: FITUR UTAMA PROPOSAL
          ========================================= */}
      <section id="features" className="py-24 bg-[#022c22] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-[160px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full filter blur-[150px] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Inovasi Teknologi Agro Celebes</h2>
            <p className="text-xl text-green-100/80 max-w-2xl mx-auto">Orkestrasi teknologi cerdas untuk menjawab krisis likuiditas pra-panen dan pemetaan logistik.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Fitur 1 */}
            <div className="bg-white/5 border border-white/10 border-t-white/20 rounded-3xl p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
              <Leaf className="text-green-400 w-14 h-14 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Pre-Harvest Forward Escrow</h3>
              <p className="text-green-50/70 leading-relaxed font-light text-sm">
                Sistem matchmaking lelang B2B pra-panen. Pabrik menyetor DP ke rekening escrow KUD di BPD Sulselbar sebagai garansi offtaker untuk mencairkan KUR petani sejak hari pertama tanam.
              </p>
            </div>
            
            {/* Fitur 2 */}
            <div className="bg-white/5 border border-white/10 border-t-white/20 rounded-3xl p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
              <BrainCircuit className="text-yellow-400 w-14 h-14 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Space-Verified Credit</h3>
              <p className="text-green-50/70 leading-relaxed font-light text-sm">
                Scoring kredit alternatif berbasis data vegetasi satelit ESA Sentinel-2 (NDVI). Mengeliminasi fraud manual dan memberikan bukti otentik kelayakan lahan bagi perbankan.
              </p>
            </div>
            
            {/* Fitur 3 */}
            <div className="bg-white/5 border border-white/10 border-t-white/20 rounded-3xl p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
              <Map className="text-blue-400 w-14 h-14 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">PWA Offline & Voice AI</h3>
              <p className="text-green-50/70 leading-relaxed font-light text-sm">
                Aplikasi PWA offline-first dengan Geotagging Centroid lahan 1-klik dan panduan Voice-Assisted Interface untuk memudahkan petani gurem bertransaksi di area tanpa sinyal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SLIDE 4: CONTACT & REACH (Barru & Sulawesi)
          ========================================= */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Bagian Teks & Kontak */}
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Hubungi Kami</h2>
              <p className="text-lg text-gray-600 mb-10">
                Kami terbuka untuk kolaborasi dengan BPD Sulselbar, Koperasi Unit Desa (KUD), pabrik offtaker, dan pemerintah daerah demi memajukan kemandirian petani gurem.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600"><Mail size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase">Email (Project Lead)</p>
                    <p className="text-lg font-bold text-gray-900">aksafigma@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600"><Phone size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase">Telepon / WhatsApp</p>
                    <p className="text-lg font-bold text-gray-900">+62 856-5674-1225</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a href="https://www.linkedin.com/in/muh-aksa/" target="_blank" rel="noreferrer" className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"><Linkedin size={20}/></a>
                <a href="#" className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-green-700 transition"><Instagram size={20}/></a>
              </div>
            </div>

            {/* Bagian Peta Sulawesi & Barru */}
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
              <div className="mb-4 px-4 pt-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-primary"/> Wilayah Pilot & Jangkauan
                </h3>
                <p className="text-sm text-gray-500">
                  Fokus Pilot Project: <strong>Kabupaten Barru</strong>, dengan target ekspansi ke seluruh jaringan KUD Sulawesi Selatan.
                </p>
              </div>
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-200 relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src="https://maps.google.com/maps?q=Barru,Sulawesi%20Selatan&t=&z=9&ie=UTF8&iwloc=&output=embed"
                  style={{ border: 'none' }}
                  title="Peta Jangkauan Kabupaten Barru & Sulawesi Selatan"
                ></iframe>
              </div>
              <div className="px-4 py-3 text-right">
                <small className="text-xs text-gray-400">
                  <a 
                    href="https://www.google.com/maps/place/Barru,+South+Sulawesi/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:underline text-blue-600 font-semibold"
                  >
                    Buka Kabupaten Barru di Google Maps
                  </a>
                </small>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-emerald-900 border-t border-emerald-800 py-6 text-center">
        <p className="text-sm text-emerald-100 font-medium">
          © {new Date().getFullYear()} Agro Celebes. Developed by <strong>PanenLinkTeam</strong>.
        </p>
        <p className="text-xs text-emerald-300/60 mt-1">
          Platform Agri-Logistik Digital dengan Space Verified Credit
        </p>
      </footer>

    </div>
  );
}