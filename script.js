  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-analytics.js";
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

const tableGrid = document.getElementById('table-grid');
const totalTables = 4;
const seatsPerTable = 10;

function updateSeatStatus(tableIndex, seatIndex, isOccupied, guestName) {
  const seatRef = ref(db, `tables/${tableIndex}/seats/${seatIndex}`);
  const newSeatData = {
    isOccupied: isOccupied,
    guestName: guestName
  };

  set(seatRef, newSeatData)
    .then(() => {
      renderTables(); // Обновление UI после обновления состояния
    })
    .catch(error => {
      console.error('Error updating seat status:', error);
    });
}

function renderTables() {
  tableGrid.innerHTML = '';
  for (let tableIndex = 0; tableIndex < totalTables; tableIndex++) {
    const table = tables[tableIndex] || new Array(seatsPerTable).fill({ isOccupied: false, guestName: '' });
    const seatRef = ref(db, `tables/${tableIndex}/seats`);
    get(child(seatRef))
      .then(snapshot => {
        snapshot.forEach((seatSnapshot, seatIndex) => {
          const seatData = seatSnapshot.val();
          const seatElement = createSeatElement(tableIndex, seatIndex, seatData);
        });
      })
      .catch(error => {
        console.error('Error fetching seat data:', error);
      });
    const tableElement = document.createElement('div');
    tableElement.className = 'table';

    const rowContainer = document.createElement('div');
    rowContainer.className = 'seat-row-container';

    const topRow = document.createElement('div');
    topRow.className = 'seat-row';
    for (let seatIndex = 0; seatIndex < seatsPerTable / 2; seatIndex++) {
      const seat = table[seatIndex];

      const seatElement = createSeatElement(tableIndex, seatIndex, seat);
      topRow.appendChild(seatElement);
    }
    rowContainer.appendChild(topRow);

    const centerDiv = document.createElement('div');
    centerDiv.className = 'center-div';

    rowContainer.appendChild(centerDiv);

    const bottomRow = document.createElement('div');
    bottomRow.className = 'seat-row';
    for (let seatIndex = seatsPerTable / 2; seatIndex < seatsPerTable; seatIndex++) {
      const seat = table[seatIndex];

      const seatElement = createSeatElement(tableIndex, seatIndex, seat);
      bottomRow.appendChild(seatElement);
    }
    rowContainer.appendChild(bottomRow);

    tableElement.appendChild(rowContainer);

    tableGrid.appendChild(tableElement);
  }
}

function createSeatElement(tableIndex, seatIndex, seat) {
  const seatElement = document.createElement('div');
  seatElement.className = 'seat';

  if (seat.isOccupied) {
    seatElement.classList.add('occupied');
    seatElement.textContent = seat.guestName;
  } else {
    seatElement.classList.add('available');
    seatElement.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'modal';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter guest name';
      modal.appendChild(input);

      const addButton = document.createElement('button');
      addButton.textContent = 'Add';
      addButton.addEventListener('click', () => {
        const guestName = input.value;
        if (guestName) {
          updateSeatStatus(tableIndex, seatIndex, true, guestName);
          document.body.removeChild(modal);
        }
      });
      modal.appendChild(addButton);
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      modal.appendChild(cancelButton);

      document.body.appendChild(modal);
    });
  }

  return seatElement;
}

renderTables();