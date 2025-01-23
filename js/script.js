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
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
          // Get the user by username (you'll need to fetch the email linked with the username)
          const userDoc = await getDoc(doc(db, "users", username));  // Assuming the username is stored in Firestore
          
          if (userDoc.exists()) {
            const email = userDoc.data().email;
            
            // Sign in using email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCredential.user);
            window.location.href = "home.html";
          } else {
            alert("Username not found");
          }
        } catch (error) {
          alert("Error: " + error.message);
        }
      });
    }
  } else if (currentPage === "signup") {
    // Load country codes
    loadCountryCodes();
    async function loadCountryCodes() {
      try {
        const response = await fetch('../data/country_codes.csv');
        const data = await response.text();
        const countryCodes = parseCSV(data);
    
        const countryCodeSelect = document.getElementById("country-code");
        countryCodes.forEach(country => {
          const option = document.createElement("option");
          option.value = country.code;
          option.textContent = `${country.country} (${country.code})`;
          option.dataset.length = country.length;
          countryCodeSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Error loading country codes:", error);
      }
    }
    function parseCSV(data) {
      const lines = data.split('\n');
      const result = [];
      const headers = lines[0].split(',');
  
      for (let i = 1; i < lines.length; i++) {
          const obj = {};
          const currentline = lines[i].split(',');
  
          for (let j = 0; j < headers.length; j++) {
              obj[headers[j].trim()] = currentline[j].trim();
          }
          result.push(obj);
      }
      return result;
    }
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
      userData.dob = document.getElementById("signup-dob").value;
      userData.phoneNumber = document.getElementById("country-code").value + document.getElementById("local-number").value;
    
      // Validate username
      if (!userData.username) {
        document.getElementById("signup-username").classList.add("invalid");
        alert("Username is required.");
        return;
      } else {
        document.getElementById("signup-username").classList.remove("invalid");
      }
    
      // Validate email
      if (!userData.email) {
        document.getElementById("signup-email").classList.add("invalid");
        alert("Email is required.");
        return;
      } else {
        document.getElementById("signup-email").classList.remove("invalid");
      }
    
      // Validate password
      if (!userData.password) {
        document.getElementById("signup-password").classList.add("invalid");
        alert("Password is required.");
        return;
      } else {
        document.getElementById("signup-password").classList.remove("invalid");
      }
    
      // Validate confirm password
      if (userData.password !== userData.confirmPassword) {
        document.getElementById("signup-confirm-password").classList.add("invalid");
        alert("Passwords do not match.");
        return;
      } else {
        document.getElementById("signup-confirm-password").classList.remove("invalid");
      }
    
      // Validate DOB
      if (!userData.dob) {
        document.getElementById("signup-dob").classList.add("invalid");
        alert("Date of birth is required.");
        return;
      } else {
        let dob = new Date(userData.dob);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDifference = today.getMonth() - dob.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 18) {
          document.getElementById("signup-dob").classList.add("invalid");
          alert("You must be at least 18 years old.");
          return;
        } else {
          document.getElementById("signup-dob").classList.remove("invalid");
        }
      }

      // Validate phone number
      const localNumber = document.getElementById("local-number").value;
      const selectedCountry = document.getElementById("country-code").selectedOptions[0];
      const requiredLength = selectedCountry.dataset.length;

      console.log("Selected Country:", selectedCountry);
      console.log("Required Length:", requiredLength);

      if (!userData.phoneNumber || !localNumber || localNumber.length != requiredLength) {
        document.getElementById("country-code").classList.add("invalid");
        document.getElementById("local-number").classList.add("invalid");
        alert(`A valid phone number is required. It should be ${requiredLength} digits long.`);
        return;
      } else {
        document.getElementById("country-code").classList.remove("invalid");
        document.getElementById("local-number").classList.remove("invalid");
      }
    
      // Hide initial form and show profile picture upload section
      signupForm.style.display = "none";
      uploadSection.style.display = "block";
    });
    
    backBtn.addEventListener("click", () => {
      // Show initial form and hide profile picture upload section
      signupForm.style.display = "block";
      uploadSection.style.display = "none";
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
          dob: userData.dob,
          createdAt: new Date().toISOString()
        });
    
        // Handle profile picture upload (if any)
        const profilePic = document.getElementById("profile-picture").files[0];
        if (profilePic) {
          const storageRef = firebase.storage().ref();
          const picRef = storageRef.child(`profile_pictures/${user.uid}`);
          await picRef.put(profilePic);
          const picUrl = await picRef.getDownloadURL();
        }
        // Redirect to home.html after successful signup
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
