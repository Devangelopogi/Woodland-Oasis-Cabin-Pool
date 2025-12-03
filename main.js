// =======================================================================
// === CONFIGURATION (PALITAN ITO NG INYONG ACTUAL IDs) ===================
// =======================================================================

const userSessionKey = 'woodland_user';
const CLIENT_ID = "1044410277639-ga1gp2edhilolaaqfsmka06tt0eapev3.apps.googleusercontent.com";

// EmailJS Configuration (Tiyakin na naka-link ang EmailJS library sa HTML)
const EMAILJS_USER_ID = 'YOUR_USER_ID';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';


// =======================================================================
// === 1. GOOGLE SIGN-IN & SESSION MANAGEMENT ==============================
// =======================================================================

const currentPath = window.location.pathname;

// Session Check (Para sa home.html - Proteksyon)
if (currentPath.includes('home.html')) {
  const currentUser = localStorage.getItem(userSessionKey);
  if (!currentUser) {
    // HINDI naka-login, kaya i-redirect pabalik sa login page
    window.location.href = 'index.html';
  }
}


// Login Handler (Tinatawag ng GSI One Tap at Button Click)
function handleCredentialResponse(response) {
  try {
    // I-decode ang token at I-SAVE sa localStorage (ITO ANG DAHILAN NG SESSION)
    const data = JSON.parse(atob(response.credential.split('.')[1]));
    localStorage.setItem(userSessionKey, JSON.stringify(data));
    window.location.href = 'home.html';
  } catch (e) {
    console.error("Login failed:", e);
  }
}


// Logout Function (Para sa home.html)
function logoutUser() {
  localStorage.removeItem(userSessionKey);
  
  // Disable GSI auto-select sa browser
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  window.location.href = 'index.html';
}


// =======================================================================
// === 2. EMAILJS INQUIRY FORM LOGIC (WITH RECAPTCHA CHECK) ================
// =======================================================================

// 1. Initialize EmailJS
if (typeof emailjs !== 'undefined' && EMAILJS_USER_ID !== 'YOUR_USER_ID') {
  emailjs.init(EMAILJS_USER_ID);
} else if (currentPath.includes('home.html') && EMAILJS_USER_ID === 'YOUR_USER_ID') {
  console.warn("EmailJS initialization skipped. Ensure EmailJS library is linked and User ID is set.");
}


function sendMail(event) {
  event.preventDefault(); // Prevent default form submission
  
  // Preliminary Check
  if (typeof emailjs === 'undefined' || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
    alert("ERROR: EmailJS not configured. Please check your IDs and library link.");
    return;
  }
  
  const form = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  const messageDiv = document.getElementById('bookingMessage');
  
  // -----------------------------------------------------------
  // === 🛑 RECAPTCHA V2 CHECK (BAGONG IDINAGDAG) ===============
  // -----------------------------------------------------------
  // Tiyakin na naka-load ang grecaptcha bago gamitin
  if (typeof grecaptcha !== 'undefined') {
    const recaptchaResponse = grecaptcha.getResponse();
    
    if (recaptchaResponse.length === 0) {
      // Error: Hindi na-check ang reCAPTCHA
      messageDiv.classList.remove('d-none', 'alert-success');
      messageDiv.classList.add('alert-danger');
      messageDiv.textContent = 'Please confirm you are not a robot by checking the box.';
      messageDiv.scrollIntoView({ behavior: 'smooth' });
      return; // Harangin ang submission
    }
  }
  // -----------------------------------------------------------
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  messageDiv.classList.add('d-none'); // Hide previous messages
  
  const templateParams = {
    check_in_date: document.getElementById('checkInDate').value,
    check_out_date: document.getElementById('checkOutDate').value,
    package_name: form.elements['package_name'].value,
    adults_count: document.getElementById('adults').value,
    children_count: document.getElementById('children').value,
    user_name: document.getElementById('contactName').value,
    user_email: document.getElementById('contactEmail').value,
    user_phone: document.getElementById('contactPhone').value
    // Hindi na natin isasama ang recaptchaResponse dahil EmailJS lang ang ginagamit.
  };
  
  // 2. Send the email
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(function(response) {
      console.log('SUCCESS!', response.status, response.text);
      
      messageDiv.classList.remove('d-none', 'alert-danger');
      messageDiv.classList.add('alert-success');
      messageDiv.textContent = 'Success! Your inquiry has been sent. We will contact you shortly.';
      form.reset();
    }, function(error) {
      console.log('FAILED...', error);
      
      messageDiv.classList.remove('d-none', 'alert-success');
      messageDiv.classList.add('alert-danger');
      messageDiv.textContent = 'Failed to send inquiry. Please try again or contact us directly.';
    })
    .finally(() => {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Booking Inquiry';
      
      // I-reset ang reCAPTCHA para sa susunod na submission
      if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
      }
    });
  
  // Show message div
  messageDiv.classList.remove('d-none');
  messageDiv.scrollIntoView({ behavior: 'smooth' });
}


// =======================================================================
// === 3. GSI MANUAL BUTTON RENDER (Gumagana lang ito sa index.html) ========
// =======================================================================

// Ginagamit lang ito kung hindi gagamitin ang data-auto-render method (g_id_signin class)
/*
if (document.getElementById("google-button-container")) {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse
    });
    
     google.accounts.id.renderButton(
        document.getElementById("google-button-container"),
        { type: "standard", theme: "filled_blue", size: "large", text: "signin_with", shape: "pill" }
    );
}
*/