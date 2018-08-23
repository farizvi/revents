import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA1ELkVjqaNkT3W7qJRmy8tN35lWj0Nx8g",
    authDomain: "revents-f5420.firebaseapp.com",
    databaseURL: "https://revents-f5420.firebaseio.com",
    projectId: "revents-f5420",
    storageBucket: "revents-f5420.appspot.com",
    messagingSenderId: "896164507915"

}

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const settings = {
    timestampsInSnapshots: true
}
firestore.settings(settings);

export default firebase;