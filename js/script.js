// Firebase Modules
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, query, where, collection, addDoc, serverTimestamp, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
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

  // Get references to the buttons
  const logoutButton = document.getElementById("logout-btn");
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
    function renderListings(querySnapshot) {
      const listingsContainer = document.querySelector(".listings-container");
      listingsContainer.innerHTML = "";

      if (querySnapshot.empty) {
        listingsContainer.innerHTML = "<p>No listings found.</p>";
        return;
      }

      // In your renderListings function
      querySnapshot.forEach((doc) => {
        const listing = doc.data();
        const listingCard = document.createElement("a");
        listingCard.classList.add("listing-card");
        listingCard.href = `listing-details.html?id=${doc.id}`; // Pass listing ID in URL
        
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

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Display user data
          document.getElementById("username-display").textContent = userData.username;
          document.getElementById("image").src = userData.profilePicture
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
    // In profile page section
    async function loadReviews(userId) {
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("revieweeId", "==", userId));
        const querySnapshot = await getDocs(q);

        const reviewsContainer = document.getElementById('reviews-container');
        reviewsContainer.innerHTML = '';

        let totalRating = 0;
        querySnapshot.forEach((doc) => {
          const review = doc.data();
          totalRating += review.rating;
          
          const reviewElement = document.createElement('div');
          reviewElement.className = 'review';
          reviewElement.innerHTML = `
            <div class="rating">${'★'.repeat(review.rating)}</div>
            <p class="comment">${review.comment}</p>
            <small>${new Date(review.timestamp?.toDate()).toLocaleDateString()}</small>
          `;
          reviewsContainer.appendChild(reviewElement);
        });

        // Display average rating
        const avgRating = totalRating / querySnapshot.size || 0;
        document.getElementById('average-rating').textContent = 
          `Average Rating: ${avgRating.toFixed(1)}/5`;
          
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    }

    // Call this in profile page auth state listener
    if (user) {
      loadReviews(user.uid);
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

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
  
      // Fetch and display chat list
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participantsIds", "array-contains", user.uid), orderBy("timestamp", "desc"));
  
      onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
          // No chats found
          chatList.innerHTML = '<p class="no-chats-message">You have no chats here.</p>';
          activeChatContainer.innerHTML = '<p class="no-active-chat">Select a chat to start messaging.</p>';
          return;
        }
  
        // Clear existing chat list
        chatList.innerHTML = '';
  
        // Populate chat list
        snapshot.forEach(async (documents) => {
          const chat = documents.data();
          const otherUserId = chat.participantsIds.find(id => id !== user.uid);
  
          // Fetch other user's details
          const userDoc = await getDoc(doc(db, "users", otherUserId));

          if (!userDoc.exists()) return;
  
          const userData = userDoc.data();
  
          // Create chat item
          const chatItem = document.createElement('div');
          chatItem.className = 'chat-item';
          chatItem.dataset.chatId = doc.id;
          chatItem.innerHTML = `
            <img src="${userData.profilePicture}" alt="${userData.username}">
            <div>
              <h3>${userData.username}</h3>
              <p>${chat.listingTitle}</p>
              <p class="last-message">${chat.lastMessage || 'No messages yet'}</p>
            </div>
          `;
  
          // Add click event to load active chat
          chatItem.addEventListener('click', () => {
            loadActiveChat(doc.id, chat.listingId);
          });
  
          chatList.appendChild(chatItem);
        });
  
        // Load the first chat by default (if available)
        if (snapshot.docs.length > 0) {
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
    
        // Validate listingId
        if (!listingId) {
          throw new Error("Listing ID is missing.");
        }

        // Fetch the chat document to get the participants
        const chatDocRef = doc(db, "chats", chatId);
        const chatDocSnap = await getDoc(chatDocRef);

        if (!chatDocSnap.exists()) {
          throw new Error("Chat not found");
        }

        const chatData = chatDocSnap.data();
        // Assuming chatData.participantsIds is an array of user IDs
        const currentUserId = auth.currentUser.uid;
        // Filter out the current user to get the chat partner's ID
        const otherUserId = chatData.participantsIds.find(id => id !== currentUserId);

        // Fetch the chat partner's user document
        const otherUserDocRef = doc(db, "users", otherUserId);
        const otherUserDocSnap = await getDoc(otherUserDocRef);

        if (otherUserDocSnap.exists()) {
          const otherUserData = otherUserDocSnap.data();
          // Now update the header's .user-info element with the fetched data
          document.getElementById("other-user-avatar").src = otherUserData.profilePicture || "/default-avatar.png";
          document.getElementById("other-user-name").textContent = otherUserData.username || "Unknown User";
          // If you have other elements (e.g., status) update them here too.
        } else {
          console.error("Other user not found");
        }

    
        // Load chat messages
        loadChatMessages(chatId);
    
        // Send message functionality
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

      // Clear previous messages
      const chatMessagesContainer = document.querySelector(".chat-messages");
      chatMessagesContainer.innerHTML = "";
  
      // Real-time listener for messages
      onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const message = change.doc.data();
            appendMessage(message, change.doc.id);
          }
        });

      });
    }

    // check for No Chat selected
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
          
          // Store the message ID directly on the button
          reviewButton.dataset.messageId = messageId;
          reviewButton.onclick = () => {
              const messageId = reviewButton.dataset.messageId;
              if (!messageId) {
                  console.error("No message ID found for review");
                  return;
              }
              openReviewModal(messageId, message.senderId);
          };
          messageDiv.appendChild(reviewButton);
      }
      
      } else {
        // Render as a regular text message
        messageDiv.className = `message ${message.senderId === auth.currentUser.uid ? "sent" : "received"}`;
        messageDiv.innerHTML = `
          <div class="message-content">${message.text}</div>
          <div class="message-time">${formattedTime}</div>
        `;
      }
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Define sendMessage function
    async function sendMessage(chatId, text, senderId, currentUser) {
      try {
        const messagesRef = collection(db, "chats", chatId, "messages");
        await addDoc(messagesRef, {
          text,
          senderId,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message.");
      }
    }
  
    // Review handling
    let currentRevieweeId = null;

    function openReviewModal(messageId, revieweeId) {
      const modal = document.getElementById("review-modal");
      currentRevieweeId = revieweeId;
      
      // Store both IDs on the modal
      modal.dataset.offerMessageId = messageId;
      modal.dataset.revieweeId = revieweeId;
      modal.style.display = "block";
  }

    async function submitReview() {
      const rating = document.getElementById('review-rating').value;
      const comment = document.getElementById('review-comment').value;
      const currentUser = auth.currentUser;

      try {
        await addDoc(collection(db, "reviews"), {
          reviewerId: currentUser.uid,
          revieweeId: currentRevieweeId,
          rating: Number(rating),
          comment,
          timestamp: serverTimestamp()
        });
        closeReviewModal();
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    }

    if (submitOfferButton && offerInput && offerModal) {
      // Open offer modal
      document.getElementById("send-offer").addEventListener("click", () => {
        offerModal.style.display = "block";
        modalcontent.style.display = "block";
      });
  
      // Handle offer submission
      submitOfferButton.addEventListener("click", async () => {
        try {
          const offerValue = offerInput.value.trim();
          const urlParams = new URLSearchParams(window.location.search);
          const chatId = urlParams.get("chatId");
  
          // Validate inputs
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
  
          // Send offer
          await sendOffer(chatId, offerNumber);
          
          // Clear and close
          offerInput.value = "";
          offerModal.style.display = "none";
        } catch (error) {
          console.error("Offer error:", error);
          alert("Failed to submit offer. Please try again.");
        }
      });
  
      // Close modal
      document.getElementById("close-offer-modal").addEventListener("click", () => {
        offerModal.style.display = "none";
      });
    }
    // Add event listeners
    document.getElementById('submit-review').addEventListener('click', submitReview);

    // Close offer modal when clicking the close icon
    document.getElementById("close-offer-modal").addEventListener("click", () => {
    document.getElementById("offer-modal").style.display = "none";
    });

    // Submit offer from modal
    document.getElementById("submit-review").addEventListener("click", async () => {
      const modal = document.getElementById("review-modal");
      const offerMessageId = modal.dataset.offerMessageId;
      const revieweeId = modal.dataset.revieweeId;
      
      if (!offerMessageId || !revieweeId) {
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
              rating: Number(rating),
              comment,
              timestamp: serverTimestamp()
          });
          
          // Update the offer message to mark review as left
          const messageRef = doc(db, "chats", currentChatId, "messages", offerMessageId);
          await updateDoc(messageRef, { reviewLeft: true });
          
          closeReviewModal();
      } catch (error) {
          console.error("Review submission error:", error);
          alert("Failed to submit review. Please try again.");
      }
  });
  }

  // Send offer function
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
      await addDoc(messagesRef, {
        type: "offer",
        offerNumber: offerAmount,
        status: "pending",
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Offer submission failed:", error);
      throw new Error("Failed to send offer");
    }
  }

  // Accept offer
  async function acceptOffer(chatId, messageId, senderId) {
    if (!chatId || !messageId || !senderId) {
        console.error("Missing required parameters:", { chatId, messageId, senderId });
        return;
    }

    try {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);
        await updateDoc(messageRef, { status: "accepted" });

        // Add notification for the sender
        const notificationsRef = collection(db, "notifications");
        await addDoc(notificationsRef, {
            type: "offer-accepted",
            userId: senderId, // Now using the passed senderId
            message: "Your offer has been accepted!",
            timestamp: serverTimestamp(),
            read: false
        });

        console.log("Offer accepted successfully");
    } catch (error) {
        console.error("Error accepting offer:", error);
    }
}

  function openReviewModal(revieweeId) {
    const modal = document.getElementById("review-modal");
    modal.style.display = "block";
    modal.dataset.revieweeId = revieweeId;
  }
  function closeReviewModal() {
    const modal = document.getElementById("review-modal");
    modal.style.display = "none";
    delete modal.dataset.revieweeId;
  }
  window.openReviewModal = openReviewModal;
  window.closeReviewModal = closeReviewModal;

  async function submitReview(offerMessageId, rating, comment, reviewerId) {
    try {
      // Create a new review document
      const reviewsRef = collection(db, "reviews");
      await addDoc(reviewsRef, {
        offerMessageId, // Link the review to the specific offer message
        rating,
        comment,
        reviewerId,
        timestamp: serverTimestamp()
      });
      // Optionally, update the offer message to indicate a review has been left.
      const messageDocRef = doc(db, "chats", chatId, "messages", offerMessageId);
      await updateDoc(messageDocRef, { reviewLeft: true });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  }
});