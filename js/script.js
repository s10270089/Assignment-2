// Placeholder for API integration
const API_URL = 'https://api.example.com/listings'; // Replace with actual API endpoint

// Function to fetch listings from the API
async function fetchListings() {
    try {
        const response = await fetch(API_URL);
        const listings = await response.json();
        displayListings(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
    }
}

// Function to display listings on the page
function displayListings(listings) {
    const container = document.getElementById('listing-container');
    container.innerHTML = ''; // Clear previous listings

    listings.forEach(listing => {
        const listingDiv = document.createElement('div');
        listingDiv.className = 'listing';
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

// Function to handle contact seller action
function contactSeller(sellerId) {
    alert(`Contacting seller with ID: ${sellerId}`);
}

// Function to handle item upload
document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Get form data
    const title = document.getElementById('title').value;
    const image = document.getElementById('image').files[0];
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const condition = document.getElementById('condition').value;

    // Create a FormData object to send the image and other data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('condition', condition);

    // Send the data to the API (this is a placeholder URL)
    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Item uploaded successfully:', data);
        alert('Item uploaded successfully!');
        // Redirect to listings page after successful upload
        window.location.href = 'listings.html'; // Redirect to listings page
    })
    .catch(error => {
        console.error('Error uploading item:', error);
        alert('Error uploading item. Please try again.');
    });
});

// Fetch listings when the page loads
if (document.getElementById('listing-container')) {
    window.onload = fetchListings;
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDqYtQAxeSDqaXdReUFdP2goqHfgTj0sNM",
    authDomain: "mokesellfed.firebaseapp.com",
    projectId: "mokesellfed",
    storageBucket: "mokesellfed.firebasestorage.app",
    messagingSenderId: "165673734048",
    appId: "1:165673734048:web:5e8c69745ebaefcc47dec5",
    measurementId: "G-EMD85073YC"
  };

// Initialise Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Get the current page
const currentPage = document.body.id;

if (currentPage === "login") {
  // Login page functionality
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("User logged in:", userCredential.user);
        window.location.href = "home.html";
      })
      .catch((error) => alert(error.message));
  });
}

if (currentPage === "signup") {
  // Sign-up page functionality
  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("User signed up:", userCredential.user);
        window.location.href = "home.html";
      })
      .catch((error) => alert(error.message));
  });
}

if (currentPage === "home") {
  // Home page functionality
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("Welcome back:", user.email);
    } else {
      console.log("No user logged in");
      window.location.href = "index.html";
    }
  });

  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", () => {
    auth.signOut()
      .then(() => window.location.href = "index.html")
      .catch((error) => alert(error.message));
  });
}
