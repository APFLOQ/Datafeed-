import { useState } from 'react';

export default function LoginForm({ onEmailSignIn, onEmailSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fn = mode === 'login' ? onEmailSignIn : onEmailSignUp;
    const { error: err } = await fn(email, password);
    if (err) setError(err.message);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-brand text-2xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
        {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="glass-input"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="glass-input"
        required
        minLength={6}
      />

      {error && <p className="text-loss text-sm">{error}</p>}

      <button type="submit" className="glass-btn py-3.5 text-sm font-semibold">
        {mode === 'login' ? 'Sign In' : 'Sign Up'}
      </button>

      <p className="text-text-faint text-sm text-center">
        {mode === 'login' ? (
          <>Don&apos;t have an account? <button type="button" onClick={() => setMode('signup')} className="text-brand-blue hover:underline">Sign up</button></>
        ) : (
          <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-brand-blue hover:underline">Sign in</button></>
        )}
      </p>
    </form>
  );
}
