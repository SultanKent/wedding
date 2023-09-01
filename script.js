import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-analytics.js";
    import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js";
    
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
    const stageIndicators = document.querySelectorAll('.stage-indicator');
    const backButton = document.createElement('button');
    backButton.textContent = 'Назад';
    const tableGrid = document.getElementById('table-grid');
    
    // Переменные для хранения текущего этапа и выбранных стола и сиденья
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
      const totalTables = 4;
      for (let tableIndex = 0; tableIndex < totalTables; tableIndex++) {
        const tableElement = document.createElement('div');
        tableElement.className = 'table';
        tableElement.textContent = `Стол ${tableIndex + 1}`;
        tableElement.addEventListener('click', () => {
          selectedTable = tableIndex;
          showSeats();
        });
        tableGrid.appendChild(tableElement);
        updateStageDisplay();
      }
    }
    
  function showSeats() {
  currentStage = 2;
  tableGrid.innerHTML = '';

  // Создаем div с классом 'seats-content'
  const seatsContent = document.createElement('div');
  seatsContent.className = 'seats-content';

  // Создаем два контейнера для сиденьй
  const seatsContainer1 = document.createElement('div');
  seatsContainer1.className = 'seats';
  const seatsContainer2 = document.createElement('div');
  seatsContainer2.className = 'seats';

  const seatsPerTable = 10;
  const tableRef = ref(db, `tables/${selectedTable}`);
  get(tableRef).then(snapshot => {
    const tableData = snapshot.val();
    if (tableData && tableData.seats) {
      // Разделяем сиденья на два контейнера (по 5 сиденьй в каждом)
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
          seatElement.classList.add('occupied');
          seatElement.textContent = tableData.seats[seatIndex].guestName;
        }
      }
      seatsContent.appendChild(seatsContainer1);
      seatsContent.appendChild(seatsContainer2);

      // Добавляем seatsContent в tableGrid
      tableGrid.appendChild(seatsContent);

      backButton.removeEventListener('click', showSeats);
      backButton.removeEventListener('click', showUserInfoForm);
      backButton.addEventListener('click', showTables); // Возврат к этапу 1
      tableGrid.appendChild(backButton);
      updateStageDisplay();
    }
  });
}

    
function showUserInfoForm() {
  currentStage = 3;
  tableGrid.innerHTML = '';

  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Имя:';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  
  const genderTitle = document.createElement('p');
  genderTitle.textContent = 'Ваш пол';
  const genderContainer = document.createElement('div'); // Создаем контейнер для пола
  genderContainer.id = 'gender';
  // Первый вложенный div для инпута и метки М
  const maleDiv = document.createElement('div');
  const maleCheckbox = document.createElement('input');
  maleCheckbox.type = 'checkbox';
  maleCheckbox.name = 'gender';
  maleCheckbox.value = 'male';
  maleCheckbox.id = 'maleCheckbox';
  const maleLabel = document.createElement('label');
  maleLabel.textContent = 'М';
  maleLabel.htmlFor = 'maleCheckbox';
  // Второй вложенный div для инпута и метки Ж
  const femaleDiv = document.createElement('div');
  const femaleCheckbox = document.createElement('input');
  femaleCheckbox.type = 'checkbox';
  femaleCheckbox.name = 'gender';
  femaleCheckbox.value = 'female';
  femaleCheckbox.id = 'femaleCheckbox';
  const femaleLabel = document.createElement('label');
  femaleLabel.textContent = 'Ж';
  femaleLabel.htmlFor = 'femaleCheckbox';

  maleDiv.appendChild(maleCheckbox);
  maleDiv.appendChild(maleLabel);
  femaleDiv.appendChild(femaleCheckbox);
  femaleDiv.appendChild(femaleLabel);
  genderContainer.appendChild(maleDiv);
  genderContainer.appendChild(femaleDiv);

  // Создаем счетчик возраста, как и ранее
  const ageLabel = document.createElement('label');
  ageLabel.textContent = 'Возраст:';
  const ageCounter = document.createElement('div');
  ageCounter.className = 'age-counter';
  const ageDisplay = document.createElement('div');
  ageDisplay.className = 'age-display';
  ageDisplay.textContent = '0';
  // Добавляем кнопки для увеличения и уменьшения возраста
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
      submitUserInfo(name, gender, age);
      tableGrid.innerHTML = ''; // Очистка содержимого tableGrid при отправке данных
    }
  });

  formContainer.appendChild(submitButton);

  // Добавление formContainer в tableGrid
  tableGrid.appendChild(formContainer);

  backButton.addEventListener('click', showSeats);
  tableGrid.appendChild(backButton);
  updateStageDisplay();
}



    
    function submitUserInfo(name, gender) {
      // Здесь вы можете записать информацию о пользователе, столе и месте в базу данных
      // Или отобразить эту информацию пользователю
      const tableRef = ref(db, `tables/${selectedTable}`);
      get(tableRef).then(snapshot => {
        const tableData = snapshot.val();
        if (tableData && tableData.seats && tableData.seats[selectedSeat]) {
          tableData.seats[selectedSeat].isOccupied = true;
          tableData.seats[selectedSeat].guestName = name;
          set(tableRef, tableData)
            .then(() => {
              const message = `Вы выбрали стол ${selectedTable + 1}, сиденье ${selectedSeat + 1}. Имя: ${name}, Пол: ${gender}`;
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