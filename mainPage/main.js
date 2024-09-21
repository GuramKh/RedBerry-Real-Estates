const API_URL = "https://api.real-estate-manager.redberryinternship.ge/api/real-estates";
const API_KEY = "9d07ad01-825b-44fd-b59d-1dc537f0f30b";

let realEstates = [];

const getActiveFilters = () => ({
  regions: JSON.parse(localStorage.getItem("checkboxStates")) || [],
  priceRange: JSON.parse(localStorage.getItem("priceRange")) || {},
  sizeRange: JSON.parse(localStorage.getItem("sizeRange")) || {},
  bedroomQuantity: localStorage.getItem("bedroomQuantity"),
});

const applyFilters = () => {
  const { regions, priceRange, sizeRange, bedroomQuantity } = getActiveFilters();
  return realEstates.filter(property => {
    if (regions.length > 0 && regions.some(region => region.checked)) {
      const propertyRegion = `${property.city.name}, ${property.city.region.name}`.toLowerCase();
      if (!regions.some(region => region.checked && propertyRegion.includes(region.id.toLowerCase()))) return false;
    }
    const propertyPrice = Number(property.price);
    if (priceRange.min && propertyPrice < Number(priceRange.min)) return false;
    if (priceRange.max && propertyPrice > Number(priceRange.max)) return false;
    const propertyArea = Number(property.area);
    if (sizeRange.min && propertyArea < Number(sizeRange.min)) return false;
    if (sizeRange.max && propertyArea > Number(sizeRange.max)) return false;
    if (bedroomQuantity && property.bedrooms !== Number(bedroomQuantity)) return false;
    return true;
  });
};

const updateFilters = () => {
  renderProperties();
  updateFilterUI();
};

const updateFilterUI = () => {
  const { regions, priceRange, sizeRange, bedroomQuantity } = getActiveFilters();
  updateRegionUI(regions);
  updatePriceRangeUI(priceRange);
  updateSizeRangeUI(sizeRange);
  updateBedroomQuantityUI(bedroomQuantity);
};


const createPropertyCard = (property) => {
  const card = document.createElement("div");
  card.className = "property-card";
  card.innerHTML = `
    <a href="apartament/apar.html?id=${property.id}">
      <spanRegion class="rental" id="is_rental">${property.is_rental ? "ქირავდება" : "იყიდება"}</spanRegion>
      <img src="${property.image}" class="image" id="image" alt="Property Image">
      <h3 id="price">${property.price} ₾</h3>
      <div class="address" id="Address">
        <img src="svg/location-marker.png" class="location" alt="location">
        ${property.city.name}, ${property.address}
      </div>
      <div class="info">
        <div id="bedrooms">
          <img src="svg/bed.png" class="bed" alt="bed">
          ${property.bedrooms}</div>
        <div id="area">
          <img src="svg/vector.png" class="vector" alt="bed">
          ${property.area}მ²</div>
        <div id="zip_code">
          <img src="svg/sign.png" class="sign" alt="bed">
          ${property.zip_code}</div>
      </div>
    </a>
  `;
  return card;
};


const renderProperties = () => {
  const container = document.getElementById("properties-grid");
  container.innerHTML = "";
  const filteredProperties = applyFilters();
  if (filteredProperties.length === 0) {
    container.innerHTML = "<p>No properties match the selected filters.</p>";
  } else {
    filteredProperties.forEach((property) => {
      container.appendChild(createPropertyCard(property));
    });
  }
};

const fetchData = async () => {
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
    realEstates = await response.json();
    renderProperties();
  } catch (error) {
    console.error("Error fetching real estate data:", error);
  }
};


function setupRegions(closeRegion) {
  const regionContent = document.querySelector(".region-popup > iframe")
    .contentWindow.document;
  const containerRegion = regionContent.querySelector(".checkbox-group");
  const checkboxes = containerRegion.querySelectorAll('input[type="checkbox"]');
  const chooseRegion = regionContent.querySelector("button");

  function saveCheckboxStates(checkboxes) {
    const states = Array.from(checkboxes).map((checkbox) => ({
      id: checkbox.id,
      checked: checkbox.checked,
    }));
    localStorage.setItem("checkboxStates", JSON.stringify(states));
  }

  function loadCheckboxStates(checkboxes) {
    const savedStates =
      JSON.parse(localStorage.getItem("checkboxStates")) || [];
    Array.from(checkboxes).forEach((checkbox) => {
      const savedState = savedStates.find((state) => state.id === checkbox.id);
      if (savedState) {
        checkbox.checked = savedState.checked;
      }
    });
  }

  loadCheckboxStates(checkboxes);

  chooseRegion.addEventListener("click", function (event) {
    saveCheckboxStates(checkboxes);
    closeRegion();
    updateFilters();
  });
}

function choosingRegion() {
  const addRegionButton = document.getElementById("region-popup");
  const regionPopUp = document.querySelector(".region-popup");

  function closeRegion() {
    regionPopUp.style.display = "none";
    updateFilterUI();
  }

  function updateFilterUI() {
    const savedStates =
      JSON.parse(localStorage.getItem("checkboxStates")) || [];
    const selectedContainerRegion = document.querySelector("#region-list");
    selectedContainerRegion.innerHTML = "";

    savedStates.forEach((state) => {
      if (!state.checked) return;

      const spanRegion = document.createElement("span");
      spanRegion.classList.add("region");
      spanRegion.textContent = state.id;

      const iconRegion = document.createElement("button");
      iconRegion.textContent = "X";
      iconRegion.classList.add("x-region");

      spanRegion.appendChild(iconRegion);
      selectedContainerRegion.appendChild(spanRegion);

      iconRegion.addEventListener("click", () => {
        removeRegionFilter(state.id);
      });
    });
  }

  function removeRegionFilter(regionId) {
    const savedStates = JSON.parse(localStorage.getItem("checkboxStates")) || [];
    const updatedStates = savedStates.map((state) => 
      state.id === regionId ? { ...state, checked: false } : state
    );
    localStorage.setItem("checkboxStates", JSON.stringify(updatedStates));
    updateFilters();
  }

  closeRegion();

  addRegionButton.addEventListener("click", function () {
    if (regionPopUp.style.display === "flex") {
      closeRegion();
    } else {
      regionPopUp.style.display = "flex";
      setupRegions(closeRegion);
    }
  });

  document.addEventListener("click", function (event) {
    const isClickInside =
      regionPopUp.contains(event.target) ||
      addRegionButton.contains(event.target);

    if (!isClickInside) {
      closeRegion();
    }
  });
}

choosingRegion();


function setupPriceRange(closePrice) {
  const priceContent = document.querySelector(".price-popup > iframe")
    .contentWindow.document;
  const minPriceInput = priceContent.getElementById("min-price");
  const maxPriceInput = priceContent.getElementById("max-price");
  const choosePriceButton = priceContent.querySelector(".choosePrice button");
  const priceListItems = priceContent.querySelectorAll(".price-list ul li");
  const errorMessage = priceContent.getElementById("price-error");

  function savePriceRange() {
    const minPrice = parseInt(minPriceInput.value.replace(/[^\d]/g, ''));
    const maxPrice = parseInt(maxPriceInput.value.replace(/[^\d]/g, ''));

    if (minPrice > maxPrice) {
      errorMessage.textContent = "მინიმალური ფასი არ შეიძლება იყოს მაქსიმალურ ფასზე მაღალი.";
      return false;
    }

    errorMessage.textContent = "";
    const priceRange = {
      min: minPrice,
      max: maxPrice,
    };
    localStorage.setItem("priceRange", JSON.stringify(priceRange));

    minPriceInput.value = minPrice.toLocaleString();
    maxPriceInput.value = maxPrice.toLocaleString();

    return true;
  }

  function loadPriceRange() {
    const savedRange = JSON.parse(localStorage.getItem("priceRange")) || {};
    if (savedRange.min) minPriceInput.value = savedRange.min.toLocaleString();
    if (savedRange.max) maxPriceInput.value = savedRange.max.toLocaleString();
  }

  loadPriceRange();

  choosePriceButton.addEventListener("click", function (event) {
    if (savePriceRange()) {
      closePrice();
      updateFilters();
    }
  });

  priceListItems.forEach((item) => {
    item.addEventListener("click", function () {
      const price = this.textContent.replace("₾", "").trim();
      if (
        this.closest(".price-list")
          .querySelector("h3")
          .textContent.includes("მინ")
      ) {
        minPriceInput.value = price;
      } else {
        maxPriceInput.value = price;
      }
      errorMessage.textContent = "";
    });
  });

  minPriceInput.addEventListener("input", () => errorMessage.textContent = "");
  maxPriceInput.addEventListener("input", () => errorMessage.textContent = "");
}

function choosingPrice() {
  const addPriceButton = document.getElementById("price-popup");
  const pricePopUp = document.querySelector(".price-popup");

  function closePrice() {
    pricePopUp.style.display = "none";
    updatePriceFilterUI();
  }

  function updatePriceFilterUI() {
    const priceRange = JSON.parse(localStorage.getItem("priceRange"));
    const priceList = document.querySelector("#price-list");
    priceList.innerHTML = "";

    if (priceRange && (priceRange.min || priceRange.max)) {
      const spanPrice = document.createElement("span");
      spanPrice.classList.add("price-range");
      spanPrice.textContent = `${priceRange.min ? priceRange.min.toLocaleString() + '₾' : '0₾'} - ${priceRange.max ? priceRange.max.toLocaleString() + '₾' : '∞'}`;

      const iconPrice = document.createElement("button");
      iconPrice.textContent = "X";
      iconPrice.classList.add("x-price");

      spanPrice.appendChild(iconPrice);
      priceList.appendChild(spanPrice);

      iconPrice.addEventListener("click", removePriceFilter);
    }
  }

  function removePriceFilter() {
    localStorage.removeItem("priceRange");
    updateFilters();
  }

  closePrice();

  addPriceButton.addEventListener("click", function () {
    if (pricePopUp.style.display === "flex") {
      closePrice();
    } else {
      pricePopUp.style.display = "flex";
      setupPriceRange(closePrice);
    }
  });

  document.addEventListener("click", function (event) {
    const isClickInside =
      pricePopUp.contains(event.target) ||
      addPriceButton.contains(event.target);

    if (!isClickInside) {
      closePrice();
    }
  });
}

choosingPrice();






function setupSizeRange(closeSize) {
  const sizeContent = document.querySelector(".size-popup > iframe")
    .contentWindow.document;
  const minSizeInput = sizeContent.getElementById("min-size");
  const maxSizeInput = sizeContent.getElementById("max-size");
  const chooseSizeButton = sizeContent.querySelector(".chooseSize button");
  const sizeListItems = sizeContent.querySelectorAll(".size-list ul li");
  const errorMessage = sizeContent.getElementById("size-error");

  function saveSizeRange() {
    const minSize = parseInt(minSizeInput.value.replace(/[^\d]/g, ''));
    const maxSize = parseInt(maxSizeInput.value.replace(/[^\d]/g, ''));

    if (minSize > maxSize) {
      errorMessage.textContent = "მინიმალური ფართობი არ შეიძლება იყოს მაქსიმალურ ფართობზე მაღალი.";
      return false;
    }

    errorMessage.textContent = "";
    const sizeRange = {
      min: minSize,
      max: maxSize,
    };
    localStorage.setItem("sizeRange", JSON.stringify(sizeRange));

    minSizeInput.value = minSize.toLocaleString();
    maxSizeInput.value = maxSize.toLocaleString();

    return true;
  }

  function loadSizeRange() {
    const savedRange = JSON.parse(localStorage.getItem("sizeRange")) || {};
    if (savedRange.min) minSizeInput.value = savedRange.min.toLocaleString();
    if (savedRange.max) maxSizeInput.value = savedRange.max.toLocaleString();
  }

  loadSizeRange();

  chooseSizeButton.addEventListener("click", function (event) {
    if (saveSizeRange()) {
      closeSize();
      updateFilters();
    }
  });

  sizeListItems.forEach((item) => {
    item.addEventListener("click", function () {
      const size = this.textContent.replace("m²", "").trim();
      if (
        this.closest(".size-list")
          .querySelector("h3")
          .textContent.includes("მინ")
      ) {
        minSizeInput.value = size;
      } else {
        maxSizeInput.value = size;
      }
      errorMessage.textContent = "";
    });
  });

  minSizeInput.addEventListener("input", () => errorMessage.textContent = "");
  maxSizeInput.addEventListener("input", () => errorMessage.textContent = "");
}

function choosingSize() {
  const addSizeButton = document.getElementById("size-popup");
  const sizePopUp = document.querySelector(".size-popup");

  function closeSize() {
    sizePopUp.style.display = "none";
    updateSizeFilterUI();
  }

  function updateSizeFilterUI() {
    const sizeRange = JSON.parse(localStorage.getItem("sizeRange"));
    const sizeList = document.querySelector("#size-list");
    sizeList.innerHTML = "";

    if (sizeRange && (sizeRange.min || sizeRange.max)) {
      const spanSize = document.createElement("span");
      spanSize.classList.add("size-range");
      spanSize.textContent = `${sizeRange.min ? sizeRange.min.toLocaleString() + 'm²' : '0m²'} - ${sizeRange.max ? sizeRange.max.toLocaleString() + 'm²' : '∞'}`;

      const iconSize = document.createElement("button");
      iconSize.textContent = "X";
      iconSize.classList.add("x-size");

      spanSize.appendChild(iconSize);
      sizeList.appendChild(spanSize);

      iconSize.addEventListener("click", removeSizeFilter);
    }
  }

  function removeSizeFilter() {
    localStorage.removeItem("sizeRange");
    updateFilters();
  }

  closeSize();

  addSizeButton.addEventListener("click", function () {
    if (sizePopUp.style.display === "flex") {
      closeSize();
    } else {
      sizePopUp.style.display = "flex";
      setupSizeRange(closeSize);
    }
  });

  document.addEventListener("click", function (event) {
    const isClickInside =
      sizePopUp.contains(event.target) ||
      addSizeButton.contains(event.target);

    if (!isClickInside) {
      closeSize();
    }
  });
}

choosingSize();






function setupBedroomSelection(closeBedroom) {
  const bedroomContent = document.querySelector(".bedroom-popup > iframe")
    .contentWindow.document;
  const bedroomQuantityInput = bedroomContent.getElementById("bedroomQuantity");
  const selectButton = bedroomContent.querySelector(".select-button");

  selectButton.addEventListener("click", function () {
    const bedroomQuantity = bedroomQuantityInput.value.trim();
    if (bedroomQuantity) {
      localStorage.setItem("bedroomQuantity", bedroomQuantity);
      closeBedroom();
      updateFilters();
    }
  });

  const savedQuantity = localStorage.getItem("bedroomQuantity");
  if (savedQuantity) {
    bedroomQuantityInput.value = savedQuantity;
  }
}

function choosingBedroom() {
  const addBedroomButton = document.getElementById("bedroom-popup");
  const bedroomPopUp = document.querySelector(".bedroom-popup");

  function closeBedroom() {
    bedroomPopUp.style.display = "none";
    updateBedroomFilterUI();
  }

  function updateBedroomFilterUI() {
    const bedroomQuantity = localStorage.getItem("bedroomQuantity");
    const bedroomList = document.querySelector("#bedroom-list");
    bedroomList.innerHTML = "";

    if (bedroomQuantity) {
      const spanBedroom = document.createElement("span");
      spanBedroom.classList.add("bedroom");
      spanBedroom.textContent = bedroomQuantity;

      const iconBedroom = document.createElement("button");
      iconBedroom.textContent = "X";
      iconBedroom.classList.add("x-bedroom");

      spanBedroom.appendChild(iconBedroom);
      bedroomList.appendChild(spanBedroom);

      iconBedroom.addEventListener("click", removeBedroomFilter);
    }
  }

  function removeBedroomFilter() {
    localStorage.removeItem("bedroomQuantity");
    updateFilters();
  }

  closeBedroom();

  addBedroomButton.addEventListener("click", function () {
    if (bedroomPopUp.style.display === "flex") {
      closeBedroom();
    } else {
      bedroomPopUp.style.display = "flex";
      setupBedroomSelection(closeBedroom);
    }
  });

  document.addEventListener("click", function (event) {
    const isClickInside =
      bedroomPopUp.contains(event.target) ||
      addBedroomButton.contains(event.target);

    if (!isClickInside) {
      closeBedroom();
    }
  });
}

choosingBedroom();



const removeRegionFilter = (regionId) => {
  const regions = JSON.parse(localStorage.getItem("checkboxStates")) || [];
  const updatedRegions = regions.map(region => 
    region.id === regionId ? {...region, checked: false} : region
  );
  localStorage.setItem("checkboxStates", JSON.stringify(updatedRegions));
  updateFilters();
};

const removePriceFilter = () => {
  localStorage.removeItem("priceRange");
  updateFilters();
};

const removeSizeFilter = () => {
  localStorage.removeItem("sizeRange");
  updateFilters();
};

const removeBedroomFilter = () => {
  localStorage.removeItem("bedroomQuantity");
  updateFilters();
};





function setupClearAllFilters() {
  const clearAllButton = document.getElementById('clear-all-filters');
  
  clearAllButton.addEventListener('click', function() {
    localStorage.removeItem('checkboxStates');
    document.querySelector('#region-list').innerHTML = '';


    localStorage.removeItem('priceRange');
    document.querySelector('#price-list').innerHTML = '';

    localStorage.removeItem('sizeRange');
    document.querySelector('#size-list').innerHTML = '';

    localStorage.removeItem('bedroomQuantity');
    document.querySelector('#bedroom-list').innerHTML = '';

    document.querySelector('.region-popup').style.display = 'none';
    document.querySelector('.price-popup').style.display = 'none';
    document.querySelector('.size-popup').style.display = 'none';
    document.querySelector('.bedroom-popup').style.display = 'none';

    const regionContent = document.querySelector(".region-popup > iframe").contentWindow.document;
    const checkboxes = regionContent.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);

    const priceContent = document.querySelector(".price-popup > iframe").contentWindow.document;
    priceContent.getElementById("min-price").value = '';
    priceContent.getElementById("max-price").value = '';

    const sizeContent = document.querySelector(".size-popup > iframe").contentWindow.document;
    sizeContent.getElementById("min-size").value = '';
    sizeContent.getElementById("max-size").value = '';

    const bedroomContent = document.querySelector(".bedroom-popup > iframe").contentWindow.document;
    bedroomContent.getElementById("bedroomQuantity").value = '';
    updateFilters();
  });
}

setupClearAllFilters();



function setupEventListeners() {
  const addAgentButton = document.getElementById("add-agent");
  const popUp = document.querySelector(".pop-up");

  function hidePopUp() {
    popUp.style.display = "none";
    document.body.style.overflow = "auto";
  }

  addAgentButton.addEventListener("click", function () {
    popUp.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  window.addEventListener('message', function(event) {
    if (event.data === 'closeIframe') {
      hidePopUp();
    }
  });
}

setupEventListeners();



const init = () => {
  fetchData();
  setupClearAllFilters();
};

document.addEventListener("DOMContentLoaded", init);
