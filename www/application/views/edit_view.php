<h2><?= humanize($this->router->method .'_'. $this->router->class); ?></h2>

<?php
	echo form_open(current_url(), array('style'=>'margin-bottom:20px;'));
	
	foreach($data as $field_name => $field_value):
	
		if(is_array($field_value)) {
			echo form_label($field_name, $field_name);
			echo (isset($field_value['list'])) ? form_dropdown($field_name, $field_value['list'], $field_value['value']) : form_dropdown($field_name);
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
<?php if($data['id'] != 0) echo form_submit('delete', 'Delete', 'onclick="return confirm(\'Do You want to delete this '. $this->router->class .'?\');"'); ?>
</div>

<?= form_close(); ?>



<?php if(isset($data_m2m)) foreach($data_m2m as $m2m_id => $m2m_value): ?>

<h2><?= humanize($this->router->class .'_'. plural($m2m_id)); ?></h2>

<table class="data_table" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">

<?php 
	$header_set = FALSE;
	foreach($m2m_value as $row_id => $row_value):
		if(!$header_set) {
			echo '<tr><th>'. implode('</th><th>', array_keys($row_value)) .'</th><th></th></tr>';
			$header_set=TRUE;
		}
?>

	<tr>
		<td><?= implode('</td><td>', array_values($row_value)); ?></td>
	</tr>

<?php endforeach; ?>

</table>

<?php endforeach; ?>
