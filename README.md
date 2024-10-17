
# Fitness Progress Tracker API

This API is part of the **PowerPath** fitness progress tracker app, allowing users to manage workouts, track weight progress, record exercise routines, and maintain historical workout data. The API is built with **Express** and hosted on **Vercel**.

## Features
- **User Management**: Add, update, and retrieve user profiles.
- **Workout Tracking**: Create and manage workouts, schedule them, and track completion history.
- **Weight Progress**: Record weight changes over time for progress tracking.
- **Exercise Management**: Add, update, and delete exercises linked to a user.
- **Data Security**: Secure data communication using Firebase.

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/fitness-progress-api.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   Set up Firebase and add your Firebase credentials to a `.env` file:
   ```bash
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-auth-domain
   FIREBASE_PROJECT_ID=your-project-id
   ```

4. **Run locally**:
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**:
   - Install [Vercel CLI](https://vercel.com/docs/cli).
   - Run the following command to deploy:
     ```bash
     vercel
     ```

## API Endpoints

### User Management
- **Get User by ID**:  
  `GET /api/users/:userId`  
  Retrieves user profile by their unique user ID.
  
- **Add New User**:  
  `POST /api/users`  
  Adds a new user profile. Requires `uid`, `name`, `surname`, `height`, `weight`, `gender`, `created`, and `dateOfBirth` in the request body.

- **Update User Profile**:  
  `PUT /api/users/:userId/profile`  
  Updates user’s height and current weight.

### Weight Progress
- **Add Weight Progress**:  
  `POST /api/users/:userId/weight-progress`  
  Adds a weight progress record for a user. Uses the current date as the record ID.
  
- **Get Weight Progress**:  
  `GET /api/users/:userId/weight-progress`  
  Retrieves all weight progress records for a user.

- **Delete Weight Progress**:  
  `DELETE /api/users/:userId/weight-progress/:progressId`  
  Deletes a specific weight progress record for a user.

### Exercise Management
- **Add New Exercise**:  
  `POST /api/users/:userId/exercises`  
  Adds a new exercise for the user.

- **Get All Exercises**:  
  `GET /api/users/:userId/exercises`  
  Retrieves all exercises for a user.

- **Update Exercise**:  
  `PUT /api/users/:userId/exercises/:exerciseId`  
  Updates the exercise details for a user.

- **Delete Exercise**:  
  `DELETE /api/users/:userId/exercises/:exerciseId`  
  Deletes a specific exercise for a user.

### Workout Management
- **Add New Workout**:  
  `POST /api/users/:userId/workouts`  
  Creates a new workout with a list of exercises.

- **Get All Workouts**:  
  `GET /api/users/:userId/workouts`  
  Retrieves all workouts for a user.

- **Update Workout**:  
  `PUT /api/users/:userId/workouts/:workoutId`  
  Updates workout details.

- **Delete Workout**:  
  `DELETE /api/users/:userId/workouts/:workoutId`  
  Deletes a specific workout for a user.

### Workout Scheduling & History
- **Schedule Workout**:  
  `POST /api/users/:userId/workouts/:workoutId/schedule`  
  Schedules a workout for a specific date.

- **Add Workout History**:  
  `POST /api/users/:userId/workouts/:workoutId/history`  
  Adds a workout completion history record.

- **Get Workout History**:  
  `GET /api/users/:userId/workouts/:workoutId/history`  
  Retrieves all workout history records.

## Deployment
This API is hosted on **Vercel**. To deploy:
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Run the deployment command:
   ```bash
   vercel
   ```

3. Follow the prompts to deploy.

## Environment Variables
Ensure the following environment variables are configured in Vercel or locally:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
