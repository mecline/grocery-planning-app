import React, { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { auth, storage, firebaseDb } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const UserContext = createContext({});

export const useUserContext = () => {
    return useContext(UserContext);
};

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (res) => {
            if (res) {
                setUser(res);
            } else {
                setUser(null);
            }
            setError("");
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const registerUser = async (email, password, name) => {
        setLoading(true);
        try {
            // Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update the user profile with display name
            await updateProfile(userCredential.user, {
                displayName: name,
            });

            // Initialize user profile in Realtime Database
            const userRef = firebaseDb.database().ref(`users/${userCredential.user.uid}/profile`);
            await userRef.set({
                displayName: name,
                email: email,
                photoURL: null,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signInUser = (email, password) => {
        setLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .then((res) => console.log(res))
            .catch((err) => setError(err.code))
            .finally(() => setLoading(false));
    };

    const logoutUser = () => {
        signOut(auth);
    };

    const forgotPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const updateUserProfile = async (displayName, email, avatarFile) => {
        setLoading(true);
        try {
            const updates = {};
            
            // Handle avatar upload if provided
            if (avatarFile) {
                // Create a reference to the file
                const fileRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`);
                
                // Create file metadata including the content type
                const metadata = {
                    contentType: avatarFile.type,
                    customMetadata: {
                        'userId': user.uid
                    }
                };
                
                // Upload the file and metadata
                const uploadTask = await uploadBytes(fileRef, avatarFile, metadata);
                const photoURL = await getDownloadURL(uploadTask.ref);
                updates.photoURL = photoURL;
            }

            // Update display name if changed
            if (displayName !== user.displayName) {
                updates.displayName = displayName;
            }

            // Update profile in Firebase Auth
            if (Object.keys(updates).length > 0) {
                await updateProfile(auth.currentUser, updates);
            }

            // Update email if changed
            if (email !== user.email) {
                await updateEmail(auth.currentUser, email);
            }

            // Store additional user data in Realtime Database
            const userRef = firebaseDb.database().ref(`users/${user.uid}/profile`);
            await userRef.set({
                displayName,
                email,
                photoURL: updates.photoURL || user.photoURL,
                lastUpdated: new Date().toISOString()
            });

            // Update local user state
            setUser({ ...auth.currentUser });
            setError("");
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const contextValue = {
        user,
        loading,
        error,
        signInUser,
        registerUser,
        logoutUser,
        forgotPassword,
        updateUserProfile
    };
    return (
        <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
    );
};
