<table class="data_table" cellpadding="0" cellspacing="0">

<?php 
	$header_set = FALSE;
	foreach($data as $row_id => $row_value):
		if(!$header_set) {
			echo '<tr><th>'. implode('</th><th>', array_keys($row_value)) .'</th><th></th><th></th><th></th></tr>';
			$header_set=TRUE;
		}
?>

	<tr>
		<td><?= implode('</td><td>', array_values($row_value)); ?></td>
<?php
	echo '<td>'. anchor(site_url($this->router->class .'/edit/'.  $row_id), 'Edit') .'</td>';
	if( $row_value['synchronized'] == 'No' ) {
		echo '<td>'. anchor(site_url($this->router->class .'/generate_playlist/'.  $row_id), 'Generate Playlist') .'</td>';
	} else {
		echo '<td></td>';	
	}
		echo '<td>'. anchor(site_url($this->router->class .'/get_player/'.  $row_id), 'Download Player') .'</td>';
?>
	</tr>

<?php endforeach; ?>

</table>

<?php

	if(isset($page_submenu)) {
		foreach($page_submenu as $sub_key => $sub_value) {
			echo '<br />'. anchor(site_url($sub_key), $sub_value);
		}
	}

?>