const API_URL = 'https://api.real-estate-manager.redberryinternship.ge/api';
const API_TOKEN = '9d07ad01-825b-44fd-b59d-1dc537f0f30b';


const form = document.querySelector('form');
const addressInput = document.getElementById('city');
const imageInput = document.getElementById('file-input');
const regionSelect = document.getElementById('region');
const citySelect = document.getElementById('district');
const zipCodeInput = document.getElementById('address');
const priceInput = document.getElementById('price');
const areaInput = document.getElementById('area');
const bedroomInput = document.getElementById('bedroom-number');
const descriptionInput = document.getElementById('details');
const transactionTypeInputs = document.querySelectorAll('input[name="transaction-type"]');
const forRentRadio = document.getElementById('for-rent');
const forSaleRadio = document.getElementById('for-sale');
const agentSelect = document.getElementById('agent');
const closeButton = document.getElementById('go-back');
const submitButton = document.querySelector('button[type="submit"]');
const imagePreview = document.getElementById('image-preview');
const uploadIcon = document.querySelector('.upload-icon');


imageInput.addEventListener('change', handleImageUpload);
document.addEventListener('DOMContentLoaded', initializeForm);
form.addEventListener('submit', handleSubmit);
closeButton.addEventListener('click', handleClose);
regionSelect.addEventListener('change', handleRegionChange);

let allCities = [];


async function initializeForm() {
    await fetchRegions();
    await fetchAllCities();
    await fetchAgents();
}

async function fetchRegions() {
    try {
        const response = await fetch(`${API_URL}/regions`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const regions = await response.json();
        populateRegionSelect(regions);
    } catch (error) {
        console.error('Error fetching regions:', error);
    }
}

async function fetchAllCities() {
    try {
        const response = await fetch(`${API_URL}/cities`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        allCities = await response.json();
    } catch (error) {
        console.error('Error fetching cities:', error);
    }
}

function populateRegionSelect(regions) {
    regionSelect.innerHTML = '<option value="">აირჩიეთ რეგიონი</option>';
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        option.textContent = region.name;
        regionSelect.appendChild(option);
    });
}

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
}

function handleRegionChange() {
    const selectedRegionId = regionSelect.value;
    citySelect.innerHTML = '<option value="">აირჩიეთ ქალაქი</option>';
    if (selectedRegionId) {
        const filteredCities = allCities.filter(city => city.region_id == selectedRegionId);
        populateCitySelect(filteredCities);
    }
}

function populateCitySelect(cities) {
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        citySelect.appendChild(option);
    });
}

async function fetchAgents() {
    try {
        const response = await fetch(`${API_URL}/agents`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        });
        const agents = await response.json();
        populateAgentSelect(agents);
    } catch (error) {
        console.error('Error fetching agents:', error);
    }
}

function populateAgentSelect(agents) {
    agentSelect.innerHTML = '<option value="">აირჩიეთ აგენტი</option>';
    agents.forEach(agent => {
        const option = document.createElement('option');
        option.value = agent.id;
        option.textContent = `${agent.name} ${agent.surname}`;
        agentSelect.appendChild(option);
    });
}

function handleSubmit(event) {
    event.preventDefault();
    
    if (validateForm()) {
        const apartmentData = createApartmentData();
        sendApartmentData(apartmentData);
    }
}

function validateForm() {
    let isValid = true;

    if (addressInput.value.length < 2) {
        showError(addressInput, 'მისამართი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს');
        isValid = false;
    } else {
        resetError(addressInput);
    }

    if (imageInput.files.length === 0) {
        showError(imageInput, 'გთხოვთ აირჩიოთ ფოტო');
        isValid = false;
    } else {
        const file = imageInput.files[0];
        if (!file.type.startsWith('image/')) {
            showError(imageInput, 'გთხოვთ აირჩიოთ მხოლოდ სურათის ფაილი');
            isValid = false;
        } else if (file.size > 1024 * 1024) {
            showError(imageInput, 'სურათის ზომა არ უნდა აღემატებოდეს 1MB-ს');
            isValid = false;
        } else {
            resetError(imageInput);
        }
    }

    if (!regionSelect.value) {
        showError(regionSelect, 'გთხოვთ აირჩიოთ რეგიონი');
        isValid = false;
    } else {
        resetError(regionSelect);
    }

    if (!citySelect.value) {
        showError(citySelect, 'გთხოვთ აირჩიოთ ქალაქი');
        isValid = false;
    } else {
        resetError(citySelect);
    }

    if (!/^\d+$/.test(zipCodeInput.value)) {
        showError(zipCodeInput, 'საფოსტო ინდექსი უნდა შეიცავდეს მხოლოდ რიცხვებს');
        isValid = false;
    } else {
        resetError(zipCodeInput);
    }

    if (!/^\d+$/.test(priceInput.value)) {
        showError(priceInput, 'ფასი უნდა შეიცავდეს მხოლოდ რიცხვებს');
        isValid = false;
    } else {
        resetError(priceInput);
    }

    if (!/^\d+$/.test(areaInput.value)) {
        showError(areaInput, 'ფართობი უნდა შეიცავდეს მხოლოდ რიცხვებს');
        isValid = false;
    } else {
        resetError(areaInput);
    }

    if (!/^\d+$/.test(bedroomInput.value) || parseFloat(bedroomInput.value) % 1 !== 0) {
        showError(bedroomInput, 'საძინებლების რაოდენობა უნდა იყოს მთელი რიცხვი');
        isValid = false;
    } else {
        resetError(bedroomInput);
    }

    if (descriptionInput.value.trim().split(/\s+/).length < 5) {
        showError(descriptionInput, 'აღწერა უნდა შეიცავდეს მინიმუმ 5 სიტყვას');
        isValid = false;
    } else {
        resetError(descriptionInput);
    }

    if (!Array.from(transactionTypeInputs).some(input => input.checked)) {
        showError(transactionTypeInputs[0], 'გთხოვთ აირჩიოთ გაყიდვა ან გაქირავება');
        isValid = false;
    } else {
        resetError(transactionTypeInputs[0]);
    }

    if (!agentSelect.value) {
        showError(agentSelect, 'გთხოვთ აირჩიოთ აგენტი');
        isValid = false;
    } else {
        resetError(agentSelect);
    }

    return isValid;
}

function showError(input, message) {
    input.style.borderColor = 'red';
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function resetError(input) {
    input.style.borderColor = '';
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}


function createApartmentData() {
    const formData = new FormData();
    
    formData.append('address', addressInput.value);
    formData.append('image', imageInput.files[0]);
    formData.append('region_id', regionSelect.value);
    formData.append('city_id', citySelect.value);
    formData.append('zip_code', zipCodeInput.value);
    formData.append('price', priceInput.value);
    formData.append('area', areaInput.value);
    formData.append('bedrooms', bedroomInput.value);
    formData.append('description', descriptionInput.value);
    formData.append('is_rental', forRentRadio.checked ? 1 : 0);
    formData.append('agent_id', agentSelect.value);
    
    return formData;
}

async function sendApartmentData(formData) {
    try {
        const response = await fetch(`${API_URL}/real-estates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: formData
        });
        const data = await response.json();
        console.log('Success:', data);
        resetForm();
        handleClose();
    } catch (error) {
        console.error('Error:', error);
    }
}

function resetForm() {
    form.reset();
    [addressInput, imageInput, regionSelect, citySelect, zipCodeInput, priceInput, areaInput, bedroomInput, descriptionInput, forSaleRadio, agentSelect].forEach(resetError);
    citySelect.innerHTML = '<option value="">აირჩიეთ ქალაქი</option>';
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    uploadIcon.style.display = 'block';
}

function handleClose() {
    window.location.href = '/mainPage/index.html';
}


document.querySelectorAll('form p').forEach(p => {
    p.setAttribute('data-original-text', p.textContent);
});

closeButton.addEventListener('click', function() {
    window.history.back();
});
