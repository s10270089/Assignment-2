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

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
  };
  firebase.initializeApp(firebaseConfig);
  
  const auth = firebase.auth();
  // Example: Sign up with email/password
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => console.log(userCredential))
    .catch(error => console.error(error.message));
  