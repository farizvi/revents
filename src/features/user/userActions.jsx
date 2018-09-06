import moment from 'moment';
import cuid from 'cuid';
import { toastr } from 'react-redux-toastr'
import { getFirebase } from 'react-redux-firebase';
import { asyncActionStart, asyncActionFinish, asyncActionError } from '../async/asyncActions';

export const updateProfile = (user) =>
    async (dispatch, getState, { getFirebase }) => {
        const firebase = getFirebase();
        const { isLoaded, isEmpty, ...updatedUser } = user;
        if (updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
            updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
        }

        try {
            await firebase.updateProfile(updatedUser);
            toastr.success('Success', 'Profile updated');
        } catch (error) {
            console.log(error);
        }
    }

export const uploadProfileImage = (file, fileName) =>
    async (dispatch, getState, { getFirebase, getFirestore }) => {
        const imageName = cuid();
        const firebase = getFirebase();
        const firestore = getFirestore();
        const user = firebase.auth().currentUser;
        const path = `${user.uid}/user_images`;
        const options = {
            name: imageName
        };

        try {
            dispatch(asyncActionStart());
            // upload the file to firebase storage
            let uploadedFile = await firebase.uploadFile(path, file, null, options);

            // get url of image
            let downloadURL = await uploadedFile.uploadTaskSnapshot.downloadURL;
            // get userdoc from firestore
            let userDoc = await firestore.get(`users/${user.uid}`);

            // check if user has photo, if not then update profile with new image
            if (!userDoc.data().photoURL) {
                await firebase.updateProfile({
                    photoURL: downloadURL
                });
                await user.updateProfile({
                    photoURL: downloadURL
                });
            }

            // add the new photo as new image to photos collection
            await firestore.add({
                collection: 'users',
                doc: user.uid,
                subcollections: [{ collection: 'photos' }]
            }, {
                name: imageName,
                url: downloadURL
            })
            dispatch(asyncActionFinish());
        } catch (error) {
            console.log(error);
            dispatch(asyncActionError());
            throw new Error('Problem uploading photos');
        }
    }

export const deletePhoto = photo => 
    async (dispatch, getState, { getFirebase, getFirestore }) => {
        const firebase = getFirebase();
        const firestore = getFirestore();
        const user = firebase.auth().currentUser;
        try {
            await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`);
            await firestore.delete({
                collection: 'users',
                doc: user.uid,
                subcollections: [{ collection: 'photos', doc: photo.id }]
            });
        } catch (error) {
            console.log(error);
            throw new Error('Problem deleting the photo');
        }
    }

export const setMainPhoto = photo =>
    async (dispatch, getState) => {
        // dispatch(asyncActionStart());
        // const firestore = firebase.firestore();
        // const user = firebase.auth().currentUser;
        // const today = new Date(Date.now());
        // let userDocRef = firestore.collection('users').doc(user.uid);
        // let eventAttendeeRef = firestore.collection('event_attendee');
        // try {
        //     let batch = firestore.batch();

        //     await batch.update(userDocRef, {
        //         photoURL: photo.url
        //     });

        //     let eventQuery = await eventAttendeeRef
        //         .where('userUid', '==', user.uid)
        //         .where('eventDate', '>', today);

        //     let eventQuerySnap = await eventQuery.get();

        //     for (let i = 0; i < eventQuerySnap.docs.length; i++) {
        //         let eventDocRef = await firestore
        //             .collection('events')
        //             .doc(eventQuerySnap.docs[i].data().eventId);

        //         let event = await eventDocRef.get();

        //         if (event.data().hostUid === user.uid) {
        //             batch.update(eventDocRef, {
        //                 hostPhotoURL: photo.url,
        //                 [`attendees.${user.uid}.photoURL`]: photo.url
        //             })
        //         } else {
        //             batch.update(eventDocRef, {
        //                 [`attendees.${user.uid}.photoURL`]: photo.url
        //             })
        //         }
        //     }
        //     console.log(batch);
        //     await batch.commit();
        //     dispatch(asyncActionFinish())
        // } catch (error) {
        //     console.log(error);
        //     dispatch(asyncActionError())
        //     throw new Error('Problem setting main photo');
        // }
        const firebase = getFirebase();
        try {
            return await firebase.updateProfile({
                photoURL: photo.url
            })
        } catch (error) {
            throw new Error('Problem setting main photo');
        }
    };

    export const goingToEvent = (event) => 
        async (dispatch, getState, {getFirestore}) => {
            const firestore = getFirestore();
            const user = firestore.auth().currentUser;
            const photoURL = getState().firebase.profile.photoURL;
            const attendee = {
                going: true,
                joinDate: Date.now(),
                photoURL: photoURL || '/assets/user.png',
                displayName: user.displayName,
                host: false
            };

            try {
                await firestore.update(`events/${event.id}`, {
                    [`attendees.${user.uid}`]: attendee
                });
                await firestore.set(`event_attendee/${event.id}_${user.uid}`, {
                    eventId: event.id,
                    userUid: user.uid,
                    eventDate: event.date,
                    host: false
                });
                toastr.success('Success', 'You have signed up to the event');
            } catch (error) {
                console.log(error);
                toastr.error('Oops', 'Problem signing up to event')
            }
        }
    
    export const cancelGoingToEvent = (event) => 
        async (dispatch, getState, {getFirestore}) => {
            const firestore = getFirestore();
            const user = firestore.auth().currentUser;

            try {
                await firestore.update(`events/${event.id}`, {
                    [`attendees.${user.uid}`]: firestore.FieldValue.delete() // delete an individual field in firestore (instead of deleting whole document)
                })
                await firestore.delete(`event_attendee/${event.id}_${user.uid}`);
                toastr.success('Success', 'You have removed yourself from the event');
            } catch (error) {
                console.log(error);
                toastr.error('Oops', 'Something went wrong')
            }
        }