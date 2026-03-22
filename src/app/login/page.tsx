"use client"

import { useState, useActionState } from 'react'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // React 19 useActionState for actions
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string }, formData: FormData) => {
      const res = isLogin ? await login(formData) : await signup(formData)
      return { error: res?.error || "" }
    },
    { error: "" }
  )

  return (
    <div className="bg-[#fbf9f5] text-[#1b1c1a] min-h-screen flex flex-col font-['Manrope',sans-serif] selection:bg-[#fed488] selection:text-[#785a1a]">
      {/* Top Navigation (Simplified for Login) */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f5]/80 backdrop-blur-md flex items-center justify-center px-6 h-24">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-[#042418] text-3xl mb-1" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>spa</span>
          <h1 className="font-['Newsreader',serif] text-2xl font-medium italic text-[#1b3a2c] tracking-tight">Pray for Day</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 pt-32 pb-12">
        <div className="w-full max-w-[420px] flex flex-col space-y-12">
          
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h2 className="font-['Newsreader',serif] text-4xl font-light tracking-tight text-[#042418]">
              {isLogin ? (
                <>Bem-vindo de volta ao <span className="italic">Pray for Day</span></>
              ) : (
                <>Crie sua conta no <span className="italic">Pray for Day</span></>
              )}
            </h2>
            <p className="font-['Manrope',sans-serif] text-[#775a19] uppercase tracking-[0.15em] text-[11px] font-semibold">
              {isLogin ? 'Encontre paz na presença' : 'Junte-se a nós em oração'}
            </p>
          </div>

          {/* Login Form */}
          <form action={formAction} className="space-y-6">
            
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-800 p-3 rounded-xl flex gap-2 items-center text-sm">
                <AlertCircle className="w-4 h-4 text-red-700" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Name Field (Signup Only) */}
              {!isLogin && (
                <div className="group">
                  <label className="block font-['Manrope',sans-serif] text-xs font-bold text-[#424844] uppercase tracking-wider mb-2 ml-1" htmlFor="name">
                    Nome
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-[#ffffff] border-none rounded-xl py-4 px-5 text-[#1b1c1a] placeholder:text-[#424844]/40 focus:ring-1 focus:ring-[#042418]/20 transition-all outline outline-[#c1c8c2]/15 outline-1" 
                      id="name" 
                      name="name"
                      placeholder="Seu nome" 
                      type="text"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="group">
                <label className="block font-['Manrope',sans-serif] text-xs font-bold text-[#424844] uppercase tracking-wider mb-2 ml-1" htmlFor="email">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <input 
                    className="w-full bg-[#ffffff] border-none rounded-xl py-4 px-5 text-[#1b1c1a] placeholder:text-[#424844]/40 focus:ring-1 focus:ring-[#042418]/20 transition-all outline outline-[#c1c8c2]/15 outline-1" 
                    id="email" 
                    name="email"
                    placeholder="nome@exemplo.com" 
                    type="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block font-['Manrope',sans-serif] text-xs font-bold text-[#424844] uppercase tracking-wider" htmlFor="password">
                    Senha
                  </label>
                  {isLogin && (
                    <a className="text-[11px] font-bold text-[#775a19] uppercase tracking-widest hover:opacity-70 transition-opacity" href="#">
                      Esqueceu a senha?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input 
                    className="w-full bg-[#ffffff] border-none rounded-xl py-4 px-5 text-[#1b1c1a] placeholder:text-[#424844]/40 focus:ring-1 focus:ring-[#042418]/20 transition-all outline outline-[#c1c8c2]/15 outline-1" 
                    id="password" 
                    name="password"
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#424844]/60 hover:text-[#042418] transition-colors" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-[#ffdea5] py-5 rounded-full font-['Manrope',sans-serif] font-bold uppercase tracking-[0.2em] text-xs shadow-none hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isPending}
            >
              <span>{isPending ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}</span>
            </button>
          </form>


          {/* Toggle Mode Link */}
          <div className="text-center pt-4">
            <p className="font-['Manrope',sans-serif] text-sm text-[#424844]">
              {isLogin ? "Não tem conta? " : "Já tem conta? "}
              <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-[#042418] ml-1 underline-offset-4 hover:underline transition-all">
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>

        </div>
      </main>

      {/* Aesthetic Decorative Element */}
      <div className="fixed bottom-0 left-0 w-full h-1/4 pointer-events-none overflow-hidden opacity-30 select-none">
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#ffdea5]/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#c7ebd6]/20 blur-3xl"></div>
      </div>
    </div>
  )
}
