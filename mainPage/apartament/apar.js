const API_URL = "https://api.real-estate-manager.redberryinternship.ge/api/real-estates";
const API_KEY = "9d07ad01-825b-44fd-b59d-1dc537f0f30b";

let allApartments = [];
let currentApartmentIndex = 0;

async function fetchApartments() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allApartments = await response.json();
    } catch (error) {
        console.error("Error fetching apartment data:", error);
    }
}

async function fetchApartmentDetails(id) {
  try {
      const response = await fetch(`${API_URL}/${id}`, {
          method: "GET",
          headers: {
              Authorization: `Bearer ${API_KEY}`,
          },
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apartmentDetails = await response.json();
      console.log("Individual Apartment Details:", apartmentDetails);
      return apartmentDetails;
  } catch (error) {
      console.error("Error fetching individual apartment data:", error);
  }
}

function displayApartmentDetails(apartment) {
  console.log("Apartment data:", apartment);

  if (!apartment) {
      console.error("No apartment data available");
      return;
  }

  const imageElement = document.querySelector('.property-image img');
  if (imageElement && apartment.image) {
      imageElement.src = apartment.image;
  }

  const tagElement = document.querySelector('.tag');
  if (tagElement) {
      tagElement.textContent = apartment.is_rental ? "ქირავდება" : "იყიდება";
  }

  const dateElement = document.querySelector('.date');
  if (dateElement && apartment.created_at) {
      dateElement.textContent = `გამოქვეყნების თარიღი ${new Date(apartment.created_at).toLocaleDateString('ka-GE')}`;
  }

  const priceElement = document.querySelector('.property-info h1');
  if (priceElement && apartment.price) {
      priceElement.textContent = `${apartment.price.toLocaleString()} ₾`;
  }

  const infoList = document.querySelector('.info-list');
  if (infoList && apartment.city && apartment.address) {
      infoList.innerHTML = `
          <p>
            <img src="/mainPage/svg/location-marker.png" class="location" alt="location">
            ${apartment.city.name}, ${apartment.address}</p>
          <p>
            <img src="/mainPage/svg/bed.png" class="bed" alt="bed">
            ${apartment.area} მ²</p>
          <p>
            <img src="/mainPage/svg/vector.png" class="vector" alt="bed">
            ${apartment.bedrooms}</p>
          <p>
             <img src="/mainPage/svg/sign.png" class="sign" alt="bed">
             ${apartment.zip_code}</p>
      `;
  }

  const descriptionElement = document.querySelector('.description');
  if (descriptionElement && apartment.description) {
      descriptionElement.textContent = apartment.description;
  }

  const agentInfo = document.querySelector('.agent-info');
  if (agentInfo && apartment.agent) {
      const agentPhotoElement = agentInfo.querySelector('.agent-photo img');
      if (agentPhotoElement && apartment.agent.image) {
          agentPhotoElement.src = apartment.agent.image;
      }

      const agentNameElement = agentInfo.querySelector('.agent-name');
      if (agentNameElement) {
          agentNameElement.textContent = `${apartment.agent.name} ${apartment.agent.surname}`;
      }

      const agentContactsElement = agentInfo.querySelector('.agent-contacts');
      if (agentContactsElement) {
          agentContactsElement.innerHTML = `
              <p>Email: ${apartment.agent.email || 'N/A'}</p>
              <p>Phone: ${apartment.agent.phone || 'N/A'}</p>
          `;
      }
  }
}

let relatedApartmentsIndex = 0;

function displayRelatedProperties() {
    const propertiesGrid = document.querySelector('.properties-grid');
    propertiesGrid.innerHTML = '';

    const otherApartments = allApartments.filter(apt => apt.id !== parseInt(new URLSearchParams(window.location.search).get('id')));

    const relatedApartments = otherApartments.slice(relatedApartmentsIndex, relatedApartmentsIndex + 4);

    relatedApartments.forEach(apartment => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card';
        propertyCard.innerHTML = `
            <img src="${apartment.image}" alt="${apartment.address}">
            <h3>${apartment.price.toLocaleString()} ₾</h3>
            <p class="address">
              <img src="/mainPage/svg/location-marker.png" class="location" alt="location">
              ${apartment.city.name}, ${apartment.address}</p>
            <div class="size">
                <p>
                  <img src="/mainPage/svg/bed.png" class="bed" alt="bed">
                  ${apartment.bedrooms}</p>
                <p>
                  <img src="/mainPage/svg/vector.png" class="vector" alt="bed">
                  ${apartment.area}m²</p>
                <p>
                  <img src="/mainPage/svg/sign.png" class="sign" alt="bed">
                  ${apartment.zip_code}</p>
            </div>
        `;
        propertyCard.addEventListener('click', () => {
            window.location.href = `apar.html?id=${apartment.id}`;
        });
        propertiesGrid.appendChild(propertyCard);
    });

    const scrollLeft = document.createElement('button');
    scrollLeft.className = 'scroll-left';
    scrollLeft.innerHTML = '&#8592;';
    const scrollRight = document.createElement('button');
    scrollRight.className = 'scroll-right';
    scrollRight.innerHTML = '&#8594;';
    
    propertiesGrid.prepend(scrollLeft);
    propertiesGrid.append(scrollRight);

    scrollLeft.addEventListener('click', () => {
        relatedApartmentsIndex = (relatedApartmentsIndex - 4 + otherApartments.length) % otherApartments.length;
        displayRelatedProperties();
    });

    scrollRight.addEventListener('click', () => {
        relatedApartmentsIndex = (relatedApartmentsIndex + 4) % otherApartments.length;
        displayRelatedProperties();
    });
}

async function deleteApartment(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Apartment deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting apartment:", error);
    return false;
  }
}


function setupEventListeners() {
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = '/mainPage/index.html';
    });

    document.querySelector('.del-list').addEventListener('click', () => {
      document.getElementById('center').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  
    document.querySelector('.close-button').addEventListener('click', () => {
      document.getElementById('center').style.display = 'none';
      document.body.style.overflow = '';
    });
  
    document.querySelector('.cancel').addEventListener('click', () => {
      document.getElementById('center').style.display = 'none';
      document.body.style.overflow = ''; 
    });
  
    document.querySelector('.confirm').addEventListener('click', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const apartmentId = urlParams.get('id');
  
      if (apartmentId) {
        const deleted = await deleteApartment(apartmentId);
        if (deleted) {
          window.location.href = '/mainPage/index.html';
        } else {
          alert('Failed to delete apartment. Please try again.');
        }
      } else {
        console.error('No apartment ID found');
      }
  
      document.getElementById('center').style.display = 'none';
      document.body.style.overflow = '';
    });
  }

async function initApartmentDetails() {
  await fetchApartments();
  
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get('id');
  
  console.log("Looking for apartment with ID:", apartmentId);

  let apartment = allApartments.find(apt => apt.id === parseInt(apartmentId));
  
  if (apartment) {
      apartment = await fetchApartmentDetails(apartmentId);
      if (apartment) {
          currentApartmentIndex = allApartments.indexOf(apartment);
          displayApartmentDetails(apartment);
          displayRelatedProperties();
      } else {
          console.error('Failed to fetch apartment details');
          document.querySelector('.property-details').innerHTML = '<p>Failed to load apartment details. Please try again.</p>';
      }
  } else {
      console.error('Apartment not found');
      document.querySelector('.property-details').innerHTML = '<p>Apartment not found. Please try again.</p>';
  }

  setupEventListeners();
}


document.addEventListener('DOMContentLoaded', initApartmentDetails);
