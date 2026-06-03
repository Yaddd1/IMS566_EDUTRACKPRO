// ============================================================================
// 1. LOCAL STORAGE & DATA INITIALIZATION
// ============================================================================
const defaultStudents = [
    { id: "WMA21001", name: "Ahmad Zaki", course: "Computer Science", webMark: 88, dbMark: 76, mathMark: 90 },
    { id: "WMA21002", name: "Siti Nurhaliza", course: "Information Systems", webMark: 92, dbMark: 85, mathMark: 78 },
    { id: "WMA21003", name: "Muhammad Adam", course: "Software Engineering", webMark: 65, dbMark: 60, mathMark: 55 }
];

// Initialize local storage with default data if empty
if (!localStorage.getItem('students') || JSON.parse(localStorage.getItem('students')).length === 0) {
    localStorage.setItem('students', JSON.stringify(defaultStudents));
}

let students = JSON.parse(localStorage.getItem('students'));

// ============================================================================
// 2. AUTHENTICATION SYSTEM (LOGIN & LOGOUT)
// ============================================================================
function prosesLogin(event) {
    event.preventDefault(); 
    
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMessage');

    if (usernameInput === 'admin' && passwordInput === '1234') {
        if (errorMsg) errorMsg.classList.add('hidden');
        window.location.replace('dashboard.html'); 
    } else {
        if (errorMsg) errorMsg.classList.remove('hidden');
    }
}

function logout() {
    window.location.replace('index.html');
}

// ============================================================================
// 3. STUDENT DIRECTORY MANAGEMENT
// ============================================================================
function displayStudents() {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; 

    students.forEach((student, index) => {
        const row = `
            <tr class="hover:bg-slate-800/30 transition group">
                <td class="py-4 font-mono font-bold text-indigo-400">${student.id}</td>
                <td class="py-4 text-slate-200 font-medium">${student.name}</td>
                <td class="py-4 text-slate-400">${student.course}</td>
                <td class="py-4 text-right">
                    <button onclick="deleteStudent(${index})" class="text-rose-400 hover:text-rose-300 font-semibold transition text-xs border border-rose-500/10 hover:border-rose-500/30 rounded-lg px-2.5 py-1.5 bg-rose-500/5">Remove</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Event listener for adding a new student record
const addStudentForm = document.getElementById('addStudentForm');
if (addStudentForm) {
    addStudentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newStudent = {
            id: document.getElementById('studentId').value.trim(),
            name: document.getElementById('studentName').value.trim(),
            course: document.getElementById('studentCourse').value.trim(),
            // Random grade generation (20 - 95) for dashboard charting simulation
            webMark: Math.floor(Math.random() * (95 - 20 + 1)) + 20,
            dbMark: Math.floor(Math.random() * (95 - 20 + 1)) + 20,
            mathMark: Math.floor(Math.random() * (95 - 20 + 1)) + 20
        };

        students.push(newStudent);
        localStorage.setItem('students', JSON.stringify(students)); 
        
        displayStudents(); 
        
        alert(`SUCCESS!\n\nStudent record for "${newStudent.name}" (${newStudent.id}) has been successfully registered.`);
        
        addStudentForm.reset(); 
        showToast('Student Registered Successfully!');
    });
}

function deleteStudent(index) {
    if (confirm('Are you sure you want to delete this student record?')) {
        students.splice(index, 1);
        localStorage.setItem('students', JSON.stringify(students));
        displayStudents();
        showToast('Record deleted successfully.');
    }
}

// ============================================================================
// 4. GRADEBOOK MATRIX MANAGEMENT
// ============================================================================
function displayGrades(filterType = 'all') {
    const gradesTableBody = document.getElementById('gradesTableBody');
    if (!gradesTableBody) return;

    gradesTableBody.innerHTML = ''; 

    students.forEach((student) => {
        const webDesignMark = student.webMark || 70;
        const dbMark = student.dbMark || 65;
        const mathMark = student.mathMark || 75;
        
        const average = (webDesignMark + dbMark + mathMark) / 3;
        let statusBadge = '';
        let classification = '';
        
        if (average >= 75) {
            statusBadge = `<span class="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">Distinction</span>`;
            classification = 'distinction';
        } else if (average >= 50) {
            statusBadge = `<span class="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">Pass</span>`;
            classification = 'passing';
        } else {
            statusBadge = `<span class="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">Needs Help</span>`;
            classification = 'intervention';
        }
        
        if (filterType !== 'all' && filterType !== classification) {
            return; 
        }

        const row = `
            <tr class="hover:bg-slate-800/30 transition">
                <td class="py-4 font-medium text-slate-200">${student.name}</td>
                <td class="py-4 font-mono text-slate-400">${webDesignMark}</td>
                <td class="py-4 font-mono text-slate-400">${dbMark}</td>
                <td class="py-4 font-mono text-slate-400">${mathMark}</td>
                <td class="py-4 text-right">${statusBadge}</td>
            </tr>
        `;
        gradesTableBody.innerHTML += row;
    });
}

function filterGrades(type) {
    displayGrades(type);
}

// ============================================================================
// 5. DASHBOARD STATISTICAL CALCULATIONS
// ============================================================================
function updateDashboardStats() {
    const totalEl = document.getElementById('totalStudents');
    const gpaEl = document.getElementById('averageGpa');
    const passingEl = document.getElementById('passingRate');
    
    if (!totalEl) return; 

    totalEl.innerText = students.length;

    if (students.length === 0) {
        if (gpaEl) gpaEl.innerText = "0.00";
        if (passingEl) passingEl.innerText = "0.0%";
        return;
    }

    let totalGpaSum = 0;
    let totalPassingStudents = 0;

    students.forEach(student => {
        const web = student.webMark || 75;
        const db = student.dbMark || 70;
        const math = student.mathMark || 80;
        
        const studentAvg = (web + db + math) / 3;
        
        // Simulation of academic GPA scaling (4.0 Max)
        let studentGpa = 0.0;
        if (studentAvg >= 80) studentGpa = 4.0;
        else if (studentAvg >= 75) studentGpa = 3.67;
        else if (studentAvg >= 70) studentGpa = 3.33;
        else if (studentAvg >= 65) studentGpa = 3.0;
        else if (studentAvg >= 60) studentGpa = 2.67;
        else if (studentAvg >= 50) studentGpa = 2.0;
        else studentGpa = 1.0;

        totalGpaSum += studentGpa;

        if (studentAvg >= 50) {
            totalPassingStudents++;
        }
    });

    const finalCohortGpa = (totalGpaSum / students.length).toFixed(2);
    if (gpaEl) gpaEl.innerText = finalCohortGpa;

    const finalPassingRate = ((totalPassingStudents / students.length) * 100).toFixed(1);
    if (passingEl) passingEl.innerText = `${finalPassingRate}%`;
}

// Placeholder for chart orchestration if needed externally
function renderChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
}

// Component UI Toast notification animation logic
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;

    msgEl.innerText = message;
    toast.classList.remove('translate-x-80', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-80', 'opacity-0');
    }, 3000);
}

// Automate initial layout generation based on current DOM view
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById('studentTableBody')) displayStudents();
    if (document.getElementById('gradesTableBody')) displayGrades();
});