/* Firebase initialization — exposes fbAuth, fbDb, fbStorage globally */

const firebaseConfig = {
  apiKey:             "AIzaSyAQM5G3gar2R5cCAJinCI-qwuViiGcuEvM",
  authDomain:         "arabiyya-app.firebaseapp.com",
  projectId:          "arabiyya-app",
  storageBucket:      "arabiyya-app.firebasestorage.app",
  messagingSenderId:  "748866926030",
  appId:              "1:748866926030:web:3780152e6237756697279f"
};

firebase.initializeApp(firebaseConfig);

window.fbAuth    = firebase.auth();
window.fbDb      = firebase.firestore();
window.fbStorage = firebase.storage();
