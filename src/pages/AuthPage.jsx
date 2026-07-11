import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';

export default function AuthPage({ onClose }) {
  const { signInWithEmail, signUpWithEmail } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-[24px] p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <span className="font-brand text-xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>Datafeed</span>
          <button onClick={onClose} className="text-text-dim hover:text-text text-2xl leading-none">&times;</button>
        </div>

        <LoginForm onEmailSignIn={signInWithEmail} onEmailSignUp={signUpWithEmail} />
      </div>
    </div>
  );
}
