var tasks = {};



var createTask = function( taskText, taskDate, taskList ) {
  // create elements that make up a task item
  var taskLi = $( "<li>" ).addClass( "list-group-item" );
  var taskSpan = $( "<span>" )
    .addClass( "badge badge-primary badge-pill" )
    .text( taskDate );
  var taskP = $( "<p>" )
    .addClass( "m-1" )
    .text( taskText );

  // append span and p element to parent li
  taskLi.append( taskSpan, taskP );

  // append to ul list on the page
  $( "#list-" + taskList ).append( taskLi );
};



var loadTasks = function() {
  tasks = JSON.parse( localStorage.getItem( "tasks" ));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }



  // loop over object properties
  $.each( tasks, function( list, arr ) {
    console.log( list, arr );
    // then loop over sub-array
    arr.forEach( function( task ) {
      createTask( task.text, task.date, list );
    });
  });
};



var saveTasks = function() {
  localStorage.setItem( "tasks", JSON.stringify( tasks ));
};



// Editing task
$( ".list-group" ).on( "click", "p", function() {
  let text = $( this )
    .text()
    .trim();
  let textInput = $( "<textarea>" )
    .addClass( "form-contorl" )
    .val( text );

  $( this ).replaceWith( textInput );
  // Put cursor focus in the editing box.
  textInput.trigger( "focus" );
  console.log( text );
});



// Callback to save edited task
$( ".list-group" ).on( "blur", "textarea", function() {
  // Get the textarea's current value/text
  let text = $( this )
    .val()
    .trim();

  // Get the parent ul's id attribute
  let status = $( this )
    .closest( ".list-group" )
    .attr( "id" )
    .replace( "list-", "" );

  // Get the task's position in the list of other li elements
  let index = $( this )
    .closest( ".list-group-item" )
    .index();

  tasks[ status ][ index ].text = text;
  saveTasks();

  // Recreate p element
  let taskP = $( "<p>" )
    .addClass( "m-1" )
    .text( text );

  // Replace textarea with p element
  $( this ).replaceWith( taskP );
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});



// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});



// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});



// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});



// Due date was clicked
$( ".list-group" ).on( "click", "span", function() {
  // Get current text
  let date = $( this )
    .text()
    .trim();

  // Create new input element
  let dateInput = $( "<input>" )
    .attr( "type", "text" )
    .addClass( "form-control" )
    .val( date );

  // Swap out elements
  $( this ).replaceWith( dateInput );

  // Automatically focuson new element
  dateInput.trigger( "focus" );
});



// Convert date box back when the user clicks outside, when blur event occurs
// Value of due date was changed
$( ".list-group" ).on( "blue", "input[type = 'text' ]", function() {
  // Get the crrent text
  let date = $( this )
    .val()
    .trim();

  // Get the parent ul's id attribute
  let status = $( this )
    .closest( ".list-group" )
    .attr( "id" )
    .replace( "list-", "" );

  // Get the task's position in the list of other li elements
  let index = $( this )
    .closest( ".list-group-item" )
    .index();

  // Update task in array and re-save to localStorage
  tasks[ status ][ index ].date = date;
  saveTasks();

  // Re-create span element with bootstrap classes
  let taskSpan = $( "<span>" )
    .addClass( "badge badge-primary badge-pill" )
    .text( date );

  // Replace input with span element
  $( this ).replaceWith( taskSpan );
});




// Turn task columns to be sortable
/* $( ".card .list-group").sortable( {
  connectWith: $( ".card. list-group" )
}); */



// Turn task columns to be sortable
$( ".list-group").sortable( {
  connectWith: $( ".list-group" ),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function( event ) {
    console.log( "activate", this );
  },
  deactivate: function( event ) {
    console.log( "deactivate", this );
  },
  over: function( event ) {
    console.log( "over", event.target );
  },
  out: function( event ) {
    console.log( "out", event.target );
  },
  update: function( event ) {
    // Array to store task data, to be used to push to localStorage
    let tempArr = [];

    // Loop over the current set of <li> children in sortable list
    $( this ).children().each( function() {
      let text = $( this )
        .find( "p" )
        .text()
        .trim();

      let date = $( this )
        .find( "span" )
        .text()
        .trim();

      // Add task data to the temp arry as an object
      tempArr.push( {
        text: text,
        date: date
      });
    });

    // Trim down list's ID to match object property
    let arrName = $( this )
      .attr( "id" )
      .replace( "list=", "" );

    // Update array on tasks object to save
    tasks[ arrName ] = tempArr;
    saveTasks();
    console.log( "displaying tempArr log: ")
    console.log( tempArr );
    console.log( "displaying tempArr dir: ")
    console.dir( tempArr );
    console.log( "displaying tasks log: ")
    console.log( tasks );
    console.log( "displaying tasks dir: ")
    console.dir( tasks );
  }
});



// load tasks for the first time
loadTasks();