import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Tambahan Ikon Menu dan X untuk versi HP
import { Leaf, BrainCircuit, Map, ArrowRight, Mail, Phone, Instagram, Linkedin, MapPin, Users, Zap, ShieldCheck, Menu, X } from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  // State baru untuk mengontrol buka/tutup menu di HP
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Efek untuk mengubah warna Navbar saat di-scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Data Tim (Silakan ganti dengan nama kelompok Anda sesungguhnya)
  const teamMembers = [
    {
      name: "Muh. Aksa",
      role: "Fullstack & AI Enginer",
      school: "Institut Teknologi B",
      image: "aksa.png"
    },
    {
      name: "Akbar Arjuna",
      role: "UI/UX Designer",
      school: "Institut Teknologi B",
      image: "logo.png"
    },
    {
      name: "Rahmat Ardana",
      role: "Frontend Developer",
      school: "Institut Teknologi B",
      image: "logo.png"
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
            <img src="/logo.png" alt="Logo" className="h-10 w-auto transform transition group-hover:scale-105" />
            <div className="flex flex-col">
              <span className={`text-xl font-extrabold tracking-tight leading-none ${isScrolled || isMobileMenuOpen ? 'text-gray-900' : 'text-white'}`}>
                Agro <span className='text-primary'>Celebes</span>
              </span>
            </div>
          </Link>

          {/* Navigasi Desktop (Sembunyi di HP) */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <a href="#home" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Home</a>
            <a href="#about" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Who We Are</a>
            <a href="#features" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Features</a>
            <a href="#contact" className={`${isScrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-200 hover:text-white'} transition`}>Contact</a>
          </nav>

          {/* Tombol Desktop (Sembunyi di HP) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Saya tambahkan tombol Masuk agar pengguna tidak bingung mencari jalan ke Dashboard */}
            <Link to="/login" className={`px-5 py-2 rounded-full text-sm font-bold transition ${isScrolled ? 'text-primary hover:bg-green-50' : 'text-white hover:bg-white/20'}`}>
              Masuk
            </Link>
            <Link to="/register" className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/30">
              Regist
            </Link>
          </div>

          {/* Tombol Hamburger Khusus HP */}
          <button 
            className={`md:hidden p-1 rounded-md transition ${isScrolled || isMobileMenuOpen ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* =========================================
            MENU DROPDOWN KHUSUS HP (Mobile Menu)
            ========================================= */}
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
          SLIDE 1: HERO SECTION
          ========================================= */}
      <section id="home" className="relative h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">    
        
        {/*\ Menggunakan Video
        <video autoPlay loop muted playsInline className="min-w-full min-h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover">
        <source src="/sawah.mp4" type="video/mp4" />
        </video>*/} 
        
        {/* Menggunakan gambar*/}
        <img 
        src="/sawah.png" 
        alt="Background sawah" 
        className="w-full h-full object-cover"
        />
         {/* Overlay gradien agar teks lebih dramatis */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/100 z-20"></div>
       </div>

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto text-white">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold tracking-widest uppercase mb-6 animate-fade-in-up">
            Agricultural Innovation
          </span>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
            Mentransformasi Pertanian melalui <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Solusi AI</span>
          </h1>
          <p className="text-lg md:text-1xl text-gray-200 font-light mb-10 max-w-2xl mx-auto">
            Berfokus pada Masa Depan Petani Sulawesi
          </p>
          <a href="#about" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-2xl">
            Discover Our Vision <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* =========================================
          SLIDE 2: WHO WE ARE (About & Tim)
          ========================================= */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Kolektif mahasiswa yang penuh semangat mentransformasi pertanian melalui inovasi Kecerdasan Buatan.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Kami adalah TIM mahasiswa yang berfokus pada potensi maritim dan agrikultur di <strong>Sulawesi</strong>. Sebagai mahasiswa lokal yang peduli pada teknologi dan kesejahteraan petani, kami berkolaborasi untuk membangun alat berbasis AI yang membantu mengoptimalkan hasil panen dan memotong rantai pasok yang merugikan.
              </p>
              <p>
                Tujuan kami adalah menjembatani AI mutakhir dengan tantangan unik yang dihadapi petani lokal—meningkatkan efisiensi dan transparansi harga <strong>tanpa hambatan biaya tambahan</strong>.
              </p>
              <p>
                Bersama-sama, kami menumbuhkan generasi baru inovator yang memandang teknologi bukan sebagai pengganti kearifan bertani tradisional, melainkan sebagai alat luar biasa untuk menyempurnakannya.
              </p>
            </div>
            
            {/* Core Values / Nilai Inti -> SUDAH DIUBAH MENJADI HIJAU TUA & GLASSMORPHISM */}
            <div className="bg-[#022c22] p-8 md:p-10 rounded-3xl border border-[#064e3b] shadow-2xl space-y-8 relative overflow-hidden group">
              {/* Dekorasi Background Cahaya seperti di slide 3 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500 rounded-full filter blur-[70px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-500 rounded-full filter blur-[70px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>

              <div className="flex gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 text-blue-400 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md"><Users size={28}/></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Kolaborasi</h3>
                  <p className="text-sm text-green-50/70 leading-relaxed font-light">Solusi terbaik lahir dari beragam perspektif dan disiplin ilmu.</p>
                </div>
              </div>
              <div className="flex gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 text-green-400 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md"><ShieldCheck size={28}/></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Dampak Nyata</h3>
                  <p className="text-sm text-green-50/70 leading-relaxed font-light">Setiap baris kode kami dirancang untuk peningkatan ekonomi petani lokal.</p>
                </div>
              </div>
              <div className="flex gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 text-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md"><Zap size={28}/></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Inovasi</h3>
                  <p className="text-sm text-green-50/70 leading-relaxed font-light">Mendorong batas kemungkinan dengan solusi yang praktis dan dapat diakses.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profil Developer / Leadership Team */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">JSX GONRONG TEAM</h3>
            <p className="text-gray-500">Berakar dari semangat kemajuan teknologi, tim kami merancang sistem ini dengan dedikasi tinggi.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl transition duration-300 group">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-gray-50 group-hover:border-primary transition duration-300">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
                <p className="text-primary font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-sm text-gray-500">{member.school}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================
          SLIDE 3: FITUR (Pengganti "Products")
          ========================================= */}
      <section id="features" className="py-24 bg-[#022c22] text-white relative overflow-hidden">
        {/* Dekorasi Background: Efek cahaya matahari di sela dedaunan */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-[160px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full filter blur-[150px] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Teknologi di Balik AgroCelebes</h2>
            <p className="text-xl text-green-100/80 max-w-2xl mx-auto">Tidak hanya membangun website, kami membangun ekosistem digital terintegrasi.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Kartu 1 */}
            <div className="bg-white/5 border border-white/10 border-t-white/20 rounded-3xl p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
              <Leaf className="text-green-400 w-14 h-14 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Direct-Trade B2B</h3>
              <p className="text-green-50/70 leading-relaxed font-light">Sistem marketplace yang mempertemukan petani langsung dengan perusahaan pembeli skala besar. Transparan, adil, tanpa perantara (tengkulak).</p>
            </div>
            
            {/* Kartu 2 */}
            <div className="bg-white/5 border border-white/10 border-t-white/20 rounded-3xl p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
              <BrainCircuit className="text-yellow-400 w-14 h-14 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">AI Penyulu </h3>
              <p className="text-green-50/70 leading-relaxed font-light">Asisten virtual cerdas yang dilengkapi kemampuan Vision. Petani cukup memotret tanaman berpenyakit, dan AI akan langsung memberikan solusi penanganannya.</p>
            </div>
            
            {/* Kartu 3 */}
            <div className="bg-white/5 border border-white/10 border-t-white/20 rounded-3xl p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
              <Map className="text-blue-400 w-14 h-14 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Pemetaan Geolocation</h3>
              <p className="text-green-50/70 leading-relaxed font-light">Keamanan transaksi terjamin. Sistem secara otomatis melacak titik koordinat satelit lahan petani untuk mencegah penipuan lokasi dan alamat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SLIDE 4: CONTACT & REACH (Peta Sulawesi)
          ========================================= */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Bagian Teks & Kontak */}
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Let's Connect</h2>
              <p className="text-lg text-gray-600 mb-10">Pilih cara terbaik untuk menghubungi kami. Kami selalu terbuka untuk mendiskusikan ide baru dan peluang kolaborasi demi kemajuan Sulawesi.</p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600"><Mail size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase">Email</p>
                    <p className="text-lg font-bold text-gray-900">aksafigma@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600"><Phone size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase">Phone</p>
                    <p className="text-lg font-bold text-gray-900">+62 856-5674-1225</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-green-700 transition"><Instagram size={20}/></a>
                <a href="#" className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"><Linkedin size={20}/></a>
              </div>
            </div>

            {/* Bagian Peta Google Maps (Sulawesi) */}
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
              <div className="mb-4 px-4 pt-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="text-primary"/> Jangkauan Kami
                </h3>
                {/* Deskripsi diubah untuk mencakup seluruh pulau Sulawesi */}
                <p className="text-sm text-gray-500">
                  Mencakup jaringan komoditas dari pesisir hingga pegunungan di seluruh wilayah Sulawesi.
                </p>
              </div>
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-200 relative">
                {/* Iframe Peta Google Maps (Sulawesi Full) */}
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  /* Parameter q=Sulawesi dan z=6 mengatur pencarian dan level zoom agar pas sepulau */
                  src="https://maps.google.com/maps?q=Sulawesi&t=&z=6&ie=UTF8&iwloc=&output=embed"
                  style={{ border: 'none' }}
                  title="Peta Jangkauan Sulawesi"
                ></iframe>
              </div>
              <div className="px-4 py-3 text-right">
                <small className="text-xs text-gray-400">
                  {/* Link diarahkan ke pencarian Sulawesi secara umum */}
                  <a 
                    href="https://www.google.com/maps/place/Sulawesi/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:underline text-blue-600 font-semibold"
                  >
                    Buka di Aplikasi Google Maps
                  </a>
                </small>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-emerald-900 border-t border-emerald-800 py-5 text-center">
        <p className="text-sm text-emerald-100 font-medium">
          © {new Date().getFullYear()} AgroCelebes <br className="md:hidden" />
          By GongrongJsx Team.
        </p>
      </footer>

    </div>
  );
}