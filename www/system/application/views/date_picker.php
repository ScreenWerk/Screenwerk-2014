<script type="text/javascript"    src="/screenwerk/datepicker/js/datepicker.js"></script>
<script type="text/javascript"    src="/screenwerk/datepicker/js/tablesort.js"></script>
<link rel="stylesheet" href="/screenwerk/datepicker/css/datepicker.css" type="text/css" media="screen, projection" charset="utf-8" />
<link rel="stylesheet" href="/screenwerk/datepicker/css/demo.css" type="text/css" media="screen, projection" charset="utf-8" />
<!--link rel="stylesheet" href="/screenwerk/datepicker/css/tablesort.css" type="text/css" media="screen, projection" charset="utf-8" /-->

<script type="text/javascript">
//<![CDATA[

/*
A "Reservation Date" example using two datePickers
--------------------------------------------------

* Functionality

1. When the page loads:
    - We clear the value of the two inputs (to clear any values cached by the browser)
    - We set an "onchange" event handler on the startDate input to call the setReservationDates function
2. When a start date is selected
    - We set the low range of the endDate datePicker to be the start date the user has just selected
    - If the endDate input already has a date stipulated and the date falls before the new start date then we clear the input's value

* Caveats (aren't there always)

- This demo has been written for dates that have NOT been split across three inputs

*/

function makeTwoChars(inp) {
return String(inp).length < 2 ? "0" + inp : inp;
}

function initialiseInputs() {
// Clear any old values from the inputs (that might be cached by the browser after a page reload)
document.getElementById("valid_from_date").value = "";
document.getElementById("valid_to_date").value = "";

// Add the onchange event handler to the start date input
datePickerController.addEvent(document.getElementById("valid_from_date"), "change", setReservationDates);
}

var initAttempts = 0;

function setReservationDates(e) {
// Internet Explorer will not have created the datePickers yet so we poll the datePickerController Object using a setTimeout
// until they become available (a maximum of ten times in case something has gone horribly wrong)

try {
    var sd = datePickerController.getDatePicker("valid_from_date");
    var ed = datePickerController.getDatePicker("valid_to_date");
} catch (err) {
    if(initAttempts++ < 10) setTimeout("setReservationDates()", 50);
    return;
}

// Check the value of the input is a date of the correct format
var dt = datePickerController.dateFormat(this.value, sd.format.charAt(0) == "m");

// If the input's value cannot be parsed as a valid date then return
if(dt == 0) return;

// At this stage we have a valid YYYYMMDD date

// Grab the value set within the endDate input and parse it using the dateFormat method
// N.B: The second parameter to the dateFormat function, if TRUE, tells the function to favour the m-d-y date format
var edv = datePickerController.dateFormat(document.getElementById("valid_to_date").value, ed.format.charAt(0) == "m");

// Set the low range of the second datePicker to be the date parsed from the first
ed.setRangeLow( dt );

// If theres a value already present within the end date input and it's smaller than the start date
// then clear the end date value
if(edv < dt) {
    document.getElementById("valid_to_date").value = "";
}
}

function removeInputEvents() {
// Remove the onchange event handler set within the function initialiseInputs
datePickerController.removeEvent(document.getElementById("valid_from_date"), "change", setReservationDates);
}

datePickerController.addEvent(window, 'load', initialiseInputs);
datePickerController.addEvent(window, 'unload', removeInputEvents);

//]]>
</script>

