// Import required modules
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads variables from .env file into process.env
const { createClient } = require('@supabase/supabase-js');

// Initialize Express application
const app = express();

// Middleware to parse JSON bodies and allow Cross-Origin requests
app.use(express.json());
app.use(cors());

// Supabase setup
// Ensure that the URL and Key are provided in the .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Warning: Missing Supabase credentials in .env file.");
}

// Create Supabase client instance
// If credentials are missing, we still create it to avoid immediate crashing, 
// but API calls will fail later.
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key');

// --- REST APIs ---

// 1. GET /
// A simple route to check if the backend is running properly
app.get('/', (req, res) => {
  res.send('Complaint Registration Backend is running');
});

// 2. GET /complaints
// Fetch all complaints from the Supabase database
app.get('/complaints', async (req, res) => {
  try {
    // Fetch data from the 'complaints' table
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('id', { ascending: false }); // Optional: sort by newest first

    // If there's an error from Supabase, throw it to the catch block
    if (error) throw error;

    // Send the fetched data back to the client
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching complaints:", error.message);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// 3. POST /complaints
// Add a new complaint to the database
app.post('/complaints', async (req, res) => {
  try {
    // Extract the fields from the request body
    const { name, city, mobile, complaint } = req.body;

    // Validate that all required fields are present
    if (!name || !city || !mobile || !complaint) {
      return res.status(400).json({ error: "All fields (name, city, mobile, complaint) are required." });
    }

    // Insert the data into the 'complaints' table
    const { data, error } = await supabase
      .from('complaints')
      .insert([
        { name, city, mobile, complaint }
      ])
      .select(); // Ask Supabase to return the inserted data

    if (error) throw error;

    // Return a success response with the newly created complaint
    res.status(201).json({ 
      message: "Complaint registered successfully", 
      data: data[0] // data is an array, we get the first inserted item
    });
  } catch (error) {
    console.error("Error adding complaint:", error.message);
    res.status(500).json({ error: "Failed to add complaint" });
  }
});

// 4. PATCH /complaints/:id
// Update the status of an existing complaint
app.patch('/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the complaint ID from the URL
    const { status } = req.body; // Get the new status from the request body

    // Validate that the status field was provided
    if (!status) {
      return res.status(400).json({ error: "Status field is required for updating." });
    }

    // Update the complaint in Supabase
    const { data, error } = await supabase
      .from('complaints')
      .update({ status })
      .eq('id', id) // Ensure we only update the complaint with this specific ID
      .select();

    if (error) throw error;

    // Return the updated complaint data
    res.status(200).json({
      message: "Complaint updated successfully",
      data: data[0]
    });
  } catch (error) {
    console.error("Error updating complaint:", error.message);
    res.status(500).json({ error: "Failed to update complaint status" });
  }
});

// 5. DELETE /complaints/:id
// Delete a complaint from the database using its ID
app.delete('/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the complaint ID from the URL

    // Delete the specific complaint from Supabase
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Respond with a generic success message and 200 OK
    res.status(200).json({ message: `Complaint with ID ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting complaint:", error.message);
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
