const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const db = require('./firebase'); 
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Get user by userId
app.get('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = doc.data();
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
});

// Add a new user (with height and current weight)
app.post('/api/users', async (req, res) => {
    const { uid, name, surname, height, weight, gender, created, dateOfBirth } = req.body; // Expecting uid from Firebase Auth

    try {
        const userRef = db.collection('users').doc(uid); // Use uid as document ID
        await userRef.set({
            name: name,
            surname: surname,
            created: created,
            height: height,
            weight: weight,
            gender: gender,
            dateOfBirth: dateOfBirth
        });
        res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add user API Response' });
    }
});

// Add or update user's height and weight
app.put('/api/users/:userId/profile', async (req, res) => {
    const { height, currentWeight } = req.body;
    const { userId } = req.params;

    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            height: height,
            currentWeight: currentWeight
        });
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Add weight progress (to track changes over time)
app.post('/api/users/:userId/weight-progress', async (req, res) => {
    const { weight } = req.body; // No need for date; use it as the document ID
    const { userId } = req.params;

    // Use today's date as the document ID in the format YYYY-MM-DD
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    try {
        const weightProgressRef = db.collection('users').doc(userId).collection('weight-progress').doc(date);
        await weightProgressRef.set({
            weight: weight,
        });
        res.status(201).json({ id: date, message: 'Weight progress added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add weight progress' });
    }
});

// Get all weight progress records for the user
app.get('/api/users/:userId/weight-progress', async (req, res) => {
    const { userId } = req.params;

    try {
        const weightProgressSnapshot = await db.collection('users').doc(userId).collection('weight-progress').get();
        const weightProgress = weightProgressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(weightProgress);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve weight progress' });
    }
});

// Delete a weight progress record
app.delete('/api/users/:userId/weight-progress/:progressId', async (req, res) => {
    const { userId, progressId } = req.params;

    try {
        await db.collection('users').doc(userId).collection('weight-progress').doc(progressId).delete();
        res.status(200).json({ message: 'Weight progress record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete weight progress record' });
    }
});


// Add a new exercise for the user
app.post('/api/users/:userId/exercises', async (req, res) => {
    const { name, muscleGroup } = req.body;
    const { userId } = req.params;
    try {
        // Add the exercise to the exercises subcollection of the user
        await db.collection('users').doc(userId).collection('exercises').add({
            name: name,
            muscleGroup: muscleGroup
        });

        res.status(201).send({ message: 'Exercise added successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to add exercise' });
    }
});

// Add a new exercise for the user in workouts
app.post('/api/users/:userId/workouts', async (req, res) => {
    const { exercises, name, muscleGroup } = req.body;
    const { userId } = req.params;
    try {
        // Add the workout to the workouts collection
        const workoutRef = await db.collection('users').doc(userId).collection('workouts').add({
            name: name,
            muscleGroup: muscleGroup
        });

        // Add each exercise to the exercises subcollection within the workout
        const batch = db.batch();
        exercises.forEach(exercise => {
            const exerciseRef = workoutRef.collection('exercises').doc();
            batch.set(exerciseRef, exercise);
        });
        await batch.commit();

        res.status(201).json({ id: workoutRef.id, message: 'Workout and exercises added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add workout and exercises' });
    }
});

// Get all exercises for the user
app.get('/api/users/:userId/exercises', async (req, res) => {
    const { userId } = req.params;
    const { muscleGroup } = req.query;

    try {
        let exercisesSnapshot;
        if (muscleGroup) {
            exercisesSnapshot = await db.collection('users').doc(userId).collection('exercises')
                .where('muscleGroup', '==', muscleGroup).get();
        } else {
            exercisesSnapshot = await db.collection('users').doc(userId).collection('exercises').get();
        }
        const exercises = exercisesSnapshot.docs.map(doc => doc.data());
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve exercises' });
    }
});

// Update an existing exercise for the user
app.put('/api/users/:userId/exercises/:exerciseId', async (req, res) => {
    const { name, muscleGroup } = req.body;
    const { userId, exerciseId } = req.params;
    try {
        await db.collection('users').doc(userId).collection('exercises').doc(exerciseId).update({
            name: name,
            muscleGroup: muscleGroup
        });
        res.status(200).json({ message: 'Exercise updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

// Delete an exercise for the user
app.delete('/api/users/:userId/exercises/:exerciseId', async (req, res) => {
    const { userId, exerciseId } = req.params;
    try {
        await db.collection('users').doc(userId).collection('exercises').doc(exerciseId).delete();
        res.status(200).json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});

// Add a new workout for the user
app.post('/api/users/:userId/workouts', async (req, res) => {
    const { exercises, name } = req.body;
    const { userId } = req.params;
    try {
        const workoutRef = await db.collection('users').doc(userId).collection('workouts').add({
            exercises: exercises,
            name: name
        });
        res.status(201).json({ id: workoutRef.id, message: 'Workout added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add workout' });
    }
});

// Get all workouts for the user
app.get('/api/users/:userId/workouts', async (req, res) => {
    const { userId, exerciseId } = req.params;
    try {
        const workoutsSnapshot = await db.collection('users').doc(userId).collection('workouts').doc(exerciseId).get();
        const workouts = workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve workouts' });
    }
});

// Update an existing workout for the user
app.put('/api/users/:userId/workouts/:workoutId', async (req, res) => {
    const { exercises, name } = req.body;
    const { userId, workoutId } = req.params;
    try {
        await db.collection('users').doc(userId).collection('workouts').doc(workoutId).update({
            exercises: exercises,
            name: name
        });
        res.status(200).json({ message: 'Workout updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workout' });
    }
});

// Delete a workout for the user
app.delete('/api/users/:userId/workouts/:workoutId', async (req, res) => {
    const { userId, workoutId } = req.params;
    try {
        await db.collection('users').doc(userId).collection('workouts').doc(workoutId).delete();
        res.status(200).json({ message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

// Schedule a workout for the user
app.post('/api/users/:userId/workouts/:workoutId/schedule', async (req, res) => {
    const { scheduledDate } = req.body; // expecting a timestamp
    const { userId, workoutId } = req.params;
    try {
        await db.collection('users').doc(userId).collection('workouts').doc(workoutId).update({
            scheduledDate: scheduledDate
        });
        res.status(200).json({ message: 'Workout scheduled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to schedule workout' });
    }
});

// Add workout completion to history
app.post('/api/users/:userId/workouts/:workoutId/history', async (req, res) => {
    const { completedAt, duration } = req.body; // completedAt is a timestamp
    const { userId, workoutId } = req.params;
    try {
        const historyRef = await db.collection('users').doc(userId).collection('workouts').doc(workoutId).collection('history').add({
            completedAt: completedAt,
            duration: duration
        });
        res.status(201).json({ id: historyRef.id, message: 'Workout history recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record workout history' });
    }
});

// Get workout history
app.get('/api/users/:userId/workouts/:workoutId/history', async (req, res) => {
    const { userId, workoutId } = req.params;
    try {
        const historySnapshot = await db.collection('users').doc(userId).collection('workouts').doc(workoutId).collection('history').get();
        const history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve workout history' });
    }
});

// Add workout progress to the progress subcollection of a workout
app.post('/api/users/:userId/workouts/:workoutId/progress', async (req, res) => {
    const { userId, workoutId } = req.params;
    const { date, sets, reps, weight } = req.body;

    try {
        const progressRef = await db.collection('users').doc(userId).collection('workouts').doc(workoutId).collection('progress').add({
            date: date,
            sets: sets,
            reps: reps,
            weight: weight
        });
        res.status(201).json({ id: progressRef.id, message: 'Workout progress added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add workout progress' });
    }
});

// Add a new workout for a specific exercise of the user
app.post('/api/users/:userId/exercises/:exerciseId/workouts', async (req, res) => {
    const { userId, exerciseId } = req.params;
    const { name, sets, reps } = req.body;

    try {
        const workoutRef = await db.collection('users').doc(userId).collection('exercises').doc(exerciseId).collection('workouts').add({
            name: name,
            sets: sets,
            reps: reps
        });
        res.status(201).json({ id: workoutRef.id, message: 'Workout added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add workout' });
    }
});

// Get workout progress for a specific muscle group
app.get('/api/users/:userId/workouts/progress', async (req, res) => {
    const { userId } = req.params;
    const { muscleGroup } = req.query;

    try {
        const workoutsSnapshot = await db.collection('users').doc(userId).collection('workouts')
            .where('muscleGroup', '==', muscleGroup).get();

        if (workoutsSnapshot.empty) {
            return res.status(404).json({ error: 'No workouts found for the specified muscle group' });
        }

        const progressPromises = workoutsSnapshot.docs.map(async (workoutDoc) => {
            const progressSnapshot = await workoutDoc.ref.collection('progress').get();
            return progressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        });

        const progressResults = await Promise.all(progressPromises);
        const workoutProgress = progressResults.flat();

        res.status(200).json(workoutProgress);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve workout progress' });
    }
});