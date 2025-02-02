// Firebase Modules
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, query, where, collection, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

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
    const db = getFirestore();

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
  }
  // ========================== Listing Details Page ========================== //
  else if (currentPage === "listing-details") {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');
    const auth = getAuth();

    // Get elements
    const mainImage = document.getElementById('main-listing-image');
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
            contactButton.addEventListener('click', () => {
                if (auth.currentUser) {
                    // Implement contact functionality
                    alert("Contact form or chat implementation would go here");
                } else {
                    alert("Please log in to contact the seller");
                    window.location.href = "login.html";
                }
            });

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

    async function loadChatMessages() {
      const chatId = await getOrCreateChat();
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      onSnapshot(query(messagesRef, orderBy('timestamp')), (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.forEach(doc => {
          const msg = doc.data();
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`;
          messageDiv.innerHTML = `
            <div class="message-content">${msg.text}</div>
            <div class="message-time">${new Date(msg.timestamp?.toDate()).toLocaleTimeString()}</div>
          `;
          chatMessages.appendChild(messageDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }

    async function getOrCreateChat() {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, 
        where('participantIds', 'array-contains', currentUser.uid),
        where('listingId', '==', listingId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }

      // Create new chat
      const newChat = {
        listingId,
        participantIds: [listingData.userId, currentUser.uid],
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

      messageInput.value = '';
    });

    // Close modal
    document.querySelector('.close').addEventListener('click', () => {
      chatModal.classList.add('hidden');
    });
  }
  // ========================== Chat Page ========================== //
  else if (currentPage === "chat-list") {
    const auth = getAuth();
    const chatList = document.querySelector('.chat-list');
  
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = 'login.html';
        return;
      }
  
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, 
        where('participantIds', 'array-contains', user.uid),
        orderBy('timestamp', 'desc')
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        chatList.innerHTML = '';
        snapshot.forEach(async doc => {
          const chat = doc.data();
          const otherUserId = chat.participantIds.find(id => id !== user.uid);
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          const userData = userDoc.data();
  
          const chatItem = document.createElement('a');
          chatItem.className = 'chat-item';
          chatItem.href = `chat.html?chatId=${doc.id}`;
          chatItem.innerHTML = `
            <img src="${userData.profilePicture}" alt="${userData.username}">
            <div>
              <h3>${userData.username}</h3>
              <p>${chat.listingTitle}</p>
              <p class="last-message">${chat.lastMessage}</p>
            </div>
          `;
          chatList.appendChild(chatItem);
        });
      });
    });
  }
});

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
