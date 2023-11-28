// Importing required modules
const express = require('express')
const router = express.Router()
const Subscriber = require('../models/subscriber')

// Define a route to handle GET requests for the root URL
router.get('/', async (req, res) => {
  try {

    // Attempt to retrieve all subscribers from the database

    const subscribers = await Subscriber.find()
    // Send a JSON response containing the subscribers data

    res.json(subscribers)

  } catch (err) {

    // In case of any errors during the database operation, send a 500 status
    // and the error message as JSON

    res.status(500).json({ message: err.message })

  }
})

// Define a route to handle GET requests for a specific subscriber
// The ':id' in the route specifies that this route will include a dynamic parameter 'id'
router.get('/:id', getSubscriber, (req, res) => {
  // Respond with the subscriber data found by the getSubscriber middleware
  res.json(res.subscriber);
});

// Define a route to handle POST requests for creating a new subscriber
router.post('/', async (req, res) => {
  // Create a new subscriber instance with data from the request body
  const subscriber = new Subscriber({
    name: req.body.name,
    subscribedToChannel: req.body.subscribedToChannel
  });

  try {
    // Attempt to save the new subscriber to the database
    const newSubscriber = await subscriber.save();

    // Respond with a 201 status code (Created) and the newly created subscriber data
    res.status(201).json(newSubscriber);
  } catch (err) {
    // In case of any errors (e.g., validation errors), send a 400 status (Bad Request)
    // and the error message as JSON
    res.status(400).json({ message: err.message });
  }
});

// Define a route to handle PATCH requests for updating a specific subscriber
// The ':id' in the route specifies that this route will include a dynamic parameter 'id'
router.patch('/:id', getSubscriber, async (req, res) => {
  // Check if a new name is provided in the request body and update if present
  if (req.body.name != null) {
    res.subscriber.name = req.body.name;
  }

  // Check if a new 'subscribedToChannel' value is provided and update if present
  if (req.body.subscribedToChannel != null) {
    res.subscriber.subscribedToChannel = req.body.subscribedToChannel;
  }

  try {
    // Attempt to save the updated subscriber data to the database
    const updatedSubscriber = await res.subscriber.save();

    // Respond with the updated subscriber data as JSON
    res.json(updatedSubscriber);
  } catch (err) {
    // In case of any errors during the update (e.g., validation errors),
    // send a 400 status (Bad Request) and the error message as JSON
    res.status(400).json({ message: err.message });
  }
});

// Define a route to handle DELETE requests for a specific subscriber
// The ':id' in the route specifies that this route will include a dynamic parameter 'id'
router.delete('/:id', getSubscriber, async (req, res) => {
  try {
    // Attempt to delete the subscriber with the specified ID from the database
    await Subscriber.deleteOne({ _id: req.params.id });

    // Respond with a success message indicating that the subscriber has been deleted
    res.json({ message: 'Deleted Subscriber' });
  } catch (err) {
    // In case of any errors during the deletion, send a 500 status (Internal Server Error)
    // and the error message as JSON
    res.status(500).json({ message: err.message });
  }
});

// Middleware to find a subscriber by ID
async function getSubscriber(req, res, next) {
  let subscriber;
  try {
    // Attempt to find the subscriber by ID
    subscriber = await Subscriber.findById(req.params.id);

    // Check if the subscriber exists, if not, return a 404 status (Not Found)
    if (subscriber == null) {
      return res.status(404).json({ message: 'Cannot find subscriber' });
    }
  } catch (err) {
    // In case of any errors during the search, return a 500 status (Internal Server Error)
    // and the error message as JSON
    return res.status(500).json({ message: err.message });
  }

  // Attach the found subscriber to the response object
  res.subscriber = subscriber;

  // Proceed to the next middleware/function
  next();
}


// Export the router

module.exports = router