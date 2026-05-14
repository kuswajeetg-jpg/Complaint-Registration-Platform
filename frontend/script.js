const complaintForm = document.getElementById("complaintForm");

if (complaintForm) {
  complaintForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const city = document.getElementById("city").value;
    const mobile = document.getElementById("mobile").value;
    const complaint = document.getElementById("complaint").value;

    const newComplaint = {
      id: Date.now(),
      name: name,
      city: city,
      mobile: mobile,
      complaint: complaint
    };

    const oldComplaints = JSON.parse(localStorage.getItem("complaints")) || [];

    oldComplaints.push(newComplaint);

    localStorage.setItem("complaints", JSON.stringify(oldComplaints));

    alert("Complaint submitted successfully!");

    complaintForm.reset();
  });
}
const complaintsList = document.getElementById("complaintsList");

if (complaintsList) {
  const complaints = JSON.parse(localStorage.getItem("complaints")) || [];

  if (complaints.length === 0) {
    complaintsList.innerHTML = "<p>No complaints found.</p>";
  } else {
    complaints.forEach(function (item) {
      const complaintCard = document.createElement("div");
      complaintCard.className = "complaint-card";

      complaintCard.innerHTML = `
        <h3>${item.name}</h3>
        <p><strong>City:</strong> ${item.city}</p>
        <p><strong>Mobile:</strong> ${item.mobile}</p>
        <p><strong>Complaint:</strong> ${item.complaint}</p>
      `;

      complaintsList.appendChild(complaintCard);
    });
  }
}