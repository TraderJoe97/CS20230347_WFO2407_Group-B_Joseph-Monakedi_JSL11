// TASK: import helper functions from utils
import { getTasks, saveTasks, createNewTask, putTask, patchTask, deleteTask  } from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  newTaskModal: document.getElementById("new-task-modal-window"),
  editTaskModal: document.getElementById("edit-task-modal-window"),
  filterDiv: document.getElementById("filterDiv"),
  sideBarDiv: document.getElementById("side-bar-div"),
  headerBoardName: document.getElementById("header-board-name"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  columnDivs: document.querySelectorAll(".column-div"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  editTaskTitle: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  saveTaskBtn: document.getElementById('save-task-changes-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),

}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  console.log(tasks)
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  console.log(boards)
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    console.log(localStorageBoard)
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click',() => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  if (tasks) {console.log("got tasks")}
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    console.log(status)
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      addTaskToUI(task)
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  taskElement.addEventListener('click', () => openEditTaskModal(task));
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() => {
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.newTaskModal);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
    toggleModal(false, elements.newTaskModal)
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModal);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModal.addEventListener('submit',  (event) => {
    addTask(event)
  });

  // toggle edit board div
  document.getElementById('edit-board-btn').addEventListener('click', toggleEditBoardDiv);
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: document.getElementById('title-input').value,
      description: document.getElementById('desc-input').value,
      status: document.getElementById('select-status').value,
      board: activeBoard,
    };
    const newTask = createNewTask(task);
    if (newTask) {
      toggleModal(false, elements.newTaskModal);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  console.log('clicked')
  if (show) {
    elements.sideBarDiv.style.display = 'flex';
    elements.showSideBarBtn.style.display = 'none'
    localStorage.setItem('showSideBar', 'true');
  } else {
    elements.sideBarDiv.style.display = 'none';
    elements.showSideBarBtn.style.display = 'block'
    localStorage.setItem('showSideBar', 'false');
}
}
function toggleTheme() {
  const logoImg = document.getElementById('logo')
  if (elements.themeSwitch.checked){
    document.body.classList.toggle('light-theme', true);
    localStorage.setItem('light-theme', 'enabled');
    logoImg.src = 'assets/logo-light.svg';
  } else {
    document.body.classList.toggle('light-theme', false)
    localStorage.setItem('light-theme', 'disabled');
    logoImg.src = 'assets/logo-dark.svg';
  }
  console.log('theme toggled')
}


function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitle.value = task.title
  elements.editTaskDescInput.value = task.description
  elements.editSelectStatus.value = task.status
  
   // Clone the buttons to remove previous event listeners
  const saveTaskBtnClone = elements.saveTaskBtn.cloneNode(true);
  const deleteTaskBtnClone = elements.deleteTaskBtn.cloneNode(true);

  // Replace the original buttons with their clones
  elements.saveTaskBtn.replaceWith(saveTaskBtnClone);
  elements.deleteTaskBtn.replaceWith(deleteTaskBtnClone);

  // Reassign the cloned buttons to the `elements` object
  elements.saveTaskBtn = saveTaskBtnClone;
  elements.deleteTaskBtn = deleteTaskBtnClone;

  // Call saveTaskChanges upon click of Save Changes button
  elements.saveTaskBtn.addEventListener('click', saveTaskChangesHandler);

  // Delete task using a helper function and close the task modal
  elements.deleteTaskBtn.addEventListener('click', deleteTaskHandler)

  function saveTaskChangesHandler () {
    saveTaskChanges(task.id)
  }

  function deleteTaskHandler() {
    const confirmed = confirm('Are you sure you want to delete this task?')
    if (confirmed){
      deleteTask(task.id);
    } 
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
    refreshTasksUI();
  }

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
  elements.filterDiv.style.display = 'block';
}

function saveTaskChanges(taskId) {
    
  // Get new user inputs
    const titleInput = elements.editTaskTitle.value
    const descInput = elements.editTaskDescInput.value
    const statusInput = elements.editSelectStatus.value

  // Create an object with the updated task details
    const newUserInputs = {
      title: titleInput,
      description: descInput,
      status: statusInput
    }
    patchTask(taskId,newUserInputs);
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
    refreshTasksUI()
  }  
  // Close the modal and refresh the UI to reflect the changes

function toggleEditBoardDiv() {
  const editBoardDiv = document.getElementById('editBoardDiv');
  editBoardDiv.style.display = editBoardDiv.style.display === 'flex' ? 'none' : 'flex';
  elements.createNewTaskBtn.style.display = editBoardDiv.style.display ==='flex' ? 'none' : 'block';
}
function toggleBoardModal(show) {
  const modal = document.getElementById("board-modal-window");
  modal.style.display = show ? 'block' : 'none';
}

// Function to open the modal for adding or editing a board
function openBoardModal(isEditing) {
  const modalTitle = document.getElementById("board-modal-title");
  const boardInput = document.getElementById("board-name-input");
  const saveBoardBtn = document.getElementById("save-board-btn");

  if (isEditing) {
    modalTitle.textContent = "Edit Board";
    boardInput.value = activeBoard;
    saveBoardBtn.onclick = () => editBoard(boardInput.value);
  } else {
    modalTitle.textContent = "New Board";
    boardInput.value = "";
    saveBoardBtn.onclick = () => addBoard(boardInput.value);
  }

  toggleBoardModal(true);
}

document.getElementById('addBoardBtn').addEventListener('click', () => openBoardModal(false));
document.getElementById('editBoardBtn').addEventListener('click', () => openBoardModal(true));
document.getElementById('deleteBoardBtn').addEventListener('click', () => deleteBoard(activeBoard) )

function editBoard(boardInput){
  // Fetch tasks from local storage and update their board property
  const tasks = getTasks();
  const updatedTasks = tasks.map(task => {
    if (task.board === activeBoard) {
      task.board = boardInput;  // Update the task's board name
    }
    return task;
    
  });

  // Save updated tasks back to local storage
  saveTasks(updatedTasks);

    // Set the newly edited board as active
  activeBoard = boardInput;
  localStorage.setItem('activeBoard', boardInput);
  elements.headerBoardName.textContent = boardInput;

  // Refresh the UI with updated board and tasks
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  styleActiveBoard(activeBoard)
  filterAndDisplayTasksByBoard(boardInput);

  // Close the board modal
  toggleBoardModal(false);

}

function addBoard(boardInput) {
  // get current boards
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  boards.pushboardInput
  // Set the newly created board as active
  activeBoard = boardInput;
  localStorage.setItem('activeBoard', boardInput);
  elements.headerBoardName.textContent = boardInput;

  // Refresh the UI with updated board and tasks
  displayBoards(boards);
  styleActiveBoard(activeBoard);
  filterAndDisplayTasksByBoard(boardInput);

  // Close the board modal
  toggleBoardModal(false);
}

function deleteBoard (board) {
  // Fetch tasks from local storage and filter out tasks that belong to the active board
  const tasks = getTasks();
  const updatedTasks = tasks.filter(task => task.board !== activeBoard);
  saveTasks(updatedTasks);

  const boards = [...new Set(updatedTasks.map(task => task.board).filter(Boolean))];
  localStorage.setItem('activeBoard', boards[0]);
  elements.headerBoardName.textContent = boardInput;

  // Refresh the UI with updated board and tasks
  displayBoards(boards);
  styleActiveBoard(activeBoard);
  filterAndDisplayTasksByBoard(boardInput);

  // Close the board modal
  toggleBoardModal(false);

}

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  console.log(showSidebar);
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
