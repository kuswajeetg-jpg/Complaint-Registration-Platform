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