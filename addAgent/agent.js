const API_URL = 'https://api.real-estate-manager.redberryinternship.ge/api/agents';
const API_TOKEN = '9d07ad01-825b-44fd-b59d-1dc537f0f30b';


const form = document.querySelector('form');
const nameInput = document.getElementById('name');
const surnameInput = document.getElementById('lname');
const emailInput = document.getElementById('mail');
const phoneInput = document.getElementById('number');
const avatarInput = document.getElementById('file-input');
const closeButton = document.getElementById('close-button');
const submitButton = document.getElementById('submit-button');
const imagePreview = document.getElementById('image-preview');
const uploadIcon = document.querySelector('.upload-icon');

avatarInput.addEventListener('change', handleImageUpload);
form.addEventListener('submit', handleSubmit);
closeButton.addEventListener('click', handleClose);

function handleSubmit(event) {
    event.preventDefault();
    
    if (validateForm()) {
        const agentData = createAgentFormData();
        sendAgentData(agentData);
    }
}

function validateForm() {
    let isValid = true;

    function validateField(input, condition, errorMessage) {
        if (!condition) {
            showError(input, errorMessage);
            isValid = false;
        } else {
            resetError(input);
        }
    }

    validateField(nameInput, nameInput.value.length >= 2, 'სახელი უნდა მოიცავდეს მინიმუმ 2 სიმბოლოს');
    validateField(surnameInput, surnameInput.value.length >= 2, 'გვარი უნდა მოიცავდეს მინიმუმ 2 სიმბოლოს');

    const emailRegex = /@redberry\.ge$/;
    validateField(emailInput, emailRegex.test(emailInput.value), 'ელ. ფოსტა უნდა დასრულდეს @redberry.ge-თ');

    const phoneRegex = /^5\d{8}$/;
    validateField(phoneInput, phoneRegex.test(phoneInput.value), 'ტელეფონის ნომერი უნდა იყოს ფორმატში 5XXXXXXXXX');

    if (avatarInput.files.length === 0) {
        showError(avatarInput, 'გთხოვთ აირჩიოთ ფოტო');
        isValid = false;
    } else {
        resetError(avatarInput);
    }

    return isValid;
}


function showError(input, message) {
    input.style.borderColor = 'red';
    let errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function resetError(input) {
    input.style.borderColor = '';
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

[nameInput, surnameInput, emailInput, phoneInput].forEach(input => {
    input.addEventListener('input', () => {
        validateForm();
    });
});

avatarInput.addEventListener('change', () => {
    handleImageUpload({ target: avatarInput });
    validateForm();
});

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.style.display = 'block';
            imagePreview.src = e.target.result;
            uploadIcon.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
    validateForm();
}

function createAgentFormData() {
    const formData = new FormData();
    
    formData.append('name', nameInput.value);
    formData.append('surname', surnameInput.value);
    formData.append('email', emailInput.value);
    formData.append('phone', phoneInput.value);
    
    if (avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
    }
    
    return formData;
}

function sendAgentData(formData) {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        resetForm();
        handleClose();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function resetForm() {
    form.reset();
    [nameInput, surnameInput, emailInput, phoneInput, avatarInput].forEach(resetError);
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    uploadIcon.style.display = 'block';
}

function handleClose() {
    window.parent.postMessage('closeIframe', '*');
    console.log('Close request sent');
}
