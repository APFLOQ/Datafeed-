import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';
import DiscordButton from '../components/Auth/DiscordButton';

export default function AuthPage({ onClose }) {
  const { signInWithEmail, signUpWithEmail, signInWithDiscord } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-[24px] p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <span className="font-brand text-xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>Datafeed</span>
          <button onClick={onClose} className="text-text-dim hover:text-text text-2xl leading-none">&times;</button>
        </div>

        <LoginForm onEmailSignIn={signInWithEmail} onEmailSignUp={signUpWithEmail} />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-glass-border" />
          <span className="text-text-faint text-xs">or</span>
          <div className="flex-1 h-px bg-glass-border" />
        </div>

        <DiscordButton onLogin={signInWithDiscord} />
      </div>
    </div>
  );
}
