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
    // Sign-up page functionality
    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("signup-username").value;
        const email = document.getElementById("signup-email").value;
        const passwordInput = document.getElementById("signup-password");
        const confirmPasswordInput = document.getElementById("signup-confirm-password");
        
        // Ensure password and confirmPassword are both strings
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Validate password match
        if (password !== confirmPassword) {
          alert("Passwords do not match.");
          return;
        }

        // Country code and phone number
        const countryCode = document.getElementById("country-code").value;
        const localNumber = document.getElementById("local-number").value;
        const phoneNumber = `${countryCode}${localNumber}`;

        // Validate phone number length
        const phonePattern = /^[0-9]{6,15}$/;
        const phoneValid = phonePattern.test(localNumber);
        if (!phoneValid) {
          document.getElementById("local-number").style.borderColor = "red";
          alert("Please enter a valid phone number.");
          return;
        } else {
          document.getElementById("local-number").style.borderColor = "green";
        }

        try {
          // Create user in Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Save additional data to Firestore
          await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            phoneNumber: phoneNumber, // Store phone number in E.164 format
            createdAt: new Date().toISOString()
          });

          alert("Sign-up successful!");
          window.location.href = "home.html";
        } catch (error) {
          alert("Error: " + error.message);
        }
      });
    }
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
