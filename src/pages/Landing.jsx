import Navbar from '../components/Landing/Navbar';
import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import CtaSection from '../components/Landing/CtaSection';
import Footer from '../components/Landing/Footer';

export default function Landing({ onSignUp }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onSignUp={onSignUp} />
      <Hero onSignUp={onSignUp} />
      <Features />
      <CtaSection onSignUp={onSignUp} />
      <Footer />
    </div>
  );
}
