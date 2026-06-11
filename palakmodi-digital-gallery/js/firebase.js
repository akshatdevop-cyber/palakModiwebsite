import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWtdwBa6PQa5utRgccEFcdOVhHD9gK2uU",
    authDomain: "systempalak-36177.firebaseapp.com",
    databaseURL: "https://systempalak-36177-default-rtdb.firebaseio.com",
    projectId: "systempalak-36177"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PATH = "systemView_v2";
const seen = new Set();

export function sendContribution(dataURL) {
    if (!dataURL) return;

    console.log("Attempting to push to Firebase RTDB. Data size:", dataURL.length, "bytes");

    // Do not add to `seen` here, so the local listener catches it and renders it.
    push(ref(db, PATH), { data: dataURL })
        .then(() => {
            console.log("Firebase Push Success!");
        })
        .catch(err => {
            console.error("Firebase Push Failed:", err);
            alert("Firebase Upload Rejected! Check your Realtime Database Rules. Error: " + err.message);
        });
}

export function listenContributions(cb) {
    console.log("Listening for Firebase contributions on:", PATH);
    onChildAdded(ref(db, PATH), snap => {
        const v = snap.val();
        console.log("onChildAdded fired! Payload size:", v?.data ? v.data.length : 0);

        if (v?.data && !seen.has(v.data)) {
            console.log("New valid contribution detected. Rendering to System View!");
            seen.add(v.data);
            cb(v.data, false);
        } else {
            console.warn("Skipping rendering. Data empty or already marked as seen.");
        }
    }, (error) => {
        console.error("Firebase Listen Error:", error);
    });
}