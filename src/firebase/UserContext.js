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
                try {
                    // Create a reference to the file
                    const fileRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`);
                    
                    // Create file metadata including the content type
                    const metadata = {
                        contentType: avatarFile.type,
                        // Remove customMetadata to simplify the upload
                    };
                    
                    // Upload the file and metadata
                    const uploadTask = await uploadBytes(fileRef, avatarFile, metadata);
                    console.log("Upload successful:", uploadTask);
                    
                    // Get download URL
                    const photoURL = await getDownloadURL(uploadTask.ref);
                    console.log("Download URL obtained:", photoURL);
                    
                    updates.photoURL = photoURL;
                } catch (uploadError) {
                    console.error("Error during file upload:", uploadError);
                    throw new Error(`File upload failed: ${uploadError.message}`);
                }
            }
    
            // Update display name if changed
            if (displayName !== user.displayName) {
                updates.displayName = displayName;
            }
    
            // Update profile in Firebase Auth
            if (Object.keys(updates).length > 0) {
                try {
                    console.log("Updating profile with:", updates);
                    await updateProfile(auth.currentUser, updates);
                } catch (profileError) {
                    console.error("Error updating profile:", profileError);
                    throw new Error(`Profile update failed: ${profileError.message}`);
                }
            }
    
            // Update email if changed
            if (email !== user.email) {
                try {
                    await updateEmail(auth.currentUser, email);
                } catch (emailError) {
                    console.error("Error updating email:", emailError);
                    throw new Error(`Email update failed: ${emailError.message}`);
                }
            }
    
            // Store additional user data in Realtime Database
            try {
                const userRef = firebaseDb.database().ref(`users/${user.uid}/profile`);
                await userRef.update({
                    displayName,
                    email,
                    photoURL: updates.photoURL || user.photoURL,
                    lastUpdated: new Date().toISOString()
                });
            } catch (dbError) {
                console.error("Error updating database:", dbError);
                throw new Error(`Database update failed: ${dbError.message}`);
            }
    
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
