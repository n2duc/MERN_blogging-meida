import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDLW_AgWaqe3rm6-zTdrOuT0qNsZ4bO1ac",
    authDomain: "blog-mern-app-70a2c.firebaseapp.com",
    projectId: "blog-mern-app-70a2c",
    storageBucket: "blog-mern-app-70a2c.appspot.com",
    messagingSenderId: "204644939453",
    appId: "1:204644939453:web:690f8cb3a93a69c851a9d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const authWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    let user = null;
    try {
        const result = await signInWithPopup(auth, provider)
        user = result.user;
    } catch (error) {
        console.log(error.message);
    }

    return user;
}