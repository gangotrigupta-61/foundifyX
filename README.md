# FoundifyX — Campus Lost & Found

A centralized Lost & Found web platform for campuses, offices, hostels and multi-storey buildings. FoundifyX lets users report lost or found items, automatically checks new reports against existing records in Firestore, and helps coordinate safe, private handovers via Gmail.

## Overview

FoundifyX simplifies reunions between owners and finders by combining a clean reporting UI, real-time matching against a cloud datastore (Firestore), and private resolution through the user's Gmail. 

The site is deployed and available at:
### MVP Link : https://campus-lost-found-476c7.web.app

### Demo Video Link : https://youtu.be/A3H--iaEhVM

## Key goals of this repo:

Provide an easy-to-use frontend for reporting & browsing lost/found items.

Run fast, real-time matching checks so matches are discovered quickly.

Keep user contact details private by facilitating secure Gmail-based coordination.

## Contributors

- **[Gangotri Gupta](https://www.linkedin.com/in/gangotri-gupta-ba5764321/)**
- **[Annu Verma](https://www.linkedin.com/in/annu-verma-link)**
- **[Divyansh Pal](https://www.linkedin.com/in/divyansh-pal-link)**




## Table of content

overview

contributors

table of content

features

goals

builtwith

## features

### Report item (Lost / Found):
Submit item name, type, description, location, date and optional image.

### Real-time matching:
New reports are automatically checked against Firestore for potential matches and flagged to users.

### Match notification: 
UI popup / dashboard notification when a probable match is found.

### Private resolution via Gmail: 
"Claim / Found it" actions open the user's Gmail to privately coordinate handover without exposing raw contact details.

### Browse & filter:
View recent reports and filter by status (Lost / Found).

### User dashboard: 
Track your reported items and update lifecycle (Lost → Matched → Recovered).

### Responsive frontend:
Works across desktop and mobile browsers.

### Realtime counters / basic stats:
See platform activity (items reported, recovered, recovery rate).

## goals

### Short-term

Provide a reliable, easy reporting flow for users across a campus or office.

Ensure fast detection of likely matches so owners and finders can reconnect quickly.

Keep all sensitive server-side logic and credentials out of the public repo (use environment configs and Firebase security rules).

### Long-term / Planned

Add AI-assisted image-similarity matching to improve match accuracy.

Add push notifications or in-app messaging for faster coordination.

Integrate a campus map for precise location reporting and visualization.

Improve access controls and expand authentication options (e.g., SSO for institutions).

## builtwith

### Frontend:
HTML, CSS, JavaScript (responsive static site)

### Firebase:
Authentication (email/password), Cloud Firestore (real-time DB), Hosting (static site), Cloud Functions (match logic / background tasks)

### Deployment:
Firebase Hosting





### Every lost item carries a story — FoundifyX exists to help it find its way home.
### Built with empathy, technology, and the belief that small solutions can create meaningful impact.

## ThankYou!!
