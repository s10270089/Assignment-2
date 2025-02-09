# MokeSell - Interactive Online Marketplace

## Overview
**MokeSell** is a consumer-to-consumer online platform that connects buyers and sellers for new and second-hand items. The platform simplifies the buying and selling process by providing robust features such as item listings, user profiles, communication tools, and transaction reviews. MokeSell aims to create a reliable, engaging, and user-friendly marketplace for individuals to trade goods seamlessly.

## Key Features
**1. User Account Management**
  - Secure account creation and login for buyers and sellers using Firebase Authentication.
  - Profile management with updates to personal details and account settings.

**2. Listing Management**
 - Create, edit, and upload detailed listings, complete with photos, price, and condition.


**3. Communication and Transactions**
- **Real-Time Chat:** Integrated messaging powered by Firebase Firestore enables buyers and sellers to discuss transaction details instantly.
- **Offer System:** Users can submit and accept offers directly within the chat interface.
- **Review & Rating:** Transaction-based review system helps build trust and accountability in the marketplace.

**4. Additional Features**
- **Notifications:** Real-time alerts for new listings, offers, and messages.
- **Transaction History:** Detailed logs to track completed trades and reviews.
- **Future Enhancements:** Planned loyalty rewards, gamification features, and advanced analytics for sellers.

## Technical Overview & Architecture
MokeSell is built as a modern, modular web application with clear separation of concerns across its different pages. The codebase leverages:
- **JavaScript (ES6 Modules):** Modular architecture with page-specific logic determined by the document’s body ID.
- **Firebase:**  
  - **Authentication:** Manages user sign-up, login, and logout processes.  
  - **Firestore:** Serves as the NoSQL database for storing user profiles, listings, chats, carts, and reviews.
- **Cloudinary:** Handles image uploads for user profiles and listings, ensuring optimized delivery.
- **Real-Time Updates:** Uses Firestore’s onSnapshot listeners to enable instant messaging and dynamic data updates across the marketplace.

Each page (Login, Signup, Listings, Upload, Profile, Listing Details, Chat, and Checkout) has dedicated functionality. For example, the chat module supports not only text messaging but also integrated offer submission and review processes for seamless transactions.


 ## Design Process
 The design prioritised accessibility, ease of use, and user engagement. MokeSell's interface is tailored for all types of users, from casual buyers to regular sellers, and includes intuitive navigation and functionality to streamline their experience.

**User Stories**
The design process focused on accessibility, simplicity, and engagement:
- **User-Centric Design:** Wireframes and prototypes were created in Figma to ensure intuitive navigation and a responsive interface for desktop and mobile users.
- **User Stories:**
  - As a **seller**, I want to create attractive listings with photos and descriptions so that buyers understand my offerings.
  - As a **buyer**, I want to quickly find items by searching or browsing through categories.
  - As a **user**, I want to follow other users and save listings to stay organized and updated.

**Wireframes & Mockups**
Wireframes and prototypes were created using Figma to visualise layouts and workflows for desktop and mobile versions. These designs emphasised clarity and smooth navigation. View Wireframes.

## Features
**Existing Features**
1. **Interactive Chat:** Real-time messaging and offer management facilitate efficient negotiations.
2. **Listing Management:** Create, edit, and upload listings with detailed information.
3. **User Account Management:** Secure sign-up, login, and profile update functionality.

**Features to Implement**
1. **Payment Integration:** Secure online payment processing.
2. **Loyalty Rewards & Gamification:** Incentives and rewards to boost user engagement.
3. **Advanced Analytics for Sellers:** Detailed insights into listing performance and customer engagement.
4. **Enhanced Search Functionality:** Further development of the keyword-based search feature.

## Technologies Used
- **HTML5:** Provides the structural framework for the web pages.
- **CSS3:** Implements responsive and visually appealing designs.
- **JavaScript (ES6):** Powers dynamic interactions, real-time features, and modular page-specific logic.
- **Firebase:** 
  - Authentication for secure user management.
  - Firestore for real-time data storage and retrieval.
- **Cloudinary:** Manages image uploads and processing.
- **Lottie:** Adds engaging animations.
- **Git & GitHub:** Source code management and version control.
- **Figma:** Wireframing, mockups, and design prototyping.

## Testing
**Manual Testing Scenarios**
- Authentication flows (signup, login, logout)
- Listing creation, editing, and deletion
- Real-time chat functionality including offer submissions and acceptance
- Responsive design testing across multiple devices and browsers

**Test Case**

## Cross-Browser Compatibility
The application was tested on the following browsers:
Google Chrome

## Bugs or Issues
No critical issues were found during initial testing

**Deployment**
The application is deployed on GitHub Pages for easy access. Continuous integration practices ensured smooth deployment and updates.

## Credits
**Content**
Item descriptions and listing examples were drafted for demonstration purposes.
**Media**
- Figma (design assets)  
- Cloudinary (image hosting)  
**Acknowledgements**
Inspired by leading online marketplaces and feedback from early user testing