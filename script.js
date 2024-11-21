
    $(document).ready(function() {
      // JavaScript (inside script.js or inline)
$("#registerForm").submit(function(event) {
    event.preventDefault();
    
    // Get form data
    const username = $("#username").val();
    const pin = $("#pin").val();
    const initialDeposit = $("#initialDeposit").val();
    
    // Show the loading spinner
    $("#loader").show(); // Show the loader spinner
    $("#registerMessage").html(""); // Clear previous messages
    
    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/register',
        method: 'POST',
        data: JSON.stringify({ username, pin, initialDeposit }),
        contentType: 'application/json',
        success: function(response) {
            $("#loader").hide(); // Hide the loader spinner
            $("#registerMessage").html(`<div class="alert alert-success">${response.message}</div>`);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000); // Delay for UX
        },
        error: function(xhr) {
            $("#loader").hide(); // Hide the loader spinner
            $("#registerMessage").html(`<div class="alert alert-danger">${xhr.responseJSON.error}</div>`);
        }
    });
});

        


    let attemptsLeft = 3; 

$("#loginForm").submit(function(event) {
    event.preventDefault();
    const username = $("#loginUsername").val();
    const pin = $("#loginPin").val();

    if (attemptsLeft <= 0) {
        $("#loginMessage").html('<div class="alert alert-danger">Your account is locked. Please try again later.</div>');
        return;
    }

 
    $("#loader").show();
    $("#loginMessage").html(''); 

    $.ajax({
        url: 'https://trifit-2.onrender.com/api/users/login',
        method: 'POST',
        data: JSON.stringify({ username, pin }),
        contentType: 'application/json',
        success: function(response) {

            $("#loader").hide();

            localStorage.setItem('token', response.token);
            localStorage.setItem('username', username);

            $("#loginMessage").html('<div class="alert alert-success">Login successful!</div>');

       
            window.location.href = 'dashboard.html';
        },
        error: function(xhr) {
      
            $("#loader").hide();

      
            if (xhr.responseJSON.error) {
                attemptsLeft--; 

                if (attemptsLeft <= 0) {

                    $("#loginMessage").html('<div class="alert alert-danger">Your account is locked. Please try again later.</div>');
                } else {
                    // Show the remaining attempts
                    $("#loginMessage").html(`<div class="alert alert-danger">${xhr.responseJSON.error}. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.</div>`);
                }
            }
        }
    });
});

    $("#logoutButton").click(function() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        $("#dashboard").hide();
        $("#login").show();
    });
});

