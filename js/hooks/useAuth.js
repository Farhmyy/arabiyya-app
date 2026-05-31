/* ==========================================================================
   useAuth — Firebase auth state + admin role detection
   ========================================================================== */

function useAuth() {
  const { useState, useEffect } = React;

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);        // 'admin' | 'student' | 'guest' | null (null = loading)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = fbAuth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole('guest');
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const adminDoc = await fbDb.collection('admins').doc('config').get();
        const adminEmails = adminDoc.exists ? (adminDoc.data().emails || []) : [];
        const isAdmin = adminEmails.includes(firebaseUser.email);
        setRole(isAdmin ? 'admin' : 'student');
      } catch {
        setRole('student');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return fbAuth.signInWithPopup(provider);
  };

  const logout = () => fbAuth.signOut();

  return { user, role, loading, loginWithGoogle, logout };
}

window.useAuth = useAuth;
