<h2><?= humanize($this->router->method .'_'. $this->router->class); ?></h2>

<?php
	echo form_open(current_url());
	
	foreach($data as $field_name => $field_value):
	
		if(is_array($field_value)) {
			echo form_label($field_name, $field_name);
			echo form_dropdown($field_name, $field_value['list'], $field_value['value']);
		} elseif($field_name == 'id') {
			echo form_hidden($field_name, $field_value);
		} else {
			echo form_label($field_name, $field_name);
			echo form_input(array('name'=>$field_name, 'value'=>$field_value));
		}
		
		echo '<br />';
		
	endforeach;
?>

<div class="toolbar">
<?= form_submit('save', 'Save'); ?>
<?= form_submit('cancel', 'Cancel'); ?>
<?php if($data['id'] != 0) echo form_submit('delete', 'Delete'); ?>
</div>

<?= form_close(); ?>
