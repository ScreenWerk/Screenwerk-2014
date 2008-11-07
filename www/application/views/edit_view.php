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


<?= form_open(current_url(),array('style'=>'margin-bottom:20px;')); ?>
<table class="data_table" cellspacing="0" cellpadding="0">
<?php

	$header_set = FALSE;
	foreach($m2m_value as $row_id => $row_value):
		if(!$header_set) {

			echo '<tr>';

			foreach($row_value as $field_name => $field_value):
				if(substr($field_name, -3) != '_id' AND $field_name != 'id') {
					echo '<th>'. $field_name .'</th>';
				}
			endforeach;
			$header_set=TRUE;
			
			echo '<th></th></tr>';
			
		}
	
		echo '<tr>';
	
		foreach($row_value as $field_name => $field_value):
		
			if(is_array($field_value)) {
				echo (isset($field_value['list'])) ? '<td>'. form_dropdown($field_name .'_id['. $row_id .']', $field_value['list'], $field_value['value']) .'</td>' : '<td>'. form_dropdown($field_name .'_id['. $row_id .']') .'</td>';
			} elseif(substr($field_name, -3) == '_id') {
				echo form_hidden($field_name .'['. $row_id .']', $field_value);
			} elseif($field_name == 'id') {
				echo form_hidden($field_name .'['. $row_id .']', $field_value);
			} else {
				echo '<td>'. form_input($field_name .'['. $row_id .']', $field_value, 'style="width:75px;"') .'</td>';
			}

		endforeach;
		
		echo '<td>';
		if($row_value['id'] != 0) echo form_submit('delete_'. $m2m_id .'['. $row_id .']', 'Delete', 'onclick="return confirm(\'Do You want to delete this '. strtolower(humanize($this->router->class .'_'. $m2m_id)) .'?\');"');
		echo '</td>';

		echo '</tr>';

	endforeach;

	if(isset($row_value)) {
		
		if($row_value['id'] != 0) {

			echo '<tr>';

			foreach($row_value as $field_name => $field_value):
				if(is_array($field_value)) {
					echo (isset($field_value['list'])) ? '<td>'. form_dropdown($field_name .'_id[0]', $field_value['list']) .'</td>' : '<td>'. form_dropdown($field_name .'_id[0]') .'</td>';
				} elseif($field_name == 'id') {
					echo form_hidden($field_name .'[0]', 0);
				} elseif(substr($field_name, -3) == '_id') {
					echo form_hidden($field_name .'[0]', $field_value);
				} else {
					echo '<td>'. form_input($field_name .'[0]', NULL, 'style="width:75px;"') .'</td>';
				}
			endforeach;

			echo '<td></td></tr>';

		}

	}

?>
</table>

<?= form_submit('save_'. $m2m_id, 'Save'); ?>
<?= form_close(); ?>


<?php endforeach; ?>
