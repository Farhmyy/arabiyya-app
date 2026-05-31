/* useAuth — Supabase auth state + admin role detection */

function useAuth() {
  const { useState, useEffect } = React;

  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);   // 'admin'|'student'|'guest'|null(loading)
  const [loading, setLoading] = useState(true);

  const detectRole = async (sbUser) => {
    if (!sbUser) { setRole('guest'); setLoading(false); return; }
    try {
      const { data } = await sbClient
        .from('admins')
        .select('email')
        .eq('email', sbUser.email)
        .maybeSingle();
      setRole(data ? 'admin' : 'student');
    } catch {
      setRole('student');
    }
    setLoading(false);
  };

  useEffect(() => {
    /* Check existing session on mount */
    sbClient.auth.getSession().then(({ data: { session } }) => {
      const sbUser = session?.user || null;
      setUser(sbUser);
      detectRole(sbUser);
    });

    /* Listen to auth state changes */
    const { data: { subscription } } = sbClient.auth.onAuthStateChange((_event, session) => {
      const sbUser = session?.user || null;
      setUser(sbUser);
      detectRole(sbUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = () =>
    sbClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href.split('#')[0] },
    });

  const logout = () => sbClient.auth.signOut();

  return { user, role, loading, loginWithGoogle, logout };
}

window.useAuth = useAuth;
