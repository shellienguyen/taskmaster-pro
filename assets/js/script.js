var tasks = {};


var createTask = function( taskText, taskDate, taskList ) {
  // create elements that make up a task item
  var taskLi = $( "<li>").addClass("list-group-item" );

  var taskSpan = $( "<span>").addClass( "badge badge-primary badge-pill" ).text(taskDate);

  var taskP = $( "<p>" ).addClass( "m-1" ).text( taskText );

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // Check due date
  auditTask( taskLi );

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

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
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// enable draggable/sortable feature on list-group elements

$( ".card .list-group" ).sortable({
  // enable dragging across lists
  connectWith: $( ".card .list-group" ),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function( event, ui ) {
    $( this ).addClass( "dropover" );
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function( event, ui ) {
    $( this ).removeClass( "dropover" );
    $( ".bottom-trash" ).removeClass( "bottom-trash-drag" );
  },
  over: function( event ) {
    $( event.target ).addClass( "dropover-active" );
    console.log( event );
  },
  out: function( event ) {
    $( event.target ).removeClass( "dropover-active" );
    console.log( event );
  },
  update: function() {
    var tempArr = [];

    // loop over current set of children in sortable list
    $( this )
      .children()
      .each( function() {
        // save values in temp array
        tempArr.push({
          text: $( this )
            .find( "p" )
            .text()
            .trim(),
          date: $( this )
            .find( "span" )
            .text()
            .trim()
        });
      });

    // trim down list's ID to match object property
    var arrName = $( this )
      .attr( "id" )
      .replace( "list-", "" );

    // update array on tasks object and save
    tasks[ arrName ] = tempArr;
    saveTasks();
  },
  stop: function(event) {
    $(this).removeClass("dropover");
  }
});

// trash icon can be dropped onto
$( "#trash" ).droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function( event, ui ) {
    // remove dragged element from the dom
    ui.draggable.remove();
    $( ".bottom-trash" ).removeClass( "bottom-trash-active" );
  },
  over: function( event, ui ) {
    $(".bottom-trash").addClass("bottom-trash-active");
    console.log( ui );
  },
  out: function( event, ui ) {
    $(".bottom-trash").removeClass("bottom-trash-active");
    console.log (ui );
  }
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
$("#task-form-modal .btn-save").click(function() {
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

// task text was clicked
$(".list-group").on("click", "p", function() {
  // get current text of p element
  var text = $(this)
    .text()
    .trim();

  // replace p element with a new textarea
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);

  // auto focus new element
  textInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function() {
  // get current value of textarea
  var text = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();


  // update task in array and re-save to localstorage
  tasks[status][index].text = text;
  saveTasks();
  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with new content
  $(this).replaceWith(taskP);
});

// Due date was clicked
$( ".list-group" ).on( "click", "span", function() {
  // Get current text
  var date = $( this ).text().trim();

  // Create new input element
  var dateInput = $( "<input>" ).attr( "type", "text" ).addClass( "form-control" ).val( date );

  $( this ).replaceWith( dateInput );

  // Endable jQuery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // When the calender is closed, force a "change" even ton the "dateInput"
      $( this ).trigger( "change" );
    }
  })

  // Automatically bring up the calendar
  dateInput.trigger( "focus" );
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  var date = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
    $(this).replaceWith(taskSpan);

    // Pass task's <li> element into auditTask() to check new due date
    auditTask( $( taskSpan).closest( "list-group-item" ));
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});

$( "#modalDueDate" ).datepicker({
  minDate: 1
});

let auditTask = function( taskEl ) {
  // Get date from task element
  let date = $( taskEl ).find( "span" ).text().trim();

  console.log( taskEl );


  // Convert to moment object at 5:00PM
  let time = moment( date, "L" ).set( "hour", 17 );

  // Remove any old classes from element
  $( taskEl ).removeClass( "list-group-item-warning list-group-item-danger" );

  /*
  Apply new class if task is near/overdue date
  Use .isAfter(), which gets the current time from momen() and checks if that
    value comes later than the value of the time variable.  Here, we are checking
    if the current date and time are later than the date and time pulled from 
    taskEl.  If so, the date and time from TaskEl are in the past, and we add the
    list-group-item-danger Boostrap class to the entire task element.  This will give
    it a read background, to let users know the date has pased.
  */
  if ( moment().isAfter( time )) {
    $( taskEl ).addClass( "list-group-item-danter" );
  };

  // Apply new class if task is imminent (near/overdue date)
  if ( moment().isAfter( time )) {
    $( taskEl ).addClass( "list-group-item-danger" );
  }
  /*
  We use moment() to get right now the use .diff() afterwards to get the
    difference of right now to a day in the future, we will end up with a
    negative number back, hence the use of abs()
  */
  else if (Math.abs( moment().diff( time, "days" )) <= 2 ) {
    $( taskEl ).addClass( "list-group-item-warning" );
  };

  //This should print out an object for the value of the date variable
  //  but at 5:00pm on that date
  console.log( time );
};

// Update task status every 30 minutes
setInterval( function() {
  $( ".card .list-group-item" ).each( function( index, el ) {
    auditTask( el );
  });
}, ( 1000 * 60 ) * 30 );

// load tasks for the first time
loadTasks();
