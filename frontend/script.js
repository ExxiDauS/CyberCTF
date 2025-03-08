// script.js

// ... (helper functions, authentication, navigation, UI update, profile functions - unchanged) ...
// --- Helper Functions ---

function getToken() {
    return localStorage.getItem('token');
}
function setToken(token) {
    localStorage.setItem('token', token);
}
function removeToken() {
    localStorage.removeItem('token');
}
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// --- Authentication Functions ---

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;
    const firstName = document.getElementById('register-first-name').value;
    const lastName = document.getElementById('register-last-name').value;
    const messageEl = document.getElementById('register-message');

    if (!username || !password || !email) {
        messageEl.textContent = 'Please enter username, password, and email.';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email, first_name: firstName, last_name: lastName }),
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            messageEl.textContent = 'Registration successful!  Logging in...';
            showLoggedInSection();
        } else {
            messageEl.textContent = data.message || 'Registration failed.';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        messageEl.textContent = 'An error occurred during registration.';
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            messageEl.textContent = 'Login successful!';
            showLoggedInSection();
        } else {
            messageEl.textContent = data.message || 'Login failed.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        messageEl.textContent = 'An error occurred during login.';
    }
}

function logout() {
    removeToken();
    hideLoggedInSection();
    window.location.href = 'index.html';
}

// --- Navigation Functions ---

function goToProfile() {
    window.location.href = 'profile.html';
}
function goToAdminPage() {
    window.location.href = 'admin.html';
}
function goToIndex() {
    window.location.href = 'index.html';
}
function goToCourses() {
    window.location.href = 'courses.html';
}

// --- UI Update Functions ---

function showLoggedInSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('logged-in-section').style.display = 'block';

    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        document.getElementById('logged-in-user').textContent = decodedToken.userId;

        if (decodedToken.globalPermissions.includes('manage_users')) {
            document.getElementById('admin-button').style.display = 'inline-block';
        } else {
            document.getElementById('admin-button').style.display = 'none';
        }
    }
}

function hideLoggedInSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('logged-in-section').style.display = 'none';
    document.getElementById('admin-button').style.display = 'none';
}

// --- Profile Page Functions ---

async function loadProfile() {
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/users/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            document.getElementById('profile-username').textContent = data.username;
            document.getElementById('profile-email').textContent = data.email || '';
            document.getElementById('profile-first-name').textContent = data.first_name || '';
            document.getElementById('profile-last-name').textContent = data.last_name || '';

            document.getElementById('edit-email').value = data.email || '';
            document.getElementById('edit-first-name').value = data.first_name || '';
            document.getElementById('edit-last-name').value = data.last_name || '';
        }  else if (response.status === 401) {
            removeToken();
            window.location.href = 'index.html';
        }else {
            console.error('Failed to load profile:', response.status);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function updateProfile() {
    const email = document.getElementById('edit-email').value;
    const firstName = document.getElementById('edit-first-name').value;
    const lastName = document.getElementById('edit-last-name').value;
    const messageEl = document.getElementById('update-message');

    try {
        const response = await fetch('http://localhost:3000/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ email, first_name: firstName, last_name: lastName }),
        });

        const data = await response.json();

        if (response.ok) {
            messageEl.textContent = 'Profile updated successfully!';
            await loadProfile();
        } else {
            messageEl.textContent = data.message || 'Profile update failed.';
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        messageEl.textContent = 'An error occurred during profile update.';
    }
}
// --- Admin Page Functions ---
async function createCourse() {
    const courseName = document.getElementById('course-name').value;
    const courseDescription = document.getElementById('course-description').value;
    const messageEl = document.getElementById('create-course-message');

    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ course_name: courseName, course_description: courseDescription }),
        });

        const data = await response.json();

        if (response.ok) {
            messageEl.textContent = `Course created with ID: ${data.courseId}`;
        } else {
            messageEl.textContent = data.message || 'Course creation failed.';
        }
    } catch (error) {
        console.error('Error creating course:', error);
        messageEl.textContent = 'An error occurred during course creation.';
    }
}

async function loadUsers() {
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        });

        if (response.ok) {
            const users = await response.json();
            const userList = document.getElementById('user-list');
            userList.innerHTML = '';

            users.forEach(user => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${user.username} (ID: ${user.user_id}, Email: ${user.email})
                                     <button onclick="loadUserDetails(${user.user_id})">View Details</button>`;
                console.log("loadUsers: Created list item:", listItem.innerHTML); // LOGGING
                userList.appendChild(listItem);
            });
        } else if (response.status === 403) {
          document.getElementById('user-list').textContent = "Forbidden: Admin Access Required";
        } else if (response.status === 401) {
             window.location.href = 'index.html'
        }
         else {
            console.error('Failed to load users:', response.status);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadUserDetails(userId) {
    console.log("loadUserDetails: Called with userId:", userId); // LOGGING

    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const url = `http://localhost:3000/api/users/getUser/${userId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            alert(`User Details:\nUsername: ${user.username}\nEmail: ${user.email}\nFirst Name: ${user.first_name}\nLast Name: ${user.last_name}`);
        } else if (response.status === 404) {
            alert('User not found');
        } else {
            console.error('Failed to load user details:', response.status);
        }
    } catch (error) {
        console.error('Error loading user details:', error);
    }
}

// --- Course Page Functions ---

async function loadCoursesPage() {
    if (!getToken()) {
        window.location.href = 'index.html'; // Redirect if not logged in
        return;
    }

    try {
        const [allCoursesResponse, enrolledCoursesResponse] = await Promise.all([
            fetch('http://localhost:3000/api/courses/all', { // New endpoint (see below)
                method: 'GET',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            }),
            fetch('http://localhost:3000/api/courses/enrolled', { // New endpoint (see below)
                method: 'GET',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            }),
        ]);

        if (!allCoursesResponse.ok || !enrolledCoursesResponse.ok) {
            console.error("Failed to fetch courses:", allCoursesResponse.status, enrolledCoursesResponse.status);
            return; // Handle errors appropriately
        }

        const allCourses = await allCoursesResponse.json();
        const enrolledCourses = await enrolledCoursesResponse.json();

        // Determine available courses (those *not* in enrolledCourses)
        const availableCourses = allCourses.filter(course =>
            !enrolledCourses.some(enrolledCourse => enrolledCourse.course_id === course.course_id)
        );

        displayCourses(availableCourses, 'available-courses-list', true); // Pass enroll=true
        displayCourses(enrolledCourses, 'enrolled-courses-list', false);  // Pass enroll=false


    } catch (error) {
        console.error('Error loading courses page:', error);
    }
}

function displayCourses(courses, listId, enroll) {
    const listElement = document.getElementById(listId);
    listElement.innerHTML = ''; // Clear existing list

    courses.forEach(course => {
        const listItem = document.createElement('li');
        listItem.textContent = `${course.course_name} - ${course.description}`;

        if (enroll) {
            const enrollButton = document.createElement('button');
            enrollButton.textContent = 'Enroll';
            enrollButton.onclick = () => enrollInCourse(course.course_id);
            listItem.appendChild(enrollButton);
        } else {
            const unenrollButton = document.createElement('button');
            unenrollButton.textContent = 'Unenroll';
            unenrollButton.onclick = () => unenrollFromCourse(course.course_id);
            listItem.appendChild(unenrollButton);
        }

        listElement.appendChild(listItem);
    });
}

async function enrollInCourse(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        });

        if (response.ok) {
            alert(`Successfully enrolled in course ${courseId}`);
             loadCoursesPage(); // Refresh the course list
        } else {
            const data = await response.json();
            alert(`Enrollment failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error enrolling in course:', error);
        alert('An error occurred during enrollment.');
    }
}
async function unenrollFromCourse(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/unenroll`, {
            method: 'DELETE', // Use DELETE for unenrolling
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
        });

        if (response.ok) {
            alert(`Successfully unenrolled from course ${courseId}`);
            loadCoursesPage();
        } else {
            const data = await response.json();
            alert(`Unenrollment failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error unenrolling from course:', error);
        alert('An error occurred during unenrollment.');
    }
}


// --- Page Load Logic ---

if (window.location.pathname.endsWith('profile.html')) {
    loadProfile();
} else if (window.location.pathname.endsWith('admin.html')) {
    loadUsers();
} else if (window.location.pathname.endsWith('index.html') && getToken()) {
    showLoggedInSection();
} else if (window.location.pathname.endsWith('courses.html')) { // NEW
    loadCoursesPage();
}