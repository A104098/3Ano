const todos = [
  'Learn a new course',
  'Read a book',
  'Go to the gym',
  'Go shopping'
];

/* Ex. 1: Add a event listener that triggers when the DOM is loaded here */
document.addEventListener('DOMContentLoaded', () => {
  const dateElement = document.getElementById('list-date');
  const today = new Date(); //dia de hoje
  dateElement.textContent = today.toLocaleDateString();
  
});


/* Ex. 2: Complete todo rendering */
// complete function to remove all child nodes
// arg parent is the node to clean
function removeAllChildNodes(parent) {
  
}


// render todo array here
function renderTodoList() {
  
}



/* Ex. 3: Add a event listener to element 'todo-form'*/
document.getElementById('todo-form').addEventListener('submit', event => {
  
});




/* Ex. 4 and 5: complete delete button click logic */
// arg event is the triggered event (with event you can get the element clicked).
function removeTodoItem(event) {
  
}