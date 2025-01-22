// Firebase Modules
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqYtQAxeSDqaXdReUFdP2goqHfgTj0sNM",
  authDomain: "mokesellfed.firebaseapp.com",
  projectId: "mokesellfed",
  storageBucket: "mokesellfed.firebasestorage.app",
  messagingSenderId: "165673734048",
  appId: "1:165673734048:web:5e8c69745ebaefcc47dec5",
  measurementId: "G-EMD85073YC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Page-Specific Functionality
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.id;

  if (currentPage === "login") {
    // Login page functionality
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("User logged in:", userCredential.user);
          window.location.href = "home.html";
        } catch (error) {
          alert("Error: " + error.message);
        }
      });
    }
  } else if (currentPage === "signup") {
    const signupForm = document.getElementById("signupForm");
    const nextBtn = document.getElementById("next-btn");
    const uploadSection = document.getElementById("upload-section");
    const submitBtn = document.getElementById("submit-form");
    const skipUploadBtn = document.getElementById("skip-upload");

    let userData = {};

    nextBtn.addEventListener("click", () => {
      // Gather form data
      userData.username = document.getElementById("signup-username").value;
      userData.email = document.getElementById("signup-email").value;
      userData.password = document.getElementById("signup-password").value;
      userData.confirmPassword = document.getElementById("signup-confirm-password").value;
      userData.phoneNumber = document.getElementById("country-code").value + document.getElementById("local-number").value;

      // Validate password match
      if (userData.password !== userData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      // Hide initial form and show profile picture upload section
      signupForm.style.display = "none";
      uploadSection.style.display = "block";
    });

    submitBtn.addEventListener("click", async () => {
      const { username, email, password, phoneNumber } = userData;

      // Create user in Firebase Authentication
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          createdAt: new Date().toISOString()
        });

        // Handle profile picture upload (if any)
        const profilePic = document.getElementById("profile-picture").files[0];
        if (profilePic) {
          const storageRef = firebase.storage().ref();
          const picRef = storageRef.child(`profile_pictures/${user.uid}`);
          await picRef.put(profilePic);
          const picUrl = await picRef.getDownloadURL();

          await setDoc(doc(db, "users", user.uid), { profilePicture: picUrl }, { merge: true });
        }

        alert("Sign-up successful!");
        window.location.href = "home.html";
      } catch (error) {
        alert("Error: " + error.message);
      }
    });

    skipUploadBtn.addEventListener("click", () => {
      // Skip profile picture upload and proceed to submit
      submitBtn.click();
    });
  } else if (currentPage === "home") {
    // Home page functionality
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Welcome back:", user.email);
      } else {
        console.log("No user logged in");
        window.location.href = "index.html";
      }
    });
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        try {
          await signOut(auth);
          window.location.href = "index.html";
        } catch (error) {
          alert(error.message);
        }
      });
    }
  } else if (currentPage === "listings") {
    // Listings page functionality
    const container = document.getElementById("listing-container");
    if (container) {
      fetchListings();
    }
  }
});

// Fetch listings function (used on the listings page)
async function fetchListings() {
  const API_URL = "https://api.example.com/listings";
  try {
    const response = await fetch(API_URL);
    const listings = await response.json();
    displayListings(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}

function displayListings(listings) {
  const container = document.getElementById("listing-container");
  container.innerHTML = ""; // Clear previous listings

  listings.forEach((listing) => {
    const listingDiv = document.createElement("div");
    listingDiv.className = "listing";
    listingDiv.innerHTML = `
      <h3>${listing.title}</h3>
      <img src="${listing.image}" alt="${listing.title}">
      <p>Category: ${listing.category}</p>
      <p>Price: $${listing.price}</p>
      <p>Description: ${listing.description}</p>
      <p>Condition: ${listing.condition}</p>
      <button onclick="contactSeller('${listing.sellerId}')">Contact Seller</button>
    `;
    container.appendChild(listingDiv);
  });
}

function contactSeller(sellerId) {
  alert(`Contacting seller with ID: ${sellerId}`);
}
