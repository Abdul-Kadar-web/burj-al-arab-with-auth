import React, { useContext } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { UserContext } from '../../App'
import { useHistory, useLocation } from 'react-router';
import { useState } from 'react';


const Login = () => {
    const [loggedInUser, setLoggedInUser] = useContext(UserContext);
    const [newUser, setNewUser] = useState(false)
    const [user, setUser] = useState({
        isSignedIn: false,
        name: '',
        email: '',
        password: '',
        photo: ''
    })

    const history = useHistory();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: "/" } };

    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }

    const handleGoogleSignIn = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
            .signInWithPopup(provider)
            .then((result) => {
                const { displayName, email } = result.user;
                const signedInUser = { name: displayName, email }
                setLoggedInUser(signedInUser);
                storeAuthToken();
                // console.log(signedInUser)

            }).catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.error(errorMessage)
                var email = error.email;
                var credential = error.credential;
            });
    }


    const handleFbSignIn = () => {
        const fbProvider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithPopup(fbProvider)
            .then((result) => {
                var credential = result.credential;
                const { displayName, email } = result.user;
                const signedInUser = { name: displayName, email }
                setLoggedInUser(signedInUser)
                history.replace(from)
                console.log('fb user after sign in', signedInUser)
                var accessToken = credential.accessToken;
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorMessage)
                var email = error.email;
                var credential = error.credential;
            });
    }


    const handleGithubSignIn = () => {
        const ghProvider = new firebase.auth.GithubAuthProvider();
        firebase
            .auth()
            .signInWithPopup(ghProvider)
            .then((result) => {
                // var credential = result.credential;
                // var token = credential.accessToken;
                // var user = result.user;
                // setLoggedInUser(user)
                const { displayName, email } = result.user;
                const signedInUser = { name: displayName, email }
                setLoggedInUser(signedInUser)
                history.replace(from)
                console.log('gh User', user)
                setUser(user);
            }).catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                var credential = error.credential;
                console.log(errorMessage, errorCode, errorMessage, email, credential)
            });
    }


    const handleBlur = (event) => {
        let isFieldValid = true;
        if (event.target.name === 'email') {
            isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
        }
        if (event.target.name === 'password') {
            const isPasswordValid = event.target.value.length > 6;
            const passwordHasNumber = /\d{1}/.test(event.target.value);
            isFieldValid = isPasswordValid && passwordHasNumber
        }
        if (isFieldValid) {
            // new item add kora
            // [...cart, newItem]
            const newUserInfo = { ...user };
            newUserInfo[event.target.name] = event.target.value;
            setUser(newUserInfo)
        }
    }

    const handleSubmit = (event) => {
        // console.log(user.email, user.password)
        if (newUser && user.email && user.password) {
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then(userCredential => {
                    const newUserInfo = { ...user };
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo)
                    updateUserName(user.name);
                    history.replace(from)
                })
                .catch((error) => {
                    // var errorCode = error.code;
                    // var errorMessage = error.message;
                    const newUserInfo = { ...user };
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                });

        }

        if (!newUser && user.email && user.password) {
            firebase.auth().signInWithEmailAndPassword(user.email, user.password)
                .then(userCredential => {
                    const newUserInfo = { ...user };
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo)
                    history.replace(from)
                    // Signed in

                    console.log('sign in user info', userCredential.user)

                    // ...
                })
                .catch((error) => {
                    // var errorCode = error.code;
                    // var errorMessage = error.message;
                    const newUserInfo = { ...user };
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                });
        }

        event.preventDefault();
    }

    const updateUserName = name => {
        const user = firebase.auth().currentUser;

        user.updateProfile({
            displayName: name
        }).then(function () {
            console.log('updated name')
        }).catch(function (error) {
            console.log(error)
        });
    }

    const storeAuthToken = () => {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
            // console.log(idToken)
            sessionStorage.setItem('token', idToken);
            history.replace(from)
          }).catch(function(error) {
            // Handle error
          });
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>This is Login</h1>
            <button onClick={handleGoogleSignIn}>Google Sign In</button>
            <br />
            <button onClick={handleFbSignIn}>Fb Sign In</button>
            <br />
            <button onClick={handleGithubSignIn}>Sign in using github</button>
            <br />
            <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
            <label htmlFor="newUser">New User Sign UP</label>
            <form onSubmit={handleSubmit}>
                {newUser && <input name="name" onBlur={handleBlur} type="text" placeholder="Your name" />}
                <br />
                <input type="text" name="email" onBlur={handleBlur} placeholder="Your Email Address" required />
                <br />
                <input type="password" onBlur={handleBlur} name="password" placeholder="Your password" required />
                <br />
                <input type="submit" value={newUser ? 'Sign Up' : 'Sign in'} />
            </form>
            <p style={{ color: 'red' }}>{user.error}</p>
            {
                user.success && <p style={{ color: 'green' }}>User {newUser ? 'created' : 'Logged In'} successfully</p>
            }
        </div>
    );
};

export default Login;