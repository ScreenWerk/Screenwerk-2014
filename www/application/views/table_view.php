<table class="data_table">

<?php 
	$header_set = FALSE;
	foreach($data as $row_id => $row_value):
		if(!$header_set) {
			echo '<tr><th>'. implode('</th><th>', array_keys($row_value)) .'</th><th>&nbsp;</th></tr>';
			$header_set=TRUE;
		}
?>

	<tr>
		<td><?= implode('</td><td>', array_values($row_value)); ?></td>
		<td><?= anchor(site_url($this->router->class .'/edit/'.  $row_id), 'Edit'); ?></td>
	</tr>

<?php endforeach; ?>

</table>
