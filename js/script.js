// Firebase Modules
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, query, where, collection, addDoc, serverTimestamp, orderBy, onSnapshot, limit} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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
const CLOUDINARY_CLOUD_NAME = "dqnoqh0hi";
const CLOUDINARY_UPLOAD_PRESET = "MokeSellPreset";

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
    
    if (!response.ok) {
      throw new Error(data.error.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Error Details:", {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
    throw error;
  }
};


// Logout functionality
function logoutUser() {
  const auth = getAuth();

  signOut(auth)
    .then(() => {
      // Clear any user-related cookies or local storage
      clearCookie("userUID");

      // Redirect to the login page or home page
      alert("You have been logged out.");
      window.location.href = "index.html"; // or "login.html"
    })
    .catch((error) => {
      console.error("Error logging out:", error.message);
      alert("Failed to log out. Please try again.");
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

// ===================== Firebase Service =====================
const createFirebaseUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    throw new Error("Account creation failed. Please try different credentials");
  }
};

const saveUserToFirestore = async (user, userData) => {
  try {
    console.log("Saving to Firestore:", {
      uid: user.uid,
      data: userData
    });
    
    await setDoc(doc(db, "users", user.uid), userData);
    
    console.log("Firestore save successful");
    return true;
  } catch (error) {
    console.error("Full Firestore error:", error);
    throw new Error("Failed to save user profile");
  }
};


// Page-Specific Functionality
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.id;

  if (currentPage !== "index") {
    document.addEventListener("DOMContentLoaded", () => {
      const header = document.querySelector('.inner-header');
      let lastScrollTop = 0;
    
      window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
        if (scrollTop > 50) {
          header.classList.add('scrolled'); // Add scrolled class when user scrolls down
        } else {
          header.classList.remove('scrolled'); // Remove scrolled class when at the top
        }
    
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
      });
    });
  }
  const dropbtn = document.querySelector(".dropbtn");
  const dropdownContent = document.querySelector(".dropdown-content");
  // Toggle dropdown when the user icon is clicked
  dropbtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click from bubbling up
    dropdownContent.classList.toggle("show");
  });

  // Hide the dropdown if the user clicks anywhere else
  window.addEventListener("click", () => {
    if (dropdownContent.classList.contains("show")) {
      dropdownContent.classList.remove("show");
    }
  });

  // Optional: Attach logout functionality to the Log Out button
  const logoutButton = document.getElementById("logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      // Call your logout function here
      logoutUser(); // Assuming you already have this defined
    });
  }
  
  const signupLink = document.getElementById("signup-link");
  const loginLink = document.getElementById("login-link");

  // Add logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      logoutUser();
    });
  }

  // Check authentication status and update the header
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in
      console.log("User is logged in:", user.uid);
      if (logoutButton) logoutButton.style.display = "block"; // Show logout button
      if (signupLink) signupLink.style.display = "none"; // Hide signup link
      if (loginLink) loginLink.style.display = "none"; // Hide login link
    } else {
      // User is not logged in
      console.log("User is not logged in.");
      if (logoutButton) logoutButton.style.display = "none"; // Hide logout button
      if (signupLink) signupLink.style.display = "block"; // Show signup link
      if (loginLink) loginLink.style.display = "block"; // Show login link
    }
  });
   if (logoutButton) {
     logoutButton.addEventListener("click", () => {
       logoutUser();
     });
   }
  // ========================== Log In Page ========================== //
  if (currentPage === "login") {
    const auth = getAuth();

    // Check if the user is already logged in
    onAuthStateChanged(auth, (user) => {
      const logoutButton = document.getElementById("logout-btn");
      if (user) {
        // User is logged in, redirect to home.html
        window.location.href = "home.html";
      } else {
        // User is not logged in, hide the logout button
        if (logoutButton) {
          logoutButton.style.display = "none";
        }
        // User is not logged in, show the login form
        const loginForm = document.getElementById("login-form");
        if (loginForm) {
          loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            try {
              // Query Firestore for the user based on username
              const querySnapshot = await getDocs(
                query(collection(db, "users"), where("username", "==", username))
              );

              if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userId = userDoc.id;
                const email = userDoc.data().email;

                // Sign in with Firebase Authentication using the email and password
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Set a cookie for persistent login (1 month expiry)
                setCookie("userUID", user.uid, 30);

                console.log("User logged in:", user);
                window.location.href = "profile.html"; // Redirect to profile page after login
              } else {
                alert("Username not found");
              }
            } catch (error) {
              console.error("Error logging in:", error.message);
              alert("Login failed. Please check your credentials and try again.");
            }
          });
        }
      }
    });
  } 
  // ========================== Sign Up Page ========================== //
  else if (currentPage === "signup") {
    const auth = getAuth();

    // Check if the user is already logged in
    onAuthStateChanged(auth, (user) => {
      if (user && !isSigningUp) {
        // User is logged in and not in the middle of signing up
        console.log("User is already logged in:", user.uid);
        signupForm.style.display = "none"; // Hide the signup form
        window.location.href = "home.html"; // Redirect to home.html
      } else {
        // User is not logged in or is in the middle of signing up
        console.log("User is not logged in. Proceeding with signup.");
        if (logoutButton) {
          logoutButton.style.display = "none"; // Hide the logout button
        }
        loadCountryCodes(); // Load country codes for the signup form
      }
    });

    // Load country codes
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
    let submitHandlerAttached = false;

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
      if (!submitHandlerAttached) {
        submitBtn.addEventListener("click", handleSignupSubmission);
        skipUploadBtn.addEventListener("click", handleSignupSubmission);
        submitHandlerAttached = true;
        console.log("Firebase initialized:", app);
        console.log("Firestore instance:", db); 
      }
    });
    let isSigningUp = false; // Flag to track signup progress
    async function handleSignupSubmission() {
      try {
        isSigningUp = true; // Set flag to true during signup
        console.log("[1] Starting signup process");
        const { username, email, password, phoneNumber, dob } = userData;
        
        console.log("[2] Creating Firebase auth user");
        const user = await createFirebaseUser(email, password);
        console.log("[3] Auth user created:", user.uid);

        let imageUrl = "https://res.cloudinary.com/dqnoqh0hi/image/upload/cld-sample-5";
        const imageInput = document.getElementById("profile-picture");
        
        if (imageInput.files.length > 0) {
          try {
            console.log("[4] Attempting image upload");
            imageUrl = await uploadImageToCloudinary(imageInput.files[0]);
            console.log("[5] Image upload successful:", imageUrl);
          } catch (error) {
            console.log("[6] Using default image due to error:", error.message);
          }
        }

        console.log("[7] Preparing Firestore data:", {
          username,
          email,
          phoneNumber,
          dob,
          profilePicture: imageUrl,
          createdAt: serverTimestamp()
        });

        // Save user data to Firestore
        await saveUserToFirestore(user, {
          username,
          email,
          phoneNumber,
          dob: new Date(userData.dob).toISOString(),
          profilePicture: imageUrl,
          createdAt: serverTimestamp()
        });

        console.log("[8] Firestore save successful. Redirecting to profile.");
        window.location.href = "profile.html"; // Redirect after Firestore save
      } catch (error) {
        console.error("[ERROR] Signup failed:", error);
        alert(`Error: ${error.message}`);
        
        if (auth.currentUser) {
          try {
            console.log("Attempting user cleanup");
            await auth.currentUser.delete();
          } catch (deleteError) {
            console.error("Cleanup failed:", deleteError);
          }
        }
      } finally {
        isSigningUp = false; // Reset flag after signup
      }
    }
  } 
  // ========================== Listings Page ========================== //
  else if (currentPage === "listings") {
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
            where("title", "<=", queryString + "\uf8ff")
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
    async function renderListings(querySnapshot) {
      const recentListingsContainer = document.getElementById("recent-listings");
      const wholesaleListingsContainer = document.getElementById("wholesale-listings");
    
      recentListingsContainer.innerHTML = "";
      wholesaleListingsContainer.innerHTML = "";
    
      // Map over all documents and render listings.
      const renderPromises = querySnapshot.docs.map(async (docSnap) => {
        const listing = docSnap.data();
        const listingId = docSnap.id;
    
        // Fetch seller details.
        const userDoc = await getDoc(doc(db, "users", listing.userId));
        let sellerInfo = `<p>Unknown Seller</p>`;
        if (userDoc.exists()) {
          const userData = userDoc.data();
          sellerInfo = `
            <div class="seller-info">
              <img src="${userData.profilePicture}" alt="${userData.username}" class="seller-image">
              <span>${userData.username}</span>
            </div>
          `;
        }
    
        // Determine price display.
        let priceDisplay = "";
        if (listing.listingType === "post") {
          priceDisplay = `Price: $${listing.price.toFixed(2)}`;
        } else if (listing.listingType === "wholesale" && listing.pricingOptions.length > 0) {
          const minPrice = Math.min(...listing.pricingOptions.map(opt => opt.price));
          priceDisplay = `Starting from: $${minPrice.toFixed(2)} per unit`;
        }
    
        // Build the action section only for wholesale listings.
        let actionSection = "";
        if (listing.listingType === "wholesale") {
          let optionsHtml = listing.pricingOptions.map(option =>
            `<option value="${option.quantity}-${option.price}">${option.quantity} units @ £${option.price.toFixed(2)} each</option>`
          ).join("");
    
          actionSection = `
            <label for="quantity-select-${listingId}">Select Quantity:</label>
            <select id="quantity-select-${listingId}">
              ${optionsHtml}
            </select>
            <button class="add-to-cart" data-id="${listingId}">Add to Cart</button>
          `;
        }
    
        // Create the listing card.
        const listingElement = document.createElement("div");
        listingElement.classList.add("listing-card");
        listingElement.innerHTML = `
          <div class="listing-page-container">
            ${sellerInfo}
            <a href="listing-details.html?id=${listingId}">
              <img src="${listing.imageUrl}" alt="${listing.title}">
            </a>
            <h3>${listing.title}</h3>
            <p>${priceDisplay}</p>
            <p>Condition: ${listing.condition}</p>
            ${actionSection}
          </div>
        `;
    
        // Append wholesale listings only to the wholesale container.
        if (listing.listingType === "wholesale") {
          wholesaleListingsContainer.appendChild(listingElement);
        }
        // Append a clone to the recent listings container.
        recentListingsContainer.appendChild(listingElement.cloneNode(true));
      });
    
      // Wait for all listings to be rendered.
      await Promise.all(renderPromises);
    
      // Now attach event listeners to the "Add to Cart" buttons inside the wholesale container.
      wholesaleListingsContainer.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", (event) => {
          const listingId = event.target.dataset.id;
          // Use the select element from the wholesale container.
          const select = wholesaleListingsContainer.querySelector(`#quantity-select-${listingId}`);
          if (!select) {
            console.error("Select element not found for listingId:", listingId);
            return;
          }
          const [quantity, price] = select.value.split("-").map(Number);
          console.log(`Adding to cart: listingId=${listingId}, quantity=${quantity}, price=${price}`);
          addToCart(listingId, quantity, price);
        });
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
      async function addToCart(listingId, quantity, price) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to add items to cart.");
          return;
        }
      
        try {
          console.log("Attempting to add to cart:", { listingId, quantity, price });
          await addDoc(collection(db, "carts", user.uid, "items"), {
            listingId,
            quantity,
            pricePerUnit: price,
            totalPrice: quantity * price,
            timestamp: serverTimestamp()
          });
          alert(`Added ${quantity} units to cart at £${price.toFixed(2)} per unit.`);
        } catch (error) {
          console.error("Error adding to cart:", error);
          alert("Failed to add item to cart. Please try again.");
        }
      }
      
  }
  // ========================== Upload Page ========================== //
  else if (currentPage === "upload") {
    const auth = getAuth();
    let currentUser = null; // To store the authenticated user
  
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "index.html";
      } else {
        currentUser = user; // Store the logged-in user
      }
    });
  
    // Handle the form submission for uploading items
    const uploadForm = document.getElementById("upload-form");
  
    if (uploadForm) {
      uploadForm.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        
        if (!currentUser) {
          alert("You must be logged in to upload items.");
          return;
        }
  
        // Get form values
        const title = document.getElementById("title").value;
        const category = document.getElementById("category").value;
        const price = parseFloat(document.getElementById("price").value);
        const description = document.getElementById("description").value;
        const condition = document.getElementById("condition").value;
        const imageInput = document.getElementById("image");
        const listingType = document.getElementById("listing-type").value; 
        let pricingOptions = [];
        if (listingType === "wholesale") {
            document.querySelectorAll(".option-entry").forEach(entry => {
                const quantity = parseInt(entry.querySelector(".option-quantity").value);
                const price = parseFloat(entry.querySelector(".option-price").value);
                if (!isNaN(quantity) && !isNaN(price)) {
                    pricingOptions.push({ quantity, price });
                }
            });
        } else {
            pricingOptions.push({ quantity: 1, price: parseFloat(document.getElementById("price").value) });
        }

      let imageUrl = "";
  
        // Check if an image file was uploaded
        if (imageInput.files.length > 0) {
          const imageFile = imageInput.files[0];
          try {
            imageUrl = await uploadImageToCloudinary(imageFile);
            imageUrl = imageUrl.replace("/upload/", "/upload/w_500,h_500,c_fill/");
          } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
            return;
          }
        } else {
          imageUrl = `https://res.cloudinary.com/dqnoqh0hi/image/upload/cld-sample-5`;
        }
  
        try {
          // Save listing with user ID
          const docRef = await addDoc(collection(db, "listings"), {
            title,
            category,
            price,
            description,
            condition,
            imageUrl,
            listingType,
            pricingOptions,
            userId: currentUser.uid, // Add user ID to the listing
            createdAt: serverTimestamp(), // Use server timestamp
          });
  
          console.log("Listing added with ID:", docRef.id);
          alert("Item uploaded successfully!");
          uploadForm.reset();
          document.getElementById("image-preview").style.display = "none";
        } catch (error) {
          console.error("Error uploading item:", error);
          alert("Failed to upload item. Please try again.");
        }
      });
    }
  }
  // ========================== Profile Page ========================== //
  else if (currentPage === "profile") {
    const auth = getAuth();
    let currentUser = null

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Display user data
          document.getElementById("username-display").textContent = userData.username;
          document.getElementById("image").src = userData.profilePicture
          loadUserListings(user.uid);
          loadTopReviews(user.uid);
          loadAllReviews(user.uid);
        } else {
          console.error("User document not found.");
        }
      } else {
        // Redirect to login if user is not authenticated
        window.location.href = "index.html";
      }
    });

    // Edit Username Button
    document.getElementById("edit-username-btn").addEventListener("click", () => {
      document.getElementById("profile-info").style.display = "none";
      document.getElementById("edit-username-form").style.display = "block";
    });

    // Cancel Edit Button
    document.getElementById("cancel-edit-btn").addEventListener("click", () => {
      document.getElementById("profile-info").style.display = "block";
      document.getElementById("edit-username-form").style.display = "none";
      document.getElementById("username-error").style.display = "none";
    });

    // Save Username Button
    document.getElementById("save-username-btn").addEventListener("click", async () => {
      const newUsername = document.getElementById("new-username").value.trim();
      const usernameError = document.getElementById("username-error");

      if (!newUsername) {
        alert("Please enter a new username.");
        return;
      }

      // Check if the username is already taken
      const usernameQuery = await getDocs(query(collection(db, "users"), where("username", "==", newUsername)));
      if (!usernameQuery.empty) {
        usernameError.style.display = "block";
        return;
      }

      // Update the username in Firestore
      const auth = getAuth();
      const user = auth.currentUser;

      try {
        await setDoc(doc(db, "users", user.uid), { username: newUsername }, { merge: true });
        document.getElementById("username-display").textContent = newUsername;
        document.getElementById("profile-info").style.display = "block";
        document.getElementById("edit-username-form").style.display = "none";
        usernameError.style.display = "none";
        alert("Username updated successfully!");
      } catch (error) {
        console.error("Error updating username:", error);
        alert("Failed to update username. Please try again.");
      }
    }); 
    // Load the user's listings
    async function loadUserListings(userId) {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(listingsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        const listingsContainer = document.getElementById("user-listings");
        listingsContainer.innerHTML = "";
        querySnapshot.forEach(docSnap => {
          const listing = docSnap.data();
          const listingCard = document.createElement("div");
          listingCard.href = `listing-details.html?id=${doc.id}`;
          listingCard.className = "listing-card";
          listingCard.innerHTML = `
            <img src="${listing.imageUrl}" alt="${listing.title}"">
            <h4>${listing.title}</h4>
            <p>£${listing.price.toFixed(2)}</p>
          `;
          listingsContainer.appendChild(listingCard);
        });
      } catch (error) {
        console.error("Error loading listings:", error);
      }
    }

    async function loadAllReviews(userId) {
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef,
          where("revieweeId", "==", userId),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const allReviewsContainer = document.getElementById("all-reviews");
        // Clear the container and add a heading.
        allReviewsContainer.innerHTML = "<h3>All Reviews</h3>";
        let totalRating = 0;
        
        // Use a for...of loop to allow for asynchronous operations.
        for (const docSnap of querySnapshot.docs) {
          const review = docSnap.data();
          totalRating += review.rating;
          
          // Log the review to see its structure.
          console.log("Review document:", review);
          
          // Attempt to get listing details.
          let listingTitle = review.listingTitle;  // may already be stored with the review
          let listingImage = review.listingImage;
          
          // If listingTitle or listingImage is missing, try to fetch from the listings collection.
          if (review.listingId && (!listingTitle || !listingImage)) {
            const listingDocSnap = await getDoc(doc(db, "listings", review.listingId));
            if (listingDocSnap.exists()) {
              const listingData = listingDocSnap.data();
              listingTitle = listingData.title || listingTitle;
              listingImage = listingData.imageUrl || listingImage;
            } else {
              console.warn("Listing document not found for listingId:", review.listingId);
            }
          }
          
          // Log listing info after attempting fetch.
          console.log("Listing info:", {
            listingId: review.listingId,
            listingTitle,
            listingImage
          });
          
          let listingHtml = "";
          if (review.listingId && listingTitle && listingImage) {
            listingHtml = `
              <div class="review-listing">
                <a href="listing-details.html?id=${review.listingId}">
                  <img src="${listingImage}" alt="${listingTitle}" class="review-listing-image">
                  <span class="listing-title">${listingTitle}</span>
                </a>
              </div>
            `;
          } else {
            console.warn("Incomplete listing info for review:", review);
          }
          
          // Fetch reviewer details.
          let reviewerHtml = "";
          if (review.reviewerId) {
            const userDoc = await getDoc(doc(db, "users", review.reviewerId));
            if (userDoc.exists()) {
              const reviewerData = userDoc.data();
              reviewerHtml = `
                <div class="reviewer-info">
                  <a href="profile.html?uid=${review.reviewerId}" class="reviewer-link">
                    <img src="${reviewerData.profilePicture}" alt="${reviewerData.username}" class="reviewer-image">
                    <span class="reviewer-name">${reviewerData.username}</span>
                  </a>
                </div>
              `;
            }
          }
          
          // Build the review card.
          const reviewElement = document.createElement("div");
          reviewElement.className = "review";
          reviewElement.innerHTML = `
            ${listingHtml}
            ${reviewerHtml}
            <div class="review-details">
              <div class="rating">${"★".repeat(review.rating)}</div>
              <p class="comment">${review.comment}</p>
              <small>${new Date(review.timestamp?.toDate()).toLocaleDateString()}</small>
            </div>
          `;
          
          allReviewsContainer.appendChild(reviewElement);
        }
        
        // Calculate and display the average rating.
        const avgRating = totalRating / querySnapshot.size || 0;
        document.getElementById("average-rating").textContent =
          `Average Rating: ${avgRating.toFixed(1)}/5`;
      } catch (error) {
        console.error("Error loading all reviews:", error);
      }
    }

    // Load the top 3 reviews (ordered by highest rating)
    async function loadTopReviews(userId) {
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef,
          where("revieweeId", "==", userId),
          orderBy("rating", "desc"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const topReviewsContainer = document.getElementById("top-reviews");
        // Clear the container while preserving the heading
        topReviewsContainer.innerHTML = "";
        querySnapshot.forEach(docSnap => {
          const review = docSnap.data();
          const reviewElement = document.createElement("div");
          reviewElement.className = "review";
          reviewElement.innerHTML = `
          <div class="top-review-details">
            <div class="rating">${"★".repeat(review.rating)}</div>
            <p class="comment">${review.comment}</p>
            <small>${new Date(review.timestamp?.toDate()).toLocaleDateString()}</small>
          </div>
          `;
          topReviewsContainer.appendChild(reviewElement);
        });
      } catch (error) {
        console.error("Error loading top reviews:", error);
      }
    }
  }
  // ========================== Listing Details Page ========================== //
  else if (currentPage === "listing-details") {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');
    const auth = getAuth();

    // Get elements
    const mainImage = document.getElementById('listing-image');
    const titleElement = document.getElementById('listing-title');
    const priceElement = document.getElementById('listing-price');
    const conditionElement = document.getElementById('listing-condition');
    const dateElement = document.getElementById('listing-date');
    const descriptionElement = document.getElementById('listing-description');
    const sellerAvatar = document.getElementById('seller-avatar');
    const sellerName = document.getElementById('seller-name');
    const sellerJoined = document.getElementById('seller-joined');
    const contactButton = document.getElementById('contact-seller');

    // Fetch listing details
    async function loadListingDetails() {
        try {
            const listingDoc = await getDoc(doc(db, "listings", listingId));

            if (!listingDoc.exists()) {
                throw new Error("Listing not found");
            }

            const listingData = listingDoc.data();
            
            if (!listingData.userId) {
              throw new Error("Listing data is missing user ID");
            }

            // Populate listing data
            mainImage.src = listingData.imageUrl;
            titleElement.textContent = listingData.title;
            priceElement.textContent = `£${listingData.price.toFixed(2)}`;
            conditionElement.textContent = `Condition: ${listingData.condition}`;
            dateElement.textContent = `Listed: ${new Date(listingData.createdAt?.toDate()).toLocaleDateString()}`;
            descriptionElement.textContent = listingData.description;

            // Fetch seller information
            const userDoc = await getDoc(doc(db, "users", listingData.userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                sellerAvatar.src = userData.profilePicture;
                sellerName.textContent = userData.username;
                sellerJoined.textContent = `Member since ${new Date(userData.createdAt?.toDate()).getFullYear()}`;
            }

            // Handle contact button
            contactButton.addEventListener('click', async () => {
              const auth = getAuth();
              const currentUser = auth.currentUser;
            
              if (!currentUser) {
                alert("Please log in to contact the seller");
                window.location.href = "login.html";
                return;
              }
            
              try {
                // Fetch listing details
                const listingDoc = await getDoc(doc(db, "listings", listingId));
                if (!listingDoc.exists()) {
                  throw new Error("Listing not found");
                }
            
                const listingData = listingDoc.data();
            
                // Create or get the chat ID
                const chatId = await getOrCreateChat(currentUser.uid, listingData.userId, listingId, listingData.title);
            
                // Redirect to the chat page with the chat ID
                window.location.href = `chat.html?chatId=${chatId}&listingId=${listingId}`;
              } catch (error) {
                console.error("Error starting chat:", error);
                alert("Failed to start chat. Please try again.");
              }
            });
            
            // Helper function to create or get a chat
            async function getOrCreateChat(currentUserId, sellerUserId, listingId, listingTitle) {
              if (!currentUserId || !sellerUserId || !listingId || !listingTitle) {
                console.error("Invalid parameters for chat creation:", {
                  currentUserId,
                  sellerUserId,
                  listingId,
                  listingTitle
                });
                throw new Error("Missing required parameters for chat creation");
              }

              const chatsRef = collection(db, "chats");
            
              // Check if a chat already exists between these users for this listing
              const q = query(
                chatsRef,
                where("participantsIds", "array-contains", currentUserId),
                where("listingId", "==", listingId)
              );
            
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                // Return the existing chat ID
                return querySnapshot.docs[0].id;
              }
            
              // Create a new chat
              const newChat = {
                participantsIds: [currentUserId, sellerUserId],
                listingId,
                listingTitle,
                lastMessage: "",
                timestamp: serverTimestamp(),
              };
            
              const docRef = await addDoc(chatsRef, newChat);
              return docRef.id;
            }

        } catch (error) {
            console.error("Error loading listing:", error);
            alert("Listing not found");
            window.location.href = "listings.html";
        }
    }

    loadListingDetails();

    // Add this after loading listing details
    const currentUser = auth.currentUser;
    
    // Determine if user is seller
    const isSeller = currentUser && currentUser.uid === listingData.userId;
    
    // Show appropriate buttons
    if (isSeller) {
      document.getElementById('edit-listing').classList.remove('hidden');
      document.getElementById('start-chat').classList.add('hidden');
    }

    // Chat modal handling
    const chatModal = document.getElementById('chat-modal');
    const chatMessages = document.querySelector('.chat-messages');
    const messageInput = document.getElementById('message-input');

    document.getElementById('start-chat').addEventListener('click', async () => {
      if (!currentUser) {
        alert('Please login to start chatting');
        window.location.href = 'login.html';
        return;
      }
      
      chatModal.classList.remove('hidden');
      loadChatMessages();
    });

    // Function to load chat messages
    async function loadChatMessages(chatId) {
      if (activeChatId !== chatId) return;
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      onSnapshot(q, (snapshot) => {
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.innerHTML = '';
        snapshot.forEach((doc) => {
          const message = doc.data();
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${message.senderId === user.uid ? 'sent' : 'received'}`;
          messageDiv.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${new Date(message.timestamp?.toDate()).toLocaleTimeString()}</div>
          `;
          chatMessages.appendChild(messageDiv);
        });

        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }

    async function getOrCreateChat() {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, 
        where('participantsIds', 'array-contains', currentUser.uid),
        where('listingId', '==', listingId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }

      // Create new chat
      const newChat = {
        listingId,
        participantsIds: [listingData.userId, currentUser.uid],
        listingTitle: listingData.title,
        lastMessage: '',
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(chatsRef, newChat);
      return docRef.id;
    }

    document.getElementById('send-message').addEventListener('click', async () => {
      const text = messageInput.value.trim();
      if (!text) return;

      const chatId = await getOrCreateChat();
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      await addDoc(messagesRef, {
        text,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      const messageInput = document.getElementById("message-input");
      if (messageInput) messageInput.value = "";

      messageInput.value = '';
    });

    // Close modal
    document.querySelector('.close').addEventListener('click', () => {
      chatModal.classList.add('hidden');
    });
  }
  // ======================================================== Chat Page =================================================================== //
  else if (currentPage === "chat") {
    const auth = getAuth();
    const chatList = document.querySelector('.chat-list');
    const activeChatContainer = document.querySelector('.active-chat-container');
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('chatId');
    const listingId = urlParams.get('listingId');
    const offerModal = document.getElementById("offer-modal");
    const offerInput = document.getElementById("offer-modal-input");
    const submitOfferButton = document.getElementById("submit-offer");
    const modalcontent = document.getElementById("modal-content");
    const offerMessageId = document.getElementById("review-modal").dataset.offerMessageId;
    let activeChatId = null; 


    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }

      // Query chats for the current user, ordered by last activity (timestamp)
      const q = query(
        collection(db, "chats"),
        where("participantsIds", "array-contains", user.uid),
        orderBy("timestamp", "desc")
      );

      onSnapshot(q, async (snapshot) => {
        const chatList = document.querySelector('.chat-list');
        chatList.innerHTML = "";
        
        snapshot.forEach(async (documents) => {
          const chat = documents.data();
          // Use the correct document ID:
          const chatId = documents.id;
          // Retrieve the "other user" (the one you're chatting with)
          const otherUserId = chat.participantsIds.find(id => id !== user.uid);
          const userDoc = await getDoc(doc(db, "users", otherUserId));
          if (!userDoc.exists()) return;
          const userData = userDoc.data();
          
          // Build an unread badge if there are unread messages.
          const unreadBadge = chat.unreadCount && chat.unreadCount > 0
            ? `<span class="unread-badge">${chat.unreadCount}</span>`
            : '';
            
          // Create the chat item. Make sure to display the lastMessage.
          const chatItem = document.createElement('div');
          chatItem.className = 'chat-item';
          chatItem.dataset.chatId = chatId;
          chatItem.innerHTML = `
            <img src="${userData.profilePicture}" alt="${userData.username}">
            <div class="chat-info">
              <h3>${userData.username}</h3>
              <p>${chat.listingTitle || "No listing title"}</p>
              <p class="last-message">${chat.lastMessage || 'No messages yet'}</p>
              ${unreadBadge}
            </div>
          `;
          // Add click event to load active chat:
          chatItem.addEventListener('click', () => {
            loadActiveChat(chatId, chat.listingId);
          });
          chatList.appendChild(chatItem);
        });
        
        if (!activeChatId && snapshot.docs.length > 0) {
          const firstChat = snapshot.docs[0];
          loadActiveChat(firstChat.id, firstChat.data().listingId);
      }
      });
    });
  
    // Function to load active chat
    async function loadActiveChat(chatId, listingId) {
      try {
        // Fetch listing details
        const listingDoc = await getDoc(doc(db, "listings", listingId));
        if (!chatId || !listingId) {
          console.error("Invalid chatId or listingId");
          return;
        }
        if (activeChatId === chatId) return; 
        activeChatId = chatId;
        await updateDoc(doc(db, "chats", chatId), {
          unreadCount: 0
        });


        if (!listingDoc.exists()) {
          throw new Error("Listing not found");
        }
    
        const activeChatContainer = document.querySelector('.active-chat-container');
        if (activeChatContainer) {
          activeChatContainer.classList.add('active');
        }

        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
          chatHeader.classList.add('active');
        }

        const listingData = listingDoc.data();
    
        // Ensure the elements exist before setting their properties
        const listingImageElement = document.getElementById('chat-listing-image');
        const listingTitleElement = document.getElementById('listing-title');
        const listingPriceElement = document.getElementById('listing-price');
        const listingConditionElement = document.getElementById('listing-condition');
    
        if (listingImageElement) {
          listingImageElement.src = listingData.imageUrl;
        } else {
          console.error("Element with ID 'listing-image' not found");
        }
    
        if (listingTitleElement) {
          listingTitleElement.textContent = listingData.title;
        } else {
          console.error("Element with ID 'listing-title' not found");
        }
    
        if (listingPriceElement) {
          listingPriceElement.textContent = `Price: £${listingData.price.toFixed(2)}`;
        } else {
          console.error("Element with ID 'listing-price' not found");
        }
    
        if (listingConditionElement) {
          listingConditionElement.textContent = `Condition: ${listingData.condition}`;
        } else {
          console.error("Element with ID 'listing-condition' not found");
        }
        if (!listingId) {
          throw new Error("Listing ID is missing.");
        }
        const chatDocRef = doc(db, "chats", chatId);
        const chatDocSnap = await getDoc(chatDocRef);
        if (!chatDocSnap.exists()) {
          throw new Error("Chat not found");
        }
        const chatData = chatDocSnap.data();
        const currentUserId = auth.currentUser.uid;
        const otherUserId = chatData.participantsIds.find(id => id !== currentUserId);
        window.otherUserId = otherUserId;
        const otherUserDocRef = doc(db, "users", otherUserId);
        const otherUserDocSnap = await getDoc(otherUserDocRef);
        if (otherUserDocSnap.exists()) {
          const otherUserData = otherUserDocSnap.data();
          document.getElementById("other-user-avatar").src = otherUserData.profilePicture || "/default-avatar.png";
          document.getElementById("other-user-name").textContent = otherUserData.username || "Unknown User";
        } else {
          console.error("Other user not found");
        }
        loadChatMessages(chatId);
        const messageInput = document.getElementById('message-input');
        const sendMessageButton = document.getElementById('send-message');
    
        if (sendMessageButton && messageInput) {
          sendMessageButton.addEventListener('click', async () => {
            const text = messageInput.value.trim();
            if (!text) return;
    
            const currentUser = auth.currentUser;

            await sendMessage(chatId, text, currentUser.uid);
            messageInput.value = '';
          });
        } else {
          console.error("Message input or send button not found");
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        alert("Failed to load chat. Please try again.");
      }
    }

    async function loadChatMessages(chatId) {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const userInfo = document.querySelector('.user-info')
      const chatMessagesContainer = document.querySelector(".chat-messages");
      onSnapshot(q, (snapshot) => {
        chatMessagesContainer.innerHTML = "";
        let hasSentOffer = false;
        
        snapshot.docs.forEach(docSnap => {
          const message = docSnap.data();
          const messageId = docSnap.id;
          appendMessage(message, messageId);
          if (message.type === "offer" && message.senderId === auth.currentUser.uid) {
            hasSentOffer = true;
          }
        });
        const sendOfferBtn = document.getElementById("send-offer");
        if (sendOfferBtn) {
          sendOfferBtn.style.display = hasSentOffer ? "none" : "block";
        }
      });
    }
    function resetActiveChatUI() {
      const activeChatContainer = document.querySelector('.active-chat-container');
      if (activeChatContainer) {
        activeChatContainer.classList.remove('active');
        activeChatContainer.innerHTML = '<p class="no-active-chat">Select a chat to start messaging.</p>';
      }
      const chatHeader = document.querySelector('.chat-header');
      if (chatHeader) {
        chatHeader.classList.remove('active');
      }
    }


    function appendMessage(message, messageId) {
      const chatMessages = document.querySelector(".chat-messages");
      const messageDiv = document.createElement("div");
      const timestamp = message.timestamp?.toDate() || new Date();
      const formattedTime = timestamp.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit' 
      });

      const currentUser = auth.currentUser;
      const isSender = currentUser && message.senderId === currentUser.uid;

      if (message.type === "offer") {
        messageDiv.className = `message offer ${message.senderId === auth.currentUser.uid ? "sent" : "received"}`;
        messageDiv.innerHTML = `
          <div class="offer-content">
            <strong>Offer:</strong> £${message.offerNumber}
            ${message.status === "accepted" ? '<span class="offer-status accepted">Accepted</span>' : ''}
          </div>
          <div class="message-time">${formattedTime}</div>
        `;
    
        if (message.status === "pending" && !isSender) {
          const acceptButton = document.createElement('button');
          acceptButton.textContent = 'Accept Offer';
          acceptButton.className = 'accept-offer-btn';
          acceptButton.onclick = () => acceptOffer(chatId, messageId, message.senderId);
          messageDiv.appendChild(acceptButton);
        }
        if (message.status === "accepted") {  
          const reviewButton = document.createElement('button');
          reviewButton.textContent = 'Leave Review';
          reviewButton.className = 'review-btn';
          reviewButton.dataset.messageId = messageId;
          reviewButton.onclick = () => {
              const messageId = reviewButton.dataset.messageId;
              if (!messageId) {
                  console.error("No message ID found for review");
                  return;
              }
              openReviewModal(messageId, message.senderId, message.listingId, message.listingTitle, message.listingImage);
          };
          messageDiv.appendChild(reviewButton);
      }
      if (message.type === "offer") {
        // Use a class to style your offer message
        messageDiv.className = `message offer ${message.senderId === auth.currentUser.uid ? "sent" : "received"}`;
      
        // Display the offer details
        messageDiv.innerHTML = `
          <div class="offer-content">
            <strong>Offer:</strong> £${message.offerNumber}
            ${message.status === "accepted" ? '<span class="offer-status accepted">Accepted</span>' : ''}
          </div>
          <div class="message-time">${formattedTime}</div>
        `;
      
        if (message.status === "pending" && auth.currentUser.uid !== message.senderId) {
          const acceptButton = document.createElement('button');
          acceptButton.textContent = 'Accept Offer';
          acceptButton.className = 'accept-offer-btn';
          acceptButton.onclick = () => acceptOffer(chatId, messageId, message.senderId);
          messageDiv.appendChild(acceptButton);
        }
       if (message.status === "accepted") {
          const currentUser = auth.currentUser;
          const revieweeId = (currentUser.uid === message.senderId) ? window.otherUserId : message.senderId;
      
          // Call an asynchronous function to check for an existing review.
          checkReviewStatus(messageId, currentUser.uid).then(reviewExists => {
            if (reviewExists) {
              const reviewLabel = document.createElement("span");
              reviewLabel.className = "review-sent-label";
              reviewLabel.textContent = "Review sent";
              messageDiv.appendChild(reviewLabel);
            } else {
             const reviewButton = document.createElement("button");
              reviewButton.textContent = "Leave Review";
              reviewButton.className = "review-btn";
              reviewButton.dataset.messageId = messageId;
              const revieweeId = (currentUser.uid === message.senderId) ? window.otherUserId : message.senderId;
              openReviewModal(messageId, revieweeId, message.listingId, message.listingTitle, message.listingImage);

              messageDiv.appendChild(reviewButton);
            }
          }).catch(error => {
            console.error("Error checking review status:", error);
            // Fallback: show the button if the check fails
            const reviewButton = document.createElement("button");
            reviewButton.textContent = "Leave Review";
            reviewButton.className = "review-btn";
            reviewButton.dataset.messageId = messageId;
            const revieweeId = (currentUser.uid === message.senderId) ? window.otherUserId : message.senderId;
            openReviewModal(messageId, revieweeId, message.listingId, message.listingTitle, message.listingImage);
            messageDiv.appendChild(reviewButton);
          });
        }
      }
      
      
      } else {
        messageDiv.className = `message ${message.senderId === auth.currentUser.uid ? "sent" : "received"}`;
        messageDiv.innerHTML = `
          <div class="message-content">${message.text}</div>
          <div class="message-time">${formattedTime}</div>
        `;
      }
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      window.openReviewModal = openReviewModal;
      window.closeReviewModal = closeReviewModal;
    }
    
    async function sendMessage(chatId, text, senderId, currentUser) {
      try {
        const messagesRef = collection(db, "chats", chatId, "messages");
        await addDoc(messagesRef, {
          text,
          senderId,
          timestamp: serverTimestamp(),
        });
        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: text,
          timestamp: serverTimestamp(),
          unreadCount: 1
        });
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message.");
      }
    }
    let currentRevieweeId = null;
    function openReviewModal(offerMessageId, revieweeId, listingId, listingTitle, listingImage) {
      const modal = document.getElementById("review-modal");
      modal.dataset.offerMessageId = offerMessageId;
      modal.dataset.revieweeId = revieweeId;
      modal.dataset.listingId = listingId;
      modal.dataset.listingTitle = listingTitle;
      modal.dataset.listingImage = listingImage;
      modal.style.display = "block";
    }
    if (submitOfferButton && offerInput && offerModal) {
      document.getElementById("send-offer").addEventListener("click", () => {
        offerModal.style.display = "block";
        modalcontent.style.display = "block";
      });
  
      submitOfferButton.addEventListener("click", async () => {
        try {
          const offerValue = offerInput.value.trim();
          const urlParams = new URLSearchParams(window.location.search);
          const chatId = urlParams.get("chatId");
          if (!offerValue) {
            alert("Please enter an offer amount");
            return;
          }
  
          if (!chatId) {
            alert("Chat session error. Please reopen the chat.");
            return;
          }
  
          const offerNumber = parseFloat(offerValue);
          if (isNaN(offerNumber) || offerNumber <= 0) {
            alert("Please enter a valid positive number");
            return;
          }
          await sendOffer(chatId, offerNumber);
          offerInput.value = "";
          offerModal.style.display = "none";
        } catch (error) {
          console.error("Offer error:", error);
          alert("Failed to submit offer. Please try again.");
        }
      });
  
      document.getElementById("close-offer-modal").addEventListener("click", () => {
        offerModal.style.display = "none";
      });
    }

    document.getElementById("close-offer-modal").addEventListener("click", () => {
    document.getElementById("offer-modal").style.display = "none";
    });

    document.getElementById("submit-review").addEventListener("click", async () => {
      const modal = document.getElementById("review-modal");
      const offerMessageId = modal.dataset.offerMessageId;
      const revieweeId = modal.dataset.revieweeId;
      const listingId = modal.dataset.listingId;
      const listingTitle = modal.dataset.listingTitle;
      const listingImage = modal.dataset.listingImage;
    
      if (!offerMessageId || !revieweeId || !listingId) {
        alert("Error: Missing required review information");
        return;
      }
    
      const rating = parseInt(document.getElementById("review-rating").value.trim());
      const comment = document.getElementById("review-comment").value.trim();
      const currentUser = auth.currentUser;
    
      try {
        await addDoc(collection(db, "reviews"), {
          offerMessageId,
          reviewerId: currentUser.uid,
          revieweeId,
          listingId,
          listingTitle,
          listingImage,
          rating: Number(rating),
          comment,
          timestamp: serverTimestamp()
        });
        const messageRef = doc(db, "chats", chatId, "messages", offerMessageId);
        await updateDoc(messageRef, { reviewLeft: true });
    
        closeReviewModal();
      } catch (error) {
        console.error("Review submission error:", error);
        alert("Failed to submit review. Please try again.");
      }
    });    
  }
  else if (currentPage === "checkout"){
    // When the checkout page loads, subscribe to the cart updates.
      subscribeToCart();
    
      // Listen for form submission to proceed to payment.
      document.getElementById("checkout-form").addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = "payment.html";
      });

      function subscribeToCart() {
        const auth = getAuth();
      
        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            document.getElementById("cart-items").innerHTML = "<p>Please log in to view your cart.</p>";
            return;
          }
      
          const cartRef = collection(db, "carts", user.uid, "items");
      
          onSnapshot(cartRef, async (snapshot) => {
            const cartContainer = document.getElementById("cart-items");
            cartContainer.innerHTML = "";
            
            if (snapshot.empty) {
              cartContainer.innerHTML = "<p>Your cart is empty.</p>";
              return;
            }
      
            let itemsTotal = 0;
            const deliveryFee = 8.48;
      
            for (const docSnap of snapshot.docs) {
              const cartItem = docSnap.data();
              const listingId = cartItem.listingId;
      
              if (!listingId) continue;
      
              try {
                // Fetch the listing details
                const listingDoc = await getDoc(doc(db, "listings", listingId));
      
                if (listingDoc.exists()) {
                  const listingData = listingDoc.data();
                  
                  // Update total price
                  itemsTotal += cartItem.totalPrice;
      
                  // Create cart item element
                  const itemElement = document.createElement("div");
                  itemElement.classList.add("cart-item");
                  itemElement.innerHTML = `
                    <div class="cart-item">
                      <img src="${listingData.imageUrl}" alt="${listingData.title}" class="cart-item-image">
                      <div class="cart-item-details">
                        <h4>${listingData.title}</h4>
                        <p><strong>Condition:</strong> ${listingData.condition}</p>
                        <p><strong>Quantity:</strong> ${cartItem.quantity}</p>
                        <p><strong>Price:</strong> £${cartItem.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  `;
      
                  cartContainer.appendChild(itemElement);
                }
              } catch (error) {
                console.error("Error fetching listing details:", error);
              }
            }
      
            // Update price details
            document.getElementById("items-total").textContent = itemsTotal.toFixed(2);
            document.getElementById("delivery-fee").textContent = deliveryFee.toFixed(2);
            document.getElementById("order-total").textContent = (itemsTotal + deliveryFee).toFixed(2);
          });
        });
      }      
  }
  async function sendOffer(chatId, offerAmount) {
    if (!chatId) {
      console.error("Missing chat ID");
      return;
    }
  
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in to make offers");
      return;
    }
  
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const urlParams = new URLSearchParams(window.location.search);
      const listingId = urlParams.get("listingId");

      if (!listingId) {
          console.error("Listing ID is missing in URL parameters");
          return;
      }

      const listingDoc = await getDoc(doc(db, "listings", listingId));
      if (!listingDoc.exists()) {
          console.error("Listing not found");
          return;
      }

      const listingData = listingDoc.data();
      await addDoc(messagesRef, {
        type: "offer",
        offerNumber: offerAmount,
        status: "pending",
        senderId: currentUser.uid,
        listingId: listingId,
        listingTitle: listingData.title,
        listingImage: listingData.imageUrl,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Offer submission failed:", error);
      throw new Error("Failed to send offer");
    }
  }

  async function acceptOffer(chatId, messageId, senderId) {
    if (!chatId || !messageId || !senderId) {
        console.error("Missing required parameters:", { chatId, messageId, senderId });
        return;
    }

    try {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);
        await updateDoc(messageRef, { status: "accepted" });

        const notificationsRef = collection(db, "notifications");
        await addDoc(notificationsRef, {
            type: "offer-accepted",
            userId: senderId,
            message: "Your offer has been accepted!",
            timestamp: serverTimestamp(),
            read: false
        });

        console.log("Offer accepted successfully");
    } catch (error) {
        console.error("Error accepting offer:", error);
    }
}
  function closeReviewModal() {
    const modal = document.getElementById("review-modal");
    modal.style.display = "none";
    delete modal.dataset.revieweeId;
  }

  async function checkReviewStatus(offerMessageId, reviewerId) {
    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("offerMessageId", "==", offerMessageId),
      where("reviewerId", "==", reviewerId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }  
});