const BASE_URL = "https://student-management-api-l7xk.onrender.com/api";

/**
 * Optimized API fetch helper
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultHeaders = {
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        // Return null for 204 No Content
        if (response.status === 204) return null;

        return await response.json();
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // Basic health check for backend connection on index page
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        try {
            const response = await fetch(BASE_URL + "/all"); // Using /all as health check
            if (!response.ok) throw new Error("Backend not available");
        } catch (error) {
            console.warn("Backend connectivity issue:", error);
            window.location.href = "./html/nobackend.html";
        }
    }
});

/**
 * Load all students into the table
 */
async function loadStudents() {
    try {
        const students = await apiFetch("/all");
        const tableBody = document.querySelector("table tbody");
        
        if (!tableBody) return;

        // Use DocumentFragment for better DOM performance
        const fragment = document.createDocumentFragment();
        
        students.forEach(student => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${student.enrollmentNumber}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.department}</td>
                <td>${student.contactNumber}</td>
                <td><a href="#" class="edit-link" onclick="loadStudent(${student.enrollmentNumber}); return false;">Edit</a></td>
                <td><a href="#" class="delete-link" onclick="deleteStudent(${student.enrollmentNumber}); return false;">Delete</a></td>
            `;
            fragment.appendChild(tr);
        });

        tableBody.innerHTML = "";
        tableBody.appendChild(fragment);
    } catch (error) {
        alert("Failed to load students. Please ensure the backend is running at :8080");
    }
}

/**
 * Insert a new student
 */
async function insertStudent(event) {
    event.preventDefault();
    
    const studentData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        contactNumber: document.getElementById("contactNumber").value,
        enrollmentNumber: document.getElementById("enrollmentNumber").value,
        department: document.getElementById("department").value
    };

    try {
        await apiFetch("/create", {
            method: "POST",
            body: JSON.stringify(studentData)
        });
        alert("Student record created successfully!");
        window.location.href = "index.html"; // Redirect to home after insert
    } catch (error) {
        alert("Failed to create student: " + error.message);
    }
}

/**
 * Delete a student record
 */
async function deleteStudent(enrollmentNumber) {
    const confirmed = confirm(`Are you sure you want to delete student with enrollment number: ${enrollmentNumber}?`);
    if (!confirmed) return;

    try {
        // Based on script.js line 66, delete endpoint seems to be BASE_URL + enrollmentNumber
        await apiFetch(`/${enrollmentNumber}`, {
            method: "DELETE"
        });
        alert("Student deleted successfully.");
        loadStudents(); // Refresh the list
    } catch (error) {
        alert("Failed to delete student: " + error.message);
    }
}

/**
 * Redirect to update page
 */
function loadStudent(enrollmentNumber) {
    window.location.href = `../html/updateStudent.html?enrollmentNumber=${enrollmentNumber}`;
}

/**
 * Update an existing student record
 */
async function updateStudent(event) {
    if (event) event.preventDefault();
    
    const enrollmentNumber = document.getElementById("enrollmentNumber").value;
    const confirmed = confirm(`Confirm updates for enrollment number: ${enrollmentNumber}?`);
    if (!confirmed) return;

    const studentData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        contactNumber: document.getElementById("contactNumber").value,
        enrollmentNumber: enrollmentNumber,
        department: document.getElementById("department").value
    };

    try {
        await apiFetch(`/${enrollmentNumber}`, {
            method: "PUT",
            body: JSON.stringify(studentData)
        });
        alert("Student updated successfully!");
        window.location.href = "../index.html";
    } catch (error) {
        alert("Failed to update student: " + error.message);
    }
}
