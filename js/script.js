// Firebase Modules
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, query, where, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dqnoqh0hi"; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Replace with your Cloudinary upload preset

// Function to upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};


// Page-Specific Functionality
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.id; // Assumes body has an id like "login" or "signup"

  if (currentPage === "login") {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
          // Query Firestore for the user based on username
          const querySnapshot = await getDocs(query(collection(db, "users"), where("username", "==", username)));
    
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]; // Get the first document matching the username
            const userId = userDoc.id; // Get the user ID from the document ID
            const email = userDoc.data().email; // Get the email from the user document
    
            // Sign in with Firebase Authentication using the email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Set a cookie for persistent login (1 month expiry)
            setCookie("userUID", user.uid, 30);
    
            console.log("User logged in:", user);
            window.location.href = "home.html"; // Redirect to home page
          } else {
            alert("Username not found");
          }
        } catch (error) {
          console.error("Error logging in:", error.message);
          alert("Login failed. Please check your credentials and try again.");
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

    function logoutUser() {
      auth.signOut()
        .then(() => {
          clearCookie("userUID");
          alert("You have been logged out.");
          window.location.href = "home.html"; // Redirect to login page
        })
        .catch((error) => {
          console.error("Error logging out:", error.message);
        });
    }

    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        try {
          await signOut(auth);
          logoutUser();
          window.location.href = "index.html";
        } catch (error) {
          alert(error.message);
        }
      });
    }
  } else if (currentPage === "listings") {
    const listingsContainer = document.querySelector(".listings-container");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");

    // Fetch Listings from Firestore
  async function fetchListings(queryString = "") {
    try {
      let listingsQuery = collection(db, "listings");

      // If there is a search query, filter results
      if (queryString) {
        listingsQuery = query(
          listingsQuery,
          where("title", ">=", queryString),
          where("title", "<=", queryString + "\uf8ff") // Firestore supports range queries
        );
      }

      const querySnapshot = await getDocs(listingsQuery);
      renderListings(querySnapshot);
    } catch (error) {
      console.error("Error fetching listings:", error);
      alert("Failed to fetch listings. Please try again.");
    }
  }

  // Render Listings
  function renderListings(querySnapshot) {
    const listingsContainer = document.querySelector(".listings-container");
    listingsContainer.innerHTML = ""; // Clear existing content

    if (querySnapshot.empty) {
      listingsContainer.innerHTML = "<p>No listings found.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const listing = doc.data();
      const listingCard = document.createElement("div");
      listingCard.classList.add("listing-card");

      listingCard.innerHTML = `
        <div class="listing-image">
          <img src="${listing.imageUrl}" alt="${listing.title}">
        </div>
        <div class="listing-details">
          <h2>${listing.title}</h2>
          <p>${listing.description}</p>
          <p><strong>Price:</strong> £${listing.price.toFixed(2)}</p>
          <p><strong>Condition:</strong> ${listing.condition}</p>
        </div>
      `;

      listingsContainer.appendChild(listingCard);
    });
  }

  // Search Button Event Listener
  document.getElementById("search-btn").addEventListener("click", () => {
    const queryString = document.getElementById("search-input").value.trim();
    fetchListings(queryString);
  });

  // Initial Fetch
  fetchListings(); // Fetch all listings by default
    document.getElementById("search-btn").addEventListener("click", async () => {
      const searchQuery = document.getElementById("search-input").value.toLowerCase();
      const listingsContainer = document.querySelector(".listings-container");
      listingsContainer.innerHTML = "";
      try {
        const querySnapshot = await db.collection("listings").get();
        querySnapshot.forEach((doc) => {
          const listing = doc.data();
          if (listing.title.toLowerCase().includes(searchQuery)) {
            const listingCard = `
              <div class="listing-card">
                <img src="${listing.imageURL}" alt="${listing.title}">
                <h2>${listing.title}</h2>
                <p>${listing.description}</p>
                <p>Price: £${listing.price}</p>
              </div>
            `;
            listingsContainer.innerHTML += listingCard;
          }
        });
      } catch (error) {
        console.error("Error searching listings: ", error);
      }
      });
  }else if (currentPage === "upload") {
    // Handle the form submission for uploading items
    const uploadForm = document.getElementById("upload-form");
  
    if (uploadForm) {
      uploadForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload
  
        // Get form values
        const title = document.getElementById("title").value;
        const category = document.getElementById("category").value;
        const price = parseFloat(document.getElementById("price").value);
        const description = document.getElementById("description").value;
        const condition = document.getElementById("condition").value;
        const imageInput = document.getElementById("image");
  
        let imageUrl = ""; // Default to an empty string if no image is uploaded
  
        // Check if an image file was uploaded
        if (imageInput.files.length > 0) {
          const imageFile = imageInput.files[0];
  
          try {
            // 1. Upload the image to Cloudinary
            imageUrl = await uploadImageToCloudinary(imageFile);
  
            // Apply Cloudinary template (e.g., resize to 500x500)
            imageUrl = imageUrl.replace(
              "/upload/",
              "/upload/w_500,h_500,c_fill/" // Cloudinary transformation parameters
            );
          } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            alert("Failed to upload image. Please try again.");
            return;
          }
        } else {
          // Use a placeholder image URL if no image is uploaded
          imageUrl = "https://via.placeholder.com/500"; // Placeholder image URL
        }
  
        try {
          // 2. Save listing to Firestore
          const docRef = await addDoc(collection(db, "listings"), {
            title,
            category,
            price,
            description,
            condition,
            imageUrl,
            createdAt: new Date().toISOString(),
          });
  
          console.log("Listing added with ID:", docRef.id);
          alert("Item uploaded successfully!");
          uploadForm.reset(); // Clear the form
          document.getElementById("image-preview").style.display = "none"; // Hide preview
        } catch (error) {
          console.error("Error uploading item:", error);
          alert("Failed to upload item. Please try again.");
        }
      });
    }
  }
});

// Logout functionality
function logoutUser() {
  auth.signOut()
    .then(() => {
      clearCookie("userUID");
      alert("You have been logged out.");
      window.location.href = "login"; // Redirect to login page
    })
    .catch((error) => {
      console.error("Error logging out:", error.message);
    });
}

// Helper function to set a cookie
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
}

// Helper function to clear cookies
function clearCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}


// function getCookie(name) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(";").shift();
//   return null;
// }

// window.onload = function () {
//   const userUID = getCookie("userUID");
//   if (!userUID) {
//     alert("You must log in to access this page.");
//     window.location.href = "index.html"; // Redirect to login page
//   }
// };
