import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';


const config = {
    apiKey: "AIzaSyDXf93pMiVHEw86-k9c0WDTLnuxWfNh3YA",
    authDomain: "unitypac-carrier.firebaseapp.com",
    databaseURL: "https://unitypac-carrier.firebaseio.com",
    projectId: "unitypac-carrier",
    storageBucket: "unitypac-carrier.appspot.com",
    messagingSenderId: "577832961489",
    appId: "1:577832961489:web:1891c2b15caae0870f0cf0",
    measurementId: "G-5W94WS7ZPT"
};

class Firebase {
    constructor() {
        firebase.initializeApp(config);

        this.auth = firebase.auth()
        this.db = firebase.firestore();
        this.analytics = firebase.analytics();
    }
    // *** Auth API ***

    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);

    createNewUser = (userData, otherData) => {
        this.db.collection('users').doc(`${userData.user.uid}`).set(
            {
                userType: "Admin",
                ...otherData
            }
        )
    }


}

export default Firebase;