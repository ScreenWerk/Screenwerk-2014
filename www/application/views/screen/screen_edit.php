<div id="edit_screen_content">

<h1>New screen</h1>
<?= form_open(site_url('screen/edit')); ?>
<?= form_fieldset(); ?>
<?= form_label('Name:', 'name'); ?><br />
<?= form_input(array('id'=>'name', 'name'=>'name')); ?><br />
<?= form_label('Schedule:', 'schedule'); ?><br />
<?= form_dropdown('schedule', $schedule_list); ?><br /><br />
<?= form_button(array('name' => 'save',
    'id' => 'save',
    'value' => 'save',
    'type' => 'submit',
    'content' => 'Add', 'class'=>'ui-button ui-state-default ui-corner-all')); ?><br />
<?= form_fieldset_close(); ?>
<?= form_close(); ?>


	<script type="text/javascript">

		$('#save').click(function() {
			top.location.href = '<?= site_url('/screen/edit/'. $id); ?>';
		});

		$('button').hover(
			function(){ 
				$(this).addClass("ui-state-hover"); 
			},
			function(){ 
				$(this).removeClass("ui-state-hover"); 
			}
		).mousedown(function(){
			$(this).addClass("ui-state-active"); 
		})
		.mouseup(function(){
				$(this).removeClass("ui-state-active");
		});

	</script>

</div>