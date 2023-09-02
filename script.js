import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-analytics.js";
import { getDatabase, ref as databaseRef, get, set } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";
import { getStorage, uploadBytes, getDownloadURL, ref as storagesRef } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXPOZS9BqL_3K7_1WkTIit4KO5rwxb7uE",
  authDomain: "wedding-edec2.firebaseapp.com",
  databaseURL: "https://wedding-edec2-default-rtdb.firebaseio.com",
  projectId: "wedding-edec2",
  storageBucket: "wedding-edec2.appspot.com",
  messagingSenderId: "101659396471",
  appId: "1:101659396471:web:11e65008c36b656e60b972",
  measurementId: "G-CY7KVVYYS0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase();
const storage = getStorage();
const stageIndicators = document.querySelectorAll('.stage-indicator');
const backButton = document.createElement('button');
backButton.textContent = 'Назад';
const tableGrid = document.getElementById('table-grid');
const stageHeader = document.getElementById('stage-header');
const tableInfo = document.createElement('p');

let currentStage = 1;
let selectedTable = null;
let selectedSeat = null;

function updateStageDisplay() {
  stageIndicators.forEach(indicator => {
    const stage = parseInt(indicator.getAttribute('data-stage'));
    if (stage === currentStage) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
}

function updateSeatStatus(tableIndex, seatIndex, isOccupied, guestName) {
  const seatRef = ref(db, `tables/${tableIndex}/seats/${seatIndex}`);
  const newSeatData = {
    isOccupied: isOccupied,
    guestName: guestName
  };

  set(seatRef, newSeatData)
    .then(() => {
      if (currentStage === 1) {
        showSeats();
      } else if (currentStage === 2) {
        showUserInfoForm();
      }
    })
    .catch(error => {
      console.error('Error updating seat status:', error);
    });
}

function showTables() {
  currentStage = 1;
  tableGrid.innerHTML = '';
  stageHeader.innerHTML = '<h1>Выберите стол</h1>';
  const totalTables = 4;
  const tablesContainer = document.createElement('div');
  tablesContainer.className = 'tables-container';

  for (let i = 0; i < 2; i++) {
    const tables = document.createElement('div');
    tables.className = 'tables';
    for (let tableIndex = 0; tableIndex < 2; tableIndex++) {
      const tableElement = document.createElement('div');
      tableElement.className = 'table';
      tableElement.textContent = `Стол ${i * 2 + tableIndex + 1}`;

      const tableRef = databaseRef(db, `tables/${i * 2 + tableIndex}`);
      get(tableRef).then(snapshot => {
        const tableData = snapshot.val();
        if (tableData && tableData.seats) {
          const totalSeats = tableData.seats.length;
          let occupiedSeats = 0;
          for (let seat of tableData.seats) {
            if (seat.isOccupied) {
              occupiedSeats++;
            }
          }
          const availableSeats = totalSeats - occupiedSeats;
          const availabilityInfo = document.createElement('p');
          availabilityInfo.textContent = `Свободно ${availableSeats}/${totalSeats} мест`;
          tableElement.appendChild(availabilityInfo);
        }
      });

      tableElement.addEventListener('click', () => {
        selectedTable = i * 2 + tableIndex;
        showSeats();
      });

      tables.appendChild(tableElement);
    }
    tablesContainer.appendChild(tables);
  }

  tableGrid.appendChild(tablesContainer);
  updateStageDisplay();
}

function showSeats() {
  currentStage = 2;
  tableGrid.innerHTML = '';
  stageHeader.innerHTML = '<h1>Выберите место</h1>';
  const seatsContent = document.createElement('div');
  seatsContent.className = 'seats-content';
  const seatsContainer1 = document.createElement('div');
  seatsContainer1.className = 'seats';
  const seatsContainer2 = document.createElement('div');
  seatsContainer2.className = 'seats';
  const seatsPerTable = 10;
  const tableRef = databaseRef(db, `tables/${selectedTable}`);
  get(tableRef).then(snapshot => {
    const tableData = snapshot.val();
    if (tableData && tableData.seats) {
      for (let seatIndex = 0; seatIndex < seatsPerTable; seatIndex++) {
        const seatElement = document.createElement('div');
        seatElement.className = 'seat';
        seatElement.textContent = `Сиденье ${seatIndex + 1}`;

        if (seatIndex < 5) {
          seatsContainer1.appendChild(seatElement);
        } else {
          seatsContainer2.appendChild(seatElement);
        }
        
        if (!tableData.seats[seatIndex].isOccupied) {
          seatElement.addEventListener('click', () => {
            selectedSeat = seatIndex;
            showUserInfoForm();
          });
        } else {
          if (tableData.seats[seatIndex].photoURL) {
            const seatImage = document.createElement('img');
            seatImage.src = tableData.seats[seatIndex].photoURL;
            seatImage.alt = tableData.seats[seatIndex].guestName;
            seatElement.innerHTML = ''; // Clear any existing content
            seatElement.appendChild(seatImage);
          } else {
            seatElement.classList.add('occupied');
            seatElement.textContent = tableData.seats[seatIndex].guestName;
          }
        }        
      }
      seatsContent.appendChild(seatsContainer1);
      seatsContent.appendChild(seatsContainer2);
      tableInfo.textContent = `Стол ${selectedTable + 1}`;
      tableGrid.appendChild(tableInfo);
      tableGrid.appendChild(seatsContent);
      backButton.removeEventListener('click', showSeats);
      backButton.removeEventListener('click', showUserInfoForm);
      backButton.addEventListener('click', showTables);
      tableGrid.appendChild(backButton);
      updateStageDisplay();
    }
  });
}


function showUserInfoForm() {
  currentStage = 3;
  tableGrid.innerHTML = '';
  stageHeader.innerHTML = '<h1>Введите данные</h1>';

  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Имя:';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';

  const genderTitle = document.createElement('p');
genderTitle.textContent = 'Ваш пол';
const genderContainer = document.createElement('div');
genderContainer.id = 'gender';

const maleRadioDiv = document.createElement('div');
const maleRadio = document.createElement('input');
maleRadio.type = 'radio';
maleRadio.name = 'gender';
maleRadio.value = 'male';
maleRadio.id = 'maleRadio'; // Добавьте id
const maleLabel = document.createElement('label');
maleLabel.textContent = 'М';
maleLabel.htmlFor = 'maleRadio';
 
const femaleRadioDiv = document.createElement('div');
const femaleRadio = document.createElement('input');
femaleRadio.type = 'radio';
femaleRadio.name = 'gender';
femaleRadio.value = 'female';
femaleRadio.id = 'femaleRadio'; // Добавьте id
const femaleLabel = document.createElement('label');
femaleLabel.textContent = 'Ж';
femaleLabel.htmlFor = 'femaleRadio';

  genderContainer.appendChild(maleRadioDiv);
  maleRadioDiv.appendChild(maleRadio);
  maleRadioDiv.appendChild(maleLabel);
  genderContainer.appendChild(femaleRadioDiv);
  femaleRadioDiv.appendChild(femaleRadio);
  femaleRadioDiv.appendChild(femaleLabel);

  const ageLabel = document.createElement('label');
  ageLabel.textContent = 'Возраст:';
  const ageCounter = document.createElement('div');
  ageCounter.className = 'age-counter';
  const ageDisplay = document.createElement('div');
  ageDisplay.className = 'age-display';
  ageDisplay.textContent = '0';
  const incrementButton = document.createElement('button');
  incrementButton.textContent = '+';
  incrementButton.addEventListener('click', () => {
    const currentAge = parseInt(ageDisplay.textContent);
    if (!isNaN(currentAge)) {
      ageDisplay.textContent = (currentAge + 1).toString();
    }
  });

  const decrementButton = document.createElement('button');
  decrementButton.textContent = '-';
  decrementButton.addEventListener('click', () => {
    const currentAge = parseInt(ageDisplay.textContent);
    if (!isNaN(currentAge) && currentAge > 0) {
      ageDisplay.textContent = (currentAge - 1).toString();
    }
  });
  ageCounter.appendChild(decrementButton);
  ageCounter.appendChild(ageDisplay);
  ageCounter.appendChild(incrementButton);

  const photoLabel = document.createElement('label');
  photoLabel.textContent = 'Загрузите фотографию:';
  const photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.accept = 'image/*';
  const photoPreview = document.createElement('img'); // Create an image element for displaying the photo
  photoPreview.id = 'photo-preview'; // Set an id for the image element
  photoPreview.style.display = 'none'; // Initially hide the image element
  photoPreview.style.maxWidth = '100%'; // Set maximum width for the image preview

  photoInput.addEventListener('change', () => {
    const photoFile = photoInput.files[0];
    if (photoFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block'; // Show the image preview
      };
      reader.readAsDataURL(photoFile);
    } else {
      photoPreview.src = '';
      photoPreview.style.display = 'none';
    }
  });
  formContainer.appendChild(photoLabel);
  formContainer.appendChild(photoInput);
  formContainer.appendChild(photoPreview);
  formContainer.appendChild(nameLabel);
  formContainer.appendChild(nameInput);

  formContainer.appendChild(genderTitle);
  formContainer.appendChild(genderContainer);
  formContainer.appendChild(ageLabel);
  formContainer.appendChild(ageCounter);

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Подтвердить';
  submitButton.addEventListener('click', () => {
    const name = nameInput.value;
    const gender = maleCheckbox.checked ? 'М' : (femaleCheckbox.checked ? 'Ж' : 'Не выбран');
    const age = ageDisplay.textContent;
    if (name && gender !== 'Не выбран' && age >= 0) {
      const photoFile = photoInput.files[0];

      if (photoFile) {
        const storageRef = storagesRef(storage, `photo/${selectedTable}/${selectedSeat}/${name}.png`);

        uploadBytes(storageRef, photoFile).then((snapshot) => {
          console.log('Uploaded a blob or file!');
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);

            submitUserInfo(name, gender, age, downloadURL);
          });
        }).catch((error) => {
          console.error('Error uploading file:', error);
        });
      } else {
        submitUserInfo(name, gender, age, null);
      }
    }
  });

  formContainer.appendChild(submitButton);

  tableGrid.appendChild(formContainer);


  backButton.addEventListener('click', showSeats);
  tableGrid.appendChild(backButton);
  updateStageDisplay();
}

function submitUserInfo(name, gender, age, photoURL) {
  const tableRef = databaseRef(db, `tables/${selectedTable}`);
  get(tableRef).then(snapshot => {
    const tableData = snapshot.val();
    if (tableData && tableData.seats && tableData.seats[selectedSeat]) {
      tableData.seats[selectedSeat].isOccupied = true;
      tableData.seats[selectedSeat].guestName = name;
      tableData.seats[selectedSeat].gender = gender;
      tableData.seats[selectedSeat].age = age;
      tableData.seats[selectedSeat].photoURL = photoURL;

      set(tableRef, tableData)
        .then(() => {
          const message = `Вы выбрали стол ${selectedTable + 1}, сиденье ${selectedSeat + 1}. Имя: ${name}, Пол: ${gender}, Возраст: ${age}`;
          alert(message);
          showTables();
        })
        .catch(error => {
          console.error('Error updating table data:', error);
        });
    }
  });
}

showTables();