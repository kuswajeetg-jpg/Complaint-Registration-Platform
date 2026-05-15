const SUPABASE_URL = "https://vanikomvvmupttsdblhh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbmlrb212dm11cHR0c2RibGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQ0MDksImV4cCI6MjA5NDM0MDQwOX0.tD9JXJnGS9UwiHwOBPCss3q3dgmq00FKazLljnlx2e8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper Functions
async function getCurrentUser() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error || !session) return null;
  return session.user;
}

async function getProfile(userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

async function requireRole(expectedRole) {
  const user = await requireLogin();
  if (!user) return null;
  
  const profile = await getProfile(user.id);
  if (!profile || profile.role !== expectedRole) {
    if (profile && profile.role === 'customer') {
      window.location.href = 'my-complaints.html';
    } else if (profile && profile.role === 'employee') {
      window.location.href = 'employee-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
    return null;
  }
  return { user, profile };
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

function showMessage(text, isError = false) {
  let msgBox = document.getElementById('messageBox');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'messageBox';
    document.body.appendChild(msgBox);
  }
  msgBox.textContent = text;
  msgBox.className = isError ? 'msg-error' : 'msg-success';
  msgBox.style.display = 'block';
  setTimeout(() => {
    msgBox.style.display = 'none';
  }, 4000);
}

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

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Global Logout Binding
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'logoutBtn') {
    e.preventDefault();
    logout();
  }
});

// Setup dynamic navigation based on auth state
async function setupNavbar() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  const user = await getCurrentUser();
  if (!user) {
    navLinks.innerHTML = `
      <a href="index.html">Home</a>
      <a href="login.html">Login</a>
      <a href="signup.html" class="nav-btn">Sign Up</a>
    `;
    return;
  }

  const profile = await getProfile(user.id);
  if (profile && profile.role === 'employee') {
    navLinks.innerHTML = `
      <a href="index.html">Home</a>
      <a href="employee-dashboard.html">Dashboard</a>
      <a href="#" id="logoutBtn" class="nav-btn">Logout</a>
    `;
  } else {
    navLinks.innerHTML = `
      <a href="index.html">Home</a>
      <a href="add-complaint.html">Add Complaint</a>
      <a href="my-complaints.html">My Complaints</a>
      <a href="#" id="logoutBtn" class="nav-btn">Logout</a>
    `;
  }
}

// Page Specific Logic
document.addEventListener('DOMContentLoaded', async () => {
  // Always setup navbar if present
  setupNavbar();

  const path = window.location.pathname;

  // 1. INDEX PAGE
  if (path.endsWith('index.html') || path === '/' || path.endsWith('/frontend/')) {
    const heroActions = document.getElementById('heroActions');
    if (heroActions) {
      const user = await getCurrentUser();
      if (!user) {
        heroActions.innerHTML = `
          <a href="login.html" class="btn-primary">Login to Portal</a>
          <a href="signup.html" class="btn-outline">Create Account</a>
        `;
      } else {
        const profile = await getProfile(user.id);
        if (profile && profile.role === 'employee') {
          heroActions.innerHTML = `
            <a href="employee-dashboard.html" class="btn-primary">Go to Dashboard</a>
          `;
        } else {
          heroActions.innerHTML = `
            <a href="add-complaint.html" class="btn-primary">Register New Complaint</a>
            <a href="my-complaints.html" class="btn-outline">View My Complaints</a>
          `;
        }
      }
    }
  }

  // 2. SIGNUP PAGE
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        showMessage("Passwords do not match", true);
        return;
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        showMessage(error.message, true);
      } else {
        showMessage("Signup successful! Please log in.");
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }
    });
  }

  // 3. LOGIN PAGE
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        showMessage(error.message, true);
      } else {
        showMessage("Login successful!");
        const profile = await getProfile(data.user.id);
        setTimeout(() => {
          if (profile && profile.role === 'employee') {
            window.location.href = 'employee-dashboard.html';
          } else {
            window.location.href = 'my-complaints.html';
          }
        }, 1000);
      }
    });
  }

  // 4. ADD COMPLAINT PAGE
  const complaintForm = document.getElementById('complaintForm');
  if (complaintForm) {
    const authData = await requireRole('customer');
    if (!authData) return;

    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const city = document.getElementById('city').value;
      const mobile = document.getElementById('mobile').value;
      const complaintText = document.getElementById('complaint').value;

      const { error } = await supabaseClient.from('complaints').insert([
        {
          user_id: authData.user.id,
          name: name,
          city: city,
          mobile: mobile,
          complaint: complaintText,
          status: 'pending'
        }
      ]);

      if (error) {
        showMessage(error.message, true);
      } else {
        showMessage("Complaint submitted successfully!");
        complaintForm.reset();
      }
    });
  }

  // 5. MY COMPLAINTS PAGE
  const myComplaintsList = document.getElementById('myComplaintsList');
  if (myComplaintsList) {
    const authData = await requireRole('customer');
    if (!authData) return;

    loadMyComplaints(authData.user.id);
  }

  // 6. EMPLOYEE DASHBOARD
  const allComplaintsTable = document.getElementById('allComplaintsTableBody');
  const statusFilter = document.getElementById('statusFilter');
  if (allComplaintsTable) {
    const authData = await requireRole('employee');
    if (!authData) return;

    loadEmployeeComplaints();

    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        loadEmployeeComplaints(statusFilter.value);
      });
    }
  }
});

// Function to load complaints for customer
async function loadMyComplaints(userId) {
  const list = document.getElementById('myComplaintsList');
  list.innerHTML = '<div class="empty-state">Loading complaints...</div>';

  const { data, error } = await supabaseClient
    .from('complaints')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    list.innerHTML = `<div class="empty-state msg-error">Error loading complaints: ${escapeHTML(error.message)}</div>`;
    return;
  }

  if (data.length === 0) {
    list.innerHTML = '<div class="empty-state">No complaints found.</div>';
    return;
  }

  list.innerHTML = '';
  data.forEach(item => {
    const noteHTML = item.employee_note ? 
      `<div style="margin-top: 10px; padding: 10px; background: #f1f5f9; border-left: 3px solid var(--secondary-color);">
        <p class="card-label" style="font-size:0.8rem; margin-bottom: 2px;">Official Response:</p>
        <p style="font-size:0.9rem; margin:0;">${escapeHTML(item.employee_note)}</p>
       </div>` : '';

    const card = document.createElement('div');
    card.className = 'complaint-card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">ID: #${item.id}</h3>
          <div class="card-meta">Submitted on: ${formatDate(item.created_at)}</div>
        </div>
        <span class="status-badge status-${item.status}">${escapeHTML(item.status.replace('_', ' '))}</span>
      </div>
      <div class="card-body">
        <p><span class="card-label">City:</span> ${escapeHTML(item.city)}</p>
        <p><span class="card-label">Mobile:</span> ${escapeHTML(item.mobile)}</p>
        <p><span class="card-label">Details:</span><br> ${escapeHTML(item.complaint).replace(/\n/g, '<br>')}</p>
        ${noteHTML}
      </div>
    `;
    list.appendChild(card);
  });
}

// Function to load all complaints for employee
async function loadEmployeeComplaints(filterStatus = 'all') {
  const tbody = document.getElementById('allComplaintsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading complaints...</td></tr>';

  let query = supabaseClient.from('complaints').select('*').order('created_at', { ascending: false });
  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus);
  }

  const { data, error } = await query;

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Error: ${escapeHTML(error.message)}</td></tr>`;
    return;
  }

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No complaints found.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>
        <strong>${escapeHTML(item.name)}</strong><br>
        <small>${escapeHTML(item.mobile)} | ${escapeHTML(item.city)}</small>
      </td>
      <td><div style="max-width: 250px; max-height: 80px; overflow-y: auto; font-size: 0.9rem;">${escapeHTML(item.complaint)}</div></td>
      <td>${formatDate(item.created_at)}</td>
      <td><span class="status-badge status-${item.status}" id="status-badge-${item.id}">${escapeHTML(item.status.replace('_', ' '))}</span></td>
      <td>
        <form class="update-form" onsubmit="updateComplaintStatus(event, '${item.id}')">
          <select id="status-${item.id}">
            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${item.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${item.status === 'resolved' ? 'selected' : ''}>Resolved</option>
            <option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
          <input type="text" id="note-${item.id}" placeholder="Note (optional)" value="${item.employee_note ? escapeHTML(item.employee_note) : ''}">
          <button type="submit" class="secondary-btn" style="background:var(--primary-color); color:white;">Update</button>
        </form>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Expose update function globally for inline handlers
window.updateComplaintStatus = async function(event, complaintId) {
  event.preventDefault();
  const newStatus = document.getElementById(`status-${complaintId}`).value;
  const newNote = document.getElementById(`note-${complaintId}`).value;

  const { error } = await supabaseClient
    .from('complaints')
    .update({ status: newStatus, employee_note: newNote })
    .eq('id', complaintId);

  if (error) {
    showMessage(`Failed to update: ${error.message}`, true);
  } else {
    showMessage(`Complaint #${complaintId} updated successfully.`);
    const badge = document.getElementById(`status-badge-${complaintId}`);
    if (badge) {
      badge.className = `status-badge status-${newStatus}`;
      badge.textContent = newStatus.replace('_', ' ').toUpperCase();
    }
  }
};