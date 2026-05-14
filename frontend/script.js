document.addEventListener('DOMContentLoaded', () => {
  const complaintForm = document.getElementById('complaintForm');
  const complaintsList = document.getElementById('complaintsList');
  const messageBox = document.getElementById('messageBox');

  // Handle Form Submission
  if (complaintForm) {
    complaintForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const city = document.getElementById('city').value.trim();
      const mobile = document.getElementById('mobile').value.trim();
      const complaintText = document.getElementById('complaint').value.trim();

      if (!name || !city || !mobile || !complaintText) {
        return; // Basic validation
      }

      const newComplaint = {
        id: Date.now(),
        name: name,
        city: city,
        mobile: mobile,
        complaint: complaintText,
        date: new Date().toLocaleString()
      };

      const oldComplaints = JSON.parse(localStorage.getItem('complaints')) || [];
      oldComplaints.push(newComplaint);
      localStorage.setItem('complaints', JSON.stringify(oldComplaints));

      // Show success message
      if (messageBox) {
        messageBox.textContent = 'Complaint submitted successfully!';
        messageBox.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
          messageBox.style.display = 'none';
        }, 3000);
      }

      complaintForm.reset();
    });
  }

  // Handle Displaying Complaints
  if (complaintsList) {
    const complaints = JSON.parse(localStorage.getItem('complaints')) || [];

    if (complaints.length === 0) {
      complaintsList.innerHTML = '<div class="no-complaints"><h2>No complaints found.</h2><p>Submit a new complaint to see it listed here.</p></div>';
    } else {
      // Sort by newest first
      complaints.sort((a, b) => b.id - a.id);

      complaints.forEach(function (item) {
        const card = document.createElement('div');
        card.className = 'complaint-card';

        // Check for date, fallback to formatted ID if date is missing (for older entries)
        const submittedDate = item.date || new Date(item.id).toLocaleString();

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
  }
});

// Helper function to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}