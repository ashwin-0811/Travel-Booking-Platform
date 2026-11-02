let currentSearchType = 'flight';

function switchTab(type) {
    currentSearchType = type;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const inputs = document.getElementById('dynamic-inputs');
    const btn = document.querySelector('.search-btn');
    
    if(type === 'flight') {
        inputs.innerHTML = `
            <div class="input-group"><label>From</label><input type="text" id="from" placeholder="e.g., Vijayawada" required></div>
            <div class="input-group" style="flex: 0.2; justify-content: flex-end; padding-bottom: 12px; text-align: center;"><i class="fas fa-exchange-alt" style="color: #00b4d8; cursor: pointer; font-size: 20px;"></i></div>
            <div class="input-group"><label>To</label><input type="text" id="to" placeholder="e.g., Sydney (SYD)" required></div>
            <div class="input-group"><label>Depart</label><input type="date" id="date" required></div>
            <div class="input-group"><label>Travellers</label><input type="number" id="travellers" min="1" value="1" required></div>
        `;
        btn.innerText = "Search flights";
    } else if(type === 'hotel') {
        inputs.innerHTML = `
            <div class="input-group"><label>State</label><input type="text" id="state" placeholder="e.g., Delhi" required></div>
            <div class="input-group"><label>City / Town</label><input type="text" id="place" placeholder="e.g., New Delhi" required></div>
            <div class="input-group"><label>Check-in</label><input type="date" id="date" required></div>
            <div class="input-group"><label>Check-out</label><input type="date" id="checkout" required></div>
            <div class="input-group"><label>Guests</label><input type="number" id="guests" min="1" value="2" required></div>
        `;
        btn.innerText = "Search hotels";
    } else if(type === 'bus') {
        inputs.innerHTML = `
            <div class="input-group"><label>Pickup location</label><input type="text" id="from" placeholder="e.g., Vijayawada Bus Stand" required></div>
            <div class="input-group"><label>Drop location</label><input type="text" id="to" placeholder="e.g., Bandra West" required></div>
            <div class="input-group"><label>Pickup time</label><input type="datetime-local" id="date" required></div>
        `;
        btn.innerText = "Find buses";
    }
}

function handleSearch(e) {
    e.preventDefault();
    const searchData = { type: currentSearchType, date: document.getElementById('date').value };
    
    if(currentSearchType === 'flight') {
        searchData.from = document.getElementById('from').value;
        searchData.to = document.getElementById('to').value;
        searchData.travellers = document.getElementById('travellers').value;
    } else if (currentSearchType === 'bus') {
        searchData.from = document.getElementById('from').value;
        searchData.to = document.getElementById('to').value;
    } else if (currentSearchType === 'hotel') {
        searchData.state = document.getElementById('state').value;
        searchData.place = document.getElementById('place').value;
        searchData.checkout = document.getElementById('checkout').value;
        searchData.guests = document.getElementById('guests').value;
    }
    
    localStorage.setItem('recentSearch', JSON.stringify(searchData));
    window.location.href = 'results.html';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if(email === 'admin@travelwithus.com' && password === 'admin123') {
        localStorage.setItem('currentUser', JSON.stringify({role: 'admin', name: 'System Admin'}));
        alert("LOGIN SUCCESSFUL");
        window.location.href = 'admin.html';
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    if(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert("LOGIN SUCCESSFUL");
        window.location.href = 'index.html';
    } else {
        alert("Invalid credentials. Please try again or sign up.");
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if(password.length < 6) { alert("Password must be at least 6 characters long."); return; }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if(users.some(u => u.email === email)) { alert("Email is already registered!"); return; }
    
    users.push({name, email, password, role: 'user'});
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration Successful! You can now login.");
    window.location.href = 'login.html';
}

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const authLink = document.getElementById('auth-link');
    if(user && authLink) {
        authLink.textContent = "Logout (" + user.name + ")";
        authLink.href = "#";
        authLink.onclick = () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        };
    }
}

async function loadResults() {
    const data = JSON.parse(localStorage.getItem('recentSearch'));
    if(!data) { window.location.href = 'index.html'; return; }
    
    const container = document.getElementById('results-grid');
    const title = document.getElementById('results-title');
    container.innerHTML = '<p style="text-align:center; font-size:18px;">Loading results from API...</p>';
    
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Network response was not ok");
        const apiData = await response.json();
        
        container.innerHTML = '';
        let items = [];
        let displayDate = data.date;
        
        if(data.type === 'flight') {
            title.innerText = `Flights: ${data.from} ✈️ ${data.to} (${data.travellers} Travellers)`;
            items = apiData.flights;
        } else if (data.type === 'bus') {
            displayDate = data.date.replace('T', ' '); 
            title.innerText = `Buses: ${data.from} 🚌 ${data.to}`;
            items = apiData.buses;
        } else {
            title.innerText = `Hotels in ${data.place}, ${data.state} (${data.guests} Guests)`;
            items = apiData.hotels;
        }

        const fallbackImg = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80";

        items.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='${fallbackImg}'">
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p style="color: #666;"><i class="fas fa-calendar"></i> <strong>Travel Date:</strong> ${displayDate}</p>
                    <p class="price">₹${item.price.toLocaleString()}</p>
                    <button class="btn" onclick="bookItem('${item.name}', ${item.price}, '${displayDate}')" style="margin-top:auto;">Book Now</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = `
            <div style="text-align: center; color: red; grid-column: 1 / -1;">
                <h3>⚠️ Local Server Required</h3>
                <p>The browser blocked the JSON data fetch due to CORS policies.</p>
                <p>Please run this project using a local server (like the "Live Server" extension in VS Code) to view the API data.</p>
            </div>
        `;
    }
}

function bookItem(name, price, date) {
    if(!localStorage.getItem('currentUser')) {
        alert("Please login to proceed with booking.");
        window.location.href = 'login.html';
        return;
    }
    sessionStorage.setItem('pendingBooking', JSON.stringify({name, price, date}));
    window.location.href = 'checkout.html';
}

function processPayment(e) {
    e.preventDefault();
    const pending = JSON.parse(sessionStorage.getItem('pendingBooking'));
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    bookings.push({ ...pending, userEmail: user.email, id: Date.now(), status: 'Confirmed' });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    sessionStorage.removeItem('pendingBooking');
    
    alert("Payment Successful! Your booking is confirmed.");
    window.location.href = 'bookings.html';
}

function loadBookings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user) { window.location.href = 'login.html'; return; }
    
    const allBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const myBookings = allBookings.filter(b => b.userEmail === user.email);
    const container = document.getElementById('bookings-grid');
    
    if(myBookings.length === 0) {
        container.innerHTML = "<p style='font-size: 18px; color: #555;'>You have no active bookings.</p>";
        return;
    }
    
    container.innerHTML = '';
    myBookings.forEach(b => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                <h3>${b.name}</h3>
                <p><strong>Date:</strong> ${b.date}</p>
                <p><strong>Amount Paid:</strong> ₹${b.price.toLocaleString()}</p>
                <p style="color: #2a9d8f; font-weight: bold;">Status: ${b.status}</p>
                <button class="btn" style="background:#e63946; margin-top:15px;" onclick="cancelBooking(${b.id})">Cancel Booking</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function cancelBooking(id) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    alert("Booking Cancelled Successfully");
    loadBookings();
}

function loadAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    document.getElementById('total-users').innerText = users.length;
    document.getElementById('total-bookings').innerText = bookings.length;
}