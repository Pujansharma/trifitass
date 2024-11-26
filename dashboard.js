// Define the base URL for the API
const BASE_URL = 'https://trifit-2.onrender.com/api/users';

function apiRequest(endpoint, method = 'GET', data = null, headers = {}) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (data) options.body = JSON.stringify(data);
    return fetch(`${BASE_URL}${endpoint}`, options).then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    });
}

const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    alert('You need to be logged in');
    window.location.href = 'login.html';
}
document.getElementById('usernameDisplay').textContent = username;

// Fetch Balance
function fetchBalance() {
    apiRequest('/balance', 'GET', null, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            document.getElementById('balance').textContent = response.balance.toFixed(2);

            document.getElementById('accNumber').textContent = response.accountNumber;
        })
        .catch(err => {
            console.error('Error fetching balance:', err);
            alert('Error fetching balance');
        });
}
fetchBalance();

// Deposit
document.getElementById('depositForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const pin = document.getElementById('depositPin').value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    apiRequest('/deposit', 'POST', { username, pin, amount }, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            alert(response.message);
            fetchBalance();
            $('#depositModal').modal('hide');
        })
        .catch(err => {
            console.error('Error depositing money:', err);
            alert(err.error || 'Error depositing money');
        });
});

// Withdraw
document.getElementById('withdrawForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const pin = document.getElementById('withdrawPin').value;

    if (amount <= 0) {
        alert('Please enter a valid amount to withdraw.');
        return;
    }

    apiRequest('/withdraw', 'POST', { username, pin, amount }, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            alert(response.message);
            fetchBalance();
            $('#withdrawModal').modal('hide');
        })
        .catch(err => {
            console.error('Error withdrawing money:', err);
            alert(err.error || 'Error withdrawing money');
        });
});

// Transfer
document.getElementById('transferForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const recipientAccountNumber = document.getElementById('recipientAccountNumber').value;
    const pin = document.getElementById('pin').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const feePercentage = 0.02; 
    const transferFee = amount * feePercentage; 
    const netAmount = amount - transferFee;    
    const transferBalance = parseFloat(document.getElementById('balance').value);
 // Sender's balance

    // Ensure the sender has enough balance to cover the transfer
    if (transferBalance < amount) {
        alert('Insufficient balance to cover the transfer.');
        return;
    }

    // Validate that all required fields are filled
    if (!recipientAccountNumber || !pin || !amount) {
        alert('Please fill in all the fields.');
        return;
    }

    // Make the API request to transfer money
    apiRequest('/transfer', 'POST', { 
        recipientAccountNumber, 
        pin, 
        amount: netAmount // Send the net amount to the recipient (₹4.90)
    }, { 
        'Authorization': `Bearer ${token}` 
    })
        .then(response => {
            // Display the transfer success message with fee details
            document.getElementById('transferSuccess').textContent = 
    `Fee: ₹${transferFee.toFixed(2)} | ₹${amount.toFixed(2)} Transfer Successful! Recipient Received: ₹${netAmount.toFixed(2)}`;

            fetchBalance(); // Assuming this updates the UI with the new balance
            document.getElementById('transferSuccess').style.display = 'block';
        })
        .catch(err => {
            console.error('Error during transfer:', err);
            document.getElementById('transferError').textContent = err.error || 'Error during transfer.';
            document.getElementById('transferError').style.display = 'block';
        });
});


// Mini Statement
function openMiniStatementModal() {
    apiRequest('/transactions', 'GET', null, { 'Authorization': `Bearer ${token}` })
        .then(response => {
            const miniStatementBody = document.getElementById('miniStatementBody');
            miniStatementBody.innerHTML = '';
            response.transactions.forEach(transaction => {
                const row = document.createElement('tr');
                const date = new Date(transaction.timestamp);
                const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                const amount = transaction.amount;  // Assuming transaction.amount contains the original amount
                const feePercentage = 0.02;  // 2% fee
                const fee = amount * feePercentage;  // Calculate the fee
                const totalAmount = amount + fee;
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${transaction.type}</td>
                    <td>₹${amount.toFixed(2)}</td>
                    <td>₹${transaction.balanceAfter.toFixed(2)}</td>
                `;
                miniStatementBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error('Error fetching transactions:', err);
            alert('Error fetching transactions');
        });
}
document.getElementById('viewMiniStatementBtn').addEventListener('click', openMiniStatementModal);

// Logout
document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});
