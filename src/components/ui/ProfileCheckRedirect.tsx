'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileCheckRedirect({ hasProfile }: { hasProfile: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Se o perfil está incompleto (Ex: sem nome social cadastrado) e ele NÃO está na página de Perfil já
    if (!hasProfile && pathname !== '/dashboard/profile') {
      router.replace('/dashboard/profile?onboarding=true');
    }
  }, [hasProfile, pathname, router]);

  return null;
}
