const BACKEND_BASE_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', () => {
  const complaintForm = document.getElementById('complaintForm');
  const complaintsList = document.getElementById('complaintsList');
  const messageBox = document.getElementById('messageBox');

  // Handle Form Submission
  if (complaintForm) {
    complaintForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const city = document.getElementById('city').value.trim();
      const mobile = document.getElementById('mobile').value.trim();
      const complaintText = document.getElementById('complaint').value.trim();

      if (!name || !city || !mobile || !complaintText) {
        return; // Basic validation
      }

      const newComplaint = {
        name: name,
        city: city,
        mobile: mobile,
        complaint: complaintText
      };

      try {
        // Send data to backend API instead of localStorage
        const response = await fetch(`${BACKEND_BASE_URL}/complaints`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newComplaint)
        });

        if (!response.ok) {
          throw new Error('Failed to submit complaint');
        }

        // Show success message
        if (messageBox) {
          messageBox.textContent = 'Complaint submitted successfully!';
          messageBox.className = 'message-box message-success';
          messageBox.style.display = 'block';
          messageBox.style.backgroundColor = '#d1fae5'; 
          messageBox.style.color = '#065f46';
          messageBox.style.borderColor = '#34d399';
          
          // Hide message after 3 seconds
          setTimeout(() => {
            messageBox.style.display = 'none';
          }, 3000);
        }

        // Reset the form
        complaintForm.reset();
      } catch (error) {
        console.error('Error submitting complaint:', error);
        
        // Show error message
        if (messageBox) {
          messageBox.textContent = 'Failed to submit complaint. Please try again.';
          messageBox.className = 'message-box message-error';
          messageBox.style.display = 'block';
          messageBox.style.backgroundColor = '#fee2e2'; // Light red background
          messageBox.style.color = '#991b1b'; // Dark red text
          messageBox.style.borderColor = '#f87171'; // Red border
          
          setTimeout(() => {
            messageBox.style.display = 'none';
          }, 4000);
        }
      }
    });
  }

  // Handle Displaying Complaints
  if (complaintsList) {
    // Show loading text initially
    complaintsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">Loading complaints...</div>';

    // Fetch complaints from backend API
    fetchComplaints();

    async function fetchComplaints() {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/complaints`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch complaints');
        }

        const complaints = await response.json();

        if (complaints.length === 0) {
          complaintsList.innerHTML = '<div class="no-complaints"><h2>No complaints found.</h2><p>Submit a new complaint to see it listed here.</p></div>';
        } else {
          // Clear loading text
          complaintsList.innerHTML = ''; 

          complaints.forEach(function (item) {
            const card = document.createElement('div');
            card.className = 'complaint-card';

            // Check for created_at (from Supabase)
            const submittedDate = item.created_at ? new Date(item.created_at).toLocaleString() : new Date().toLocaleString();

            card.innerHTML = `
              <div class="card-header">
                <h3 class="card-title">${escapeHTML(item.name)}</h3>
                <div class="card-meta">Submitted on: ${submittedDate}</div>
              </div>
              <div class="card-body">
                <p><span class="card-label">City:</span> ${escapeHTML(item.city)}</p>
                <p><span class="card-label">Mobile:</span> ${escapeHTML(item.mobile)}</p>
                <p><span class="card-label">Complaint:</span><br> ${escapeHTML(item.complaint).replace(/\n/g, '<br>')}</p>
              </div>
            `;

            complaintsList.appendChild(card);
          });
        }
      } catch (error) {
        console.error('Error fetching complaints:', error);
        complaintsList.innerHTML = '<div class="no-complaints" style="color: #991b1b;"><h2>Error</h2><p>Failed to load complaints from server. Make sure your backend is running.</p></div>';
      }
    }
  }
});

// Helper function to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.toString().replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}