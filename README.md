
## Project Introduction

The Speech-to-Text Transcription System is a full-stack web application that allows users to convert spoken audio into text. Users can either upload audio files or record their voice live through a microphone. The system processes audio using speech recognition technology and stores generated transcriptions securely for future access.

The application provides real-time microphone transcription, audio file transcription, transcription history management, copy functionality, and secure deletion of saved transcriptions.



##  Use Cases
- Convert live speech into text in real time.
- Upload audio files and generate transcriptions.
- Create lecture notes from recorded classes.
- Generate meeting minutes automatically.
- Transcribe interviews and podcasts.
- Create captions and subtitles for content.
- Store and manage transcription history securely.
## Industry Value
- Reduces manual transcription effort and saves time.
- Improves productivity through automated speech-to-text conversion.
- Creates accurate and searchable records of conversations.
- Enhances accessibility for hearing-impaired users.
- Supports documentation in education, healthcare, and business sectors.
- Helps organizations maintain meeting and interview records efficiently.
- Enables faster content creation for media and content creators.
- Promotes digital transformation through automation and real-time processing.
## Roles
### User
- Register and log in to the application.
- Record live audio through the microphone.
- Upload audio files for transcription.
- View generated transcriptions.
- Copy transcribed text.
- Delete personal transcriptions.
- Access transcription history.

### System
- Authenticate users securely.
- Process audio files and microphone streams.
- Convert speech into text.
- Store transcriptions in the database.
- Retrieve user-specific transcription history.
- Manage real-time transcription updates.
## Tech Stack

### Frontend:

1. React.js

Fast rendering using Virtual DOM.

2. Vite

Extremely fast development server.

3. Tailwind CSS

Responsive design support.

4. React Router DOM

Client-side routing.

5. Axios

Simplified HTTP requests.

6. Socket.IO Client

Real-time communication.

### Backend:

1. Node.js

Efficient handling of real-time requests.

2. Express.js

Easy API development.

3. Socket.IO

Enables real-time microphone streaming.

4. Multer

Simplifies file processing.

5. JWT Authentication

Secure user authentication.

### Database:

1. MongoDB

Flexible document storage.

2. Mongoose

Simplified MongoDB interactions.

### Speech Recognition:

1. Deepgram API

Real-time speech-to-text support.



## Explanation of tech 

### React.js
Builds a dynamic and component-based UI for recording, uploading, and viewing transcriptions. It efficiently updates the interface when live or stored text changes.


### Tailwind CSS
Helps design a responsive and clean user interface using utility-first CSS classes without writing custom styles.

### React Router DOM
Handles navigation between pages like login, dashboard, transcription history, and upload sections without reloading the page.

### Axios
Used to communicate with backend APIs for uploading audio, fetching transcriptions, and managing user data.

### Socket.IO Client
Enables real-time communication between browser and server for live microphone-based speech-to-text streaming.

### Node.js
Runs the backend server and efficiently handles multiple real-time audio and API requests simultaneously.

### Express.js
Creates REST APIs for authentication, file uploads, transcription storage, and history management.

### Socket.IO
Manages real-time audio streaming from frontend to backend and sends back live transcription results instantly.

### Multer
Handles audio file uploads securely and passes them to the server for transcription processing.

### JWT Authentication
Secures APIs by verifying user identity and ensuring only authorized users access transcription data.

### MongoDB
Stores user data and transcription history in flexible JSON-like documents for easy access and scalability.

### Mongoose
Provides schema structure and simplifies database operations like saving, retrieving, and deleting transcriptions.

### Deepgram API
Processes audio (live or uploaded) and converts it into accurate real-time or batch text transcription using AI speech recognition.