"use client"
import { createAuthClient } from "better-auth/react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
  fetchOptions: {
      headers: {
        Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : ""}`,
      },
      onSuccess: (ctx) => {
          const authToken = ctx.response.headers.get("set-auth-token")
          // Store the token securely (e.g., in localStorage)
          if(authToken){
            // Split token at "." and take only the first part
            const tokenPart = authToken.includes('.') ? authToken.split('.')[0] : authToken;
            localStorage.setItem("bearer_token", tokenPart);
          }
      }
  }
});

type SessionData = ReturnType<typeof authClient.useSession>

export function useSession(): SessionData {
   const [session, setSession] = useState<any>(null);
   const [isPending, setIsPending] = useState(true);
   const [isRefetching, setIsRefetching] = useState(false);
   const [error, setError] = useState<any>(null);

   const refetch = () => {
      setIsPending(true);
      setIsRefetching(true);
      setError(null);
      fetchSession().finally(() => setIsRefetching(false));
   };

   const fetchSession = async () => {
      try {
         // Check Firebase auth state first
         const firebaseUser = auth.currentUser;
         if (firebaseUser) {
            // User is logged in with Firebase
            setSession({
               user: {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName,
                  email: firebaseUser.email,
                  image: firebaseUser.photoURL,
               }
            });
            setError(null);
            return;
         }

         // Fallback to better-auth
         const res = await authClient.getSession({
            fetchOptions: {
               auth: {
                  type: "Bearer",
                  token: typeof window !== 'undefined' ? localStorage.getItem("bearer_token") || "" : "",
               },
            },
         });
         setSession(res.data);
         setError(null);
      } catch (err) {
         setSession(null);
         setError(err);
      } finally {
         setIsPending(false);
      }
   };

   useEffect(() => {
      // Listen for Firebase auth state changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
         if (firebaseUser) {
            // User is logged in with Firebase
            setSession({
               user: {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName,
                  email: firebaseUser.email,
                  image: firebaseUser.photoURL,
               }
            });
            setIsPending(false);
         } else {
            // No Firebase user, check better-auth
            fetchSession();
         }
      });

      return () => unsubscribe();
   }, []);

   return { data: session, isPending, isRefetching, error, refetch };
}