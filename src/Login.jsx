import { useState } from 'react'
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react'

function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {
    signInEmailPassword,
    isLoading: signInLoading,
    isError: signInError,
    error: signInErrorObj,
  } = useSignInEmailPassword()

  const {
    signUpEmailPassword,
    isLoading: signUpLoading,
    isError: signUpError,
    error: signUpErrorObj,
  } = useSignUpEmailPassword()

  const isLoading = signInLoading || signUpLoading
  const isError = signInError || signUpError
  const errorObj = signInErrorObj || signUpErrorObj

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignUp) {
      const result = await signUpEmailPassword(email, password)
      console.log('signup result:', result)
    } else {
      const result = await signInEmailPassword(email, password)
      console.log('signin result:', result)
    }
  }

  return (
    <div className="center">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
        </button>
        {isError && <p className="error">{errorObj?.message}</p>}
        <p className="toggle" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </p>
      </form>
    </div>
  )
}

export default Login
