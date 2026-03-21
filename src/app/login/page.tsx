import { useState, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Heart, AlertCircle } from 'lucide-react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  // React 19 useActionState for actions
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string }, formData: FormData) => {
      const res = isLogin ? await login(formData) : await signup(formData)
      return { error: res?.error || "" }
    },
    { error: "" }
  )

  return (
    <div className="min-h-screen bg-[url('/images/bg-sunset.png')] bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft overlay to match picture vibe */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

      <Card className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/30 rounded-3xl shadow-xl z-10 transition-all duration-300">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto bg-amber-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center border border-amber-500/20">
            <Heart className="w-6 h-6 text-amber-600 animate-pulse" />
          </div>
          <CardTitle className="font-serif text-3xl font-bold tracking-tight text-amber-900">
            Ore Hoje
          </CardTitle>
          <CardDescription className="text-stone-700 font-medium">
            {isLogin ? 'Bem-vinda(o) de volta!' : 'Crie sua conta para começar'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-800 p-3 rounded-xl flex gap-2 items-center text-sm">
                <AlertCircle className="w-4 h-4 text-red-700" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-stone-800 font-medium flex gap-2 items-center">
                <Mail className="w-4 h-4 text-amber-700" /> E-mail
              </Label>
              <div className="relative">
                <Input 
                  name="email"
                  type="email" 
                  placeholder="exemplo@email.com" 
                  required
                  className="bg-white/50 border-white/50 focus:border-amber-500 rounded-xl px-4 py-5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-stone-800 font-medium flex gap-2 items-center">
                <Lock className="w-4 h-4 text-amber-700" /> Senha
              </Label>
              <div className="relative">
                <Input 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  required
                  className="bg-white/50 border-white/50 focus:border-amber-500 rounded-xl px-4 py-5"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-[#C27F15] hover:bg-[#A96B11] text-white font-semibold py-6 rounded-full shadow-lg transition-all duration-300 shadow-amber-900/10 disabled:opacity-70"
            >
              {isPending 
                ? 'PROCESSANDO...' 
                : isLogin ? 'ENTRAR' : 'CADASTRAR'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-800 hover:text-amber-900 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
          
          <div className="text-center text-xs text-stone-600 px-4">
            Ao continuar, você concorda em manter suas Orações e Paz diários.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
