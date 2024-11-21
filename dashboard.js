

const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    alert('You need to be logged in');
    window.location.href = 'login.html'; 
}
$('#usernameDisplay').text(username);

function fetchBalance() {
    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/balance',
        type: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (response) {
            $('#balance').text(response.balance);
            $('#accNumber').text(response.accountNumber);
        },
        error: function (err) {
            alert('Error fetching balance');
            console.error(err);
        }
    });
}

fetchBalance(); 


$('#depositForm').submit(function (e) {
    e.preventDefault();
    const amount = parseFloat($('#depositAmount').val());
    const pin = $('#depositPin').val();

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/deposit',
        type: 'POST',
        data: JSON.stringify({ username, pin, amount }),
        contentType: 'application/json',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (response) {
            alert(response.message);
            fetchBalance(); 
            $('#depositModal').modal('hide');
        },
        error: function (err) {
            alert(err.responseJSON.error || 'Error depositing money');
            console.error(err);
        }
    });
});


$('#withdrawForm').submit(function (e) {
    e.preventDefault();
    const amount = parseFloat($('#withdrawAmount').val());
    const pin = $('#withdrawPin').val();

    if (amount <= 0) {
        alert('Please enter a valid amount to withdraw.');
        return;
    }

    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/withdraw',
        type: 'POST',
        data: JSON.stringify({ username, pin, amount }),
        contentType: 'application/json',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (response) {
            alert(response.message);
            fetchBalance(); 
            $('#withdrawModal').modal('hide');
        },
        error: function (err) {
            alert(err.responseJSON.error || 'Error withdrawing money');
            console.error(err);
        }
    });
});

document.getElementById('transferForm').addEventListener('submit', function(event) {
    event.preventDefault();  
    const recipientAccountNumber = document.getElementById('recipientAccountNumber').value;
    const pin = document.getElementById('pin').value;
    const amount = parseFloat(document.getElementById('amount').value);


    if (!recipientAccountNumber || !pin || !amount) {
        alert('Please fill in all the fields.');
        return;
    }

    document.getElementById('transferError').style.display = 'none';
    document.getElementById('transferSuccess').style.display = 'none';

    fetch('https://trifit-2.onrender.com/api/users/transfer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            recipientAccountNumber: recipientAccountNumber,
            pin: pin,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {

            document.getElementById('transferError').textContent = data.error;
            document.getElementById('transferError').style.display = 'block';
        } else {
            document.getElementById('transferSuccess').textContent = `Transfer Successful! New Balances -  ₹${data.senderBalance}`;
            fetchBalance();
            document.getElementById('transferSuccess').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error during transfer:', error);
        document.getElementById('transferError').textContent = 'An error occurred. Please try again later.';
        document.getElementById('transferError').style.display = 'block';
    });
});


function openMiniStatementModal() {
const token = localStorage.getItem('token'); 

if (!token) {
alert("You need to login first!");
return;
}

fetch('https://trifit-2.onrender.com/api/users/transactions', {
method: 'GET',
headers: {
    'Authorization': `Bearer ${token}`,  
},
})
.then(response => response.json())
.then(data => {
if (data.transactions) {
    const miniStatementBody = document.getElementById('miniStatementBody');
    miniStatementBody.innerHTML = '';
    data.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        const date = new Date(transaction.timestamp);

const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

dateCell.textContent = formattedDate;
row.appendChild(dateCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = transaction.type;
        row.appendChild(typeCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = `₹${transaction.amount.toFixed(2)}`;
        row.appendChild(amountCell);

        const balanceCell = document.createElement('td');
        balanceCell.textContent = `₹${transaction.balanceAfter.toFixed(2)}`;
        row.appendChild(balanceCell);

        miniStatementBody.appendChild(row);
    });
} else {
    alert('Failed to load transactions');
}
})
.catch(error => {
console.error('Error fetching transactions:', error);
alert('There was an error fetching the transactions.');
});
}

document.getElementById('viewMiniStatementBtn').addEventListener('click', openMiniStatementModal);

$('#logoutButton').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html'; 
});
