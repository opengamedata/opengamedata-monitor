// Included from monitor.js
// note that socket has to be variable in order to have both flask-socketio and flask-restful working
var socket = io.connect('https://ogd-monitor.fielddaylab.wisc.edu');

// when a client is connected, print it
socket.on('connect', () => {
   console.log('Connected to the server');
});

// if socketio receives a new logger_data event, add a table row
socket.on('logger_data', function (data) {
   console.debug(`Received logger_data socket request, with data ${JSON.stringify(data)}`)
   addTableRow(data);
});

socket.on('feature_data', function(data) {
   console.log(`Received feature_data socket request, with data ${JSON.stringify(data)}`)
})

const tableHeaders = [
   "app_id",
   "app_branch",
   "app_version",
   "log_version",
   "client_time",
   "user_id",
   "session_id",
   "event_name",
   "event_data",
   "game_state",
   "user_data",
   "event_sequence_index"
]

const featureHeaders = [
   "player_id",
   "ActiveTime"
]

const MAX_DATA_ROWS = 10;
const MAX_FEATURE_ROWS = 10;

// if the current row cells contain the filterText, display it in the table
function shouldShow(cells, filterText) {
   let shouldShow = false;
   for (let j = 0; j < cells.length; j++) {
         const cellText = cells[j].textContent.toLowerCase();
         if (cellText.includes(filterText)) {
            shouldShow = true;
            break;
         }
   }
   return shouldShow;
}

// Add a new data row to the table
function addTableRow(data) {
   
   // if the table row length is LARGER than MAX_DATA_ROWS, delete the last row
   const table = document.getElementById('logger-table').getElementsByTagName('tbody')[0];
   if (table.rows.length > MAX_DATA_ROWS) {
         console.log(table.rows.length);
         var lastIndex = table.rows.length - 1;
         table.deleteRow(lastIndex);
   }

   // insert a new table row
   const newRow = table.insertRow(0);
   newRow.style.display = 'none';
   for (const header of tableHeaders) {
         const cell = newRow.insertCell();
         cell.textContent = data.hasOwnProperty(header) ? data[header] : 'NA';
         if (header === "event_name" && data.hasOwnProperty("event")) {
            cell.textContent = data["event"];
         }
   }

   // if the table is filtering, only reserve the incoming data that can be filtered
   const cells = newRow.getElementsByTagName('td');
   const filterText = document.getElementById('filter').value.toLowerCase();
   if (filterText === '' || shouldShow(cells, filterText)) newRow.style.display = '';

}

function addFeatureRow(feature_data) {
   // if the table row length is LARGER than MAX_DATA_ROWS, delete the last row
   const table = document.getElementById('feature-table').getElementsByTagName('tbody')[0];
   if (table.rows.length > MAX_FEATURE_ROWS) {
         console.log(table.rows.length);
         var lastIndex = table.rows.length - 1;
         table.deleteRow(lastIndex);
   }

   // insert a new table row
   const newRow = table.insertRow(0);
   newRow.style.display = 'none';
   for (const header of tableHeaders) {
         const cell = newRow.insertCell();
         cell.textContent = feature_data.hasOwnProperty(header) ? feature_data[header] : 'NA';
   }

   // if the table is filtering, only reserve the incoming data that can be filtered
   // const cells = newRow.getElementsByTagName('td');
   // const filterText = document.getElementById('filter').value.toLowerCase();
   // if (filterText === '' || shouldShow(cells, filterText)) newRow.style.display = '';
}

// Filter the table rows based on the filter text
function filterTable() {
   const filterText = document.getElementById('filter').value.toLowerCase();
   const table = document.getElementById('logger-table').getElementsByTagName('tbody')[0];
   const rows = table.getElementsByTagName('tr');

   // if any row contains the filter text, display it
   for (let i = 0; i < rows.length; i++) {
         const cells = rows[i].getElementsByTagName('td');
         rows[i].style.display = shouldShow(cells, filterText) ? '' : 'none';
   }
}

// clear all table rows
function clearTable(logger, features) {
   if (logger === true) {
         var table = document.getElementById('logger-table');
         var tbody = table.querySelector('tbody');
         while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
         }
   }
   if (features === true) {
         var table = document.getElementById('feature-table');
         var tbody = table.querySelector('tbody');
         while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
         }
   }
}

// after the selector changes to a new game
function selectGame(selectedGame) {
   clearTable(true, true);
   socket.emit("game_selector_changed", selectedGame);
}
